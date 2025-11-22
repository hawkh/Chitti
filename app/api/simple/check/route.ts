import { NextRequest, NextResponse } from 'next/server';
import { validateFile, validateScore, validateCarbonSaved } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const checkType = formData.get('checkType') as string;
    const userId = formData.get('userId') as string;

    // Validate file
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 });
    }

    // Validate checkType
    if (!checkType || !['WELD', 'ETCHING'].includes(checkType)) {
      return NextResponse.json({ error: 'Invalid check type' }, { status: 400 });
    }

    // Mock AI processing - replace with actual AI model call
    const rawScore = Math.random() * 10 + 90; // 90-100%
    const score = validateScore(rawScore);
    const benchmark = { 
      user: validateScore(Math.random() * 3 + 1), 
      avg: 5 
    };
    const rawCarbon = Math.floor(Math.random() * 200 + 200);
    const carbonSaved = validateCarbonSaved(rawCarbon);
    const tips = checkType === 'WELD' 
      ? ['Add 10V voltage', 'Slow arc speed', 'Check electrode angle']
      : ['Reduce etch time by 5s', 'Adjust temperature', 'Check solution concentration'];

    const result = {
      score: Math.round(score),
      status: score > 85 ? 'safe' : 'fix',
      benchmark,
      carbonSaved,
      tip: tips[Math.floor(Math.random() * tips.length)] || 'Continue current practices'
    };

    // Save to database if userId provided
    if (userId) {
      // TODO: Save to QuickCheck model
      // await prisma.quickCheck.create({ ... })
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Check error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
