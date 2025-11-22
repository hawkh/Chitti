// Audit Form Type Definitions
// These types support the dynamic audit form engine

export type ResponseValue = 'pass' | 'fail' | 'na' | null;
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical' | null;
export type AuditStatus = 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';
export type PDCAStage = 'plan' | 'do' | 'check' | 'act';

// Individual audit response for a checklist item
export interface AuditResponse {
  itemId: string;
  response: ResponseValue;
  comments?: string;
  severity?: SeverityLevel;
  evidenceIds?: string[];
  timestamp?: Date;
}

// Complete audit form data structure
export interface AuditFormData {
  id?: string;
  siteId?: string;
  siteName?: string;
  inspectorId?: string;
  inspectorName?: string;
  auditDate: Date;
  shift?: 'day' | 'night' | 'weekend';
  auditType?: 'routine' | 'incident' | 'follow_up';
  pdcaStage?: PDCAStage;
  status?: AuditStatus;
  responses: Record<string, AuditResponse>;
  createdAt?: Date;
  updatedAt?: Date;
  submittedAt?: Date;
}

// Validation result for form validation
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

// Progress tracking for sections and overall form
export interface ProgressStatus {
  answered: number;
  total: number;
  percentage: number;
  requiredAnswered?: number;
  requiredTotal?: number;
}

// Evidence record for uploaded files
export interface EvidenceRecord {
  id: string;
  auditItemId: string;
  filename: string;
  fileType: 'photo' | 'video' | 'document';
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  fileSize: number;
  metadata?: {
    capturedAt?: Date;
    location?: {
      latitude: number;
      longitude: number;
    };
    deviceInfo?: string;
  };
}

// Workflow comment for audit trail
export interface WorkflowComment {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  comment: string;
  timestamp: Date;
  action: 'submit' | 'approve' | 'reject' | 'request_changes' | 'comment';
}

// Complete audit record with workflow information
export interface AuditRecord extends AuditFormData {
  id: string;
  managerId?: string;
  managerName?: string;
  reviewedAt?: Date;
  approvedAt?: Date;
  workflowComments: WorkflowComment[];
  complianceScore?: ComplianceScore;
}

// Compliance scoring
export interface ComplianceScore {
  overallScore: number; // 0-100%
  sectionScores: Record<string, number>;
  passedItems: number;
  failedItems: number;
  naItems: number;
  totalItems: number;
  criticalFailures: number;
  highSeverityCount: number;
  mediumSeverityCount: number;
  lowSeverityCount: number;
  improvementAreas: string[];
  calculatedAt: Date;
}

// Form submission result
export interface SubmissionResult {
  success: boolean;
  auditId?: string;
  message: string;
  errors?: string[];
}

// Draft save result
export interface SaveResult {
  success: boolean;
  draftId?: string;
  message: string;
  savedAt?: Date;
}
