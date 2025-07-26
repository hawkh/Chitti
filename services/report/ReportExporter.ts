import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InspectionReport } from '@/types/report.types';
import { format } from 'date-fns';

export class ReportExporter {
  async exportToPDF(report: InspectionReport): Promise<Blob> {
    const pdf = new jsPDF();
    let yPosition = 20;

    // Title
    pdf.setFontSize(20);
    pdf.text(report.metadata.title, 20, yPosition);
    yPosition += 10;

    // Metadata
    pdf.setFontSize(10);
    pdf.text(`Generated: ${format(report.metadata.generatedAt, 'PPpp')}`, 20, yPosition);
    yPosition += 10;

    // Summary Section
    pdf.setFontSize(16);
    pdf.text('Summary', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    const summaryData = [
      ['Total Inspections', report.summary.totalInspections.toString()],
      ['Passed', `${report.summary.passedInspections} (${report.summary.passRate.toFixed(1)}%)`],
      ['Failed', report.summary.failedInspections.toString()],
      ['Critical Defects', report.summary.criticalDefectsFound.toString()],
      ['Date Range', `${format(report.summary.dateRange.from, 'PP')} - ${format(report.summary.dateRange.to, 'PP')}`]
    ];

    if (report.summary.mostCommonDefect) {
      summaryData.push([
        'Most Common Defect',
        `${report.summary.mostCommonDefect.type} (${report.summary.mostCommonDefect.count})`
      ]);
    }

    autoTable(pdf, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] }
    });

    yPosition = (pdf as any).lastAutoTable.finalY + 10;

    // Component Profile
    pdf.setFontSize(16);
    pdf.text('Component Profile', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    const profileData = [
      ['Name', report.componentProfile.name],
      ['Material Type', report.componentProfile.materialType],
      ['Confidence Threshold', report.componentProfile.confidenceThreshold?.toString() || '0.7'],
      ['Defect Types', report.componentProfile.applicableDefectTypes?.join(', ') || 'N/A']
    ];

    autoTable(pdf, {
      startY: yPosition,
      head: [['Property', 'Value']],
      body: profileData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] }
    });

    yPosition = (pdf as any).lastAutoTable.finalY + 10;

    // Statistics
    if (yPosition > 240) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.text('Statistics', 20, yPosition);
    yPosition += 10;

    // Defect Distribution Chart
    const defectData = Object.entries(report.statistics.defectDistribution)
      .map(([type, count]) => [type, count.toString()]);

    if (defectData.length > 0) {
      autoTable(pdf, {
        startY: yPosition,
        head: [['Defect Type', 'Count']],
        body: defectData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }
      });
      yPosition = (pdf as any).lastAutoTable.finalY + 10;
    }

    // Severity Distribution
    const severityData = Object.entries(report.statistics.severityDistribution)
      .map(([severity, count]) => [severity.toUpperCase(), count.toString()]);

    if (severityData.length > 0) {
      autoTable(pdf, {
        startY: yPosition,
        head: [['Severity', 'Count']],
        body: severityData,
        theme: 'striped',
        headStyles: { fillColor: [231, 76, 60] }
      });
      yPosition = (pdf as any).lastAutoTable.finalY + 10;
    }

    // Recommendations
    if (report.recommendations && report.recommendations.length > 0) {
      if (yPosition > 240) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(16);
      pdf.text('Recommendations', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      report.recommendations.forEach((rec, index) => {
        const lines = pdf.splitTextToSize(`${index + 1}. ${rec}`, 170);
        pdf.text(lines, 20, yPosition);
        yPosition += lines.length * 5 + 5;

        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
      });
    }

    // Detection Results (Summary Table)
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text('Detection Results', 20, 20);

    const resultsData = report.detectionResults.map(result => [
      format(result.timestamp, 'PP HH:mm'),
      result.fileName,
      result.status.toUpperCase(),
      result.defects.length.toString(),
      `${(result.processingTime / 1000).toFixed(1)}s`
    ]);

    autoTable(pdf, {
      startY: 30,
      head: [['Date/Time', 'File', 'Status', 'Defects', 'Time']],
      body: resultsData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 }
    });

    return pdf.output('blob');
  }

  exportToJSON(report: InspectionReport): string {
    return JSON.stringify(report, null, 2);
  }

  exportToCSV(report: InspectionReport): string {
    const csvRows: string[] = [];

    // Headers
    csvRows.push('Timestamp,File Name,Status,Defect Type,Severity,Confidence,Processing Time (ms)');

    // Data rows
    report.detectionResults.forEach(result => {
      if (result.defects.length === 0) {
        csvRows.push([
          format(result.timestamp, 'yyyy-MM-dd HH:mm:ss'),
          result.fileName,
          result.status,
          '',
          '',
          '',
          result.processingTime.toString()
        ].join(','));
      } else {
        result.defects.forEach(defect => {
          csvRows.push([
            format(result.timestamp, 'yyyy-MM-dd HH:mm:ss'),
            result.fileName,
            result.status,
            defect.type,
            defect.severity,
            defect.confidence.toFixed(3),
            result.processingTime.toString()
          ].join(','));
        });
      }
    });

    return csvRows.join('\n');
  }

  async downloadReport(
    report: InspectionReport, 
    format: 'pdf' | 'json' | 'csv', 
    filename?: string
  ) {
    let blob: Blob;
    let defaultFilename: string;

    switch (format) {
      case 'pdf':
        blob = await this.exportToPDF(report);
        defaultFilename = 'inspection-report.pdf';
        break;
      case 'json':
        const jsonString = this.exportToJSON(report);
        blob = new Blob([jsonString], { type: 'application/json' });
        defaultFilename = 'inspection-report.json';
        break;
      case 'csv':
        const csvString = this.exportToCSV(report);
        blob = new Blob([csvString], { type: 'text/csv' });
        defaultFilename = 'inspection-report.csv';
        break;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}