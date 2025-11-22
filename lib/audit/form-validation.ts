// Form Validation Utilities for ISO Audit Forms
// Provides comprehensive validation with detailed error messages

import { 
  AuditFormData, 
  AuditResponse, 
  ValidationResult,
  ProgressStatus 
} from '@/types/audit-form.types';
import { 
  ISO_9001_CHECKLIST, 
  ISOChecklistItem,
  getAllChecklistItems,
  getRequiredItems 
} from './iso-checklist';

export interface ValidationError {
  itemId: string;
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  clauseRef?: string;
  suggestion?: string;
  helpText?: string;
}

export interface DetailedValidationResult extends ValidationResult {
  detailedErrors: ValidationError[];
  missingRequired: string[];
  incompleteFails: string[];
  totalErrors: number;
  totalWarnings: number;
  totalInfo: number;
}

/**
 * Validates a single audit response with contextual error messages
 */
export function validateResponse(
  item: ISOChecklistItem,
  response?: AuditResponse
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if required field has a response
  if (item.required && !response?.response) {
    errors.push({
      itemId: item.id,
      field: 'response',
      message: `Required field: ${item.section} must be answered`,
      severity: 'error',
      clauseRef: item.clauseRef,
      suggestion: 'Select Pass, Fail, or N/A to continue',
      helpText: item.helpText
    });
  }

  // If response exists, validate completeness
  if (response?.response) {
    // Fail responses must have severity
    if (response.response === 'fail' && !response.severity) {
      errors.push({
        itemId: item.id,
        field: 'severity',
        message: 'Severity level is required for failed items',
        severity: 'error',
        clauseRef: item.clauseRef,
        suggestion: 'Select Low, Medium, High, or Critical based on the impact of this finding',
        helpText: 'Severity helps prioritize corrective actions: Low (minor issue), Medium (moderate impact), High (significant concern), Critical (immediate action required)'
      });
    }

    // Evidence required items should have evidence (warning only)
    if (item.evidenceRequired && (!response.evidenceIds || response.evidenceIds.length === 0)) {
      errors.push({
        itemId: item.id,
        field: 'evidence',
        message: 'Evidence is strongly recommended for this item',
        severity: 'warning',
        clauseRef: item.clauseRef,
        suggestion: 'Add photos or documents to support your audit findings',
        helpText: 'Evidence strengthens audit credibility and provides visual documentation for review'
      });
    }

    // Fail responses should have comments explaining the issue
    if (response.response === 'fail' && !response.comments?.trim()) {
      errors.push({
        itemId: item.id,
        field: 'comments',
        message: 'Comments are strongly recommended to explain the failure',
        severity: 'warning',
        clauseRef: item.clauseRef,
        suggestion: 'Describe what was observed, why it failed, and what corrective action is needed',
        helpText: 'Clear comments help reviewers understand the issue and plan appropriate corrective actions'
      });
    }

    // Pass responses with evidence are good practice
    if (response.response === 'pass' && item.evidenceRequired && (!response.evidenceIds || response.evidenceIds.length === 0)) {
      errors.push({
        itemId: item.id,
        field: 'evidence',
        message: 'Consider adding evidence to support this pass result',
        severity: 'info',
        clauseRef: item.clauseRef,
        suggestion: 'Evidence of conformance strengthens audit quality',
        helpText: 'Photos or documents showing compliance provide valuable proof for certification audits'
      });
    }

    // High/Critical severity should have detailed comments
    if (response.response === 'fail' && (response.severity === 'high' || response.severity === 'critical')) {
      if (!response.comments || response.comments.length < 20) {
        errors.push({
          itemId: item.id,
          field: 'comments',
          message: `${response.severity === 'critical' ? 'Critical' : 'High'} severity findings require detailed explanation`,
          severity: 'warning',
          clauseRef: item.clauseRef,
          suggestion: 'Provide comprehensive details about the issue, its impact, and immediate actions taken',
          helpText: 'High-severity findings need thorough documentation for management review and corrective action planning'
        });
      }
    }

    // N/A responses should ideally have justification
    if (response.response === 'na' && !response.comments?.trim()) {
      errors.push({
        itemId: item.id,
        field: 'comments',
        message: 'Consider adding a brief explanation for N/A selection',
        severity: 'info',
        clauseRef: item.clauseRef,
        suggestion: 'Explain why this requirement is not applicable',
        helpText: 'Justifying N/A selections helps reviewers understand the context'
      });
    }
  }

  return errors;
}

/**
 * Validates the entire audit form
 */
