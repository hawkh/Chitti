// API Route: Export Audit Data to CSV
// POST /api/audit/reports/export-csv

import { NextRequest, NextResponse } from 'next/server';
import { CSVExporter, AuditCSVData, CSVExportOptions } from '@/lib/audit/csv-exporter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, options } = body as {
      type: 'audit' | 'audits' | 'benchmarking' | 'trends' | 'scores';
      data: any;
      options?: CSVExportOptions;
    };

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Invalid request: type and data required' },
        { status: 400 }
      );
    }

    let csvContent: string;
    let filename: string;

    switch (type) {
      case 'audit':
        csvContent = CSVExporter.exportAudit(data as AuditCSVData, options);
        filename = CSVExporter.generateFilename('audit', data.audit.id);
        break;

      case 'audits':
        csvContent = CSVExporter.exportMultipleAudits(data as AuditCSVData[], options);
        filename = CSVExporter.generateFilename('audit', 'multiple');
        break;

      case 'benchmarking':
        csvContent = CSVExporter.exportBenchmarking(data);
        filename = CSVExporter.generateFilename('benchmarking');
        break;

      case 'trends':
        csvContent = CSVExporter.exportTrendData(data);
        filename = CSVExporter.generateFilename('trends');
        break;

      case 'scores':
        csvContent = CSVExporter.exportComplianceScores(data);
        filename = CSVExporter.generateFilename('scores');
        break;

      default:
        return NextResponse.json(
          { error: `Unsupported export type: ${type}` },
          { status: 400 }
        );
    }

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8;',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    );
  }
}
