// Check if we're in development mode
const isDevelopment = () => {
  return import.meta.env.DEV;
};

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * API Error class for handling API-related errors
 */
export class ApiError extends AppError {
  public readonly endpoint: string;
  public readonly method: string;

  constructor(
    message: string,
    statusCode: number,
    endpoint: string,
    method: string,
    code?: string
  ) {
    super(message, statusCode, true, code);
    this.endpoint = endpoint;
    this.method = method;
  }
}

/**
 * Validation Error class for form validation errors
 */
export class ValidationError extends AppError {
  public readonly field: string;
  public readonly value: any;

  constructor(message: string, field: string, value?: any) {
    super(message, 400, true, 'VALIDATION_ERROR');
    this.field = field;
    this.value = value;
  }
}

/**
 * Authentication Error class for auth-related errors
 */
export class AuthError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true, 'AUTH_ERROR');
  }
}

/**
 * Authorization Error class for permission-related errors
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, true, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Network Error class for connection issues
 */
export class NetworkError extends AppError {
  constructor(message: string = 'Network connection failed') {
    super(message, 0, true, 'NETWORK_ERROR');
  }
}

/**
 * Error codes for different types of errors
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * Error messages for common scenarios
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You don\'t have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_FAILED: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  UNSUPPORTED_FILE_TYPE: 'File type is not supported.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
} as const;

/**
 * Handles and logs errors appropriately based on environment
 * @param error - The error to handle
 * @param context - Additional context about where the error occurred
 */
export const handleError = (error: Error | AppError, context?: string): void => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    url: typeof window !== 'undefined' ? window.location.href : '',
  };

  // Log error details in development
  if (isDevelopment()) {
    console.group('🚨 Error Details');
    console.error('Error:', error);
    console.error('Context:', context);
    console.error('Error Info:', errorInfo);
    console.groupEnd();
  } else {
    // In production, log to external service (e.g., Sentry)
    console.error('Application Error:', {
      message: error.message,
      context,
      timestamp: errorInfo.timestamp,
    });
  }

  // Send to error tracking service in production
  if (!isDevelopment()) {
    // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
    // sendToErrorTrackingService(errorInfo);
  }
};

/**
 * Creates a user-friendly error message
 * @param error - The error object
 * @returns User-friendly error message
 */
export const getUserFriendlyMessage = (error: Error | AppError): string => {
  // Handle ApiError first (it extends AppError)
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 400:
        return ERROR_MESSAGES.VALIDATION_FAILED;
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 408:
        return ERROR_MESSAGES.TIMEOUT;
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.SERVER_ERROR;
    }
  }

  // Handle other AppError types
  if (error instanceof AppError) {
    switch (error.code) {
      case ERROR_CODES.VALIDATION_ERROR:
        return ERROR_MESSAGES.VALIDATION_FAILED;
      case ERROR_CODES.AUTH_ERROR:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case ERROR_CODES.AUTHORIZATION_ERROR:
        return ERROR_MESSAGES.FORBIDDEN;
      case ERROR_CODES.NETWORK_ERROR:
        return ERROR_MESSAGES.NETWORK_ERROR;
      default:
        return ERROR_MESSAGES.SERVER_ERROR;
    }
  }

  return ERROR_MESSAGES.SERVER_ERROR;
};

/**
 * Validates if an error is operational (expected) or programming (unexpected)
 * @param error - The error to check
 * @returns True if the error is operational
 */
export const isOperationalError = (error: Error | AppError): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

/**
 * Creates a standardized error response for API calls
 * @param error - The error object
 * @returns Standardized error response
 */
export const createErrorResponse = (error: Error | AppError) => {
  const response = {
    success: false,
    error: getUserFriendlyMessage(error),
    code: error instanceof AppError ? error.code : ERROR_CODES.UNKNOWN_ERROR,
    timestamp: new Date().toISOString(),
  };

  if (isDevelopment()) {
    return {
      ...response,
      details: error.message,
    };
  }

  return response;
};

/**
 * Global error handler for unhandled promise rejections
 */
export const setupGlobalErrorHandling = (): void => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    handleError(new Error(event.reason), 'Unhandled Promise Rejection');
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    event.preventDefault();
    handleError(event.error || new Error(event.message), 'Uncaught Error');
  });
};

/**
 * Validates file upload errors
 * @param file - The file to validate
 * @returns Validation result
 */
export const validateFileUpload = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const SUPPORTED_FILE_TYPES = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'];

  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE };
  }

  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!SUPPORTED_FILE_TYPES.includes(fileExtension)) {
    return { isValid: false, error: ERROR_MESSAGES.UNSUPPORTED_FILE_TYPE };
  }

  return { isValid: true };
};

export default {
  AppError,
  ApiError,
  ValidationError,
  AuthError,
  AuthorizationError,
  NetworkError,
  handleError,
  getUserFriendlyMessage,
  isOperationalError,
  createErrorResponse,
  setupGlobalErrorHandling,
  validateFileUpload,
};
