import { validatePhone, validateEmail, validateFile, validateScore, validateCarbonSaved, sanitizeInput } from '@/lib/validation';

describe('Validation Tests', () => {
  describe('validatePhone', () => {
    it('should accept valid 10-digit phone', () => {
      expect(validatePhone('9876543210').valid).toBe(true);
    });

    it('should accept phone with country code', () => {
      expect(validatePhone('+919876543210').valid).toBe(true);
    });

    it('should reject empty phone', () => {
      expect(validatePhone('').valid).toBe(false);
    });

    it('should reject too short phone', () => {
      expect(validatePhone('123').valid).toBe(false);
    });

    it('should reject too long phone', () => {
      expect(validatePhone('12345678901234567890').valid).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should accept valid email', () => {
      expect(validateEmail('test@example.com').valid).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validateEmail('invalid-email').valid).toBe(false);
    });

    it('should reject empty email', () => {
      expect(validateEmail('').valid).toBe(false);
    });

    it('should reject email without @', () => {
      expect(validateEmail('testexample.com').valid).toBe(false);
    });
  });

  describe('validateScore', () => {
    it('should clamp score to 0-100 range', () => {
      expect(validateScore(150)).toBe(100);
      expect(validateScore(-10)).toBe(0);
      expect(validateScore(50)).toBe(50);
    });

    it('should handle NaN', () => {
      expect(validateScore(NaN)).toBe(0);
    });

    it('should handle Infinity', () => {
      expect(validateScore(Infinity)).toBe(0);
    });
  });

  describe('validateCarbonSaved', () => {
    it('should accept positive values', () => {
      expect(validateCarbonSaved(300)).toBe(300);
    });

    it('should clamp negative to 0', () => {
      expect(validateCarbonSaved(-100)).toBe(0);
    });

    it('should handle NaN', () => {
      expect(validateCarbonSaved(NaN)).toBe(0);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove XSS attempts', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).not.toContain('<script>');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
    });

    it('should limit length', () => {
      const long = 'a'.repeat(2000);
      expect(sanitizeInput(long, 100).length).toBe(100);
    });

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });
});
