'use client';

import React, { useState, useEffect } from 'react';
import { TrendAnalysis as TrendAnalysisType, ForecastResult, PerformanceAlert } from '@/lib/audit/trend-analysis';

interface TrendAnalysisProps {
  siteId: string;
  siteName: string;
  period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export default function TrendAnalysis({ siteId, siteName, period = 'monthly' }: TrendAnalysisProps) {
  const [trendData, setTrendData] = useState<TrendAnalysisType | null>(null);
  const [forecast, setForecast] = useState<ForecastResult[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [forecastMethod, setForecastMethod] = useState<'linear' | 'moving_average' | 'exponential'>('linear');

  useEffect(() => {
    loadTrendData();
  }, [siteId, period, forecastMethod]);

  const loadTrendData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockDataPoints = generateMockTrendData(siteId, siteName);
      const latestScore = {
        overallScore: mockDataPoints[mockDataPoints.length - 1].score,
        sectionScores: {},
        passedItems: 20,
        failedItems: 5,
        naItems: 0,
        totalItems: 25,
        criticalFailures: 0,
        highSeverityCount: 2,
        mediumSeverityCount: 3,
        lowSeverityCount: 0,
        improvementAreas: [],
        calculatedAt: new Date()
      };

      const response = await fetch('/api/audit/trends/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataPoints: mockDataPoints,
          period,
          forecastPeriods: 3,
          forecastMethod,
          siteId,
          siteName,
          latestScore
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTrendData(data.trendAnalysis);
        setForecast(data.forecast);
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error loading trend data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '📈';
      case 'declining':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50';
      case 'declining':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-900';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      default:
        return 'bg-blue-100 border-blue-500 text-blue-900';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!trendData) {
    return (
      <div className="text-center p-8 text-gray-500">
        No trend data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">
                      {alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️'}
                      {' '}{alert.type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{alert.message}</p>
                  <p className="text-xs font-medium">Recommended Action: {alert.recommendedAction}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Current Score</div>
          <div className="text-2xl font-bold text-blue-600">
            {trendData.currentScore.toFixed(1)}%
          </div>
          {trendData.previousScore && (
            <div className={`text-sm ${trendData.currentScore >= trendData.previousScore ? 'text-green-600' : 'text-red-600'}`}>
              {trendData.currentScore >= trendData.previousScore ? '+' : ''}
              {(trendData.currentScore - trendData.previousScore).toFixed(1)} from last period
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Average Score</div>
          <div className="text-2xl font-bold text-gray-700">
            {trendData.averageScore.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">
            Over {trendData.dataPoints.length} audits
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Trend</div>
          <div className={`text-lg font-bold px-3 py-1 rounded-full inline-flex items-center gap-2 ${getTrendColor(trendData.trend)}`}>
            {getTrendIcon(trendData.trend)} {trendData.trend}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {trendData.trendStrength} strength
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Volatility</div>
          <div className="text-2xl font-bold text-gray-700">
            ±{trendData.volatility.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500">
            {trendData.volatility > 10 ? 'High' : trendData.volatility > 5 ? 'Moderate' : 'Low'} variation
          </div>
        </div>
      </div>

      {/* Trend Chart Visualization (Simple Text-based) */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Score History</h3>
        <div className="space-y-2">
          {trendData.dataPoints.map((point, index) => {
            const percentage = (point.score / 100) * 100;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="text-xs text-gray-500 w-24">
                  {new Date(point.date).toLocaleDateString()}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all"
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="text-xs text-white font-medium">
                      {point.score.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
        <ul className="space-y-2">
          {trendData.insights.map((insight, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span className="text-sm text-gray-700">{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Forecast */}
      {forecast.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Forecast</h3>
            <select
              value={forecastMethod}
              onChange={(e) => setForecastMethod(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="linear">Linear Regression</option>
              <option value="moving_average">Moving Average</option>
              <option value="exponential">Exponential Smoothing</option>
            </select>
          </div>
          <div className="space-y-3">
            {forecast.map((f, index) => (
              <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {new Date(f.forecastDate).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                    <div className="text-sm text-gray-600">
                      Predicted: <span className="font-semibold">{f.predictedScore.toFixed(1)}%</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Range: {f.confidenceInterval.lower.toFixed(1)}% - {f.confidenceInterval.upper.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Confidence</div>
                    <div className="text-lg font-bold text-purple-600">{f.confidence}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-500">
            * Forecasts are based on historical trends and should be used as guidance only
          </div>
        </div>
      )}

      {/* Performance Range */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Performance Range</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Highest Score</span>
              <span className="font-semibold text-green-600">{trendData.highestScore.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${trendData.highestScore}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Average Score</span>
              <span className="font-semibold text-blue-600">{trendData.averageScore.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${trendData.averageScore}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Lowest Score</span>
              <span className="font-semibold text-red-600">{trendData.lowestScore.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{ width: `${trendData.lowestScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock data generator
function generateMockTrendData(siteId: string, siteName: string) {
  const dataPoints = [];
  const baseScore = 75 + Math.random() * 15;
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    const variation = (Math.random() - 0.5) * 10;
    const trend = i * 0.5; // Slight upward trend
    const score = Math.max(60, Math.min(100, baseScore + variation + trend));
    
    dataPoints.push({
      date,
      score,
      auditId: `audit-${i}`,
      siteId,
      siteName
    });
  }
  
  return dataPoints;
}
