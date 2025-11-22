// API Route: Site-Specific Trend Analysis
// GET /api/audit/trends/site/[siteId] - Get comprehensive trend analysis for a site

import { NextRequest, NextResponse } from 'next/server';
import { analyzeSiteTrends, AuditHistoryRecord } from '@/lib/audit/trend-integration';

export async function GET(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || 'monthly') as any;
    const forecastPeriods = parseInt(searchParams.get('forecastPeriods') || '3');
    const forecastMethod = (searchParams.get('forecastMethod') || 'linear') as any;
    const generateAlerts = searchParams.get('generateAlerts') !== 'false';

    // In production, fetch real audit history from database
    // For now, generate mock data
    const mockAuditHistory = generateMockAuditHistory(params.siteId);

    const result = await analyzeSiteTrends(
      params.siteId,
      mockAuditHistory[0]?.siteName || 'Unknown Site',
      mockAuditHistory,
      {
        period,
        forecastPeriods,
        forecastMethod,
        generateAlerts
      }
    );

    return NextResponse.json({
      success: true,
      siteId: params.siteId,
      ...result
    });
  } catch (error) {
    console.error('Error analyzing site trends:', error);
    return NextResponse.json(
      { error: 'Failed to analyze site trends' },
      { status: 500 }
    );
  }
}

// Mock data generator for demonstration
function generateMockAuditHistory(siteId: string): AuditHistoryRecord[] {
  const history: AuditHistoryRecord[] = [];
  const baseScore = 75 + Math.random() * 15;
  const siteName = `Site ${siteId.split('-')[1] || 'A'}`;

  for (let i = 12; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);

    const variation = (Math.random() - 0.5) * 10;
    const trend = i * 0.3; // Slight upward trend
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
