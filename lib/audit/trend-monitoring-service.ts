// Trend Monitoring Service
// Automated monitoring and alert generation for compliance trends

import {
  analyzeTrend,
  forecastScore,
  detectPerformanceAlerts,
  TrendDataPoint,
  TrendAnalysis,
  ForecastResult,
  PerformanceAlert
} from './trend-analysis';
import { saveAlerts, getActiveAlertsForSite } from './alert-manager';
import { ComplianceScore } from '@/types/audit-form.types';

export interface MonitoringConfig {
  siteId: string;
  siteName: string;
  monitoringInterval: 'daily' | 'weekly' | 'monthly';
  alertThresholds: {
    criticalScoreThreshold: number;
    warningScoreThreshold: number;
    volatilityThreshold: number;
    declineRateThreshold: number;
  };
  forecastPeriods: number;
  enableAutoAlerts: boolean;
}

export interface MonitoringResult {
  siteId: string;
  siteName: string;
  monitoredAt: Date;
  trendAnalysis: TrendAnalysis;
  forecast: ForecastResult[];
  newAlerts: PerformanceAlert[];
  existingAlerts: number;
  recommendations: string[];
}

/**
 * Default monitoring configuration
 */
export const DEFAULT_MONITORING_CONFIG: Omit<MonitoringConfig, 'siteId' | 'siteName'> = {
  monitoringInterval: 'weekly',
  alertThresholds: {
    criticalScoreThreshold: 60,
    warningScoreThreshold: 70,
    volatilityThreshold: 10,
    declineRateThreshold: -2 // Points per month
  },
  forecastPeriods: 3,
  enableAutoAlerts: true
};

/**
 * Monitor site compliance trends and generate alerts
 */
export async function monitorSiteTrends(
  siteId: string,
  siteName: string,
  historicalData: TrendDataPoint[],
  latestScore: ComplianceScore,
  config: Partial<MonitoringConfig> = {}
): Promise<MonitoringResult> {
  const fullConfig: MonitoringConfig = {
    siteId,
    siteName,
    ...DEFAULT_MONITORING_CONFIG,
    ...config
  };

  // Analyze trends
  const trendAnalysis = analyzeTrend(historicalData, 'monthly');

  // Generate forecast
  const forecast = forecastScore(
    historicalData,
    fullConfig.forecastPeriods,
    'linear'
  );

  // Detect performance alerts
  let newAlerts: PerformanceAlert[] = [];
  if (fullConfig.enableAutoAlerts) {
    newAlerts = detectPerformanceAlerts(
      siteId,
      siteName,
      trendAnalysis,
      latestScore
    );

    // Apply custom thresholds
    newAlerts = applyCustomThresholds(newAlerts, fullConfig.alertThresholds);

    // Save new alerts
    if (newAlerts.length > 0) {
      saveAlerts(newAlerts);
    }
  }

  // Get existing active alerts
  const existingAlerts = getActiveAlertsForSite(siteId);

  // Generate recommendations
  const recommendations = generateRecommendations(
    trendAnalysis,
    forecast,
    latestScore,
    fullConfig.alertThresholds
  );

  return {
    siteId,
    siteName,
    monitoredAt: new Date(),
    trendAnalysis,
    forecast,
    newAlerts,
    existingAlerts: existingAlerts.length,
    recommendations
  };
}

/**
 * Apply custom alert thresholds
 */
function applyCustomThresholds(
  alerts: PerformanceAlert[],
  thresholds: MonitoringConfig['alertThresholds']
): PerformanceAlert[] {
  return alerts.filter(alert => {
    switch (alert.type) {
      case 'low_score':
        return alert.currentValue < thresholds.warningScoreThreshold;
      case 'declining_trend':
        return alert.currentValue < thresholds.declineRateThreshold;
      case 'high_volatility':
        return alert.currentValue > thresholds.volatilityThreshold;
      default:
        return true; // Keep critical failures and other alerts
    }
  });
}

/**
 * Generate actionable recommendations based on trend analysis
 */
