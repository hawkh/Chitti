// Model management service for AI defect detection

import { YOLODefectDetector, YOLOModelConfig } from './YOLODefectDetector';

export interface ModelInfo {
  name: string;
  version: string;
  description: string;
  modelUrl: string;
  weightsUrl?: string;
  inputSize: { width: number; height: number };
  numClasses: number;
  classNames: string[];
  anchors: number[][];
  confidenceThreshold: number;
  nmsThreshold: number;
  supportedMaterials: string[];
  trainingInfo?: {
    dataset: string;
    epochs: number;
    accuracy: number;
    mAP: number;
  };
}

export interface ModelConfig {
  models: Record<string, ModelInfo>;
  defaultModel: string;
}

export class ModelManager {
  private static instance: ModelManager;
  private config: ModelConfig | null = null;
  private loadedDetectors: Map<string, YOLODefectDetector> = new Map();
  private isInitialized = false;

  private constructor() {}

  static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      console.log('Initializing Model Manager...');
      
      // Load model configuration
      const response = await fetch('/models/config.json');
      if (!response.ok) {
        throw new Error(`Failed to load model config: ${response.statusText}`);
      }
      
      this.config = await response.json();
      this.isInitialized = true;
      
      console.log('Model Manager initialized successfully');
      console.log('Available models:', Object.keys(this.config?.models || {}));
      
    } catch (error) {
      console.error('Failed to initialize Model Manager:', error);
      throw error;
    }
  }

  async loadModel(modelName?: string): Promise<YOLODefectDetector> {
    if (!this.isInitialized || !this.config) {
      throw new Error('Model Manager not initialized. Call initialize() first.');
    }

    const modelKey = modelName || this.config.defaultModel;
    
    // Check if model is already loaded
    const existingDetector = this.loadedDetectors.get(modelKey);
    if (existingDetector && existingDetector.isModelLoaded()) {
      console.log(`Model ${modelKey} already loaded`);
      return existingDetector;
    }

    const modelInfo = this.config.models[modelKey];
    if (!modelInfo) {
      throw new Error(`Model ${modelKey} not found in configuration`);
    }

    console.log(`Loading model: ${modelInfo.name} v${modelInfo.version}`);

    // Convert ModelInfo to YOLOModelConfig
    const yoloConfig: YOLOModelConfig = {
      modelUrl: modelInfo.modelUrl,
      inputSize: modelInfo.inputSize,
      numClasses: modelInfo.numClasses,
      anchors: modelInfo.anchors,
      classNames: modelInfo.classNames,
      confidenceThreshold: modelInfo.confidenceThreshold,
      nmsThreshold: modelInfo.nmsThreshold
    };

    // Create and initialize detector
    const detector = new YOLODefectDetector();
    await detector.initialize(yoloConfig);

    // Cache the loaded detector
    this.loadedDetectors.set(modelKey, detector);

    console.log(`Model ${modelInfo.name} loaded successfully`);
    return detector;
  }

  getAvailableModels(): Record<string, ModelInfo> {
    if (!this.config) {
      return {};
    }
    return this.config.models;
  }

  getModelInfo(modelName?: string): ModelInfo | null {
    if (!this.config) {
      return null;
    }
    
    const modelKey = modelName || this.config.defaultModel;
    return this.config.models[modelKey] || null;
  }

  getDefaultModelName(): string | null {
    return this.config?.defaultModel || null;
  }

  isModelLoaded(modelName: string): boolean {
    const detector = this.loadedDetectors.get(modelName);
    return detector ? detector.isModelLoaded() : false;
  }

  async unloadModel(modelName: string): Promise<void> {
    const detector = this.loadedDetectors.get(modelName);
    if (detector) {
      detector.dispose();
      this.loadedDetectors.delete(modelName);
      console.log(`Model ${modelName} unloaded`);
    }
  }

  async unloadAllModels(): Promise<void> {
    for (const [modelName, detector] of this.loadedDetectors) {
      detector.dispose();
      console.log(`Model ${modelName} unloaded`);
    }
    this.loadedDetectors.clear();
  }

  getLoadedModels(): string[] {
    return Array.from(this.loadedDetectors.keys());
  }

  getMemoryUsage(): { totalModels: number; loadedModels: number } {
    return {
      totalModels: this.config ? Object.keys(this.config.models).length : 0,
      loadedModels: this.loadedDetectors.size
    };
  }

  // Method to validate if a model file exists
  async validateModelFiles(modelName: string): Promise<{ valid: boolean; errors: string[] }> {
    const modelInfo = this.getModelInfo(modelName);
    if (!modelInfo) {
      return { valid: false, errors: [`Model ${modelName} not found in configuration`] };
    }

    const errors: string[] = [];

    try {
      // Check if model.json exists
      const modelResponse = await fetch(modelInfo.modelUrl, { method: 'HEAD' });
      if (!modelResponse.ok) {
        errors.push(`Model file not found: ${modelInfo.modelUrl}`);
      }

      // Check if weights file exists (if specified)
      if (modelInfo.weightsUrl) {
        const weightsResponse = await fetch(modelInfo.weightsUrl, { method: 'HEAD' });
        if (!weightsResponse.ok) {
          errors.push(`Weights file not found: ${modelInfo.weightsUrl}`);
        }
      }
    } catch (error) {
      errors.push(`Network error while validating model files: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Method to get model performance metrics
  getModelMetrics(modelName?: string): any {
    const modelInfo = this.getModelInfo(modelName);
    return modelInfo?.trainingInfo || null;
  }

  // Method to check if model supports a specific material type
  supportsMaterial(materialType: string, modelName?: string): boolean {
    const modelInfo = this.getModelInfo(modelName);
    if (!modelInfo) return false;
    
    return modelInfo.supportedMaterials.includes(materialType.toLowerCase());
  }
}