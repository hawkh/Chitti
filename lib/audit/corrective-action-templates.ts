// Corrective Action Template System
// Provides context-aware corrective action suggestions based on ISO clauses and failure types

export interface CorrectiveActionTemplate {
  id: string;
  clause: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionSteps: string[];
  timeframe: string;
  responsibleRole: string;
  verificationMethod: string;
  relatedDocuments: string[];
}

export interface CorrectiveActionSuggestion {
  template: CorrectiveActionTemplate;
  relevanceScore: number;
  reason: string;
}

// Comprehensive corrective action template database
export const CORRECTIVE_ACTION_TEMPLATES: CorrectiveActionTemplate[] = [
  // Context and Planning (Clause 4.x)
  {
    id: 'ca-4.1-001',
    clause: '4.1',
    title: 'Conduct organizational context analysis',
    description: 'Perform comprehensive SWOT/PESTLE analysis to understand organizational context',
    severity: 'medium',
    actionSteps: [
      'Schedule context analysis workshop with key stakeholders',
      'Conduct SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)',
      'Perform PESTLE analysis (Political, Economic, Social, Technological, Legal, Environmental)',
      'Document findings in context analysis report',
      'Review and approve findings with top management',
      'Integrate findings into QMS planning'
    ],
    timeframe: '30 days',
    responsibleRole: 'Quality Manager',
    verificationMethod: 'Review documented context analysis and management approval',
    relatedDocuments: ['Context Analysis Report', 'SWOT Analysis', 'Strategic Plan']
  },
  {
    id: 'ca-4.2-001',
    clause: '4.2',
    title: 'Create and maintain stakeholder register',
    description: 'Identify all interested parties and document their requirements',
    severity: 'medium',
    actionSteps: [
      'Identify all interested parties (customers, employees, suppliers, regulators, etc.)',
      'Document requirements for each interested party',
      'Establish process for monitoring stakeholder needs',
      'Create stakeholder register with contact information',
      'Schedule regular review of stakeholder requirements',
      'Communicate requirements to relevant departments'
    ],
    timeframe: '21 days',
    responsibleRole: 'Quality Manager',
    verificationMethod: 'Review stakeholder register and monitoring process',
    relatedDocuments: ['Stakeholder Register', 'Requirements Matrix', 'Communication Plan']
  },
  {
    id: 'ca-4.3-001',
    clause: '4.3',
    title: 'Define and document QMS scope',
    description: 'Establish clear boundaries and applicability of the quality management system',
    severity: 'high',
    actionSteps: [
      'Review organizational context and stakeholder requirements',
      'Define QMS boundaries (locations, products, services)',
      'Identify any exclusions and provide justifications',
      'Document scope statement in quality manual',
      'Obtain management approval of scope',
      'Make scope available to interested parties'
    ],
    timeframe: '14 days',
    responsibleRole: 'Quality Manager',
    verificationMethod: 'Review documented scope statement and management approval',
    relatedDocuments: ['Quality Manual', 'Scope Statement', 'Exclusion Justifications']
  },

  // Leadership (Clause 5.x)
  {
    id: 'ca-5.1-001',
    clause: '5.1',
    title: 'Establish management leadership activities',
    description: 'Implement regular management involvement in QMS activities',
    severity: 'high',
    actionSteps: [
      'Schedule regular management review meetings (minimum quarterly)',
      'Define management responsibilities for QMS',
      'Establish resource allocation process for QMS needs',
      'Create management communication plan for quality importance',
      'Document management participation in audits and improvements',
      'Review and approve quality objectives'
    ],
    timeframe: '30 days',
    responsibleRole: 'Top Management',
    verificationMethod: 'Review meeting minutes, resource decisions, and communication records',
    relatedDocuments: ['Management Review Minutes', 'Resource Allocation Records', 'Communication Plan']
  },
  {
    id: 'ca-5.2-001',
    clause: '5.2',
    title: 'Develop and communicate quality policy',
    description: 'Create quality policy aligned with organizational context and communicate to all personnel',
    severity: 'high',
    actionSteps: [
      'Draft quality policy aligned with organizational purpose',
      'Ensure policy includes commitment to requirements and improvement',
      'Obtain top management approval',
      'Communicate policy to all employees through multiple channels',
      'Display policy in prominent locations',
      'Include policy in induction training',
      'Make policy available to interested parties'
    ],
    timeframe: '21 days',
    responsibleRole: 'Top Management / Quality Manager',
    verificationMethod: 'Review policy document, communication records, and employee awareness',
    relatedDocuments: ['Quality Policy', 'Communication Records', 'Training Materials']
  },
  {
    id: 'ca-5.3-001',
    clause: '5.3',
    title: 'Define roles and responsibilities',
    description: 'Document and communicate organizational roles, responsibilities, and authorities',
    severity: 'medium',
    actionSteps: [
      'Create organizational chart showing reporting structure',
      'Develop job descriptions for all QMS-related roles',
      'Create responsibility matrix (RACI chart)',
      'Appoint management representative for QMS',
      'Communicate assignments to all personnel',
      'Ensure understanding through training and acknowledgment'
    ],
    timeframe: '30 days',
    responsibleRole: 'HR Manager / Quality Manager',
    verificationMethod: 'Review organizational chart, job descriptions, and communication records',
    relatedDocuments: ['Organizational Chart', 'Job Descriptions', 'RACI Matrix', 'Appointment Letters']
  },

  // Planning (Clause 6.x)
  {
    id: 'ca-6.1-001',
    clause: '6.1',
    title: 'Conduct risk assessment and opportunity analysis',
    description: 'Identify and assess risks and opportunities affecting QMS objectives',
    severity: 'high',
    actionSteps: [
      'Establish risk assessment methodology (e.g., FMEA, risk matrix)',
      'Identify risks and opportunities for each process',
      'Assess likelihood and impact of each risk',
      'Develop mitigation plans for significant risks',
      'Develop action plans to pursue opportunities',
      'Integrate risk actions into QMS processes',
      'Schedule regular risk reviews'
    ],
    timeframe: '45 days',
    responsibleRole: 'Quality Manager / Process Owners',
    verificationMethod: 'Review risk register, mitigation plans, and effectiveness evaluations',
    relatedDocuments: ['Risk Register', 'FMEA', 'Mitigation Plans', 'Risk Review Records']
  },
  {
    id: 'ca-6.2-001',
    clause: '6.2',
    title: 'Establish SMART quality objectives',
    description: 'Define measurable quality objectives with action plans',
    severity: 'medium',
    actionSteps: [
      'Define quality objectives aligned with quality policy',
      'Ensure objectives are SMART (Specific, Measurable, Achievable, Relevant, Time-bound)',
      'Assign responsibility for each objective',
      'Develop action plans to achieve objectives',
      'Establish measurement methods and KPIs',
      'Communicate objectives to relevant personnel',
      'Track progress and report in management reviews'
    ],
    timeframe: '21 days',
    responsibleRole: 'Quality Manager / Department Heads',
    verificationMethod: 'Review objectives documentation, action plans, and progress tracking',
    relatedDocuments: ['Quality Objectives', 'KPI Dashboard', 'Action Plans', 'Progress Reports']
  },

  // Support (Clause 7.x)
  {
    id: 'ca-7.1-001',
    clause: '7.1',
    title: 'Allocate adequate resources for QMS',
    description: 'Assess and provide necessary resources for QMS effectiveness',
    severity: 'medium',
    actionSteps: [
      'Conduct resource needs assessment for QMS',
      'Identify gaps in current resource allocation',
      'Develop resource allocation plan with budget',
      'Obtain management approval for resources',
      'Procure or allocate identified resources',
      'Establish maintenance schedule for infrastructure',
      'Monitor resource adequacy regularly'
    ],
    timeframe: '60 days',
    responsibleRole: 'Top Management / Quality Manager',
    verificationMethod: 'Review resource allocation records and adequacy assessments',
    relatedDocuments: ['Resource Plan', 'Budget Approval', 'Maintenance Schedule']
  },
  {
    id: 'ca-7.2-001',
    clause: '7.2',
    title: 'Implement competency management system',
    description: 'Define competency requirements and ensure personnel competence',
    severity: 'high',
    actionSteps: [
      'Define competency requirements for each role',
      'Create competency matrix for all personnel',
      'Assess current competency levels',
      'Identify training needs and gaps',
      'Develop and implement training plan',
      'Evaluate training effectiveness',
      'Maintain competency records'
    ],
    timeframe: '45 days',
    responsibleRole: 'HR Manager / Quality Manager',
    verificationMethod: 'Review competency matrix, training records, and effectiveness evaluations',
    relatedDocuments: ['Competency Matrix', 'Training Plan', 'Training Records', 'Effectiveness Evaluations']
  },
  {
    id: 'ca-7.3-001',
    clause: '7.3',
    title: 'Conduct awareness training program',
    description: 'Ensure all personnel are aware of quality policy, objectives, and their role',
    severity: 'medium',
    actionSteps: [
      'Develop awareness training materials',
      'Include quality policy and objectives in induction',
      'Conduct awareness sessions for all personnel',
      'Communicate individual contributions to QMS effectiveness',
      'Explain implications of non-conformity',
      'Assess awareness through surveys or interviews',
      'Maintain training attendance records'
    ],
    timeframe: '30 days',
    responsibleRole: 'Quality Manager / HR Manager',
    verificationMethod: 'Review training records, attendance sheets, and awareness assessments',
    relatedDocuments: ['Training Materials', 'Attendance Records', 'Awareness Survey Results']
  },

  // Operation (Clause 8.x)
  {
    id: 'ca-8.1-001',
    clause: '8.1',
    title: 'Establish operational planning and control',
    description: 'Plan and control processes needed to meet product/service requirements',
    severity: 'high',
    actionSteps: [
      'Document all operational processes',
      'Define process criteria and acceptance criteria',
      'Establish process controls and monitoring',
      'Allocate resources for each process',
      'Define process inputs and outputs',
      'Implement process performance monitoring',
      'Maintain documented information as required'
    ],
    timeframe: '60 days',
    responsibleRole: 'Process Owners / Quality Manager',
    verificationMethod: 'Review process documentation, controls, and performance data',
    relatedDocuments: ['Process Maps', 'Work Instructions', 'Control Plans', 'Performance Reports']
  },

  // Performance Evaluation (Clause 9.x)
  {
    id: 'ca-9.1-001',
    clause: '9.1',
    title: 'Implement monitoring and measurement system',
    description: 'Establish methods to monitor, measure, analyze, and evaluate QMS performance',
    severity: 'high',
    actionSteps: [
      'Identify what needs to be monitored and measured',
      'Define monitoring and measurement methods',
      'Establish measurement frequency and timing',
      'Implement data collection systems',
      'Analyze and evaluate results',
      'Report findings to management',
      'Maintain records of monitoring results'
    ],
    timeframe: '45 days',
    responsibleRole: 'Quality Manager / Process Owners',
    verificationMethod: 'Review monitoring plan, measurement data, and analysis reports',
    relatedDocuments: ['Monitoring Plan', 'KPI Dashboard', 'Analysis Reports', 'Measurement Records']
  },
  {
    id: 'ca-9.2-001',
    clause: '9.2',
    title: 'Establish internal audit program',
    description: 'Implement systematic internal audit program covering all QMS areas',
    severity: 'high',
    actionSteps: [
      'Develop internal audit procedure',
      'Create annual audit schedule covering all QMS areas',
      'Train and qualify internal auditors',
      'Conduct audits according to schedule',
      'Document audit findings in reports',
      'Track corrective actions to closure',
      'Review audit program effectiveness'
    ],
    timeframe: '60 days',
    responsibleRole: 'Quality Manager / Lead Auditor',
    verificationMethod: 'Review audit schedule, reports, and corrective action records',
    relatedDocuments: ['Audit Procedure', 'Audit Schedule', 'Audit Reports', 'Corrective Action Log']
  },
  {
    id: 'ca-9.3-001',
    clause: '9.3',
    title: 'Conduct management review meetings',
    description: 'Establish regular management review process to evaluate QMS effectiveness',
    severity: 'high',
    actionSteps: [
      'Schedule management review meetings (minimum annually)',
      'Define management review agenda and inputs',
      'Collect required input data before meetings',
      'Conduct review with top management participation',
      'Document decisions and action items',
      'Assign responsibilities for actions',
      'Track action items to completion'
    ],
    timeframe: '30 days',
    responsibleRole: 'Top Management / Quality Manager',
    verificationMethod: 'Review meeting minutes, action items, and completion records',
    relatedDocuments: ['Management Review Procedure', 'Meeting Minutes', 'Action Item Log']
  },

  // Improvement (Clause 10.x)
  {
    id: 'ca-10.1-001',
    clause: '10.1',
    title: 'Implement improvement opportunities',
    description: 'Identify and implement opportunities for continual improvement',
    severity: 'medium',
    actionSteps: [
      'Establish process for identifying improvement opportunities',
      'Analyze data to identify improvement areas',
      'Prioritize improvements based on impact',
      'Develop improvement action plans',
      'Implement improvements systematically',
      'Evaluate effectiveness of improvements',
      'Share lessons learned across organization'
    ],
    timeframe: '90 days',
    responsibleRole: 'Quality Manager / Process Owners',
    verificationMethod: 'Review improvement register, action plans, and effectiveness evaluations',
    relatedDocuments: ['Improvement Register', 'Action Plans', 'Effectiveness Reports']
  },
  {
    id: 'ca-10.2-001',
    clause: '10.2',
    title: 'Establish nonconformity and corrective action process',
    description: 'Implement systematic process for handling nonconformities and corrective actions',
    severity: 'high',
    actionSteps: [
      'Develop nonconformity and corrective action procedure',
      'Implement nonconformity reporting system',
      'Define root cause analysis methodology',
      'Establish corrective action process',
      'Assign responsibilities for investigations',
      'Track corrective actions to closure',
      'Verify effectiveness of corrective actions'
    ],
    timeframe: '45 days',
    responsibleRole: 'Quality Manager',
    verificationMethod: 'Review procedure, nonconformity records, and corrective action effectiveness',
    relatedDocuments: ['CAPA Procedure', 'Nonconformity Log', 'Root Cause Analysis', 'Effectiveness Verification']
  }
];

