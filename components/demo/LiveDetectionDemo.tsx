'use client';

import React, { useState, useRef } from 'react';
import { Camera, Zap } from 'lucide-react';
import { RealDefectDetector } from '@/services/ai/RealDefectDetector';

export default function LiveDetectionDemo() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detector = useRef(new RealDefectDetector());

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
  };

  const captureFromCamera = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(video, 0, 0);
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const detectionResult = await detector.current.detectDefects(imageData);
        setResult(detectionResult);
        drawDetections(detectionResult, video);
      }
    }
    setIsProcessing(false);
  };

  const sampleImages = [
    { name: 'Metal Crack', url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop' },
    { name: 'Corrosion', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop' },
    { name: 'Surface Defect', url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop' }
  ];

  const handleSampleImage = async (imageUrl: string) => {
    setIsProcessing(true);
    setResult(null);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        if (imageRef.current && canvasRef.current) {
          imageRef.current.src = imageUrl;
          const detectionResult = await detector.current.detectDefects(img);
          setResult(detectionResult);
          drawDetections(detectionResult, img);
        }
      };
      img.src = imageUrl;
    } catch (error) {
      console.error('Detection failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const drawDetections = (detectionResult: any, source: HTMLImageElement | HTMLVideoElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = source instanceof HTMLImageElement ? source.width : source.videoWidth;
    const height = source instanceof HTMLImageElement ? source.height : source.videoHeight;
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.drawImage(source, 0, 0);
    
    detectionResult.defects.forEach((defect: any) => {
      const { x, y, width, height } = defect.location;
      
      ctx.strokeStyle = defect.confidence > 0.8 ? '#ef4444' : '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      ctx.fillStyle = defect.confidence > 0.8 ? '#ef4444' : '#f59e0b';
      ctx.font = '12px Arial';
      const label = `${defect.type} (${(defect.confidence * 100).toFixed(0)}%)`;
      
      ctx.fillRect(x, y - 20, ctx.measureText(label).width + 8, 16);
      ctx.fillStyle = 'white';
      ctx.fillText(label, x + 4, y - 6);
    });
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-900/30 rounded-lg">
          <Zap className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Live AI Detection Demo</h3>
          <p className="text-gray-400">Try our AI model with sample images</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Camera className="w-5 h-5" />
              Start Camera
            </button>
          ) : (
            <>
              <button
                onClick={captureFromCamera}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Zap className="w-5 h-5" />
                Detect Now
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Stop Camera
              </button>
            </>
          )}
        </div>

        {isCameraActive && (
          <div className="relative rounded-lg overflow-hidden border-2 border-gray-700 mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {sampleImages.map((sample, index) => (
          <button
            key={index}
            onClick={() => handleSampleImage(sample.url)}
            disabled={isProcessing}
            className="relative group overflow-hidden rounded-lg border-2 border-gray-800 hover:border-red-500 transition-colors disabled:opacity-50"
          >
            <img
              src={sample.url}
              alt={sample.name}
              className="w-full h-32 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
              <p className="text-white text-sm font-medium">{sample.name}</p>
            </div>
          </button>
        ))}
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2 text-white">Original Image</h4>
            <img ref={imageRef} className="w-full rounded-lg border" alt="Original" />
          </div>
          
          <div>
            <h4 className="font-semibold mb-2 text-white">Detection Results</h4>
            <canvas ref={canvasRef} className="w-full rounded-lg border" />
            
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-300">Status:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  result.overallStatus === 'pass' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {result.overallStatus.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-300">Defects Found:</span>
                <span className="text-white">{result.defects.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-300">Processing Time:</span>
                <span className="text-white">{result.processingTime.toFixed(0)}ms</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-red-500">
            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            Processing with AI model...
          </div>
        </div>
      )}
    </div>
  );
}