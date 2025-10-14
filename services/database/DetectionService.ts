import { prisma } from '@/lib/database';
import { JobStatus, FileStatus } from '@prisma/client';

export class DetectionService {
  static async createJob(userId: string, config: any, totalFiles: number, priority: number = 0) {
    return prisma.detectionJob.create({
      data: {
        userId,
        config,
        totalFiles,
        priority
      }
    });
  }

  static async getJob(jobId: string) {
    return prisma.detectionJob.findUnique({
      where: { id: jobId },
      include: {
        files: {
          include: { result: true }
        },
        results: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  static async getUserJobs(userId: string, limit: number = 50) {
    return prisma.detectionJob.findMany({
      where: { userId },
      include: {
        _count: {
          select: { files: true, results: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  static async updateJobStatus(jobId: string, status: JobStatus, error?: string) {
    const updateData: any = { status };
    
    if (status === JobStatus.PROCESSING) {
      updateData.startedAt = new Date();
    } else if (status === JobStatus.COMPLETED || status === JobStatus.FAILED) {
      updateData.completedAt = new Date();
    }
    
    if (error) {
      updateData.error = error;
    }

    return prisma.detectionJob.update({
      where: { id: jobId },
      data: updateData
    });
  }

  static async updateJobProgress(jobId: string, progress: number, processedFiles: number) {
    return prisma.detectionJob.update({
      where: { id: jobId },
      data: { progress, processedFiles }
    });
  }

  static async createFile(jobId: string, fileData: {
    originalName: string;
    filename: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
  }) {
    return prisma.detectionFile.create({
      data: {
        jobId,
        ...fileData
      }
    });
  }

  static async updateFileStatus(fileId: string, status: FileStatus) {
    const updateData: any = { status };
    
    if (status === FileStatus.COMPLETED || status === FileStatus.FAILED) {
      updateData.processedAt = new Date();
    }

    return prisma.detectionFile.update({
      where: { id: fileId },
      data: updateData
    });
  }

  static async createResult(resultData: {
    jobId: string;
    fileId: string;
    overallStatus: string;
    processingTime: number;
    defectsFound: number;
    confidence: number;
    detections: any;
  }) {
    return prisma.detectionResult.create({
      data: resultData
    });
  }

  static async getJobResults(jobId: string) {
    return prisma.detectionResult.findMany({
      where: { jobId },
      include: {
        file: {
          select: { originalName: true, filename: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  static async getJobStatistics(userId?: string) {
    const whereClause = userId ? { userId } : {};
    
    const [total, queued, processing, completed, failed] = await Promise.all([
      prisma.detectionJob.count({ where: whereClause }),
      prisma.detectionJob.count({ where: { ...whereClause, status: JobStatus.QUEUED } }),
      prisma.detectionJob.count({ where: { ...whereClause, status: JobStatus.PROCESSING } }),
      prisma.detectionJob.count({ where: { ...whereClause, status: JobStatus.COMPLETED } }),
      prisma.detectionJob.count({ where: { ...whereClause, status: JobStatus.FAILED } })
    ]);

    return { total, queued, processing, completed, failed };
  }

  static async deleteJob(jobId: string) {
    await prisma.detectionResult.deleteMany({ where: { jobId } });
    await prisma.detectionFile.deleteMany({ where: { jobId } });
    await prisma.detectionJob.delete({ where: { id: jobId } });
  }

  static async cleanupOldJobs(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldJobs = await prisma.detectionJob.findMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: { in: [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED] }
      },
      select: { id: true }
    });

    for (const job of oldJobs) {
      await this.deleteJob(job.id);
    }

    return oldJobs.length;
  }
}