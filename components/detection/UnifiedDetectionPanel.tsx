'use client';

import React, { useState } from 'react';
import { Brain, Cloud, TestTube, Zap, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useUnifiedDetector } from '@/hooks/useUnifiedDetector';
import { DetectionMode } from '@/services/ai/UnifiedDefectDetector';
import { DefectVisualization } from './DefectVisualization';
import FileUpload from '@/components/upload/FileUpload';
import { DetectionResult, ProcessingFile, DefectType, MaterialType } from '@/types';
import { SUPPORTED_IMAGE_FORMATS, MAX_FILE_SIZE } from '@/lib/constants';

export default function UnifiedDetectionPanel() {
    const { mode, isInitializing, isReady, error, switchMode, detect } = useUnifiedDetector({
        autoInitialize: true
    });

    const [uploadedFiles, setUploadedFiles] = useState<ProcessingFile[]>([]);
    const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleModeSwitch = async (newMode: DetectionMode) => {
        if (!isProcessing) {
            await switchMode(newMode);
            setDetectionResults([]); // Clear previous results when switching modes
        }
    };

    const handleFilesSelected = (files: ProcessingFile[]) => {
        setUploadedFiles(files);
        setDetectionResults([]);
    };

    const processFiles = async () => {
        if (!isReady || uploadedFiles.length === 0) return;

        setIsProcessing(true);
        const results: DetectionResult[] = [];

        try {
            for (const file of uploadedFiles) {
                const config = {
                    componentType: {
                        id: 'welded',
                        name: 'Welded Joint',
                        description: 'Welded metal joints',
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

                const result = await detect(file.file, config);
                if (result) {
                    results.push(result);
                }
            }

            setDetectionResults(results);
        } catch (err) {
            console.error('Error processing files:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const getModeIcon = (detectionMode: DetectionMode) => {
        switch (detectionMode) {
            case DetectionMode.TFJS:
                return <Brain className="w-5 h-5" />;
            case DetectionMode.BACKEND:
                return <Cloud className="w-5 h-5" />;
            case DetectionMode.MOCK:
                return <TestTube className="w-5 h-5" />;
        }
    };

    const getModeColor = (detectionMode: DetectionMode) => {
        switch (detectionMode) {
            case DetectionMode.TFJS:
                return 'bg-green-500 hover:bg-green-600';
            case DetectionMode.BACKEND:
                return 'bg-blue-500 hover:bg-blue-600';
            case DetectionMode.MOCK:
                return 'bg-orange-500 hover:bg-orange-600';
        }
    };

    const getModeDescription = (detectionMode: DetectionMode) => {
        switch (detectionMode) {
            case DetectionMode.TFJS:
                return 'Client-side AI (TensorFlow.js)';
            case DetectionMode.BACKEND:
                return 'Server-side API';
            case DetectionMode.MOCK:
                return 'Mock API (Testing)';
        }
    };

    return (
        <div className="space-y-6">
            {/* Mode Selector */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Detection Mode</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[DetectionMode.TFJS, DetectionMode.BACKEND, DetectionMode.MOCK].map((detectionMode) => (
                        <button
                            key={detectionMode}
                            onClick={() => handleModeSwitch(detectionMode)}
                            disabled={isInitializing || isProcessing}
                            className={`
                p-4 rounded-lg border-2 transition-all
                ${mode === detectionMode
                                    ? `${getModeColor(detectionMode)} text-white border-transparent shadow-lg scale-105`
                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
                        >
                            <div className="flex items-center justify-center space-x-2 mb-2">
                                {getModeIcon(detectionMode)}
                                <span className="font-semibold uppercase text-sm">{detectionMode}</span>
                            </div>
                            <p className="text-xs opacity-90">{getModeDescription(detectionMode)}</p>
                        </button>
                    ))}
                </div>

                {/* Status Indicator */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {isInitializing ? (
                                <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                            ) : isReady ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : error ? (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-gray-400" />
                            )}

                            <div>
                                <p className="font-medium text-gray-900">
                                    {isInitializing ? 'Initializing...' : isReady ? 'Ready' : error ? 'Error' : 'Not Ready'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {isReady ? `Using ${mode.toUpperCase()} mode` : error || 'Waiting for initialization'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 px-3 py-1 bg-white rounded-full border">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-700">
                                {mode === DetectionMode.TFJS ? 'Client-Side' : 'Server-Side'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Console Hint */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-blue-900">Console Logging Enabled</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            Open your browser console (F12) to see detailed logs showing which detection method is being used:
                            🧠 TFJS, 🌐 Backend, or 🎭 Mock mode
                        </p>
                    </div>
                </div>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Images</h2>

                <FileUpload
                    onFilesSelected={handleFilesSelected}
                    acceptedFormats={SUPPORTED_IMAGE_FORMATS}
                    maxFileSize={MAX_FILE_SIZE}
                    maxFiles={10}
                    supportsBatch={true}
                    disabled={!isReady}
                />

                {uploadedFiles.length > 0 && (
                    <div className="mt-6">
                        <button
                            onClick={processFiles}
                            disabled={!isReady || isProcessing}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    {getModeIcon(mode)}
                                    <span>Run Detection ({uploadedFiles.length} files)</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Detection Results */}
            {detectionResults.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">Detection Results</h2>

                    {detectionResults.map((result) => (
                        <div key={result.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div className="p-4 border-b bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-gray-900">{result.fileName}</h3>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span className="flex items-center space-x-1">
                                            {getModeIcon(mode)}
                                            <span className="uppercase font-medium">{mode}</span>
                                        </span>
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
