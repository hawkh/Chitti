// Benchmarking and Comparison Service
// Provides site-to-site performance comparison, ranking, and improvement recommendations

import { ComplianceScore } from '@/types/audit-form.types';
import { calculateComplianceScore, getComplianceGrade } from './compliance-calculator';

export interface SiteBenchmark {
  siteId: string;
  siteName: string;
  currentScore: number;
  previousScore: number | null;
  trend: 'improving' | 'declining' | 'stable';
  delta: number;
  ranking: number;
  totalAudits: number;
  lastAuditDate: Date | null;
  criticalFailures: number;
  grade: string;
  gradeLabel: string;
}

export interface BenchmarkComparison {
  sites: SiteBenchmark[];
  organizationAverage: number;
  industryAverage: number | null;
  bestPerformer: SiteBenchmark | null;
  worstPerformer: SiteBenchmark | null;
  improvementOpportunities: ImprovementRecommendation[];
  generatedAt: Date;
}

export interface ImprovementRecommendation {
  siteId: string;
  siteName: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  recommendation: string;
  expectedImpact: string;
  benchmarkReference?: string;
}

export interface SitePerformanceData {
  siteId: string;
  siteName: string;
  audits: {
    id: string;
    auditDate: Date;
    complianceScore: ComplianceScore;
  }[];
}

/**
 * Generate comprehensive benchmark comparison across multiple sites
 */
export function generateBenchmarkComparison(
  sitesData: SitePerformanceData[],
  industryAverage?: number
): BenchmarkComparison {
  const siteBenchmarks: SiteBenchmark[] = [];
  
  // Calculate benchmarks for each site
  sitesData.forEach(siteData => {
    const benchmark = calculateSiteBenchmark(siteData);
    siteBenchmarks.push(benchmark);
  });
  
  // Sort by current score (descending) and assign rankings
  siteBenchmarks.sort((a, b) => b.currentScore - a.currentScore);
  siteBenchmarks.forEach((site, index) => {
    site.ranking = index + 1;
  });
  
  // Calculate organization average
  const organizationAverage = siteBenchmarks.length > 0
    ? siteBenchmarks.reduce((sum, site) => sum + site.currentScore, 0) / siteBenchmarks.length
    : 0;
  
  // Identify best and worst performers
  const bestPerformer = siteBenchmarks.length > 0 ? siteBenchmarks[0] : null;
  const worstPerformer = siteBenchmarks.length > 0 
    ? siteBenchmarks[siteBenchmarks.length - 1] 
    : null;
  
  // Generate improvement recommendations
  const improvementOpportunities = generateImprovementRecommendations(
    siteBenchmarks,
    organizationAverage,
    bestPerformer
  );
  
  return {
    sites: siteBenchmarks,
    organizationAverage: Math.round(organizationAverage * 10) / 10,
    industryAverage: industryAverage || null,
    bestPerformer,
    worstPerformer,
    improvementOpportunities,
    generatedAt: new Date()
  };
}

/**
 * Calculate benchmark metrics for a single site
 */
export function calculateSiteBenchmark(siteData: SitePerformanceData): SiteBenchmark {
  const { siteId, siteName, audits } = siteData;
  
  if (audits.length === 0) {
    return {
      siteId,
      siteName,
      currentScore: 0,
      previousScore: null,
      trend: 'stable',
      delta: 0,
      ranking: 0,
      totalAudits: 0,
      lastAuditDate: null,
      criticalFailures: 0,
      grade: 'N/A',
      gradeLabel: 'No Data'
    };
  }
  
  // Sort audits by date (most recent first)
  const sortedAudits = [...audits].sort((a, b) => 
    b.auditDate.getTime() - a.auditDate.getTime()
  );
  
  const latestAudit = sortedAudits[0];
  const previousAudit = sortedAudits.length > 1 ? sortedAudits[1] : null;
  
  const currentScore = latestAudit.complianceScore.overallScore;
  const previousScore = previousAudit?.complianceScore.overallScore || null;
  
  // Calculate trend
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  let delta = 0;
  
  if (previousScore !== null) {
    delta = currentScore - previousScore;
    if (Math.abs(delta) < 2) {
      trend = 'stable';
    } else if (delta > 0) {
      trend = 'improving';
    } else {
      trend = 'declining';
    }
  }
  
  const grade = getComplianceGrade(currentScore);
  
  return {
    siteId,
    siteName,
    currentScore: Math.round(currentScore * 10) / 10,
    previousScore: previousScore !== null ? Math.round(previousScore * 10) / 10 : null,
    trend,
    delta: Math.round(delta * 10) / 10,
    ranking: 0, // Will be set by comparison function
    totalAudits: audits.length,
    lastAuditDate: latestAudit.auditDate,
    criticalFailures: latestAudit.complianceScore.criticalFailures,
    grade: grade.grade,
    gradeLabel: grade.label
  };
}

