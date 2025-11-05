# Technical Specification: Chitti AI NDT Platform
## Complete Implementation Guide

---

## 1. DATABASE SCHEMA

### 1.1 Core Tables/Collections

```typescript
// users
interface User {
  id: string;
  email: string;
  name: string;
  role: 'inspector' | 'senior_inspector' | 'supervisor' | 'manager' | 'auditor';
  certifications: Certification[];
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

// projects
interface Project {
  id: string;
  name: string;
  clientName: string;
  description: string;
  standards: string[]; // ['AWS D1.1', 'ASME B31.3']
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'on_hold';
  managerId: string;
  teamMembers: string[];
  createdAt: Date;
}

// work_orders
interface WorkOrder {
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
}

// inspections
interface Inspection {
  id: string;
  workOrderId: string;
  componentId: string;
  method: 'visual' | 'dpt' | 'mpt' | 'ut' | 'rt';
  inspectorId: string;
  imageUrls: string[];
  rawDataUrl?: string; // For UT signals
  detections: Detection[];
  complianceStatus: 'pass' | 'fail' | 'pending_review';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

// detections
interface Detection {
  id: string;
  inspectionId: string;
  defectType: DefectType;
  bbox: [number, number, number, number];
  confidence: number;
  measurements: {
    length?: number;
    width?: number;
    area?: number;
    depth?: number;
  };
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  complianceDecision: {
    status: 'accept' | 'reject';
    standard: string;
    clause: string;
    reasoning: string;
  };
  aiGenerated: boolean;
  verifiedBy?: string;
}

// defect_library
interface DefectKnowledge {
  id: string;
  defectType: DefectType;
  definition: string;
  causes: string[];
  remedies: string[];
  preventiveMeasures: string[];
  standardsReference: {
    [standard: string]: {
      clause: string;
      acceptanceCriteria: string;
    };
  };
  visualExamples: string[];
  severity: string;
}

// compliance_rules
interface ComplianceRule {
  id: string;
  standard: string;
  version: string;
  defectType: DefectType;
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

// analytics_data
interface AnalyticsData {
  id: string;
  projectId: string;
  timestamp: Date;
  defectRates: {
    [defectType: string]: number;
  };
  welderPerformance: {
    welderId: string;
    defectCount: number;
    passRate: number;
  }[];
  trendData: any;
}
```

### 1.2 Enums and Types

```typescript
type DefectType = 
  | 'crack'
  | 'porosity'
  | 'slag_inclusion'
  | 'incomplete_fusion'
  | 'incomplete_penetration'
  | 'undercut'
  | 'overlap'
  | 'spatter'
  | 'arc_strike'
  | 'distortion';

type NDTMethod = 'visual' | 'dpt' | 'mpt' | 'ut' | 'rt';

type UserRole = 
  | 'inspector'
  | 'senior_inspector'
  | 'supervisor'
  | 'manager'
  | 'auditor';
```

---

## 2. API ENDPOINTS

### 2.1 Authentication & Authorization

```typescript
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/profile
POST   /api/auth/refresh-token
```

### 2.2 Projects

```typescript
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
GET    /api/projects/:id/statistics
GET    /api/projects/:id/timeline
```

### 2.3 Work Orders

```typescript
GET    /api/work-orders
POST   /api/work-orders
GET    /api/work-orders/:id
PUT    /api/work-orders/:id
DELETE /api/work-orders/:id
PATCH  /api/work-orders/:id/status
POST   /api/work-orders/:id/assign
```

### 2.4 Inspections

```typescript
GET    /api/inspections
POST   /api/inspections
GET    /api/inspections/:id
PUT    /api/inspections/:id
DELETE /api/inspections/:id
POST   /api/inspections/:id/review
POST   /api/inspections/:id/approve
POST   /api/inspections/:id/reject
```

### 2.5 Detection & Analysis

