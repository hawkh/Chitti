// Unit tests for ModelManager

import { ModelManager } from '../../../services/ai/ModelManager';
import { YOLODefectDetector } from '../../../services/ai/YOLODefectDetector';

// Mock fetch
global.fetch = jest.fn();

// Mock YOLODefectDetector
jest.mock('../../../services/ai/YOLODefectDetector');

const mockConfig = {
  models: {
    'test-model': {
      name: 'Test Model',
      version: '1.0.0',
      description: 'Test defect detection model',
      modelUrl: '/models/test/model.json',
      weightsUrl: '/models/test/weights.bin',
      inputSize: { width: 640, height: 640 },
      numClasses: 6,
      classNames: ['crack', 'corrosion', 'deformation', 'surface_irregularity', 'inclusion', 'void'],
      anchors: [[10, 13], [16, 30], [33, 23]],
      confidenceThreshold: 0.5,
      nmsThreshold: 0.4,
      supportedMaterials: ['metal', 'plastic'],
      trainingInfo: {
        dataset: 'Test Dataset',
        epochs: 100,
        accuracy: 0.92,
        mAP: 0.87
      }
    }
  },
  defaultModel: 'test-model'
};

describe('ModelManager', () => {
  let modelManager: ModelManager;
  let mockDetector: jest.Mocked<YOLODefectDetector>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset singleton
    (ModelManager as any).instance = undefined;
    modelManager = ModelManager.getInstance();

    // Mock fetch response
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockConfig)
    });

    // Mock YOLODefectDetector
    mockDetector = {
      initialize: jest.fn().mockResolvedValue(undefined),
      isModelLoaded: jest.fn().mockReturnValue(true),
      dispose: jest.fn().mockResolvedValue(undefined),
      detect: jest.fn()
    } as any;

    (YOLODefectDetector as jest.Mock).mockImplementation(() => mockDetector);
  });

  describe('initialization', () => {
    it('should initialize successfully with valid config', async () => {
      await modelManager.initialize();

      expect(fetch).toHaveBeenCalledWith('/models/config.json');
      expect(modelManager.getAvailableModels()).toEqual(mockConfig.models);
      expect(modelManager.getDefaultModelName()).toBe('test-model');
    });

    it('should handle fetch errors during initialization', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(modelManager.initialize()).rejects.toThrow('Network error');
    });

    it('should handle invalid config response', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(modelManager.initialize()).rejects.toThrow('Failed to load model config: Not Found');
    });
  });

  describe('model loading', () => {
    beforeEach(async () => {
      await modelManager.initialize();
    });

    it('should load model successfully', async () => {
      const detector = await modelManager.loadModel('test-model');

      expect(YOLODefectDetector).toHaveBeenCalled();
      expect(mockDetector.initialize).toHaveBeenCalledWith({
        modelUrl: '/models/test/model.json',
        inputSize: { width: 640, height: 640 },
        numClasses: 6,
        anchors: [[10, 13], [16, 30], [33, 23]],
        classNames: ['crack', 'corrosion', 'deformation', 'surface_irregularity', 'inclusion', 'void'],
        confidenceThreshold: 0.5,
        nmsThreshold: 0.4
      });
      expect(detector).toBe(mockDetector);
    });

    it('should return cached model if already loaded', async () => {
      const detector1 = await modelManager.loadModel('test-model');
      const detector2 = await modelManager.loadModel('test-model');

      expect(detector1).toBe(detector2);
      expect(YOLODefectDetector).toHaveBeenCalledTimes(1);
    });

    it('should load default model when no model name specified', async () => {
      const detector = await modelManager.loadModel();

      expect(detector).toBe(mockDetector);
      expect(mockDetector.initialize).toHaveBeenCalled();
    });

    it('should throw error for non-existent model', async () => {
      await expect(modelManager.loadModel('non-existent')).rejects.toThrow(
        'Model non-existent not found in configuration'
      );
    });

    it('should handle model initialization errors', async () => {
      mockDetector.initialize.mockRejectedValue(new Error('Model load failed'));

      await expect(modelManager.loadModel('test-model')).rejects.toThrow('Model load failed');
    });
  });

  describe('model management', () => {
    beforeEach(async () => {
      await modelManager.initialize();
      await modelManager.loadModel('test-model');
    });

    it('should check if model is loaded', () => {
      expect(modelManager.isModelLoaded('test-model')).toBe(true);
      expect(modelManager.isModelLoaded('non-existent')).toBe(false);
    });

    it('should unload model successfully', async () => {
      await modelManager.unloadModel('test-model');

      expect(mockDetector.dispose).toHaveBeenCalled();
      expect(modelManager.isModelLoaded('test-model')).toBe(false);
    });

    it('should unload all models', async () => {
      await modelManager.unloadAllModels();

      expect(mockDetector.dispose).toHaveBeenCalled();
      expect(modelManager.getLoadedModels()).toHaveLength(0);
    });

    it('should get memory usage information', () => {
      const usage = modelManager.getMemoryUsage();

      expect(usage).toEqual({
        totalModels: 1,
        loadedModels: 1
      });
    });
  });

  describe('model validation', () => {
    beforeEach(async () => {
      await modelManager.initialize();
    });

    it('should validate model files successfully', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true }) // model.json
        .mockResolvedValueOnce({ ok: true }); // weights.bin

      const result = await modelManager.validateModelFiles('test-model');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(fetch).toHaveBeenCalledWith('/models/test/model.json', { method: 'HEAD' });
      expect(fetch).toHaveBeenCalledWith('/models/test/weights.bin', { method: 'HEAD' });
    });

    it('should detect missing model files', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: false }) // model.json missing
        .mockResolvedValueOnce({ ok: true }); // weights.bin exists

      const result = await modelManager.validateModelFiles('test-model');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Model file not found: /models/test/model.json');
    });

    it('should handle network errors during validation', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await modelManager.validateModelFiles('test-model');

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Network error while validating model files');
    });

    it('should handle non-existent model validation', async () => {
      const result = await modelManager.validateModelFiles('non-existent');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Model non-existent not found in configuration');
    });
  });

  describe('utility methods', () => {
    beforeEach(async () => {
      await modelManager.initialize();
    });

    it('should get model info', () => {
      const info = modelManager.getModelInfo('test-model');

      expect(info).toEqual(mockConfig.models['test-model']);
    });

    it('should get model metrics', () => {
      const metrics = modelManager.getModelMetrics('test-model');

      expect(metrics).toEqual(mockConfig.models['test-model'].trainingInfo);
    });

    it('should check material support', () => {
      expect(modelManager.supportsMateria('metal', 'test-model')).toBe(true);
      expect(modelManager.supportsMateria('ceramic', 'test-model')).toBe(false);
    });

    it('should get loaded models list', async () => {
      await modelManager.loadModel('test-model');
      
      const loadedModels = modelManager.getLoadedModels();
      expect(loadedModels).toContain('test-model');
    });
  });
});