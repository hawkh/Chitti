/**
 * PDCA Analytics Service
 * Provides analytics and reporting for PDCA methodology tracking
 */

import { PDCAStage } from '@/types/audit-form.types';
import {
  PDCACycleStatus,
  PDCACycleMetrics,
  PDCAAuditSummary
} from './pdca-workflow';

export interface PDCAStageDistribution {
  stage: PDCAStage;
  count: number;
  percentage: number;
  averageScore: number;
  audits: PDCAAuditSummary[];
}

export interface PDCACycleCompletionMetrics {
  totalSites: number;
  sitesWithCompleteCycles: number;
  sitesInProgress: number;
  sitesNotStarted: number;
  completionRate: number;
  averageCycleDuration: number;
  fastestCycle: {
    siteId: string;
    siteName: string;
    duration: number;
  } | null;
  slowestCycle: {
    siteId: string;
    siteName: string;
    duration: number;
  } | null;
}

export interface PDCAImprovementRecommendation {
  siteId: string;
  siteName: string;
  priority: 'high' | 'medium' | 'low';
  category: 'cycle_completion' | 'stage_balance' | 'performance' | 'consistency';
  title: string;
  description: string;
  suggestedActions: string[];
  impact: string;
}

export interface PDCAAnalyticsReport {
  generatedAt: Date;
  timeframe: {
    start: Date;
    end: Date;
  };
  stageDistribution: PDCAStageDistribution[];
  cycleMetrics: PDCACycleCompletionMetrics;
  recommendations: PDCAImprovementRecommendation[];
  trends: {
    cycleCompletionTrend: 'improving' | 'declining' | 'stable';
    stageBalanceTrend: 'balanced' | 'imbalanced';
    performanceTrend: 'improving' | 'declining' | 'stable';
  };
}

/**
 * Calculate PDCA stage distribution analytics
 */
export function calculateStageDistribution(
  siteStatuses: PDCACycleStatus[]
): PDCAStageDistribution[] {
  const stages: PDCAStage[] = ['plan', 'do', 'check', 'act'];
  const stageMap = new Map<PDCAStage, PDCAAuditSummary[]>();

  // Initialize stage map
  stages.forEach(stage => stageMap.set(stage, []));

  // Collect all audits by stage
  siteStatuses.forEach(status => {
    status.auditsInCycle.forEach(audit => {
      const audits = stageMap.get(audit.stage) || [];
      audits.push(audit);
      stageMap.set(audit.stage, audits);
    });
  });

  // Calculate total audits
  const totalAudits = Array.from(stageMap.values()).reduce(
    (sum, audits) => sum + audits.length,
    0
  );

  // Build distribution data
  return stages.map(stage => {
    const audits = stageMap.get(stage) || [];
    const count = audits.length;
    const percentage = totalAudits > 0 ? (count / totalAudits) * 100 : 0;
    
    // Calculate average score for audits with scores
    const auditsWithScores = audits.filter(a => a.complianceScore !== undefined);
    const averageScore = auditsWithScores.length > 0
      ? auditsWithScores.reduce((sum, a) => sum + (a.complianceScore || 0), 0) / auditsWithScores.length
      : 0;

    return {
      stage,
      count,
      percentage: Math.round(percentage * 10) / 10,
      averageScore: Math.round(averageScore * 10) / 10,
      audits
    };
  });
}

/**
 * Calculate cycle completion metrics
 */
export function calculateCycleCompletionMetrics(
  siteStatuses: PDCACycleStatus[]
): PDCACycleCompletionMetrics {
  const totalSites = siteStatuses.length;
  const sitesWithCompleteCycles = siteStatuses.filter(s => s.isComplete).length;
  const sitesInProgress = siteStatuses.filter(
    s => !s.isComplete && s.auditsInCycle.length > 0
  ).length;
  const sitesNotStarted = totalSites - sitesWithCompleteCycles - sitesInProgress;
  
  const completionRate = totalSites > 0
    ? Math.round((sitesWithCompleteCycles / totalSites) * 100)
    : 0;

  // Calculate cycle durations
  const completedCycles = siteStatuses
    .filter(s => s.isComplete && s.cycleStartDate && s.cycleCompletionDate)
    .map(s => ({
      siteId: s.siteId,
      siteName: s.siteName,
      duration: Math.round(
        (s.cycleCompletionDate!.getTime() - s.cycleStartDate!.getTime()) / (1000 * 60 * 60 * 24)
      )
    }));

  const averageCycleDuration = completedCycles.length > 0
    ? Math.round(
        completedCycles.reduce((sum, c) => sum + c.duration, 0) / completedCycles.length
      )
    : 0;

  // Find fastest and slowest cycles
  let fastestCycle = null;
  let slowestCycle = null;

  if (completedCycles.length > 0) {
    const sorted = [...completedCycles].sort((a, b) => a.duration - b.duration);
    fastestCycle = sorted[0];
    slowestCycle = sorted[sorted.length - 1];
  }

  return {
    totalSites,
    sitesWithCompleteCycles,
    sitesInProgress,
    sitesNotStarted,
    completionRate,
    averageCycleDuration,
    fastestCycle,
    slowestCycle
  };
}

