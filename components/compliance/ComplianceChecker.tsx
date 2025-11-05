'use client';

import { useState } from 'react';
import { Detection } from '@/types/project.types';
import { ComplianceResult } from '@/types/compliance.types';

interface ComplianceCheckerProps {
  detections: Detection[];
  onComplianceCheck?: (result: ComplianceResult) => void;
}

export function ComplianceChecker({ detections, onComplianceCheck }: ComplianceCheckerProps) {
  const [standard, setStandard] = useState('AWS D1.1');
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(false);

  const checkCompliance = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/compliance/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detections, standard, componentType: 'structural' })
      });
      
      const data = await response.json();
      setResult(data);
      onComplianceCheck?.(data);
    } catch (error) {
      console.error('Compliance check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Compliance Check</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Standard</label>
        <select
          value={standard}
          onChange={(e) => setStandard(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="AWS D1.1">AWS D1.1</option>
          <option value="ASME B31.3">ASME B31.3</option>
        </select>
      </div>

      <button
        onClick={checkCompliance}
        disabled={loading || detections.length === 0}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Checking...' : 'Check Compliance'}
      </button>

      {result && (
        <div className="mt-6">
          <div className={`p-4 rounded mb-4 ${result.overallStatus === 'pass' ? 'bg-green-100' : 'bg-red-100'}`}>
            <h4 className="font-bold text-lg">
              Status: {result.overallStatus.toUpperCase()}
            </h4>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Total Defects:</span>
              <span className="font-semibold">{result.summary.totalDefects}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Accepted:</span>
              <span className="font-semibold">{result.summary.acceptedDefects}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Rejected:</span>
              <span className="font-semibold">{result.summary.rejectedDefects}</span>
            </div>
          </div>

          {result.recommendations.length > 0 && (
            <div className="border-t pt-4">
              <h5 className="font-semibold mb-2">Recommendations:</h5>
              <ul className="list-disc list-inside space-y-1">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
