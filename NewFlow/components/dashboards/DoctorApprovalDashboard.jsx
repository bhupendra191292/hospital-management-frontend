import React, { useState, useEffect } from 'react';
import { Button, Modal } from '../ui';
import DoctorProfileModal from '../ui/DoctorProfileModal';
import { getPendingNewFlowDoctors, approveNewFlowDoctor, rejectNewFlowDoctor } from '../../services/api';
import './DoctorApprovalDashboard.css';

const DoctorApprovalDashboard = ({ onBack }) => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadPendingDoctors();
  }, []);

  const loadPendingDoctors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getPendingNewFlowDoctors();
      
      if (response.data.success) {
        setPendingDoctors(response.data.data);
      } else {
        setError('Failed to load pending doctors');
      }
    } catch (error) {
      console.error('Error loading pending doctors:', error);
      setError('Failed to load pending doctors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (doctorId) => {
    try {
      setIsProcessing(true);
      const response = await approveNewFlowDoctor(doctorId);
      
      if (response.data.success) {
        // Remove the approved doctor from pending list
        setPendingDoctors(prev => prev.filter(doctor => doctor._id !== doctorId));
        alert('Doctor approved successfully!');
      } else {
        alert('Failed to approve doctor');
      }
    } catch (error) {
      console.error('Error approving doctor:', error);
      alert('Failed to approve doctor');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDoctor || !rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setIsProcessing(true);
      const response = await rejectNewFlowDoctor(selectedDoctor._id, rejectReason);
      
      if (response.data.success) {
        // Remove the rejected doctor from pending list
        setPendingDoctors(prev => prev.filter(doctor => doctor._id !== selectedDoctor._id));
        setShowRejectModal(false);
        setSelectedDoctor(null);
        setRejectReason('');
        alert('Doctor rejected successfully!');
      } else {
        alert('Failed to reject doctor');
      }
    } catch (error) {
      console.error('Error rejecting doctor:', error);
      alert('Failed to reject doctor');
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedDoctor(null);
    setRejectReason('');
  };

  const openProfileModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedDoctor(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="doctor-approval-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading pending doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-approval-dashboard">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <Button onClick={loadPendingDoctors} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-approval-dashboard">
      <div className="approval-header">
        <div className="header-content">
          <h1>👨‍⚕️ Doctor Approval Dashboard</h1>
          <p>Review and approve pending doctor registrations</p>
        </div>
        <div className="header-actions">
          <Button onClick={onBack} variant="default">
            ← Back
          </Button>
          <Button onClick={loadPendingDoctors} variant="primary">
            🔄 Refresh
          </Button>
        </div>
      </div>

      <div className="approval-stats">
        <div className="stat-card">
          <div className="stat-number">{pendingDoctors.length}</div>
          <div className="stat-label">Pending Approvals</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{pendingDoctors.filter(d => d.specialization === 'Cardiology').length}</div>
          <div className="stat-label">Cardiology</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{pendingDoctors.filter(d => d.specialization === 'General Medicine').length}</div>
          <div className="stat-label">General Medicine</div>
        </div>
      </div>

      {pendingDoctors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>No Pending Approvals</h3>
          <p>All doctor registrations have been reviewed.</p>
        </div>
      ) : (
        <div className="pending-doctors-list">
          {pendingDoctors.map(doctor => (
            <div key={doctor._id} className="doctor-card">
              <div className="doctor-info">
                <div className="doctor-avatar">
                  {doctor.name.charAt(0)}
                </div>
                <div className="doctor-details">
                  <h3>{doctor.name}</h3>
                  <p className="doctor-email">{doctor.email}</p>
                  <p className="doctor-phone">📞 {doctor.phone}</p>
                  <div className="doctor-specialization">
                    <span className="specialization-badge">{doctor.specialization}</span>
                  </div>
                </div>
              </div>

              <div className="doctor-meta">
                <div className="meta-item">
                  <strong>Qualification:</strong> {doctor.qualification}
                </div>
                <div className="meta-item">
                  <strong>Experience:</strong> {doctor.experience} years
                </div>
                <div className="meta-item">
                  <strong>Consultation Fee:</strong> ₹{doctor.consultationFee}
                </div>
                <div className="meta-item">
                  <strong>Available Days:</strong> {doctor.availableDays?.join(', ')}
                </div>
                <div className="meta-item">
                  <strong>Registered:</strong> {formatDate(doctor.createdAt)}
                </div>
              </div>

              <div className="doctor-actions">
                <Button
                  onClick={() => openProfileModal(doctor)}
                  variant="primary"
                  size="medium"
                  disabled={isProcessing}
                >
                  👁️ View Profile
                </Button>
                <Button
                  onClick={() => handleApprove(doctor._id)}
                  variant="success"
                  size="medium"
                  disabled={isProcessing}
                >
                  ✅ Approve
                </Button>
                <Button
                  onClick={() => openRejectModal(doctor)}
                  variant="danger"
                  size="medium"
                  disabled={isProcessing}
                >
                  ❌ Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doctor Profile Modal */}
      <DoctorProfileModal
        isOpen={showProfileModal}
        onClose={closeProfileModal}
        doctor={selectedDoctor}
        onApprove={handleApprove}
        onReject={openRejectModal}
        isProcessing={isProcessing}
      />

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={closeRejectModal}
        title="Reject Doctor Registration"
        size="medium"
      >
        <div className="reject-modal-content">
          <div className="doctor-summary">
            <h4>Doctor Information:</h4>
            <p><strong>Name:</strong> {selectedDoctor?.name}</p>
            <p><strong>Email:</strong> {selectedDoctor?.email}</p>
            <p><strong>Specialization:</strong> {selectedDoctor?.specialization}</p>
          </div>

          <div className="form-group">
            <label htmlFor="rejectReason">Reason for Rejection *</label>
            <textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this doctor registration..."
              rows="4"
              className="reject-reason-textarea"
            />
          </div>

          <div className="modal-actions">
            <Button
              onClick={closeRejectModal}
              variant="default"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              variant="danger"
              disabled={isProcessing || !rejectReason.trim()}
            >
              {isProcessing ? 'Rejecting...' : 'Reject Doctor'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorApprovalDashboard;
