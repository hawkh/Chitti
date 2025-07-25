// Core data types for AI NDT Defect Detection System

export enum DefectType {
  CRACK = 'crack',
  CORROSION = 'corrosion',
  DEFORMATION = 'deformation',
  SURFACE_IRREGULARITY = 'surface_irregularity',
  INCLUSION = 'inclusion',
  VOID = 'void',
  DIMENSIONAL_VARIANCE = 'dimensional_variance'
}

export enum MaterialType {
  METAL = 'metal',
  PLASTIC = 'plastic',
  COMPOSITE = 'composite',
  CERAMIC = 'ceramic'
}

export enum DefectSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Keep SeverityLevel for backward compatibility
export type SeverityLevel = DefectSeverity;

export enum JobStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum ResultStatus {
  PASS = 'pass',
  FAIL = 'fail',
  REVIEW = 'review'
}

export enum ExportFormat {
  PDF = 'pdf',
  JSON = 'json',
  CSV = 'csv'
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DefectTypeInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: DefectSeverity;
}

export interface DetectedDefect {
  id: string;
  defectType: DefectTypeInfo;
  confidence: number;
  boundingBox: BoundingBox;
  severity: DefectSeverity;
  description: string;
  affectedArea: number;
}

// Keep Defect for backward compatibility
export interface Defect {
  id: string;
  type: DefectType;
  confidence: number;
  location: BoundingBox;
  severity: DefectSeverity;
  description: string;
  affectedArea: number;
}

export interface DetectionConfig {
  componentType: ComponentType;
  sensitivity: number;
  defectTypes: DefectType[];
  confidenceThreshold: number;
}

export interface DetectionResult {
  id: string;
  fileName: string;
  defects: Defect[];
  detectedDefects: DetectedDefect[];
  overallStatus: ResultStatus;
  processingTime: number;
  timestamp: Date;
  imageUrl?: string;
  originalImageUrl?: string;
  thumbnailUrl?: string;
  metadata?: {
    imageSize: { width: number; height: number };
    fileSize: number;
    format: string;
  };
}

export interface ComponentProfile {
  id: string;
  name: string;
  materialType: MaterialType;
  criticalDefects: DefectType[];
  defaultSensitivity: number;
  qualityStandards: string[];
  customParameters: Record<string, any>;
}

export interface ProcessingFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  preview?: string;
  result?: DetectionResult;
}

export interface ProcessingJob {
  id: string;
  userId: string;
  files: ProcessingFile[];
  config: DetectionConfig;
  status: JobStatus;
  priority: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  progress: number;
  estimatedCompletion?: Date;
}

export interface BatchResult {
  id: string;
  jobId: string;
  results: DetectionResult[];
  summary: {
    totalFiles: number;
    passedFiles: number;
    failedFiles: number;
    reviewFiles: number;
    averageConfidence: number;
    processingTime: number;
  };
  createdAt: Date;
}

export interface ReportSummary {
  totalDefects: number;
  defectsByType: Record<DefectType, number>;
  defectsBySeverity: Record<SeverityLevel, number>;
  overallStatus: ResultStatus;
  averageConfidence: number;
}

export interface Report {
  id: string;
  title: string;
  generatedAt: Date;
  summary: ReportSummary;
  details: DetectionResult[];
  recommendations: string[];
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  timestamp: Date;
  details: Record<string, any>;
  ipAddress?: string;
}

export type { AuditLog } from './audit.types';

// Component interfaces
export interface ComponentType {
  id: string;
  name: string;
  description: string;
  materialType: MaterialType;
  commonDefects: DefectType[];
}

// Error handling interfaces
export interface ErrorResponse {
  message: string;
  code: string;
  recoverable: boolean;
  suggestedAction: string;
  retryAfter?: number;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
  timestamp: Date;
}

// File upload interfaces
export interface UploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  message?: string;
}