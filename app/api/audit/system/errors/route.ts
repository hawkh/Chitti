/**
 * API Route: System Error Monitoring
 * GET /api/audit/system/errors - Get error statistics and history
 * POST /api/audit/system/errors/clear - Clear resolved errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { ErrorHandler, ErrorCategory, ErrorSeverity } from '@/lib/audit/error-handler';
import { verifyAuth } from '@/lib/audit/middleware';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can view system errors
    if (authResult.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as ErrorCategory | null;
    const severity = searchParams.get('severity') as ErrorSeverity | null;
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get error statistics
    const stats = ErrorHandler.getErrorStatistics();

    // Get error history with filters
    const errors = ErrorHandler.getErrorHistory({
      category: category || undefined,
      severity: severity || undefined,
      limit,
    });

    return NextResponse.json({
      stats,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching system errors:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch system errors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can clear errors
    if (authResult.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cleared = ErrorHandler.clearResolvedErrors();

    return NextResponse.json({
      success: true,
      clearedCount: cleared,
      message: `Cleared ${cleared} resolved errors`,
    });
  } catch (error) {
    console.error('Error clearing resolved errors:', error);
    
    return NextResponse.json(
      { error: 'Failed to clear resolved errors' },
      { status: 500 }
    );
  }
}