export function validateAuditForm(formData: AuditFormData): DetailedValidationResult {
  const allItems = getAllChecklistItems();
  const detailedErrors: ValidationError[] = [];
  const missingRequired: string[] = [];
  const incompleteFails: string[] = [];

  // Validate each item
  allItems.forEach(item => {
    const response = formData.responses[item.id];
    const itemErrors = validateResponse(item, response);
    
    detailedErrors.push(...itemErrors);

    // Track specific error types
    if (item.required && !response?.response) {
      missingRequired.push(item.id);
    }

    if (response?.response === 'fail' && !response.severity) {
      incompleteFails.push(item.id);
    }
  });

  // Create error map for backward compatibility
  const errors: Record<string, string> = {};
  detailedErrors
    .filter(e => e.severity === 'error')
    .forEach(error => {
      if (!errors[error.itemId]) {
        errors[error.itemId] = error.message;
      }
    });

  // Create warnings map
  const warnings: Record<string, string> = {};
  detailedErrors
    .filter(e => e.severity === 'warning')
    .forEach(error => {
      if (!warnings[error.itemId]) {
        warnings[error.itemId] = error.message;
      }
    });

  const totalErrors = detailedErrors.filter(e => e.severity === 'error').length;
  const totalWarnings = detailedErrors.filter(e => e.severity === 'warning').length;
  const totalInfo = detailedErrors.filter(e => e.severity === 'info').length;

  return {
    isValid: totalErrors === 0,
    errors,
    warnings,
    detailedErrors,
    missingRequired,
    incompleteFails,
    totalErrors,
    totalWarnings,
    totalInfo
  };
}

/**
 * Calculates progress for a specific section
 */
export function calculateSectionProgress(
  sectionId: string,
  responses: Record<string, AuditResponse>
): ProgressStatus {
  const section = ISO_9001_CHECKLIST.find(s => s.id === sectionId);
  if (!section) {
    return { answered: 0, total: 0, percentage: 0 };
  }

  const items = section.items;
  const requiredItems = items.filter(item => item.required);
  
  const answeredItems = items.filter(item => responses[item.id]?.response);
  const answeredRequired = requiredItems.filter(item => responses[item.id]?.response);

  return {
    answered: answeredItems.length,
    total: items.length,
    percentage: items.length > 0 
      ? Math.round((answeredItems.length / items.length) * 100) 
      : 0,
    requiredAnswered: answeredRequired.length,
    requiredTotal: requiredItems.length
  };
}

/**
 * Calculates overall form progress
 */
export function calculateOverallProgress(
  responses: Record<string, AuditResponse>
): ProgressStatus {
  const allItems = getAllChecklistItems();
  const requiredItems = getRequiredItems();
  
  const answeredItems = allItems.filter(item => responses[item.id]?.response);
  const answeredRequired = requiredItems.filter(item => responses[item.id]?.response);

  return {
    answered: answeredItems.length,
    total: allItems.length,
    percentage: allItems.length > 0 
      ? Math.round((answeredItems.length / allItems.length) * 100) 
      : 0,
    requiredAnswered: answeredRequired.length,
    requiredTotal: requiredItems.length
  };
}

/**
 * Gets validation status for a specific item
 */
export function getItemValidationStatus(
  item: ISOChecklistItem,
  response?: AuditResponse
): 'valid' | 'invalid' | 'warning' | 'incomplete' {
  const errors = validateResponse(item, response);
  
  if (errors.length === 0) {
    return 'valid';
  }
  
  const hasErrors = errors.some(e => e.severity === 'error');
  const hasWarnings = errors.some(e => e.severity === 'warning');
  
  if (hasErrors) {
    return 'invalid';
  }
  
  if (hasWarnings) {
    return 'warning';
  }
  
  return 'incomplete';
}

/**
 * Generates a human-readable validation summary
 */
export function getValidationSummary(validation: DetailedValidationResult): string {
  if (validation.isValid && validation.totalWarnings === 0) {
    return 'All required fields are complete. Ready to submit.';
  }

  const parts: string[] = [];

  if (validation.missingRequired.length > 0) {
    parts.push(`${validation.missingRequired.length} required field(s) need to be answered`);
  }

  if (validation.incompleteFails.length > 0) {
    parts.push(`${validation.incompleteFails.length} failed item(s) need severity levels`);
  }

  if (validation.totalWarnings > 0) {
    parts.push(`${validation.totalWarnings} recommendation(s) to improve audit quality`);
  }

  return parts.join(', ');
}

/**
 * Checks if form is ready for submission
 */
export function canSubmitForm(formData: AuditFormData): {
  canSubmit: boolean;
  reason?: string;
} {
  const validation = validateAuditForm(formData);

  if (!validation.isValid) {
    return {
      canSubmit: false,
      reason: getValidationSummary(validation)
    };
  }

  // Check if at least some items are answered
  const progress = calculateOverallProgress(formData.responses);
  if (progress.requiredAnswered === 0) {
    return {
      canSubmit: false,
      reason: 'At least one required field must be answered'
    };
  }

  return { canSubmit: true };
}

/**
 * Real-time validation for a single field change
 */
export function validateFieldChange(
  item: ISOChecklistItem,
  response: AuditResponse,
  field: keyof AuditResponse
): ValidationError | null {
  // Validate based on the field that changed
  switch (field) {
    case 'response':
      if (item.required && !response.response) {
        return {
          itemId: item.id,
          field: 'response',
          message: 'This field is required',
          severity: 'error',
          clauseRef: item.clauseRef
        };
      }
      break;

    case 'severity':
      if (response.response === 'fail' && !response.severity) {
        return {
          itemId: item.id,
          field: 'severity',
          message: 'Severity level is required for failed items',
          severity: 'error',
          clauseRef: item.clauseRef
        };
      }
      break;

    case 'comments':
      if (response.response === 'fail' && !response.comments?.trim()) {
        return {
          itemId: item.id,
          field: 'comments',
          message: 'Comments are recommended to explain the failure',
          severity: 'warning',
          clauseRef: item.clauseRef
        };
      }
      break;
  }

  return null;
}
