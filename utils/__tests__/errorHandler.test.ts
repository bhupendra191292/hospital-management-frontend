import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
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
  validateFileUpload,
  ERROR_CODES,
  ERROR_MESSAGES,
} from '../errorHandler';

describe('Error Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
    console.group = vi.fn();
    console.groupEnd = vi.fn();
  });

  describe('Custom Error Classes', () => {
    it('should create AppError with default values', () => {
      const error = new AppError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.code).toBeUndefined();
    });

    it('should create AppError with custom values', () => {
      const error = new AppError('Test error', 400, false, 'CUSTOM_ERROR');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(false);
      expect(error.code).toBe('CUSTOM_ERROR');
    });

    it('should create ApiError with endpoint and method', () => {
      const error = new ApiError('API error', 404, '/test', 'GET');
      
      expect(error.message).toBe('API error');
      expect(error.statusCode).toBe(404);
      expect(error.endpoint).toBe('/test');
      expect(error.method).toBe('GET');
      expect(error.code).toBeUndefined();
    });

    it('should create ValidationError with field and value', () => {
      const error = new ValidationError('Invalid field', 'email', 'invalid@');
      
      expect(error.message).toBe('Invalid field');
      expect(error.statusCode).toBe(400);
      expect(error.field).toBe('email');
      expect(error.value).toBe('invalid@');
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should create AuthError with default message', () => {
      const error = new AuthError();
      
      expect(error.message).toBe('Authentication failed');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTH_ERROR');
    });

    it('should create AuthorizationError with default message', () => {
      const error = new AuthorizationError();
      
      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
    });

    it('should create NetworkError with default message', () => {
      const error = new NetworkError();
      
      expect(error.message).toBe('Network connection failed');
      expect(error.statusCode).toBe(0);
      expect(error.code).toBe('NETWORK_ERROR');
    });
  });

  describe('handleError', () => {
    it('should log error in development mode', () => {
      const error = new AppError('Test error');
      
      handleError(error, 'Test context');
      
      expect(console.group).toHaveBeenCalledWith('🚨 Error Details');
      expect(console.error).toHaveBeenCalledWith('Error:', error);
      expect(console.error).toHaveBeenCalledWith('Context:', 'Test context');
      expect(console.groupEnd).toHaveBeenCalled();
    });

    it('should handle non-AppError errors', () => {
      const error = new Error('Regular error');
      
      handleError(error, 'Test context');
      
      expect(console.group).toHaveBeenCalledWith('🚨 Error Details');
      expect(console.error).toHaveBeenCalledWith('Error:', error);
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return user-friendly message for ValidationError', () => {
      const error = new ValidationError('Invalid field', 'email');
      const message = getUserFriendlyMessage(error);
      
      expect(message).toBe(ERROR_MESSAGES.VALIDATION_FAILED);
    });

    it('should return user-friendly message for AuthError', () => {
      const error = new AuthError();
      const message = getUserFriendlyMessage(error);
      
      expect(message).toBe(ERROR_MESSAGES.UNAUTHORIZED);
    });

    it('should return user-friendly message for AuthorizationError', () => {
      const error = new AuthorizationError();
      const message = getUserFriendlyMessage(error);
      
      expect(message).toBe(ERROR_MESSAGES.FORBIDDEN);
    });

    it('should return user-friendly message for NetworkError', () => {
      const error = new NetworkError();
      const message = getUserFriendlyMessage(error);
      
      expect(message).toBe(ERROR_MESSAGES.NETWORK_ERROR);
    });

    it('should return user-friendly message for ApiError with 400 status', () => {
      const error = new ApiError('Bad request', 400, '/test', 'POST');
      const message = getUserFriendlyMessage(error);
      
      expect(message).toBe(ERROR_MESSAGES.VALIDATION_FAILED);
    });

    it('should return user-friendly message for ApiError with 401 status', () => {
      const error = new ApiError('Unauthorized', 401, '/test', 'GET');
      const message = getUserFriendlyMessage(error);
      
      expect(message).toBe(ERROR_MESSAGES.UNAUTHORIZED);
    });

    it('should return user-friendly message for ApiError with 403 status', () => {
      const error = new ApiError('Forbidden', 403, '/test', 'GET');
      const message = getUserFriendlyMessage(error);
      
      expect(message).toBe(ERROR_MESSAGES.FORBIDDEN);
    });

    it('should return user-friendly message for ApiError with 404 status', () => {
      const error = new ApiError('Not found', 404, '/test', 'GET');
      const message = getUserFriendlyMessage(error);
      
      expect(message).toBe(ERROR_MESSAGES.NOT_FOUND);
    });

    it('should return user-friendly message for ApiError with 408 status', () => {
      const error = new ApiError('Timeout', 408, '/test', 'GET');
      const message = getUserFriendlyMessage(error);
      
      expect(message).toBe(ERROR_MESSAGES.TIMEOUT);
    });

    it('should return user-friendly message for ApiError with 500 status', () => {
      const error = new ApiError('Server error', 500, '/test', 'GET');
      const message = getUserFriendlyMessage(error);
      
      expect(message).toBe(ERROR_MESSAGES.SERVER_ERROR);
    });

    it('should return default message for unknown errors', () => {
      const error = new Error('Unknown error');
      const message = getUserFriendlyMessage(error);
      
      expect(message).toBe(ERROR_MESSAGES.SERVER_ERROR);
    });
  });

  describe('isOperationalError', () => {
    it('should return true for operational AppError', () => {
      const error = new AppError('Test error', 500, true);
      expect(isOperationalError(error)).toBe(true);
    });

    it('should return false for non-operational AppError', () => {
      const error = new AppError('Test error', 500, false);
      expect(isOperationalError(error)).toBe(false);
    });

    it('should return false for non-AppError', () => {
      const error = new Error('Regular error');
      expect(isOperationalError(error)).toBe(false);
    });
  });

  describe('createErrorResponse', () => {
    it('should create standardized error response', () => {
      const error = new ValidationError('Invalid field', 'email');
      const response = createErrorResponse(error);
      
      expect(response).toEqual({
        success: false,
        error: ERROR_MESSAGES.VALIDATION_FAILED,
        code: 'VALIDATION_ERROR',
        timestamp: expect.any(String),
        details: 'Invalid field', // Development mode includes details
      });
    });

    it('should include details in development mode', () => {
      const error = new Error('Test error');
      const response = createErrorResponse(error);
      
      expect(response).toEqual({
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
        code: 'UNKNOWN_ERROR',
        timestamp: expect.any(String),
        details: 'Test error',
      });
    });
  });

  describe('validateFileUpload', () => {
    it('should validate file size correctly', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 }); // 6MB
      
      const result = await validateFileUpload(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate file type correctly', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      const result = await validateFileUpload(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.UNSUPPORTED_FILE_TYPE);
    });

    it('should accept valid file', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      
      const result = await validateFileUpload(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid image file', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      
      const result = await validateFileUpload(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Constants', () => {
    it('should have correct error codes', () => {
      expect(ERROR_CODES).toEqual({
        VALIDATION_ERROR: 'VALIDATION_ERROR',
        AUTH_ERROR: 'AUTH_ERROR',
        AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
        NETWORK_ERROR: 'NETWORK_ERROR',
        API_ERROR: 'API_ERROR',
        UNKNOWN_ERROR: 'UNKNOWN_ERROR',
      });
    });

    it('should have correct error messages', () => {
      expect(ERROR_MESSAGES).toEqual({
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
      });
    });
  });
});
