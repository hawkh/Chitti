// Unit tests for ImageProcessor

import { ImageProcessor, PreprocessingConfig } from '../../../services/ai/ImageProcessor';
import * as tf from '@tensorflow/tfjs';

// Mock TensorFlow.js
jest.mock('@tensorflow/tfjs', () => ({
  browser: {
    fromPixels: jest.fn()
  },
  image: {
    resizeBilinear: jest.fn(),
    adjustBrightness: jest.fn(),
    adjustContrast: jest.fn(),
    rotateWithOffset: jest.fn(),
    flipLeftRight: jest.fn()
  }
}));

// Mock canvas and context
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn(),
  remove: jest.fn()
};

const mockContext = {
  drawImage: jest.fn(),
  getImageData: jest.fn(),
  putImageData: jest.fn(),
  fillRect: jest.fn(),
  fillStyle: '',
  filter: '',
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'high'
};

// Mock document.createElement
Object.defineProperty(document, 'createElement', {
  value: jest.fn((tagName: string) => {
    if (tagName === 'canvas') {
      return {
        ...mockCanvas,
        getContext: jest.fn(() => mockContext)
      };
    }
    return {};
  })
});

// Mock URL.createObjectURL and revokeObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  value: jest.fn(() => 'mock-url')
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: jest.fn()
});

