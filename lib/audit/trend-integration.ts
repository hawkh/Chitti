// Trend Analysis Integration Utilities
// Connects trend analysis with compliance scoring and database queries

import { ComplianceScore } from '@/types/audit-form.types';
import { TrendDataPoint, analyzeTrend, forecastScore, detectPerformanceAlerts } from './trend-analysis';
import { saveAlerts } from './alert-manager';

export interface AuditHistoryRecord {
  id: string;
  siteId: string;
  siteName: string;
  completedAt: Date;
  complianceScore: ComplianceScore;
}

/**
 * Convert audit history to trend data points
 */
export function convertAuditHistoryToTrendData(
  auditHistory: AuditHistoryRecord[]
): TrendDataPoint[] {
  return auditHistory.map(audit => ({
    date: audit.completedAt,
    score: audit.complianceScore.overallScore,
    auditId: audit.id,
    siteId: audit.siteId,
    siteName: audit.siteName
  }));
}

/**
 * Analyze trends for a specific site
 */
export async function analyzeSiteTrends(
  siteId: string,
  siteName: string,
  auditHistory: AuditHistoryRecord[],
  options: {
    period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    forecastPeriods?: number;
    forecastMethod?: 'linear' | 'moving_average' | 'exponential';
    generateAlerts?: boolean;
  } = {}
) {
  const {
    period = 'monthly',
    forecastPeriods = 3,
    forecastMethod = 'linear',
    generateAlerts = true
  } = options;

  // Convert audit history to trend data
  const trendData = convertAuditHistoryToTrendData(auditHistory);

  // Analyze trends
  const trendAnalysis = analyzeTrend(trendData, period);

  // Generate forecast
  const forecast = forecastScore(trendData, forecastPeriods, forecastMethod);

  // Detect and save alerts if enabled
  let alerts: any[] = [];
  if (generateAlerts && auditHistory.length > 0) {
    const latestAudit = auditHistory[auditHistory.length - 1];
    const detectedAlerts = detectPerformanceAlerts(
      siteId,
      siteName,
      trendAnalysis,
      latestAudit.complianceScore
    );

    if (detectedAlerts.length > 0) {
      alerts = saveAlerts(detectedAlerts);
    }
  }

  return {
    trendAnalysis,
    forecast,
    alerts
  };
}

/**
 * Analyze trends across multiple sites
 */
export async function analyzeMultiSiteTrends(
  sites: Array<{
    siteId: string;
    siteName: string;
    auditHistory: AuditHistoryRecord[];
  }>,
  options: {
    period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    generateAlerts?: boolean;
  } = {}
) {
  const results = await Promise.all(
    sites.map(site =>
      analyzeSiteTrends(site.siteId, site.siteName, site.auditHistory, options)
    )
  );

  return sites.map((site, index) => ({
    siteId: site.siteId,
    siteName: site.siteName,
    ...results[index]
  }));
}

/**
 * Get trend comparison between sites
 */
export function compareSiteTrends(
  siteResults: Array<{
    siteId: string;
    siteName: string;
    trendAnalysis: any;
  }>
) {
  return siteResults.map(site => ({
    siteId: site.siteId,
    siteName: site.siteName,
    currentScore: site.trendAnalysis.currentScore,
    averageScore: site.trendAnalysis.averageScore,
    trend: site.trendAnalysis.trend,
    trendStrength: site.trendAnalysis.trendStrength,
    changeRate: site.trendAnalysis.changeRate,
    volatility: site.trendAnalysis.volatility
  })).sort((a, b) => b.currentScore - a.currentScore);
}

/**
 * Identify sites requiring attention
 */
export function identifySitesRequiringAttention(
  siteResults: Array<{
    siteId: string;
    siteName: string;
    trendAnalysis: any;
    alerts: any[];
  }>
) {
  return siteResults
    .filter(site => {
      const { trendAnalysis, alerts } = site;
      
      // Sites with critical alerts
      if (alerts.some(a => a.severity === 'critical')) {
        return true;
      }
      
      // Sites with declining trends
      if (trendAnalysis.trend === 'declining' && trendAnalysis.trendStrength !== 'weak') {
        return true;
      }
      
      // Sites with low scores
      if (trendAnalysis.currentScore < 70) {
        return true;
      }
      
      // Sites with high volatility
      if (trendAnalysis.volatility > 10) {
        return true;
      }
      
      return false;
    })
    .map(site => ({
      siteId: site.siteId,
      siteName: site.siteName,
      reasons: [
        ...(site.alerts.some(a => a.severity === 'critical') ? ['Critical alerts present'] : []),
        ...(site.trendAnalysis.trend === 'declining' ? ['Declining performance trend'] : []),
        ...(site.trendAnalysis.currentScore < 70 ? ['Low compliance score'] : []),
        ...(site.trendAnalysis.volatility > 10 ? ['High performance volatility'] : [])
      ],
      criticalAlertCount: site.alerts.filter(a => a.severity === 'critical').length,
      currentScore: site.trendAnalysis.currentScore,
      trend: site.trendAnalysis.trend
    }))
    .sort((a, b) => b.criticalAlertCount - a.criticalAlertCount);
}

