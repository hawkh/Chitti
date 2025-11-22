import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  getPDCACycleStatus,
  calculatePDCAMetrics,
  PDCAAuditSummary,
  PDCACycleStatus
} from '@/lib/audit/pdca-workflow';

const prisma = new PrismaClient();

/**
 * GET /api/audit/pdca/metrics
 * Get PDCA metrics across all sites or filtered by organization
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');

    // Build where clause
    const whereClause: any = {};
    if (organizationId) {
      whereClause.organizationId = organizationId;
    }

    // Fetch all sites
    const sites = await prisma.site.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        audits: {
          select: {
            id: true,
            pdcaStage: true,
            auditDate: true,
            status: true,
            complianceScore: true
          },
          orderBy: { auditDate: 'desc' }
        }
      }
    });

    // Calculate cycle status for each site
    const siteStatuses: PDCACycleStatus[] = sites.map(site => {
      const auditSummaries: PDCAAuditSummary[] = site.audits.map(audit => ({
        auditId: audit.id,
        stage: audit.pdcaStage.toLowerCase() as any,
        auditDate: audit.auditDate,
        status: audit.status.toLowerCase(),
        complianceScore: audit.complianceScore || undefined
      }));

      return getPDCACycleStatus(site.id, site.name, auditSummaries);
    });

    // Calculate overall metrics
    const metrics = calculatePDCAMetrics(siteStatuses);

    return NextResponse.json({
      metrics,
      siteStatuses: siteStatuses.map(status => ({
        siteId: status.siteId,
        siteName: status.siteName,
        progress: status.progress,
        isComplete: status.isComplete,
        currentStage: status.currentStage,
        completedStages: status.completedStages
      }))
    });
  } catch (error) {
    console.error('Error calculating PDCA metrics:', error);
    return NextResponse.json(
      { error: 'Failed to calculate PDCA metrics' },
      { status: 500 }
    );
  }
}
