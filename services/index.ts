// Service interfaces for AI NDT Defect Detection System

import { 
  DetectionResult, 
  DetectionConfig, 
  BatchResult, 
  ProcessingJob,
  ComponentProfile,
  Report,
  ExportFormat,
  AuditLogEntry
} from '../types';

// AI Detection Engine Interface
export interface DefectDetectionEngine {
  processImage(imageData: ImageData, config: DetectionConfig): Promise<DetectionResult>;
  processVideo(videoFile: File, config: DetectionConfig): Promise<DetectionResult[]>;
  processBatch(files: File[], config: DetectionConfig): Promise<BatchResult>;
  loadModel(modelPath: string): Promise<void>;
  isModelLoaded(): boolean;
}

// File Upload Service Interface
export interface FileUploadService {
  uploadFile(file: File, onProgress?: (progress: number) => void): Promise<string>;
  uploadFiles(files: File[], onProgress?: (progress: number) => void): Promise<string[]>;
  validateFile(file: File): Promise<boolean>;
  generatePreview(file: File): Promise<string>;
}

// Processing Queue Service Interface
export interface ProcessingQueueService {
  addJob(job: ProcessingJob): Promise<string>;
  getJob(jobId: string): Promise<ProcessingJob | null>;
  updateJobStatus(jobId: string, status: string, progress?: number): Promise<void>;
  getQueueStatus(): Promise<{ pending: number; processing: number; completed: number }>;
  cancelJob(jobId: string): Promise<void>;
}

// Component Profile Service Interface
export interface ComponentProfileService {
  createProfile(profile: Omit<ComponentProfile, 'id'>): Promise<ComponentProfile>;
  getProfile(id: string): Promise<ComponentProfile | null>;
  updateProfile(id: string, updates: Partial<ComponentProfile>): Promise<ComponentProfile>;
  deleteProfile(id: string): Promise<void>;
  listProfiles(): Promise<ComponentProfile[]>;
}

// Report Generation Service Interface
export interface ReportService {
  generateSingleReport(result: DetectionResult): Promise<Report>;
  generateBatchReport(results: DetectionResult[]): Promise<Report>;
  exportReport(report: Report, format: ExportFormat): Promise<Blob>;
  saveReport(report: Report): Promise<string>;
  getReport(id: string): Promise<Report | null>;
}

// Audit Service Interface
export interface AuditService {
  logAction(action: string, userId: string, details: Record<string, any>): Promise<void>;
  getAuditLog(filters?: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditLogEntry[]>;
  exportAuditLog(filters?: any): Promise<Blob>;
}

// Database Service Interface
export interface DatabaseService {
  // Detection Results
  saveDetectionResult(result: DetectionResult): Promise<string>;
  getDetectionResult(id: string): Promise<DetectionResult | null>;
  listDetectionResults(filters?: any): Promise<DetectionResult[]>;
  
  // Processing Jobs
  saveProcessingJob(job: ProcessingJob): Promise<string>;
  getProcessingJob(id: string): Promise<ProcessingJob | null>;
  updateProcessingJob(id: string, updates: Partial<ProcessingJob>): Promise<void>;
  
  // Component Profiles
  saveComponentProfile(profile: ComponentProfile): Promise<string>;
  getComponentProfile(id: string): Promise<ComponentProfile | null>;
  listComponentProfiles(): Promise<ComponentProfile[]>;
  
  // Reports
  saveReport(report: Report): Promise<string>;
  getReport(id: string): Promise<Report | null>;
  
  // Audit Logs
  saveAuditLog(entry: AuditLogEntry): Promise<void>;
  getAuditLogs(filters?: any): Promise<AuditLogEntry[]>;
}

// Storage Service Interface
export interface StorageService {
  uploadFile(file: File, path: string): Promise<string>;
  downloadFile(path: string): Promise<Blob>;
  deleteFile(path: string): Promise<void>;
  getFileUrl(path: string): string;
  generateThumbnail(imagePath: string): Promise<string>;
}