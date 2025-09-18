import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, Button } from './index';
import { getNewFlowPatientMedicalRecords } from '../../services/api';
import './MedicalRecordsModal.css';

const MedicalRecordsModal = ({ 
  isOpen, 
  onClose, 
  patient 
}) => {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && patient?.id) {
      loadMedicalRecords();
    }
  }, [isOpen, patient]);

  const loadMedicalRecords = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await getNewFlowPatientMedicalRecords(patient.id);
      
      if (response.data.success) {
        setMedicalRecords(response.data.data.records);
      } else {
        setError('Failed to load medical records. Please try again.');
      }
    } catch (err) {
      console.error('Error loading medical records:', err);
      setError('Failed to load medical records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRecordTypeColor = (type) => {
    const colors = {
      'Consultation': 'blue',
      'Follow-up': 'green',
      'Emergency': 'red',
      'Lab Test': 'purple',
      'Imaging': 'orange'
    };
    return colors[type] || 'gray';
  };

  const handleDownloadAttachment = (attachment) => {
    // Mock download functionality
    alert(`Downloading ${attachment}...`);
  };

  if (!patient) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="medical-records-modal">
      <div className="modal-content-container">
        {/* Header */}
        <ModalHeader
          title="Medical Records"
          icon="📋"
          onClose={onClose}
        />

        {/* Content */}
        <div className="modal-body">
          {/* Patient Info Header */}
          <div className="patient-info-header">
            <div className="patient-basic-info">
              <h3>{patient.name}</h3>
              <p>UHID: {patient.uhid}</p>
              <p>DOB: {patient.dob ? formatDate(patient.dob) : 'Not provided'}</p>
            </div>
            <div className="patient-stats">
              <div className="stat-item">
                <span className="stat-number">{medicalRecords.length}</span>
                <span className="stat-label">Total Records</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {medicalRecords.filter(r => r.type === 'Emergency').length}
                </span>
                <span className="stat-label">Emergency Visits</span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="loading-state">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading medical records...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-state">
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
                <Button 
                  variant="primary" 
                  size="small"
                  onClick={loadMedicalRecords}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Medical Records List */}
          {!isLoading && !error && (
            <div className="medical-records-list">
              {medicalRecords.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No Medical Records Found</h3>
                  <p>This patient doesn't have any medical records yet.</p>
                </div>
              ) : (
                medicalRecords.map((record) => (
                  <div key={record._id} className="medical-record-card">
                    <div className="record-header">
                      <div className="record-date">
                        <span className="date-icon">📅</span>
                        <span>{formatDate(record.date)}</span>
                      </div>
                      <div className={`record-type type-${getRecordTypeColor(record.recordType)}`}>
                        {record.recordType}
                      </div>
                    </div>

                    <div className="record-content">
                      <div className="record-info">
                        <div className="info-row">
                          <span className="info-label">👨‍⚕️ Doctor:</span>
                          <span className="info-value">
                            {record.doctorId?.name || 'Dr. Unknown'}
                          </span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">🏥 Department:</span>
                          <span className="info-value">{record.department}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">🔍 Diagnosis:</span>
                          <span className="info-value">{record.diagnosis}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">💊 Treatment:</span>
                          <span className="info-value">{record.treatment}</span>
                        </div>
                      </div>

                      {record.notes && (
                        <div className="record-notes">
                          <span className="notes-label">📝 Notes:</span>
                          <p className="notes-content">{record.notes}</p>
                        </div>
                      )}

                      {record.attachments && record.attachments.length > 0 && (
                        <div className="record-attachments">
                          <span className="attachments-label">📎 Attachments:</span>
                          <div className="attachments-list">
                            {record.attachments.map((attachment, index) => (
                              <button
                                key={index}
                                className="attachment-item"
                                onClick={() => handleDownloadAttachment(attachment.name || attachment)}
                              >
                                <span className="attachment-icon">📄</span>
                                <span className="attachment-name">{attachment.name || attachment}</span>
                                <span className="download-icon">⬇️</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {record.vitalSigns && (
                        <div className="record-vitals">
                          <span className="vitals-label">🩺 Vital Signs:</span>
                          <div className="vitals-grid">
                            {record.vitalSigns.bloodPressure && (
                              <div className="vital-item">
                                <span className="vital-label">BP:</span>
                                <span className="vital-value">{record.vitalSigns.bloodPressure}</span>
                              </div>
                            )}
                            {record.vitalSigns.heartRate && (
                              <div className="vital-item">
                                <span className="vital-label">HR:</span>
                                <span className="vital-value">{record.vitalSigns.heartRate} bpm</span>
                              </div>
                            )}
                            {record.vitalSigns.temperature && (
                              <div className="vital-item">
                                <span className="vital-label">Temp:</span>
                                <span className="vital-value">{record.vitalSigns.temperature}°F</span>
                              </div>
                            )}
                            {record.vitalSigns.weight && (
                              <div className="vital-item">
                                <span className="vital-label">Weight:</span>
                                <span className="vital-value">{record.vitalSigns.weight} kg</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {record.medications && record.medications.length > 0 && (
                        <div className="record-medications">
                          <span className="medications-label">💊 Medications:</span>
                          <div className="medications-list">
                            {record.medications.map((med, index) => (
                              <div key={index} className="medication-item">
                                <span className="med-name">{med.name}</span>
                                <span className="med-details">{med.dosage} - {med.frequency}</span>
                                {med.instructions && (
                                  <span className="med-instructions">{med.instructions}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <Button 
            variant="secondary" 
            size="medium"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MedicalRecordsModal;
