'use client';

import {
    AlertTriangle,
    Camera,
    Check,
    HelpCircle,
    Info,
    MessageSquare,
    Paperclip,
    Star,
    ThumbsDown,
    ThumbsUp,
    X,
} from 'lucide-react';
import { useState } from 'react';

import {
    AuditResponse,
    ResponseValue,
    SeverityLevel,
} from '@/types/audit-form.types';
import { ISOChecklistItem } from '@/lib/audit/iso-checklist';
import { DetailedValidationError } from '@/lib/audit/form-validation';

interface AuditFormItemProps {
    item: ISOChecklistItem;
    response: AuditResponse;
    onUpdate: (field: keyof AuditResponse, value: any) => void;
    onAIVerify: () => void;
    error?: string;
    warning?: string;
    validationErrors: DetailedValidationError[];
    readOnly: boolean;
    isLast: boolean;
}

export default function AuditFormItem({
    item,
    response,
    onUpdate,
    onAIVerify,
    error,
    warning,
    validationErrors,
    readOnly,
    isLast,
}: AuditFormItemProps) {
    const [showHelp, setShowHelp] = useState(false);

    const handleResponseChange = (value: ResponseValue) => {
        onUpdate('response', value);
    };

    const handleSeverityChange = (value: SeverityLevel) => {
        onUpdate('severity', value);
    };

    const responseValue = response?.response || null;
    const severityValue = response?.severity || null;
    const commentsValue = response?.comments || '';

    const hasAIComments = commentsValue.includes('[AI Verified]');

    const renderValidationError = (type: 'error' | 'warning') => {
        const message = type === 'error' ? error : warning;
        if (!message) return null;

        const relevantErrors = validationErrors.filter(e =>
            (type === 'error' && e.type === 'error') ||
            (type === 'warning' && e.type === 'warning')
        );

        return (
            <div
                className={`p-3 mt-3 rounded-md ${type === 'error'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-yellow-50 border border-yellow-200'
                    }`}
            >
                <div className="flex items-start space-x-2">
                    {type === 'error' ? (
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    ) : (
                        <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                    )}
                    <div>
                        <p
                            className={`text-xs font-medium ${type === 'error' ? 'text-red-800' : 'text-yellow-800'
                                }`}
                        >
                            {message}
                        </p>
                        {relevantErrors.length > 0 && (
                            <ul className="mt-1 space-y-1 text-xs list-disc list-inside text-gray-600">
                                {relevantErrors.map((e, i) => (
                                    <li key={i}>{e.message}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div
            id={`item-${item.id}`}
            className={`px-6 py-5 ${!isLast ? 'border-b border-gray-200' : ''} ${error ? 'bg-red-50' : ''
                }`}
        >
            {/* Item Header */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">
                        {item.clauseRef} - {item.section}
                    </p>
                    <p className="mt-1 text-base text-gray-600">{item.question}</p>
                </div>
                <div className="flex items-center ml-4 space-x-2">
                    {item.required && (
                        <span
                            className="px-2 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded-full"
                        >
                            Required
                        </span>
                    )}
                    <button
                        onClick={() => setShowHelp(!showHelp)}
                        className="p-1 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600"
                    >
                        <HelpCircle className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Help Text */}
            {showHelp && (
                <div className="p-3 mt-3 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-md">
                    <p>{item.helpText}</p>
                </div>
            )}

            {/* Response Section */}
            <div className="mt-4 space-y-4">
                {/* Pass/Fail/NA Buttons */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleResponseChange('pass')}
                        disabled={readOnly}
                        className={`flex-1 flex items-center justify-center p-3 text-sm font-semibold rounded-md transition-colors
              ${responseValue === 'pass'
                                ? 'bg-green-600 text-white shadow'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }
              ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Pass
                    </button>
                    <button
                        onClick={() => handleResponseChange('fail')}
                        disabled={readOnly}
                        className={`flex-1 flex items-center justify-center p-3 text-sm font-semibold rounded-md transition-colors
              ${responseValue === 'fail'
                                ? 'bg-red-600 text-white shadow'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }
              ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <ThumbsDown className="w-4 h-4 mr-2" />
                        Fail
                    </button>
                    <button
                        onClick={() => handleResponseChange('na')}
                        disabled={readOnly}
                        className={`flex-1 flex items-center justify-center p-3 text-sm font-semibold rounded-md transition-colors
              ${responseValue === 'na'
                                ? 'bg-gray-500 text-white shadow'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }
              ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <X className="w-4 h-4 mr-2" />
                        N/A
                    </button>
                </div>

                {/* Severity for Failures */}
                {responseValue === 'fail' && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Severity Level
                        </label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {(['low', 'medium', 'high', 'critical'] as SeverityLevel[]).map(
                                level => (
                                    <button
                                        key={level}
                                        onClick={() => handleSeverityChange(level)}
                                        disabled={readOnly}
                                        className={`px-3 py-2 text-sm font-semibold rounded-md capitalize transition-colors
                    ${severityValue === level
                                                ? 'text-white shadow ' +
                                                (level === 'low'
                                                    ? 'bg-yellow-500'
                                                    : level === 'medium'
                                                        ? 'bg-orange-500'
                                                        : level === 'high'
                                                            ? 'bg-red-500'
                                                            : 'bg-purple-600')
                                                : 'bg-white border border-gray-300 hover:bg-gray-50'
                                            }
                    ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    >
                                        {level}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                )}

                {/* Comments */}
                <div className="relative">
                    <MessageSquare className="absolute w-4 h-4 text-gray-400 top-3 left-3" />
                    <textarea
                        value={commentsValue}
                        onChange={e => onUpdate('comments', e.target.value)}
                        placeholder="Add comments, findings, or objective evidence..."
                        rows={3}
                        disabled={readOnly}
                        className={`w-full p-2 pl-10 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500
              ${readOnly ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                            }
              ${hasAIComments ? 'bg-blue-50 border-blue-200' : ''}`}
                    />
                </div>

                {/* Attachments & AI Verification */}
                {!readOnly && (
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            disabled
                            className="flex items-center px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed opacity-50"
                        >
                            <Paperclip className="w-3 h-3 mr-1" />
                            Attach Evidence (Soon)
                        </button>
                        <button
                            onClick={onAIVerify}
                            className="flex items-center px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-md hover:from-blue-600 hover:to-purple-700"
                        >
                            <Star className="w-3 h-3 mr-1" />
                            AI Smart Verify
                        </button>
                    </div>
                )}

                {/* Validation Messages */}
                {renderValidationError('error')}
                {renderValidationError('warning')}
            </div>
        </div>
    );
}
