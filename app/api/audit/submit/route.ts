// API Route: Submit Audit for Review
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

    const body = await request.json();
    const { auditId, managerId, autoAssign, comment, deadline } = body;

    if (!auditId) {
      return NextResponse.json(
        { error: 'Audit ID is required' },
        { status: 400 }
      );
    }

    // Submit audit
    const result = await SubmissionWorkflow.submitAudit(
      auditId,
      authResult.user.id,
      authResult.user.role,
      {
        managerId,
        autoAssign: autoAssign ?? true,
        comment,
        deadline: deadline ? new Date(deadline) : undefined,
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, details: result.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Submit audit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
