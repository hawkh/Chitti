'use client';

import { useEffect, useState } from 'react';
import { offlineQueueManager } from '@/lib/audit/offline-queue-manager';
import { backgroundSyncService } from '@/lib/audit/background-sync-service';

interface QueueStats {
  pending: number;
  uploading: number;
  failed: number;
  total: number;
}

export default function OfflineQueueStatus() {
  const [stats, setStats] = useState<QueueStats>({
    pending: 0,
    uploading: 0,
    failed: 0,
    total: 0,
  });
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Load initial stats
    loadStats();

    // Update stats every 10 seconds
    const interval = setInterval(loadStats, 10000);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for sync events
    const unsubscribe = backgroundSyncService.onSync((event) => {
      setLastSync(event.timestamp);
      loadStats();
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const loadStats = async () => {
    try {
      const queueStats = await offlineQueueManager.getQueueStats();
      setStats(queueStats);
      setIsOnline(backgroundSyncService.getOnlineStatus());
      setLastSync(backgroundSyncService.getLastSyncTime());
    } catch (error) {
      console.error('Failed to load queue stats:', error);
    }
  };

  const handleManualSync = async () => {
    if (!isOnline) return;
    
    setSyncing(true);
    try {
      await backgroundSyncService.forceSync();
      await loadStats();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  if (stats.total === 0 && isOnline) {
    return null; // Don't show if no queued items and online
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          Upload Queue
        </h3>
        {!isOnline && (
          <span className="text-xs text-red-600 font-medium">Offline</span>
        )}
      </div>

      {stats.total > 0 && (
        <div className="space-y-2 mb-3">
          {stats.pending > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending:</span>
              <span className="font-medium text-yellow-600">{stats.pending}</span>
            </div>
          )}
          {stats.uploading > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Uploading:</span>
              <span className="font-medium text-blue-600">{stats.uploading}</span>
            </div>
          )}
          {stats.failed > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Failed:</span>
              <span className="font-medium text-red-600">{stats.failed}</span>
            </div>
          )}
        </div>
      )}

      {lastSync && (
        <div className="text-xs text-gray-500 mb-3">
          Last sync: {lastSync.toLocaleTimeString()}
        </div>
      )}

      {isOnline && stats.pending > 0 && (
        <button
          onClick={handleManualSync}
          disabled={syncing}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {syncing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Syncing...
            </span>
          ) : (
            'Sync Now'
          )}
        </button>
      )}

      {!isOnline && stats.pending > 0 && (
        <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
          {stats.pending} file{stats.pending !== 1 ? 's' : ''} will upload when connection is restored
        </div>
      )}

      {stats.failed > 0 && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 mt-2">
          {stats.failed} upload{stats.failed !== 1 ? 's' : ''} failed after multiple attempts
        </div>
      )}
    </div>
  );
}
