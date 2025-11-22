import { useState, useCallback } from 'react';
import {
  processImageForUpload,
  formatFileSize,
  estimateProcessingTime,
  type ProcessedImage
} from './image-processing';

export interface ProcessingStatus {
  isProcessing: boolean;
  progress: number;
  currentFile: string | null;
  error: string | null;
}

export interface ProcessedFileResult {
  original: File;
  compressed?: ProcessedImage;
  thumbnail?: ProcessedImage;
  exif?: Record<string, any>;
  compressionRatio?: number;
}

export function useImageProcessing() {
  const [status, setStatus] = useState<ProcessingStatus>({
    isProcessing: false,
    progress: 0,
    currentFile: null,
    error: null
  });

  const processImage = useCallback(async (
    file: File,
    options?: {
      compress?: boolean;
      generateThumbnail?: boolean;
      extractExif?: boolean;
      correctOrientation?: boolean;
      addWatermark?: boolean;
      watermarkText?: string;
    }
  ): Promise<ProcessedFileResult> => {
    setStatus({
      isProcessing: true,
      progress: 0,
      currentFile: file.name,
      error: null
    });

    try {
      // Estimate processing time
      const estimatedTime = estimateProcessingTime(file.size);
      
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setStatus(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, estimatedTime / 10);

      // Process the image
      const result = await processImageForUpload(file, options);

      // Clear interval and set to 100%
      clearInterval(progressInterval);
      setStatus({
        isProcessing: false,
        progress: 100,
        currentFile: null,
        error: null
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Processing failed';
      
      setStatus({
        isProcessing: false,
        progress: 0,
        currentFile: null,
        error: errorMessage
      });

      throw error;
    }
  }, []);

  const processBatch = useCallback(async (
    files: File[],
    options?: Parameters<typeof processImage>[1]
  ): Promise<ProcessedFileResult[]> => {
    const results: ProcessedFileResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      setStatus({
        isProcessing: true,
        progress: Math.round((i / files.length) * 100),
        currentFile: file.name,
        error: null
      });

      try {
        const result = await processImage(file, options);
        results.push(result);
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
        // Continue with other files
      }
    }

    setStatus({
      isProcessing: false,
      progress: 100,
      currentFile: null,
      error: null
    });

    return results;
  }, [processImage]);

  const reset = useCallback(() => {
    setStatus({
      isProcessing: false,
      progress: 0,
      currentFile: null,
      error: null
    });
  }, []);

  return {
    processImage,
    processBatch,
    status,
    reset
  };
}
