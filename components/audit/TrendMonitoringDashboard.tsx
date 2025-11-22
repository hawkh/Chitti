'use client';

import React, { useState, useEffect } from 'react';
import { MonitoringResult } from '@/lib/audit/trend-monitoring-service';
import TrendAnalysis from './TrendAnalysis';
import AlertDashboard from './AlertDashboard';

interface TrendMonitoringDashboardProps {
  siteId?: string;
  siteName?: string;
  userId: string;
  userRole: 'inspector' | 'manager' | 'admin';
  showMultipleSites?: boolean;
}

export default function TrendMonitoringDashboard({
  siteId,
  siteName,
  userId,
  userRole,
  showMultipleSites = false
}: TrendMonitoringDashboardProps) {
  const [monitoringResult, setMonitoringResult] = useState<MonitoringResult | null>(null);
  const [multiSiteResults, setMultiSiteResults] = useState<any>(null);
  const [seasonalAnalysis, setSeasonalAnalysis] = useState<any>(null);
  const [accelerationAnalysis, setAccelerationAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'alerts' | 'advanced'>('overview');

  useEffect(() => {
    if (showMultipleSites) {
      loadMultipleSites();
    } else if (siteId && siteName) {
      loadSiteMonitoring();
    }
  }, [siteId, siteName, showMultipleSites]);

  const loadSiteMonitoring = async () => {
    if (!siteId || !siteName) return;

    setLoading(true);
    try {
      // Generate mock historical data
      const historicalData = generateMockHistoricalData(siteId, siteName);
      const latestScore = {
        overallScore: historicalData[historicalData.length - 1].score,
        sectionScores: {},
        passedItems: 20,
        failedItems: 5,
        naItems: 0,
        totalItems: 25,
        criticalFailures: 0,
        highSeverityCount: 2,
        mediumSeverityCount: 3,
        lowSeverityCount: 0,
        improvementAreas: ['Documentation', 'Process Control'],
        calculatedAt: new Date()
      };

      // Monitor site trends
      const monitorResponse = await fetch('/api/audit/trends/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'monitor_site',
          siteId,
          siteName,
          historicalData,
          latestScore,
          config: {
            enableAutoAlerts: true,
            forecastPeriods: 3
          }
        })
      });

      if (monitorResponse.ok) {
        const data = await monitorResponse.json();
        setMonitoringResult(data.result);
      }

      // Analyze seasonality
      const seasonalResponse = await fetch('/api/audit/trends/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_seasonality',
          dataPoints: historicalData
        })
      });

      if (seasonalResponse.ok) {
        const data = await seasonalResponse.json();
        setSeasonalAnalysis(data.seasonalAnalysis);
      }

      // Calculate acceleration
      const accelResponse = await fetch('/api/audit/trends/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calculate_acceleration',
          dataPoints: historicalData
        })
      });

      if (accelResponse.ok) {
        const data = await accelResponse.json();
        setAccelerationAnalysis(data.accelerationAnalysis);
      }
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMultipleSites = async () => {
    setLoading(true);
    try {
      // Generate mock data for multiple sites
      const sites = [
        { siteId: 'site-1', siteName: 'Manufacturing Plant A' },
        { siteId: 'site-2', siteName: 'Manufacturing Plant B' },
        { siteId: 'site-3', siteName: 'Distribution Center' }
      ].map(site => ({
        ...site,
        historicalData: generateMockHistoricalData(site.siteId, site.siteName),
        latestScore: {
          overallScore: 75 + Math.random() * 20,
          sectionScores: {},
          passedItems: 20,
          failedItems: 5,
          naItems: 0,
          totalItems: 25,
          criticalFailures: Math.floor(Math.random() * 2),
          highSeverityCount: Math.floor(Math.random() * 3),
          mediumSeverityCount: Math.floor(Math.random() * 5),
          lowSeverityCount: 0,
          improvementAreas: ['Documentation', 'Process Control'],
          calculatedAt: new Date()
        }
      }));

      const response = await fetch('/api/audit/trends/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'monitor_multiple',
          sites,
          config: {
            enableAutoAlerts: true,
            forecastPeriods: 3
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMultiSiteResults(data);
      }
    } catch (error) {
      console.error('Error loading multi-site data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {showMultipleSites ? 'Multi-Site Trend Monitoring' : `Trend Monitoring: ${siteName}`}
        </h1>
        <p className="text-gray-600">
          Automated compliance trend analysis with predictive alerts and recommendations
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'trends'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Trend Analysis
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'alerts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Alerts
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'advanced'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Advanced Analytics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {showMultipleSites && multiSiteResults ? (
                <MultiSiteOverview results={multiSiteResults} />
              ) : monitoringResult ? (
                <SingleSiteOverview result={monitoringResult} />
              ) : (
                <div className="text-center text-gray-500">No monitoring data available</div>
              )}
            </div>
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && siteId && siteName && (
            <TrendAnalysis siteId={siteId} siteName={siteName} />
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <AlertDashboard
              siteId={showMultipleSites ? undefined : siteId}
              userId={userId}
              userRole={userRole}
            />
          )}

          {/* Advanced Analytics Tab */}
          {activeTab === 'advanced' && (
            <AdvancedAnalytics
              seasonalAnalysis={seasonalAnalysis}
              accelerationAnalysis={accelerationAnalysis}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Single Site Overview Component
function SingleSiteOverview({ result }: { result: MonitoringResult }) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
          <div className="text-sm text-blue-700">Current Score</div>
          <div className="text-3xl font-bold text-blue-900">
            {result.trendAnalysis.currentScore.toFixed(1)}%
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {result.trendAnalysis.trend === 'improving' ? '📈' : result.trendAnalysis.trend === 'declining' ? '📉' : '➡️'}
            {' '}{result.trendAnalysis.trend}
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
          <div className="text-sm text-purple-700">Forecast (Next Period)</div>
          <div className="text-3xl font-bold text-purple-900">
            {result.forecast[0]?.predictedScore.toFixed(1) || 'N/A'}%
          </div>
          <div className="text-xs text-purple-600 mt-1">
            {result.forecast[0]?.confidence || 0}% confidence
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-600">
          <div className="text-sm text-red-700">New Alerts</div>
          <div className="text-3xl font-bold text-red-900">{result.newAlerts.length}</div>
          <div className="text-xs text-red-600 mt-1">
            {result.newAlerts.filter(a => a.severity === 'critical').length} critical
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-600">
          <div className="text-sm text-yellow-700">Active Alerts</div>
          <div className="text-3xl font-bold text-yellow-900">{result.existingAlerts}</div>
          <div className="text-xs text-yellow-600 mt-1">Require attention</div>
        </div>
      </div>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Recommendations
          </h3>
          <ul className="space-y-3">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2 mt-1">•</span>
                <span className="text-sm text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Monitoring Info */}
      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>Last monitored: {new Date(result.monitoredAt).toLocaleString()}</span>
          <span>Site: {result.siteName}</span>
        </div>
      </div>
    </div>
  );
}

// Multi-Site Overview Component
function MultiSiteOverview({ results }: { results: any }) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
          <div className="text-sm text-blue-700">Total Sites</div>
          <div className="text-3xl font-bold text-blue-900">{results.summary.totalSites}</div>
          <div className="text-xs text-blue-600 mt-1">Being monitored</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
          <div className="text-sm text-green-700">Average Score</div>
          <div className="text-3xl font-bold text-green-900">
            {results.summary.averageScore.toFixed(1)}%
          </div>
          <div className="text-xs text-green-600 mt-1">Across all sites</div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-600">
          <div className="text-sm text-red-700">Total Alerts</div>
          <div className="text-3xl font-bold text-red-900">{results.summary.totalNewAlerts}</div>
          <div className="text-xs text-red-600 mt-1">
            {results.summary.criticalAlerts} critical
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-600">
          <div className="text-sm text-yellow-700">Sites with Alerts</div>
          <div className="text-3xl font-bold text-yellow-900">{results.summary.sitesWithAlerts}</div>
          <div className="text-xs text-yellow-600 mt-1">Require attention</div>
        </div>
      </div>

      {/* Performance Leaders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm font-semibold text-green-800 mb-2">🏆 Best Performer</div>
          <div className="text-lg font-bold text-green-900">{results.summary.bestPerformer}</div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-sm font-semibold text-red-800 mb-2">⚠️ Needs Attention</div>
          <div className="text-lg font-bold text-red-900">{results.summary.worstPerformer}</div>
        </div>
      </div>

      {/* Site Details */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Site Details</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {results.results.map((result: MonitoringResult, index: number) => (
            <div key={index} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{result.siteName}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Score: {result.trendAnalysis.currentScore.toFixed(1)}% •
                    Trend: {result.trendAnalysis.trend} •
                    Alerts: {result.newAlerts.length}
                  </div>
                </div>
                <div className="text-right">
                  {result.newAlerts.length > 0 && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      {result.newAlerts.length} new alert{result.newAlerts.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Advanced Analytics Component
function AdvancedAnalytics({
  seasonalAnalysis,
  accelerationAnalysis
}: {
  seasonalAnalysis: any;
  accelerationAnalysis: any;
}) {
  return (
    <div className="space-y-6">
      {/* Seasonal Analysis */}
      {seasonalAnalysis && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">📅</span>
            Seasonal Pattern Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-700">Seasonality</div>
              <div className="text-xl font-bold text-blue-900">
                {seasonalAnalysis.seasonalityStrength}
              </div>
            </div>
            
            {seasonalAnalysis.peakPeriod && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-700">Peak Period</div>
                <div className="text-xl font-bold text-green-900">
                  {seasonalAnalysis.peakPeriod}
                </div>
              </div>
            )}
            
            {seasonalAnalysis.lowPeriod && (
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-red-700">Low Period</div>
                <div className="text-xl font-bold text-red-900">
                  {seasonalAnalysis.lowPeriod}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700">Insights:</div>
            {seasonalAnalysis.insights.map((insight: string, index: number) => (
              <div key={index} className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span className="text-sm text-gray-700">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acceleration Analysis */}
      {accelerationAnalysis && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">🚀</span>
            Performance Acceleration Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${
              accelerationAnalysis.acceleration > 0 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className={`text-sm ${
                accelerationAnalysis.acceleration > 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                Acceleration Rate
              </div>
              <div className={`text-2xl font-bold ${
                accelerationAnalysis.acceleration > 0 ? 'text-green-900' : 'text-red-900'
              }`}>
                {accelerationAnalysis.acceleration > 0 ? '+' : ''}
                {accelerationAnalysis.acceleration.toFixed(2)} pts/month²
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-700">Status</div>
              <div className="text-xl font-bold text-blue-900">
                {accelerationAnalysis.isAccelerating ? 'Accelerating' : 'Stable'}
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-semibold text-gray-700 mb-2">Interpretation:</div>
            <p className="text-sm text-gray-700">{accelerationAnalysis.interpretation}</p>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <span className="text-blue-600 mr-2 text-xl">ℹ️</span>
          <div className="text-sm text-blue-800">
            <strong>About Advanced Analytics:</strong> These metrics provide deeper insights into
            performance patterns. Seasonal analysis helps identify recurring patterns throughout the year,
            while acceleration analysis shows whether performance changes are speeding up or slowing down.
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock data generator
function generateMockHistoricalData(siteId: string, siteName: string) {
  const dataPoints = [];
  const baseScore = 75 + Math.random() * 15;
  
  for (let i = 12; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    const variation = (Math.random() - 0.5) * 10;
    const trend = i * 0.3;
    const seasonal = Math.sin((date.getMonth() / 12) * Math.PI * 2) * 5;
    const score = Math.max(60, Math.min(100, baseScore + variation + trend + seasonal));
    
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
