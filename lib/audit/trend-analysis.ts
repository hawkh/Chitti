// Trend Analysis and Forecasting Service
// Implements time-series analysis for compliance trends and predictive analytics

import { ComplianceScore } from '@/types/audit-form.types';

export interface TrendDataPoint {
  date: Date;
  score: number;
  auditId: string;
  siteId: string;
  siteName: string;
}

export interface TrendAnalysis {
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dataPoints: TrendDataPoint[];
  currentScore: number;
  previousScore: number | null;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  trend: 'improving' | 'declining' | 'stable';
  trendStrength: 'strong' | 'moderate' | 'weak';
  volatility: number;
  changeRate: number; // Points per period
  insights: string[];
}

export interface ForecastResult {
  forecastDate: Date;
  predictedScore: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  confidence: number; // 0-100%
  method: 'linear' | 'moving_average' | 'exponential';
}

export interface PerformanceAlert {
  id: string;
  siteId: string;
  siteName: string;
  severity: 'critical' | 'warning' | 'info';
  type: 'declining_trend' | 'low_score' | 'high_volatility' | 'critical_failure';
  message: string;
  detectedAt: Date;
  threshold: number;
  currentValue: number;
  recommendedAction: string;
}

/**
 * Analyze compliance score trends over time
 */
export function analyzeTrend(
  dataPoints: TrendDataPoint[],
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly'
): TrendAnalysis {
  if (dataPoints.length === 0) {
    return {
      period,
      dataPoints: [],
      currentScore: 0,
      previousScore: null,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      trend: 'stable',
      trendStrength: 'weak',
      volatility: 0,
      changeRate: 0,
      insights: ['Insufficient data for trend analysis']
    };
  }
  
  // Sort by date (oldest first)
  const sortedData = [...dataPoints].sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  );
  
  const scores = sortedData.map(d => d.score);
  const currentScore = scores[scores.length - 1];
  const previousScore = scores.length > 1 ? scores[scores.length - 2] : null;
  const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);
  
  // Calculate trend using linear regression
  const trendResult = calculateLinearTrend(sortedData);
  
  // Calculate volatility (standard deviation)
  const volatility = calculateVolatility(scores);
  
  // Generate insights
  const insights = generateTrendInsights(
    sortedData,
    trendResult,
    volatility,
    averageScore
  );
  
  return {
    period,
    dataPoints: sortedData,
    currentScore: Math.round(currentScore * 10) / 10,
    previousScore: previousScore !== null ? Math.round(previousScore * 10) / 10 : null,
    averageScore: Math.round(averageScore * 10) / 10,
    highestScore: Math.round(highestScore * 10) / 10,
    lowestScore: Math.round(lowestScore * 10) / 10,
    trend: trendResult.trend,
    trendStrength: trendResult.strength,
    volatility: Math.round(volatility * 10) / 10,
    changeRate: Math.round(trendResult.slope * 10) / 10,
    insights
  };
}

/**
 * Calculate linear trend using least squares regression
 */