function generateRecommendations(
  trendAnalysis: TrendAnalysis,
  forecast: ForecastResult[],
  latestScore: ComplianceScore,
  thresholds: MonitoringConfig['alertThresholds']
): string[] {
  const recommendations: string[] = [];

  // Score-based recommendations
  if (trendAnalysis.currentScore < thresholds.criticalScoreThreshold) {
    recommendations.push(
      'URGENT: Compliance score is critically low. Conduct immediate comprehensive audit and implement corrective actions.'
    );
  } else if (trendAnalysis.currentScore < thresholds.warningScoreThreshold) {
    recommendations.push(
      'WARNING: Compliance score below acceptable threshold. Review recent audit findings and address identified issues.'
    );
  }

  // Trend-based recommendations
  if (trendAnalysis.trend === 'declining' && trendAnalysis.trendStrength !== 'weak') {
    recommendations.push(
      `Performance is declining at ${Math.abs(trendAnalysis.changeRate).toFixed(1)} points per month. ` +
      'Investigate root causes and develop improvement action plan.'
    );

    // Check forecast for continued decline
    if (forecast.length > 0 && forecast[0].predictedScore < trendAnalysis.currentScore) {
      recommendations.push(
        'Forecast indicates continued decline. Immediate intervention required to reverse trend.'
      );
    }
  } else if (trendAnalysis.trend === 'improving') {
    recommendations.push(
      `Performance is improving at ${trendAnalysis.changeRate.toFixed(1)} points per month. ` +
      'Document successful practices and replicate across other sites.'
    );
  }

  // Volatility-based recommendations
  if (trendAnalysis.volatility > thresholds.volatilityThreshold) {
    recommendations.push(
      `High performance volatility (±${trendAnalysis.volatility.toFixed(1)} points) detected. ` +
      'Standardize audit processes and improve consistency in execution.'
    );
  }

  // Critical failures
  if (latestScore.criticalFailures > 0) {
    recommendations.push(
      `${latestScore.criticalFailures} critical failure(s) require immediate corrective action and root cause analysis.`
    );
  }

  // Forecast-based recommendations
  if (forecast.length > 0) {
    const nextForecast = forecast[0];
    if (nextForecast.predictedScore < thresholds.warningScoreThreshold) {
      recommendations.push(
        `Forecast predicts score of ${nextForecast.predictedScore.toFixed(1)}% next period. ` +
        'Proactive measures needed to prevent further decline.'
      );
    }
  }

  // Improvement areas
  if (latestScore.improvementAreas && latestScore.improvementAreas.length > 0) {
    recommendations.push(
      `Focus improvement efforts on: ${latestScore.improvementAreas.slice(0, 3).join(', ')}`
    );
  }

  // If no specific issues, provide positive reinforcement
  if (recommendations.length === 0 && trendAnalysis.currentScore >= 80) {
    recommendations.push(
      'Performance is stable and above target. Continue current practices and monitor for consistency.'
    );
  }

  return recommendations;
}

/**
 * Monitor multiple sites and generate comparative analysis
 */
export async function monitorMultipleSites(
  sites: Array<{
    siteId: string;
    siteName: string;
    historicalData: TrendDataPoint[];
    latestScore: ComplianceScore;
  }>,
  config: Partial<MonitoringConfig> = {}
): Promise<{
  results: MonitoringResult[];
  summary: {
    totalSites: number;
    sitesWithAlerts: number;
    totalNewAlerts: number;
    criticalAlerts: number;
    averageScore: number;
    bestPerformer: string;
    worstPerformer: string;
  };
}> {
  const results: MonitoringResult[] = [];

  // Monitor each site
  for (const site of sites) {
    const result = await monitorSiteTrends(
      site.siteId,
      site.siteName,
      site.historicalData,
      site.latestScore,
      config
    );
    results.push(result);
  }

  // Calculate summary statistics
  const sitesWithAlerts = results.filter(r => r.newAlerts.length > 0).length;
  const totalNewAlerts = results.reduce((sum, r) => sum + r.newAlerts.length, 0);
  const criticalAlerts = results.reduce(
    (sum, r) => sum + r.newAlerts.filter(a => a.severity === 'critical').length,
    0
  );
  const averageScore = results.reduce((sum, r) => sum + r.trendAnalysis.currentScore, 0) / results.length;

  // Find best and worst performers
  const sortedByCurrent = [...results].sort(
    (a, b) => b.trendAnalysis.currentScore - a.trendAnalysis.currentScore
  );
  const bestPerformer = sortedByCurrent[0]?.siteName || 'N/A';
  const worstPerformer = sortedByCurrent[sortedByCurrent.length - 1]?.siteName || 'N/A';

  return {
    results,
    summary: {
      totalSites: sites.length,
      sitesWithAlerts,
      totalNewAlerts,
      criticalAlerts,
      averageScore: Math.round(averageScore * 10) / 10,
      bestPerformer,
      worstPerformer
    }
  };
}

/**
 * Analyze seasonal patterns in compliance data
 */
