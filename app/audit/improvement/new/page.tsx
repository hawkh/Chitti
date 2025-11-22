import { Suspense } from 'react';
import ImprovementActionPlanner from '@/components/audit/ImprovementActionPlanner';

export default function NewImprovementActionPage({
  searchParams
}: {
  searchParams: { auditId?: string; siteId?: string; siteName?: string; score?: string }
}) {
  const auditId = searchParams.auditId || 'audit_001';
  const siteId = searchParams.siteId || 'site_001';
  const siteName = searchParams.siteName || 'Manufacturing Plant A';
  const originalScore = searchParams.score ? parseFloat(searchParams.score) : undefined;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <ImprovementActionPlanner
          auditId={auditId}
          siteId={siteId}
          siteName={siteName}
          originalScore={originalScore}
          onActionCreated={(action) => {
            console.log('Action created:', action);
            if (typeof window !== 'undefined') {
              window.location.href = '/audit/improvement';
            }
          }}
        />
      </div>
    </div>
  );
}
