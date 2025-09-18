import React from 'react';
import { Button, Modal, ModalHeader } from './index';
import './DuplicateWarningModal.css';

const DuplicateWarningModal = ({ 
  isOpen, 
  onClose, 
  duplicates, 
  onContinue, 
  onViewExisting,
  onRegisterAsFamilyMember 
}) => {
  if (!isOpen || !duplicates || duplicates.length === 0) return null;

  const handleContinue = () => {
    onContinue();
    onClose();
  };

  const handleViewExisting = (patient) => {
    onViewExisting(patient);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="duplicate-warning-modal">
      <div className="modal-content-container">
        {/* Header */}
        <ModalHeader
          title="Duplicate Patient Detected"
          icon="⚠️"
          onClose={onClose}
          closeButtonText="✕"
        />

        {/* Content */}
        <div className="modal-body">
          <div className="warning-message">
            <p>We found {duplicates.length} potential duplicate{duplicates.length > 1 ? 's' : ''} in our system:</p>
          </div>

          <div className="duplicates-list">
            {duplicates.map((duplicate, index) => (
              <div key={index} className="duplicate-item">
                <div className="duplicate-info">
                  <div className="duplicate-type">
                    {duplicate.type === 'exact_duplicate' && '⚠️ Exact Duplicate'}
                    {duplicate.type === 'contact_match' && '📧📱 Contact Match'}
                    {duplicate.type === 'email' && '📧 Email Match'}
                    {duplicate.type === 'mobile' && '📱 Mobile Match'}
                    {duplicate.type === 'family_member_candidate' && '👨‍👩‍👧‍👦 Family Member Candidate'}
                    {duplicate.type === 'name_mobile' && '👤 Name + Mobile Match'}
                    {duplicate.type === 'family_member_info' && '👨‍👩‍👧‍👦 Family Member Info'}
                  </div>
                  <div className="duplicate-message">{duplicate.message}</div>
                  <div className="existing-patient-info">
                    <strong>Existing Patient:</strong> {duplicate.existingPatient.name} 
                    <span className="uhid"> (UHID: {duplicate.existingPatient.uhid})</span>
                    {duplicate.existingPatient.isFamilyMember && (
                      <span className="family-info"> - {duplicate.existingPatient.relationshipToHead || 'Family Member'}</span>
                    )}
                  </div>
                </div>
                <div className="duplicate-actions">
                  <Button 
                    variant="default" 
                    size="small"
                    onClick={() => handleViewExisting(duplicate.existingPatient)}
                  >
                    👁️ View Patient
                  </Button>
                  {duplicate.canBeFamilyMember && (
                    <Button 
                      variant="success" 
                      size="small"
                      onClick={() => onRegisterAsFamilyMember(duplicate.existingPatient)}
                    >
                      👨‍👩‍👧‍👦 Register as Family Member
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="modal-footer-actions">
            <div className="action-buttons">
              <Button 
                variant="default" 
                size="medium"
                onClick={onClose}
              >
                Cancel Registration
              </Button>
              <Button 
                variant="warning" 
                size="medium"
                onClick={handleContinue}
              >
                ⚠️ Continue Anyway
              </Button>
            </div>
            <div className="warning-note">
              <p>⚠️ <strong>Warning:</strong> Creating duplicate patients can cause data inconsistencies and billing issues. Please review the existing patient information before proceeding.</p>
              {duplicates.some(d => d.type === 'contact_match') && (
                <p>📧📱 <strong>Contact Match:</strong> Both email and phone number match an existing patient. This is likely the same person or a family member sharing contact information.</p>
              )}
              {duplicates.some(d => d.type === 'family_member_candidate') && (
                <p>👨‍👩‍👧‍👦 <strong>Family Member Option:</strong> Different name with same phone number suggests this might be a family member. You can register them as a family member to share contact information.</p>
              )}
              {duplicates.some(d => d.type === 'exact_duplicate') && (
                <p>⚠️ <strong>Exact Duplicate:</strong> Same name and phone number indicates this is likely the same person. However, this could also be a family member (like father/son with same name). Please review carefully before proceeding.</p>
              )}
              {duplicates.some(d => d.type === 'family_member_info') && (
                <p>ℹ️ <strong>Note:</strong> Family members can share contact information. The "Family Member Info" entries are informational only and won't block registration.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DuplicateWarningModal;
