import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/audit/auth';
import { 
  generateBenchmarkComparison, 
  analyzePerformanceDistribution,
  identifyBestPractices 
} from '@/lib/audit/benchmarking-service';

const prisma = new PrismaClient();

/**
 * GET /api/audit/analytics/comparison
 * Get detailed site comparison and benchmarking analytics
 */
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'month';
    const organizationId = searchParams.get('organizationId');

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Fetch all sites for the organization
    const sites = await prisma.site.findMany({
      where: organizationId ? { organizationId } : {},
      select: {
        id: true,
        name: true,
        location: true,
        organizationId: true
      }
    });

    // Fetch audits separately to avoid complex nested queries
    const audits = await prisma.auditRecord.findMany({
      where: {
        siteId: { in: sites.map(s => s.id) },
        status: { in: ['APPROVED', 'IN_REVIEW'] },
        submittedAt: { gte: startDate }
      },
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        siteId: true,
        auditDate: true,
        complianceScore: true,
        responses: {
          where: {
            severity: { in: ['HIGH', 'CRITICAL'] }
          },
          select: {
            severity: true,
            textResponse: true
          }
        }
      }
    });

    // Group audits by site
    const siteAuditsMap = new Map<string, typeof audits>();
    audits.forEach(audit => {
      if (!siteAuditsMap.has(audit.siteId)) {
        siteAuditsMap.set(audit.siteId, []);
      }
      siteAuditsMap.get(audit.siteId)!.push(audit);
    });

    // Transform data for benchmarking service
    const sitesData = sites.map(site => ({
      siteId: site.id,
      siteName: site.name,
      audits: (siteAuditsMap.get(site.id) || []).map(audit => ({
        id: audit.id,
        auditDate: audit.auditDate,
        complianceScore: {
          overallScore: audit.complianceScore || 0,
          sectionScores: {},
          passedItems: 0,
          failedItems: 0,
          naItems: 0,
          totalItems: 0,
          criticalFailures: audit.responses.filter((r: any) => r.severity === 'CRITICAL').length,
          highSeverityCount: audit.responses.filter((r: any) => r.severity === 'HIGH').length,
          mediumSeverityCount: 0,
          lowSeverityCount: 0,
          improvementAreas: [],
          calculatedAt: new Date()
        }
      }))
    }));

    // Generate comprehensive benchmark comparison
    const industryAverage = 78; // Mock industry average
    const benchmarkComparison = generateBenchmarkComparison(sitesData, industryAverage);

    // Analyze performance distribution
    const distribution = analyzePerformanceDistribution(benchmarkComparison.sites);

    // Identify best practices
    const topPerformers = benchmarkComparison.sites.slice(0, 3);
    const bestPractices = identifyBestPractices(topPerformers);

    // Calculate additional metrics
    const totalAudits = sitesData.reduce((sum, site) => sum + site.audits.length, 0);
    const avgAuditsPerSite = sitesData.length > 0 ? totalAudits / sitesData.length : 0;

    return NextResponse.json({
      ...benchmarkComparison,
      distribution,
      bestPractices,
      metrics: {
        totalSites: sites.length,
        totalAudits,
        avgAuditsPerSite: Math.round(avgAuditsPerSite * 10) / 10,
        timeframe,
        dateRange: {
          start: startDate.toISOString(),
          end: now.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error fetching comparison analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comparison analytics' },
      { status: 500 }
    );
  }
}
