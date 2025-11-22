/**
 * Enhanced Offline Sync Manager with Comprehensive Error Handling
 * Task 11.2: Graceful degradation for system failures
 * Requirements: 7.1, 7.2, 7.3, 10.1
 */

import { ErrorHandler, ErrorCategory, GracefulDegradation } from './error-handler';
import { DataRecoveryManager } from './data-recovery';

export interface SyncQueueItem {
  id: string;
  type: 'audit' | 'response' | 'evidence' | 'comment';
  operation: 'create' | 'update' | 'delete';
  data: any;
  url: string;
  method: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  lastAttempt?: Date;
  lastError?: string;
}

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  percentage: number;
}

export interface SyncReport {
  success: boolean;
  totalItems: number;
  successfulItems: number;
  failedItems: number;
  skippedItems: number;
  errors: Array<{ itemId: string; error: string }>;
  duration: number;
}

/**
 * Enhanced Offline Sync Manager
 * Provides robust offline data synchronization with error recovery
 */
export class EnhancedOfflineSyncManager {
  private static readonly QUEUE_KEY = 'enhanced_sync_queue';
  private static readonly MAX_CONCURRENT_SYNCS = 3;
  private static isSyncing = false;
  private static syncListeners: Array<(progress: SyncProgress) => void> = [];
  private static abortController: AbortController | null = null;

