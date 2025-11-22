'use client';

import React, { useState } from 'react';
import { 
  Lightbulb, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check,
  AlertCircle,
  Clock,
  User,
  FileText
} from 'lucide-react';
import {
  getTemplatesForClause,
  suggestCorrectiveActions,
  formatTemplateAsText,
  CorrectiveActionTemplate,
  CorrectiveActionSuggestion
} from '@/lib/audit/corrective-action-templates';

interface CorrectiveActionSuggestionsProps {
  clause: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  onSelect?: (template: CorrectiveActionTemplate) => void;
  compact?: boolean;
}

export default function CorrectiveActionSuggestions({
  clause,
  severity,
  onSelect,
  compact = false
}: CorrectiveActionSuggestionsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const suggestions = suggestCorrectiveActions(clause, severity);

  if (suggestions.length === 0) {
    return null;
  }

  const handleCopy = async (template: CorrectiveActionTemplate) => {
    const text = formatTemplateAsText(template);
    await navigator.clipboard.writeText(text);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelect = (template: CorrectiveActionTemplate) => {
    if (onSelect) {
      onSelect(template);
    }
  };

  if (compact) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-blue-900 mb-1">
              Suggested Corrective Actions
            </p>
            <ul className="text-xs text-blue-800 space-y-1">
              {suggestions.slice(0, 3).map(({ template }) => (
                <li key={template.id} className="flex items-start gap-1">
                  <span className="text-blue-600">•</span>
                  <button
                    onClick={() => handleSelect(template)}
                    className="text-left hover:underline"
                  >
                    {template.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Lightbulb className="h-5 w-5 text-white" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">
            Suggested Corrective Actions
          </h4>
          <p className="text-xs text-gray-600">
            {suggestions.length} recommendation{suggestions.length !== 1 ? 's' : ''} for Clause {clause}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {suggestions.map(({ template, relevanceScore, reason }) => (
          <CorrectiveActionCard
            key={template.id}
            template={template}
            relevanceScore={relevanceScore}
            reason={reason}
            isExpanded={expandedId === template.id}
            isCopied={copiedId === template.id}
            onToggle={() => setExpandedId(expandedId === template.id ? null : template.id)}
            onCopy={() => handleCopy(template)}
            onSelect={() => handleSelect(template)}
          />
        ))}
      </div>
    </div>
  );
}

interface CorrectiveActionCardProps {
  template: CorrectiveActionTemplate;
  relevanceScore: number;
  reason: string;
  isExpanded: boolean;
  isCopied: boolean;
  onToggle: () => void;
  onCopy: () => void;
  onSelect: () => void;
}

function CorrectiveActionCard({
  template,
  relevanceScore,
  reason,
  isExpanded,
  isCopied,
  onToggle,
  onCopy,
  onSelect
}: CorrectiveActionCardProps) {
  const severityColors = {
    low: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    medium: 'bg-orange-100 text-orange-800 border-orange-300',
    high: 'bg-red-100 text-red-800 border-red-300',
    critical: 'bg-purple-100 text-purple-800 border-purple-300'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${severityColors[template.severity]}`}>
                {template.severity.toUpperCase()}
              </span>
              {relevanceScore >= 150 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-300">
                  Highly Relevant
                </span>
              )}
            </div>
            <h5 className="text-sm font-semibold text-gray-900 mb-1">
              {template.title}
            </h5>
            <p className="text-xs text-gray-600">
              {template.description}
            </p>
          </div>
          <button
            onClick={onToggle}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Quick Info */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{template.timeframe}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{template.responsibleRole}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{template.actionSteps.length} steps</span>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <div className="space-y-3">
            {/* Action Steps */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Action Steps:</p>
              <ol className="text-xs text-gray-600 space-y-1.5">
                {template.actionSteps.map((step, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="font-semibold text-blue-600 flex-shrink-0">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Verification Method */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">Verification Method:</p>
              <p className="text-xs text-gray-600">{template.verificationMethod}</p>
            </div>

            {/* Related Documents */}
            {template.relatedDocuments.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">Related Documents:</p>
                <div className="flex flex-wrap gap-1">
                  {template.relatedDocuments.map((doc, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={onSelect}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
              >
                <Check className="h-3 w-3" />
                Use This Template
              </button>
              <button
                onClick={onCopy}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact inline version for use in forms
export function CorrectiveActionQuickSuggestions({
  clause,
  severity,
  onSelect
}: {
  clause: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  onSelect?: (template: CorrectiveActionTemplate) => void;
}) {
  const templates = getTemplatesForClause(clause);
  const filteredTemplates = severity 
    ? templates.filter(t => t.severity === severity)
    : templates;

  if (filteredTemplates.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
      <div className="flex items-start gap-2">
        <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-semibold text-blue-900 mb-1">Quick Suggestions:</p>
          <div className="space-y-1">
            {filteredTemplates.slice(0, 2).map(template => (
              <button
                key={template.id}
                onClick={() => onSelect?.(template)}
                className="block w-full text-left text-xs text-blue-700 hover:text-blue-900 hover:underline"
              >
                • {template.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
