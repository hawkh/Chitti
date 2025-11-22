// ISO 9001:2015 Checklist Configuration
// This file defines the standard ISO 9001 audit checklist with 25 core items

export interface ISOChecklistItem {
  id: string;
  clauseRef: string;
  section: string;
  question: string;
  helpText: string;
  responseType: 'pass_fail_na' | 'numeric' | 'text';
  required: boolean;
  weight: number;
  correctiveActionTemplates: string[];
  evidenceRequired: boolean;
}

export interface ISOChecklistSection {
  id: string;
  title: string;
  clauseRange: string;
  items: ISOChecklistItem[];
}

export const ISO_9001_CHECKLIST: ISOChecklistSection[] = [
  {
    id: 'context',
    title: 'Context of the Organization',
    clauseRange: '4.1-4.4',
    items: [
      {
        id: 'ctx_001',
        clauseRef: '4.1',
        section: 'Understanding the Organization',
        question: 'Has the organization determined external and internal issues relevant to its purpose and strategic direction?',
        helpText: 'Check if documented analysis of internal/external factors exists (SWOT, PESTLE, etc.)',
        responseType: 'pass_fail_na',
        required: true,
        weight: 2,
        correctiveActionTemplates: [
          'Conduct SWOT analysis to identify internal and external factors',
          'Document organizational context in quality manual',
          'Review and update context analysis quarterly'
        ],
        evidenceRequired: true,
      },
      {
        id: 'ctx_002',
        clauseRef: '4.2',
        section: 'Interested Parties',
        question: 'Are interested parties and their requirements identified and monitored?',
        helpText: 'Verify stakeholder register exists with documented requirements',
        responseType: 'pass_fail_na',
        required: true,
        weight: 2,
        correctiveActionTemplates: [
          'Create stakeholder register with requirements',
          'Establish process for monitoring stakeholder needs',
          'Review stakeholder requirements annually'
        ],
        evidenceRequired: true,
      },
      {
        id: 'ctx_003',
        clauseRef: '4.3',
        section: 'QMS Scope',
        question: 'Is the scope of the QMS documented, maintained, and available?',
        helpText: 'Check for documented scope statement including boundaries and applicability',
        responseType: 'pass_fail_na',
        required: true,
        weight: 3,
        correctiveActionTemplates: [
          'Document QMS scope statement',
          'Define boundaries and exclusions clearly',
          'Make scope available to interested parties'
        ],
        evidenceRequired: true,
      },
      {
        id: 'ctx_004',
        clauseRef: '4.4',
        section: 'QMS Processes',
        question: 'Are QMS processes and their interactions documented and maintained?',
        helpText: 'Verify process map or turtle diagrams exist showing process interactions',
        responseType: 'pass_fail_na',
        required: true,
        weight: 3,
        correctiveActionTemplates: [
          'Create process map showing all QMS processes',
          'Document process interactions and sequences',
          'Define process inputs, outputs, and controls'
        ],
        evidenceRequired: true,
      },
    ],
  },
  {
    id: 'leadership',
    title: 'Leadership',
    clauseRange: '5.1-5.3',
    items: [
      {
        id: 'lead_001',
        clauseRef: '5.1',
        section: 'Leadership and Commitment',
        question: 'Does top management demonstrate leadership and commitment to the QMS?',
        helpText: 'Look for evidence of management involvement in QMS activities',
        responseType: 'pass_fail_na',
        required: true,
        weight: 3,
        correctiveActionTemplates: [
          'Schedule regular management review meetings',
          'Document management participation in QMS activities',
          'Establish management quality objectives'
        ],
        evidenceRequired: true,
      },
      {
        id: 'lead_002',
        clauseRef: '5.2',
        section: 'Quality Policy',
        question: 'Is the quality policy appropriate, documented, communicated, and available?',
        helpText: 'Verify quality policy statement exists and is accessible to all personnel',
        responseType: 'pass_fail_na',
        required: true,
        weight: 3,
        correctiveActionTemplates: [
          'Develop quality policy statement',
          'Communicate policy to all employees',
          'Display policy in visible locations'
        ],
        evidenceRequired: true,
      },
      {
        id: 'lead_003',
        clauseRef: '5.3',
        section: 'Roles and Responsibilities',
        question: 'Are organizational roles, responsibilities, and authorities assigned and communicated?',
        helpText: 'Check for documented job descriptions and organizational charts',
        responseType: 'pass_fail_na',
        required: true,
        weight: 2,
        correctiveActionTemplates: [
          'Create organizational chart with reporting lines',
          'Document roles and responsibilities for each position',
          'Communicate assignments to all personnel'
        ],
        evidenceRequired: true,
      },
    ],
  },
  {
    id: 'planning',
    title: 'Planning',
    clauseRange: '6.1-6.3',
    items: [
      {
        id: 'plan_001',
        clauseRef: '6.1',
        section: 'Risk and Opportunities',
        question: 'Are risks and opportunities identified, assessed, and addressed?',
        helpText: 'Verify risk register exists with mitigation plans',
        responseType: 'pass_fail_na',
        required: true,
        weight: 3,
        correctiveActionTemplates: [
          'Conduct risk assessment using FMEA or similar method',
          'Create risk register with mitigation actions',
          'Review and update risk assessment quarterly'
        ],
        evidenceRequired: true,
      },
      {
        id: 'plan_002',
        clauseRef: '6.2',
        section: 'Quality Objectives',
        question: 'Are quality objectives established, measurable, monitored, and communicated?',
        helpText: 'Check for documented SMART objectives with tracking metrics',
        responseType: 'pass_fail_na',
        required: true,
        weight: 3,
        correctiveActionTemplates: [
          'Establish SMART quality objectives',
          'Define measurement methods and targets',
          'Track and report objective progress monthly'
        ],
        evidenceRequired: true,
      },
      {
        id: 'plan_003',
        clauseRef: '6.3',
        section: 'Planning of Changes',
        question: 'Are changes to the QMS planned and implemented in a controlled manner?',
        helpText: 'Verify change management process exists and is followed',
        responseType: 'pass_fail_na',
        required: true,
        weight: 2,
        correctiveActionTemplates: [
          'Establish change management procedure',
          'Document all QMS changes with impact assessment',
          'Obtain approval before implementing changes'
        ],
        evidenceRequired: true,
      },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    clauseRange: '7.1-7.5',
    items: [
      {
        id: 'supp_001',
        clauseRef: '7.1',
        section: 'Resources',
        question: 'Are necessary resources for QMS determined and provided?',
        helpText: 'Check resource allocation for personnel, infrastructure, and environment',
        responseType: 'pass_fail_na',
        required: true,
        weight: 2,
        correctiveActionTemplates: [
          'Conduct resource needs assessment',
          'Allocate budget for QMS resources',
          'Document resource allocation decisions'
        ],
        evidenceRequired: false,
      },
      {
        id: 'supp_002',
        clauseRef: '7.2',
        section: 'Competence',
        question: 'Is personnel competence determined, ensured, and documented?',
        helpText: 'Verify training records and competency assessments exist',
        responseType: 'pass_fail_na',
        required: true,
        weight: 3,
        correctiveActionTemplates: [
          'Define competency requirements for each role',
          'Conduct training needs analysis',
          'Maintain training records and competency matrix'
        ],
        evidenceRequired: true,
      },
      {
        id: 'supp_003',
        clauseRef: '7.3',
        section: 'Awareness',
        question: 'Are personnel aware of quality policy, objectives, and their contribution?',
        helpText: 'Check for evidence of awareness training and communication',
        responseType: 'pass_fail_na',
        required: true,
        weight: 2,
        correctiveActionTemplates: [
          'Conduct quality awareness training sessions',
          'Display quality policy and objectives prominently',
          'Include QMS awareness in onboarding process'
        ],
        evidenceRequired: true,
      },
      {
        id: 'supp_004',
        clauseRef: '7.4',
        section: 'Communication',
        question: 'Are internal and external communications determined and implemented?',
        helpText: 'Verify communication plan exists covering what, when, and how',
        responseType: 'pass_fail_na',
        required: true,
        weight: 2,
        correctiveActionTemplates: [
          'Develop communication plan and matrix',
          'Establish communication channels and frequency',
          'Document communication records'
        ],
        evidenceRequired: false,
      },
      {
        id: 'supp_005',
        clauseRef: '7.5',
        section: 'Documented Information',
        question: 'Is documented information controlled, maintained, and protected?',
        helpText: 'Check document control procedure and records management',
        responseType: 'pass_fail_na',
        required: true,
        weight: 3,
        correctiveActionTemplates: [
          'Implement document control procedure',
          'Establish document approval and review process',
          'Maintain master list of controlled documents'
        ],
        evidenceRequired: true,
      },
    ],
  },
  {
    id: 'operation',
    title: 'Operation',
    clauseRange: '8.1-8.7',
    items: [
      {
        id: 'oper_001',
        clauseRef: '8.1',
        section: 'Operational Planning',
        question: 'Are processes needed for product/service provision planned and controlled?',
        helpText: 'Verify operational procedures and work instructions exist',
        responseType: 'pass_fail_na',
        required: true,
        weight: 3,
        correctiveActionTemplates: [
          'Document operational procedures',
          'Create work instructions for critical processes',
          'Establish process controls and monitoring'
        ],
        evidenceRequired: true,
      },
      {
        id: 'oper_002',
        clauseRef: '8.2',
        section: 'Customer Requirements',
        question: 'Are customer requirements determined, reviewed, and met?',
        helpText: 'Check contract review process and customer communication records',
        responseType: 'pass_fail_na',
        required: true,
        weight: 3,
        correctiveActionTemplates: [
          'Establish contract review procedure',
          'Document customer requirements clearly',
          'Verify capability to meet requirements before acceptance'
        ],
        evidenceRequired: true,
      },
      {
        id: 'oper_003',
        clauseRef: '8.3',
        section: 'Design and Development',
        question: 'Is design and development process controlled and documented? (if applicable)',
        helpText: 'Verify design control procedure with stages, reviews, and validation',
        responseType: 'pass_fail_na',
        required: false,
        weight: 2,
        correctiveActionTemplates: [
          'Establish design control procedure',
          'Define design stages with review gates',
          'Document design inputs, outputs, and validation'
        ],
        evidenceRequired: true,
      },
      {
        id: 'oper_004',
        clauseRef: '8.4',
        section: 'External Providers',
        question: 'Are external providers controlled and evaluated?',
        helpText: 'Check supplier evaluation, approval, and monitoring records',
        responseType: 'pass_fail_na',
        required: true,
        weight: 2,
        correctiveActionTemplates: [
          'Establish supplier evaluation criteria',
          'Maintain approved supplier list',
          'Conduct periodic supplier performance reviews'
        ],
        evidenceRequired: true,
      },
      {
        id: 'oper_005',
        clauseRef: '8.5',
        section: 'Production Control',
        question: 'Is production and service provision controlled and validated?',
        helpText: 'Verify production controls, monitoring, and validation activities',
        responseType: 'pass_fail_na',
        required: true,
        weight: 3,
        correctiveActionTemplates: [
          'Implement production control procedures',
          'Establish process monitoring and measurement',
          'Validate special processes requiring qualification'
        ],
        evidenceRequired: true,
      },
      {
        id: 'oper_006',
        clauseRef: '8.6',
        section: 'Release of Products',
        question: 'Are products/services released only after verification of requirements?',
        helpText: 'Check final inspection and release authorization records',
        responseType: 'pass_fail_na',
        required: true,
        weight: 3,
        correctiveActionTemplates: [
          'Establish product release procedure',
          'Define acceptance criteria clearly',
          'Maintain release authorization records'
        ],
        evidenceRequired: true,
      },
      {
        id: 'oper_007',
        clauseRef: '8.7',
        section: 'Nonconforming Outputs',
        question: 'Are nonconforming outputs identified, controlled, and corrected?',
        helpText: 'Verify nonconformance handling procedure and records',
        responseType: 'pass_fail_na',
        required: true,
        weight: 3,
        correctiveActionTemplates: [
          'Implement nonconformance control procedure',
          'Segregate and identify nonconforming products',
          'Document disposition decisions and actions'
        ],
        evidenceRequired: true,
      },
    ],
  },
  {
    id: 'performance',
    title: 'Performance Evaluation',
    clauseRange: '9.1-9.3',
    items: [
      {
        id: 'perf_001',
        clauseRef: '9.1',
        section: 'Monitoring and Measurement',
        question: 'Are QMS processes monitored, measured, analyzed, and evaluated?',
        helpText: 'Check for KPIs, metrics tracking, and performance analysis',
        responseType: 'pass_fail_na',
        required: true,
        weight: 3,
        correctiveActionTemplates: [
          'Define KPIs for critical processes',
          'Establish measurement and monitoring methods',
          'Analyze performance data regularly'
        ],
        evidenceRequired: true,
      },
      {
        id: 'perf_002',
        clauseRef: '9.2',
        section: 'Internal Audit',
        question: 'Are internal audits conducted at planned intervals?',
        helpText: 'Verify audit schedule, reports, and follow-up actions',
        responseType: 'pass_fail_na',
        required: true,
        weight: 3,
        correctiveActionTemplates: [
          'Develop annual internal audit schedule',
          'Train internal auditors',
          'Conduct audits and document findings'
        ],
        evidenceRequired: true,
      },
      {
        id: 'perf_003',
        clauseRef: '9.3',
        section: 'Management Review',
        question: 'Does top management review the QMS at planned intervals?',
        helpText: 'Check management review meeting minutes and action items',
        responseType: 'pass_fail_na',
        required: true,
        weight: 3,
        correctiveActionTemplates: [
          'Schedule management review meetings quarterly',
          'Prepare management review agenda and inputs',
          'Document decisions and action items'
        ],
        evidenceRequired: true,
      },
    ],
  },
  {
    id: 'improvement',
    title: 'Improvement',
    clauseRange: '10.1-10.3',
    items: [
      {
        id: 'impr_001',
        clauseRef: '10.1',
        section: 'General Improvement',
        question: 'Are opportunities for improvement identified and implemented?',
        helpText: 'Check for improvement initiatives and innovation projects',
        responseType: 'pass_fail_na',
        required: true,
        weight: 2,
        correctiveActionTemplates: [
          'Establish improvement suggestion system',
          'Conduct kaizen or improvement workshops',
          'Track and implement improvement opportunities'
        ],
        evidenceRequired: false,
      },
      {
        id: 'impr_002',
        clauseRef: '10.2',
        section: 'Nonconformity and Corrective Action',
        question: 'Are nonconformities addressed with corrective actions to prevent recurrence?',
        helpText: 'Verify CAPA system with root cause analysis and effectiveness checks',
        responseType: 'pass_fail_na',
        required: true,
        weight: 3,
        correctiveActionTemplates: [
          'Implement CAPA procedure with root cause analysis',
          'Document corrective actions and timelines',
          'Verify effectiveness of corrective actions'
        ],
        evidenceRequired: true,
      },
      {
        id: 'impr_003',
        clauseRef: '10.3',
        section: 'Continual Improvement',
        question: 'Does the organization continually improve QMS effectiveness?',
        helpText: 'Look for evidence of systematic improvement activities and results',
        responseType: 'pass_fail_na',
        required: true,
        weight: 2,
        correctiveActionTemplates: [
          'Establish continual improvement objectives',
          'Implement PDCA methodology systematically',
          'Track improvement metrics and trends'
        ],
        evidenceRequired: true,
      },
    ],
  },
];

// Helper functions
export function getAllChecklistItems(): ISOChecklistItem[] {
  return ISO_9001_CHECKLIST.flatMap(section => section.items);
}

export function getChecklistItemById(id: string): ISOChecklistItem | undefined {
  return getAllChecklistItems().find(item => item.id === id);
}

export function getChecklistItemByClause(clauseRef: string): ISOChecklistItem[] {
  return getAllChecklistItems().filter(item => item.clauseRef === clauseRef);
}

export function getTotalWeight(): number {
  return getAllChecklistItems().reduce((sum, item) => sum + item.weight, 0);
}

export function getRequiredItems(): ISOChecklistItem[] {
  return getAllChecklistItems().filter(item => item.required);
}

export function getSectionByClause(clauseRef: string): ISOChecklistSection | undefined {
  return ISO_9001_CHECKLIST.find(section => {
    const [start, end] = section.clauseRange.split('-').map(parseFloat);
    const clause = parseFloat(clauseRef);
    return clause >= start && clause <= end;
  });
}
