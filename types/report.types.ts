export interface ReportMetadata {
  id: string;
  title: string;
  generatedAt: Date;
  generatedBy?: string;
  format: 'pdf' | 'json' | 'csv';
  version: string;
}

export interface InspectionReport {
  metadata: ReportMetadata;
  summary: ReportSummary;
  detectionResults: DetectionReportItem[];
  statistics: ReportStatistics;
  componentProfile: ComponentProfileSummary;
  recommendations?: string[];
}

export interface ReportSummary {
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  passRate: number;
  dateRange: {
    from: Date;
    to: Date;
  };
  criticalDefectsFound: number;
  mostCommonDefect?: {
    type: string;
    count: number;
  };
}

export interface DetectionReportItem {
  id: string;
  timestamp: Date;
  fileName: string;
  status: 'pass' | 'fail';
  defects: DefectReportItem[];
  processingTime: number;
  imageMetadata: {
    width: number;
    height: number;
    format: string;
  };
}

export interface DefectReportItem {
  type: string;
  severity: string;
  confidence: number;
  location: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ReportStatistics {
  defectDistribution: Record<string, number>;
  severityDistribution: Record<string, number>;
  avgProcessingTime: number;
  avgDefectsPerImage: number;
  confidenceDistribution: {
    min: number;
    max: number;
    avg: number;
  };
}

export interface ComponentProfileSummary {
  name: string;
  materialType: string;
  confidenceThreshold: number;
  applicableDefectTypes: string[];
}