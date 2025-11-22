// Offline evidence storage using IndexedDB
// Handles queuing evidence uploads when offline and syncing when online

const DB_NAME = 'audit_evidence_offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending_evidence';

export interface PendingEvidence {
  id: string;
  auditId: string;
  itemId?: string;
  responseId?: string;
  file: Blob;
  filename: string;
  fileType: string;
  fileSize: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  retryCount: number;
  lastError?: string;
}

class OfflineEvidenceStorage {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('auditId', 'auditId', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Add evidence to offline queue
   */
  async addPendingEvidence(evidence: Omit<PendingEvidence, 'id' | 'createdAt' | 'retryCount'>): Promise<string> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const id = `pending-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const pendingEvidence: PendingEvidence = {
      ...evidence,
      id,
      createdAt: new Date(),
      retryCount: 0
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(pendingEvidence);

      request.onsuccess = () => {
        resolve(id);
      };

      request.onerror = () => {
        reject(new Error('Failed to add pending evidence'));
      };
    });
  }

  /**
   * Get all pending evidence
   */
  async getAllPending(): Promise<PendingEvidence[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to get pending evidence'));
      };
    });
  }

  /**
   * Get pending evidence for specific audit
   */
  async getPendingByAudit(auditId: string): Promise<PendingEvidence[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('auditId');
      const request = index.getAll(auditId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to get pending evidence'));
      };
    });
  }

  /**
   * Get single pending evidence by ID
   */
  async getPending(id: string): Promise<PendingEvidence | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error('Failed to get pending evidence'));
      };
    });
  }

  /**
   * Update pending evidence (e.g., increment retry count)
   */
  async updatePending(id: string, updates: Partial<PendingEvidence>): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const existing = await this.getPending(id);
    if (!existing) throw new Error('Pending evidence not found');

    const updated = { ...existing, ...updates };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(updated);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to update pending evidence'));
      };
    });
  }

  /**
   * Remove pending evidence after successful upload
   */
  async removePending(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to remove pending evidence'));
      };
    });
  }

  /**
   * Clear all pending evidence (use with caution)
   */
  async clearAll(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to clear pending evidence'));
      };
    });
  }

  /**
   * Get count of pending evidence
   */
  async getCount(): Promise<number> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to count pending evidence'));
      };
    });
  }

  /**
   * Get total size of pending evidence
   */
  async getTotalSize(): Promise<number> {
    const pending = await this.getAllPending();
    return pending.reduce((total, item) => total + item.fileSize, 0);
  }
}

// Singleton instance
export const offlineEvidenceStorage = new OfflineEvidenceStorage();

/**
 * Sync manager for uploading pending evidence when online
 */
export class EvidenceSyncManager {
  private isSyncing = false;
  private syncListeners: Array<(status: SyncStatus) => void> = [];

  /**
   * Check if online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Sync all pending evidence
   */
  async syncAll(): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        message: 'Sync already in progress',
        synced: 0,
        failed: 0,
        total: 0
      };
    }

    if (!this.isOnline()) {
      return {
        success: false,
        message: 'Device is offline',
        synced: 0,
        failed: 0,
        total: 0
      };
    }

    this.isSyncing = true;
    this.notifyListeners({ status: 'syncing', progress: 0 });

    try {
      const pending = await offlineEvidenceStorage.getAllPending();
      const total = pending.length;
      let synced = 0;
      let failed = 0;

      for (let i = 0; i < pending.length; i++) {
        const item = pending[i];

        try {
          await this.uploadPendingEvidence(item);
          await offlineEvidenceStorage.removePending(item.id);
          synced++;
        } catch (error) {
          console.error(`Failed to sync evidence ${item.id}:`, error);
          
          // Update retry count and error
          await offlineEvidenceStorage.updatePending(item.id, {
            retryCount: item.retryCount + 1,
            lastError: error instanceof Error ? error.message : 'Upload failed'
          });
          
          failed++;
        }

        // Notify progress
        const progress = Math.round(((i + 1) / total) * 100);
        this.notifyListeners({ status: 'syncing', progress });
      }

      this.notifyListeners({ status: 'complete', progress: 100 });

      return {
        success: failed === 0,
        message: `Synced ${synced} of ${total} items`,
        synced,
        failed,
        total
      };
    } catch (error) {
      this.notifyListeners({ status: 'error', progress: 0 });
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Sync failed',
        synced: 0,
        failed: 0,
        total: 0
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Upload a single pending evidence item
   */
  private async uploadPendingEvidence(item: PendingEvidence): Promise<void> {
    const formData = new FormData();
    
    // Create File from Blob
    const file = new File([item.file], item.filename, { type: item.fileType });
    formData.append('file', file);
    formData.append('auditId', item.auditId);
    
    if (item.itemId) formData.append('itemId', item.itemId);
    if (item.responseId) formData.append('responseId', item.responseId);
    if (item.metadata) formData.append('metadata', JSON.stringify(item.metadata));

    const token = localStorage.getItem('audit_token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/audit/evidence/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }
  }

  /**
   * Add sync listener
   */
  addSyncListener(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(status: SyncStatus): void {
    this.syncListeners.forEach(listener => listener(status));
  }

  /**
   * Setup automatic sync when coming online
   */
  setupAutoSync(): () => void {
    const handleOnline = () => {
      console.log('Device came online, starting sync...');
      this.syncAll();
    };

    window.addEventListener('online', handleOnline);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }
}

export interface SyncStatus {
  status: 'syncing' | 'complete' | 'error';
  progress: number;
}

export interface SyncResult {
  success: boolean;
  message: string;
  synced: number;
  failed: number;
  total: number;
}

// Singleton instance
export const evidenceSyncManager = new EvidenceSyncManager();
