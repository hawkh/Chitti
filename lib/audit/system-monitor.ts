/**
 * System Performance Monitoring and Analytics
 * Task 11.3: Add monitoring and analytics
 */

import { PrismaClient } from '@prisma/client';
import { ErrorHandler } from './error-handler';

const prisma = new PrismaClient();

export interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  metrics: {
    avgResponseTime: number;
    errorRate: number;
    activeUsers: number;
    pendingAudits: number;
    systemLoad: number;
  };
  components: {
    database: ComponentHealth;
    api: ComponentHealth;
    fileStorage: ComponentHealth;
  };
  timestamp: Date;
}

export interface ComponentHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: Date;
  errorCount: number;
}

export interface UsageAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalAudits: number;
  auditsToday: number;
  auditsThisWeek: number;
  auditsThisMonth: number;
  avgAuditsPerDay: number;
  topUsers: Array<{
    userId: string;
    userName: string;
    auditCount: number;
  }>;
  topSites: Array<{
    siteId: string;
    siteName: string;
    auditCount: number;
  }>;
}

export interface PerformanceReport {
  period: {
    start: Date;
    end: Date;
  };
  operations: {
    [operation: string]: {
      count: number;
      avgDuration: number;
      minDuration: number;
      maxDuration: number;
      successRate: number;
    };
  };
  slowestOperations: Array<{
    operation: string;
    duration: number;
    timestamp: Date;
  }>;
  errorSummary: {
    total: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
  };
}

export class SystemMonitor {
  private static metrics: PerformanceMetric[] = [];
  private static maxMetrics = 10000;
  private static startTime = Date.now();

  /**
   * Track operation performance
   */
  static async trackOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now();
    let success = true;

