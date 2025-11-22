import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/audit/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auditId = params.id;

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

    // Fetch audit with all related data
    const audit = await prisma.auditRecord.findUnique({
      where: { id: auditId },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            location: true
          }
        },
        inspector: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        responses: {
          orderBy: { createdAt: 'asc' }
        },
        evidence: {
          orderBy: { uploadedAt: 'asc' }
        },
        workflowHistory: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    // Check if manager is assigned to this audit
    if (decoded.role === 'MANAGER' && audit.managerId !== decoded.userId) {
      return NextResponse.json({ error: 'Not authorized to review this audit' }, { status: 403 });
    }

    // Calculate compliance score if not already calculated
    let complianceScore = audit.complianceScore;
    if (!complianceScore && audit.responses.length > 0) {
      const totalItems = audit.responses.length;
      const passedItems = audit.responses.filter(r => r.response === 'PASS_FAIL').length;
      const failedItems = audit.responses.filter(r => r.response === 'PASS_FAIL').length;
      const naItems = audit.responses.filter(r => r.response === 'PASS_FAIL_NA').length;
      const criticalFailures = audit.responses.filter(r => r.severity === 'CRITICAL').length;
      const highSeverityCount = audit.responses.filter(r => r.severity === 'HIGH').length;
      const mediumSeverityCount = audit.responses.filter(r => r.severity === 'MEDIUM').length;
      const lowSeverityCount = audit.responses.filter(r => r.severity === 'LOW').length;

      complianceScore = totalItems > 0 ? Math.round((passedItems / totalItems) * 100) : 0;

      // Update audit with calculated score
      await prisma.auditRecord.update({
        where: { id: auditId },
        data: { complianceScore }
      });
    }

    // Format responses for frontend
    const formattedResponses: Record<string, any> = {};
    audit.responses.forEach(response => {
      formattedResponses[response.itemId] = {
        itemId: response.itemId,
        response: response.response.toLowerCase().replace('_', ''),
        comments: response.comments,
        severity: response.severity?.toLowerCase(),
        evidenceIds: audit.evidence
          .filter(e => e.responseId === response.id)
          .map(e => e.id)
      };
    });

    // Format workflow comments
    const workflowComments = audit.comments.map(comment => ({
      id: comment.id,
      userId: comment.userId,
      userName: comment.user.name || comment.user.email,
      userRole: comment.user.role,
      comment: comment.comment,
      timestamp: comment.createdAt,
      action: comment.action
    }));

    // Calculate compliance score details
    const totalItems = audit.responses.length;
    const passedItems = audit.responses.filter(r => r.response === 'PASS_FAIL').length;
    const failedItems = audit.responses.filter(r => r.response === 'PASS_FAIL').length;
    const naItems = audit.responses.filter(r => r.response === 'PASS_FAIL_NA').length;
    const criticalFailures = audit.responses.filter(r => r.severity === 'CRITICAL').length;
    const highSeverityCount = audit.responses.filter(r => r.severity === 'HIGH').length;
    const mediumSeverityCount = audit.responses.filter(r => r.severity === 'MEDIUM').length;
    const lowSeverityCount = audit.responses.filter(r => r.severity === 'LOW').length;

    const detailedAudit = {
      id: audit.id,
      siteId: audit.siteId,
      siteName: audit.site.name,
      inspectorId: audit.inspectorId,
      inspectorName: audit.inspector.name || audit.inspector.email,
      managerId: audit.managerId,
      managerName: audit.manager?.name || audit.manager?.email,
      auditDate: audit.auditDate,
      shift: audit.shift,
      auditType: audit.auditType,
      pdcaStage: audit.pdcaStage,
      status: audit.status,
      submittedAt: audit.submittedAt,
      reviewedAt: audit.reviewedAt,
      approvedAt: audit.approvedAt,
      site: audit.site,
      inspector: audit.inspector,
      responses: formattedResponses,
      evidence: audit.evidence.map(e => ({
        id: e.id,
        filename: e.filename,
        fileType: e.fileType,
        url: e.url,
        thumbnailUrl: e.thumbnailUrl,
        responseId: e.responseId
      })),
      workflowComments,
      complianceScore: {
        overallScore: complianceScore || 0,
        passedItems,
        failedItems,
        naItems,
        totalItems,
        criticalFailures,
        highSeverityCount,
        mediumSeverityCount,
        lowSeverityCount,
        improvementAreas: [],
        calculatedAt: new Date()
      }
    };

    return NextResponse.json(detailedAudit);
  } catch (error) {
    console.error('Error fetching audit for review:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit details' },
      { status: 500 }
    );
  }
}
