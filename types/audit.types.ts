export interface AuditLog {
  id: string;
  timestamp: Date;
  userId?: string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  result: 'success' | 'failure';
  errorMessage?: string;
}

export enum AuditAction {
  // File operations
  FILE_UPLOAD = 'file.upload',
  FILE_DELETE = 'file.delete',
  FILE_DOWNLOAD = 'file.download',

  // Detection operations
  DETECTION_START = 'detection.start',
  DETECTION_COMPLETE = 'detection.complete',
  DETECTION_FAILED = 'detection.failed',

  // Batch operations
  BATCH_START = 'batch.start',
  BATCH_COMPLETE = 'batch.complete',
  BATCH_CANCEL = 'batch.cancel',

  // Profile operations
  PROFILE_CREATE = 'profile.create',
  PROFILE_UPDATE = 'profile.update',
  PROFILE_DELETE = 'profile.delete',

  // Report operations
  REPORT_GENERATE = 'report.generate',
  REPORT_EXPORT = 'report.export',

  // System operations
  SYSTEM_LOGIN = 'system.login',
  SYSTEM_LOGOUT = 'system.logout',
  SETTINGS_UPDATE = 'settings.update'
}

export enum ResourceType {
  FILE = 'file',
  DETECTION = 'detection',
  BATCH = 'batch',
  PROFILE = 'profile',
  REPORT = 'report',
  USER = 'user',
  SYSTEM = 'system'
}