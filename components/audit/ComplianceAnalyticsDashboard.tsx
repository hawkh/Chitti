'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import ComplianceBenchmarking from './ComplianceBenchmarking';
import TrendAnalysis from './TrendAnalysis';
import ComplianceChartsPanel from './ComplianceChartsPanel';

interface ComplianceAnalyticsDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface SiteBenchmark {
  siteId: string;
  siteName: string;
  location: string;
  currentScore: number;
  previousScore: number;
  trend: 'improving' | 'declining' | 'stable';
  totalAudits: number;
  lastAuditDate: string;
  criticalIssues: number;
  criticalFailures: number;
  ranking: number;
}

interface TrendData {
  date: string;
  score: number;
  auditsCount: number;
}

interface AnalyticsData {
  siteBenchmarks: SiteBenchmark[];
  overallTrend: TrendData[];
  industryAverage?: number;
  topPerformers: SiteBenchmark[];
  needsAttention: SiteBenchmark[];
  distribution?: {
    excellent: number;
    good: number;
    acceptable: number;
    needsImprovement: number;
  };
}

export default function ComplianceAnalyticsDashboard({ user }: ComplianceAnalyticsDashboardProps) {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'benchmarking' | 'trends'>('overview');

  useEffect(() => {
    loadAnalytics();
  }, [timeframe, selectedSite]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('audit_token');

      const response = await fetch(
        `/api/audit/manager/analytics?timeframe=${timeframe}&siteId=${selectedSite}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    alert('Export functionality coming soon');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/audit/manager/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Compliance Analytics</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Site performance and trend analysis
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Overview
              </button>
              <button
                onClick={() => setActiveTab('benchmarking')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'benchmarking'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🏆 Site Benchmarking
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

        {/* Filters - Only show for overview tab */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
              </select>

              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Sites</option>
                {analytics.siteBenchmarks.map(site => (
                  <option key={site.siteId} value={site.siteId}>
                    {site.siteName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'benchmarking' && (
          <ComplianceBenchmarking organizationId="org1" />
        )}

        {activeTab === 'trends' && (
          <div>
            <div className="mb-6 bg-white rounded-lg shadow-md p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Site for Trend Analysis
              </label>
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Select a site...</option>
                {analytics.siteBenchmarks.map(site => (
                  <option key={site.siteId} value={site.siteId}>
                    {site.siteName}
                  </option>
                ))}
              </select>
            </div>
            {selectedSite !== 'all' && (
              <TrendAnalysis 
                siteId={selectedSite} 
                siteName={analytics.siteBenchmarks.find(s => s.siteId === selectedSite)?.siteName || 'Site'}
                period="monthly"
              />
            )}
          </div>
        )}

        {/* Overview Cards - Only show for overview tab */}
        {activeTab === 'overview' && (
          <>
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <OverviewCard
            title="Average Score"
            value={`${Math.round(
              analytics.siteBenchmarks.reduce((sum, s) => sum + s.currentScore, 0) /
              analytics.siteBenchmarks.length
            )}%`}
            icon={<BarChart3 className="h-6 w-6" />}
            color="blue"
          />
          <OverviewCard
            title="Total Sites"
            value={analytics.siteBenchmarks.length}
            icon={<Building2 className="h-6 w-6" />}
            color="green"
          />
          <OverviewCard
            title="Top Performer"
            value={analytics.topPerformers[0]?.siteName || 'N/A'}
            subtitle={`${analytics.topPerformers[0]?.currentScore || 0}%`}
            icon={<TrendingUp className="h-6 w-6" />}
            color="purple"
          />
          <OverviewCard
            title="Needs Attention"
            value={analytics.needsAttention.length}
            subtitle="Sites below 70%"
            icon={<TrendingDown className="h-6 w-6" />}
            color="red"
          />
        </div>

        {/* Top Performers */}
        {analytics.topPerformers.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.topPerformers.slice(0, 3).map((site, index) => (
                <TopPerformerCard key={site.siteId} site={site} rank={index + 1} />
              ))}
            </div>
          </div>
        )}

        {/* Site Benchmarks Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Site Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Audits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Critical Issues
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Audit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.siteBenchmarks.map((site) => (
                  <tr key={site.siteId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                          ${site.ranking === 1 ? 'bg-yellow-100 text-yellow-800' :
                            site.ranking === 2 ? 'bg-gray-100 text-gray-800' :
                            site.ranking === 3 ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-50 text-gray-600'}
                        `}>
                          {site.ranking}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{site.siteName}</div>
                        <div className="text-xs text-gray-500">{site.location}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className={`h-2 rounded-full ${
                              site.currentScore >= 85 ? 'bg-green-600' :
                              site.currentScore >= 70 ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${site.currentScore}%` }}
                          />
                        </div>
                        <span className={`text-sm font-semibold ${
                          site.currentScore >= 85 ? 'text-green-600' :
                          site.currentScore >= 70 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {site.currentScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TrendIndicator
                        trend={site.trend}
                        previousScore={site.previousScore}
                        currentScore={site.currentScore}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {site.totalAudits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {site.criticalIssues > 0 ? (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          {site.criticalIssues}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(site.lastAuditDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive Charts Panel */}
        <ComplianceChartsPanel
          sites={analytics.siteBenchmarks}
          distribution={{
            excellent: analytics.siteBenchmarks.filter(s => s.currentScore >= 90).length,
            good: analytics.siteBenchmarks.filter(s => s.currentScore >= 80 && s.currentScore < 90).length,
            acceptable: analytics.siteBenchmarks.filter(s => s.currentScore >= 70 && s.currentScore < 80).length,
            needsImprovement: analytics.siteBenchmarks.filter(s => s.currentScore < 70).length,
            distribution: []
          }}
          organizationAverage={
            analytics.siteBenchmarks.length > 0
              ? analytics.siteBenchmarks.reduce((sum, s) => sum + s.currentScore, 0) / analytics.siteBenchmarks.length
              : 0
          }
          industryAverage={analytics.industryAverage}
        />

        {/* Compliance Score Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h2>
          <ScoreDistributionChart sites={analytics.siteBenchmarks} />
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance Trend Over Time</h2>
          <TrendChart data={analytics.overallTrend} industryAverage={analytics.industryAverage} />
        </div>
        </>
        )}
      </div>
    </div>
  );
}

// Overview Card Component
interface OverviewCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'red';
}

function OverviewCard({ title, value, subtitle, icon, color }: OverviewCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600 mt-1">{title}</div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      )}
    </div>
  );
}

// Top Performer Card Component
function TopPerformerCard({ site, rank }: { site: SiteBenchmark; rank: number }) {
  const medalColors = {
    1: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    2: 'bg-gray-100 text-gray-800 border-gray-300',
    3: 'bg-orange-100 text-orange-800 border-orange-300'
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${medalColors[rank as keyof typeof medalColors]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold">#{rank}</span>
        <span className="text-2xl font-bold">{site.currentScore}%</span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{site.siteName}</h3>
      <p className="text-xs text-gray-600">{site.location}</p>
      <div className="mt-3 pt-3 border-t border-current border-opacity-20">
        <div className="flex items-center justify-between text-xs">
          <span>{site.totalAudits} audits</span>
          <TrendIndicator
            trend={site.trend}
            previousScore={site.previousScore}
            currentScore={site.currentScore}
            compact
          />
        </div>
      </div>
    </div>
  );
}

// Trend Indicator Component
function TrendIndicator({
  trend,
  previousScore,
  currentScore,
  compact = false
}: {
  trend: 'improving' | 'declining' | 'stable';
  previousScore: number;
  currentScore: number;
  compact?: boolean;
}) {
  const delta = currentScore - previousScore;
  const Icon = trend === 'improving' ? TrendingUp :
               trend === 'declining' ? TrendingDown :
               Minus;

  const colorClass = trend === 'improving' ? 'text-green-600' :
                     trend === 'declining' ? 'text-red-600' :
                     'text-gray-600';

  return (
    <div className={`flex items-center space-x-1 ${colorClass}`}>
      <Icon className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
      {!compact && (
        <span className="text-sm font-medium">
          {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
        </span>
      )}
    </div>
  );
}

// Score Distribution Chart Component
function ScoreDistributionChart({ sites }: { sites: SiteBenchmark[] }) {
  const excellent = sites.filter(s => s.currentScore >= 90).length;
  const good = sites.filter(s => s.currentScore >= 80 && s.currentScore < 90).length;
  const acceptable = sites.filter(s => s.currentScore >= 70 && s.currentScore < 80).length;
  const needsImprovement = sites.filter(s => s.currentScore < 70).length;
  
  const total = sites.length;
  const maxCount = Math.max(excellent, good, acceptable, needsImprovement);
  
  const categories = [
    { label: 'Excellent (90-100%)', count: excellent, color: 'bg-green-500', textColor: 'text-green-700' },
    { label: 'Good (80-89%)', count: good, color: 'bg-blue-500', textColor: 'text-blue-700' },
    { label: 'Acceptable (70-79%)', count: acceptable, color: 'bg-yellow-500', textColor: 'text-yellow-700' },
    { label: 'Needs Improvement (<70%)', count: needsImprovement, color: 'bg-red-500', textColor: 'text-red-700' }
  ];
  
  return (
    <div className="space-y-4">
      {categories.map((category, index) => {
        const percentage = total > 0 ? (category.count / total) * 100 : 0;
        const barWidth = maxCount > 0 ? (category.count / maxCount) * 100 : 0;
        
        return (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className={`font-medium ${category.textColor}`}>{category.label}</span>
              <span className="text-gray-600">
                {category.count} sites ({percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 ${category.color} transition-all duration-500 flex items-center justify-end pr-3`}
                style={{ width: `${barWidth}%` }}
              >
                {category.count > 0 && (
                  <span className="text-white text-sm font-semibold">{category.count}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{total}</div>
          <div className="text-sm text-gray-600">Total Sites</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {total > 0 ? ((excellent + good) / total * 100).toFixed(1) : 0}%
          </div>
          <div className="text-sm text-gray-600">Meeting Standards</div>
        </div>
      </div>
    </div>
  );
}

// Trend Chart Component
function TrendChart({ 
  data, 
  industryAverage 
}: { 
  data: TrendData[]; 
  industryAverage?: number;
}) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No trend data available
      </div>
    );
  }
  
  const chartHeight = 300;
  const chartWidth = 800;
  const padding = { top: 20, right: 40, bottom: 60, left: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  
  // Find min and max scores for scaling
  const scores = data.map(d => d.score).filter(s => s > 0);
  const minScore = Math.min(...scores, industryAverage || 100);
  const maxScore = Math.max(...scores, industryAverage || 0);
  const scoreRange = maxScore - minScore;
  const yMin = Math.max(0, minScore - scoreRange * 0.1);
  const yMax = Math.min(100, maxScore + scoreRange * 0.1);
  
  // Scale functions
  const xScale = (index: number) => (index / (data.length - 1)) * innerWidth;
  const yScale = (score: number) => innerHeight - ((score - yMin) / (yMax - yMin)) * innerHeight;
  
  // Generate path for line chart
  const linePath = data
    .map((d, i) => {
      const x = xScale(i);
      const y = yScale(d.score);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  
  // Generate area path
  const areaPath = `${linePath} L ${xScale(data.length - 1)} ${innerHeight} L 0 ${innerHeight} Z`;
  
  // Y-axis ticks
  const yTicks = [yMin, (yMin + yMax) / 2, yMax];
  
  return (
    <div className="overflow-x-auto">
      <svg 
        viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
        className="w-full"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={0}
                y1={yScale(tick)}
                x2={innerWidth}
                y2={yScale(tick)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={-10}
                y={yScale(tick)}
                textAnchor="end"
                alignmentBaseline="middle"
                className="text-xs fill-gray-600"
              >
                {tick.toFixed(0)}%
              </text>
            </g>
          ))}
          
          {/* Industry average line */}
          {industryAverage && (
            <g>
              <line
                x1={0}
                y1={yScale(industryAverage)}
                x2={innerWidth}
                y2={yScale(industryAverage)}
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <text
                x={innerWidth + 5}
                y={yScale(industryAverage)}
                alignmentBaseline="middle"
                className="text-xs fill-orange-600 font-medium"
              >
                Industry
              </text>
            </g>
          )}
          
          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#gradient)"
            opacity="0.3"
          />
          
          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {data.map((d, i) => (
            <g key={i}>
              <circle
                cx={xScale(i)}
                cy={yScale(d.score)}
                r="5"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
              />
              {/* Tooltip on hover */}
              <title>
                {new Date(d.date).toLocaleDateString()}: {d.score.toFixed(1)}% ({d.auditsCount} audits)
              </title>
            </g>
          ))}
          
          {/* X-axis labels */}
          {data.map((d, i) => {
            // Show every nth label to avoid crowding
            const showLabel = i % Math.ceil(data.length / 6) === 0 || i === data.length - 1;
            if (!showLabel) return null;
            
            return (
              <text
                key={i}
                x={xScale(i)}
                y={innerHeight + 20}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            );
          })}
          
          {/* Axis labels */}
          <text
            x={innerWidth / 2}
            y={innerHeight + 50}
            textAnchor="middle"
            className="text-sm fill-gray-700 font-medium"
          >
            Date
          </text>
          
          <text
            x={-innerHeight / 2}
            y={-45}
            textAnchor="middle"
            transform={`rotate(-90, -${innerHeight / 2}, -45)`}
            className="text-sm fill-gray-700 font-medium"
          >
            Compliance Score (%)
          </text>
        </g>
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-blue-500"></div>
          <span className="text-sm text-gray-600">Organization Average</span>
        </div>
        {industryAverage && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-orange-500 border-dashed border-t-2 border-orange-500"></div>
            <span className="text-sm text-gray-600">Industry Average ({industryAverage}%)</span>
          </div>
        )}
      </div>
    </div>
  );
}
