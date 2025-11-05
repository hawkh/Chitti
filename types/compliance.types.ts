// Compliance Types
export interface ComplianceRule {
  id: string;
  standard: string;
  version: string;
  defectType: string;
  clause: string;
  acceptanceCriteria: {
    maxLength?: number;
    maxWidth?: number;
    maxArea?: number;
    maxCount?: number;
    cumulativeLimit?: number;
    location?: string[];
  };
  rejectConditions: string[];
}

export interface ComplianceDecision {
  detectionId: string;
  status: 'accept' | 'reject';
  standard: string;
  clause: string;
  reasoning: string;
  measurements?: any;
}

export interface ComplianceResult {
  overallStatus: 'pass' | 'fail';
  decisions: ComplianceDecision[];
  summary: {
    totalDefects: number;
    acceptedDefects: number;
    rejectedDefects: number;
  };
  recommendations: string[];
}
