/**
 * Offline Queue Manager for Evidence Uploads
 * Manages IndexedDB storage for offline evidence queuing with background sync
 */

interface QueuedEvidence {
  id: string;
  auditId: string;
  itemId: string;
  file: Blob;
  fileName: string;
  fileType: string;
  metadata: EvidenceMetadata;
  retryCount: number;
  status: 'pending' | 'uploading' | 'failed' | 'completed';
  createdAt: Date;
  lastAttemptAt?: Date;
  error?: string;
}

interface EvidenceMetadata {
  auditId: string;
  itemId: string;
  capturedAt: Date;
  location?: GeolocationPosition;
  deviceInfo: string;
}

interface SyncResult {
  successful: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

const DB_NAME = 'iso-audit-offline';
const DB_VERSION = 1;
const EVIDENCE_STORE = 'evidence-queue';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAYS = [1000, 5000, 15000]; // Exponential backoff in ms

class OfflineQueueManager {
  private db: IDBDatabase | null = null;
  private syncInProgress = false;

  /**
   * Initialize IndexedDB database
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(EVIDENCE_STORE)) {
          const store = db.createObjectStore(EVIDENCE_STORE, { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('auditId', 'auditId', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  /**
   * Queue evidence for offline upload
   */
  async queueEvidence(
    auditId: string,
    itemId: string,
    file: File,
    metadata: Partial<EvidenceMetadata> = {}
  ): Promise<string> {
    if (!this.db) await this.initialize();

    const id = `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedItem: QueuedEvidence = {
      id,
      auditId,
      itemId,
      file,
      fileName: file.name,
      fileType: file.type,
      metadata: {
        auditId,
        itemId,
        capturedAt: new Date(),
        deviceInfo: navigator.userAgent,
        ...metadata,
      },
      retryCount: 0,
      status: 'pending',
      createdAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([EVIDENCE_STORE], 'readwrite');
      const store = transaction.objectStore(EVIDENCE_STORE);
      const request = store.add(queuedItem);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all pending evidence items
   */
  async getPendingEvidence(): Promise<QueuedEvidence[]> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([EVIDENCE_STORE], 'readonly');
      const store = transaction.objectStore(EVIDENCE_STORE);
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get evidence items for specific audit
   */
  async getAuditEvidence(auditId: string): Promise<QueuedEvidence[]> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([EVIDENCE_STORE], 'readonly');
      const store = transaction.objectStore(EVIDENCE_STORE);
      const index = store.index('auditId');
      const request = index.getAll(auditId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update evidence item status
   */
  async updateEvidenceStatus(
    id: string,
    status: QueuedEvidence['status'],
    error?: string
  ): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([EVIDENCE_STORE], 'readwrite');
      const store = transaction.objectStore(EVIDENCE_STORE);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.status = status;
          item.lastAttemptAt = new Date();
          if (error) item.error = error;
          
          const updateRequest = store.put(item);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error(`Evidence item ${id} not found`));
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Remove evidence item from queue
   */
  async removeEvidence(id: string): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([EVIDENCE_STORE], 'readwrite');
      const store = transaction.objectStore(EVIDENCE_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Upload single evidence item with retry logic
   */
  private async uploadEvidenceItem(item: QueuedEvidence): Promise<void> {
    const formData = new FormData();
    formData.append('file', item.file, item.fileName);
    formData.append('auditId', item.auditId);
    formData.append('itemId', item.itemId);
    formData.append('metadata', JSON.stringify(item.metadata));

    const delay = RETRY_DELAYS[Math.min(item.retryCount, RETRY_DELAYS.length - 1)];
    
    if (item.retryCount > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    try {
      await this.updateEvidenceStatus(item.id, 'uploading');

      const response = await fetch('/api/audit/evidence/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Offline-Upload': 'true',
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      await this.updateEvidenceStatus(item.id, 'completed');
      await this.removeEvidence(item.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (item.retryCount < MAX_RETRY_ATTEMPTS) {
        // Increment retry count and mark as pending for next attempt
        const transaction = this.db!.transaction([EVIDENCE_STORE], 'readwrite');
        const store = transaction.objectStore(EVIDENCE_STORE);
        const getRequest = store.get(item.id);

        getRequest.onsuccess = () => {
          const updatedItem = getRequest.result;
          if (updatedItem) {
            updatedItem.retryCount++;
            updatedItem.status = 'pending';
            updatedItem.error = errorMessage;
            store.put(updatedItem);
          }
        };
      } else {
        // Max retries reached, mark as failed
        await this.updateEvidenceStatus(item.id, 'failed', errorMessage);
      }
      
      throw error;
    }
  }

  /**
   * Sync all pending evidence uploads
   */
  async syncPendingUploads(): Promise<SyncResult> {
    if (this.syncInProgress) {
      return { successful: 0, failed: 0, errors: [] };
    }

    if (!navigator.onLine) {
      return { successful: 0, failed: 0, errors: [{ id: 'network', error: 'No internet connection' }] };
    }

    this.syncInProgress = true;
    const result: SyncResult = { successful: 0, failed: 0, errors: [] };

    try {
      const pendingItems = await this.getPendingEvidence();
      
      for (const item of pendingItems) {
        try {
          await this.uploadEvidenceItem(item);
          result.successful++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            id: item.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    } finally {
      this.syncInProgress = false;
    }

    return result;
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    pending: number;
    uploading: number;
    failed: number;
    total: number;
  }> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([EVIDENCE_STORE], 'readonly');
      const store = transaction.objectStore(EVIDENCE_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result;
        const stats = {
          pending: items.filter(i => i.status === 'pending').length,
          uploading: items.filter(i => i.status === 'uploading').length,
          failed: items.filter(i => i.status === 'failed').length,
          total: items.length,
        };
        resolve(stats);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear completed uploads older than specified days
   */
  async clearOldCompletedUploads(daysOld: number = 7): Promise<number> {
    if (!this.db) await this.initialize();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([EVIDENCE_STORE], 'readwrite');
      const store = transaction.objectStore(EVIDENCE_STORE);
      const index = store.index('createdAt');
      const request = index.openCursor();
      let deletedCount = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const item = cursor.value as QueuedEvidence;
          if (item.status === 'completed' && item.createdAt < cutoffDate) {
            cursor.delete();
            deletedCount++;
          }
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
export const offlineQueueManager = new OfflineQueueManager();

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  offlineQueueManager.initialize().catch(console.error);
}
