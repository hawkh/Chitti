'use client';

import { useState, useEffect } from 'react';
import { DefectProfile } from '@/components/defect-library/DefectProfile';
import { DefectKnowledge } from '@/types/defect-library.types';

export default function DefectLibraryPage() {
  const [defects, setDefects] = useState<DefectKnowledge[]>([]);
  const [selectedDefect, setSelectedDefect] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/defects')
      .then(res => res.json())
      .then(setDefects)
      .catch(console.error);
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Defect Knowledge Library</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-4">Defect Types</h2>
            <div className="space-y-2">
              {defects.map(defect => (
                <button
                  key={defect.id}
                  onClick={() => setSelectedDefect(defect.defectType)}
                  className={`w-full text-left px-4 py-2 rounded hover:bg-gray-100 ${
                    selectedDefect === defect.defectType ? 'bg-blue-100' : ''
                  }`}
                >
                  <div className="font-medium capitalize">{defect.defectType.replace('_', ' ')}</div>
                  <div className="text-xs text-gray-600">{defect.severity}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedDefect ? (
            <DefectProfile defectType={selectedDefect} />
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Select a defect type to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
