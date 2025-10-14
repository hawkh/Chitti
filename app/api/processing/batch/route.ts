import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { JobQueue } from '@/services/processing/JobQueue';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const userId = formData.get('userId') as string || 'anonymous';
    const modelId = formData.get('modelId') as string || process.env.DEFAULT_MODEL_ID;
    const priority = parseInt(formData.get('priority') as string) || 0;
    const configStr = formData.get('config') as string;

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: { message: 'No files provided', code: 'NO_FILES' }
      }, { status: 400 });
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Parse configuration
    let config = {};
    if (configStr) {
      try {
        config = JSON.parse(configStr);
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: { message: 'Invalid config format', code: 'INVALID_CONFIG' }
        }, { status: 400 });
      }
    }

    // Create detection job in database
    const job = await prisma.detectionJob.create({
      data: {
        userId,
        config,
        totalFiles: files.length,
        priority
      }
    });

    // Save files and create file records
    const savedFiles = [];
    for (const file of files) {
      const filename = `${uuidv4()}_${file.name}`;
      const filePath = path.join(UPLOAD_DIR, filename);
      
      // Save file to disk
      const bytes = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));

      // Create file record in database
      const fileRecord = await prisma.detectionFile.create({
        data: {
          jobId: job.id,
          originalName: file.name,
          filename,
          filePath,
          fileSize: file.size,
          mimeType: file.type
        }
      });

      savedFiles.push({
        id: fileRecord.id,
        filePath,
        originalName: file.name
      });
    }

    // Add job to processing queue
    const jobQueue = JobQueue.getInstance();
    await jobQueue.addDetectionJob({
      jobId: job.id,
      userId,
      modelId: modelId!,
      files: savedFiles
    }, priority);

    return NextResponse.json({
      success: true,
      data: {
        jobId: job.id,
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const userId = searchParams.get('userId');

    if (jobId) {
      // Get specific job status from database
      const job = await prisma.detectionJob.findUnique({
        where: { id: jobId },
        include: {
          files: {
            include: { result: true }
          },
          results: true
        }
      });
      
      if (!job) {
        return NextResponse.json({
          success: false,
          error: { message: 'Job not found', code: 'JOB_NOT_FOUND' }
        }, { status: 404 });
      }

      // Get queue status
      const jobQueue = JobQueue.getInstance();
      const queueStatus = await jobQueue.getJobStatus(jobId);

      return NextResponse.json({
        success: true,
        data: {
          id: job.id,
          status: job.status,
          progress: job.progress,
          totalFiles: job.totalFiles,
          processedFiles: job.processedFiles,
          createdAt: job.createdAt,
          startedAt: job.startedAt,
          completedAt: job.completedAt,
          error: job.error,
          files: job.files.map(f => ({
            id: f.id,
            originalName: f.originalName,
            status: f.status,
            result: f.result
          })),
          queueInfo: queueStatus
        },
        timestamp: new Date().toISOString()
      });
    } else {
      // Get all jobs for user
      const whereClause = userId ? { userId } : {};
      const jobs = await prisma.detectionJob.findMany({
        where: whereClause,
        include: {
          _count: {
            select: { files: true, results: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      // Get queue statistics
      const jobQueue = JobQueue.getInstance();
      const queueStats = await jobQueue.getQueueStats();

      return NextResponse.json({
        success: true,
        data: {
          jobs: jobs.map(job => ({
            id: job.id,
            status: job.status,
            progress: job.progress,
            filesCount: job._count.files,
            resultsCount: job._count.results,
            createdAt: job.createdAt,
            completedAt: job.completedAt,
            priority: job.priority
          })),
          queueStats
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: { message: 'Job ID is required', code: 'MISSING_JOB_ID' }
      }, { status: 400 });
    }

    // Check if job exists and can be cancelled
    const job = await prisma.detectionJob.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json({
        success: false,
        error: { message: 'Job not found', code: 'JOB_NOT_FOUND' }
      }, { status: 404 });
    }

    if (job.status === 'PROCESSING' || job.status === 'COMPLETED') {
      return NextResponse.json({
        success: false,
        error: { message: 'Job cannot be cancelled', code: 'CANCEL_FAILED' }
      }, { status: 400 });
    }

    // Cancel job in queue and database
    const jobQueue = JobQueue.getInstance();
    await jobQueue.cancelJob(jobId);

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