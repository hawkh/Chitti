import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/audit/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
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

    const managerId = decoded.userId;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const siteId = searchParams.get('siteId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: any = {
      managerId
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (siteId && siteId !== 'all') {
      where.siteId = siteId;
    }

    // Fetch audits with related data
    const audits = await prisma.auditRecord.findMany({
      where,
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
        responses: {
          where: {
            severity: { in: ['HIGH', 'CRITICAL'] }
          },
          select: {
            id: true,
            severity: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' },
      take: limit
    });

    // Calculate days overdue for each audit
    const now = new Date();
    const auditsWithMetrics = audits.map(audit => {
      let daysOverdue = 0;
      if (audit.submittedAt && (audit.status === 'SUBMITTED' || audit.status === 'IN_REVIEW')) {
        const daysSinceSubmission = Math.floor(
          (now.getTime() - audit.submittedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        daysOverdue = Math.max(0, daysSinceSubmission - 2); // 2 day SLA
      }

      const criticalIssues = audit.responses.filter(r => r.severity === 'CRITICAL').length;
      const highIssues = audit.responses.filter(r => r.severity === 'HIGH').length;

      return {
        id: audit.id,
        siteId: audit.siteId,
        siteName: audit.site.name,
        siteLocation: audit.site.location,
        inspectorId: audit.inspectorId,
        inspectorName: audit.inspector.name || audit.inspector.email,
        auditDate: audit.auditDate.toISOString(),
        submittedAt: audit.submittedAt?.toISOString() || audit.createdAt.toISOString(),
        status: audit.status,
        pdcaStage: audit.pdcaStage,
        auditType: audit.auditType,
        complianceScore: audit.complianceScore,
        criticalIssues: criticalIssues + highIssues,
        daysOverdue: daysOverdue > 0 ? daysOverdue : undefined
      };
    });

    return NextResponse.json(auditsWithMetrics);
  } catch (error) {
    console.error('Error fetching manager audits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audits' },
      { status: 500 }
    );
  }
}
