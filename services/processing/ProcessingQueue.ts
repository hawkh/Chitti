import { ProcessingJob, JobStatus } from '@/types';
import { IdGenerator } from '@/lib/utils';

export class ProcessingQueue {
  private static instance: ProcessingQueue;
  private queue: ProcessingJob[] = [];
  private processing = false;

  private constructor() {}

  static getInstance(): ProcessingQueue {
    if (!ProcessingQueue.instance) {
      ProcessingQueue.instance = new ProcessingQueue();
    }
    return ProcessingQueue.instance;
  }

  addJob(job: Omit<ProcessingJob, 'id' | 'status' | 'createdAt' | 'progress'>): ProcessingJob {
    const newJob: ProcessingJob = {
      ...job,
      id: IdGenerator.generateJobId(),
      status: JobStatus.QUEUED,
      createdAt: new Date(),
      progress: 0
    };

    this.queue.push(newJob);
    this.processNext();
    return newJob;
  }

  getJob(id: string): ProcessingJob | undefined {
    return this.queue.find(job => job.id === id);
  }

  getAllJobs(): ProcessingJob[] {
    return [...this.queue];
  }

  private async processNext(): Promise<void> {
    if (this.processing) return;

    const nextJob = this.queue.find(job => job.status === JobStatus.QUEUED);
    if (!nextJob) return;

    this.processing = true;
    nextJob.status = JobStatus.PROCESSING;
    nextJob.startedAt = new Date();

    try {
      // Simulate processing
      for (let i = 0; i <= 100; i += 10) {
        nextJob.progress = i;
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      nextJob.status = JobStatus.COMPLETED;
      nextJob.completedAt = new Date();
    } catch (error) {
      nextJob.status = JobStatus.FAILED;
    } finally {
      this.processing = false;
      this.processNext();
    }
  }
}