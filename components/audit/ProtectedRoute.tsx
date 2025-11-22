'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuditUser } from '@/types/audit';
import { Shield, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallbackUrl?: string;
}

export default function ProtectedRoute({
  children,
  requiredRoles = [],
  fallbackUrl = '/audit/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuditUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('audit_token');
      const userData = localStorage.getItem('audit_user');

      if (!token || !userData) {
        router.push(fallbackUrl);
        return;
      }

      const parsedUser = JSON.parse(userData) as AuditUser;
      
      // Verify token is still valid by making a test API call
      const response = await fetch('/api/audit/sites', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Token is invalid, clear storage and redirect
        localStorage.removeItem('audit_token');
        localStorage.removeItem('audit_user');
        router.push(fallbackUrl);
        return;
      }

      setUser(parsedUser);

      // Check role requirements
      if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some(role => 
          parsedUser.role === role || parsedUser.userType === role
        );

        if (!hasRequiredRole) {
          setAuthorized(false);
          setLoading(false);
          return;
        }
      }

      setAuthorized(true);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push(fallbackUrl);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-blue-200">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-red-200 mb-6">
            You don't have permission to access this page.
            {requiredRoles.length > 0 && (
              <span className="block mt-2 text-sm">
                Required roles: {requiredRoles.join(', ')}
              </span>
            )}
          </p>
          <button
            onClick={() => router.push('/audit/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook to get current user
export function useAuditUser() {
  const [user, setUser] = useState<AuditUser | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('audit_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return user;
}