// ISO 9001:2015 Clause Mapping and Reference System
// This module provides comprehensive ISO clause mapping, help text, and guidance

export interface ISOClauseReference {
  clause: string;
  title: string;
  description: string;
  requirements: string[];
  commonFindings: string[];
  evidenceExamples: string[];
  relatedClauses: string[];
}

export interface ISOClauseHelpText {
  clause: string;
  shortHelp: string;
  detailedHelp: string;
  auditTips: string[];
  passExamples: string[];
  failExamples: string[];
}

// Comprehensive ISO 9001:2015 Clause Reference Database
export const ISO_CLAUSE_REFERENCES: Record<string, ISOClauseReference> = {
  '4.1': {
    clause: '4.1',
    title: 'Understanding the organization and its context',
    description: 'The organization must determine external and internal issues relevant to its purpose and strategic direction that affect its ability to achieve the intended results of its QMS.',
    requirements: [
      'Identify internal and external issues',
      'Document organizational context',
      'Review context periodically',
      'Consider impact on QMS effectiveness'
    ],
    commonFindings: [
      'No documented analysis of organizational context',
      'Context analysis not reviewed or updated',
      'Issues not linked to QMS planning',
      'Stakeholder needs not considered'
    ],
    evidenceExamples: [
      'SWOT analysis documentation',
      'PESTLE analysis reports',
      'Strategic planning documents',
      'Market analysis reports',
      'Risk assessment records'
    ],
    relatedClauses: ['4.2', '6.1', '9.3']
  },
  '4.2': {
    clause: '4.2',
    title: 'Understanding the needs and expectations of interested parties',
    description: 'The organization must determine interested parties relevant to the QMS and their requirements.',
    requirements: [
      'Identify interested parties',
      'Determine requirements of interested parties',
      'Monitor and review interested party information',
      'Document interested party requirements'
    ],
    commonFindings: [
      'Stakeholder register not maintained',
      'Requirements not documented',
      'No process for monitoring stakeholder needs',
      'Interested parties not comprehensively identified'
    ],
    evidenceExamples: [
      'Stakeholder register',
      'Customer requirement documents',
      'Regulatory requirement lists',
      'Supplier agreements',
      'Employee feedback records'
    ],
    relatedClauses: ['4.1', '5.1.2', '8.2']
  },
  '4.3': {
    clause: '4.3',
    title: 'Determining the scope of the quality management system',
    description: 'The organization must determine the boundaries and applicability of the QMS to establish its scope.',
    requirements: [
      'Define QMS scope boundaries',
      'Consider internal and external issues',
      'Consider interested party requirements',
      'Document and maintain scope',
      'Make scope available'
    ],
    commonFindings: [
      'Scope not documented',
      'Scope too vague or unclear',
      'Exclusions not justified',
      'Scope not available to interested parties'
    ],
    evidenceExamples: [
      'QMS scope statement',
      'Quality manual',
      'Organizational charts',
      'Process maps showing boundaries',
      'Exclusion justifications'
    ],
    relatedClauses: ['4.1', '4.2', '4.4']
  },
  '4.4': {
    clause: '4.4',
    title: 'Quality management system and its processes',
    description: 'The organization must establish, implement, maintain and continually improve a QMS, including the processes needed and their interactions.',
    requirements: [
      'Determine QMS processes',
      'Define process inputs and outputs',
      'Determine process sequence and interaction',
      'Establish process criteria and methods',
      'Allocate resources for processes',
      'Monitor and measure processes',
      'Implement process improvements'
    ],
    commonFindings: [
      'Process interactions not documented',
      'Process controls not defined',
      'Resources not allocated',
      'No process performance monitoring'
    ],
    evidenceExamples: [
      'Process maps or flowcharts',
      'Turtle diagrams',
      'Procedure documents',
      'Process performance metrics',
      'Resource allocation records'
    ],
    relatedClauses: ['4.3', '6.1', '8.1', '9.1']
  },
  '5.1': {
    clause: '5.1',
    title: 'Leadership and commitment',
    description: 'Top management must demonstrate leadership and commitment with respect to the QMS.',
    requirements: [
      'Take accountability for QMS effectiveness',
      'Ensure quality policy and objectives are established',
      'Ensure QMS integration into business processes',
      'Promote process approach and risk-based thinking',
      'Ensure resources are available',
      'Communicate importance of effective QMS',
      'Ensure QMS achieves intended results',
      'Support persons contributing to QMS effectiveness'
    ],
    commonFindings: [
      'Limited management involvement in QMS',
      'Quality policy not communicated',
      'Resources not adequately provided',
      'QMS not integrated with business processes'
    ],
    evidenceExamples: [
      'Management review meeting minutes',
      'Resource allocation decisions',
      'Management communications',
      'Strategic planning documents',
      'Quality objective approvals'
    ],
    relatedClauses: ['5.2', '5.3', '9.3']
  },
  '5.2': {
    clause: '5.2',
    title: 'Policy',
    description: 'Top management must establish, implement and maintain a quality policy.',
    requirements: [
      'Appropriate to purpose and context',
      'Provides framework for quality objectives',
      'Includes commitment to satisfy requirements',
      'Includes commitment to continual improvement',
      'Documented and communicated',
      'Available to interested parties'
    ],
    commonFindings: [
      'Quality policy not documented',
      'Policy not communicated to employees',
      'Policy not aligned with organizational context',
      'No evidence of policy implementation'
    ],
    evidenceExamples: [
      'Quality policy statement',
      'Communication records',
      'Employee awareness evidence',
      'Policy display locations',
      'Induction training materials'
    ],
    relatedClauses: ['5.1', '6.2', '7.3']
  },
  '5.3': {
    clause: '5.3',
    title: 'Organizational roles, responsibilities and authorities',
    description: 'Top management must ensure that responsibilities and authorities for relevant roles are assigned, communicated and understood.',
    requirements: [
      'Assign roles and responsibilities',
      'Communicate assignments',
      'Ensure understanding of roles',
      'Assign responsibility for QMS conformity',
      'Assign responsibility for process performance',
      'Assign responsibility for reporting on QMS performance'
    ],
    commonFindings: [
      'Roles and responsibilities not documented',
      'Assignments not communicated',
      'No designated management representative',
      'Unclear accountability for processes'
    ],
    evidenceExamples: [
      'Organizational charts',
      'Job descriptions',
      'Responsibility matrices',
      'Delegation of authority documents',
      'Management representative appointment'
    ],
    relatedClauses: ['5.1', '7.2', '7.3']
  },
  '6.1': {
    clause: '6.1',
    title: 'Actions to address risks and opportunities',
    description: 'The organization must plan actions to address risks and opportunities to ensure the QMS can achieve its intended results.',
    requirements: [
      'Determine risks and opportunities',
      'Plan actions to address risks and opportunities',
      'Integrate actions into QMS processes',
      'Evaluate effectiveness of actions',
      'Consider context and interested parties'
    ],
    commonFindings: [
      'No risk assessment conducted',
      'Risks not documented',
      'No mitigation plans',
      'Effectiveness not evaluated'
    ],
    evidenceExamples: [
      'Risk register',
      'FMEA documents',
      'Risk assessment reports',
      'Mitigation action plans',
      'Risk review records'
    ],
    relatedClauses: ['4.1', '4.2', '6.2', '9.1']
  },
  '6.2': {
    clause: '6.2',
    title: 'Quality objectives and planning to achieve them',
    description: 'The organization must establish quality objectives at relevant functions, levels and processes.',
    requirements: [
      'Establish quality objectives',
      'Ensure objectives are measurable',
      'Monitor objectives',
      'Communicate objectives',
      'Update objectives as needed',
      'Plan how to achieve objectives'
    ],
    commonFindings: [
      'Objectives not SMART',
      'No measurement methods defined',
      'Objectives not communicated',
      'Progress not tracked'
    ],
    evidenceExamples: [
      'Quality objectives documentation',
      'KPI dashboards',
      'Performance tracking reports',
      'Action plans for objectives',
      'Management review records'
    ],
    relatedClauses: ['5.2', '9.1', '9.3']
  },
  '6.3': {
    clause: '6.3',
    title: 'Planning of changes',
    description: 'When the organization determines the need for changes to the QMS, the changes must be carried out in a planned manner.',
    requirements: [
      'Consider purpose of changes',
      'Consider potential consequences',
      'Ensure QMS integrity maintained',
      'Ensure resource availability',
      'Allocate or reallocate responsibilities'
    ],
    commonFindings: [
      'No change management process',
      'Changes not documented',
      'Impact assessment not conducted',
      'Uncontrolled changes to QMS'
    ],
    evidenceExamples: [
      'Change management procedure',
      'Change request forms',
      'Impact assessments',
      'Change approval records',
      'Implementation plans'
    ],
    relatedClauses: ['4.4', '8.1', '10.3']
  },
  '7.1': {
    clause: '7.1',
    title: 'Resources',
    description: 'The organization must determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the QMS.',
    requirements: [
      'Determine resource needs',
      'Provide necessary resources',
      'Consider capabilities and constraints',
      'Ensure infrastructure availability',
      'Ensure suitable environment',
      'Provide monitoring and measurement resources'
    ],
    commonFindings: [
      'Inadequate resources allocated',
      'Resource needs not assessed',
      'Infrastructure not maintained',
      'Measurement equipment not calibrated'
    ],
    evidenceExamples: [
      'Resource allocation budgets',
      'Infrastructure maintenance records',
      'Equipment lists',
      'Calibration records',
      'Staffing plans'
    ],
    relatedClauses: ['5.1', '7.2', '8.1']
  },
  '7.2': {
    clause: '7.2',
    title: 'Competence',
    description: 'The organization must determine necessary competence of persons doing work under its control that affects QMS performance and effectiveness.',
    requirements: [
      'Determine necessary competence',
      'Ensure persons are competent',
      'Take actions to acquire competence',
      'Evaluate effectiveness of actions',
      'Retain documented information as evidence'
    ],
    commonFindings: [
      'Competency requirements not defined',
      'Training needs not identified',
      'Training effectiveness not evaluated',
      'Competency records not maintained'
    ],
    evidenceExamples: [
      'Competency matrix',
      'Training records',
      'Qualification certificates',
      'Training effectiveness evaluations',
      'Skills assessments'
    ],
    relatedClauses: ['5.3', '7.3', '8.5.1']
  },
  '7.3': {
    clause: '7.3',
    title: 'Awareness',
    description: 'The organization must ensure that persons doing work under its control are aware of the quality policy, relevant quality objectives, their contribution to QMS effectiveness, and implications of not conforming.',
    requirements: [
      'Ensure awareness of quality policy',
      'Ensure awareness of quality objectives',
      'Ensure awareness of contribution to effectiveness',
      'Ensure awareness of implications of nonconformity'
    ],
    commonFindings: [
      'Employees not aware of quality policy',
      'No awareness training conducted',
      'Objectives not communicated',
      'No evidence of awareness'
    ],
    evidenceExamples: [
      'Training attendance records',
      'Awareness session materials',
      'Communication records',
      'Employee surveys',
      'Induction training records'
    ],
    relatedClauses: ['5.2', '7.2', '7.4']
  }
};