export function analyzeSeasonalPatterns(
  dataPoints: TrendDataPoint[]
): {
  hasSeasonality: boolean;
  seasonalityStrength: 'strong' | 'moderate' | 'weak' | 'none';
  peakPeriod?: string;
  lowPeriod?: string;
  insights: string[];
} {
  if (dataPoints.length < 12) {
    return {
      hasSeasonality: false,
      seasonalityStrength: 'none',
      insights: ['Insufficient data for seasonal analysis (minimum 12 months required)']
    };
  }

  // Group by month
  const monthlyAverages = new Map<number, number[]>();
  
  dataPoints.forEach(point => {
    const month = point.date.getMonth();
    if (!monthlyAverages.has(month)) {
      monthlyAverages.set(month, []);
    }
    monthlyAverages.get(month)!.push(point.score);
  });

  // Calculate average for each month
  const monthlyScores = Array.from(monthlyAverages.entries()).map(([month, scores]) => ({
    month,
    average: scores.reduce((sum, s) => sum + s, 0) / scores.length,
    count: scores.length
  }));

  // Calculate overall average
  const overallAverage = monthlyScores.reduce((sum, m) => sum + m.average, 0) / monthlyScores.length;

  // Calculate variance from average
  const variances = monthlyScores.map(m => Math.abs(m.average - overallAverage));
  const maxVariance = Math.max(...variances);
  const avgVariance = variances.reduce((sum, v) => sum + v, 0) / variances.length;

  // Determine seasonality strength
  let seasonalityStrength: 'strong' | 'moderate' | 'weak' | 'none';
  let hasSeasonality: boolean;

  if (maxVariance > 10 && avgVariance > 5) {
    seasonalityStrength = 'strong';
    hasSeasonality = true;
  } else if (maxVariance > 7 && avgVariance > 3) {
    seasonalityStrength = 'moderate';
    hasSeasonality = true;
  } else if (maxVariance > 5 && avgVariance > 2) {
    seasonalityStrength = 'weak';
    hasSeasonality = true;
  } else {
    seasonalityStrength = 'none';
    hasSeasonality = false;
  }

  // Find peak and low periods
  const sortedMonths = [...monthlyScores].sort((a, b) => b.average - a.average);
  const peakMonth = sortedMonths[0];
  const lowMonth = sortedMonths[sortedMonths.length - 1];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const insights: string[] = [];

  if (hasSeasonality) {
    insights.push(
      `${seasonalityStrength.charAt(0).toUpperCase() + seasonalityStrength.slice(1)} seasonal pattern detected`
    );
    insights.push(
      `Peak performance typically in ${monthNames[peakMonth.month]} (avg: ${peakMonth.average.toFixed(1)}%)`
    );
    insights.push(
      `Lowest performance typically in ${monthNames[lowMonth.month]} (avg: ${lowMonth.average.toFixed(1)}%)`
    );
    insights.push(
      `Consider seasonal factors when planning audits and setting targets`
    );
  } else {
    insights.push('No significant seasonal patterns detected in compliance data');
  }

  return {
    hasSeasonality,
    seasonalityStrength,
    peakPeriod: hasSeasonality ? monthNames[peakMonth.month] : undefined,
    lowPeriod: hasSeasonality ? monthNames[lowMonth.month] : undefined,
    insights
  };
}

/**
 * Calculate rate of change acceleration (second derivative)
 */
export function calculateAcceleration(dataPoints: TrendDataPoint[]): {
  acceleration: number;
  isAccelerating: boolean;
  interpretation: string;
} {
  if (dataPoints.length < 3) {
    return {
      acceleration: 0,
      isAccelerating: false,
      interpretation: 'Insufficient data to calculate acceleration'
    };
  }

  const sortedData = [...dataPoints].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Calculate velocity (first derivative) for each consecutive pair
  const velocities: number[] = [];
  for (let i = 1; i < sortedData.length; i++) {
    const timeDiff = (sortedData[i].date.getTime() - sortedData[i - 1].date.getTime()) / (1000 * 60 * 60 * 24 * 30); // months
    const scoreDiff = sortedData[i].score - sortedData[i - 1].score;
    velocities.push(scoreDiff / timeDiff);
  }

  // Calculate acceleration (second derivative)
  let totalAcceleration = 0;
  for (let i = 1; i < velocities.length; i++) {
    totalAcceleration += velocities[i] - velocities[i - 1];
  }
  
  const acceleration = totalAcceleration / (velocities.length - 1);
  const isAccelerating = Math.abs(acceleration) > 0.5;

  let interpretation: string;
  if (acceleration > 1) {
    interpretation = 'Performance improvement is accelerating - positive momentum';
  } else if (acceleration > 0.5) {
    interpretation = 'Performance is improving at an increasing rate';
  } else if (acceleration < -1) {
    interpretation = 'Performance decline is accelerating - urgent intervention needed';
  } else if (acceleration < -0.5) {
    interpretation = 'Performance is declining at an increasing rate';
  } else {
    interpretation = 'Performance change rate is stable';
  }

  return {
    acceleration: Math.round(acceleration * 100) / 100,
    isAccelerating,
    interpretation
  };
}
