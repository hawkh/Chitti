'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Mail, Save, Check } from 'lucide-react';

interface NotificationTypePreference {
  inApp: boolean;
  email: boolean;
}

interface NotificationPreferences {
  inAppEnabled: boolean;
  emailEnabled: boolean;
  notificationTypes: {
    AUDIT_SUBMITTED?: NotificationTypePreference;
    AUDIT_ASSIGNED?: NotificationTypePreference;
    AUDIT_APPROVED?: NotificationTypePreference;
    AUDIT_REJECTED?: NotificationTypePreference;
    AUDIT_OVERDUE?: NotificationTypePreference;
    AUDIT_ESCALATED?: NotificationTypePreference;
    COMMENT_ADDED?: NotificationTypePreference;
  };
}

const NOTIFICATION_TYPES = [
  { key: 'AUDIT_SUBMITTED', label: 'Audit Submitted', description: 'When a new audit is submitted for review' },
  { key: 'AUDIT_ASSIGNED', label: 'Audit Assigned', description: 'When an audit is assigned to you' },
  { key: 'AUDIT_APPROVED', label: 'Audit Approved', description: 'When your audit is approved' },
  { key: 'AUDIT_REJECTED', label: 'Audit Rejected', description: 'When your audit requires revision' },
  { key: 'AUDIT_OVERDUE', label: 'Audit Overdue', description: 'When an audit review is overdue' },
  { key: 'AUDIT_ESCALATED', label: 'Audit Escalated', description: 'When an overdue audit is escalated' },
  { key: 'COMMENT_ADDED', label: 'Comment Added', description: 'When someone comments on an audit' },
];

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    inAppEnabled: true,
    emailEnabled: true,
    notificationTypes: {},
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Initialize preferences
  useEffect(() => {
    // Set default preferences for all notification types
    const defaultTypes: NotificationPreferences['notificationTypes'] = {};
    NOTIFICATION_TYPES.forEach((type) => {
      defaultTypes[type.key as keyof typeof defaultTypes] = {
        inApp: true,
        email: true,
      };
    });

    setPreferences((prev) => ({
      ...prev,
      notificationTypes: defaultTypes,
    }));
  }, []);

  // Save preferences
  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/audit/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle global in-app notifications
  const toggleInApp = () => {
    setPreferences((prev) => ({
      ...prev,
      inAppEnabled: !prev.inAppEnabled,
    }));
  };

  // Toggle global email notifications
  const toggleEmail = () => {
    setPreferences((prev) => ({
      ...prev,
      emailEnabled: !prev.emailEnabled,
    }));
  };

  // Toggle specific notification type
  const toggleNotificationType = (
    typeKey: string,
    channel: 'inApp' | 'email'
  ) => {
    setPreferences((prev) => {
      const currentType = prev.notificationTypes[typeKey as keyof typeof prev.notificationTypes] || {
        inApp: true,
        email: true,
      };

      return {
        ...prev,
        notificationTypes: {
          ...prev.notificationTypes,
          [typeKey]: {
            ...currentType,
            [channel]: !currentType[channel],
          },
        },
      };
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Notification Preferences
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage how you receive notifications about audit activities
          </p>
        </div>

        {/* Global Settings */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Global Settings
          </h3>
          <div className="space-y-4">
            {/* In-App Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">In-App Notifications</p>
                  <p className="text-sm text-gray-600">
                    Show notifications in the application
                  </p>
                </div>
              </div>
              <button
                onClick={toggleInApp}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.inAppEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.inAppEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <button
                onClick={toggleEmail}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.emailEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Notification Types
          </h3>
          <div className="space-y-4">
            {NOTIFICATION_TYPES.map((type) => {
              const typePrefs = preferences.notificationTypes[
                type.key as keyof typeof preferences.notificationTypes
              ] || { inApp: true, email: true };

              return (
                <div
                  key={type.key}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{type.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {/* In-App Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={typePrefs.inApp && preferences.inAppEnabled}
                        onChange={() => toggleNotificationType(type.key, 'inApp')}
                        disabled={!preferences.inAppEnabled}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">In-App</span>
                    </label>

                    {/* Email Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={typePrefs.email && preferences.emailEnabled}
                        onChange={() => toggleNotificationType(type.key, 'email')}
                        disabled={!preferences.emailEnabled}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Email</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {saved && (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span className="text-sm font-medium">Preferences saved</span>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={loading}
              className="ml-auto flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
