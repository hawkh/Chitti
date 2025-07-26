// YOLO-based defect detection implementation

import * as tf from '@tensorflow/tfjs';
import { DetectionConfig, DetectionResult, DetectedDefect, DefectType, DefectSeverity, BoundingBox, DefectTypeInfo, ResultStatus } from '@/types';
import { ImageProcessor } from './ImageProcessor';
// Remove unused imports since we're implementing these methods locally

export interface YOLOModelConfig {
  modelUrl: string;
  inputSize: { width: number; height: number };
  numClasses: number;
  anchors: number[][];
  classNames: string[];
  confidenceThreshold: number;
  nmsThreshold: number;
}

export interface YOLOPrediction {
  bbox: [number, number, number, number]; // [x, y, width, height] in normalized coordinates
  confidence: number;
  classId: number;
  className: string;
}

export class YOLODefectDetector {
  private model: tf.GraphModel | null = null;
  private config: YOLOModelConfig | null = null;
  private imageProcessor: ImageProcessor;
  private initialized = false;

  constructor() {
    this.imageProcessor = new ImageProcessor();
  }

  async initialize(modelConfig: YOLOModelConfig): Promise<void> {
    try {
      console.log('Initializing YOLO Defect Detector...');

      // Set TensorFlow.js backend
      await tf.setBackend('webgl');
      await tf.ready();

      // Load the model (mock for demo)
      console.log('Mock model loading for demo');
      this.model = null; // Mock model
      this.config = modelConfig;

      // Warm up the model
      await this.warmUpModel();

      this.initialized = true;
      console.log('YOLO Defect Detector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize YOLO Defect Detector:', error);
      throw error;
    }
  }

  private async warmUpModel(): Promise<void> {
    if (!this.model || !this.config) return;

    try {
      const { width, height } = this.config.inputSize;
      const dummyInput = tf.zeros([1, height, width, 3]);
      const prediction = this.model.predict(dummyInput) as tf.Tensor;
      prediction.dispose();
      dummyInput.dispose();
      console.log('Model warm-up completed');
    } catch (error) {
      console.warn('Model warm-up failed:', error);
    }
  }

  async detectDefects(
    imageData: ImageData | File,
    config: DetectionConfig
  ): Promise<DetectionResult> {
    if (!this.initialized || !this.config) {
      throw new Error('Detector not initialized. Call initialize() first.');
    }

    const startTime = Date.now();

    try {
      // Preprocess image
      const { tensor: preprocessedTensor, metadata } = await this.imageProcessor.preprocessImage(
        imageData,
        {
          targetWidth: this.config.inputSize.width,
          targetHeight: this.config.inputSize.height,
          normalize: true
        }
      );

      // Mock inference for demo
      const predictions = null; // Mock predictions

      // Mock detections for demo
      const detections = Math.random() > 0.5 ? [{
        bbox: [100, 100, 80, 60] as [number, number, number, number],
        confidence: 0.8 + Math.random() * 0.2,
        classId: 0,
        className: 'crack'
      }] : [];

      // Clean up tensors
      preprocessedTensor.dispose();

      const processingTime = Date.now() - startTime;

      // Convert to our defect format
      const detectedDefects = detections.map(detection => this.convertToDefect(detection));

      // Convert to legacy format for backward compatibility
      const defects = detectedDefects.map(detected => ({
        id: detected.id,
        type: this.mapClassNameToDefectType(detected.defectType.name.toLowerCase()),
        confidence: detected.confidence,
        location: detected.boundingBox,
        severity: detected.severity,
        description: detected.description,
        affectedArea: detected.affectedArea
      }));

      // Determine overall status
      const overallStatus = this.determineOverallStatus(detectedDefects, config);

      const result: DetectionResult = {
        id: this.generateResultId(),
        fileName: imageData instanceof File ? imageData.name : 'processed_image',
        defects,
        detectedDefects,
        overallStatus,
        processingTime,
        timestamp: new Date(),
        metadata: {
          imageSize: { width: metadata.originalWidth, height: metadata.originalHeight },
          fileSize: imageData instanceof File ? imageData.size : 0,
          format: imageData instanceof File ? imageData.type : 'image/unknown'
        }
      };

      return result;

    } catch (error) {
      console.error('Defect detection failed:', error);
      throw new Error(`Defect detection failed: ${error}`);
    }
  }

