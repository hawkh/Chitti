// React hook for evidence upload with compression and optimization
import { useState, useCallback, useEffect } from 'react';
import { compressImage, generateThumbnail, extractExifData, getOptimalCompressionSettings } from './image-processing';
import { offlineQueueManager } from './offline-queue-manager';
import { backgroundSyncService } from './background-sync-service';

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'compressing' | 'uploading' | 'complete' | 'error';
  error?: string;
  compressedSize?: number;
  originalSize?: number;
}

export interface UseEvidenceUploadOptions {
  auditId: string;
  itemId?: string;
  responseId?: string;
  autoCompress?: boolean;
  onSuccess?: (evidenceId: string) => void;
  onError?: (error: Error) => void;
}

export function useEvidenceUpload(options: UseEvidenceUploadOptions) {
  const {
    auditId,
    itemId,
    responseId,
    autoCompress = true,
    onSuccess,
    onError
  } = options;

  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateUpload = useCallback((fileId: string, update: Partial<UploadProgress>) => {
    setUploads(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(fileId);
      if (existing) {
        newMap.set(fileId, { ...existing, ...update });
      }
      return newMap;
    });
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const fileId = `${file.name}-${Date.now()}`;
    
    // Initialize upload progress
    setUploads(prev => new Map(prev).set(fileId, {
      file,
      progress: 0,
      status: 'pending',
      originalSize: file.size
    }));

    setIsUploading(true);

    try {
      let fileToUpload = file;
      let metadata: any = {};

      // Compress image if enabled and file is an image
      if (autoCompress && file.type.startsWith('image/')) {
        updateUpload(fileId, { status: 'compressing', progress: 10 });

        // Get optimal compression settings
        const compressionSettings = getOptimalCompressionSettings(file.size);

        // Compress image
        const compressed = await compressImage(file, compressionSettings);
        
        // Create new file from compressed blob
        fileToUpload = new File([compressed.blob], file.name, {
          type: compressed.blob.type,
          lastModified: Date.now()
        });

        // Extract EXIF data
        metadata = await extractExifData(file);

        updateUpload(fileId, {
          progress: 30,
          compressedSize: compressed.size
        });
      }

      // Prepare form data
      updateUpload(fileId, { status: 'uploading', progress: 40 });

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('auditId', auditId);
      if (itemId) formData.append('itemId', itemId);
      if (responseId) formData.append('responseId', responseId);
      if (Object.keys(metadata).length > 0) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      // Check if online - if not, queue for offline upload
      if (!isOnline) {
        updateUpload(fileId, { status: 'complete', progress: 100 });
        
        // Queue for offline upload
        const queueId = await offlineQueueManager.queueEvidence(
          auditId,
          itemId || '',
          fileToUpload,
          metadata
        );

        if (onSuccess) {
          onSuccess(queueId); // Return queue ID as temporary evidence ID
        }

        // Remove from uploads after a delay
        setTimeout(() => {
          setUploads(prev => {
            const newMap = new Map(prev);
            newMap.delete(fileId);
            return newMap;
          });
        }, 2000);

        return queueId;
      }

      // Get auth token
      const token = localStorage.getItem('audit_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Upload file
      const response = await fetch('/api/audit/evidence/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        // If upload fails due to network, queue for offline upload
        if (!navigator.onLine) {
          const queueId = await offlineQueueManager.queueEvidence(
            auditId,
            itemId || '',
            fileToUpload,
            metadata
          );
          
          updateUpload(fileId, { status: 'complete', progress: 100 });
          
          if (onSuccess) {
            onSuccess(queueId);
          }

          setTimeout(() => {
            setUploads(prev => {
              const newMap = new Map(prev);
              newMap.delete(fileId);
              return newMap;
            });
          }, 2000);

          return queueId;
        }

        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();

      updateUpload(fileId, {
        status: 'complete',
        progress: 100
      });

      // Call success callback
      if (onSuccess) {
        onSuccess(result.evidence.id);
      }

      // Remove from uploads after a delay
      setTimeout(() => {
        setUploads(prev => {
          const newMap = new Map(prev);
          newMap.delete(fileId);
          return newMap;
        });
      }, 2000);

      return result.evidence.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      updateUpload(fileId, {
        status: 'error',
        error: errorMessage
      });

      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }

      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [auditId, itemId, responseId, autoCompress, onSuccess, onError, updateUpload]);

  const uploadMultiple = useCallback(async (files: File[]): Promise<string[]> => {
    const results: string[] = [];

    for (const file of files) {
      try {
        const evidenceId = await uploadFile(file);
        results.push(evidenceId);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        // Continue with other files
      }
    }

    return results;
  }, [uploadFile]);

  const deleteEvidence = useCallback(async (evidenceId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('audit_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/audit/evidence/${evidenceId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error('Delete failed'));
      }
      throw error;
    }
  }, [onError]);

  const retryUpload = useCallback((fileId: string) => {
    const upload = uploads.get(fileId);
    if (upload && upload.status === 'error') {
      uploadFile(upload.file);
    }
  }, [uploads, uploadFile]);

  const cancelUpload = useCallback((fileId: string) => {
    setUploads(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
  }, []);

  return {
    uploads: Array.from(uploads.values()),
    isUploading,
    uploadFile,
    uploadMultiple,
    deleteEvidence,
    retryUpload,
    cancelUpload
  };
}
