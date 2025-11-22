// Unit tests for audit form validation utilities

import {
  validateResponse,
  validateAuditForm,
  calculateSectionProgress,
  calculateOverallProgress,
  canSubmitForm,
  getValidationSummary
} from '@/lib/audit/form-validation';
import { AuditFormData, AuditResponse } from '@/types/audit-form.types';
import { ISOChecklistItem } from '@/lib/audit/iso-checklist';

describe('Audit Form Validation', () => {
  const mockRequiredItem: ISOChecklistItem = {
    id: 'test_001',
    clauseRef: '4.1',
    section: 'Test Section',
    question: 'Test question?',
    helpText: 'Test help',
    responseType: 'pass_fail_na',
    required: true,
    weight: 2,
    correctiveActionTemplates: [],
    evidenceRequired: false
  };

  const mockOptionalItem: ISOChecklistItem = {
    id: 'test_002',
    clauseRef: '4.2',
    section: 'Optional Section',
    question: 'Optional question?',
    helpText: 'Optional help',
    responseType: 'pass_fail_na',
    required: false,
    weight: 1,
    correctiveActionTemplates: [],
    evidenceRequired: true
  };

  describe('validateResponse', () => {
    it('should return error for missing required response', () => {
      const errors = validateResponse(mockRequiredItem, undefined);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].severity).toBe('error');
      expect(errors[0].field).toBe('response');
    });

    it('should return no errors for valid pass response', () => {
      const response: AuditResponse = {
        itemId: 'test_001',
        response: 'pass'
      };
      
      const errors = validateResponse(mockRequiredItem, response);
      expect(errors).toHaveLength(0);
    });

    it('should return error for fail response without severity', () => {
      const response: AuditResponse = {
        itemId: 'test_001',
        response: 'fail'
      };
      
      const errors = validateResponse(mockRequiredItem, response);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.field === 'severity')).toBe(true);
    });

    it('should return warning for fail response without comments', () => {
      const response: AuditResponse = {
        itemId: 'test_001',
        response: 'fail',
        severity: 'high'
      };
      
      const errors = validateResponse(mockRequiredItem, response);
      
      const commentWarning = errors.find(e => e.field === 'comments');
      expect(commentWarning?.severity).toBe('warning');
    });

    it('should return warning for evidence required items without evidence', () => {
      const response: AuditResponse = {
        itemId: 'test_002',
        response: 'pass'
      };
      
      const errors = validateResponse(mockOptionalItem, response);
      
      const evidenceWarning = errors.find(e => e.field === 'evidence');
      expect(evidenceWarning?.severity).toBe('warning');
    });
  });

  describe('validateAuditForm', () => {
    it('should validate empty form as invalid', () => {
      const formData: AuditFormData = {
        auditDate: new Date(),
        responses: {}
      };
      
      const result = validateAuditForm(formData);
      
      expect(result.isValid).toBe(false);
      expect(result.totalErrors).toBeGreaterThan(0);
    });

    it('should track missing required fields', () => {
      const formData: AuditFormData = {
        auditDate: new Date(),
        responses: {}
      };
      
      const result = validateAuditForm(formData);
      
      expect(result.missingRequired.length).toBeGreaterThan(0);
    });

    it('should track incomplete fail responses', () => {
      const formData: AuditFormData = {
        auditDate: new Date(),
        responses: {
          'ctx_001': {
            itemId: 'ctx_001',
            response: 'fail'
            // Missing severity
          }
        }
      };
      
      const result = validateAuditForm(formData);
      
      expect(result.incompleteFails.length).toBeGreaterThan(0);
    });
  });

  describe('calculateOverallProgress', () => {
    it('should calculate 0% for empty responses', () => {
      const progress = calculateOverallProgress({});
      
      expect(progress.percentage).toBe(0);
      expect(progress.answered).toBe(0);
      expect(progress.requiredAnswered).toBe(0);
    });

    it('should calculate progress correctly with some responses', () => {
      const responses: Record<string, AuditResponse> = {
        'ctx_001': { itemId: 'ctx_001', response: 'pass' },
        'ctx_002': { itemId: 'ctx_002', response: 'fail', severity: 'low' }
      };
      
      const progress = calculateOverallProgress(responses);
      
      expect(progress.answered).toBe(2);
      expect(progress.percentage).toBeGreaterThan(0);
    });
  });

  describe('canSubmitForm', () => {
    it('should prevent submission with missing required fields', () => {
      const formData: AuditFormData = {
        auditDate: new Date(),
        responses: {}
      };
      
      const result = canSubmitForm(formData);
      
      expect(result.canSubmit).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('should allow submission with all required fields complete', () => {
      // Create a form with all required fields answered
      const formData: AuditFormData = {
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
          'impr_003': { itemId: 'impr_003', response: 'pass' }
        }
      };
      
      const result = canSubmitForm(formData);
      
      expect(result.canSubmit).toBe(true);
    });
  });

  describe('getValidationSummary', () => {
    it('should return success message for valid form', () => {
      const validation = {
        isValid: true,
        errors: {},
        warnings: {},
        detailedErrors: [],
        missingRequired: [],
        incompleteFails: [],
        totalErrors: 0,
        totalWarnings: 0
      };
      
      const summary = getValidationSummary(validation);
      
      expect(summary).toContain('Ready to submit');
    });

    it('should describe missing required fields', () => {
      const validation = {
        isValid: false,
        errors: { test: 'error' },
        detailedErrors: [],
        missingRequired: ['test_001', 'test_002'],
        incompleteFails: [],
        totalErrors: 2,
        totalWarnings: 0
      };
      
      const summary = getValidationSummary(validation);
      
      expect(summary).toContain('required field');
    });
  });
});
