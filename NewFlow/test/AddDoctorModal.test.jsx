import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import AddDoctorModal from '../components/ui/AddDoctorModal';
import {
  renderWithProviders,
  mockApiFunctions,
  testUtils,
  testData,
  mockApiResponses,
  mockErrors
} from './testUtils';

// Mock the API functions
jest.mock('../../services/api', () => mockApiFunctions);

describe('AddDoctorModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn()
  };

  describe('Modal Rendering', () => {
    it('renders the modal when open', () => {
      renderWithProviders(<AddDoctorModal {...defaultProps} />);

      expect(screen.getByText('➕ Add New Doctor')).toBeInTheDocument();
      expect(screen.getByLabelText(/doctor name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/specialization/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/qualification/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/experience/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/consultation fee/i)).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      renderWithProviders(<AddDoctorModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('➕ Add New Doctor')).not.toBeInTheDocument();
    });

    it('has close button', () => {
      renderWithProviders(<AddDoctorModal {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /×/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty required fields', async () => {
      renderWithProviders(<AddDoctorModal {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /create doctor/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/doctor name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
        expect(screen.getByText(/specialization is required/i)).toBeInTheDocument();
        expect(screen.getByText(/qualification is required/i)).toBeInTheDocument();
        expect(screen.getByText(/experience is required/i)).toBeInTheDocument();
        expect(screen.getByText(/consultation fee is required/i)).toBeInTheDocument();
        expect(screen.getByText(/please select at least one available day/i)).toBeInTheDocument();
      });
    });

    it('validates phone number format', async () => {
      renderWithProviders(<AddDoctorModal {...defaultProps} />);

      const phoneField = screen.getByLabelText(/phone number/i);
      fireEvent.change(phoneField, { target: { value: '123' } });
      fireEvent.blur(phoneField);

      await waitFor(() => {
        expect(screen.getByText(/phone number must be exactly 10 digits/i)).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      renderWithProviders(<AddDoctorModal {...defaultProps} />);

      const emailField = screen.getByLabelText(/email/i);
      fireEvent.change(emailField, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailField);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('validates experience range', async () => {
      renderWithProviders(<AddDoctorModal {...defaultProps} />);

      const experienceField = screen.getByLabelText(/experience/i);
      fireEvent.change(experienceField, { target: { value: '100' } });
      fireEvent.blur(experienceField);

      await waitFor(() => {
        expect(screen.getByText(/experience must be between 0 and 50 years/i)).toBeInTheDocument();
      });
    });

    it('validates consultation fee', async () => {
      renderWithProviders(<AddDoctorModal {...defaultProps} />);

      const feeField = screen.getByLabelText(/consultation fee/i);
      fireEvent.change(feeField, { target: { value: '-100' } });
      fireEvent.blur(feeField);

      await waitFor(() => {
        expect(screen.getByText(/consultation fee must be a positive number/i)).toBeInTheDocument();
      });
    });

    it('clears validation errors when user starts typing', async () => {
      renderWithProviders(<AddDoctorModal {...defaultProps} />);

      const nameField = screen.getByLabelText(/doctor name/i);
      fireEvent.change(nameField, { target: { value: '' } });
      fireEvent.blur(nameField);

      await waitFor(() => {
        expect(screen.getByText(/doctor name is required/i)).toBeInTheDocument();
      });

      fireEvent.change(nameField, { target: { value: 'Dr. John Doe' } });

      await waitFor(() => {
        expect(screen.queryByText(/doctor name is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits valid form data', async () => {
      mockApiFunctions.createNewFlowDoctor.mockResolvedValue(
        mockApiResponses.success({ doctor: testData.validDoctor })
      );

      renderWithProviders(<AddDoctorModal {...defaultProps} />);

      // Fill form with valid data
      testUtils.fillField('Doctor Name', testData.validDoctor.name);
      testUtils.fillField('Phone Number', testData.validDoctor.phone);
      testUtils.fillField('Email', testData.validDoctor.email);
      testUtils.selectOption('Specialization', testData.validDoctor.specialization);
      testUtils.fillField('Qualification', testData.validDoctor.qualification);
      testUtils.fillField('Experience', testData.validDoctor.experience.toString());
      testUtils.fillField('Consultation Fee', testData.validDoctor.consultationFee.toString());

      // Select available days
      const mondayCheckbox = screen.getByLabelText(/monday/i);
      const tuesdayCheckbox = screen.getByLabelText(/tuesday/i);
      fireEvent.click(mondayCheckbox);
      fireEvent.click(tuesdayCheckbox);

      const submitButton = screen.getByRole('button', { name: /create doctor/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApiFunctions.createNewFlowDoctor).toHaveBeenCalledWith(
          expect.objectContaining({
            name: testData.validDoctor.name,
            phone: testData.validDoctor.phone,
            email: testData.validDoctor.email,
            specialization: testData.validDoctor.specialization,
            qualification: testData.validDoctor.qualification,
            experience: testData.validDoctor.experience,
            consultationFee: testData.validDoctor.consultationFee,
            availableDays: ['Monday', 'Tuesday']
          })
        );
      });
    });

    it('calls onSuccess callback after successful creation', async () => {
      const onSuccess = jest.fn();
      mockApiFunctions.createNewFlowDoctor.mockResolvedValue(
        mockApiResponses.success({ doctor: testData.validDoctor })
      );

      renderWithProviders(<AddDoctorModal {...defaultProps} onSuccess={onSuccess} />);

      // Fill form with valid data
      testUtils.fillField('Doctor Name', testData.validDoctor.name);
      testUtils.fillField('Phone Number', testData.validDoctor.phone);
      testUtils.selectOption('Specialization', testData.validDoctor.specialization);
      testUtils.fillField('Qualification', testData.validDoctor.qualification);
      testUtils.fillField('Experience', testData.validDoctor.experience.toString());
      testUtils.fillField('Consultation Fee', testData.validDoctor.consultationFee.toString());

      // Select available days
      const mondayCheckbox = screen.getByLabelText(/monday/i);
      fireEvent.click(mondayCheckbox);

      const submitButton = screen.getByRole('button', { name: /create doctor/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(testData.validDoctor);
      });
    });

    it('handles API errors gracefully', async () => {
      mockApiFunctions.createNewFlowDoctor.mockRejectedValue(mockErrors.serverError);

      renderWithProviders(<AddDoctorModal {...defaultProps} />);

      // Fill form with valid data
      testUtils.fillField('Doctor Name', testData.validDoctor.name);
      testUtils.fillField('Phone Number', testData.validDoctor.phone);
      testUtils.selectOption('Specialization', testData.validDoctor.specialization);
      testUtils.fillField('Qualification', testData.validDoctor.qualification);
      testUtils.fillField('Experience', testData.validDoctor.experience.toString());
      testUtils.fillField('Consultation Fee', testData.validDoctor.consultationFee.toString());

      // Select available days
      const mondayCheckbox = screen.getByLabelText(/monday/i);
      fireEvent.click(mondayCheckbox);

      const submitButton = screen.getByRole('button', { name: /create doctor/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to create doctor/i)).toBeInTheDocument();
      });
    });

    it('shows loading state during submission', async () => {
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockApiFunctions.createNewFlowDoctor.mockReturnValue(promise);

      renderWithProviders(<AddDoctorModal {...defaultProps} />);

      // Fill form with valid data
      testUtils.fillField('Doctor Name', testData.validDoctor.name);
      testUtils.fillField('Phone Number', testData.validDoctor.phone);
      testUtils.selectOption('Specialization', testData.validDoctor.specialization);
      testUtils.fillField('Qualification', testData.validDoctor.qualification);
      testUtils.fillField('Experience', testData.validDoctor.experience.toString());
      testUtils.fillField('Consultation Fee', testData.validDoctor.consultationFee.toString());

      // Select available days
      const mondayCheckbox = screen.getByLabelText(/monday/i);
      fireEvent.click(mondayCheckbox);

      const submitButton = screen.getByRole('button', { name: /create doctor/i });
      fireEvent.click(submitButton);

      // Should show loading state
      expect(screen.getByText(/creating.../i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Resolve the promise
      resolvePromise(mockApiResponses.success({ doctor: testData.validDoctor }));

      await waitFor(() => {
        expect(screen.queryByText(/creating.../i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Interactions', () => {
    it('closes modal when cancel button is clicked', () => {
      const onClose = jest.fn();
      renderWithProviders(<AddDoctorModal {...defaultProps} onClose={onClose} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('closes modal when close button is clicked', () => {
      const onClose = jest.fn();
      renderWithProviders(<AddDoctorModal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByRole('button', { name: /×/i });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('resets form when closed', () => {
      const onClose = jest.fn();
      renderWithProviders(<AddDoctorModal {...defaultProps} onClose={onClose} />);

      // Fill some data
      testUtils.fillField('Doctor Name', 'Dr. John Doe');
      testUtils.fillField('Phone Number', '9876543210');

      // Close modal
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      // Reopen modal
      renderWithProviders(<AddDoctorModal {...defaultProps} isOpen={true} />);

      // Form should be reset
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    it('generates temporary password on form open', () => {
      renderWithProviders(<AddDoctorModal {...defaultProps} />);

      // Password field should be populated with generated password
      const passwordField = screen.getByDisplayValue(/TempPass/);
      expect(passwordField).toBeInTheDocument();
    });

    it('allows generating new temporary password', () => {
      renderWithProviders(<AddDoctorModal {...defaultProps} />);

      const generateButton = screen.getByRole('button', { name: /generate/i });
      const passwordField = screen.getByDisplayValue(/TempPass/);
      const initialPassword = passwordField.value;

      fireEvent.click(generateButton);

      // Password should be different
      expect(passwordField.value).not.toBe(initialPassword);
      expect(passwordField.value).toMatch(/TempPass/);
    });
  });

  describe('Available Days Selection', () => {
    it('allows selecting multiple days', () => {
      renderWithProviders(<AddDoctorModal {...defaultProps} />);

      const mondayCheckbox = screen.getByLabelText(/monday/i);
      const tuesdayCheckbox = screen.getByLabelText(/tuesday/i);
      const wednesdayCheckbox = screen.getByLabelText(/wednesday/i);

      fireEvent.click(mondayCheckbox);
      fireEvent.click(tuesdayCheckbox);
      fireEvent.click(wednesdayCheckbox);

      expect(mondayCheckbox).toBeChecked();
      expect(tuesdayCheckbox).toBeChecked();
      expect(wednesdayCheckbox).toBeChecked();
    });

    it('allows deselecting days', () => {
      renderWithProviders(<AddDoctorModal {...defaultProps} />);

      const mondayCheckbox = screen.getByLabelText(/monday/i);

      // Select
      fireEvent.click(mondayCheckbox);
      expect(mondayCheckbox).toBeChecked();

      // Deselect
      fireEvent.click(mondayCheckbox);
      expect(mondayCheckbox).not.toBeChecked();
    });

    it('shows validation error when no days are selected', async () => {
      renderWithProviders(<AddDoctorModal {...defaultProps} />);

      // Fill other required fields
      testUtils.fillField('Doctor Name', testData.validDoctor.name);
      testUtils.fillField('Phone Number', testData.validDoctor.phone);
      testUtils.selectOption('Specialization', testData.validDoctor.specialization);
      testUtils.fillField('Qualification', testData.validDoctor.qualification);
      testUtils.fillField('Experience', testData.validDoctor.experience.toString());
      testUtils.fillField('Consultation Fee', testData.validDoctor.consultationFee.toString());

      const submitButton = screen.getByRole('button', { name: /create doctor/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please select at least one available day/i)).toBeInTheDocument();
      });
    });
  });

  describe('Specialization Options', () => {
    it('shows all available specializations', () => {
      renderWithProviders(<AddDoctorModal {...defaultProps} />);

      const specializationSelect = screen.getByLabelText(/specialization/i);
      fireEvent.click(specializationSelect);

      // Check for some key specializations
      expect(screen.getByText('Cardiology')).toBeInTheDocument();
      expect(screen.getByText('Neurology')).toBeInTheDocument();
      expect(screen.getByText('Orthopedics')).toBeInTheDocument();
      expect(screen.getByText('Pediatrics')).toBeInTheDocument();
      expect(screen.getByText('General Medicine')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for all form fields', () => {
      renderWithProviders(<AddDoctorModal {...defaultProps} />);

      expect(screen.getByLabelText(/doctor name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/specialization/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/qualification/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/experience/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/consultation fee/i)).toBeInTheDocument();
    });

    it('has proper error associations', async () => {
      renderWithProviders(<AddDoctorModal {...defaultProps} />);

      const nameField = screen.getByLabelText(/doctor name/i);
      fireEvent.change(nameField, { target: { value: '' } });
      fireEvent.blur(nameField);

      await waitFor(() => {
        const errorMessage = screen.getByText(/doctor name is required/i);
        expect(errorMessage).toBeInTheDocument();
        expect(nameField).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});
