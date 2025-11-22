'use client';

import React, { useState } from 'react';
import {
  Target,
  Play,
  CheckCircle,
  RotateCw,
  TrendingUp,
  Calendar,
  Award,
  AlertCircle,
  ChevronRight,
  Clock
} from 'lucide-react';
import { PDCAStage } from '@/types/audit-form.types';
import {
  PDCACycleStatus,
  PDCACycleValidation,
  getPDCAStageGuidance,
  suggestNextAudit
} from '@/lib/audit/pdca-workflow';

interface PDCACycleTrackerProps {
  cycleStatus: PDCACycleStatus;
  onCreateAudit?: (stage: PDCAStage) => void;
  showDetails?: boolean;
}

const STAGE_CONFIG = {
  plan: {
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    label: 'Plan'
  },
  do: {
    icon: Play,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    label: 'Do'
  },
  check: {
    icon: CheckCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-500',
    label: 'Check'
  },
  act: {
    icon: RotateCw,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    label: 'Act'
  }
};

export default function PDCACycleTracker({
  cycleStatus,
  onCreateAudit,
  showDetails = true
}: PDCACycleTrackerProps) {
  const [expandedStage, setExpandedStage] = useState<PDCAStage | null>(null);
  
  const suggestion = suggestNextAudit(cycleStatus);
  const stages: PDCAStage[] = ['plan', 'do', 'check', 'act'];

  return (
    <div className="space-y-6">
      {/* Cycle Overview Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              PDCA Cycle Progress
            </h3>
            <p className="text-sm text-gray-600">
              {cycleStatus.siteName}
            </p>
          </div>
          
          {cycleStatus.isComplete ? (
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
              <Award className="h-5 w-5" />
              <span className="font-semibold">Cycle Complete</span>
            </div>
          ) : (
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {cycleStatus.progress}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 via-green-500 via-purple-500 to-orange-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${cycleStatus.progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Start</span>
            <span>{cycleStatus.completedStages.length} of 4 stages</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Stage Progress Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stages.map((stage, index) => {
            const config = STAGE_CONFIG[stage];
            const Icon = config.icon;
            const isCompleted = cycleStatus.completedStages.includes(stage);
            const isCurrent = cycleStatus.currentStage === stage;
            const auditsForStage = cycleStatus.auditsInCycle.filter(a => a.stage === stage);

            return (
              <button
                key={stage}
                onClick={() => setExpandedStage(expandedStage === stage ? null : stage)}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${isCompleted 
                    ? `${config.bgColor} ${config.borderColor}` 
                    : isCurrent
                    ? 'bg-yellow-50 border-yellow-400 border-dashed'
                    : 'bg-gray-50 border-gray-200'
                  }
                  hover:shadow-md
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-6 w-6 ${isCompleted ? config.color : 'text-gray-400'}`} />
                  {isCompleted && (
                    <CheckCircle className={`h-5 w-5 ${config.color}`} />
                  )}
                  {isCurrent && !isCompleted && (
                    <Clock className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
                <div className="font-semibold text-gray-900 mb-1">
                  {config.label}
                </div>
                <div className="text-xs text-gray-600">
                  {auditsForStage.length} audit{auditsForStage.length !== 1 ? 's' : ''}
                </div>
              </button>
            );
          })}
        </div>

        {/* Cycle Timeline */}
        {showDetails && (cycleStatus.cycleStartDate || cycleStatus.cycleCompletionDate) && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-xs text-gray-600">Cycle Started</div>
                <div className="text-sm font-medium text-gray-900">
                  {cycleStatus.cycleStartDate?.toLocaleDateString() || 'N/A'}
                </div>
              </div>
            </div>
            
            {cycleStatus.cycleCompletionDate && (
              <>
                <ChevronRight className="h-5 w-5 text-gray-400" />
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-xs text-gray-600">Completed</div>
                    <div className="text-sm font-medium text-gray-900">
                      {cycleStatus.cycleCompletionDate.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Next Action Recommendation */}
      {!cycleStatus.isComplete && (
        <div className={`
          bg-white rounded-lg shadow-md p-6 border-l-4
          ${suggestion.priority === 'high' 
            ? 'border-red-500' 
            : suggestion.priority === 'medium'
            ? 'border-yellow-500'
            : 'border-blue-500'
          }
        `}>
          <div className="flex items-start space-x-4">
            <div className={`
              flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center
              ${STAGE_CONFIG[suggestion.suggestedStage].bgColor}
            `}>
              {React.createElement(STAGE_CONFIG[suggestion.suggestedStage].icon, {
                className: `h-6 w-6 ${STAGE_CONFIG[suggestion.suggestedStage].color}`
              })}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="font-semibold text-gray-900">Next Recommended Action</h4>
                <span className={`
                  text-xs font-semibold px-2 py-1 rounded
                  ${suggestion.priority === 'high'
                    ? 'bg-red-100 text-red-700'
                    : suggestion.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-blue-100 text-blue-700'
                  }
                `}>
                  {suggestion.priority.toUpperCase()} PRIORITY
                </span>
              </div>
              
              <p className="text-sm text-gray-700 mb-4">
                {suggestion.reason}
              </p>
              
              {onCreateAudit && (
                <button
                  onClick={() => onCreateAudit(suggestion.suggestedStage)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Create {STAGE_CONFIG[suggestion.suggestedStage].label} Audit</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stage Details */}
      {expandedStage && showDetails && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <StageDetails stage={expandedStage} />
        </div>
      )}

      {/* Audits in Cycle */}
      {showDetails && cycleStatus.auditsInCycle.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Audits in Current Cycle</h4>
          <div className="space-y-3">
            {cycleStatus.auditsInCycle
              .sort((a, b) => b.auditDate.getTime() - a.auditDate.getTime())
              .map((audit) => {
                const config = STAGE_CONFIG[audit.stage];
                const Icon = config.icon;
                
                return (
                  <div
                    key={audit.auditId}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {config.label} Stage Audit
                        </div>
                        <div className="text-sm text-gray-600">
                          {audit.auditDate.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {audit.complianceScore !== undefined && (
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Score</div>
                          <div className={`font-semibold ${
                            audit.complianceScore >= 90 ? 'text-green-600' :
                            audit.complianceScore >= 70 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {audit.complianceScore}%
                          </div>
                        </div>
                      )}
                      
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${audit.status === 'approved' 
                          ? 'bg-green-100 text-green-700'
                          : audit.status === 'submitted'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                        }
                      `}>
                        {audit.status}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

// Stage Details Component
function StageDetails({ stage }: { stage: PDCAStage }) {
  const guidance = getPDCAStageGuidance(stage);
  const config = STAGE_CONFIG[stage];
  const Icon = config.icon;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className={`w-12 h-12 rounded-lg ${config.bgColor} flex items-center justify-center`}>
          <Icon className={`h-6 w-6 ${config.color}`} />
        </div>
        <div>
          <h4 className="text-lg font-bold text-gray-900">{guidance.title}</h4>
          <p className="text-sm text-gray-600">{guidance.description}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <h5 className="font-semibold text-gray-900 text-sm">Objectives</h5>
          <ul className="space-y-1">
            {guidance.objectives.map((obj, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start space-x-2">
                <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h5 className="font-semibold text-gray-900 text-sm">Key Activities</h5>
          <ul className="space-y-1">
            {guidance.keyActivities.map((activity, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start space-x-2">
                <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                <span>{activity}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h5 className="font-semibold text-gray-900 text-sm">Deliverables</h5>
          <ul className="space-y-1">
            {guidance.deliverables.map((deliverable, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start space-x-2">
                <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                <span>{deliverable}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
