'use client';

/**
 * System Health Dashboard Component
 * Task 11.3: System monitoring and analytics display
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Database,
  Server,
  HardDrive,
  Users,
  FileText,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  metrics: {
    avgResponseTime: number;
    errorRate: number;
    activeUsers: number;
    pendingAudits: number;
    systemLoad: number;
  };
  components: {
    database: ComponentHealth;
    api: ComponentHealth;
    fileStorage: ComponentHealth;
  };
  timestamp: Date;
}

interface ComponentHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: Date;
  errorCount: number;
}

interface RealTimeMetrics {
  requestsPerMinute: number;
  avgResponseTime: number;
  errorRate: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
}

interface ErrorStats {
  total: number;
  resolved: number;
  unresolved: number;
  criticalCount: number;
}

export default function SystemHealthDashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [errorStats, setErrorStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchSystemHealth();

    if (autoRefresh) {
      const interval = setInterval(fetchSystemHealth, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch('/api/audit/system/health');
      const result = await response.json();

      if (result.success) {
        setHealth(result.data.health);
        setRealTimeMetrics(result.data.realTimeMetrics);
        setErrorStats(result.data.errorStats);
      }
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return <CheckCircle className="w-5 h-5" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5" />;
      case 'critical':
      case 'down':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load system health data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Health Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {new Date(health.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            Auto-refresh
          </label>
          <button
            onClick={fetchSystemHealth}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`p-6 rounded-lg border-2 ${getStatusColor(health.status)}`}>
        <div className="flex items-center gap-3">
          {getStatusIcon(health.status)}
          <div>
            <h3 className="text-lg font-semibold capitalize">{health.status}</h3>
            <p className="text-sm">System Uptime: {formatUptime(health.uptime)}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-700">Avg Response Time</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {health.metrics.avgResponseTime.toFixed(0)}ms
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h4 className="font-semibold text-gray-700">Error Rate</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {health.metrics.errorRate.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-700">Active Users</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900">{health.metrics.activeUsers}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-700">Pending Audits</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900">{health.metrics.pendingAudits}</p>
        </div>
      </div>

      {/* Component Health */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Component Health</h3>
        </div>
        <div className="divide-y divide-gray-200">
          <ComponentHealthRow
            name="Database"
            icon={<Database className="w-5 h-5" />}
            health={health.components.database}
          />
          <ComponentHealthRow
            name="API Server"
            icon={<Server className="w-5 h-5" />}
            health={health.components.api}
          />
          <ComponentHealthRow
            name="File Storage"
            icon={<HardDrive className="w-5 h-5" />}
            health={health.components.fileStorage}
          />
        </div>
      </div>

      {/* Real-Time Metrics */}
      {realTimeMetrics && (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Real-Time Metrics (Last 5 Minutes)</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Requests/Minute</p>
              <p className="text-2xl font-bold text-gray-900">
                {realTimeMetrics.requestsPerMinute.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Successful Requests</p>
              <p className="text-2xl font-bold text-green-600">
                {realTimeMetrics.successfulRequests}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Failed Requests</p>
              <p className="text-2xl font-bold text-red-600">
                {realTimeMetrics.failedRequests}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Statistics */}
      {errorStats && (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Error Statistics</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Errors</p>
              <p className="text-2xl font-bold text-gray-900">{errorStats.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{errorStats.resolved}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Unresolved</p>
              <p className="text-2xl font-bold text-yellow-600">{errorStats.unresolved}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Critical</p>
              <p className="text-2xl font-bold text-red-600">{errorStats.criticalCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* System Load */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">System Load</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    health.metrics.systemLoad > 80
                      ? 'bg-red-600'
                      : health.metrics.systemLoad > 60
                      ? 'bg-yellow-600'
                      : 'bg-green-600'
                  }`}
                  style={{ width: `${health.metrics.systemLoad}%` }}
                ></div>
              </div>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {health.metrics.systemLoad}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComponentHealthRow({
  name,
  icon,
  health,
}: {
  name: string;
  icon: React.ReactNode;
  health: ComponentHealth;
}) {
  const statusColor = health.status === 'up' ? 'text-green-600' : health.status === 'degraded' ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="p-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={statusColor}>{icon}</div>
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-500">
            Last check: {new Date(health.lastCheck).toLocaleTimeString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        {health.responseTime !== undefined && (
          <div className="text-right">
            <p className="text-sm text-gray-500">Response Time</p>
            <p className="font-semibold text-gray-900">{health.responseTime.toFixed(0)}ms</p>
          </div>
        )}
        <div className="text-right">
          <p className="text-sm text-gray-500">Errors</p>
          <p className="font-semibold text-gray-900">{health.errorCount}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
          health.status === 'up' ? 'bg-green-100 text-green-800' :
          health.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {health.status}
        </div>
      </div>
    </div>
  );
}
