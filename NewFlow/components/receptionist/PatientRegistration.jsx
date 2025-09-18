import React, { useState, useEffect } from 'react';
import { useRole } from '../../contexts/RoleContext';
import { generateNewFlowUHID, createNewFlowPatient } from '../../services/api';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import './PatientRegistration.css';

const PatientRegistration = ({ onPatientRegistered, onCancel }) => {
  const { can } = useRole();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    age: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    guardianName: '',
    guardianRelation: '',
    guardianMobile: '',
    emergencyContact: '',
    bloodGroup: '',
    maritalStatus: '',
    occupation: '',
    referredBy: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generatedUHID, setGeneratedUHID] = useState('');

  // Auto-calculate age when DOB changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        setFormData(prev => ({ ...prev, age: age - 1 }));
      } else {
        setFormData(prev => ({ ...prev, age: age }));
      }
    }
  }, [formData.dateOfBirth]);

  const handleChange = (e) => {
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';

    // Mobile validation
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateUHID = async () => {
    try {
      const response = await fetch('/api/newflow/patients/generate-uhid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hospitalCode: 'DELH01', // This should come from system settings
          registrationDate: new Date().toISOString().split('T')[0]
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.uhid;
      } else {
        // Fallback UHID generation
        const today = new Date();
        const dateStr = today.toISOString().slice(2, 10).replace(/-/g, '');
        const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        return `DELH01-${dateStr}-${randomNum}`;
      }
    } catch (error) {
      console.error('Error generating UHID:', error);
      // Fallback UHID generation
      const today = new Date();
      const dateStr = today.toISOString().slice(2, 10).replace(/-/g, '');
      const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      return `DELH01-${dateStr}-${randomNum}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!can('CREATE_PATIENTS')) {
      alert('You do not have permission to register patients');
      return;
    }

    setIsLoading(true);

    try {
      const uhid = await generateUHID();
      setGeneratedUHID(uhid);

      const patientData = {
        ...formData,
        uhid: uhid,
        registrationDate: new Date().toISOString(),
        status: 'active',
        isDuplicate: false,
        isPartialInfo: !formData.dateOfBirth || !formData.mobile
      };

      const response = await fetch('/api/newflow/patients/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Patient registered successfully!\nUHID: ${uhid}`);
        onPatientRegistered(result.patient);
      } else {
        const errorData = await response.json();
        alert(`Registration failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      gender: '',
      dateOfBirth: '',
      age: '',
      mobile: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      guardianName: '',
      guardianRelation: '',
      guardianMobile: '',
      emergencyContact: '',
      bloodGroup: '',
      maritalStatus: '',
      occupation: '',
      referredBy: '',
      notes: ''
    });
    setErrors({});
    setGeneratedUHID('');
  };

  return (
    <div className="patient-registration">
      <div className="registration-header">
        <h2>👤 Patient Registration</h2>
        <p>Register a new patient in the system</p>
      </div>

      <form onSubmit={handleSubmit} className="registration-form">
        {/* Personal Information */}
        <div className="form-section">
          <h3>📋 Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? 'error' : ''}
                placeholder="Enter first name"
              />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? 'error' : ''}
                placeholder="Enter last name"
              />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={errors.gender ? 'error' : ''}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <span className="error-text">{errors.gender}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth *</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={errors.dateOfBirth ? 'error' : ''}
              />
              {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Auto-calculated"
                readOnly
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mobile">Mobile Number *</label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className={errors.mobile ? 'error' : ''}
                placeholder="10-digit mobile number"
                maxLength="10"
              />
              {errors.mobile && <span className="error-text">{errors.mobile}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter email address"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="form-section">
          <h3>🏠 Address Information</h3>
          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? 'error' : ''}
              placeholder="Enter complete address"
              rows="3"
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={errors.city ? 'error' : ''}
                placeholder="Enter city"
              />
              {errors.city && <span className="error-text">{errors.city}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="state">State *</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={errors.state ? 'error' : ''}
                placeholder="Enter state"
              />
              {errors.state && <span className="error-text">{errors.state}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="pincode">Pincode *</label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className={errors.pincode ? 'error' : ''}
                placeholder="Enter pincode"
                maxLength="6"
              />
              {errors.pincode && <span className="error-text">{errors.pincode}</span>}
            </div>
          </div>
        </div>

        {/* Guardian Information */}
        <div className="form-section">
          <h3>👨‍👩‍👧‍👦 Guardian Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="guardianName">Guardian Name</label>
              <input
                type="text"
                id="guardianName"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleChange}
                placeholder="Enter guardian name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="guardianRelation">Relation</label>
              <select
                id="guardianRelation"
                name="guardianRelation"
                value={formData.guardianRelation}
                onChange={handleChange}
              >
                <option value="">Select Relation</option>
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="spouse">Spouse</option>
                <option value="son">Son</option>
                <option value="daughter">Daughter</option>
                <option value="brother">Brother</option>
                <option value="sister">Sister</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="guardianMobile">Guardian Mobile</label>
              <input
                type="tel"
                id="guardianMobile"
                name="guardianMobile"
                value={formData.guardianMobile}
                onChange={handleChange}
                placeholder="Guardian mobile number"
                maxLength="10"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="form-section">
          <h3>ℹ️ Additional Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bloodGroup">Blood Group</label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="maritalStatus">Marital Status</label>
              <select
                id="maritalStatus"
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
              >
                <option value="">Select Marital Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="occupation">Occupation</label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="Enter occupation"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="referredBy">Referred By</label>
              <input
                type="text"
                id="referredBy"
                name="referredBy"
                value={formData.referredBy}
                onChange={handleChange}
                placeholder="Doctor/Person who referred"
              />
            </div>
            <div className="form-group">
              <label htmlFor="emergencyContact">Emergency Contact</label>
              <input
                type="tel"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="Emergency contact number"
                maxLength="10"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes"
              rows="3"
            />
          </div>
        </div>

        {/* Generated UHID Display */}
        {generatedUHID && (
          <div className="uhid-display">
            <h4>🎫 Generated UHID</h4>
            <div className="uhid-number">{generatedUHID}</div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" onClick={handleReset} className="btn-secondary">
            Reset Form
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? 'Registering...' : 'Register Patient'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientRegistration;
