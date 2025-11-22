'use client';

import React, { useState, useEffect } from 'react';
import { PDCAStage } from '@/types/audit-form.types';

interface FollowUpAuditSchedulerProps {
  improvementActionId: string;
  originalAuditId: string;
  siteId: string;
  siteName: string;
  actionTitle: string;
  onScheduled?: (followUp: any) => void;
}

export default function FollowUpAuditScheduler({
  improvementActionId,
  originalAuditId,
  siteId,
  siteName,
  actionTitle,
  onScheduled
}: FollowUpAuditSchedulerProps) {
  const [formData, setFormData] = useState({
    scheduledDate: '',
    pdcaStage: 'check' as PDCAStage,
    assignedInspector: '',
    assignedInspectorName: '',
    focusAreas: [''],
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);

  // Load recommendations on mount
  useEffect(() => {
    // In production, fetch from API
    const mockRecommendations = {
      recommendedDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      focusAreas: [
        `Verify implementation of: ${actionTitle}`,
        'Review compliance with related ISO clauses',
        'Assess sustainability of improvements',
        'Validate corrective action effectiveness'
      ],
      verificationCriteria: [
        'Compliance score improvement of at least 10%',
        'All corrective actions fully implemented',
        'No recurrence of original non-conformities',
        'Process changes documented and standardized'
      ]
    };
    setRecommendations(mockRecommendations);
    setFormData(prev => ({
      ...prev,
      scheduledDate: mockRecommendations.recommendedDate,
      focusAreas: mockRecommendations.focusAreas
    }));
  }, [actionTitle]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleFocusAreaChange = (index: number, value: string) => {
    setFormData(prev => {
      const newFocusAreas = [...prev.focusAreas];
      newFocusAreas[index] = value;
      return { ...prev, focusAreas: newFocusAreas };
    });
  };

  const addFocusArea = () => {
    setFormData(prev => ({
      ...prev,
      focusAreas: [...prev.focusAreas, '']
    }));
  };

  const removeFocusArea = (index: number) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate
      if (!formData.scheduledDate) {
        throw new Error('Scheduled date is required');
      }

      const focusAreas = formData.focusAreas.filter(f => f.trim());
      if (focusAreas.length === 0) {
        throw new Error('At least one focus area is required');
      }

      const response = await fetch('/api/audit/improvement/follow-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          improvementActionId,
          originalAuditId,
          siteId,
          siteName,
          scheduledDate: formData.scheduledDate,
          pdcaStage: formData.pdcaStage,
          focusAreas,
          assignedInspector: formData.assignedInspector || undefined,
          assignedInspectorName: formData.assignedInspectorName || undefined,
          notes: formData.notes || undefined
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to schedule follow-up audit');
      }

      setSuccess(true);
      if (onScheduled) {
        onScheduled(data.followUp);
      }

      // Reset form after delay
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Schedule Follow-Up Audit</h2>
        <p className="text-sm text-gray-600 mt-1">
          Plan verification audit to measure improvement effectiveness
        </p>
        <div className="mt-2 text-sm text-gray-700">
          <span className="font-medium">Improvement Action:</span> {actionTitle}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">Follow-up audit scheduled successfully!</p>
        </div>
      )}

      {/* Recommendations Panel */}
      {recommendations && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Recommendations</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <span className="font-medium">Recommended Date:</span>{' '}
              {new Date(recommendations.recommendedDate).toLocaleDateString()}
              <span className="text-xs ml-2">(3 weeks after completion)</span>
            </p>
            <div>
              <span className="font-medium">Verification Criteria:</span>
              <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                {recommendations.verificationCriteria.map((criteria: string, idx: number) => (
                  <li key={idx} className="text-xs">{criteria}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scheduled Date *
            </label>
            <input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 2-4 weeks after action completion
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PDCA Stage
            </label>
            <select
              value={formData.pdcaStage}
              onChange={(e) => handleInputChange('pdcaStage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="check">Check - Verification Audit</option>
              <option value="act">Act - Standardization Audit</option>
              <option value="plan">Plan - Planning Review</option>
              <option value="do">Do - Implementation Review</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Inspector (Name)
            </label>
            <input
              type="text"
              value={formData.assignedInspectorName}
              onChange={(e) => handleInputChange('assignedInspectorName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Inspector name"
            />
          </div>
        </div>

        {/* Focus Areas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Focus Areas * (What to verify during the audit)
          </label>
          {formData.focusAreas.map((area, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={area}
                onChange={(e) => handleFocusAreaChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Focus area ${index + 1}`}
              />
              {formData.focusAreas.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFocusArea(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addFocusArea}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Another Focus Area
          </button>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any additional instructions or context for the follow-up audit"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Follow-Up Audit'}
          </button>
        </div>
      </form>
    </div>
  );
}
