// Batch results aggregation service

import { DetectionResult, BatchResult, DefectSeverity, ResultStatus, ProcessingJob } from '../../types';

export interface BatchSummaryStats {
  totalFiles: number;
  passedFiles: number;
  failedFiles: number;
  reviewFiles: number;
  totalDefects: number;
  defectsByType: Record<string, number>;
  defectsBySeverity: Record<DefectSeverity, number>;
  averageConfidence: number;
  averageProcessingTime: number;
  passRate: number;
  failRate: number;
  reviewRate: number;
  qualityScore: number;
}

export interface BatchQualityMetrics {
  overallQuality: 'excellent' | 'good' | 'fair' | 'poor';
  qualityScore: number;
  recommendations: string[];
  criticalIssues: string[];
  trends: {
    defectTrend: 'improving' | 'stable' | 'declining';
    confidenceTrend: 'improving' | 'stable' | 'declining';
  };
}

export class BatchResultsAggregator {
  private static instance: BatchResultsAggregator;

  private constructor() {}

  static getInstance(): BatchResultsAggregator {
    if (!BatchResultsAggregator.instance) {
      BatchResultsAggregator.instance = new BatchResultsAggregator();
    }
    return BatchResultsAggregator.instance;
  }

  // Aggregate results from a completed job
  aggregateJobResults(job: ProcessingJob): BatchResult {
    const results = job.files
      .filter(file => file.result)
      .map(file => file.result!) as DetectionResult[];

    const summary = this.calculateSummaryStats(results);
    const processingTime = job.completedAt && job.startedAt 
      ? job.completedAt.getTime() - job.startedAt.getTime()
      : 0;

    return {
      id: `batch-${job.id}`,
      jobId: job.id,
      results,
      summary: {
        totalFiles: summary.totalFiles,
        passedFiles: summary.passedFiles,
        failedFiles: summary.failedFiles,
        reviewFiles: summary.reviewFiles,
        averageConfidence: summary.averageConfidence,
        processingTime
      },
      createdAt: job.completedAt || new Date()
    };
  }