```typescript
POST   /api/detect/visual
POST   /api/detect/dpt
POST   /api/detect/mpt
POST   /api/detect/ut
POST   /api/detect/rt
POST   /api/detect/batch
GET    /api/detect/:id/results
```

### 2.6 Compliance

```typescript
POST   /api/compliance/check
GET    /api/compliance/rules
GET    /api/compliance/rules/:standard
POST   /api/compliance/rules
PUT    /api/compliance/rules/:id
GET    /api/compliance/standards
```

### 2.7 Defect Library

```typescript
GET    /api/defects
GET    /api/defects/:type
POST   /api/defects
PUT    /api/defects/:id
GET    /api/defects/:type/remedies
GET    /api/defects/:type/standards
```

### 2.8 Analytics

```typescript
GET    /api/analytics/dashboard
GET    /api/analytics/trends
GET    /api/analytics/welder-performance
GET    /api/analytics/defect-rates
GET    /api/analytics/predictive
POST   /api/analytics/export
```

### 2.9 Reports

```typescript
POST   /api/reports/generate
GET    /api/reports/:id
GET    /api/reports/:id/download
POST   /api/reports/batch
GET    /api/reports/templates
```

---

## 3. FRONTEND ARCHITECTURE

### 3.1 Directory Structure

```
app/
├── (auth)/
│   ├── login/
│   ├── register/
│   └── layout.tsx
├── (dashboard)/
│   ├── dashboard/
│   ├── projects/
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   └── new/
│   ├── work-orders/
│   ├── inspections/
│   ├── analytics/
│   └── layout.tsx
├── detection/
│   ├── visual/
│   ├── dpt/
│   ├── mpt/
│   ├── ut/
│   └── rt/
└── api/

components/
├── auth/
├── projects/
├── work-orders/
├── inspections/
├── detection/
├── compliance/
├── defect-library/
├── analytics/
├── reports/
└── shared/

services/
├── ai/
│   ├── detection.ts
│   ├── dpt.ts
│   ├── mpt.ts
│   ├── ut.ts
│   └── rt.ts
├── compliance/
│   ├── engine.ts
│   ├── rules.ts
│   └── standards.ts
├── knowledge-base/
│   └── defect-library.ts
├── analytics/
│   ├── trends.ts
│   └── predictive.ts
└── report/
    └── generator.ts
```

### 3.2 Key Components

```typescript
// components/projects/ProjectCard.tsx
interface ProjectCardProps {
  project: Project;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// components/work-orders/WorkOrderList.tsx
interface WorkOrderListProps {
  projectId?: string;
  status?: WorkOrderStatus;
  assignedTo?: string;
}

// components/detection/DetectionCanvas.tsx
interface DetectionCanvasProps {
  imageUrl: string;
  detections: Detection[];
  onDetectionClick: (detection: Detection) => void;
  editable: boolean;
}

// components/compliance/ComplianceChecker.tsx
interface ComplianceCheckerProps {
  detections: Detection[];
  standard: string;
  onComplianceCheck: (results: ComplianceResult[]) => void;
}

// components/defect-library/DefectProfile.tsx
interface DefectProfileProps {
  defectType: DefectType;
  detection?: Detection;
  showRemedies: boolean;
}

// components/analytics/TrendChart.tsx
interface TrendChartProps {
  data: AnalyticsData[];
  metric: 'defectRate' | 'passRate' | 'efficiency';
  timeRange: 'week' | 'month' | 'quarter' | 'year';
}
```

---

## 4. AI/ML SERVICES

### 4.1 Detection Service

```typescript
// services/ai/detection.ts

class DetectionService {
  async detectDefects(
    image: File,
    method: NDTMethod,
    options?: DetectionOptions
  ): Promise<Detection[]>;
  
  async batchDetect(
    images: File[],
    method: NDTMethod
  ): Promise<BatchDetectionResult>;
  
  async segmentWeldSeam(image: File): Promise<SegmentationResult>;
  
  async verifyIQI(image: File): Promise<IQIVerificationResult>;
  
  async measureDefect(
    image: File,
    bbox: BoundingBox
  ): Promise<Measurements>;
}

interface DetectionOptions {
  confidenceThreshold?: number;
  modelVersion?: string;
  preprocessingSteps?: string[];
}
```

