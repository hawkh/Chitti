/**
 * API Route: Enhanced Offline Sync
 * GET /api/audit/sync - Get sync queue statistics
 * POST /api/audit/sync - Trigger manual sync
 * DELETE /api/audit/sync - Clear sync queue
 */

import { NextRequest, NextResponse } from 'next/server';
import { EnhancedOfflineSyncManager } from '@/lib/audit/enhanced-offline-sync';
import { verifyAuth } from '@/lib/audit/middleware';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get queue statistics
    const stats = await EnhancedOfflineSyncManager.getQueueStats();

    return NextResponse.json({
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching sync stats:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch sync statistics' },
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

    const body = await request.json();
    const { action } = body;

    if (action === 'retry-failed') {
      // Retry failed items
      const report = await EnhancedOfflineSyncManager.retryFailed(authResult.user.id);
      
      return NextResponse.json({
        success: true,
        report,
      });
    }

    // Default: sync all
    const report = await EnhancedOfflineSyncManager.syncAll(authResult.user.id);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Error syncing data:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can clear the queue
    if (authResult.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await EnhancedOfflineSyncManager.clearQueue();

    return NextResponse.json({
      success: true,
      message: 'Sync queue cleared',
    });
  } catch (error) {
    console.error('Error clearing sync queue:', error);
    
    return NextResponse.json(
      { error: 'Failed to clear sync queue' },
      { status: 500 }
    );
  }
}
