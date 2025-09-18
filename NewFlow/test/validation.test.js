import {
  validateField,
  validateForm,
  validateAndSanitize,
  sanitizeInput,
  sanitizeFormData,
  VALIDATION_RULES,
  PATIENT_VALIDATION_SCHEMA,
  DOCTOR_VALIDATION_SCHEMA,
  VISIT_VALIDATION_SCHEMA,
  LOGIN_VALIDATION_SCHEMA
} from '../utils/validation';

describe('Validation Utilities', () => {
  describe('validateField', () => {
    it('validates required fields', () => {
      const result = validateField('', VALIDATION_RULES.PATIENT_NAME);
      expect(result).toBe('Name must be 2-100 characters and contain only letters and spaces');
    });

    it('validates minimum length', () => {
      const result = validateField('A', VALIDATION_RULES.PATIENT_NAME);
      expect(result).toBe('Name must be 2-100 characters and contain only letters and spaces');
    });

    it('validates maximum length', () => {
      const longName = 'A'.repeat(101);
      const result = validateField(longName, VALIDATION_RULES.PATIENT_NAME);
      expect(result).toBe('Name must be 2-100 characters and contain only letters and spaces');
    });

    it('validates pattern matching', () => {
      const result = validateField('John123', VALIDATION_RULES.PATIENT_NAME);
      expect(result).toBe('Name must be 2-100 characters and contain only letters and spaces');
    });

    it('validates email format', () => {
      const result = validateField('invalid-email', VALIDATION_RULES.PATIENT_EMAIL);
      expect(result).toBe('Please enter a valid email address');
    });

    it('validates mobile number format', () => {
      const result = validateField('123', VALIDATION_RULES.PATIENT_MOBILE);
      expect(result).toBe('Mobile number must be exactly 10 digits');
    });

    it('validates age range', () => {
      const result = validateField(200, VALIDATION_RULES.PATIENT_AGE);
      expect(result).toBe('Age must be between 0 and 150');
    });

    it('validates enum values', () => {
      const result = validateField('Invalid', VALIDATION_RULES.PATIENT_GENDER);
      expect(result).toBe('Please select a valid gender');
    });

    it('validates array minimum length', () => {
      const result = validateField([], VALIDATION_RULES.DOCTOR_AVAILABLE_DAYS);
      expect(result).toBe('Please select at least one available day');
    });

    it('returns null for valid values', () => {
      const result = validateField('John Doe', VALIDATION_RULES.PATIENT_NAME);
      expect(result).toBeNull();
    });

    it('skips validation for empty non-required fields', () => {
      const result = validateField('', VALIDATION_RULES.PATIENT_EMAIL);
      expect(result).toBeNull();
    });
  });

  describe('validateForm', () => {
    it('validates entire form successfully', () => {
      const formData = {
        name: 'John Doe',
        email: 'john@example.com',
        mobile: '9876543210',
        age: 30,
        gender: 'Male'
      };

      const result = validateForm(formData, PATIENT_VALIDATION_SCHEMA);
      
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('returns validation errors for invalid form', () => {
      const formData = {
        name: '',
        email: 'invalid-email',
        mobile: '123',
        age: 200,
        gender: 'Invalid'
      };

      const result = validateForm(formData, PATIENT_VALIDATION_SCHEMA);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.email).toBeDefined();
      expect(result.errors.mobile).toBeDefined();
      expect(result.errors.age).toBeDefined();
      expect(result.errors.gender).toBeDefined();
    });

    it('validates doctor form successfully', () => {
      const formData = {
        name: 'Dr. Jane Smith',
        phone: '9876543210',
        email: 'jane@example.com',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD',
        experience: 5,
        consultationFee: 500,
        availableDays: ['Monday', 'Tuesday'],
        password: 'password123'
      };

      const result = validateForm(formData, DOCTOR_VALIDATION_SCHEMA);
      
      
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('validates visit form successfully', () => {
      const formData = {
        appointmentDate: '2024-01-01',
        appointmentTime: '10:00',
        chiefComplaint: 'Chest pain and shortness of breath',
        patientId: 'patient-id',
        doctorId: 'doctor-id'
      };

      const result = validateForm(formData, VISIT_VALIDATION_SCHEMA);
      
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('validates login form successfully', () => {
      const formData = {
        loginField: '9876543210',
        password: 'password123',
        tenantId: 'test-tenant'
      };

      const result = validateForm(formData, LOGIN_VALIDATION_SCHEMA);
      
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });
  });

  describe('sanitizeInput', () => {
    it('trims string values', () => {
      const result = sanitizeInput('  John Doe  ');
      expect(result).toBe('John Doe');
    });

    it('returns non-string values as-is', () => {
      const result = sanitizeInput(123);
      expect(result).toBe(123);
    });

    it('handles null and undefined', () => {
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
    });
  });

  describe('sanitizeFormData', () => {
    it('sanitizes all string fields in form data', () => {
      const formData = {
        name: '  John Doe  ',
        email: '  john@example.com  ',
        age: 30,
        mobile: '  9876543210  '
      };

      const result = sanitizeFormData(formData);
      
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.age).toBe(30);
      expect(result.mobile).toBe('9876543210');
    });
  });

  describe('validateAndSanitize', () => {
    it('sanitizes and validates form data', () => {
      const formData = {
        name: '  John Doe  ',
        email: '  john@example.com  ',
        mobile: '  9876543210  ',
        age: 30,
        gender: 'Male'
      };

      const result = validateAndSanitize(formData, PATIENT_VALIDATION_SCHEMA);
      
      expect(result.isValid).toBe(true);
      expect(result.data.name).toBe('John Doe');
      expect(result.data.email).toBe('john@example.com');
      expect(result.data.mobile).toBe('9876543210');
    });

    it('returns validation errors with sanitized data', () => {
      const formData = {
        name: '  ',
        email: '  invalid-email  ',
        mobile: '  123  ',
        age: 200,
        gender: 'Invalid'
      };

      const result = validateAndSanitize(formData, PATIENT_VALIDATION_SCHEMA);
      
      expect(result.isValid).toBe(false);
      expect(result.data.name).toBe('');
      expect(result.data.email).toBe('invalid-email');
      expect(result.data.mobile).toBe('123');
      expect(result.errors.name).toBeDefined();
      expect(result.errors.email).toBeDefined();
      expect(result.errors.mobile).toBeDefined();
    });
  });

  describe('Validation Rules', () => {
    it('has correct patient name rules', () => {
      expect(VALIDATION_RULES.PATIENT_NAME.required).toBe(true);
      expect(VALIDATION_RULES.PATIENT_NAME.minLength).toBe(2);
      expect(VALIDATION_RULES.PATIENT_NAME.maxLength).toBe(100);
      expect(VALIDATION_RULES.PATIENT_NAME.pattern).toBeInstanceOf(RegExp);
    });

    it('has correct patient email rules', () => {
      expect(VALIDATION_RULES.PATIENT_EMAIL.required).toBe(false);
      expect(VALIDATION_RULES.PATIENT_EMAIL.pattern).toBeInstanceOf(RegExp);
    });

    it('has correct patient mobile rules', () => {
      expect(VALIDATION_RULES.PATIENT_MOBILE.required).toBe(true);
      expect(VALIDATION_RULES.PATIENT_MOBILE.pattern).toBeInstanceOf(RegExp);
    });

    it('has correct patient age rules', () => {
      expect(VALIDATION_RULES.PATIENT_AGE.required).toBe(true);
      expect(VALIDATION_RULES.PATIENT_AGE.min).toBe(0);
      expect(VALIDATION_RULES.PATIENT_AGE.max).toBe(150);
    });

    it('has correct patient gender rules', () => {
      expect(VALIDATION_RULES.PATIENT_GENDER.required).toBe(true);
      expect(VALIDATION_RULES.PATIENT_GENDER.enum).toEqual(['Male', 'Female', 'Other']);
    });

    it('has correct doctor phone rules', () => {
      expect(VALIDATION_RULES.DOCTOR_PHONE.required).toBe(true);
      expect(VALIDATION_RULES.DOCTOR_PHONE.pattern).toBeInstanceOf(RegExp);
    });

    it('has correct doctor experience rules', () => {
      expect(VALIDATION_RULES.DOCTOR_EXPERIENCE.required).toBe(true);
      expect(VALIDATION_RULES.DOCTOR_EXPERIENCE.min).toBe(0);
      expect(VALIDATION_RULES.DOCTOR_EXPERIENCE.max).toBe(50);
    });

    it('has correct doctor consultation fee rules', () => {
      expect(VALIDATION_RULES.DOCTOR_CONSULTATION_FEE.required).toBe(true);
      expect(VALIDATION_RULES.DOCTOR_CONSULTATION_FEE.min).toBe(0);
    });

    it('has correct doctor specialization rules', () => {
      expect(VALIDATION_RULES.DOCTOR_SPECIALIZATION.required).toBe(true);
      expect(VALIDATION_RULES.DOCTOR_SPECIALIZATION.enum).toContain('Cardiology');
      expect(VALIDATION_RULES.DOCTOR_SPECIALIZATION.enum).toContain('General Medicine');
    });

    it('has correct doctor available days rules', () => {
      expect(VALIDATION_RULES.DOCTOR_AVAILABLE_DAYS.required).toBe(true);
      expect(VALIDATION_RULES.DOCTOR_AVAILABLE_DAYS.minLength).toBe(1);
      expect(VALIDATION_RULES.DOCTOR_AVAILABLE_DAYS.enum).toEqual([
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
      ]);
    });
  });

  describe('Validation Schemas', () => {
    it('has correct patient validation schema', () => {
      expect(PATIENT_VALIDATION_SCHEMA.name).toBe(VALIDATION_RULES.PATIENT_NAME);
      expect(PATIENT_VALIDATION_SCHEMA.email).toBe(VALIDATION_RULES.PATIENT_EMAIL);
      expect(PATIENT_VALIDATION_SCHEMA.mobile).toBe(VALIDATION_RULES.PATIENT_MOBILE);
      expect(PATIENT_VALIDATION_SCHEMA.age).toBe(VALIDATION_RULES.PATIENT_AGE);
      expect(PATIENT_VALIDATION_SCHEMA.gender).toBe(VALIDATION_RULES.PATIENT_GENDER);
    });

    it('has correct doctor validation schema', () => {
      expect(DOCTOR_VALIDATION_SCHEMA.name).toBe(VALIDATION_RULES.DOCTOR_NAME);
      expect(DOCTOR_VALIDATION_SCHEMA.phone).toBe(VALIDATION_RULES.DOCTOR_PHONE);
      expect(DOCTOR_VALIDATION_SCHEMA.email).toBe(VALIDATION_RULES.DOCTOR_EMAIL);
      expect(DOCTOR_VALIDATION_SCHEMA.specialization).toBe(VALIDATION_RULES.DOCTOR_SPECIALIZATION);
      expect(DOCTOR_VALIDATION_SCHEMA.experience).toBe(VALIDATION_RULES.DOCTOR_EXPERIENCE);
      expect(DOCTOR_VALIDATION_SCHEMA.consultationFee).toBe(VALIDATION_RULES.DOCTOR_CONSULTATION_FEE);
      expect(DOCTOR_VALIDATION_SCHEMA.availableDays).toBe(VALIDATION_RULES.DOCTOR_AVAILABLE_DAYS);
    });

    it('has correct visit validation schema', () => {
      expect(VISIT_VALIDATION_SCHEMA.appointmentDate).toBe(VALIDATION_RULES.APPOINTMENT_DATE);
      expect(VISIT_VALIDATION_SCHEMA.appointmentTime).toBe(VALIDATION_RULES.APPOINTMENT_TIME);
      expect(VISIT_VALIDATION_SCHEMA.chiefComplaint).toBe(VALIDATION_RULES.CHIEF_COMPLAINT);
      expect(VISIT_VALIDATION_SCHEMA.patientId).toBe(VALIDATION_RULES.REQUIRED);
      expect(VISIT_VALIDATION_SCHEMA.doctorId.required).toBe(false);
      expect(VISIT_VALIDATION_SCHEMA.doctorId.message).toBe('Doctor selection is optional');
    });

    it('has correct login validation schema', () => {
      expect(LOGIN_VALIDATION_SCHEMA.loginField).toBe(VALIDATION_RULES.REQUIRED);
      expect(LOGIN_VALIDATION_SCHEMA.password).toBe(VALIDATION_RULES.PASSWORD);
      expect(LOGIN_VALIDATION_SCHEMA.tenantId).toBe(VALIDATION_RULES.REQUIRED);
    });
  });
});
