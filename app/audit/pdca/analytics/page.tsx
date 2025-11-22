'use client';

import React from 'react';
import PDCAAnalyticsDashboard from '@/components/audit/PDCAAnalyticsDashboard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PDCAAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/audit/pdca"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to PDCA Dashboard</span>
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              PDCA Analytics & Reporting
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive analysis of PDCA methodology implementation across your organization
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex gap-3">
            <Link
              href="/audit/improvement"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <span>Improvement Actions</span>
            </Link>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <PDCAAnalyticsDashboard
          onExport={() => {
            console.log('Analytics exported');
          }}
        />
      </div>
    </div>
  );
}
