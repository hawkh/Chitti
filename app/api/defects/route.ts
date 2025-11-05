import { NextRequest, NextResponse } from 'next/server';
import { defectLibrary } from '@/services/knowledge-base/DefectLibrary';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type) {
      const defect = defectLibrary.getDefectInfo(type);
      if (!defect) {
        return NextResponse.json({ error: 'Defect not found' }, { status: 404 });
      }
      return NextResponse.json(defect);
    }

    const allDefects = defectLibrary.getAllDefects();
    return NextResponse.json(allDefects);
  } catch (error) {
    console.error('Defect library error:', error);
    return NextResponse.json({ error: 'Failed to fetch defects' }, { status: 500 });
  }
}
