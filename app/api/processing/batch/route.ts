// Batch processing API endpoint

import { NextRequest, NextResponse } from 'next/server';
import { ProcessingQueue } from '../../../../services/processing/ProcessingQueue';
import { DetectionConfig, ProcessingFile, MaterialType, DefectType } from '../../../../types';

// POST /api/processing/batch - Start batch processing
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const configStr = formData.get('config') as string;
    const userId = formData.get('userId') as string;
    const priority = parseInt(formData.get('priority') as string) || 0;

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'No files provided',
          code: 'NO_FILES'
        }
      }, { status: 400 });
    }

    // Parse detection configuration
    let config: DetectionConfig;
    try {
      config = configStr ? JSON.parse(configStr) : {
        componentType: { id: 'general', name: 'General', description: 'General detection', materialType: MaterialType.METAL, commonDefects: [] },
        sensitivity: 0.7,
        defectTypes: [DefectType.CRACK, DefectType.CORROSION],
        confidenceThreshold: 0.5
      };
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Invalid configuration format',
          code: 'INVALID_CONFIG'
        }
      }, { status: 400 });
    }

    // Convert files to ProcessingFile format
    const processingFiles: ProcessingFile[] = files.map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      status: 'pending',
      progress: 0,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    // Add job to processing queue
    const queue = ProcessingQueue.getInstance();
    const job = queue.addJob({
      userId,
      files: processingFiles,
      config,
      priority
    });
    const jobId = job.id;

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        filesCount: files.length,
        status: 'queued',
        message: 'Batch processing job created successfully'
      },
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('Batch processing error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to start batch processing',
        code: 'BATCH_PROCESSING_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

// GET /api/processing/batch - Get batch processing status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const userId = searchParams.get('userId');

    const queue = ProcessingQueue.getInstance();

    if (jobId) {
      // Get specific job status
      const job = queue.getJob(jobId);
      const status = job;
      
      if (!status) {
        return NextResponse.json({
          success: false,
          error: {
            message: 'Job not found',
            code: 'JOB_NOT_FOUND'
          }
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString()
      });
    } else {
      // Get all jobs (optionally filtered by user)
      const allJobs = queue.getAllJobs();
      const jobs = userId ? allJobs.filter(job => job.userId === userId) : allJobs;
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
          jobs: jobs.map(job => ({
            id: job.id,
            status: job.status,
            filesCount: job.files.length,
            progress: job.progress,
            createdAt: job.createdAt,
            startedAt: job.startedAt,
            completedAt: job.completedAt,
            priority: job.priority
          })),
          stats
        },
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Get batch status error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to get batch status',
        code: 'GET_STATUS_ERROR'
      }
    }, { status: 500 });
  }
}

// DELETE /api/processing/batch - Cancel batch processing
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Job ID is required',
          code: 'MISSING_JOB_ID'
        }
      }, { status: 400 });
    }

    const queue = ProcessingQueue.getInstance();
    const job = queue.getJob(jobId);

    if (!job) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Job not found',
          code: 'JOB_NOT_FOUND'
        }
      }, { status: 404 });
    }

    if (job.status === 'processing' || job.status === 'completed') {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Job cannot be cancelled',
          code: 'CANCEL_FAILED'
        }
      }, { status: 400 });
    }

    // Simple cancellation - just mark as cancelled
    job.status = 'cancelled' as any;

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        status: 'cancelled',
        message: 'Job cancelled successfully'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cancel batch error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to cancel batch processing',
        code: 'CANCEL_ERROR'
      }
    }, { status: 500 });
  }
}