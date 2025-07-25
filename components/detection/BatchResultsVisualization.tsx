'use client';

import React, { useState, useMemo } from 'react';
import { Grid, List, Filter, Download, Eye, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { DetectionResult, DefectSeverity, ResultStatus } from '@/types';
import { DefectVisualization } from './DefectVisualization';

interface BatchResultsVisualizationProps {
  results: DetectionResult[];
  onResultSelect?: (result: DetectionResult) => void;
  onExport?: (format: 'pdf' | 'csv' | 'json') => void;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'pass' | 'fail' | 'review';
type SortType = 'name' | 'status' | 'defects' | 'confidence' | 'time';

export const BatchResultsVisualization: React.FC<BatchResultsVisualizationProps> = ({
  results,
  onResultSelect,
  onExport,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('time');
  const [selectedResult, setSelectedResult] = useState<DetectionResult | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort results
  const filteredAndSortedResults = useMemo(() => {
    let filtered = results;

    // Apply filter
    if (filter !== 'all') {
      filtered = results.filter(result => result.overallStatus === filter);
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.fileName.localeCompare(b.fileName);
        case 'status':
          return a.overallStatus.localeCompare(b.overallStatus);
        case 'defects':
          return b.detectedDefects.length - a.detectedDefects.length;
        case 'confidence':
          const avgConfidenceA = a.detectedDefects.reduce((sum, d) => sum + d.confidence, 0) / (a.detectedDefects.length || 1);
          const avgConfidenceB = b.detectedDefects.reduce((sum, d) => sum + d.confidence, 0) / (b.detectedDefects.length || 1);
          return avgConfidenceB - avgConfidenceA;
        case 'time':
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

    return filtered;
  }, [results, filter, sortBy]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const total = results.length;
    const passed = results.filter(r => r.overallStatus === ResultStatus.PASS).length;
    const failed = results.filter(r => r.overallStatus === ResultStatus.FAIL).length;
    const review = results.filter(r => r.overallStatus === ResultStatus.REVIEW).length;
    const totalDefects = results.reduce((sum, r) => sum + r.detectedDefects.length, 0);
    const avgProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0) / total;

    return {
      total,
      passed,
      failed,
      review,
      totalDefects,
      avgProcessingTime,
      passRate: (passed / total) * 100
    };
  }, [results]);

  const handleResultClick = (result: DetectionResult) => {
    setSelectedResult(result);
    onResultSelect?.(result);
  };

  const getStatusIcon = (status: ResultStatus) => {
    switch (status) {
      case ResultStatus.PASS:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case ResultStatus.FAIL:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case ResultStatus.REVIEW:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
          <div className="text-sm text-gray-600">Total Files</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
          <div className="text-sm text-gray-600">Passed</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">{summary.review}</div>
          <div className="text-sm text-gray-600">Review</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{summary.totalDefects}</div>
          <div className="text-sm text-gray-600">Total Defects</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{summary.passRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Pass Rate</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="Grid view"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>

          {/* Export Options */}
          {onExport && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Export:</span>
              <button
                onClick={() => onExport('pdf')}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
              >
                PDF
              </button>
              <button
                onClick={() => onExport('csv')}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors"
              >
                CSV
              </button>
              <button
                onClick={() => onExport('json')}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
              >
                JSON
              </button>
            </div>
          )}
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="pass">Pass</option>
                  <option value="fail">Fail</option>
                  <option value="review">Review</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortType)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="time">Time</option>
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                  <option value="defects">Defect Count</option>
                  <option value="confidence">Confidence</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Display */}
      <div className="bg-white rounded-lg shadow-sm">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {filteredAndSortedResults.map(result => (
              <ResultCard
                key={result.id}
                result={result}
                onClick={() => handleResultClick(result)}
                isSelected={selectedResult?.id === result.id}
              />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAndSortedResults.map(result => (
              <ResultListItem
                key={result.id}
                result={result}
                onClick={() => handleResultClick(result)}
                isSelected={selectedResult?.id === result.id}
              />
            ))}
          </div>
        )}

        {filteredAndSortedResults.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No results match the current filters</p>
          </div>
        )}
      </div>

      {/* Detailed View Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">{selectedResult.fileName}</h2>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              <DefectVisualization
                detectionResult={selectedResult}
                className="h-96"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ResultCardProps {
  result: DetectionResult;
  onClick: () => void;
  isSelected: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onClick, isSelected }) => {
  const defectCount = result.detectedDefects.length;
  const avgConfidence = defectCount > 0 
    ? result.detectedDefects.reduce((sum, d) => sum + d.confidence, 0) / defectCount 
    : 0;

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border-2 transition-all hover:shadow-md ${
        isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
        <img
          src={result.thumbnailUrl || result.imageUrl || '/placeholder-image.jpg'}
          alt={result.fileName}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
          }}
        />
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm truncate">{result.fileName}</h3>
          <div className="flex items-center gap-1">
            {getStatusIcon(result.overallStatus)}
          </div>
        </div>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Defects:</span>
            <span className={defectCount > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>{defectCount}</span>
          </div>
          {defectCount > 0 && (
            <div className="flex justify-between">
              <span>Avg Confidence:</span>
              <span>{Math.round(avgConfidence * 100)}%</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Processing:</span>
            <span>{result.processingTime}ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ResultListItemProps {
  result: DetectionResult;
  onClick: () => void;
  isSelected: boolean;
}

const ResultListItem: React.FC<ResultListItemProps> = ({ result, onClick, isSelected }) => {
  const defectCount = result.detectedDefects.length;
  const avgConfidence = defectCount > 0 
    ? result.detectedDefects.reduce((sum, d) => sum + d.confidence, 0) / defectCount 
    : 0;

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
          <img
            src={result.thumbnailUrl || result.imageUrl || '/placeholder-image.jpg'}
            alt={result.fileName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWc8L3RleHQ+PC9zdmc+';
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 truncate">{result.fileName}</h3>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(result.overallStatus)}`}>
                {result.overallStatus.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
            <span>Defects: <span className={defectCount > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>{defectCount}</span></span>
            {defectCount > 0 && <span>Confidence: {Math.round(avgConfidence * 100)}%</span>}
            <span>Processing: {result.processingTime}ms</span>
            <span>Time: {new Date(result.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function getStatusIcon(status: ResultStatus) {
  switch (status) {
    case ResultStatus.PASS:
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case ResultStatus.FAIL:
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case ResultStatus.REVIEW:
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return null;
  }
}

function getStatusColor(status: ResultStatus) {
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
}