import React from 'react';
import { Modal, ModalHeader, Button, StatusBadge } from './index';
import './AppointmentDetailsModal.css';

const AppointmentDetailsModal = ({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onDelete
}) => {
  if (!appointment) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'blue';
      case 'confirmed': return 'green';
      case 'in-progress': return 'orange';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      case 'no-show': return 'gray';
      default: return 'blue';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Emergency': return 'red';
      case 'High': return 'orange';
      case 'Normal': return 'blue';
      case 'Low': return 'green';
      default: return 'blue';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <ModalHeader title="Appointment Details" onClose={onClose} />

      <div className="appointment-details">
        <div className="details-header">
          <div className="appointment-id">
            <span className="label">Appointment ID:</span>
            <span className="value">{appointment._id}</span>
          </div>
          <div className="appointment-status">
            <StatusBadge
              status={appointment.status}
              color={getStatusColor(appointment.status)}
            />
          </div>
        </div>

        <div className="details-grid">
          <div className="detail-section">
            <h3>👤 Patient Information</h3>
            <div className="detail-item">
              <span className="label">Name:</span>
              <span className="value">{appointment.patientName || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Mobile:</span>
              <span className="value">{appointment.patientMobile || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Email:</span>
              <span className="value">{appointment.patientEmail || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Age:</span>
              <span className="value">{appointment.patientAge || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Gender:</span>
              <span className="value">{appointment.patientGender || 'N/A'}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>👨‍⚕️ Doctor Information</h3>
            <div className="detail-item">
              <span className="label">Name:</span>
              <span className="value">{appointment.doctorName || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Department:</span>
              <span className="value">{appointment.department || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Specialization:</span>
              <span className="value">{appointment.doctorSpecialization || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Consultation Fee:</span>
              <span className="value">
                {appointment.consultationFee ? `₹${appointment.consultationFee}` : 'N/A'}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <h3>📅 Appointment Details</h3>
            <div className="detail-item">
              <span className="label">Date:</span>
              <span className="value">{formatDate(appointment.appointmentDate)}</span>
            </div>
            <div className="detail-item">
              <span className="label">Time:</span>
              <span className="value">{formatTime(appointment.appointmentTime)}</span>
            </div>
            <div className="detail-item">
              <span className="label">Visit Type:</span>
              <span className="value">{appointment.visitType || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Priority:</span>
              <StatusBadge
                status={appointment.priority}
                color={getPriorityColor(appointment.priority)}
              />
            </div>
            <div className="detail-item">
              <span className="label">Duration:</span>
              <span className="value">{appointment.duration || '30 minutes'}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>🏥 Medical Information</h3>
            <div className="detail-item">
              <span className="label">Chief Complaint:</span>
              <span className="value">{appointment.chiefComplaint || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Symptoms:</span>
              <span className="value">
                {appointment.symptoms && appointment.symptoms.length > 0
                  ? appointment.symptoms.join(', ')
                  : 'N/A'
                }
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Previous Medical History:</span>
              <span className="value">{appointment.medicalHistory || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Allergies:</span>
              <span className="value">{appointment.allergies || 'None reported'}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>💰 Financial Information</h3>
            <div className="detail-item">
              <span className="label">Estimated Cost:</span>
              <span className="value">
                {appointment.estimatedCost ? `₹${appointment.estimatedCost}` : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Insurance Provider:</span>
              <span className="value">{appointment.insuranceProvider || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Insurance Number:</span>
              <span className="value">{appointment.insuranceNumber || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Payment Status:</span>
              <span className="value">{appointment.paymentStatus || 'Pending'}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>📝 Additional Information</h3>
            <div className="detail-item">
              <span className="label">Notes:</span>
              <span className="value">{appointment.notes || 'No additional notes'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Created At:</span>
              <span className="value">
                {appointment.createdAt
                  ? new Date(appointment.createdAt).toLocaleString('en-IN')
                  : 'N/A'
                }
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Updated At:</span>
              <span className="value">
                {appointment.updatedAt
                  ? new Date(appointment.updatedAt).toLocaleString('en-IN')
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>

        <div className="details-actions">
          <Button
            onClick={onEdit}
            className="btn-primary"
          >
            Edit Appointment
          </Button>
          <Button
            onClick={onDelete}
            className="btn-danger"
          >
            Delete Appointment
          </Button>
          <Button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AppointmentDetailsModal;
