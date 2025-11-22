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
    const { comment, correctiveActions } = body;

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

    // Validate comment
    if (!comment || !comment.trim()) {
      return NextResponse.json(
        { error: 'Approval comment is required' },
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
        { error: 'Not authorized to approve this audit' },
        { status: 403 }
      );
    }

    // Transition to approved state
    const result = await WorkflowManager.transitionState(
      auditId,
      'APPROVED',
      decoded.userId,
      decoded.role,
      comment
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, details: result.errors },
        { status: 400 }
      );
    }

    // Update corrective actions if provided
    if (correctiveActions && Object.keys(correctiveActions).length > 0) {
      const updatePromises = Object.entries(correctiveActions).map(
        ([itemId, action]) =>
          prisma.auditResponse.updateMany({
            where: {
              auditId,
              itemId
            },
            data: {
              correctiveAction: action as string
            }
          })
      );

      await Promise.all(updatePromises);
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
          type: 'APPROVED',
          message: `Your audit has been approved by ${(decoded as any).name || decoded.email}`
        })
      });
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
      // Don't fail the approval if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Audit approved successfully',
      auditId,
      status: 'APPROVED'
    });
  } catch (error) {
    console.error('Error approving audit:', error);
    return NextResponse.json(
      { error: 'Failed to approve audit' },
      { status: 500 }
    );
  }
}
