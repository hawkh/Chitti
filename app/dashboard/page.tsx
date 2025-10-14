'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, Activity, TrendingUp, Download, Sparkles, CheckCircle, XCircle, Clock } from 'lucide-react';
import { DetectionResult, ResultStatus, DefectSeverity, ComponentProfile, MaterialType, DefectType } from '@/types';
import { ReportGenerator } from '@/services/report/ReportGenerator';
import { ReportExporter } from '@/services/report/ReportExporter';
import { AuditLogger } from '@/services/AuditLogger';
import PDFExportButton from '@/components/export/PDFExportButton';

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

const mockProfile: ComponentProfile = {
  id: 'profile-1',
  name: 'General Metal Inspection',
  materialType: MaterialType.METAL,
  criticalDefects: [DefectType.CRACK, DefectType.CORROSION],
  defaultSensitivity: 0.7,
  qualityStandards: ['ISO 9001', 'ASTM E165'],
  customParameters: {
    description: 'Standard profile for metal components',
    applicableDefectTypes: ['crack-001', 'corrosion-001'],
    detectionThresholds: {
      confidenceThreshold: 0.7,
      severityThresholds: {
        low: 0.5,
        medium: 0.7,
        high: 0.85,
        critical: 0.95
      }
    },
    imageRequirements: {
      minResolution: { width: 640, height: 480 },
      maxFileSize: 10485760,
      acceptedFormats: ['image/jpeg', 'image/png']
    }
  }
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
      auditLogger.log('user', AuditLogger.ACTIONS.REPORT_DOWNLOAD, { format, reportId: report.metadata.id });
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50 animate-pulse-slow">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black gradient-text text-shadow">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2 text-lg font-medium">Real-time insights into your quality control operations</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="stat-card group border-2 border-blue-200 hover:border-blue-400 hover:glow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Inspections</p>
                <p className="text-5xl font-black bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{stats.totalInspections}</p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/50 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                <Activity className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="stat-card group border-2 border-green-200 hover:border-green-400 hover:shadow-green-500/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pass Rate</p>
                <p className="text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{passRate.toFixed(1)}%</p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/50 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="stat-card group border-2 border-red-200 hover:border-red-400 hover:shadow-red-500/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Failed Inspections</p>
                <p className="text-5xl font-black bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{stats.failedInspections}</p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/50 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                <XCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="stat-card group border-2 border-purple-200 hover:border-purple-400 hover:shadow-purple-500/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Avg Processing</p>
                <p className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.avgProcessingTime.toFixed(1)}s</p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/50 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Inspections */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Recent Inspections</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {results.slice(0, 5).map((result) => (
                  <div key={result.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 hover:from-blue-50 hover:to-indigo-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all hover:shadow-md">
                    <div className="flex items-center space-x-4">
                      {result.overallStatus === 'pass' ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{result.fileName}</p>
                        <p className="text-sm text-gray-600">
                          {result.detectedDefects.length} defects detected
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        result.overallStatus === 'pass' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {result.overallStatus.toUpperCase()}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {(result.processingTime / 1000).toFixed(1)}s
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Report Generation */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Export Reports</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Professional reports for compliance, analysis, and stakeholder communication.
              </p>
              
              <div className="space-y-3">
                <div className="w-full">
                  <PDFExportButton jobId="demo-job-id" />
                </div>
                
                <button
                  onClick={() => handleGenerateReport('pdf')}
                  disabled={isGeneratingReport}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                >
                  <FileText className="h-5 w-5" />
                  {isGeneratingReport ? 'Generating...' : 'Legacy PDF Report'}
                </button>

                <button
                  onClick={() => handleGenerateReport('csv')}
                  disabled={isGeneratingReport}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                >
                  <Download className="h-5 w-5" />
                  {isGeneratingReport ? 'Generating...' : 'CSV Data Export'}
                </button>

                <button
                  onClick={() => handleGenerateReport('json')}
                  disabled={isGeneratingReport}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                >
                  <Download className="h-5 w-5" />
                  {isGeneratingReport ? 'Generating...' : 'JSON Data Export'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/detection"
              className="group flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
            >
              <Activity className="h-6 w-6 text-blue-600 group-hover:animate-pulse" />
              <span className="font-semibold text-gray-900">New Detection</span>
            </a>
            
            <a
              href="/integrated-detection?tab=analytics"
              className="group flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
            >
              <BarChart3 className="h-6 w-6 text-green-600 group-hover:animate-pulse" />
              <span className="font-semibold text-gray-900">View Analytics</span>
            </a>
            
            <a
              href="/integrated-detection?tab=profiles"
              className="group flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
            >
              <FileText className="h-6 w-6 text-purple-600 group-hover:animate-pulse" />
              <span className="font-semibold text-gray-900">Manage Profiles</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}