import { useState, useCallback, useMemo } from 'react';

// Interface segregation for form validation
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

interface FormField {
  value: any;
  error?: string;
  touched: boolean;
  isValid: boolean;
}

interface FormState {
  [fieldName: string]: FormField;
}

interface FormOptions {
  initialValues?: Record<string, any>;
  validationRules?: ValidationRules;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  onError?: (errors: Record<string, string>) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
}

interface FormReturn {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  handleChange: (field: string, value: any) => void;
  handleBlur: (field: string) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (field: string, value: any) => void;
  setFieldError: (field: string, error: string) => void;
  resetForm: () => void;
  validateField: (field: string) => string | undefined;
  validateForm: () => Record<string, string>;
}

/**
 * Enhanced Form Hook with Validation and State Management
 * 
 * Features:
 * - Comprehensive validation system
 * - Field-level and form-level validation
 * - Error handling and state management
 * - Performance optimization with useMemo and useCallback
 * - Type safety with TypeScript
 * 
 * @param options - Form configuration options
 * @returns Form state and handlers
 */
export const useForm = (options: FormOptions = {}): FormReturn => {
  const {
    initialValues = {},
    validationRules = {},
    onSubmit,
    onError,
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
  } = options;

  // Initialize form state
  const [formState, setFormState] = useState<FormState>(() => {
    const state: FormState = {};
    Object.keys(initialValues).forEach(field => {
      state[field] = {
        value: initialValues[field],
        error: undefined,
        touched: false,
        isValid: true,
      };
    });
    return state;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized values for performance
  const values = useMemo(() => {
    const result: Record<string, any> = {};
    Object.keys(formState).forEach(field => {
      result[field] = formState[field].value;
    });
    return result;
  }, [formState]);

  const errors = useMemo(() => {
    const result: Record<string, string> = {};
    Object.keys(formState).forEach(field => {
      if (formState[field].error) {
        result[field] = formState[field].error;
      }
    });
    return result;
  }, [formState]);

  const touched = useMemo(() => {
    const result: Record<string, boolean> = {};
    Object.keys(formState).forEach(field => {
      result[field] = formState[field].touched;
    });
    return result;
  }, [formState]);

  const isValid = useMemo(() => {
    return Object.keys(formState).every(field => formState[field].isValid);
  }, [formState]);

  // Validation function
  const validateField = useCallback((field: string, value: any): string | undefined => {
    const rules = validationRules[field];
    if (!rules) return undefined;

    // Required validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      return `${field} is required`;
    }

    if (!value || value.toString().trim() === '') {
      return undefined; // Skip other validations if empty and not required
    }

    // Min length validation
    if (rules.minLength && value.toString().length < rules.minLength) {
      return `${field} must be at least ${rules.minLength} characters`;
    }

    // Max length validation
    if (rules.maxLength && value.toString().length > rules.maxLength) {
      return `${field} must be no more than ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value.toString())) {
      return `${field} format is invalid`;
    }

    // Custom validation
    if (rules.custom) {
      const result = rules.custom(value);
      if (typeof result === 'string') {
        return result;
      }
      if (!result) {
        return `${field} is invalid`;
      }
    }

    return undefined;
  }, [validationRules]);

  // Update form state
  const updateFieldState = useCallback((field: string, updates: Partial<FormField>) => {
    setFormState(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        ...updates,
      },
    }));
  }, []);

  // Handle field change
  const handleChange = useCallback((field: string, value: any) => {
    const error = validateOnChange ? validateField(field, value) : undefined;
    const isValid = !error;

    updateFieldState(field, {
      value,
      error,
      isValid,
    });
  }, [validateOnChange, validateField, updateFieldState]);

  // Handle field blur
  const handleBlur = useCallback((field: string) => {
    const fieldState = formState[field];
    if (!fieldState) return;

    const error = validateOnBlur ? validateField(field, fieldState.value) : fieldState.error;
    const isValid = !error;

    updateFieldState(field, {
      touched: true,
      error,
      isValid,
    });
  }, [validateOnBlur, validateField, updateFieldState, formState]);

  // Validate entire form
  const validateForm = useCallback((): Record<string, string> => {
    const formErrors: Record<string, string> = {};
    
    Object.keys(formState).forEach(field => {
      const error = validateField(field, formState[field].value);
      if (error) {
        formErrors[field] = error;
        updateFieldState(field, {
          error,
          isValid: false,
          touched: true,
        });
      }
    });

    return formErrors;
  }, [formState, validateField, updateFieldState]);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setIsSubmitting(true);

    try {
      // Validate form if required
      if (validateOnSubmit) {
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
          onError?.(formErrors);
          return;
        }
      }

      // Call onSubmit if provided
      if (onSubmit) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      onError?.({ form: 'An error occurred during submission' });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateOnSubmit, validateForm, onSubmit, values, onError]);

  // Set field value
  const setFieldValue = useCallback((field: string, value: any) => {
    handleChange(field, value);
  }, [handleChange]);

  // Set field error
  const setFieldError = useCallback((field: string, error: string) => {
    updateFieldState(field, {
      error,
      isValid: false,
    });
  }, [updateFieldState]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormState(() => {
      const state: FormState = {};
      Object.keys(initialValues).forEach(field => {
        state[field] = {
          value: initialValues[field],
          error: undefined,
          touched: false,
          isValid: true,
        };
      });
      return state;
    });
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
    validateField,
    validateForm,
  };
};

// Export validation helpers
export const validationHelpers = {
  required: (message?: string) => ({
    required: true,
    custom: (value: any) => {
      if (!value || value.toString().trim() === '') {
        return message || 'This field is required';
      }
      return true;
    },
  }),

  email: () => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: any) => {
      if (!value) return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Invalid email format';
    },
  }),

  phone: (strategy: string = 'US') => ({
    custom: (value: any) => {
      if (!value) return true;
      // Import here to avoid circular dependency
      const { isValidPhoneNumber } = require('../utils/phoneUtils');
      return isValidPhoneNumber(value, strategy) || `Invalid ${strategy} phone number`;
    },
  }),

  minLength: (length: number) => ({
    minLength: length,
  }),

  maxLength: (length: number) => ({
    maxLength: length,
  }),

  pattern: (regex: RegExp, message?: string) => ({
    pattern: regex,
    custom: (value: any) => {
      if (!value) return true;
      return regex.test(value) || (message || 'Invalid format');
    },
  }),
};
