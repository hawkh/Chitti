'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ImprovementActionPlanner from '@/components/audit/ImprovementActionPlanner';

export default function NewImprovementActionPage() {
  const searchParams = useSearchParams();
  const auditId = searchParams.get('auditId') || 'audit_001';
  const siteId = searchParams.get('siteId') || 'site_001';
  const siteName = searchParams.get('siteName') || 'Manufacturing Plant A';
  const scoreParam = searchParams.get('score');
  const originalScore = scoreParam ? parseFloat(scoreParam) : undefined;

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
