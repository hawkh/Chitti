import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/audit/auth';
import WorkflowManager from '@/lib/audit/workflow-manager';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auditId = params.id;
    const body = await request.json();
    const { feedback } = body;

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded || (decoded.role !== 'MANAGER' && decoded.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate feedback
    if (!feedback || !feedback.trim()) {
      return NextResponse.json(
        { error: 'Rejection feedback is required' },
        { status: 400 }
      );
    }

    // Get audit
    const audit = await prisma.auditRecord.findUnique({
      where: { id: auditId },
      select: { status: true, managerId: true }
    });

    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    // Check if manager is assigned
    if (decoded.role === 'MANAGER' && audit.managerId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Not authorized to reject this audit' },
        { status: 403 }
      );
    }

    // Transition to rejected state
    const result = await WorkflowManager.transitionState(
      auditId,
      'REJECTED',
      decoded.userId,
      decoded.role,
      feedback
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, details: result.errors },
        { status: 400 }
      );
    }

    // Send notification to inspector
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/audit/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader
        },
        body: JSON.stringify({
          auditId,
          type: 'REJECTED',
          message: `Your audit has been rejected. Feedback: ${feedback}`
        })
      });
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
      // Don't fail the rejection if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Audit rejected successfully',
      auditId,
      status: 'REJECTED'
    });
  } catch (error) {
    console.error('Error rejecting audit:', error);
    return NextResponse.json(
      { error: 'Failed to reject audit' },
      { status: 500 }
    );
  }
}
