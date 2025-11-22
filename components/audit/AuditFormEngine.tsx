'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  XCircle, 
  MinusCircle,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  Camera,
  Save,
  Send,
  Info,
  Lightbulb
} from 'lucide-react';
import { 
  ISO_9001_CHECKLIST, 
  ISOChecklistSection, 
  ISOChecklistItem 
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
  DetailedValidationResult,
  ValidationError
} from '@/lib/audit/form-validation';
import ISOClauseHelp from './ISOClauseHelp';
import CorrectiveActionSuggestions from './CorrectiveActionSuggestions';
import { CorrectiveActionTemplate } from '@/lib/audit/corrective-action-templates';
import PDCAStageSelector from './PDCAStageSelector';

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
    
    if (submitCheck.canSubmit && onSubmit) {
      onSubmit(formData);
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
            <span className={`font-semibold ${
              progress.requiredAnswered === progress.requiredTotal 
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
                        Ready to submit!
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        All required fields are complete. Click Submit for Review to continue.
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

// Individual Audit Form Item Component
interface AuditFormItemProps {
  item: ISOChecklistItem;
  response?: AuditResponse;
  onUpdate: (field: keyof AuditResponse, value: any) => void;
  error?: string;
  warning?: string;
  validationErrors?: ValidationError[];
  readOnly?: boolean;
  isLast?: boolean;
}

function AuditFormItem({
  item,
  response,
  onUpdate,
  error,
  warning,
  validationErrors = [],
  readOnly = false,
  isLast = false
}: AuditFormItemProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [showComments, setShowComments] = useState(!!response?.comments);
  const [showCorrectiveActions, setShowCorrectiveActions] = useState(false);

  const responseValue = response?.response;
  const severity = response?.severity;
  const comments = response?.comments || '';

  // Show corrective actions automatically when fail is selected
  useEffect(() => {
    if (responseValue === 'fail') {
      setShowCorrectiveActions(true);
    }
  }, [responseValue]);

  const handleCorrectiveActionSelect = (template: CorrectiveActionTemplate) => {
    // Auto-fill comments with template information
    const templateText = `${template.title}\n\n${template.description}\n\nAction Steps:\n${template.actionSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}`;
    onUpdate('comments', templateText);
    setShowComments(true);
  };

  return (
    <div 
      id={`item-${item.id}`}
      className={`p-6 ${!isLast ? 'border-b border-gray-200' : ''} ${error ? 'bg-red-50' : ''}`}
    >
      {/* Item Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Clause {item.clauseRef}
            </span>
            {item.required && (
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                Required
              </span>
            )}
            {response?.response && !error && (
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>Answered</span>
              </span>
            )}
          </div>
          <h4 className="text-base font-medium text-gray-900 mb-1">
            {item.question}
          </h4>
          <p className="text-sm text-gray-600">{item.section}</p>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <ISOClauseHelp clause={item.clauseRef} mode="tooltip" showFullGuidance={true} />
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Show help"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Inline Help Text */}
      {showHelp && (
        <div className="mb-4">
          <ISOClauseHelp clause={item.clauseRef} mode="inline" showFullGuidance={true} />
        </div>
      )}

      {/* Response Buttons */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Response
        </label>
        <div className="flex space-x-3">
          <ResponseButton
            icon={<CheckCircle className="h-5 w-5" />}
            label="Pass"
            value="pass"
            selected={responseValue === 'pass'}
            onClick={() => !readOnly && onUpdate('response', 'pass')}
            color="green"
            disabled={readOnly}
          />
          <ResponseButton
            icon={<XCircle className="h-5 w-5" />}
            label="Fail"
            value="fail"
            selected={responseValue === 'fail'}
            onClick={() => !readOnly && onUpdate('response', 'fail')}
            color="red"
            disabled={readOnly}
          />
          <ResponseButton
            icon={<MinusCircle className="h-5 w-5" />}
            label="N/A"
            value="na"
            selected={responseValue === 'na'}
            onClick={() => !readOnly && onUpdate('response', 'na')}
            color="gray"
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Severity Selection (shown only for Fail responses) */}
      {responseValue === 'fail' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Severity Level *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <SeverityButton
              label="Low"
              value="low"
              selected={severity === 'low'}
              onClick={() => !readOnly && onUpdate('severity', 'low')}
              color="yellow"
              disabled={readOnly}
            />
            <SeverityButton
              label="Medium"
              value="medium"
              selected={severity === 'medium'}
              onClick={() => !readOnly && onUpdate('severity', 'medium')}
              color="orange"
              disabled={readOnly}
            />
            <SeverityButton
              label="High"
              value="high"
              selected={severity === 'high'}
              onClick={() => !readOnly && onUpdate('severity', 'high')}
              color="red"
              disabled={readOnly}
            />
            <SeverityButton
              label="Critical"
              value="critical"
              selected={severity === 'critical'}
              onClick={() => !readOnly && onUpdate('severity', 'critical')}
              color="purple"
              disabled={readOnly}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Low (minor issue), Medium (moderate impact), High (significant concern), Critical (immediate action required)
          </p>
        </div>
      )}

      {/* Corrective Action Suggestions (shown for Fail responses) */}
      {responseValue === 'fail' && !readOnly && (
        <div className="mb-4">
          <button
            onClick={() => setShowCorrectiveActions(!showCorrectiveActions)}
            className="flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Lightbulb className="h-4 w-4" />
            <span>{showCorrectiveActions ? 'Hide' : 'Show'} Corrective Action Suggestions</span>
          </button>
          
          {showCorrectiveActions && (
            <div className="mt-3">
              <CorrectiveActionSuggestions
                clause={item.clauseRef}
                severity={severity && severity !== null ? severity : undefined}
                onSelect={handleCorrectiveActionSelect}
              />
            </div>
          )}
        </div>
      )}

      {/* Comments Section */}
      <div className="mb-4">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          <span>{showComments ? 'Hide' : 'Add'} Comments</span>
        </button>
        
        {showComments && (
          <textarea
            value={comments}
            onChange={(e) => !readOnly && onUpdate('comments', e.target.value)}
            placeholder="Add comments, observations, or corrective actions..."
            disabled={readOnly}
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-600"
            rows={3}
          />
        )}
      </div>

      {/* Evidence Upload Placeholder */}
      {item.evidenceRequired && (
        <div className="mb-4">
          <button
            disabled={readOnly}
            className="flex items-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">Add Evidence (Photo/Video)</span>
          </button>
        </div>
      )}

      {/* Validation Messages */}
      {validationErrors.length > 0 && (
        <div className="space-y-2">
          {validationErrors.map((validationError, idx) => (
            <ValidationMessage key={idx} error={validationError} />
          ))}
        </div>
      )}

      {/* Legacy Error Message (fallback) */}
      {error && validationErrors.length === 0 && (
        <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-100 px-3 py-2 rounded-lg border border-red-200">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Legacy Warning Message (fallback) */}
      {!error && warning && validationErrors.length === 0 && (
        <div className="flex items-center space-x-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
          <Info className="h-4 w-4 flex-shrink-0" />
          <span>{warning}</span>
        </div>
      )}
    </div>
  );
}

// Response Button Component
interface ResponseButtonProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  selected: boolean;
  onClick: () => void;
  color: 'green' | 'red' | 'gray';
  disabled?: boolean;
}

function ResponseButton({
  icon,
  label,
  selected,
  onClick,
  color,
  disabled = false
}: ResponseButtonProps) {
  const colorClasses = {
    green: selected 
      ? 'bg-green-100 border-green-500 text-green-700' 
      : 'border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50',
    red: selected 
      ? 'bg-red-100 border-red-500 text-red-700' 
      : 'border-gray-300 text-gray-700 hover:border-red-500 hover:bg-red-50',
    gray: selected 
      ? 'bg-gray-100 border-gray-500 text-gray-700' 
      : 'border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex-1 flex items-center justify-center space-x-2 px-4 py-3 border-2 rounded-lg
        transition-all font-medium
        ${colorClasses[color]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// Severity Button Component
interface SeverityButtonProps {
  label: string;
  value: string;
  selected: boolean;
  onClick: () => void;
  color: 'yellow' | 'orange' | 'red' | 'purple';
  disabled?: boolean;
}

function SeverityButton({
  label,
  selected,
  onClick,
  color,
  disabled = false
}: SeverityButtonProps) {
  const colorClasses = {
    yellow: selected 
      ? 'bg-yellow-100 border-yellow-500 text-yellow-800' 
      : 'border-gray-300 text-gray-700 hover:border-yellow-500 hover:bg-yellow-50',
    orange: selected 
      ? 'bg-orange-100 border-orange-500 text-orange-800' 
      : 'border-gray-300 text-gray-700 hover:border-orange-500 hover:bg-orange-50',
    red: selected 
      ? 'bg-red-100 border-red-500 text-red-800' 
      : 'border-gray-300 text-gray-700 hover:border-red-500 hover:bg-red-50',
    purple: selected 
      ? 'bg-purple-100 border-purple-500 text-purple-800' 
      : 'border-gray-300 text-gray-700 hover:border-purple-500 hover:bg-purple-50'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 border-2 rounded-lg text-sm font-medium
        transition-all
        ${colorClasses[color]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {label}
    </button>
  );
}

// Validation Message Component with contextual help
function ValidationMessage({ error }: { error: ValidationError }) {
  const [showDetails, setShowDetails] = useState(false);

  const severityConfig = {
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      icon: AlertTriangle
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      icon: AlertTriangle
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      icon: Info
    }
  };

  const config = severityConfig[error.severity];
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3`}>
      <div className="flex items-start space-x-2">
        <Icon className={`h-4 w-4 ${config.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${config.textColor}`}>
            {error.message}
          </p>
          
          {error.suggestion && (
            <p className={`text-xs ${config.textColor} mt-1 opacity-90`}>
              💡 {error.suggestion}
            </p>
          )}

          {error.helpText && (
            <>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className={`text-xs ${config.textColor} underline mt-1 hover:opacity-80`}
              >
                {showDetails ? 'Hide details' : 'Show more details'}
              </button>
              
              {showDetails && (
                <p className={`text-xs ${config.textColor} mt-2 p-2 bg-white bg-opacity-50 rounded`}>
                  {error.helpText}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
