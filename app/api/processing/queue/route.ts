// Processing queue management API

import { NextRequest, NextResponse } from 'next/server';
import { ProcessingQueue } from '../../../../services/processing/ProcessingQueue';

// GET /api/processing/queue - Get queue statistics and status
export async function GET(request: NextRequest) {
  try {
    const queue = ProcessingQueue.getInstance();
    const stats = queue.getQueueStats();

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
        queue.pauseQueue();
        return NextResponse.json({
          success: true,
          message: 'Queue paused successfully'
        });

      case 'resume':
        queue.resumeQueue();
        return NextResponse.json({
          success: true,
          message: 'Queue resumed successfully'
        });

      case 'cleanup':
        const maxAge = options?.maxAge || 24 * 60 * 60 * 1000; // 24 hours default
        queue.cleanupOldJobs(maxAge);
        return NextResponse.json({
          success: true,
          message: 'Old jobs cleaned up successfully'
        });

      case 'updateOptions':
        if (options) {
          queue.updateOptions(options);
          return NextResponse.json({
            success: true,
            message: 'Queue options updated successfully'
          });
        } else {
          return NextResponse.json({
            success: false,
            error: {
              message: 'Options are required for updateOptions action',
              code: 'MISSING_OPTIONS'
            }
          }, { status: 400 });
        }

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