// Alert Management System
// Handles persistence, acknowledgment, and notification of performance alerts

import { PerformanceAlert } from './trend-analysis';

export interface AlertRecord extends PerformanceAlert {
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  notes?: string;
}

export interface AlertFilter {
  siteId?: string;
  severity?: 'critical' | 'warning' | 'info';
  type?: string;
  acknowledged?: boolean;
  resolved?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface AlertSummary {
  total: number;
  critical: number;
  warning: number;
  info: number;
  unacknowledged: number;
  unresolved: number;
  bySite: Record<string, number>;
  byType: Record<string, number>;
}

/**
 * In-memory alert storage (in production, this would use a database)
 */
let alertStore: AlertRecord[] = [];

/**
 * Save a new alert
 */
export function saveAlert(alert: PerformanceAlert): AlertRecord {
  const alertRecord: AlertRecord = {
    ...alert,
    acknowledged: false,
    resolved: false
  };
  
  // Check for duplicate alerts (same site, type, and within 24 hours)
  const isDuplicate = alertStore.some(existing => 
    existing.siteId === alert.siteId &&
    existing.type === alert.type &&
    !existing.resolved &&
    (Date.now() - existing.detectedAt.getTime()) < 24 * 60 * 60 * 1000
  );
  
  if (!isDuplicate) {
    alertStore.push(alertRecord);
  }
  
  return alertRecord;
}

/**
 * Save multiple alerts
 */
export function saveAlerts(alerts: PerformanceAlert[]): AlertRecord[] {
  return alerts.map(alert => saveAlert(alert));
}

/**
 * Get alerts with optional filtering
 */
export function getAlerts(filter?: AlertFilter): AlertRecord[] {
  let filtered = [...alertStore];
  
  if (filter) {
    if (filter.siteId) {
      filtered = filtered.filter(a => a.siteId === filter.siteId);
    }
    
    if (filter.severity) {
      filtered = filtered.filter(a => a.severity === filter.severity);
    }
    
    if (filter.type) {
      filtered = filtered.filter(a => a.type === filter.type);
    }
    
    if (filter.acknowledged !== undefined) {
      filtered = filtered.filter(a => a.acknowledged === filter.acknowledged);
    }
    
    if (filter.resolved !== undefined) {
      filtered = filtered.filter(a => a.resolved === filter.resolved);
    }
    
    if (filter.dateFrom) {
      filtered = filtered.filter(a => a.detectedAt >= filter.dateFrom!);
    }
    
    if (filter.dateTo) {
      filtered = filtered.filter(a => a.detectedAt <= filter.dateTo!);
    }
  }
  
  // Sort by severity and date (most recent first)
  return filtered.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    
    if (severityDiff !== 0) return severityDiff;
    
    return b.detectedAt.getTime() - a.detectedAt.getTime();
  });
}

/**
 * Get alert by ID
 */
export function getAlertById(id: string): AlertRecord | undefined {
  return alertStore.find(a => a.id === id);
}

/**
 * Acknowledge an alert
 */
export function acknowledgeAlert(
  alertId: string,
  userId: string,
  notes?: string
): AlertRecord | null {
  const alert = alertStore.find(a => a.id === alertId);
  
  if (!alert) return null;
  
  alert.acknowledged = true;
  alert.acknowledgedBy = userId;
  alert.acknowledgedAt = new Date();
  
  if (notes) {
    alert.notes = notes;
  }
  
  return alert;
}

/**
 * Resolve an alert
 */
export function resolveAlert(
  alertId: string,
  userId: string,
  notes?: string
): AlertRecord | null {
  const alert = alertStore.find(a => a.id === alertId);
  
  if (!alert) return null;
  
  alert.resolved = true;
  alert.resolvedBy = userId;
  alert.resolvedAt = new Date();
  
  if (notes) {
    alert.notes = alert.notes ? `${alert.notes}\n\nResolution: ${notes}` : notes;
  }
  
  return alert;
}

