// API Route: Assign Manager to Audit
import { NextRequest, NextResponse } from 'next/server';
import { SubmissionWorkflow } from '@/lib/audit/submission-workflow';
import { verifyAuth } from '@/lib/audit/middleware';

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

    // Only managers and admins can assign
    if (!['MANAGER', 'ADMIN'].includes(authResult.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { auditId, managerId } = body;

    if (!auditId || !managerId) {
      return NextResponse.json(
        { error: 'Audit ID and Manager ID are required' },
        { status: 400 }
      );
    }

    // Assign manager
    const result = await SubmissionWorkflow.assignManager(
      auditId,
      managerId,
      authResult.user.id,
      authResult.user.role
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Assign manager error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
