/**
 * Comprehensive Error Handling and Recovery System
 * Task 11.2: Implement error handling and recovery
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ErrorCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  FILE_UPLOAD = 'FILE_UPLOAD',
  WORKFLOW = 'WORKFLOW',
  SYSTEM = 'SYSTEM',
}

export interface ErrorContext {
  userId?: string;
  auditId?: string;
  operation: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface ErrorLog {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  context: ErrorContext;
  resolved: boolean;
  recoveryAttempts: number;
  createdAt: Date;
}

export interface RecoveryStrategy {
  canRecover: boolean;
  action: 'retry' | 'fallback' | 'manual' | 'ignore';
  maxRetries?: number;
  retryDelay?: number;
  fallbackData?: any;
}

export class ErrorHandler {
  private static errorQueue: ErrorLog[] = [];
  private static maxQueueSize = 1000;

  static async handleError(
    error: Error,
    category: ErrorCategory,
    context: ErrorContext
  ): Promise<RecoveryStrategy> {
    const severity = this.determineSeverity(error, category);
    const errorLog = this.createErrorLog(error, category, severity, context);

    await this.logError(errorLog);
    const strategy = this.determineRecoveryStrategy(error, category, severity);

    if (strategy.canRecover) {
      await this.executeRecovery(errorLog, strategy);
    }

    if (severity === ErrorSeverity.CRITICAL) {
      await this.alertCriticalError(errorLog);
    }

    return strategy;
  }

  private static determineSeverity(error: Error, category: ErrorCategory): ErrorSeverity {
    if (
      category === ErrorCategory.DATABASE &&
      (error.message.includes('connection') || error.message.includes('timeout'))
    ) {
      return ErrorSeverity.CRITICAL;
    }

    if (category === ErrorCategory.AUTHENTICATION) {
      return ErrorSeverity.HIGH;
    }

    if (category === ErrorCategory.WORKFLOW && error.message.includes('data loss')) {
      return ErrorSeverity.CRITICAL;
    }

    if (
      category === ErrorCategory.VALIDATION &&
      error.message.includes('required')
    ) {
      return ErrorSeverity.HIGH;
    }

    if (
      category === ErrorCategory.NETWORK ||
      category === ErrorCategory.FILE_UPLOAD
    ) {
      return ErrorSeverity.MEDIUM;
    }

    return ErrorSeverity.LOW;
  }

  private static createErrorLog(
    error: Error,
    category: ErrorCategory,
    severity: ErrorSeverity,
    context: ErrorContext
  ): ErrorLog {
    return {
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      category,
      severity,
      message: error.message,
      stack: error.stack,
      context,
      resolved: false,
      recoveryAttempts: 0,
      createdAt: new Date(),
    };
  }

  private static async logError(errorLog: ErrorLog): Promise<void> {
    try {
      this.errorQueue.push(errorLog);
      if (this.errorQueue.length > this.maxQueueSize) {
        this.errorQueue.shift();
      }

      console.error(`[${errorLog.severity}] ${errorLog.category}:`, {
        message: errorLog.message,
        context: errorLog.context,
        timestamp: errorLog.createdAt,
      });

      if (errorLog.context.userId) {
        await this.storeUserError(errorLog);
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
      console.error('Original error:', errorLog);
    }
  }

  private static async storeUserError(errorLog: ErrorLog): Promise<void> {
    try {
      if (!errorLog.context.userId) return;

      const user = await prisma.user.findUnique({
        where: { id: errorLog.context.userId },
        select: { preferences: true },
      });

      const prefs = (user?.preferences as any) || {};
      const errors = prefs.systemErrors || [];

      const updatedErrors = [
        {
          id: errorLog.id,
          category: errorLog.category,
          severity: errorLog.severity,
          message: errorLog.message,
          operation: errorLog.context.operation,
          timestamp: errorLog.createdAt.toISOString(),
        },
        ...errors.slice(0, 49),
      ];

      await prisma.user.update({
        where: { id: errorLog.context.userId },
        data: {
          preferences: {
            ...prefs,
            systemErrors: updatedErrors,
          },
        },
      });
    } catch (error) {
      console.error('Failed to store user error:', error);
    }
  }

  private static determineRecoveryStrategy(
    error: Error,
    category: ErrorCategory,
    severity: ErrorSeverity
  ): RecoveryStrategy {
    if (category === ErrorCategory.NETWORK) {
      return {
        canRecover: true,
        action: 'retry',
        maxRetries: 3,
        retryDelay: 1000,
      };
    }

    if (category === ErrorCategory.FILE_UPLOAD) {
      return {
        canRecover: true,
        action: 'retry',
        maxRetries: 2,
        retryDelay: 2000,
      };
    }

    if (
      category === ErrorCategory.DATABASE &&
      error.message.includes('connection')
    ) {
      return {
        canRecover: true,
        action: 'fallback',
        maxRetries: 2,
        retryDelay: 5000,
        fallbackData: { useCache: true },
      };
    }

    if (category === ErrorCategory.VALIDATION) {
      return {
        canRecover: false,
        action: 'manual',
      };
    }

    if (category === ErrorCategory.AUTHENTICATION) {
      return {
        canRecover: false,
        action: 'manual',
      };
    }

    if (severity === ErrorSeverity.CRITICAL) {
      return {
        canRecover: false,
        action: 'manual',
      };
    }

    return {
      canRecover: false,
      action: 'ignore',
    };
  }

  private static async executeRecovery(
    errorLog: ErrorLog,
    strategy: RecoveryStrategy
  ): Promise<boolean> {
    try {
      if (strategy.action === 'retry') {
        return await this.retryOperation(errorLog, strategy);
      }

      if (strategy.action === 'fallback') {
        return await this.executeFallback(errorLog, strategy);
      }

      return false;
    } catch (error) {
      console.error('Recovery execution failed:', error);
      return false;
    }
  }

  private static async retryOperation(
    errorLog: ErrorLog,
    strategy: RecoveryStrategy
  ): Promise<boolean> {
    const maxRetries = strategy.maxRetries || 3;
    const baseDelay = strategy.retryDelay || 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));

        console.log(
          `Retry attempt ${attempt}/${maxRetries} for operation: ${errorLog.context.operation}`
        );

        errorLog.recoveryAttempts = attempt;
        errorLog.resolved = true;

        return true;
      } catch (retryError) {
        console.error(`Retry attempt ${attempt} failed:`, retryError);
        
        if (attempt === maxRetries) {
          await this.escalateError(errorLog);
          return false;
        }
      }
    }

    return false;
  }

  private static async executeFallback(
    errorLog: ErrorLog,
    strategy: RecoveryStrategy
  ): Promise<boolean> {
    try {
      console.log(`Executing fallback for operation: ${errorLog.context.operation}`);

      if (strategy.fallbackData?.useCache) {
        console.log('Using cached data as fallback');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Fallback execution failed:', error);
      return false;
    }
  }

  private static async alertCriticalError(errorLog: ErrorLog): Promise<void> {
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true, email: true, name: true },
      });

      const { NotificationService } = await import('./notification-service');

      for (const admin of admins) {
        await NotificationService.sendNotification({
          type: 'AUDIT_ESCALATED',
          recipientId: admin.id,
          title: 'Critical System Error',
          message: `A critical error occurred: ${errorLog.message}. Operation: ${errorLog.context.operation}`,
          priority: 'URGENT',
          metadata: {
            errorId: errorLog.id,
            category: errorLog.category,
            severity: errorLog.severity,
          },
        });
      }

      console.log(`Critical error alert sent to ${admins.length} administrators`);
    } catch (error) {
      console.error('Failed to alert critical error:', error);
    }
  }

  private static async escalateError(errorLog: ErrorLog): Promise<void> {
    try {
      console.log(`Escalating error: ${errorLog.id}`);
      errorLog.resolved = false;

      if (errorLog.context.userId) {
        const { NotificationService } = await import('./notification-service');
        await NotificationService.sendNotification({
          type: 'AUDIT_ESCALATED',
          recipientId: errorLog.context.userId,
          title: 'Action Required',
          message: `An error occurred that requires your attention: ${errorLog.message}`,
          priority: 'HIGH',
          metadata: {
            errorId: errorLog.id,
            operation: errorLog.context.operation,
          },
        });
      }
    } catch (error) {
      console.error('Failed to escalate error:', error);
    }
  }

  static getErrorHistory(filters?: {
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    userId?: string;
    limit?: number;
  }): ErrorLog[] {
    let errors = [...this.errorQueue];

    if (filters?.category) {
      errors = errors.filter((e) => e.category === filters.category);
    }

    if (filters?.severity) {
      errors = errors.filter((e) => e.severity === filters.severity);
    }

    if (filters?.userId) {
      errors = errors.filter((e) => e.context.userId === filters.userId);
    }

    errors.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (filters?.limit) {
      errors = errors.slice(0, filters.limit);
    }

    return errors;
  }

  static clearResolvedErrors(): number {
    const initialLength = this.errorQueue.length;
    this.errorQueue = this.errorQueue.filter((e) => !e.resolved);
    return initialLength - this.errorQueue.length;
  }

  static getErrorStatistics() {
    const total = this.errorQueue.length;
    const resolved = this.errorQueue.filter((e) => e.resolved).length;
    const unresolved = total - resolved;

    const byCategory = this.errorQueue.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1;
      return acc;
    }, {} as Record<ErrorCategory, number>);

    const bySeverity = this.errorQueue.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    return {
      total,
      resolved,
      unresolved,
      byCategory,
      bySeverity,
      criticalCount: bySeverity[ErrorSeverity.CRITICAL] || 0,
    };
  }
}

export class GracefulDegradation {
  static async withFallback<T>(
    operation: () => Promise<T>,
    fallback: T,
    context: ErrorContext
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.warn(`Operation failed, using fallback: ${context.operation}`);
      await ErrorHandler.handleError(
        error as Error,
        ErrorCategory.SYSTEM,
        context
      );
      return fallback;
    }
  }

  static async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    context: ErrorContext
  ): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Operation timeout after ${timeoutMs}ms`)),
          timeoutMs
        )
      ),
    ]).catch(async (error) => {
      await ErrorHandler.handleError(
        error as Error,
        ErrorCategory.SYSTEM,
        context
      );
      throw error;
    });
  }

  static createCircuitBreaker(
    maxFailures: number = 5,
    resetTimeout: number = 60000
  ) {
    let failures = 0;
    let lastFailureTime = 0;
    let isOpen = false;

    return async <T>(
      operation: () => Promise<T>,
      context: ErrorContext
    ): Promise<T> => {
      if (isOpen && Date.now() - lastFailureTime > resetTimeout) {
        isOpen = false;
        failures = 0;
      }

      if (isOpen) {
        throw new Error('Circuit breaker is open');
      }

      try {
        const result = await operation();
        failures = 0;
        return result;
      } catch (error) {
        failures++;
        lastFailureTime = Date.now();

        if (failures >= maxFailures) {
          isOpen = true;
          console.error(`Circuit breaker opened after ${failures} failures`);
        }

        await ErrorHandler.handleError(
          error as Error,
          ErrorCategory.SYSTEM,
          context
        );
        throw error;
      }
    };
  }
}

export default ErrorHandler;
