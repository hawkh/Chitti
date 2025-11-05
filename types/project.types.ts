// Project Management Types
export interface Project {
  id: string;
  name: string;
  clientName: string;
  description: string;
  standards: string[];
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'on_hold';
  managerId: string;
  teamMembers: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkOrder {
  id: string;
  projectId: string;
  title: string;
  assignedTo: string;
  components: Component[];
  ndtMethods: ('visual' | 'dpt' | 'mpt' | 'ut' | 'rt')[];
  deadline: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'assigned' | 'in_progress' | 'review' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Component {
  id: string;
  name: string;
  type: string;
  material: string;
  thickness?: number;
}

export interface Inspection {
  id: string;
  workOrderId: string;
  componentId: string;
  method: 'visual' | 'dpt' | 'mpt' | 'ut' | 'rt';
  inspectorId: string;
  imageUrls: string[];
  rawDataUrl?: string;
  detections: Detection[];
  complianceStatus: 'pass' | 'fail' | 'pending_review';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

export interface Detection {
  id: string;
  inspectionId: string;
  defectType: string;
  bbox: [number, number, number, number];
  confidence: number;
  measurements: {
    length?: number;
    width?: number;
    area?: number;
    depth?: number;
  };
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  complianceDecision?: {
    status: 'accept' | 'reject';
    standard: string;
    clause: string;
    reasoning: string;
  };
  aiGenerated: boolean;
  verifiedBy?: string;
}
