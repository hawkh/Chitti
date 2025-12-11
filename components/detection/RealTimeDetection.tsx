'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, Play, Square, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';
import { RealDefectDetector } from '@/services/ai/RealDefectDetector';
import { DetectionResult } from '@/types';
import { ComplianceChecker } from '@/components/compliance/ComplianceChecker';
import { DefectProfile } from '@/components/defect-library/DefectProfile';

export interface RealTimeDetectionProps {
  mode?: 'standalone' | 'embedded';
  onSave?: (result: DetectionResult, imageBlob: Blob) => void;
}

export default function RealTimeDetection({ mode = 'standalone', onSave }: RealTimeDetectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedDefect, setSelectedDefect] = useState<string | null>(null);
  const [showCompliance, setShowCompliance] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<RealDefectDetector | null>(null);

  if (typeof window !== 'undefined' && !detectorRef.current) {
    detectorRef.current = new RealDefectDetector();
  }

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null);
    }
  }, []);

  const handleDetection = useCallback(async () => {
    if (!selectedFile || !imageRef.current || !detectorRef.current) return;

    setIsProcessing(true);
    try {
      const detectionResult = await detectorRef.current!.detectDefects(imageRef.current);
      setResult(detectionResult);

      // Ensure canvas is ready before drawing
      setTimeout(() => {
        drawDetections(detectionResult);
      }, 100);
    } catch (error) {
      console.error('Detection failed:', error);
      alert('Detection failed. Please check the backend connection.');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile]);

  const drawDetections = (detectionResult: DetectionResult) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) {
      console.log('Canvas or image not ready');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;

    // Draw the image first
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const defectsToDraw = (detectionResult.detectedDefects && detectionResult.detectedDefects.length > 0)
      ? detectionResult.detectedDefects
      : detectionResult.defects;

    console.log('Drawing detections:', defectsToDraw.length);

    defectsToDraw.forEach((defect: any, index) => {
      // Handle both structure types (legacy Defect and new DetectedDefect)
      const location = defect.boundingBox || defect.location;
      const { x, y, width, height } = location;
      const labelName = defect.defectType ? defect.defectType.name : defect.type;

      console.log('Drawing defect:', labelName, { x, y, width, height });

      // Draw bounding box
      ctx.strokeStyle = defect.confidence > 0.8 ? '#ef4444' : '#f59e0b';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // Draw label background
      ctx.fillStyle = defect.confidence > 0.8 ? '#ef4444' : '#f59e0b';
      ctx.font = 'bold 14px Arial';
      const label = `${labelName} (${(defect.confidence * 100).toFixed(1)}%)`;
      const textWidth = ctx.measureText(label).width;

      ctx.fillRect(x, y - 25, textWidth + 10, 20);
      ctx.fillStyle = 'white';
      ctx.fillText(label, x + 5, y - 8);
    });
  };

  const handleSave = useCallback(() => {
    if (!result || !canvasRef.current || !onSave) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        onSave(result, blob);
      }
    }, 'image/jpeg', 0.9);
  }, [result, onSave]);

  return (
    <div className={`max-w-6xl mx-auto p-6 space-y-6 ${mode === 'embedded' ? 'p-0 shadow-none' : ''}`}>
      <div className={`bg-white rounded-lg ${mode === 'standalone' ? 'shadow-lg p-6' : ''}`}>
        {mode === 'standalone' && <h2 className="text-2xl font-bold mb-6">Real-Time Defect Detection</h2>}

        {/* File Upload */}
        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Upload size={20} />
            Select Image
          </button>
        </div>

        {/* Image Preview and Detection */}
        {previewUrl && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Original Image</h3>
              <div className="relative border rounded-lg overflow-hidden">
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Original"
                  className="w-full h-auto"
                  onLoad={() => {
                    if (canvasRef.current && imageRef.current) {
                      canvasRef.current.width = imageRef.current.width;
                      canvasRef.current.height = imageRef.current.height;
                    }
                  }}
                />
              </div>

              <button
                onClick={handleDetection}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Square size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    Detect Defects
                  </>
                )}
              </button>
            </div>

            {/* Detection Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Detection Results</h3>
              {result ? (
                <>
                  <div className="relative border rounded-lg overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-auto"
                    />
                  </div>

                  {/* Results Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {result.overallStatus === 'pass' ? (
                        <CheckCircle className="text-green-600" size={20} />
                      ) : (
                        <AlertTriangle className="text-red-600" size={20} />
                      )}
                      <span className="font-semibold">
                        Status: {result.overallStatus.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p>Defects Found: {result.defects.length}</p>
                      <p>Processing Time: {result.processingTime.toFixed(0)}ms</p>

                      {result.defects.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Detected Defects:</h4>
                          <div className="space-y-2">
                            {(result.detectedDefects && result.detectedDefects.length > 0 ? result.detectedDefects : result.defects).map((defect: any, index) => (
                              <div key={defect.id} className="bg-white p-3 rounded border">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium">
                                      {defect.defectType ? defect.defectType.name : defect.type}
                                    </p>
                                    <p className="text-gray-600 text-xs">{defect.description}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium">
                                      {(defect.confidence * 100).toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-gray-500">{defect.severity}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setSelectedDefect(defect.defectType ? defect.defectType.id : defect.type)}
                                  className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                >
                                  <BookOpen size={12} />
                                  Learn More
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {mode === 'embedded' && onSave && (
                      <button
                        onClick={handleSave}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"
                      >
                        <CheckCircle size={20} />
                        Save & Attach to Audit
                      </button>
                    )}

                    <button
                      onClick={() => setShowCompliance(!showCompliance)}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      {showCompliance ? 'Hide' : 'Show'} Compliance Check
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                  Upload an image and click "Detect Defects" to see results
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compliance Checker */}
        {result && showCompliance && (
          <div className="mt-6">
            <ComplianceChecker
              detections={result.defects.map(d => ({
                id: d.id,
                inspectionId: 'temp',
                defectType: d.type,
                bbox: [d.location.x, d.location.y, d.location.width, d.location.height],
                confidence: d.confidence,
                measurements: {},
                severity: d.severity as any,
                aiGenerated: true
              }))}
            />
          </div>
        )}

        {/* Defect Profile Modal */}
        {selectedDefect && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold">Defect Information</h3>
                <button
                  onClick={() => setSelectedDefect(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <DefectProfile defectType={selectedDefect} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}