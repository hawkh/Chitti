'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ManagerDashboard from '../../../../components/audit/ManagerDashboard';

export default function ManagerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication and role
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('audit_token');
        if (!token) {
          router.push('/audit/login');
          return;
        }

        // Decode token to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Check if user is Manager or Admin
        if (payload.role !== 'MANAGER' && payload.role !== 'ADMIN') {
          router.push('/audit/unauthorized');
          return;
        }

        setUser(payload);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/audit/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <ManagerDashboard user={user} />;
}
