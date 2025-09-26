import React from 'react';
import './ModalHeader.css';

const ModalHeader = ({
  title,
  icon,
  onClose,
  closeButtonText = '✕ Close',
  className = ''
}) => {
  return (
    <div className={`modal-header ${className}`}>
      <div className="header-left">
        <h2>
          {icon && <span className="header-icon">{icon}</span>}
          {title}
        </h2>
      </div>
      <div className="header-actions">
        <button
          type="button"
          className="close-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
        >
          {closeButtonText}
        </button>
      </div>
    </div>
  );
};

export default ModalHeader;
