'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Play,
  CheckCircle,
  RotateCw,
  AlertTriangle,
  Award,
  Clock,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import {
  PDCAAnalyticsReport,
  PDCAStageDistribution,
  PDCACycleCompletionMetrics,
  PDCAImprovementRecommendation
} from '@/lib/audit/pdca-analytics';

interface PDCAAnalyticsDashboardProps {
  organizationId?: string;
  onExport?: () => void;
}

const STAGE_CONFIG = {
  plan: { icon: Target, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Plan' },
  do: { icon: Play, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Do' },
  check: { icon: CheckCircle, color: 'text-purple-600', bgColor: 'bg-purple-50', label: 'Check' },
  act: { icon: RotateCw, color: 'text-orange-600', bgColor: 'bg-orange-50', label: 'Act' }
};

export default function PDCAAnalyticsDashboard({
  organizationId,
  onExport
}: PDCAAnalyticsDashboardProps) {
  const [report, setReport] = useState<PDCAAnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'30' | '60' | '90' | '180'>('90');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchAnalytics();
  }, [organizationId, timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - parseInt(timeframe) * 24 * 60 * 60 * 1000);
      
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      if (organizationId) {
        params.append('organizationId', organizationId);
      }

      const response = await fetch(`/api/audit/pdca/analytics?${params}`);
      const data = await response.json();
      
      if (data.report) {
        setReport(data.report);
      }
    } catch (error) {
      console.error('Error fetching PDCA analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - parseInt(timeframe) * 24 * 60 * 60 * 1000);
      
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        format: 'export'
      });
      
      if (organizationId) {
        params.append('organizationId', organizationId);
      }

      const response = await fetch(`/api/audit/pdca/analytics?${params}`);
      const data = await response.json();
      
      // Create CSV
      const csv = convertToCSV(data);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pdca-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      
      if (onExport) onExport();
    } catch (error) {
      console.error('Error exporting analytics:', error);
    }
  };

  const convertToCSV = (data: any): string => {
    const lines: string[] = [];
    
    // Summary section
    lines.push('PDCA Analytics Summary');
    lines.push('');
    Object.entries(data.summary).forEach(([key, value]) => {
      lines.push(`${key},${value}`);
    });
    
    // Stage distribution
    lines.push('');
    lines.push('Stage Distribution');
    lines.push('Stage,Audit Count,Percentage,Average Score');
    data.stageData.forEach((row: any) => {
      lines.push(`${row.stage},${row.auditCount},${row.percentage},${row.averageComplianceScore}`);
    });
    
    // Recommendations
    lines.push('');
    lines.push('Improvement Recommendations');
    lines.push('Site,Priority,Category,Title,Description,Suggested Actions,Impact');
    data.recommendations.forEach((rec: any) => {
      lines.push(`"${rec.site}","${rec.priority}","${rec.category}","${rec.title}","${rec.description}","${rec.suggestedActions}","${rec.impact}"`);
    });
    
    return lines.join('\n');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  const filteredRecommendations = selectedCategory === 'all'
    ? report.recommendations
    : report.recommendations.filter(r => r.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">PDCA Analytics Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">
              Comprehensive analysis of PDCA methodology implementation
            </p>
          </div>
          
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div className="flex space-x-2">
            {(['30', '60', '90', '180'] as const).map(days => (
              <button
                key={days}
                onClick={() => setTimeframe(days)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${timeframe === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Cycle Completion Rate"
          value={`${report.cycleMetrics.completionRate}%`}
          trend={report.trends.cycleCompletionTrend}
          icon={Award}
          color="blue"
        />
        
        <MetricCard
          title="Average Cycle Duration"
          value={`${report.cycleMetrics.averageCycleDuration} days`}
          icon={Clock}
          color="green"
        />
        
        <MetricCard
          title="Sites with Complete Cycles"
          value={`${report.cycleMetrics.sitesWithCompleteCycles}/${report.cycleMetrics.totalSites}`}
          icon={CheckCircle}
          color="purple"
        />
        
        <MetricCard
          title="Stage Balance"
          value={report.trends.stageBalanceTrend === 'balanced' ? 'Balanced' : 'Imbalanced'}
          trend={report.trends.stageBalanceTrend === 'balanced' ? 'stable' : 'declining'}
          icon={BarChart3}
          color="orange"
        />
      </div>

      {/* Stage Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">PDCA Stage Distribution</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {report.stageDistribution.map(dist => {
            const config = STAGE_CONFIG[dist.stage];
            const Icon = config.icon;
            
            return (
              <div key={dist.stage} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <span className="font-semibold text-gray-900">{config.label}</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{dist.count}</span>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Distribution</span>
                    <span className="font-medium">{dist.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${config.bgColor.replace('50', '500')}`}
                      style={{ width: `${dist.percentage}%` }}
                    />
                  </div>
                </div>
                
                {dist.averageScore > 0 && (
                  <div className="text-sm">
                    <span className="text-gray-600">Avg Score: </span>
                    <span className={`font-semibold ${
                      dist.averageScore >= 90 ? 'text-green-600' :
                      dist.averageScore >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {dist.averageScore}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Visual Distribution Bar */}
        <div className="space-y-2">
          <div className="text-sm text-gray-600">Overall Distribution</div>
          <div className="flex h-8 rounded-lg overflow-hidden">
            {report.stageDistribution.map(dist => {
              const config = STAGE_CONFIG[dist.stage];
              return (
                <div
                  key={dist.stage}
                  className={`${config.bgColor.replace('50', '500')} flex items-center justify-center text-white text-xs font-medium`}
                  style={{ width: `${dist.percentage}%` }}
                  title={`${config.label}: ${dist.percentage}%`}
                >
                  {dist.percentage > 10 && `${dist.percentage}%`}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cycle Completion Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Cycle Completion Metrics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {report.cycleMetrics.sitesWithCompleteCycles}
            </div>
            <div className="text-sm text-gray-600">Complete Cycles</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {report.cycleMetrics.sitesInProgress}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-600 mb-2">
              {report.cycleMetrics.sitesNotStarted}
            </div>
            <div className="text-sm text-gray-600">Not Started</div>
          </div>
        </div>

        {/* Fastest and Slowest Cycles */}
        {(report.cycleMetrics.fastestCycle || report.cycleMetrics.slowestCycle) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.cycleMetrics.fastestCycle && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Fastest Cycle</span>
                </div>
                <div className="text-sm text-gray-700">
                  {report.cycleMetrics.fastestCycle.siteName}
                </div>
                <div className="text-2xl font-bold text-blue-600 mt-2">
                  {report.cycleMetrics.fastestCycle.duration} days
                </div>
              </div>
            )}
            
            {report.cycleMetrics.slowestCycle && (
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold text-gray-900">Slowest Cycle</span>
                </div>
                <div className="text-sm text-gray-700">
                  {report.cycleMetrics.slowestCycle.siteName}
                </div>
                <div className="text-2xl font-bold text-orange-600 mt-2">
                  {report.cycleMetrics.slowestCycle.duration} days
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Improvement Recommendations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Improvement Recommendations</h3>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Categories</option>
              <option value="cycle_completion">Cycle Completion</option>
              <option value="stage_balance">Stage Balance</option>
              <option value="performance">Performance</option>
              <option value="consistency">Consistency</option>
            </select>
          </div>
        </div>

        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">No recommendations - excellent PDCA implementation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecommendations.map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  color
}: {
  title: string;
  value: string;
  trend?: 'improving' | 'declining' | 'stable';
  icon: any;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="h-6 w-6" />
        </div>
        
        {trend && (
          <div className="flex items-center space-x-1">
            {trend === 'improving' && <TrendingUp className="h-4 w-4 text-green-600" />}
            {trend === 'declining' && <TrendingDown className="h-4 w-4 text-red-600" />}
            {trend === 'stable' && <Minus className="h-4 w-4 text-gray-600" />}
          </div>
        )}
      </div>
      
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}

// Recommendation Card Component
function RecommendationCard({ recommendation }: { recommendation: PDCAImprovementRecommendation }) {
  const priorityColors = {
    high: 'border-red-500 bg-red-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-blue-500 bg-blue-50'
  };

  const priorityBadgeColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-blue-100 text-blue-700'
  };

  return (
    <div className={`border-l-4 ${priorityColors[recommendation.priority]} rounded-lg p-4`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${priorityBadgeColors[recommendation.priority]}`}>
              {recommendation.priority.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-2">{recommendation.siteName}</p>
          <p className="text-sm text-gray-600">{recommendation.description}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-900">Suggested Actions:</div>
        <ul className="space-y-1">
          {recommendation.suggestedActions.map((action, idx) => (
            <li key={idx} className="text-sm text-gray-700 flex items-start space-x-2">
              <span className="text-gray-400 mt-1">•</span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          <span className="font-medium">Impact:</span> {recommendation.impact}
        </div>
      </div>
    </div>
  );
}
