import { NextRequest, NextResponse } from 'next/server';
import {
  createImprovementAction,
  getImprovementDashboard,
  ImprovementAction,
  FollowUpAudit,
  EffectivenessMetrics
} from '@/lib/audit/improvement-action-service';

/**
 * GET /api/audit/improvement/actions
 * Retrieve improvement actions with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get('siteId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const pdcaStage = searchParams.get('pdcaStage');
    const includeDashboard = searchParams.get('includeDashboard') === 'true';

    // Mock data - replace with actual database queries
    const mockActions: ImprovementAction[] = [
      {
        id: 'imp_001',
        auditId: 'audit_001',
        siteId: 'site_001',
        siteName: 'Manufacturing Plant A',
        title: 'Improve welding quality control process',
        description: 'Implement enhanced inspection procedures for welding operations',
        rootCause: 'Inadequate training and outdated procedures',
        pdcaStage: 'do',
        priority: 'high',
        status: 'in_progress',
        assignedTo: 'user_001',
        assignedToName: 'John Smith',
        targetDate: new Date('2025-12-15'),
        relatedISOClause: '8.5.1',
        correctiveActions: [
          'Update welding procedures to latest standards',
          'Conduct refresher training for all welders',
          'Implement daily quality checks'
        ],
        preventiveActions: [
          'Establish quarterly procedure reviews',
          'Create ongoing training program'
        ],
        resourcesRequired: ['Training materials', 'Updated equipment', 'Quality inspection tools'],
        estimatedCost: 15000,
        createdAt: new Date('2025-11-01'),
        updatedAt: new Date('2025-11-18')
      },
      {
        id: 'imp_002',
        auditId: 'audit_002',
        siteId: 'site_001',
        siteName: 'Manufacturing Plant A',
        title: 'Enhance documentation control system',
        description: 'Implement digital document management system',
        rootCause: 'Paper-based system prone to errors and delays',
        pdcaStage: 'plan',
        priority: 'medium',
        status: 'planned',
        assignedTo: 'user_002',
        assignedToName: 'Jane Doe',
        targetDate: new Date('2025-12-30'),
        relatedISOClause: '7.5.3',
        correctiveActions: [
          'Select and procure document management software',
          'Migrate existing documents to digital system',
          'Train staff on new system'
        ],
        preventiveActions: [
          'Establish document retention policies',
          'Implement version control procedures'
        ],
        resourcesRequired: ['Software license', 'IT support', 'Training time'],
        estimatedCost: 25000,
        createdAt: new Date('2025-11-10'),
        updatedAt: new Date('2025-11-15')
      }
    ];

    // Apply filters
    let filteredActions = mockActions;
    
    if (siteId) {
      filteredActions = filteredActions.filter(a => a.siteId === siteId);
    }
    
    if (status) {
      filteredActions = filteredActions.filter(a => a.status === status);
    }
    
    if (priority) {
      filteredActions = filteredActions.filter(a => a.priority === priority);
    }
    
    if (pdcaStage) {
      filteredActions = filteredActions.filter(a => a.pdcaStage === pdcaStage);
    }

    if (includeDashboard) {
      // Mock follow-ups and effectiveness metrics
      const mockFollowUps: FollowUpAudit[] = [];
      const mockEffectiveness: EffectivenessMetrics[] = [];
      
      const dashboard = getImprovementDashboard(
        mockActions,
        mockFollowUps,
        mockEffectiveness
      );

      return NextResponse.json({
        success: true,
        actions: filteredActions,
        dashboard
      });
    }

    return NextResponse.json({
      success: true,
      actions: filteredActions,
      total: filteredActions.length
    });
  } catch (error) {
    console.error('Error fetching improvement actions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch improvement actions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audit/improvement/actions
 * Create a new improvement action
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      auditId,
      siteId,
      siteName,
      title,
      description,
      rootCause,
      pdcaStage,
      priority,
      assignedTo,
      assignedToName,
      targetDate,
      relatedISOClause,
      correctiveActions,
      preventiveActions,
      resourcesRequired,
      estimatedCost
    } = body;

    // Validate required fields
    if (!auditId || !siteId || !siteName || !title || !description || !pdcaStage || !priority || !targetDate || !relatedISOClause) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const action = createImprovementAction({
      auditId,
      siteId,
      siteName,
      title,
      description,
      rootCause,
      pdcaStage,
      priority,
      status: 'planned',
      assignedTo,
      assignedToName,
      targetDate: new Date(targetDate),
      relatedISOClause,
      correctiveActions: correctiveActions || [],
      preventiveActions: preventiveActions || [],
      resourcesRequired: resourcesRequired || [],
      estimatedCost
    });

    // In production, save to database
    // await prisma.improvementAction.create({ data: action });

    return NextResponse.json({
      success: true,
      action
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating improvement action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create improvement action' },
      { status: 500 }
    );
  }
}
