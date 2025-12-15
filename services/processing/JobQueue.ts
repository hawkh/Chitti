/**
 * JobQueue - In-memory job queue for defect detection
 * 
 * Note: Bull/Redis-based queue removed due to Turbopack compatibility issues.
 * This provides a simple in-memory alternative suitable for serverless deployments.
 * For production with high load, consider using a managed queue service like
 * AWS SQS, Google Cloud Tasks, or running a separate worker process.
 */

import { prisma } from '@/lib/database';
import { ScalableModelManager } from '../ai/ScalableModelManager';
import { WebSocketManager } from '../websocket/WebSocketManager';
import { JobStatus, FileStatus } from '@prisma/client';
import { readFile } from 'fs/promises';

interface DetectionJobData {
  jobId: string;
  userId: string;
  modelId: string;
  files: Array<{
    id: string;
    filePath: string;
    originalName: string;
  }>;
}

interface QueuedJob {
  id: string;
  data: DetectionJobData;
  priority: number;
  attempts: number;
  maxAttempts: number;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  createdAt: Date;
  processedOn?: Date;
  finishedOn?: Date;
  failedReason?: string;
  progress: number;
}

export class JobQueue {
  private static instance: JobQueue;
  private jobs: Map<string, QueuedJob> = new Map();
  private modelManager: ScalableModelManager;
  private wsManager: WebSocketManager;
  private isProcessing: boolean = false;

  private constructor() {
    this.modelManager = ScalableModelManager.getInstance();
    this.wsManager = WebSocketManager.getInstance();
  }

  static getInstance(): JobQueue {
    if (!JobQueue.instance) {
      JobQueue.instance = new JobQueue();
    }
    return JobQueue.instance;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Get waiting jobs sorted by priority
      const waitingJobs = Array.from(this.jobs.values())
        .filter(job => job.status === 'waiting')
        .sort((a, b) => b.priority - a.priority);

      for (const queuedJob of waitingJobs) {
        await this.processJob(queuedJob);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processJob(queuedJob: QueuedJob): Promise<void> {
    const { jobId, userId, modelId, files } = queuedJob.data;

    queuedJob.status = 'active';
    queuedJob.processedOn = new Date();

    try {
      // Update job status to processing
      await prisma.detectionJob.update({
        where: { id: jobId },
        data: {
          status: JobStatus.PROCESSING,
          startedAt: new Date()
        }
      });

      // Broadcast job started
      this.wsManager.broadcastJobProgress(jobId, 0, 'processing', { message: 'Job started' });

      let processedFiles = 0;
      const totalFiles = files.length;

      for (const file of files) {
        try {
          // Update file status
          await prisma.detectionFile.update({
            where: { id: file.id },
            data: { status: FileStatus.PROCESSING }
          });

          // Read file buffer
          const imageBuffer = await readFile(file.filePath);

          // Run detection
          const result = await this.modelManager.detectDefects(modelId, imageBuffer);

          // Save result to database
          await prisma.detectionResult.create({
            data: {
              jobId,
              fileId: file.id,
              overallStatus: result.overallStatus,
              processingTime: result.processingTime,
              defectsFound: result.defects.length,
              confidence: result.defects.length > 0
                ? result.defects.reduce((sum, d) => sum + d.confidence, 0) / result.defects.length
                : 1.0,
              detections: result.detectedDefects as any
            }
          });

          // Update file status
          await prisma.detectionFile.update({
            where: { id: file.id },
            data: {
              status: FileStatus.COMPLETED,
              processedAt: new Date()
            }
          });

          processedFiles++;

          // Update job progress
          const progress = (processedFiles / totalFiles) * 100;
          await prisma.detectionJob.update({
            where: { id: jobId },
            data: {
              progress,
              processedFiles
            }
          });

          // Update queue progress
          queuedJob.progress = progress;

          // Broadcast progress update
          this.wsManager.broadcastJobProgress(jobId, progress, 'processing', {
            processedFiles,
            totalFiles,
            currentFile: file.originalName
          });

        } catch (fileError) {
          console.error(`Error processing file ${file.id}:`, fileError);

          // Mark file as failed
          await prisma.detectionFile.update({
            where: { id: file.id },
            data: { status: FileStatus.FAILED }
          });
        }
      }

      // Complete job
      await prisma.detectionJob.update({
        where: { id: jobId },
        data: {
          status: JobStatus.COMPLETED,
          completedAt: new Date(),
          progress: 100
        }
      });

      queuedJob.status = 'completed';
      queuedJob.finishedOn = new Date();
      queuedJob.progress = 100;

      // Broadcast job completion
      this.wsManager.broadcastJobCompleted(jobId, { processedFiles, totalFiles });

      console.log(`Job ${jobId} completed: ${processedFiles}/${totalFiles} files processed`);

    } catch (error) {
      console.error(`Job ${jobId} failed:`, error);

      queuedJob.status = 'failed';
      queuedJob.finishedOn = new Date();
      queuedJob.failedReason = error instanceof Error ? error.message : 'Unknown error';
      queuedJob.attempts++;

      // Mark job as failed
      await prisma.detectionJob.update({
        where: { id: jobId },
        data: {
          status: JobStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date()
        }
      });

      // Broadcast job failure
      this.wsManager.broadcastJobFailed(jobId, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async addDetectionJob(data: DetectionJobData, priority: number = 0): Promise<QueuedJob> {
    const queuedJob: QueuedJob = {
      id: data.jobId,
      data,
      priority,
      attempts: 0,
      maxAttempts: 3,
      status: 'waiting',
      createdAt: new Date(),
      progress: 0
    };

    this.jobs.set(data.jobId, queuedJob);

    // Start processing asynchronously
    setImmediate(() => this.processQueue());

    return queuedJob;
  }

  async getJobStatus(jobId: string): Promise<any> {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    return {
      id: job.id,
      status: job.status,
      progress: job.progress,
      data: job.data,
      createdAt: job.createdAt,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
    };
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'waiting') return false;

    this.jobs.delete(jobId);

    // Update database
    await prisma.detectionJob.update({
      where: { id: jobId },
      data: { status: JobStatus.CANCELLED }
    });

    return true;
  }

  async getQueueStats(): Promise<any> {
    const jobs = Array.from(this.jobs.values());

    return {
      waiting: jobs.filter(j => j.status === 'waiting').length,
      active: jobs.filter(j => j.status === 'active').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      total: jobs.length
    };
  }

  async pauseQueue(): Promise<void> {
    // No-op for in-memory queue
    console.log('Queue pause requested (no-op for in-memory queue)');
  }

  async resumeQueue(): Promise<void> {
    // Trigger processing
    setImmediate(() => this.processQueue());
  }

  async cleanQueue(): Promise<void> {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago

    for (const [id, job] of this.jobs) {
      if (job.finishedOn && job.finishedOn.getTime() < cutoff) {
        this.jobs.delete(id);
      }
    }
  }
}