import { NextRequest, NextResponse } from 'next/server';

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    console.log(`Calling Python backend at: ${PYTHON_BACKEND_URL}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${PYTHON_BACKEND_URL}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Python backend returned ${response.status}`);
    }

    const data = await response.json();
    console.log(`Detection complete: ${data.detections?.length || 0} defects found`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Detection API error:', error);
    return NextResponse.json({ 
      error: error.name === 'AbortError' ? 'Backend timeout' : 'Detection failed. Make sure Python backend is running.',
      detections: []
    }, { status: 503 });
  }
}
