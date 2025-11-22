// ISO-Compliant Report Generation System
// Generates standardized PDF reports following ISO 9001 format requirements

import { AuditFormData, ComplianceScore } from '@/types/audit-form.types';
import { ISO_9001_CHECKLIST, ISOChecklistSection } from './iso-checklist';

export interface ReportOptions {
  includeEvidence?: boolean;
  includeComments?: boolean;
  includeCorrectiveActions?: boolean;
  format?: 'pdf' | 'html' | 'json';
  branding?: {
    companyName?: string;
    logo?: string;
    colors?: {
      primary?: string;
      secondary?: string;
    };
  };
}

export interface ReportData {
  audit: AuditFormData;
  site: {
    id: string;
    name: string;
    location: string;
    contactPerson?: string;
  };
  inspector: {
    id: string;
    name: string;
    email: string;
    certifications?: string[];
  };
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  complianceScore: ComplianceScore;
  evidence?: Array<{
    id: string;
    itemId: string;
    filename: string;
    url: string;
    thumbnailUrl?: string;
  }>;
  correctiveActions?: Array<{
    itemId: string;
    action: string;
    assignedTo?: string;
    dueDate?: Date;
    status?: string;
  }>;
}

export interface ReportMetadata {
  reportId: string;
  generatedAt: Date;
  generatedBy: string;
  version: string;
  standard: string;
}

/**
 * Generate ISO 9001 compliant audit report
 */
