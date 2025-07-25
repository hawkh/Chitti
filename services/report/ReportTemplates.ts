// Report templates and data structures

import { DetectionResult, ComponentProfile, DefectSeverity, ResultStatus } from '../../types';
import { BatchSummaryStats, BatchQualityMetrics } from '../processing/BatchResultsAggregator';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
  format: 'pdf' | 'html' | 'json' | 'csv';
  category: 'inspection' | 'batch' | 'audit' | 'summary';
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'header' | 'summary' | 'table' | 'chart' | 'image' | 'text' | 'defect_list' | 'recommendations';
  required: boolean;
  order: number;
  config?: Record<string, any>;
}

export interface ReportData {
  metadata: {
    title: string;
    generatedAt: Date;
    generatedBy?: string;
    reportType: string;
    version: string;
  };
  summary: {
    totalFiles: number;
    passedFiles: number;
    failedFiles: number;
    reviewFiles: number;
    totalDefects: number;
    averageConfidence: number;
    processingTime: number;
  };
  results: DetectionResult[];
  profile?: ComponentProfile;
  qualityMetrics?: BatchQualityMetrics;
  batchStats?: BatchSummaryStats;
}

export class ReportTemplates {
  private static instance: ReportTemplates;
  private templates: Map<string, ReportTemplate> = new Map();

  private constructor() {
    this.initializeDefaultTemplates();
  }

  static getInstance(): ReportTemplates {
    if (!ReportTemplates.instance) {
      ReportTemplates.instance = new ReportTemplates();
    }
    return ReportTemplates.instance;
  }

