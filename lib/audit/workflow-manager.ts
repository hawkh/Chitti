// Audit Workflow State Management System
// Handles audit state transitions, validation, and history logging

import { PrismaClient, AuditStatus, EventType, ActionType } from '@prisma/client';

const prisma = new PrismaClient();

// Valid state transitions map
const VALID_TRANSITIONS: Record<AuditStatus, AuditStatus[]> = {
  DRAFT: [AuditStatus.SUBMITTED],
  SUBMITTED: [AuditStatus.IN_REVIEW, AuditStatus.DRAFT],
  IN_REVIEW: [AuditStatus.APPROVED, AuditStatus.REJECTED, AuditStatus.SUBMITTED],
  APPROVED: [], // Terminal state
  REJECTED: [AuditStatus.DRAFT], // Can be revised
};

// Business rules for state transitions
interface TransitionRule {
  requiredFields?: string[];
  requiredRole?: string[];
  customValidation?: (auditId: string) => Promise<boolean>;
}

const TRANSITION_RULES: Record<string, TransitionRule> = {
  'DRAFT->SUBMITTED': {
    requiredFields: ['siteId', 'inspectorId', 'auditDate'],
    requiredRole: ['INSPECTOR', 'MANAGER', 'ADMIN'],
  },
  'SUBMITTED->IN_REVIEW': {
    requiredFields: ['managerId'],
    requiredRole: ['MANAGER', 'ADMIN'],
  },
  'IN_REVIEW->APPROVED': {
    requiredRole: ['MANAGER', 'ADMIN'],
  },
  'IN_REVIEW->REJECTED': {
    requiredRole: ['MANAGER', 'ADMIN'],
  },
  'REJECTED->DRAFT': {
    requiredRole: ['INSPECTOR', 'MANAGER', 'ADMIN'],
  },
};

export interface StateTransitionResult {
  success: boolean;
  newStatus?: AuditStatus;
  message: string;
  errors?: string[];
}

