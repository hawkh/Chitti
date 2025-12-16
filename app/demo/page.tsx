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
  const [modelStatus, setModelStatus] = useState<string>('Initializing...');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const detectorRef = useRef<RealDefectDetector | null>(null);

  if (typeof window !== 'undefined' && !detectorRef.current) {
    detectorRef.current = new RealDefectDetector();
    
    // Check model status periodically
    const checkStatus = () => {
      if (detectorRef.current) {
        const status = detectorRef.current.getModelStatus();
        if (status.loaded) {
          setModelStatus('✅ REAL AI Model Loaded');
          console.log('🎉 REAL YOLO MODEL IS READY FOR DETECTION!');
        } else if (status.loading) {
          setModelStatus('⏳ Loading AI Model...');
        } else if (status.error) {
          setModelStatus(`❌ Model Error: ${status.error}`);
        }
      }
    };
    
    // Check immediately and then every 500ms for 10 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 500);
    setTimeout(() => clearInterval(interval), 10000);
  }

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
    if (!imageRef.current || !detectorRef.current) return;

    console.log('🚀 USER CLICKED DETECT BUTTON - Starting detection...');
    setIsProcessing(true);
    try {
      console.log('📸 Calling detectDefects with image element...');
      const detectionResult = await detectorRef.current!.detectDefects(imageRef.current);
      console.log('✅ Detection completed! Result:', detectionResult);
      setResult(detectionResult);
      
      setTimeout(() => {
        drawDetections(detectionResult);
      }, 100);
    } catch (error) {
      console.error('❌ Detection failed with error:', error);
      alert('Detection failed: ' + (error as Error).message);
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-200 via-orange-100 to-amber-300 bg-clip-text text-transparent">AI Defect Detection Demo</h1>
          <div className={`px-4 py-2 rounded-xl font-semibold text-sm ${
            modelStatus.includes('✅') 
              ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700' 
              : modelStatus.includes('⏳')
              ? 'bg-amber-900/50 text-amber-300 border border-amber-700 animate-pulse'
              : 'bg-rose-900/50 text-rose-300 border border-rose-700'
          }`}>
            {modelStatus}
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setMode('upload')} 
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-md ${
              mode === 'upload' ? 'bg-gradient-to-r from-orange-600 to-rose-600 text-white shadow-orange-500/30' : 'bg-zinc-800/80 text-gray-300 hover:bg-zinc-700/80 border border-zinc-700'
            }`}
          >
            <Upload className="h-5 w-5" />Upload File
          </button>
          <button 
            onClick={() => setMode('sample')} 
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-md ${
              mode === 'sample' ? 'bg-gradient-to-r from-orange-600 to-rose-600 text-white shadow-orange-500/30' : 'bg-zinc-800/80 text-gray-300 hover:bg-zinc-700/80 border border-zinc-700'
            }`}
          >
            <ImageIcon className="h-5 w-5" />Sample Images
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 shadow-xl">
            {mode === 'upload' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-amber-700/40 rounded-2xl p-8 text-center bg-gradient-to-br from-amber-950/20 to-orange-950/20">
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
                    <Upload className="h-12 w-12 text-amber-500" />
                    <span className="text-amber-100">Click to upload an image</span>
                    <span className="text-sm text-amber-600">PNG, JPG, WebP up to 10MB</span>
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
                      className="relative group overflow-hidden rounded-xl border-2 border-zinc-700 hover:border-orange-500 transition-all hover:shadow-lg hover:shadow-orange-500/20"
                    >
                      <img src={sample.url} alt={sample.name} className="w-full h-32 object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950 via-zinc-900/80 to-transparent p-2">
                        <p className="text-white text-sm font-medium">{sample.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <h4 className="text-amber-100 font-semibold mb-2">Original Image</h4>
              {imageUrl && (
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Original"
                  className="w-full rounded-xl border border-zinc-700 mb-4 shadow-lg"
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
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:from-zinc-700 disabled:to-zinc-700 transition-all shadow-lg mb-4"
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
                  <h4 className="text-amber-100 font-semibold mb-2">Detection Results</h4>
                  <canvas 
                    ref={canvasRef} 
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-amber-100 mb-4">Results</h3>
            <div className="space-y-4">
              {result ? (
                <>
                  <div className="bg-gradient-to-br from-emerald-950/80 to-teal-950/80 rounded-xl p-4 border-2 border-emerald-700/50">
                    <p className="text-sm text-emerald-400 font-semibold">🤖 AI Detection Mode</p>
                    <p className="text-lg font-bold text-emerald-100">
                      REAL TensorFlow.js YOLO
                    </p>
                    <p className="text-xs text-emerald-500 mt-1">
                      Running in browser with WebGL acceleration
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-zinc-950/80 to-neutral-950/80 rounded-xl p-4 border border-zinc-800">
                    <p className="text-sm text-amber-600">Status</p>
                    <p className="text-lg font-bold text-amber-100">
                      {result.overallStatus === 'pass' ? '✅ Pass' : '❌ Fail'}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-zinc-950/80 to-neutral-950/80 rounded-xl p-4 border border-zinc-800">
                    <p className="text-sm text-amber-600">Defects Found</p>
                    <p className="text-lg font-bold text-amber-100">{result.defects.length}</p>
                  </div>

                  <div className="bg-gradient-to-br from-zinc-950/80 to-neutral-950/80 rounded-xl p-4 border border-zinc-800">
                    <p className="text-sm text-amber-600">Processing Time</p>
                    <p className="text-lg font-bold text-amber-100">{result.processingTime.toFixed(0)}ms</p>
                  </div>

                  {result.defects.length > 0 && (
                    <div className="bg-gradient-to-br from-zinc-950/80 to-neutral-950/80 rounded-xl p-4 border border-zinc-800">
                      <p className="text-sm text-amber-600 mb-2">Detected Defects</p>
                      <div className="space-y-2">
                        {result.defects.map((defect) => (
                          <div key={defect.id} className="text-sm text-amber-200">
                            <span className="font-medium">{defect.type}</span>
                            <span className="text-amber-700"> - {(defect.confidence * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gradient-to-br from-zinc-950/80 to-neutral-950/80 rounded-xl p-4 border border-zinc-800">
                  <p className="text-sm text-amber-600">Instructions</p>
                  <ul className="text-sm text-amber-200 space-y-1 mt-2">
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