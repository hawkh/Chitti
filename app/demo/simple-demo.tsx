'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import FileUpload from '@/components/upload/FileUpload';
import { ProcessingFile } from '@/types';

export default function SimpleDemoPage() {
  const [mode, setMode] = useState<'upload' | 'sample'>('upload');
  const [files, setFiles] = useState<ProcessingFile[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sampleImages = [
    { name: 'Sample Defects', url: '/sample-defect.svg' },
    { name: 'Logo', url: '/logo.png' }
  ];

  const handleFilesSelected = (selectedFiles: ProcessingFile[]) => {
    setFiles(selectedFiles);
    if (selectedFiles.length > 0) {
      displayImage(selectedFiles[0].file);
    }
  };

  const displayImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Set canvas size
            canvas.width = Math.min(img.width, 800);
            canvas.height = Math.min(img.height, 600);
            
            // Calculate scaling
            const scaleX = canvas.width / img.width;
            const scaleY = canvas.height / img.height;
            const scale = Math.min(scaleX, scaleY);
            
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            
            // Center the image
            const x = (canvas.width - scaledWidth) / 2;
            const y = (canvas.height - scaledHeight) / 2;
            
            // Clear and draw
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
            
            // Draw a test bounding box
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.strokeRect(x + 50, y + 50, 100, 80);
            
            // Draw label
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(x + 50, y + 28, 120, 22);
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.fillText('Test Detection', x + 54, y + 44);
          }
        }
      };
      img.src = e.target?.result as string;
      setImageUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const displaySampleImage = (url: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Set canvas size
          canvas.width = Math.min(img.width, 800);
          canvas.height = Math.min(img.height, 600);
          
          // Calculate scaling
          const scaleX = canvas.width / img.width;
          const scaleY = canvas.height / img.height;
          const scale = Math.min(scaleX, scaleY);
          
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          
          // Center the image
          const x = (canvas.width - scaledWidth) / 2;
          const y = (canvas.height - scaledHeight) / 2;
          
          // Clear and draw
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#1f2937';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          
          // Draw a test bounding box
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          ctx.strokeRect(x + 100, y + 100, 120, 90);
          
          // Draw label
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(x + 100, y + 78, 140, 22);
          ctx.fillStyle = 'white';
          ctx.font = '14px Arial';
          ctx.fillText('Sample Detection', x + 104, y + 94);
        }
      }
    };
    img.src = url;
    setImageUrl(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Simple Image Display Test</h1>

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
                <FileUpload 
                  onFilesSelected={handleFilesSelected}
                  acceptedFormats={['.jpg', '.jpeg', '.png', '.webp']}
                  maxFileSize={50 * 1024 * 1024}
                  maxFiles={1}
                  supportsBatch={false}
                />
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

            <div className="mt-4">
              <h4 className="text-white font-semibold mb-2">Image Display</h4>
              <canvas 
                ref={canvasRef} 
                className="w-full rounded-lg border border-slate-700 bg-slate-900" 
                style={{ minHeight: '400px', maxHeight: '600px' }}
              />
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Test Results</h3>
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-lg p-4">
                <p className="text-sm text-gray-400">Image Status</p>
                <p className="text-lg font-bold text-white">
                  {imageUrl ? 'Image Loaded' : 'No Image'}
                </p>
              </div>
              
              <div className="bg-slate-900 rounded-lg p-4">
                <p className="text-sm text-gray-400">Canvas Status</p>
                <p className="text-lg font-bold text-white">
                  {canvasRef.current ? 'Canvas Ready' : 'Canvas Not Ready'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}