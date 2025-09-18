import React, { memo, forwardRef } from 'react';
import { handlePhoneInputChange } from '../utils/phoneUtils';

// Strategy pattern for different phone formats
export const phoneValidationStrategies = {
  US: (phone) => /^\d{10}$/.test(phone),
  International: (phone) => /^\d{10,15}$/.test(phone),
  Flexible: (phone) => /^\d{7,15}$/.test(phone),
};

/**
 * Enhanced Phone Input Component with Dependency Injection and Strategy Pattern
 * 
 * Features:
 * - Dependency injection for validation and formatting
 * - Strategy pattern for different phone formats
 * - Interface segregation for better maintainability
 * - Performance optimization with memo
 * - Enhanced accessibility
 * - Error handling and validation feedback
 * 
 * @param props - Component props with enhanced interface segregation
 */
const PhoneInput = memo(forwardRef(({
  value,
  onChange,
  placeholder = "Phone number (numbers only)",
  name = "phone",
  className = "form-input",
  required = false,
  maxLength = 15,
  id,
  validationStrategy = 'US',
  validationFn = handlePhoneInputChange,
  formatFn,
  error,
  helperText,
  disabled = false,
  readOnly = false,
  autoComplete = "tel",
  onBlur,
  onFocus,
  onKeyDown,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...otherProps
}, ref) => {
  
  const handleChange = (e) => {
    if (disabled || readOnly) return;
    
    const newValue = e.target.value;
    // Only allow numeric characters
    if (!/^\d*$/.test(newValue)) {
      return;
    }
    
    // Limit length
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const handleBlur = (e) => {
    if (formatFn && value) {
      const formatted = formatFn(value);
      onChange(formatted);
    }
    onBlur?.(e);
  };

  const isInvalid = Boolean(error || ariaInvalid);
  const inputClassName = `${className} ${isInvalid ? 'error' : ''} ${disabled ? 'disabled' : ''}`.trim();

  // Generate IDs for ARIA describedby
  const fieldId = id || `field-${name}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const helperId = helperText ? `${fieldId}-helper` : undefined;
  const describedBy = [ariaDescribedBy, errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="phone-input-container">
      <input
        ref={ref}
        type="tel"
        name={name}
        id={fieldId}
        className={inputClassName}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        pattern="[0-9]*"
        inputMode="numeric"
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-label={ariaLabel || placeholder}
        aria-describedby={describedBy}
        aria-invalid={isInvalid}
        aria-required={required}
        {...otherProps}
      />
      
      {/* Error and helper text display */}
      {error && (
        <div 
          className="phone-input-message error"
          id={errorId}
        >
          {error}
        </div>
      )}
      
      {helperText && !error && (
        <div 
          className="phone-input-message helper"
          id={helperId}
        >
          {helperText}
        </div>
      )}
      
      {/* Validation indicator */}
      {value && !isInvalid && (
        <div className="phone-input-validation" aria-hidden="true">
          {phoneValidationStrategies[validationStrategy](value) ? '✅' : '⚠️'}
        </div>
      )}
    </div>
  );
}));

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
