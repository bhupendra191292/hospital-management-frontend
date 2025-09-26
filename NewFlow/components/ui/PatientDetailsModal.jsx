import React from 'react';
import { Button, StatusBadge, Modal, ModalHeader } from './index';
import AppointmentHistory from './AppointmentHistory';
import './PatientDetailsModal.css';

const PatientDetailsModal = ({
  isOpen,
  onClose,
  patient,
  onEdit,
  onBookAppointment,
  onViewRecords,
  onSendMessage
}) => {
  if (!patient) return null;

  const getStatusColor = (status) => {
    const colors = {
      active: 'green',
      pending: 'yellow',
      inactive: 'red'
    };
    return colors[status] || 'gray';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="patient-details-modal">
      <div className="modal-content-container">
        {/* Header */}
        <ModalHeader
          title="Patient Details"
          icon="👤"
          onClose={onClose}
        />

        {/* Content */}
        <div className="modal-body">
          <div className="patient-details-grid">
            {/* Personal Information */}
            <div className="detail-section">
              <h3>📋 Personal Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Full Name</label>
                  <span>{patient.name}</span>
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <span>{patient.email || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <label>Mobile</label>
                  <span>{patient.mobile}</span>
                </div>
                <div className="detail-item">
                  <label>Age</label>
                  <span>{patient.age} years</span>
                </div>
                <div className="detail-item">
                  <label>Gender</label>
                  <span>{patient.gender}</span>
                </div>
                <div className="detail-item">
                  <label>Blood Group</label>
                  <span>{patient.bloodGroup}</span>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="detail-section">
              <h3>🏥 Medical Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>UHID</label>
                  <span className="uhid-display">{patient.uhid}</span>
                </div>
                <div className="detail-item">
                  <label>Registration Date</label>
                  <span>{formatDate(patient.registrationDate)}</span>
                </div>
                <div className="detail-item">
                  <label>Last Visit</label>
                  <span>{formatDate(patient.lastVisit)}</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <StatusBadge
                    status={patient.status}
                    variant={getStatusColor(patient.status)}
                    size="small"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="detail-section">
              <h3>🚨 Emergency Contact</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Emergency Contact</label>
                  <span>{patient.emergencyContact}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="detail-section">
              <h3>⚡ Quick Actions</h3>
              <div className="action-buttons-grid">
                <Button
                  variant="primary"
                  size="medium"
                  onClick={() => onBookAppointment(patient)}
                >
                  📅 Book Appointment
                </Button>
                <Button
                  variant="default"
                  size="medium"
                  onClick={() => onViewRecords(patient)}
                >
                  📋 View Medical Records
                </Button>
                <Button
                  variant="default"
                  size="medium"
                  onClick={() => onSendMessage(patient)}
                >
                  💬 Send Message
                </Button>
                <Button
                  variant="default"
                  size="medium"
                  onClick={() => onEdit(patient)}
                >
                  ✏️ Edit Patient
                </Button>
              </div>
            </div>

            {/* Appointment History */}
            <div className="detail-section">
              <AppointmentHistory
                patientId={patient._id}
                patientName={patient.name}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PatientDetailsModal;
