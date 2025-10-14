'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, Play, Square, AlertTriangle, CheckCircle } from 'lucide-react';
import { RealDefectDetector } from '@/services/ai/RealDefectDetector';
import { DetectionResult } from '@/types';

export default function RealTimeDetection() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<RealDefectDetector>(new RealDefectDetector());

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
    if (!selectedFile || !imageRef.current) return;

    setIsProcessing(true);
    try {
      const detectionResult = await detectorRef.current.detectDefects(imageRef.current);
      setResult(detectionResult);
      drawDetections(detectionResult);
    } catch (error) {
      console.error('Detection failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile]);

  const drawDetections = (detectionResult: DetectionResult) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;
    
    ctx.drawImage(image, 0, 0);
    
    detectionResult.defects.forEach((defect, index) => {
      const { x, y, width, height } = defect.location;
      
      // Draw bounding box
      ctx.strokeStyle = defect.confidence > 0.8 ? '#ef4444' : '#f59e0b';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);
      
      // Draw label
      ctx.fillStyle = defect.confidence > 0.8 ? '#ef4444' : '#f59e0b';
      ctx.font = '14px Arial';
      const label = `${defect.type} (${(defect.confidence * 100).toFixed(1)}%)`;
      const textWidth = ctx.measureText(label).width;
      
      ctx.fillRect(x, y - 25, textWidth + 10, 20);
      ctx.fillStyle = 'white';
      ctx.fillText(label, x + 5, y - 8);
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Real-Time Defect Detection</h2>
        
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
                            {result.defects.map((defect, index) => (
                              <div key={defect.id} className="bg-white p-3 rounded border">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{defect.type}</p>
                                    <p className="text-gray-600 text-xs">{defect.description}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium">
                                      {(defect.confidence * 100).toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-gray-500">{defect.severity}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
      </div>
    </div>
  );
}