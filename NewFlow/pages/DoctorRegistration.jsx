import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNewFlowDoctor } from '../services/api';
import { Button } from '../components/ui';
import './DoctorRegistration.css';

const DoctorRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialization: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    availableDays: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const specializations = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology',
    'Gynecology', 'General Medicine', 'Surgery', 'Psychiatry', 'Radiology',
    'Anesthesiology', 'Emergency Medicine', 'Internal Medicine', 'Oncology',
    'Ophthalmology', 'ENT', 'Urology', 'Gastroenterology', 'Endocrinology',
    'Pulmonology', 'Nephrology', 'Rheumatology', 'Hematology', 'Infectious Disease'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

  const handleDayChange = (day) => {
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
      newErrors.name = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.specialization) {
      newErrors.specialization = 'Specialization is required';
    }

    if (!formData.qualification.trim()) {
      newErrors.qualification = 'Qualification is required';
    }

    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience is required';
    } else if (isNaN(formData.experience) || parseInt(formData.experience) < 0) {
      newErrors.experience = 'Please enter a valid experience in years';
    }

    if (!formData.consultationFee.trim()) {
      newErrors.consultationFee = 'Consultation fee is required';
    } else if (isNaN(formData.consultationFee) || parseInt(formData.consultationFee) < 0) {
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

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const doctorData = {
        name: formData.name.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        email: formData.email.trim(),
        password: formData.password,
        specialization: formData.specialization,
        qualification: formData.qualification.trim(),
        experience: parseInt(formData.experience),
        consultationFee: parseInt(formData.consultationFee),
        availableDays: formData.availableDays,
        status: 'pending' // Set to pending for admin approval
      };

      const response = await createNewFlowDoctor(doctorData);

      if (response.data.success) {
        // Show success message and redirect
        alert('Registration successful! Your account is pending admin approval. You will receive an email once approved.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError(
        error.response?.data?.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="doctor-registration-page">
      <div className="registration-container">
        <div className="registration-header">
          <h1>👨‍⚕️ Doctor Registration</h1>
          <p>Join our medical team and start serving patients</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-section">
            <h3>Personal Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Dr. John Smith"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="doctor@example.com"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="specialization">Specialization *</label>
                <select
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className={errors.specialization ? 'error' : ''}
                >
                  <option value="">Select Specialization</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                {errors.specialization && <span className="error-message">{errors.specialization}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Professional Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="qualification">Qualification *</label>
                <input
                  type="text"
                  id="qualification"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  placeholder="MBBS, MD"
                  className={errors.qualification ? 'error' : ''}
                />
                {errors.qualification && <span className="error-message">{errors.qualification}</span>}
              </div>

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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="consultationFee">Consultation Fee (₹) *</label>
                <input
                  type="number"
                  id="consultationFee"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleInputChange}
                  placeholder="500"
                  min="0"
                  className={errors.consultationFee ? 'error' : ''}
                />
                {errors.consultationFee && <span className="error-message">{errors.consultationFee}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Account Security</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 6 characters"
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Availability</h3>

            <div className="form-group">
              <label>Available Days *</label>
              <div className="days-grid">
                {days.map(day => (
                  <label key={day} className="day-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.availableDays.includes(day)}
                      onChange={() => handleDayChange(day)}
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
              {errors.availableDays && <span className="error-message">{errors.availableDays}</span>}
            </div>
          </div>

          {submitError && (
            <div className="submit-error">
              <span className="error-icon">⚠️</span>
              {submitError}
            </div>
          )}

          <div className="form-actions">
            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={isSubmitting}
              className="submit-button"
            >
              {isSubmitting ? 'Registering...' : 'Register as Doctor'}
            </Button>

            <Button
              type="button"
              variant="default"
              size="large"
              onClick={() => navigate('/login')}
              className="cancel-button"
            >
              Back to Login
            </Button>
          </div>
        </form>

        <div className="registration-footer">
          <p>
            Already have an account?
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="login-link"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegistration;