### 4.2 DPT Service

```typescript
// services/ai/dpt.ts

class DPTService {
  async detectIndications(
    image: File,
    lightType: 'uv' | 'visible'
  ): Promise<DPTDetection[]>;
  
  async classifyIndication(
    indication: DPTDetection
  ): Promise<'crack' | 'porosity' | 'false_positive'>;
  
  async filterFalsePositives(
    detections: DPTDetection[]
  ): Promise<DPTDetection[]>;
}
```

### 4.3 MPT Service

```typescript
// services/ai/mpt.ts

class MPTService {
  async detectParticleAccumulation(
    image: File
  ): Promise<MPTDetection[]>;
  
  async classifyRelevance(
    detection: MPTDetection
  ): Promise<'relevant' | 'non_relevant'>;
  
  async measureIndication(
    detection: MPTDetection
  ): Promise<{ length: number; orientation: number }>;
}
```

### 4.4 UT Service

```typescript
// services/ai/ut.ts

class UTService {
  async analyzeAScan(
    signalData: number[]
  ): Promise<UTAnalysisResult>;
  
  async analyzeBScan(
    scanData: number[][]
  ): Promise<UTAnalysisResult>;
  
  async filterNoise(
    signalData: number[]
  ): Promise<number[]>;
  
  async classifyDefect(
    signal: number[]
  ): Promise<'planar' | 'volumetric'>;
  
  async processPAUT(
    pautData: PAUTData
  ): Promise<PAUTAnalysisResult>;
}
```

### 4.5 RT Service

```typescript
// services/ai/rt.ts

class RTService {
  async detectWeldSeam(
    image: File
  ): Promise<WeldSeamSegmentation>;
  
  async detectDefects(
    image: File,
    weldSeam: WeldSeamSegmentation
  ): Promise<RTDetection[]>;
  
  async verifyIQI(
    image: File
  ): Promise<IQIVerificationResult>;
  
  async classifyDefect(
    detection: RTDetection
  ): Promise<DefectType>;
  
  async measureDefect(
    detection: RTDetection
  ): Promise<DefectMeasurements>;
}
```

---

## 5. COMPLIANCE ENGINE

### 5.1 Compliance Service

```typescript
// services/compliance/engine.ts

class ComplianceEngine {
  async checkCompliance(
    detections: Detection[],
    standard: string,
    componentType: string
  ): Promise<ComplianceResult>;
  
  async getAcceptanceCriteria(
    defectType: DefectType,
    standard: string
  ): Promise<AcceptanceCriteria>;
  
  async evaluateDefect(
    detection: Detection,
    rule: ComplianceRule
  ): Promise<ComplianceDecision>;
  
  async calculateCumulativeDefects(
    detections: Detection[],
    weldLength: number
  ): Promise<CumulativeAnalysis>;
}

interface ComplianceResult {
  overallStatus: 'pass' | 'fail';
  decisions: ComplianceDecision[];
  summary: {
    totalDefects: number;
    acceptedDefects: number;
    rejectedDefects: number;
  };
  recommendations: string[];
}

interface ComplianceDecision {
  detectionId: string;
  status: 'accept' | 'reject';
  standard: string;
  clause: string;
  reasoning: string;
  measurements: any;
}
```

### 5.2 Standards Database

```typescript
// services/compliance/standards.ts

const AWS_D1_1_RULES: ComplianceRule[] = [
  {
    id: 'aws-d1.1-crack',
    standard: 'AWS D1.1',
    version: '2020',
    defectType: 'crack',
    clause: '6.12.1',
    acceptanceCriteria: {},
    rejectConditions: ['Any crack shall be unacceptable']
  },
  {
    id: 'aws-d1.1-porosity',
    standard: 'AWS D1.1',
    version: '2020',
    defectType: 'porosity',
    clause: '6.12.2',
    acceptanceCriteria: {
      maxCount: 10,
      cumulativeLimit: 25, // mm per 300mm
    },
    rejectConditions: [
      'Piping porosity',
      'Cluster porosity exceeding limits'
    ]
  },
  // ... more rules
];
```

