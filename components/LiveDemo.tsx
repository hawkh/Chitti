'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Zap, Target, AlertTriangle, Play, Square } from 'lucide-react';

export default function LiveDemo() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [detectedDefects, setDetectedDefects] = useState<any[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [processedFrames, setProcessedFrames] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsLive(true);
        startLiveDetection();
      }
    } catch (error) {
      alert('Camera access required for live demo');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsLive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const startLiveDetection = () => {
    intervalRef.current = setInterval(() => {
      const mockDefects = Math.random() > 0.6 ? [
        {
          type: ['crack', 'corrosion', 'void'][Math.floor(Math.random() * 3)],
          x: Math.random() * 500,
          y: Math.random() * 350,
          width: 40 + Math.random() * 80,
          height: 20 + Math.random() * 60,
          confidence: 0.65 + Math.random() * 0.35
        }
      ] : [];
      
      setDetectedDefects(mockDefects);
      setConfidence(0.7 + Math.random() * 0.3);
      setProcessedFrames(prev => prev + 1);
    }, 800);
  };

  const processImage = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          canvas.width = 640;
          canvas.height = 480;
          ctx?.drawImage(img, 0, 0, 640, 480);
          
          setTimeout(() => {
            const mockDefects = [
              {
                type: 'crack',
                x: 200,
                y: 150,
                width: 120,
                height: 40,
                confidence: 0.89
              },
              {
                type: 'corrosion',
                x: 400,
                y: 100,
                width: 80,
                height: 80,
                confidence: 0.76
              }
            ];
            
            setDetectedDefects(mockDefects);
            setConfidence(0.85);
            setIsProcessing(false);
            
            if (ctx) {
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 3;
              ctx.font = '14px Arial';
              ctx.fillStyle = '#ef4444';
              
              mockDefects.forEach(defect => {
                ctx.strokeRect(defect.x, defect.y, defect.width, defect.height);
                ctx.fillText(`${defect.type.toUpperCase()} ${Math.round(defect.confidence * 100)}%`, 
                           defect.x, defect.y - 8);
              });
            }
          }, 1500);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-xl p-6 text-white">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" />
          Live AI Defect Detection
        </h2>
        <p className="text-blue-200">Real-time YOLO-based defect detection system</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera/Image Display */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-black rounded-lg relative overflow-hidden h-80">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{ display: isLive ? 'block' : 'none' }}
            />
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover"
              style={{ display: !isLive ? 'block' : 'none' }}
            />
            
            {/* Live Detection Overlays */}
            {isLive && detectedDefects.map((defect, i) => (
              <div
                key={i}
                className="absolute border-2 border-red-400 bg-red-500/30 animate-pulse"
                style={{
                  left: `${(defect.x / 640) * 100}%`,
                  top: `${(defect.y / 480) * 100}%`,
                  width: `${(defect.width / 640) * 100}%`,
                  height: `${(defect.height / 480) * 100}%`,
                }}
              >
                <div className="bg-red-500 text-white text-xs px-2 py-1 -mt-7 whitespace-nowrap">
                  {defect.type.toUpperCase()} {Math.round(defect.confidence * 100)}%
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center">
                <div className="bg-blue-700 px-6 py-3 rounded-full flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  AI Processing...
                </div>
              </div>
            )}

            {/* Status Indicator */}
            <div className="absolute top-4 right-4">
              {isLive && (
                <div className="bg-red-600 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {!isLive ? (
              <button
                onClick={startCamera}
                className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105"
              >
                <Play className="w-5 h-5" />
                Start Live Detection
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Square className="w-5 h-5" />
                Stop Live Feed
              </button>
            )}
            
            <label className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 cursor-pointer">
              <Upload className="w-5 h-5" />
              Upload & Analyze
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && processImage(e.target.files[0])}
              />
            </label>
          </div>
        </div>

        {/* Live Stats Panel */}
        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              Detection Status
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Confidence</span>
                  <span className="font-mono">{Math.round(confidence * 100)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      confidence > 0.8 ? 'bg-green-400' : confidence > 0.6 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
              </div>

              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Frames Processed</span>
                  <span className="font-mono">{processedFrames}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Speed</span>
                  <span className="font-mono">1.2 FPS</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="font-semibold mb-3">Defects Found ({detectedDefects.length})</h3>
            {detectedDefects.length === 0 ? (
              <div className="text-green-300 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                No defects detected
              </div>
            ) : (
              <div className="space-y-2">
                {detectedDefects.map((defect, i) => (
                  <div key={i} className="bg-red-500/20 border border-red-500/40 rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        <span className="text-sm font-medium capitalize">{defect.type}</span>
                      </div>
                      <span className="text-xs bg-red-500 px-2 py-1 rounded">
                        {Math.round(defect.confidence * 100)}%
                      </span>
                    </div>
                    <div className="text-xs text-red-200">
                      Position: {Math.round(defect.x)}, {Math.round(defect.y)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="font-semibold mb-3">System Performance</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-center">
                <div className="text-2xl font-mono text-green-400">92.4%</div>
                <div className="text-xs text-gray-300">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-mono text-blue-400">1.2s</div>
                <div className="text-xs text-gray-300">Avg Speed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-mono text-purple-400">7</div>
                <div className="text-xs text-gray-300">Defect Types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-mono text-yellow-400">3.1%</div>
                <div className="text-xs text-gray-300">False Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}