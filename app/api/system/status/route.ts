import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import redis from '@/lib/redis';
import { JobQueue } from '@/services/processing/JobQueue';
import { ScalableModelManager } from '@/services/ai/ScalableModelManager';
import { WebSocketManager } from '@/services/websocket/WebSocketManager';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    let dbStatus = 'healthy';
    let dbLatency = 0;
    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - dbStart;
    } catch (error) {
      dbStatus = 'unhealthy';
      console.error('Database health check failed:', error);
    }

    let redisStatus = 'healthy';
    let redisLatency = 0;
    try {
      const redisStart = Date.now();
      await redis.ping();
      redisLatency = Date.now() - redisStart;
    } catch (error) {
      redisStatus = 'unhealthy';
      console.error('Redis health check failed:', error);
    }

    const jobQueue = JobQueue.getInstance();
    const queueStats = await jobQueue.getQueueStats();

    const modelManager = ScalableModelManager.getInstance();
    const loadedModels = modelManager.getLoadedModels();

    const wsManager = WebSocketManager.getInstance();
    const wsConnections = wsManager.getConnectedClients();

    const totalLatency = Date.now() - startTime;
    const memoryUsage = process.memoryUsage();

    const [totalJobs, activeJobs, totalResults] = await Promise.all([
      prisma.detectionJob.count(),
      prisma.detectionJob.count({
        where: {
          status: { in: ['QUEUED', 'PROCESSING'] }
        }
      }),
      prisma.detectionResult.count()
    ]);

    const systemStatus = {
      status: dbStatus === 'healthy' && redisStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: {
          status: dbStatus,
          latency: dbLatency
        },
        redis: {
          status: redisStatus,
          latency: redisLatency
        },
        jobQueue: {
          status: 'healthy',
          stats: queueStats
        },
        modelManager: {
          status: 'healthy',
          loadedModels: loadedModels.length,
          models: loadedModels
        },
        websocket: {
          status: 'healthy',
          connections: wsConnections
        }
      },
      metrics: {
        responseTime: totalLatency,
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024)
        },
        database: {
          totalJobs,
          activeJobs,
          totalResults
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: systemStatus
    });

  } catch (error) {
    console.error('System status error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to get system status',
        code: 'SYSTEM_STATUS_ERROR'
      }
    }, { status: 500 });
  }
}