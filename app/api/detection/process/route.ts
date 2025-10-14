import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { jobId, fileId, detections, processingTime } = await request.json();

    if (!jobId || !fileId) {
      return NextResponse.json({
        success: false,
        error: { message: 'Job ID and File ID required', code: 'MISSING_IDS' }
      }, { status: 400 });
    }

    await prisma.detectionFile.update({
      where: { id: fileId },
      data: { status: 'COMPLETED', processedAt: new Date() },
    });

    const result = await prisma.detectionResult.create({
      data: {
        jobId,
        fileId,
        overallStatus: detections.length > 0 ? 'FAIL' : 'PASS',
        processingTime: processingTime || 0,
        defectsFound: detections.length,
        confidence: detections.length > 0 ? detections[0].confidence : 1.0,
        detections: detections as any,
      },
    });

    const job = await prisma.detectionJob.findUnique({
      where: { id: jobId },
      include: { files: true },
    });

    if (job) {
      const processedFiles = job.files.filter(f => f.status === 'COMPLETED').length;
      await prisma.detectionJob.update({
        where: { id: jobId },
        data: {
          processedFiles,
          progress: (processedFiles / job.totalFiles) * 100,
          status: processedFiles === job.totalFiles ? 'COMPLETED' : 'PROCESSING',
        },
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { message: 'Failed to process detection', code: 'PROCESS_ERROR' }
    }, { status: 500 });
  }
}