  private async postProcessPredictions(
    predictions: tf.Tensor,
    originalWidth: number,
    originalHeight: number,
    config: DetectionConfig
  ): Promise<YOLOPrediction[]> {
    if (!this.config) {
      throw new Error('Model config not available');
    }

    // Get prediction data
    const predictionData = await predictions.data();
    const predictionShape = predictions.shape;

    // Parse YOLO output format (assuming YOLOv5/v8 format)
    const detections: YOLOPrediction[] = [];
    const confidenceThreshold = config.confidenceThreshold || this.config.confidenceThreshold;

    // YOLOv5/v8 output format: [batch, num_detections, 85] where 85 = 4 (bbox) + 1 (conf) + 80 (classes)
    const numDetections = predictionShape[1] || 0;
    const numParams = predictionShape[2] || 0;

    for (let i = 0; i < numDetections; i++) {
      const offset = i * numParams;

      // Extract bounding box (center_x, center_y, width, height)
      const centerX = predictionData[offset];
      const centerY = predictionData[offset + 1];
      const width = predictionData[offset + 2];
      const height = predictionData[offset + 3];
      const objectConfidence = predictionData[offset + 4];

      // Find best class
      let bestClass = 0;
      let bestClassProb = 0;

      for (let j = 5; j < numParams; j++) {
        const classProb = predictionData[offset + j];
        if (classProb > bestClassProb) {
          bestClassProb = classProb;
          bestClass = j - 5;
        }
      }

      const confidence = objectConfidence * bestClassProb;

      // Filter by confidence threshold
      if (confidence >= confidenceThreshold && bestClass < this.config.classNames.length) {
        // Convert from center coordinates to top-left coordinates
        const x = (centerX - width / 2) * originalWidth;
        const y = (centerY - height / 2) * originalHeight;
        const w = width * originalWidth;
        const h = height * originalHeight;

        detections.push({
          bbox: [Math.max(0, x), Math.max(0, y), w, h],
          confidence,
          classId: bestClass,
          className: this.config.classNames[bestClass]
        });
      }
    }

    // Apply Non-Maximum Suppression
    return this.applyNMS(detections, this.config.nmsThreshold);
  }

  private applyNMS(detections: YOLOPrediction[], nmsThreshold: number): YOLOPrediction[] {
    // Sort by confidence (descending)
    detections.sort((a, b) => b.confidence - a.confidence);

    const keep: YOLOPrediction[] = [];

    while (detections.length > 0) {
      const current = detections.shift()!;
      keep.push(current);

      // Remove overlapping detections
      detections = detections.filter(detection => {
        const iou = this.calculateIoU(current.bbox, detection.bbox);
        return iou <= nmsThreshold;
      });
    }

    return keep;
  }

  private calculateIoU(bbox1: [number, number, number, number], bbox2: [number, number, number, number]): number {
    const [x1, y1, w1, h1] = bbox1;
    const [x2, y2, w2, h2] = bbox2;

    // Calculate intersection
    const xLeft = Math.max(x1, x2);
    const yTop = Math.max(y1, y2);
    const xRight = Math.min(x1 + w1, x2 + w2);
    const yBottom = Math.min(y1 + h1, y2 + h2);

    if (xRight < xLeft || yBottom < yTop) {
      return 0; // No intersection
    }

    const intersectionArea = (xRight - xLeft) * (yBottom - yTop);
    const bbox1Area = w1 * h1;
    const bbox2Area = w2 * h2;
    const unionArea = bbox1Area + bbox2Area - intersectionArea;

    return intersectionArea / unionArea;
  }

  private convertToDefect(prediction: YOLOPrediction): DetectedDefect {
    if (!this.config) {
      throw new Error('Model config not available');
    }

    // Map class name to DefectType
    const defectType = this.mapClassNameToDefectType(prediction.className);
    const severity = this.calculateSeverity(prediction.confidence);

    const defectTypeInfo: DefectTypeInfo = {
      id: `${defectType}-001`,
      name: this.getDefectDisplayName(defectType),
      description: this.getDefectDescription(defectType),
      category: this.getDefectCategory(defectType),
      severity
    };

    const boundingBox: BoundingBox = {
      x: Math.round(prediction.bbox[0]),
      y: Math.round(prediction.bbox[1]),
      width: Math.round(prediction.bbox[2]),
      height: Math.round(prediction.bbox[3])
    };

    const affectedArea = this.calculateAffectedArea(boundingBox, 1000, 1000); // Will be updated with actual dimensions

    return {
      id: this.generateId(),
      defectType: defectTypeInfo,
      confidence: prediction.confidence,
      boundingBox,
      severity,
      description: defectTypeInfo.description,
      affectedArea
    };
  }

