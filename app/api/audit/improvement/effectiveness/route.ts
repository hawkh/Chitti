import { NextRequest, NextResponse } from 'next/server';
import {
  calculateEffectiveness,
  validateActionForVerification,
  EffectivenessMetrics
} from '@/lib/audit/improvement-action-service';

/**
 * GET /api/audit/improvement/effectiveness
 * Retrieve effectiveness metrics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const improvementActionId = searchParams.get('improvementActionId');
    const siteId = searchParams.get('siteId');

    // Mock data - replace with actual database queries
    const mockMetrics: EffectivenessMetrics[] = [
      {
        improvementActionId: 'imp_001',
        beforeScore: 65,
        afterScore: 85,
        improvement: 20,
        improvementPercentage: 31,
        isEffective: true,
        verificationMethod: 'audit',
        verificationDate: new Date('2025-11-10'),
        verifiedBy: 'user_003',
        verifiedByName: 'Mike Johnson',
        findings: [
          'All corrective actions implemented successfully',
          'Training completion rate: 100%',
          'Quality metrics show sustained improvement'
        ],
        recommendations: [
          'Improvement is effective and sustainable. Consider standardizing this approach.'
        ],
        sustainabilityScore: 90
      }
    ];

    // Apply filters
    let filteredMetrics = mockMetrics;
    
    if (improvementActionId) {
      filteredMetrics = filteredMetrics.filter(m => m.improvementActionId === improvementActionId);
    }

    return NextResponse.json({
      success: true,
      metrics: filteredMetrics,
      total: filteredMetrics.length
    });
  } catch (error) {
    console.error('Error fetching effectiveness metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch effectiveness metrics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audit/improvement/effectiveness
 * Record effectiveness measurement
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      improvementActionId,
      beforeScore,
      afterScore,
      verificationMethod,
      verifiedBy,
      verifiedByName,
      findings,
      sustainabilityScore
    } = body;

    // Validate required fields
    if (!improvementActionId || beforeScore === undefined || afterScore === undefined || 
        !verificationMethod || !verifiedBy || !verifiedByName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate scores
    if (beforeScore < 0 || beforeScore > 100 || afterScore < 0 || afterScore > 100) {
      return NextResponse.json(
        { success: false, error: 'Scores must be between 0 and 100' },
        { status: 400 }
      );
    }

    const metrics = calculateEffectiveness(
      improvementActionId,
      beforeScore,
      afterScore,
      verificationMethod,
      verifiedBy,
      verifiedByName,
      findings || [],
      sustainabilityScore || 100
    );

    // In production, save to database
    // await prisma.effectivenessMetrics.create({ data: metrics });

    return NextResponse.json({
      success: true,
      metrics
    }, { status: 201 });
  } catch (error) {
    console.error('Error recording effectiveness metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record effectiveness metrics' },
      { status: 500 }
    );
  }
}
