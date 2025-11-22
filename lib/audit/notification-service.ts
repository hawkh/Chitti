// Notification Service for Audit Workflow
// Handles in-app notifications and email notifications for workflow events

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type NotificationType =
  | 'AUDIT_SUBMITTED'
  | 'AUDIT_ASSIGNED'
  | 'AUDIT_APPROVED'
  | 'AUDIT_REJECTED'
  | 'AUDIT_OVERDUE'
  | 'AUDIT_ESCALATED'
  | 'COMMENT_ADDED';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface NotificationData {
  type: NotificationType;
  recipientId: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
  actionUrl?: string;
}

export interface EmailNotificationData {
  to: string;
  subject: string;
  body: string;
  html?: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  notificationTypes: {
    [key in NotificationType]?: {
      inApp: boolean;
      email: boolean;
    };
  };
}

export class NotificationService {
  /**
   * Send a notification (in-app and/or email based on preferences)
   */
  static async sendNotification(data: NotificationData): Promise<void> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(data.recipientId);

      // Send in-app notification
      if (this.shouldSendInApp(data.type, preferences)) {
        await this.createInAppNotification(data);
      }

      // Send email notification
      if (this.shouldSendEmail(data.type, preferences)) {
        const user = await prisma.user.findUnique({
          where: { id: data.recipientId },
          select: { email: true, name: true },
        });

        if (user?.email) {
          await this.sendEmailNotification({
            to: user.email,
            subject: data.title,
            body: data.message,
            html: this.generateEmailHTML(data, user.name || 'User'),
            metadata: data.metadata,
          });
        }
      }
    } catch (error) {
      console.error('Notification error:', error);
      // Don't throw - notifications should not break the main workflow
    }
  }

  /**
   * Create in-app notification
   */
  private static async createInAppNotification(data: NotificationData): Promise<void> {
    try {
      // Store notification in database (you may need to create a Notification model)
      // For now, we'll use a simple JSON storage approach
      await prisma.user.update({
        where: { id: data.recipientId },
        data: {
          preferences: {
            // This assumes preferences is a JSON field
            notifications: {
              unread: true,
              items: [
                {
                  id: `notif_${Date.now()}`,
                  type: data.type,
                  title: data.title,
                  message: data.message,
                  priority: data.priority,
                  metadata: data.metadata,
                  actionUrl: data.actionUrl,
                  createdAt: new Date().toISOString(),
                  read: false,
                },
              ],
            },
          },
        },
      });

      console.log(`In-app notification sent to user ${data.recipientId}: ${data.title}`);
    } catch (error) {
      console.error('In-app notification error:', error);
    }
  }

  /**
   * Send email notification
   */
  private static async sendEmailNotification(data: EmailNotificationData): Promise<void> {
    try {
      // In production, integrate with email service (SendGrid, AWS SES, etc.)
      // For now, we'll just log the email
      console.log('Email notification:', {
        to: data.to,
        subject: data.subject,
        body: data.body,
      });

      // Example integration with email service:
      // await emailService.send({
      //   to: data.to,
      //   subject: data.subject,
      //   html: data.html || data.body,
      // });
    } catch (error) {
      console.error('Email notification error:', error);
    }
  }

  /**
   * Get user notification preferences
   */
  private static async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferences: true },
      });

      const prefs = user?.preferences as any;

      // Default preferences
      return {
        inAppEnabled: prefs?.notifications?.inAppEnabled ?? true,
        emailEnabled: prefs?.notifications?.emailEnabled ?? true,
        notificationTypes: prefs?.notifications?.types || {},
      };
    } catch (error) {
      console.error('Error getting preferences:', error);
      // Return defaults
      return {
        inAppEnabled: true,
        emailEnabled: true,
        notificationTypes: {},
      };
    }
  }

  /**
   * Check if in-app notification should be sent
   */
  private static shouldSendInApp(
    type: NotificationType,
    preferences: NotificationPreferences
  ): boolean {
    if (!preferences.inAppEnabled) return false;
    const typePrefs = preferences.notificationTypes[type];
    return typePrefs?.inApp ?? true; // Default to true
  }

  /**
   * Check if email notification should be sent
   */
  private static shouldSendEmail(
    type: NotificationType,
    preferences: NotificationPreferences
  ): boolean {
    if (!preferences.emailEnabled) return false;
    const typePrefs = preferences.notificationTypes[type];
    return typePrefs?.email ?? true; // Default to true
  }

  /**
   * Generate HTML email template
   */
  private static generateEmailHTML(data: NotificationData, userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .priority-${data.priority.toLowerCase()} { border-left: 4px solid ${this.getPriorityColor(data.priority)}; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ISO Audit Dashboard</h1>
            </div>
            <div class="content priority-${data.priority.toLowerCase()}">
              <h2>${data.title}</h2>
              <p>Hi ${userName},</p>
              <p>${data.message}</p>
              ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">View Details</a>` : ''}
            </div>
            <div class="footer">
              <p>This is an automated notification from ISO Audit Dashboard.</p>
              <p>To manage your notification preferences, visit your profile settings.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Get color for priority level
   */
  private static getPriorityColor(priority: NotificationPriority): string {
    const colors = {
      LOW: '#10b981',
      MEDIUM: '#f59e0b',
      HIGH: '#ef4444',
      URGENT: '#dc2626',
    };
    return colors[priority];
  }

  /**
   * Notify manager of new audit submission
   */
  static async notifyAuditSubmitted(auditId: string, managerId: string): Promise<void> {
    try {
      const audit = await prisma.auditRecord.findUnique({
        where: { id: auditId },
        include: {
          site: { select: { name: true } },
          inspector: { select: { name: true } },
        },
      });

      if (!audit) return;

      await this.sendNotification({
        type: 'AUDIT_SUBMITTED',
        recipientId: managerId,
        title: 'New Audit Submitted for Review',
        message: `${audit.inspector.name} has submitted an audit for ${audit.site.name}. Please review at your earliest convenience.`,
        priority: 'MEDIUM',
        metadata: { auditId, siteId: audit.siteId },
        actionUrl: `/audit/review/${auditId}`,
      });
    } catch (error) {
      console.error('Error notifying audit submission:', error);
    }
  }

  /**
   * Notify inspector of audit approval
   */
  static async notifyAuditApproved(auditId: string, inspectorId: string): Promise<void> {
    try {
      const audit = await prisma.auditRecord.findUnique({
        where: { id: auditId },
        include: {
          site: { select: { name: true } },
          manager: { select: { name: true } },
        },
      });

      if (!audit) return;

      await this.sendNotification({
        type: 'AUDIT_APPROVED',
        recipientId: inspectorId,
        title: 'Audit Approved',
        message: `Your audit for ${audit.site.name} has been approved by ${audit.manager?.name || 'the manager'}.`,
        priority: 'LOW',
        metadata: { auditId, siteId: audit.siteId },
        actionUrl: `/audit/view/${auditId}`,
      });
    } catch (error) {
      console.error('Error notifying audit approval:', error);
    }
  }

  /**
   * Notify inspector of audit rejection
   */
  static async notifyAuditRejected(
    auditId: string,
    inspectorId: string,
    feedback: string
  ): Promise<void> {
    try {
      const audit = await prisma.auditRecord.findUnique({
        where: { id: auditId },
        include: {
          site: { select: { name: true } },
          manager: { select: { name: true } },
        },
      });

      if (!audit) return;

      await this.sendNotification({
        type: 'AUDIT_REJECTED',
        recipientId: inspectorId,
        title: 'Audit Requires Revision',
        message: `Your audit for ${audit.site.name} requires revision. Feedback: ${feedback}`,
        priority: 'HIGH',
        metadata: { auditId, siteId: audit.siteId, feedback },
        actionUrl: `/audit/edit/${auditId}`,
      });
    } catch (error) {
      console.error('Error notifying audit rejection:', error);
    }
  }

  /**
   * Notify manager of overdue audit
   */
  static async notifyAuditOverdue(auditId: string, managerId: string): Promise<void> {
    try {
      const audit = await prisma.auditRecord.findUnique({
        where: { id: auditId },
        include: {
          site: { select: { name: true } },
          inspector: { select: { name: true } },
        },
      });

      if (!audit) return;

      await this.sendNotification({
        type: 'AUDIT_OVERDUE',
        recipientId: managerId,
        title: 'Overdue Audit Review',
        message: `The audit for ${audit.site.name} submitted by ${audit.inspector.name} is overdue for review. Please take action immediately.`,
        priority: 'URGENT',
        metadata: { auditId, siteId: audit.siteId },
        actionUrl: `/audit/review/${auditId}`,
      });
    } catch (error) {
      console.error('Error notifying overdue audit:', error);
    }
  }

  /**
   * Notify on comment added
   */
  static async notifyCommentAdded(
    auditId: string,
    recipientId: string,
    commenterName: string,
    comment: string
  ): Promise<void> {
    try {
      await this.sendNotification({
        type: 'COMMENT_ADDED',
        recipientId,
        title: 'New Comment on Audit',
        message: `${commenterName} added a comment: "${comment.substring(0, 100)}${comment.length > 100 ? '...' : ''}"`,
        priority: 'LOW',
        metadata: { auditId, commenterName },
        actionUrl: `/audit/view/${auditId}`,
      });
    } catch (error) {
      console.error('Error notifying comment:', error);
    }
  }

  /**
   * Update user notification preferences
   */
  static async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferences: true },
      });

      const currentPrefs = (user?.preferences as any) || {};

      await prisma.user.update({
        where: { id: userId },
        data: {
          preferences: {
            ...currentPrefs,
            notifications: {
              ...currentPrefs.notifications,
              ...preferences,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(userId: string, unreadOnly: boolean = false) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferences: true },
      });

      const prefs = (user?.preferences as any) || {};
      const notifications = prefs.notifications?.items || [];

      if (unreadOnly) {
        return notifications.filter((n: any) => !n.read);
      }

      return notifications;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferences: true },
      });

      const prefs = (user?.preferences as any) || {};
      const notifications = prefs.notifications?.items || [];

      const updatedNotifications = notifications.map((n: any) =>
        n.id === notificationId ? { ...n, read: true } : n
      );

      await prisma.user.update({
        where: { id: userId },
        data: {
          preferences: {
            ...prefs,
            notifications: {
              ...prefs.notifications,
              items: updatedNotifications,
              unread: updatedNotifications.some((n: any) => !n.read),
            },
          },
        },
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }
}

export default NotificationService;
