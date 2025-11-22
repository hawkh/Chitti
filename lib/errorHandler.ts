// Centralized error handling

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const handleApiError = (error: unknown): { message: string; statusCode: number } => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500
    };
  }

  return {
    message: 'An unexpected error occurred',
    statusCode: 500
  };
};

export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    console.error('Error:', error);
    if (fallback !== undefined) {
      return fallback;
    }
    throw error;
  }
};

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};