---

## 6. DEFECT KNOWLEDGE BASE

```typescript
// services/knowledge-base/defect-library.ts

const DEFECT_LIBRARY: DefectKnowledge[] = [
  {
    id: 'porosity',
    defectType: 'porosity',
    definition: 'Gas entrapment forming cavities in weld metal',
    causes: [
      'Moisture on electrode or base metal',
      'Improper shielding gas flow',
      'Surface contamination (oil, rust, paint)',
      'Excessive arc length',
      'High welding speed'
    ],
    remedies: [
      'Use low-hydrogen electrodes',
      'Preheat base metal to remove moisture',
      'Ensure proper gas flow rate (15-20 CFH)',
      'Clean surfaces thoroughly before welding',
      'Reduce travel speed'
    ],
    preventiveMeasures: [
      'Store electrodes in heated cabinet',
      'Use proper joint preparation',
      'Maintain equipment regularly'
    ],
    standardsReference: {
      'AWS D1.1': {
        clause: '6.12.2',
        acceptanceCriteria: 'Max 10 pores per inch, cumulative 25mm per 300mm'
      },
      'ASME B31.3': {
        clause: 'Table 341.3.2',
        acceptanceCriteria: 'Scattered porosity acceptable if <3% of weld area'
      }
    },
    visualExamples: ['/defects/porosity-1.jpg', '/defects/porosity-2.jpg'],
    severity: 'moderate'
  },
  // ... more defects
];
```

---

## 7. RBAC IMPLEMENTATION

### 7.1 Permission Matrix

```typescript
// lib/auth/permissions.ts

const PERMISSIONS = {
  inspector: [
    'inspections:create',
    'inspections:read:own',
    'inspections:update:own',
    'detections:create',
    'reports:generate:own'
  ],
  senior_inspector: [
    'inspections:create',
    'inspections:read:all',
    'inspections:update:own',
    'inspections:review',
    'inspections:approve',
    'detections:create',
    'detections:verify',
    'reports:generate:all'
  ],
  supervisor: [
    'inspections:*',
    'work_orders:*',
    'projects:read',
    'projects:update',
    'users:read',
    'analytics:read',
    'reports:*'
  ],
  manager: [
    '*:*' // All permissions
  ],
  auditor: [
    'inspections:read:all',
    'projects:read',
    'reports:read',
    'analytics:read'
  ]
};
```

### 7.2 Middleware

```typescript
// middleware/auth.ts

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  const user = verifyToken(token);
  req.user = user;
  next();
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
```

---

## 8. ANALYTICS & PREDICTIVE MODELS

### 8.1 Analytics Service

```typescript
// services/analytics/trends.ts

class AnalyticsService {
  async getDefectTrends(
    projectId: string,
    timeRange: TimeRange
  ): Promise<TrendData>;
  
  async getWelderPerformance(
    projectId: string
  ): Promise<WelderPerformance[]>;
  
  async getDefectRateByType(
    projectId: string
  ): Promise<DefectRateData>;
  
  async correlateWeldingParameters(
    projectId: string
  ): Promise<ParameterCorrelation>;
}
```

### 8.2 Predictive Service

```typescript
// services/analytics/predictive.ts

class PredictiveService {
  async predictDefectProbability(
    weldingParameters: WeldingParams
  ): Promise<DefectProbability>;
  
  async predictMaintenanceNeeds(
    equipmentId: string,
    historicalData: InspectionData[]
  ): Promise<MaintenancePrediction>;
  
  async optimizeWeldingParameters(
    materialType: string,
    thickness: number
  ): Promise<OptimalParameters>;
}
```

