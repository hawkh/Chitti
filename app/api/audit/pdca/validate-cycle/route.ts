import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  validatePDCACycle,
  PDCAAuditSummary
} from '@/lib/audit/pdca-workflow';

const prisma = new PrismaClient();

/**
 * POST /api/audit/pdca/validate-cycle
 * Validate PDCA cycle completion for a site
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { siteId } = body;

    if (!siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }

    // Fetch all audits for the site
    const audits = await prisma.auditRecord.findMany({
      where: { siteId },
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

    // Validate cycle
    const validation = validatePDCACycle(auditSummaries);

    return NextResponse.json(validation);
  } catch (error) {
    console.error('Error validating PDCA cycle:', error);
    return NextResponse.json(
      { error: 'Failed to validate PDCA cycle' },
      { status: 500 }
    );
  }
}