  /**
   * Add item to sync queue
   */
  static async addToQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retryCount'>): Promise<string> {
    try {
      const id = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      const queueItem: SyncQueueItem = {
        ...item,
        id,
        createdAt: new Date(),
        retryCount: 0,
      };

      const queue = await this.getQueue();
      queue.push(queueItem);
      await this.saveQueue(queue);

      console.log(`Added to sync queue: ${id} (${item.type})`);
      return id;
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
      throw error;
    }
  }

  /**
   * Get sync queue
   */
  static async getQueue(): Promise<SyncQueueItem[]> {
    try {
      const stored = localStorage.getItem(this.QUEUE_KEY);
      
      if (!stored) {
        return [];
      }

      const queue = JSON.parse(stored) as SyncQueueItem[];
      
      // Convert date strings back to Date objects
      return queue.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        lastAttempt: item.lastAttempt ? new Date(item.lastAttempt) : undefined,
      }));
    } catch (error) {
      console.error('Failed to get sync queue:', error);
      return [];
    }
  }

  /**
   * Save sync queue
   */
  private static async saveQueue(queue: SyncQueueItem[]): Promise<void> {
    try {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
      throw error;
    }
  }

  /**
   * Sync all queued items
   */
  static async syncAll(userId: string): Promise<SyncReport> {
    if (this.isSyncing) {
      throw new Error('Sync already in progress');
    }

    if (!navigator.onLine) {
      throw new Error('Device is offline');
    }

    this.isSyncing = true;
    this.abortController = new AbortController();
    const startTime = Date.now();

    try {
      const queue = await this.getQueue();
      
      if (queue.length === 0) {
        return {
          success: true,
          totalItems: 0,
          successfulItems: 0,
          failedItems: 0,
          skippedItems: 0,
          errors: [],
          duration: 0,
        };
      }

      // Sort by priority and creation time
      const sortedQueue = this.sortQueueByPriority(queue);

      const report: SyncReport = {
        success: true,
        totalItems: sortedQueue.length,
        successfulItems: 0,
        failedItems: 0,
        skippedItems: 0,
        errors: [],
        duration: 0,
      };

      // Process items in batches
      const batches = this.createBatches(sortedQueue, this.MAX_CONCURRENT_SYNCS);

      for (const batch of batches) {
        if (this.abortController.signal.aborted) {
          report.skippedItems += sortedQueue.length - (report.successfulItems + report.failedItems);
          break;
        }

        const results = await Promise.allSettled(
          batch.map((item) => this.syncItem(item, userId))
        );

        results.forEach((result, index) => {
          const item = batch[index];

          if (result.status === 'fulfilled' && result.value.success) {
            report.successfulItems++;
          } else {
            report.failedItems++;
            const error = result.status === 'rejected' 
              ? result.reason.message 
              : result.value.error;
            
            report.errors.push({
              itemId: item.id,
              error,
            });
          }
        });

        // Notify progress
        this.notifyProgress({
          total: report.totalItems,
          completed: report.successfulItems,
          failed: report.failedItems,
          inProgress: 0,
          percentage: Math.round(
            ((report.successfulItems + report.failedItems) / report.totalItems) * 100
          ),
        });
      }

      // Remove successful items from queue
      const remainingQueue = sortedQueue.filter((item) => {
        const wasSuccessful = !report.errors.some((e) => e.itemId === item.id);
        return !wasSuccessful;
      });

      await this.saveQueue(remainingQueue);

      report.duration = Date.now() - startTime;
      report.success = report.failedItems === 0;

      return report;
    } catch (error) {
      console.error('Sync failed:', error);
      
      await ErrorHandler.handleError(error as Error, ErrorCategory.NETWORK, {
        userId,
        operation: 'sync-all',
        timestamp: new Date(),
      });

      throw error;
    } finally {
      this.isSyncing = false;
      this.abortController = null;
    }
  }

  /**
   * Sync a single item
   */
  private static async syncItem(
    item: SyncQueueItem,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if max retries exceeded
      if (item.retryCount >= item.maxRetries) {
        console.warn(`Max retries exceeded for item: ${item.id}`);
        
        return {
          success: false,
          error: 'Max retries exceeded',
        };
      }

      // Update retry count and last attempt
      item.retryCount++;
      item.lastAttempt = new Date();

      // Get auth token
      const token = localStorage.getItem('audit_token');
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Prepare request
      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
      };

      let body: any;

      if (item.method !== 'GET' && item.method !== 'DELETE') {
        if (item.data instanceof FormData) {
          body = item.data;
        } else {
          headers['Content-Type'] = 'application/json';
          body = JSON.stringify(item.data);
        }
      }

      // Execute request with timeout
      const response = await GracefulDegradation.withTimeout(
        async () => {
          return fetch(item.url, {
            method: item.method,
            headers,
            body,
            signal: this.abortController?.signal,
          });
        },
        30000, // 30 second timeout
        {
          userId,
          operation: `sync-${item.type}`,
          timestamp: new Date(),
          metadata: { itemId: item.id },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      console.log(`Successfully synced item: ${item.id}`);
      
      return { success: true };
    } catch (error) {
      console.error(`Failed to sync item ${item.id}:`, error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      item.lastError = errorMessage;

      // Update queue with retry info
      const queue = await this.getQueue();
      const index = queue.findIndex((q) => q.id === item.id);
      
      if (index !== -1) {
        queue[index] = item;
        await this.saveQueue(queue);
      }

      // Log error
      await ErrorHandler.handleError(error as Error, ErrorCategory.NETWORK, {
        userId,
        operation: `sync-${item.type}`,
        timestamp: new Date(),
        metadata: {
          itemId: item.id,
          retryCount: item.retryCount,
        },
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Sort queue by priority
   */
  private static sortQueueByPriority(queue: SyncQueueItem[]): SyncQueueItem[] {
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };

    return [...queue].sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      // If same priority, sort by creation time
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }

  /**
   * Create batches for concurrent processing
   */
  private static createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    return batches;
  }

  /**
   * Cancel ongoing sync
   */
  static cancelSync(): void {
    if (this.abortController) {
      this.abortController.abort();
      console.log('Sync cancelled');
    }
  }

  /**
   * Clear sync queue
   */
  static async clearQueue(): Promise<void> {
    try {
      localStorage.removeItem(this.QUEUE_KEY);
      console.log('Sync queue cleared');
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
    }
  }

  /**
   * Get queue statistics
   */
  static async getQueueStats() {
    const queue = await this.getQueue();

    const stats = {
      total: queue.length,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      failedItems: queue.filter((item) => item.retryCount >= item.maxRetries).length,
      oldestItem: queue.length > 0 ? queue[0].createdAt : null,
    };

    queue.forEach((item) => {
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
      stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1;
    });

    return stats;
  }

  /**
   * Retry failed items
   */
  static async retryFailed(userId: string): Promise<SyncReport> {
    const queue = await this.getQueue();
    const failedItems = queue.filter((item) => item.lastError && item.retryCount < item.maxRetries);

    if (failedItems.length === 0) {
      return {
        success: true,
        totalItems: 0,
        successfulItems: 0,
        failedItems: 0,
        skippedItems: 0,
        errors: [],
        duration: 0,
      };
    }

    // Reset retry counts for failed items
    failedItems.forEach((item) => {
      item.retryCount = 0;
      item.lastError = undefined;
    });

    await this.saveQueue(queue);

    return await this.syncAll(userId);
  }

  /**
   * Add sync progress listener
   */
  static addProgressListener(listener: (progress: SyncProgress) => void): () => void {
    this.syncListeners.push(listener);
    
    return () => {
      this.syncListeners = this.syncListeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify progress listeners
   */
  private static notifyProgress(progress: SyncProgress): void {
    this.syncListeners.forEach((listener) => listener(progress));
  }

  /**
   * Setup automatic sync when online
   */
  static setupAutoSync(userId: string): () => void {
    const handleOnline = async () => {
      console.log('Device came online, starting auto-sync...');
      
      try {
        const report = await this.syncAll(userId);
        console.log('Auto-sync completed:', report);
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }
}

export default EnhancedOfflineSyncManager;
