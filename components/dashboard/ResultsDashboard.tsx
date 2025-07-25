'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Download, Filter, Search, Eye, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { DetectionResult, DefectSeverity, ResultStatus } from '@/types';
import { DateUtils, DefectUtils } from '@/lib/utils';

interface ResultsFilter {
  dateRange: { start: Date; end: Date };
  defectTypes: string[];
  severityLevels: DefectSeverity[];
  status: ResultStatus[];
}

interface ResultsDashboardProps {
  results: DetectionResult[];
  onResultSelect: (result: DetectionResult) => void;
  onExport: (format: 'pdf' | 'json' | 'csv') => void;
  filters: ResultsFilter;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  results,
  onResultSelect,
  onExport,
  filters
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'fileName' | 'status'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredResults = useMemo(() => {
    return results
      .filter(result => {
        // Search filter
        if (searchTerm && !result.fileName.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        // Status filter
        if (filters.status.length > 0 && !filters.status.includes(result.overallStatus)) {
          return false;
        }

        // Date range filter
        if (result.timestamp < filters.dateRange.start || result.timestamp > filters.dateRange.end) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'timestamp':
            comparison = a.timestamp.getTime() - b.timestamp.getTime();
            break;
          case 'fileName':
            comparison = a.fileName.localeCompare(b.fileName);
            break;
          case 'status':
            comparison = a.overallStatus.localeCompare(b.overallStatus);
            break;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [results, searchTerm, sortBy, sortOrder, filters]);

  const getStatusIcon = (status: ResultStatus) => {
    switch (status) {
      case ResultStatus.PASS:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case ResultStatus.FAIL:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case ResultStatus.REVIEW:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: ResultStatus) => {
    switch (status) {
      case ResultStatus.PASS:
        return 'bg-green-100 text-green-800';
      case ResultStatus.FAIL:
        return 'bg-red-100 text-red-800';
      case ResultStatus.REVIEW:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as typeof sortBy);
              setSortOrder(order as typeof sortOrder);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="timestamp-desc">Newest First</option>
            <option value="timestamp-asc">Oldest First</option>
            <option value="fileName-asc">Name A-Z</option>
            <option value="fileName-desc">Name Z-A</option>
            <option value="status-asc">Status A-Z</option>
            <option value="status-desc">Status Z-A</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={() => onExport('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => onExport('json')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            JSON
          </button>
        </div>
      </div>

      {/* Results summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-900">{filteredResults.length}</div>
          <div className="text-sm text-gray-600">Total Results</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {filteredResults.filter(r => r.overallStatus === ResultStatus.PASS).length}
          </div>
          <div className="text-sm text-gray-600">Passed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">
            {filteredResults.filter(r => r.overallStatus === ResultStatus.FAIL).length}
          </div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">
            {filteredResults.filter(r => r.overallStatus === ResultStatus.REVIEW).length}
          </div>
          <div className="text-sm text-gray-600">Review</div>
        </div>
      </div>

      {/* Results table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Defects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Processing Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {result.thumbnailUrl ? (
                          <img
                            className="h-10 w-10 rounded object-cover"
                            src={result.thumbnailUrl}
                            alt={result.fileName}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {result.fileName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {result.metadata?.format || 'Unknown format'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(result.overallStatus)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(result.overallStatus)}`}>
                        {result.overallStatus.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {result.detectedDefects.length} defect{result.detectedDefects.length !== 1 ? 's' : ''}
                    </div>
                    {result.detectedDefects.length > 0 && (
                      <div className="text-sm text-gray-500">
                        {result.detectedDefects.map(d => d.defectType.name).join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(result.processingTime / 1000).toFixed(1)}s
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {DateUtils.formatDate(result.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onResultSelect(result)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredResults.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};