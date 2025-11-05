import { NextRequest, NextResponse } from 'next/server';
import { ComplianceEngine } from '@/services/compliance/ComplianceEngine';

const complianceEngine = new ComplianceEngine();

export async function POST(req: NextRequest) {
  try {
    const { detections, standard, componentType } = await req.json();

    if (!detections || !standard) {
      return NextResponse.json(
        { error: 'Missing required fields: detections, standard' },
        { status: 400 }
      );
    }

    const result = await complianceEngine.checkCompliance(
      detections,
      standard,
      componentType
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Compliance check error:', error);
    return NextResponse.json(
      { error: 'Failed to check compliance' },
      { status: 500 }
    );
  }
}