// Help text database for audit guidance
export const ISO_HELP_TEXT: Record<string, ISOClauseHelpText> = {
  '4.1': {
    clause: '4.1',
    shortHelp: 'Check if documented analysis of internal/external factors exists (SWOT, PESTLE, etc.)',
    detailedHelp: 'The organization should have documented evidence of understanding its context. This includes analysis of internal factors (strengths, weaknesses, culture, capabilities) and external factors (market conditions, regulations, competition, technology trends).',
    auditTips: [
      'Look for SWOT or PESTLE analysis documents',
      'Check if analysis is current and reviewed periodically',
      'Verify that identified issues are linked to QMS planning',
      'Interview management about how context influences QMS decisions'
    ],
    passExamples: [
      'Current SWOT analysis reviewed in last 12 months',
      'Strategic planning documents reference organizational context',
      'Risk assessment includes context considerations',
      'Management review discusses context changes'
    ],
    failExamples: [
      'No documented context analysis exists',
      'Analysis is outdated (>2 years old)',
      'Context not considered in QMS planning',
      'Management unaware of context requirements'
    ]
  },
  '4.2': {
    clause: '4.2',
    shortHelp: 'Verify stakeholder register exists with documented requirements',
    detailedHelp: 'The organization must identify all interested parties (stakeholders) relevant to the QMS and understand their requirements. This includes customers, employees, suppliers, regulators, and other relevant parties.',
    auditTips: [
      'Request stakeholder register or list',
      'Check if requirements are documented for each party',
      'Verify monitoring process for changing requirements',
      'Confirm requirements are considered in QMS planning'
    ],
    passExamples: [
      'Comprehensive stakeholder register maintained',
      'Requirements documented and reviewed regularly',
      'Process exists for monitoring stakeholder needs',
      'Evidence of stakeholder engagement'
    ],
    failExamples: [
      'No stakeholder identification performed',
      'Requirements not documented',
      'Key stakeholders missing from analysis',
      'No process for monitoring changes'
    ]
  },
  '5.1': {
    clause: '5.1',
    shortHelp: 'Look for evidence of management involvement in QMS activities',
    detailedHelp: 'Top management must actively demonstrate leadership and commitment to the QMS. This goes beyond delegation and requires personal involvement in QMS activities, decisions, and improvements.',
    auditTips: [
      'Review management review meeting minutes',
      'Check resource allocation decisions',
      'Verify management communications about quality',
      'Interview staff about management involvement',
      'Look for management participation in audits and improvements'
    ],
    passExamples: [
      'Management actively participates in reviews',
      'Resources allocated based on QMS needs',
      'Management communicates quality importance',
      'Personal involvement in improvement initiatives'
    ],
    failExamples: [
      'Management delegates all QMS responsibilities',
      'No evidence of management participation',
      'Resources denied for QMS activities',
      'Quality policy not known by management'
    ]
  },
  '7.2': {
    clause: '7.2',
    shortHelp: 'Verify training records and competency assessments exist',
    detailedHelp: 'The organization must ensure all personnel are competent based on appropriate education, training, or experience. Competency requirements should be defined, and evidence of competency maintained.',
    auditTips: [
      'Request competency matrix or requirements',
      'Review training records and certificates',
      'Check training effectiveness evaluations',
      'Interview personnel about their training',
      'Verify on-the-job training documentation'
    ],
    passExamples: [
      'Competency requirements defined for all roles',
      'Training records complete and current',
      'Effectiveness of training evaluated',
      'Personnel demonstrate required competencies'
    ],
    failExamples: [
      'No competency requirements defined',
      'Training records incomplete or missing',
      'No evaluation of training effectiveness',
      'Personnel lack required competencies'
    ]
  },
  '9.2': {
    clause: '9.2',
    shortHelp: 'Verify audit schedule, reports, and follow-up actions',
    detailedHelp: 'The organization must conduct internal audits at planned intervals to provide information on whether the QMS conforms to requirements and is effectively implemented and maintained.',
    auditTips: [
      'Review annual audit schedule',
      'Check audit reports for completeness',
      'Verify all QMS areas are audited',
      'Confirm auditor competence and independence',
      'Review corrective actions from findings'
    ],
    passExamples: [
      'Comprehensive audit schedule covers all areas',
      'Audits conducted as scheduled',
      'Audit reports document findings clearly',
      'Corrective actions tracked to closure'
    ],
    failExamples: [
      'No audit schedule exists',
      'Audits not conducted regularly',
      'Audit reports incomplete',
      'Findings not followed up'
    ]
  }
};

