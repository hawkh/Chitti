'use client';

import React, { useState, useEffect } from 'react';
import { 
  SiteBenchmark, 
  BenchmarkComparison,
  ImprovementRecommendation 
} from '@/lib/audit/benchmarking-service';

interface ComplianceBenchmarkingProps {
  organizationId?: string;
  timeframe?: {
    start: Date;
    end: Date;
  };
}

export default function ComplianceBenchmarking({ 
  organizationId,
  timeframe 
}: ComplianceBenchmarkingProps) {
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkComparison | null>(null);
  const [distribution, setDistribution] = useState<any>(null);
  const [bestPractices, setBestPractices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

  useEffect(() => {
    loadBenchmarkData();
  }, [organizationId, timeframe]);

  const loadBenchmarkData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from your database
      // For now, we'll use mock data
      const mockSitesData = generateMockSitesData();
      
      const response = await fetch('/api/audit/benchmarking/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sitesData: mockSitesData,
          industryAverage: 82.5
        })
      });

      if (response.ok) {
        const data = await response.json();
        setBenchmarkData(data.benchmarkComparison);
        setDistribution(data.distribution);
        setBestPractices(data.bestPractices);
      }
    } catch (error) {
      console.error('Error loading benchmark data:', error);
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
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!benchmarkData) {
    return (
      <div className="text-center p-8 text-gray-500">
        No benchmark data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Organization Average</div>
          <div className="text-2xl font-bold text-blue-600">
            {benchmarkData.organizationAverage.toFixed(1)}%
          </div>
        </div>
        
        {benchmarkData.industryAverage && (
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Industry Average</div>
            <div className="text-2xl font-bold text-gray-700">
              {benchmarkData.industryAverage.toFixed(1)}%
            </div>
          </div>
        )}
        
        {benchmarkData.bestPerformer && (
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Best Performer</div>
            <div className="text-lg font-bold text-green-600">
              {benchmarkData.bestPerformer.siteName}
            </div>
            <div className="text-sm text-gray-500">
              {benchmarkData.bestPerformer.currentScore.toFixed(1)}%
            </div>
          </div>
        )}
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Sites</div>
          <div className="text-2xl font-bold text-gray-700">
            {benchmarkData.sites.length}
          </div>
        </div>
      </div>

      {/* Performance Distribution */}
      {distribution && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Performance Distribution</h3>
          <div className="space-y-3">
            {distribution.distribution.map((item: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.range}</span>
                  <span className="font-medium">{item.count} sites ({item.percentage.toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Site Rankings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Site Rankings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Site</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Critical</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audits</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {benchmarkData.sites.map((site) => (
                <tr 
                  key={site.siteId}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedSite(site.siteId)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-gray-700">#{site.ranking}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{site.siteName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(site.currentScore)}`}>
                      {site.currentScore.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">{site.grade}</span>
                    <div className="text-xs text-gray-500">{site.gradeLabel}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getTrendColor(site.trend)}>
                      {getTrendIcon(site.trend)} {site.trend}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={site.delta >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {site.delta >= 0 ? '+' : ''}{site.delta.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {site.criticalFailures > 0 ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        {site.criticalFailures}
                      </span>
                    ) : (
                      <span className="text-green-600">✓</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {site.totalAudits}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Improvement Recommendations */}
      {benchmarkData.improvementOpportunities.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Improvement Recommendations</h3>
          <div className="space-y-4">
            {benchmarkData.improvementOpportunities.slice(0, 10).map((rec, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadge(rec.priority)}`}>
                        {rec.priority.toUpperCase()}
                      </span>
                      <span className="font-medium text-gray-900">{rec.siteName}</span>
                      <span className="text-sm text-gray-500">• {rec.category}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{rec.recommendation}</p>
                    <p className="text-xs text-gray-500">Expected Impact: {rec.expectedImpact}</p>
                    {rec.benchmarkReference && (
                      <p className="text-xs text-blue-600 mt-1">📊 {rec.benchmarkReference}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Practices */}
      {bestPractices.length > 0 && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">Best Practices from Top Performers</h3>
          <ul className="space-y-2">
            {bestPractices.map((practice, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-sm text-blue-900">{practice}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Mock data generator for demonstration
function generateMockSitesData() {
  return [
    {
      siteId: 'site1',
      siteName: 'Manufacturing Plant A',
      audits: [
        {
          id: 'audit1',
          auditDate: new Date('2024-10-15'),
          complianceScore: {
            overallScore: 92.5,
            sectionScores: {},
            passedItems: 23,
            failedItems: 2,
            naItems: 0,
            totalItems: 25,
            criticalFailures: 0,
            highSeverityCount: 1,
            mediumSeverityCount: 1,
            lowSeverityCount: 0,
            improvementAreas: [],
            calculatedAt: new Date()
          }
        },
        {
          id: 'audit2',
          auditDate: new Date('2024-09-15'),
          complianceScore: {
            overallScore: 88.0,
            sectionScores: {},
            passedItems: 22,
            failedItems: 3,
            naItems: 0,
            totalItems: 25,
            criticalFailures: 0,
            highSeverityCount: 2,
            mediumSeverityCount: 1,
            lowSeverityCount: 0,
            improvementAreas: [],
            calculatedAt: new Date()
          }
        }
      ]
    },
    {
      siteId: 'site2',
      siteName: 'Distribution Center B',
      audits: [
        {
          id: 'audit3',
          auditDate: new Date('2024-10-20'),
          complianceScore: {
            overallScore: 78.5,
            sectionScores: {},
            passedItems: 19,
            failedItems: 6,
            naItems: 0,
            totalItems: 25,
            criticalFailures: 1,
            highSeverityCount: 2,
            mediumSeverityCount: 3,
            lowSeverityCount: 0,
            improvementAreas: [],
            calculatedAt: new Date()
          }
        }
      ]
    },
    {
      siteId: 'site3',
      siteName: 'Warehouse C',
      audits: [
        {
          id: 'audit4',
          auditDate: new Date('2024-10-18'),
          complianceScore: {
            overallScore: 85.0,
            sectionScores: {},
            passedItems: 21,
            failedItems: 4,
            naItems: 0,
            totalItems: 25,
            criticalFailures: 0,
            highSeverityCount: 1,
            mediumSeverityCount: 3,
            lowSeverityCount: 0,
            improvementAreas: [],
            calculatedAt: new Date()
          }
        }
      ]
    }
  ];
}
