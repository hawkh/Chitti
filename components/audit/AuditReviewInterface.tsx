'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Calendar,
  User,
  Building2,
  Clock,
  FileText,
  Image as ImageIcon,
  Video,
  Download,
  Send,
  ThumbsUp,
  ThumbsDown,
  Edit3
} from 'lucide-react';
import { AuditRecord, AuditResponse as AuditResponseType, ComplianceScore } from '@/types/audit-form.types';

interface AuditReviewInterfaceProps {
  auditId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface DetailedAudit extends AuditRecord {
  site: {
    id: string;
    name: string;
    location: string;
  };
  inspector: {
    id: string;
    name: string;
    email: string;
  };
  evidence: Array<{
    id: string;
    filename: string;
    fileType: string;
    url: string;
    thumbnailUrl?: string;
    responseId?: string;
  }>;
}

export default function AuditReviewInterface({ auditId, user }: AuditReviewInterfaceProps) {
  const router = useRouter();
  const [audit, setAudit] = useState<DetailedAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [correctiveActions, setCorrectiveActions] = useState<Record<string, string>>({});
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);

  useEffect(() => {
    loadAuditDetails();
  }, [auditId]);

  const loadAuditDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('audit_token');

      const response = await fetch(`/api/audit/manager/review/${auditId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to load audit');
      }

      const data = await response.json();
      setAudit(data);
    } catch (error) {
      console.error('Failed to load audit:', error);
      alert('Failed to load audit details');
      router.push('/audit/manager/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!reviewComment.trim()) {
      alert('Please add a comment for approval');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('audit_token');

      const response = await fetch(`/api/audit/manager/review/${auditId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          comment: reviewComment,
          correctiveActions
        })
      });

      if (!response.ok) {
        throw new Error('Failed to approve audit');
      }

      alert('Audit approved successfully');
      router.push('/audit/manager/dashboard');
    } catch (error) {
      console.error('Failed to approve audit:', error);
      alert('Failed to approve audit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reviewComment.trim()) {
      alert('Please provide feedback for rejection');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('audit_token');

      const response = await fetch(`/api/audit/manager/review/${auditId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          feedback: reviewComment
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject audit');
      }

      alert('Audit rejected. Inspector will be notified.');
      router.push('/audit/manager/dashboard');
    } catch (error) {
      console.error('Failed to reject audit:', error);
      alert('Failed to reject audit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading audit details...</p>
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Audit not found</p>
        </div>
      </div>
    );
  }

  const failedResponses = Object.values(audit.responses).filter(r => r.response === 'fail');
  const criticalIssues = failedResponses.filter(r => r.severity === 'critical').length;
  const highIssues = failedResponses.filter(r => r.severity === 'high').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/audit/manager/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Audit Review</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Review and approve audit submission
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                audit.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                audit.status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
                audit.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {audit.status?.replace('_', ' ') || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Audit Metadata */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Site</p>
                    <p className="font-medium text-gray-900">{audit.site.name}</p>
                    <p className="text-xs text-gray-500">{audit.site.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Inspector</p>
                    <p className="font-medium text-gray-900">{audit.inspector.name}</p>
                    <p className="text-xs text-gray-500">{audit.inspector.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Audit Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(audit.auditDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Submitted</p>
                    <p className="font-medium text-gray-900">
                      {audit.submittedAt ? new Date(audit.submittedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center space-x-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {audit.auditType?.replace('_', ' ')}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  PDCA: {audit.pdcaStage}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  Shift: {audit.shift}
                </span>
              </div>
            </div>

            {/* Compliance Score */}
            {audit.complianceScore && (
              <ComplianceScoreCard score={audit.complianceScore} />
            )}

            {/* Critical Issues Alert */}
            {(criticalIssues > 0 || highIssues > 0) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-red-800">
                      High Priority Issues Detected
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      {criticalIssues} critical and {highIssues} high severity issues require immediate attention
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Audit Responses */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Audit Responses</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {Object.values(audit.responses).map((response) => (
                  <ResponseReviewItem
                    key={response.itemId}
                    response={response}
                    evidence={audit.evidence.filter(e => e.responseId === response.itemId)}
                    onEvidenceClick={setSelectedEvidence}
                    correctiveAction={correctiveActions[response.itemId]}
                    onCorrectiveActionChange={(value) =>
                      setCorrectiveActions(prev => ({ ...prev, [response.itemId]: value }))
                    }
                  />
                ))}
              </div>
            </div>

            {/* Evidence Gallery */}
            {audit.evidence.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Evidence Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {audit.evidence.map((evidence) => (
                    <EvidenceThumbnail
                      key={evidence.id}
                      evidence={evidence}
                      onClick={() => setSelectedEvidence(evidence.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Review Actions */}
          <div className="space-y-6">
            {/* Review Decision */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Decision</h2>
              
              {!reviewAction ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setReviewAction('approve')}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <ThumbsUp className="h-5 w-5" />
                    <span>Approve Audit</span>
                  </button>
                  <button
                    onClick={() => setReviewAction('reject')}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <ThumbsDown className="h-5 w-5" />
                    <span>Reject Audit</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-3 rounded-lg ${
                    reviewAction === 'approve' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`text-sm font-medium ${
                      reviewAction === 'approve' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {reviewAction === 'approve' ? 'Approving Audit' : 'Rejecting Audit'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {reviewAction === 'approve' ? 'Approval Comments *' : 'Rejection Feedback *'}
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder={
                        reviewAction === 'approve'
                          ? 'Add comments about the audit quality, observations, or recommendations...'
                          : 'Explain why this audit is being rejected and what needs to be corrected...'
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={6}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setReviewAction(null);
                        setReviewComment('');
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={reviewAction === 'approve' ? handleApprove : handleReject}
                      disabled={submitting || !reviewComment.trim()}
                      className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        reviewAction === 'approve'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      <Send className="h-4 w-4" />
                      <span>{submitting ? 'Submitting...' : 'Submit'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Workflow History */}
            {audit.workflowComments && audit.workflowComments.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Workflow History</h2>
                <div className="space-y-3">
                  {audit.workflowComments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-blue-500 pl-3">
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <span className="font-medium">{comment.userName}</span>
                        <span>•</span>
                        <span>{new Date(comment.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{comment.comment}</p>
                      <span className="text-xs text-gray-500 mt-1 inline-block">
                        {comment.action.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Export PDF Report</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <FileText className="h-4 w-4" />
                  <span>View Full Checklist</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Modal */}
      {selectedEvidence && (
        <EvidenceModal
          evidence={audit.evidence.find(e => e.id === selectedEvidence)!}
          onClose={() => setSelectedEvidence(null)}
        />
      )}
    </div>
  );
}

// Response Review Item Component
interface ResponseReviewItemProps {
  response: AuditResponseType;
  evidence: Array<{ id: string; filename: string; fileType: string; url: string; thumbnailUrl?: string }>;
  onEvidenceClick: (id: string) => void;
  correctiveAction?: string;
  onCorrectiveActionChange: (value: string) => void;
}

function ResponseReviewItem({
  response,
  evidence,
  onEvidenceClick,
  correctiveAction,
  onCorrectiveActionChange
}: ResponseReviewItemProps) {
  const [showCorrectiveAction, setShowCorrectiveAction] = useState(false);

  const responseIcon = {
    pass: <CheckCircle className="h-5 w-5 text-green-600" />,
    fail: <XCircle className="h-5 w-5 text-red-600" />,
    na: <span className="text-gray-600 text-sm font-medium">N/A</span>
  };

  const severityColor = {
    low: 'bg-yellow-100 text-yellow-800',
    medium: 'bg-orange-100 text-orange-800',
    high: 'bg-red-100 text-red-800',
    critical: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {response.response && responseIcon[response.response]}
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {response.itemId}
            </span>
            {response.severity && (
              <span className={`text-xs font-semibold px-2 py-1 rounded ${severityColor[response.severity]}`}>
                {response.severity.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-900 font-medium">{response.itemId}</p>
        </div>
      </div>

      {response.comments && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-700 mb-1">Inspector Comments:</p>
              <p className="text-sm text-gray-600">{response.comments}</p>
            </div>
          </div>
        </div>
      )}

      {evidence.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-700 mb-2">Evidence:</p>
          <div className="flex space-x-2">
            {evidence.map((e) => (
              <button
                key={e.id}
                onClick={() => onEvidenceClick(e.id)}
                className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
              >
                {e.fileType === 'PHOTO' ? (
                  <img src={e.thumbnailUrl || e.url} alt={e.filename} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Video className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {response.response === 'fail' && (
        <div className="mt-3">
          <button
            onClick={() => setShowCorrectiveAction(!showCorrectiveAction)}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Edit3 className="h-4 w-4" />
            <span>{showCorrectiveAction ? 'Hide' : 'Add'} Corrective Action</span>
          </button>
          
          {showCorrectiveAction && (
            <textarea
              value={correctiveAction || ''}
              onChange={(e) => onCorrectiveActionChange(e.target.value)}
              placeholder="Assign corrective action and responsible party..."
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Compliance Score Card Component
function ComplianceScoreCard({ score }: { score: ComplianceScore }) {
  const scoreColor = score.overallScore >= 85 ? 'text-green-600' :
                     score.overallScore >= 70 ? 'text-yellow-600' :
                     'text-red-600';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance Score</h2>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className={`text-4xl font-bold ${scoreColor}`}>
            {score.overallScore}%
          </div>
          <p className="text-sm text-gray-600 mt-1">Overall Compliance</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-gray-900">
            {score.passedItems}/{score.totalItems}
          </div>
          <p className="text-sm text-gray-600">Items Passed</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-xl font-semibold text-red-600">{score.criticalFailures}</div>
          <p className="text-xs text-gray-600">Critical</p>
        </div>
        <div className="text-center">
          <div className="text-xl font-semibold text-orange-600">{score.highSeverityCount}</div>
          <p className="text-xs text-gray-600">High</p>
        </div>
        <div className="text-center">
          <div className="text-xl font-semibold text-yellow-600">{score.mediumSeverityCount}</div>
          <p className="text-xs text-gray-600">Medium</p>
        </div>
      </div>
    </div>
  );
}

// Evidence Thumbnail Component
function EvidenceThumbnail({
  evidence,
  onClick
}: {
  evidence: { id: string; filename: string; fileType: string; url: string; thumbnailUrl?: string };
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors group"
    >
      {evidence.fileType === 'PHOTO' ? (
        <img
          src={evidence.thumbnailUrl || evidence.url}
          alt={evidence.filename}
          className="w-full h-full object-cover"
        />
      ) : evidence.fileType === 'VIDEO' ? (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <Video className="h-8 w-8 text-gray-400" />
        </div>
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
      )}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
        <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}

// Evidence Modal Component
function EvidenceModal({
  evidence,
  onClose
}: {
  evidence: { id: string; filename: string; fileType: string; url: string };
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="max-w-4xl w-full bg-white rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{evidence.filename}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          {evidence.fileType === 'PHOTO' ? (
            <img src={evidence.url} alt={evidence.filename} className="w-full h-auto" />
          ) : evidence.fileType === 'VIDEO' ? (
            <video src={evidence.url} controls className="w-full h-auto" />
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Document preview not available</p>
              <a
                href={evidence.url}
                download
                className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
