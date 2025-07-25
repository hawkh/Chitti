// Validation utilities for AI NDT Defect Detection System

import { 
  SUPPORTED_IMAGE_FORMATS, 
  SUPPORTED_VIDEO_FORMATS, 
  MAX_FILE_SIZE,
  MAX_BATCH_SIZE,
  MAX_VIDEO_BATCH_SIZE
} from './constants';
import { DetectionConfig, ComponentProfile, DefectType, MaterialType } from '@/types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class FileValidator {
  static validateImageFile(file: File): ValidationResult {
    const errors: string[] = [];

    // Check file type
    if (!SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
      errors.push(`Unsupported image format: ${file.type}. Supported formats: ${SUPPORTED_IMAGE_FORMATS.join(', ')}`);
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // Check file name
    if (!file.name || file.name.trim().length === 0) {
      errors.push('File name is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateVideoFile(file: File): ValidationResult {
    const errors: string[] = [];

    // Check file type
    if (!SUPPORTED_VIDEO_FORMATS.includes(file.type)) {
      errors.push(`Unsupported video format: ${file.type}. Supported formats: ${SUPPORTED_VIDEO_FORMATS.join(', ')}`);
    }

    // Check file size (videos can be larger)
    if (file.size > MAX_FILE_SIZE * 5) { // 250MB for videos
      errors.push(`Video file size exceeds maximum limit of ${(MAX_FILE_SIZE * 5) / (1024 * 1024)}MB`);
    }

    // Check file name
    if (!file.name || file.name.trim().length === 0) {
      errors.push('File name is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateBatchUpload(files: File[]): ValidationResult {
    const errors: string[] = [];

    if (files.length === 0) {
      errors.push('No files selected');
      return { isValid: false, errors };
    }

    // Check batch size limits
    const imageFiles = files.filter(f => SUPPORTED_IMAGE_FORMATS.includes(f.type));
    const videoFiles = files.filter(f => SUPPORTED_VIDEO_FORMATS.includes(f.type));

    if (imageFiles.length > MAX_BATCH_SIZE) {
      errors.push(`Too many image files. Maximum allowed: ${MAX_BATCH_SIZE}`);
    }

    if (videoFiles.length > MAX_VIDEO_BATCH_SIZE) {
      errors.push(`Too many video files. Maximum allowed: ${MAX_VIDEO_BATCH_SIZE}`);
    }

    // Validate each file
    files.forEach((file, index) => {
      const isImage = SUPPORTED_IMAGE_FORMATS.includes(file.type);
      const isVideo = SUPPORTED_VIDEO_FORMATS.includes(file.type);

      if (!isImage && !isVideo) {
        errors.push(`File ${index + 1} (${file.name}): Unsupported file format`);
      } else {
        const validation = isImage 
          ? FileValidator.validateImageFile(file)
          : FileValidator.validateVideoFile(file);
        
        if (!validation.isValid) {
          validation.errors.forEach(error => {
            errors.push(`File ${index + 1} (${file.name}): ${error}`);
          });
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export class ConfigValidator {
  static validateDetectionConfig(config: DetectionConfig): ValidationResult {
    const errors: string[] = [];

    // Validate sensitivity
    if (config.sensitivity < 0 || config.sensitivity > 1) {
      errors.push('Sensitivity must be between 0 and 1');
    }

    // Validate confidence threshold
    if (config.confidenceThreshold < 0 || config.confidenceThreshold > 1) {
      errors.push('Confidence threshold must be between 0 and 1');
    }

    // Validate defect types
    if (!config.defectTypes || config.defectTypes.length === 0) {
      errors.push('At least one defect type must be selected');
    }

    // Validate component type
    if (!config.componentType) {
      errors.push('Component type is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateComponentProfile(profile: Omit<ComponentProfile, 'id'>): ValidationResult {
    const errors: string[] = [];

    // Validate name
    if (!profile.name || profile.name.trim().length === 0) {
      errors.push('Profile name is required');
    }

    if (profile.name && profile.name.length > 100) {
      errors.push('Profile name must be less than 100 characters');
    }

    // Validate material type
    if (!Object.values(MaterialType).includes(profile.materialType)) {
      errors.push('Invalid material type');
    }

    // Validate sensitivity
    if (profile.defaultSensitivity < 0 || profile.defaultSensitivity > 1) {
      errors.push('Default sensitivity must be between 0 and 1');
    }

    // Validate critical defects
    if (!profile.criticalDefects || profile.criticalDefects.length === 0) {
      errors.push('At least one critical defect type must be specified');
    }

    profile.criticalDefects?.forEach((defect: DefectType) => {
      if (!Object.values(DefectType).includes(defect)) {
        errors.push(`Invalid defect type: ${defect}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export class DataValidator {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateRequired(value: any, fieldName: string): string | null {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} is required`;
    }
    return null;
  }

  static validateMinLength(value: string, minLength: number, fieldName: string): string | null {
    if (value && value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters long`;
    }
    return null;
  }

  static validateMaxLength(value: string, maxLength: number, fieldName: string): string | null {
    if (value && value.length > maxLength) {
      return `${fieldName} must be less than ${maxLength} characters long`;
    }
    return null;
  }

  static validateRange(value: number, min: number, max: number, fieldName: string): string | null {
    if (value < min || value > max) {
      return `${fieldName} must be between ${min} and ${max}`;
    }
    return null;
  }
}

// Utility function to combine validation results
export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
  const allErrors = results.flatMap(result => result.errors);
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}