function calculateLinearTrend(dataPoints: TrendDataPoint[]): {
  slope: number;
  trend: 'improving' | 'declining' | 'stable';
  strength: 'strong' | 'moderate' | 'weak';
  rSquared: number;
} {
  const n = dataPoints.length;
  
  if (n < 2) {
    return { slope: 0, trend: 'stable', strength: 'weak', rSquared: 0 };
  }
  
  // Convert dates to numeric values (days since first data point)
  const firstDate = dataPoints[0].date.getTime();
  const x = dataPoints.map(d => (d.date.getTime() - firstDate) / (1000 * 60 * 60 * 24));
  const y = dataPoints.map(d => d.score);
  
  // Calculate means
  const xMean = x.reduce((sum, val) => sum + val, 0) / n;
  const yMean = y.reduce((sum, val) => sum + val, 0) / n;
  
  // Calculate slope and intercept
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (y[i] - yMean);
    denominator += (x[i] - xMean) ** 2;
  }
  
  const slope = denominator !== 0 ? numerator / denominator : 0;
  
  // Calculate R-squared (coefficient of determination)
  const yPredicted = x.map(xi => yMean + slope * (xi - xMean));
  const ssRes = y.reduce((sum, yi, i) => sum + (yi - yPredicted[i]) ** 2, 0);
  const ssTot = y.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0);
  const rSquared = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;
  
  // Determine trend direction and strength
  let trend: 'improving' | 'declining' | 'stable';
  let strength: 'strong' | 'moderate' | 'weak';
  
  // Slope is in points per day, convert to points per month for interpretation
  const slopePerMonth = slope * 30;
  
  if (Math.abs(slopePerMonth) < 1) {
    trend = 'stable';
  } else if (slopePerMonth > 0) {
    trend = 'improving';
  } else {
    trend = 'declining';
  }
  
  // Strength based on R-squared
  if (rSquared > 0.7) {
    strength = 'strong';
  } else if (rSquared > 0.4) {
    strength = 'moderate';
  } else {
    strength = 'weak';
  }
  
  return { slope: slopePerMonth, trend, strength, rSquared };
}

/**
 * Calculate volatility (standard deviation) of scores
 */
function calculateVolatility(scores: number[]): number {
  if (scores.length < 2) return 0;
  
  const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const squaredDiffs = scores.map(s => (s - mean) ** 2);
  const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / scores.length;
  
  return Math.sqrt(variance);
}

/**
 * Generate insights from trend analysis
 */
function generateTrendInsights(
  dataPoints: TrendDataPoint[],
  trendResult: { slope: number; trend: string; strength: string; rSquared: number },
  volatility: number,
  averageScore: number
): string[] {
  const insights: string[] = [];
  const { slope, trend, strength } = trendResult;
  
  // Trend insight
  if (trend === 'improving') {
    insights.push(`${strength.charAt(0).toUpperCase() + strength.slice(1)} upward trend: improving by ${Math.abs(slope).toFixed(1)} points per month`);
  } else if (trend === 'declining') {
    insights.push(`${strength.charAt(0).toUpperCase() + strength.slice(1)} downward trend: declining by ${Math.abs(slope).toFixed(1)} points per month`);
  } else {
    insights.push('Stable performance with minimal variation over time');
  }
  
  // Volatility insight
  if (volatility > 10) {
    insights.push(`High volatility (±${volatility.toFixed(1)} points) indicates inconsistent performance`);
  } else if (volatility > 5) {
    insights.push(`Moderate volatility (±${volatility.toFixed(1)} points) suggests some performance variation`);
  } else {
    insights.push(`Low volatility (±${volatility.toFixed(1)} points) shows consistent performance`);
  }
  
  // Performance level insight
  if (averageScore >= 90) {
    insights.push('Excellent average performance maintained above 90%');
  } else if (averageScore >= 80) {
    insights.push('Good average performance in the 80-90% range');
  } else if (averageScore >= 70) {
    insights.push('Acceptable average performance, but room for improvement');
  } else {
    insights.push('Below-standard average performance requires immediate attention');
  }
  
  // Recent performance insight
  if (dataPoints.length >= 3) {
    const recentScores = dataPoints.slice(-3).map(d => d.score);
    const recentAvg = recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length;
    
    if (recentAvg > averageScore + 5) {
      insights.push('Recent performance significantly above historical average');
    } else if (recentAvg < averageScore - 5) {
      insights.push('Recent performance below historical average - investigate causes');
    }
  }
  
  return insights;
}

/**
 * Forecast future compliance scores
 */
