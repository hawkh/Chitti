'use client';

import React, { useState, useRef, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  FileText,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { validateEvidenceFile, formatFileSize, getAcceptAttribute, type EvidenceType } from '@/lib/audit/evidence-validation';
import type { EvidenceRecord } from '@/types/audit-form.types';

export interface EvidenceUploadProps {
  itemId: string;
  auditId?: string;
  existingEvidence?: EvidenceRecord[];
  onUpload: (file: File, itemId: string) => Promise<void>;
  onDelete?: (evidenceId: string) => Promise<void>;
  maxFiles?: number;
  allowedTypes?: EvidenceType[];
  disabled?: boolean;
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
}

export default function EvidenceUpload({
  itemId,
  auditId,
  existingEvidence = [],
  onUpload,
  onDelete,
  maxFiles = 10,
  allowedTypes = ['photo', 'video', 'document'],
  disabled = false,
  className = '',
}: EvidenceUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceRecord | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Check if we've reached the max file limit
  const canUploadMore = existingEvidence.length + uploadingFiles.length < maxFiles;

  // Handle file selection
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setError(null);
    const filesArray = Array.from(files);
    
    // Check max files limit
    if (existingEvidence.length + uploadingFiles.length + filesArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate and upload each file
    for (const file of filesArray) {
      const validation = validateEvidenceFile(file);
      
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        continue;
      }

      // Check if file type is allowed
      if (validation.fileType && !allowedTypes.includes(validation.fileType)) {
        setError(`${validation.fileType} files are not allowed`);
        continue;
      }

      // Add to uploading state
      setUploadingFiles(prev => [...prev, { file, progress: 0 }]);

      try {
        await onUpload(file, itemId);
        
        // Remove from uploading state on success
        setUploadingFiles(prev => prev.filter(f => f.file !== file));
      } catch (err) {
        // Update with error
        setUploadingFiles(prev => 
          prev.map(f => f.file === file 
            ? { ...f, error: err instanceof Error ? err.message : 'Upload failed' }
            : f
          )
        );
      }
    }
  }, [existingEvidence.length, uploadingFiles.length, maxFiles, allowedTypes, itemId, onUpload]);

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [disabled, handleFileSelect]);

  // Handle camera capture
  const startCamera = useCallback(async (mode: 'photo' | 'video' = 'photo') => {
    try {
      const constraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: mode === 'video'
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraMode(mode);
        setShowCamera(true);
      }
    } catch (err) {
      setError('Camera access denied or not available');
      console.error('Camera error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setShowCamera(false);
    setIsRecording(false);
    recordedChunksRef.current = [];
  }, [isRecording]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Manually trigger upload
      setUploadingFiles(prev => [...prev, { file, progress: 0 }]);
      
      try {
        await onUpload(file, itemId);
        setUploadingFiles(prev => prev.filter(f => f.file !== file));
      } catch (err) {
        setUploadingFiles(prev => 
          prev.map(f => f.file === file 
            ? { ...f, error: err instanceof Error ? err.message : 'Upload failed' }
            : f
          )
        );
      }
      
      stopCamera();
    }, 'image/jpeg', 0.9);
  }, [itemId, onUpload, stopCamera]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    
    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      recordedChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const file = new File([blob], `video-${Date.now()}.webm`, { type: 'video/webm' });
        
        setUploadingFiles(prev => [...prev, { file, progress: 0 }]);
        
        try {
          await onUpload(file, itemId);
          setUploadingFiles(prev => prev.filter(f => f.file !== file));
        } catch (err) {
          setUploadingFiles(prev => 
            prev.map(f => f.file === file 
              ? { ...f, error: err instanceof Error ? err.message : 'Upload failed' }
              : f
            )
          );
        }
        
        stopCamera();
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      setError('Video recording not supported');
      console.error('Recording error:', err);
    }
  }, [itemId, onUpload, stopCamera]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleDeleteEvidence = useCallback(async (evidenceId: string) => {
    if (!onDelete) return;
    
    try {
      await onDelete(evidenceId);
    } catch (err) {
      setError('Failed to delete evidence');
    }
  }, [onDelete]);

  // Remove uploading file with error
  const removeUploadingFile = useCallback((file: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== file));
  }, []);

  return (
    <div className={`evidence-upload ${className}`}>
      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>{cameraMode === 'photo' ? 'Capture Photo' : 'Record Video'}</span>
              </h3>
              <button
                onClick={stopCamera}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="relative bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-h-[60vh] object-contain"
              />
              
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Recording</span>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-gray-50">
              <div className="flex gap-3 justify-center">
                {cameraMode === 'photo' ? (
                  <button
                    onClick={capturePhoto}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="h-5 w-5" />
                    <span>Capture Photo</span>
                  </button>
                ) : (
                  <>
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <VideoIcon className="h-5 w-5" />
                        <span>Start Recording</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <div className="w-4 h-4 bg-white rounded" />
                        <span>Stop Recording</span>
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={stopCamera}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Preview Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvidence(null)}>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">{selectedEvidence.filename}</h3>
                <button
                  onClick={() => setSelectedEvidence(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 bg-black">
                {selectedEvidence.fileType === 'photo' && (
                  <img 
                    src={selectedEvidence.url} 
                    alt={selectedEvidence.filename}
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                )}
                {selectedEvidence.fileType === 'video' && (
                  <video 
                    src={selectedEvidence.url} 
                    controls
                    className="w-full h-auto max-h-[70vh]"
                  />
                )}
                {selectedEvidence.fileType === 'document' && (
                  <div className="text-center py-12 text-white">
                    <FileText className="h-16 w-16 mx-auto mb-4" />
                    <p>Document preview not available</p>
                    <a
                      href={selectedEvidence.url}
                      download
                      className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Download
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        } ${disabled || !canUploadMore ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && canUploadMore && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={getAcceptAttribute(allowedTypes)}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled || !canUploadMore}
        />
        
        <div className="space-y-3">
          <Upload className="h-12 w-12 text-gray-400 mx-auto" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              {canUploadMore 
                ? 'Click to upload or drag and drop'
                : `Maximum ${maxFiles} files reached`
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {allowedTypes.includes('photo') && 'Photos (JPG, PNG, WEBP) '}
              {allowedTypes.includes('video') && 'Videos (MP4, MOV, WEBM) '}
              {allowedTypes.includes('document') && 'Documents (PDF)'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Max file size: 50MB per file
            </p>
          </div>
        </div>
      </div>

      {/* Camera Buttons */}
      {canUploadMore && !disabled && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {allowedTypes.includes('photo') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                startCamera('photo');
              }}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Camera className="h-5 w-5" />
              <span>Take Photo</span>
            </button>
          )}
          {allowedTypes.includes('video') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                startCamera('video');
              }}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <VideoIcon className="h-5 w-5" />
              <span>Record Video</span>
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploading...</h4>
          {uploadingFiles.map((upload, index) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{upload.file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(upload.file.size)}</p>
                {upload.error && (
                  <p className="text-xs text-red-600 mt-1">{upload.error}</p>
                )}
              </div>
              {upload.error && (
                <button
                  onClick={() => removeUploadingFile(upload.file)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Existing Evidence */}
      {existingEvidence.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Uploaded Evidence ({existingEvidence.length}/{maxFiles})
            </h4>
            {existingEvidence.length > 0 && (
              <span className="text-xs text-gray-500">
                Click to preview
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {existingEvidence.map((evidence) => (
              <div key={evidence.id} className="relative group">
                <button
                  onClick={() => setSelectedEvidence(evidence)}
                  className="w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
                >
                  {evidence.fileType === 'photo' && (
                    <img
                      src={evidence.thumbnailUrl || evidence.url}
                      alt={evidence.filename}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {evidence.fileType === 'video' && (
                    <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
                      <VideoIcon className="h-8 w-8 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">Video</span>
                    </div>
                  )}
                  {evidence.fileType === 'document' && (
                    <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
                      <FileText className="h-8 w-8 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">Document</span>
                    </div>
                  )}
                </button>
                
                {/* File info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                  <p className="text-xs text-white truncate">{evidence.filename}</p>
                  {evidence.fileSize && (
                    <p className="text-xs text-gray-300">{formatFileSize(evidence.fileSize)}</p>
                  )}
                </div>

                {/* Delete button */}
                {onDelete && !disabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this evidence?')) {
                        handleDeleteEvidence(evidence.id);
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}

                {/* Type indicator */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black bg-opacity-60 text-white text-xs rounded">
                  {evidence.fileType === 'photo' && <ImageIcon className="h-3 w-3" />}
                  {evidence.fileType === 'video' && <VideoIcon className="h-3 w-3" />}
                  {evidence.fileType === 'document' && <FileText className="h-3 w-3" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}