'use client';

import React, { useState } from 'react';
import { PDCAStage } from '@/types/audit-form.types';

interface ImprovementActionPlannerProps {
  auditId: string;
  siteId: string;
  siteName: string;
  originalScore?: number;
  onActionCreated?: (action: any) => void;
}

export default function ImprovementActionPlanner({
  auditId,
  siteId,
  siteName,
  originalScore,
  onActionCreated
}: ImprovementActionPlannerProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rootCause: '',
    pdcaStage: 'plan' as PDCAStage,
    priority: 'medium' as 'critical' | 'high' | 'medium' | 'low',
    relatedISOClause: '',
    targetDate: '',
    assignedTo: '',
    assignedToName: '',
    correctiveActions: [''],
    preventiveActions: [''],
    resourcesRequired: [''],
    estimatedCost: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleArrayChange = (field: 'correctiveActions' | 'preventiveActions' | 'resourcesRequired', index: number, value: string) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field: 'correctiveActions' | 'preventiveActions' | 'resourcesRequired') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'correctiveActions' | 'preventiveActions' | 'resourcesRequired', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate
      if (!formData.title || !formData.description || !formData.relatedISOClause || !formData.targetDate) {
        throw new Error('Please fill in all required fields');
      }

      // Filter out empty array items
      const correctiveActions = formData.correctiveActions.filter(a => a.trim());
      const preventiveActions = formData.preventiveActions.filter(a => a.trim());
      const resourcesRequired = formData.resourcesRequired.filter(r => r.trim());

      if (correctiveActions.length === 0) {
        throw new Error('At least one corrective action is required');
      }

      const response = await fetch('/api/audit/improvement/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditId,
          siteId,
          siteName,
          ...formData,
          correctiveActions,
          preventiveActions,
          resourcesRequired,
          estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create improvement action');
      }

      setSuccess(true);
      if (onActionCreated) {
        onActionCreated(data.action);
      }

      // Reset form
      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          rootCause: '',
          pdcaStage: 'plan',
          priority: 'medium',
          relatedISOClause: '',
          targetDate: '',
          assignedTo: '',
          assignedToName: '',
          correctiveActions: [''],
          preventiveActions: [''],
          resourcesRequired: [''],
          estimatedCost: ''
        });
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Improvement Action</h2>
        <p className="text-sm text-gray-600 mt-1">
          Plan corrective and preventive actions based on audit findings
        </p>
        {originalScore !== undefined && (
          <div className="mt-2 text-sm text-gray-700">
            <span className="font-medium">Current Compliance Score:</span> {originalScore}%
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">Improvement action created successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the improvement action"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Detailed description of what needs to be improved and why"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Root Cause Analysis
            </label>
            <textarea
              value={formData.rootCause}
              onChange={(e) => handleInputChange('rootCause', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Identified root cause of the issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PDCA Stage *
            </label>
            <select
              value={formData.pdcaStage}
              onChange={(e) => handleInputChange('pdcaStage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="plan">Plan - Planning Phase</option>
              <option value="do">Do - Implementation Phase</option>
              <option value="check">Check - Verification Phase</option>
              <option value="act">Act - Standardization Phase</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority *
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="critical">Critical - Immediate Action Required</option>
              <option value="high">High - Urgent</option>
              <option value="medium">Medium - Important</option>
              <option value="low">Low - Can be Scheduled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Related ISO Clause *
            </label>
            <input
              type="text"
              value={formData.relatedISOClause}
              onChange={(e) => handleInputChange('relatedISOClause', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 8.5.1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Completion Date *
            </label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => handleInputChange('targetDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Corrective Actions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Corrective Actions * (What will be done to fix the issue)
          </label>
          {formData.correctiveActions.map((action, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={action}
                onChange={(e) => handleArrayChange('correctiveActions', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Corrective action ${index + 1}`}
              />
              {formData.correctiveActions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('correctiveActions', index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('correctiveActions')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Another Corrective Action
          </button>
        </div>

        {/* Preventive Actions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preventive Actions (What will prevent recurrence)
          </label>
          {formData.preventiveActions.map((action, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={action}
                onChange={(e) => handleArrayChange('preventiveActions', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Preventive action ${index + 1}`}
              />
              {formData.preventiveActions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('preventiveActions', index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('preventiveActions')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Another Preventive Action
          </button>
        </div>

        {/* Resources Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resources Required
          </label>
          {formData.resourcesRequired.map((resource, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={resource}
                onChange={(e) => handleArrayChange('resourcesRequired', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Resource ${index + 1}`}
              />
              {formData.resourcesRequired.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('resourcesRequired', index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('resourcesRequired')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Another Resource
          </button>
        </div>

        {/* Assignment and Cost */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned To (Name)
            </label>
            <input
              type="text"
              value={formData.assignedToName}
              onChange={(e) => handleInputChange('assignedToName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Person responsible for this action"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Cost ($)
            </label>
            <input
              type="number"
              value={formData.estimatedCost}
              onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
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
            {isSubmitting ? 'Creating...' : 'Create Improvement Action'}
          </button>
        </div>
      </form>
    </div>
  );
}
