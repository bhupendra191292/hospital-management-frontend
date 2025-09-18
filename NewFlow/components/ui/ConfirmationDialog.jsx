import React from 'react';
import './ConfirmationDialog.css';

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = "danger" // danger, warning, info
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="confirmation-dialog-backdrop" onClick={handleBackdropClick}>
      <div className="confirmation-dialog">
        <div className="confirmation-dialog-header">
          <h3 className="confirmation-dialog-title">{title}</h3>
          <button 
            className="confirmation-dialog-close"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>
        
        <div className="confirmation-dialog-body">
          <p className="confirmation-dialog-message">{message}</p>
        </div>
        
        <div className="confirmation-dialog-footer">
          <button 
            className="confirmation-dialog-button cancel"
            onClick={onClose}
            type="button"
          >
            {cancelText}
          </button>
          <button 
            className={`confirmation-dialog-button confirm ${variant}`}
            onClick={onConfirm}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
