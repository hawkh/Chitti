/**
 * Data Recovery System for Critical Failures
 * Task 11.2: Implement data recovery mechanisms for critical failures
 * Requirements: 7.1, 7.2, 7.3, 10.1
 */

import { PrismaClient } from '@prisma/client';
import { ErrorHandler, ErrorCategory, ErrorSeverity } from './error-handler';

const prisma = new PrismaClient();

export interface RecoveryPoint {
  id: string;
  auditId: string;
  userId: string;
  timestamp: Date;
  data: any;
  checksum: string;
  version: number;
}

export interface RecoveryResult {
  success: boolean;
  recoveredData?: any;
  message: string;
  recoveryPoint?: RecoveryPoint;
}

export interface BackupMetadata {
  auditId: string;
  lastBackup: Date;
  backupCount: number;
  totalSize: number;
}

/**
 * Data Recovery Manager
 * Handles automatic backups, recovery points, and data restoration
 */
export class DataRecoveryManager {
  private static readonly BACKUP_KEY_PREFIX = 'audit_backup_';
  private static readonly MAX_BACKUPS_PER_AUDIT = 10;
  private static readonly BACKUP_INTERVAL_MS = 30000; // 30 seconds

  /**
   * Create a recovery point for audit data
   */
  static async createRecoveryPoint(
    auditId: string,
    userId: string,
    data: any
  ): Promise<RecoveryPoint> {
    try {
      const timestamp = new Date();
      const checksum = this.calculateChecksum(data);
      
      // Get existing recovery points
      const existing = await this.getRecoveryPoints(auditId);
      const version = existing.length + 1;

      const recoveryPoint: RecoveryPoint = {
        id: `rp_${auditId}_${timestamp.getTime()}`,
        auditId,
        userId,
        timestamp,
        data,
        checksum,
        version,
      };

      // Store in localStorage
      await this.storeRecoveryPoint(recoveryPoint);

      // Cleanup old recovery points
      await this.cleanupOldRecoveryPoints(auditId);

      console.log(`Recovery point created: ${recoveryPoint.id} (v${version})`);
      return recoveryPoint;
    } catch (error) {
      console.error('Failed to create recovery point:', error);
      throw error;
    }
  }

  /**
   * Recover data from the latest recovery point
   */
  static async recoverLatestData(auditId: string): Promise<RecoveryResult> {
    try {
      const recoveryPoints = await this.getRecoveryPoints(auditId);

      if (recoveryPoints.length === 0) {
        return {
          success: false,
          message: 'No recovery points found',
        };
      }

      // Get the latest recovery point
      const latest = recoveryPoints[recoveryPoints.length - 1];

      // Verify data integrity
      const isValid = this.verifyChecksum(latest.data, latest.checksum);

      if (!isValid) {
        console.warn('Latest recovery point corrupted, trying previous...');
        
        // Try previous recovery points
        for (let i = recoveryPoints.length - 2; i >= 0; i--) {
          const point = recoveryPoints[i];
          if (this.verifyChecksum(point.data, point.checksum)) {
            return {
              success: true,
              recoveredData: point.data,
              message: `Data recovered from backup v${point.version}`,
              recoveryPoint: point,
            };
          }
        }

        return {
          success: false,
          message: 'All recovery points are corrupted',
        };
      }

      return {
        success: true,
        recoveredData: latest.data,
        message: `Data recovered from latest backup v${latest.version}`,
        recoveryPoint: latest,
      };
    } catch (error) {
      console.error('Data recovery failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Recovery failed',
      };
    }
  }

  /**
   * Recover data from a specific version
   */
  static async recoverFromVersion(
    auditId: string,
    version: number
  ): Promise<RecoveryResult> {
    try {
      const recoveryPoints = await this.getRecoveryPoints(auditId);
      const point = recoveryPoints.find((p) => p.version === version);

      if (!point) {
        return {
          success: false,
          message: `Recovery point v${version} not found`,
        };
      }

      const isValid = this.verifyChecksum(point.data, point.checksum);

      if (!isValid) {
        return {
          success: false,
          message: `Recovery point v${version} is corrupted`,
        };
      }

      return {
        success: true,
        recoveredData: point.data,
        message: `Data recovered from v${version}`,
        recoveryPoint: point,
      };
    } catch (error) {
      console.error('Version recovery failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Recovery failed',
      };
    }
  }

