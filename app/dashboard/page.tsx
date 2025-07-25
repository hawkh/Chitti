'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, Activity, TrendingUp, Download } from 'lucide-react';
import { DetectionResult, ResultStatus, DefectSeverity } from '@/types';
import { ReportGenerator } from '@/services/report/ReportGenerator';
import { ReportExporter } from '@/services/report/ReportExporter';
import { AuditLogger } from '@/services/AuditLogger';

// Mock data for demonstration
const mockResults: DetectionResult[] = [
  {
    id: 'result-1',
    fileName: 'component-001.jpg',
    defects: [],
    detectedDefects: [],
    overallStatus: ResultStatus.PASS,
    processingTime: 1200,
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    metadata: {
      imageSize: { width: 1920, height: 1080 },
      fileSize: 2048000,
      format: 'image/jpeg'
    }
  },
  {
    id: 'result-2',
    fileName: 'component-002.jpg',
    defects: [],
    detectedDefects: [
      {
        id: 'defect-1',
        defectType: {
          id: 'crack-001',
          name: 'Crack',
          description: 'Surface crack detected',
          category: 'structural',
          severity: DefectSeverity.HIGH
        },
        confidence: 0.89,
        boundingBox: { x: 100, y: 150, width: 50, height: 30 },
        severity: DefectSeverity.HIGH,
        description: 'Surface crack detected',
        affectedArea: 2.5
      }
    ],
    overallStatus: ResultStatus.FAIL,
    processingTime: 1800,
    timestamp: new Date(Date.now() - 43200000), // 12 hours ago
    metadata: {
      imageSize: { width: 1920, height: 1080 },
      fileSize: 1856000,
      format: 'image/jpeg'
    }
  }
];

const mockProfile = {
  id: 'profile-1',
  name: 'General Metal Inspection',
  description: 'Standard profile for metal components',
  materialType: 'metal' as const,
  applicableDefectTypes: ['crack-001', 'corrosion-001'],
  detectionThresholds: {
    confidenceThreshold: 0.7,
    severityThresholds: {
      low: 0.5,
      medium: 0.7,
      high: 0.85,
      critical: 0.95
    } as any
  },
  imageRequirements: {
    minResolution: { width: 640, height: 480 },
    maxFileSize: 10485760,
    acceptedFormats: ['image/jpeg', 'image/png']
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

export default function DashboardPage() {
  const [results, setResults] = useState<DetectionResult[]>(mockResults);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const stats = {
    totalInspections: results.length,
    passedInspections: results.filter(r => r.overallStatus === 'pass').length,
    failedInspections: results.filter(r => r.overallStatus === 'fail').length,
    avgProcessingTime: results.length > 0 
      ? results.reduce((sum, r) => sum + r.processingTime, 0) / results.length / 1000
      : 0
  };

  const passRate = stats.totalInspections > 0 
    ? (stats.passedInspections / stats.totalInspections) * 100 
    : 0;

  const handleGenerateReport = async (format: 'pdf' | 'json' | 'csv') => {
    setIsGeneratingReport(true);
    
    try {
      const auditLogger = AuditLogger.getInstance();
      auditLogger.log('user', AuditLogger.ACTIONS.REPORT_GENERATE, { format, resultCount: results.length });

      const reportGenerator = new ReportGenerator();
      const reportExporter = new ReportExporter();
      
      const report = reportGenerator.generateInspectionReport(
        results,
        mockProfile,
        {
          title: 'NDT Inspection Report',
          includeRecommendations: true,
          dateRange: {
            from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            to: new Date()
          }
        }
      );

      await reportExporter.downloadReport(report, format);
      auditLogger.log('user', AuditLogger.ACTIONS.REPORT_DOWNLOAD, { format, reportId: report.id });
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Overview of your defect detection activities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Inspections</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalInspections}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pass Rate</p>
                <p className="text-3xl font-bold text-green-600">{passRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed Inspections</p>
                <p className="text-3xl font-bold text-red-600">{stats.failedInspections}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">!</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Processing Time</p>
                <p className="text-3xl font-bold text-gray-900">{stats.avgProcessingTime.toFixed(1)}s</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Inspections */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Inspections</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {results.slice(0, 5).map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        result.overallStatus === 'pass' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{result.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {result.detectedDefects.length} defects found
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {result.overallStatus.toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(result.processingTime / 1000).toFixed(1)}s
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Report Generation */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Generate Reports</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Export your inspection data in various formats for analysis and compliance.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => handleGenerateReport('pdf')}
                  disabled={isGeneratingReport}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FileText className="h-5 w-5" />
                  {isGeneratingReport ? 'Generating...' : 'Download PDF Report'}
                </button>

                <button
                  onClick={() => handleGenerateReport('csv')}
                  disabled={isGeneratingReport}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="h-5 w-5" />
                  {isGeneratingReport ? 'Generating...' : 'Download CSV Data'}
                </button>

                <button
                  onClick={() => handleGenerateReport('json')}
                  disabled={isGeneratingReport}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="h-5 w-5" />
                  {isGeneratingReport ? 'Generating...' : 'Download JSON Data'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/detection"
              className="flex items-center justify-center gap-3 px-6 py-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Activity className="h-5 w-5 text-blue-600" />
              <span className="font-medium">New Detection</span>
            </a>
            
            <a
              href="/integrated-detection?tab=analytics"
              className="flex items-center justify-center gap-3 px-6 py-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span className="font-medium">View Analytics</span>
            </a>
            
            <a
              href="/integrated-detection?tab=profiles"
              className="flex items-center justify-center gap-3 px-6 py-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Manage Profiles</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}