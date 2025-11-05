'use client';

import { useState, useEffect } from 'react';
import { DefectKnowledge } from '@/types/defect-library.types';

interface DefectProfileProps {
  defectType: string;
}

export function DefectProfile({ defectType }: DefectProfileProps) {
  const [defect, setDefect] = useState<DefectKnowledge | null>(null);
  const [activeTab, setActiveTab] = useState<'causes' | 'remedies' | 'prevention' | 'standards'>('causes');

  useEffect(() => {
    fetch(`/api/defects?type=${defectType}`)
      .then(res => res.json())
      .then(data => setDefect(data))
      .catch(console.error);
  }, [defectType]);

  if (!defect) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-2xl">
          ⚠️
        </div>
        <div>
          <h2 className="text-2xl font-bold capitalize">{defect.defectType.replace('_', ' ')}</h2>
          <p className="text-gray-600">{defect.definition}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 border-b">
        {(['causes', 'remedies', 'prevention', 'standards'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize ${activeTab === tab ? 'border-b-2 border-blue-600 font-semibold' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {activeTab === 'causes' && (
          <>
            <h3 className="font-semibold">Common Causes:</h3>
            <ul className="list-disc list-inside space-y-1">
              {defect.causes.map((cause, i) => (
                <li key={i} className="text-gray-700">{cause}</li>
              ))}
            </ul>
          </>
        )}

        {activeTab === 'remedies' && (
          <>
            <h3 className="font-semibold">Recommended Remedies:</h3>
            <ul className="list-disc list-inside space-y-1">
              {defect.remedies.map((remedy, i) => (
                <li key={i} className="text-gray-700">{remedy}</li>
              ))}
            </ul>
          </>
        )}

        {activeTab === 'prevention' && (
          <>
            <h3 className="font-semibold">Preventive Measures:</h3>
            <ul className="list-disc list-inside space-y-1">
              {defect.preventiveMeasures.map((measure, i) => (
                <li key={i} className="text-gray-700">{measure}</li>
              ))}
            </ul>
          </>
        )}

        {activeTab === 'standards' && (
          <>
            <h3 className="font-semibold">Standards Reference:</h3>
            {Object.entries(defect.standardsReference).map(([standard, ref]) => (
              <div key={standard} className="border-l-4 border-blue-500 pl-4 mb-3">
                <div className="font-semibold">{standard}</div>
                <div className="text-sm text-gray-600">Clause: {ref.clause}</div>
                <div className="text-sm">{ref.acceptanceCriteria}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
