# Code Templates & Examples
## Ready-to-Use Implementation Code

---

## 1. COMPLIANCE ENGINE

```typescript
// services/compliance/engine.ts

import { Detection, ComplianceRule, ComplianceResult } from '@/types';

export class ComplianceEngine {
  private rules: Map<string, ComplianceRule[]> = new Map();

  constructor() {
    this.loadRules();
  }

  async checkCompliance(
    detections: Detection[],
    standard: string,
    componentType: string
  ): Promise<ComplianceResult> {
    const rules = this.rules.get(standard) || [];
    const decisions = [];

    for (const detection of detections) {
      const rule = this.findRule(detection.defectType, rules);
      if (rule) {
        const decision = this.evaluateDefect(detection, rule);
        decisions.push(decision);
      }
    }

    const overallStatus = decisions.some(d => d.status === 'reject') 
      ? 'fail' 
      : 'pass';

    return {
      overallStatus,
      decisions,
      summary: {
        totalDefects: detections.length,
        acceptedDefects: decisions.filter(d => d.status === 'accept').length,
        rejectedDefects: decisions.filter(d => d.status === 'reject').length,
      },
      recommendations: this.generateRecommendations(decisions)
    };
  }

  private evaluateDefect(detection: Detection, rule: ComplianceRule) {
    // Cracks are always rejected
    if (detection.defectType === 'crack') {
      return {
        detectionId: detection.id,
        status: 'reject',
        standard: rule.standard,
        clause: rule.clause,
        reasoning: 'Any crack shall be unacceptable per AWS D1.1 6.12.1'
      };
    }

    // Check measurements against criteria
    const { measurements } = detection;
    const { acceptanceCriteria } = rule;

    if (acceptanceCriteria.maxLength && 
        measurements.length > acceptanceCriteria.maxLength) {
      return {
        detectionId: detection.id,
        status: 'reject',
        standard: rule.standard,
        clause: rule.clause,
        reasoning: `Length ${measurements.length}mm exceeds limit ${acceptanceCriteria.maxLength}mm`
      };
    }

    return {
      detectionId: detection.id,
      status: 'accept',
      standard: rule.standard,
      clause: rule.clause,
      reasoning: 'Within acceptable limits'
    };
  }

  private findRule(defectType: string, rules: ComplianceRule[]) {
    return rules.find(r => r.defectType === defectType);
  }

  private generateRecommendations(decisions: any[]): string[] {
    const recommendations = [];
    const rejected = decisions.filter(d => d.status === 'reject');
    
    if (rejected.length > 0) {
      recommendations.push('Repair or remove rejected defects');
      recommendations.push('Re-inspect after repairs');
    }
    
    return recommendations;
  }

  private loadRules() {
    this.rules.set('AWS D1.1', AWS_D1_1_RULES);
    this.rules.set('ASME B31.3', ASME_B31_3_RULES);
  }
}

// AWS D1.1 Rules
const AWS_D1_1_RULES: ComplianceRule[] = [
  {
    id: 'aws-crack',
    standard: 'AWS D1.1',
    version: '2020',
    defectType: 'crack',
    clause: '6.12.1',
    acceptanceCriteria: {},
    rejectConditions: ['Any crack']
  },
  {
    id: 'aws-porosity',
    standard: 'AWS D1.1',
    version: '2020',
    defectType: 'porosity',
    clause: '6.12.2',
    acceptanceCriteria: {
      maxCount: 10,
      cumulativeLimit: 25
    },
    rejectConditions: ['Piping porosity', 'Cluster porosity']
  }
];
```

---

## 2. DEFECT LIBRARY SERVICE

