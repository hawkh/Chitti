'use client';

import React, { useState } from 'react';
import ComplianceBenchmarking from '@/components/audit/ComplianceBenchmarking';
import TrendAnalysis from '@/components/audit/TrendAnalysis';

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<'benchmarking' | 'trends'>('benchmarking');
  const [selectedSite, setSelectedSite] = useState<string>('site1');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Compliance Analytics & Benchmarking
          </h1>
          <p className="text-gray-600">
            Track compliance scores, compare site performance, and analyze trends
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('benchmarking')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'benchmarking'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Site Benchmarking
              </button>
              <button
                onClick={() => setActiveTab('trends')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'trends'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📈 Trend Analysis
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'benchmarking' && (
            <ComplianceBenchmarking organizationId="org1" />
          )}

          {activeTab === 'trends' && (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Site for Trend Analysis
                </label>
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="site1">Manufacturing Plant A</option>
                  <option value="site2">Distribution Center B</option>
                  <option value="site3">Warehouse C</option>
                </select>
              </div>
              <TrendAnalysis 
                siteId={selectedSite} 
                siteName={
                  selectedSite === 'site1' ? 'Manufacturing Plant A' :
                  selectedSite === 'site2' ? 'Distribution Center B' :
                  'Warehouse C'
                }
                period="monthly"
              />
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            ℹ️ About Compliance Scoring
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Scores are calculated using weighted algorithms based on ISO 9001 clause importance</li>
            <li>• Benchmarking compares site performance and identifies improvement opportunities</li>
            <li>• Trend analysis uses statistical methods to forecast future performance</li>
            <li>• Critical failures are flagged for immediate attention regardless of overall score</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
