/**
 * Background Sync Service
 * Handles automatic synchronization when connection is restored
 */

import { offlineQueueManager } from './offline-queue-manager';

interface SyncEvent {
  type: 'manual' | 'auto' | 'periodic';
  timestamp: Date;
  result: {
    successful: number;
    failed: number;
  };
}

class BackgroundSyncService {
  private syncListeners: Array<(event: SyncEvent) => void> = [];
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncAt: Date | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeEventListeners();
      this.startPeriodicSync();
    }
  }

  /**
   * Initialize network event listeners
   */
  private initializeEventListeners(): void {
    window.addEventListener('online', () => {
      console.log('Connection restored, triggering sync...');
      this.isOnline = true;
      this.triggerSync('auto');
    });

    window.addEventListener('offline', () => {
      console.log('Connection lost, entering offline mode');
      this.isOnline = false;
    });

    // Listen for visibility change to sync when app becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.triggerSync('auto');
      }
    });
  }

  /**
   * Start periodic sync check (every 5 minutes when online)
   */
  private startPeriodicSync(): void {
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.triggerSync('periodic');
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Trigger synchronization
   */
  async triggerSync(type: SyncEvent['type'] = 'manual'): Promise<void> {
    if (!this.isOnline) {
      console.log('Cannot sync: offline');
      return;
    }

    try {
      const result = await offlineQueueManager.syncPendingUploads();
      
      const event: SyncEvent = {
        type,
        timestamp: new Date(),
        result: {
          successful: result.successful,
          failed: result.failed,
        },
      };

      this.lastSyncAt = event.timestamp;
      this.notifyListeners(event);

      if (result.successful > 0) {
        console.log(`Sync completed: ${result.successful} items uploaded`);
      }

      if (result.failed > 0) {
        console.warn(`Sync had ${result.failed} failures:`, result.errors);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  /**
   * Register sync event listener
   */
  onSync(callback: (event: SyncEvent) => void): () => void {
    this.syncListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners of sync event
   */
  private notifyListeners(event: SyncEvent): void {
    this.syncListeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Sync listener error:', error);
      }
    });
  }

  /**
   * Get current online status
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Get last sync timestamp
   */
  getLastSyncTime(): Date | null {
    return this.lastSyncAt;
  }

  /**
   * Force manual sync
   */
  async forceSync(): Promise<void> {
    await this.triggerSync('manual');
  }
}

// Singleton instance
export const backgroundSyncService = new BackgroundSyncService();

// Service Worker registration for background sync (if supported)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(registration => {
    if ('sync' in registration) {
      // Register background sync
      registration.sync.register('evidence-upload-sync').catch(err => {
        console.warn('Background sync registration failed:', err);
      });
    }
  });
}
