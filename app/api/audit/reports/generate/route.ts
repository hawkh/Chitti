// API Route: Generate Audit Report
// POST /api/audit/reports/generate

import { NextRequest, NextResponse } from 'next/server';
import { ReportGenerator, ReportData, ReportOptions } from '@/lib/audit/report-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportData, options } = body as {
      reportData: ReportData;
      options?: ReportOptions;
    };

    if (!reportData || !reportData.audit) {
      return NextResponse.json(
        { error: 'Invalid request: reportData required' },
        { status: 400 }
      );
    }

    // Generate report
    const report = await ReportGenerator.generateReport(reportData, options || {});

    // Return appropriate response based on format
    const format = options?.format || 'html';
    
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        report: JSON.parse(report),
      });
    }

    // For HTML/PDF, return as text
    return new NextResponse(report, {
      headers: {
        'Content-Type': format === 'pdf' ? 'application/pdf' : 'text/html',
        'Content-Disposition': `attachment; filename="audit-report-${reportData.audit.id}.${format === 'pdf' ? 'pdf' : 'html'}"`,
      },
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