/**
 * Generate executive summary of trends
 */
export function generateTrendExecutiveSummary(
  siteResults: Array<{
    siteId: string;
    siteName: string;
    trendAnalysis: any;
    alerts: any[];
  }>
) {
  const totalSites = siteResults.length;
  const improvingSites = siteResults.filter(s => s.trendAnalysis.trend === 'improving').length;
  const decliningSites = siteResults.filter(s => s.trendAnalysis.trend === 'declining').length;
  const stableSites = siteResults.filter(s => s.trendAnalysis.trend === 'stable').length;
  
  const averageScore = siteResults.reduce((sum, s) => sum + s.trendAnalysis.currentScore, 0) / totalSites;
  const highestScore = Math.max(...siteResults.map(s => s.trendAnalysis.currentScore));
  const lowestScore = Math.min(...siteResults.map(s => s.trendAnalysis.currentScore));
  
  const totalAlerts = siteResults.reduce((sum, s) => sum + s.alerts.length, 0);
  const criticalAlerts = siteResults.reduce((sum, s) => 
    sum + s.alerts.filter(a => a.severity === 'critical').length, 0
  );
  
  const sitesRequiringAttention = identifySitesRequiringAttention(siteResults);

  return {
    overview: {
      totalSites,
      averageScore: Math.round(averageScore * 10) / 10,
      highestScore: Math.round(highestScore * 10) / 10,
      lowestScore: Math.round(lowestScore * 10) / 10,
      scoreRange: Math.round((highestScore - lowestScore) * 10) / 10
    },
    trends: {
      improving: improvingSites,
      declining: decliningSites,
      stable: stableSites,
      improvingPercentage: Math.round((improvingSites / totalSites) * 100),
      decliningPercentage: Math.round((decliningSites / totalSites) * 100)
    },
    alerts: {
      total: totalAlerts,
      critical: criticalAlerts,
      warning: siteResults.reduce((sum, s) => 
        sum + s.alerts.filter(a => a.severity === 'warning').length, 0
      ),
      info: siteResults.reduce((sum, s) => 
        sum + s.alerts.filter(a => a.severity === 'info').length, 0
      )
    },
    attention: {
      sitesRequiringAttention: sitesRequiringAttention.length,
      sites: sitesRequiringAttention.slice(0, 5) // Top 5 sites needing attention
    },
    recommendations: generateRecommendations(siteResults, sitesRequiringAttention)
  };
}

/**
 * Generate recommendations based on trend analysis
 */
function generateRecommendations(
  siteResults: Array<any>,
  sitesRequiringAttention: Array<any>
): string[] {
  const recommendations: string[] = [];
  
  if (sitesRequiringAttention.length > 0) {
    recommendations.push(
      `${sitesRequiringAttention.length} site(s) require immediate attention. Prioritize sites with critical alerts.`
    );
  }
  
  const decliningCount = siteResults.filter(s => s.trendAnalysis.trend === 'declining').length;
  if (decliningCount > siteResults.length * 0.3) {
    recommendations.push(
      'More than 30% of sites show declining trends. Consider organization-wide process review.'
    );
  }
  
  const highVolatilitySites = siteResults.filter(s => s.trendAnalysis.volatility > 10).length;
  if (highVolatilitySites > 0) {
    recommendations.push(
      `${highVolatilitySites} site(s) show high performance volatility. Focus on process standardization.`
    );
  }
  
  const lowScoreSites = siteResults.filter(s => s.trendAnalysis.currentScore < 70).length;
  if (lowScoreSites > 0) {
    recommendations.push(
      `${lowScoreSites} site(s) have compliance scores below 70%. Implement corrective action plans.`
    );
  }
  
  const improvingCount = siteResults.filter(s => s.trendAnalysis.trend === 'improving').length;
  if (improvingCount > siteResults.length * 0.5) {
    recommendations.push(
      'Majority of sites show improvement. Document and share best practices across organization.'
    );
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Overall performance is stable. Continue monitoring and maintain current practices.');
  }
  
  return recommendations;
}
