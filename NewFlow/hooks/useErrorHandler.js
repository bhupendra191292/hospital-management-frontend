import { useState, useCallback } from 'react';
import { 
  handleError, 
  getUserFriendlyMessage, 
  createErrorResponse,
  ERROR_MESSAGES 
} from '../../utils/errorHandler';

/**
 * Custom hook for consistent error handling across NewFlow components
 */
export const useErrorHandler = () => {
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle API errors consistently
   */
  const handleApiError = useCallback((error, context = '') => {
    console.error(`❌ API Error in ${context}:`, error);
    
    // Log the error for debugging
    handleError(error, context);
    
    // Extract user-friendly message
    let userMessage = getUserFriendlyMessage(error);
    
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          // Validation errors
          if (data.errors && Array.isArray(data.errors)) {
            const fieldErrors = {};
            data.errors.forEach(err => {
              fieldErrors[err.field] = err.message;
            });
            setErrors(fieldErrors);
            return;
          }
          userMessage = data.message || ERROR_MESSAGES.VALIDATION_FAILED;
          break;
          
        case 401:
          userMessage = ERROR_MESSAGES.UNAUTHORIZED;
          // Redirect to login if needed
          if (typeof window !== 'undefined') {
            localStorage.removeItem('newflow_token');
            localStorage.removeItem('newflow_user');
            window.location.href = '/login';
          }
          break;
          
        case 403:
          userMessage = ERROR_MESSAGES.FORBIDDEN;
          break;
          
        case 404:
          userMessage = ERROR_MESSAGES.NOT_FOUND;
          break;
          
        case 409:
          // Duplicate detection - return the error data for special handling
          return { isDuplicate: true, data: data };
          
        case 500:
          userMessage = ERROR_MESSAGES.SERVER_ERROR;
          break;
          
        default:
          userMessage = data.message || ERROR_MESSAGES.SERVER_ERROR;
      }
    } else if (error.request) {
      // Network error
      userMessage = ERROR_MESSAGES.NETWORK_ERROR;
    }
    
    // Set general error
    setErrors({ submit: userMessage });
    
    return { isDuplicate: false, message: userMessage };
  }, []);

  /**
   * Handle form validation errors
   */
  const handleValidationError = useCallback((field, message) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }));
  }, []);

  /**
   * Clear specific error
   */
  const clearError = useCallback((field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Wrapper for async operations with error handling
   */
  const withErrorHandling = useCallback(async (asyncFn, context = '') => {
    setIsLoading(true);
    clearAllErrors();
    
    try {
      const result = await asyncFn();
      return result;
    } catch (error) {
      const errorResult = handleApiError(error, context);
      throw errorResult || error;
    } finally {
      setIsLoading(false);
    }
  }, [handleApiError, clearAllErrors]);

  /**
   * Handle duplicate detection specifically
   */
  const handleDuplicateError = useCallback((duplicates) => {
    if (Array.isArray(duplicates)) {
      return duplicates.map(duplicate => ({
        type: 'exact_duplicate',
        field: 'mobile',
        message: `A patient with mobile number "${duplicate.mobile}" already exists (${duplicate.name})`,
        existingPatient: {
          id: duplicate.id,
          name: duplicate.name,
          uhid: duplicate.uhid,
          mobile: duplicate.mobile,
          email: duplicate.email || '',
          isFamilyMember: false
        },
        canBeFamilyMember: true,
        isBlocking: true
      }));
    }
    return [];
  }, []);

  return {
    errors,
    isLoading,
    setErrors,
    setIsLoading,
    handleApiError,
    handleValidationError,
    clearError,
    clearAllErrors,
    withErrorHandling,
    handleDuplicateError
  };
};

export default useErrorHandler;
