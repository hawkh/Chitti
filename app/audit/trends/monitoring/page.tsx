'use client';

import React from 'react';
import TrendMonitoringDashboard from '@/components/audit/TrendMonitoringDashboard';

export default function TrendMonitoringPage() {
  // In a real application, these would come from authentication context
  const mockUser = {
    id: 'user-123',
    role: 'manager' as const,
    siteId: 'site-001',
    siteName: 'Manufacturing Plant A'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <TrendMonitoringDashboard
          siteId={mockUser.siteId}
          siteName={mockUser.siteName}
          userId={mockUser.id}
          userRole={mockUser.role}
        />
      </div>
    </div>
  );
}
