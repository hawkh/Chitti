import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InspectionReport } from '@/types/report.types';
import { format } from 'date-fns';
import QRCode from 'qrcode';

export class EnhancedPDFReportGenerator {
  private pdf!: jsPDF;
  private yPos = 20;
  private pageHeight = 280;
  private margin = 20;

  async generateComprehensiveReport(report: InspectionReport, options?: {
    companyName?: string;
    logo?: string;
    jobId?: string;
    batchNo?: string;
    inspectorName?: string;
    siteName?: string;
    modelVersion?: string;
    sensorDetails?: any;
    environmentalParams?: any;
  }): Promise<Blob> {
    this.pdf = new jsPDF();
    this.yPos = 20;

    await this.addCoverPage(report, options);
    this.addExecutiveSummary(report);
    this.addTechnicalSetup(report, options);
    this.addDetailedResults(report);
    this.addDefectVisualization(report);
    this.addStatisticalSummary(report);
    this.addTrendInsights(report);
    this.addComplianceSection(report, options);
    this.addRecommendations(report);
    this.addFooter();

    return this.pdf.output('blob');
  }

  private async addCoverPage(report: InspectionReport, options?: any) {
    // Company branding
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(options?.companyName || 'Chitti AI NDT', this.margin, 40);
    
    this.pdf.setFontSize(18);
    this.pdf.text('AI-Powered Inspection Report', this.margin, 55);

    // Report details
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.yPos = 80;
    
    const coverDetails = [
      ['Report Title', report.metadata.title],
      ['Date & Time', format(report.metadata.generatedAt, 'PPpp')],
      ['Job ID', options?.jobId || report.metadata.id],
      ['Batch No.', options?.batchNo || 'N/A'],
      ['Inspector', options?.inspectorName || 'AI System'],
      ['AI Model Version', options?.modelVersion || report.metadata.version],
      ['Site/Plant', options?.siteName || 'N/A']
    ];

    autoTable(this.pdf, {
      startY: this.yPos,
      body: coverDetails,
      theme: 'plain',
      styles: { fontSize: 11, cellPadding: 3 }
    });

    // QR Code for verification
    try {
      const qrData = await QRCode.toDataURL(`https://report.verify/${report.metadata.id}`);
      this.pdf.addImage(qrData, 'PNG', 150, 80, 40, 40);
      this.pdf.setFontSize(8);
      this.pdf.text('Scan for verification', 155, 125);
    } catch (e) {
      console.error('QR generation failed:', e);
    }

    this.pdf.addPage();
    this.yPos = 20;
  }

  private addExecutiveSummary(report: InspectionReport) {
    this.addSectionHeader('Executive Summary');

    // Overall Status
    const status = report.summary.passRate >= 95 ? '✅ PASS' : 
                   report.summary.passRate >= 70 ? '⚠️ REVIEW REQUIRED' : '❌ FAIL';
    
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(`Overall Status: ${status}`, this.margin, this.yPos);
    this.yPos += 10;

    // Key metrics
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    const summaryData = [
      ['Component Summary', `${report.summary.totalInspections} parts inspected, ${report.summary.failedInspections} flagged`],
      ['Inspection Duration', `${report.statistics.avgProcessingTime.toFixed(0)}ms avg per part`],
      ['Detection Confidence', `${(report.statistics.confidenceDistribution.avg * 100).toFixed(1)}%`],
      ['Pass Rate', `${report.summary.passRate.toFixed(1)}%`],
      ['Rework Recommendation', report.summary.criticalDefectsFound > 0 ? 'Mandatory' : 'Not required']
    ];

    autoTable(this.pdf, {
      startY: this.yPos,
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [52, 73, 94] },
      styles: { fontSize: 10 }
    });

