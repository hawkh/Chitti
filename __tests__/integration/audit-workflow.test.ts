/**
 * Integration Tests for ISO Audit Dashboard
 * Task 11.1: Complete system integration testing
 * 
 * Tests:
 * - Complete audit workflow from creation to approval
 * - Role-based access control across all features
 * - Data consistency and audit trail integrity
 */

import { PrismaClient, AuditStatus } from '@prisma/client';
import { WorkflowManager } from '@/lib/audit/workflow-manager';
import { SubmissionWorkflow } from '@/lib/audit/submission-workflow';
import { calculateComplianceScore } from '@/lib/audit/compliance-calculator';
import { validateAuditForm } from '@/lib/audit/form-validation';
import { AuditResponse, AuditFormData } from '@/types/audit-form.types';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrisma: any = {
    auditRecord: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    auditResponse: {
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      count: jest.fn(),
    },
    workflowEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    workflowComment: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    site: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    evidence: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback: any) => callback(mockPrisma)),
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrisma),
    AuditStatus: {
      DRAFT: 'DRAFT',
      SUBMITTED: 'SUBMITTED',
      IN_REVIEW: 'IN_REVIEW',
      APPROVED: 'APPROVED',
      REJECTED: 'REJECTED',
    },
    EventType: {
      CREATED: 'CREATED',
      SUBMITTED: 'SUBMITTED',
      ASSIGNED: 'ASSIGNED',
      APPROVED: 'APPROVED',
      REJECTED: 'REJECTED',
      UPDATED: 'UPDATED',
    },
    ActionType: {
      SUBMIT: 'SUBMIT',
      APPROVE: 'APPROVE',
      REJECT: 'REJECT',
      COMMENT: 'COMMENT',
    },
  };
});

