import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedISOChecklist() {
  // Create ISO 9001 checklist
  const checklist = await prisma.iSOChecklist.create({
    data: {
      version: 'ISO 9001:2015',
      title: 'Quality Management System Audit',
      description: 'Standard audit checklist based on ISO 9001:2015 requirements',
      isActive: true,
      sections: {
        create: [
          {
            title: 'Context of the Organization',
            isoClause: '4.0',
            weight: 1.0,
            order: 1,
            items: {
              create: [
                {
                  question: 'Has the organization determined external and internal issues relevant to its purpose?',
                  isoReference: '4.1',
                  responseType: 'PASS_FAIL',
                  required: true,
                  helpText: 'Check if organization has documented analysis of internal/external factors affecting QMS',
                  correctiveActionTemplates: ['Document organizational context analysis', 'Conduct SWOT analysis'],
                  weight: 1.0,
                  order: 1
                },
                {
                  question: 'Are interested parties and their requirements identified and monitored?',
                  isoReference: '4.2',
                  responseType: 'PASS_FAIL',
                  required: true,
                  helpText: 'Verify stakeholder identification and requirement tracking',
                  correctiveActionTemplates: ['Create stakeholder register', 'Document stakeholder requirements'],
                  weight: 1.0,
                  order: 2
                }
              ]
            }
          },
          {
            title: 'Leadership',
            isoClause: '5.0',
            weight: 1.2,
            order: 2,
            items: {
              create: [
                {
                  question: 'Does top management demonstrate leadership and commitment to QMS?',
                  isoReference: '5.1.1',
                  responseType: 'PASS_FAIL',
                  required: true,
                  helpText: 'Evidence of management involvement in QMS activities',
                  correctiveActionTemplates: ['Document management review meetings', 'Create leadership commitment statement'],
                  weight: 1.2,
                  order: 1
                },
                {
                  question: 'Is the quality policy established, implemented and maintained?',
                  isoReference: '5.2.1',
                  responseType: 'PASS_FAIL',
                  required: true,
                  helpText: 'Check quality policy documentation and communication',
                  correctiveActionTemplates: ['Develop quality policy', 'Communicate policy to all staff'],
                  weight: 1.0,
                  order: 2
                }
              ]
            }
          },
          {
            title: 'Planning',
            isoClause: '6.0',
            weight: 1.1,
            order: 3,
            items: {
              create: [
                {
                  question: 'Are risks and opportunities identified and addressed?',
                  isoReference: '6.1',
                  responseType: 'PASS_FAIL',
                  required: true,
                  helpText: 'Risk assessment and mitigation planning evidence',
                  correctiveActionTemplates: ['Conduct risk assessment', 'Develop risk mitigation plans'],
                  weight: 1.2,
                  order: 1
                },
                {
                  question: 'Are quality objectives established and planned?',
                  isoReference: '6.2',
                  responseType: 'PASS_FAIL',
                  required: true,
                  helpText: 'Quality objectives should be measurable and monitored',
                  correctiveActionTemplates: ['Set SMART quality objectives', 'Create measurement plans'],
                  weight: 1.0,
                  order: 2
                }
              ]
            }
          },
          {
            title: 'Support',
            isoClause: '7.0',
            weight: 1.0,
            order: 4,
            items: {
              create: [
                {
                  question: 'Are adequate resources provided for QMS implementation?',
                  isoReference: '7.1.1',
                  responseType: 'PASS_FAIL',
                  required: true,
                  helpText: 'Check resource allocation for quality activities',
                  correctiveActionTemplates: ['Assess resource requirements', 'Allocate adequate resources'],
                  weight: 1.0,
                  order: 1
                },
                {
                  question: 'Is personnel competent for their assigned roles?',
                  isoReference: '7.2',
                  responseType: 'PASS_FAIL',
                  required: true,
                  helpText: 'Training records and competency assessments',
                  correctiveActionTemplates: ['Conduct competency assessment', 'Provide necessary training'],
                  weight: 1.1,
                  order: 2
                },
                {
                  question: 'Is documented information controlled and maintained?',
                  isoReference: '7.5',
                  responseType: 'PASS_FAIL',
                  required: true,
                  helpText: 'Document control procedures and version management',
                  correctiveActionTemplates: ['Implement document control system', 'Train staff on document procedures'],
                  weight: 1.0,
                  order: 3
                }
              ]
            }
          },
          {
            title: 'Operation',
            isoClause: '8.0',
            weight: 1.3,
            order: 5,
            items: {
              create: [
                {
                  question: 'Are operational processes planned and controlled?',
                  isoReference: '8.1',
                  responseType: 'PASS_FAIL',
                  required: true,
                  helpText: 'Process documentation and control measures',
                  correctiveActionTemplates: ['Document operational processes', 'Implement process controls'],
                  weight: 1.2,
                  order: 1
                },
                {
                  question: 'Are customer requirements determined and reviewed?',
                  isoReference: '8.2.2',
                  responseType: 'PASS_FAIL',
                  required: true,
                  helpText: 'Customer requirement analysis and review records',
                  correctiveActionTemplates: ['Establish customer requirement review process', 'Document customer communications'],
                  weight: 1.1,
                  order: 2
                },
                {
                  question: 'Is product/service design and development controlled?',
                  isoReference: '8.3',
                  responseType: 'PASS_FAIL_NA',
                  required: false,
                  helpText: 'Design controls if applicable to organization',
                  correctiveActionTemplates: ['Implement design control procedures', 'Conduct design reviews'],
                  weight: 1.0,
                  order: 3
                },
                {
                  question: 'Are externally provided processes controlled?',
                  isoReference: '8.4',
                  responseType: 'PASS_FAIL_NA',
                  required: false,
                  helpText: 'Supplier/outsourcing controls if applicable',
                  correctiveActionTemplates: ['Establish supplier evaluation criteria', 'Monitor supplier performance'],
                  weight: 1.0,
                  order: 4
                }
              ]
            }
          },
          {
            title: 'Performance Evaluation',
            isoClause: '9.0',
            weight: 1.2,
            order: 6,
            items: {
              create: [
                {
                  question: 'Is QMS performance monitored and measured?',
                  isoReference: '9.1',
                  responseType: 'PASS_FAIL',
                  required: true,
                  helpText: 'Performance indicators and measurement methods',
                  correctiveActionTemplates: ['Define performance indicators', 'Implement measurement systems'],
                  weight: 1.2,
                  order: 1
                },
                {
                  question: 'Are internal audits conducted at planned intervals?',
                  isoReference: '9.2',
                  responseType: 'PASS_FAIL',
                  required: true,
                  helpText: 'Internal audit program and records',
                  correctiveActionTemplates: ['Develop internal audit program', 'Train internal auditors'],
                  weight: 1.3,
                  order: 2
                },
                {
                  question: 'Are management reviews conducted at planned intervals?',
                  isoReference: '9.3',
                  responseType: 'PASS_FAIL',
                  required: true,
                  helpText: 'Management review meeting records and actions',
                  correctiveActionTemplates: ['Schedule regular management reviews', 'Document review outcomes'],
                  weight: 1.1,
                  order: 3
                }
              ]
            }
          },
          {
            title: 'Improvement',
            isoClause: '10.0',
            weight: 1.2,
            order: 7,
            items: {
              create: [
                {
                  question: 'Are nonconformities identified and corrected?',
                  isoReference: '10.2',
                  responseType: 'PASS_FAIL',
                  required: true,
                  helpText: 'Nonconformity handling and corrective action records',
                  correctiveActionTemplates: ['Implement nonconformity procedure', 'Train staff on corrective actions'],
                  weight: 1.3,
                  order: 1
                },
                {
                  question: 'Is the QMS continually improved?',
                  isoReference: '10.3',
                  responseType: 'PASS_FAIL',
                  required: true,
                  helpText: 'Evidence of continuous improvement activities',
                  correctiveActionTemplates: ['Establish improvement process', 'Track improvement initiatives'],
                  weight: 1.1,
                  order: 2
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('Created ISO checklist:', checklist.id);
}

async function seedSites() {
  const sites = await prisma.site.createMany({
    data: [
      {
        name: 'Manufacturing Plant A',
        location: 'Mumbai, Maharashtra',
        organizationId: 'org-1',
        timezone: 'Asia/Kolkata',
        contactInfo: {
          manager: 'Rajesh Kumar',
          phone: '+91-9876543210',
          email: 'rajesh@company.com'
        },
        certifications: ['ISO 9001:2015']
      },
      {
        name: 'Quality Lab B',
        location: 'Bangalore, Karnataka',
        organizationId: 'org-1',
        timezone: 'Asia/Kolkata',
        contactInfo: {
          manager: 'Priya Sharma',
          phone: '+91-9876543211',
          email: 'priya@company.com'
        },
        certifications: ['ISO 9001:2015', 'ISO 17025']
      },
      {
        name: 'Assembly Unit C',
        location: 'Chennai, Tamil Nadu',
        organizationId: 'org-1',
        timezone: 'Asia/Kolkata',
        contactInfo: {
          manager: 'Arjun Patel',
          phone: '+91-9876543212',
          email: 'arjun@company.com'
        },
        certifications: ['ISO 9001:2015']
      }
    ]
  });

  console.log('Created sites:', sites.count);
}

async function main() {
  try {
    await seedISOChecklist();
    await seedSites();
    console.log('ISO audit system seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});