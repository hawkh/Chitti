// Compliance Calculation Engine
// Implements weighted scoring algorithm for audit responses with section-level and overall scoring

import { AuditResponse, ComplianceScore } from '@/types/audit-form.types';
import { 
  getAllChecklistItems, 
  getTotalWeight, 
  ISO_9001_CHECKLIST,
  ISOChecklistItem 
} from './iso-checklist';

export interface SectionScore {
  sectionId: string;
  sectionTitle: string;
  score: number;
  passedItems: number;
  failedItems: number;
  naItems: number;
  totalItems: number;
  weight: number;
  criticalFailures: number;
}

export interface CriticalFailure {
  itemId: string;
  clauseRef: string;
  question: string;
  severity: string;
  comments?: string;
}

/**
 * Calculate compliance score for an audit based on responses
 * Uses weighted scoring algorithm where each item contributes based on its weight
 */
export function calculateComplianceScore(
  responses: Record<string, AuditResponse>
): ComplianceScore {
  const allItems = getAllChecklistItems();
  const totalWeight = getTotalWeight();
  
  let weightedScore = 0;
  let passedItems = 0;
  let failedItems = 0;
  let naItems = 0;
  let criticalFailures = 0;
  let highSeverityCount = 0;
  let mediumSeverityCount = 0;
  let lowSeverityCount = 0;
  
  const sectionScores: Record<string, number> = {};
  const improvementAreas: string[] = [];
  const criticalFailuresList: CriticalFailure[] = [];
  
  // Calculate section scores
  ISO_9001_CHECKLIST.forEach(section => {
    const sectionScore = calculateSectionScore(section.items, responses);
    sectionScores[section.id] = sectionScore.score;
    
    // Track critical failures and improvement areas
    if (sectionScore.criticalFailures > 0) {
      improvementAreas.push(`${section.title}: ${sectionScore.criticalFailures} critical failure(s)`);
    } else if (sectionScore.score < 70) {
      improvementAreas.push(`${section.title}: Score ${sectionScore.score.toFixed(1)}% - needs improvement`);
    }
  });
  
  // Calculate overall weighted score
  allItems.forEach(item => {
    const response = responses[item.id];
    
    if (!response || response.response === null) {
      // No response - treat as fail for scoring purposes
      return;
    }
    
    const itemWeight = item.weight;
    
    switch (response.response) {
      case 'pass':
        weightedScore += itemWeight;
        passedItems++;
        break;
      case 'fail':
        failedItems++;
        
        // Track severity
        if (response.severity === 'critical') {
          criticalFailures++;
          criticalFailuresList.push({
            itemId: item.id,
            clauseRef: item.clauseRef,
            question: item.question,
            severity: response.severity,
            comments: response.comments
          });
        } else if (response.severity === 'high') {
          highSeverityCount++;
        } else if (response.severity === 'medium') {
          mediumSeverityCount++;
        } else if (response.severity === 'low') {
          lowSeverityCount++;
        }
        break;
      case 'na':
        naItems++;
        // N/A items don't affect score but reduce denominator
        break;
    }
  });
  
  // Calculate overall score percentage
  // Exclude N/A items from total weight calculation
  const applicableWeight = allItems
    .filter(item => {
      const response = responses[item.id];
      return response && response.response !== 'na';
    })
    .reduce((sum, item) => sum + item.weight, 0);
  
  const overallScore = applicableWeight > 0 
    ? (weightedScore / applicableWeight) * 100 
    : 0;
  
  const totalItems = allItems.length;
  
  // Add critical failures to improvement areas
  if (criticalFailures > 0) {
    improvementAreas.unshift(`CRITICAL: ${criticalFailures} critical failure(s) require immediate attention`);
  }
  
  return {
    overallScore: Math.round(overallScore * 10) / 10, // Round to 1 decimal
    sectionScores,
    passedItems,
    failedItems,
    naItems,
    totalItems,
    criticalFailures,
    highSeverityCount,
    mediumSeverityCount,
    lowSeverityCount,
    improvementAreas: improvementAreas.slice(0, 5), // Top 5 areas
    calculatedAt: new Date()
  };
}

