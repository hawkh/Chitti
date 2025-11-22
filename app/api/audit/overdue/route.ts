// API Route: Get Overdue Audits
import { NextRequest, NextResponse } from 'next/server';
import { SubmissionWorkflow } from '@/lib/audit/submission-workflow';
import { verifyAuth } from '@/lib/audit/middleware';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only managers and admins can view overdue audits
    if (!['MANAGER', 'ADMIN'].includes(authResult.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId') || undefined;

    // Get overdue audits
    const audits = await SubmissionWorkflow.getOverdueAudits(managerId);

    return NextResponse.json({
      success: true,
      audits,
      count: audits.length,
    });
  } catch (error) {
    console.error('Get overdue audits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Escalate overdue audits (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can escalate
    if (authResult.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Escalate overdue audits
    const result = await SubmissionWorkflow.escalateOverdueAudits();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Escalate audits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
