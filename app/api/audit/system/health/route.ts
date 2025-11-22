/**
 * System Health Monitoring API
 * GET /api/audit/system/health - Get current system health status
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/audit/middleware';
import { SystemMonitor } from '@/lib/audit/system-monitor';
import { ErrorHandler } from '@/lib/audit/error-handler';

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const health = await SystemMonitor.getSystemHealth();
    const errorStats = ErrorHandler.getErrorStatistics();
    const realTimeMetrics = SystemMonitor.getRealTimeMetrics();

    return NextResponse.json({
      success: true,
      data: {
        health,
        errorStats,
        realTimeMetrics,
      },
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch system health',
      },
      { status: 500 }
    );
  }
});