export function forecastScore(
  historicalData: TrendDataPoint[],
  periodsAhead: number = 1,
  method: 'linear' | 'moving_average' | 'exponential' = 'linear'
): ForecastResult[] {
  if (historicalData.length < 2) {
    return [];
  }
  
  const sortedData = [...historicalData].sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  );
  
  const forecasts: ForecastResult[] = [];
  
  for (let i = 1; i <= periodsAhead; i++) {
    let forecast: ForecastResult;
    
    switch (method) {
      case 'linear':
        forecast = linearForecast(sortedData, i);
        break;
      case 'moving_average':
        forecast = movingAverageForecast(sortedData, i);
        break;
      case 'exponential':
        forecast = exponentialForecast(sortedData, i);
        break;
      default:
        forecast = linearForecast(sortedData, i);
    }
    
    forecasts.push(forecast);
  }
  
  return forecasts;
}

/**
 * Linear regression forecast
 */
function linearForecast(data: TrendDataPoint[], periodsAhead: number): ForecastResult {
  const trendResult = calculateLinearTrend(data);
  const lastDataPoint = data[data.length - 1];
  const lastScore = lastDataPoint.score;
  
  // Predict score based on linear trend
  const predictedScore = Math.max(0, Math.min(100, 
    lastScore + (trendResult.slope * periodsAhead)
  ));
  
  // Calculate confidence interval based on historical volatility
  const scores = data.map(d => d.score);
  const volatility = calculateVolatility(scores);
  const confidenceMargin = volatility * 1.96; // 95% confidence interval
  
  // Forecast date (assume monthly periods)
  const forecastDate = new Date(lastDataPoint.date);
  forecastDate.setMonth(forecastDate.getMonth() + periodsAhead);
  
  // Confidence decreases with distance
  const confidence = Math.max(50, 95 - (periodsAhead * 5));
  
  return {
    forecastDate,
    predictedScore: Math.round(predictedScore * 10) / 10,
    confidenceInterval: {
      lower: Math.max(0, Math.round((predictedScore - confidenceMargin) * 10) / 10),
      upper: Math.min(100, Math.round((predictedScore + confidenceMargin) * 10) / 10)
    },
    confidence,
    method: 'linear'
  };
}

/**
 * Moving average forecast
 */
function movingAverageForecast(data: TrendDataPoint[], periodsAhead: number): ForecastResult {
  const windowSize = Math.min(3, data.length);
  const recentData = data.slice(-windowSize);
  const avgScore = recentData.reduce((sum, d) => sum + d.score, 0) / windowSize;
  
  const lastDataPoint = data[data.length - 1];
  const forecastDate = new Date(lastDataPoint.date);
  forecastDate.setMonth(forecastDate.getMonth() + periodsAhead);
  
  const scores = data.map(d => d.score);
  const volatility = calculateVolatility(scores);
  const confidenceMargin = volatility * 1.5;
  
  return {
    forecastDate,
    predictedScore: Math.round(avgScore * 10) / 10,
    confidenceInterval: {
      lower: Math.max(0, Math.round((avgScore - confidenceMargin) * 10) / 10),
      upper: Math.min(100, Math.round((avgScore + confidenceMargin) * 10) / 10)
    },
    confidence: Math.max(60, 90 - (periodsAhead * 5)),
    method: 'moving_average'
  };
}

/**
 * Exponential smoothing forecast
 */
function exponentialForecast(data: TrendDataPoint[], periodsAhead: number): ForecastResult {
  const alpha = 0.3; // Smoothing factor
  let smoothedValue = data[0].score;
  
  // Apply exponential smoothing
  for (let i = 1; i < data.length; i++) {
    smoothedValue = alpha * data[i].score + (1 - alpha) * smoothedValue;
  }
  
  const lastDataPoint = data[data.length - 1];
  const forecastDate = new Date(lastDataPoint.date);
  forecastDate.setMonth(forecastDate.getMonth() + periodsAhead);
  
  const scores = data.map(d => d.score);
  const volatility = calculateVolatility(scores);
  const confidenceMargin = volatility * 1.7;
  
  return {
    forecastDate,
    predictedScore: Math.round(smoothedValue * 10) / 10,
    confidenceInterval: {
      lower: Math.max(0, Math.round((smoothedValue - confidenceMargin) * 10) / 10),
      upper: Math.min(100, Math.round((smoothedValue + confidenceMargin) * 10) / 10)
    },
    confidence: Math.max(55, 85 - (periodsAhead * 5)),
    method: 'exponential'
  };
}

