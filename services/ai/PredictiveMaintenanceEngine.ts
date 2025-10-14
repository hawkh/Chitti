import * as tf from '@tensorflow/tfjs';
import { prisma } from '@/lib/database';

export class PredictiveMaintenanceEngine {
  private model: tf.LayersModel | null = null;

  async loadModel(): Promise<void> {
    this.model = await tf.loadLayersModel('/models/predictive/model.json');
  }

  async predictFailure(defectHistory: any[], componentAge: number): Promise<{
    failureProbability: number;
    daysToFailure: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    recommendedAction: string;
  }> {
    if (!this.model) await this.loadModel();

    const features = this.extractFeatures(defectHistory, componentAge);
    const prediction = this.model!.predict(tf.tensor2d([features])) as tf.Tensor;
    const [probability, days] = await prediction.data();

    return {
      failureProbability: probability,
      daysToFailure: Math.round(days),
      riskLevel: this.getRiskLevel(probability),
      recommendedAction: this.getRecommendation(probability, days)
    };
  }

  private extractFeatures(history: any[], age: number): number[] {
    const defectCount = history.length;
    const avgSeverity = history.reduce((sum, d) => sum + d.severity, 0) / defectCount || 0;
    const defectTrend = this.calculateTrend(history);
    
    return [defectCount, avgSeverity, defectTrend, age];
  }

  private getRiskLevel(probability: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (probability > 0.8) return 'CRITICAL';
    if (probability > 0.6) return 'HIGH';
    if (probability > 0.3) return 'MEDIUM';
    return 'LOW';
  }

  private getRecommendation(probability: number, days: number): string {
    if (probability > 0.8) return 'IMMEDIATE MAINTENANCE REQUIRED';
    if (probability > 0.6) return `Schedule maintenance within ${Math.round(days/2)} days`;
    if (probability > 0.3) return `Monitor closely, maintenance in ${Math.round(days)} days`;
    return 'Continue normal operation';
  }

  private calculateTrend(history: any[]): number {
    if (history.length < 2) return 0;
    const recent = history.slice(-5);
    const older = history.slice(0, -5);
    return (recent.length / (recent.length + older.length)) - 0.5;
  }
}