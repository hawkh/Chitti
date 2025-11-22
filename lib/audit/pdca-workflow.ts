import { PDCAStage } from '@/types/audit-form.types';

/**
 * PDCA Workflow Tracking and Management
 * Provides functionality for tracking PDCA cycles and validating completion
 */

export interface PDCACycleStatus {
  siteId: string;
  siteName: string;
  currentStage: PDCAStage;
  completedStages: PDCAStage[];
  cycleStartDate?: Date;
  cycleCompletionDate?: Date;
  isComplete: boolean;
  progress: number; // 0-100%
  auditsInCycle: PDCAAuditSummary[];
}

export interface PDCAAuditSummary {
  auditId: string;
  stage: PDCAStage;
  auditDate: Date;
  status: string;
  complianceScore?: number;
}

export interface PDCACycleValidation {
  isValid: boolean;
  isComplete: boolean;
  completedStages: PDCAStage[];
  missingStages: PDCAStage[];
  recommendations: string[];
  nextSuggestedStage: PDCAStage | null;
}

export interface PDCACycleMetrics {
  totalCycles: number;
  completedCycles: number;
  inProgressCycles: number;
  averageCycleDuration: number; // in days
  stageDistribution: Record<PDCAStage, number>;
  completionRate: number; // percentage
}

const PDCA_STAGE_ORDER: PDCAStage[] = ['plan', 'do', 'check', 'act'];

/**
 * Get the next logical stage in the PDCA cycle
 */
export function getNextPDCAStage(currentStage: PDCAStage): PDCAStage {
  const currentIndex = PDCA_STAGE_ORDER.indexOf(currentStage);
  const nextIndex = (currentIndex + 1) % PDCA_STAGE_ORDER.length;
  return PDCA_STAGE_ORDER[nextIndex];
}

/**
 * Get the previous stage in the PDCA cycle
 */
export function getPreviousPDCAStage(currentStage: PDCAStage): PDCAStage {
  const currentIndex = PDCA_STAGE_ORDER.indexOf(currentStage);
  const prevIndex = currentIndex === 0 ? PDCA_STAGE_ORDER.length - 1 : currentIndex - 1;
  return PDCA_STAGE_ORDER[prevIndex];
}

/**
 * Calculate progress through PDCA cycle based on completed stages
 */
export function calculateCycleProgress(completedStages: PDCAStage[]): number {
  if (completedStages.length === 0) return 0;
  return Math.round((completedStages.length / PDCA_STAGE_ORDER.length) * 100);
}

/**
 * Validate PDCA cycle completion
 */
export function validatePDCACycle(audits: PDCAAuditSummary[]): PDCACycleValidation {
  const completedStages = new Set<PDCAStage>();
  const stageAudits = new Map<PDCAStage, PDCAAuditSummary[]>();

  // Group audits by stage
  audits.forEach(audit => {
    if (audit.status === 'approved') {
      completedStages.add(audit.stage);
      if (!stageAudits.has(audit.stage)) {
        stageAudits.set(audit.stage, []);
      }
      stageAudits.get(audit.stage)!.push(audit);
    }
  });

  const completedStagesArray = Array.from(completedStages);
  const missingStages = PDCA_STAGE_ORDER.filter(stage => !completedStages.has(stage));
  const isComplete = missingStages.length === 0;

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (missingStages.length > 0) {
    recommendations.push(
      `Complete audits for the following stages: ${missingStages.map(s => s.toUpperCase()).join(', ')}`
    );
  }

  // Check for stage sequence
  const hasAllStages = completedStagesArray.length === PDCA_STAGE_ORDER.length;
  if (hasAllStages) {
    recommendations.push('All PDCA stages completed. Consider starting a new cycle to continue improvement.');
  } else if (completedStagesArray.length > 0) {
    const lastCompletedStage = getLastCompletedStage(audits);
    if (lastCompletedStage) {
      const nextStage = getNextPDCAStage(lastCompletedStage);
      recommendations.push(`Next recommended stage: ${nextStage.toUpperCase()}`);
    }
  }

  // Determine next suggested stage
  let nextSuggestedStage: PDCAStage | null = null;
  if (!isComplete) {
    if (completedStagesArray.length === 0) {
      nextSuggestedStage = 'plan';
    } else {
      const lastStage = getLastCompletedStage(audits);
      nextSuggestedStage = lastStage ? getNextPDCAStage(lastStage) : 'plan';
    }
  }

  return {
    isValid: completedStagesArray.length > 0,
    isComplete,
    completedStages: completedStagesArray,
    missingStages,
    recommendations,
    nextSuggestedStage
  };
}

