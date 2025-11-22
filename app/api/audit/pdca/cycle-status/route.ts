import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  getPDCACycleStatus,
  PDCAAuditSummary
} from '@/lib/audit/pdca-workflow';

const prisma = new PrismaClient();

/**
 * GET /api/audit/pdca/cycle-status
 * Get PDCA cycle status for a site
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get('siteId');

    if (!siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }

    // Fetch site information
    const site = await prisma.site.findUnique({
      where: { id: siteId }
    });

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Fetch all audits for the site
    const audits = await prisma.auditRecord.findMany({
      where: { siteId },
      orderBy: { auditDate: 'desc' },
      select: {
        id: true,
        pdcaStage: true,
        auditDate: true,
        status: true,
        complianceScore: true
      }
    });

    // Convert to PDCAAuditSummary format
    const auditSummaries: PDCAAuditSummary[] = audits.map(audit => ({
      auditId: audit.id,
      stage: audit.pdcaStage.toLowerCase() as any,
      auditDate: audit.auditDate,
      status: audit.status.toLowerCase(),
      complianceScore: audit.complianceScore || undefined
    }));

    // Calculate cycle status
    const cycleStatus = getPDCACycleStatus(
      site.id,
      site.name,
      auditSummaries
    );

    return NextResponse.json(cycleStatus);
  } catch (error) {
    console.error('Error fetching PDCA cycle status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PDCA cycle status' },
      { status: 500 }
    );
  }
}
