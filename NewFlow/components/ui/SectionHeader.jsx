import React from 'react';
import Button from './Button';
import './SectionHeader.css';

const SectionHeader = ({
  title,
  icon,
  primaryAction,
  secondaryAction,
  className = ''
}) => {
  return (
    <div className={`section-header ${className}`}>
      <h2 className="section-title">
        {icon && <span className="section-icon">{icon}</span>}
        {title}
      </h2>
      {(primaryAction || secondaryAction) && (
        <div className="section-actions">
          {primaryAction && (
            <Button
              variant="primary"
              size="medium"
              onClick={primaryAction.onClick}
            >
              {primaryAction.text}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="default"
              size="medium"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.text}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
