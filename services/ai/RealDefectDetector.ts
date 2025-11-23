import { DetectionResult, DefectType, DefectSeverity, DetectedDefect, BoundingBox, DefectTypeInfo, ResultStatus } from '@/types';

export class RealDefectDetector {

  constructor() { }

  async detectDefects(imageElement: HTMLImageElement): Promise<DetectionResult> {
    const startTime = Date.now();

    try {
      // Convert image to base64
      const canvas = document.createElement('canvas');
      canvas.width = imageElement.naturalWidth || imageElement.width;
      canvas.height = imageElement.naturalHeight || imageElement.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      ctx.drawImage(imageElement, 0, 0);
      const base64Image = canvas.toDataURL('image/jpeg', 0.9);

      // Call API
      const response = await fetch('/api/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      return this.processApiResponse(data, imageElement, processingTime);

    } catch (error) {
      console.error('Detection failed:', error);
      throw error;
    }
  }

  private processApiResponse(data: any, image: HTMLImageElement, processingTime: number): DetectionResult {
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;

    const detectedDefects: DetectedDefect[] = data.detections.map((det: any, index: number) => {
      const [x, y, w, h] = det.bbox;

      // Map confidence to severity
      let severity = DefectSeverity.LOW;
      if (det.confidence > 0.8) severity = DefectSeverity.CRITICAL;
      else if (det.confidence > 0.6) severity = DefectSeverity.HIGH;
      else if (det.confidence > 0.4) severity = DefectSeverity.MEDIUM;

      const defectType = this.mapClassToType(det.className || det.class || 'unknown');

      return {
        id: `defect_${Date.now()}_${index}`,
        defectType: {
          id: defectType,
          name: det.className || 'Defect',
          description: `Detected ${det.className}`,
          category: 'visual',
          severity
        },
        confidence: det.confidence,
        boundingBox: { x, y, width: w, height: h },
        severity,
        description: `Detected ${det.className} with ${(det.confidence * 100).toFixed(1)}% confidence`,
        affectedArea: (w * h) / (width * height) * 100
      };
    });

    // Determine overall status
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

  private mapClassToType(className: string): string {
    // Simple mapping, can be expanded
    const lower = className.toLowerCase();
    if (lower.includes('crack')) return 'crack';
    if (lower.includes('porosity') || lower.includes('void')) return 'void';
    if (lower.includes('inclusion')) return 'inclusion';
    return 'surface_irregularity';
  }

  dispose(): void { }
}