import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        models: {
          available: ['yolo-defect-detector'],
          loaded: [],
          status: 'ready'
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { message: 'Health check failed', code: 'HEALTH_CHECK_ERROR' }
    }, { status: 500 });
  }
}