```typescript
// services/knowledge-base/defect-library.ts

export class DefectLibraryService {
  private library: Map<string, DefectKnowledge> = new Map();

  constructor() {
    this.loadLibrary();
  }

  getDefectInfo(defectType: string): DefectKnowledge | null {
    return this.library.get(defectType) || null;
  }

  getCauses(defectType: string): string[] {
    return this.library.get(defectType)?.causes || [];
  }

  getRemedies(defectType: string): string[] {
    return this.library.get(defectType)?.remedies || [];
  }

  getStandardsReference(defectType: string, standard: string) {
    const defect = this.library.get(defectType);
    return defect?.standardsReference[standard] || null;
  }

  private loadLibrary() {
    DEFECT_DATA.forEach(defect => {
      this.library.set(defect.defectType, defect);
    });
  }
}

const DEFECT_DATA: DefectKnowledge[] = [
  {
    id: 'porosity',
    defectType: 'porosity',
    definition: 'Gas entrapment forming cavities in weld metal',
    causes: [
      'Moisture on electrode or base metal',
      'Improper shielding gas flow',
      'Surface contamination',
      'Excessive arc length'
    ],
    remedies: [
      'Use low-hydrogen electrodes',
      'Preheat base metal',
      'Ensure proper gas flow (15-20 CFH)',
      'Clean surfaces thoroughly'
    ],
    preventiveMeasures: [
      'Store electrodes in heated cabinet',
      'Use proper joint preparation'
    ],
    standardsReference: {
      'AWS D1.1': {
        clause: '6.12.2',
        acceptanceCriteria: 'Max 10 pores/inch'
      }
    },
    visualExamples: ['/defects/porosity-1.jpg'],
    severity: 'moderate'
  },
  {
    id: 'crack',
    defectType: 'crack',
    definition: 'Linear fracture in weld or base metal',
    causes: [
      'High residual stress',
      'Hydrogen embrittlement',
      'Rapid cooling',
      'Poor joint design'
    ],
    remedies: [
      'Preheat material',
      'Control cooling rate',
      'Use correct filler metal',
      'Improve joint design'
    ],
    preventiveMeasures: [
      'Proper preheat temperature',
      'Post-weld heat treatment'
    ],
    standardsReference: {
      'AWS D1.1': {
        clause: '6.12.1',
        acceptanceCriteria: 'Not acceptable'
      }
    },
    visualExamples: ['/defects/crack-1.jpg'],
    severity: 'critical'
  }
];
```

---

## 3. PROJECT MANAGEMENT API

```typescript
// app/api/projects/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: {
      teamMembers: {
        has: session.user.id
      }
    },
    include: {
      manager: true,
      workOrders: {
        select: {
          id: true,
          status: true
        }
      }
    }
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !hasPermission(session.user.role, 'projects:create')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const data = await req.json();
  
  const project = await prisma.project.create({
    data: {
      name: data.name,
      clientName: data.clientName,
      description: data.description,
      standards: data.standards,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      managerId: session.user.id,
      status: 'active'
    }
  });

  return NextResponse.json(project, { status: 201 });
}
```

---

## 4. WORK ORDER COMPONENT

```typescript
// components/work-orders/WorkOrderCard.tsx

import { WorkOrder } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}

export function WorkOrderCard({ workOrder, onEdit, onView }: WorkOrderCardProps) {
  const statusColors = {
    assigned: 'bg-blue-500',
    in_progress: 'bg-yellow-500',
    review: 'bg-orange-500',
    completed: 'bg-green-500'
  };

  const priorityColors = {
    low: 'bg-gray-500',
    medium: 'bg-blue-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500'
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{workOrder.title}</h3>
        <Badge className={statusColors[workOrder.status]}>
          {workOrder.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Priority:</span>
          <Badge className={priorityColors[workOrder.priority]}>
            {workOrder.priority}
          </Badge>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Components:</span>
          <span>{workOrder.components.length}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Methods:</span>
          <span>{workOrder.ndtMethods.join(', ').toUpperCase()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Deadline:</span>
          <span>{new Date(workOrder.deadline).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onView(workOrder.id)}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View
        </button>
        <button
          onClick={() => onEdit(workOrder.id)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Edit
        </button>
      </div>
    </Card>
  );
}
```

