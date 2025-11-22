/**
 * React Hook for Error Recovery and Data Protection
 * Task 11.2: Implement error handling and recovery
 * Requirements: 7.1, 7.2, 7.3, 10.1
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ErrorHandler, ErrorCategory, ErrorSeverity } from './error-handler';
import {
  DataRecoveryManager,
  AutoBackupService,
  CriticalFailureRecovery,
  type RecoveryResult,
  type BackupMetadata,
} from './data-recovery';
import {
  EnhancedOfflineSyncManager,
  type SyncProgress,
  type SyncReport,
} from './enhanced-offline-sync';

export interface ErrorRecoveryState {
  hasError: boolean;
  error: Error | null;
  canRecover: boolean;
  isRecovering: boolean;
  recoveryAttempts: number;
}

export interface BackupState {
  isBackupEnabled: boolean;
  lastBackup: Date | null;
  backupCount: number;
  autoBackupActive: boolean;
}

export interface SyncState {
  isSyncing: boolean;
  syncProgress: SyncProgress | null;
  lastSyncReport: SyncReport | null;
  queueSize: number;
}

/**
 * Hook for comprehensive error recovery and data protection
 */
export function useErrorRecovery(auditId: string, userId: string) {
  const [errorState, setErrorState] = useState<ErrorRecoveryState>({
    hasError: false,
    error: null,
    canRecover: false,
    isRecovering: false,
    recoveryAttempts: 0,
  });

  const [backupState, setBackupState] = useState<BackupState>({
    isBackupEnabled: true,
    lastBackup: null,
    backupCount: 0,
    autoBackupActive: false,
  });

  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    syncProgress: null,
    lastSyncReport: null,
    queueSize: 0,
  });

  const dataRef = useRef<any>(null);

  /**
   * Handle error with automatic recovery attempt
   */
  const handleError = useCallback(
    async (error: Error, category: ErrorCategory = ErrorCategory.SYSTEM) => {
      console.error('Error occurred:', error);

      setErrorState((prev) => ({
        ...prev,
        hasError: true,
        error,
        recoveryAttempts: prev.recoveryAttempts + 1,
      }));

      // Log error
      const strategy = await ErrorHandler.handleError(error, category, {
        userId,
        auditId,
        operation: 'user-action',
        timestamp: new Date(),
      });

      setErrorState((prev) => ({
        ...prev,
        canRecover: strategy.canRecover,
      }));

      // Attempt automatic recovery for recoverable errors
      if (strategy.canRecover && strategy.action === 'retry') {
        await attemptRecovery();
      }
    },
    [auditId, userId]
  );

  /**
   * Attempt to recover from error
   */
  const attemptRecovery = useCallback(async (): Promise<RecoveryResult> => {
    setErrorState((prev) => ({ ...prev, isRecovering: true }));

    try {
      const result = await DataRecoveryManager.recoverLatestData(auditId);

      if (result.success) {
        setErrorState({
          hasError: false,
          error: null,
          canRecover: false,
          isRecovering: false,
          recoveryAttempts: 0,
        });

        // Update data ref with recovered data
        dataRef.current = result.recoveredData;
      } else {
        setErrorState((prev) => ({
          ...prev,
          isRecovering: false,
          canRecover: false,
        }));
      }

      return result;
    } catch (error) {
      console.error('Recovery failed:', error);
      
      setErrorState((prev) => ({
        ...prev,
        isRecovering: false,
        canRecover: false,
      }));

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Recovery failed',
      };
    }
  }, [auditId]);

  /**
   * Recover from critical failure
   */
  const recoverFromCriticalFailure = useCallback(
    async (error: Error): Promise<RecoveryResult> => {
      setErrorState((prev) => ({ ...prev, isRecovering: true }));

      try {
        const result = await CriticalFailureRecovery.recoverFromCriticalFailure(
          auditId,
          userId,
          error
        );

        if (result.success) {
          setErrorState({
            hasError: false,
            error: null,
            canRecover: false,
            isRecovering: false,
            recoveryAttempts: 0,
          });

          dataRef.current = result.recoveredData;
        } else {
          setErrorState((prev) => ({
            ...prev,
            isRecovering: false,
          }));
        }

        return result;
      } catch (error) {
        console.error('Critical recovery failed:', error);
        
        setErrorState((prev) => ({
          ...prev,
          isRecovering: false,
        }));

        return {
          success: false,
          message: 'Critical recovery failed',
        };
      }
    },
    [auditId, userId]
  );

  /**
   * Create manual backup
   */
  const createBackup = useCallback(
    async (data: any) => {
      try {
        await DataRecoveryManager.createRecoveryPoint(auditId, userId, data);
        
        // Update backup state
        const metadata = await DataRecoveryManager.getBackupMetadata(auditId);
        
        if (metadata) {
          setBackupState((prev) => ({
            ...prev,
            lastBackup: metadata.lastBackup,
            backupCount: metadata.backupCount,
          }));
        }

        return true;
      } catch (error) {
        console.error('Backup creation failed:', error);
        return false;
      }
    },
    [auditId, userId]
  );

  /**
   * Start automatic backup
   */
  const startAutoBackup = useCallback(
    (getDataFn: () => any) => {
      AutoBackupService.startAutoBackup(auditId, userId, getDataFn);
      
      setBackupState((prev) => ({
        ...prev,
        autoBackupActive: true,
      }));
    },
    [auditId, userId]
  );

  /**
   * Stop automatic backup
   */
  const stopAutoBackup = useCallback(() => {
    AutoBackupService.stopAutoBackup(auditId);
    
    setBackupState((prev) => ({
      ...prev,
      autoBackupActive: false,
    }));
  }, [auditId]);

  /**
   * Sync offline data
   */
  const syncOfflineData = useCallback(async (): Promise<SyncReport> => {
    setSyncState((prev) => ({ ...prev, isSyncing: true }));

    try {
      const report = await EnhancedOfflineSyncManager.syncAll(userId);
      
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncReport: report,
      }));

      return report;
    } catch (error) {
      console.error('Sync failed:', error);
      
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
      }));

      throw error;
    }
  }, [userId]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      canRecover: false,
      isRecovering: false,
      recoveryAttempts: 0,
    });
  }, []);

  /**
   * Load backup metadata on mount
   */
  useEffect(() => {
    const loadBackupMetadata = async () => {
      const metadata = await DataRecoveryManager.getBackupMetadata(auditId);
      
      if (metadata) {
        setBackupState((prev) => ({
          ...prev,
          lastBackup: metadata.lastBackup,
          backupCount: metadata.backupCount,
        }));
      }
    };

    loadBackupMetadata();
  }, [auditId]);

  /**
   * Setup sync progress listener
   */
  useEffect(() => {
    const unsubscribe = EnhancedOfflineSyncManager.addProgressListener(
      (progress) => {
        setSyncState((prev) => ({
          ...prev,
          syncProgress: progress,
        }));
      }
    );

    return unsubscribe;
  }, []);

  /**
   * Update queue size periodically
   */
  useEffect(() => {
    const updateQueueSize = async () => {
      const stats = await EnhancedOfflineSyncManager.getQueueStats();
      setSyncState((prev) => ({
        ...prev,
        queueSize: stats.total,
      }));
    };

    updateQueueSize();
    const interval = setInterval(updateQueueSize, 5000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (backupState.autoBackupActive) {
        AutoBackupService.stopAutoBackup(auditId);
      }
    };
  }, [auditId, backupState.autoBackupActive]);

  return {
    // Error state
    errorState,
    handleError,
    attemptRecovery,
    recoverFromCriticalFailure,
    clearError,

    // Backup state
    backupState,
    createBackup,
    startAutoBackup,
    stopAutoBackup,

    // Sync state
    syncState,
    syncOfflineData,

    // Data ref
    recoveredData: dataRef.current,
  };
}

