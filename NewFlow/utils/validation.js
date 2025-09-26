// Comprehensive validation utilities for NewFlow forms

/**
 * Validation rules and messages
 */
export const VALIDATION_RULES = {
  // Patient validation
  PATIENT_NAME: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\u00C0-\u017F\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]+$/,
    message: 'Name must be 2-100 characters and contain only letters and spaces'
  },

  PATIENT_EMAIL: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },

  PATIENT_MOBILE: {
    required: true,
    pattern: /^[0-9]{10}$/,
    message: 'Mobile number must be exactly 10 digits'
  },

  PATIENT_AGE: {
    required: true,
    min: 0,
    max: 150,
    message: 'Age must be between 0 and 150'
  },

  PATIENT_GENDER: {
    required: true,
    enum: ['Male', 'Female', 'Other'],
    message: 'Please select a valid gender'
  },

  // Doctor validation
  DOCTOR_NAME: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s.\u00C0-\u017F\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]+$/,
    message: 'Doctor name must be 2-100 characters and contain only letters, spaces, and periods'
  },

  DOCTOR_PHONE: {
    required: true,
    pattern: /^[0-9]{10}$/,
    message: 'Phone number must be exactly 10 digits'
  },

  DOCTOR_EMAIL: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },

  DOCTOR_EXPERIENCE: {
    required: true,
    min: 0,
    max: 50,
    message: 'Experience must be between 0 and 50 years'
  },

  DOCTOR_CONSULTATION_FEE: {
    required: true,
    min: 0,
    message: 'Consultation fee must be a positive number'
  },

  DOCTOR_SPECIALIZATION: {
    required: true,
    enum: [
      'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology',
      'Gynecology', 'General Medicine', 'Surgery', 'Psychiatry', 'Radiology',
      'Anesthesiology', 'Emergency Medicine', 'Internal Medicine', 'Oncology',
      'Ophthalmology', 'ENT', 'Urology', 'Gastroenterology', 'Endocrinology',
      'Pulmonology', 'Nephrology', 'Rheumatology', 'Hematology', 'Infectious Disease'
    ],
    message: 'Please select a valid specialization'
  },

  DOCTOR_AVAILABLE_DAYS: {
    required: true,
    minLength: 1,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    message: 'Please select at least one available day'
  },

  // Visit/Appointment validation
  APPOINTMENT_DATE: {
    required: true,
    message: 'Please select an appointment date'
  },

  APPOINTMENT_TIME: {
    required: true,
    message: 'Please select an appointment time'
  },

  CHIEF_COMPLAINT: {
    required: false,
    minLength: 5,
    maxLength: 500,
    message: 'Chief complaint must be 5-500 characters'
  },

  // General validation
  REQUIRED: {
    required: true,
    message: 'This field is required'
  },

  PASSWORD: {
    required: true,
    minLength: 6,
    message: 'Password must be at least 6 characters'
  }
};

/**
 * Validates a single field against its rules
 */
export const validateField = (value, rules) => {
  if (!rules) return null;

  // Required check
  if (rules.required && (!value || (Array.isArray(value) ? value.length === 0 : value.toString().trim() === ''))) {
    return rules.message || 'This field is required';
  }

  // Skip other validations if field is empty and not required
  if (!value || (Array.isArray(value) ? value.length === 0 : value.toString().trim() === '')) {
    return null;
  }

  // Handle array validation
  if (Array.isArray(value)) {
    // Min length for arrays
    if (rules.minLength && value.length < rules.minLength) {
      return rules.message || `Please select at least ${rules.minLength} option(s)`;
    }

    // Max length for arrays
    if (rules.maxLength && value.length > rules.maxLength) {
      return rules.message || `Please select at most ${rules.maxLength} option(s)`;
    }

    // Enum check for arrays (validate each item)
    if (rules.enum) {
      for (const item of value) {
        if (!rules.enum.includes(item)) {
          return rules.message || `Invalid option: ${item}. Must be one of: ${rules.enum.join(', ')}`;
        }
      }
    }

    return null;
  }

  // Handle string/number validation
  const stringValue = value.toString().trim();

  // Min length check (for strings)
  if (rules.minLength && stringValue.length < rules.minLength) {
    return rules.message || `Minimum length is ${rules.minLength} characters`;
  }

  // Max length check (for strings)
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return rules.message || `Maximum length is ${rules.maxLength} characters`;
  }

  // Pattern check
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return rules.message || 'Invalid format';
  }

  // Enum check (for single values)
  if (rules.enum && !rules.enum.includes(stringValue)) {
    return rules.message || `Must be one of: ${rules.enum.join(', ')}`;
  }

  // Min value check (for numbers)
  if (rules.min !== undefined && parseFloat(value) < rules.min) {
    return rules.message || `Minimum value is ${rules.min}`;
  }

  // Max value check (for numbers)
  if (rules.max !== undefined && parseFloat(value) > rules.max) {
    return rules.message || `Maximum value is ${rules.max}`;
  }

  return null;
};

