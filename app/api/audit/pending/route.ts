// API Route: Get Pending Audits for Manager
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

    // Only managers and admins can view pending audits
    if (!['MANAGER', 'ADMIN'].includes(authResult.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId') || authResult.user.id;

    // Get pending audits
    const audits = await SubmissionWorkflow.getPendingAudits(managerId);

    return NextResponse.json({
      success: true,
      audits,
      count: audits.length,
    });
  } catch (error) {
    console.error('Get pending audits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