/**
 * Get the last completed stage based on audit dates
 */
function getLastCompletedStage(audits: PDCAAuditSummary[]): PDCAStage | null {
  const approvedAudits = audits
    .filter(a => a.status === 'approved')
    .sort((a, b) => b.auditDate.getTime() - a.auditDate.getTime());

  return approvedAudits.length > 0 ? approvedAudits[0].stage : null;
}

/**
 * Check if a PDCA cycle is complete for a site
 */
export function isPDCACycleComplete(audits: PDCAAuditSummary[]): boolean {
  const validation = validatePDCACycle(audits);
  return validation.isComplete;
}

/**
 * Get PDCA cycle status for a site
 */
export function getPDCACycleStatus(
  siteId: string,
  siteName: string,
  audits: PDCAAuditSummary[]
): PDCACycleStatus {
  const validation = validatePDCACycle(audits);
  
  // Find cycle start and completion dates
  const sortedAudits = [...audits].sort((a, b) => 
    a.auditDate.getTime() - b.auditDate.getTime()
  );
  
  const cycleStartDate = sortedAudits.length > 0 ? sortedAudits[0].auditDate : undefined;
  const cycleCompletionDate = validation.isComplete && sortedAudits.length > 0
    ? sortedAudits[sortedAudits.length - 1].auditDate
    : undefined;

  // Determine current stage
  const lastStage = getLastCompletedStage(audits);
  const currentStage = lastStage ? getNextPDCAStage(lastStage) : 'plan';

  return {
    siteId,
    siteName,
    currentStage,
    completedStages: validation.completedStages,
    cycleStartDate,
    cycleCompletionDate,
    isComplete: validation.isComplete,
    progress: calculateCycleProgress(validation.completedStages),
    auditsInCycle: audits
  };
}

/**
 * Calculate PDCA metrics across multiple sites
 */
export function calculatePDCAMetrics(
  siteStatuses: PDCACycleStatus[]
): PDCACycleMetrics {
  const totalCycles = siteStatuses.length;
  const completedCycles = siteStatuses.filter(s => s.isComplete).length;
  const inProgressCycles = totalCycles - completedCycles;

  // Calculate average cycle duration for completed cycles
  const completedWithDates = siteStatuses.filter(
    s => s.isComplete && s.cycleStartDate && s.cycleCompletionDate
  );
  
  const totalDuration = completedWithDates.reduce((sum, status) => {
    const duration = status.cycleCompletionDate!.getTime() - status.cycleStartDate!.getTime();
    return sum + duration / (1000 * 60 * 60 * 24); // Convert to days
  }, 0);
  
  const averageCycleDuration = completedWithDates.length > 0
    ? Math.round(totalDuration / completedWithDates.length)
    : 0;

  // Calculate stage distribution
  const stageDistribution: Record<PDCAStage, number> = {
    plan: 0,
    do: 0,
    check: 0,
    act: 0
  };

  siteStatuses.forEach(status => {
    status.auditsInCycle.forEach(audit => {
      stageDistribution[audit.stage]++;
    });
  });

  const completionRate = totalCycles > 0
    ? Math.round((completedCycles / totalCycles) * 100)
    : 0;

  return {
    totalCycles,
    completedCycles,
    inProgressCycles,
    averageCycleDuration,
    stageDistribution,
    completionRate
  };
}

