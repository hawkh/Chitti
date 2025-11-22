// Audit Submission and Assignment Workflow
// Handles audit submission, manager assignment, and deadline tracking

import { PrismaClient, AuditStatus } from '@prisma/client';
import { WorkflowManager } from './workflow-manager';
import { calculateComplianceScore } from './compliance-calculator';
import { AuditResponse } from '@/types/audit-form.types';

const prisma = new PrismaClient();

export interface SubmissionOptions {
  managerId?: string;
  autoAssign?: boolean;
  comment?: string;
  deadline?: Date;
}

export interface SubmissionResult {
  success: boolean;
  auditId: string;
  assignedManagerId?: string;
  message: string;
  errors?: string[];
}

export interface AssignmentResult {
  success: boolean;
  managerId: string;
  message: string;
}

export interface DeadlineInfo {
  auditId: string;
  deadline: Date;
  daysRemaining: number;
  isOverdue: boolean;
  isEscalated: boolean;
}

export class SubmissionWorkflow {
  /**
   * Submit an audit for review
   */
  static async submitAudit(
    auditId: string,
    userId: string,
    userRole: string,
    options: SubmissionOptions = {}
  ): Promise<SubmissionResult> {
    try {
      // Validate audit completeness
      const validation = await WorkflowManager.validateAuditCompleteness(auditId);
      
      if (!validation.isValid) {
        return {
          success: false,
          auditId,
          message: 'Audit validation failed',
          errors: validation.errors,
        };
      }

      // Get audit details
      const audit = await prisma.auditRecord.findUnique({
        where: { id: auditId },
        include: {
          site: true,
          inspector: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (!audit) {
        return {
          success: false,
          auditId,
          message: 'Audit not found',
        };
      }

      // Determine manager assignment
      let managerId: string | undefined = options.managerId;
      
      if (!managerId && options.autoAssign) {
        const assignedId = await this.autoAssignManager(audit.siteId);
        managerId = assignedId || undefined;
      }

      if (!managerId) {
        return {
          success: false,
          auditId,
          message: 'Manager assignment required',
          errors: ['No manager specified and auto-assignment failed'],
        };
      }

      // Calculate deadline (default: 3 business days)
      const deadline = options.deadline || this.calculateDeadline(3);

      // Calculate compliance score before submission
      const responses = await prisma.auditResponse.findMany({
        where: { auditId },
      });

      const responsesMap: Record<string, AuditResponse> = {};
      responses.forEach((r) => {
        responsesMap[r.itemId] = {
          itemId: r.itemId,
          response: r.response as any,
          comments: r.comments || undefined,
          severity: r.severity as any,
          evidenceIds: (r as any).evidenceIds as string[] || undefined,
          timestamp: r.createdAt || undefined,
        };
      });

      const complianceScore = calculateComplianceScore(responsesMap);

      // Perform submission
      const result = await prisma.$transaction(async (tx) => {
        // Update audit with manager, deadline, and compliance score
        await tx.auditRecord.update({
          where: { id: auditId },
          data: {
            managerId,
            submittedAt: new Date(),
            complianceScore: complianceScore as any, // Store as JSON
          },
        });

        // Transition to SUBMITTED state
        const transitionResult = await WorkflowManager.transitionState(
          auditId,
          AuditStatus.SUBMITTED,
          userId,
          userRole,
          options.comment || `Audit submitted for review (Compliance Score: ${complianceScore.overallScore.toFixed(1)}%)`
        );

        if (!transitionResult.success) {
          throw new Error(transitionResult.message);
        }

        return { managerId, deadline };
      });

      // Trigger notification (will be handled by notification system)
      await this.notifyManagerOfSubmission(auditId, result.managerId);

      return {
        success: true,
        auditId,
        assignedManagerId: result.managerId,
        message: 'Audit submitted successfully',
      };
    } catch (error) {
      console.error('Submission error:', error);
      return {
        success: false,
        auditId,
        message: 'Failed to submit audit',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Auto-assign a manager based on site and workload
   */
  static async autoAssignManager(siteId: string): Promise<string | null> {
    try {
      // Get managers assigned to this site
      // Note: assignedSites is a JSON field containing an array of site IDs
      const allManagers = await prisma.user.findMany({
        where: {
          role: 'MANAGER',
        },
        select: {
          id: true,
          name: true,
          assignedSites: true,
        },
      });

      // Filter managers who have this site assigned
      const managers = allManagers.filter((manager) => {
        const sites = manager.assignedSites as any;
        return Array.isArray(sites) && sites.includes(siteId);
      });

      if (managers.length === 0) {
        // Fallback: get any manager
        const anyManager = await prisma.user.findFirst({
          where: { role: 'MANAGER' },
          select: { id: true },
        });
        return anyManager?.id || null;
      }

      // Get workload for each manager (pending reviews)
      const workloads = await Promise.all(
        managers.map(async (manager) => {
          const pendingCount = await prisma.auditRecord.count({
            where: {
              managerId: manager.id,
              status: {
                in: [AuditStatus.SUBMITTED, AuditStatus.IN_REVIEW],
              },
            },
          });
          return { managerId: manager.id, pendingCount };
        })
      );

      // Assign to manager with lowest workload
      workloads.sort((a, b) => a.pendingCount - b.pendingCount);
      return workloads[0]?.managerId || null;
    } catch (error) {
      console.error('Auto-assignment error:', error);
      return null;
    }
  }

  /**
   * Manually assign or reassign a manager to an audit
   */
  static async assignManager(
    auditId: string,
    managerId: string,
    userId: string,
    userRole: string
  ): Promise<AssignmentResult> {
    try {
      // Verify manager exists and has correct role
      const manager = await prisma.user.findUnique({
        where: { id: managerId },
        select: { id: true, role: true, name: true },
      });

      if (!manager || manager.role !== 'MANAGER') {
        return {
          success: false,
          managerId,
          message: 'Invalid manager ID or user is not a manager',
        };
      }

      // Update audit
      await prisma.$transaction(async (tx) => {
        await tx.auditRecord.update({
          where: { id: auditId },
          data: { managerId },
        });

        // Log assignment event
        await tx.workflowEvent.create({
          data: {
            auditId,
            userId,
            eventType: 'ASSIGNED',
            details: {
              managerId,
              managerName: manager.name,
              assignedAt: new Date().toISOString(),
            },
          },
        });
      });

      // Notify manager
      await this.notifyManagerOfAssignment(auditId, managerId);

      return {
        success: true,
        managerId,
        message: `Audit assigned to ${manager.name}`,
      };
    } catch (error) {
      console.error('Assignment error:', error);
      return {
        success: false,
        managerId,
        message: 'Failed to assign manager',
      };
    }
  }

  /**
   * Calculate deadline based on business days
   */
  static calculateDeadline(businessDays: number): Date {
    const deadline = new Date();
    let daysAdded = 0;

    while (daysAdded < businessDays) {
      deadline.setDate(deadline.getDate() + 1);
      const dayOfWeek = deadline.getDay();
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++;
      }
    }

    // Set to end of day
    deadline.setHours(23, 59, 59, 999);
    return deadline;
  }

  /**
   * Get deadline information for an audit
   */
  static async getDeadlineInfo(auditId: string): Promise<DeadlineInfo | null> {
    try {
      const audit = await prisma.auditRecord.findUnique({
        where: { id: auditId },
        select: {
          submittedAt: true,
          status: true,
        },
      });

      if (!audit || !audit.submittedAt) {
        return null;
      }

      // Default deadline: 3 business days from submission
      const deadline = this.calculateDeadline(3);
      const now = new Date();
      const daysRemaining = Math.ceil(
        (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      const isOverdue = daysRemaining < 0;
      const isEscalated = daysRemaining < 1 && !isOverdue; // Less than 1 day remaining

      return {
        auditId,
        deadline,
        daysRemaining,
        isOverdue,
        isEscalated,
      };
    } catch (error) {
      console.error('Error getting deadline info:', error);
      return null;
    }
  }

  /**
   * Get all overdue audits
   */
  static async getOverdueAudits(managerId?: string) {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const audits = await prisma.auditRecord.findMany({
        where: {
          status: {
            in: [AuditStatus.SUBMITTED, AuditStatus.IN_REVIEW],
          },
          submittedAt: {
            lt: threeDaysAgo,
          },
          ...(managerId && { managerId }),
        },
        include: {
          site: {
            select: { id: true, name: true },
          },
          inspector: {
            select: { id: true, name: true, email: true },
          },
          manager: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: {
          submittedAt: 'asc',
        },
      });

      return audits.map((audit) => ({
        ...audit,
        deadlineInfo: {
          deadline: this.calculateDeadline(3),
          daysOverdue: Math.ceil(
            (new Date().getTime() - audit.submittedAt!.getTime()) / (1000 * 60 * 60 * 24)
          ) - 3,
        },
      }));
    } catch (error) {
      console.error('Error getting overdue audits:', error);
      return [];
    }
  }

  /**
   * Get pending audits for a manager
   */
  static async getPendingAudits(managerId: string) {
    try {
      const audits = await prisma.auditRecord.findMany({
        where: {
          managerId,
          status: {
            in: [AuditStatus.SUBMITTED, AuditStatus.IN_REVIEW],
          },
        },
        include: {
          site: {
            select: { id: true, name: true, location: true },
          },
          inspector: {
            select: { id: true, name: true, email: true },
          },
          responses: {
            select: {
              id: true,
              response: true,
            },
          },
        },
        orderBy: {
          submittedAt: 'asc',
        },
      });

      return audits.map((audit) => {
        const deadlineInfo = audit.submittedAt
          ? {
              deadline: this.calculateDeadline(3),
              daysRemaining: Math.ceil(
                (this.calculateDeadline(3).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              ),
            }
          : null;

        return {
          ...audit,
          deadlineInfo,
          responseCount: audit.responses.length,
        };
      });
    } catch (error) {
      console.error('Error getting pending audits:', error);
      return [];
    }
  }

  /**
   * Escalate overdue audits
   */
  static async escalateOverdueAudits() {
    try {
      const overdueAudits = await this.getOverdueAudits();

      for (const audit of overdueAudits) {
        // Log escalation event
        await prisma.workflowEvent.create({
          data: {
            auditId: audit.id,
            userId: 'system',
            eventType: 'UPDATED',
            details: {
              escalated: true,
              reason: 'Overdue review',
              daysOverdue: audit.deadlineInfo.daysOverdue,
            },
          },
        });

        // Send escalation notification
        await this.notifyEscalation(audit.id, audit.managerId!);
      }

      return {
        success: true,
        escalatedCount: overdueAudits.length,
      };
    } catch (error) {
      console.error('Escalation error:', error);
      return {
        success: false,
        escalatedCount: 0,
      };
    }
  }

  /**
   * Notify manager of new submission
   */
  private static async notifyManagerOfSubmission(
    auditId: string,
    managerId: string
  ): Promise<void> {
    const { NotificationService } = await import('./notification-service');
    await NotificationService.notifyAuditSubmitted(auditId, managerId);
  }

  /**
   * Notify manager of assignment
   */
  private static async notifyManagerOfAssignment(
    auditId: string,
    managerId: string
  ): Promise<void> {
    const { NotificationService } = await import('./notification-service');
    await NotificationService.notifyAuditSubmitted(auditId, managerId);
  }

  /**
   * Notify escalation
   */
  private static async notifyEscalation(
    auditId: string,
    managerId: string
  ): Promise<void> {
    const { NotificationService } = await import('./notification-service');
    await NotificationService.notifyAuditOverdue(auditId, managerId);
  }
}

export default SubmissionWorkflow;
