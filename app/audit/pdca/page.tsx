'use client';

import { useState, useEffect } from 'react';
import {
  RotateCw,
  TrendingUp,
  Award,
  Clock,
  Target,
  Play,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Filter,
  ArrowRight,
  ListChecks
} from 'lucide-react';
import Link from 'next/link';
import PDCACycleTracker from '@/components/audit/PDCACycleTracker';
import { PDCACycleStatus, PDCACycleMetrics } from '@/lib/audit/pdca-workflow';
import { PDCAStage } from '@/types/audit-form.types';

export default function PDCADashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<PDCACycleMetrics | null>(null);
  const [siteStatuses, setSiteStatuses] = useState<PDCACycleStatus[]>([]);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'in-progress'>('all');

  useEffect(() => {
    fetchPDCAMetrics();
  }, []);

  const fetchPDCAMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/audit/pdca/metrics');
      const data = await response.json();
      
      setMetrics(data.metrics);
      setSiteStatuses(data.siteStatuses);
    } catch (error) {
      console.error('Error fetching PDCA metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSiteCycleStatus = async (siteId: string) => {
    try {
      const response = await fetch(`/api/audit/pdca/cycle-status?siteId=${siteId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching site cycle status:', error);
      return null;
    }
  };

  const handleSiteSelect = async (siteId: string) => {
    setSelectedSite(siteId);
    // Fetch detailed status if needed
  };

  const filteredSites = siteStatuses.filter(site => {
    if (filterStatus === 'complete') return site.isComplete;
    if (filterStatus === 'in-progress') return !site.isComplete;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RotateCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading PDCA metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                PDCA Cycle Management
              </h1>
              <p className="text-gray-600">
                Track Plan-Do-Check-Act continuous improvement cycles across all sites
              </p>
            </div>
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <RotateCw className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/audit/pdca/analytics"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg hover:shadow-md transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">PDCA Analytics</div>
                  <div className="text-sm text-gray-600">View insights & recommendations</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/audit/improvement"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg hover:shadow-md transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <ListChecks className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Improvement Actions</div>
                  <div className="text-sm text-gray-600">Manage continuous improvement</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Metrics Overview */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={Target}
              label="Total Cycles"
              value={metrics.totalCycles}
              color="blue"
            />
            <MetricCard
              icon={Award}
              label="Completed Cycles"
              value={metrics.completedCycles}
              color="green"
              subtitle={`${metrics.completionRate}% completion rate`}
            />
            <MetricCard
              icon={Clock}
              label="In Progress"
              value={metrics.inProgressCycles}
              color="yellow"
            />
            <MetricCard
              icon={TrendingUp}
              label="Avg. Duration"
              value={`${metrics.averageCycleDuration} days`}
              color="purple"
            />
          </div>
        )}

        {/* Stage Distribution */}
        {metrics && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Stage Distribution</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StageDistributionCard
                stage="plan"
                count={metrics.stageDistribution.plan}
                icon={Target}
                color="blue"
              />
              <StageDistributionCard
                stage="do"
                count={metrics.stageDistribution.do}
                icon={Play}
                color="green"
              />
              <StageDistributionCard
                stage="check"
                count={metrics.stageDistribution.check}
                icon={CheckCircle}
                color="purple"
              />
              <StageDistributionCard
                stage="act"
                count={metrics.stageDistribution.act}
                icon={RotateCw}
                color="orange"
              />
            </div>
          </div>
        )}

        {/* Site Cycles */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Site PDCA Cycles</h3>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Sites</option>
                <option value="complete">Complete Cycles</option>
                <option value="in-progress">In Progress</option>
              </select>
            </div>
          </div>

          {filteredSites.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No sites found matching the filter</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSites.map((site) => (
                <SiteCycleCard
                  key={site.siteId}
                  site={site}
                  onSelect={() => handleSiteSelect(site.siteId)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
  subtitle?: string;
}

function MetricCard({ icon: Icon, label, value, color, subtitle }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      )}
    </div>
  );
}

// Stage Distribution Card
interface StageDistributionCardProps {
  stage: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StageDistributionCard({ stage, count, icon: Icon, color }: StageDistributionCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colorClasses[color]}`}>
      <div className="flex items-center space-x-3 mb-2">
        <Icon className="h-5 w-5" />
        <span className="font-semibold capitalize">{stage}</span>
      </div>
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-xs opacity-75">audits</div>
    </div>
  );
}

// Site Cycle Card
interface SiteCycleCardProps {
  site: {
    siteId: string;
    siteName: string;
    progress: number;
    isComplete: boolean;
    currentStage: PDCAStage;
    completedStages: PDCAStage[];
  };
  onSelect: () => void;
}

function SiteCycleCard({ site, onSelect }: SiteCycleCardProps) {
  const stageIcons = {
    plan: Target,
    do: Play,
    check: CheckCircle,
    act: RotateCw
  };

  const CurrentIcon = stageIcons[site.currentStage];

  return (
    <button
      onClick={onSelect}
      className="w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center
            ${site.isComplete ? 'bg-green-100' : 'bg-blue-100'}
          `}>
            {site.isComplete ? (
              <Award className="h-5 w-5 text-green-600" />
            ) : (
              <CurrentIcon className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{site.siteName}</h4>
            <p className="text-sm text-gray-600">
              {site.isComplete ? 'Cycle Complete' : `Current: ${site.currentStage.toUpperCase()}`}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{site.progress}%</div>
          <div className="text-xs text-gray-600">
            {site.completedStages.length}/4 stages
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            site.isComplete 
              ? 'bg-green-500' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
          }`}
          style={{ width: `${site.progress}%` }}
        />
      </div>

      {/* Stage Indicators */}
      <div className="flex items-center justify-between mt-3 text-xs">
        {(['plan', 'do', 'check', 'act'] as PDCAStage[]).map((stage) => {
          const isCompleted = site.completedStages.includes(stage);
          const Icon = stageIcons[stage];
          
          return (
            <div
              key={stage}
              className={`flex items-center space-x-1 ${
                isCompleted ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span className="capitalize">{stage}</span>
            </div>
          );
        })}
      </div>
    </button>
  );
}
