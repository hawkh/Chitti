'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, FileImage, FileVideo, AlertCircle, CheckCircle } from 'lucide-react';
import { FileValidator } from '@/lib/validation';
import { FileUtils, IdGenerator } from '@/lib/utils';
import { ProcessingFile } from '@/types';

interface FileUploadProps {
  onFilesSelected: (files: ProcessingFile[]) => void;
  acceptedFormats: string[];
  maxFileSize: number;
  maxFiles: number;
  supportsBatch: boolean;
  disabled?: boolean;
  className?: string;
}

interface DragState {
  isDragOver: boolean;
  isDragActive: boolean;
}

export default function FileUpload({
  onFilesSelected,
  acceptedFormats,
  maxFileSize,
  maxFiles,
  supportsBatch,
  disabled = false,
  className = ''
}: FileUploadProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragOver: false,
    isDragActive: false
  });
  const [uploadedFiles, setUploadedFiles] = useState<ProcessingFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState({ isDragOver: true, isDragActive: true });
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState({ isDragOver: false, isDragActive: false });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const generatePreview = async (file: File): Promise<string> => {
    if (FileUtils.isImageFile(file)) {
      return FileUtils.fileToBase64(file);
    }
    return ''; // For videos, we might want to generate a thumbnail later
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setErrors([]);

    // Validate batch upload
    const batchValidation = FileValidator.validateBatchUpload(fileArray);
    if (!batchValidation.isValid) {
      setErrors(batchValidation.errors);
      return;
    }

    // Check if adding these files would exceed the limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      setErrors([`Cannot upload more than ${maxFiles} files. Currently have ${uploadedFiles.length} files.`]);
      return;
    }

    // Process each file
    const newFiles: ProcessingFile[] = [];
    
    for (const file of fileArray) {
      try {
        const preview = await generatePreview(file);
        const processingFile: ProcessingFile = {
          id: IdGenerator.generate(),
          file,
          status: 'pending',
          progress: 0,
          preview
        };
        newFiles.push(processingFile);
      } catch (error) {
        console.error('Error processing file:', error);
        setErrors(prev => [...prev, `Failed to process file: ${file.name}`]);
      }
    }

    const updatedFiles = [...uploadedFiles, ...newFiles];
    setUploadedFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState({ isDragOver: false, isDragActive: false });

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFiles(files);
    }
  }, [disabled, uploadedFiles, maxFiles, onFilesSelected]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadedFiles, maxFiles, onFilesSelected]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  }, [uploadedFiles, onFilesSelected]);

  const clearAll = useCallback(() => {
    setUploadedFiles([]);
    setErrors([]);
    onFilesSelected([]);
  }, [onFilesSelected]);

  const getFileIcon = (file: File) => {
    if (FileUtils.isImageFile(file)) {
      return <FileImage className="w-8 h-8 text-blue-500" />;
    } else if (FileUtils.isVideoFile(file)) {
      return <FileVideo className="w-8 h-8 text-purple-500" />;
    }
    return <FileImage className="w-8 h-8 text-gray-500" />;
  };

  const getStatusIcon = (status: ProcessingFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${dragState.isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={supportsBatch}
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center space-y-4">
          <Upload className={`w-12 h-12 ${dragState.isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {dragState.isDragOver ? 'Drop files here' : 'Upload files'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop files here, or click to select
            </p>
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p>Supported formats: {acceptedFormats.join(', ')}</p>
            <p>Maximum file size: {FileUtils.formatFileSize(maxFileSize)}</p>
            {supportsBatch && <p>Maximum files: {maxFiles}</p>}
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">Upload Errors</h4>
              <ul className="mt-1 text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Uploaded Files ({uploadedFiles.length})
            </h3>
            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-3">
            {uploadedFiles.map((processingFile) => (
              <div
                key={processingFile.id}
                className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                {/* File Icon */}
                <div className="flex-shrink-0 mr-4">
                  {processingFile.preview ? (
                    <img
                      src={processingFile.preview}
                      alt={processingFile.file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    getFileIcon(processingFile.file)
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {processingFile.file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {FileUtils.formatFileSize(processingFile.file.size)}
                  </p>
                  
                  {/* Progress Bar */}
                  {processingFile.status === 'uploading' || processingFile.status === 'processing' ? (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span className="capitalize">{processingFile.status}</span>
                        <span>{processingFile.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${processingFile.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Status and Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  {getStatusIcon(processingFile.status)}
                  <button
                    onClick={() => removeFile(processingFile.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}