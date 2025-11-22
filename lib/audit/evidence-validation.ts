// Evidence Upload Validation
// Validates file types, sizes, and formats for evidence uploads

export const EVIDENCE_CONFIG = {
  maxFileSize: {
    photo: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
    document: 5 * 1024 * 1024, // 5MB
  },
  acceptedTypes: {
    photo: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'],
    video: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  acceptedExtensions: {
    photo: ['.jpg', '.jpeg', '.png', '.webp', '.heic'],
    video: ['.mp4', '.mov', '.webm', '.avi'],
    document: ['.pdf', '.doc', '.docx'],
  },
} as const;

export type EvidenceType = 'photo' | 'video' | 'document';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileType?: EvidenceType;
  fileSize?: number;
}

/**
 * Validates a file for evidence upload
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 */
export function validateEvidenceFile(file: File): FileValidationResult {
  // Determine file type
  let fileType: EvidenceType | undefined;
  
  if (EVIDENCE_CONFIG.acceptedTypes.photo.includes(file.type as any)) {
    fileType = 'photo';
  } else if (EVIDENCE_CONFIG.acceptedTypes.video.includes(file.type as any)) {
    fileType = 'video';
  } else if (EVIDENCE_CONFIG.acceptedTypes.document.includes(file.type as any)) {
    fileType = 'document';
  } else {
    // Check by extension if MIME type doesn't match
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (EVIDENCE_CONFIG.acceptedExtensions.photo.includes(extension as any)) {
      fileType = 'photo';
    } else if (EVIDENCE_CONFIG.acceptedExtensions.video.includes(extension as any)) {
      fileType = 'video';
    } else if (EVIDENCE_CONFIG.acceptedExtensions.document.includes(extension as any)) {
      fileType = 'document';
    }
  }

  if (!fileType) {
    return {
      isValid: false,
      error: 'Unsupported file type. Please upload a photo (JPG, PNG, WEBP), video (MP4, MOV, WEBM), or document (PDF, DOC, DOCX).',
    };
  }

  // Check file size
  const maxSize = EVIDENCE_CONFIG.maxFileSize[fileType];
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeMB}MB limit for ${fileType}s.`,
      fileType,
      fileSize: file.size,
    };
  }

  return {
    isValid: true,
    fileType,
    fileSize: file.size,
  };
}

/**
 * Formats file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Gets the accept attribute value for file input
 * @param types - Array of evidence types to accept
 * @returns Comma-separated string of MIME types and extensions
 */
export function getAcceptAttribute(types: EvidenceType[] = ['photo', 'video', 'document']): string {
  const mimeTypes: string[] = [];
  const extensions: string[] = [];
  
  types.forEach(type => {
    mimeTypes.push(...EVIDENCE_CONFIG.acceptedTypes[type]);
    extensions.push(...EVIDENCE_CONFIG.acceptedExtensions[type]);
  });
  
  return [...mimeTypes, ...extensions].join(',');
}
