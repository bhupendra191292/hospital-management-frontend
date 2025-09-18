import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status, children }) => {
  return (
    <span className={`status-badge ${status}`}>
      {children || status}
    </span>
  );
};

export default StatusBadge;
