'use client';

import { useState } from 'react';
import AuditFormEngine from '@/components/audit/AuditFormEngine';
import OfflineSyncIndicator from '@/components/audit/OfflineSyncIndicator';
import { AuditFormData } from '@/types/audit-form.types';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AuditFormDemoPage() {
  const [savedData, setSavedData] = useState<AuditFormData | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSave = (data: AuditFormData) => {
    setSavedData(data);
    alert('Draft saved successfully!');
    console.log('Saved draft:', data);
  };

  const handleSubmit = (data: AuditFormData) => {
    setSavedData(data);
    setSubmitted(true);
    console.log('Submitted audit:', data);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Audit Submitted Successfully!
          </h1>
          <p className="text-gray-600 mb-6">
            Your audit has been submitted for manager review. You will be notified once it's reviewed.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setSubmitted(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
            >
              Create New Audit
            </button>
            <Link
              href="/audit"
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/audit"
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  ISO 9001:2015 Audit Form
                </h1>
                <p className="text-sm text-gray-600">
                  Dynamic Audit Form Engine Demo
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Demo Mode
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="py-8">
        <AuditFormEngine
          initialData={savedData || undefined}
          onSave={handleSave}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Offline Sync Indicator */}
      <OfflineSyncIndicator />

      {/* Info Footer */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Form Features:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Collapsible sections for easy navigation</li>
            <li>✓ Pass/Fail/N/A response options with validation</li>
            <li>✓ Severity level selection for failed items</li>
            <li>✓ Comment fields for detailed observations</li>
            <li>✓ <strong>Real-time progress tracking</strong> with overall and section completion</li>
            <li>✓ <strong>Required field indicators</strong> showing X/Y required items</li>
            <li>✓ <strong>Comprehensive validation</strong> with errors and warnings</li>
            <li>✓ <strong>Smart submission blocking</strong> until all required fields complete</li>
            <li>✓ <strong>Auto-scroll to errors</strong> for easy correction</li>
            <li>✓ Help text and corrective action templates</li>
            <li>✓ Evidence upload with offline queue support</li>
            <li>✓ <strong>Offline mode</strong> with automatic sync when online</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
