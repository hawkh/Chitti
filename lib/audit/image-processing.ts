// Client-side image processing utilities
// Handles compression, resizing, and thumbnail generation

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface ProcessedImage {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  size: number;
}

/**
 * Compress and resize an image file
 */
export async function compressImage(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            const dataUrl = canvas.toDataURL(`image/${format}`, quality);

            resolve({
              blob,
              dataUrl,
              width,
              height,
              size: blob.size
            });
          },
          `image/${format}`,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Generate thumbnail from image file
 */
export async function generateThumbnail(
  file: File,
  size: number = 200
): Promise<ProcessedImage> {
  return compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'jpeg'
  });
}

/**
 * Extract EXIF data from image
 */
export async function extractExifData(file: File): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const view = new DataView(arrayBuffer);

      const exifData: Record<string, any> = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        lastModified: new Date(file.lastModified),
        captureDate: null,
        location: null,
        camera: null,
        orientation: 1
      };

      try {
        // Check for JPEG marker
        if (view.getUint16(0, false) !== 0xFFD8) {
          resolve(exifData);
          return;
        }

        // Find EXIF marker (0xFFE1)
        let offset = 2;
        while (offset < view.byteLength) {
          const marker = view.getUint16(offset, false);
          
          if (marker === 0xFFE1) {
            // Found APP1 (EXIF) marker
            const exifOffset = offset + 4;
            
            // Check for "Exif" identifier
            if (view.getUint32(exifOffset, false) === 0x45786966) {
              // Parse EXIF data
              const tiffOffset = exifOffset + 6;
              const littleEndian = view.getUint16(tiffOffset, false) === 0x4949;
              
              // Get IFD0 offset
              const ifd0Offset = tiffOffset + view.getUint32(tiffOffset + 4, littleEndian);
              
              // Read IFD0 entries
              const numEntries = view.getUint16(ifd0Offset, littleEndian);
              
              for (let i = 0; i < numEntries; i++) {
                const entryOffset = ifd0Offset + 2 + (i * 12);
                const tag = view.getUint16(entryOffset, littleEndian);
                
                // Orientation tag (0x0112)
                if (tag === 0x0112) {
                  exifData.orientation = view.getUint16(entryOffset + 8, littleEndian);
                }
                
                // DateTime tag (0x0132)
                if (tag === 0x0132) {
                  const strOffset = tiffOffset + view.getUint32(entryOffset + 8, littleEndian);
                  let dateStr = '';
                  for (let j = 0; j < 19; j++) {
                    const char = view.getUint8(strOffset + j);
                    if (char === 0) break;
                    dateStr += String.fromCharCode(char);
                  }
                  if (dateStr) {
                    // Parse EXIF date format: "YYYY:MM:DD HH:MM:SS"
                    const parts = dateStr.split(' ');
                    if (parts.length === 2) {
                      const dateParts = parts[0].split(':');
                      const timeParts = parts[1].split(':');
                      exifData.captureDate = new Date(
                        parseInt(dateParts[0]),
                        parseInt(dateParts[1]) - 1,
                        parseInt(dateParts[2]),
                        parseInt(timeParts[0]),
                        parseInt(timeParts[1]),
                        parseInt(timeParts[2])
                      );
                    }
                  }
                }
                
                // Make/Model tags
                if (tag === 0x010F) { // Make
                  const strOffset = tiffOffset + view.getUint32(entryOffset + 8, littleEndian);
                  const count = view.getUint32(entryOffset + 4, littleEndian);
                  let make = '';
                  for (let j = 0; j < Math.min(count, 32); j++) {
                    const char = view.getUint8(strOffset + j);
                    if (char === 0) break;
                    make += String.fromCharCode(char);
                  }
                  if (!exifData.camera) exifData.camera = {};
                  exifData.camera.make = make.trim();
                }
                
                if (tag === 0x0110) { // Model
                  const strOffset = tiffOffset + view.getUint32(entryOffset + 8, littleEndian);
                  const count = view.getUint32(entryOffset + 4, littleEndian);
                  let model = '';
                  for (let j = 0; j < Math.min(count, 32); j++) {
                    const char = view.getUint8(strOffset + j);
                    if (char === 0) break;
                    model += String.fromCharCode(char);
                  }
                  if (!exifData.camera) exifData.camera = {};
                  exifData.camera.model = model.trim();
                }
              }
              
              // Look for GPS IFD
              // This is a simplified version - full GPS parsing would be more complex
              // For production, consider using a library like exif-js
            }
            break;
          }
          
          // Move to next marker
          const segmentLength = view.getUint16(offset + 2, false);
          offset += 2 + segmentLength;
        }
      } catch (error) {
        console.warn('Error parsing EXIF data:', error);
      }

      resolve(exifData);
    };

    reader.onerror = () => {
      resolve({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        lastModified: new Date(file.lastModified),
        captureDate: null,
        location: null,
        camera: null,
        orientation: 1
      });
    };

    reader.readAsArrayBuffer(file.slice(0, 128 * 1024)); // Read first 128KB
  });
}

