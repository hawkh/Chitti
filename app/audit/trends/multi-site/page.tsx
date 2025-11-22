'use client';

import React from 'react';
import TrendMonitoringDashboard from '@/components/audit/TrendMonitoringDashboard';

export default function MultiSiteTrendMonitoringPage() {
  // In a real application, these would come from authentication context
  const mockUser = {
    id: 'user-123',
    role: 'admin' as const
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <TrendMonitoringDashboard
          userId={mockUser.id}
          userRole={mockUser.role}
          showMultipleSites={true}
        />
      </div>
    </div>
  );
}