export class ReportGenerator {
  /**
   * Generate complete audit report
   */
  static async generateReport(
    data: ReportData,
    options: ReportOptions = {}
  ): Promise<string> {
    const format = options.format || 'html';

    switch (format) {
      case 'html':
        return this.generateHTMLReport(data, options);
      case 'json':
        return JSON.stringify(this.generateJSONReport(data, options), null, 2);
      case 'pdf':
        // PDF generation would require a library like puppeteer or pdfkit
        // For now, generate HTML that can be converted to PDF
        return this.generateHTMLReport(data, options);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Generate HTML report
   */
  private static generateHTMLReport(
    data: ReportData,
    options: ReportOptions
  ): string {
    const metadata = this.generateMetadata(data);
    const branding = options.branding || {};

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ISO 9001:2015 Audit Report - ${data.site.name}</title>
  <style>
    ${this.getReportStyles(branding)}
  </style>
</head>
<body>
  <div class="report-container">
    ${this.generateHeader(data, metadata, branding)}
    ${this.generateExecutiveSummary(data)}
    ${this.generateAuditDetails(data)}
    ${this.generateComplianceScore(data)}
    ${this.generateFindingsBySection(data, options)}
    ${options.includeCorrectiveActions ? this.generateCorrectiveActions(data) : ''}
    ${options.includeEvidence ? this.generateEvidenceGallery(data) : ''}
    ${this.generateSignatures(data)}
    ${this.generateFooter(metadata)}
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate report metadata
   */
  private static generateMetadata(data: ReportData): ReportMetadata {
    return {
      reportId: `ISO-${data.audit.id?.slice(0, 8) || 'DRAFT'}`,
      generatedAt: new Date(),
      generatedBy: data.manager?.name || data.inspector.name,
      version: '1.0',
      standard: 'ISO 9001:2015',
    };
  }

  /**
   * Generate report header
   */
  private static generateHeader(
    data: ReportData,
    metadata: ReportMetadata,
    branding: any
  ): string {
    return `
    <header class="report-header">
      <div class="header-content">
        ${branding.logo ? `<img src="${branding.logo}" alt="Company Logo" class="company-logo" />` : ''}
        <div class="header-text">
          <h1>${branding.companyName || 'Quality Management System'}</h1>
          <h2>ISO 9001:2015 Audit Report</h2>
        </div>
      </div>
      <div class="report-info">
        <div class="info-row">
          <span class="label">Report ID:</span>
          <span class="value">${metadata.reportId}</span>
        </div>
        <div class="info-row">
          <span class="label">Generated:</span>
          <span class="value">${metadata.generatedAt.toLocaleString()}</span>
        </div>
        <div class="info-row">
          <span class="label">Standard:</span>
          <span class="value">${metadata.standard}</span>
        </div>
      </div>
    </header>
    `;
  }

  /**
   * Generate executive summary
   */
  private static generateExecutiveSummary(data: ReportData): string {
    const score = data.complianceScore;
    const grade = this.getGrade(score.overallScore);

    return `
    <section class="executive-summary">
      <h2>Executive Summary</h2>
      <div class="summary-grid">
        <div class="summary-card">
          <h3>Overall Compliance</h3>
          <div class="score-display ${this.getScoreClass(score.overallScore)}">
            ${score.overallScore.toFixed(1)}%
          </div>
          <div class="grade">${grade.grade} - ${grade.label}</div>
        </div>
        <div class="summary-card">
          <h3>Audit Results</h3>
          <div class="results-grid">
            <div class="result-item">
              <span class="result-label">Passed:</span>
              <span class="result-value passed">${score.passedItems}</span>
            </div>
            <div class="result-item">
              <span class="result-label">Failed:</span>
              <span class="result-value failed">${score.failedItems}</span>
            </div>
            <div class="result-item">
              <span class="result-label">N/A:</span>
              <span class="result-value na">${score.naItems}</span>
            </div>
            <div class="result-item">
              <span class="result-label">Total:</span>
              <span class="result-value">${score.totalItems}</span>
            </div>
          </div>
        </div>
        <div class="summary-card">
          <h3>Critical Issues</h3>
          <div class="critical-display ${score.criticalFailures > 0 ? 'has-critical' : ''}">
            ${score.criticalFailures}
          </div>
          <div class="severity-breakdown">
            <div>High: ${score.highSeverityCount}</div>
            <div>Medium: ${score.mediumSeverityCount}</div>
            <div>Low: ${score.lowSeverityCount}</div>
          </div>
        </div>
      </div>
      ${score.improvementAreas.length > 0 ? `
      <div class="improvement-areas">
        <h3>Key Improvement Areas</h3>
        <ul>
          ${score.improvementAreas.map(area => `<li>${area}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
    </section>
    `;
  }

  /**
   * Generate audit details section
   */
  private static generateAuditDetails(data: ReportData): string {
    return `
    <section class="audit-details">
      <h2>Audit Details</h2>
      <div class="details-grid">
        <div class="detail-group">
          <h3>Site Information</h3>
          <table class="detail-table">
            <tr>
              <td class="label">Site Name:</td>
              <td class="value">${data.site.name}</td>
            </tr>
            <tr>
              <td class="label">Location:</td>
              <td class="value">${data.site.location}</td>
            </tr>
            ${data.site.contactPerson ? `
            <tr>
              <td class="label">Contact Person:</td>
              <td class="value">${data.site.contactPerson}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        <div class="detail-group">
          <h3>Audit Information</h3>
          <table class="detail-table">
            <tr>
              <td class="label">Audit Date:</td>
              <td class="value">${new Date(data.audit.auditDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td class="label">Audit Type:</td>
              <td class="value">${data.audit.auditType?.replace('_', ' ') || 'Routine'}</td>
            </tr>
            <tr>
              <td class="label">PDCA Stage:</td>
              <td class="value">${data.audit.pdcaStage?.toUpperCase() || 'N/A'}</td>
            </tr>
            ${data.audit.shift ? `
            <tr>
              <td class="label">Shift:</td>
              <td class="value">${data.audit.shift}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        <div class="detail-group">
          <h3>Personnel</h3>
          <table class="detail-table">
            <tr>
              <td class="label">Inspector:</td>
              <td class="value">${data.inspector.name}</td>
            </tr>
            <tr>
              <td class="label">Email:</td>
              <td class="value">${data.inspector.email}</td>
            </tr>
            ${data.manager ? `
            <tr>
              <td class="label">Reviewed By:</td>
              <td class="value">${data.manager.name}</td>
            </tr>
            ` : ''}
          </table>
        </div>
      </div>
    </section>
    `;
  }

  /**
   * Generate compliance score breakdown
   */
  private static generateComplianceScore(data: ReportData): string {
    const sections = ISO_9001_CHECKLIST;
    const sectionScores = data.complianceScore.sectionScores;

    return `
    <section class="compliance-score">
      <h2>Compliance Score Breakdown</h2>
      <div class="score-breakdown">
        ${sections.map(section => {
          const score = sectionScores[section.id] || 0;
          return `
          <div class="section-score">
            <div class="section-header">
              <h3>${section.title}</h3>
              <span class="clause-range">${section.clauseRange}</span>
            </div>
            <div class="score-bar-container">
              <div class="score-bar ${this.getScoreClass(score)}" style="width: ${score}%"></div>
            </div>
            <div class="score-value ${this.getScoreClass(score)}">${score.toFixed(1)}%</div>
          </div>
          `;
        }).join('')}
      </div>
    </section>
    `;
  }

  /**
   * Generate findings by section
   */
  private static generateFindingsBySection(
    data: ReportData,
    options: ReportOptions
  ): string {
    const sections = ISO_9001_CHECKLIST;
    const responses = data.audit.responses;

    return `
    <section class="findings">
      <h2>Detailed Findings</h2>
      ${sections.map(section => {
        const sectionItems = section.items.filter(item => responses[item.id]);
        if (sectionItems.length === 0) return '';

        return `
        <div class="section-findings">
          <h3>${section.title} (${section.clauseRange})</h3>
          <table class="findings-table">
            <thead>
              <tr>
                <th>Clause</th>
                <th>Requirement</th>
                <th>Result</th>
                <th>Severity</th>
                ${options.includeComments ? '<th>Comments</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${sectionItems.map(item => {
                const response = responses[item.id];
                if (!response) return '';

                return `
                <tr class="finding-row ${response.response}">
                  <td class="clause">${item.clauseRef}</td>
                  <td class="requirement">${item.question}</td>
                  <td class="result">
                    <span class="badge ${response.response}">${response.response?.toUpperCase()}</span>
                  </td>
                  <td class="severity">
                    ${response.severity ? `<span class="badge severity-${response.severity}">${response.severity}</span>` : '-'}
                  </td>
                  ${options.includeComments ? `<td class="comments">${response.comments || '-'}</td>` : ''}
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        `;
      }).join('')}
    </section>
    `;
  }

  /**
   * Generate corrective actions section
   */
  private static generateCorrectiveActions(data: ReportData): string {
    if (!data.correctiveActions || data.correctiveActions.length === 0) {
      return '';
    }

    return `
    <section class="corrective-actions">
      <h2>Corrective Actions</h2>
      <table class="actions-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Action Required</th>
            <th>Assigned To</th>
            <th>Due Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${data.correctiveActions.map(action => `
          <tr>
            <td>${action.itemId}</td>
            <td>${action.action}</td>
            <td>${action.assignedTo || 'Unassigned'}</td>
            <td>${action.dueDate ? new Date(action.dueDate).toLocaleDateString() : 'TBD'}</td>
            <td><span class="badge status-${action.status}">${action.status || 'Pending'}</span></td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
    `;
  }

  /**
   * Generate evidence gallery
   */
  private static generateEvidenceGallery(data: ReportData): string {
    if (!data.evidence || data.evidence.length === 0) {
      return '';
    }

    return `
    <section class="evidence-gallery">
      <h2>Evidence Documentation</h2>
      <div class="evidence-grid">
        ${data.evidence.map(evidence => `
        <div class="evidence-item">
          <img src="${evidence.thumbnailUrl || evidence.url}" alt="${evidence.filename}" />
          <div class="evidence-caption">
            <div class="filename">${evidence.filename}</div>
            <div class="item-ref">Item: ${evidence.itemId}</div>
          </div>
        </div>
        `).join('')}
      </div>
    </section>
    `;
  }

  /**
   * Generate signatures section
   */
  private static generateSignatures(data: ReportData): string {
    return `
    <section class="signatures">
      <h2>Signatures</h2>
      <div class="signature-grid">
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-label">Inspector</div>
          <div class="signature-name">${data.inspector.name}</div>
          <div class="signature-date">${new Date(data.audit.auditDate).toLocaleDateString()}</div>
        </div>
        ${data.manager ? `
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-label">Reviewed By</div>
          <div class="signature-name">${data.manager.name}</div>
          <div class="signature-date">${(data.audit as any).reviewedAt ? new Date((data.audit as any).reviewedAt).toLocaleDateString() : ''}</div>
        </div>
        ` : ''}
        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-label">Site Representative</div>
          <div class="signature-name">${data.site.contactPerson || ''}</div>
          <div class="signature-date"></div>
        </div>
      </div>
    </section>
    `;
  }

  /**
   * Generate report footer
   */
  private static generateFooter(metadata: ReportMetadata): string {
    return `
    <footer class="report-footer">
      <div class="footer-content">
        <div>Report ID: ${metadata.reportId}</div>
        <div>Generated: ${metadata.generatedAt.toLocaleString()}</div>
        <div>Version: ${metadata.version}</div>
        <div>Standard: ${metadata.standard}</div>
      </div>
      <div class="page-number">Page <span class="page"></span> of <span class="pages"></span></div>
    </footer>
    `;
  }

  /**
   * Generate JSON report
   */
  private static generateJSONReport(
    data: ReportData,
    options: ReportOptions
  ): any {
    const metadata = this.generateMetadata(data);

    return {
      metadata,
      audit: data.audit,
      site: data.site,
      inspector: data.inspector,
      manager: data.manager,
      complianceScore: data.complianceScore,
      ...(options.includeEvidence && { evidence: data.evidence }),
      ...(options.includeCorrectiveActions && { correctiveActions: data.correctiveActions }),
    };
  }

  /**
   * Get report styles
   */
  private static getReportStyles(branding: any): string {
    const primaryColor = branding.colors?.primary || '#2563eb';
    const secondaryColor = branding.colors?.secondary || '#64748b';

    return `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12pt; line-height: 1.6; color: #1f2937; }
      .report-container { max-width: 210mm; margin: 0 auto; padding: 20mm; background: white; }
      
      /* Header */
      .report-header { border-bottom: 3px solid ${primaryColor}; padding-bottom: 20px; margin-bottom: 30px; }
      .header-content { display: flex; align-items: center; gap: 20px; margin-bottom: 15px; }
      .company-logo { max-height: 60px; }
      .header-text h1 { font-size: 24pt; color: ${primaryColor}; margin-bottom: 5px; }
      .header-text h2 { font-size: 18pt; color: ${secondaryColor}; font-weight: normal; }
      .report-info { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      .info-row { display: flex; justify-content: space-between; padding: 5px; background: #f3f4f6; border-radius: 4px; }
      .info-row .label { font-weight: 600; }
      
      /* Sections */
      section { margin-bottom: 30px; page-break-inside: avoid; }
      h2 { font-size: 16pt; color: ${primaryColor}; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px; }
      h3 { font-size: 14pt; color: ${secondaryColor}; margin-bottom: 10px; }
      
      /* Executive Summary */
      .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
      .summary-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; }
      .score-display { font-size: 36pt; font-weight: bold; margin: 10px 0; }
      .score-display.excellent { color: #059669; }
      .score-display.good { color: #2563eb; }
      .score-display.acceptable { color: #d97706; }
      .score-display.poor { color: #dc2626; }
      .grade { font-size: 14pt; color: ${secondaryColor}; }
      .results-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px; }
      .result-item { display: flex; justify-content: space-between; padding: 5px; }
      .result-value { font-weight: bold; }
      .result-value.passed { color: #059669; }
      .result-value.failed { color: #dc2626; }
      .result-value.na { color: #6b7280; }
      .critical-display { font-size: 36pt; font-weight: bold; color: #6b7280; }
      .critical-display.has-critical { color: #dc2626; }
      .severity-breakdown { margin-top: 10px; font-size: 10pt; color: ${secondaryColor}; }
      .improvement-areas { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 20px; }
      .improvement-areas ul { margin-left: 20px; }
      
      /* Details */
      .details-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
      .detail-group { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; }
      .detail-table { width: 100%; }
      .detail-table td { padding: 5px 0; }
      .detail-table .label { font-weight: 600; width: 40%; }
      
      /* Score Breakdown */
      .section-score { margin-bottom: 15px; }
      .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
      .clause-range { font-size: 10pt; color: ${secondaryColor}; }
      .score-bar-container { height: 20px; background: #e5e7eb; border-radius: 10px; overflow: hidden; }
      .score-bar { height: 100%; transition: width 0.3s; }
      .score-bar.excellent { background: #059669; }
      .score-bar.good { background: #2563eb; }
      .score-bar.acceptable { background: #d97706; }
      .score-bar.poor { background: #dc2626; }
      .score-value { text-align: right; font-weight: bold; margin-top: 5px; }
      
      /* Tables */
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th { background: ${primaryColor}; color: white; padding: 10px; text-align: left; font-weight: 600; }
      td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
      tr:hover { background: #f9fafb; }
      
      /* Badges */
      .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 9pt; font-weight: 600; text-transform: uppercase; }
      .badge.pass { background: #d1fae5; color: #065f46; }
      .badge.fail { background: #fee2e2; color: #991b1b; }
      .badge.na { background: #e5e7eb; color: #374151; }
      .badge.severity-critical { background: #fee2e2; color: #991b1b; }
      .badge.severity-high { background: #fed7aa; color: #9a3412; }
      .badge.severity-medium { background: #fef3c7; color: #92400e; }
      .badge.severity-low { background: #dbeafe; color: #1e40af; }
      
      /* Evidence */
      .evidence-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
      .evidence-item { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
      .evidence-item img { width: 100%; height: 150px; object-fit: cover; }
      .evidence-caption { padding: 10px; background: #f9fafb; }
      .filename { font-size: 9pt; font-weight: 600; margin-bottom: 5px; }
      .item-ref { font-size: 8pt; color: ${secondaryColor}; }
      
      /* Signatures */
      .signature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-top: 40px; }
      .signature-box { text-align: center; }
      .signature-line { border-top: 2px solid #1f2937; margin-bottom: 10px; }
      .signature-label { font-weight: 600; margin-bottom: 5px; }
      .signature-name { color: ${secondaryColor}; }
      .signature-date { font-size: 10pt; color: ${secondaryColor}; margin-top: 5px; }
      
      /* Footer */
      .report-footer { border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: 40px; display: flex; justify-content: space-between; font-size: 9pt; color: ${secondaryColor}; }
      .footer-content { display: flex; gap: 20px; }
      
      /* Print */
      @media print {
        .report-container { padding: 0; }
        section { page-break-inside: avoid; }
        .report-footer { position: fixed; bottom: 0; width: 100%; }
      }
    `;
  }

  /**
   * Get score class for styling
   */
  private static getScoreClass(score: number): string {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 60) return 'acceptable';
    return 'poor';
  }

  /**
   * Get grade for score
   */
  private static getGrade(score: number): { grade: string; label: string } {
    if (score >= 95) return { grade: 'A+', label: 'Excellent' };
    if (score >= 90) return { grade: 'A', label: 'Very Good' };
    if (score >= 85) return { grade: 'B+', label: 'Good' };
    if (score >= 80) return { grade: 'B', label: 'Satisfactory' };
    if (score >= 75) return { grade: 'C+', label: 'Acceptable' };
    if (score >= 70) return { grade: 'C', label: 'Needs Improvement' };
    if (score >= 60) return { grade: 'D', label: 'Poor' };
    return { grade: 'F', label: 'Failing' };
  }
}

export default ReportGenerator;
