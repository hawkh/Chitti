'use client';

import { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Camera,
  Save,
  Send,
  Info
} from 'lucide-react';
import {
  ISO_9001_CHECKLIST
} from '@/lib/audit/iso-checklist';
import {
  AuditResponse,
  AuditFormData,
  PDCAStage
} from '@/types/audit-form.types';
import {
  validateAuditForm,
  calculateSectionProgress,
  calculateOverallProgress,
  getValidationSummary,
  canSubmitForm,
  DetailedValidationResult
} from '@/lib/audit/form-validation';
import PDCAStageSelector from './PDCAStageSelector';
import AuditFormItem from './AuditFormItem';

import RealTimeDetection from '@/components/detection/RealTimeDetection';
import { DetectionResult, DefectSeverity } from '@/types';
import { useQualityContext } from '@/context/QualityContext';

interface AuditFormEngineProps {
  initialData?: AuditFormData;
  onSave?: (data: AuditFormData) => void;
  onSubmit?: (data: AuditFormData) => void;
  readOnly?: boolean;
}

export default function AuditFormEngine({
  initialData,
  onSave,
  onSubmit,
  readOnly = false
}: AuditFormEngineProps) {
  const { addAudit } = useQualityContext();

  const [formData, setFormData] = useState<AuditFormData>(
    initialData || {
      auditDate: new Date(),
      responses: {}
    }
  );

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([ISO_9001_CHECKLIST[0]?.id])
  );

  const [validation, setValidation] = useState<DetailedValidationResult | null>(null);
  const [showValidationSummary, setShowValidationSummary] = useState(false);

  // AI Detection State
  const [showAIDetection, setShowAIDetection] = useState(false);
  const [currentAIItem, setCurrentAIItem] = useState<string | null>(null);

  // Real-time validation on form data change
  useEffect(() => {
    if (showValidationSummary) {
      const validationResult = validateAuditForm(formData);
      setValidation(validationResult);
    }
  }, [formData, showValidationSummary]);

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Update response for an item
  const updateResponse = (
    itemId: string,
    field: keyof AuditResponse,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [itemId]: {
          ...prev.responses[itemId],
          itemId,
          [field]: value
        }
      }
    }));
  };

  // Handle AI Result
  const handleAIResult = (result: DetectionResult, imageBlob: Blob) => {
    if (!currentAIItem) return;

    const hasDefects = result.defects.length > 0;
    const responseValue = hasDefects ? 'fail' : 'pass';

    // Auto-fill response
    updateResponse(currentAIItem, 'response', responseValue);

    // If defects found, set severity and comments
    if (hasDefects) {
      // Determine max severity
      const severities = result.defects.map(d => d.severity);
      let maxSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';

      // Use string comparison since Enum values are strings
      if (severities.includes(DefectSeverity.CRITICAL)) maxSeverity = 'critical';
      else if (severities.includes(DefectSeverity.HIGH)) maxSeverity = 'high';
      else if (severities.includes(DefectSeverity.MEDIUM)) maxSeverity = 'medium';

      updateResponse(currentAIItem, 'severity', maxSeverity);

      // Add comments
      const defectSummary = result.defects
        .map(d => `- ${d.type} (${(d.confidence * 100).toFixed(1)}%): ${d.description}`)
        .join('\n');

      const aiComment = `[AI Verified]\nDefects Detected:\n${defectSummary}\n\nProcessing Time: ${result.processingTime.toFixed(0)}ms`;
      updateResponse(currentAIItem, 'comments', aiComment);
    } else {
      updateResponse(currentAIItem, 'comments', '[AI Verified] No defects detected. Compliance confirmed.');
    }

    // Close modal
    setShowAIDetection(false);
    setCurrentAIItem(null);

    // Note: In a real implementation, we would upload the imageBlob here 
    // and attach it as evidence. For now, we'll simulate it by logging.
    console.log('AI Evidence captured:', imageBlob);
    alert('AI Analysis Complete! Results have been auto-filled into the form.');
  };

  // Handle save draft
  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  // Handle submit
  const handleSubmit = () => {
    // Enable validation display
    setShowValidationSummary(true);

    // Validate form
    const validationResult = validateAuditForm(formData);
    setValidation(validationResult);

    // Check if can submit
    const submitCheck = canSubmitForm(formData);

    if (submitCheck.canSubmit) {
      // Add to global context
      addAudit({
        ...formData,
        status: 'submitted',
        submittedAt: new Date()
      });

      if (onSubmit) {
        onSubmit(formData);
      }

      alert('Audit submitted successfully! Dashboard updated.');
    } else {
      // Scroll to first error
      const firstErrorItem = validationResult.missingRequired[0] || validationResult.incompleteFails[0];
      if (firstErrorItem) {
        const element = document.getElementById(`item-${firstErrorItem}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const progress = calculateOverallProgress(formData.responses);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* AI Detection Modal */}
      {showAIDetection && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowAIDetection(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 z-10"
            >
              <XCircle className="h-6 w-6 text-gray-600" />
            </button>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Camera className="h-6 w-6 text-blue-600" />
                AI Smart Verification
              </h2>
              <p className="text-gray-600 mb-6">
                Capture or upload an image to automatically verify this checklist item.
              </p>
              <RealTimeDetection
                mode="embedded"
                onSave={handleAIResult}
              />
            </div>
          </div>
        </div>
      )}

      {/* PDCA Stage Selection */}
      {!readOnly && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <PDCAStageSelector
            selectedStage={formData.pdcaStage}
            onStageSelect={(stage: PDCAStage) => {
              setFormData(prev => ({ ...prev, pdcaStage: stage }));
            }}
            showGuidance={true}
          />
        </div>
      )}

      {/* Progress Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">ISO 9001:2015 Audit</h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete all required fields to submit the audit
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {progress.percentage}%
            </div>
            <div className="text-sm text-gray-600">
              {progress.answered} of {progress.total} items
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>

        {/* Required Progress Indicator */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Required fields:</span>
            <span className={`font-semibold ${progress.requiredAnswered === progress.requiredTotal
              ? 'text-green-600'
              : 'text-orange-600'
              }`}>
              {progress.requiredAnswered} / {progress.requiredTotal}
            </span>
          </div>
          {progress.requiredAnswered === progress.requiredTotal && (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">All required fields complete</span>
            </div>
          )}
        </div>
      </div>

      {/* Audit Sections */}
      <div className="space-y-4">
        {ISO_9001_CHECKLIST.map((section) => {
          const sectionProgress = calculateSectionProgress(section.id, formData.responses);
          const isExpanded = expandedSections.has(section.id);

          return (
            <div key={section.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center
                    ${sectionProgress.percentage === 100
                      ? 'bg-green-100 text-green-600'
                      : 'bg-blue-100 text-blue-600'}
                  `}>
                    {sectionProgress.percentage === 100 ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <span className="text-sm font-bold">
                        {sectionProgress.percentage}%
                      </span>
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {section.title}
                    </h3>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <span>Clause {section.clauseRange}</span>
                      <span>•</span>
                      <span>{sectionProgress.answered}/{sectionProgress.total} items</span>
                      {sectionProgress.requiredTotal && sectionProgress.requiredTotal > 0 && (
                        <>
                          <span>•</span>
                          <span className={
                            sectionProgress.requiredAnswered === sectionProgress.requiredTotal
                              ? 'text-green-600 font-medium'
                              : 'text-orange-600 font-medium'
                          }>
                            {sectionProgress.requiredAnswered}/{sectionProgress.requiredTotal} required
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {/* Section Items */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  {section.items.map((item, index) => {
                    const itemValidationErrors = validation?.detailedErrors.filter(
                      e => e.itemId === item.id
                    ) || [];

                    return (
                      <AuditFormItem
                        key={item.id}
                        item={item}
                        response={formData.responses[item.id]}
                        onUpdate={(field, value) => updateResponse(item.id, field, value)}
                        onAIVerify={() => {
                          setCurrentAIItem(item.id);
                          setShowAIDetection(true);
                        }}
                        error={validation?.errors[item.id]}
                        warning={validation?.warnings?.[item.id]}
                        validationErrors={itemValidationErrors}
                        readOnly={readOnly}
                        isLast={index === section.items.length - 1}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      {!readOnly && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Save className="h-5 w-5" />
              <span>Save Draft</span>
            </button>

            <button
              onClick={handleSubmit}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
            >
              <Send className="h-5 w-5" />
              <span>Submit for Review</span>
            </button>
          </div>

          {/* Validation Summary */}
          {showValidationSummary && validation && (
            <div className="mt-4 space-y-3">
              {/* Error Summary */}
              {validation.totalErrors > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">
                        Cannot submit - please fix the following errors:
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        {getValidationSummary(validation)}
                      </p>
                      {validation.missingRequired.length > 0 && (
                        <ul className="mt-2 text-xs text-red-700 space-y-1">
                          {validation.missingRequired.slice(0, 5).map(itemId => {
                            const item = ISO_9001_CHECKLIST
                              .flatMap(s => s.items)
                              .find(i => i.id === itemId);
                            return item ? (
                              <li key={itemId}>• {item.section} (Clause {item.clauseRef})</li>
                            ) : null;
                          })}
                          {validation.missingRequired.length > 5 && (
                            <li>• ... and {validation.missingRequired.length - 5} more</li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Warning Summary */}
              {validation.totalErrors === 0 && validation.totalWarnings > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">
                        Recommendations to improve audit quality:
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        {validation.totalWarnings} item(s) could benefit from additional details
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Summary */}
              {validation.isValid && validation.totalWarnings === 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">
                        Audit is ready for submission
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        All required fields are complete and no warnings were found.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
