// Compliance Calculator Tests
// Tests for weighted scoring algorithm, section-level scoring, and critical failure detection

import {
  calculateComplianceScore,
  calculateSectionScore,
  detectCriticalFailures,
  getComplianceGrade,
  calculateScoreTrend,
  SectionScore,
  CriticalFailure
} from '@/lib/audit/compliance-calculator';
import { AuditResponse } from '@/types/audit-form.types';
import { ISO_9001_CHECKLIST } from '@/lib/audit/iso-checklist';

describe('Compliance Calculator - Weighted Scoring Algorithm', () => {
  test('should calculate weighted score correctly for all pass responses', () => {
    const responses: Record<string, AuditResponse> = {
      'ctx_001': { itemId: 'ctx_001', response: 'pass' },
      'ctx_002': { itemId: 'ctx_002', response: 'pass' },
      'ctx_003': { itemId: 'ctx_003', response: 'pass' },
      'ctx_004': { itemId: 'ctx_004', response: 'pass' },
    };

    const score = calculateComplianceScore(responses);
    
    expect(score.overallScore).toBe(100);
    expect(score.passedItems).toBe(4);
    expect(score.failedItems).toBe(0);
    expect(score.criticalFailures).toBe(0);
  });

  test('should apply weights correctly in scoring calculation', () => {
    // ctx_003 has weight 3, ctx_001 has weight 2
    const responses: Record<string, AuditResponse> = {
      'ctx_001': { itemId: 'ctx_001', response: 'pass' }, // weight 2
      'ctx_002': { itemId: 'ctx_002', response: 'pass' }, // weight 2
      'ctx_003': { itemId: 'ctx_003', response: 'fail' }, // weight 3 - FAIL
      'ctx_004': { itemId: 'ctx_004', response: 'pass' }, // weight 3
    };

    const score = calculateComplianceScore(responses);
    
    // Total weight: 2+2+3+3 = 10
    // Passed weight: 2+2+3 = 7
    // Score: 7/10 = 70%
    expect(score.overallScore).toBe(70);
    expect(score.passedItems).toBe(3);
    expect(score.failedItems).toBe(1);
  });

  test('should exclude N/A items from scoring calculation', () => {
    const responses: Record<string, AuditResponse> = {
      'ctx_001': { itemId: 'ctx_001', response: 'pass' }, // weight 2
      'ctx_002': { itemId: 'ctx_002', response: 'na' },   // weight 2 - excluded
      'ctx_003': { itemId: 'ctx_003', response: 'pass' }, // weight 3
      'ctx_004': { itemId: 'ctx_004', response: 'pass' }, // weight 3
    };

    const score = calculateComplianceScore(responses);
    
    // Total applicable weight: 2+3+3 = 8 (excluding N/A)
    // Passed weight: 2+3+3 = 8
    // Score: 8/8 = 100%
    expect(score.overallScore).toBe(100);
    expect(score.passedItems).toBe(3);
    expect(score.naItems).toBe(1);
  });
});

describe('Compliance Calculator - Section-Level Scoring', () => {
  test('should calculate section score correctly', () => {
    const contextSection = ISO_9001_CHECKLIST.find(s => s.id === 'context');
    expect(contextSection).toBeDefined();

    const responses: Record<string, AuditResponse> = {
      'ctx_001': { itemId: 'ctx_001', response: 'pass' },
      'ctx_002': { itemId: 'ctx_002', response: 'pass' },
      'ctx_003': { itemId: 'ctx_003', response: 'fail' },
      'ctx_004': { itemId: 'ctx_004', response: 'pass' },
    };

    const sectionScore = calculateSectionScore(contextSection!.items, responses);
    
    expect(sectionScore.score).toBe(70); // (2+2+3)/(2+2+3+3) = 7/10 = 70%
    expect(sectionScore.passedItems).toBe(3);
    expect(sectionScore.failedItems).toBe(1);
    expect(sectionScore.totalItems).toBe(4);
  });

  test('should handle section with all N/A responses', () => {
    const contextSection = ISO_9001_CHECKLIST.find(s => s.id === 'context');
    
    const responses: Record<string, AuditResponse> = {
      'ctx_001': { itemId: 'ctx_001', response: 'na' },
      'ctx_002': { itemId: 'ctx_002', response: 'na' },
      'ctx_003': { itemId: 'ctx_003', response: 'na' },
      'ctx_004': { itemId: 'ctx_004', response: 'na' },
    };

    const sectionScore = calculateSectionScore(contextSection!.items, responses);
    
    expect(sectionScore.score).toBe(0);
    expect(sectionScore.naItems).toBe(4);
  });

  test('should track critical failures at section level', () => {
    const contextSection = ISO_9001_CHECKLIST.find(s => s.id === 'context');
    
    const responses: Record<string, AuditResponse> = {
      'ctx_001': { itemId: 'ctx_001', response: 'fail', severity: 'critical' },
      'ctx_002': { itemId: 'ctx_002', response: 'fail', severity: 'high' },
      'ctx_003': { itemId: 'ctx_003', response: 'pass' },
      'ctx_004': { itemId: 'ctx_004', response: 'pass' },
    };

    const sectionScore = calculateSectionScore(contextSection!.items, responses);
    
    expect(sectionScore.criticalFailures).toBe(1);
    expect(sectionScore.failedItems).toBe(2);
  });
});

