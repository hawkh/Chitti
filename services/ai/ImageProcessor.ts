// Image preprocessing pipeline for AI defect detection

import * as tf from '@tensorflow/tfjs';

export interface PreprocessingConfig {
  targetWidth: number;
  targetHeight: number;
  normalize: boolean;
  augmentation?: {
    brightness?: { min: number; max: number };
    contrast?: { min: number; max: number };
    rotation?: { maxAngle: number };
    flip?: boolean;
  };
}

export interface ImageMetadata {
  originalWidth: number;
  originalHeight: number;
  channels: number;
  format: string;
  fileSize: number;
}

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas 2D context');
    }
    this.ctx = ctx;
  }

  async preprocessImage(
    imageData: ImageData | HTMLImageElement | File,
    config: PreprocessingConfig
  ): Promise<{ tensor: tf.Tensor; metadata: ImageMetadata }> {
    let processedImageData: ImageData;
    let metadata: ImageMetadata;

    // Convert input to ImageData
    if (imageData instanceof File) {
      const { imageData: imgData, metadata: meta } = await this.fileToImageData(imageData);
      processedImageData = imgData;
      metadata = meta;
    } else if (imageData instanceof HTMLImageElement) {
      const { imageData: imgData, metadata: meta } = await this.htmlImageToImageData(imageData);
      processedImageData = imgData;
      metadata = meta;
    } else {
      processedImageData = imageData;
      metadata = {
        originalWidth: imageData.width,
        originalHeight: imageData.height,
        channels: 4, // RGBA
        format: 'ImageData',
        fileSize: imageData.data.length
      };
    }

    // Apply preprocessing steps
    let tensor = tf.browser.fromPixels(processedImageData);

    // Resize image
    if (tensor.shape[0] !== config.targetHeight || tensor.shape[1] !== config.targetWidth) {
      tensor = tf.image.resizeBilinear(tensor, [config.targetHeight, config.targetWidth]);
    }

    // Apply augmentations if specified
    if (config.augmentation) {
      tensor = await this.applyAugmentations(tensor, config.augmentation);
    }

    // Normalize pixel values
    if (config.normalize) {
      tensor = tensor.div(255.0);
    }

    // Add batch dimension
    tensor = tensor.expandDims(0);

    return { tensor, metadata };
  }

  private async fileToImageData(file: File): Promise<{ imageData: ImageData; metadata: ImageMetadata }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);
        
        const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
        const metadata: ImageMetadata = {
          originalWidth: img.width,
          originalHeight: img.height,
          channels: 4, // RGBA
          format: file.type,
          fileSize: file.size
        };
        
        URL.revokeObjectURL(img.src);
        resolve({ imageData, metadata });
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image file'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  private async htmlImageToImageData(img: HTMLImageElement): Promise<{ imageData: ImageData; metadata: ImageMetadata }> {
    this.canvas.width = img.width;
    this.canvas.height = img.height;
    this.ctx.drawImage(img, 0, 0);
    
    const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
    const metadata: ImageMetadata = {
      originalWidth: img.width,
      originalHeight: img.height,
      channels: 4, // RGBA
      format: 'HTMLImageElement',
      fileSize: 0 // Not available for HTMLImageElement
    };
    
    return { imageData, metadata };
  }

  private async applyAugmentations(
    tensor: tf.Tensor,
    augmentation: NonNullable<PreprocessingConfig['augmentation']>
  ): Promise<tf.Tensor> {
    let augmentedTensor = tensor;

    // Apply brightness adjustment
    if (augmentation.brightness) {
      const { min, max } = augmentation.brightness;
      const brightnessFactor = Math.random() * (max - min) + min;
      augmentedTensor = tf.image.adjustBrightness(augmentedTensor, brightnessFactor);
    }

    // Apply contrast adjustment
    if (augmentation.contrast) {
      const { min, max } = augmentation.contrast;
      const contrastFactor = Math.random() * (max - min) + min;
      augmentedTensor = tf.image.adjustContrast(augmentedTensor, contrastFactor);
    }

    // Apply rotation
    if (augmentation.rotation) {
      const { maxAngle } = augmentation.rotation;
      const angle = (Math.random() * 2 - 1) * maxAngle * (Math.PI / 180); // Convert to radians
      augmentedTensor = tf.image.rotateWithOffset(augmentedTensor, angle);
    }

    // Apply horizontal flip
    if (augmentation.flip && Math.random() > 0.5) {
      augmentedTensor = tf.image.flipLeftRight(augmentedTensor);
    }

    // Clean up intermediate tensors
    if (augmentedTensor !== tensor) {
      tensor.dispose();
    }

    return augmentedTensor;
  }

  // Utility method to enhance image quality
  async enhanceImage(imageData: ImageData): Promise<ImageData> {
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;
    this.ctx.putImageData(imageData, 0, 0);

    // Apply image enhancement filters
    this.ctx.filter = 'contrast(1.1) brightness(1.05) saturate(1.1)';
    this.ctx.drawImage(this.canvas, 0, 0);
    this.ctx.filter = 'none';

    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  // Method to extract regions of interest
  extractROI(imageData: ImageData, x: number, y: number, width: number, height: number): ImageData {
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;
    this.ctx.putImageData(imageData, 0, 0);

    return this.ctx.getImageData(x, y, width, height);
  }

  // Method to resize image while maintaining aspect ratio
  resizeWithAspectRatio(
    imageData: ImageData,
    targetWidth: number,
    targetHeight: number,
    fillColor: string = '#000000'
  ): ImageData {
    const { width: originalWidth, height: originalHeight } = imageData;
    
    // Calculate scaling factor to fit within target dimensions
    const scaleX = targetWidth / originalWidth;
    const scaleY = targetHeight / originalHeight;
    const scale = Math.min(scaleX, scaleY);
    
    const scaledWidth = Math.round(originalWidth * scale);
    const scaledHeight = Math.round(originalHeight * scale);
    
    // Calculate centering offsets
    const offsetX = Math.round((targetWidth - scaledWidth) / 2);
    const offsetY = Math.round((targetHeight - scaledHeight) / 2);

    // Create target canvas
    this.canvas.width = targetWidth;
    this.canvas.height = targetHeight;
    
    // Fill with background color
    this.ctx.fillStyle = fillColor;
    this.ctx.fillRect(0, 0, targetWidth, targetHeight);
    
    // Draw original image data to temporary canvas
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = originalWidth;
    tempCanvas.height = originalHeight;
    tempCtx.putImageData(imageData, 0, 0);
    
    // Draw scaled image centered on target canvas
    this.ctx.drawImage(
      tempCanvas,
      0, 0, originalWidth, originalHeight,
      offsetX, offsetY, scaledWidth, scaledHeight
    );
    
    return this.ctx.getImageData(0, 0, targetWidth, targetHeight);
  }

  // Method to convert tensor back to ImageData for visualization
  async tensorToImageData(tensor: tf.Tensor): Promise<ImageData> {
    // Remove batch dimension if present
    let imageTensor = tensor.rank === 4 ? tensor.squeeze([0]) : tensor;
    
    // Denormalize if values are in [0, 1] range
    const maxVal = imageTensor.max().dataSync()[0];
    if (maxVal <= 1) {
      imageTensor = imageTensor.mul(255);
    }
    
    // Convert to uint8
    imageTensor = imageTensor.cast('int32');
    
    // Get the data
    const [height, width, channels] = imageTensor.shape;
    const data = await imageTensor.data();
    
    // Create ImageData
    const imageData = new ImageData(width, height);
    
    for (let i = 0; i < height * width; i++) {
      const pixelIndex = i * 4;
      const tensorIndex = i * channels;
      
      if (channels === 1) {
        // Grayscale
        const gray = data[tensorIndex];
        imageData.data[pixelIndex] = gray;     // R
        imageData.data[pixelIndex + 1] = gray; // G
        imageData.data[pixelIndex + 2] = gray; // B
        imageData.data[pixelIndex + 3] = 255;  // A
      } else if (channels === 3) {
        // RGB
        imageData.data[pixelIndex] = data[tensorIndex];     // R
        imageData.data[pixelIndex + 1] = data[tensorIndex + 1]; // G
        imageData.data[pixelIndex + 2] = data[tensorIndex + 2]; // B
        imageData.data[pixelIndex + 3] = 255;  // A
      } else if (channels === 4) {
        // RGBA
        imageData.data[pixelIndex] = data[tensorIndex];     // R
        imageData.data[pixelIndex + 1] = data[tensorIndex + 1]; // G
        imageData.data[pixelIndex + 2] = data[tensorIndex + 2]; // B
        imageData.data[pixelIndex + 3] = data[tensorIndex + 3]; // A
      }
    }
    
    // Clean up
    if (imageTensor !== tensor) {
      imageTensor.dispose();
    }
    
    return imageData;
  }

  // Method to create thumbnail
  createThumbnail(imageData: ImageData, maxSize: number = 150): ImageData {
    const { width, height } = imageData;
    const scale = Math.min(maxSize / width, maxSize / height);
    
    if (scale >= 1) {
      return imageData; // No need to resize
    }
    
    const thumbnailWidth = Math.round(width * scale);
    const thumbnailHeight = Math.round(height * scale);
    
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.putImageData(imageData, 0, 0);
    
    // Create thumbnail canvas
    const thumbnailCanvas = document.createElement('canvas');
    const thumbnailCtx = thumbnailCanvas.getContext('2d')!;
    thumbnailCanvas.width = thumbnailWidth;
    thumbnailCanvas.height = thumbnailHeight;
    
    // Use high-quality scaling
    thumbnailCtx.imageSmoothingEnabled = true;
    thumbnailCtx.imageSmoothingQuality = 'high';
    
    thumbnailCtx.drawImage(
      this.canvas,
      0, 0, width, height,
      0, 0, thumbnailWidth, thumbnailHeight
    );
    
    return thumbnailCtx.getImageData(0, 0, thumbnailWidth, thumbnailHeight);
  }

  dispose(): void {
    // Clean up canvas references
    this.canvas.remove();
  }
}