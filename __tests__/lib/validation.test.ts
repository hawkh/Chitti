// Unit tests for validation utilities

import { FileValidator, ConfigValidator, DataValidator } from '../validation';
import { DefectType, MaterialType } from '../../types';

describe('FileValidator', () => {
  describe('validateImageFile', () => {
    it('should validate a valid image file', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = FileValidator.validateImageFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject unsupported file format', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = FileValidator.validateImageFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Unsupported image format'));
    });

    it('should reject file that is too large', () => {
      // Create a mock file that exceeds size limit
      const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.jpg', { 
        type: 'image/jpeg' 
      });
      
      const result = FileValidator.validateImageFile(largeFile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('File size exceeds maximum limit'));
    });

    it('should reject file with empty name', () => {
      const file = new File(['test'], '', { type: 'image/jpeg' });
      const result = FileValidator.validateImageFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File name is required');
    });
  });

  describe('validateVideoFile', () => {
    it('should validate a valid video file', () => {
      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
      const result = FileValidator.validateVideoFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject unsupported video format', () => {
      const file = new File(['test'], 'test.mkv', { type: 'video/mkv' });
      const result = FileValidator.validateVideoFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Unsupported video format'));
    });
  });

  describe('validateBatchUpload', () => {
    it('should validate a valid batch of files', () => {
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.png', { type: 'image/png' })
      ];
      
      const result = FileValidator.validateBatchUpload(files);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty file array', () => {
      const result = FileValidator.validateBatchUpload([]);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No files selected');
    });

    it('should reject batch with too many files', () => {
      const files = Array.from({ length: 101 }, (_, i) => 
        new File(['test'], `test${i}.jpg`, { type: 'image/jpeg' })
      );
      
      const result = FileValidator.validateBatchUpload(files);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Too many image files'));
    });
  });
});

describe('ConfigValidator', () => {
  describe('validateDetectionConfig', () => {
    it('should validate a valid detection config', () => {
      const config = {
        componentType: { id: 'test', name: 'Test', description: 'Test', materialType: MaterialType.METAL, commonDefects: [] },
        sensitivity: 0.7,
        defectTypes: [DefectType.CRACK],
        confidenceThreshold: 0.5
      };
      
      const result = ConfigValidator.validateDetectionConfig(config);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid sensitivity values', () => {
      const config = {
        componentType: { id: 'test', name: 'Test', description: 'Test', materialType: MaterialType.METAL, commonDefects: [] },
        sensitivity: 1.5, // Invalid
        defectTypes: [DefectType.CRACK],
        confidenceThreshold: 0.5
      };
      
      const result = ConfigValidator.validateDetectionConfig(config);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Sensitivity must be between 0 and 1');
    });

    it('should reject empty defect types', () => {
      const config = {
        componentType: { id: 'test', name: 'Test', description: 'Test', materialType: MaterialType.METAL, commonDefects: [] },
        sensitivity: 0.7,
        defectTypes: [], // Empty
        confidenceThreshold: 0.5
      };
      
      const result = ConfigValidator.validateDetectionConfig(config);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one defect type must be selected');
    });
  });

  describe('validateComponentProfile', () => {
    it('should validate a valid component profile', () => {
      const profile = {
        name: 'Test Profile',
        materialType: MaterialType.METAL,
        criticalDefects: [DefectType.CRACK],
        defaultSensitivity: 0.7,
        qualityStandards: ['ISO 9001'],
        customParameters: {}
      };
      
      const result = ConfigValidator.validateComponentProfile(profile);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject profile with empty name', () => {
      const profile = {
        name: '', // Empty
        materialType: MaterialType.METAL,
        criticalDefects: [DefectType.CRACK],
        defaultSensitivity: 0.7,
        qualityStandards: ['ISO 9001'],
        customParameters: {}
      };
      
      const result = ConfigValidator.validateComponentProfile(profile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Profile name is required');
    });

    it('should reject profile with invalid sensitivity', () => {
      const profile = {
        name: 'Test Profile',
        materialType: MaterialType.METAL,
        criticalDefects: [DefectType.CRACK],
        defaultSensitivity: -0.1, // Invalid
        qualityStandards: ['ISO 9001'],
        customParameters: {}
      };
      
      const result = ConfigValidator.validateComponentProfile(profile);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Default sensitivity must be between 0 and 1');
    });
  });
});

describe('DataValidator', () => {
  describe('validateEmail', () => {
    it('should validate a valid email', () => {
      expect(DataValidator.validateEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(DataValidator.validateEmail('invalid-email')).toBe(false);
      expect(DataValidator.validateEmail('test@')).toBe(false);
      expect(DataValidator.validateEmail('@example.com')).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('should pass for valid values', () => {
      expect(DataValidator.validateRequired('test', 'field')).toBeNull();
      expect(DataValidator.validateRequired(123, 'field')).toBeNull();
    });

    it('should fail for empty values', () => {
      expect(DataValidator.validateRequired('', 'field')).toBe('field is required');
      expect(DataValidator.validateRequired(null, 'field')).toBe('field is required');
      expect(DataValidator.validateRequired(undefined, 'field')).toBe('field is required');
    });
  });

  describe('validateRange', () => {
    it('should pass for values within range', () => {
      expect(DataValidator.validateRange(5, 1, 10, 'field')).toBeNull();
    });

    it('should fail for values outside range', () => {
      expect(DataValidator.validateRange(0, 1, 10, 'field')).toBe('field must be between 1 and 10');
      expect(DataValidator.validateRange(11, 1, 10, 'field')).toBe('field must be between 1 and 10');
    });
  });
});