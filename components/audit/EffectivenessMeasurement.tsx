'use client';

import React, { useState } from 'react';

interface EffectivenessMeasurementProps {
  improvementActionId: string;
  actionTitle: string;
  beforeScore: number;
  onMeasurementRecorded?: (metrics: any) => void;
}

export default function EffectivenessMeasurement({
  improvementActionId,
  actionTitle,
  beforeScore,
  onMeasurementRecorded
}: EffectivenessMeasurementProps) {
  const [formData, setFormData] = useState({
    afterScore: '',
    verificationMethod: 'audit' as 'audit' | 'measurement' | 'observation' | 'documentation',
    verifiedBy: '',
    verifiedByName: '',
    sustainabilityScore: '100',
    findings: ['']
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [calculatedMetrics, setCalculatedMetrics] = useState<any>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);

    // Calculate metrics when after score changes
    if (field === 'afterScore' && value) {
      const after = parseFloat(value);
      if (!isNaN(after) && after >= 0 && after <= 100) {
        const improvement = after - beforeScore;
        const improvementPercentage = beforeScore > 0 
          ? Math.round((improvement / beforeScore) * 100) 
          : 0;
        const isEffective = improvement >= 10 && after >= 70;

        setCalculatedMetrics({
          improvement,
          improvementPercentage,
          isEffective
        });
      }
    }
  };

  const handleFindingChange = (index: number, value: string) => {
    setFormData(prev => {
      const newFindings = [...prev.findings];
      newFindings[index] = value;
      return { ...prev, findings: newFindings };
    });
  };

  const addFinding = () => {
    setFormData(prev => ({
      ...prev,
      findings: [...prev.findings, '']
    }));
  };

  const removeFinding = (index: number) => {
    setFormData(prev => ({
      ...prev,
      findings: prev.findings.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate
      if (!formData.afterScore || !formData.verifiedByName) {
        throw new Error('Please fill in all required fields');
      }

      const afterScore = parseFloat(formData.afterScore);
      if (isNaN(afterScore) || afterScore < 0 || afterScore > 100) {
        throw new Error('After score must be between 0 and 100');
      }

      const sustainabilityScore = parseFloat(formData.sustainabilityScore);
      if (isNaN(sustainabilityScore) || sustainabilityScore < 0 || sustainabilityScore > 100) {
        throw new Error('Sustainability score must be between 0 and 100');
      }

      const findings = formData.findings.filter(f => f.trim());

      const response = await fetch('/api/audit/improvement/effectiveness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          improvementActionId,
          beforeScore,
          afterScore,
          verificationMethod: formData.verificationMethod,
          verifiedBy: formData.verifiedBy || 'current_user',
          verifiedByName: formData.verifiedByName,
          findings,
          sustainabilityScore
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to record effectiveness measurement');
      }

      setSuccess(true);
      if (onMeasurementRecorded) {
        onMeasurementRecorded(data.metrics);
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
        <h2 className="text-2xl font-bold text-gray-900">Measure Improvement Effectiveness</h2>
        <p className="text-sm text-gray-600 mt-1">
          Verify and document the effectiveness of improvement actions
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
          <p className="text-sm text-green-800">Effectiveness measurement recorded successfully!</p>
        </div>
      )}

      {/* Baseline Score Display */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Baseline Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600">Before Score (Baseline)</p>
            <p className="text-2xl font-bold text-gray-900">{beforeScore}%</p>
          </div>
          {calculatedMetrics && (
            <>
              <div>
                <p className="text-xs text-gray-600">After Score (Current)</p>
                <p className="text-2xl font-bold text-gray-900">{formData.afterScore}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Improvement</p>
                <p className={`text-2xl font-bold ${calculatedMetrics.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculatedMetrics.improvement >= 0 ? '+' : ''}{calculatedMetrics.improvement}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Status</p>
                <p className={`text-lg font-semibold ${calculatedMetrics.isEffective ? 'text-green-600' : 'text-orange-600'}`}>
                  {calculatedMetrics.isEffective ? '✓ Effective' : '⚠ Needs Review'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Measurement Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              After Score (Current Compliance) *
            </label>
            <input
              type="number"
              value={formData.afterScore}
              onChange={(e) => handleInputChange('afterScore', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0-100"
              min="0"
              max="100"
              step="0.1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Current compliance score after implementing improvements
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Method *
            </label>
            <select
              value={formData.verificationMethod}
              onChange={(e) => handleInputChange('verificationMethod', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="audit">Follow-Up Audit</option>
              <option value="measurement">Performance Measurement</option>
              <option value="observation">Direct Observation</option>
              <option value="documentation">Documentation Review</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verified By (Name) *
            </label>
            <input
              type="text"
              value={formData.verifiedByName}
              onChange={(e) => handleInputChange('verifiedByName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Verifier name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sustainability Score (0-100)
            </label>
            <input
              type="number"
              value={formData.sustainabilityScore}
              onChange={(e) => handleInputChange('sustainabilityScore', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="100"
              step="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Likelihood that improvements will be sustained (100 = highly sustainable)
            </p>
          </div>
        </div>

        {/* Findings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Findings
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Document key observations and evidence from the verification process
          </p>
          {formData.findings.map((finding, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <textarea
                value={finding}
                onChange={(e) => handleFindingChange(index, e.target.value)}
                rows={2}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Finding ${index + 1}`}
              />
              {formData.findings.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFinding(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md self-start"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addFinding}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Another Finding
          </button>
        </div>

        {/* Effectiveness Criteria Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Effectiveness Criteria</h3>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>Improvement of at least 10 percentage points from baseline</li>
            <li>After score of 70% or higher</li>
            <li>Sustainability score of 70% or higher for long-term success</li>
            <li>All corrective actions fully implemented</li>
            <li>No recurrence of original non-conformities</li>
          </ul>
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
            {isSubmitting ? 'Recording...' : 'Record Effectiveness Measurement'}
          </button>
        </div>
      </form>
    </div>
  );
}