// Helper functions for ISO clause mapping
export function getClauseReference(clause: string): ISOClauseReference | undefined {
  return ISO_CLAUSE_REFERENCES[clause];
}

export function getClauseHelpText(clause: string): ISOClauseHelpText | undefined {
  return ISO_HELP_TEXT[clause];
}

export function searchClausesByKeyword(keyword: string): ISOClauseReference[] {
  const lowerKeyword = keyword.toLowerCase();
  return Object.values(ISO_CLAUSE_REFERENCES).filter(ref =>
    ref.title.toLowerCase().includes(lowerKeyword) ||
    ref.description.toLowerCase().includes(lowerKeyword) ||
    ref.requirements.some(req => req.toLowerCase().includes(lowerKeyword))
  );
}

export function getRelatedClauses(clause: string): ISOClauseReference[] {
  const reference = ISO_CLAUSE_REFERENCES[clause];
  if (!reference) return [];
  
  return reference.relatedClauses
    .map(relatedClause => ISO_CLAUSE_REFERENCES[relatedClause])
    .filter(Boolean);
}

export function getAllClauses(): string[] {
  return Object.keys(ISO_CLAUSE_REFERENCES).sort();
}

export function getClausesBySection(sectionNumber: number): ISOClauseReference[] {
  return Object.values(ISO_CLAUSE_REFERENCES).filter(ref => {
    const clauseSection = parseInt(ref.clause.split('.')[0]);
    return clauseSection === sectionNumber;
  });
}

// Generate audit guidance based on clause
export function generateAuditGuidance(clause: string): string {
  const reference = getClauseReference(clause);
  const helpText = getClauseHelpText(clause);
  
  if (!reference || !helpText) {
    return 'No guidance available for this clause.';
  }

  return `
**${reference.clause} - ${reference.title}**

${reference.description}

**Key Requirements:**
${reference.requirements.map(req => `• ${req}`).join('\n')}

**Audit Tips:**
${helpText.auditTips.map(tip => `• ${tip}`).join('\n')}

**Evidence to Look For:**
${reference.evidenceExamples.map(ex => `• ${ex}`).join('\n')}
  `.trim();
}

// Validate if a clause reference is valid
export function isValidClause(clause: string): boolean {
  return clause in ISO_CLAUSE_REFERENCES;
}

// Get clause hierarchy (section > subsection)
export function getClauseHierarchy(clause: string): { section: number; subsection: number } {
  const parts = clause.split('.');
  return {
    section: parseInt(parts[0]),
    subsection: parseInt(parts[1] || '0')
  };
}