/**
 * Hook for monitoring system errors
 */
export function useErrorMonitoring() {
  const [errorStats, setErrorStats] = useState({
    total: 0,
    resolved: 0,
    unresolved: 0,
    criticalCount: 0,
    byCategory: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>,
  });

  const [recentErrors, setRecentErrors] = useState<any[]>([]);

  /**
   * Refresh error statistics
   */
  const refreshStats = useCallback(() => {
    const stats = ErrorHandler.getErrorStatistics();
    setErrorStats(stats);

    const recent = ErrorHandler.getErrorHistory({ limit: 10 });
    setRecentErrors(recent);
  }, []);

  /**
   * Clear resolved errors
   */
  const clearResolved = useCallback(() => {
    const cleared = ErrorHandler.clearResolvedErrors();
    console.log(`Cleared ${cleared} resolved errors`);
    refreshStats();
  }, [refreshStats]);

  /**
   * Get errors by category
   */
  const getErrorsByCategory = useCallback((category: ErrorCategory) => {
    return ErrorHandler.getErrorHistory({ category });
  }, []);

  /**
   * Get errors by severity
   */
  const getErrorsBySeverity = useCallback((severity: ErrorSeverity) => {
    return ErrorHandler.getErrorHistory({ severity });
  }, []);

  /**
   * Refresh stats periodically
   */
  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [refreshStats]);

  return {
    errorStats,
    recentErrors,
    refreshStats,
    clearResolved,
    getErrorsByCategory,
    getErrorsBySeverity,
  };
}

export default useErrorRecovery;