/**
 * Generate PDCA improvement recommendations
 */
export function generateImprovementRecommendations(
  siteStatuses: PDCACycleStatus[],
  stageDistribution: PDCAStageDistribution[]
): PDCAImprovementRecommendation[] {
  const recommendations: PDCAImprovementRecommendation[] = [];

  // Check for incomplete cycles
  siteStatuses.forEach(status => {
    if (!status.isComplete && status.auditsInCycle.length > 0) {
      const missingStages = (['plan', 'do', 'check', 'act'] as PDCAStage[])
        .filter(stage => !status.completedStages.includes(stage));

      if (missingStages.length > 0) {
        recommendations.push({
          siteId: status.siteId,
          siteName: status.siteName,
          priority: status.progress >= 75 ? 'high' : status.progress >= 50 ? 'medium' : 'low',
          category: 'cycle_completion',
          title: 'Complete PDCA Cycle',
          description: `Site has completed ${status.progress}% of PDCA cycle. Missing stages: ${missingStages.map(s => s.toUpperCase()).join(', ')}.`,
          suggestedActions: [
            `Schedule ${missingStages[0].toUpperCase()} stage audit`,
            'Review cycle objectives and timeline',
            'Allocate resources for remaining stages'
          ],
          impact: 'Completing the cycle will enable systematic improvement tracking and better compliance outcomes.'
        });
      }
    }
  });

  // Check for stage imbalance
  const totalAudits = stageDistribution.reduce((sum, d) => sum + d.count, 0);
  const expectedPercentage = 25; // 25% per stage for balanced distribution
  const imbalancedStages = stageDistribution.filter(
    d => Math.abs(d.percentage - expectedPercentage) > 15
  );

  if (imbalancedStages.length > 0) {
    const overrepresented = imbalancedStages.filter(d => d.percentage > expectedPercentage);
    const underrepresented = imbalancedStages.filter(d => d.percentage < expectedPercentage);

    if (underrepresented.length > 0) {
      recommendations.push({
        siteId: 'organization',
        siteName: 'Organization-wide',
        priority: 'medium',
        category: 'stage_balance',
        title: 'Balance PDCA Stage Distribution',
        description: `Some PDCA stages are underutilized: ${underrepresented.map(s => `${s.stage.toUpperCase()} (${s.percentage}%)`).join(', ')}.`,
        suggestedActions: [
          `Increase focus on ${underrepresented[0].stage.toUpperCase()} stage activities`,
          'Review PDCA methodology training with teams',
          'Ensure all stages receive equal attention in improvement cycles'
        ],
        impact: 'Balanced stage distribution ensures comprehensive continuous improvement coverage.'
      });
    }
  }

  // Check for low performance in specific stages
  stageDistribution.forEach(dist => {
    if (dist.averageScore > 0 && dist.averageScore < 70 && dist.count >= 3) {
      recommendations.push({
        siteId: 'organization',
        siteName: 'Organization-wide',
        priority: 'high',
        category: 'performance',
        title: `Improve ${dist.stage.toUpperCase()} Stage Performance`,
        description: `Average compliance score for ${dist.stage.toUpperCase()} stage audits is ${dist.averageScore}%, below target of 70%.`,
        suggestedActions: [
          `Review ${dist.stage.toUpperCase()} stage processes and procedures`,
          'Provide additional training and resources',
          'Identify and address common failure points',
          'Implement corrective actions from previous audits'
        ],
        impact: 'Improving stage-specific performance will enhance overall compliance and quality outcomes.'
      });
    }
  });

  // Check for sites not started
  const notStartedSites = siteStatuses.filter(s => s.auditsInCycle.length === 0);
  if (notStartedSites.length > 0) {
    notStartedSites.forEach(status => {
      recommendations.push({
        siteId: status.siteId,
        siteName: status.siteName,
        priority: 'high',
        category: 'cycle_completion',
        title: 'Initiate PDCA Cycle',
        description: 'No PDCA audits have been conducted at this site.',
        suggestedActions: [
          'Schedule initial PLAN stage audit',
          'Establish quality objectives and improvement goals',
          'Assign audit team and resources',
          'Set timeline for complete PDCA cycle'
        ],
        impact: 'Starting PDCA cycles enables systematic quality improvement and compliance tracking.'
      });
    });
  }

  // Check for stalled cycles (in progress for too long)
  const stalledCycles = siteStatuses.filter(status => {
    if (status.isComplete || status.auditsInCycle.length === 0) return false;
    
    const daysSinceStart = status.cycleStartDate
      ? (Date.now() - status.cycleStartDate.getTime()) / (1000 * 60 * 60 * 24)
      : 0;
    
    return daysSinceStart > 90; // More than 90 days
  });

  stalledCycles.forEach(status => {
    recommendations.push({
      siteId: status.siteId,
      siteName: status.siteName,
      priority: 'medium',
      category: 'consistency',
      title: 'Accelerate Cycle Completion',
      description: `PDCA cycle has been in progress for over 90 days at ${status.progress}% completion.`,
      suggestedActions: [
        'Review and address blockers to cycle completion',
        'Reallocate resources if needed',
        'Set firm deadlines for remaining stages',
        'Consider breaking into smaller improvement cycles'
      ],
      impact: 'Completing cycles in a timely manner maintains momentum and demonstrates commitment to improvement.'
    });
  });

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

/**
 * Analyze PDCA trends
 */
export function analyzePDCATrends(
  currentMetrics: PDCACycleMetrics,
  previousMetrics: PDCACycleMetrics | null
): {
  cycleCompletionTrend: 'improving' | 'declining' | 'stable';
  stageBalanceTrend: 'balanced' | 'imbalanced';
  performanceTrend: 'improving' | 'declining' | 'stable';
} {
  let cycleCompletionTrend: 'improving' | 'declining' | 'stable' = 'stable';
  let stageBalanceTrend: 'balanced' | 'imbalanced' = 'balanced';
  let performanceTrend: 'improving' | 'declining' | 'stable' = 'stable';

  // Analyze cycle completion trend
  if (previousMetrics) {
    const currentRate = currentMetrics.completionRate;
    const previousRate = previousMetrics.completionRate;
    
    if (currentRate > previousRate + 5) {
      cycleCompletionTrend = 'improving';
    } else if (currentRate < previousRate - 5) {
      cycleCompletionTrend = 'declining';
    }
  }

  // Analyze stage balance
  const stages = Object.values(currentMetrics.stageDistribution);
  const totalAudits = stages.reduce((sum, count) => sum + count, 0);
  const expectedPerStage = totalAudits / 4;
  const maxDeviation = Math.max(
    ...stages.map(count => Math.abs(count - expectedPerStage))
  );
  
  stageBalanceTrend = maxDeviation / expectedPerStage > 0.3 ? 'imbalanced' : 'balanced';

  return {
    cycleCompletionTrend,
    stageBalanceTrend,
    performanceTrend
  };
}

/**
 * Generate comprehensive PDCA analytics report
 */
export function generatePDCAAnalyticsReport(
  siteStatuses: PDCACycleStatus[],
  timeframe: { start: Date; end: Date },
  previousMetrics?: PDCACycleMetrics
): PDCAAnalyticsReport {
  const stageDistribution = calculateStageDistribution(siteStatuses);
  const cycleMetrics = calculateCycleCompletionMetrics(siteStatuses);
  const recommendations = generateImprovementRecommendations(siteStatuses, stageDistribution);
  
  // Calculate overall metrics for trend analysis
  const overallMetrics: PDCACycleMetrics = {
    totalCycles: siteStatuses.length,
    completedCycles: siteStatuses.filter(s => s.isComplete).length,
    inProgressCycles: siteStatuses.filter(s => !s.isComplete && s.auditsInCycle.length > 0).length,
    averageCycleDuration: cycleMetrics.averageCycleDuration,
    stageDistribution: {
      plan: stageDistribution.find(d => d.stage === 'plan')?.count || 0,
      do: stageDistribution.find(d => d.stage === 'do')?.count || 0,
      check: stageDistribution.find(d => d.stage === 'check')?.count || 0,
      act: stageDistribution.find(d => d.stage === 'act')?.count || 0
    },
    completionRate: cycleMetrics.completionRate
  };

  const trends = analyzePDCATrends(overallMetrics, previousMetrics || null);

  return {
    generatedAt: new Date(),
    timeframe,
    stageDistribution,
    cycleMetrics,
    recommendations,
    trends
  };
}

/**
 * Export PDCA analytics data for reporting
 */
export function exportPDCAAnalyticsData(report: PDCAAnalyticsReport): {
  summary: Record<string, any>;
  stageData: Record<string, any>[];
  recommendations: Record<string, any>[];
} {
  return {
    summary: {
      generatedAt: report.generatedAt.toISOString(),
      timeframeStart: report.timeframe.start.toISOString(),
      timeframeEnd: report.timeframe.end.toISOString(),
      totalSites: report.cycleMetrics.totalSites,
      completedCycles: report.cycleMetrics.sitesWithCompleteCycles,
      completionRate: `${report.cycleMetrics.completionRate}%`,
      averageCycleDuration: `${report.cycleMetrics.averageCycleDuration} days`,
      cycleCompletionTrend: report.trends.cycleCompletionTrend,
      stageBalanceTrend: report.trends.stageBalanceTrend
    },
    stageData: report.stageDistribution.map(dist => ({
      stage: dist.stage.toUpperCase(),
      auditCount: dist.count,
      percentage: `${dist.percentage}%`,
      averageComplianceScore: `${dist.averageScore}%`
    })),
    recommendations: report.recommendations.map(rec => ({
      site: rec.siteName,
      priority: rec.priority.toUpperCase(),
      category: rec.category,
      title: rec.title,
      description: rec.description,
      suggestedActions: rec.suggestedActions.join('; '),
      impact: rec.impact
    }))
  };
}
