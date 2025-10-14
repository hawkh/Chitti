# Critical Security Fixes Required

## High Priority Security Issues

### 1. Cross-Site Scripting (XSS) Prevention
```typescript
// lib/security.ts
export class SecurityUtils {
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  }

  static validateFileUpload(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }
}
```

### 2. Path Traversal Protection
```typescript
// lib/file-security.ts
import path from 'path';

export class FileSecurityUtils {
  static sanitizePath(filePath: string): string {
    // Remove any path traversal attempts
    const sanitized = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
    
    // Ensure path is within allowed directory
    const allowedDir = process.env.UPLOAD_DIR || '/tmp/uploads';
    const fullPath = path.join(allowedDir, sanitized);
    
    if (!fullPath.startsWith(allowedDir)) {
      throw new Error('Invalid file path');
    }
    
    return fullPath;
  }
}
```

### 3. Input Validation & Sanitization
```typescript
// lib/validation-security.ts
import { z } from 'zod';

export const secureFileUploadSchema = z.object({
  filename: z.string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid filename characters'),
  size: z.number().max(100 * 1024 * 1024),
  type: z.enum(['image/jpeg', 'image/png', 'image/webp', 'video/mp4'])
});

export const secureApiRequestSchema = z.object({
  userId: z.string().uuid(),
  action: z.string().max(50),
  data: z.record(z.unknown()).optional()
});
```

### 4. Rate Limiting Implementation
```typescript
// middleware/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server';

const rateLimitMap = new Map();

export function rateLimit(limit: number = 100, windowMs: number = 60000) {
  return (req: NextRequest) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, []);
    }
    
    const requests = rateLimitMap.get(ip);
    const validRequests = requests.filter((time: number) => time > windowStart);
    
    if (validRequests.length >= limit) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
    
    validRequests.push(now);
    rateLimitMap.set(ip, validRequests);
    
    return null; // Allow request
  };
}
```

## Medium Priority Fixes

### 1. Secure Logging
```typescript
// lib/secure-logger.ts
export class SecureLogger {
  static log(level: string, message: string, data?: any) {
    // Remove sensitive information
    const sanitizedData = this.sanitizeLogData(data);
    
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      data: sanitizedData
    }));
  }
  
  private static sanitizeLogData(data: any): any {
    if (!data) return data;
    
    const sensitiveKeys = ['password', 'token', 'key', 'secret'];
    const sanitized = { ...data };
    
    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
}
```

### 2. CSRF Protection
```typescript
// middleware/csrf.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export function csrfProtection(req: NextRequest) {
  if (req.method === 'GET') return null;
  
  const token = req.headers.get('x-csrf-token');
  const sessionToken = req.cookies.get('csrf-token')?.value;
  
  if (!token || !sessionToken || token !== sessionToken) {
    return NextResponse.json(
      { error: 'CSRF token mismatch' },
      { status: 403 }
    );
  }
  
  return null;
}

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
```