/**
 * Calculate score for a specific section
 */
export function calculateSectionScore(
  items: ISOChecklistItem[],
  responses: Record<string, AuditResponse>
): SectionScore {
  let sectionWeight = 0;
  let weightedScore = 0;
  let passedItems = 0;
  let failedItems = 0;
  let naItems = 0;
  let criticalFailures = 0;
  
  items.forEach(item => {
    const response = responses[item.id];
    
    if (!response || response.response === null) {
      return;
    }
    
    const itemWeight = item.weight;
    
    if (response.response !== 'na') {
      sectionWeight += itemWeight;
    }
    
    switch (response.response) {
      case 'pass':
        weightedScore += itemWeight;
        passedItems++;
        break;
      case 'fail':
        failedItems++;
        if (response.severity === 'critical') {
          criticalFailures++;
        }
        break;
      case 'na':
        naItems++;
        break;
    }
  });
  
  const score = sectionWeight > 0 
    ? (weightedScore / sectionWeight) * 100 
    : 0;
  
  return {
    sectionId: '',
    sectionTitle: '',
    score: Math.round(score * 10) / 10,
    passedItems,
    failedItems,
    naItems,
    totalItems: items.length,
    weight: sectionWeight,
    criticalFailures
  };
}

/**
 * Detect critical failures that require immediate attention
 */
export function detectCriticalFailures(
  responses: Record<string, AuditResponse>
): CriticalFailure[] {
  const allItems = getAllChecklistItems();
  const criticalFailures: CriticalFailure[] = [];
  
  allItems.forEach(item => {
    const response = responses[item.id];
    
    if (response && response.response === 'fail' && response.severity === 'critical') {
      criticalFailures.push({
        itemId: item.id,
        clauseRef: item.clauseRef,
        question: item.question,
        severity: response.severity,
        comments: response.comments
      });
    }
  });
  
  return criticalFailures;
}

/**
 * Get compliance grade based on score
 */
export function getComplianceGrade(score: number): {
  grade: string;
  label: string;
  color: string;
} {
  if (score >= 95) {
    return { grade: 'A+', label: 'Excellent', color: 'green' };
  } else if (score >= 90) {
    return { grade: 'A', label: 'Very Good', color: 'green' };
  } else if (score >= 85) {
    return { grade: 'B+', label: 'Good', color: 'blue' };
  } else if (score >= 80) {
    return { grade: 'B', label: 'Satisfactory', color: 'blue' };
  } else if (score >= 75) {
    return { grade: 'C+', label: 'Acceptable', color: 'yellow' };
  } else if (score >= 70) {
    return { grade: 'C', label: 'Needs Improvement', color: 'yellow' };
  } else if (score >= 60) {
    return { grade: 'D', label: 'Poor', color: 'orange' };
  } else {
    return { grade: 'F', label: 'Failing', color: 'red' };
  }
}

/**
 * Calculate compliance score trend over time
 */
export function calculateScoreTrend(
  currentScore: number,
  previousScore: number | null
): {
  trend: 'improving' | 'declining' | 'stable';
  delta: number;
  deltaPercentage: number;
} {
  if (previousScore === null) {
    return {
      trend: 'stable',
      delta: 0,
      deltaPercentage: 0
    };
  }
  
  const delta = currentScore - previousScore;
  const deltaPercentage = previousScore > 0 
    ? (delta / previousScore) * 100 
    : 0;
  
  let trend: 'improving' | 'declining' | 'stable';
  
  if (Math.abs(delta) < 2) {
    trend = 'stable';
  } else if (delta > 0) {
    trend = 'improving';
  } else {
    trend = 'declining';
  }
  
  return {
    trend,
    delta: Math.round(delta * 10) / 10,
    deltaPercentage: Math.round(deltaPercentage * 10) / 10
  };
}