/**
 * Compare two sites and identify performance gaps
 */
export function compareSites(
  site1: SiteBenchmark,
  site2: SiteBenchmark
): {
  betterPerformer: SiteBenchmark;
  gap: number;
  gapPercentage: number;
  insights: string[];
} {
  const betterPerformer = site1.currentScore >= site2.currentScore ? site1 : site2;
  const gap = Math.abs(site1.currentScore - site2.currentScore);
  const lowerScore = Math.min(site1.currentScore, site2.currentScore);
  const gapPercentage = lowerScore > 0 ? (gap / lowerScore) * 100 : 0;
  
  const insights: string[] = [];
  
  // Performance gap insight
  if (gap > 10) {
    insights.push(`Significant performance gap of ${gap.toFixed(1)} points`);
  } else if (gap > 5) {
    insights.push(`Moderate performance gap of ${gap.toFixed(1)} points`);
  } else {
    insights.push(`Similar performance levels (${gap.toFixed(1)} point difference)`);
  }
  
  // Trend insights
  if (site1.trend === 'improving' && site2.trend === 'declining') {
    insights.push(`${site1.siteName} is improving while ${site2.siteName} is declining`);
  } else if (site1.trend === 'declining' && site2.trend === 'improving') {
    insights.push(`${site2.siteName} is improving while ${site1.siteName} is declining`);
  } else if (site1.trend === 'improving' && site2.trend === 'improving') {
    insights.push('Both sites showing positive improvement trends');
  }
  
  // Critical failures insight
  if (site1.criticalFailures > 0 || site2.criticalFailures > 0) {
    const totalCritical = site1.criticalFailures + site2.criticalFailures;
    insights.push(`${totalCritical} critical failure(s) require immediate attention`);
  }
  
  return {
    betterPerformer,
    gap: Math.round(gap * 10) / 10,
    gapPercentage: Math.round(gapPercentage * 10) / 10,
    insights
  };
}

/**
 * Generate improvement recommendations based on benchmarking data
 */
export function generateImprovementRecommendations(
  sites: SiteBenchmark[],
  organizationAverage: number,
  bestPerformer: SiteBenchmark | null
): ImprovementRecommendation[] {
  const recommendations: ImprovementRecommendation[] = [];
  
  sites.forEach(site => {
    // Skip best performer
    if (bestPerformer && site.siteId === bestPerformer.siteId) {
      return;
    }
    
    // Critical failures - highest priority
    if (site.criticalFailures > 0) {
      recommendations.push({
        siteId: site.siteId,
        siteName: site.siteName,
        priority: 'high',
        category: 'Critical Failures',
        recommendation: `Address ${site.criticalFailures} critical failure(s) immediately to prevent compliance risks`,
        expectedImpact: 'High - Immediate compliance improvement',
        benchmarkReference: bestPerformer 
          ? `${bestPerformer.siteName} has zero critical failures`
          : undefined
      });
    }
    
    // Below organization average
    if (site.currentScore < organizationAverage) {
      const gap = organizationAverage - site.currentScore;
      recommendations.push({
        siteId: site.siteId,
        siteName: site.siteName,
        priority: gap > 10 ? 'high' : 'medium',
        category: 'Below Average Performance',
        recommendation: `Improve score by ${gap.toFixed(1)} points to reach organization average`,
        expectedImpact: `Medium - Align with organization standards`,
        benchmarkReference: `Organization average: ${organizationAverage.toFixed(1)}%`
      });
    }
    
    // Declining trend
    if (site.trend === 'declining') {
      recommendations.push({
        siteId: site.siteId,
        siteName: site.siteName,
        priority: 'high',
        category: 'Declining Performance',
        recommendation: `Investigate root causes of ${Math.abs(site.delta).toFixed(1)} point decline and implement corrective actions`,
        expectedImpact: 'High - Prevent further deterioration',
        benchmarkReference: bestPerformer 
          ? `${bestPerformer.siteName} is ${bestPerformer.trend}`
          : undefined
      });
    }
    
    // Low grade
    if (site.currentScore < 70) {
      recommendations.push({
        siteId: site.siteId,
        siteName: site.siteName,
        priority: 'high',
        category: 'Low Compliance Score',
        recommendation: 'Conduct comprehensive gap analysis and develop improvement action plan',
        expectedImpact: 'High - Achieve minimum compliance standards',
        benchmarkReference: bestPerformer 
          ? `Target: ${bestPerformer.currentScore.toFixed(1)}% (${bestPerformer.siteName})`
          : undefined
      });
    }
    
    // Best practice adoption opportunity
    if (bestPerformer && site.currentScore < bestPerformer.currentScore - 5) {
      const gap = bestPerformer.currentScore - site.currentScore;
      recommendations.push({
        siteId: site.siteId,
        siteName: site.siteName,
        priority: 'medium',
        category: 'Best Practice Adoption',
        recommendation: `Learn from ${bestPerformer.siteName}'s practices to close ${gap.toFixed(1)} point gap`,
        expectedImpact: 'Medium - Adopt proven successful approaches',
        benchmarkReference: `${bestPerformer.siteName}: ${bestPerformer.currentScore.toFixed(1)}%`
      });
    }
  });
  
  // Sort by priority (high first)
  recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  return recommendations;
}