describe('Compliance Calculator - Critical Failure Detection', () => {
  test('should detect critical failures correctly', () => {
    const responses: Record<string, AuditResponse> = {
      'ctx_001': { 
        itemId: 'ctx_001', 
        response: 'fail', 
        severity: 'critical',
        comments: 'No documented analysis found'
      },
      'ctx_002': { itemId: 'ctx_002', response: 'fail', severity: 'high' },
      'ctx_003': { itemId: 'ctx_003', response: 'pass' },
    };

    const criticalFailures = detectCriticalFailures(responses);
    
    expect(criticalFailures).toHaveLength(1);
    expect(criticalFailures[0].itemId).toBe('ctx_001');
    expect(criticalFailures[0].severity).toBe('critical');
    expect(criticalFailures[0].comments).toBe('No documented analysis found');
  });

  test('should return empty array when no critical failures', () => {
    const responses: Record<string, AuditResponse> = {
      'ctx_001': { itemId: 'ctx_001', response: 'pass' },
      'ctx_002': { itemId: 'ctx_002', response: 'fail', severity: 'low' },
    };

    const criticalFailures = detectCriticalFailures(responses);
    
    expect(criticalFailures).toHaveLength(0);
  });

  test('should include critical failures in improvement areas', () => {
    const responses: Record<string, AuditResponse> = {
      'ctx_001': { itemId: 'ctx_001', response: 'fail', severity: 'critical' },
      'ctx_002': { itemId: 'ctx_002', response: 'fail', severity: 'critical' },
      'ctx_003': { itemId: 'ctx_003', response: 'pass' },
      'ctx_004': { itemId: 'ctx_004', response: 'pass' },
    };

    const score = calculateComplianceScore(responses);
    
    expect(score.criticalFailures).toBe(2);
    expect(score.improvementAreas[0]).toContain('CRITICAL');
    expect(score.improvementAreas[0]).toContain('2 critical failure(s)');
  });
});

describe('Compliance Calculator - Severity Tracking', () => {
  test('should track all severity levels correctly', () => {
    const responses: Record<string, AuditResponse> = {
      'ctx_001': { itemId: 'ctx_001', response: 'fail', severity: 'critical' },
      'ctx_002': { itemId: 'ctx_002', response: 'fail', severity: 'high' },
      'ctx_003': { itemId: 'ctx_003', response: 'fail', severity: 'medium' },
      'ctx_004': { itemId: 'ctx_004', response: 'fail', severity: 'low' },
    };

    const score = calculateComplianceScore(responses);
    
    expect(score.criticalFailures).toBe(1);
    expect(score.highSeverityCount).toBe(1);
    expect(score.mediumSeverityCount).toBe(1);
    expect(score.lowSeverityCount).toBe(1);
  });
});

describe('Compliance Calculator - Grade System', () => {
  test('should assign correct grades based on score', () => {
    expect(getComplianceGrade(96).grade).toBe('A+');
    expect(getComplianceGrade(92).grade).toBe('A');
    expect(getComplianceGrade(87).grade).toBe('B+');
    expect(getComplianceGrade(82).grade).toBe('B');
    expect(getComplianceGrade(77).grade).toBe('C+');
    expect(getComplianceGrade(72).grade).toBe('C');
    expect(getComplianceGrade(65).grade).toBe('D');
    expect(getComplianceGrade(50).grade).toBe('F');
  });

  test('should provide appropriate labels and colors', () => {
    const excellent = getComplianceGrade(96);
    expect(excellent.label).toBe('Excellent');
    expect(excellent.color).toBe('green');

    const failing = getComplianceGrade(50);
    expect(failing.label).toBe('Failing');
    expect(failing.color).toBe('red');
  });
});

describe('Compliance Calculator - Trend Analysis', () => {
  test('should detect improving trend', () => {
    const trend = calculateScoreTrend(85, 75);
    
    expect(trend.trend).toBe('improving');
    expect(trend.delta).toBe(10);
    expect(trend.deltaPercentage).toBeCloseTo(13.3, 1);
  });

  test('should detect declining trend', () => {
    const trend = calculateScoreTrend(70, 85);
    
    expect(trend.trend).toBe('declining');
    expect(trend.delta).toBe(-15);
  });

  test('should detect stable trend for small changes', () => {
    const trend = calculateScoreTrend(85, 84);
    
    expect(trend.trend).toBe('stable');
    expect(trend.delta).toBe(1);
  });

  test('should handle null previous score', () => {
    const trend = calculateScoreTrend(85, null);
    
    expect(trend.trend).toBe('stable');
    expect(trend.delta).toBe(0);
    expect(trend.deltaPercentage).toBe(0);
  });
});

describe('Compliance Calculator - Edge Cases', () => {
  test('should handle empty responses', () => {
    const score = calculateComplianceScore({});
    
    expect(score.overallScore).toBe(0);
    expect(score.passedItems).toBe(0);
    expect(score.failedItems).toBe(0);
  });

  test('should handle partial responses', () => {
    const responses: Record<string, AuditResponse> = {
      'ctx_001': { itemId: 'ctx_001', response: 'pass' },
      // ctx_002, ctx_003, ctx_004 not answered
    };

    const score = calculateComplianceScore(responses);
    
    expect(score.passedItems).toBe(1);
    expect(score.overallScore).toBe(100); // Only answered items count
  });

  test('should round scores to one decimal place', () => {
    const responses: Record<string, AuditResponse> = {
      'ctx_001': { itemId: 'ctx_001', response: 'pass' }, // weight 2
      'ctx_002': { itemId: 'ctx_002', response: 'pass' }, // weight 2
      'ctx_003': { itemId: 'ctx_003', response: 'fail' }, // weight 3
    };

    const score = calculateComplianceScore(responses);
    
    // (2+2)/(2+2+3) = 4/7 = 57.142857...
    expect(score.overallScore).toBe(57.1);
  });
});