/**
 * Get stage-specific guidance and recommendations
 */
export function getPDCAStageGuidance(stage: PDCAStage): {
  title: string;
  description: string;
  objectives: string[];
  keyActivities: string[];
  deliverables: string[];
} {
  const guidance = {
    plan: {
      title: 'Plan Stage',
      description: 'Establish objectives and processes necessary to deliver results in accordance with requirements.',
      objectives: [
        'Identify opportunities for improvement',
        'Establish quality objectives and targets',
        'Define processes and resources needed',
        'Plan for risk mitigation'
      ],
      keyActivities: [
        'Conduct initial assessment',
        'Define improvement goals',
        'Develop action plans',
        'Allocate resources'
      ],
      deliverables: [
        'Quality objectives document',
        'Improvement plan',
        'Resource allocation plan',
        'Risk assessment'
      ]
    },
    do: {
      title: 'Do Stage',
      description: 'Implement the planned processes and activities.',
      objectives: [
        'Execute the improvement plan',
        'Implement new processes',
        'Train personnel',
        'Document activities'
      ],
      keyActivities: [
        'Implement planned changes',
        'Conduct training sessions',
        'Execute process improvements',
        'Monitor implementation'
      ],
      deliverables: [
        'Implementation records',
        'Training completion certificates',
        'Process documentation',
        'Activity logs'
      ]
    },
    check: {
      title: 'Check Stage',
      description: 'Monitor and measure processes against objectives and report results.',
      objectives: [
        'Verify effectiveness of changes',
        'Measure process performance',
        'Identify deviations',
        'Evaluate compliance'
      ],
      keyActivities: [
        'Conduct audits',
        'Measure KPIs',
        'Analyze data',
        'Compare against objectives'
      ],
      deliverables: [
        'Audit reports',
        'Performance metrics',
        'Compliance assessment',
        'Gap analysis'
      ]
    },
    act: {
      title: 'Act Stage',
      description: 'Take actions to continually improve process performance.',
      objectives: [
        'Standardize improvements',
        'Address identified gaps',
        'Update documentation',
        'Plan next cycle'
      ],
      keyActivities: [
        'Implement corrective actions',
        'Update procedures',
        'Communicate changes',
        'Prepare for next cycle'
      ],
      deliverables: [
        'Updated procedures',
        'Corrective action records',
        'Lessons learned document',
        'Next cycle plan'
      ]
    }
  };

  return guidance[stage];
}

/**
 * Suggest next audit based on PDCA cycle status
 */
export function suggestNextAudit(cycleStatus: PDCACycleStatus): {
  suggestedStage: PDCAStage;
  reason: string;
  priority: 'high' | 'medium' | 'low';
} {
  if (cycleStatus.isComplete) {
    return {
      suggestedStage: 'plan',
      reason: 'PDCA cycle complete. Start a new cycle to continue improvement.',
      priority: 'medium'
    };
  }

  const validation = validatePDCACycle(cycleStatus.auditsInCycle);
  const nextStage = validation.nextSuggestedStage || 'plan';

  let priority: 'high' | 'medium' | 'low' = 'medium';
  let reason = `Continue PDCA cycle with ${nextStage.toUpperCase()} stage.`;

  // Determine priority based on cycle progress
  if (cycleStatus.progress === 0) {
    priority = 'high';
    reason = 'Start PDCA cycle with PLAN stage to establish improvement objectives.';
  } else if (cycleStatus.progress >= 75) {
    priority = 'high';
    reason = `Complete PDCA cycle with ${nextStage.toUpperCase()} stage.`;
  } else if (cycleStatus.completedStages.includes('plan') && !cycleStatus.completedStages.includes('do')) {
    priority = 'high';
    reason = 'Execute planned improvements in DO stage.';
  }

  return {
    suggestedStage: nextStage,
    reason,
    priority
  };
}
