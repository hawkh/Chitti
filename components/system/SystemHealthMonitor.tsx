'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Database, 
  HardDrive,
  Wifi,
  Zap
} from 'lucide-react';

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  services: {
    api: 'online' | 'offline' | 'degraded';
    ai_models: 'loaded' | 'loading' | 'error';
    processing_queue: 'active' | 'paused' | 'error';
    database: 'connected' | 'disconnected' | 'slow';
  };
  metrics: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    active_jobs: number;
    queue_length: number;
    avg_processing_time: number;
  };
  uptime: number;
  last_check: Date;
}

export const SystemHealthMonitor: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkSystemHealth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check API health
      const apiResponse = await fetch('/api/models/health');
      const apiHealth = await apiResponse.json();

      // Check queue status
      const queueResponse = await fetch('/api/processing/queue');
      const queueHealth = await queueResponse.json();

      // Mock system metrics (in production, these would come from monitoring services)
      const mockHealth: SystemHealth = {
        overall: apiHealth.success && queueHealth.success ? 'healthy' : 'warning',
        services: {
          api: apiResponse.ok ? 'online' : 'offline',
          ai_models: apiHealth.data?.models?.loaded > 0 ? 'loaded' : 'loading',
          processing_queue: queueHealth.success ? 'active' : 'error',
          database: 'connected' // Mock status
        },
        metrics: {
          cpu_usage: Math.random() * 60 + 20, // Mock 20-80%
          memory_usage: Math.random() * 40 + 30, // Mock 30-70%
          disk_usage: Math.random() * 20 + 40, // Mock 40-60%
          active_jobs: queueHealth.data?.stats?.processingJobs || 0,
          queue_length: queueHealth.data?.stats?.queuedJobs || 0,
          avg_processing_time: 2500 + Math.random() * 1000 // Mock 2.5-3.5s
        },
        uptime: Date.now() - (Date.now() - Math.random() * 86400000), // Mock uptime
        last_check: new Date()
      };

      setHealth(mockHealth);
    } catch (error) {
      console.error('Health check failed:', error);
      setError('Failed to check system health');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'loaded':
      case 'active':
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'degraded':
      case 'loading':
      case 'paused':
      case 'slow':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'offline':
      case 'error':
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'loaded':
      case 'active':
      case 'connected':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
      case 'degraded':
      case 'loading':
      case 'paused':
      case 'slow':
        return <Clock className="h-4 w-4" />;
      case 'critical':
      case 'offline':
      case 'error':
      case 'disconnected':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (isLoading && !health) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="flex items-center gap-2 text-red-600 mb-4">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">System Health Check Failed</h3>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={checkSystemHealth}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!health) return null;

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getStatusColor(health.overall)}`}>
              {getStatusIcon(health.overall)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
              <p className="text-sm text-gray-600">
                Last checked: {health.last_check.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.overall)}`}>
              {health.overall.toUpperCase()}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Uptime: {formatUptime(health.uptime)}
            </div>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="p-6 border-b border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-4">Services</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-sm font-medium">API</div>
              <div className={`text-xs px-2 py-1 rounded ${getStatusColor(health.services.api)}`}>
                {health.services.api}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-sm font-medium">AI Models</div>
              <div className={`text-xs px-2 py-1 rounded ${getStatusColor(health.services.ai_models)}`}>
                {health.services.ai_models}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-sm font-medium">Queue</div>
              <div className={`text-xs px-2 py-1 rounded ${getStatusColor(health.services.processing_queue)}`}>
                {health.services.processing_queue}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-sm font-medium">Database</div>
              <div className={`text-xs px-2 py-1 rounded ${getStatusColor(health.services.database)}`}>
                {health.services.database}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">System Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Resource Usage */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">Resource Usage</h5>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-600">CPU</span>
                  </div>
                  <span className="text-xs font-medium">{health.metrics.cpu_usage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      health.metrics.cpu_usage > 80 ? 'bg-red-500' :
                      health.metrics.cpu_usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${health.metrics.cpu_usage}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-600">Memory</span>
                  </div>
                  <span className="text-xs font-medium">{health.metrics.memory_usage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      health.metrics.memory_usage > 80 ? 'bg-red-500' :
                      health.metrics.memory_usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${health.metrics.memory_usage}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-600">Disk</span>
                  </div>
                  <span className="text-xs font-medium">{health.metrics.disk_usage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      health.metrics.disk_usage > 80 ? 'bg-red-500' :
                      health.metrics.disk_usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${health.metrics.disk_usage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Processing Metrics */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">Processing</h5>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Active Jobs</span>
                <span className="text-xs font-medium">{health.metrics.active_jobs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Queue Length</span>
                <span className="text-xs font-medium">{health.metrics.queue_length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Avg Processing</span>
                <span className="text-xs font-medium">{(health.metrics.avg_processing_time / 1000).toFixed(1)}s</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h5>
            <div className="space-y-2">
              <button
                onClick={checkSystemHealth}
                className="w-full px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Refresh Status
              </button>
              <button
                onClick={() => window.open('/api/models/health', '_blank')}
                className="w-full px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                View API Health
              </button>
              <button
                onClick={() => window.open('/api/processing/queue', '_blank')}
                className="w-full px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                View Queue Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};