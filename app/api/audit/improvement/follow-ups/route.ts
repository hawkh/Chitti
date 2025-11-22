import { NextRequest, NextResponse } from 'next/server';
import {
  scheduleFollowUpAudit,
  generateFollowUpRecommendations,
  FollowUpAudit
} from '@/lib/audit/improvement-action-service';
import { PDCAStage } from '@/types/audit-form.types';

/**
 * GET /api/audit/improvement/follow-ups
 * Retrieve follow-up audits with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get('siteId');
    const status = searchParams.get('status');
    const improvementActionId = searchParams.get('improvementActionId');
    const upcoming = searchParams.get('upcoming') === 'true';

    // Mock data - replace with actual database queries
    const mockFollowUps: FollowUpAudit[] = [
      {
        id: 'followup_001',
        improvementActionId: 'imp_001',
        originalAuditId: 'audit_001',
        siteId: 'site_001',
        siteName: 'Manufacturing Plant A',
        scheduledDate: new Date('2025-12-20'),
        status: 'scheduled',
        pdcaStage: 'check',
        focusAreas: [
          'Verify welding quality improvements',
          'Review training completion',
          'Assess procedure compliance'
        ],
        assignedInspector: 'user_003',
        assignedInspectorName: 'Mike Johnson',
        notes: 'Focus on sustainability of improvements',
        createdAt: new Date('2025-11-15'),
        updatedAt: new Date('2025-11-15')
      },
      {
        id: 'followup_002',
        improvementActionId: 'imp_002',
        originalAuditId: 'audit_002',
        siteId: 'site_001',
        siteName: 'Manufacturing Plant A',
        scheduledDate: new Date('2026-01-15'),
        status: 'scheduled',
        pdcaStage: 'check',
        focusAreas: [
          'Verify document management system implementation',
          'Review user adoption',
          'Assess document control effectiveness'
        ],
        assignedInspector: 'user_004',
        assignedInspectorName: 'Sarah Williams',
        createdAt: new Date('2025-11-18'),
        updatedAt: new Date('2025-11-18')
      }
    ];

    // Apply filters
    let filteredFollowUps = mockFollowUps;
    
    if (siteId) {
      filteredFollowUps = filteredFollowUps.filter(f => f.siteId === siteId);
    }
    
    if (status) {
      filteredFollowUps = filteredFollowUps.filter(f => f.status === status);
    }
    
    if (improvementActionId) {
      filteredFollowUps = filteredFollowUps.filter(f => f.improvementActionId === improvementActionId);
    }

    if (upcoming) {
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      filteredFollowUps = filteredFollowUps.filter(
        f => f.status === 'scheduled' && f.scheduledDate <= thirtyDaysFromNow
      );
    }

    // Sort by scheduled date
    filteredFollowUps.sort((a, b) => 
      a.scheduledDate.getTime() - b.scheduledDate.getTime()
    );

    return NextResponse.json({
      success: true,
      followUps: filteredFollowUps,
      total: filteredFollowUps.length
    });
  } catch (error) {
    console.error('Error fetching follow-up audits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch follow-up audits' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audit/improvement/follow-ups
 * Schedule a new follow-up audit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      improvementActionId,
      originalAuditId,
      siteId,
      siteName,
      scheduledDate,
      focusAreas,
      pdcaStage,
      assignedInspector,
      assignedInspectorName,
      notes
    } = body;

    // Validate required fields
    if (!improvementActionId || !originalAuditId || !siteId || !siteName || !scheduledDate || !focusAreas) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const followUp = scheduleFollowUpAudit(
      improvementActionId,
      originalAuditId,
      siteId,
      siteName,
      new Date(scheduledDate),
      focusAreas,
      (pdcaStage as PDCAStage) || 'check'
    );

    // Add optional fields
    if (assignedInspector) {
      followUp.assignedInspector = assignedInspector;
      followUp.assignedInspectorName = assignedInspectorName;
    }
    if (notes) {
      followUp.notes = notes;
    }

    // In production, save to database
    // await prisma.followUpAudit.create({ data: followUp });

    return NextResponse.json({
      success: true,
      followUp
    }, { status: 201 });
  } catch (error) {
    console.error('Error scheduling follow-up audit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to schedule follow-up audit' },
      { status: 500 }
    );
  }
}
