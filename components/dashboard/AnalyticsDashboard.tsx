'use client';

import React from 'react';
import { BarChart3, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { DetectionResult, DefectSeverity } from '@/types';

interface AnalyticsDashboardProps {
  results: DetectionResult[];
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  results,
  className = ''
}) => {
  const stats = {
    total: results.length,
    passed: results.filter(r => r.overallStatus === 'pass').length,
    failed: results.filter(r => r.overallStatus === 'fail').length,
    avgProcessingTime: results.length > 0 
      ? results.reduce((sum, r) => sum + r.processingTime, 0) / results.length / 1000
      : 0
  };

  const defectStats = results.flatMap(r => r.detectedDefects).reduce((acc, defect) => {
    acc[defect.severity] = (acc[defect.severity] || 0) + 1;
    return acc;
  }, {} as Record<DefectSeverity, number>);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Inspections</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pass Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Time</p>
              <p className="text-2xl font-bold">{stats.avgProcessingTime.toFixed(1)}s</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Defect Severity Distribution</h3>
        <div className="space-y-2">
          {Object.entries(defectStats).map(([severity, count]) => (
            <div key={severity} className="flex items-center justify-between">
              <span className="capitalize">{severity}</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};