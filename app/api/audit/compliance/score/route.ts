// API Route: Calculate Compliance Score
// POST /api/audit/compliance/score

import { NextRequest, NextResponse } from 'next/server';
import { calculateComplianceScore, detectCriticalFailures } from '@/lib/audit/compliance-calculator';
import { AuditResponse } from '@/types/audit-form.types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { responses } = body;

    if (!responses || typeof responses !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request: responses object required' },
        { status: 400 }
      );
    }

    // Calculate compliance score
    const complianceScore = calculateComplianceScore(responses);
    
    // Detect critical failures
    const criticalFailures = detectCriticalFailures(responses);

    return NextResponse.json({
      success: true,
      complianceScore,
      criticalFailures
    });
  } catch (error) {
    console.error('Error calculating compliance score:', error);
    return NextResponse.json(
      { error: 'Failed to calculate compliance score' },
      { status: 500 }
    );
  }
}