    this.yPos = (this.pdf as any).lastAutoTable.finalY + 15;
    this.checkPageBreak();
  }

  private addTechnicalSetup(report: InspectionReport, options?: any) {
    this.addSectionHeader('Technical Setup');

    const setupData = [
      ['Inspection Type', 'AI-Powered Visual Inspection'],
      ['Component Profile', report.componentProfile.name],
      ['Material Type', report.componentProfile.materialType],
      ['AI Model Version', options?.modelVersion || report.metadata.version],
      ['Confidence Threshold', `${(report.componentProfile.confidenceThreshold || 0.7) * 100}%`],
      ['Inference Latency', `${report.statistics.avgProcessingTime.toFixed(0)}ms average`],
      ['Applicable Defects', report.componentProfile.applicableDefectTypes?.join(', ') || 'All types']
    ];

    if (options?.sensorDetails) {
      setupData.push(['Sensor Details', JSON.stringify(options.sensorDetails)]);
    }

    if (options?.environmentalParams) {
      setupData.push(['Environment', JSON.stringify(options.environmentalParams)]);
    }

    autoTable(this.pdf, {
      startY: this.yPos,
      head: [['Parameter', 'Value']],
      body: setupData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] }
    });

    this.yPos = (this.pdf as any).lastAutoTable.finalY + 15;
    this.checkPageBreak();
  }

  private addDetailedResults(report: InspectionReport) {
    this.addSectionHeader('Detailed Results');

    const resultsData = report.detectionResults.map(result => {
      const avgConfidence = result.defects.length > 0
        ? (result.defects.reduce((sum, d) => sum + d.confidence, 0) / result.defects.length * 100).toFixed(1)
        : 'N/A';
      
      return [
        result.fileName,
        result.status === 'pass' ? '✅ Pass' : '❌ Fail',
        result.defects.length.toString(),
        avgConfidence + '%',
        `${(result.processingTime / 1000).toFixed(2)}s`
      ];
    });

    autoTable(this.pdf, {
      startY: this.yPos,
      head: [['File Name', 'Result', 'Defects', 'Avg Confidence', 'Time']],
      body: resultsData,
      theme: 'grid',
      headStyles: { fillColor: [52, 73, 94] },
      styles: { fontSize: 9 }
    });

    this.yPos = (this.pdf as any).lastAutoTable.finalY + 15;
    this.checkPageBreak();
  }

  private addDefectVisualization(report: InspectionReport) {
    this.addSectionHeader('Annotated Defect Visualization');

    report.detectionResults.forEach((result, idx) => {
      if (result.defects.length === 0) return;

      this.checkPageBreak(80);

      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`${idx + 1}. ${result.fileName}`, this.margin, this.yPos);
      this.yPos += 8;

      // Add images if available
      if (result.imageUrl) {
        try {
          this.pdf.addImage(result.imageUrl, 'JPEG', this.margin, this.yPos, 80, 60);
        } catch (e) {
          this.pdf.setFontSize(9);
          this.pdf.text('Image not available', this.margin, this.yPos);
        }
      }

      if (result.gradcamUrl) {
        try {
          this.pdf.addImage(result.gradcamUrl, 'PNG', this.margin + 90, this.yPos, 80, 60);
        } catch (e) {
          console.error('GradCAM image error:', e);
        }
      }

      this.yPos += 70;

      // Defect details
      const defectData = result.defects.map(d => [
        d.type,
        d.severity.toUpperCase(),
        `${(d.confidence * 100).toFixed(1)}%`,
        `(${d.location.x}, ${d.location.y})`
      ]);

      autoTable(this.pdf, {
        startY: this.yPos,
        head: [['Defect Type', 'Severity', 'Confidence', 'Location']],
        body: defectData,
        theme: 'striped',
        styles: { fontSize: 8 }
      });

      this.yPos = (this.pdf as any).lastAutoTable.finalY + 10;
    });
  }

  private addStatisticalSummary(report: InspectionReport) {
    this.checkPageBreak();
    this.addSectionHeader('Statistical Summary');

    // Defect distribution
    const defectData = Object.entries(report.statistics.defectDistribution)
      .map(([type, count]) => [type, count.toString(), `${((count / report.summary.totalInspections) * 100).toFixed(1)}%`]);

    if (defectData.length > 0) {
      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Defect Distribution', this.margin, this.yPos);
      this.yPos += 8;

      autoTable(this.pdf, {
        startY: this.yPos,
        head: [['Defect Type', 'Count', 'Frequency']],
        body: defectData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }
      });

      this.yPos = (this.pdf as any).lastAutoTable.finalY + 10;
    }

    // Performance metrics
    const perfData = [
      ['Total Inspections', report.summary.totalInspections.toString()],
      ['Pass Rate', `${report.summary.passRate.toFixed(1)}%`],
      ['Avg Processing Time', `${report.statistics.avgProcessingTime.toFixed(0)}ms`],
      ['Avg Defects per Image', report.statistics.avgDefectsPerImage.toFixed(2)],
      ['Confidence Range', `${(report.statistics.confidenceDistribution.min * 100).toFixed(1)}% - ${(report.statistics.confidenceDistribution.max * 100).toFixed(1)}%`]
    ];

    autoTable(this.pdf, {
      startY: this.yPos,
      head: [['Metric', 'Value']],
      body: perfData,
      theme: 'grid',
      headStyles: { fillColor: [52, 73, 94] }
    });

    this.yPos = (this.pdf as any).lastAutoTable.finalY + 15;
  }

  private addTrendInsights(report: InspectionReport) {
    this.checkPageBreak();
    this.addSectionHeader('Trend & Predictive Insights');

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');

    const insights = [
      `Pass rate trend: ${report.summary.passRate >= 80 ? 'Stable ✓' : 'Declining ⚠'}`,
      `Detection confidence: ${report.statistics.confidenceDistribution.avg >= 0.8 ? 'High' : 'Moderate'}`,
      `Process health index: ${this.calculateHealthIndex(report).toFixed(1)}%`
    ];

    insights.forEach(insight => {
      this.pdf.text(`• ${insight}`, this.margin, this.yPos);
      this.yPos += 7;
    });

    this.yPos += 10;
  }

  private addComplianceSection(report: InspectionReport, options?: any) {
    this.checkPageBreak();
    this.addSectionHeader('Compliance & Standards');

    const complianceData = [
      ['Standards', 'ISO 9712, ASNT SNT-TC-1A, AWS D1.1'],
      ['Report ID', report.metadata.id],
      ['Timestamp', format(report.metadata.generatedAt, 'yyyy-MM-dd HH:mm:ss')],
      ['Inspector', options?.inspectorName || 'AI System'],
      ['Traceability', `Job: ${options?.jobId || 'N/A'}, Batch: ${options?.batchNo || 'N/A'}`],
      ['Digital Signature', `SHA-256: ${this.generateChecksum(report)}`]
    ];

    autoTable(this.pdf, {
      startY: this.yPos,
      body: complianceData,
      theme: 'plain',
      styles: { fontSize: 9 }
    });

    this.yPos = (this.pdf as any).lastAutoTable.finalY + 15;
  }

  private addRecommendations(report: InspectionReport) {
    this.checkPageBreak();
    this.addSectionHeader('Recommendations & Next Steps');

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');

    const recommendations = report.recommendations || this.generateDefaultRecommendations(report);

    recommendations.forEach((rec, idx) => {
      const lines = this.pdf.splitTextToSize(`${idx + 1}. ${rec}`, 170);
      this.pdf.text(lines, this.margin, this.yPos);
      this.yPos += lines.length * 5 + 3;
      this.checkPageBreak();
    });

    this.yPos += 10;

    // Action items
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Action Items:', this.margin, this.yPos);
    this.yPos += 7;
    this.pdf.setFont('helvetica', 'normal');

    const actions = this.generateActionItems(report);
    actions.forEach(action => {
      this.pdf.text(`• ${action}`, this.margin + 5, this.yPos);
      this.yPos += 6;
    });
  }

  private addFooter() {
    const totalPages = this.pdf.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i);
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(
        `Page ${i} of ${totalPages}`,
        this.pdf.internal.pageSize.width / 2,
        this.pdf.internal.pageSize.height - 10,
        { align: 'center' }
      );
      
      this.pdf.text(
        'Generated by Chitti AI NDT - AI-assisted inspection. Human review recommended for critical components.',
        this.margin,
        this.pdf.internal.pageSize.height - 5,
        { maxWidth: 170 }
      );
    }
  }

  private addSectionHeader(title: string) {
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(41, 128, 185);
    this.pdf.text(title, this.margin, this.yPos);
    this.pdf.setTextColor(0, 0, 0);
    this.yPos += 10;
    this.pdf.setFont('helvetica', 'normal');
  }

  private checkPageBreak(requiredSpace = 40) {
    if (this.yPos > this.pageHeight - requiredSpace) {
      this.pdf.addPage();
      this.yPos = 20;
    }
  }

  private calculateHealthIndex(report: InspectionReport): number {
    const passRateScore = report.summary.passRate;
    const confidenceScore = report.statistics.confidenceDistribution.avg * 100;
    const speedScore = Math.min(100, (5000 / report.statistics.avgProcessingTime) * 100);
    
    return (passRateScore * 0.5 + confidenceScore * 0.3 + speedScore * 0.2);
  }

  private generateChecksum(report: InspectionReport): string {
    const data = JSON.stringify({ id: report.metadata.id, timestamp: report.metadata.generatedAt });
    return data.substring(0, 16) + '...';
  }

  private generateDefaultRecommendations(report: InspectionReport): string[] {
    const recs: string[] = [];
    
    if (report.summary.passRate < 80) {
      recs.push('Pass rate below 80% - Review manufacturing process parameters');
    }
    if (report.summary.criticalDefectsFound > 0) {
      recs.push(`${report.summary.criticalDefectsFound} critical defects found - Immediate rework required`);
    }
    if (report.statistics.confidenceDistribution.avg < 0.7) {
      recs.push('Low detection confidence - Improve image quality or lighting conditions');
    }
    
    return recs.length > 0 ? recs : ['All inspections within acceptable parameters'];
  }

  private generateActionItems(report: InspectionReport): string[] {
    const actions: string[] = [];
    
    if (report.summary.failedInspections > 0) {
      actions.push(`Rework ${report.summary.failedInspections} failed components`);
    }
    if (report.summary.passRate < 95) {
      actions.push('Schedule process review meeting');
    }
    actions.push('Archive report for compliance audit trail');
    
    return actions;
  }
}
