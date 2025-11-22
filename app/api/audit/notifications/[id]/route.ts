// API Route: Mark Notification as Read
import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/audit/notification-service';
import { verifyAuth } from '@/lib/audit/middleware';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const notificationId = params.id;

    await NotificationService.markAsRead(
      authResult.user.id,
      notificationId
    );

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