  private mapClassNameToDefectType(className: string): DefectType {
    const mapping: Record<string, DefectType> = {
      'crack': DefectType.CRACK,
      'corrosion': DefectType.CORROSION,
      'deformation': DefectType.DEFORMATION,
      'surface_irregularity': DefectType.SURFACE_IRREGULARITY,
      'inclusion': DefectType.INCLUSION,
      'void': DefectType.VOID,
      'dimensional_variance': DefectType.DIMENSIONAL_VARIANCE
    };

    return mapping[className.toLowerCase()] || DefectType.SURFACE_IRREGULARITY;
  }

  private determineOverallStatus(defects: DetectedDefect[], config: DetectionConfig): ResultStatus {
    if (defects.length === 0) {
      return ResultStatus.PASS;
    }

    // Check for critical defects
    const criticalDefects = defects.filter(defect => defect.severity === DefectSeverity.CRITICAL);
    if (criticalDefects.length > 0) {
      return ResultStatus.FAIL;
    }

    // Check for high severity defects
    const highSeverityDefects = defects.filter(defect => defect.severity === DefectSeverity.HIGH);
    if (highSeverityDefects.length > 0) {
      return ResultStatus.FAIL;
    }

    // Check for low confidence detections that need review
    const lowConfidenceDefects = defects.filter(defect =>
      defect.confidence < config.confidenceThreshold + 0.1
    );
    if (lowConfidenceDefects.length > 0) {
      return ResultStatus.REVIEW;
    }

    return ResultStatus.FAIL; // Default to fail if any defects are found
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  isModelLoaded(): boolean {
    return this.initialized && this.config !== null;
  }

  getModelConfig(): YOLOModelConfig | null {
    return this.config;
  }

  private calculateSeverity(confidence: number): DefectSeverity {
    if (confidence >= 0.95) return DefectSeverity.CRITICAL;
    if (confidence >= 0.85) return DefectSeverity.HIGH;
    if (confidence >= 0.7) return DefectSeverity.MEDIUM;
    return DefectSeverity.LOW;
  }

  private getDefectDisplayName(defectType: DefectType): string {
    const names: Record<DefectType, string> = {
      [DefectType.CRACK]: 'Crack',
      [DefectType.CORROSION]: 'Corrosion',
      [DefectType.DEFORMATION]: 'Deformation',
      [DefectType.SURFACE_IRREGULARITY]: 'Surface Irregularity',
      [DefectType.INCLUSION]: 'Inclusion',
      [DefectType.VOID]: 'Void',
      [DefectType.DIMENSIONAL_VARIANCE]: 'Dimensional Variance'
    };
    return names[defectType] || 'Unknown Defect';
  }

  private getDefectDescription(defectType: DefectType): string {
    const descriptions: Record<DefectType, string> = {
      [DefectType.CRACK]: 'A linear fracture or break in the material surface',
      [DefectType.CORROSION]: 'Chemical deterioration of the material surface',
      [DefectType.DEFORMATION]: 'Physical distortion or change in shape',
      [DefectType.SURFACE_IRREGULARITY]: 'Uneven or rough surface texture',
      [DefectType.INCLUSION]: 'Foreign material embedded in the component',
      [DefectType.VOID]: 'Empty space or hole in the material',
      [DefectType.DIMENSIONAL_VARIANCE]: 'Deviation from specified dimensions'
    };
    return descriptions[defectType] || 'Unknown defect type';
  }

  private getDefectCategory(defectType: DefectType): string {
    const categories: Record<DefectType, string> = {
      [DefectType.CRACK]: 'structural',
      [DefectType.CORROSION]: 'surface',
      [DefectType.DEFORMATION]: 'dimensional',
      [DefectType.SURFACE_IRREGULARITY]: 'surface',
      [DefectType.INCLUSION]: 'material',
      [DefectType.VOID]: 'structural',
      [DefectType.DIMENSIONAL_VARIANCE]: 'dimensional'
    };
    return categories[defectType] || 'unknown';
  }

  private calculateAffectedArea(boundingBox: BoundingBox, imageWidth: number, imageHeight: number): number {
    const area = boundingBox.width * boundingBox.height;
    const totalArea = imageWidth * imageHeight;
    return (area / totalArea) * 100; // Return as percentage
  }

  private generateId(): string {
    return `defect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateResultId(): string {
    return `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.imageProcessor.dispose();
    this.config = null;
    this.initialized = false;
  }
}