  /**
   * Get all recovery points for an audit
   */
  static async getRecoveryPoints(auditId: string): Promise<RecoveryPoint[]> {
    try {
      const key = `${this.BACKUP_KEY_PREFIX}${auditId}`;
      const stored = localStorage.getItem(key);

      if (!stored) {
        return [];
      }

      const points = JSON.parse(stored) as RecoveryPoint[];
      
      // Convert timestamp strings back to Date objects
      return points.map((p) => ({
        ...p,
        timestamp: new Date(p.timestamp),
      }));
    } catch (error) {
      console.error('Failed to get recovery points:', error);
      return [];
    }
  }

  /**
   * Store recovery point in localStorage
   */
  private static async storeRecoveryPoint(
    point: RecoveryPoint
  ): Promise<void> {
    try {
      const key = `${this.BACKUP_KEY_PREFIX}${point.auditId}`;
      const existing = await this.getRecoveryPoints(point.auditId);
      
      existing.push(point);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (error) {
      console.error('Failed to store recovery point:', error);
      throw error;
    }
  }

  /**
   * Cleanup old recovery points (keep only MAX_BACKUPS_PER_AUDIT)
   */
  private static async cleanupOldRecoveryPoints(auditId: string): Promise<void> {
    try {
      const points = await this.getRecoveryPoints(auditId);

      if (points.length > this.MAX_BACKUPS_PER_AUDIT) {
        // Keep only the latest MAX_BACKUPS_PER_AUDIT points
        const toKeep = points.slice(-this.MAX_BACKUPS_PER_AUDIT);
        const key = `${this.BACKUP_KEY_PREFIX}${auditId}`;
        localStorage.setItem(key, JSON.stringify(toKeep));
      }
    } catch (error) {
      console.error('Failed to cleanup recovery points:', error);
    }
  }

  /**
   * Calculate checksum for data integrity verification
   */
  private static calculateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(36);
  }

  /**
   * Verify data integrity using checksum
   */
  private static verifyChecksum(data: any, expectedChecksum: string): boolean {
    const actualChecksum = this.calculateChecksum(data);
    return actualChecksum === expectedChecksum;
  }

  /**
   * Get backup metadata for an audit
   */
  static async getBackupMetadata(auditId: string): Promise<BackupMetadata | null> {
    try {
      const points = await this.getRecoveryPoints(auditId);

      if (points.length === 0) {
        return null;
      }

      const lastBackup = points[points.length - 1].timestamp;
      const totalSize = JSON.stringify(points).length;

      return {
        auditId,
        lastBackup,
        backupCount: points.length,
        totalSize,
      };
    } catch (error) {
      console.error('Failed to get backup metadata:', error);
      return null;
    }
  }

