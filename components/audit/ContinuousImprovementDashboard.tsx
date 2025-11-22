'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ImprovementDashboardData {
  totalActions: number;
  activeActions: number;
  completedActions: number;
  overdueActions: number;
  actionsByPriority: Record<string, number>;
  actionsByStage: Record<string, number>;
  actionsByStatus: Record<string, number>;
  upcomingFollowUps: any[];
  recentCompletions: any[];
  effectivenessRate: number;
  averageCompletionTime: number;
}

export default function ContinuousImprovementDashboard() {
  const [dashboard, setDashboard] = useState<ImprovementDashboardData | null>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    fetchDashboardData();
  }, [filterStatus, filterPriority]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterPriority !== 'all') params.append('priority', filterPriority);
      params.append('includeDashboard', 'true');

      const response = await fetch(`/api/audit/improvement/actions?${params}`);
      const data = await response.json();

      if (data.success) {
        setActions(data.actions);
        setDashboard(data.dashboard);
      } else {
        setError(data.error || 'Failed to load dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'planned': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Continuous Improvement Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track improvement actions, follow-up audits, and effectiveness metrics
          </p>
        </div>
        <Link
          href="/audit/improvement/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + New Improvement Action
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Actions</div>
          <div className="text-3xl font-bold text-gray-900">{dashboard.totalActions}</div>
          <div className="text-xs text-gray-500 mt-2">
            {dashboard.activeActions} active, {dashboard.completedActions} completed
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Overdue Actions</div>
          <div className={`text-3xl font-bold ${dashboard.overdueActions > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {dashboard.overdueActions}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {dashboard.overdueActions > 0 ? 'Require immediate attention' : 'All on track'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Effectiveness Rate</div>
          <div className={`text-3xl font-bold ${dashboard.effectivenessRate >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
            {dashboard.effectivenessRate}%
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Verified improvements meeting targets
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Avg. Completion Time</div>
          <div className="text-3xl font-bold text-gray-900">{dashboard.averageCompletionTime}</div>
          <div className="text-xs text-gray-500 mt-2">days to complete actions</div>
        </div>
      </div>

      {/* Actions by Priority and Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions by Priority</h2>
          <div className="space-y-3">
            {Object.entries(dashboard.actionsByPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(priority)}`}>
                    {priority.toUpperCase()}
                  </span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions by PDCA Stage</h2>
          <div className="space-y-3">
            {Object.entries(dashboard.actionsByStage).map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
                    {stage.toUpperCase()}
                  </span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Follow-Ups */}
      {dashboard.upcomingFollowUps.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Follow-Up Audits</h2>
          <div className="space-y-3">
            {dashboard.upcomingFollowUps.map((followUp) => (
              <div key={followUp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <div className="font-medium text-gray-900">{followUp.siteName}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(followUp.scheduledDate).toLocaleDateString()}
                  </div>
                </div>
                <Link
                  href={`/audit/improvement/follow-ups/${followUp.id}`}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Actions List */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Improvement Actions</h2>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="verified">Verified</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {actions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No improvement actions found
            </div>
          ) : (
            actions.map((action) => (
              <div key={action.id} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(action.priority)}`}>
                      {action.priority.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(action.status)}`}>
                      {action.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div className="flex gap-4">
                    <span>Site: {action.siteName}</span>
                    <span>Stage: {action.pdcaStage.toUpperCase()}</span>
                    <span>Due: {new Date(action.targetDate).toLocaleDateString()}</span>
                  </div>
                  <Link
                    href={`/audit/improvement/actions/${action.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