---

## 5. DEFECT PROFILE COMPONENT

```typescript
// components/defect-library/DefectProfile.tsx

import { DefectKnowledge } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DefectProfileProps {
  defect: DefectKnowledge;
  detection?: Detection;
}

export function DefectProfile({ defect, detection }: DefectProfileProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold capitalize">{defect.defectType}</h2>
          <p className="text-gray-600">{defect.definition}</p>
        </div>
      </div>

      {detection && (
        <div className="mb-6 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">Detected in Your Inspection</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Confidence: {(detection.confidence * 100).toFixed(1)}%</div>
            <div>Severity: {detection.severity}</div>
            {detection.measurements.length && (
              <div>Length: {detection.measurements.length}mm</div>
            )}
          </div>
        </div>
      )}

      <Tabs defaultValue="causes">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="causes">Causes</TabsTrigger>
          <TabsTrigger value="remedies">Remedies</TabsTrigger>
          <TabsTrigger value="prevention">Prevention</TabsTrigger>
          <TabsTrigger value="standards">Standards</TabsTrigger>
        </TabsList>

        <TabsContent value="causes" className="space-y-2">
          <h3 className="font-semibold">Common Causes:</h3>
          <ul className="list-disc list-inside space-y-1">
            {defect.causes.map((cause, i) => (
              <li key={i} className="text-gray-700">{cause}</li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="remedies" className="space-y-2">
          <h3 className="font-semibold">Recommended Remedies:</h3>
          <ul className="list-disc list-inside space-y-1">
            {defect.remedies.map((remedy, i) => (
              <li key={i} className="text-gray-700">{remedy}</li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="prevention" className="space-y-2">
          <h3 className="font-semibold">Preventive Measures:</h3>
          <ul className="list-disc list-inside space-y-1">
            {defect.preventiveMeasures.map((measure, i) => (
              <li key={i} className="text-gray-700">{measure}</li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="standards" className="space-y-3">
          <h3 className="font-semibold">Standards Reference:</h3>
          {Object.entries(defect.standardsReference).map(([standard, ref]) => (
            <div key={standard} className="border-l-4 border-blue-500 pl-4">
              <div className="font-semibold">{standard}</div>
              <div className="text-sm text-gray-600">Clause: {ref.clause}</div>
              <div className="text-sm">{ref.acceptanceCriteria}</div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 6. RBAC MIDDLEWARE

```typescript
// middleware/rbac.ts

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PERMISSIONS = {
  inspector: [
    'inspections:create',
    'inspections:read:own',
    'inspections:update:own'
  ],
  senior_inspector: [
    'inspections:*',
    'inspections:review',
    'inspections:approve'
  ],
  supervisor: [
    'inspections:*',
    'work_orders:*',
    'projects:read',
    'projects:update'
  ],
  manager: ['*:*'],
  auditor: [
    'inspections:read:all',
    'projects:read',
    'reports:read'
  ]
};

export function hasPermission(role: string, permission: string): boolean {
  const rolePermissions = PERMISSIONS[role] || [];
  
  if (rolePermissions.includes('*:*')) return true;
  if (rolePermissions.includes(permission)) return true;
  
  const [resource, action] = permission.split(':');
  if (rolePermissions.includes(`${resource}:*`)) return true;
  
  return false;
}

export async function requirePermission(permission: string) {
  return async (req: NextRequest) => {
    const token = await getToken({ req });
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(token.role as string, permission)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return null;
  };
}
```

---

## 7. ANALYTICS SERVICE

```typescript
// services/analytics/trends.ts

export class AnalyticsService {
  async getDefectTrends(projectId: string, timeRange: string) {
    const inspections = await prisma.inspection.findMany({
      where: {
        workOrder: { projectId },
        createdAt: {
          gte: this.getStartDate(timeRange)
        }
      },
      include: {
        detections: true
      }
    });

    const trendData = this.aggregateByDate(inspections);
    return trendData;
  }

