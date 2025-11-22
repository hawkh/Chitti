/**
 * System Analytics API
 * GET /api/audit/system/analytics - Get usage analytics and performance reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/audit/middleware';
import { SystemMonitor } from '@/lib/audit/system-monitor';

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'usage';

    if (reportType === 'usage') {
      const analytics = await SystemMonitor.getUsageAnalytics();
      return NextResponse.json({
        success: true,
        data: analytics,
      });
    }

    if (reportType === 'performance') {
      const period = searchParams.get('period') || '24h';
      const endDate = new Date();
      let startDate = new Date();

      switch (period) {
        case '1h':
          startDate = new Date(endDate.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
      }

      const report = SystemMonitor.getPerformanceReport(startDate, endDate);
      return NextResponse.json({
        success: true,
        data: report,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid report type',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics',
      },
      { status: 500 }
    );
  }
});
