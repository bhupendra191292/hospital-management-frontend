import React, { useState, useEffect } from 'react';
import { createNewFlowVisit, getNewFlowDoctors } from '../../services/api';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { useVisitValidation } from '../../hooks/useValidation';
import Button from './Button';
import Modal from './Modal';
import ModalHeader from './ModalHeader';
import './VisitBookingForm.css';

const VisitBookingForm = ({ 
  isOpen, 
  onClose, 
  patient, 
  onSuccess,
  existingVisit = null 
}) => {
  const [formData, setFormData] = useState({
    patientId: patient?._id || patient?.id || '',
    visitType: 'OPD',
    chiefComplaint: '',
    symptoms: [],
    department: 'General Medicine',
    appointmentDate: '',
    appointmentTime: '',
    priority: 'Normal',
    notes: '',
    insuranceProvider: '',
    insuranceNumber: '',
    estimatedCost: '',
    doctorId: undefined, // Changed from empty string to undefined
    doctorName: ''
  });

  const { errors: apiErrors, isLoading, setErrors, setIsLoading, handleApiError, clearAllErrors } = useErrorHandler();
  const { errors: validationErrors, validateAndSetErrors, clearAllErrors: clearValidationErrors, getFieldError, handleFieldBlur, handleFieldChange } = useVisitValidation();
  const [symptomInput, setSymptomInput] = useState('');
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Available departments
  const departments = [
    'General Medicine',
    'Cardiology', 
    'Orthopedics',
    'Pediatrics',
    'Gynecology',
    'Dermatology',
    'ENT',
    'Ophthalmology',
    'Emergency',
    'Other'
  ];

  // Available visit types
  const visitTypes = [
    'OPD',
    'Emergency',
    'Follow-up',
    'Consultation',
    'Procedure'
  ];

  // Available priorities
  const priorities = [
    'Low',
    'Normal', 
    'High',
    'Emergency'
  ];

  // Time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  // Reset form when modal opens/closes or patient/existingVisit changes
  useEffect(() => {
    if (existingVisit) {
      setFormData({
        patientId: existingVisit.patientId,
        visitType: existingVisit.visitType || 'OPD',
        chiefComplaint: existingVisit.chiefComplaint || '',
        symptoms: existingVisit.symptoms || [],
        department: existingVisit.department || 'General Medicine',
        appointmentDate: existingVisit.appointmentDate ? existingVisit.appointmentDate.split('T')[0] : '',
        appointmentTime: existingVisit.appointmentTime || '',
        priority: existingVisit.priority || 'Normal',
        notes: existingVisit.notes || '',
        insuranceProvider: existingVisit.insuranceProvider || '',
        insuranceNumber: existingVisit.insuranceNumber || '',
        estimatedCost: existingVisit.estimatedCost || '',
        doctorId: existingVisit.doctorId || undefined,
        doctorName: existingVisit.doctorName || ''
      });
    } else {
      // Reset form for new visit
      setFormData({
        patientId: patient?._id || patient?.id || '',
        visitType: 'OPD',
        chiefComplaint: '',
        symptoms: [],
        department: 'General Medicine',
        appointmentDate: '',
        appointmentTime: '',
        priority: 'Normal',
        notes: '',
        insuranceProvider: '',
        insuranceNumber: '',
        estimatedCost: '',
        doctorId: undefined,
        doctorName: ''
      });
    }
    setSymptomInput('');
    setErrors({});
  }, [isOpen, patient, existingVisit]);

  // Fetch doctors when department changes
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!formData.department) {
        setAvailableDoctors([]);
        return;
      }

      setLoadingDoctors(true);
      try {
        const response = await getNewFlowDoctors(formData.department);
        if (response.data.success) {
          setAvailableDoctors(response.data.data || []);
        } else {
          console.error('Failed to fetch doctors:', response.data.message);
          setAvailableDoctors([]);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setAvailableDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [formData.department]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Debug logging for doctor selection
    if (name === 'doctorId') {
      console.log('🔍 Doctor selected:', value);
      console.log('🔍 Available doctors:', availableDoctors);
      console.log('🔍 Selected doctor object:', availableDoctors.find(d => d._id === value));
    }
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Reset doctor selection when department changes
      if (name === 'department') {
        newData.doctorId = undefined;
        newData.doctorName = '';
      }
      
      // Debug log the form data update
      if (name === 'doctorId') {
        console.log('🔍 Form data after doctor selection:', newData);
      }
      
      return newData;
    });
    
    // Handle field change for validation
    handleFieldChange(name, value);
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    handleFieldBlur(name, value);
  };

  const handleSymptomAdd = () => {
    if (symptomInput.trim() && !formData.symptoms.includes(symptomInput.trim())) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptomInput.trim()]
      }));
      setSymptomInput('');
    }
  };

  const handleSymptomRemove = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(s => s !== symptom)
    }));
  };

  const validateForm = () => {
    const validation = validateAndSetErrors(formData);
    
    // Additional custom validation for appointment date
    if (formData.appointmentDate) {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setErrors(prev => ({ ...prev, appointmentDate: 'Appointment date cannot be in the past' }));
        return false;
      }
    }
    
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    clearAllErrors();
    clearValidationErrors();

    try {
      // Ensure doctorId is properly handled
      let doctorId = undefined;
      let doctorName = undefined;
      
      if (formData.doctorId && formData.doctorId.trim() !== '' && formData.doctorId !== 'undefined') {
        // Check if it's a valid ObjectId format (24 hex characters)
        if (/^[0-9a-fA-F]{24}$/.test(formData.doctorId)) {
          doctorId = formData.doctorId;
          // Find the doctor name from available doctors
          const selectedDoctor = availableDoctors.find(doctor => doctor._id === formData.doctorId);
          if (selectedDoctor) {
            doctorName = selectedDoctor.name;
          }
        } else {
          console.error('❌ Invalid doctorId format:', formData.doctorId);
        }
      }

      const visitData = {
        ...formData,
        appointmentDate: new Date(formData.appointmentDate).toISOString(),
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
        // Include both doctorId and doctorName
        doctorId: doctorId,
        doctorName: doctorName
      };

      // Debug log to see what's being sent
      console.log('🔍 Visit data being sent:', visitData);
      console.log('🔍 Doctor ID value:', formData.doctorId);
      console.log('🔍 Doctor ID type:', typeof formData.doctorId);
      console.log('🔍 Doctor Name found:', doctorName);
      console.log('🔍 Form data before processing:', formData);
      console.log('🔍 Available doctors:', availableDoctors);

      const response = await createNewFlowVisit(visitData);
      
      if (response.data.success) {
        onSuccess?.(response.data.data.visit);
        onClose();
        
        // Reset form
        setFormData({
          patientId: patient?._id || patient?.id || '',
          visitType: 'OPD',
          chiefComplaint: '',
          symptoms: [],
          department: 'General Medicine',
          appointmentDate: '',
          appointmentTime: '',
          priority: 'Normal',
          notes: '',
          insuranceProvider: '',
          insuranceNumber: '',
          estimatedCost: '',
          doctorId: '',
          doctorName: ''
        });
      }
    } catch (error) {
      handleApiError(error, 'VisitBookingForm.handleSubmit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form data
    setFormData({
      patientId: patient?._id || patient?.id || '',
      visitType: 'OPD',
      chiefComplaint: '',
      symptoms: [],
      department: 'General Medicine',
      appointmentDate: '',
      appointmentTime: '',
      priority: 'Normal',
      notes: '',
      insuranceProvider: '',
      insuranceNumber: '',
      estimatedCost: '',
      doctorId: undefined,
      doctorName: ''
    });
    setSymptomInput('');
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="visit-booking-modal">
      <div className="modal-content-container">
        <ModalHeader
          title={existingVisit ? 'Edit Visit' : 'Book New Visit'}
          icon="📅"
          onClose={handleClose}
        />
        {patient && (
          <div className="patient-info-header">
            <span className="patient-info">
              for {patient.name} ({patient.uhid})
            </span>
          </div>
        )}

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="visit-booking-form">
            <div className="form-grid">
            {/* Visit Type */}
            <div className="form-group">
              <label htmlFor="visitType">Visit Type *</label>
              <select
                id="visitType"
                name="visitType"
                value={formData.visitType}
                onChange={handleInputChange}
                className={getFieldError('visitType') ? 'error' : ''}
              >
                {visitTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {getFieldError('visitType') && <span className="error-message">{getFieldError('visitType')}</span>}
            </div>

            {/* Department */}
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={getFieldError('department') ? 'error' : ''}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {getFieldError('department') && <span className="error-message">{getFieldError('department')}</span>}
            </div>

            {/* Priority */}
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>

            {/* Appointment Date */}
            <div className="form-group">
              <label htmlFor="appointmentDate">Appointment Date *</label>
              <input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleInputChange}
                className={getFieldError('appointmentDate') ? 'error' : ''}
                min={new Date().toISOString().split('T')[0]}
              />
              {getFieldError('appointmentDate') && <span className="error-message">{getFieldError('appointmentDate')}</span>}
            </div>

            {/* Appointment Time */}
            <div className="form-group">
              <label htmlFor="appointmentTime">Appointment Time *</label>
              <select
                id="appointmentTime"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleInputChange}
                className={getFieldError('appointmentTime') ? 'error' : ''}
              >
                <option value="">Select Time</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              {getFieldError('appointmentTime') && <span className="error-message">{getFieldError('appointmentTime')}</span>}
            </div>

            {/* Doctor Selection */}
            <div className="form-group">
              <label htmlFor="doctorId">Doctor (Optional)</label>
              <select
                id="doctorId"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleInputChange}
                disabled={loadingDoctors}
                className={getFieldError('doctorId') ? 'error' : ''}
              >
                <option value="">Select a doctor</option>
                {availableDoctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name} - {doctor.specialization} ({doctor.experience || 'N/A'}) - ₹{doctor.consultationFee || 'N/A'}
                  </option>
                ))}
              </select>
              {loadingDoctors && (
                <div className="loading-text">Loading doctors...</div>
              )}
              {getFieldError('doctorId') && <span className="error-message">{getFieldError('doctorId')}</span>}
            </div>
          </div>

          {/* Chief Complaint */}
          <div className="form-group full-width">
            <label htmlFor="chiefComplaint">Chief Complaint (Optional)</label>
              <textarea
                id="chiefComplaint"
                name="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className={getFieldError('chiefComplaint') ? 'error' : ''}
                placeholder="Describe the main reason for the visit..."
                rows={3}
              />
              {getFieldError('chiefComplaint') && <span className="error-message">{getFieldError('chiefComplaint')}</span>}
          </div>

          {/* Symptoms */}
          <div className="form-group full-width">
            <label>Symptoms</label>
            <div className="symptoms-container">
              <div className="symptom-input">
                <input
                  type="text"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  placeholder="Add symptom..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSymptomAdd())}
                />
                <Button type="button" variant="primary" size="small" onClick={handleSymptomAdd}>
                  Add
                </Button>
              </div>
              {formData.symptoms.length > 0 && (
                <div className="symptoms-list">
                  {formData.symptoms.map((symptom, index) => (
                    <span key={index} className="symptom-tag">
                      {symptom}
                      <button
                        type="button"
                        onClick={() => handleSymptomRemove(symptom)}
                        className="remove-symptom"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Insurance Information */}
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="insuranceProvider">Insurance Provider</label>
              <input
                type="text"
                id="insuranceProvider"
                name="insuranceProvider"
                value={formData.insuranceProvider}
                onChange={handleInputChange}
                placeholder="Insurance company name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="insuranceNumber">Insurance Number</label>
              <input
                type="text"
                id="insuranceNumber"
                name="insuranceNumber"
                value={formData.insuranceNumber}
                onChange={handleInputChange}
                placeholder="Insurance policy number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="estimatedCost">Estimated Cost (₹)</label>
              <input
                type="number"
                id="estimatedCost"
                name="estimatedCost"
                value={formData.estimatedCost}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.01"
                className={getFieldError('estimatedCost') ? 'error' : ''}
              />
              {getFieldError('estimatedCost') && <span className="error-message">{getFieldError('estimatedCost')}</span>}
            </div>
          </div>

          {/* Notes */}
          <div className="form-group full-width">
            <label htmlFor="notes">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional information..."
              rows={2}
            />
          </div>

            {/* Error Message */}
            {apiErrors.submit && (
              <div className="error-message submit-error">
                {apiErrors.submit}
              </div>
            )}
          </form>
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
              type="button"
              variant="primary"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Booking...' : (existingVisit ? 'Update Visit' : 'Book Visit')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default VisitBookingForm;

