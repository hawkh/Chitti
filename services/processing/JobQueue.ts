import Bull from 'bull';
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

export class JobQueue {
  private static instance: JobQueue;
  private queue: Bull.Queue;
  private modelManager: ScalableModelManager;
  private wsManager: WebSocketManager;

  private constructor() {
    this.queue = new Bull('defect-detection', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    });

    this.modelManager = ScalableModelManager.getInstance();
    this.wsManager = WebSocketManager.getInstance();
    this.setupProcessors();
  }

  static getInstance(): JobQueue {
    if (!JobQueue.instance) {
      JobQueue.instance = new JobQueue();
    }
    return JobQueue.instance;
  }

  private setupProcessors(): void {
    this.queue.process('detect-defects', 3, async (job) => {
      const { jobId, userId, modelId, files } = job.data as DetectionJobData;
      
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

            // Update job progress in Bull
            job.progress(progress);

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

        // Broadcast job completion
        this.wsManager.broadcastJobCompleted(jobId, { processedFiles, totalFiles });

        return { success: true, processedFiles, totalFiles };

      } catch (error) {
        console.error(`Job ${jobId} failed:`, error);
        
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

        throw error;
      }
    });

    // Job event handlers
    this.queue.on('completed', (job, result) => {
      console.log(`Job ${job.id} completed:`, result);
    });

    this.queue.on('failed', (job, err) => {
      console.error(`Job ${job.id} failed:`, err);
    });

    this.queue.on('progress', (job, progress) => {
      console.log(`Job ${job.id} progress: ${progress}%`);
    });
  }

  async addDetectionJob(data: DetectionJobData, priority: number = 0): Promise<Bull.Job> {
    return this.queue.add('detect-defects', data, {
      priority,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 10,
      removeOnFail: 5,
    });
  }

  async getJobStatus(jobId: string): Promise<any> {
    const job = await this.queue.getJob(jobId);
    if (!job) return null;

    return {
      id: job.id,
      status: await job.getState(),
      progress: job.progress(),
      data: job.data,
      createdAt: new Date(job.timestamp),
      processedOn: job.processedOn ? new Date(job.processedOn) : null,
      finishedOn: job.finishedOn ? new Date(job.finishedOn) : null,
      failedReason: job.failedReason,
    };
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = await this.queue.getJob(jobId);
    if (!job) return false;

    await job.remove();
    
    // Update database
    await prisma.detectionJob.update({
      where: { id: jobId },
      data: { status: JobStatus.CANCELLED }
    });

    return true;
  }

  async getQueueStats(): Promise<any> {
    const waiting = await this.queue.getWaiting();
    const active = await this.queue.getActive();
    const completed = await this.queue.getCompleted();
    const failed = await this.queue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length + completed.length + failed.length
    };
  }

  async pauseQueue(): Promise<void> {
    await this.queue.pause();
  }

  async resumeQueue(): Promise<void> {
    await this.queue.resume();
  }

  async cleanQueue(): Promise<void> {
    await this.queue.clean(24 * 60 * 60 * 1000, 'completed');
    await this.queue.clean(24 * 60 * 60 * 1000, 'failed');
  }
}