    try {
      const result = await fn();
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      this.recordMetric({
        operation,
        duration,
        timestamp: new Date(),
        success,
        metadata,
      });
    }
  }

  /**
   * Record performance metric
   */
  private static recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations
    if (metric.duration > 5000) {
      console.warn(`Slow operation detected: ${metric.operation} took ${metric.duration}ms`);
    }
  }

  /**
   * Get current system health
   */
  static async getSystemHealth(): Promise<SystemHealth> {
    const now = Date.now();
    const uptime = now - this.startTime;

    // Calculate metrics
    const recentMetrics = this.metrics.filter(
      (m) => now - m.timestamp.getTime() < 300000 // Last 5 minutes
    );

    const avgResponseTime =
      recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length
        : 0;

    const errorRate =
      recentMetrics.length > 0
        ? (recentMetrics.filter((m) => !m.success).length / recentMetrics.length) * 100
        : 0;

    // Get active users (users with activity in last hour)
    const oneHourAgo = new Date(now - 3600000);
    const activeUsers = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: oneHourAgo,
        },
      },
    });

    // Get pending audits
    const pendingAudits = await prisma.auditRecord.count({
      where: {
        status: {
          in: ['SUBMITTED', 'IN_REVIEW'],
        },
      },
    });

    // Check component health
    const database = await this.checkDatabaseHealth();
    const api = await this.checkAPIHealth();
    const fileStorage = await this.checkFileStorageHealth();

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (
      database.status === 'down' ||
      api.status === 'down' ||
      fileStorage.status === 'down'
    ) {
      status = 'critical';
    } else if (
      database.status === 'degraded' ||
      api.status === 'degraded' ||
      fileStorage.status === 'degraded' ||
      errorRate > 10
    ) {
      status = 'degraded';
    }

    return {
      status,
      uptime,
      metrics: {
        avgResponseTime,
        errorRate,
        activeUsers,
        pendingAudits,
        systemLoad: this.calculateSystemLoad(),
      },
      components: {
        database,
        api,
        fileStorage,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Check database health
   */
  private static async checkDatabaseHealth(): Promise<ComponentHealth> {
    const startTime = Date.now();
    let status: 'up' | 'down' | 'degraded' = 'up';
    let errorCount = 0;

    try {
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;

      if (responseTime > 1000) {
        status = 'degraded';
      }

      return {
        status,
        responseTime,
        lastCheck: new Date(),
        errorCount,
      };
    } catch (error) {
      console.error('Database health check failed:', error);
      return {
        status: 'down',
        lastCheck: new Date(),
        errorCount: 1,
      };
    }
  }

  /**
   * Check API health
   */
  private static async checkAPIHealth(): Promise<ComponentHealth> {
    const recentMetrics = this.metrics.filter(
      (m) => Date.now() - m.timestamp.getTime() < 60000 // Last minute
    );

    const errorCount = recentMetrics.filter((m) => !m.success).length;
    const avgResponseTime =
      recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length
        : 0;

    let status: 'up' | 'down' | 'degraded' = 'up';
    if (errorCount > 10) {
      status = 'down';
    } else if (errorCount > 5 || avgResponseTime > 2000) {
      status = 'degraded';
    }

    return {
      status,
      responseTime: avgResponseTime,
      lastCheck: new Date(),
      errorCount,
    };
  }

  /**
   * Check file storage health
   */
  private static async checkFileStorageHealth(): Promise<ComponentHealth> {
    // Simplified check - in production, check actual storage service
    return {
      status: 'up',
      lastCheck: new Date(),
      errorCount: 0,
    };
  }

  /**
   * Calculate system load (0-100)
   */
  private static calculateSystemLoad(): number {
    const recentMetrics = this.metrics.filter(
      (m) => Date.now() - m.timestamp.getTime() < 60000
    );

    // Simple load calculation based on request rate and response time
    const requestRate = recentMetrics.length / 60; // Requests per second
    const avgResponseTime =
      recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length
        : 0;

    // Normalize to 0-100 scale
    const loadFromRate = Math.min((requestRate / 10) * 50, 50); // Max 50 from rate
    const loadFromTime = Math.min((avgResponseTime / 5000) * 50, 50); // Max 50 from time

    return Math.round(loadFromRate + loadFromTime);
  }

  /**
   * Get usage analytics
   */
  static async getUsageAnalytics(): Promise<UsageAnalytics> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      totalAudits,
      auditsToday,
      auditsThisWeek,
      auditsThisMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: weekAgo,
          },
        },
      }),
      prisma.auditRecord.count(),
      prisma.auditRecord.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      prisma.auditRecord.count({
        where: {
          createdAt: {
            gte: weekAgo,
          },
        },
      }),
      prisma.auditRecord.count({
        where: {
          createdAt: {
            gte: monthAgo,
          },
        },
      }),
    ]);

    // Get top users
    const topUsersData = await prisma.auditRecord.groupBy({
      by: ['inspectorId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    const topUsers = await Promise.all(
      topUsersData.map(async (data) => {
        const user = await prisma.user.findUnique({
          where: { id: data.inspectorId },
          select: { id: true, name: true },
        });
        return {
          userId: data.inspectorId,
          userName: user?.name || 'Unknown',
          auditCount: data._count.id,
        };
      })
    );

    // Get top sites
    const topSitesData = await prisma.auditRecord.groupBy({
      by: ['siteId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    const topSites = await Promise.all(
      topSitesData.map(async (data) => {
        const site = await prisma.site.findUnique({
          where: { id: data.siteId },
          select: { id: true, name: true },
        });
        return {
          siteId: data.siteId,
          siteName: site?.name || 'Unknown',
          auditCount: data._count.id,
        };
      })
    );

    const avgAuditsPerDay = auditsThisMonth / 30;

    return {
      totalUsers,
      activeUsers,
      totalAudits,
      auditsToday,
      auditsThisWeek,
      auditsThisMonth,
      avgAuditsPerDay,
      topUsers,
      topSites,
    };
  }

  /**
   * Generate performance report
   */
  static getPerformanceReport(
    startDate: Date,
    endDate: Date
  ): PerformanceReport {
    const periodMetrics = this.metrics.filter(
      (m) =>
        m.timestamp >= startDate && m.timestamp <= endDate
    );

    // Group by operation
    const operations: PerformanceReport['operations'] = {};

    periodMetrics.forEach((metric) => {
      if (!operations[metric.operation]) {
        operations[metric.operation] = {
          count: 0,
          avgDuration: 0,
          minDuration: Infinity,
          maxDuration: 0,
          successRate: 0,
        };
      }

      const op = operations[metric.operation];
      op.count++;
      op.avgDuration += metric.duration;
      op.minDuration = Math.min(op.minDuration, metric.duration);
      op.maxDuration = Math.max(op.maxDuration, metric.duration);
      if (metric.success) {
        op.successRate++;
      }
    });

    // Calculate averages
    Object.keys(operations).forEach((key) => {
      const op = operations[key];
      op.avgDuration = op.avgDuration / op.count;
      op.successRate = (op.successRate / op.count) * 100;
    });

    // Get slowest operations
    const slowestOperations = [...periodMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map((m) => ({
        operation: m.operation,
        duration: m.duration,
        timestamp: m.timestamp,
      }));

    // Get error summary
    const errorStats = ErrorHandler.getErrorStatistics();

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      operations,
      slowestOperations,
      errorSummary: {
        total: errorStats.total,
        byCategory: errorStats.byCategory as Record<string, number>,
        bySeverity: errorStats.bySeverity as Record<string, number>,
      },
    };
  }

  /**
   * Clear old metrics
   */
  static clearOldMetrics(olderThan: Date): number {
    const initialLength = this.metrics.length;
    this.metrics = this.metrics.filter((m) => m.timestamp >= olderThan);
    return initialLength - this.metrics.length;
  }

  /**
   * Get real-time metrics
   */
  static getRealTimeMetrics() {
    const now = Date.now();
    const last5Minutes = this.metrics.filter(
      (m) => now - m.timestamp.getTime() < 300000
    );

    const requestsPerMinute = last5Minutes.length / 5;
    const avgResponseTime =
      last5Minutes.length > 0
        ? last5Minutes.reduce((sum, m) => sum + m.duration, 0) / last5Minutes.length
        : 0;
    const errorRate =
      last5Minutes.length > 0
        ? (last5Minutes.filter((m) => !m.success).length / last5Minutes.length) * 100
        : 0;

    return {
      requestsPerMinute,
      avgResponseTime,
      errorRate,
      totalRequests: last5Minutes.length,
      successfulRequests: last5Minutes.filter((m) => m.success).length,
      failedRequests: last5Minutes.filter((m) => !m.success).length,
    };
  }
}

export default SystemMonitor;
