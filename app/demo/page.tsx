'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Image as ImageIcon, Play, Square } from 'lucide-react';
import { RealDefectDetector } from '@/services/ai/RealDefectDetector';
import { DetectionResult } from '@/types';

export default function DemoPage() {
  const [mode, setMode] = useState<'upload' | 'sample'>('upload');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const detectorRef = useRef<RealDefectDetector>(new RealDefectDetector());

  const sampleImages = [
    { name: 'Sample Defects', url: '/sample-defect.svg' },
    { name: 'Logo', url: '/logo.png' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setResult(null);
    }
  };

  const handleDetection = useCallback(async () => {
    if (!imageRef.current) return;

    setIsProcessing(true);
    try {
      const detectionResult = await detectorRef.current.detectDefects(imageRef.current);
      setResult(detectionResult);
      
      setTimeout(() => {
        drawDetections(detectionResult);
      }, 100);
    } catch (error) {
      console.error('Detection failed:', error);
      alert('Detection failed. Make sure Python backend is running.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const drawDetections = (detectionResult: DetectionResult) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    detectionResult.defects.forEach((defect) => {
      const { x, y, width, height } = defect.location;
      
      ctx.strokeStyle = defect.confidence > 0.8 ? '#ef4444' : '#f59e0b';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);
      
      ctx.fillStyle = defect.confidence > 0.8 ? '#ef4444' : '#f59e0b';
      ctx.font = 'bold 14px Arial';
      const label = `${defect.type} (${(defect.confidence * 100).toFixed(1)}%)`;
      const textWidth = ctx.measureText(label).width;
      
      ctx.fillRect(x, y - 25, textWidth + 10, 20);
      ctx.fillStyle = 'white';
      ctx.fillText(label, x + 5, y - 8);
    });
  };

  const displaySampleImage = (url: string) => {
    setImageUrl(url);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-blue-300">
              <strong>AI Demo</strong> — Real defect detection with YOLO model
            </p>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-8">AI Defect Detection Demo</h1>

        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setMode('upload')} 
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              mode === 'upload' ? 'bg-red-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <Upload className="h-5 w-5" />Upload File
          </button>
          <button 
            onClick={() => setMode('sample')} 
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              mode === 'sample' ? 'bg-red-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <ImageIcon className="h-5 w-5" />Sample Images
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800 rounded-lg p-6">
            {mode === 'upload' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center space-y-2 mx-auto"
                  >
                    <Upload className="h-12 w-12 text-gray-400" />
                    <span className="text-gray-300">Click to upload an image</span>
                    <span className="text-sm text-gray-500">PNG, JPG, WebP up to 10MB</span>
                  </button>
                </div>
              </div>
            )}

            {mode === 'sample' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {sampleImages.map((sample, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => displaySampleImage(sample.url)}
                      className="relative group overflow-hidden rounded-lg border-2 border-gray-700 hover:border-red-500 transition-colors"
                    >
                      <img src={sample.url} alt={sample.name} className="w-full h-32 object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                        <p className="text-white text-sm font-medium">{sample.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <h4 className="text-white font-semibold mb-2">Original Image</h4>
              {imageUrl && (
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Original"
                  className="w-full rounded-lg border border-slate-700 mb-4"
                  onLoad={() => {
                    if (canvasRef.current && imageRef.current) {
                      canvasRef.current.width = imageRef.current.naturalWidth;
                      canvasRef.current.height = imageRef.current.naturalHeight;
                    }
                  }}
                />
              )}
              
              <button
                onClick={handleDetection}
                disabled={!imageUrl || isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 mb-4"
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

              {result && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Detection Results</h4>
                  <canvas 
                    ref={canvasRef} 
                    className="w-full rounded-lg border border-slate-700 bg-slate-900"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Results</h3>
            <div className="space-y-4">
              {result ? (
                <>
                  <div className="bg-slate-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Status</p>
                    <p className="text-lg font-bold text-white">
                      {result.overallStatus === 'pass' ? '✅ Pass' : '❌ Fail'}
                    </p>
                  </div>
                  
                  <div className="bg-slate-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Defects Found</p>
                    <p className="text-lg font-bold text-white">{result.defects.length}</p>
                  </div>

                  <div className="bg-slate-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Processing Time</p>
                    <p className="text-lg font-bold text-white">{result.processingTime.toFixed(0)}ms</p>
                  </div>

                  {result.defects.length > 0 && (
                    <div className="bg-slate-900 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-2">Detected Defects</p>
                      <div className="space-y-2">
                        {result.defects.map((defect) => (
                          <div key={defect.id} className="text-sm text-gray-300">
                            <span className="font-medium">{defect.type}</span>
                            <span className="text-gray-500"> - {(defect.confidence * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-slate-900 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Instructions</p>
                  <ul className="text-sm text-gray-300 space-y-1 mt-2">
                    <li>• Upload an image or select a sample</li>
                    <li>• Click "Detect Defects" to run AI analysis</li>
                    <li>• View results with bounding boxes</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}