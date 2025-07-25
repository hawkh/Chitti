// Main Defect Detection Engine that integrates with YOLO model

import { ModelLoader } from './ModelLoader';
import { DetectionConfig, DetectionResult, BatchResult, ProcessingFile, ResultStatus, DefectSeverity } from '../../types';
import { IdGenerator, DateUtils } from '../../lib/utils';

export class DefectDetectionEngine {
  private modelLoader: ModelLoader;
  private isInitialized = false;

  constructor() {
    this.modelLoader = new ModelLoader();
  }

  async initialize(modelPath: string, metadataPath?: string): Promise<void> {
    try {
      await this.modelLoader.loadModel(modelPath, metadataPath);
      this.isInitialized = true;
      console.log('DefectDetectionEngine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize DefectDetectionEngine:', error);
      throw error;
    }
  }

  async processImage(imageData: ImageData, config: DetectionConfig): Promise<DetectionResult> {
    if (!this.isInitialized) {
      throw new Error('Engine not initialized. Call initialize() first.');
    }

    try {
      const result = await this.modelLoader.processImage(imageData, config);
      
      // Apply component-specific filtering if profile is provided
      if (config.componentType) {
        result.defects = this.filterDefectsByComponentType(result.defects, config);
      }

      // Update overall status based on filtered defects
      result.overallStatus = this.determineOverallStatus(result.defects, config);

      return result;
    } catch (error) {
      console.error('Image processing failed:', error);
      throw error;
    }
  }

  async processVideo(videoFile: File, config: DetectionConfig): Promise<DetectionResult[]> {
    if (!this.isInitialized) {
      throw new Error('Engine not initialized. Call initialize() first.');
    }

    try {
      const frames = await this.extractVideoFrames(videoFile);
      const results: DetectionResult[] = [];

      for (let i = 0; i < frames.length; i++) {
        const frameResult = await this.processImage(frames[i], config);
        frameResult.fileName = `${videoFile.name}_frame_${i + 1}`;
        results.push(frameResult);
      }

      return results;
    } catch (error) {
      console.error('Video processing failed:', error);
      throw error;
    }
  }

  async processBatch(files: ProcessingFile[], config: DetectionConfig): Promise<BatchResult> {
    if (!this.isInitialized) {
      throw new Error('Engine not initialized. Call initialize() first.');
    }

    const startTime = Date.now();
    const results: DetectionResult[] = [];
    const jobId = IdGenerator.generateJobId();

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          let fileResults: DetectionResult[] = [];

          if (file.file.type.startsWith('image/')) {
            const imageData = await this.fileToImageData(file.file);
            const result = await this.processImage(imageData, config);
            result.fileName = file.file.name;
            fileResults = [result];
          } else if (file.file.type.startsWith('video/')) {
            fileResults = await this.processVideo(file.file, config);
          }

          results.push(...fileResults);

          // Update file status
          file.status = 'completed';
          file.progress = 100;
          file.result = fileResults[0]; // Store first result for preview

        } catch (error) {
          console.error(`Failed to process file ${file.file.name}:`, error);
          file.status = 'error';
          file.progress = 0;
        }

        // Update progress callback could be added here
        const progress = ((i + 1) / files.length) * 100;
        console.log(`Batch progress: ${progress.toFixed(1)}%`);
      }

      const processingTime = Date.now() - startTime;
      const summary = this.calculateBatchSummary(results, processingTime);

      return {
        id: IdGenerator.generate(),
        jobId,
        results,
        summary,
        createdAt: new Date()
      };

    } catch (error) {
      console.error('Batch processing failed:', error);
      throw error;
    }
  }

  private async fileToImageData(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        URL.revokeObjectURL(img.src);
        resolve(imageData);
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  private async extractVideoFrames(videoFile: File, maxFrames: number = 10): Promise<ImageData[]> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      const frames: ImageData[] = [];
      let currentFrame = 0;

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const duration = video.duration;
        const frameInterval = duration / maxFrames;
        
        const extractFrame = () => {
          if (currentFrame >= maxFrames) {
            URL.revokeObjectURL(video.src);
            resolve(frames);
            return;
          }

          video.currentTime = currentFrame * frameInterval;
        };

        video.onseeked = () => {
          ctx.drawImage(video, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          frames.push(imageData);
          currentFrame++;
          extractFrame();
        };

        extractFrame();
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video'));
      };

      video.src = URL.createObjectURL(videoFile);
    });
  }

  private filterDefectsByComponentType(defects: any[], config: DetectionConfig): any[] {
    if (!config.componentType.commonDefects) {
      return defects;
    }

    return defects.filter(defect => 
      config.componentType.commonDefects.includes(defect.type)
    );
  }

  private determineOverallStatus(defects: any[], config: DetectionConfig): ResultStatus {
    if (defects.length === 0) {
      return ResultStatus.PASS;
    }

    // Check if any defects exceed critical thresholds
    const criticalDefects = defects.filter(defect => 
      defect.severity === DefectSeverity.CRITICAL || defect.confidence > 0.9
    );

    if (criticalDefects.length > 0) {
      return ResultStatus.FAIL;
    }

    // Check if defects need review
    const lowConfidenceDefects = defects.filter(defect => 
      defect.confidence < config.confidenceThreshold + 0.1
    );

    if (lowConfidenceDefects.length > 0) {
      return ResultStatus.REVIEW;
    }

    return ResultStatus.FAIL; // Default to fail if defects are found
  }

  private calculateBatchSummary(results: DetectionResult[], processingTime: number) {
    const totalFiles = results.length;
    const passedFiles = results.filter(r => r.overallStatus === ResultStatus.PASS).length;
    const failedFiles = results.filter(r => r.overallStatus === ResultStatus.FAIL).length;
    const reviewFiles = results.filter(r => r.overallStatus === ResultStatus.REVIEW).length;

    const allDefects = results.flatMap(r => r.defects);
    const averageConfidence = allDefects.length > 0 
      ? allDefects.reduce((sum, defect) => sum + defect.confidence, 0) / allDefects.length
      : 0;

    return {
      totalFiles,
      passedFiles,
      failedFiles,
      reviewFiles,
      averageConfidence,
      processingTime
    };
  }

  isModelLoaded(): boolean {
    return this.isInitialized && this.modelLoader.isModelLoaded();
  }

  getModelInfo() {
    return this.modelLoader.getModelInfo();
  }

  getMemoryUsage() {
    return this.modelLoader.getMemoryInfo();
  }

  cleanup(): void {
    this.modelLoader.cleanupMemory();
  }

  async dispose(): Promise<void> {
    await this.modelLoader.unloadModel();
    this.isInitialized = false;
  }
}