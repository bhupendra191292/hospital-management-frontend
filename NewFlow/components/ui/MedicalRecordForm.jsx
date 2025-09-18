import React, { useState, useEffect } from 'react';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { Modal, ModalHeader, Button } from './index';
import './MedicalRecordForm.css';

const MedicalRecordForm = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  existingRecord = null,
  patients = [],
  doctors = []
}) => {
  const { errors, isLoading, setErrors, setIsLoading, handleApiError, clearAllErrors } = useErrorHandler();
  
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    recordType: 'Visit',
    chiefComplaint: '',
    symptoms: [],
    diagnosis: '',
    treatment: '',
    prescription: [],
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      weight: '',
      height: ''
    },
    labResults: [],
    followUpRequired: false,
    followUpDate: '',
    status: 'Active',
    priority: 'Normal',
    notes: ''
  });

  const [symptomInput, setSymptomInput] = useState('');
  const [prescriptionInput, setPrescriptionInput] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: ''
  });

  const [labResultInput, setLabResultInput] = useState({
    testName: '',
    result: '',
    normalRange: '',
    unit: ''
  });

  const recordTypes = [
    { value: 'Visit', label: 'Visit', icon: '🏥' },
    { value: 'Lab', label: 'Lab', icon: '🧪' },
    { value: 'Radiology', label: 'Radiology', icon: '📷' },
    { value: 'Prescription', label: 'Prescription', icon: '💊' },
    { value: 'Procedure', label: 'Procedure', icon: '⚕️' }
  ];

  const priorities = [
    { value: 'Low', label: 'Low' },
    { value: 'Normal', label: 'Normal' },
    { value: 'High', label: 'High' },
    { value: 'Emergency', label: 'Emergency' }
  ];

  const statuses = [
    { value: 'Active', label: 'Active' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Archived', label: 'Archived' }
  ];

  useEffect(() => {
    if (existingRecord) {
      setFormData({
        patientId: existingRecord.patientId || '',
        doctorId: existingRecord.doctorId || '',
        recordType: existingRecord.recordType || 'Visit',
        chiefComplaint: existingRecord.chiefComplaint || '',
        symptoms: existingRecord.symptoms || [],
        diagnosis: existingRecord.diagnosis || '',
        treatment: existingRecord.treatment || '',
        prescription: existingRecord.prescription || [],
        vitalSigns: existingRecord.vitalSigns || {
          bloodPressure: '',
          heartRate: '',
          temperature: '',
          respiratoryRate: '',
          oxygenSaturation: '',
          weight: '',
          height: ''
        },
        labResults: existingRecord.labResults || [],
        followUpRequired: existingRecord.followUpRequired || false,
        followUpDate: existingRecord.followUpDate || '',
        status: existingRecord.status || 'Active',
        priority: existingRecord.priority || 'Normal',
        notes: existingRecord.notes || ''
      });
    } else {
      // Reset form for new record
      setFormData({
        patientId: '',
        doctorId: '',
        recordType: 'Visit',
        chiefComplaint: '',
        symptoms: [],
        diagnosis: '',
        treatment: '',
        prescription: [],
        vitalSigns: {
          bloodPressure: '',
          heartRate: '',
          temperature: '',
          respiratoryRate: '',
          oxygenSaturation: '',
          weight: '',
          height: ''
        },
        labResults: [],
        followUpRequired: false,
        followUpDate: '',
        status: 'Active',
        priority: 'Normal',
        notes: ''
      });
    }
  }, [existingRecord, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('vitalSigns.')) {
      const vitalSign = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vitalSigns: {
          ...prev.vitalSigns,
          [vitalSign]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
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

  const handlePrescriptionAdd = () => {
    if (prescriptionInput.medication.trim()) {
      setFormData(prev => ({
        ...prev,
        prescription: [...prev.prescription, { ...prescriptionInput }]
      }));
      setPrescriptionInput({
        medication: '',
        dosage: '',
        frequency: '',
        duration: ''
      });
    }
  };

  const handlePrescriptionRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      prescription: prev.prescription.filter((_, i) => i !== index)
    }));
  };

  const handleLabResultAdd = () => {
    if (labResultInput.testName.trim()) {
      setFormData(prev => ({
        ...prev,
        labResults: [...prev.labResults, { ...labResultInput }]
      }));
      setLabResultInput({
        testName: '',
        result: '',
        normalRange: '',
        unit: ''
      });
    }
  };

  const handleLabResultRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      labResults: prev.labResults.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Patient is required';
    }

    if (!formData.doctorId) {
      newErrors.doctorId = 'Doctor is required';
    }

    if (!formData.recordType) {
      newErrors.recordType = 'Record type is required';
    }

    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = 'Diagnosis is required';
    }

    if (formData.followUpRequired && !formData.followUpDate) {
      newErrors.followUpDate = 'Follow-up date is required when follow-up is needed';
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
      // In a real app, this would call the appropriate API
      const recordData = {
        ...formData,
        patientName: patients.find(p => p._id === formData.patientId)?.name || '',
        doctorName: doctors.find(d => d._id === formData.doctorId)?.name || '',
        createdAt: existingRecord ? existingRecord.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess(recordData);
    } catch (error) {
      handleApiError(error, 'MedicalRecordForm.handleSubmit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      recordType: 'Visit',
      chiefComplaint: '',
      symptoms: [],
      diagnosis: '',
      treatment: '',
      prescription: [],
      vitalSigns: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        weight: '',
        height: ''
      },
      labResults: [],
      followUpRequired: false,
      followUpDate: '',
      status: 'Active',
      priority: 'Normal',
      notes: ''
    });
    setSymptomInput('');
    setPrescriptionInput({
      medication: '',
      dosage: '',
      frequency: '',
      duration: ''
    });
    setLabResultInput({
      testName: '',
      result: '',
      normalRange: '',
      unit: ''
    });
    clearAllErrors();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="large">
      <ModalHeader 
        title={existingRecord ? 'Edit Medical Record' : 'New Medical Record'} 
        onClose={handleClose} 
      />
      
      <div className="medical-record-form">
        <form onSubmit={handleSubmit}>
          <div className="form-sections">
            {/* Basic Information */}
            <div className="form-section">
              <h3>📋 Basic Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="patientId">Patient *</label>
                  <select
                    id="patientId"
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    className={errors.patientId ? 'error' : ''}
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map(patient => (
                      <option key={patient._id} value={patient._id}>
                        {patient.name} - {patient.mobile}
                      </option>
                    ))}
                  </select>
                  {errors.patientId && <span className="error-message">{errors.patientId}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="doctorId">Doctor *</label>
                  <select
                    id="doctorId"
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleInputChange}
                    className={errors.doctorId ? 'error' : ''}
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                  {errors.doctorId && <span className="error-message">{errors.doctorId}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="recordType">Record Type *</label>
                  <select
                    id="recordType"
                    name="recordType"
                    value={formData.recordType}
                    onChange={handleInputChange}
                    className={errors.recordType ? 'error' : ''}
                    required
                  >
                    {recordTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.recordType && <span className="error-message">{errors.recordType}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="form-section">
              <h3>🏥 Medical Information</h3>
              <div className="form-group full-width">
                <label htmlFor="chiefComplaint">Chief Complaint</label>
                <textarea
                  id="chiefComplaint"
                  name="chiefComplaint"
                  value={formData.chiefComplaint}
                  onChange={handleInputChange}
                  placeholder="Describe the main reason for the visit..."
                  rows={3}
                />
              </div>

              <div className="form-group full-width">
                <label>Symptoms</label>
                <div className="symptom-input">
                  <input
                    type="text"
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    placeholder="Add symptom..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSymptomAdd()}
                  />
                  <Button type="button" onClick={handleSymptomAdd} className="btn-sm btn-primary">
                    Add
                  </Button>
                </div>
                <div className="symptom-list">
                  {formData.symptoms.map((symptom, index) => (
                    <span key={index} className="symptom-tag">
                      {symptom}
                      <button
                        type="button"
                        onClick={() => handleSymptomRemove(symptom)}
                        className="remove-btn"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="diagnosis">Diagnosis *</label>
                <textarea
                  id="diagnosis"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  placeholder="Enter diagnosis..."
                  rows={3}
                  className={errors.diagnosis ? 'error' : ''}
                  required
                />
                {errors.diagnosis && <span className="error-message">{errors.diagnosis}</span>}
              </div>

              <div className="form-group full-width">
                <label htmlFor="treatment">Treatment</label>
                <textarea
                  id="treatment"
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleInputChange}
                  placeholder="Enter treatment details..."
                  rows={3}
                />
              </div>
            </div>

            {/* Vital Signs */}
            <div className="form-section">
              <h3>💓 Vital Signs</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="bloodPressure">Blood Pressure</label>
                  <input
                    type="text"
                    id="bloodPressure"
                    name="vitalSigns.bloodPressure"
                    value={formData.vitalSigns.bloodPressure}
                    onChange={handleInputChange}
                    placeholder="120/80"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="heartRate">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    id="heartRate"
                    name="vitalSigns.heartRate"
                    value={formData.vitalSigns.heartRate}
                    onChange={handleInputChange}
                    placeholder="72"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="temperature">Temperature (°F)</label>
                  <input
                    type="number"
                    id="temperature"
                    name="vitalSigns.temperature"
                    value={formData.vitalSigns.temperature}
                    onChange={handleInputChange}
                    placeholder="98.6"
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="respiratoryRate">Respiratory Rate</label>
                  <input
                    type="number"
                    id="respiratoryRate"
                    name="vitalSigns.respiratoryRate"
                    value={formData.vitalSigns.respiratoryRate}
                    onChange={handleInputChange}
                    placeholder="16"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="oxygenSaturation">Oxygen Saturation (%)</label>
                  <input
                    type="number"
                    id="oxygenSaturation"
                    name="vitalSigns.oxygenSaturation"
                    value={formData.vitalSigns.oxygenSaturation}
                    onChange={handleInputChange}
                    placeholder="98"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="weight">Weight (kg)</label>
                  <input
                    type="number"
                    id="weight"
                    name="vitalSigns.weight"
                    value={formData.vitalSigns.weight}
                    onChange={handleInputChange}
                    placeholder="70"
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="height">Height (cm)</label>
                  <input
                    type="number"
                    id="height"
                    name="vitalSigns.height"
                    value={formData.vitalSigns.height}
                    onChange={handleInputChange}
                    placeholder="170"
                  />
                </div>
              </div>
            </div>

            {/* Prescription */}
            <div className="form-section">
              <h3>💊 Prescription</h3>
              <div className="prescription-input">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Medication</label>
                    <input
                      type="text"
                      value={prescriptionInput.medication}
                      onChange={(e) => setPrescriptionInput(prev => ({ ...prev, medication: e.target.value }))}
                      placeholder="Medication name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Dosage</label>
                    <input
                      type="text"
                      value={prescriptionInput.dosage}
                      onChange={(e) => setPrescriptionInput(prev => ({ ...prev, dosage: e.target.value }))}
                      placeholder="e.g., 500mg"
                    />
                  </div>
                  <div className="form-group">
                    <label>Frequency</label>
                    <input
                      type="text"
                      value={prescriptionInput.frequency}
                      onChange={(e) => setPrescriptionInput(prev => ({ ...prev, frequency: e.target.value }))}
                      placeholder="e.g., Twice daily"
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      value={prescriptionInput.duration}
                      onChange={(e) => setPrescriptionInput(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 7 days"
                    />
                  </div>
                </div>
                <Button type="button" onClick={handlePrescriptionAdd} className="btn-sm btn-primary">
                  Add Medication
                </Button>
              </div>
              
              <div className="prescription-list">
                {formData.prescription.map((med, index) => (
                  <div key={index} className="prescription-item">
                    <div className="medication-info">
                      <strong>{med.medication}</strong> - {med.dosage}
                      <br />
                      <small>{med.frequency} for {med.duration}</small>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePrescriptionRemove(index)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Lab Results */}
            <div className="form-section">
              <h3>🧪 Lab Results</h3>
              <div className="lab-result-input">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Test Name</label>
                    <input
                      type="text"
                      value={labResultInput.testName}
                      onChange={(e) => setLabResultInput(prev => ({ ...prev, testName: e.target.value }))}
                      placeholder="e.g., Blood Sugar"
                    />
                  </div>
                  <div className="form-group">
                    <label>Result</label>
                    <input
                      type="text"
                      value={labResultInput.result}
                      onChange={(e) => setLabResultInput(prev => ({ ...prev, result: e.target.value }))}
                      placeholder="e.g., 95"
                    />
                  </div>
                  <div className="form-group">
                    <label>Normal Range</label>
                    <input
                      type="text"
                      value={labResultInput.normalRange}
                      onChange={(e) => setLabResultInput(prev => ({ ...prev, normalRange: e.target.value }))}
                      placeholder="e.g., 70-100"
                    />
                  </div>
                  <div className="form-group">
                    <label>Unit</label>
                    <input
                      type="text"
                      value={labResultInput.unit}
                      onChange={(e) => setLabResultInput(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="e.g., mg/dL"
                    />
                  </div>
                </div>
                <Button type="button" onClick={handleLabResultAdd} className="btn-sm btn-primary">
                  Add Result
                </Button>
              </div>
              
              <div className="lab-results-list">
                {formData.labResults.map((result, index) => (
                  <div key={index} className="lab-result-item">
                    <div className="result-info">
                      <strong>{result.testName}</strong>: {result.result} {result.unit}
                      <br />
                      <small>Normal range: {result.normalRange}</small>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLabResultRemove(index)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up */}
            <div className="form-section">
              <h3>📅 Follow-up</h3>
              <div className="form-grid">
                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="followUpRequired"
                      checked={formData.followUpRequired}
                      onChange={handleInputChange}
                    />
                    Follow-up Required
                  </label>
                </div>
                {formData.followUpRequired && (
                  <div className="form-group">
                    <label htmlFor="followUpDate">Follow-up Date</label>
                    <input
                      type="date"
                      id="followUpDate"
                      name="followUpDate"
                      value={formData.followUpDate}
                      onChange={handleInputChange}
                      className={errors.followUpDate ? 'error' : ''}
                    />
                    {errors.followUpDate && <span className="error-message">{errors.followUpDate}</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="form-section">
              <h3>📝 Additional Notes</h3>
              <div className="form-group full-width">
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional notes or observations..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="error-message submit-error">
              {errors.submit}
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <Button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (existingRecord ? 'Update Record' : 'Create Record')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default MedicalRecordForm;
