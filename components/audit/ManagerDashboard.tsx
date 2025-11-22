'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Filter,
  Search,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  BarChart3
} from 'lucide-react';

interface ManagerDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface DashboardMetrics {
  pendingReviews: number;
  approvedToday: number;
  rejectedToday: number;
  avgComplianceScore: number;
  totalAuditsThisWeek: number;
  overdueReviews: number;
}

interface AuditSummary {
  id: string;
  siteId: string;
  siteName: string;
  inspectorName: string;
  auditDate: string;
  submittedAt: string;
  status: string;
  pdcaStage: string;
  auditType: string;
  complianceScore?: number;
  criticalIssues?: number;
  daysOverdue?: number;
}

export default function ManagerDashboard({ user }: ManagerDashboardProps) {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    pendingReviews: 0,
    approvedToday: 0,
    rejectedToday: 0,
    avgComplianceScore: 0,
    totalAuditsThisWeek: 0,
    overdueReviews: 0
  });
  const [audits, setAudits] = useState<AuditSummary[]>([]);
  const [filteredAudits, setFilteredAudits] = useState<AuditSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'site'>('date');

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [audits, statusFilter, siteFilter, searchQuery, sortBy]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('audit_token');

      // Fetch dashboard metrics
      const metricsRes = await fetch('/api/audit/manager/metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const metricsData = await metricsRes.json();
      setMetrics(metricsData);

      // Fetch pending audits
      const auditsRes = await fetch('/api/audit/manager/audits', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const auditsData = await auditsRes.json();
      setAudits(auditsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...audits];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(audit => audit.status === statusFilter);
    }

    // Site filter
    if (siteFilter !== 'all') {
      filtered = filtered.filter(audit => audit.siteId === siteFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(audit =>
        audit.siteName.toLowerCase().includes(query) ||
        audit.inspectorName.toLowerCase().includes(query) ||
        audit.id.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        case 'priority':
          return (b.daysOverdue || 0) - (a.daysOverdue || 0);
        case 'site':
          return a.siteName.localeCompare(b.siteName);
        default:
          return 0;
      }
    });

    setFilteredAudits(filtered);
  };

  const handleViewAudit = (auditId: string) => {
    router.push(`/audit/manager/review/${auditId}`);
  };

  const handleViewAnalytics = () => {
    router.push('/audit/manager/analytics');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {user.name}
              </p>
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
                onClick={handleViewAnalytics}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <MetricCard
            icon={<Clock className="h-6 w-6" />}
            label="Pending Reviews"
            value={metrics.pendingReviews}
            color="blue"
            trend={metrics.overdueReviews > 0 ? { value: metrics.overdueReviews, label: 'overdue', type: 'negative' } : undefined}
          />
          <MetricCard
            icon={<CheckCircle className="h-6 w-6" />}
            label="Approved Today"
            value={metrics.approvedToday}
            color="green"
          />
          <MetricCard
            icon={<XCircle className="h-6 w-6" />}
            label="Rejected Today"
            value={metrics.rejectedToday}
            color="red"
          />
          <MetricCard
            icon={<BarChart3 className="h-6 w-6" />}
            label="Avg Compliance"
            value={`${metrics.avgComplianceScore}%`}
            color="purple"
            trend={
              metrics.avgComplianceScore >= 85
                ? { value: 'Good', type: 'positive' }
                : metrics.avgComplianceScore >= 70
                ? { value: 'Fair', type: 'neutral' }
                : { value: 'Low', type: 'negative' }
            }
          />
          <MetricCard
            icon={<ClipboardList className="h-6 w-6" />}
            label="This Week"
            value={metrics.totalAuditsThisWeek}
            color="indigo"
          />
          <MetricCard
            icon={<AlertTriangle className="h-6 w-6" />}
            label="Overdue"
            value={metrics.overdueReviews}
            color="orange"
            highlight={metrics.overdueReviews > 0}
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by site, inspector, or audit ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="site">Sort by Site</option>
              </select>

              <button
                onClick={() => {
                  setStatusFilter('all');
                  setSiteFilter('all');
                  setSearchQuery('');
                  setSortBy('date');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredAudits.length} of {audits.length} audits
          </div>
        </div>

        {/* Audits List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Audit Reviews</h2>
          </div>

          {filteredAudits.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No audits found matching your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAudits.map((audit) => (
                <AuditListItem
                  key={audit.id}
                  audit={audit}
                  onView={() => handleViewAudit(audit.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <QuickActionCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="Compliance Analytics"
            description="Advanced scoring and benchmarking"
            onClick={() => router.push('/audit/compliance')}
          />
          <QuickActionCard
            icon={<Users className="h-8 w-8" />}
            title="Team Performance"
            description="View inspector performance metrics"
            onClick={() => router.push('/audit/manager/team')}
          />
          <QuickActionCard
            icon={<Building2 className="h-8 w-8" />}
            title="Site Comparison"
            description="Compare compliance across sites"
            onClick={() => router.push('/audit/manager/analytics')}
          />
          <QuickActionCard
            icon={<Download className="h-8 w-8" />}
            title="Export Reports"
            description="Download audit reports and data"
            onClick={() => router.push('/audit/manager/exports')}
          />
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'red' | 'purple' | 'indigo' | 'orange';
  trend?: {
    value: string | number;
    label?: string;
    type?: 'positive' | 'negative' | 'neutral';
  };
  highlight?: boolean;
}

function MetricCard({ icon, label, value, color, trend, highlight }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${highlight ? 'ring-2 ring-orange-500' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-xs font-medium ${
            trend.type === 'positive' ? 'text-green-600' :
            trend.type === 'negative' ? 'text-red-600' :
            'text-gray-600'
          }`}>
            {trend.type === 'positive' && <TrendingUp className="h-3 w-3" />}
            {trend.type === 'negative' && <TrendingDown className="h-3 w-3" />}
            <span>{trend.value} {trend.label}</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
  );
}

// Audit List Item Component
interface AuditListItemProps {
  audit: AuditSummary;
  onView: () => void;
}

function AuditListItem({ audit, onView }: AuditListItemProps) {
  const statusConfig = {
    SUBMITTED: { color: 'bg-blue-100 text-blue-800', label: 'Submitted' },
    IN_REVIEW: { color: 'bg-yellow-100 text-yellow-800', label: 'In Review' },
    APPROVED: { color: 'bg-green-100 text-green-800', label: 'Approved' },
    REJECTED: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
  };

  const status = statusConfig[audit.status as keyof typeof statusConfig] || statusConfig.SUBMITTED;
  const isOverdue = (audit.daysOverdue || 0) > 0;

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{audit.siteName}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
              {status.label}
            </span>
            {isOverdue && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>{audit.daysOverdue} days overdue</span>
              </span>
            )}
            {audit.criticalIssues && audit.criticalIssues > 0 && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                {audit.criticalIssues} critical issues
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>{audit.inspectorName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(audit.auditDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Submitted {new Date(audit.submittedAt).toLocaleDateString()}</span>
            </div>
            {audit.complianceScore !== undefined && (
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span className={`font-medium ${
                  audit.complianceScore >= 85 ? 'text-green-600' :
                  audit.complianceScore >= 70 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {audit.complianceScore}% compliance
                </span>
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
            <span className="px-2 py-1 bg-gray-100 rounded">
              {audit.auditType.replace('_', ' ')}
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded">
              PDCA: {audit.pdcaStage}
            </span>
            <span className="text-gray-400">ID: {audit.id.slice(0, 8)}</span>
          </div>
        </div>

        <button
          onClick={onView}
          className="ml-6 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Eye className="h-4 w-4" />
          <span>Review</span>
        </button>
      </div>
    </div>
  );
}

// Quick Action Card Component
interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function QuickActionCard({ icon, title, description, onClick }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
    >
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
}