  // Calculate comprehensive summary statistics
  calculateSummaryStats(results: DetectionResult[]): BatchSummaryStats {
    const totalFiles = results.length;
    
    if (totalFiles === 0) {
      return this.getEmptyStats();
    }

    // Basic counts
    const passedFiles = results.filter(r => r.overallStatus === ResultStatus.PASS).length;
    const failedFiles = results.filter(r => r.overallStatus === ResultStatus.FAIL).length;
    const reviewFiles = results.filter(r => r.overallStatus === ResultStatus.REVIEW).length;

    // Defect analysis
    const allDefects = results.flatMap(r => r.detectedDefects);
    const totalDefects = allDefects.length;

    const defectsByType = allDefects.reduce((acc, defect) => {
      const type = defect.defectType.name;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const defectsBySeverity = allDefects.reduce((acc, defect) => {
      acc[defect.severity] = (acc[defect.severity] || 0) + 1;
      return acc;
    }, {} as Record<DefectSeverity, number>);

    // Confidence and processing metrics
    const averageConfidence = totalDefects > 0
      ? allDefects.reduce((sum, d) => sum + d.confidence, 0) / totalDefects
      : 0;

    const averageProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0) / totalFiles;

    // Rates
    const passRate = (passedFiles / totalFiles) * 100;
    const failRate = (failedFiles / totalFiles) * 100;
    const reviewRate = (reviewFiles / totalFiles) * 100;

    // Quality score calculation
    const qualityScore = this.calculateQualityScore({
      passRate,
      averageConfidence,
      totalDefects,
      totalFiles,
      defectsBySeverity
    });

    return {
      totalFiles,
      passedFiles,
      failedFiles,
      reviewFiles,
      totalDefects,
      defectsByType,
      defectsBySeverity,
      averageConfidence,
      averageProcessingTime,
      passRate,
      failRate,
      reviewRate,
      qualityScore
    };
  }

  // Calculate quality metrics and recommendations
  calculateQualityMetrics(results: DetectionResult[]): BatchQualityMetrics {
    const stats = this.calculateSummaryStats(results);
    const recommendations: string[] = [];
    const criticalIssues: string[] = [];

    // Determine overall quality
    let overallQuality: 'excellent' | 'good' | 'fair' | 'poor';
    if (stats.qualityScore >= 90) {
      overallQuality = 'excellent';
    } else if (stats.qualityScore >= 75) {
      overallQuality = 'good';
    } else if (stats.qualityScore >= 60) {
      overallQuality = 'fair';
    } else {
      overallQuality = 'poor';
    }

    // Generate recommendations based on statistics
    if (stats.passRate < 80) {
      recommendations.push('Consider reviewing manufacturing processes to improve pass rate');
    }

    if (stats.averageConfidence < 0.7) {
      recommendations.push('Low confidence scores detected - consider adjusting detection sensitivity');
    }

    if (stats.defectsBySeverity[DefectSeverity.CRITICAL] > 0) {
      criticalIssues.push(`${stats.defectsBySeverity[DefectSeverity.CRITICAL]} critical defects found requiring immediate attention`);
    }

    if (stats.defectsBySeverity[DefectSeverity.HIGH] > stats.totalFiles * 0.1) {
      criticalIssues.push('High number of severe defects detected - review quality control processes');
    }

    // Most common defect type recommendation
    const mostCommonDefect = Object.entries(stats.defectsByType)
      .sort(([, a], [, b]) => b - a)[0];
    
    if (mostCommonDefect && mostCommonDefect[1] > stats.totalFiles * 0.3) {
      recommendations.push(`${mostCommonDefect[0]} defects are prevalent - focus on prevention strategies`);
    }

    // Processing time recommendations
    if (stats.averageProcessingTime > 5000) {
      recommendations.push('Consider optimizing detection parameters to improve processing speed');
    }

    // Mock trend calculation (in real implementation, this would compare with historical data)
    const trends = {
      defectTrend: 'stable' as const,
      confidenceTrend: 'stable' as const
    };

    return {
      overallQuality,
      qualityScore: stats.qualityScore,
      recommendations,
      criticalIssues,
      trends
    };
  }

  // Compare batch results with historical data
  compareBatchResults(currentBatch: DetectionResult[], historicalBatches: DetectionResult[][]): {
    improvement: number;
    comparison: 'better' | 'worse' | 'similar';
    insights: string[];
  } {
    const currentStats = this.calculateSummaryStats(currentBatch);
    
    if (historicalBatches.length === 0) {
      return {
        improvement: 0,
        comparison: 'similar',
        insights: ['No historical data available for comparison']
      };
    }

    // Calculate average historical metrics
    const historicalStats = historicalBatches.map(batch => this.calculateSummaryStats(batch));
    const avgHistoricalPassRate = historicalStats.reduce((sum, s) => sum + s.passRate, 0) / historicalStats.length;
    const avgHistoricalQuality = historicalStats.reduce((sum, s) => sum + s.qualityScore, 0) / historicalStats.length;

    const passRateImprovement = currentStats.passRate - avgHistoricalPassRate;
    const qualityImprovement = currentStats.qualityScore - avgHistoricalQuality;

    const improvement = (passRateImprovement + qualityImprovement) / 2;
    
    let comparison: 'better' | 'worse' | 'similar';
    if (improvement > 5) {
      comparison = 'better';
    } else if (improvement < -5) {
      comparison = 'worse';
    } else {
      comparison = 'similar';
    }

    const insights: string[] = [];
    
    if (passRateImprovement > 5) {
      insights.push(`Pass rate improved by ${passRateImprovement.toFixed(1)}% compared to historical average`);
    } else if (passRateImprovement < -5) {
      insights.push(`Pass rate decreased by ${Math.abs(passRateImprovement).toFixed(1)}% compared to historical average`);
    }

    if (currentStats.averageConfidence > 0.8) {
      insights.push('Detection confidence is high, indicating reliable results');
    }

    if (currentStats.totalDefects === 0) {
      insights.push('No defects detected in this batch - excellent quality');
    }

    return {
      improvement,
      comparison,
      insights
    };
  }

  // Generate batch report summary
  generateBatchReport(results: DetectionResult[], jobId?: string): {
    summary: BatchSummaryStats;
    qualityMetrics: BatchQualityMetrics;
    detailedBreakdown: {
      fileResults: Array<{
        fileName: string;
        status: ResultStatus;
        defectCount: number;
        confidence: number;
        processingTime: number;
      }>;
      defectDetails: Array<{
        type: string;
        count: number;
        averageConfidence: number;
        severityDistribution: Record<DefectSeverity, number>;
      }>;
    };
    recommendations: string[];
  } {
    const summary = this.calculateSummaryStats(results);
    const qualityMetrics = this.calculateQualityMetrics(results);

    // Detailed file breakdown
    const fileResults = results.map(result => ({
      fileName: result.fileName,
      status: result.overallStatus,
      defectCount: result.detectedDefects.length,
      confidence: result.detectedDefects.length > 0
        ? result.detectedDefects.reduce((sum, d) => sum + d.confidence, 0) / result.detectedDefects.length
        : 0,
      processingTime: result.processingTime
    }));

    // Detailed defect breakdown
    const defectDetails = Object.entries(summary.defectsByType).map(([type, count]) => {
      const typeDefects = results.flatMap(r => r.detectedDefects).filter(d => d.defectType.name === type);
      const averageConfidence = typeDefects.reduce((sum, d) => sum + d.confidence, 0) / typeDefects.length;
      
      const severityDistribution = typeDefects.reduce((acc, defect) => {
        acc[defect.severity] = (acc[defect.severity] || 0) + 1;
        return acc;
      }, {} as Record<DefectSeverity, number>);

      return {
        type,
        count,
        averageConfidence,
        severityDistribution
      };
    });

    // Combined recommendations
    const recommendations = [
      ...qualityMetrics.recommendations,
      ...qualityMetrics.criticalIssues
    ];

    return {
      summary,
      qualityMetrics,
      detailedBreakdown: {
        fileResults,
        defectDetails
      },
      recommendations
    };
  }

  // Calculate quality score based on various factors
  private calculateQualityScore(params: {
    passRate: number;
    averageConfidence: number;
    totalDefects: number;
    totalFiles: number;
    defectsBySeverity: Record<DefectSeverity, number>;
  }): number {
    const { passRate, averageConfidence, totalDefects, totalFiles, defectsBySeverity } = params;

    // Base score from pass rate (0-50 points)
    let score = passRate * 0.5;

    // Confidence bonus (0-20 points)
    score += averageConfidence * 20;

    // Defect severity penalty
    const criticalDefects = defectsBySeverity[DefectSeverity.CRITICAL] || 0;
    const highDefects = defectsBySeverity[DefectSeverity.HIGH] || 0;
    
    score -= criticalDefects * 10; // -10 points per critical defect
    score -= highDefects * 5; // -5 points per high severity defect

    // Defect density penalty
    const defectDensity = totalDefects / totalFiles;
    if (defectDensity > 1) {
      score -= (defectDensity - 1) * 10; // Penalty for high defect density
    }

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }

  private getEmptyStats(): BatchSummaryStats {
    return {
      totalFiles: 0,
      passedFiles: 0,
      failedFiles: 0,
      reviewFiles: 0,
      totalDefects: 0,
      defectsByType: {},
      defectsBySeverity: {} as Record<DefectSeverity, number>,
      averageConfidence: 0,
      averageProcessingTime: 0,
      passRate: 0,
      failRate: 0,
      reviewRate: 0,
      qualityScore: 0
    };
  }
}