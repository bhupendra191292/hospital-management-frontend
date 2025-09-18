import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'medium',
  disabled = false,
  className = '',
  ...props 
}) => {
  // Validate variant
  const validVariants = ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'emergency'];
  const validSizes = ['small', 'medium', 'large'];
  
  const finalVariant = validVariants.includes(variant) ? variant : 'default';
  const finalSize = validSizes.includes(size) ? size : 'medium';
  
  const buttonClasses = [
    'btn',
    `btn-${finalVariant}`,
    `btn-${finalSize}`,
    disabled ? 'btn-disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
