import * as tf from '@tensorflow/tfjs';
import { DetectionResult, DefectType, DefectSeverity, BoundingBox } from '@/types';

export class RealDefectDetector {
  private model: tf.GraphModel | null = null;
  private isLoaded = false;

  async loadModel(): Promise<void> {
    try {
      // Use a pre-trained COCO model for demonstration
      this.model = await tf.loadGraphModel('https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1', {
        fromTFHub: true
      });
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load model:', error);
      // Fallback to mock detection
      this.isLoaded = true;
    }
  }

  async detectDefects(imageElement: HTMLImageElement | ImageData): Promise<DetectionResult> {
    const startTime = Date.now();
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (imageElement instanceof HTMLImageElement) {
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        ctx?.drawImage(imageElement, 0, 0);
      } else {
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        ctx?.putImageData(imageElement, 0, 0);
      }
      
      const base64Image = canvas.toDataURL('image/jpeg');
      
      const response = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });
      
      if (!response.ok) {
        throw new Error('Detection API failed');
      }
      
      const data = await response.json();
      const processingTime = Date.now() - startTime;
      
      console.log('Received detections from backend:', data.detections);
      console.log('Number of detections:', data.detections?.length || 0);
      
      return this.processYOLODetections(data.detections, imageElement, processingTime);
    } catch (error) {
      console.error('Detection failed:', error);
      throw new Error('Python backend not available. Please start the backend server.');
    }
  }



  private processYOLODetections(detections: any[], imageElement: HTMLImageElement | ImageData, processingTime: number): DetectionResult {
    const width = imageElement instanceof HTMLImageElement ? imageElement.width : imageElement.width;
    const height = imageElement instanceof HTMLImageElement ? imageElement.height : imageElement.height;
    const defects = [];

    for (const detection of detections) {
      const [x, y, w, h] = detection.bbox;
      defects.push({
        id: `defect_${Date.now()}_${Math.random()}`,
        type: detection.className || 'defect',
        confidence: detection.confidence,
        location: { x, y, width: w, height: h },
        severity: detection.confidence > 0.8 ? DefectSeverity.HIGH : DefectSeverity.MEDIUM,
        description: `${detection.className} detected with ${(detection.confidence * 100).toFixed(1)}% confidence`,
        affectedArea: (w * h) / (width * height) * 100
      });
    }

    return {
      id: `result_${Date.now()}`,
      fileName: 'uploaded_image',
      defects,
      detectedDefects: defects.map(d => ({
        id: d.id,
        defectType: {
          id: d.type,
          name: d.type,
          description: d.description,
          category: 'structural',
          severity: d.severity
        },
        confidence: d.confidence,
        boundingBox: d.location,
        severity: d.severity,
        description: d.description,
        affectedArea: d.affectedArea
      })),
      overallStatus: defects.length > 0 ? 'fail' : 'pass',
      processingTime,
      timestamp: new Date()
    } as DetectionResult;
  }



  private getDefectType(classId: number): DefectType {
    const types = [DefectType.CRACK, DefectType.CORROSION, DefectType.DEFORMATION, DefectType.SURFACE_IRREGULARITY];
    return types[classId % types.length];
  }

  private getDefectDescription(classId: number): string {
    const descriptions = [
      'Linear crack detected in material surface',
      'Corrosion damage visible on metal surface',
      'Structural deformation identified',
      'Surface irregularity found'
    ];
    return descriptions[classId % descriptions.length];
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
    }
  }
}