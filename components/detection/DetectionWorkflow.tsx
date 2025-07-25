'use client';

import React, { useState, useCallback } from 'react';
import { Upload, Settings, Play, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import FileUpload from '@/components/upload/FileUpload';
import { BatchResultsVisualization } from './BatchResultsVisualization';
import { DefectVisualization } from './DefectVisualization';
import { DetectionResult, ProcessingFile, DetectionConfig, ComponentProfile, MaterialType, DefectType, ResultStatus, DefectSeverity } from '@/types';

interface DetectionWorkflowProps {
  onDetectionComplete?: (results: DetectionResult[]) => void;
  className?: string;
}

type WorkflowStep = 'upload' | 'configure' | 'processing' | 'results';

export const DetectionWorkflow: React.FC<DetectionWorkflowProps> = ({
  onDetectionComplete,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<ProcessingFile[]>([]);
  const [detectionConfig, setDetectionConfig] = useState<DetectionConfig>({
    componentType: { id: 'general', name: 'General Component', description: 'General purpose detection', materialType: MaterialType.METAL, commonDefects: [] },
    sensitivity: 0.7,
    defectTypes: [DefectType.CRACK, DefectType.CORROSION, DefectType.DEFORMATION],
    confidenceThreshold: 0.5
  });
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleFilesSelected = useCallback(async (files: ProcessingFile[]) => {
    setUploadedFiles(files);
    setCurrentStep('configure');
  }, []);

  const handleFilesSelectedOld = useCallback(async (files: File[]) => {
    // Convert files to ProcessingFile format
    const processingFiles: ProcessingFile[] = files.map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      status: 'pending',
      progress: 0,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setUploadedFiles(processingFiles);
    setCurrentStep('configure');
  }, []);

  const handleStartDetection = useCallback(async () => {
    setIsProcessing(true);
    setCurrentStep('processing');
    setProcessingProgress(0);

    try {
      const results: DetectionResult[] = [];

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        
        // Update file status
        setUploadedFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'processing' } : f
        ));

        // Simulate processing (replace with actual API call)
        const result = await processFile(file, detectionConfig);
        results.push(result);

        // Update progress
        const progress = ((i + 1) / uploadedFiles.length) * 100;
        setProcessingProgress(progress);

        // Update file status
        setUploadedFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'completed', result } : f
        ));
      }

      setDetectionResults(results);
      setCurrentStep('results');
      onDetectionComplete?.(results);

    } catch (error) {
      console.error('Detection processing failed:', error);
      // Handle error state
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFiles, detectionConfig, onDetectionComplete]);

  const handleExportResults = useCallback((format: 'pdf' | 'csv' | 'json') => {
    // Implement export functionality
    console.log(`Exporting results as ${format}`);
  }, []);

  const resetWorkflow = useCallback(() => {
    setCurrentStep('upload');
    setUploadedFiles([]);
    setDetectionResults([]);
    setProcessingProgress(0);
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          {[
            { key: 'upload', label: 'Upload Files', icon: Upload },
            { key: 'configure', label: 'Configure', icon: Settings },
            { key: 'processing', label: 'Processing', icon: Play },
            { key: 'results', label: 'Results', icon: Download }
          ].map((step, index) => {
            const isActive = currentStep === step.key;
            const isCompleted = ['upload', 'configure', 'processing'].indexOf(currentStep) > ['upload', 'configure', 'processing'].indexOf(step.key);
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted ? 'bg-green-500 border-green-500 text-white' :
                  isActive ? 'bg-blue-500 border-blue-500 text-white' :
                  'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={`ml-3 font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
                {index < 3 && (
                  <div className={`mx-4 h-0.5 w-16 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'upload' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Files for Detection</h2>
          <FileUpload
            onFilesSelected={handleFilesSelected}
            acceptedFormats={['image/jpeg', 'image/png', 'image/tiff', 'image/bmp', 'video/mp4', 'video/avi', 'video/mov']}
            maxFileSize={50 * 1024 * 1024} // 50MB
            maxFiles={100}
            supportsBatch={true}
          />
        </div>
      )}

      {currentStep === 'configure' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Configure Detection Parameters</h2>
          <DetectionConfigPanel
            config={detectionConfig}
            onChange={setDetectionConfig}
            uploadedFiles={uploadedFiles}
            onStartDetection={handleStartDetection}
          />
        </div>
      )}

      {currentStep === 'processing' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Processing Files</h2>
          <ProcessingPanel
            files={uploadedFiles}
            progress={processingProgress}
            isProcessing={isProcessing}
          />
        </div>
      )}

      {currentStep === 'results' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Detection Results</h2>
              <button
                onClick={resetWorkflow}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Detection
              </button>
            </div>
          </div>
          <BatchResultsVisualization
            results={detectionResults}
            onExport={handleExportResults}
          />
        </div>
      )}
    </div>
  );
};

interface DetectionConfigPanelProps {
  config: DetectionConfig;
  onChange: (config: DetectionConfig) => void;
  uploadedFiles: ProcessingFile[];
  onStartDetection: () => void;
}

const DetectionConfigPanel: React.FC<DetectionConfigPanelProps> = ({
  config,
  onChange,
  uploadedFiles,
  onStartDetection
}) => {
  const handleConfigChange = (updates: Partial<DetectionConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-6">
      {/* File Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-2">Files to Process</h3>
        <div className="text-sm text-gray-600">
          {uploadedFiles.length} files selected
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {uploadedFiles.slice(0, 5).map(file => (
            <span key={file.id} className="px-2 py-1 bg-white rounded text-xs">
              {file.file.name}
            </span>
          ))}
          {uploadedFiles.length > 5 && (
            <span className="px-2 py-1 bg-white rounded text-xs">
              +{uploadedFiles.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Configuration Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Component Type
          </label>
          <select
            value={config.componentType.id}
            onChange={(e) => {
              // In a real app, you'd fetch the component type details
              const componentType = {
                id: e.target.value,
                name: e.target.options[e.target.selectedIndex].text,
                description: 'Component description',
                materialType: MaterialType.METAL,
                commonDefects: []
              };
              handleConfigChange({ componentType });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="general">General Component</option>
            <option value="casting">Metal Casting</option>
            <option value="welded">Welded Joint</option>
            <option value="machined">Machined Part</option>
            <option value="composite">Composite Material</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sensitivity: {Math.round(config.sensitivity * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={config.sensitivity}
            onChange={(e) => handleConfigChange({ sensitivity: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confidence Threshold: {Math.round(config.confidenceThreshold * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={config.confidenceThreshold}
            onChange={(e) => handleConfigChange({ confidenceThreshold: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Defect Types to Detect
          </label>
          <div className="space-y-2">
            {Object.values(DefectType).map(defectType => (
              <label key={defectType} className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.defectTypes.includes(defectType)}
                  onChange={(e) => {
                    const newDefectTypes = e.target.checked
                      ? [...config.defectTypes, defectType]
                      : config.defectTypes.filter(dt => dt !== defectType);
                    handleConfigChange({ defectTypes: newDefectTypes });
                  }}
                  className="mr-2"
                />
                <span className="text-sm capitalize">{defectType.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Start Detection Button */}
      <div className="flex justify-end">
        <button
          onClick={onStartDetection}
          disabled={uploadedFiles.length === 0 || config.defectTypes.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Start Detection
        </button>
      </div>
    </div>
  );
};

interface ProcessingPanelProps {
  files: ProcessingFile[];
  progress: number;
  isProcessing: boolean;
}

const ProcessingPanel: React.FC<ProcessingPanelProps> = ({
  files,
  progress,
  isProcessing
}) => {
  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* File Processing Status */}
      <div className="space-y-3">
        {files.map(file => (
          <div key={file.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              {file.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {file.status === 'processing' && <Clock className="h-5 w-5 text-blue-500 animate-spin" />}
              {file.status === 'pending' && <Clock className="h-5 w-5 text-gray-400" />}
              {file.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {file.file.name}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {file.status}
              </div>
            </div>
            {file.result && (
              <div className="text-xs text-gray-600">
                {file.result.detectedDefects.length} defects found
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Mock function to simulate file processing
async function processFile(file: ProcessingFile, config: DetectionConfig): Promise<DetectionResult> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Mock detection result
  const mockDefects = Math.random() > 0.5 ? [
    {
      id: `defect-${Date.now()}`,
      defectType: {
        id: 'crack',
        name: 'Crack',
        description: 'Linear discontinuity in the material structure',
        category: 'structural',
        severity: config.defectTypes.includes(DefectType.CRACK) ? DefectSeverity.HIGH : DefectSeverity.LOW
      },
      confidence: 0.7 + Math.random() * 0.3,
      boundingBox: {
        x: Math.random() * 400,
        y: Math.random() * 300,
        width: 50 + Math.random() * 100,
        height: 20 + Math.random() * 50
      },
      severity: DefectSeverity.HIGH,
      description: 'Detected crack in material',
      affectedArea: Math.random() * 10
    }
  ] : [];

  return {
    id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    fileName: file.file.name,
    defects: [], // Legacy format
    detectedDefects: mockDefects,
    overallStatus: mockDefects.length > 0 ? ResultStatus.FAIL : ResultStatus.PASS,
    processingTime: 1000 + Math.random() * 2000,
    timestamp: new Date(),
    imageUrl: file.preview,
    originalImageUrl: file.preview,
    thumbnailUrl: file.preview,
    metadata: {
      imageSize: { width: 800, height: 600 },
      fileSize: file.file.size,
      format: file.file.type
    }
  };
}