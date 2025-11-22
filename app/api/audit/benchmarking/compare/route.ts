// API Route: Benchmarking and Site Comparison
// POST /api/audit/benchmarking/compare

import { NextRequest, NextResponse } from 'next/server';
import { 
  generateBenchmarkComparison,
  analyzePerformanceDistribution,
  identifyBestPractices,
  SitePerformanceData
} from '@/lib/audit/benchmarking-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sitesData, industryAverage } = body;

    if (!sitesData || !Array.isArray(sitesData)) {
      return NextResponse.json(
        { error: 'Invalid request: sitesData array required' },
        { status: 400 }
      );
    }

    // Convert date strings to Date objects
    const processedSitesData: SitePerformanceData[] = sitesData.map((site: any) => ({
      ...site,
      audits: site.audits.map((audit: any) => ({
        ...audit,
        auditDate: new Date(audit.auditDate),
        complianceScore: {
          ...audit.complianceScore,
          calculatedAt: new Date(audit.complianceScore.calculatedAt)
        }
      }))
    }));

    // Generate benchmark comparison
    const benchmarkComparison = generateBenchmarkComparison(
      processedSitesData,
      industryAverage
    );

    // Analyze performance distribution
    const distribution = analyzePerformanceDistribution(benchmarkComparison.sites);

    // Identify best practices from top performers
    const topPerformers = benchmarkComparison.sites
      .filter(site => site.currentScore >= 85)
      .slice(0, 3);
    const bestPractices = identifyBestPractices(topPerformers);

    return NextResponse.json({
      success: true,
      benchmarkComparison,
      distribution,
      bestPractices
    });
  } catch (error) {
    console.error('Error generating benchmark comparison:', error);
    return NextResponse.json(
      { error: 'Failed to generate benchmark comparison' },
      { status: 500 }
    );
  }
}
