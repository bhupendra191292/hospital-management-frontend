import React from 'react';
import Button from './Button';
import './MetricCard.css';

const MetricCard = ({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  buttonText,
  onButtonClick,
  variant = 'default'
}) => {
  return (
    <div className={`metric-card ${variant}`}>
      <div className="metric-header">
        <div className={`metric-icon ${variant}`}>
          {icon}
        </div>
        {trend && (
          <div className="metric-trend positive">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
            </svg>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="metric-content">
        <div className="metric-value">{value}</div>
        <div className="metric-label">{title}</div>
        {description && <div className="metric-description">{description}</div>}
      </div>
      {buttonText && onButtonClick && (
        <div className="metric-action">
          <Button variant="default" size="small" onClick={onButtonClick}>
            {buttonText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
