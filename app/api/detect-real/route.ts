/**
 * Real YOLO Detection API Route
 * Uses AWS Lambda backend for actual AI inference
 */

import { NextRequest, NextResponse } from 'next/server';

const LAMBDA_URL = process.env.NEXT_PUBLIC_YOLO_API_URL || 'https://vimr4uemw3ft4b4t3edqocw6ni0iuxpu.lambda-url.us-east-1.on.aws/';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Real YOLO detection API called');
    
    // Get image from request
    const body = await request.json();
    const { image } = body;
    
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }
    
    console.log('📤 Sending image to Lambda...');
    
    // Call Lambda function
    const response = await fetch(LAMBDA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Lambda error:', errorText);
      return NextResponse.json(
        { success: false, error: `Lambda error: ${response.status}` },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    console.log(`✅ Lambda response: ${result.num_detections} detections found`);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('❌ Detection API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'yolo-detection-proxy',
    backend: LAMBDA_URL,
    message: 'POST an image to /api/detect-real for detection'
  });
}
