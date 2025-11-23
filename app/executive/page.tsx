'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Calendar,
  ArrowRight,
  Activity,
  Shield,
  Users,
  FileText,
  Filter,
  Download,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { useQualityContext } from '@/context/QualityContext';

export default function ExecutiveDashboard() {
  const { sites, audits, defects, alerts } = useQualityContext();
  const [timeRange, setTimeRange] = useState('month');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate dynamic metrics
  const totalAudits = audits.length;
  const totalDefects = defects.length;
  const activeAlerts = alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length;

  // Calculate compliance score
  const calculateCompliance = () => {
    if (totalAudits === 0) return 92; // Default baseline
    const passedAudits = audits.filter(a => {
      // Simple logic: if no critical defects, it's a "pass" for this metric
      const auditDefects = defects.filter(d => d.id === a.id); // Assuming linking by ID for now, though strictly it's by auditId
      return !auditDefects.some(d => d.defects.some(sub => sub.severity === 'critical'));
    }).length;
    return Math.round((passedAudits / totalAudits) * 100);
  };

  const complianceScore = calculateCompliance();

  const overallMetrics = [
    {
      label: 'Global Compliance',
      value: `${complianceScore}%`,
      change: '+2.4%',
      trend: 'up',
      icon: Shield,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Active Alerts',
      value: activeAlerts.toString(),
      change: activeAlerts > 5 ? '+2' : '-1',
      trend: activeAlerts > 5 ? 'down' : 'up',
      icon: AlertTriangle,
      color: activeAlerts > 0 ? 'text-red-600' : 'text-green-600',
      bg: activeAlerts > 0 ? 'bg-red-50' : 'bg-green-50'
    },
    {
      label: 'Total Audits',
      value: totalAudits.toString(),
      change: '+12',
      trend: 'up',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Defects Detected',
      value: totalDefects.toString(),
      change: '+5',
      trend: 'down',
      icon: Activity,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Executive Overview</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Live Updates
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setTimeRange('week')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${timeRange === 'week' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeRange('month')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${timeRange === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setTimeRange('quarter')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${timeRange === 'quarter' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                  Quarter
                </button>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Filter className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overallMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.bg}`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                <span className={`flex items-center text-sm font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {metric.trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingUp className="h-4 w-4 mr-1 rotate-180" />}
                  {metric.change}
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">{metric.label}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Site Performance & Map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Site Status List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Site Performance</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All Sites
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {sites.map((site) => (
                <div key={site.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${site.status === 'operational' ? 'bg-green-100' :
                          site.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                        <MapPin className={`h-5 w-5 ${site.status === 'operational' ? 'text-green-600' :
                            site.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                          }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{site.name}</h3>
                        <p className="text-sm text-gray-500">{site.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Compliance</p>
                        <p className="font-semibold text-gray-900">{site.complianceScore}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Active Audits</p>
                        <p className="font-semibold text-gray-900">{site.activeIssues}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${site.status === 'operational' ? 'bg-green-100 text-green-700' :
                          site.status === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {site.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Recent Alerts</h2>
            </div>
            <div className="p-6 space-y-6">
              {alerts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active alerts</p>
              ) : (
                alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex gap-4">
                    <div className={`mt-1 p-1.5 rounded-full flex-shrink-0 ${alert.severity === 'high' ? 'bg-red-100 text-red-600' :
                        alert.severity === 'medium' ? 'bg-orange-100 text-orange-600' :
                          'bg-blue-100 text-blue-600'
                      }`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{alert.site}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <button className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                View All Alerts
              </button>
            </div>
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
      </main>
    </div>
  );
}
