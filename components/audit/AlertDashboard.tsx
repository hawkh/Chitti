'use client';

import React, { useState, useEffect } from 'react';
import { AlertRecord, AlertSummary } from '@/lib/audit/alert-manager';

interface AlertDashboardProps {
  siteId?: string;
  userId: string;
  userRole: 'inspector' | 'manager' | 'admin';
}

export default function AlertDashboard({ siteId, userId, userRole }: AlertDashboardProps) {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [summary, setSummary] = useState<AlertSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    severity: 'all',
    status: 'unresolved',
    type: 'all'
  });
  const [selectedAlert, setSelectedAlert] = useState<AlertRecord | null>(null);

  useEffect(() => {
    loadAlerts();
  }, [siteId, filter]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (siteId) params.append('siteId', siteId);
      if (filter.severity !== 'all') params.append('severity', filter.severity);
      if (filter.status === 'unresolved') params.append('resolved', 'false');
      if (filter.status === 'resolved') params.append('resolved', 'true');
      if (filter.status === 'unacknowledged') params.append('acknowledged', 'false');
      
      const response = await fetch(`/api/audit/alerts?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: string, notes?: string) => {
    try {
      const response = await fetch(`/api/audit/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'acknowledge',
          userId,
          notes
        })
      });
      
      if (response.ok) {
        loadAlerts();
        setSelectedAlert(null);
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleResolve = async (alertId: string, notes?: string) => {
    try {
      const response = await fetch(`/api/audit/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve',
          userId,
          notes
        })
      });
      
      if (response.ok) {
        loadAlerts();
        setSelectedAlert(null);
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical_failure':
        return '🚨';
      case 'declining_trend':
        return '📉';
      case 'low_score':
        return '⚠️';
      case 'high_volatility':
        return '📊';
      default:
        return 'ℹ️';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-900';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      default:
        return 'bg-blue-100 border-blue-500 text-blue-900';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-600 text-white',
      warning: 'bg-yellow-600 text-white',
      info: 'bg-blue-600 text-white'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[severity as keyof typeof colors]}`}>
        {severity.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Alerts</div>
            <div className="text-3xl font-bold text-gray-900">{summary.total}</div>
            <div className="text-xs text-gray-500 mt-1">
              {summary.unresolved} unresolved
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg shadow border-l-4 border-red-600">
            <div className="text-sm text-red-700">Critical</div>
            <div className="text-3xl font-bold text-red-900">{summary.critical}</div>
            <div className="text-xs text-red-600 mt-1">
              Requires immediate action
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg shadow border-l-4 border-yellow-600">
            <div className="text-sm text-yellow-700">Warnings</div>
            <div className="text-3xl font-bold text-yellow-900">{summary.warning}</div>
            <div className="text-xs text-yellow-600 mt-1">
              Needs attention
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg shadow border-l-4 border-blue-600">
            <div className="text-sm text-blue-700">Unacknowledged</div>
            <div className="text-3xl font-bold text-blue-900">{summary.unacknowledged}</div>
            <div className="text-xs text-blue-600 mt-1">
              Awaiting review
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity
            </label>
            <select
              value={filter.severity}
              onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="unresolved">Unresolved</option>
              <option value="unacknowledged">Unacknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={loadAlerts}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            No alerts found matching the current filters
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.severity)} cursor-pointer hover:shadow-lg transition-shadow`}
              onClick={() => setSelectedAlert(alert)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                    {getSeverityBadge(alert.severity)}
                    <span className="font-semibold text-sm">
                      {alert.type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    {alert.acknowledged && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        ✓ Acknowledged
                      </span>
                    )}
                    {alert.resolved && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                        ✓ Resolved
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-2">
                    <div className="font-medium text-gray-900">{alert.siteName}</div>
                    <div className="text-sm">{alert.message}</div>
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    Detected: {new Date(alert.detectedAt).toLocaleString()}
                  </div>
                  
                  {!alert.resolved && (
                    <div className="mt-3 p-3 bg-white bg-opacity-50 rounded">
                      <div className="text-xs font-semibold text-gray-700 mb-1">
                        Recommended Action:
                      </div>
                      <div className="text-sm">{alert.recommendedAction}</div>
                    </div>
                  )}
                </div>
                
                <div className="ml-4 flex flex-col gap-2">
                  {!alert.acknowledged && userRole !== 'inspector' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcknowledge(alert.id);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Acknowledge
                    </button>
                  )}
                  
                  {!alert.resolved && userRole !== 'inspector' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResolve(alert.id);
                      }}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Alert Details</h2>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Alert ID</div>
                  <div className="font-mono text-sm">{selectedAlert.id}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600">Site</div>
                  <div className="font-medium">{selectedAlert.siteName}</div>
                  <div className="text-sm text-gray-500">{selectedAlert.siteId}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600">Severity & Type</div>
                  <div className="flex items-center gap-2 mt-1">
                    {getSeverityBadge(selectedAlert.severity)}
                    <span className="text-sm">{selectedAlert.type.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600">Message</div>
                  <div className="mt-1">{selectedAlert.message}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Threshold</div>
                    <div className="font-medium">{selectedAlert.threshold}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Current Value</div>
                    <div className="font-medium">{selectedAlert.currentValue}</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600">Recommended Action</div>
                  <div className="mt-1 p-3 bg-blue-50 rounded">
                    {selectedAlert.recommendedAction}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600">Detected At</div>
                  <div>{new Date(selectedAlert.detectedAt).toLocaleString()}</div>
                </div>
                
                {selectedAlert.acknowledged && (
                  <div className="p-3 bg-green-50 rounded">
                    <div className="text-sm font-semibold text-green-800">Acknowledged</div>
                    <div className="text-sm">By: {selectedAlert.acknowledgedBy}</div>
                    <div className="text-sm">
                      At: {selectedAlert.acknowledgedAt && new Date(selectedAlert.acknowledgedAt).toLocaleString()}
                    </div>
                  </div>
                )}
                
                {selectedAlert.resolved && (
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-sm font-semibold text-gray-800">Resolved</div>
                    <div className="text-sm">By: {selectedAlert.resolvedBy}</div>
                    <div className="text-sm">
                      At: {selectedAlert.resolvedAt && new Date(selectedAlert.resolvedAt).toLocaleString()}
                    </div>
                  </div>
                )}
                
                {selectedAlert.notes && (
                  <div>
                    <div className="text-sm text-gray-600">Notes</div>
                    <div className="mt-1 p-3 bg-gray-50 rounded whitespace-pre-wrap">
                      {selectedAlert.notes}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex gap-3">
                {!selectedAlert.acknowledged && userRole !== 'inspector' && (
                  <button
                    onClick={() => handleAcknowledge(selectedAlert.id, 'Acknowledged from detail view')}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Acknowledge
                  </button>
                )}
                
                {!selectedAlert.resolved && userRole !== 'inspector' && (
                  <button
                    onClick={() => handleResolve(selectedAlert.id, 'Resolved from detail view')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Resolve
                  </button>
                )}
                
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
