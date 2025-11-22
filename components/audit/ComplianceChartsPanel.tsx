'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';

interface SiteBenchmark {
  siteId: string;
  siteName: string;
  currentScore: number;
  previousScore: number;
  trend: 'improving' | 'declining' | 'stable';
  ranking: number;
  criticalFailures: number;
}

interface PerformanceDistribution {
  excellent: number;
  good: number;
  acceptable: number;
  needsImprovement: number;
  distribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
}

interface ComplianceChartsPanelProps {
  sites: SiteBenchmark[];
  distribution: PerformanceDistribution;
  organizationAverage: number;
  industryAverage?: number;
}

export default function ComplianceChartsPanel({
  sites,
  distribution,
  organizationAverage,
  industryAverage
}: ComplianceChartsPanelProps) {
  const [activeChart, setActiveChart] = useState<'distribution' | 'ranking' | 'trends'>('distribution');

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Chart Type Selector */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveChart('distribution')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeChart === 'distribution'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <PieChartIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Distribution</span>
          </button>
          <button
            onClick={() => setActiveChart('ranking')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeChart === 'ranking'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm font-medium">Rankings</span>
          </button>
          <button
            onClick={() => setActiveChart('trends')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeChart === 'trends'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span className="text-sm font-medium">Trends</span>
          </button>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-6">
        {activeChart === 'distribution' && (
          <DistributionChart distribution={distribution} />
        )}
        {activeChart === 'ranking' && (
          <RankingChart 
            sites={sites} 
            organizationAverage={organizationAverage}
            industryAverage={industryAverage}
          />
        )}
        {activeChart === 'trends' && (
          <TrendsChart sites={sites} />
        )}
      </div>
    </div>
  );
}

// Distribution Pie Chart
function DistributionChart({ distribution }: { distribution: PerformanceDistribution }) {
  const total = distribution.excellent + distribution.good + 
                distribution.acceptable + distribution.needsImprovement;
  
  if (total === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  const segments = [
    { label: 'Excellent', count: distribution.excellent, color: '#10b981', percentage: (distribution.excellent / total) * 100 },
    { label: 'Good', count: distribution.good, color: '#3b82f6', percentage: (distribution.good / total) * 100 },
    { label: 'Acceptable', count: distribution.acceptable, color: '#f59e0b', percentage: (distribution.acceptable / total) * 100 },
    { label: 'Needs Improvement', count: distribution.needsImprovement, color: '#ef4444', percentage: (distribution.needsImprovement / total) * 100 }
  ].filter(s => s.count > 0);

  // Calculate pie chart segments
  let currentAngle = -90; // Start at top
  const radius = 100;
  const centerX = 150;
  const centerY = 150;

  const pieSegments = segments.map(segment => {
    const angle = (segment.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    const path = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    currentAngle = endAngle;
    
    return { ...segment, path };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Pie Chart */}
      <div className="flex items-center justify-center">
        <svg viewBox="0 0 300 300" className="w-full max-w-sm">
          {pieSegments.map((segment, index) => (
            <g key={index}>
              <path
                d={segment.path}
                fill={segment.color}
                stroke="white"
                strokeWidth="2"
              />
              <title>{segment.label}: {segment.count} sites ({segment.percentage.toFixed(1)}%)</title>
            </g>
          ))}
          {/* Center circle for donut effect */}
          <circle
            cx={centerX}
            cy={centerY}
            r={60}
            fill="white"
          />
          <text
            x={centerX}
            y={centerY - 10}
            textAnchor="middle"
            className="text-3xl font-bold fill-gray-900"
          >
            {total}
          </text>
          <text
            x={centerX}
            y={centerY + 15}
            textAnchor="middle"
            className="text-sm fill-gray-600"
          >
            Total Sites
          </text>
        </svg>
      </div>

      {/* Legend and Stats */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Distribution</h3>
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-gray-700">{segment.label}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {segment.count} sites
              </div>
              <div className="text-xs text-gray-500">
                {segment.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}

        {/* Key Insights */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Insights</h4>
          <div className="space-y-2">
            {distribution.excellent + distribution.good >= total * 0.7 ? (
              <div className="flex items-start space-x-2 text-sm text-green-700">
                <Award className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Strong overall performance - {((distribution.excellent + distribution.good) / total * 100).toFixed(0)}% meeting standards</span>
              </div>
            ) : (
              <div className="flex items-start space-x-2 text-sm text-yellow-700">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Improvement needed - only {((distribution.excellent + distribution.good) / total * 100).toFixed(0)}% meeting standards</span>
              </div>
            )}
            {distribution.needsImprovement > 0 && (
              <div className="flex items-start space-x-2 text-sm text-red-700">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{distribution.needsImprovement} site{distribution.needsImprovement > 1 ? 's' : ''} require immediate attention</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Ranking Bar Chart
function RankingChart({ 
  sites, 
  organizationAverage,
  industryAverage 
}: { 
  sites: SiteBenchmark[];
  organizationAverage: number;
  industryAverage?: number;
}) {
  const sortedSites = [...sites].sort((a, b) => b.currentScore - a.currentScore);
  const maxScore = 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Site Rankings by Score</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600">Site Score</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-green-500"></div>
            <span className="text-gray-600">Org Avg ({organizationAverage.toFixed(1)}%)</span>
          </div>
          {industryAverage && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-orange-500 border-dashed border-t-2"></div>
              <span className="text-gray-600">Industry ({industryAverage}%)</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedSites.map((site, index) => (
          <div key={site.siteId} className="relative">
            <div className="flex items-center space-x-3 mb-1">
              <span className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-50 text-gray-600'}
              `}>
                {index + 1}
              </span>
              <span className="text-sm font-medium text-gray-900 flex-1 truncate">
                {site.siteName}
              </span>
              <span className={`text-sm font-semibold ${
                site.currentScore >= 85 ? 'text-green-600' :
                site.currentScore >= 70 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {site.currentScore.toFixed(1)}%
              </span>
            </div>
            
            <div className="relative h-6 bg-gray-100 rounded-lg overflow-hidden ml-9">
              {/* Site score bar */}
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                  site.currentScore >= 85 ? 'bg-green-500' :
                  site.currentScore >= 70 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${(site.currentScore / maxScore) * 100}%` }}
              />
              
              {/* Organization average line */}
              <div
                className="absolute inset-y-0 w-0.5 bg-green-600 z-10"
                style={{ left: `${(organizationAverage / maxScore) * 100}%` }}
              />
              
              {/* Industry average line */}
              {industryAverage && (
                <div
                  className="absolute inset-y-0 w-0.5 bg-orange-500 z-10"
                  style={{ left: `${(industryAverage / maxScore) * 100}%` }}
                />
              )}
              
              {/* Critical failures indicator */}
              {site.criticalFailures > 0 && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-600 text-white rounded-full">
                    {site.criticalFailures} critical
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Trends Visualization
function TrendsChart({ sites }: { sites: SiteBenchmark[] }) {
  const improving = sites.filter(s => s.trend === 'improving');
  const declining = sites.filter(s => s.trend === 'declining');
  const stable = sites.filter(s => s.trend === 'stable');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>

      {/* Trend Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold text-green-700">{improving.length}</span>
          </div>
          <div className="text-sm text-green-700 font-medium">Improving</div>
          <div className="text-xs text-green-600 mt-1">
            {sites.length > 0 ? ((improving.length / sites.length) * 100).toFixed(0) : 0}% of sites
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-5 w-5 text-gray-600" />
            <span className="text-2xl font-bold text-gray-700">{stable.length}</span>
          </div>
          <div className="text-sm text-gray-700 font-medium">Stable</div>
          <div className="text-xs text-gray-600 mt-1">
            {sites.length > 0 ? ((stable.length / sites.length) * 100).toFixed(0) : 0}% of sites
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <span className="text-2xl font-bold text-red-700">{declining.length}</span>
          </div>
          <div className="text-sm text-red-700 font-medium">Declining</div>
          <div className="text-xs text-red-600 mt-1">
            {sites.length > 0 ? ((declining.length / sites.length) * 100).toFixed(0) : 0}% of sites
          </div>
        </div>
      </div>

      {/* Detailed Trend Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Improvers */}
        {improving.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>Top Improvers</span>
            </h4>
            <div className="space-y-2">
              {improving
                .sort((a, b) => (b.currentScore - b.previousScore) - (a.currentScore - a.previousScore))
                .slice(0, 5)
                .map(site => {
                  const delta = site.currentScore - site.previousScore;
                  return (
                    <div key={site.siteId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-900 font-medium">{site.siteName}</span>
                      <span className="text-sm text-green-700 font-semibold">
                        +{delta.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Needs Attention */}
        {declining.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span>Needs Attention</span>
            </h4>
            <div className="space-y-2">
              {declining
                .sort((a, b) => (a.currentScore - a.previousScore) - (b.currentScore - b.previousScore))
                .slice(0, 5)
                .map(site => {
                  const delta = site.currentScore - site.previousScore;
                  return (
                    <div key={site.siteId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm text-gray-900 font-medium">{site.siteName}</span>
                      <span className="text-sm text-red-700 font-semibold">
                        {delta.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
