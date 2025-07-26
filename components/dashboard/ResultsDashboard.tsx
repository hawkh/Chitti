'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  BarChart3 
} from 'lucide-react';
import { DetectionResult, DefectSeverity, ResultStatus } from '../../types';

interface ResultsDashboardProps {
  results: DetectionResult[];
  onResultSelect: (result: DetectionResult) => void;
  onExport?: (format: 'pdf' | 'json' | 'csv') => void;
  filters?: {
    dateRange: { start: Date; end: Date };
    defectTypes: string[];
    severityLevels: string[];
    status: string[];
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  results,
  onResultSelect,
  onExport,
  filters
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | ResultStatus>('all');
  const [filterSeverity, setFilterSeverity] = useState<DefectSeverity | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'defects'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort results
  const processedResults = useMemo(() => {
    let filtered = results.filter(result => {
      // Status filter
      if (filterStatus !== 'all' && result.overallStatus !== filterStatus) {
        return false;
      }

      // Severity filter
      if (filterSeverity !== 'all') {
        const hasMatchingSeverity = result.detectedDefects.some(defect => defect.severity === filterSeverity);
        if (!hasMatchingSeverity) return false;
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          result.id.toLowerCase().includes(query) ||
          result.fileName.toLowerCase().includes(query) ||
          result.detectedDefects.some(d => d.defectType.name.toLowerCase().includes(query))
        );
      }

      return true;
    });

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'status':
          comparison = a.overallStatus.localeCompare(b.overallStatus);
          break;
        case 'defects':
          comparison = a.detectedDefects.length - b.detectedDefects.length;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [results, searchQuery, filterStatus, filterSeverity, sortBy, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = results.length;
    const passed = results.filter(r => r.overallStatus === ResultStatus.PASS).length;
    const failed = results.filter(r => r.overallStatus === ResultStatus.FAIL).length;
    const avgProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0) / total || 0;

    return {
      total,
      passed,
      failed,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      avgProcessingTime
    };
  }, [results]);

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Inspections"
          value={stats.total}
          icon={<BarChart3 className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Pass Rate"
          value={`${stats.passRate.toFixed(1)}%`}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Failed"
          value={stats.failed}
          icon={<AlertCircle className="h-5 w-5" />}
          color="red"
        />
        <StatCard
          title="Avg. Processing"
          value={`${(stats.avgProcessingTime / 1000).toFixed(1)}s`}
          icon={<Clock className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, filename, or defect type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value={ResultStatus.PASS}>Passed</option>
              <option value={ResultStatus.FAIL}>Failed</option>
              <option value={ResultStatus.REVIEW}>Review</option>
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value={DefectSeverity.LOW}>Low</option>
              <option value={DefectSeverity.MEDIUM}>Medium</option>
              <option value={DefectSeverity.HIGH}>High</option>
              <option value={DefectSeverity.CRITICAL}>Critical</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy as any);
                setSortOrder(newSortOrder as any);
              }}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="status-asc">Status (A-Z)</option>
              <option value="status-desc">Status (Z-A)</option>
              <option value="defects-desc">Most Defects</option>
              <option value="defects-asc">Least Defects</option>
            </select>
          </div>

          {/* Export Actions */}
          {onExport && (
            <div className="flex gap-2">
              <button
                onClick={() => onExport('pdf')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                PDF
              </button>
              <button
                onClick={() => onExport('csv')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                CSV
              </button>
              <button
                onClick={() => onExport('json')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Defects
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Processing Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedResults.map((result) => (
                <ResultRow
                  key={result.id}
                  result={result}
                  onView={() => onResultSelect(result)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {processedResults.length === 0 && (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface ResultRowProps {
  result: DetectionResult;
  onView: () => void;
}

const ResultRow: React.FC<ResultRowProps> = ({ result, onView }) => {
  const getStatusColor = (status: ResultStatus) => {
    switch (status) {
      case ResultStatus.PASS:
        return 'bg-green-100 text-green-800';
      case ResultStatus.FAIL:
        return 'bg-red-100 text-red-800';
      case ResultStatus.REVIEW:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: DefectSeverity) => {
    switch (severity) {
      case DefectSeverity.LOW:
        return 'bg-yellow-100 text-yellow-800';
      case DefectSeverity.MEDIUM:
        return 'bg-orange-100 text-orange-800';
      case DefectSeverity.HIGH:
        return 'bg-red-100 text-red-800';
      case DefectSeverity.CRITICAL:
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Group defects by severity
  const defectsBySeverity = result.detectedDefects.reduce((acc, defect) => {
    acc[defect.severity] = (acc[defect.severity] || 0) + 1;
    return acc;
  }, {} as Record<DefectSeverity, number>);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-4">
        <div>
          <p className="text-sm font-medium text-gray-900">{result.fileName}</p>
          <p className="text-xs text-gray-500">{result.timestamp.toLocaleString()}</p>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.overallStatus)}`}>
          {result.overallStatus.toUpperCase()}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1">
          {Object.entries(defectsBySeverity).map(([severity, count]) => (
            <span
              key={severity}
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(severity as DefectSeverity)}`}
            >
              {count} {severity}
            </span>
          ))}
          {result.detectedDefects.length === 0 && (
            <span className="text-xs text-gray-500">No defects</span>
          )}
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-gray-500">
        {(result.processingTime / 1000).toFixed(1)}s
      </td>
      <td className="px-4 py-4">
        <button
          onClick={onView}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
        >
          <Eye className="h-4 w-4" />
          View Details
        </button>
      </td>
    </tr>
  );
};