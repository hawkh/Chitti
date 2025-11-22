// API Route: Executive Trend Summary
// GET /api/audit/trends/executive-summary - Get organization-wide trend summary

import { NextRequest, NextResponse } from 'next/server';
import {
  analyzeMultiSiteTrends,
  generateTrendExecutiveSummary,
  AuditHistoryRecord
} from '@/lib/audit/trend-integration';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || 'monthly') as any;
    const generateAlerts = searchParams.get('generateAlerts') !== 'false';

    // In production, fetch real sites and audit history from database
    // For now, generate mock data for multiple sites
    const mockSites = [
      { siteId: 'site-1', siteName: 'Manufacturing Plant A' },
      { siteId: 'site-2', siteName: 'Distribution Center B' },
      { siteId: 'site-3', siteName: 'Warehouse C' },
      { siteId: 'site-4', siteName: 'Production Facility D' }
    ];

    const sitesWithHistory = mockSites.map(site => ({
      ...site,
      auditHistory: generateMockAuditHistory(site.siteId, site.siteName)
    }));

    const siteResults = await analyzeMultiSiteTrends(sitesWithHistory, {
      period,
      generateAlerts
    });

    const executiveSummary = generateTrendExecutiveSummary(siteResults);

    return NextResponse.json({
      success: true,
      executiveSummary,
      siteResults: siteResults.map(site => ({
        siteId: site.siteId,
        siteName: site.siteName,
        currentScore: site.trendAnalysis.currentScore,
        trend: site.trendAnalysis.trend,
        alertCount: site.alerts.length,
        criticalAlertCount: site.alerts.filter((a: any) => a.severity === 'critical').length
      }))
    });
  } catch (error) {
    console.error('Error generating executive summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate executive summary' },
      { status: 500 }
    );
  }
}

// Mock data generator
function generateMockAuditHistory(siteId: string, siteName: string): AuditHistoryRecord[] {
  const history: AuditHistoryRecord[] = [];
  const baseScore = 70 + Math.random() * 20;
  const trendDirection = Math.random() > 0.5 ? 1 : -1;

  for (let i = 12; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);

    const variation = (Math.random() - 0.5) * 8;
    const trend = (12 - i) * 0.4 * trendDirection;
    const score = Math.max(60, Math.min(100, baseScore + variation + trend));

    const passedItems = Math.floor((score / 100) * 25);
    const failedItems = 25 - passedItems;
    const criticalFailures = score < 70 ? Math.floor(Math.random() * 2) : 0;

    history.push({
      id: `audit-${siteId}-${i}`,
      siteId,
      siteName,
      completedAt: date,
      complianceScore: {
        overallScore: score,
        sectionScores: {},
        passedItems,
        failedItems,
        naItems: 0,
        totalItems: 25,
        criticalFailures,
        highSeverityCount: Math.floor(failedItems * 0.3),
        mediumSeverityCount: Math.floor(failedItems * 0.5),
        lowSeverityCount: Math.floor(failedItems * 0.2),
        improvementAreas: [],
        calculatedAt: date
      }
    });
  }

  return history;
}
