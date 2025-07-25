// Audit logging service for compliance and tracking

import { AuditLogEntry } from '@/types';
import { IdGenerator } from '@/lib/utils';

export class AuditLogger {
  private static instance: AuditLogger;
  private logs: AuditLogEntry[] = [];

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  log(
    userId: string,
    action: string,
    details: Record<string, any> = {},
    ipAddress?: string
  ): void {
    const entry: AuditLogEntry = {
      id: IdGenerator.generate(),
      userId,
      action,
      timestamp: new Date(),
      details,
      ipAddress
    };

    this.logs.push(entry);
    console.log('Audit Log:', entry);

    // In a real application, you would send this to a backend service
    this.persistLog(entry);
  }

  private async persistLog(entry: AuditLogEntry): Promise<void> {
    try {
      // Store in localStorage for demo purposes
      const existingLogs = this.getStoredLogs();
      existingLogs.push(entry);
      localStorage.setItem('audit_logs', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Failed to persist audit log:', error);
    }
  }

  private getStoredLogs(): AuditLogEntry[] {
    try {
      const stored = localStorage.getItem('audit_logs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  getLogs(userId?: string, action?: string): AuditLogEntry[] {
    let filteredLogs = [...this.logs, ...this.getStoredLogs()];

    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }

    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }

    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('audit_logs');
  }

  // Predefined audit actions
  static readonly ACTIONS = {
    FILE_UPLOAD: 'file_upload',
    DETECTION_START: 'detection_start',
    DETECTION_COMPLETE: 'detection_complete',
    REPORT_GENERATE: 'report_generate',
    REPORT_DOWNLOAD: 'report_download',
    MODEL_LOAD: 'model_load',
    CONFIG_CHANGE: 'config_change',
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout'
  } as const;
}