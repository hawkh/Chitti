// React hook for offline evidence management
import { useState, useEffect, useCallback } from 'react';
import { 
  offlineEvidenceStorage, 
  evidenceSyncManager, 
  type PendingEvidence,
  type SyncStatus,
  type SyncResult
} from './offline-evidence-storage';

export function useOfflineEvidence(auditId?: string) {
  const [pendingEvidence, setPendingEvidence] = useState<PendingEvidence[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Load pending evidence
  const loadPending = useCallback(async () => {
    try {
      setLoading(true);
      const pending = auditId
        ? await offlineEvidenceStorage.getPendingByAudit(auditId)
        : await offlineEvidenceStorage.getAllPending();
      setPendingEvidence(pending);
    } catch (error) {
      console.error('Failed to load pending evidence:', error);
    } finally {
      setLoading(false);
    }
  }, [auditId]);

  // Queue evidence for offline upload
  const queueEvidence = useCallback(async (
    file: File,
    metadata: {
      auditId: string;
      itemId?: string;
      responseId?: string;
      additionalMetadata?: Record<string, any>;
    }
  ): Promise<string> => {
    try {
      // Convert File to Blob for storage
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });

      const id = await offlineEvidenceStorage.addPendingEvidence({
        auditId: metadata.auditId,
        itemId: metadata.itemId,
        responseId: metadata.responseId,
        file: blob,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        metadata: metadata.additionalMetadata
      });

      // Reload pending evidence
      await loadPending();

      return id;
    } catch (error) {
      console.error('Failed to queue evidence:', error);
      throw error;
    }
  }, [loadPending]);

  // Sync all pending evidence
  const syncAll = useCallback(async (): Promise<SyncResult> => {
    const result = await evidenceSyncManager.syncAll();
    
    // Reload pending evidence after sync
    await loadPending();
    
    return result;
  }, [loadPending]);

  // Remove pending evidence
  const removePending = useCallback(async (id: string): Promise<void> => {
    try {
      await offlineEvidenceStorage.removePending(id);
      await loadPending();
    } catch (error) {
      console.error('Failed to remove pending evidence:', error);
      throw error;
    }
  }, [loadPending]);

  // Get pending count
  const getPendingCount = useCallback(async (): Promise<number> => {
    return await offlineEvidenceStorage.getCount();
  }, []);

  // Get total size of pending evidence
  const getTotalSize = useCallback(async (): Promise<number> => {
    return await offlineEvidenceStorage.getTotalSize();
  }, []);

  // Setup online/offline listeners
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

  // Setup sync listener
  useEffect(() => {
    const unsubscribe = evidenceSyncManager.addSyncListener(setSyncStatus);
    return unsubscribe;
  }, []);

  // Setup auto-sync
  useEffect(() => {
    const cleanup = evidenceSyncManager.setupAutoSync();
    return cleanup;
  }, []);

  // Load pending evidence on mount
  useEffect(() => {
    loadPending();
  }, [loadPending]);

  return {
    pendingEvidence,
    isOnline,
    syncStatus,
    loading,
    queueEvidence,
    syncAll,
    removePending,
    getPendingCount,
    getTotalSize,
    reload: loadPending
  };
}
