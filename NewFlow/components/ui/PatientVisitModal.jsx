import React, { useState, useEffect, useRef } from 'react';
import { Modal, ModalHeader, Button } from './index';
import { getNewFlowPatientById, updateNewFlowVisit, createNewFlowPrescription } from '../../services/api';
import './PatientVisitModal.css';

const PatientVisitModal = ({
  isOpen,
  onClose,
  appointment,
  onVisitUpdate
}) => {
  const [patient, setPatient] = useState(null);
  const [visitDetails, setVisitDetails] = useState({
    diagnosis: '',
    prescription: [],
    notes: '',
    followUpRequired: false,
    followUpDate: '',
    status: appointment?.status || 'Scheduled'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('patient-info');
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });
  const [isScrollable, setIsScrollable] = useState(false);
  const tabContentRef = useRef(null);

  useEffect(() => {
    if (isOpen && appointment?.patientId) {
      loadPatientDetails();
      // Initialize visitDetails with appointment data
      setVisitDetails({
        diagnosis: appointment.diagnosis || '',
        prescription: appointment.prescription || [],
        notes: appointment.notes || '',
        followUpRequired: appointment.followUpRequired || false,
        followUpDate: appointment.followUpDate ? appointment.followUpDate.split('T')[0] : '',
        status: appointment.status || 'Scheduled'
      });
    }
  }, [isOpen, appointment]);

  useEffect(() => {
    const checkScrollable = () => {
      if (tabContentRef.current) {
        const { scrollHeight, clientHeight } = tabContentRef.current;
        setIsScrollable(scrollHeight > clientHeight);
      }
    };

    checkScrollable();
    window.addEventListener('resize', checkScrollable);

    return () => window.removeEventListener('resize', checkScrollable);
  }, [activeTab, patient, visitDetails]);

  const loadPatientDetails = async () => {
    try {
      setIsLoading(true);
      const response = await getNewFlowPatientById(appointment.patientId);
      if (response.data.success) {
        setPatient(response.data.data);
      }
    } catch (error) {
      console.error('Error loading patient details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVisitDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMedicineAdd = () => {
    if (newMedicine.name && newMedicine.dosage) {
      setVisitDetails(prev => ({
        ...prev,
        prescription: [...prev.prescription, { ...newMedicine }]
      }));
      setNewMedicine({
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      });
    }
  };

  const handleMedicineRemove = (index) => {
    setVisitDetails(prev => ({
      ...prev,
      prescription: prev.prescription.filter((_, i) => i !== index)
    }));
  };


  const handleSaveProgress = async () => {
    try {
      setIsSaving(true);
      const updateData = {
        diagnosis: visitDetails.diagnosis,
        prescription: visitDetails.prescription,
        notes: visitDetails.notes,
        followUpRequired: visitDetails.followUpRequired,
        followUpDate: visitDetails.followUpDate ? new Date(visitDetails.followUpDate).toISOString() : null
      };

      const response = await updateNewFlowVisit(appointment.id, updateData);
      if (response.data.success) {
        onVisitUpdate?.(response.data.data.visit);
        alert('Progress saved successfully!');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      alert('Failed to save progress. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteVisit = async () => {
    try {
      setIsSaving(true);
      const updateData = {
        status: 'Completed',
        diagnosis: visitDetails.diagnosis,
        prescription: visitDetails.prescription,
        notes: visitDetails.notes,
        followUpRequired: visitDetails.followUpRequired,
        followUpDate: visitDetails.followUpDate ? new Date(visitDetails.followUpDate).toISOString() : null,
        completedAt: new Date().toISOString()
      };

      const response = await updateNewFlowVisit(appointment.id, updateData);
      if (response.data.success) {
        setVisitDetails(prev => ({ ...prev, status: 'Completed' }));
        onVisitUpdate?.(response.data.data.visit);

        // Create prescriptions for each medication
        if (visitDetails.prescription && visitDetails.prescription.length > 0) {
          try {
            const prescriptionPromises = visitDetails.prescription.map(med =>
              createNewFlowPrescription({
                patientId: appointment.patientId,
                visitId: appointment.id,
                medication: med.name,
                dosage: med.dosage,
                frequency: med.frequency,
                duration: med.duration,
                instructions: med.instructions,
                notes: `Prescribed during visit on ${new Date().toLocaleDateString()}`,
                status: 'Active'
              })
            );

            await Promise.all(prescriptionPromises);
            console.log('All prescriptions created successfully');
          } catch (prescriptionError) {
            console.error('Error creating prescriptions:', prescriptionError);
            // Don't fail the visit completion if prescription creation fails
          }
        }

        alert('Visit completed successfully! Prescription and all details have been saved.');
        onClose();
      }
    } catch (error) {
      console.error('Error completing visit:', error);
      alert('Failed to complete visit. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  if (!isOpen || !appointment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="patient-visit-modal">
      <div className="modal-content-container">
        <ModalHeader
          title={`${appointment.patient} - ${appointment.type}`}
          icon="👨‍⚕️"
          onClose={onClose}
        />

        <div className="visit-modal-content">
          {/* Appointment Info Header */}
          <div className="appointment-header-info">
            <div className="appointment-time">
              <span className="time">{formatTime(appointment.time)}</span>
              <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                {appointment.status}
              </span>
            </div>
            <div className="appointment-details">
              <span className="visit-type">{appointment.type}</span>
              <span className="department">{appointment.department}</span>
              {appointment.priority && (
                <span className={`priority priority-${appointment.priority.toLowerCase()}`}>
                  {appointment.priority}
                </span>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'patient-info' ? 'active' : ''}`}
              onClick={() => setActiveTab('patient-info')}
            >
              👤 Patient Info
            </button>
            <button
              className={`tab-button ${activeTab === 'visit-details' ? 'active' : ''}`}
              onClick={() => setActiveTab('visit-details')}
            >
              📋 Visit Details
            </button>
            <button
              className={`tab-button ${activeTab === 'prescription' ? 'active' : ''}`}
              onClick={() => setActiveTab('prescription')}
            >
              💊 Prescription
            </button>
          </div>

          {/* Tab Content */}
          <div className={`tab-content ${isScrollable ? 'scrollable' : ''}`} ref={tabContentRef}>
            {activeTab === 'patient-info' && (
              <div className="patient-info-tab">
                {isLoading ? (
                  <div className="loading-state">Loading patient details...</div>
                ) : patient ? (
                  <div className="patient-details-grid">
                    <div className="detail-section">
                      <h3>Personal Information</h3>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Name:</label>
                          <span>{patient.name}</span>
                        </div>
                        <div className="detail-item">
                          <label>UHID:</label>
                          <span>{patient.uhid}</span>
                        </div>
                        <div className="detail-item">
                          <label>Age:</label>
                          <span>{patient.age} years</span>
                        </div>
                        <div className="detail-item">
                          <label>Gender:</label>
                          <span>{patient.gender}</span>
                        </div>
                        <div className="detail-item">
                          <label>Mobile:</label>
                          <span>{patient.mobile}</span>
                        </div>
                        <div className="detail-item">
                          <label>Email:</label>
                          <span>{patient.email || 'Not provided'}</span>
                        </div>
                        <div className="detail-item">
                          <label>Blood Group:</label>
                          <span>{patient.bloodGroup || 'Not specified'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h3>Address Information</h3>
                      <div className="detail-grid">
                        <div className="detail-item full-width">
                          <label>Address:</label>
                          <span>{patient.address || 'Not provided'}</span>
                        </div>
                        <div className="detail-item">
                          <label>City:</label>
                          <span>{patient.city || 'Not provided'}</span>
                        </div>
                        <div className="detail-item">
                          <label>State:</label>
                          <span>{patient.state || 'Not provided'}</span>
                        </div>
                        <div className="detail-item">
                          <label>Pincode:</label>
                          <span>{patient.pincode || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h3>Emergency Contact</h3>
                      <div className="detail-grid">
                        <div className="detail-item full-width">
                          <label>Emergency Contact:</label>
                          <span>{patient.emergencyContact || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="error-state">Failed to load patient details</div>
                )}
              </div>
            )}

            {activeTab === 'visit-details' && (
              <div className="visit-details-tab">
                <div className="form-section">
                  <h3>Chief Complaint</h3>
                  <p className="chief-complaint">{appointment.notes || 'No chief complaint provided'}</p>
                </div>

                <div className="form-section">
                  <h3>Diagnosis</h3>
                  <textarea
                    name="diagnosis"
                    value={visitDetails.diagnosis}
                    onChange={handleInputChange}
                    placeholder="Enter diagnosis..."
                    rows={3}
                    className="diagnosis-textarea"
                  />
                </div>

                <div className="form-section">
                  <h3>Visit Notes</h3>
                  <textarea
                    name="notes"
                    value={visitDetails.notes}
                    onChange={handleInputChange}
                    placeholder="Enter visit notes..."
                    rows={4}
                    className="notes-textarea"
                  />
                </div>

                <div className="form-section">
                  <h3>Follow-up</h3>
                  <div className="follow-up-controls">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="followUpRequired"
                        checked={visitDetails.followUpRequired}
                        onChange={handleInputChange}
                      />
                      Follow-up required
                    </label>
                    {visitDetails.followUpRequired && (
                      <input
                        type="date"
                        name="followUpDate"
                        value={visitDetails.followUpDate}
                        onChange={handleInputChange}
                        className="follow-up-date"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'prescription' && (
              <div className="prescription-tab">
                <div className="add-medicine-section">
                  <h3>Add Medicine</h3>
                  <div className="medicine-form">
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Medicine name"
                        value={newMedicine.name}
                        onChange={(e) => setNewMedicine(prev => ({ ...prev, name: e.target.value }))}
                        className="medicine-input"
                      />
                      <input
                        type="text"
                        placeholder="Dosage (e.g., 10mg)"
                        value={newMedicine.dosage}
                        onChange={(e) => setNewMedicine(prev => ({ ...prev, dosage: e.target.value }))}
                        className="medicine-input"
                      />
                    </div>
                    <div className="form-row">
                      <select
                        value={newMedicine.frequency}
                        onChange={(e) => setNewMedicine(prev => ({ ...prev, frequency: e.target.value }))}
                        className="medicine-select"
                      >
                        <option value="">Select frequency</option>
                        <option value="Once daily">Once daily</option>
                        <option value="Twice daily">Twice daily</option>
                        <option value="Three times daily">Three times daily</option>
                        <option value="As needed">As needed</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Duration (e.g., 7 days)"
                        value={newMedicine.duration}
                        onChange={(e) => setNewMedicine(prev => ({ ...prev, duration: e.target.value }))}
                        className="medicine-input"
                      />
                    </div>
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Instructions (e.g., Take with food)"
                        value={newMedicine.instructions}
                        onChange={(e) => setNewMedicine(prev => ({ ...prev, instructions: e.target.value }))}
                        className="medicine-input full-width"
                      />
                    </div>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={handleMedicineAdd}
                      disabled={!newMedicine.name || !newMedicine.dosage}
                    >
                      Add Medicine
                    </Button>
                  </div>
                </div>

                <div className="prescription-list-section">
                  <h3>Prescription ({visitDetails.prescription.length})</h3>
                  {visitDetails.prescription.length > 0 ? (
                    <div className="prescription-list">
                      {visitDetails.prescription.map((medicine, index) => (
                        <div key={index} className="prescription-item">
                          <div className="medicine-info">
                            <div className="medicine-name">{medicine.name}</div>
                            <div className="medicine-details">
                              {medicine.dosage} • {medicine.frequency} • {medicine.duration}
                            </div>
                            {medicine.instructions && (
                              <div className="medicine-instructions">
                                Instructions: {medicine.instructions}
                              </div>
                            )}
                          </div>
                          <button
                            className="remove-medicine"
                            onClick={() => handleMedicineRemove(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-prescription">
                      No medicines added yet
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="visit-actions">
            {(visitDetails.status === 'scheduled' || visitDetails.status === 'Scheduled') && (
              <Button
                variant="success"
                onClick={handleCompleteVisit}
                disabled={isSaving}
              >
                {isSaving ? 'Completing...' : 'Complete Visit & Save Prescription'}
              </Button>
            )}

            {(visitDetails.status === 'in-progress' || visitDetails.status === 'In Progress') && (
              <div className="action-buttons-group">
                <Button
                  variant="secondary"
                  onClick={handleSaveProgress}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Progress'}
                </Button>
                <Button
                  variant="success"
                  onClick={handleCompleteVisit}
                  disabled={isSaving}
                >
                  {isSaving ? 'Completing...' : 'Complete Visit & Save Prescription'}
                </Button>
              </div>
            )}

            {(visitDetails.status === 'completed' || visitDetails.status === 'Completed') && (
              <div className="completed-visit-info">
                <span className="completed-badge">✅ Visit Completed</span>
                <span className="completion-time">
                  Completed at {formatTime(appointment.time)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PatientVisitModal;
