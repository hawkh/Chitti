import { NextRequest, NextResponse } from 'next/server';
import {
  createImprovementPlan,
  addActionToPlan,
  calculatePlanProgress,
  ImprovementPlan
} from '@/lib/audit/improvement-action-service';

/**
 * GET /api/audit/improvement/plans
 * Retrieve improvement plans
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get('siteId');
    const status = searchParams.get('status');

    // Mock data - replace with actual database queries
    const mockPlans: ImprovementPlan[] = [
      {
        id: 'plan_001',
        siteId: 'site_001',
        siteName: 'Manufacturing Plant A',
        title: 'Q4 2025 Quality Improvement Initiative',
        description: 'Comprehensive quality improvement plan addressing key audit findings',
        pdcaCycle: {
          plan: [
            {
              id: 'imp_002',
              auditId: 'audit_002',
              siteId: 'site_001',
              siteName: 'Manufacturing Plant A',
              title: 'Enhance documentation control system',
              description: 'Implement digital document management system',
              pdcaStage: 'plan',
              priority: 'medium',
              status: 'planned',
              targetDate: new Date('2025-12-30'),
              relatedISOClause: '7.5.3',
              correctiveActions: ['Select software', 'Migrate documents', 'Train staff'],
              preventiveActions: ['Establish retention policies'],
              resourcesRequired: ['Software license', 'IT support'],
              createdAt: new Date('2025-11-10'),
              updatedAt: new Date('2025-11-15')
            }
          ],
          do: [
            {
              id: 'imp_001',
              auditId: 'audit_001',
              siteId: 'site_001',
              siteName: 'Manufacturing Plant A',
              title: 'Improve welding quality control process',
              description: 'Implement enhanced inspection procedures',
              pdcaStage: 'do',
              priority: 'high',
              status: 'in_progress',
              targetDate: new Date('2025-12-15'),
              relatedISOClause: '8.5.1',
              correctiveActions: ['Update procedures', 'Conduct training'],
              preventiveActions: ['Establish quarterly reviews'],
              resourcesRequired: ['Training materials', 'Equipment'],
              createdAt: new Date('2025-11-01'),
              updatedAt: new Date('2025-11-18')
            }
          ],
          check: [],
          act: []
        },
        startDate: new Date('2025-11-01'),
        targetCompletionDate: new Date('2026-01-31'),
        status: 'active',
        overallProgress: 25,
        followUpAudits: [
          {
            id: 'followup_001',
            improvementActionId: 'imp_001',
            originalAuditId: 'audit_001',
            siteId: 'site_001',
            siteName: 'Manufacturing Plant A',
            scheduledDate: new Date('2025-12-20'),
            status: 'scheduled',
            pdcaStage: 'check',
            focusAreas: ['Verify welding improvements'],
            createdAt: new Date('2025-11-15'),
            updatedAt: new Date('2025-11-15')
          }
        ],
        createdAt: new Date('2025-11-01'),
        updatedAt: new Date('2025-11-18')
      }
    ];

    // Apply filters
    let filteredPlans = mockPlans;
    
    if (siteId) {
      filteredPlans = filteredPlans.filter(p => p.siteId === siteId);
    }
    
    if (status) {
      filteredPlans = filteredPlans.filter(p => p.status === status);
    }

    return NextResponse.json({
      success: true,
      plans: filteredPlans,
      total: filteredPlans.length
    });
  } catch (error) {
    console.error('Error fetching improvement plans:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch improvement plans' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audit/improvement/plans
 * Create a new improvement plan
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      siteId,
      siteName,
      title,
      description,
      targetCompletionDate
    } = body;

    // Validate required fields
    if (!siteId || !siteName || !title || !description || !targetCompletionDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const plan = createImprovementPlan(
      siteId,
      siteName,
      title,
      description,
      new Date(targetCompletionDate)
    );

    // In production, save to database
    // await prisma.improvementPlan.create({ data: plan });

    return NextResponse.json({
      success: true,
      plan
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating improvement plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create improvement plan' },
      { status: 500 }
    );
  }
}
