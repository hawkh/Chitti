'use client';

import React, { useState, useEffect } from 'react';

interface ExecutiveSummary {
  overview: {
    totalSites: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    scoreRange: number;
  };
  trends: {
    improving: number;
    declining: number;
    stable: number;
    improvingPercentage: number;
    decliningPercentage: number;
  };
  alerts: {
    total: number;
    critical: number;
    warning: number;
    info: number;
  };
  attention: {
    sitesRequiringAttention: number;
    sites: Array<{
      siteId: string;
      siteName: string;
      reasons: string[];
      criticalAlertCount: number;
      currentScore: number;
      trend: string;
    }>;
  };
  recommendations: string[];
}

export default function ExecutiveTrendDashboard() {
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');

  useEffect(() => {
    loadExecutiveSummary();
  }, [period]);

  const loadExecutiveSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/audit/trends/executive-summary?period=${period}`);
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data.executiveSummary);
      }
    } catch (error) {
      console.error('Error loading executive summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center p-12 text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Executive Trend Summary</h2>
          <p className="text-gray-600">Organization-wide performance overview</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-sm opacity-90">Total Sites</div>
          <div className="text-4xl font-bold mt-2">{summary.overview.totalSites}</div>
          <div className="text-xs opacity-75 mt-2">Monitored locations</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-sm opacity-90">Average Score</div>
          <div className="text-4xl font-bold mt-2">{summary.overview.averageScore}%</div>
          <div className="text-xs opacity-75 mt-2">
            Range: {summary.overview.lowestScore}% - {summary.overview.highestScore}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-sm opacity-90">Improving Sites</div>
          <div className="text-4xl font-bold mt-2">{summary.trends.improving}</div>
          <div className="text-xs opacity-75 mt-2">
            {summary.trends.improvingPercentage}% of total
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-sm opacity-90">Critical Alerts</div>
          <div className="text-4xl font-bold mt-2">{summary.alerts.critical}</div>
          <div className="text-xs opacity-75 mt-2">
            {summary.alerts.total} total alerts
          </div>
        </div>
      </div>

      {/* Trend Distribution */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">📈 Improving</span>
              <span className="text-sm font-bold text-green-700">
                {summary.trends.improving} sites ({summary.trends.improvingPercentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{ width: `${summary.trends.improvingPercentage}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">➡️ Stable</span>
              <span className="text-sm font-bold text-gray-700">
                {summary.trends.stable} sites
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gray-600 h-3 rounded-full transition-all"
                style={{ 
                  width: `${Math.round((summary.trends.stable / summary.overview.totalSites) * 100)}%` 
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-700">📉 Declining</span>
              <span className="text-sm font-bold text-red-700">
                {summary.trends.declining} sites ({summary.trends.decliningPercentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-red-600 h-3 rounded-full transition-all"
                style={{ width: `${summary.trends.decliningPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Alert Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg border-2 border-red-200">
            <div className="text-3xl font-bold text-red-700">{summary.alerts.critical}</div>
            <div className="text-sm text-red-600 mt-1">Critical</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
            <div className="text-3xl font-bold text-yellow-700">{summary.alerts.warning}</div>
            <div className="text-sm text-yellow-600 mt-1">Warning</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="text-3xl font-bold text-blue-700">{summary.alerts.info}</div>
            <div className="text-sm text-blue-600 mt-1">Info</div>
          </div>
        </div>
      </div>

      {/* Sites Requiring Attention */}
      {summary.attention.sitesRequiringAttention > 0 && (
        <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-red-900 mb-4">
            🚨 Sites Requiring Immediate Attention ({summary.attention.sitesRequiringAttention})
          </h3>
          <div className="space-y-3">
            {summary.attention.sites.map((site) => (
              <div key={site.siteId} className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{site.siteName}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Score: {site.currentScore.toFixed(1)}% | Trend: {site.trend}
                    </div>
                    {site.criticalAlertCount > 0 && (
                      <div className="text-sm text-red-600 font-medium mt-1">
                        {site.criticalAlertCount} critical alert(s)
                      </div>
                    )}
                    <div className="mt-2">
                      <div className="text-xs font-semibold text-gray-700 mb-1">Issues:</div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {site.reasons.map((reason, idx) => (
                          <li key={idx}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          💡 Strategic Recommendations
        </h3>
        <ul className="space-y-2">
          {summary.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-600 mr-2 font-bold">{index + 1}.</span>
              <span className="text-sm text-blue-900">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Performance Score Distribution */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
        <div className="flex items-end justify-between h-48 gap-2">
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full bg-green-600 rounded-t" style={{ height: '80%' }}></div>
            <div className="text-xs text-gray-600 mt-2">90-100%</div>
            <div className="text-sm font-bold">Excellent</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full bg-blue-600 rounded-t" style={{ height: '60%' }}></div>
            <div className="text-xs text-gray-600 mt-2">80-89%</div>
            <div className="text-sm font-bold">Good</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full bg-yellow-600 rounded-t" style={{ height: '40%' }}></div>
            <div className="text-xs text-gray-600 mt-2">70-79%</div>
            <div className="text-sm font-bold">Fair</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full bg-red-600 rounded-t" style={{ height: '20%' }}></div>
            <div className="text-xs text-gray-600 mt-2">&lt;70%</div>
            <div className="text-sm font-bold">Poor</div>
          </div>
        </div>
      </div>
    </div>
  );
}
