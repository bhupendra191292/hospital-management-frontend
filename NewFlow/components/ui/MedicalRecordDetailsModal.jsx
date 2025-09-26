import React from 'react';
import { Modal, ModalHeader, Button } from './index';
import './MedicalRecordDetailsModal.css';

const MedicalRecordDetailsModal = ({
  isOpen,
  onClose,
  record,
  onEdit,
  onDelete
}) => {
  if (!record) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Emergency': return '#dc3545';
      case 'High': return '#fd7e14';
      case 'Normal': return '#28a745';
      case 'Low': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#007bff';
      case 'Completed': return '#28a745';
      case 'Pending': return '#ffc107';
      case 'Archived': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getRecordTypeIcon = (type) => {
    switch (type) {
      case 'Visit': return '🏥';
      case 'Lab': return '🧪';
      case 'Radiology': return '📷';
      case 'Prescription': return '💊';
      case 'Procedure': return '⚕️';
      default: return '📋';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <ModalHeader
        title={`${getRecordTypeIcon(record.recordType)} Medical Record Details`}
        onClose={onClose}
      />

      <div className="medical-record-details">
        <div className="record-header">
          <div className="record-meta">
            <div className="record-type">
              <span className="type-icon">{getRecordTypeIcon(record.recordType)}</span>
              <span className="type-label">{record.recordType}</span>
            </div>
            <div className="record-status">
              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(record.status) }}
              >
                {record.status}
              </span>
              <span
                className="priority-badge"
                style={{ backgroundColor: getPriorityColor(record.priority) }}
              >
                {record.priority}
              </span>
            </div>
          </div>
          <div className="record-dates">
            <div className="date-item">
              <span className="date-label">Created:</span>
              <span className="date-value">{formatDate(record.createdAt)}</span>
            </div>
            <div className="date-item">
              <span className="date-label">Updated:</span>
              <span className="date-value">{formatDate(record.updatedAt)}</span>
            </div>
          </div>
        </div>

        <div className="record-content">
          {/* Patient & Doctor Info */}
          <div className="info-section">
            <h3>👤 Patient & Doctor Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Patient:</span>
                <span className="info-value">{record.patientName || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Doctor:</span>
                <span className="info-value">{record.doctorName || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Chief Complaint */}
          {record.chiefComplaint && (
            <div className="info-section">
              <h3>📝 Chief Complaint</h3>
              <div className="info-content">
                {record.chiefComplaint}
              </div>
            </div>
          )}

          {/* Symptoms */}
          {record.symptoms && record.symptoms.length > 0 && (
            <div className="info-section">
              <h3>🩺 Symptoms</h3>
              <div className="symptoms-list">
                {record.symptoms.map((symptom, index) => (
                  <span key={index} className="symptom-tag">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Diagnosis */}
          {record.diagnosis && (
            <div className="info-section">
              <h3>🔍 Diagnosis</h3>
              <div className="info-content">
                {record.diagnosis}
              </div>
            </div>
          )}

          {/* Treatment */}
          {record.treatment && (
            <div className="info-section">
              <h3>💊 Treatment</h3>
              <div className="info-content">
                {record.treatment}
              </div>
            </div>
          )}

          {/* Vital Signs */}
          {record.vitalSigns && Object.values(record.vitalSigns).some(value => value) && (
            <div className="info-section">
              <h3>💓 Vital Signs</h3>
              <div className="vital-signs-grid">
                {record.vitalSigns.bloodPressure && (
                  <div className="vital-sign-item">
                    <span className="vital-label">Blood Pressure:</span>
                    <span className="vital-value">{record.vitalSigns.bloodPressure}</span>
                  </div>
                )}
                {record.vitalSigns.heartRate && (
                  <div className="vital-sign-item">
                    <span className="vital-label">Heart Rate:</span>
                    <span className="vital-value">{record.vitalSigns.heartRate} bpm</span>
                  </div>
                )}
                {record.vitalSigns.temperature && (
                  <div className="vital-sign-item">
                    <span className="vital-label">Temperature:</span>
                    <span className="vital-value">{record.vitalSigns.temperature}°F</span>
                  </div>
                )}
                {record.vitalSigns.respiratoryRate && (
                  <div className="vital-sign-item">
                    <span className="vital-label">Respiratory Rate:</span>
                    <span className="vital-value">{record.vitalSigns.respiratoryRate}</span>
                  </div>
                )}
                {record.vitalSigns.oxygenSaturation && (
                  <div className="vital-sign-item">
                    <span className="vital-label">Oxygen Saturation:</span>
                    <span className="vital-value">{record.vitalSigns.oxygenSaturation}%</span>
                  </div>
                )}
                {record.vitalSigns.weight && (
                  <div className="vital-sign-item">
                    <span className="vital-label">Weight:</span>
                    <span className="vital-value">{record.vitalSigns.weight} kg</span>
                  </div>
                )}
                {record.vitalSigns.height && (
                  <div className="vital-sign-item">
                    <span className="vital-label">Height:</span>
                    <span className="vital-value">{record.vitalSigns.height} cm</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prescription */}
          {record.prescription && record.prescription.length > 0 && (
            <div className="info-section">
              <h3>💊 Prescription</h3>
              <div className="prescription-list">
                {record.prescription.map((med, index) => (
                  <div key={index} className="prescription-item">
                    <div className="medication-name">
                      <strong>{med.medication}</strong>
                      <span className="dosage">{med.dosage}</span>
                    </div>
                    <div className="medication-details">
                      <span className="frequency">{med.frequency}</span>
                      <span className="duration">for {med.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lab Results */}
          {record.labResults && record.labResults.length > 0 && (
            <div className="info-section">
              <h3>🧪 Lab Results</h3>
              <div className="lab-results-list">
                {record.labResults.map((result, index) => (
                  <div key={index} className="lab-result-item">
                    <div className="test-name">
                      <strong>{result.testName}</strong>
                    </div>
                    <div className="test-result">
                      <span className="result-value">{result.result}</span>
                      <span className="result-unit">{result.unit}</span>
                    </div>
                    <div className="test-range">
                      <small>Normal range: {result.normalRange}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up */}
          {record.followUpRequired && (
            <div className="info-section">
              <h3>📅 Follow-up</h3>
              <div className="follow-up-info">
                <div className="follow-up-item">
                  <span className="follow-up-label">Follow-up Required:</span>
                  <span className="follow-up-value">Yes</span>
                </div>
                {record.followUpDate && (
                  <div className="follow-up-item">
                    <span className="follow-up-label">Follow-up Date:</span>
                    <span className="follow-up-value">{formatDate(record.followUpDate)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <div className="info-section">
              <h3>📝 Additional Notes</h3>
              <div className="info-content">
                {record.notes}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="record-actions">
          <Button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </Button>
          {onEdit && (
            <Button
              onClick={() => onEdit(record)}
              className="btn-primary"
            >
              Edit Record
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={() => onDelete(record)}
              className="btn-danger"
            >
              Delete Record
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default MedicalRecordDetailsModal;
