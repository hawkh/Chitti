/**
 * Improvement Action Service
 * Manages continuous improvement actions, follow-up audits, and effectiveness tracking
 * Requirements: 9.4, 9.5
 */

import { PDCAStage } from '@/types/audit-form.types';

export interface ImprovementAction {
  id: string;
  auditId: string;
  siteId: string;
  siteName: string;
  title: string;
  description: string;
  rootCause?: string;
  pdcaStage: PDCAStage;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'planned' | 'in_progress' | 'completed' | 'verified' | 'cancelled';
  assignedTo?: string;
  assignedToName?: string;
  targetDate: Date;
  completionDate?: Date;
  verificationDate?: Date;
  relatedISOClause: string;
  correctiveActions: string[];
  preventiveActions: string[];
  resourcesRequired: string[];
  estimatedCost?: number;
  actualCost?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FollowUpAudit {
  id: string;
  improvementActionId: string;
  originalAuditId: string;
  siteId: string;
  siteName: string;
  scheduledDate: Date;
  completedDate?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  pdcaStage: PDCAStage;
  focusAreas: string[];
  assignedInspector?: string;
  assignedInspectorName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EffectivenessMetrics {
  improvementActionId: string;
  beforeScore: number;
  afterScore: number;
  improvement: number;
  improvementPercentage: number;
  isEffective: boolean;
  verificationMethod: 'audit' | 'measurement' | 'observation' | 'documentation';
  verificationDate: Date;
  verifiedBy: string;
  verifiedByName: string;
  findings: string[];
  recommendations: string[];
  sustainabilityScore: number; // 0-100, measures if improvement is sustained
}

export interface ImprovementPlan {
  id: string;
  siteId: string;
  siteName: string;
  title: string;
  description: string;
  pdcaCycle: {
    plan: ImprovementAction[];
    do: ImprovementAction[];
    check: ImprovementAction[];
    act: ImprovementAction[];
  };
  startDate: Date;
  targetCompletionDate: Date;
  actualCompletionDate?: Date;
  status: 'draft' | 'active' | 'completed' | 'on_hold';
  overallProgress: number; // 0-100%
  followUpAudits: FollowUpAudit[];
  effectivenessMetrics?: EffectivenessMetrics[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ImprovementDashboard {
  totalActions: number;
  activeActions: number;
  completedActions: number;
  overdueActions: number;
  actionsByPriority: Record<string, number>;
  actionsByStage: Record<PDCAStage, number>;
  actionsByStatus: Record<string, number>;
  upcomingFollowUps: FollowUpAudit[];
  recentCompletions: ImprovementAction[];
  effectivenessRate: number; // percentage of actions verified as effective
  averageCompletionTime: number; // in days
}

/**
 * Create a new improvement action
 */
export function createImprovementAction(
  data: Omit<ImprovementAction, 'id' | 'createdAt' | 'updatedAt'>
): ImprovementAction {
  return {
    ...data,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Schedule a follow-up audit for an improvement action
 */
export function scheduleFollowUpAudit(
  improvementActionId: string,
  originalAuditId: string,
  siteId: string,
  siteName: string,
  scheduledDate: Date,
  focusAreas: string[],
  pdcaStage: PDCAStage = 'check'
): FollowUpAudit {
  return {
    id: generateId(),
    improvementActionId,
    originalAuditId,
    siteId,
    siteName,
    scheduledDate,
    status: 'scheduled',
    pdcaStage,
    focusAreas,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Calculate effectiveness of an improvement action
 */
export function calculateEffectiveness(
  improvementActionId: string,
  beforeScore: number,
  afterScore: number,
  verificationMethod: EffectivenessMetrics['verificationMethod'],
  verifiedBy: string,
  verifiedByName: string,
  findings: string[] = [],
  sustainabilityScore: number = 100
): EffectivenessMetrics {
  const improvement = afterScore - beforeScore;
  const improvementPercentage = beforeScore > 0 
    ? Math.round((improvement / beforeScore) * 100) 
    : 0;
  
  // Consider effective if improvement is at least 10% and after score is above 70%
  const isEffective = improvement >= 10 && afterScore >= 70;

  const recommendations: string[] = [];
  
  if (!isEffective) {
    if (improvement < 10) {
      recommendations.push('Improvement is below target threshold. Review action plan and implementation.');
    }
    if (afterScore < 70) {
      recommendations.push('Compliance score still below target. Additional corrective actions may be needed.');
    }
  }

  if (sustainabilityScore < 70) {
    recommendations.push('Sustainability score is low. Implement measures to maintain improvements long-term.');
  }

  if (isEffective && sustainabilityScore >= 80) {
    recommendations.push('Improvement is effective and sustainable. Consider standardizing this approach.');
  }

  return {
    improvementActionId,
    beforeScore,
    afterScore,
    improvement,
    improvementPercentage,
    isEffective,
    verificationMethod,
    verificationDate: new Date(),
    verifiedBy,
    verifiedByName,
    findings,
    recommendations,
    sustainabilityScore
  };
}

/**
 * Create an improvement plan from audit findings
 */
export function createImprovementPlan(
  siteId: string,
  siteName: string,
  title: string,
  description: string,
  targetCompletionDate: Date
): ImprovementPlan {
  return {
    id: generateId(),
    siteId,
    siteName,
    title,
    description,
    pdcaCycle: {
      plan: [],
      do: [],
      check: [],
      act: []
    },
    startDate: new Date(),
    targetCompletionDate,
    status: 'draft',
    overallProgress: 0,
    followUpAudits: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Add action to improvement plan
 */
export function addActionToPlan(
  plan: ImprovementPlan,
  action: ImprovementAction
): ImprovementPlan {
  const updatedPlan = { ...plan };
  updatedPlan.pdcaCycle[action.pdcaStage].push(action);
  updatedPlan.overallProgress = calculatePlanProgress(updatedPlan);
  updatedPlan.updatedAt = new Date();
  return updatedPlan;
}

/**
 * Calculate overall progress of improvement plan
 */
export function calculatePlanProgress(plan: ImprovementPlan): number {
  const allActions = [
    ...plan.pdcaCycle.plan,
    ...plan.pdcaCycle.do,
    ...plan.pdcaCycle.check,
    ...plan.pdcaCycle.act
  ];

  if (allActions.length === 0) return 0;

  const completedActions = allActions.filter(
    a => a.status === 'completed' || a.status === 'verified'
  ).length;

  return Math.round((completedActions / allActions.length) * 100);
}

/**
 * Get improvement dashboard metrics
 */
export function getImprovementDashboard(
  actions: ImprovementAction[],
  followUps: FollowUpAudit[],
  effectivenessMetrics: EffectivenessMetrics[]
): ImprovementDashboard {
  const now = new Date();
  
  const totalActions = actions.length;
  const activeActions = actions.filter(
    a => a.status === 'in_progress' || a.status === 'planned'
  ).length;
  const completedActions = actions.filter(
    a => a.status === 'completed' || a.status === 'verified'
  ).length;
  const overdueActions = actions.filter(
    a => (a.status === 'planned' || a.status === 'in_progress') && 
         a.targetDate < now
  ).length;

  // Actions by priority
  const actionsByPriority: Record<string, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };
  actions.forEach(a => {
    actionsByPriority[a.priority]++;
  });

  // Actions by stage
  const actionsByStage: Record<PDCAStage, number> = {
    plan: 0,
    do: 0,
    check: 0,
    act: 0
  };
  actions.forEach(a => {
    actionsByStage[a.pdcaStage]++;
  });

  // Actions by status
  const actionsByStatus: Record<string, number> = {};
  actions.forEach(a => {
    actionsByStatus[a.status] = (actionsByStatus[a.status] || 0) + 1;
  });

  // Upcoming follow-ups (next 30 days)
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const upcomingFollowUps = followUps
    .filter(f => f.status === 'scheduled' && f.scheduledDate <= thirtyDaysFromNow)
    .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
    .slice(0, 10);

  // Recent completions (last 30 days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentCompletions = actions
    .filter(a => a.completionDate && a.completionDate >= thirtyDaysAgo)
    .sort((a, b) => (b.completionDate?.getTime() || 0) - (a.completionDate?.getTime() || 0))
    .slice(0, 10);

  // Effectiveness rate
  const verifiedActions = effectivenessMetrics.length;
  const effectiveActions = effectivenessMetrics.filter(m => m.isEffective).length;
  const effectivenessRate = verifiedActions > 0
    ? Math.round((effectiveActions / verifiedActions) * 100)
    : 0;

  // Average completion time
  const completedWithDates = actions.filter(
    a => a.completionDate && a.createdAt
  );
  const totalCompletionTime = completedWithDates.reduce((sum, a) => {
    const duration = (a.completionDate!.getTime() - a.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return sum + duration;
  }, 0);
  const averageCompletionTime = completedWithDates.length > 0
    ? Math.round(totalCompletionTime / completedWithDates.length)
    : 0;

  return {
    totalActions,
    activeActions,
    completedActions,
    overdueActions,
    actionsByPriority,
    actionsByStage,
    actionsByStatus,
    upcomingFollowUps,
    recentCompletions,
    effectivenessRate,
    averageCompletionTime
  };
}

/**
 * Generate improvement recommendations based on effectiveness metrics
 */
export function generateImprovementRecommendations(
  actions: ImprovementAction[],
  effectivenessMetrics: EffectivenessMetrics[]
): {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  suggestedActions: string[];
}[] {
  const recommendations: {
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    suggestedActions: string[];
  }[] = [];

  const now = new Date();

  // Check for overdue actions
  const overdueActions = actions.filter(
    a => (a.status === 'planned' || a.status === 'in_progress') && a.targetDate < now
  );

  if (overdueActions.length > 0) {
    const criticalOverdue = overdueActions.filter(a => a.priority === 'critical' || a.priority === 'high');
    
    if (criticalOverdue.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'overdue_actions',
        title: 'Critical Improvement Actions Overdue',
        description: `${criticalOverdue.length} high-priority improvement actions are past their target dates.`,
        suggestedActions: [
          'Review resource allocation for overdue actions',
          'Escalate critical items to management',
          'Reassess target dates and adjust if needed',
          'Identify and remove blockers'
        ]
      });
    }
  }

  // Check for low effectiveness rate
  const verifiedActions = effectivenessMetrics.length;
  const effectiveActions = effectivenessMetrics.filter(m => m.isEffective).length;
  const effectivenessRate = verifiedActions > 0 ? (effectiveActions / verifiedActions) * 100 : 100;

  if (verifiedActions >= 5 && effectivenessRate < 70) {
    recommendations.push({
      priority: 'high',
      category: 'effectiveness',
      title: 'Low Improvement Action Effectiveness',
      description: `Only ${Math.round(effectivenessRate)}% of verified actions are achieving target improvements.`,
      suggestedActions: [
        'Review root cause analysis methodology',
        'Enhance corrective action planning process',
        'Provide additional training on problem-solving techniques',
        'Implement more rigorous action verification procedures'
      ]
    });
  }

  // Check for actions without follow-up audits
  const actionsNeedingFollowUp = actions.filter(
    a => a.status === 'completed' && !a.verificationDate
  );

  if (actionsNeedingFollowUp.length > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'verification',
      title: 'Completed Actions Awaiting Verification',
      description: `${actionsNeedingFollowUp.length} completed actions have not been verified for effectiveness.`,
      suggestedActions: [
        'Schedule follow-up audits for completed actions',
        'Conduct effectiveness verification reviews',
        'Document verification findings',
        'Update action status based on verification results'
      ]
    });
  }

  // Check for sustainability issues
  const lowSustainability = effectivenessMetrics.filter(
    m => m.sustainabilityScore < 70
  );

  if (lowSustainability.length > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'sustainability',
      title: 'Improvement Sustainability Concerns',
      description: `${lowSustainability.length} improvements show low sustainability scores.`,
      suggestedActions: [
        'Implement standardized procedures for sustained improvements',
        'Conduct refresher training for affected personnel',
        'Establish monitoring mechanisms for key improvements',
        'Review and update maintenance procedures'
      ]
    });
  }

  // Check for PDCA stage imbalance
  const stageCount: Record<PDCAStage, number> = {
    plan: 0,
    do: 0,
    check: 0,
    act: 0
  };
  actions.forEach(a => stageCount[a.pdcaStage]++);

  const totalStageActions = Object.values(stageCount).reduce((sum, count) => sum + count, 0);
  const expectedPerStage = totalStageActions / 4;
  const imbalancedStages = Object.entries(stageCount).filter(
    ([_, count]) => Math.abs(count - expectedPerStage) > expectedPerStage * 0.5
  );

  if (imbalancedStages.length > 0 && totalStageActions >= 10) {
    const underrepresented = imbalancedStages
      .filter(([_, count]) => count < expectedPerStage)
      .map(([stage]) => stage.toUpperCase());

    if (underrepresented.length > 0) {
      recommendations.push({
        priority: 'low',
        category: 'pdca_balance',
        title: 'PDCA Stage Imbalance in Improvement Actions',
        description: `Some PDCA stages are underrepresented: ${underrepresented.join(', ')}.`,
        suggestedActions: [
          `Increase focus on ${underrepresented[0]} stage activities`,
          'Ensure balanced approach to continuous improvement',
          'Review PDCA methodology with improvement teams',
          'Align improvement actions with complete PDCA cycles'
        ]
      });
    }
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Validate improvement action readiness for verification
 */
export function validateActionForVerification(
  action: ImprovementAction
): {
  isReady: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (action.status !== 'completed') {
    issues.push('Action must be completed before verification');
  }

  if (!action.completionDate) {
    issues.push('Completion date is required for verification');
  }

  if (action.completionDate) {
    const daysSinceCompletion = (Date.now() - action.completionDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceCompletion < 7) {
      recommendations.push('Consider waiting at least 7 days after completion to verify effectiveness');
    }
    
    if (daysSinceCompletion > 90) {
      recommendations.push('Action completed over 90 days ago. Verification is overdue.');
    }
  }

  if (action.correctiveActions.length === 0) {
    issues.push('At least one corrective action must be documented');
  }

  return {
    isReady: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Generate follow-up audit recommendations
 */
export function generateFollowUpRecommendations(
  action: ImprovementAction,
  originalAuditScore: number
): {
  recommendedDate: Date;
  focusAreas: string[];
  verificationCriteria: string[];
  pdcaStage: PDCAStage;
} {
  const now = new Date();
  
  // Recommend follow-up 2-4 weeks after completion
  const recommendedDate = action.completionDate
    ? new Date(action.completionDate.getTime() + 21 * 24 * 60 * 60 * 1000) // 3 weeks
    : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  const focusAreas = [
    `Verify implementation of: ${action.title}`,
    `Review ${action.relatedISOClause} compliance`,
    'Assess sustainability of improvements',
    'Validate corrective action effectiveness'
  ];

  const verificationCriteria = [
    `Compliance score improvement of at least 10% from baseline (${originalAuditScore}%)`,
    'All corrective actions fully implemented',
    'No recurrence of original non-conformities',
    'Process changes documented and standardized',
    'Personnel trained on new procedures'
  ];

  // Follow-up audits are typically CHECK stage
  const pdcaStage: PDCAStage = 'check';

  return {
    recommendedDate,
    focusAreas,
    verificationCriteria,
    pdcaStage
  };
}

// Helper function to generate IDs
function generateId(): string {
  return `imp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