describe('Integration Test: Complete Audit Workflow', () => {
  let prisma: any;
  
  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('End-to-End Audit Lifecycle', () => {
    test('should complete full audit workflow: Draft → Submit → Review → Approve', async () => {
      // Step 1: Create audit in DRAFT state
      const mockAudit = {
        id: 'audit-001',
        siteId: 'site-001',
        inspectorId: 'inspector-001',
        managerId: null,
        status: AuditStatus.DRAFT,
        auditDate: new Date(),
        submittedAt: null,
        reviewedAt: null,
        approvedAt: null,
      };

      prisma.auditRecord.findUnique.mockResolvedValue({
        ...mockAudit,
        responses: [
          { itemId: 'ctx_001', response: 'pass', auditId: 'audit-001' },
          { itemId: 'ctx_002', response: 'pass', auditId: 'audit-001' },
        ],
        evidence: [],
      });
      prisma.auditResponse.findMany.mockResolvedValue([
        { itemId: 'ctx_001', response: 'pass', auditId: 'audit-001', createdAt: new Date() },
        { itemId: 'ctx_002', response: 'pass', auditId: 'audit-001', createdAt: new Date() },
      ]);
      prisma.auditResponse.count.mockResolvedValue(2);

      // Step 2: Validate audit can transition to SUBMITTED
      const canTransition = WorkflowManager.isValidTransition(
        AuditStatus.DRAFT,
        AuditStatus.SUBMITTED
      );
      expect(canTransition).toBe(true);

      // Step 3: Submit audit
      prisma.user.findMany.mockResolvedValue([
        { id: 'manager-001', role: 'MANAGER', assignedSites: ['site-001'] },
      ]);
      prisma.user.findFirst.mockResolvedValue({ id: 'manager-001' });
      prisma.auditRecord.count.mockResolvedValue(2);
      
      prisma.auditRecord.update.mockResolvedValue({
        ...mockAudit,
        status: AuditStatus.SUBMITTED,
        managerId: 'manager-001',
        submittedAt: new Date(),
      });

      prisma.workflowEvent.create.mockResolvedValue({
        id: 'event-001',
        auditId: 'audit-001',
        eventType: 'SUBMITTED',
      });

      const submitResult = await SubmissionWorkflow.submitAudit(
        'audit-001',
        'inspector-001',
        'INSPECTOR',
        { autoAssign: true }
      );

      expect(submitResult.success).toBe(true);
      expect(submitResult.assignedManagerId).toBe('manager-001');

      // Step 4: Manager reviews audit (transition to IN_REVIEW)
      prisma.auditRecord.findUnique.mockResolvedValue({
        ...mockAudit,
        status: AuditStatus.SUBMITTED,
        managerId: 'manager-001',
        responses: [],
        evidence: [],
      });
      prisma.auditResponse.count.mockResolvedValue(2);
      prisma.auditRecord.update.mockResolvedValue({
        ...mockAudit,
        status: AuditStatus.IN_REVIEW,
        managerId: 'manager-001',
        reviewedAt: new Date(),
      });

      const reviewTransition = await WorkflowManager.transitionState(
        'audit-001',
        AuditStatus.IN_REVIEW,
        'manager-001',
        'MANAGER',
        'Starting review'
      );

      expect(reviewTransition.success).toBe(true);
      expect(reviewTransition.newStatus).toBe(AuditStatus.IN_REVIEW);

      // Step 5: Manager approves audit
      prisma.auditRecord.findUnique.mockResolvedValue({
        ...mockAudit,
        status: AuditStatus.IN_REVIEW,
        managerId: 'manager-001',
        responses: [],
        evidence: [],
      });
      prisma.auditResponse.count.mockResolvedValue(2);
      prisma.auditRecord.update.mockResolvedValue({
        ...mockAudit,
        status: AuditStatus.APPROVED,
        managerId: 'manager-001',
        approvedAt: new Date(),
      });

      const approveTransition = await WorkflowManager.transitionState(
        'audit-001',
        AuditStatus.APPROVED,
        'manager-001',
        'MANAGER',
        'Audit approved - all requirements met'
      );

      expect(approveTransition.success).toBe(true);
      expect(approveTransition.newStatus).toBe(AuditStatus.APPROVED);

      // Verify workflow history was logged
      expect(prisma.workflowEvent.create).toHaveBeenCalled();
      expect(prisma.workflowComment.create).toHaveBeenCalled();
    });

    test('should handle rejection and revision workflow', async () => {
      // Audit in IN_REVIEW state
      const mockAuditData = {
        id: 'audit-002',
        status: AuditStatus.IN_REVIEW,
        managerId: 'manager-001',
        inspectorId: 'inspector-001',
      };

      prisma.auditRecord.findUnique.mockResolvedValue({
        ...mockAuditData,
        responses: [],
        evidence: [],
      });
      prisma.auditResponse.count.mockResolvedValue(2);

      // Manager rejects audit
      prisma.auditRecord.update.mockResolvedValue({
        ...mockAuditData,
        status: AuditStatus.REJECTED,
      });

      const rejectTransition = await WorkflowManager.transitionState(
        'audit-002',
        AuditStatus.REJECTED,
        'manager-001',
        'MANAGER',
        'Missing evidence for critical items'
      );

      expect(rejectTransition.success).toBe(true);
      expect(rejectTransition.newStatus).toBe(AuditStatus.REJECTED);

      // Inspector revises and returns to DRAFT
      prisma.auditRecord.findUnique.mockResolvedValue({
        ...mockAuditData,
        status: AuditStatus.REJECTED,
        responses: [],
        evidence: [],
      });
      prisma.auditResponse.count.mockResolvedValue(2);
      prisma.auditRecord.update.mockResolvedValue({
        ...mockAuditData,
        status: AuditStatus.DRAFT,
      });

      const reviseTransition = await WorkflowManager.transitionState(
        'audit-002',
        AuditStatus.DRAFT,
        'inspector-001',
        'INSPECTOR',
        'Revising audit with additional evidence'
      );

      expect(reviseTransition.success).toBe(true);
      expect(reviseTransition.newStatus).toBe(AuditStatus.DRAFT);
    });

    test('should prevent invalid state transitions', async () => {
      // Cannot go directly from DRAFT to APPROVED
      const isValid = WorkflowManager.isValidTransition(
        AuditStatus.DRAFT,
        AuditStatus.APPROVED
      );
      expect(isValid).toBe(false);

      // Cannot transition from APPROVED (terminal state)
      const fromApproved = WorkflowManager.isValidTransition(
        AuditStatus.APPROVED,
        AuditStatus.DRAFT
      );
      expect(fromApproved).toBe(false);
    });
  });

  describe('Role-Based Access Control', () => {
    test('should enforce Inspector role permissions', async () => {
      const mockAudit = {
        id: 'audit-003',
        status: AuditStatus.DRAFT,
        inspectorId: 'inspector-001',
        siteId: 'site-001',
        auditDate: new Date(),
      };

      prisma.auditRecord.findUnique.mockResolvedValue({
        ...mockAudit,
        responses: [{ itemId: 'ctx_001', response: 'pass' }],
        evidence: [],
      });
      prisma.auditResponse.findMany.mockResolvedValue([
        { itemId: 'ctx_001', response: 'pass' },
      ]);
      prisma.auditResponse.count.mockResolvedValue(1);

      // Inspector can submit their own audit
      const validation = await WorkflowManager.validateTransition(
        'audit-003',
        AuditStatus.DRAFT,
        AuditStatus.SUBMITTED,
        'inspector-001',
        'INSPECTOR'
      );

      expect(validation.isValid).toBe(true);

      // Inspector cannot approve audits
      prisma.auditRecord.findUnique.mockResolvedValue({
        ...mockAudit,
        status: AuditStatus.IN_REVIEW,
        responses: [],
        evidence: [],
      });
      prisma.auditResponse.count.mockResolvedValue(1);

      const approveValidation = await WorkflowManager.validateTransition(
        'audit-003',
        AuditStatus.IN_REVIEW,
        AuditStatus.APPROVED,
        'inspector-001',
        'INSPECTOR'
      );

      expect(approveValidation.isValid).toBe(false);
      expect(approveValidation.errors[0]).toContain('not authorized');
    });

    test('should enforce Manager role permissions', async () => {
      const mockAudit = {
        id: 'audit-004',
        status: AuditStatus.SUBMITTED,
        managerId: 'manager-001',
        inspectorId: 'inspector-001',
      };

      prisma.auditRecord.findUnique.mockResolvedValue({
        ...mockAudit,
        responses: [],
        evidence: [],
      });
      prisma.auditResponse.count.mockResolvedValue(1);

      // Manager can transition to IN_REVIEW
      const reviewValidation = await WorkflowManager.validateTransition(
        'audit-004',
        AuditStatus.SUBMITTED,
        AuditStatus.IN_REVIEW,
        'manager-001',
        'MANAGER'
      );

      expect(reviewValidation.isValid).toBe(true);

      // Manager can approve
      prisma.auditRecord.findUnique.mockResolvedValue({
        ...mockAudit,
        status: AuditStatus.IN_REVIEW,
        responses: [],
        evidence: [],
      });
      prisma.auditResponse.count.mockResolvedValue(1);

      const approveValidation = await WorkflowManager.validateTransition(
        'audit-004',
        AuditStatus.IN_REVIEW,
        AuditStatus.APPROVED,
        'manager-001',
        'MANAGER'
      );

      expect(approveValidation.isValid).toBe(true);

      // Manager can reject
      const rejectValidation = await WorkflowManager.validateTransition(
        'audit-004',
        AuditStatus.IN_REVIEW,
        AuditStatus.REJECTED,
        'manager-001',
        'MANAGER'
      );

      expect(rejectValidation.isValid).toBe(true);
    });

    test('should allow Admin full access', async () => {
      const mockAudit = {
        id: 'audit-005',
        status: AuditStatus.DRAFT,
        inspectorId: 'inspector-001',
        siteId: 'site-001',
        auditDate: new Date(),
      };

      prisma.auditRecord.findUnique.mockResolvedValue({
        ...mockAudit,
        responses: [{ itemId: 'ctx_001', response: 'pass' }],
        evidence: [],
      });
      prisma.auditResponse.findMany.mockResolvedValue([
        { itemId: 'ctx_001', response: 'pass' },
      ]);
      prisma.auditResponse.count.mockResolvedValue(1);

      // Admin can perform any transition
      const submitValidation = await WorkflowManager.validateTransition(
        'audit-005',
        AuditStatus.DRAFT,
        AuditStatus.SUBMITTED,
        'admin-001',
        'ADMIN'
      );

      expect(submitValidation.isValid).toBe(true);
    });

    test('should validate site assignment for Managers', async () => {
      // Manager assigned to site-001
      prisma.user.findMany.mockResolvedValue([
        { 
          id: 'manager-001', 
          role: 'MANAGER', 
          assignedSites: ['site-001', 'site-002'] 
        },
        { 
          id: 'manager-002', 
          role: 'MANAGER', 
          assignedSites: ['site-003'] 
        },
      ]);

      const mockAudit = {
        id: 'audit-006',
        siteId: 'site-001',
        inspectorId: 'inspector-001',
      };

      prisma.auditRecord.findUnique.mockResolvedValue(mockAudit);
      prisma.user.findFirst.mockResolvedValue({ id: 'manager-001' });
      prisma.auditRecord.count.mockResolvedValue(1);

      // Auto-assign should select manager-001 (assigned to site-001)
      const managerId = await SubmissionWorkflow.autoAssignManager('site-001');
      expect(managerId).toBe('manager-001');
    });
  });

  describe('Data Consistency and Audit Trail', () => {
    test('should maintain complete audit trail for all state changes', async () => {
      const mockAudit = {
        id: 'audit-007',
        status: AuditStatus.DRAFT,
        inspectorId: 'inspector-001',
        siteId: 'site-001',
        auditDate: new Date(),
      };

      const mockEvents = [
        {
          id: 'event-001',
          auditId: 'audit-007',
          userId: 'inspector-001',
          eventType: 'CREATED',
          fromStatus: null,
          toStatus: 'DRAFT',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'event-002',
          auditId: 'audit-007',
          userId: 'inspector-001',
          eventType: 'SUBMITTED',
          fromStatus: 'DRAFT',
          toStatus: 'SUBMITTED',
          createdAt: new Date('2024-01-02'),
        },
        {
          id: 'event-003',
          auditId: 'audit-007',
          userId: 'manager-001',
          eventType: 'APPROVED',
          fromStatus: 'IN_REVIEW',
          toStatus: 'APPROVED',
          createdAt: new Date('2024-01-03'),
        },
      ];

      prisma.workflowEvent.findMany.mockResolvedValue(
        mockEvents.map(e => ({
          ...e,
          user: { id: e.userId, name: 'Test User', email: 'test@example.com', role: 'INSPECTOR' },
        }))
      );

      prisma.workflowComment.findMany.mockResolvedValue([]);

      const history = await WorkflowManager.getWorkflowHistory('audit-007');

      expect(history.events).toHaveLength(3);
      expect(history.events[0].eventType).toBe('CREATED');
      expect(history.events[1].eventType).toBe('SUBMITTED');
      expect(history.events[2].eventType).toBe('APPROVED');

      // Verify chronological order
      expect(history.events[0].createdAt.getTime()).toBeLessThan(
        history.events[1].createdAt.getTime()
      );
      expect(history.events[1].createdAt.getTime()).toBeLessThan(
        history.events[2].createdAt.getTime()
      );
    });

    test('should track all user actions with timestamps', async () => {
      const mockComments = [
        {
          id: 'comment-001',
          auditId: 'audit-008',
          userId: 'inspector-001',
          comment: 'Initial submission',
          action: 'SUBMIT',
          createdAt: new Date('2024-01-01T10:00:00'),
          user: { id: 'inspector-001', name: 'John Inspector', role: 'INSPECTOR' },
        },
        {
          id: 'comment-002',
          auditId: 'audit-008',
          userId: 'manager-001',
          comment: 'Approved with minor observations',
          action: 'APPROVE',
          createdAt: new Date('2024-01-02T14:30:00'),
          user: { id: 'manager-001', name: 'Jane Manager', role: 'MANAGER' },
        },
      ];

      prisma.workflowEvent.findMany.mockResolvedValue([]);
      prisma.workflowComment.findMany.mockResolvedValue(mockComments);

      const history = await WorkflowManager.getWorkflowHistory('audit-008');

      expect(history.comments).toHaveLength(2);
      expect(history.comments[0].action).toBe('SUBMIT');
      expect(history.comments[0].user.name).toBe('John Inspector');
      expect(history.comments[1].action).toBe('APPROVE');
      expect(history.comments[1].user.name).toBe('Jane Manager');
    });

    test('should ensure data consistency during state transitions', async () => {
      const mockAudit = {
        id: 'audit-009',
        status: AuditStatus.DRAFT,
        inspectorId: 'inspector-001',
        siteId: 'site-001',
        auditDate: new Date(),
        submittedAt: null,
        reviewedAt: null,
        approvedAt: null,
      };

      prisma.auditRecord.findUnique.mockResolvedValue(mockAudit);
      prisma.auditResponse.findMany.mockResolvedValue([
        { itemId: 'ctx_001', response: 'pass' },
      ]);

      prisma.auditRecord.findUnique.mockResolvedValue({
        ...mockAudit,
        responses: [{ itemId: 'ctx_001', response: 'pass' }],
        evidence: [],
      });
      prisma.auditResponse.count.mockResolvedValue(1);

      let updatedAudit: any;
      prisma.auditRecord.update.mockImplementation((args) => {
        updatedAudit = { ...mockAudit, ...args.data };
        return Promise.resolve(updatedAudit);
      });

      prisma.workflowEvent.create.mockResolvedValue({});
      prisma.workflowComment.create.mockResolvedValue({});

      // Transition to SUBMITTED should set submittedAt
      await WorkflowManager.transitionState(
        'audit-009',
        AuditStatus.SUBMITTED,
        'inspector-001',
        'INSPECTOR'
      );

      expect(updatedAudit.status).toBe(AuditStatus.SUBMITTED);
      expect(updatedAudit.submittedAt).toBeInstanceOf(Date);

      // Transition to IN_REVIEW should set reviewedAt
      prisma.auditRecord.findUnique.mockResolvedValue({
        ...updatedAudit,
        managerId: 'manager-001',
        responses: [],
        evidence: [],
      });
      prisma.auditResponse.count.mockResolvedValue(1);

      await WorkflowManager.transitionState(
        'audit-009',
        AuditStatus.IN_REVIEW,
        'manager-001',
        'MANAGER'
      );

      expect(updatedAudit.status).toBe(AuditStatus.IN_REVIEW);
      expect(updatedAudit.reviewedAt).toBeInstanceOf(Date);

      // Transition to APPROVED should set approvedAt
      prisma.auditRecord.findUnique.mockResolvedValue({
        ...updatedAudit,
        status: AuditStatus.IN_REVIEW,
        responses: [],
        evidence: [],
      });

      await WorkflowManager.transitionState(
        'audit-009',
        AuditStatus.APPROVED,
        'manager-001',
        'MANAGER'
      );

      expect(updatedAudit.status).toBe(AuditStatus.APPROVED);
      expect(updatedAudit.approvedAt).toBeInstanceOf(Date);
    });

    test('should validate required fields before state transitions', async () => {
      // Audit missing required field (managerId)
      const incompleteAudit = {
        id: 'audit-010',
        status: AuditStatus.SUBMITTED,
        inspectorId: 'inspector-001',
        siteId: 'site-001',
        auditDate: new Date(),
        managerId: null, // Missing!
      };

      prisma.auditRecord.findUnique.mockResolvedValue(incompleteAudit);

      // Should fail validation for IN_REVIEW transition
      const validation = await WorkflowManager.validateTransition(
        'audit-010',
        AuditStatus.SUBMITTED,
        AuditStatus.IN_REVIEW,
        'manager-001',
        'MANAGER'
      );

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Required field missing: managerId');
    });

    test('should prevent submission of incomplete audits', async () => {
      const incompleteAudit = {
        id: 'audit-011',
        status: AuditStatus.DRAFT,
        inspectorId: 'inspector-001',
        siteId: 'site-001',
        auditDate: new Date(),
      };

      prisma.auditRecord.findUnique.mockResolvedValue({
        ...incompleteAudit,
        responses: [],
        evidence: [],
      });

      const validation = await WorkflowManager.validateAuditCompleteness('audit-011');

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('At least one response is required');
    });
  });

  describe('Compliance Score Integration', () => {
    test('should calculate and store compliance score on submission', async () => {
      const mockResponses: Record<string, AuditResponse> = {
        'ctx_001': { itemId: 'ctx_001', response: 'pass' },
        'ctx_002': { itemId: 'ctx_002', response: 'pass' },
        'ctx_003': { itemId: 'ctx_003', response: 'fail', severity: 'high' },
        'ctx_004': { itemId: 'ctx_004', response: 'pass' },
      };

      const score = calculateComplianceScore(mockResponses);

      expect(score.overallScore).toBeGreaterThan(0);
      expect(score.overallScore).toBeLessThan(100);
      expect(score.passedItems).toBe(3);
      expect(score.failedItems).toBe(1);
      expect(score.highSeverityCount).toBe(1);
    });

    test('should integrate form validation with workflow', async () => {
      const completeForm: AuditFormData = {
        auditDate: new Date(),
        responses: {
          'ctx_001': { itemId: 'ctx_001', response: 'pass' },
          'ctx_002': { itemId: 'ctx_002', response: 'pass' },
          'ctx_003': { itemId: 'ctx_003', response: 'pass' },
          'ctx_004': { itemId: 'ctx_004', response: 'pass' },
          'lead_001': { itemId: 'lead_001', response: 'pass' },
          'lead_002': { itemId: 'lead_002', response: 'pass' },
          'lead_003': { itemId: 'lead_003', response: 'pass' },
          'plan_001': { itemId: 'plan_001', response: 'pass' },
          'plan_002': { itemId: 'plan_002', response: 'pass' },
          'plan_003': { itemId: 'plan_003', response: 'pass' },
          'supp_001': { itemId: 'supp_001', response: 'pass' },
          'supp_002': { itemId: 'supp_002', response: 'pass' },
          'supp_003': { itemId: 'supp_003', response: 'pass' },
          'supp_004': { itemId: 'supp_004', response: 'pass' },
          'supp_005': { itemId: 'supp_005', response: 'pass' },
          'oper_001': { itemId: 'oper_001', response: 'pass' },
          'oper_002': { itemId: 'oper_002', response: 'pass' },
          'oper_004': { itemId: 'oper_004', response: 'pass' },
          'oper_005': { itemId: 'oper_005', response: 'pass' },
          'oper_006': { itemId: 'oper_006', response: 'pass' },
          'oper_007': { itemId: 'oper_007', response: 'pass' },
          'perf_001': { itemId: 'perf_001', response: 'pass' },
          'perf_002': { itemId: 'perf_002', response: 'pass' },
          'perf_003': { itemId: 'perf_003', response: 'pass' },
          'impr_001': { itemId: 'impr_001', response: 'pass' },
          'impr_002': { itemId: 'impr_002', response: 'pass' },
          'impr_003': { itemId: 'impr_003', response: 'pass' },
        },
      };

      const validation = validateAuditForm(completeForm);
      expect(validation.isValid).toBe(true);
      expect(validation.totalErrors).toBe(0);
    });
  });

  describe('Workflow State Management', () => {
    test('should get current workflow status with history', async () => {
      const mockAudit = {
        id: 'audit-012',
        status: AuditStatus.IN_REVIEW,
        inspector: { id: 'inspector-001', name: 'John', email: 'john@example.com' },
        manager: { id: 'manager-001', name: 'Jane', email: 'jane@example.com' },
        submittedAt: new Date('2024-01-01'),
        reviewedAt: new Date('2024-01-02'),
        approvedAt: null,
        workflowHistory: [
          {
            id: 'event-001',
            eventType: 'SUBMITTED',
            createdAt: new Date('2024-01-01'),
            user: { id: 'inspector-001', name: 'John', role: 'INSPECTOR' },
          },
        ],
        comments: [
          {
            id: 'comment-001',
            comment: 'Ready for review',
            createdAt: new Date('2024-01-01'),
            user: { id: 'inspector-001', name: 'John', role: 'INSPECTOR' },
          },
        ],
      };

      prisma.auditRecord.findUnique.mockResolvedValue(mockAudit);

      const status = await WorkflowManager.getWorkflowStatus('audit-012');

      expect(status.currentStatus).toBe(AuditStatus.IN_REVIEW);
      expect(status.inspector.name).toBe('John');
      expect(status.manager?.name).toBe('Jane');
      expect(status.nextPossibleStates).toContain(AuditStatus.APPROVED);
      expect(status.nextPossibleStates).toContain(AuditStatus.REJECTED);
      expect(status.recentEvents).toHaveLength(1);
      expect(status.recentComments).toHaveLength(1);
    });

    test('should track deadline and overdue status', async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const mockOverdueAudit = {
        id: 'audit-013',
        status: AuditStatus.SUBMITTED,
        submittedAt: new Date(threeDaysAgo.getTime() - 86400000), // 4 days ago
        site: { id: 'site-001', name: 'Test Site' },
        inspector: { id: 'inspector-001', name: 'John', email: 'john@example.com' },
        manager: { id: 'manager-001', name: 'Jane', email: 'jane@example.com' },
        managerId: 'manager-001',
      };

      prisma.auditRecord.findMany.mockResolvedValue([mockOverdueAudit]);

      const overdueAudits = await SubmissionWorkflow.getOverdueAudits();

      expect(overdueAudits.length).toBeGreaterThan(0);
      expect(overdueAudits[0].deadlineInfo.daysOverdue).toBeGreaterThan(0);
    });
  });
});
