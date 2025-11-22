import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/audit/auth';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

// GET - Fetch evidence details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const evidenceId = params.id;

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch evidence
    const evidence = await prisma.evidenceRecord.findUnique({
      where: { id: evidenceId },
      include: {
        audit: {
          select: {
            id: true,
            inspectorId: true,
            managerId: true
          }
        }
      }
    });

    if (!evidence) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
    }

    // Check permissions
    const isAuthorized = 
      evidence.audit.inspectorId === decoded.userId ||
      evidence.audit.managerId === decoded.userId ||
      decoded.role === 'ADMIN';

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      id: evidence.id,
      filename: evidence.filename,
      originalName: evidence.originalName,
      fileType: evidence.fileType,
      url: evidence.url,
      thumbnailUrl: evidence.thumbnailUrl,
      fileSize: evidence.fileSize,
      uploadedAt: evidence.uploadedAt,
      metadata: evidence.metadata
    });
  } catch (error) {
    console.error('Error fetching evidence:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evidence' },
      { status: 500 }
    );
  }
}

// DELETE - Delete evidence
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const evidenceId = params.id;

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch evidence
    const evidence = await prisma.evidenceRecord.findUnique({
      where: { id: evidenceId },
      include: {
        audit: {
          select: {
            id: true,
            inspectorId: true,
            managerId: true,
            status: true
          }
        }
      }
    });

    if (!evidence) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
    }

    // Check permissions - only inspector can delete, and only if audit is not approved
    const isInspector = evidence.audit.inspectorId === decoded.userId;
    const isNotApproved = evidence.audit.status !== 'APPROVED';

    if (!isInspector || !isNotApproved) {
      return NextResponse.json(
        { error: 'Cannot delete evidence from approved audits' },
        { status: 403 }
      );
    }

    // Delete file from disk
    const filepath = join(process.cwd(), 'public', evidence.url);
    if (existsSync(filepath)) {
      try {
        await unlink(filepath);
      } catch (err) {
        console.error('Failed to delete file:', err);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    await prisma.evidenceRecord.delete({
      where: { id: evidenceId }
    });

    return NextResponse.json({
      success: true,
      message: 'Evidence deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting evidence:', error);
    return NextResponse.json(
      { error: 'Failed to delete evidence' },
      { status: 500 }
    );
  }
}
