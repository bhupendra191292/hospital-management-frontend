import React, { useState, useEffect } from 'react';
import { createNewFlowDoctor } from '../../services/api';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import Button from './Button';
import Modal from './Modal';
import './AddDoctorModal.css';

const AddDoctorModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: 'TempPass' + Math.floor(Math.random() * 1000),
    specialization: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    availableDays: [],
    status: 'active'
  });

  const { errors, isLoading, setErrors, setIsLoading, handleApiError, clearAllErrors } = useErrorHandler();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        phone: '',
        email: '',
        password: 'TempPass' + Math.floor(Math.random() * 1000),
        specialization: '',
        qualification: '',
        experience: '',
        consultationFee: '',
        availableDays: [],
        status: 'active'
      });
      setErrors({});
    }
  }, [isOpen]);

  // Available specializations (must match backend enum)
  const specializations = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology',
    'Gynecology', 'General Medicine', 'Surgery', 'Psychiatry', 'Radiology',
    'Anesthesiology', 'Emergency Medicine', 'Internal Medicine', 'Oncology',
    'Ophthalmology', 'ENT', 'Urology', 'Gastroenterology', 'Endocrinology',
    'Pulmonology', 'Nephrology', 'Rheumatology', 'Hematology', 'Infectious Disease'
  ];

  // Available days
  const days = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Doctor name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Clean phone number (remove spaces, dashes, parentheses, country codes)
      const cleanPhone = formData.phone.replace(/[\s\-\(\)\+]/g, '');
      if (!/^[0-9]{10}$/.test(cleanPhone)) {
        newErrors.phone = 'Phone number must be exactly 10 digits';
      }
    }

    // Email is optional, but if provided, must be valid
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.specialization) {
      newErrors.specialization = 'Specialization is required';
    }

    if (!formData.qualification.trim()) {
      newErrors.qualification = 'Qualification is required';
    }

    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience is required';
    }

    if (!formData.consultationFee || isNaN(formData.consultationFee) || formData.consultationFee <= 0) {
      newErrors.consultationFee = 'Please enter a valid consultation fee';
    }

    if (formData.availableDays.length === 0) {
      newErrors.availableDays = 'Please select at least one available day';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    clearAllErrors();

    try {
      const doctorData = {
        ...formData,
        phone: formData.phone.replace(/[\s\-\(\)\+]/g, ''), // Clean phone number
        consultationFee: parseFloat(formData.consultationFee),
        experience: parseInt(formData.experience), // Convert to number, not string
        password: formData.password // Use the password from form data
      };

      const response = await createNewFlowDoctor(doctorData);
      
      if (response.data.success) {
        onSuccess?.(response.data.data.doctor);
        handleClose();
      } else {
        setErrors({ submit: response.data.message || 'Failed to create doctor' });
      }
    } catch (error) {
      handleApiError(error, 'AddDoctorModal.handleSubmit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: 'TempPass' + Math.floor(Math.random() * 1000),
      specialization: '',
      qualification: '',
      experience: '',
      consultationFee: '',
      availableDays: [],
      status: 'active'
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="add-doctor-modal">
      <div className="modal-content-container">
        <div className="modal-header">
          <h2>➕ Add New Doctor</h2>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-doctor-form">
          <div className="modal-body">
            <div className="form-grid">
              {/* Doctor Name */}
              <div className="form-group">
                <label htmlFor="name">Doctor Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter doctor's full name"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="9876543210"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">Email Address (Optional)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="doctor@hospital.com"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password">Temporary Password *</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    id="password"
                    name="password"
                    value={formData.password || 'TempPass' + Math.floor(Math.random() * 1000)}
                    onChange={handleInputChange}
                    placeholder="Temporary password"
                    className={errors.password ? 'error' : ''}
                    readOnly
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newPassword = 'TempPass' + Math.floor(Math.random() * 1000);
                      setFormData(prev => ({ ...prev, password: newPassword }));
                    }}
                    style={{ padding: '8px 12px', fontSize: '12px' }}
                  >
                    🎲 Generate
                  </button>
                </div>
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Doctor can change this password after first login
                </small>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              {/* Specialization */}
              <div className="form-group">
                <label htmlFor="specialization">Specialization *</label>
                <select
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className={errors.specialization ? 'error' : ''}
                >
                  <option value="">Select specialization</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                {errors.specialization && <span className="error-message">{errors.specialization}</span>}
              </div>

              {/* Qualification */}
              <div className="form-group">
                <label htmlFor="qualification">Qualification *</label>
                <input
                  type="text"
                  id="qualification"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  placeholder="MBBS, MD Medicine"
                  className={errors.qualification ? 'error' : ''}
                />
                {errors.qualification && <span className="error-message">{errors.qualification}</span>}
              </div>

              {/* Experience */}
              <div className="form-group">
                <label htmlFor="experience">Experience (Years) *</label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="5"
                  min="0"
                  max="50"
                  className={errors.experience ? 'error' : ''}
                />
                {errors.experience && <span className="error-message">{errors.experience}</span>}
              </div>

              {/* Consultation Fee */}
              <div className="form-group">
                <label htmlFor="consultationFee">Consultation Fee (₹) *</label>
                <input
                  type="number"
                  id="consultationFee"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleInputChange}
                  placeholder="1500"
                  min="0"
                  className={errors.consultationFee ? 'error' : ''}
                />
                {errors.consultationFee && <span className="error-message">{errors.consultationFee}</span>}
              </div>

              {/* Status */}
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Available Days */}
            <div className="form-group full-width">
              <label>Available Days *</label>
              <div className="days-grid">
                {days.map(day => (
                  <label key={day} className="day-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.availableDays.includes(day)}
                      onChange={() => handleDayToggle(day)}
                    />
                    <span className="day-label">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                  </label>
                ))}
              </div>
              {errors.availableDays && <span className="error-message">{errors.availableDays}</span>}
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="error-message submit-error">
                {errors.submit}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="modal-footer">
            <div className="modal-footer-actions">
              <Button
                type="button"
                variant="default"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Doctor'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddDoctorModal;
