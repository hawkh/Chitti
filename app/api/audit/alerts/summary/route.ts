// API Route: Alert Summary and Trends
// GET /api/audit/alerts/summary - Get alert summary statistics

import { NextRequest, NextResponse } from 'next/server';
import {
  getAlertSummary,
  getAlertTrends,
  getCriticalUnacknowledgedAlerts,
  AlertFilter
} from '@/lib/audit/alert-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build filter from query parameters
    const filter: AlertFilter = {};
    
    if (searchParams.has('siteId')) {
      filter.siteId = searchParams.get('siteId')!;
    }
    
    if (searchParams.has('dateFrom')) {
      filter.dateFrom = new Date(searchParams.get('dateFrom')!);
    }
    
    if (searchParams.has('dateTo')) {
      filter.dateTo = new Date(searchParams.get('dateTo')!);
    }
    
    const summary = getAlertSummary(filter);
    const trendDays = parseInt(searchParams.get('trendDays') || '30');
    const trends = getAlertTrends(trendDays);
    const criticalAlerts = getCriticalUnacknowledgedAlerts();
    
    return NextResponse.json({
      success: true,
      summary,
      trends,
      criticalAlerts
    });
  } catch (error) {
    console.error('Error fetching alert summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alert summary' },
      { status: 500 }
    );
  }
}
