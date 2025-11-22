import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  getPDCACycleStatus,
  PDCAAuditSummary,
  PDCACycleStatus
} from '@/lib/audit/pdca-workflow';
import {
  generatePDCAAnalyticsReport,
  exportPDCAAnalyticsData
} from '@/lib/audit/pdca-analytics';

const prisma = new PrismaClient();

/**
 * GET /api/audit/pdca/analytics
 * Get comprehensive PDCA analytics and recommendations
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'json'; // json or export

    // Set default timeframe (last 90 days)
    const timeframeEnd = endDate ? new Date(endDate) : new Date();
    const timeframeStart = startDate 
      ? new Date(startDate)
      : new Date(timeframeEnd.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Build where clause
    const whereClause: any = {
      auditDate: {
        gte: timeframeStart,
        lte: timeframeEnd
      }
    };

    if (organizationId) {
      whereClause.site = {
        organizationId
      };
    }

    // Fetch all sites with audits in timeframe
    const sites = await prisma.site.findMany({
      where: organizationId ? { organizationId } : {},
      select: {
        id: true,
        name: true,
        audits: {
          where: whereClause,
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

    // Generate analytics report
    const report = generatePDCAAnalyticsReport(
      siteStatuses,
      { start: timeframeStart, end: timeframeEnd }
    );

    // Return in requested format
    if (format === 'export') {
      const exportData = exportPDCAAnalyticsData(report);
      return NextResponse.json(exportData);
    }

    return NextResponse.json({
      report,
      siteStatuses: siteStatuses.map(status => ({
        siteId: status.siteId,
        siteName: status.siteName,
        progress: status.progress,
        isComplete: status.isComplete,
        currentStage: status.currentStage,
        completedStages: status.completedStages,
        auditCount: status.auditsInCycle.length
      }))
    });
  } catch (error) {
    console.error('Error generating PDCA analytics:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDCA analytics' },
      { status: 500 }
    );
  }
}
