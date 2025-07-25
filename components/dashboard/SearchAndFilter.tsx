'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, X } from 'lucide-react';
import { DetectionResult, DefectSeverity, ResultStatus } from '@/types';

interface SearchAndFilterProps {
  results: DetectionResult[];
  onFilteredResults: (filtered: DetectionResult[]) => void;
  className?: string;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  results,
  onFilteredResults,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ResultStatus[]>([]);
  const [severityFilter, setSeverityFilter] = useState<DefectSeverity[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let filtered = results;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter(result =>
        statusFilter.includes(result.overallStatus)
      );
    }

    // Severity filter
    if (severityFilter.length > 0) {
      filtered = filtered.filter(result =>
        result.detectedDefects.some(defect =>
          severityFilter.includes(defect.severity)
        )
      );
    }

    // Date range filter
    filtered = filtered.filter(result =>
      result.timestamp >= dateRange.start && result.timestamp <= dateRange.end
    );

    onFilteredResults(filtered);
  }, [results, searchTerm, statusFilter, severityFilter, dateRange, onFilteredResults]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter([]);
    setSeverityFilter([]);
    setDateRange({
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 space-y-4 ${className}`}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Filter className="h-4 w-4" />
          Filters
          {(statusFilter.length > 0 || severityFilter.length > 0) && (
            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
              {statusFilter.length + severityFilter.length}
            </span>
          )}
        </button>

        {(searchTerm || statusFilter.length > 0 || severityFilter.length > 0) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {showFilters && (
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="space-y-2">
                {Object.values(ResultStatus).map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={statusFilter.includes(status)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setStatusFilter([...statusFilter, status]);
                        } else {
                          setStatusFilter(statusFilter.filter(s => s !== status));
                        }
                      }}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm capitalize">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
              <div className="space-y-2">
                {Object.values(DefectSeverity).map(severity => (
                  <label key={severity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={severityFilter.includes(severity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSeverityFilter([...severityFilter, severity]);
                        } else {
                          setSeverityFilter(severityFilter.filter(s => s !== severity));
                        }
                      }}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm capitalize">{severity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={dateRange.start.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange({
                    ...dateRange,
                    start: new Date(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <input
                  type="date"
                  value={dateRange.end.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange({
                    ...dateRange,
                    end: new Date(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};