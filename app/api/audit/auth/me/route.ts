import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/audit/middleware';

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        userType: user.userType,
        organizationId: user.organizationId,
        assignedSites: user.assignedSites,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
});
