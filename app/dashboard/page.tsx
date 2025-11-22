'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, Activity, TrendingUp, Download, Sparkles, CheckCircle, XCircle, Clock } from 'lucide-react';
import { DetectionResult, ResultStatus, DefectSeverity, ComponentProfile, MaterialType, DefectType } from '@/types';
import { ReportGenerator } from '@/services/report/ReportGenerator';
import { ReportExporter } from '@/services/report/ReportExporter';
import { AuditLogger } from '@/services/AuditLogger';
import PDFExportButton from '@/components/export/PDFExportButton';

const mockResults: DetectionResult[] = [
  {
    id: 'result-1',
    fileName: 'component-001.jpg',
    defects: [],
    detectedDefects: [],
    overallStatus: ResultStatus.PASS,
    processingTime: 1200,
    timestamp: new Date(Date.now() - 86400000),
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
    timestamp: new Date(Date.now() - 43200000),
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
      
      const report = await reportGenerator.generateInspectionReport(
        results,
        mockProfile,
        {
          title: 'NDT Inspection Report',
          includeRecommendations: true,
          dateRange: {
            from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-600/50 animate-pulse-slow">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-amber-200 via-orange-100 to-amber-300 bg-clip-text text-transparent">Analytics Dashboard</h1>
              <p className="text-amber-200 mt-2 text-lg font-medium">Real-time insights into your quality control operations</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="stat-card group border-2 border-zinc-800 hover:border-amber-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Total Inspections</p>
                <p className="text-5xl font-black text-amber-100">{stats.totalInspections}</p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-600/50 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                <Activity className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="stat-card group border-2 border-zinc-800 hover:border-emerald-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Pass Rate</p>
                <p className="text-5xl font-black text-amber-100">{passRate.toFixed(1)}%</p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-600/50 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="stat-card group border-2 border-zinc-800 hover:border-rose-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">Failed Inspections</p>
                <p className="text-5xl font-black text-amber-100">{stats.failedInspections}</p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-br from-rose-600 to-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-600/50 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                <XCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="stat-card group border-2 border-zinc-800 hover:border-amber-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Avg Processing</p>
                <p className="text-5xl font-black text-amber-100">{stats.avgProcessingTime.toFixed(1)}s</p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-600/50 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-zinc-900/60 backdrop-blur-sm rounded-2xl shadow-xl border border-zinc-800">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-amber-100">Recent Inspections</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {results.slice(0, 5).map((result) => (
                  <div key={result.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-zinc-950/80 to-neutral-950/30 hover:from-zinc-900 hover:to-zinc-800 rounded-xl border border-zinc-800 hover:border-amber-700 transition-all hover:shadow-md">
                    <div className="flex items-center space-x-4">
                      {result.overallStatus === 'pass' ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                      <div>
                        <p className="font-semibold text-amber-100">{result.fileName}</p>
                        <p className="text-sm text-amber-200">
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
                      <p className="text-xs text-amber-600 mt-1">
                        {(result.processingTime / 1000).toFixed(1)}s
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/60 backdrop-blur-sm rounded-2xl shadow-xl border border-zinc-800">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-amber-100">Export Reports</h2>
            </div>
            <div className="p-6">
              <p className="text-amber-200 mb-6">
                Professional reports for compliance, analysis, and stakeholder communication.
              </p>
              
              <div className="space-y-3">
                <div className="w-full">
                  <PDFExportButton jobId="demo-job-id" />
                </div>
                
                <button
                  onClick={() => handleGenerateReport('pdf')}
                  disabled={isGeneratingReport}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-gradient-to-r from-zinc-800 to-neutral-800 text-amber-100 rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold border border-zinc-700"
                >
                  <FileText className="h-5 w-5" />
                  {isGeneratingReport ? 'Generating...' : 'Legacy PDF Report'}
                </button>

                <button
                  onClick={() => handleGenerateReport('csv')}
                  disabled={isGeneratingReport}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-gradient-to-r from-zinc-800 to-neutral-800 text-amber-100 rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold border border-zinc-700"
                >
                  <Download className="h-5 w-5" />
                  {isGeneratingReport ? 'Generating...' : 'CSV Data Export'}
                </button>

                <button
                  onClick={() => handleGenerateReport('json')}
                  disabled={isGeneratingReport}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-gradient-to-r from-zinc-800 to-neutral-800 text-amber-100 rounded-xl hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold border border-zinc-700"
                >
                  <Download className="h-5 w-5" />
                  {isGeneratingReport ? 'Generating...' : 'JSON Data Export'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-zinc-900/60 backdrop-blur-sm rounded-2xl shadow-xl border border-zinc-800 p-8">
          <h2 className="text-2xl font-bold text-amber-100 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/detection"
              className="group flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-br from-zinc-900 to-neutral-950 border-2 border-zinc-800 rounded-xl hover:shadow-lg hover:scale-105 hover:border-amber-700 transition-all"
            >
              <Activity className="h-6 w-6 text-amber-500 group-hover:animate-pulse" />
              <span className="font-semibold text-amber-100">New Detection</span>
            </a>
            
            <a
              href="/integrated-detection?tab=analytics"
              className="group flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-br from-zinc-900 to-neutral-950 border-2 border-zinc-800 rounded-xl hover:shadow-lg hover:scale-105 hover:border-amber-700 transition-all"
            >
              <BarChart3 className="h-6 w-6 text-amber-500 group-hover:animate-pulse" />
              <span className="font-semibold text-amber-100">View Analytics</span>
            </a>
            
            <a
              href="/integrated-detection?tab=profiles"
              className="group flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-br from-zinc-900 to-neutral-950 border-2 border-zinc-800 rounded-xl hover:shadow-lg hover:scale-105 hover:border-amber-700 transition-all"
            >
              <FileText className="h-6 w-6 text-amber-500 group-hover:animate-pulse" />
              <span className="font-semibold text-amber-100">Manage Profiles</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