  /**
   * Clear all recovery points for an audit
   */
  static async clearRecoveryPoints(auditId: string): Promise<void> {
    try {
      const key = `${this.BACKUP_KEY_PREFIX}${auditId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear recovery points:', error);
    }
  }

  /**
   * Export recovery points for backup
   */
  static async exportRecoveryPoints(auditId: string): Promise<string> {
    try {
      const points = await this.getRecoveryPoints(auditId);
      return JSON.stringify(points, null, 2);
    } catch (error) {
      console.error('Failed to export recovery points:', error);
      throw error;
    }
  }

  /**
   * Import recovery points from backup
   */
  static async importRecoveryPoints(
    auditId: string,
    data: string
  ): Promise<boolean> {
    try {
      const points = JSON.parse(data) as RecoveryPoint[];
      
      // Validate data
      if (!Array.isArray(points) || points.length === 0) {
        throw new Error('Invalid recovery points data');
      }

      const key = `${this.BACKUP_KEY_PREFIX}${auditId}`;
      localStorage.setItem(key, JSON.stringify(points));
      
      return true;
    } catch (error) {
      console.error('Failed to import recovery points:', error);
      return false;
    }
  }
}

/**
 * Automatic Backup Service
 * Provides automatic periodic backups for audit data
 */
export class AutoBackupService {
  private static backupTimers: Map<string, NodeJS.Timeout> = new Map();
  private static isEnabled = true;

  /**
   * Start automatic backup for an audit
   */
  static startAutoBackup(
    auditId: string,
    userId: string,
    getDataFn: () => any
  ): void {
    if (!this.isEnabled) return;

    // Clear existing timer if any
    this.stopAutoBackup(auditId);

    const timer = setInterval(async () => {
      try {
        const data = getDataFn();
        
        if (data) {
          await DataRecoveryManager.createRecoveryPoint(auditId, userId, data);
        }
      } catch (error) {
        console.error('Auto-backup failed:', error);
        
        await ErrorHandler.handleError(
          error as Error,
          ErrorCategory.SYSTEM,
          {
            userId,
            auditId,
            operation: 'auto-backup',
            timestamp: new Date(),
          }
        );
      }
    }, DataRecoveryManager['BACKUP_INTERVAL_MS']);

    this.backupTimers.set(auditId, timer);
    console.log(`Auto-backup started for audit: ${auditId}`);
  }

  /**
   * Stop automatic backup for an audit
   */
  static stopAutoBackup(auditId: string): void {
    const timer = this.backupTimers.get(auditId);
    
    if (timer) {
      clearInterval(timer);
      this.backupTimers.delete(auditId);
      console.log(`Auto-backup stopped for audit: ${auditId}`);
    }
  }

  /**
   * Stop all automatic backups
   */
  static stopAllBackups(): void {
    this.backupTimers.forEach((timer, auditId) => {
      clearInterval(timer);
      console.log(`Auto-backup stopped for audit: ${auditId}`);
    });
    
    this.backupTimers.clear();
  }

  /**
   * Enable/disable auto-backup service
   */
  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (!enabled) {
      this.stopAllBackups();
    }
  }

  /**
   * Get active backup count
   */
  static getActiveBackupCount(): number {
    return this.backupTimers.size;
  }
}

/**
 * Critical Failure Recovery
 * Handles recovery from critical system failures
 */
export class CriticalFailureRecovery {
  /**
   * Attempt to recover from a critical failure
   */
  static async recoverFromCriticalFailure(
    auditId: string,
    userId: string,
    error: Error
  ): Promise<RecoveryResult> {
    console.error('Critical failure detected:', error);

    // Log the critical error
    await ErrorHandler.handleError(error, ErrorCategory.SYSTEM, {
      userId,
      auditId,
      operation: 'critical-failure-recovery',
      timestamp: new Date(),
      metadata: {
        errorMessage: error.message,
        errorStack: error.stack,
      },
    });

    // Attempt data recovery
    const recoveryResult = await DataRecoveryManager.recoverLatestData(auditId);

    if (recoveryResult.success) {
      console.log('Data successfully recovered from backup');
      
      // Try to restore the data
      try {
        await this.restoreAuditData(auditId, recoveryResult.recoveredData);
        
        return {
          success: true,
          recoveredData: recoveryResult.recoveredData,
          message: 'Critical failure recovered successfully',
          recoveryPoint: recoveryResult.recoveryPoint,
        };
      } catch (restoreError) {
        console.error('Failed to restore recovered data:', restoreError);
        
        return {
          success: false,
          message: 'Data recovered but restoration failed',
        };
      }
    }

    // If recovery failed, try to salvage what we can
    return await this.salvageData(auditId, userId);
  }

  /**
   * Restore audit data from recovery point
   */
  private static async restoreAuditData(
    auditId: string,
    data: any
  ): Promise<void> {
    try {
      // Store in localStorage as a fallback
      localStorage.setItem(`audit_restored_${auditId}`, JSON.stringify(data));
      
      console.log(`Audit data restored to localStorage: ${auditId}`);
    } catch (error) {
      console.error('Failed to restore audit data:', error);
      throw error;
    }
  }

  /**
   * Salvage whatever data we can from a failed audit
   */
  private static async salvageData(
    auditId: string,
    userId: string
  ): Promise<RecoveryResult> {
    try {
      // Try to get data from various sources
      const sources = [
        () => this.getFromLocalStorage(auditId),
        () => this.getFromIndexedDB(auditId),
        () => this.getFromSessionStorage(auditId),
      ];

      for (const source of sources) {
        try {
          const data = await source();
          
          if (data) {
            console.log('Data salvaged from alternative source');
            
            return {
              success: true,
              recoveredData: data,
              message: 'Partial data salvaged from alternative source',
            };
          }
        } catch (error) {
          console.warn('Salvage attempt failed:', error);
        }
      }

      return {
        success: false,
        message: 'Unable to salvage any data',
      };
    } catch (error) {
      console.error('Data salvage failed:', error);
      
      return {
        success: false,
        message: 'Data salvage operation failed',
      };
    }
  }

  /**
   * Try to get data from localStorage
   */
  private static async getFromLocalStorage(auditId: string): Promise<any> {
    const key = `audit_draft_${auditId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Try to get data from IndexedDB
   */
  private static async getFromIndexedDB(auditId: string): Promise<any> {
    // This would integrate with the offline evidence storage
    return null; // Placeholder
  }

  /**
   * Try to get data from sessionStorage
   */
  private static async getFromSessionStorage(auditId: string): Promise<any> {
    const key = `audit_session_${auditId}`;
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
}

export default DataRecoveryManager;
