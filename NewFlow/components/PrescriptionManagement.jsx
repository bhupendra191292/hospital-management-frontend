import React, { useState, useEffect } from 'react';
import { useRole } from '../contexts/RoleContext';
import { 
  createNewFlowPrescription, 
  getNewFlowPrescriptions, 
  getNewFlowPatients,
  getNewFlowDoctors 
} from '../services/api';
import { Modal, ModalHeader } from './ui';
import './PrescriptionManagement.css';

const PrescriptionManagement = () => {
  const { user } = useRole();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    patientId: '',
    medication: '',
    dosage: '',
    frequency: 'Once daily',
    duration: '',
    instructions: '',
    notes: '',
    refills: 0
  });

  const frequencyOptions = [
    'Once daily',
    'Twice daily', 
    'Three times daily',
    'Four times daily',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'As needed',
    'Before meals',
    'After meals',
    'At bedtime'
  ];

  useEffect(() => {
    loadRecentPrescriptions();
    loadPatients();
    loadDoctors();
  }, []);

  const loadRecentPrescriptions = async () => {
    try {
      setIsLoading(true);
      const response = await getNewFlowPrescriptions({ limit: 10 });
      if (response.data.success) {
        setRecentPrescriptions(response.data.data.prescriptions || []);
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await getNewFlowPatients({ limit: 100 });
      if (response.data.success) {
        setPatients(response.data.data.patients || []);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await getNewFlowDoctors();
      if (response.data.success) {
        setDoctors(response.data.data.doctors || []);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const response = await createNewFlowPrescription(formData);
      if (response.data.success) {
        alert('Prescription created successfully!');
        setFormData({
          patientId: '',
          medication: '',
          dosage: '',
          frequency: 'Once daily',
          duration: '',
          instructions: '',
          notes: '',
          refills: 0
        });
        setShowCreateForm(false);
        loadRecentPrescriptions();
      }
    } catch (error) {
      console.error('Error creating prescription:', error);
      alert('Failed to create prescription. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      const draftData = { ...formData, status: 'Draft' };
      const response = await createNewFlowPrescription(draftData);
      if (response.data.success) {
        alert('Prescription saved as draft!');
        setShowCreateForm(false);
        loadRecentPrescriptions();
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
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

  const getStatusBadge = (status) => {
    const statusColors = {
      'Active': 'status-active',
      'Completed': 'status-completed',
      'Cancelled': 'status-cancelled',
      'Draft': 'status-draft'
    };
    return statusColors[status] || 'status-default';
  };

  return (
    <div className="prescription-management">
      {/* Header */}
      <div className="prescription-header">
        <div className="header-content">
          <div className="header-title">
            <span className="title-icon">💊</span>
            <h1>Prescription Management</h1>
          </div>
          <div className="header-actions">
            <button 
              className="btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              New Prescription
            </button>
            <button className="btn-secondary">
              View All
            </button>
          </div>
        </div>
      </div>

      {/* Create New Prescription Form */}
      <div className="create-prescription-card">
        <h2>Create New Prescription</h2>
        <form onSubmit={handleSubmit} className="prescription-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="patientId">Patient *</label>
              <select
                id="patientId"
                name="patientId"
                value={formData.patientId}
                onChange={handleInputChange}
                required
                className="form-input"
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient._id || patient.id} value={patient._id || patient.id}>
                    {patient.name} (UHID: {patient.uhid})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="medication">Medication *</label>
              <input
                type="text"
                id="medication"
                name="medication"
                value={formData.medication}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter medication name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="dosage">Dosage *</label>
              <input
                type="text"
                id="dosage"
                name="dosage"
                value={formData.dosage}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="e.g., 500mg"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="frequency">Frequency *</label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                required
                className="form-input"
              >
                {frequencyOptions.map(freq => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="duration">Duration *</label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="e.g., 5 days"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="instructions">Instructions</label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Special instructions for the patient"
                rows="3"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="refills">Refills</label>
              <input
                type="number"
                id="refills"
                name="refills"
                value={formData.refills}
                onChange={handleInputChange}
                min="0"
                className="form-input"
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <input
                type="text"
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Additional notes"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              Save as Draft
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Creating...' : 'Create Prescription'}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Prescriptions */}
      <div className="recent-prescriptions">
        <h2>Recent Prescriptions</h2>
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading prescriptions...</p>
          </div>
        ) : recentPrescriptions.length > 0 ? (
          <div className="prescriptions-list">
            {recentPrescriptions.map((prescription) => (
              <div key={prescription._id || prescription.id} className="prescription-card">
                <div className="prescription-header">
                  <div className="prescription-info">
                    <h3>{prescription.medication}</h3>
                    <p className="patient-name">
                      {prescription.patientId?.name || 'Unknown Patient'}
                    </p>
                  </div>
                  <div className="prescription-status">
                    <span className={`status-badge ${getStatusBadge(prescription.status)}`}>
                      {prescription.status}
                    </span>
                  </div>
                </div>
                <div className="prescription-details">
                  <div className="detail-item">
                    <span className="detail-label">Dosage:</span>
                    <span className="detail-value">{prescription.dosage}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Frequency:</span>
                    <span className="detail-value">{prescription.frequency}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{prescription.duration}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Prescribed:</span>
                    <span className="detail-value">{formatDate(prescription.prescribedDate)}</span>
                  </div>
                </div>
                {prescription.instructions && (
                  <div className="prescription-instructions">
                    <span className="instructions-label">Instructions:</span>
                    <span className="instructions-text">{prescription.instructions}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <p>No prescriptions found</p>
            <button 
              className="btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              Create First Prescription
            </button>
          </div>
        )}
      </div>

      {/* Create Prescription Modal */}
      <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} className="create-prescription-modal">
        <ModalHeader
          title="Create New Prescription"
          icon="💊"
          onClose={() => setShowCreateForm(false)}
        />
        <div className="modal-content">
          <form onSubmit={handleSubmit} className="prescription-form">
            <div className="form-group">
              <label htmlFor="modal-patientId">Patient *</label>
              <select
                id="modal-patientId"
                name="patientId"
                value={formData.patientId}
                onChange={handleInputChange}
                required
                className="form-input"
              >
                <option value="">Select Patient</option>
                {patients.map(patient => (
                  <option key={patient._id || patient.id} value={patient._id || patient.id}>
                    {patient.name} (UHID: {patient.uhid})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="modal-medication">Medication *</label>
                <input
                  type="text"
                  id="modal-medication"
                  name="medication"
                  value={formData.medication}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Enter medication name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="modal-dosage">Dosage *</label>
                <input
                  type="text"
                  id="modal-dosage"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="e.g., 500mg"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="modal-frequency">Frequency *</label>
                <select
                  id="modal-frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                >
                  {frequencyOptions.map(freq => (
                    <option key={freq} value={freq}>{freq}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="modal-duration">Duration *</label>
                <input
                  type="text"
                  id="modal-duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="e.g., 5 days"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="modal-instructions">Instructions</label>
              <textarea
                id="modal-instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Special instructions for the patient"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="modal-refills">Refills</label>
                <input
                  type="number"
                  id="modal-refills"
                  name="refills"
                  value={formData.refills}
                  onChange={handleInputChange}
                  min="0"
                  className="form-input"
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="modal-notes">Notes</label>
                <input
                  type="text"
                  id="modal-notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Additional notes"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={handleSaveDraft}
                disabled={isSaving}
              >
                Save as Draft
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSaving}
              >
                {isSaving ? 'Creating...' : 'Create Prescription'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default PrescriptionManagement;
