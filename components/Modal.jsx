import React from 'react';
import './Modal.css';

const Modal = ({ title, onClose, children, width = '500px' }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width }}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="close-button">✖</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
