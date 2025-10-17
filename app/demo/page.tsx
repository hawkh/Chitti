'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Image as ImageIcon, Download, FileJson, Mail, Zap } from 'lucide-react';
import Link from 'next/link';
import { RealDefectDetector } from '@/services/ai/RealDefectDetector';
import FileUpload from '@/components/upload/FileUpload';
import { ProcessingFile, DetectionResult } from '@/types';

export default function DemoPage() {
  const [mode, setMode] = useState<'camera' | 'upload' | 'sample'>('upload');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [files, setFiles] = useState<ProcessingFile[]>([]);
  const [threshold, setThreshold] = useState(70);
  const [sensitivity, setSensitivity] = useState('standard');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef(new RealDefectDetector());

  const sampleImages = [
    { name: 'Metal Crack', url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop' },
    { name: 'Corrosion', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop' },
    { name: 'Surface Defect', url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop' }
  ];

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

  const detectFromCamera = async () => {
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
        const detectionResult = await detectorRef.current.detectDefects(imageData);
        setResult(detectionResult);
        drawDetections(detectionResult, canvas, ctx);
      }
    }
    setIsProcessing(false);
  };

  const detectFromSample = async (imageUrl: string) => {
    setIsProcessing(true);
    setResult(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      if (imageRef.current && canvasRef.current) {
        imageRef.current.src = imageUrl;
        const detectionResult = await detectorRef.current.detectDefects(img);
        setResult(detectionResult);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          drawDetections(detectionResult, canvas, ctx);
        }
      }
      setIsProcessing(false);
    };
    img.src = imageUrl;
  };

  const detectFromUpload = async () => {
    if (files.length === 0 || !imageRef.current || !canvasRef.current) return;
    setIsProcessing(true);
    const file = files[0].file;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        if (imageRef.current && canvasRef.current) {
          imageRef.current.src = e.target?.result as string;
          const detectionResult = await detectorRef.current.detectDefects(img);
          setResult(detectionResult);
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = img.width;
            canvas.height = img.height;
            drawDetections(detectionResult, canvas, ctx);
          }
        }
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const drawDetections = (detectionResult: DetectionResult, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    detectionResult.defects.forEach((defect) => {
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

  const downloadPDF = async () => {
    if (!result) return;
    try {
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `detection-report-${Date.now()}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please try again.');
    }
  };

  const exportJSON = () => {
    if (!result) return;
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `detection-result-${Date.now()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const emailResult = async () => {
    if (!result) return;
    const email = prompt('Enter email address:');
    if (!email) return;
    try {
      const response = await fetch('/api/export/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result, email })
      });
      if (response.ok) {
        alert('Report sent successfully!');
      } else {
        alert('Failed to send email. Please try again.');
      }
    } catch (error) {
      console.error('Email failed:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-blue-300">
              <strong>Demo mode</strong> — Limited to 10 images/session. No PII retained.
            </p>
            <Link href="/contact" className="text-sm font-semibold text-blue-400 hover:text-blue-300">
              Request Full Pilot →
            </Link>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-8">Live Detection Demo</h1>

        <div className="flex gap-4 mb-8">
          <button onClick={() => { setMode('camera'); stopCamera(); }} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${mode === 'camera' ? 'bg-red-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}>
            <Camera className="h-5 w-5" />Live Camera
          </button>
          <button onClick={() => { setMode('upload'); stopCamera(); }} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${mode === 'upload' ? 'bg-red-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}>
            <Upload className="h-5 w-5" />Upload File
          </button>
          <button onClick={() => { setMode('sample'); stopCamera(); }} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${mode === 'sample' ? 'bg-red-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}>
            <ImageIcon className="h-5 w-5" />Sample Images
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800 rounded-lg p-6">
            {mode === 'camera' && (
              <div className="space-y-4">
                {!isCameraActive ? (
                  <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
                    <button onClick={startCamera} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center gap-2">
                      <Camera className="h-5 w-5" />Start Camera
                    </button>
                  </div>
                ) : (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
                    <div className="flex gap-2">
                      <button onClick={detectFromCamera} disabled={isProcessing} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50">
                        {isProcessing ? 'Processing...' : 'Detect Now'}
                      </button>
                      <button onClick={stopCamera} className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">Stop Camera</button>
                    </div>
                  </>
                )}
              </div>
            )}

            {mode === 'upload' && (
              <div className="space-y-4">
                <FileUpload onFilesSelected={setFiles} acceptedFormats={['.jpg','.jpeg','.png','.webp']} maxFileSize={50*1024*1024} maxFiles={1} supportsBatch={false} />
                {files.length > 0 && (
                  <button onClick={detectFromUpload} disabled={isProcessing} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50">
                    {isProcessing ? 'Processing...' : 'Start Detection'}
                  </button>
                )}
              </div>
            )}

            {mode === 'sample' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {sampleImages.map((sample, idx) => (
                    <button key={idx} onClick={() => detectFromSample(sample.url)} disabled={isProcessing} className="relative group overflow-hidden rounded-lg border-2 border-gray-700 hover:border-red-500 transition-colors disabled:opacity-50">
                      <img src={sample.url} alt={sample.name} className="w-full h-32 object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                        <p className="text-white text-sm font-medium">{sample.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {result && (
              <div className="mt-4">
                <h4 className="text-white font-semibold mb-2">Detection Result</h4>
                <canvas ref={canvasRef} className="w-full rounded-lg border border-slate-700" />
                <img ref={imageRef} className="hidden" alt="Source" />
              </div>
            )}
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Results</h3>
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-lg p-4">
                <p className="text-sm text-gray-400">Defects Detected</p>
                <p className="text-3xl font-bold text-white">{result?.defects.length || 0}</p>
              </div>
              {result && (
                <div className="bg-slate-900 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Status:</span>
                    <span className={`text-sm font-semibold ${result.overallStatus === 'pass' ? 'text-green-400' : 'text-red-400'}`}>
                      {result.overallStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Processing Time:</span>
                    <span className="text-sm text-white">{result.processingTime.toFixed(0)}ms</span>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-300">Actions</h4>
                <button onClick={downloadPDF} disabled={!result} className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Download className="h-4 w-4" />Download PDF
                </button>
                <button onClick={exportJSON} disabled={!result} className="w-full flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  <FileJson className="h-4 w-4" />Export JSON
                </button>
                <button onClick={emailResult} disabled={!result} className="w-full flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Mail className="h-4 w-4" />Email Result
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-blue-400 hover:text-blue-300 font-semibold">
            {showAdvanced ? '▼' : '▶'} Advanced Settings
          </button>
          {showAdvanced && (
            <div className="mt-4 bg-slate-800 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Confidence Threshold</label>
                  <input type="range" min="0" max="100" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full" />
                  <p className="text-xs text-gray-400 mt-1">{threshold}%</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Detection Sensitivity</label>
                  <select value={sensitivity} onChange={(e) => setSensitivity(e.target.value)} className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg">
                    <option value="standard">Standard</option>
                    <option value="high">High</option>
                    <option value="maximum">Maximum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Model Version</label>
                  <select className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg">
                    <option>YOLO v8 (Latest)</option>
                    <option>YOLO v5</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-slate-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400">
            <strong>Supported formats:</strong> JPEG, PNG, WebP, MP4 | <strong>Max file size:</strong> 50MB | <strong>Max dimensions:</strong> 8000×8000px
          </p>
        </div>
      </div>
    </div>
  );
}
