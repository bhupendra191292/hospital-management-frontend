import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import PatientRegistrationForm from '../components/ui/PatientRegistrationForm';
import { 
  renderWithProviders, 
  mockApiFunctions, 
  testUtils, 
  testData, 
  mockApiResponses,
  mockErrors,
  setupLocalStorageMock
} from './testUtils';

// Mock the API functions
jest.mock('../../services/api', () => mockApiFunctions);

describe('PatientRegistrationForm', () => {
  beforeEach(() => {
    setupLocalStorageMock();
    jest.clearAllMocks();
  });

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    existingPatients: []
  };

  describe('Form Rendering', () => {
    it('renders the form when open', () => {
      renderWithProviders(<PatientRegistrationForm {...defaultProps} />);
      
      expect(screen.getByText('📋 Personal Information')).toBeInTheDocument();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      renderWithProviders(<PatientRegistrationForm {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('📋 Personal Information')).not.toBeInTheDocument();
    });

    it('renders with existing patient data when provided', () => {
      const existingPatient = testData.validPatient;
      renderWithProviders(
        <PatientRegistrationForm 
          {...defaultProps} 
          existingPatient={existingPatient}
        />
      );
      
      expect(screen.getByDisplayValue(existingPatient.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(existingPatient.email)).toBeInTheDocument();
      expect(screen.getByDisplayValue(existingPatient.mobile)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty required fields', async () => {
      renderWithProviders(<PatientRegistrationForm {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /save patient/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/mobile number is required/i)).toBeInTheDocument();
        expect(screen.getByText(/age is required/i)).toBeInTheDocument();
        expect(screen.getByText(/gender is required/i)).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      renderWithProviders(<PatientRegistrationForm {...defaultProps} />);
      
      const emailField = screen.getByLabelText(/email/i);
      fireEvent.change(emailField, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailField);
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('validates mobile number format', async () => {
      renderWithProviders(<PatientRegistrationForm {...defaultProps} />);
      
      const mobileField = screen.getByLabelText(/mobile number/i);
      fireEvent.change(mobileField, { target: { value: '123' } });
      fireEvent.blur(mobileField);
      
      await waitFor(() => {
        expect(screen.getByText(/mobile number must be exactly 10 digits/i)).toBeInTheDocument();
      });
    });

    it('validates age range', async () => {
      renderWithProviders(<PatientRegistrationForm {...defaultProps} />);
      
      const ageField = screen.getByLabelText(/age/i);
      fireEvent.change(ageField, { target: { value: '200' } });
      fireEvent.blur(ageField);
      
      await waitFor(() => {
        expect(screen.getByText(/age must be between 0 and 150/i)).toBeInTheDocument();
      });
    });

    it('clears validation errors when user starts typing', async () => {
      renderWithProviders(<PatientRegistrationForm {...defaultProps} />);
      
      const nameField = screen.getByLabelText(/full name/i);
      fireEvent.change(nameField, { target: { value: '' } });
      fireEvent.blur(nameField);
      
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
      
      fireEvent.change(nameField, { target: { value: 'John Doe' } });
      
      await waitFor(() => {
        expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits valid form data for new patient', async () => {
      mockApiFunctions.createNewFlowPatient.mockResolvedValue(
        mockApiResponses.success({ patient: testData.validPatient })
      );
      
      renderWithProviders(<PatientRegistrationForm {...defaultProps} />);
      
      // Fill form with valid data
      testUtils.fillField('Full Name', testData.validPatient.name);
      testUtils.fillField('Email', testData.validPatient.email);
      testUtils.fillField('Mobile Number', testData.validPatient.mobile);
      testUtils.fillField('Age', testData.validPatient.age.toString());
      testUtils.selectOption('Gender', testData.validPatient.gender);
      testUtils.fillField('Date of Birth', testData.validPatient.dateOfBirth);
      testUtils.fillField('Address', testData.validPatient.address);
      testUtils.fillField('Emergency Contact', testData.validPatient.emergencyContact);
      
      const submitButton = screen.getByRole('button', { name: /save patient/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockApiFunctions.createNewFlowPatient).toHaveBeenCalledWith(
          expect.objectContaining({
            name: testData.validPatient.name,
            email: testData.validPatient.email,
            mobile: testData.validPatient.mobile,
            age: testData.validPatient.age,
            gender: testData.validPatient.gender
          })
        );
      });
    });

    it('submits valid form data for existing patient update', async () => {
      const existingPatient = { ...testData.validPatient, _id: 'existing-id' };
      mockApiFunctions.updateNewFlowPatient.mockResolvedValue(
        mockApiResponses.success({ patient: existingPatient })
      );
      
      renderWithProviders(
        <PatientRegistrationForm 
          {...defaultProps} 
          existingPatient={existingPatient}
        />
      );
      
      const submitButton = screen.getByRole('button', { name: /update patient/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockApiFunctions.updateNewFlowPatient).toHaveBeenCalledWith(
          existingPatient._id,
          expect.objectContaining({
            name: existingPatient.name,
            email: existingPatient.email
          })
        );
      });
    });

    it('handles API errors gracefully', async () => {
      mockApiFunctions.createNewFlowPatient.mockRejectedValue(mockErrors.serverError);
      
      renderWithProviders(<PatientRegistrationForm {...defaultProps} />);
      
      // Fill form with valid data
      testUtils.fillField('Full Name', testData.validPatient.name);
      testUtils.fillField('Mobile Number', testData.validPatient.mobile);
      testUtils.fillField('Age', testData.validPatient.age.toString());
      testUtils.selectOption('Gender', testData.validPatient.gender);
      testUtils.fillField('Date of Birth', testData.validPatient.dateOfBirth);
      testUtils.fillField('Address', testData.validPatient.address);
      
      const submitButton = screen.getByRole('button', { name: /save patient/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to save patient/i)).toBeInTheDocument();
      });
    });

    it('handles validation errors from API', async () => {
      mockApiFunctions.createNewFlowPatient.mockRejectedValue(mockErrors.validationError);
      
      renderWithProviders(<PatientRegistrationForm {...defaultProps} />);
      
      // Fill form with valid data
      testUtils.fillField('Full Name', testData.validPatient.name);
      testUtils.fillField('Mobile Number', testData.validPatient.mobile);
      testUtils.fillField('Age', testData.validPatient.age.toString());
      testUtils.selectOption('Gender', testData.validPatient.gender);
      testUtils.fillField('Date of Birth', testData.validPatient.dateOfBirth);
      testUtils.fillField('Address', testData.validPatient.address);
      
      const submitButton = screen.getByRole('button', { name: /save patient/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });
  });

  describe('Duplicate Detection', () => {
    it('shows duplicate warning modal when duplicates are detected', async () => {
      const duplicateError = {
        response: {
          status: 409,
          data: {
            success: false,
            message: 'Duplicate patient detected',
            duplicates: [{
              id: 'duplicate-id',
              name: 'Existing Patient',
              uhid: 'DELH01-240101-0001',
              mobile: '9876543210',
              email: 'existing@example.com'
            }]
          }
        }
      };
      
      mockApiFunctions.createNewFlowPatient.mockRejectedValue(duplicateError);
      
      renderWithProviders(<PatientRegistrationForm {...defaultProps} />);
      
      // Fill form with data that will cause duplicate
      testUtils.fillField('Full Name', 'John Doe');
      testUtils.fillField('Mobile Number', '9876543210');
      testUtils.fillField('Age', '30');
      testUtils.selectOption('Gender', 'Male');
      testUtils.fillField('Date of Birth', '1993-01-01');
      testUtils.fillField('Address', '123 Test Street');
      
      const submitButton = screen.getByRole('button', { name: /save patient/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/duplicate patient detected/i)).toBeInTheDocument();
        expect(screen.getByText(/existing patient/i)).toBeInTheDocument();
      });
    });

    it('allows continuing with duplicate when user confirms', async () => {
      const duplicateError = {
        response: {
          status: 409,
          data: {
            success: false,
            message: 'Duplicate patient detected',
            duplicates: [{
              id: 'duplicate-id',
              name: 'Existing Patient',
              uhid: 'DELH01-240101-0001',
              mobile: '9876543210',
              email: 'existing@example.com'
            }]
          }
        }
      };
      
      mockApiFunctions.createNewFlowPatient
        .mockRejectedValueOnce(duplicateError)
        .mockResolvedValueOnce(mockApiResponses.success({ patient: testData.validPatient }));
      
      renderWithProviders(<PatientRegistrationForm {...defaultProps} />);
      
      // Fill form and submit
      testUtils.fillField('Full Name', 'John Doe');
      testUtils.fillField('Mobile Number', '9876543210');
      testUtils.fillField('Age', '30');
      testUtils.selectOption('Gender', 'Male');
      testUtils.fillField('Date of Birth', '1993-01-01');
      testUtils.fillField('Address', '123 Test Street');
      
      const submitButton = screen.getByRole('button', { name: /save patient/i });
      fireEvent.click(submitButton);
      
      // Wait for duplicate modal to appear
      await waitFor(() => {
        expect(screen.getByText(/duplicate patient detected/i)).toBeInTheDocument();
      });
      
      // Click continue button
      const continueButton = screen.getByRole('button', { name: /continue anyway/i });
      fireEvent.click(continueButton);
      
      // Should call API again
      await waitFor(() => {
        expect(mockApiFunctions.createNewFlowPatient).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Form Interactions', () => {
    it('closes form when cancel button is clicked', () => {
      const onClose = jest.fn();
      renderWithProviders(<PatientRegistrationForm {...defaultProps} onClose={onClose} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
      
      expect(onClose).toHaveBeenCalled();
    });

    it('resets form when closed', () => {
      const onClose = jest.fn();
      renderWithProviders(<PatientRegistrationForm {...defaultProps} onClose={onClose} />);
      
      // Fill some data
      testUtils.fillField('Full Name', 'John Doe');
      testUtils.fillField('Email', 'john@example.com');
      
      // Close form
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
      
      // Reopen form
      renderWithProviders(<PatientRegistrationForm {...defaultProps} isOpen={true} />);
      
      // Form should be reset
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    it('generates UHID when form is opened', () => {
      renderWithProviders(<PatientRegistrationForm {...defaultProps} />);
      
      // UHID field should be populated
      const uhidField = screen.getByDisplayValue(/DELH01-/);
      expect(uhidField).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for all form fields', () => {
      renderWithProviders(<PatientRegistrationForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/emergency contact/i)).toBeInTheDocument();
    });

    it('has proper error associations', async () => {
      renderWithProviders(<PatientRegistrationForm {...defaultProps} />);
      
      const nameField = screen.getByLabelText(/full name/i);
      fireEvent.change(nameField, { target: { value: '' } });
      fireEvent.blur(nameField);
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/name is required/i);
        expect(errorMessage).toBeInTheDocument();
        expect(nameField).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});
