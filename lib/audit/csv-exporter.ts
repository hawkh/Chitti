// CSV Export Utility
// Exports audit data to CSV format for analysis

import { AuditFormData, AuditResponse, ComplianceScore } from '@/types/audit-form.types';
import { getAllChecklistItems } from './iso-checklist';

export interface CSVExportOptions {
  includeComments?: boolean;
  includeSeverity?: boolean;
  includeEvidence?: boolean;
  includeTimestamps?: boolean;
}

export interface AuditCSVData {
  audit: AuditFormData;
  site: {
    name: string;
    location: string;
  };
  inspector: {
    name: string;
    email: string;
  };
  complianceScore?: ComplianceScore;
}

/**
 * CSV Exporter for audit data
 */
export class CSVExporter {
  /**
   * Export single audit to CSV
   */
  static exportAudit(data: AuditCSVData, options: CSVExportOptions = {}): string {
    const rows: string[][] = [];

    // Header row
    const headers = [
      'Audit ID',
      'Site Name',
      'Site Location',
      'Inspector Name',
      'Inspector Email',
      'Audit Date',
      'Audit Type',
      'PDCA Stage',
      'Status',
      'Compliance Score',
      'Clause',
      'Section',
      'Question',
      'Response',
    ];

    if (options.includeSeverity) headers.push('Severity');
    if (options.includeComments) headers.push('Comments');
    if (options.includeEvidence) headers.push('Evidence Count');
    if (options.includeTimestamps) headers.push('Response Timestamp');

    rows.push(headers);

    // Data rows
    const checklistItems = getAllChecklistItems();
    const responses = data.audit.responses;

    checklistItems.forEach(item => {
      const response = responses[item.id];
      if (!response) return;

      const row = [
        data.audit.id || '',
        data.site.name,
        data.site.location,
        data.inspector.name,
        data.inspector.email,
        new Date(data.audit.auditDate).toLocaleDateString(),
        data.audit.auditType || '',
        data.audit.pdcaStage || '',
        data.audit.status || '',
        data.complianceScore?.overallScore.toFixed(1) || '',
        item.clauseRef,
        item.section,
        item.question,
        response.response || '',
      ];

      if (options.includeSeverity) row.push(response.severity || '');
      if (options.includeComments) row.push(this.escapeCSV(response.comments || ''));
      if (options.includeEvidence) row.push((response.evidenceIds?.length || 0).toString());
      if (options.includeTimestamps) row.push(response.timestamp ? new Date(response.timestamp).toISOString() : '');

      rows.push(row);
    });

    return this.convertToCSV(rows);
  }

  /**
   * Export multiple audits to CSV
   */
  static exportMultipleAudits(audits: AuditCSVData[], options: CSVExportOptions = {}): string {
    const rows: string[][] = [];

    // Header row
    const headers = [
      'Audit ID',
      'Site Name',
      'Site Location',
      'Inspector Name',
      'Audit Date',
      'Audit Type',
      'PDCA Stage',
      'Status',
      'Compliance Score',
      'Passed Items',
      'Failed Items',
      'N/A Items',
      'Total Items',
      'Critical Failures',
    ];

    rows.push(headers);

    // Data rows
    audits.forEach(data => {
      const score = data.complianceScore;
      const row = [
        data.audit.id || '',
        data.site.name,
        data.site.location,
        data.inspector.name,
        new Date(data.audit.auditDate).toLocaleDateString(),
        data.audit.auditType || '',
        data.audit.pdcaStage || '',
        data.audit.status || '',
        score?.overallScore.toFixed(1) || '',
        score?.passedItems.toString() || '',
        score?.failedItems.toString() || '',
        score?.naItems.toString() || '',
        score?.totalItems.toString() || '',
        score?.criticalFailures.toString() || '',
      ];

      rows.push(row);
    });

    return this.convertToCSV(rows);
  }

