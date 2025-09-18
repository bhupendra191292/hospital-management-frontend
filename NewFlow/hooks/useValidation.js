import { useState, useCallback } from 'react';
import { 
  validateForm, 
  validateField, 
  validateAndSanitize,
  PATIENT_VALIDATION_SCHEMA,
  DOCTOR_VALIDATION_SCHEMA,
  VISIT_VALIDATION_SCHEMA,
  LOGIN_VALIDATION_SCHEMA
} from '../utils/validation';

/**
 * Custom hook for form validation
 */
export const useValidation = (validationSchema) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /**
   * Validates a single field
   */
  const validateSingleField = useCallback((fieldName, value) => {
    if (!validationSchema[fieldName]) return null;
    
    return validateField(value, validationSchema[fieldName]);
  }, [validationSchema]);

  /**
   * Validates entire form
   */
  const validateFormData = useCallback((formData) => {
    return validateForm(formData, validationSchema);
  }, [validationSchema]);

  /**
   * Validates and sanitizes form data
   */
  const validateAndSanitizeForm = useCallback((formData) => {
    return validateAndSanitize(formData, validationSchema);
  }, [validationSchema]);

  /**
   * Sets field as touched
   */
  const setFieldTouched = useCallback((fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  }, []);

  /**
   * Sets multiple fields as touched
   */
  const setFieldsTouched = useCallback((fieldNames) => {
    setTouched(prev => {
      const newTouched = { ...prev };
      fieldNames.forEach(fieldName => {
        newTouched[fieldName] = true;
      });
      return newTouched;
    });
  }, []);

  /**
   * Validates field and updates errors
   */
  const validateAndSetError = useCallback((fieldName, value) => {
    const error = validateSingleField(fieldName, value);
    
    setErrors(prev => {
      if (error) {
        return { ...prev, [fieldName]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      }
    });
    
    return error;
  }, [validateSingleField]);

  /**
   * Validates entire form and updates errors
   */
  const validateAndSetErrors = useCallback((formData) => {
    const validation = validateFormData(formData);
    setErrors(validation.errors);
    return validation;
  }, [validateFormData]);

  /**
   * Clears specific field error
   */
  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Clears all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  /**
   * Checks if field has error and is touched
   */
  const hasFieldError = useCallback((fieldName) => {
    return touched[fieldName] && errors[fieldName];
  }, [touched, errors]);

  /**
   * Gets field error message
   */
  const getFieldError = useCallback((fieldName) => {
    return hasFieldError(fieldName) ? errors[fieldName] : null;
  }, [hasFieldError, errors]);

  /**
   * Checks if form is valid
   */
  const isFormValid = useCallback((formData) => {
    const validation = validateFormData(formData);
    return validation.isValid;
  }, [validateFormData]);

  /**
   * Handles field blur event
   */
  const handleFieldBlur = useCallback((fieldName, value) => {
    setFieldTouched(fieldName);
    validateAndSetError(fieldName, value);
  }, [setFieldTouched, validateAndSetError]);

  /**
   * Handles field change event
   */
  const handleFieldChange = useCallback((fieldName, value) => {
    // Clear error when user starts typing
    if (errors[fieldName]) {
      clearFieldError(fieldName);
    }
  }, [errors, clearFieldError]);

  return {
    errors,
    touched,
    setErrors,
    setTouched,
    validateSingleField,
    validateFormData,
    validateAndSanitizeForm,
    validateAndSetError,
    validateAndSetErrors,
    setFieldTouched,
    setFieldsTouched,
    clearFieldError,
    clearAllErrors,
    hasFieldError,
    getFieldError,
    isFormValid,
    handleFieldBlur,
    handleFieldChange
  };
};

/**
 * Pre-configured validation hooks for common forms
 */
export const usePatientValidation = () => useValidation(PATIENT_VALIDATION_SCHEMA);
export const useDoctorValidation = () => useValidation(DOCTOR_VALIDATION_SCHEMA);
export const useVisitValidation = () => useValidation(VISIT_VALIDATION_SCHEMA);
export const useLoginValidation = () => useValidation(LOGIN_VALIDATION_SCHEMA);

export default useValidation;
