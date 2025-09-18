import React from 'react';
import { Modal, Button } from './index';
import './DoctorProfileModal.css';

const DoctorProfileModal = ({ isOpen, onClose, doctor, onApprove, onReject, isProcessing }) => {
  if (!doctor) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleApprove = () => {
    onApprove(doctor._id);
    onClose();
  };

  const handleReject = () => {
    onReject(doctor);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="👨‍⚕️ Doctor Profile Review"
      size="large"
    >
      <div className="doctor-profile-content">
        {/* Header Section */}
        <div className="profile-header">
          <div className="doctor-avatar-large">
            {doctor.name.charAt(0).toUpperCase()}
          </div>
          <div className="doctor-basic-info">
            <h2>{doctor.name}</h2>
            <p className="doctor-email">{doctor.email}</p>
            <p className="doctor-phone">📞 {doctor.phone}</p>
            <div className="specialization-badge-large">
              {doctor.specialization}
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="profile-section">
          <h3>🎓 Professional Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Qualification:</label>
              <span>{doctor.qualification}</span>
            </div>
            <div className="info-item">
              <label>Experience:</label>
              <span>{doctor.experience} years</span>
            </div>
            <div className="info-item">
              <label>Consultation Fee:</label>
              <span>₹{doctor.consultationFee}</span>
            </div>
            <div className="info-item">
              <label>Doctor ID:</label>
              <span className="doctor-id">{doctor.doctorId}</span>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="profile-section">
          <h3>📅 Availability</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Available Days:</label>
              <span>{doctor.availableDays?.join(', ') || 'Not specified'}</span>
            </div>
            <div className="info-item">
              <label>Available Time:</label>
              <span>{doctor.availableTime || 'Not specified'}</span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="profile-section">
          <h3>📞 Contact Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Phone Number:</label>
              <span>{doctor.phone}</span>
            </div>
            <div className="info-item">
              <label>Email Address:</label>
              <span>{doctor.email}</span>
            </div>
            <div className="info-item">
              <label>Address:</label>
              <span>{doctor.address || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="profile-section">
          <h3>📋 Additional Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Registration Date:</label>
              <span>{formatDate(doctor.createdAt)}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className={`status-badge status-${doctor.status}`}>
                {doctor.status}
              </span>
            </div>
            <div className="info-item">
              <label>Tenant ID:</label>
              <span>{doctor.tenantId}</span>
            </div>
          </div>
        </div>

        {/* Bio/Description */}
        {doctor.bio && (
          <div className="profile-section">
            <h3>📝 Bio</h3>
            <div className="bio-content">
              {doctor.bio}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="profile-actions">
          <Button
            onClick={handleApprove}
            variant="success"
            size="large"
            disabled={isProcessing}
          >
            ✅ Approve Doctor
          </Button>
          <Button
            onClick={handleReject}
            variant="danger"
            size="large"
            disabled={isProcessing}
          >
            ❌ Reject Doctor
          </Button>
          <Button
            onClick={onClose}
            variant="default"
            size="large"
            disabled={isProcessing}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DoctorProfileModal;
