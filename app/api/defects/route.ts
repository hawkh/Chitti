import { NextRequest, NextResponse } from 'next/server';
import { defectLibrary } from '@/services/knowledge-base/DefectLibrary';
import { handleApiError } from '@/lib/errorHandler';

export async function GET(req: NextRequest) {
  try {
    // Validate request
    if (!req.url) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type) {
      const normalizedType = type.toLowerCase().replace(/\s+/g, '_');
      const defect = defectLibrary.getDefectInfo(normalizedType);
      
      if (!defect) {
        if (type.toLowerCase().includes('good') || type.toLowerCase().includes('safe')) {
          return NextResponse.json({
            id: 'good_weld',
            defectType: 'Good Weld',
            definition: 'Acceptable weld with no significant defects',
            causes: [],
            remedies: [],
            preventiveMeasures: ['Continue current practices', 'Maintain consistent technique'],
            standardsReference: {},
            visualExamples: [],
            severity: 'none'
          });
        }
        return NextResponse.json({ error: 'Defect not found' }, { status: 404 });
      }
      return NextResponse.json(defect);
    }

    const allDefects = defectLibrary.getAllDefects();
    return NextResponse.json(allDefects);
  } catch (error) {
    console.error('Defect library error:', error);
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