---

## 9. REPORT GENERATION

```typescript
// services/report/generator.ts

class ReportGenerator {
  async generateInspectionReport(
    inspectionId: string,
    template: 'standard' | 'detailed' | 'compliance'
  ): Promise<Report>;
  
  async generateProjectReport(
    projectId: string,
    includeAnalytics: boolean
  ): Promise<Report>;
  
  async generateComplianceReport(
    inspectionId: string,
    standard: string
  ): Promise<ComplianceReport>;
  
  async exportToPDF(report: Report): Promise<Buffer>;
  
  async exportToCSV(data: any[]): Promise<string>;
  
  async exportToJSON(data: any): Promise<string>;
}

interface Report {
  id: string;
  title: string;
  generatedAt: Date;
  generatedBy: string;
  sections: ReportSection[];
  metadata: ReportMetadata;
}
```

---

## 10. IMPLEMENTATION PRIORITY

### Phase 1 (Weeks 1-12)

**Week 1-2: Database & Auth**
- Set up PostgreSQL/MongoDB
- Implement user authentication
- Create RBAC system

**Week 3-4: Project Management**
- Projects CRUD
- Work orders system
- Assignment logic

**Week 5-8: Compliance Engine**
- Build rules database
- Implement AWS D1.1 rules
- Create compliance checker
- Add ASME B31.3 support

**Week 9-10: Enhanced Detection**
- Improve defect classification
- Add measurement tools
- Implement weld seam detection

**Week 11-12: Reporting**
- Compliance report templates
- PDF generation
- Export functionality

### Phase 2 (Weeks 13-24)

**Week 13-16: DPT Module**
- Train DPT model
- Build DPT UI
- Integrate with compliance

**Week 17-20: MPT Module**
- Train MPT model
- Build MPT UI
- Add measurement tools

**Week 21-22: Defect Library**
- Populate knowledge base
- Create interactive UI
- Link to detections

**Week 23-24: UT Module (Basic)**
- A-scan analysis
- Signal processing
- Basic visualization

### Phase 3 (Weeks 25-48)

**Week 25-32: Analytics Dashboard**
- Trend analysis
- Performance metrics
- Predictive models

**Week 33-40: Enterprise API**
- REST API design
- Webhook system
- OAuth2 implementation

**Week 41-48: Advanced Features**
- Training module
- Advanced UT/PAUT
- Custom model training

---

## 11. TESTING STRATEGY

```typescript
// __tests__/services/compliance.test.ts

describe('ComplianceEngine', () => {
  it('should reject any crack per AWS D1.1', async () => {
    const detection = createMockDetection('crack');
    const result = await complianceEngine.checkCompliance(
      [detection],
      'AWS D1.1',
      'structural'
    );
    expect(result.overallStatus).toBe('fail');
  });
  
  it('should accept porosity within limits', async () => {
    const detections = createMockPorosityDetections(5);
    const result = await complianceEngine.checkCompliance(
      detections,
      'AWS D1.1',
      'structural'
    );
    expect(result.overallStatus).toBe('pass');
  });
});
```

---

## 12. DEPLOYMENT

### 12.1 Infrastructure

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000
  
  backend:
    build: ./python-backend
    ports:
      - "5000:5000"
    volumes:
      - ./models:/app/models
  
  database:
    image: postgres:15
    environment:
      - POSTGRES_DB=chitti_ndt
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=${DB_PASSWORD}
  
  redis:
    image: redis:7-alpine
```

### 12.2 Environment Variables

```bash
# .env.production
DATABASE_URL=postgresql://user:pass@host:5432/chitti_ndt
REDIS_URL=redis://redis:6379
JWT_SECRET=your-secret-key
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
MODEL_STORAGE_BUCKET=chitti-models
API_BASE_URL=https://api.chitti-ndt.com
```

---

**Document Version**: 1.0  
**Status**: Ready for Implementation  
**Estimated Timeline**: 12 months (3 phases × 4 months)
