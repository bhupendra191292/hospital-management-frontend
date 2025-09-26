import React, { useState } from 'react';
import { Button, ModalHeader } from './index';
import './FamilyMemberRegistrationModal.css';

const FamilyMemberRegistrationModal = ({
  isOpen,
  onClose,
  familyHead,
  onRegister
}) => {
  const [selectedRelationship, setSelectedRelationship] = useState('');

  const relationshipOptions = [
    { value: 'Child', label: 'Child' },
    { value: 'Spouse', label: 'Spouse' },
    { value: 'Parent', label: 'Parent' },
    { value: 'Sibling', label: 'Sibling' },
    { value: 'Grandchild', label: 'Grandchild' },
    { value: 'Grandparent', label: 'Grandparent' },
    { value: 'Other', label: 'Other' }
  ];

  const handleRegister = () => {
    if (selectedRelationship) {
      onRegister(selectedRelationship);
    }
  };

  if (!isOpen || !familyHead) return null;

  return (
    <div className="family-member-registration-overlay" onClick={onClose}>
      <div className="family-member-registration-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <ModalHeader
          title="Register as Family Member"
          icon="👨‍👩‍👧‍👦"
          onClose={onClose}
        />

        {/* Content */}
        <div className="modal-content">
          <div className="family-head-info">
            <h3>Family Head Information</h3>
            <div className="family-head-details">
              <div className="detail-item">
                <strong>Name:</strong> {familyHead.name}
              </div>
              <div className="detail-item">
                <strong>UHID:</strong> {familyHead.uhid}
              </div>
              <div className="detail-item">
                <strong>Mobile:</strong> {familyHead.mobile}
              </div>
              {familyHead.email && (
                <div className="detail-item">
                  <strong>Email:</strong> {familyHead.email}
                </div>
              )}
            </div>
          </div>

          <div className="relationship-selection">
            <h3>Select Relationship</h3>
            <p>How is this patient related to {familyHead.name}?</p>

            <div className="relationship-options">
              {relationshipOptions.map(option => (
                <label key={option.value} className="relationship-option">
                  <input
                    type="radio"
                    name="relationship"
                    value={option.value}
                    checked={selectedRelationship === option.value}
                    onChange={(e) => setSelectedRelationship(e.target.value)}
                  />
                  <span className="option-label">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="registration-note">
            <div className="note-icon">ℹ️</div>
            <div className="note-content">
              <p><strong>Note:</strong> This patient will be registered as a family member and can share the same contact information (phone/email) with {familyHead.name}.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <Button
            variant="default"
            size="medium"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="medium"
            onClick={handleRegister}
            disabled={!selectedRelationship}
          >
            Register as {selectedRelationship || 'Family Member'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FamilyMemberRegistrationModal;
