import React from 'react';
import StatusBadge from './StatusBadge';
import Button from './Button';
import './DoctorCard.css';

const DoctorCard = ({ 
  doctor, 
  onAction,
  showActions = true,
  className = ''
}) => {
  const handleAction = (action) => {
    onAction && onAction(doctor.id, action);
  };

  return (
    <div className={`doctor-card ${className}`}>
      <div className="doctor-header">
        <div className="doctor-info">
          <h3 className="doctor-name">{doctor.name}</h3>
          <div className="doctor-rating">
            <span className="rating">⭐ {doctor.rating}</span>
            <span className="experience">{doctor.experience}</span>
          </div>
        </div>
      </div>
      
      <div className="doctor-specialization-section">
        <span className="doctor-specialization">{doctor.specialization}</span>
      </div>
      
      <div className="doctor-stats">
        <div className="stat">
          <span className="stat-value">{doctor.patients}</span>
          <span className="stat-label">Patients</span>
        </div>
        <div className="stat">
          <StatusBadge status={doctor.status} />
        </div>
      </div>
      
      {showActions && (
        <div className="doctor-actions">
          {doctor.status === 'pending' && (
            <Button 
              variant="default"
              size="small"
              onClick={() => handleAction('approve')}
            >
              Approve
            </Button>
          )}
          <Button 
            variant="default"
            size="small"
            onClick={() => handleAction('view')}
          >
            View Profile
          </Button>
          <Button 
            variant="default"
            size="small"
            onClick={() => handleAction('edit')}
          >
            Edit
          </Button>
        </div>
      )}
    </div>
  );
};

export default DoctorCard;
