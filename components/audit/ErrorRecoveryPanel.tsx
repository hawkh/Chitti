'use client';

/**
 * Error Recovery Panel Component
 * Provides UI for error monitoring, data recovery, and sync management
 * Task 11.2: Implement error handling and recovery
 */

import React, { useState } from 'react';
import { useErrorRecovery, useErrorMonitoring } from '@/lib/audit/use-error-recovery';
import { ErrorCategory, ErrorSeverity } from '@/lib/audit/error-handler';

interface ErrorRecoveryPanelProps {
  auditId: string;
  userId: string;
  onDataRecovered?: (data: any) => void;
}

export default function ErrorRecoveryPanel({
  auditId,
  userId,
  onDataRecovered,
}: ErrorRecoveryPanelProps) {
  const {
    errorState,
    attemptRecovery,
    recoverFromCriticalFailure,
    clearError,
    backupState,
    createBackup,
    syncState,
    syncOfflineData,
    recoveredData,
  } = useErrorRecovery(auditId, userId);

  const { errorStats, recentErrors, clearResolved } = useErrorMonitoring();

  const [activeTab, setActiveTab] = useState<'error' | 'backup' | 'sync'>('error');
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);

  const handleRecovery = async () => {
    const result = await attemptRecovery();
    
    if (result.success && onDataRecovered) {
      onDataRecovered(result.recoveredData);
    }
    
    setShowRecoveryDialog(false);
  };

  const handleSync = async () => {
    try {
      await syncOfflineData();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'text-red-600 bg-red-50';
      case ErrorSeverity.HIGH:
        return 'text-orange-600 bg-orange-50';
      case ErrorSeverity.MEDIUM:
        return 'text-yellow-600 bg-yellow-50';
      case ErrorSeverity.LOW:
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Error Recovery & System Health
        </h2>
        
        {errorState.hasError && (
          <button
            onClick={clearError}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Clear Error
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('error')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'error'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Errors ({errorStats.unresolved})
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'backup'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Backups ({backupState.backupCount})
        </button>
        <button
          onClick={() => setActiveTab('sync')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'sync'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sync Queue ({syncState.queueSize})
        </button>
      </div>

      {/* Error Tab */}
      {activeTab === 'error' && (
        <div className="space-y-6">
          {/* Current Error */}
          {errorState.hasError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Active Error
                  </h3>
                  <p className="text-red-700 mb-2">
                    {errorState.error?.message || 'Unknown error'}
                  </p>
                  <p className="text-sm text-red-600">
                    Recovery attempts: {errorState.recoveryAttempts}
                  </p>
                </div>
                
                {errorState.canRecover && !errorState.isRecovering && (
                  <button
                    onClick={() => setShowRecoveryDialog(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Attempt Recovery
                  </button>
                )}
                
                {errorState.isRecovering && (
                  <div className="text-red-600">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Statistics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Errors</p>
              <p className="text-2xl font-bold text-gray-900">{errorStats.total}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{errorStats.resolved}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Unresolved</p>
              <p className="text-2xl font-bold text-yellow-600">{errorStats.unresolved}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Critical</p>
              <p className="text-2xl font-bold text-red-600">{errorStats.criticalCount}</p>
            </div>
          </div>

          {/* Recent Errors */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Errors</h3>
              <button
                onClick={clearResolved}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear Resolved
              </button>
            </div>
            
            <div className="space-y-2">
              {recentErrors.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent errors</p>
              ) : (
                recentErrors.map((error) => (
                  <div
                    key={error.id}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(
                              error.severity
                            )}`}
                          >
                            {error.severity}
                          </span>
                          <span className="text-sm text-gray-600">{error.category}</span>
                        </div>
                        <p className="text-sm text-gray-900">{error.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(error.createdAt).toLocaleString()}
                        </p>
                      </div>
                      
                      {error.resolved && (
                        <span className="text-xs text-green-600 font-medium">
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backup Tab */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Backup Count</p>
              <p className="text-2xl font-bold text-blue-600">
                {backupState.backupCount}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Last Backup</p>
              <p className="text-sm font-medium text-green-600">
                {backupState.lastBackup
                  ? new Date(backupState.lastBackup).toLocaleString()
                  : 'Never'}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Auto-Backup</p>
              <p className="text-sm font-medium text-purple-600">
                {backupState.autoBackupActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setShowRecoveryDialog(true)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Recover from Backup
            </button>
          </div>

          {recoveredData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Data Recovered Successfully
              </h3>
              <p className="text-sm text-green-700">
                Your data has been recovered from the latest backup. You can now continue
                working.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sync Tab */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Queue Size</p>
              <p className="text-2xl font-bold text-blue-600">{syncState.queueSize}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Sync Status</p>
              <p className="text-sm font-medium text-purple-600">
                {syncState.isSyncing ? 'Syncing...' : 'Idle'}
              </p>
            </div>
          </div>

          {syncState.syncProgress && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Sync Progress
                </span>
                <span className="text-sm text-gray-600">
                  {syncState.syncProgress.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${syncState.syncProgress.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>Completed: {syncState.syncProgress.completed}</span>
                <span>Failed: {syncState.syncProgress.failed}</span>
                <span>Total: {syncState.syncProgress.total}</span>
              </div>
            </div>
          )}

          {syncState.lastSyncReport && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Last Sync Report
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Successful</p>
                  <p className="text-lg font-bold text-green-600">
                    {syncState.lastSyncReport.successfulItems}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Failed</p>
                  <p className="text-lg font-bold text-red-600">
                    {syncState.lastSyncReport.failedItems}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="text-lg font-bold text-blue-600">
                    {(syncState.lastSyncReport.duration / 1000).toFixed(1)}s
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleSync}
            disabled={syncState.isSyncing || syncState.queueSize === 0}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {syncState.isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      )}

      {/* Recovery Dialog */}
      {showRecoveryDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Data Recovery
            </h3>
            <p className="text-gray-700 mb-6">
              This will restore your audit data from the latest backup. Any unsaved changes
              will be lost. Do you want to continue?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowRecoveryDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRecovery}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Recover Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
