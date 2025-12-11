import * as tf from '@tensorflow/tfjs';
import { DetectionResult, DefectType, DefectSeverity, DetectedDefect, BoundingBox, DefectTypeInfo, ResultStatus } from '@/types';

export class RealDefectDetector {
  private model: tf.GraphModel | null = null;
  private isLoading = false;

  constructor() {
    this.loadModel();
  }

  private async loadModel() {
    if (this.model || this.isLoading) return;
    
    this.isLoading = true;
    try {
      console.log('Loading TensorFlow.js model...');
      await tf.setBackend('webgl');
      await tf.ready();
      
      this.model = await tf.loadGraphModel('/models/yolo-defect-detector/tfjs_model/model.json');
      console.log('✅ TensorFlow.js model loaded successfully!');
    } catch (error) {
      console.error('Failed to load TensorFlow.js model:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async detectDefects(imageElement: HTMLImageElement): Promise<DetectionResult> {
    const startTime = Date.now();

    // Wait for model to load if still loading
    while (this.isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!this.model) {
      console.error('Model not loaded, attempting to load...');
      await this.loadModel();
      if (!this.model) {
        throw new Error('Failed to load TensorFlow.js model');
      }
    }

    try {
      const width = imageElement.naturalWidth || imageElement.width;
      const height = imageElement.naturalHeight || imageElement.height;

      // Preprocess image for YOLO
      const inputTensor = tf.tidy(() => {
        let tensor = tf.browser.fromPixels(imageElement);
        tensor = tf.image.resizeBilinear(tensor, [640, 640]);
        tensor = tf.cast(tensor, 'float32');
        tensor = tensor.div(255.0);
        return tensor.expandDims(0);
      });

      // Run inference
      console.log('Running TensorFlow.js inference...');
      const predictions = await this.model.executeAsync(inputTensor) as tf.Tensor;
      
      // Process YOLO output
      const detections = await this.processYOLOOutput(predictions, width, height);
      
      // Cleanup tensors
      inputTensor.dispose();
      if (Array.isArray(predictions)) {
        predictions.forEach(t => t.dispose());
      } else {
        predictions.dispose();
      }

      const processingTime = Date.now() - startTime;
      console.log(`✅ Detection complete: ${detections.length} defects found in ${processingTime}ms`);

      return this.buildDetectionResult(detections, width, height, processingTime);

    } catch (error) {
      console.error('TensorFlow.js detection failed:', error);
      throw error;
    }
  }

  private async processYOLOOutput(predictions: tf.Tensor | tf.Tensor[], imgWidth: number, imgHeight: number): Promise<any[]> {
    const predArray = Array.isArray(predictions) ? predictions[0] : predictions;
    const data = await predArray.array() as number[][][];
    
    const detections: any[] = [];
    const confidenceThreshold = 0.5;
    
    // YOLO output format: [batch, num_detections, 6] where 6 = [x, y, w, h, confidence, class]
    const boxes = data[0];
    
    for (const box of boxes) {
      const confidence = box[4];
      if (confidence > confidenceThreshold) {
        const [centerX, centerY, w, h] = box;
        const classId = box[5];
        
        // Convert from center format to corner format
        const x = (centerX - w / 2) * imgWidth / 640;
        const y = (centerY - h / 2) * imgHeight / 640;
        const width = w * imgWidth / 640;
        const height = h * imgHeight / 640;
        
        detections.push({
          bbox: [x, y, width, height],
          confidence,
          classId: Math.round(classId),
          className: this.getClassName(Math.round(classId))
        });
      }
    }
    
    return detections;
  }

  private getClassName(classId: number): string {
    const classes = ['crack', 'corrosion', 'deformation', 'void', 'inclusion', 'surface_defect'];
    return classes[classId] || 'defect';
  }

  private buildDetectionResult(detections: any[], width: number, height: number, processingTime: number): DetectionResult {
    const detectedDefects: DetectedDefect[] = detections.map((det, index) => {
      const [x, y, w, h] = det.bbox;
      
      let severity = DefectSeverity.LOW;
      if (det.confidence > 0.8) severity = DefectSeverity.CRITICAL;
      else if (det.confidence > 0.6) severity = DefectSeverity.HIGH;
      else if (det.confidence > 0.4) severity = DefectSeverity.MEDIUM;

      return {
        id: `defect_${Date.now()}_${index}`,
        defectType: {
          id: det.className,
          name: det.className.charAt(0).toUpperCase() + det.className.slice(1),
          description: `Detected ${det.className}`,
          category: 'visual',
          severity
        },
        confidence: det.confidence,
        boundingBox: { x, y, width: w, height: h },
        severity,
        description: `${det.className} detected with ${(det.confidence * 100).toFixed(1)}% confidence`,
        affectedArea: (w * h) / (width * height) * 100
      };
    });

    let overallStatus: ResultStatus = ResultStatus.PASS;
    if (detectedDefects.some(d => d.severity === DefectSeverity.CRITICAL || d.severity === DefectSeverity.HIGH)) {
      overallStatus = ResultStatus.FAIL;
    } else if (detectedDefects.length > 0) {
      overallStatus = ResultStatus.REVIEW;
    }

    return {
      id: `result_${Date.now()}`,
      fileName: 'capture.jpg',
      defects: detectedDefects.map(d => ({
        id: d.id,
        type: d.defectType.id as DefectType,
        confidence: d.confidence,
        location: d.boundingBox,
        severity: d.severity,
        description: d.description,
        affectedArea: d.affectedArea
      })),
      detectedDefects,
      overallStatus,
      processingTime,
      timestamp: new Date(),
      metadata: {
        imageSize: { width, height },
        fileSize: 0,
        format: 'image/jpeg'
      }
    };
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
  }
}