  /**
   * Export compliance scores to CSV
   */
  static exportComplianceScores(
    scores: Array<{
      auditId: string;
      siteName: string;
      auditDate: Date;
      score: ComplianceScore;
    }>
  ): string {
    const rows: string[][] = [];

    // Header row
    rows.push([
      'Audit ID',
      'Site Name',
      'Audit Date',
      'Overall Score',
      'Passed Items',
      'Failed Items',
      'N/A Items',
      'Critical Failures',
      'High Severity',
      'Medium Severity',
      'Low Severity',
    ]);

    // Data rows
    scores.forEach(item => {
      rows.push([
        item.auditId,
        item.siteName,
        new Date(item.auditDate).toLocaleDateString(),
        item.score.overallScore.toFixed(1),
        item.score.passedItems.toString(),
        item.score.failedItems.toString(),
        item.score.naItems.toString(),
        item.score.criticalFailures.toString(),
        item.score.highSeverityCount.toString(),
        item.score.mediumSeverityCount.toString(),
        item.score.lowSeverityCount.toString(),
      ]);
    });

    return this.convertToCSV(rows);
  }

  /**
   * Export benchmarking data to CSV
   */
  static exportBenchmarking(
    sites: Array<{
      siteId: string;
      siteName: string;
      currentScore: number;
      previousScore: number | null;
      trend: string;
      totalAudits: number;
      criticalFailures: number;
      ranking: number;
    }>
  ): string {
    const rows: string[][] = [];

    // Header row
    rows.push([
      'Ranking',
      'Site ID',
      'Site Name',
      'Current Score',
      'Previous Score',
      'Delta',
      'Trend',
      'Total Audits',
      'Critical Failures',
    ]);

    // Data rows
    sites.forEach(site => {
      const delta = site.previousScore !== null 
        ? (site.currentScore - site.previousScore).toFixed(1)
        : 'N/A';

      rows.push([
        site.ranking.toString(),
        site.siteId,
        site.siteName,
        site.currentScore.toFixed(1),
        site.previousScore?.toFixed(1) || 'N/A',
        delta,
        site.trend,
        site.totalAudits.toString(),
        site.criticalFailures.toString(),
      ]);
    });

    return this.convertToCSV(rows);
  }

  /**
   * Export trend data to CSV
   */
  static exportTrendData(
    dataPoints: Array<{
      date: Date;
      score: number;
      auditId: string;
      siteId: string;
      siteName: string;
    }>
  ): string {
    const rows: string[][] = [];

    // Header row
    rows.push([
      'Date',
      'Site ID',
      'Site Name',
      'Audit ID',
      'Score',
    ]);

    // Data rows
    dataPoints.forEach(point => {
      rows.push([
        new Date(point.date).toLocaleDateString(),
        point.siteId,
        point.siteName,
        point.auditId,
        point.score.toFixed(1),
      ]);
    });

    return this.convertToCSV(rows);
  }

  /**
   * Convert 2D array to CSV string
   */
  private static convertToCSV(rows: string[][]): string {
    return rows
      .map(row => row.map(cell => this.escapeCSV(cell)).join(','))
      .join('\n');
  }

  /**
   * Escape CSV special characters
   */
  private static escapeCSV(value: string): string {
    if (value === null || value === undefined) return '';
    
    const stringValue = String(value);
    
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  }

  /**
   * Generate filename for export
   */
  static generateFilename(type: 'audit' | 'benchmarking' | 'trends' | 'scores', prefix?: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const prefixStr = prefix ? `${prefix}-` : '';
    return `${prefixStr}${type}-export-${timestamp}.csv`;
  }

  /**
   * Create downloadable CSV blob
   */
  static createDownloadBlob(csvContent: string): Blob {
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Trigger browser download
   */
  static downloadCSV(csvContent: string, filename: string): void {
    const blob = this.createDownloadBlob(csvContent);
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}

export default CSVExporter;
