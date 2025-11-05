import { Detection } from '@/types/project.types';
import { ComplianceRule, ComplianceResult, ComplianceDecision } from '@/types/compliance.types';

export class ComplianceEngine {
  private rules: Map<string, ComplianceRule[]> = new Map();

  constructor() {
    this.loadRules();
  }

  async checkCompliance(
    detections: Detection[],
    standard: string,
    componentType: string = 'structural'
  ): Promise<ComplianceResult> {
    const rules = this.rules.get(standard) || [];
    const decisions: ComplianceDecision[] = [];

    for (const detection of detections) {
      const rule = this.findRule(detection.defectType, rules);
      if (rule) {
        const decision = this.evaluateDefect(detection, rule);
        decisions.push(decision);
      }
    }

    const overallStatus = decisions.some(d => d.status === 'reject') ? 'fail' : 'pass';

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

  private evaluateDefect(detection: Detection, rule: ComplianceRule): ComplianceDecision {
    if (detection.defectType === 'crack') {
      return {
        detectionId: detection.id,
        status: 'reject',
        standard: rule.standard,
        clause: rule.clause,
        reasoning: 'Any crack shall be unacceptable per AWS D1.1 6.12.1'
      };
    }

    const { measurements } = detection;
    const { acceptanceCriteria } = rule;

    if (acceptanceCriteria.maxLength && measurements.length && measurements.length > acceptanceCriteria.maxLength) {
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

  private findRule(defectType: string, rules: ComplianceRule[]): ComplianceRule | undefined {
    return rules.find(r => r.defectType === defectType);
  }

  private generateRecommendations(decisions: ComplianceDecision[]): string[] {
    const recommendations: string[] = [];
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
    acceptanceCriteria: { maxCount: 10, cumulativeLimit: 25 },
    rejectConditions: ['Piping porosity', 'Cluster porosity']
  },
  {
    id: 'aws-undercut',
    standard: 'AWS D1.1',
    version: '2020',
    defectType: 'undercut',
    clause: '6.12.3',
    acceptanceCriteria: { maxLength: 1.0 },
    rejectConditions: ['Undercut exceeding 1mm']
  }
];

const ASME_B31_3_RULES: ComplianceRule[] = [
  {
    id: 'asme-crack',
    standard: 'ASME B31.3',
    version: '2020',
    defectType: 'crack',
    clause: '341.3.2',
    acceptanceCriteria: {},
    rejectConditions: ['Any crack']
  },
  {
    id: 'asme-porosity',
    standard: 'ASME B31.3',
    version: '2020',
    defectType: 'porosity',
    clause: '341.3.2',
    acceptanceCriteria: { maxArea: 3 },
    rejectConditions: ['Porosity exceeding 3% of weld area']
  }
];
