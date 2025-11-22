'use client';

import React, { useState } from 'react';
import TrendAnalysis from '@/components/audit/TrendAnalysis';
import AlertDashboard from '@/components/audit/AlertDashboard';

export default function TrendsPage() {
  const [selectedSite, setSelectedSite] = useState<string>('site-1');
  const [selectedTab, setSelectedTab] = useState<'trends' | 'alerts'>('trends');
  
  // Mock user data (in production, get from auth context)
  const mockUser = {
    id: 'user-1',
    role: 'manager' as const
  };
  
  // Mock sites (in production, fetch from API)
  const mockSites = [
    { id: 'site-1', name: 'Manufacturing Plant A' },
    { id: 'site-2', name: 'Distribution Center B' },
    { id: 'site-3', name: 'Warehouse C' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Performance Trends & Alerts
          </h1>
          <p className="text-gray-600">
            Monitor compliance trends, forecasts, and performance alerts across your sites
          </p>
        </div>

        {/* Site Selector */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Site
          </label>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {mockSites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setSelectedTab('trends')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === 'trends'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📈 Trend Analysis & Forecasting
              </button>
              <button
                onClick={() => setSelectedTab('alerts')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === 'alerts'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🚨 Performance Alerts
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {selectedTab === 'trends' ? (
            <TrendAnalysis
              siteId={selectedSite}
              siteName={mockSites.find(s => s.id === selectedSite)?.name || ''}
              period="monthly"
            />
          ) : (
            <AlertDashboard
              siteId={selectedSite}
              userId={mockUser.id}
              userRole={mockUser.role}
            />
          )}
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            📊 Understanding Trends & Alerts
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>Trend Analysis:</strong> Uses statistical methods to identify patterns in compliance scores over time. 
              Linear regression, moving averages, and exponential smoothing provide different perspectives on performance trends.
            </p>
            <p>
              <strong>Forecasting:</strong> Predicts future compliance scores based on historical data. 
              Confidence intervals show the range of likely outcomes, with confidence decreasing for longer-term forecasts.
            </p>
            <p>
              <strong>Performance Alerts:</strong> Automatically generated when specific conditions are detected:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Critical Failures:</strong> Any audit with critical non-conformances</li>
              <li><strong>Declining Trends:</strong> Consistent downward performance patterns</li>
              <li><strong>Low Scores:</strong> Compliance scores below acceptable thresholds</li>
              <li><strong>High Volatility:</strong> Inconsistent performance indicating process issues</li>
            </ul>
            <p>
              <strong>Alert Actions:</strong> Managers can acknowledge alerts to indicate awareness and resolve them once corrective actions are complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
