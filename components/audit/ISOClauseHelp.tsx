'use client';

import React, { useState } from 'react';
import { 
  getClauseReference, 
  getClauseHelpText, 
  generateAuditGuidance,
  ISOClauseReference,
  ISOClauseHelpText
} from '@/lib/audit/iso-clause-mapping';

interface ISOClauseHelpProps {
  clause: string;
  mode?: 'tooltip' | 'inline' | 'modal';
  showFullGuidance?: boolean;
}

export default function ISOClauseHelp({ 
  clause, 
  mode = 'tooltip',
  showFullGuidance = false 
}: ISOClauseHelpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const reference = getClauseReference(clause);
  const helpText = getClauseHelpText(clause);

  if (!reference || !helpText) {
    return null;
  }

  if (mode === 'tooltip') {
    return (
      <div className="relative inline-block">
        <button
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
          aria-label="Help"
        >
          ?
        </button>
        {isOpen && (
          <div className="absolute z-50 w-80 p-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl left-0">
            <div className="mb-2">
              <span className="text-sm font-semibold text-blue-600">{reference.clause}</span>
              <h4 className="text-sm font-semibold text-gray-900">{reference.title}</h4>
            </div>
            <p className="text-xs text-gray-700 mb-3">{helpText.shortHelp}</p>
            {showFullGuidance && (
              <>
                <div className="mb-2">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Audit Tips:</p>
                  <ul className="text-xs text-gray-600 list-disc list-inside space-y-0.5">
                    {helpText.auditTips.slice(0, 3).map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Evidence Examples:</p>
                  <ul className="text-xs text-gray-600 list-disc list-inside space-y-0.5">
                    {reference.evidenceExamples.slice(0, 3).map((ex, idx) => (
                      <li key={idx}>{ex}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  if (mode === 'inline') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-3">
        <div className="flex items-start gap-2 mb-2">
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-xs font-bold">
            i
          </div>
          <div className="flex-1">
            <div className="mb-1">
              <span className="text-sm font-semibold text-blue-600">{reference.clause}</span>
              <span className="text-sm text-gray-600 ml-2">{reference.title}</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">{helpText.detailedHelp}</p>
            
            {showFullGuidance && (
              <>
                <div className="mb-2">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Key Requirements:</p>
                  <ul className="text-xs text-gray-600 list-disc list-inside space-y-0.5">
                    {reference.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-2">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Audit Tips:</p>
                  <ul className="text-xs text-gray-600 list-disc list-inside space-y-0.5">
                    {helpText.auditTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-2">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Evidence to Look For:</p>
                  <ul className="text-xs text-gray-600 list-disc list-inside space-y-0.5">
                    {reference.evidenceExamples.map((ex, idx) => (
                      <li key={idx}>{ex}</li>
                    ))}
                  </ul>
                </div>

                <details className="mt-2">
                  <summary className="text-xs font-semibold text-blue-600 cursor-pointer hover:text-blue-700">
                    Show Pass/Fail Examples
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-green-700 mb-1">✓ Pass Examples:</p>
                      <ul className="text-xs text-gray-600 list-disc list-inside space-y-0.5">
                        {helpText.passExamples.map((ex, idx) => (
                          <li key={idx}>{ex}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-700 mb-1">✗ Fail Examples:</p>
                      <ul className="text-xs text-gray-600 list-disc list-inside space-y-0.5">
                        {helpText.failExamples.map((ex, idx) => (
                          <li key={idx}>{ex}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </details>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'modal') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          View Guidance
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {reference.clause} - {reference.title}
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{reference.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Requirements</h4>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    {reference.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Audit Tips</h4>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    {helpText.auditTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Evidence Examples</h4>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    {reference.evidenceExamples.map((ex, idx) => (
                      <li key={idx}>{ex}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-green-700 mb-2">✓ Pass Examples</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      {helpText.passExamples.map((ex, idx) => (
                        <li key={idx}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-red-700 mb-2">✗ Fail Examples</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      {helpText.failExamples.map((ex, idx) => (
                        <li key={idx}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {reference.commonFindings.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Common Findings</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      {reference.commonFindings.map((finding, idx) => (
                        <li key={idx}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {reference.relatedClauses.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Related Clauses</h4>
                    <div className="flex flex-wrap gap-2">
                      {reference.relatedClauses.map((relatedClause, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {relatedClause}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}

// Compact version for use in forms
export function ISOClauseHelpCompact({ clause }: { clause: string }) {
  const helpText = getClauseHelpText(clause);
  
  if (!helpText) return null;

  return (
    <div className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
      <svg className="w-4 h-4 flex-shrink-0 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{helpText.shortHelp}</span>
    </div>
  );
}