  private initializeDefaultTemplates(): void {
    // Single Inspection Report Template
    this.templates.set('single-inspection', {
      id: 'single-inspection',
      name: 'Single Inspection Report',
      description: 'Detailed report for a single component inspection',
      format: 'pdf',
      category: 'inspection',
      sections: [
        {
          id: 'header',
          title: 'Report Header',
          type: 'header',
          required: true,
          order: 1,
          config: {
            includeCompanyLogo: true,
            includeTimestamp: true,
            includeReportId: true
          }
        },
        {
          id: 'summary',
          title: 'Inspection Summary',
          type: 'summary',
          required: true,
          order: 2,
          config: {
            showOverallStatus: true,
            showProcessingTime: true,
            showConfidenceScore: true
          }
        },
        {
          id: 'component_image',
          title: 'Component Image',
          type: 'image',
          required: true,
          order: 3,
          config: {
            showDefectOverlays: true,
            includeOriginalImage: true,
            imageSize: 'large'
          }
        },
        {
          id: 'defect_details',
          title: 'Defect Details',
          type: 'defect_list',
          required: true,
          order: 4,
          config: {
            showBoundingBoxes: true,
            showConfidenceScores: true,
            groupBySeverity: true
          }
        },
        {
          id: 'recommendations',
          title: 'Recommendations',
          type: 'recommendations',
          required: false,
          order: 5,
          config: {
            includeActionItems: true,
            includePrevention: true
          }
        }
      ]
    });

    // Batch Processing Report Template
    this.templates.set('batch-processing', {
      id: 'batch-processing',
      name: 'Batch Processing Report',
      description: 'Comprehensive report for batch processing results',
      format: 'pdf',
      category: 'batch',
      sections: [
        {
          id: 'header',
          title: 'Report Header',
          type: 'header',
          required: true,
          order: 1
        },
        {
          id: 'executive_summary',
          title: 'Executive Summary',
          type: 'summary',
          required: true,
          order: 2,
          config: {
            showQualityScore: true,
            showPassRate: true,
            showDefectSummary: true
          }
        },
        {
          id: 'batch_statistics',
          title: 'Batch Statistics',
          type: 'chart',
          required: true,
          order: 3,
          config: {
            chartTypes: ['pass_fail_pie', 'defect_severity_bar', 'confidence_histogram']
          }
        },
        {
          id: 'detailed_results',
          title: 'Detailed Results',
          type: 'table',
          required: true,
          order: 4,
          config: {
            columns: ['fileName', 'status', 'defectCount', 'confidence', 'processingTime'],
            sortBy: 'status',
            showPagination: true
          }
        },
        {
          id: 'defect_analysis',
          title: 'Defect Analysis',
          type: 'defect_list',
          required: true,
          order: 5,
          config: {
            groupByType: true,
            showTrends: true,
            includeStatistics: true
          }
        },
        {
          id: 'quality_metrics',
          title: 'Quality Metrics',
          type: 'chart',
          required: false,
          order: 6,
          config: {
            showQualityTrends: true,
            includeComparisons: true
          }
        },
        {
          id: 'recommendations',
          title: 'Recommendations & Action Items',
          type: 'recommendations',
          required: true,
          order: 7
        }
      ]
    });

    // Audit Report Template
    this.templates.set('audit-report', {
      id: 'audit-report',
      name: 'Audit Report',
      description: 'Compliance and audit trail report',
      format: 'pdf',
      category: 'audit',
      sections: [
        {
          id: 'header',
          title: 'Audit Report Header',
          type: 'header',
          required: true,
          order: 1,
          config: {
            includeAuditPeriod: true,
            includeComplianceStandards: true
          }
        },
        {
          id: 'audit_summary',
          title: 'Audit Summary',
          type: 'summary',
          required: true,
          order: 2,
          config: {
            showComplianceStatus: true,
            showAuditScope: true,
            showKeyFindings: true
          }
        },
        {
          id: 'inspection_history',
          title: 'Inspection History',
          type: 'table',
          required: true,
          order: 3,
          config: {
            columns: ['date', 'inspector', 'component', 'result', 'defects'],
            timeRange: 'audit_period',
            groupByDate: true
          }
        },
        {
          id: 'compliance_analysis',
          title: 'Compliance Analysis',
          type: 'chart',
          required: true,
          order: 4,
          config: {
            showComplianceMetrics: true,
            includeStandardsMapping: true
          }
        },
        {
          id: 'audit_findings',
          title: 'Audit Findings',
          type: 'text',
          required: true,
          order: 5,
          config: {
            includeNonCompliance: true,
            showRiskAssessment: true
          }
        },
        {
          id: 'corrective_actions',
          title: 'Corrective Actions',
          type: 'recommendations',
          required: true,
          order: 6,
          config: {
            includeTimelines: true,
            assignResponsibilities: true
          }
        }
      ]
    });

    // Summary Dashboard Report Template
    this.templates.set('summary-dashboard', {
      id: 'summary-dashboard',
      name: 'Summary Dashboard Report',
      description: 'High-level summary for management dashboard',
      format: 'pdf',
      category: 'summary',
      sections: [
        {
          id: 'header',
          title: 'Dashboard Summary',
          type: 'header',
          required: true,
          order: 1
        },
        {
          id: 'kpi_summary',
          title: 'Key Performance Indicators',
          type: 'summary',
          required: true,
          order: 2,
          config: {
            showKPIs: ['quality_score', 'pass_rate', 'defect_rate', 'processing_efficiency'],
            includeTargets: true,
            showTrends: true
          }
        },
        {
          id: 'quality_overview',
          title: 'Quality Overview',
          type: 'chart',
          required: true,
          order: 3,
          config: {
            chartTypes: ['quality_trend', 'defect_distribution', 'pass_rate_trend']
          }
        },
        {
          id: 'alerts_issues',
          title: 'Alerts & Issues',
          type: 'text',
          required: true,
          order: 4,
          config: {
            showCriticalIssues: true,
            includeAlerts: true,
            highlightTrends: true
          }
        },
        {
          id: 'action_items',
          title: 'Action Items',
          type: 'recommendations',
          required: true,
          order: 5,
          config: {
            prioritizeByImpact: true,
            includeOwners: true
          }
        }
      ]
    });

    // CSV Export Template
    this.templates.set('csv-export', {
      id: 'csv-export',
      name: 'CSV Data Export',
      description: 'Raw data export in CSV format',
      format: 'csv',
      category: 'inspection',
      sections: [
        {
          id: 'data_export',
          title: 'Data Export',
          type: 'table',
          required: true,
          order: 1,
          config: {
            includeAllFields: true,
            flattenNestedData: true,
            includeMetadata: true
          }
        }
      ]
    });
  }