/**
 * Get image dimensions without loading full image
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convert image to different format
 */
export async function convertImageFormat(
  file: File,
  targetFormat: 'jpeg' | 'png' | 'webp',
  quality: number = 0.9
): Promise<Blob> {
  const processed = await compressImage(file, {
    maxWidth: 4096,
    maxHeight: 4096,
    quality,
    format: targetFormat
  });

  return processed.blob;
}

/**
 * Batch process multiple images
 */
export async function batchProcessImages(
  files: File[],
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage[]> {
  const results: ProcessedImage[] = [];

  for (const file of files) {
    try {
      const processed = await compressImage(file, options);
      results.push(processed);
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error);
      // Continue with other files
    }
  }

  return results;
}

/**
 * Calculate compression ratio
 */
export function getCompressionRatio(originalSize: number, compressedSize: number): number {
  return Math.round((1 - compressedSize / originalSize) * 100);
}

/**
 * Validate image file
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
}

/**
 * Get optimal compression settings based on image size
 */
export function getOptimalCompressionSettings(fileSize: number): ImageProcessingOptions {
  // File size in MB
  const sizeMB = fileSize / (1024 * 1024);

  if (sizeMB > 10) {
    // Large files: aggressive compression
    return {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.75,
      format: 'jpeg'
    };
  } else if (sizeMB > 5) {
    // Medium files: moderate compression
    return {
      maxWidth: 2560,
      maxHeight: 1440,
      quality: 0.85,
      format: 'jpeg'
    };
  } else {
    // Small files: light compression
    return {
      maxWidth: 3840,
      maxHeight: 2160,
      quality: 0.9,
      format: 'jpeg'
    };
  }
}

/**
 * Create a preview data URL from file
 */
export async function createPreviewDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Apply orientation correction based on EXIF data
 */