/**
 * Validates an entire form object
 */
export const validateForm = (formData, validationSchema) => {
  const errors = {};

  for (const [fieldName, rules] of Object.entries(validationSchema)) {
    const value = formData[fieldName];
    const error = validateField(value, rules);

    if (error) {
      errors[fieldName] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Patient form validation schema
 */
export const PATIENT_VALIDATION_SCHEMA = {
  name: VALIDATION_RULES.PATIENT_NAME,
  email: VALIDATION_RULES.PATIENT_EMAIL,
  mobile: VALIDATION_RULES.PATIENT_MOBILE,
  age: VALIDATION_RULES.PATIENT_AGE,
  gender: VALIDATION_RULES.PATIENT_GENDER,
  dateOfBirth: { required: false, message: 'Date of birth is optional' },
  address: { required: false, message: 'Address is optional' },
  emergencyContact: { required: false, pattern: /^[0-9]{10}$/, message: 'Emergency contact must be exactly 10 digits if provided' }
};

/**
 * Doctor form validation schema
 */
export const DOCTOR_VALIDATION_SCHEMA = {
  name: VALIDATION_RULES.DOCTOR_NAME,
  phone: VALIDATION_RULES.DOCTOR_PHONE,
  email: VALIDATION_RULES.DOCTOR_EMAIL,
  specialization: VALIDATION_RULES.DOCTOR_SPECIALIZATION,
  qualification: VALIDATION_RULES.REQUIRED,
  experience: VALIDATION_RULES.DOCTOR_EXPERIENCE,
  consultationFee: VALIDATION_RULES.DOCTOR_CONSULTATION_FEE,
  availableDays: VALIDATION_RULES.DOCTOR_AVAILABLE_DAYS,
  password: VALIDATION_RULES.PASSWORD
};

/**
 * Visit/Appointment form validation schema
 */
export const VISIT_VALIDATION_SCHEMA = {
  appointmentDate: VALIDATION_RULES.APPOINTMENT_DATE,
  appointmentTime: VALIDATION_RULES.APPOINTMENT_TIME,
  chiefComplaint: VALIDATION_RULES.CHIEF_COMPLAINT,
  patientId: VALIDATION_RULES.REQUIRED,
  doctorId: { required: false, message: 'Doctor selection is optional' }
};

/**
 * Login form validation schema
 */
export const LOGIN_VALIDATION_SCHEMA = {
  loginField: VALIDATION_RULES.REQUIRED,
  password: VALIDATION_RULES.PASSWORD,
  tenantId: VALIDATION_RULES.REQUIRED
};

/**
 * Sanitizes input data
 */
export const sanitizeInput = (value) => {
  if (typeof value === 'string') {
    return value.trim();
  }
  return value;
};

/**
 * Sanitizes form data
 */
export const sanitizeFormData = (formData) => {
  const sanitized = {};

  for (const [key, value] of Object.entries(formData)) {
    sanitized[key] = sanitizeInput(value);
  }

  return sanitized;
};

/**
 * Validates and sanitizes form data
 */
export const validateAndSanitize = (formData, validationSchema) => {
  const sanitizedData = sanitizeFormData(formData);
  const validation = validateForm(sanitizedData, validationSchema);

  return {
    ...validation,
    data: sanitizedData
  };
};

export default {
  VALIDATION_RULES,
  validateField,
  validateForm,
  validateAndSanitize,
  sanitizeInput,
  sanitizeFormData,
  PATIENT_VALIDATION_SCHEMA,
  DOCTOR_VALIDATION_SCHEMA,
  VISIT_VALIDATION_SCHEMA,
  LOGIN_VALIDATION_SCHEMA
};
