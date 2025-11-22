'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, MapPin, Settings, Shield } from 'lucide-react';
import UserManagement from '@/components/audit/UserManagement';
import SiteManagement from '@/components/audit/SiteManagement';
import { AuditUser } from '@/types/audit';

export default function AdminPanel() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuditUser | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'sites'>('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('audit_token');
      if (!token) {
        router.push('/audit/login');
        return;
      }

      const response = await fetch('/api/audit/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user.userType !== 'ADMIN') {
          alert('Access denied. Admin privileges required.');
          router.push('/audit/dashboard');
          return;
        }
        setCurrentUser(data.user);
      } else {
        router.push('/audit/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/audit/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">System administration and configuration</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/audit/dashboard')}
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
            >
              <Settings className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </button>
            <button
              onClick={() => setActiveTab('sites')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'sites'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Site Management</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'users' && <UserManagement currentUser={currentUser} />}
        {activeTab === 'sites' && <SiteManagement currentUser={currentUser} />}
      </div>
    </div>
  );
}