describe('ImageProcessor', () => {
  let processor: ImageProcessor;
  let mockTensor: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock tensor operations
    mockTensor = {
      shape: [480, 640, 3],
      div: jest.fn().mockReturnThis(),
      expandDims: jest.fn().mockReturnThis(),
      dispose: jest.fn(),
      squeeze: jest.fn().mockReturnThis(),
      mul: jest.fn().mockReturnThis(),
      cast: jest.fn().mockReturnThis(),
      max: jest.fn(() => ({ dataSync: () => [255] })),
      data: jest.fn(() => Promise.resolve(new Uint8Array(480 * 640 * 3))),
      rank: 3
    };

    (tf.browser.fromPixels as jest.Mock).mockReturnValue(mockTensor);
    (tf.image.resizeBilinear as jest.Mock).mockReturnValue(mockTensor);
    (tf.image.adjustBrightness as jest.Mock).mockReturnValue(mockTensor);
    (tf.image.adjustContrast as jest.Mock).mockReturnValue(mockTensor);
    (tf.image.rotateWithOffset as jest.Mock).mockReturnValue(mockTensor);
    (tf.image.flipLeftRight as jest.Mock).mockReturnValue(mockTensor);

    processor = new ImageProcessor();
  });

  afterEach(() => {
    processor.dispose();
  });

  describe('preprocessImage', () => {
    const mockImageData = new ImageData(640, 480);
    const config: PreprocessingConfig = {
      targetWidth: 640,
      targetHeight: 480,
      normalize: true
    };

    it('should preprocess ImageData correctly', async () => {
      mockContext.getImageData.mockReturnValue(mockImageData);

      const result = await processor.preprocessImage(mockImageData, config);

      expect(tf.browser.fromPixels).toHaveBeenCalledWith(mockImageData);
      expect(mockTensor.div).toHaveBeenCalledWith(255.0);
      expect(mockTensor.expandDims).toHaveBeenCalledWith(0);
      expect(result.tensor).toBe(mockTensor);
      expect(result.metadata.originalWidth).toBe(640);
      expect(result.metadata.originalHeight).toBe(480);
    });

    it('should resize image when dimensions differ', async () => {
      const configWithResize: PreprocessingConfig = {
        targetWidth: 320,
        targetHeight: 240,
        normalize: true
      };

      mockTensor.shape = [480, 640, 3]; // Different from target

      await processor.preprocessImage(mockImageData, configWithResize);

      expect(tf.image.resizeBilinear).toHaveBeenCalledWith(mockTensor, [240, 320]);
    });

    it('should apply augmentations when specified', async () => {
      const configWithAugmentation: PreprocessingConfig = {
        targetWidth: 640,
        targetHeight: 480,
        normalize: true,
        augmentation: {
          brightness: { min: 0.8, max: 1.2 },
          contrast: { min: 0.9, max: 1.1 },
          rotation: { maxAngle: 15 },
          flip: true
        }
      };

      // Mock Math.random to return predictable values
      const originalRandom = Math.random;
      Math.random = jest.fn()
        .mockReturnValueOnce(0.5) // brightness
        .mockReturnValueOnce(0.5) // contrast
        .mockReturnValueOnce(0.5) // rotation
        .mockReturnValueOnce(0.3); // flip (< 0.5, so no flip)

      await processor.preprocessImage(mockImageData, configWithAugmentation);

      expect(tf.image.adjustBrightness).toHaveBeenCalled();
      expect(tf.image.adjustContrast).toHaveBeenCalled();
      expect(tf.image.rotateWithOffset).toHaveBeenCalled();
      expect(tf.image.flipLeftRight).not.toHaveBeenCalled(); // Random was 0.3 < 0.5

      Math.random = originalRandom;
    });

    it('should handle File input', async () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock Image constructor and load event
      const mockImage = {
        width: 640,
        height: 480,
        onload: null as any,
        onerror: null as any,
        src: ''
      };

      const originalImage = global.Image;
      (global as any).Image = jest.fn(() => mockImage);

      // Simulate successful image load
      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload();
        }
      }, 0);

      const result = await processor.preprocessImage(mockFile, config);

      expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
      expect(result.metadata.format).toBe('image/jpeg');
      expect(result.metadata.fileSize).toBe(0); // Empty file

      global.Image = originalImage;
    });
  });

  describe('enhanceImage', () => {
    it('should apply enhancement filters', async () => {
      const mockImageData = new ImageData(100, 100);
      mockContext.getImageData.mockReturnValue(mockImageData);

      const result = await processor.enhanceImage(mockImageData);

      expect(mockContext.putImageData).toHaveBeenCalledWith(mockImageData, 0, 0);
      expect(mockContext.drawImage).toHaveBeenCalled();
      expect(result).toBe(mockImageData);
    });
  });

  describe('extractROI', () => {
    it('should extract region of interest', () => {
      const mockImageData = new ImageData(640, 480);
      const roiImageData = new ImageData(100, 100);
      mockContext.getImageData.mockReturnValue(roiImageData);

      const result = processor.extractROI(mockImageData, 50, 50, 100, 100);

      expect(mockContext.putImageData).toHaveBeenCalledWith(mockImageData, 0, 0);
      expect(mockContext.getImageData).toHaveBeenCalledWith(50, 50, 100, 100);
      expect(result).toBe(roiImageData);
    });
  });

  describe('resizeWithAspectRatio', () => {
    it('should resize image maintaining aspect ratio', () => {
      const mockImageData = new ImageData(800, 600); // 4:3 aspect ratio
      const resizedImageData = new ImageData(400, 300);
      mockContext.getImageData.mockReturnValue(resizedImageData);

      const result = processor.resizeWithAspectRatio(mockImageData, 400, 400, '#000000');

      expect(mockContext.fillStyle).toBe('#000000');
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 400, 400);
      expect(mockContext.drawImage).toHaveBeenCalled();
      expect(result).toBe(resizedImageData);
    });
  });

  describe('tensorToImageData', () => {
    it('should convert tensor to ImageData', async () => {
      const mockImageData = new ImageData(640, 480);
      mockTensor.shape = [480, 640, 3];
      mockTensor.data.mockResolvedValue(new Uint8Array(480 * 640 * 3).fill(128));

      const result = await processor.tensorToImageData(mockTensor);

      expect(mockTensor.max).toHaveBeenCalled();
      expect(mockTensor.data).toHaveBeenCalled();
      expect(result).toBeInstanceOf(ImageData);
      expect(result.width).toBe(640);
      expect(result.height).toBe(480);
    });

    it('should handle normalized tensor values', async () => {
      mockTensor.max.mockReturnValue({ dataSync: () => [0.8] }); // Normalized values
      mockTensor.data.mockResolvedValue(new Float32Array(480 * 640 * 3).fill(0.5));

      await processor.tensorToImageData(mockTensor);

      expect(mockTensor.mul).toHaveBeenCalledWith(255);
      expect(mockTensor.cast).toHaveBeenCalledWith('int32');
    });

    it('should handle 4D tensor (with batch dimension)', async () => {
      mockTensor.rank = 4;
      mockTensor.squeeze.mockReturnValue({
        ...mockTensor,
        rank: 3,
        shape: [480, 640, 3]
      });

      await processor.tensorToImageData(mockTensor);

      expect(mockTensor.squeeze).toHaveBeenCalledWith([0]);
    });
  });

  describe('createThumbnail', () => {
    it('should create thumbnail when scaling is needed', () => {
      const mockImageData = new ImageData(800, 600);
      const thumbnailImageData = new ImageData(150, 112);
      
      // Mock thumbnail canvas context
      const mockThumbnailContext = {
        ...mockContext,
        getImageData: jest.fn(() => thumbnailImageData)
      };

      // Override createElement for thumbnail canvas
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn((tagName: string) => {
        if (tagName === 'canvas') {
          return {
            width: 0,
            height: 0,
            getContext: jest.fn(() => mockThumbnailContext)
          };
        }
        return originalCreateElement.call(document, tagName);
      });

      const result = processor.createThumbnail(mockImageData, 150);

      expect(mockThumbnailContext.drawImage).toHaveBeenCalled();
      expect(result).toBe(thumbnailImageData);

      document.createElement = originalCreateElement;
    });

    it('should return original image when no scaling needed', () => {
      const mockImageData = new ImageData(100, 100);

      const result = processor.createThumbnail(mockImageData, 150);

      expect(result).toBe(mockImageData);
    });
  });

  describe('dispose', () => {
    it('should clean up canvas references', () => {
      processor.dispose();

      expect(mockCanvas.remove).toHaveBeenCalled();
    });
  });
});