  async getWelderPerformance(projectId: string) {
    const inspections = await prisma.inspection.findMany({
      where: { workOrder: { projectId } },
      include: {
        detections: true,
        inspector: true
      }
    });

    const performance = inspections.reduce((acc, inspection) => {
      const inspectorId = inspection.inspectorId;
      if (!acc[inspectorId]) {
        acc[inspectorId] = {
          name: inspection.inspector.name,
          totalInspections: 0,
          totalDefects: 0,
          passCount: 0
        };
      }
      
      acc[inspectorId].totalInspections++;
      acc[inspectorId].totalDefects += inspection.detections.length;
      if (inspection.complianceStatus === 'pass') {
        acc[inspectorId].passCount++;
      }
      
      return acc;
    }, {});

    return Object.values(performance).map(p => ({
      ...p,
      passRate: (p.passCount / p.totalInspections) * 100
    }));
  }

  private aggregateByDate(inspections: any[]) {
    const grouped = inspections.reduce((acc, inspection) => {
      const date = inspection.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, defectCount: 0, inspectionCount: 0 };
      }
      acc[date].defectCount += inspection.detections.length;
      acc[date].inspectionCount++;
      return acc;
    }, {});

    return Object.values(grouped);
  }

  private getStartDate(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case 'week': return new Date(now.setDate(now.getDate() - 7));
      case 'month': return new Date(now.setMonth(now.getMonth() - 1));
      case 'quarter': return new Date(now.setMonth(now.getMonth() - 3));
      case 'year': return new Date(now.setFullYear(now.getFullYear() - 1));
      default: return new Date(now.setMonth(now.getMonth() - 1));
    }
  }
}
```

---

## 8. REPORT GENERATOR

```typescript
// services/report/generator.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export class ReportGenerator {
  async generateComplianceReport(
    inspection: Inspection,
    complianceResult: ComplianceResult
  ): Promise<Buffer> {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('NDT Inspection Report', 105, 20, { align: 'center' });
    
    // Inspection Info
    doc.setFontSize(12);
    doc.text(`Inspection ID: ${inspection.id}`, 20, 40);
    doc.text(`Date: ${new Date(inspection.createdAt).toLocaleDateString()}`, 20, 50);
    doc.text(`Inspector: ${inspection.inspector.name}`, 20, 60);
    doc.text(`Method: ${inspection.method.toUpperCase()}`, 20, 70);
    
    // Compliance Status
    doc.setFontSize(16);
    const statusColor = complianceResult.overallStatus === 'pass' 
      ? [0, 128, 0] 
      : [255, 0, 0];
    doc.setTextColor(...statusColor);
    doc.text(
      `Status: ${complianceResult.overallStatus.toUpperCase()}`,
      20,
      90
    );
    doc.setTextColor(0, 0, 0);
    
    // Detections Table
    const tableData = complianceResult.decisions.map(d => [
      d.detectionId.substring(0, 8),
      inspection.detections.find(det => det.id === d.detectionId)?.defectType || '',
      d.status.toUpperCase(),
      d.clause,
      d.reasoning
    ]);
    
    autoTable(doc, {
      startY: 100,
      head: [['ID', 'Defect Type', 'Status', 'Clause', 'Reasoning']],
      body: tableData,
      theme: 'grid'
    });
    
    // Recommendations
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('Recommendations:', 20, finalY);
    doc.setFontSize(11);
    complianceResult.recommendations.forEach((rec, i) => {
      doc.text(`${i + 1}. ${rec}`, 20, finalY + 10 + (i * 7));
    });
    
    return Buffer.from(doc.output('arraybuffer'));
  }
}
```

---

**Total Templates**: 8 core modules  
**Lines of Code**: ~1000  
**Ready to Use**: Copy and adapt to your needs
