'use client';

import { BarChart3, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface DefectData {
  type: string;
  confidence: number;
  bbox: number[];
  severity: string;
  description: string;
}

interface DetectionResult {
  id: string;
  timestamp: Date;
  defects: DefectData[];
  processingTime: number;
  imageWidth: number;
  imageHeight: number;
}

interface AuditData {
  id: string;
  timestamp: Date;
  [key: string]: any;
}

interface AnalyticsDashboardProps {
  auditData: AuditData[];
  detectionResults: DetectionResult[];
}

export default function AnalyticsDashboard({ auditData, detectionResults }: AnalyticsDashboardProps) {
  const totalDefects = detectionResults.reduce((sum, result) => sum + result.defects.length, 0);
  const avgProcessingTime = detectionResults.length > 0
    ? Math.round(detectionResults.reduce((sum, r) => sum + r.processingTime, 0) / detectionResults.length)
    : 0;

  const defectsByType = detectionResults.reduce((acc, result) => {
    result.defects.forEach(defect => {
      acc[defect.type] = (acc[defect.type] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const criticalDefects = detectionResults.reduce(
    (sum, result) => sum + result.defects.filter(d => d.severity === 'critical').length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Detections</span>
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{detectionResults.length}</p>
          <p className="text-sm text-gray-500 mt-1">Across all audits</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Defects</span>
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalDefects}</p>
          <p className="text-sm text-gray-500 mt-1">{criticalDefects} critical</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Avg Processing</span>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{avgProcessingTime}ms</p>
          <p className="text-sm text-gray-500 mt-1">Per detection</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Success Rate</span>
            <CheckCircle className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {detectionResults.length > 0
              ? Math.round(((detectionResults.length - criticalDefects) / detectionResults.length) * 100)
              : 0}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Non-critical rate</p>
        </div>
      </div>

      {/* Defects by Type */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Defects by Type</h3>
        <div className="space-y-3">
          {Object.entries(defectsByType).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(count / totalDefects) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900 w-12 text-right">{count}</span>
              </div>
            </div>
          ))}
          {Object.keys(defectsByType).length === 0 && (
            <p className="text-center text-gray-500 py-4">No defects detected</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Detections</h3>
        <div className="space-y-3">
          {detectionResults.slice(0, 5).map((result) => (
            <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Detection #{result.id.slice(0, 8)}</p>
                <p className="text-xs text-gray-500">
                  {result.defects.length} defect{result.defects.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{result.processingTime}ms</p>
                <p className="text-xs text-gray-500">
                  {new Date(result.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          {detectionResults.length === 0 && (
            <p className="text-center text-gray-500 py-4">No recent detections</p>
          )}
        </div>
      </div>
    </div>
  );
}
