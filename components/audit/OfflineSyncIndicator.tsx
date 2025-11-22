'use client';

import { useEffect, useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Loader,
  X
} from 'lucide-react';
import { offlineQueueManager } from '@/lib/audit/offline-queue-manager';
import { backgroundSyncService } from '@/lib/audit/background-sync-service';

export default function OfflineSyncIndicator() {
  const [showDetails, setShowDetails] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingEvidence, setPendingEvidence] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<{ status: string; progress: number } | null>(null);

  useEffect(() => {
    const updateStats = async () => {
      const stats = await offlineQueueManager.getQueueStats();
      const pending = await offlineQueueManager.getPendingEvidence();
      
      setPendingCount(stats.pending);
      setPendingEvidence(pending);
      setIsOnline(backgroundSyncService.getOnlineStatus());
      
      // Calculate total size
      const size = pending.reduce((acc, item) => acc + item.file.size, 0);
      setTotalSize(size);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    // Listen for sync events
    const unsubscribe = backgroundSyncService.onSync((event) => {
      setSyncStatus({
        status: 'complete',
        progress: 100
      });
      updateStats();
      
      // Clear status after 3 seconds
      setTimeout(() => setSyncStatus(null), 3000);
    });

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus({ status: 'syncing', progress: 0 });
    
    try {
      await backgroundSyncService.forceSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Don't show if online and no pending evidence
  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <>
      {/* Compact Indicator */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`fixed bottom-4 right-4 z-40 flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg transition-all ${
          isOnline
            ? pendingCount > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-orange-600 text-white hover:bg-orange-700'
        }`}
      >
        {isOnline ? (
          <Wifi className="h-5 w-5" />
        ) : (
          <WifiOff className="h-5 w-5" />
        )}
        
        {pendingCount > 0 && (
          <>
            <span className="text-sm font-medium">
              {pendingCount} pending
            </span>
            {syncStatus?.status === 'syncing' && (
              <Loader className="h-4 w-4 animate-spin" />
            )}
          </>
        )}
      </button>

      {/* Details Panel */}
      {showDetails && (
        <div className="fixed bottom-20 right-4 z-40 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className={`px-4 py-3 flex items-center justify-between ${
            isOnline ? 'bg-blue-50' : 'bg-orange-50'
          }`}>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <>
                  <Wifi className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-900">Offline</span>
                </>
              )}
            </div>
            <button
              onClick={() => setShowDetails(false)}
              className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Pending Files</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">{formatSize(totalSize)}</p>
              </div>
            </div>

            {/* Sync Status */}
            {syncStatus && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  {syncStatus.status === 'syncing' && (
                    <>
                      <Loader className="h-4 w-4 text-blue-600 animate-spin" />
                      <span className="text-sm font-medium text-blue-900">Syncing...</span>
                    </>
                  )}
                  {syncStatus.status === 'complete' && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Sync Complete</span>
                    </>
                  )}
                  {syncStatus.status === 'error' && (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">Sync Failed</span>
                    </>
                  )}
                </div>
                {syncStatus.progress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${syncStatus.progress}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Pending Evidence List */}
            {pendingEvidence.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">Pending Uploads:</p>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {pendingEvidence.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center space-x-2 text-xs bg-gray-50 rounded p-2">
                      <Upload className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-gray-900">{item.fileName}</p>
                        <p className="text-gray-500">{formatSize(item.file.size)}</p>
                      </div>
                      {item.retryCount > 0 && (
                        <span className="text-orange-600 text-xs">
                          Retry {item.retryCount}
                        </span>
                      )}
                    </div>
                  ))}
                  {pendingEvidence.length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{pendingEvidence.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {pendingCount > 0 && isOnline && (
              <button
                onClick={handleSync}
                disabled={isSyncing || syncStatus?.status === 'syncing'}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSyncing || syncStatus?.status === 'syncing' ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Sync Now</span>
                  </>
                )}
              </button>
            )}

            {/* Offline Message */}
            {!isOnline && pendingCount > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs text-orange-800">
                  Files will be uploaded automatically when you're back online.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
