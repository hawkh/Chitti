import { NextRequest, NextResponse } from 'next/server';

const getPythonBackendUrl = () => {
  if (process.env.PYTHON_BACKEND_URL) {
    return process.env.PYTHON_BACKEND_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/py-detect`;
  }
  return 'http://localhost:5001';
};

const PYTHON_BACKEND_URL = getPythonBackendUrl();

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

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
      throw new Error('Python backend detection failed');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Detection API error:', error);
    return NextResponse.json({ 
      error: error.name === 'AbortError' ? 'Backend timeout' : 'Detection failed',
      detections: [],
      demo_mode: true 
    }, { status: 503 });
  }
}
