'use client';

import { useState } from 'react';
import { 
  Target, 
  Play, 
  CheckCircle, 
  RotateCw,
  Info,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import { PDCAStage } from '@/types/audit-form.types';

interface PDCAStageSelectorProps {
  selectedStage?: PDCAStage;
  onStageSelect: (stage: PDCAStage) => void;
  disabled?: boolean;
  showGuidance?: boolean;
}

interface PDCAStageInfo {
  stage: PDCAStage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  guidance: string;
  examples: string[];
}

const PDCA_STAGES: PDCAStageInfo[] = [
  {
    stage: 'plan',
    label: 'Plan',
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    description: 'Identify opportunities and plan for change',
    guidance: 'Use this stage when establishing objectives, identifying problems, or planning improvements.',
    examples: [
      'Initial assessment of current processes',
      'Setting quality objectives and targets',
      'Identifying areas for improvement',
      'Planning corrective actions'
    ]
  },
  {
    stage: 'do',
    label: 'Do',
    icon: Play,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    description: 'Implement the plan and execute changes',
    guidance: 'Use this stage when implementing planned changes, testing solutions, or executing improvements.',
    examples: [
      'Implementing new procedures',
      'Testing process improvements',
      'Training staff on new methods',
      'Executing corrective actions'
    ]
  },
  {
    stage: 'check',
    label: 'Check',
    icon: CheckCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-500',
    description: 'Monitor and evaluate results',
    guidance: 'Use this stage when verifying effectiveness, measuring results, or evaluating outcomes.',
    examples: [
      'Routine compliance audits',
      'Verification of implemented changes',
      'Measuring process performance',
      'Evaluating corrective action effectiveness'
    ]
  },
  {
    stage: 'act',
    label: 'Act',
    icon: RotateCw,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    description: 'Take action based on results',
    guidance: 'Use this stage when standardizing improvements, adjusting plans, or initiating new cycles.',
    examples: [
      'Standardizing successful improvements',
      'Adjusting processes based on findings',
      'Documenting lessons learned',
      'Initiating follow-up audits'
    ]
  }
];

export default function PDCAStageSelector({
  selectedStage,
  onStageSelect,
  disabled = false,
  showGuidance = true
}: PDCAStageSelectorProps) {
  const [expandedStage, setExpandedStage] = useState<PDCAStage | null>(null);

  const handleStageClick = (stage: PDCAStage) => {
    if (!disabled) {
      onStageSelect(stage);
      setExpandedStage(stage === expandedStage ? null : stage);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <RotateCw className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            PDCA Methodology Stage
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Select the stage of the Plan-Do-Check-Act cycle this audit represents
          </p>
        </div>
      </div>

      {/* Stage Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PDCA_STAGES.map((stageInfo) => {
          const Icon = stageInfo.icon;
          const isSelected = selectedStage === stageInfo.stage;
          const isExpanded = expandedStage === stageInfo.stage;

          return (
            <div key={stageInfo.stage} className="space-y-2">
              <button
                onClick={() => handleStageClick(stageInfo.stage)}
                disabled={disabled}
                className={`
                  w-full p-4 rounded-lg border-2 transition-all
                  ${isSelected 
                    ? `${stageInfo.bgColor} ${stageInfo.borderColor} shadow-md` 
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-start space-x-3">
                  <div className={`
                    flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                    ${isSelected ? stageInfo.bgColor : 'bg-gray-100'}
                  `}>
                    <Icon className={`h-5 w-5 ${isSelected ? stageInfo.color : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold ${isSelected ? stageInfo.color : 'text-gray-900'}`}>
                        {stageInfo.label}
                      </h4>
                      {isSelected && (
                        <CheckCircle className={`h-5 w-5 ${stageInfo.color}`} />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {stageInfo.description}
                    </p>
                  </div>
                </div>
              </button>

              {/* Expanded Guidance */}
              {isExpanded && showGuidance && (
                <div className={`p-4 rounded-lg border ${stageInfo.bgColor} border-gray-200`}>
                  <div className="flex items-start space-x-2 mb-3">
                    <Lightbulb className={`h-4 w-4 ${stageInfo.color} mt-0.5 flex-shrink-0`} />
                    <p className="text-sm text-gray-700">
                      {stageInfo.guidance}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700">Common use cases:</p>
                    <ul className="space-y-1">
                      {stageInfo.examples.map((example, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start space-x-2">
                          <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* PDCA Cycle Flow Indicator */}
      {showGuidance && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-2">
                PDCA Continuous Improvement Cycle
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-700">
                <span className="font-medium text-blue-600">Plan</span>
                <ChevronRight className="h-3 w-3" />
                <span className="font-medium text-green-600">Do</span>
                <ChevronRight className="h-3 w-3" />
                <span className="font-medium text-purple-600">Check</span>
                <ChevronRight className="h-3 w-3" />
                <span className="font-medium text-orange-600">Act</span>
                <ChevronRight className="h-3 w-3" />
                <RotateCw className="h-3 w-3 text-gray-500" />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Each audit contributes to the continuous improvement cycle. Track your progress through all stages to ensure systematic quality management.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