export async function correctImageOrientation(
  file: File,
  orientation: number = 1
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        let { width, height } = img;

        // Swap dimensions for rotated orientations
        if (orientation >= 5 && orientation <= 8) {
          [width, height] = [height, width];
        }

        canvas.width = width;
        canvas.height = height;

        // Apply transformation based on orientation
        switch (orientation) {
          case 2:
            ctx.transform(-1, 0, 0, 1, width, 0);
            break;
          case 3:
            ctx.transform(-1, 0, 0, -1, width, height);
            break;
          case 4:
            ctx.transform(1, 0, 0, -1, 0, height);
            break;
          case 5:
            ctx.transform(0, 1, 1, 0, 0, 0);
            break;
          case 6:
            ctx.transform(0, 1, -1, 0, height, 0);
            break;
          case 7:
            ctx.transform(0, -1, -1, 0, height, width);
            break;
          case 8:
            ctx.transform(0, -1, 1, 0, 0, width);
            break;
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

            resolve({
              blob,
              dataUrl,
              width,
              height,
              size: blob.size
            });
          },
          'image/jpeg',
          0.9
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Generate multiple thumbnail sizes
 */
export async function generateMultipleThumbnails(
  file: File,
  sizes: number[] = [100, 200, 400]
): Promise<{ size: number; image: ProcessedImage }[]> {
  const thumbnails: { size: number; image: ProcessedImage }[] = [];

  for (const size of sizes) {
    try {
      const thumbnail = await generateThumbnail(file, size);
      thumbnails.push({ size, image: thumbnail });
    } catch (error) {
      console.error(`Failed to generate ${size}px thumbnail:`, error);
    }
  }

  return thumbnails;
}

/**
 * Smart crop image to aspect ratio
 */
export async function cropToAspectRatio(
  file: File,
  aspectRatio: number = 16 / 9,
  quality: number = 0.9
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const imgRatio = img.width / img.height;
        let cropWidth = img.width;
        let cropHeight = img.height;
        let cropX = 0;
        let cropY = 0;

        if (imgRatio > aspectRatio) {
          // Image is wider than target ratio
          cropWidth = img.height * aspectRatio;
          cropX = (img.width - cropWidth) / 2;
        } else if (imgRatio < aspectRatio) {
          // Image is taller than target ratio
          cropHeight = img.width / aspectRatio;
          cropY = (img.height - cropHeight) / 2;
        }

        const canvas = document.createElement('canvas');
        canvas.width = cropWidth;
        canvas.height = cropHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            const dataUrl = canvas.toDataURL('image/jpeg', quality);

            resolve({
              blob,
              dataUrl,
              width: cropWidth,
              height: cropHeight,
              size: blob.size
            });
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Add watermark to image
 */
export async function addWatermark(
  file: File,
  watermarkText: string,
  options: {
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
    fontSize?: number;
    opacity?: number;
    color?: string;
  } = {}
): Promise<ProcessedImage> {
  const {
    position = 'bottom-right',
    fontSize = 24,
    opacity = 0.5,
    color = '#FFFFFF'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Set watermark style
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;

        // Measure text
        const textMetrics = ctx.measureText(watermarkText);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;

        // Calculate position
        let x = 0;
        let y = 0;
        const padding = 20;

        switch (position) {
          case 'bottom-right':
            x = canvas.width - textWidth - padding;
            y = canvas.height - padding;
            break;
          case 'bottom-left':
            x = padding;
            y = canvas.height - padding;
            break;
          case 'top-right':
            x = canvas.width - textWidth - padding;
            y = textHeight + padding;
            break;
          case 'top-left':
            x = padding;
            y = textHeight + padding;
            break;
          case 'center':
            x = (canvas.width - textWidth) / 2;
            y = (canvas.height + textHeight) / 2;
            break;
        }

        // Draw watermark
        ctx.fillText(watermarkText, x, y);

        // Reset alpha
        ctx.globalAlpha = 1.0;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

            resolve({
              blob,
              dataUrl,
              width: canvas.width,
              height: canvas.height,
              size: blob.size
            });
          },
          'image/jpeg',
          0.9
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Process image with auto-enhancement
 */
export async function autoEnhanceImage(
  file: File,
  options: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
  } = {}
): Promise<ProcessedImage> {
  const {
    brightness = 1.0,
    contrast = 1.0,
    saturation = 1.0
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply enhancements
        for (let i = 0; i < data.length; i += 4) {
          // Brightness
          data[i] *= brightness;
          data[i + 1] *= brightness;
          data[i + 2] *= brightness;

          // Contrast
          data[i] = ((data[i] - 128) * contrast) + 128;
          data[i + 1] = ((data[i + 1] - 128) * contrast) + 128;
          data[i + 2] = ((data[i + 2] - 128) * contrast) + 128;

          // Saturation (simplified)
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = gray + saturation * (data[i] - gray);
          data[i + 1] = gray + saturation * (data[i + 1] - gray);
          data[i + 2] = gray + saturation * (data[i + 2] - gray);

          // Clamp values
          data[i] = Math.max(0, Math.min(255, data[i]));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
        }

        // Put enhanced image data back
        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

            resolve({
              blob,
              dataUrl,
              width: canvas.width,
              height: canvas.height,
              size: blob.size
            });
          },
          'image/jpeg',
          0.9
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Comprehensive image processing pipeline
 */
export async function processImageForUpload(
  file: File,
  options: {
    compress?: boolean;
    generateThumbnail?: boolean;
    extractExif?: boolean;
    correctOrientation?: boolean;
    addWatermark?: boolean;
    watermarkText?: string;
    maxSize?: number;
  } = {}
): Promise<{
  original: File;
  compressed?: ProcessedImage;
  thumbnail?: ProcessedImage;
  exif?: Record<string, any>;
  compressionRatio?: number;
}> {
  const {
    compress = true,
    generateThumbnail: shouldGenerateThumbnail = true,
    extractExif: shouldExtractExif = true,
    correctOrientation: shouldCorrectOrientation = true,
    addWatermark: shouldAddWatermark = false,
    watermarkText = '',
    maxSize = 5 * 1024 * 1024 // 5MB
  } = options;

  const result: {
    original: File;
    compressed?: ProcessedImage;
    thumbnail?: ProcessedImage;
    exif?: Record<string, any>;
    compressionRatio?: number;
  } = {
    original: file
  };

  // Extract EXIF data
  if (shouldExtractExif) {
    result.exif = await extractExifData(file);
  }

  // Correct orientation if needed
  let processedFile = file;
  if (shouldCorrectOrientation && result.exif?.orientation && result.exif.orientation !== 1) {
    const corrected = await correctImageOrientation(file, result.exif.orientation);
    processedFile = new File([corrected.blob], file.name, { type: 'image/jpeg' });
  }

  // Compress image
  if (compress && file.size > maxSize) {
    const compressionSettings = getOptimalCompressionSettings(file.size);
    result.compressed = await compressImage(processedFile, compressionSettings);
    result.compressionRatio = getCompressionRatio(file.size, result.compressed.size);
  }

  // Generate thumbnail
  if (shouldGenerateThumbnail) {
    result.thumbnail = await generateThumbnail(processedFile, 200);
  }

  // Add watermark if requested
  if (shouldAddWatermark && watermarkText) {
    const watermarked = await addWatermark(processedFile, watermarkText);
    result.compressed = watermarked;
  }

  return result;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Estimate processing time based on file size
 */
export function estimateProcessingTime(fileSize: number): number {
  // Rough estimate: 1MB takes about 500ms to process
  const sizeMB = fileSize / (1024 * 1024);
  return Math.ceil(sizeMB * 500);
}
