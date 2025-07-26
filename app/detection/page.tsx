'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Upload } from 'lucide-react';
import FileUpload from '@/components/upload/FileUpload';
import { DefectVisualization } from '@/components/detection/DefectVisualization';
import { ResultsDashboard } from '@/components/dashboard/ResultsDashboard';
import { YOLODefectDetector } from '@/services/ai/YOLODefectDetector';
import { ModelManager } from '@/services/ai/ModelManager';
import { ReportGenerator } from '@/services/report/ReportGenerator';
import { ReportExporter } from '@/services/report/ReportExporter';
import { AuditLogger } from '@/services/AuditLogger';
import { ProcessingFile, DetectionResult, DetectionConfig, MaterialType, DefectType, ComponentProfile } from '@/types';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const DEFAULT_DETECTION_CONFIG: DetectionConfig = {
  componentType: {
    id: 'general',
    name: 'General Component',
    description: 'General purpose component inspection',
    materialType: MaterialType.METAL,
    commonDefects: [DefectType.CRACK, DefectType.CORROSION, DefectType.DEFORMATION]
  },
  sensitivity: 0.7,
  defectTypes: [DefectType.CRACK, DefectType.CORROSION, DefectType.DEFORMATION],
  confidenceThreshold: 0.7
};

export default function DetectionPage() {
  const [detector, setDetector] = useState<YOLODefectDetector | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<ProcessingFile[]>([]);
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedResult, setSelectedResult] = useState<DetectionResult | null>(null);

  // Initialize YOLO detector
  useEffect(() => {
    const initializeDetector = async () => {
      try {
        setIsInitializing(true);
        setInitError(null);

        const auditLogger = AuditLogger.getInstance();
        auditLogger.log('system', AuditLogger.ACTIONS.MODEL_LOAD, { model: 'yolo-defect-detector' });

        // Initialize model manager
        const modelManager = ModelManager.getInstance();
        await modelManager.initialize();

        // Load the default model
        const yoloDetector = await modelManager.loadModel();

        setDetector(yoloDetector);
        console.log('YOLO detector initialized successfully');
      } catch (error) {
        console.error('Failed to initialize YOLO detector:', error);
        setInitError(error instanceof Error ? error.message : 'Failed to initialize AI model. Please check if model files are available.');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeDetector();

    // Cleanup on unmount
    return () => {
      ModelManager.getInstance().unloadAllModels();
    };
  }, []);

  const handleFilesSelected = (files: ProcessingFile[]) => {
    setUploadedFiles(files);
    const auditLogger = AuditLogger.getInstance();
    auditLogger.log('user', AuditLogger.ACTIONS.FILE_UPLOAD, { 
      fileCount: files.length,
      fileNames: files.map(f => f.file.name)
    });
  };

  const processFiles = async () => {
    if (!detector || uploadedFiles.length === 0) return;

    setIsProcessing(true);
    const results: DetectionResult[] = [];
    const auditLogger = AuditLogger.getInstance();

    auditLogger.log('user', AuditLogger.ACTIONS.DETECTION_START, {
      fileCount: uploadedFiles.length,
      config: DEFAULT_DETECTION_CONFIG
    });

    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];

        // Update file status
        file.status = 'processing';
        file.progress = 0;
        setUploadedFiles([...uploadedFiles]);

        try {
          // Process the file
          const result = await detector.detectDefects(file.file, DEFAULT_DETECTION_CONFIG);

          // Update file status
          file.status = 'completed';
          file.progress = 100;
          file.result = result;

          results.push(result);

        } catch (error) {
          console.error(`Failed to process file ${file.file.name}:`, error);
          file.status = 'error';
          file.progress = 0;
        }

        // Update progress
        setUploadedFiles([...uploadedFiles]);
      }

      setDetectionResults(prev => [...prev, ...results]);
      
      auditLogger.log('user', AuditLogger.ACTIONS.DETECTION_COMPLETE, {
        processedFiles: results.length,
        totalDefects: results.reduce((sum, r) => sum + r.detectedDefects.length, 0)
      });

    } catch (error) {
      console.error('Batch processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResultSelect = (result: DetectionResult) => {
    setSelectedResult(result);
  };

  const handleExportResults = async (format: 'pdf' | 'json' | 'csv') => {
    if (detectionResults.length === 0) return;

    try {
      const reportGenerator = new ReportGenerator();
      const reportExporter = new ReportExporter();

      // Create a mock profile for the report
      const mockProfile: ComponentProfile = {
        id: 'default-profile',
        name: 'General Component Inspection',
        materialType: MaterialType.METAL,
        criticalDefects: [DefectType.CRACK, DefectType.CORROSION, DefectType.DEFORMATION],
        defaultSensitivity: 0.7,
        qualityStandards: ['ISO 9001'],
        customParameters: {
          description: 'Default inspection profile',
          applicableDefectTypes: [DefectType.CRACK, DefectType.CORROSION, DefectType.DEFORMATION],
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

      const report = reportGenerator.generateInspectionReport(
        detectionResults,
        mockProfile,
        {
          title: 'Defect Detection Results',
          includeRecommendations: true
        }
      );

      await reportExporter.downloadReport(report, format);
    } catch (error) {
      console.error('Failed to export results:', error);
    }
  };

  const clearResults = () => {
    setDetectionResults([]);
    setSelectedResult(null);
    setUploadedFiles([]);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner 
          size="lg" 
          text="Loading YOLO defect detection model..." 
          className="text-center"
        />
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Initialization Failed</h2>
          <p className="text-gray-600 mb-4">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Defect Detection</h1>
          <p className="text-gray-600">Upload images or videos to detect defects using AI-powered analysis</p>
        </div>

        {/* Status Indicator */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-700 font-medium">AI Model Ready</span>
          <span className="text-gray-500">• YOLO Defect Detector v1.0</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h2>

              <FileUpload
                onFilesSelected={handleFilesSelected}
                acceptedFormats={['image/jpeg', 'image/png', 'image/webp', 'video/mp4']}
                maxFileSize={50 * 1024 * 1024} // 50MB
                maxFiles={10}
                supportsBatch={true}
                disabled={isProcessing}
              />

              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">
                      {uploadedFiles.length} file(s) ready
                    </span>
                    <button
                      onClick={processFiles}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {isProcessing ? 'Processing...' : 'Start Detection'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {selectedResult ? (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Detection Results</h2>
                    <button
                      onClick={() => setSelectedResult(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Back to List
                    </button>
                  </div>
                </div>
                <DefectVisualization
                  detectionResult={selectedResult}
                  showLabels={true}
                  showConfidence={true}
                  className="h-96"
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Detection History ({detectionResults.length})
                    </h2>
                    {detectionResults.length > 0 && (
                      <button
                        onClick={clearResults}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {detectionResults.length > 0 ? (
                  <ResultsDashboard
                    results={detectionResults}
                    onResultSelect={handleResultSelect}
                    onExport={handleExportResults}
                    filters={{
                      dateRange: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() },
                      defectTypes: [],
                      severityLevels: [],
                      status: []
                    }}
                  />
                ) : (
                  <div className="p-12 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
                    <p className="text-gray-600">Upload and process files to see detection results here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}