/**
 * Get corrective action templates for a specific clause
 */
export function getTemplatesForClause(clause: string): CorrectiveActionTemplate[] {
  return CORRECTIVE_ACTION_TEMPLATES.filter(template => 
    template.clause === clause || template.clause.startsWith(clause + '.')
  );
}

/**
 * Get corrective action templates by severity
 */
export function getTemplatesBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): CorrectiveActionTemplate[] {
  return CORRECTIVE_ACTION_TEMPLATES.filter(template => template.severity === severity);
}

/**
 * Suggest corrective actions based on context
 */
export function suggestCorrectiveActions(
  clause: string,
  severity?: 'low' | 'medium' | 'high' | 'critical',
  keywords?: string[]
): CorrectiveActionSuggestion[] {
  const suggestions: CorrectiveActionSuggestion[] = [];

  // Get templates for the clause
  const clauseTemplates = getTemplatesForClause(clause);

  clauseTemplates.forEach(template => {
    let relevanceScore = 100; // Base score for matching clause
    let reason = `Recommended for ${clause}`;

    // Adjust score based on severity match
    if (severity && template.severity === severity) {
      relevanceScore += 50;
      reason += `, matches ${severity} severity`;
    } else if (severity) {
      relevanceScore -= 20;
    }

    // Adjust score based on keyword matches
    if (keywords && keywords.length > 0) {
      const matchCount = keywords.filter(keyword => 
        template.title.toLowerCase().includes(keyword.toLowerCase()) ||
        template.description.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      
      if (matchCount > 0) {
        relevanceScore += matchCount * 25;
        reason += `, matches search criteria`;
      }
    }

    suggestions.push({
      template,
      relevanceScore,
      reason
    });
  });

  // Sort by relevance score (highest first)
  return suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Get a specific template by ID
 */
export function getTemplateById(id: string): CorrectiveActionTemplate | undefined {
  return CORRECTIVE_ACTION_TEMPLATES.find(template => template.id === id);
}

/**
 * Search templates by keyword
 */
export function searchTemplates(query: string): CorrectiveActionTemplate[] {
  const lowerQuery = query.toLowerCase();
  return CORRECTIVE_ACTION_TEMPLATES.filter(template =>
    template.title.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.actionSteps.some(step => step.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Format corrective action template as text
 */
export function formatTemplateAsText(template: CorrectiveActionTemplate): string {
  return `
**${template.title}**

${template.description}

**Severity:** ${template.severity.toUpperCase()}
**Timeframe:** ${template.timeframe}
**Responsible:** ${template.responsibleRole}

**Action Steps:**
${template.actionSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

**Verification Method:**
${template.verificationMethod}

**Related Documents:**
${template.relatedDocuments.join(', ')}
  `.trim();
}

/**
 * Get quick action suggestions (top 3 most relevant)
 */
export function getQuickSuggestions(
  clause: string,
  severity?: 'low' | 'medium' | 'high' | 'critical'
): CorrectiveActionTemplate[] {
  const suggestions = suggestCorrectiveActions(clause, severity);
  return suggestions.slice(0, 3).map(s => s.template);
}
