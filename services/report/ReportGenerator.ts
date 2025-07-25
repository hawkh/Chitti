import { InspectionReport, ReportMetadata, ReportSummary, DetectionReportItem, ReportStatistics } from '@/types/report.types';
import { DetectionResult, ComponentProfile, ResultStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class ReportGenerator {
  generateInspectionReport(
    results: DetectionResult[],
    profile: ComponentProfile,
    options: {
      title?: string;
      includeRecommendations?: boolean;
      dateRange?: { from: Date; to: Date };
    } = {}
  ): InspectionReport {
    const metadata: ReportMetadata = {
      id: uuidv4(),
      title: options.title || 'Defect Detection Report',
      generatedAt: new Date(),
      format: 'json',
      version: '1.0.0'
    };

    const filteredResults = this.filterResultsByDateRange(results, options.dateRange);
    const summary = this.generateSummary(filteredResults, options.dateRange);
    const detectionResults = this.mapDetectionResults(filteredResults);
    const statistics = this.calculateStatistics(filteredResults);
    const recommendations = options.includeRecommendations 
      ? this.generateRecommendations(statistics, summary)
      : undefined;

    return {
      metadata,
      summary,
      detectionResults,
      statistics,
      componentProfile: {
        name: profile.name,
        materialType: profile.materialType,
        confidenceThreshold: profile.defaultSensitivity,
        applicableDefectTypes: profile.criticalDefects
      },
      recommendations
    };
  }

  private filterResultsByDateRange(
    results: DetectionResult[],
    dateRange?: { from: Date; to: Date }
  ): DetectionResult[] {
    if (!dateRange) return results;
    return results.filter(r => r.timestamp >= dateRange.from && r.timestamp <= dateRange.to);
  }

  private generateSummary(
    results: DetectionResult[],
    dateRange?: { from: Date; to: Date }
  ): ReportSummary {
    const passed = results.filter(r => r.overallStatus === 'pass').length;
    const failed = results.filter(r => r.overallStatus === 'fail').length;
    const allDefects = results.flatMap(r => r.detectedDefects);
    const criticalDefects = allDefects.filter(d => d.severity === 'critical').length;

    const defectCounts = allDefects.reduce((acc, defect) => {
      const type = defect.defectType.name;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonDefectEntry = Object.entries(defectCounts)
      .sort(([, a], [, b]) => b - a)[0];

    return {
      totalInspections: results.length,
      passedInspections: passed,
      failedInspections: failed,
      passRate: results.length > 0 ? (passed / results.length) * 100 : 0,
      dateRange: dateRange || {
        from: results.length > 0 ? new Date(Math.min(...results.map(r => r.timestamp.getTime()))) : new Date(),
        to: results.length > 0 ? new Date(Math.max(...results.map(r => r.timestamp.getTime()))) : new Date()
      },
      criticalDefectsFound: criticalDefects,
      mostCommonDefect: mostCommonDefectEntry 
        ? { type: mostCommonDefectEntry[0], count: mostCommonDefectEntry[1] }
        : undefined
    };
  }

  private mapDetectionResults(results: DetectionResult[]): DetectionReportItem[] {
    return results.map(result => ({
      id: result.id,
      timestamp: result.timestamp,
      fileName: result.fileName,
      status: result.overallStatus === ResultStatus.PASS ? 'pass' : 'fail',
      defects: result.detectedDefects.map(defect => ({
        type: defect.defectType.name,
        severity: defect.severity,
        confidence: defect.confidence,
        location: defect.boundingBox
      })),
      processingTime: result.processingTime,
      imageMetadata: {
        width: result.metadata?.imageSize?.width || 0,
        height: result.metadata?.imageSize?.height || 0,
        format: result.metadata?.format || 'unknown'
      }
    }));
  }

  private calculateStatistics(results: DetectionResult[]): ReportStatistics {
    const allDefects = results.flatMap(r => r.detectedDefects);

    const defectDistribution = allDefects.reduce((acc, defect) => {
      const type = defect.defectType.name;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const severityDistribution = allDefects.reduce((acc, defect) => {
      acc[defect.severity] = (acc[defect.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const confidences = allDefects.map(d => d.confidence);
    const processingTimes = results.map(r => r.processingTime);

    return {
      defectDistribution,
      severityDistribution,
      avgProcessingTime: processingTimes.length > 0 
        ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length 
        : 0,
      avgDefectsPerImage: results.length > 0 ? allDefects.length / results.length : 0,
      confidenceDistribution: {
        min: confidences.length > 0 ? Math.min(...confidences) : 0,
        max: confidences.length > 0 ? Math.max(...confidences) : 0,
        avg: confidences.length > 0 ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0
      }
    };
  }

  private generateRecommendations(
    statistics: ReportStatistics,
    summary: ReportSummary
  ): string[] {
    const recommendations: string[] = [];

    // Pass rate recommendations
    if (summary.passRate < 50) {
      recommendations.push('Critical: Pass rate is below 50%. Review manufacturing process and quality control measures.');
    } else if (summary.passRate < 80) {
      recommendations.push('Warning: Pass rate is below 80%. Consider process improvements to reduce defect rate.');
    }

    // Critical defects recommendations
    if (summary.criticalDefectsFound > 0) {
      recommendations.push(`Found ${summary.criticalDefectsFound} critical defects. Immediate action required for affected components.`);
    }

    // Confidence recommendations
    if (statistics.confidenceDistribution.avg < 0.7) {
      recommendations.push('Average detection confidence is low. Consider improving image quality or adjusting detection parameters.');
    }

    // Processing time recommendations
    if (statistics.avgProcessingTime > 5000) {
      recommendations.push('Average processing time exceeds 5 seconds. Consider optimizing image resolution or batch size.');
    }

    // Defect pattern recommendations
    if (summary.mostCommonDefect && summary.mostCommonDefect.count > summary.totalInspections * 0.3) {
      recommendations.push(`"${summary.mostCommonDefect.type}" defects appear in over 30% of inspections. Investigate root cause.`);
    }

    return recommendations;
  }
}