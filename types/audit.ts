// ISO Audit Dashboard Types

export interface AuditUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  userType: 'INSPECTOR' | 'MANAGER' | 'ADMIN';
  organizationId: string | null;
  assignedSites: string[] | null;
  preferences: any;
  lastLoginAt: Date | null;
}

export interface Site {
  id: string;
  name: string;
  location: string;
  organizationId: string;
  timezone: string;
  contactInfo: any;
  certifications: any;
  lastAuditDate: Date | null;
}

export interface AuditRecord {
  id: string;
  siteId: string;
  inspectorId: string;
  managerId: string | null;
  auditDate: Date;
  shift: 'DAY' | 'NIGHT' | 'WEEKEND';
  auditType: 'ROUTINE' | 'INCIDENT' | 'FOLLOW_UP';
  pdcaStage: 'PLAN' | 'DO' | 'CHECK' | 'ACT';
  status: 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
  submittedAt: Date | null;
  reviewedAt: Date | null;
  approvedAt: Date | null;
  complianceScore: number | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  site?: Site;
  inspector?: AuditUser;
  manager?: AuditUser;
  responses?: AuditResponse[];
  evidence?: EvidenceRecord[];
  workflowHistory?: WorkflowEvent[];
  comments?: WorkflowComment[];
}

export interface AuditResponse {
  id: string;
  auditId: string;
  itemId: string;
  isoClause: string;
  questionText: string;
  response: 'PASS_FAIL' | 'PASS_FAIL_NA' | 'NUMERIC' | 'TEXT';
  numericValue: number | null;
  textResponse: string | null;
  comments: string | null;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
  correctiveAction: string | null;
  targetCloseDate: Date | null;
  
  // Relations
  evidence?: EvidenceRecord[];
}

export interface EvidenceRecord {
  id: string;
  auditId: string;
  responseId: string | null;
  filename: string;
  originalName: string;
  fileType: 'PHOTO' | 'VIDEO' | 'DOCUMENT';
  url: string;
  thumbnailUrl: string | null;
  fileSize: number;
  metadata: any;
  uploadedAt: Date;
}

export interface WorkflowEvent {
  id: string;
  auditId: string;
  userId: string;
  eventType: 'CREATED' | 'SUBMITTED' | 'ASSIGNED' | 'APPROVED' | 'REJECTED' | 'UPDATED';
  fromStatus: string | null;
  toStatus: string | null;
  details: any;
  createdAt: Date;
  
  // Relations
  user?: AuditUser;
}

export interface WorkflowComment {
  id: string;
  auditId: string;
  userId: string;
  comment: string;
  action: 'SUBMIT' | 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | 'COMMENT';
  createdAt: Date;
  
  // Relations
  user?: AuditUser;
}

export interface ISOChecklist {
  id: string;
  version: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  sections?: ChecklistSection[];
}

export interface ChecklistSection {
  id: string;
  checklistId: string;
  title: string;
  isoClause: string;
  weight: number;
  order: number;
  createdAt: Date;
  
  // Relations
  items?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  sectionId: string;
  question: string;
  isoReference: string;
  responseType: 'PASS_FAIL' | 'PASS_FAIL_NA' | 'NUMERIC' | 'TEXT';
  required: boolean;
  helpText: string | null;
  correctiveActionTemplates: any;
  weight: number;
  order: number;
  createdAt: Date;
}

// Form and UI Types
export interface AuditFormData {
  siteId: string;
  auditDate: Date;
  shift: 'DAY' | 'NIGHT' | 'WEEKEND';
  auditType: 'ROUTINE' | 'INCIDENT' | 'FOLLOW_UP';
  pdcaStage: 'PLAN' | 'DO' | 'CHECK' | 'ACT';
  responses: Record<string, AuditResponseInput>;
}

export interface AuditResponseInput {
  response: 'PASS' | 'FAIL' | 'NA' | string | number;
  comments?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  correctiveAction?: string;
  targetCloseDate?: Date;
  evidenceFiles?: File[];
}

export interface ComplianceScore {
  overallScore: number;
  sectionScores: Record<string, number>;
  passedItems: number;
  totalItems: number;
  criticalFailures: number;
  improvementAreas: string[];
}

export interface BenchmarkData {
  sites: SiteBenchmark[];
  industryAverage?: number;
  bestPractices: string[];
  recommendations: string[];
}

export interface SiteBenchmark {
  siteId: string;
  siteName: string;
  currentScore: number;
  previousScore: number;
  trend: 'improving' | 'declining' | 'stable';
  ranking: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

export interface OfflineAuditData {
  drafts: AuditRecord[];
  pendingUploads: PendingUpload[];
  cachedChecklists: ISOChecklist[];
  userProfile: AuditUser;
  siteData: Site[];
  lastSyncAt: Date;
}

export interface PendingUpload {
  id: string;
  auditId: string;
  itemId: string;
  file: Blob;
  metadata: any;
  retryCount: number;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AuditSummary {
  id: string;
  siteId: string;
  siteName: string;
  inspectorName: string;
  auditDate: Date;
  status: string;
  complianceScore: number | null;
  criticalIssues: number;
  submittedAt: Date | null;
}

export interface DashboardMetrics {
  totalAudits: number;
  pendingReviews: number;
  averageComplianceScore: number;
  criticalIssues: number;
  trendsData: TrendData[];
}

export interface TrendData {
  date: string;
  score: number;
  audits: number;
}

// Report Types
export interface ReportDocument {
  id: string;
  title: string;
  generatedAt: Date;
  auditMetadata: AuditMetadata;
  executiveSummary: ExecutiveSummary;
  findings: Finding[];
  correctiveActions: CorrectiveAction[];
  evidence: EvidenceReference[];
  isoMapping: ISOClauseMapping[];
  approvalSection: ApprovalSection;
}

export interface AuditMetadata {
  auditId: string;
  siteName: string;
  inspectorName: string;
  auditDate: Date;
  auditType: string;
  pdcaStage: string;
}

export interface ExecutiveSummary {
  overallScore: number;
  totalItems: number;
  passedItems: number;
  failedItems: number;
  criticalIssues: number;
  keyFindings: string[];
}

export interface Finding {
  id: string;
  isoClause: string;
  description: string;
  severity: 'critical' | 'major' | 'minor' | 'observation';
  status: 'open' | 'closed' | 'in_progress';
  evidenceIds: string[];
  correctiveActionId?: string;
}

export interface CorrectiveAction {
  id: string;
  findingId: string;
  description: string;
  assignedTo: string;
  targetDate: Date;
  status: 'planned' | 'in_progress' | 'completed';
}

export interface EvidenceReference {
  id: string;
  filename: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
}

export interface ISOClauseMapping {
  clause: string;
  title: string;
  findings: string[];
  compliance: 'compliant' | 'non_compliant' | 'not_applicable';
}

export interface ApprovalSection {
  approvedBy: string;
  approvedAt: Date;
  signature?: string;
  comments?: string;
}