export interface WorkflowValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export class WorkflowManager {
  /**
   * Validate if a state transition is allowed
   */
  static isValidTransition(
    currentStatus: AuditStatus,
    targetStatus: AuditStatus
  ): boolean {
    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];
    return allowedTransitions.includes(targetStatus);
  }

  /**
   * Get all possible next states for current status
   */
  static getNextStates(currentStatus: AuditStatus): AuditStatus[] {
    return VALID_TRANSITIONS[currentStatus] || [];
  }

  /**
   * Validate business rules for a state transition
   */
  static async validateTransition(
    auditId: string,
    currentStatus: AuditStatus,
    targetStatus: AuditStatus,
    userId: string,
    userRole: string
  ): Promise<WorkflowValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if transition is valid
    if (!this.isValidTransition(currentStatus, targetStatus)) {
      errors.push(
        `Invalid state transition from ${currentStatus} to ${targetStatus}`
      );
      return { isValid: false, errors, warnings };
    }

    // Get transition rules
    const ruleKey = `${currentStatus}->${targetStatus}`;
    const rules = TRANSITION_RULES[ruleKey];

    if (!rules) {
      return { isValid: true, errors: [], warnings };
    }

    // Validate role permissions
    if (rules.requiredRole && !rules.requiredRole.includes(userRole)) {
      errors.push(
        `User role ${userRole} is not authorized for this transition. Required: ${rules.requiredRole.join(', ')}`
      );
    }

    // Validate required fields
    if (rules.requiredFields) {
      const audit = await prisma.auditRecord.findUnique({
        where: { id: auditId },
        select: {
          siteId: true,
          inspectorId: true,
          managerId: true,
          auditDate: true,
        },
      });

      if (!audit) {
        errors.push('Audit record not found');
        return { isValid: false, errors, warnings };
      }

      for (const field of rules.requiredFields) {
        if (!audit[field as keyof typeof audit]) {
          errors.push(`Required field missing: ${field}`);
        }
      }
    }

    // Custom validation
    if (rules.customValidation) {
      try {
        const isValid = await rules.customValidation(auditId);
        if (!isValid) {
          errors.push('Custom validation failed');
        }
      } catch (error) {
        errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Check if all required responses are complete for submission
    if (targetStatus === AuditStatus.SUBMITTED) {
      const responseCount = await prisma.auditResponse.count({
        where: { auditId },
      });

      if (responseCount === 0) {
        errors.push('Cannot submit audit with no responses');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Transition audit to a new state
   */
  static async transitionState(
    auditId: string,
    targetStatus: AuditStatus,
    userId: string,
    userRole: string,
    comment?: string
  ): Promise<StateTransitionResult> {
    try {
      // Get current audit state
      const audit = await prisma.auditRecord.findUnique({
        where: { id: auditId },
        select: { status: true },
      });

      if (!audit) {
        return {
          success: false,
          message: 'Audit record not found',
        };
      }

      const currentStatus = audit.status;

      // Validate transition
      const validation = await this.validateTransition(
        auditId,
        currentStatus,
        targetStatus,
        userId,
        userRole
      );

      if (!validation.isValid) {
        return {
          success: false,
          message: 'State transition validation failed',
          errors: validation.errors,
        };
      }

      // Perform state transition with history logging
      const result = await prisma.$transaction(async (tx) => {
        // Update audit status
        const updatedAudit = await tx.auditRecord.update({
          where: { id: auditId },
          data: {
            status: targetStatus,
            ...(targetStatus === AuditStatus.SUBMITTED && { submittedAt: new Date() }),
            ...(targetStatus === AuditStatus.IN_REVIEW && { reviewedAt: new Date() }),
            ...(targetStatus === AuditStatus.APPROVED && { approvedAt: new Date() }),
          },
        });

        // Log workflow event
        await tx.workflowEvent.create({
          data: {
            auditId,
            userId,
            eventType: this.getEventType(targetStatus),
            fromStatus: currentStatus,
            toStatus: targetStatus,
            details: {
              comment,
              timestamp: new Date().toISOString(),
            },
          },
        });

        // Add workflow comment if provided
        if (comment) {
          await tx.workflowComment.create({
            data: {
              auditId,
              userId,
              comment,
              action: this.getActionType(targetStatus),
            },
          });
        }

        return updatedAudit;
      });

      return {
        success: true,
        newStatus: result.status,
        message: `Audit transitioned from ${currentStatus} to ${targetStatus}`,
      };
    } catch (error) {
      console.error('State transition error:', error);
      return {
        success: false,
        message: 'Failed to transition audit state',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Get workflow history for an audit
   */
  static async getWorkflowHistory(auditId: string) {
    try {
      const events = await prisma.workflowEvent.findMany({
        where: { auditId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      const comments = await prisma.workflowComment.findMany({
        where: { auditId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      return {
        events,
        comments,
      };
    } catch (error) {
      console.error('Error fetching workflow history:', error);
      throw error;
    }
  }

  /**
   * Get current workflow status for an audit
   */
  static async getWorkflowStatus(auditId: string) {
    try {
      const audit = await prisma.auditRecord.findUnique({
        where: { id: auditId },
        include: {
          inspector: {
            select: { id: true, name: true, email: true },
          },
          manager: {
            select: { id: true, name: true, email: true },
          },
          workflowHistory: {
            include: {
              user: {
                select: { id: true, name: true, role: true },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          comments: {
            include: {
              user: {
                select: { id: true, name: true, role: true },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!audit) {
        throw new Error('Audit not found');
      }

      const nextStates = this.getNextStates(audit.status);

      return {
        currentStatus: audit.status,
        inspector: audit.inspector,
        manager: audit.manager,
        submittedAt: audit.submittedAt,
        reviewedAt: audit.reviewedAt,
        approvedAt: audit.approvedAt,
        nextPossibleStates: nextStates,
        recentEvents: audit.workflowHistory,
        recentComments: audit.comments,
      };
    } catch (error) {
      console.error('Error fetching workflow status:', error);
      throw error;
    }
  }

  /**
   * Map target status to event type
   */
  private static getEventType(status: AuditStatus): EventType {
    const mapping: Record<AuditStatus, EventType> = {
      DRAFT: EventType.CREATED,
      SUBMITTED: EventType.SUBMITTED,
      IN_REVIEW: EventType.ASSIGNED,
      APPROVED: EventType.APPROVED,
      REJECTED: EventType.REJECTED,
    };
    return mapping[status] || EventType.UPDATED;
  }

  /**
   * Map target status to action type
   */
  private static getActionType(status: AuditStatus): ActionType {
    const mapping: Record<AuditStatus, ActionType> = {
      DRAFT: ActionType.COMMENT,
      SUBMITTED: ActionType.SUBMIT,
      IN_REVIEW: ActionType.COMMENT,
      APPROVED: ActionType.APPROVE,
      REJECTED: ActionType.REJECT,
    };
    return mapping[status] || ActionType.COMMENT;
  }

  /**
   * Validate audit completeness before submission
   */
  static async validateAuditCompleteness(auditId: string): Promise<WorkflowValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const audit = await prisma.auditRecord.findUnique({
        where: { id: auditId },
        include: {
          responses: true,
          evidence: true,
        },
      });

      if (!audit) {
        errors.push('Audit not found');
        return { isValid: false, errors, warnings };
      }

      // Check basic fields
      if (!audit.siteId) errors.push('Site is required');
      if (!audit.inspectorId) errors.push('Inspector is required');
      if (!audit.auditDate) errors.push('Audit date is required');

      // Check responses
      if (audit.responses.length === 0) {
        errors.push('At least one response is required');
      }

      // Check for unanswered required items
      const unansweredRequired = audit.responses.filter(
        (r) => r.response === null && r.questionText.includes('*')
      );

      if (unansweredRequired.length > 0) {
        warnings.push(`${unansweredRequired.length} required items are unanswered`);
      }

      // Check for failed items without corrective actions (items with severity but no corrective action)
      const failedWithoutActions = audit.responses.filter(
        (r) => r.severity && ['MEDIUM', 'HIGH', 'CRITICAL'].includes(r.severity) && !r.correctiveAction
      );

      if (failedWithoutActions.length > 0) {
        warnings.push(
          `${failedWithoutActions.length} failed items missing corrective actions`
        );
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      console.error('Error validating audit completeness:', error);
      return {
        isValid: false,
        errors: ['Validation error occurred'],
        warnings,
      };
    }
  }
}

export default WorkflowManager;
