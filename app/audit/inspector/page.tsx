'use client';

import { useState, useEffect } from 'react';
import AuditFormEngine from '@/components/audit/AuditFormEngine';
import OfflineSyncIndicator from '@/components/audit/OfflineSyncIndicator';
import { AuditFormData } from '@/types/audit-form.types';
import { ArrowLeft, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function InspectorAuditPage() {
  const [savedData, setSavedData] = useState<AuditFormData | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSave = (data: AuditFormData) => {
    setSavedData(data);
    // Save to local storage for offline persistence
    localStorage.setItem('audit_draft', JSON.stringify(data));
    alert('Draft saved successfully!');
    console.log('Saved draft:', data);
  };

  const handleSubmit = (data: AuditFormData) => {
    setSavedData(data);
    setSubmitted(true);
    // Clear draft from local storage
    localStorage.removeItem('audit_draft');
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
                  Inspector Field Audit
                </p>
              </div>
            </div>
            {mounted && (
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <div className="flex items-center space-x-2 text-green-600 text-sm">
                    <Wifi className="h-4 w-4" />
                    <span>Online</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-orange-600 text-sm">
                    <WifiOff className="h-4 w-4" />
                    <span>Offline Mode</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Offline Notice */}
      {mounted && !isOnline && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <WifiOff className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-orange-900 mb-1">
                  Working Offline
                </h3>
                <p className="text-sm text-orange-800">
                  You're currently offline. Your audit will be saved locally and evidence uploads will be queued. 
                  Everything will sync automatically when you're back online.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="py-8">
        <AuditFormEngine
          initialData={savedData || undefined}
          onSave={handleSave}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Offline Sync Indicator - Shows queue status */}
      <OfflineSyncIndicator />

      {/* Info Footer */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Offline Capabilities:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Work without internet connection</li>
            <li>✓ Automatic draft saving to local storage</li>
            <li>✓ Evidence uploads queued when offline</li>
            <li>✓ Automatic sync when connection restored</li>
            <li>✓ Retry logic for failed uploads</li>
            <li>✓ Real-time sync status indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
