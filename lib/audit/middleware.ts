import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, hasRole } from './auth';
import { AuditUser } from '@/types/audit';

export interface AuthMiddlewareOptions {
  requiredRoles?: string[];
  requireAuth?: boolean;
}

export interface AuthResult {
  authenticated: boolean;
  user: AuditUser | null;
}

/**
 * Verify authentication and return user info
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const user = await getAuthenticatedUser(request);
    return {
      authenticated: !!user,
      user,
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return {
      authenticated: false,
      user: null,
    };
  }
}

export function withAuth(
  handler: (request: NextRequest, user: AuditUser | null) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const user = await getAuthenticatedUser(request);

      // Check if authentication is required
      if (options.requireAuth && !user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Check role requirements
      if (options.requiredRoles && user && !hasRole(user, options.requiredRoles)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      return await handler(request, user);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

export function requireAuth<T = any>(
  handler: (request: NextRequest, user: AuditUser, context?: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    try {
      const user = await getAuthenticatedUser(request);
      
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      return handler(request, user, context);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

export function requireRole<T = any>(
  roles: string[],
  handler: (request: NextRequest, user: AuditUser, context?: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    try {
      const user = await getAuthenticatedUser(request);
      
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      if (!hasRole(user, roles)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      
      return handler(request, user, context);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

export function requireInspector<T = any>(
  handler: (request: NextRequest, user: AuditUser, context?: T) => Promise<NextResponse>
) {
  return requireRole(['INSPECTOR', 'ADMIN'], handler);
}

export function requireManager<T = any>(
  handler: (request: NextRequest, user: AuditUser, context?: T) => Promise<NextResponse>
) {
  return requireRole(['MANAGER', 'ADMIN'], handler);
}

export function requireAdmin<T = any>(
  handler: (request: NextRequest, user: AuditUser, context?: T) => Promise<NextResponse>
) {
  return requireRole(['ADMIN'], handler);
}