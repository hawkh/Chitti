/**
 * Real YOLO Detection API Route
 * Uses AWS ECS backend (primary) or Lambda (fallback) for actual AI inference
 */

import { NextRequest, NextResponse } from 'next/server';

const ECS_URL = process.env.NEXT_PUBLIC_WELD_API_URL || 'http://23.22.163.148:10000';
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
    
    // Try AWS ECS backend first (primary)
    try {
      console.log('📤 Sending image to AWS ECS backend...');
      
      const ecsResponse = await fetch(`${ECS_URL}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
      });
      
      if (ecsResponse.ok) {
        const result = await ecsResponse.json();
        console.log(`✅ ECS response: ${result.detections?.length || 0} detections found`);
        
        // Convert ECS format to Lambda format for compatibility
        return NextResponse.json({
          success: true,
          detections: result.detections || [],
          num_detections: result.detections?.length || 0,
          backend: 'aws-ecs',
          demo_mode: result.demo_mode || false
        });
      }
      
      console.log('⚠️ ECS backend unavailable, trying Lambda fallback...');
    } catch (ecsError: any) {
      console.log(`⚠️ ECS error (${ecsError.message}), trying Lambda fallback...`);
    }
    
    // Fallback to Lambda
    console.log('📤 Sending image to Lambda...');
    
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
        { success: false, error: `Both backends failed: ${response.status}` },
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
    backends: {
      primary: ECS_URL,
      fallback: LAMBDA_URL
    },
    message: 'POST an image to /api/detect-real for detection'
  });
}