/**
 * Calculate ranking percentile for a site
 */
export function calculatePercentile(
  siteScore: number,
  allScores: number[]
): number {
  if (allScores.length === 0) return 0;
  
  const sortedScores = [...allScores].sort((a, b) => a - b);
  const belowCount = sortedScores.filter(score => score < siteScore).length;
  
  return (belowCount / allScores.length) * 100;
}

/**
 * Identify best practices from top performers
 */
export function identifyBestPractices(
  topPerformers: SiteBenchmark[]
): string[] {
  const practices: string[] = [];
  
  if (topPerformers.length === 0) return practices;
  
  // Analyze common characteristics of top performers
  const avgScore = topPerformers.reduce((sum, site) => sum + site.currentScore, 0) / topPerformers.length;
  const improvingCount = topPerformers.filter(site => site.trend === 'improving').length;
  const zeroCriticalCount = topPerformers.filter(site => site.criticalFailures === 0).length;
  
  if (avgScore >= 90) {
    practices.push('Maintain consistent audit scores above 90% through systematic quality management');
  }
  
  if (improvingCount / topPerformers.length >= 0.5) {
    practices.push('Implement continuous improvement programs with measurable progress tracking');
  }
  
  if (zeroCriticalCount === topPerformers.length) {
    practices.push('Establish proactive risk management to prevent critical failures');
  }
  
  practices.push('Conduct regular internal audits and management reviews');
  practices.push('Invest in employee training and competency development');
  practices.push('Maintain strong documentation and process controls');
  
  return practices;
}

/**
 * Generate performance distribution analysis
 */
export function analyzePerformanceDistribution(
  sites: SiteBenchmark[]
): {
  excellent: number; // >= 90
  good: number; // 80-89
  acceptable: number; // 70-79
  needsImprovement: number; // < 70
  distribution: { range: string; count: number; percentage: number }[];
} {
  const total = sites.length;
  
  const excellent = sites.filter(s => s.currentScore >= 90).length;
  const good = sites.filter(s => s.currentScore >= 80 && s.currentScore < 90).length;
  const acceptable = sites.filter(s => s.currentScore >= 70 && s.currentScore < 80).length;
  const needsImprovement = sites.filter(s => s.currentScore < 70).length;
  
  return {
    excellent,
    good,
    acceptable,
    needsImprovement,
    distribution: [
      { 
        range: '90-100% (Excellent)', 
        count: excellent, 
        percentage: total > 0 ? (excellent / total) * 100 : 0 
      },
      { 
        range: '80-89% (Good)', 
        count: good, 
        percentage: total > 0 ? (good / total) * 100 : 0 
      },
      { 
        range: '70-79% (Acceptable)', 
        count: acceptable, 
        percentage: total > 0 ? (acceptable / total) * 100 : 0 
      },
      { 
        range: '<70% (Needs Improvement)', 
        count: needsImprovement, 
        percentage: total > 0 ? (needsImprovement / total) * 100 : 0 
      }
    ]
  };
}
