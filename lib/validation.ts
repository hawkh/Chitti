// Input validation utilities

export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length < 10) {
    return { valid: false, error: 'Phone number too short' };
  }
  
  if (cleaned.length > 15) {
    return { valid: false, error: 'Phone number too long' };
  }
  
  return { valid: true };
};

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  if (email.length > 254) {
    return { valid: false, error: 'Email too long' };
  }
  
  return { valid: true };
};

export class FileValidator {
  static validate(file: File): { valid: boolean; error?: string } {
    return validateFile(file);
  }
}

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large (max 50MB)' };
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Use JPEG, PNG, or WebP' };
  }
  
  return { valid: true };
};

export const sanitizeInput = (input: string, maxLength: number = 1000): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential XSS
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
};

export const validateScore = (score: number): number => {
  if (typeof score !== 'number' || isNaN(score) || !isFinite(score)) {
    return 0;
  }
  return Math.max(0, Math.min(100, score));
};

export const validateCarbonSaved = (carbon: number): number => {
  if (typeof carbon !== 'number' || isNaN(carbon) || !isFinite(carbon)) {
    return 0;
  }
  return Math.max(0, carbon);
};
