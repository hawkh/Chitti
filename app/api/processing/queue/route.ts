// Processing queue management API

import { NextRequest, NextResponse } from 'next/server';
import { ProcessingQueue } from '../../../../services/processing/ProcessingQueue';

// GET /api/processing/queue - Get queue statistics and status
export async function GET(request: NextRequest) {
  try {
    const queue = ProcessingQueue.getInstance();
    const allJobs = queue.getAllJobs();
    const stats = {
      total: allJobs.length,
      queued: allJobs.filter(j => j.status === 'queued').length,
      processing: allJobs.filter(j => j.status === 'processing').length,
      completed: allJobs.filter(j => j.status === 'completed').length,
      failed: allJobs.filter(j => j.status === 'failed').length
    };

    return NextResponse.json({
      success: true,
      data: {
        stats,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get queue stats error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to get queue statistics',
        code: 'QUEUE_STATS_ERROR'
      }
    }, { status: 500 });
  }
}

// POST /api/processing/queue - Queue management actions
export async function POST(request: NextRequest) {
  try {
    const { action, options } = await request.json();
    const queue = ProcessingQueue.getInstance();

    switch (action) {
      case 'pause':
      case 'resume':
      case 'cleanup':
      case 'updateOptions':
        return NextResponse.json({
          success: true,
          message: `Action ${action} is not yet implemented`
        });

      default:
        return NextResponse.json({
          success: false,
          error: {
            message: 'Invalid action',
            code: 'INVALID_ACTION',
            supportedActions: ['pause', 'resume', 'cleanup', 'updateOptions']
          }
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Queue management error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Queue management action failed',
        code: 'QUEUE_ACTION_ERROR'
      }
    }, { status: 500 });
  }
}