/**
 * Get alert summary statistics
 */
export function getAlertSummary(filter?: AlertFilter): AlertSummary {
  const alerts = getAlerts(filter);
  
  const summary: AlertSummary = {
    total: alerts.length,
    critical: 0,
    warning: 0,
    info: 0,
    unacknowledged: 0,
    unresolved: 0,
    bySite: {},
    byType: {}
  };
  
  alerts.forEach(alert => {
    // Count by severity
    summary[alert.severity]++;
    
    // Count unacknowledged and unresolved
    if (!alert.acknowledged) summary.unacknowledged++;
    if (!alert.resolved) summary.unresolved++;
    
    // Count by site
    summary.bySite[alert.siteId] = (summary.bySite[alert.siteId] || 0) + 1;
    
    // Count by type
    summary.byType[alert.type] = (summary.byType[alert.type] || 0) + 1;
  });
  
  return summary;
}

/**
 * Get active alerts (unresolved) for a site
 */
export function getActiveAlertsForSite(siteId: string): AlertRecord[] {
  return getAlerts({
    siteId,
    resolved: false
  });
}

/**
 * Get critical unacknowledged alerts
 */
export function getCriticalUnacknowledgedAlerts(): AlertRecord[] {
  return getAlerts({
    severity: 'critical',
    acknowledged: false,
    resolved: false
  });
}

/**
 * Clean up old resolved alerts (older than 90 days)
 */
export function cleanupOldAlerts(): number {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const initialCount = alertStore.length;
  
  alertStore = alertStore.filter(alert => 
    !alert.resolved || alert.resolvedAt! > ninetyDaysAgo
  );
  
  return initialCount - alertStore.length;
}

/**
 * Get alert trends over time
 */
export function getAlertTrends(days: number = 30): {
  date: Date;
  critical: number;
  warning: number;
  info: number;
  total: number;
}[] {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const alerts = getAlerts({ dateFrom: startDate });
  
  // Group by date
  const trendMap = new Map<string, {
    date: Date;
    critical: number;
    warning: number;
    info: number;
    total: number;
  }>();
  
  alerts.forEach(alert => {
    const dateKey = alert.detectedAt.toISOString().split('T')[0];
    
    if (!trendMap.has(dateKey)) {
      trendMap.set(dateKey, {
        date: new Date(dateKey),
        critical: 0,
        warning: 0,
        info: 0,
        total: 0
      });
    }
    
    const trend = trendMap.get(dateKey)!;
    trend[alert.severity]++;
    trend.total++;
  });
  
  return Array.from(trendMap.values()).sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  );
}

/**
 * Export alerts to CSV format
 */
export function exportAlertsToCSV(alerts: AlertRecord[]): string {
  const headers = [
    'ID',
    'Site ID',
    'Site Name',
    'Severity',
    'Type',
    'Message',
    'Detected At',
    'Threshold',
    'Current Value',
    'Acknowledged',
    'Acknowledged By',
    'Acknowledged At',
    'Resolved',
    'Resolved By',
    'Resolved At',
    'Recommended Action',
    'Notes'
  ];
  
  const rows = alerts.map(alert => [
    alert.id,
    alert.siteId,
    alert.siteName,
    alert.severity,
    alert.type,
    `"${alert.message.replace(/"/g, '""')}"`,
    alert.detectedAt.toISOString(),
    alert.threshold,
    alert.currentValue,
    alert.acknowledged,
    alert.acknowledgedBy || '',
    alert.acknowledgedAt?.toISOString() || '',
    alert.resolved,
    alert.resolvedBy || '',
    alert.resolvedAt?.toISOString() || '',
    `"${alert.recommendedAction.replace(/"/g, '""')}"`,
    alert.notes ? `"${alert.notes.replace(/"/g, '""')}"` : ''
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}

/**
 * Clear all alerts (for testing purposes)
 */
export function clearAllAlerts(): void {
  alertStore = [];
}
