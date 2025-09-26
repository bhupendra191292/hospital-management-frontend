// import React from 'react'; // Not needed in modern React
import './StatusBadge.css';

const StatusBadge = ({ status, children }) => {
  return (
    <span className={`status-badge ${status}`}>
      {children || status}
    </span>
  );
};

export default StatusBadge;
