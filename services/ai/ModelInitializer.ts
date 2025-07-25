import { ModelManager } from './ModelManager';
import { YOLODefectDetector } from './YOLODefectDetector';

export class ModelInitializer {
  private static instance: ModelInitializer;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): ModelInitializer {
    if (!ModelInitializer.instance) {
      ModelInitializer.instance = new ModelInitializer();
    }
    return ModelInitializer.instance;
  }

  async initialize(): Promise<YOLODefectDetector> {
    if (this.isInitialized) {
      const modelManager = ModelManager.getInstance();
      return await modelManager.loadModel();
    }

    try {
      const modelManager = ModelManager.getInstance();
      await modelManager.initialize();
      const detector = await modelManager.loadModel();
      this.isInitialized = true;
      return detector;
    } catch (error) {
      console.error('Model initialization failed:', error);
      throw error;
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}