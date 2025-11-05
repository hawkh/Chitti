'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Brain, Zap, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { ModelManager } from '@/services/ai/ModelManager';
import { YOLODefectDetector } from '@/services/ai/YOLODefectDetector';
import { DefectVisualization } from './DefectVisualization';
import FileUpload from '@/components/upload/FileUpload';
import { DetectionResult, ProcessingFile, DefectType, MaterialType } from '@/types';
import { SUPPORTED_IMAGE_FORMATS, MAX_FILE_SIZE } from '@/lib/constants';

interface ClientSideDetectionProps {
  className?: string;
}

interface ModelStatus {
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  modelName: string | null;
}

export default function ClientSideDetection({ className = '' }: ClientSideDetectionProps) {
  const [modelStatus, setModelStatus] = useState<ModelStatus>({
    isLoading: false,
    isLoaded: false,
    error: null,
    modelName: null
  });
  
  const [detector, setDetector] = useState<YOLODefectDetector | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<ProcessingFile[]>([]);
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Initialize model on component mount
  useEffect(() => {
    initializeModel();
  }, []);

  const initializeModel = async () => {
    try {
      setModelStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('Initializing ModelManager...');
      const modelManager = ModelManager.getInstance();
      await modelManager.initialize();
      
      console.log('Loading YOLO detector...');
      const yoloDetector = await modelManager.loadModel();
      
      setDetector(yoloDetector);
      setModelStatus({
        isLoading: false,
        isLoaded: true,
        error: null,
        modelName: modelManager.getDefaultModelName()
      });
      
      console.log('Client-side model loaded successfully!');
      
    } catch (error) {
      console.error('Failed to initialize model:', error);
      setModelStatus({
        isLoading: false,
        isLoaded: false,
        error: error instanceof Error ? error.message : 'Failed to load model',
        modelName: null
      });
    }
  };

  const handleFilesSelected = useCallback((files: ProcessingFile[]) => {
    setUploadedFiles(files);
    setDetectionResults([]); // Clear previous results
  }, []);

  const loadSampleImage = async () => {
    try {
      // Create a sample image file from the SVG
      const response = await fetch('/sample-defect.svg');
      const svgText = await response.text();
      
      // Convert SVG to canvas and then to File
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 640;
      const ctx = canvas.getContext('2d')!;
      
      const img = new Image();
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 640, 640);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'sample-defect.png', { type: 'image/png' });
            const processingFile: ProcessingFile = {
              id: `sample_${Date.now()}`,
              file,
              status: 'pending',
              progress: 0
            };
            
            setUploadedFiles([processingFile]);
            setDetectionResults([]);
          }
        }, 'image/png');
        
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
      
    } catch (error) {
      console.error('Failed to load sample image:', error);
    }
  };

  const processFiles = async () => {
    if (!detector || !modelStatus.isLoaded || uploadedFiles.length === 0) {
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    
    const results: DetectionResult[] = [];
    
    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        
        // Update file status
        setUploadedFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'processing', progress: 0 }
            : f
        ));
        
        try {
          console.log(`Processing file ${i + 1}/${uploadedFiles.length}: ${file.file.name}`);
          
          // Create detection config
          const config = {
            componentType: {
              id: 'welded',
              name: 'Welded Joint',
              description: 'Welded metal joints and seams',
              materialType: MaterialType.METAL,
              commonDefects: [DefectType.CRACK, DefectType.VOID, DefectType.DEFORMATION]
            },
            sensitivity: 0.7,
            defectTypes: [
              DefectType.CRACK,
              DefectType.CORROSION,
              DefectType.DEFORMATION,
              DefectType.SURFACE_IRREGULARITY,
              DefectType.INCLUSION,
              DefectType.VOID
            ],
            confidenceThreshold: 0.5
          };
          
          // Run detection
          const result = await detector.detectDefects(file.file, config);
          
          // Update file status to completed
          setUploadedFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { ...f, status: 'completed', progress: 100, result }
              : f
          ));
          
          results.push(result);
          
        } catch (error) {
          console.error(`Error processing file ${file.file.name}:`, error);
          
          // Update file status to error
          setUploadedFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { ...f, status: 'error', progress: 0 }
              : f
          ));
        }
        
        // Update overall progress
        setProcessingProgress(((i + 1) / uploadedFiles.length) * 100);
      }
      
      setDetectionResults(results);
      
    } catch (error) {
      console.error('Batch processing error:', error);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const getStatusIcon = (status: ModelStatus) => {
    if (status.isLoading) {
      return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
    } else if (status.isLoaded) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (status.error) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    return <Brain className="w-5 h-5 text-gray-400" />;
  };

  const getStatusText = (status: ModelStatus) => {
    if (status.isLoading) {
      return 'Loading AI model...';
    } else if (status.isLoaded) {
      return `Model ready: ${status.modelName}`;
    } else if (status.error) {
      return `Error: ${status.error}`;
    }
    return 'Model not loaded';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Model Status */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(modelStatus)}
            <div>
              <h3 className="font-medium text-gray-900">AI Model Status</h3>
              <p className="text-sm text-gray-600">{getStatusText(modelStatus)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">Client-Side Processing</span>
          </div>
        </div>
        
        {modelStatus.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{modelStatus.error}</p>
            <button
              onClick={initializeModel}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Retry Loading Model
            </button>
          </div>
        )}
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Images for Detection</h2>
        
        <FileUpload
          onFilesSelected={handleFilesSelected}
          acceptedFormats={SUPPORTED_IMAGE_FORMATS}
          maxFileSize={MAX_FILE_SIZE}
          maxFiles={10}
          supportsBatch={true}
          disabled={!modelStatus.isLoaded}
        />
        
        {/* Quick Test Button */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">Quick Test</h4>
              <p className="text-sm text-blue-700">Test the model with a sample defect image</p>
            </div>
            <button
              onClick={loadSampleImage}
              disabled={!modelStatus.isLoaded || isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Load Sample Image
            </button>
          </div>
        </div>
        
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">
                Ready to Process ({uploadedFiles.length} files)
              </h3>
              <button
                onClick={processFiles}
                disabled={!modelStatus.isLoaded || isProcessing || uploadedFiles.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    <span>Run AI Detection</span>
                  </>
                )}
              </button>
            </div>
            
            {isProcessing && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Processing files...</span>
                  <span>{Math.round(processingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detection Results */}
      {detectionResults.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Detection Results</h2>
          
          {detectionResults.map((result, index) => (
            <div key={result.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{result.fileName}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Defects: {result.detectedDefects.length}</span>
                    <span>Status: {result.overallStatus.toUpperCase()}</span>
                    <span>Time: {result.processingTime}ms</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <DefectVisualization
                  detectionResult={result}
                  showLabels={true}
                  showConfidence={true}
                  className="h-96"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}