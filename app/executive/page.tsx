'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  Users,
  Building2,
  FileText,
  BarChart3,
  Shield,
  Target,
  Clock,
  ArrowRight,
  Download,
  RefreshCw
} from 'lucide-react';

interface ComplianceMetric {
  category: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface SiteOverview {
  id: string;
  name: string;
  location: string;
  complianceScore: number;
  defectRate: number;
  lastAudit: Date;
  status: 'operational' | 'attention' | 'critical';
  activeIssues: number;
}

export default function ExecutiveDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock data - replace with actual API calls
  const overallMetrics = {
    complianceScore: 87.5,
    defectDetectionRate: 94.2,
    auditCompletion: 92.0,
    qualityIndex: 89.3,
  };

  const complianceMetrics: ComplianceMetric[] = [
    {
      category: 'ISO 9001 Compliance',
      score: 87.5,
      trend: 'up',
      change: 3.2,
      status: 'good',
    },
    {
      category: 'Defect Detection',
      score: 94.2,
      trend: 'up',
      change: 1.8,
      status: 'excellent',
    },
    {
      category: 'Audit Completion',
      score: 92.0,
      trend: 'stable',
      change: 0.5,
      status: 'excellent',
    },
    {
      category: 'Quality Standards',
      score: 89.3,
      trend: 'down',
      change: -2.1,
      status: 'good',
    },
  ];

  const sites: SiteOverview[] = [
    {
      id: '1',
      name: 'Manufacturing Plant A',
      location: 'Mumbai, India',
      complianceScore: 92.5,
      defectRate: 2.3,
      lastAudit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'operational',
      activeIssues: 2,
    },
    {
      id: '2',
      name: 'Manufacturing Plant B',
      location: 'Pune, India',
      complianceScore: 78.2,
      defectRate: 5.8,
      lastAudit: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      status: 'attention',
      activeIssues: 7,
    },
    {
      id: '3',
      name: 'Quality Control Center',
      location: 'Bangalore, India',
      complianceScore: 95.1,
      defectRate: 1.2,
      lastAudit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'operational',
      activeIssues: 0,
    },
  ];

  const recentAlerts = [
    {
      id: '1',
      type: 'compliance',
      severity: 'high',
      message: 'Plant B compliance score dropped below 80%',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      site: 'Manufacturing Plant B',
    },
    {
      id: '2',
      type: 'defect',
      severity: 'medium',
      message: 'Increased defect rate detected in production line 3',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      site: 'Manufacturing Plant A',
    },
    {
      id: '3',
      type: 'audit',
      severity: 'low',
      message: 'Scheduled audit due in 3 days',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      site: 'Manufacturing Plant B',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSiteStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'attention':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Executive Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive compliance and quality overview
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {overallMetrics.complianceScore}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              Overall Compliance
            </h3>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+3.2% from last period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">
                {overallMetrics.defectDetectionRate}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              Defect Detection Rate
            </h3>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+1.8% from last period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {overallMetrics.auditCompletion}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              Audit Completion
            </h3>
            <div className="flex items-center text-sm text-gray-600">
              <Activity className="h-4 w-4 mr-1" />
              <span>Stable</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-orange-600">
                {overallMetrics.qualityIndex}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              Quality Index
            </h3>
            <div className="flex items-center text-sm text-red-600">
              <TrendingDown className="h-4 w-4 mr-1" />
              <span>-2.1% from last period</span>
            </div>
          </div>
        </div>

        {/* Compliance Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Compliance Metrics
            </h2>
            <div className="space-y-4">
              {complianceMetrics.map((metric) => (
                <div
                  key={metric.category}
                  className={`p-4 rounded-lg border ${getStatusColor(metric.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{metric.category}</h3>
                    <span className="text-2xl font-bold">{metric.score}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      {metric.trend === 'up' && (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      )}
                      {metric.trend === 'down' && (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {metric.trend === 'stable' && (
                        <Activity className="h-4 w-4 mr-1" />
                      )}
                      <span>
                        {metric.change > 0 ? '+' : ''}
                        {metric.change}%
                      </span>
                    </div>
                    <span className="capitalize">{metric.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Alerts</h2>
              <Link
                href="/alerts"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        alert.severity === 'high'
                          ? 'bg-red-100'
                          : alert.severity === 'medium'
                          ? 'bg-yellow-100'
                          : 'bg-blue-100'
                      }`}
                    >
                      <AlertTriangle
                        className={`h-4 w-4 ${
                          alert.severity === 'high'
                            ? 'text-red-600'
                            : alert.severity === 'medium'
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {alert.message}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Building2 className="h-3 w-3 mr-1" />
                        <span>{alert.site}</span>
                        <span className="mx-2">•</span>
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatDate(alert.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Site Overview */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Site Overview</h2>
            <Link
              href="/sites"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              Manage Sites
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Site Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Location
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Compliance
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Defect Rate
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Last Audit
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site) => (
                  <tr
                    key={site.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{site.name}</div>
                      {site.activeIssues > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          {site.activeIssues} active issue
                          {site.activeIssues !== 1 ? 's' : ''}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-600">{site.location}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              site.complianceScore >= 90
                                ? 'bg-green-500'
                                : site.complianceScore >= 75
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${site.complianceScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {site.complianceScore}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-sm font-medium ${
                          site.defectRate < 3
                            ? 'text-green-600'
                            : site.defectRate < 5
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {site.defectRate}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {formatDate(site.lastAudit)}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getSiteStatusColor(
                          site.status
                        )}`}
                      >
                        {site.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Link
                        href={`/sites/${site.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/audit"
            className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ISO Audit System
            </h3>
            <p className="text-sm text-gray-600">
              Manage audits, compliance tracking, and reporting
            </p>
          </Link>

          <Link
            href="/dashboard"
            className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Defect Detection
            </h3>
            <p className="text-sm text-gray-600">
              AI-powered NDT defect detection and analysis
            </p>
          </Link>

          <Link
            href="/reports"
            className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analytics & Reports
            </h3>
            <p className="text-sm text-gray-600">
              Comprehensive analytics and executive reports
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
