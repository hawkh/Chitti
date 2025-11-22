import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/database';
import { AuditUser } from '@/types/audit';

const JWT_SECRET = process.env.JWT_SECRET || 'chitti-secret-key-2024-enterprise-production';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  userType: 'INSPECTOR' | 'MANAGER' | 'ADMIN';
  organizationId?: string;
}

export function generateToken(user: AuditUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    userType: user.userType,
    organizationId: user.organizationId || undefined,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function getAuthenticatedUser(request: NextRequest): Promise<AuditUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        userType: true,
        organizationId: true,
        assignedSites: true,
        preferences: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      userType: user.userType as 'INSPECTOR' | 'MANAGER' | 'ADMIN',
      assignedSites: user.assignedSites as string[] | null,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function hasRole(user: AuditUser, requiredRoles: string[]): boolean {
  return requiredRoles.includes(user.role) || requiredRoles.includes(user.userType);
}

export function canAccessSite(user: AuditUser, siteId: string): boolean {
  // Admins can access all sites
  if (user.userType === 'ADMIN') {
    return true;
  }

  // Check if user is assigned to the site
  if (user.assignedSites && user.assignedSites.includes(siteId)) {
    return true;
  }

  return false;
}

export function canManageAudit(user: AuditUser, audit: { inspectorId: string; siteId: string }): boolean {
  // Admins can manage all audits
  if (user.userType === 'ADMIN') {
    return true;
  }

  // Inspectors can only manage their own audits
  if (user.userType === 'INSPECTOR') {
    return user.id === audit.inspectorId;
  }

  // Managers can manage audits for their assigned sites
  if (user.userType === 'MANAGER') {
    return canAccessSite(user, audit.siteId);
  }

  return false;
}

export async function updateLastLogin(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  } catch (error) {
    console.error('Failed to update last login:', error);
  }
}