  getTemplate(templateId: string): ReportTemplate | null {
    return this.templates.get(templateId) || null;
  }

  getAllTemplates(): ReportTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category: string): ReportTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }

  getTemplatesByFormat(format: string): ReportTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.format === format);
  }

  // Create custom template
  createCustomTemplate(template: ReportTemplate): void {
    this.templates.set(template.id, template);
  }

  // Update existing template
  updateTemplate(templateId: string, updates: Partial<ReportTemplate>): boolean {
    const existing = this.templates.get(templateId);
    if (!existing) return false;

    this.templates.set(templateId, { ...existing, ...updates });
    return true;
  }

  // Delete template
  deleteTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }

  // Generate report data structure from results
  generateReportData(
    results: DetectionResult[],
    options: {
      title?: string;
      reportType?: string;
      profile?: ComponentProfile;
      qualityMetrics?: BatchQualityMetrics;
      batchStats?: BatchSummaryStats;
      generatedBy?: string;
    } = {}
  ): ReportData {
    const totalFiles = results.length;
    const passedFiles = results.filter(r => r.overallStatus === ResultStatus.PASS).length;
    const failedFiles = results.filter(r => r.overallStatus === ResultStatus.FAIL).length;
    const reviewFiles = results.filter(r => r.overallStatus === ResultStatus.REVIEW).length;
    
    const allDefects = results.flatMap(r => r.detectedDefects);
    const totalDefects = allDefects.length;
    const averageConfidence = totalDefects > 0 
      ? allDefects.reduce((sum, d) => sum + d.confidence, 0) / totalDefects 
      : 0;
    
    const processingTime = results.reduce((sum, r) => sum + r.processingTime, 0);

    return {
      metadata: {
        title: options.title || 'Defect Detection Report',
        generatedAt: new Date(),
        generatedBy: options.generatedBy,
        reportType: options.reportType || 'inspection',
        version: '1.0'
      },
      summary: {
        totalFiles,
        passedFiles,
        failedFiles,
        reviewFiles,
        totalDefects,
        averageConfidence,
        processingTime
      },
      results,
      profile: options.profile,
      qualityMetrics: options.qualityMetrics,
      batchStats: options.batchStats
    };
  }

  // Validate template structure
  validateTemplate(template: ReportTemplate): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template.id || template.id.trim().length === 0) {
      errors.push('Template ID is required');
    }

    if (!template.name || template.name.trim().length === 0) {
      errors.push('Template name is required');
    }

    if (!template.sections || template.sections.length === 0) {
      errors.push('Template must have at least one section');
    }

    // Validate sections
    const sectionIds = new Set<string>();
    template.sections.forEach((section, index) => {
      if (!section.id) {
        errors.push(`Section ${index + 1} is missing an ID`);
      } else if (sectionIds.has(section.id)) {
        errors.push(`Duplicate section ID: ${section.id}`);
      } else {
        sectionIds.add(section.id);
      }

      if (!section.title) {
        errors.push(`Section ${section.id || index + 1} is missing a title`);
      }

      if (!section.type) {
        errors.push(`Section ${section.id || index + 1} is missing a type`);
      }

      if (typeof section.order !== 'number') {
        errors.push(`Section ${section.id || index + 1} is missing a valid order`);
      }
    });

    // Check for required header section
    const hasHeader = template.sections.some(s => s.type === 'header');
    if (!hasHeader) {
      errors.push('Template must include a header section');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}