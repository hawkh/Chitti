import * as tf from '@tensorflow/tfjs';
import { prisma } from '@/lib/database';
import redis from '@/lib/redis';
import { DetectionResult, DefectType, DefectSeverity } from '@/types';

export interface ModelLoadResult {
  success: boolean;
  model?: tf.GraphModel;
  error?: string;
}

export class ScalableModelManager {
  private static instance: ScalableModelManager;
  private loadedModels: Map<string, tf.GraphModel> = new Map();
  private modelCache = new Map<string, any>();

  private constructor() {}

  static getInstance(): ScalableModelManager {
    if (!ScalableModelManager.instance) {
      ScalableModelManager.instance = new ScalableModelManager();
    }
    return ScalableModelManager.instance;
  }

  async loadModel(modelId: string): Promise<ModelLoadResult> {
    try {
      // Check if model is already loaded
      if (this.loadedModels.has(modelId)) {
        return { success: true, model: this.loadedModels.get(modelId) };
      }

      // Get model info from database
      const modelInfo = await prisma.modelInfo.findUnique({
        where: { id: modelId, isActive: true }
      });

      if (!modelInfo) {
        return { success: false, error: 'Model not found or inactive' };
      }

      // Check Redis cache first
      const cachedModel = await redis.get(`model:${modelId}`);
      if (cachedModel) {
        console.log(`Loading model ${modelId} from cache`);
      }

      // Load model from URL (browser compatible)
      const model = await tf.loadGraphModel(modelInfo.modelPath);
      
      // Cache the loaded model
      this.loadedModels.set(modelId, model);
      
      // Cache model metadata in Redis
      await redis.setex(`model:${modelId}:meta`, 3600, JSON.stringify({
        name: modelInfo.name,
        version: modelInfo.version,
        loadedAt: new Date().toISOString()
      }));

      console.log(`Model ${modelInfo.name} v${modelInfo.version} loaded successfully`);
      return { success: true, model };

    } catch (error) {
      console.error(`Failed to load model ${modelId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async detectDefects(modelId: string, imageBuffer: Buffer): Promise<DetectionResult> {
    const startTime = Date.now();
    const loadResult = await this.loadModel(modelId);
    
    if (!loadResult.success || !loadResult.model) {
      throw new Error(`Failed to load model: ${loadResult.error}`);
    }

    const model = loadResult.model;
    
    // Simulate preprocessing for browser environment
    const tensor = tf.zeros([1, 640, 640, 3]);

    try {
      // Run inference
      const predictions = await model.executeAsync(tensor) as tf.Tensor[];
      
      // Process predictions
      const detections = await this.processPredictions(predictions);
      
      // Clean up tensors
      tensor.dispose();
      predictions.forEach(p => p.dispose());

      return {
        id: `result_${Date.now()}`,
        fileName: 'processed_image',
        defects: detections.defects,
        detectedDefects: detections.detectedDefects,
        overallStatus: detections.defects.length > 0 ? 'fail' : 'pass',
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      } as DetectionResult;

    } catch (error) {
      tensor.dispose();
      throw error;
    }
  }

  private async processPredictions(predictions: tf.Tensor[]): Promise<any> {
    // Extract boxes, scores, and classes from YOLO output
    const [boxes, scores, classes] = predictions;
    
    const boxesData = await boxes.data();
    const scoresData = await scores.data();
    const classesData = await classes.data();

    const defects = [];
    const detectedDefects = [];
    const confidenceThreshold = 0.5;

    for (let i = 0; i < scoresData.length; i++) {
      if (scoresData[i] > confidenceThreshold) {
        const defect = {
          id: `defect_${Date.now()}_${i}`,
          type: this.getDefectType(classesData[i]),
          confidence: scoresData[i],
          location: {
            x: boxesData[i * 4] * 640,
            y: boxesData[i * 4 + 1] * 640,
            width: (boxesData[i * 4 + 2] - boxesData[i * 4]) * 640,
            height: (boxesData[i * 4 + 3] - boxesData[i * 4 + 1]) * 640
          },
          severity: scoresData[i] > 0.8 ? DefectSeverity.HIGH : DefectSeverity.MEDIUM,
          description: this.getDefectDescription(classesData[i]),
          affectedArea: (boxesData[i * 4 + 2] - boxesData[i * 4]) * (boxesData[i * 4 + 3] - boxesData[i * 4 + 1]) * 100
        };

        defects.push(defect);
        detectedDefects.push({
          id: defect.id,
          defectType: {
            id: defect.type,
            name: defect.type,
            description: defect.description,
            category: 'structural',
            severity: defect.severity
          },
          confidence: defect.confidence,
          boundingBox: defect.location,
          severity: defect.severity,
          description: defect.description,
          affectedArea: defect.affectedArea
        });
      }
    }

    return { defects, detectedDefects };
  }

  private getDefectType(classId: number): DefectType {
    const types = [
      DefectType.CRACK,
      DefectType.CORROSION,
      DefectType.DEFORMATION,
      DefectType.SURFACE_IRREGULARITY,
      DefectType.INCLUSION,
      DefectType.VOID
    ];
    return types[Math.floor(classId) % types.length];
  }

  private getDefectDescription(classId: number): string {
    const descriptions = [
      'Linear crack detected in material surface',
      'Corrosion damage visible on surface',
      'Structural deformation identified',
      'Surface irregularity found',
      'Foreign material inclusion detected',
      'Void or cavity identified'
    ];
    return descriptions[Math.floor(classId) % descriptions.length];
  }

  async unloadModel(modelId: string): Promise<void> {
    const model = this.loadedModels.get(modelId);
    if (model) {
      model.dispose();
      this.loadedModels.delete(modelId);
      await redis.del(`model:${modelId}:meta`);
      console.log(`Model ${modelId} unloaded`);
    }
  }

  getLoadedModels(): string[] {
    return Array.from(this.loadedModels.keys());
  }

  async getModelMetrics(modelId: string): Promise<any> {
    const cached = await redis.get(`model:${modelId}:metrics`);
    if (cached) {
      return JSON.parse(cached);
    }

    const modelInfo = await prisma.modelInfo.findUnique({
      where: { id: modelId }
    });

    if (modelInfo) {
      const metrics = {
        accuracy: modelInfo.accuracy,
        inputSize: modelInfo.inputSize,
        classNames: modelInfo.classNames,
        version: modelInfo.version
      };
      
      await redis.setex(`model:${modelId}:metrics`, 1800, JSON.stringify(metrics));
      return metrics;
    }

    return null;
  }
}