/**
 * Detect performance alerts based on trend analysis
 */
export function detectPerformanceAlerts(
  siteId: string,
  siteName: string,
  trendAnalysis: TrendAnalysis,
  latestScore: ComplianceScore
): PerformanceAlert[] {
  const alerts: PerformanceAlert[] = [];
  const now = new Date();
  
  // Critical failures alert
  if (latestScore.criticalFailures > 0) {
    alerts.push({
      id: `${siteId}-critical-${now.getTime()}`,
      siteId,
      siteName,
      severity: 'critical',
      type: 'critical_failure',
      message: `${latestScore.criticalFailures} critical failure(s) detected requiring immediate action`,
      detectedAt: now,
      threshold: 0,
      currentValue: latestScore.criticalFailures,
      recommendedAction: 'Implement immediate corrective actions and conduct root cause analysis'
    });
  }
  
  // Declining trend alert
  if (trendAnalysis.trend === 'declining' && trendAnalysis.trendStrength !== 'weak') {
    const severity = trendAnalysis.trendStrength === 'strong' ? 'critical' : 'warning';
    alerts.push({
      id: `${siteId}-declining-${now.getTime()}`,
      siteId,
      siteName,
      severity,
      type: 'declining_trend',
      message: `${trendAnalysis.trendStrength} declining trend detected: -${Math.abs(trendAnalysis.changeRate).toFixed(1)} points per month`,
      detectedAt: now,
      threshold: 0,
      currentValue: trendAnalysis.changeRate,
      recommendedAction: 'Investigate root causes and develop improvement action plan'
    });
  }
  
  // Low score alert
  if (trendAnalysis.currentScore < 70) {
    alerts.push({
      id: `${siteId}-lowscore-${now.getTime()}`,
      siteId,
      siteName,
      severity: trendAnalysis.currentScore < 60 ? 'critical' : 'warning',
      type: 'low_score',
      message: `Compliance score ${trendAnalysis.currentScore}% below acceptable threshold`,
      detectedAt: now,
      threshold: 70,
      currentValue: trendAnalysis.currentScore,
      recommendedAction: 'Conduct comprehensive audit and implement corrective measures'
    });
  }
  
  // High volatility alert
  if (trendAnalysis.volatility > 10) {
    alerts.push({
      id: `${siteId}-volatility-${now.getTime()}`,
      siteId,
      siteName,
      severity: 'warning',
      type: 'high_volatility',
      message: `High performance volatility (±${trendAnalysis.volatility.toFixed(1)} points) indicates inconsistent processes`,
      detectedAt: now,
      threshold: 10,
      currentValue: trendAnalysis.volatility,
      recommendedAction: 'Standardize processes and improve consistency in audit execution'
    });
  }
  
  return alerts;
}

/**
 * Calculate moving average for smoothing trend data
 */
export function calculateMovingAverage(
  dataPoints: TrendDataPoint[],
  windowSize: number = 3
): TrendDataPoint[] {
  if (dataPoints.length < windowSize) {
    return dataPoints;
  }
  
  const smoothedData: TrendDataPoint[] = [];
  
  for (let i = 0; i < dataPoints.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(dataPoints.length, start + windowSize);
    const window = dataPoints.slice(start, end);
    
    const avgScore = window.reduce((sum, d) => sum + d.score, 0) / window.length;
    
    smoothedData.push({
      ...dataPoints[i],
      score: Math.round(avgScore * 10) / 10
    });
  }
  
  return smoothedData;
}
