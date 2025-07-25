// AI Model Loading and Management Service

import * as tf from '@tensorflow/tfjs';
import { DetectionConfig, DetectionResult, Defect, DefectType, SeverityLevel, BoundingBox, ResultStatus } from '../../types';
import { IdGenerator, DefectUtils } from '../../lib/utils';

export interface ModelMetadata {
  name: string;
  version: string;
  inputShape: number[];
  outputShape: number[];
  classes: string[];
  confidenceThreshold: number;
  nmsThreshold: number;
}

export interface YOLODetection {
  bbox: [number, number, number, number]; // [x, y, width, height]
  class: number;
  confidence: number;
}

export class ModelLoader {
  private model: tf.GraphModel | null = null;
  private metadata: ModelMetadata | null = null;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    // Initialize TensorFlow.js backend
    this.initializeTensorFlow();
  }

  private async initializeTensorFlow() {
    try {
      // Set backend preference (webgl for GPU acceleration, cpu as fallback)
      await tf.setBackend('webgl');
      console.log('TensorFlow.js initialized with WebGL backend');
    } catch (error) {
      console.warn('WebGL backend failed, falling back to CPU:', error);
      await tf.setBackend('cpu');
    }
  }

  async loadModel(modelPath: string, metadataPath?: string): Promise<void> {
    if (this.isLoading) {
      return this.loadPromise!;
    }

    if (this.model && this.metadata) {
      console.log('Model already loaded');
      return;
    }

    this.isLoading = true;
    this.loadPromise = this._loadModel(modelPath, metadataPath);
    
    try {
      await this.loadPromise;
    } finally {
      this.isLoading = false;
      this.loadPromise = null;
    }
  }

  private async _loadModel(modelPath: string, metadataPath?: string): Promise<void> {
    try {
      console.log('Loading YOLO model from:', modelPath);
      
      // Load the TensorFlow.js model
      this.model = await tf.loadGraphModel(modelPath);
      
      // Load metadata if provided
      if (metadataPath) {
        const metadataResponse = await fetch(metadataPath);
        this.metadata = await metadataResponse.json();
      } else {
        // Default metadata for YOLO model
        this.metadata = {
          name: 'YOLO Defect Detection',
          version: '1.0.0',
          inputShape: [1, 640, 640, 3], // Typical YOLO input shape
          outputShape: [1, 25200, 85], // Typical YOLO output shape (for 80 classes + 5 bbox params)
          classes: [
            'crack', 'corrosion', 'deformation', 'surface_irregularity',
            'inclusion', 'void', 'dimensional_variance'
          ],
          confidenceThreshold: 0.5,
          nmsThreshold: 0.4
        };
      }

      console.log('Model loaded successfully:', this.metadata);
      
      // Warm up the model with a dummy prediction
      await this.warmUpModel();
      
    } catch (error) {
      console.error('Failed to load model:', error);
      this.model = null;
      this.metadata = null;
      throw new Error(`Model loading failed: ${error}`);
    }
  }

  private async warmUpModel(): Promise<void> {
    if (!this.model || !this.metadata) return;

    try {
      console.log('Warming up model...');
      const dummyInput = tf.zeros(this.metadata.inputShape);
      const prediction = this.model.predict(dummyInput) as tf.Tensor;
      prediction.dispose();
      dummyInput.dispose();
      console.log('Model warm-up completed');
    } catch (error) {
      console.warn('Model warm-up failed:', error);
    }
  }

  async processImage(imageData: ImageData, config: DetectionConfig): Promise<DetectionResult> {
    if (!this.model || !this.metadata) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    const startTime = Date.now();

    try {
      // Preprocess image
      const preprocessedImage = await this.preprocessImage(imageData);
      
      // Run inference
      const predictions = this.model.predict(preprocessedImage) as tf.Tensor;
      
      // Post-process predictions
      const detections = await this.postprocessPredictions(
        predictions, 
        imageData.width, 
        imageData.height,
        config
      );

      // Clean up tensors
      preprocessedImage.dispose();
      predictions.dispose();

      const processingTime = Date.now() - startTime;

      // Convert detections to our format
      const defects = detections.map(detection => this.convertToDefect(detection, config));

      const result: DetectionResult = {
        id: IdGenerator.generateResultId(),
        fileName: 'processed_image',
        defects,
        detectedDefects: [], // TODO: Convert defects to DetectedDefect format
        overallStatus: defects.length > 0 ? ResultStatus.FAIL : ResultStatus.PASS,
        processingTime,
        timestamp: new Date()
      };

      return result;

    } catch (error) {
      console.error('Image processing failed:', error);
      throw new Error(`Image processing failed: ${error}`);
    }
  }

  private async preprocessImage(imageData: ImageData): Promise<tf.Tensor> {
    if (!this.metadata) {
      throw new Error('Model metadata not available');
    }

    // Convert ImageData to tensor
    const imageTensor = tf.browser.fromPixels(imageData);
    
    // Resize to model input size
    const [, inputHeight, inputWidth] = this.metadata.inputShape.slice(1);
    const resized = tf.image.resizeBilinear(imageTensor, [inputHeight, inputWidth]);
    
    // Normalize pixel values to [0, 1]
    const normalized = resized.div(255.0);
    
    // Add batch dimension
    const batched = normalized.expandDims(0);
    
    // Clean up intermediate tensors
    imageTensor.dispose();
    resized.dispose();
    normalized.dispose();
    
    return batched;
  }

  private async postprocessPredictions(
    predictions: tf.Tensor, 
    originalWidth: number, 
    originalHeight: number,
    config: DetectionConfig
  ): Promise<YOLODetection[]> {
    if (!this.metadata) {
      throw new Error('Model metadata not available');
    }

    // Get prediction data
    const predictionData = await predictions.data();
    const [, numDetections, numClasses] = this.metadata.outputShape;
    
    const detections: YOLODetection[] = [];
    const confidenceThreshold = config.confidenceThreshold || this.metadata.confidenceThreshold;

    // Parse YOLO output format
    for (let i = 0; i < numDetections; i++) {
      const offset = i * numClasses;
      
      // Extract bounding box coordinates (assuming YOLO format: x, y, w, h, confidence, class_probs...)
      const x = predictionData[offset];
      const y = predictionData[offset + 1];
      const w = predictionData[offset + 2];
      const h = predictionData[offset + 3];
      const objectConfidence = predictionData[offset + 4];

      // Find best class
      let bestClass = 0;
      let bestClassProb = 0;
      
      for (let j = 5; j < numClasses; j++) {
        const classProb = predictionData[offset + j];
        if (classProb > bestClassProb) {
          bestClassProb = classProb;
          bestClass = j - 5; // Adjust for bbox parameters
        }
      }

      const confidence = objectConfidence * bestClassProb;

      // Filter by confidence threshold
      if (confidence >= confidenceThreshold) {
        // Convert from normalized coordinates to pixel coordinates
        const bbox: [number, number, number, number] = [
          (x - w / 2) * originalWidth,  // x
          (y - h / 2) * originalHeight, // y
          w * originalWidth,            // width
          h * originalHeight            // height
        ];

        detections.push({
          bbox,
          class: bestClass,
          confidence
        });
      }
    }

    // Apply Non-Maximum Suppression
    return this.applyNMS(detections, this.metadata.nmsThreshold);
  }

  private applyNMS(detections: YOLODetection[], nmsThreshold: number): YOLODetection[] {
    // Sort by confidence (descending)
    detections.sort((a, b) => b.confidence - a.confidence);

    const keep: YOLODetection[] = [];

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

  private convertToDefect(detection: YOLODetection, config: DetectionConfig): Defect {
    if (!this.metadata) {
      throw new Error('Model metadata not available');
    }

    const defectTypeName = this.metadata.classes[detection.class] || 'unknown';
    const defectType = Object.values(DefectType).find(type => type === defectTypeName) || DefectType.SURFACE_IRREGULARITY;

    const boundingBox: BoundingBox = {
      x: Math.max(0, detection.bbox[0]),
      y: Math.max(0, detection.bbox[1]),
      width: detection.bbox[2],
      height: detection.bbox[3]
    };

    const severity = DefectUtils.calculateSeverity(detection.confidence);

    return {
      id: IdGenerator.generate(),
      type: defectType,
      confidence: detection.confidence,
      location: boundingBox,
      severity,
      description: DefectUtils.getDefectDescription(defectType),
      affectedArea: DefectUtils.calculateAffectedArea(boundingBox, 1000, 1000) // Will be updated with actual image dimensions
    };
  }

  isModelLoaded(): boolean {
    return this.model !== null && this.metadata !== null;
  }

  getModelInfo(): ModelMetadata | null {
    return this.metadata;
  }

  async unloadModel(): Promise<void> {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.metadata = null;
    console.log('Model unloaded');
  }

  // Memory management
  getMemoryInfo(): { numTensors: number; numBytes: number } {
    return tf.memory();
  }

  cleanupMemory(): void {
    // Force garbage collection of disposed tensors
    tf.engine().startScope();
    tf.engine().endScope();
  }
}