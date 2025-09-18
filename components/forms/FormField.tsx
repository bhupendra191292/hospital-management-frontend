import React, { forwardRef, memo } from 'react';

// Interface segregation for form field props
interface FormFieldBase {
  id?: string;
  name: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}

interface FormFieldAccessibility extends FormFieldBase {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

interface FormFieldProps extends FormFieldAccessibility {
  children: React.ReactNode;
  layout?: 'vertical' | 'horizontal';
  labelPosition?: 'top' | 'left' | 'right';
  labelWidth?: string;
  showRequiredIndicator?: boolean;
  showErrorIcon?: boolean;
  showHelperText?: boolean;
}

/**
 * Reusable Form Field Component with Composition Pattern
 * 
 * Features:
 * - Composition over inheritance
 * - Interface segregation
 * - Enhanced accessibility
 * - Flexible layout options
 * - Error handling and validation display
 * 
 * @param props - Form field configuration
 */
const FormField = memo(forwardRef<HTMLDivElement, FormFieldProps>(({
  id,
  name,
  label,
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  children,
  layout = 'vertical',
  labelPosition = 'top',
  labelWidth = 'auto',
  showRequiredIndicator = true,
  showErrorIcon = true,
  showHelperText = true,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...otherProps
}, ref) => {
  
  const fieldId = id || `field-${name}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const helperId = helperText ? `${fieldId}-helper` : undefined;
  const describedBy = [ariaDescribedBy, errorId, helperId].filter(Boolean).join(' ');

  const isInvalid = error || ariaInvalid;
  const fieldClassName = `form-field ${className} ${layout} ${isInvalid ? 'error' : ''} ${disabled ? 'disabled' : ''}`.trim();

  const renderLabel = () => {
    if (!label) return null;

    return (
      <label 
        htmlFor={fieldId}
        className={`form-label ${labelPosition}`}
        style={labelPosition === 'left' ? { width: labelWidth } : undefined}
      >
        {label}
        {required && showRequiredIndicator && (
          <span className="required-indicator" aria-label="required">*</span>
        )}
      </label>
    );
  };

  const renderError = () => {
    if (!error || !showErrorIcon) return null;

    return (
      <div 
        id={errorId}
        className="form-error"
        role="alert"
        aria-live="polite"
      >
        {showErrorIcon && <span className="error-icon">⚠️</span>}
        <span className="error-message">{error}</span>
      </div>
    );
  };

  const renderHelperText = () => {
    if (!helperText || !showHelperText) return null;

    return (
      <div 
        id={helperId}
        className="form-helper-text"
      >
        {helperText}
      </div>
    );
  };

  return (
    <div 
      ref={ref}
      className={fieldClassName}
      {...otherProps}
    >
      {layout === 'horizontal' && labelPosition === 'left' && renderLabel()}
      
      {layout === 'vertical' && renderLabel()}
      
      <div className="form-field-content">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          name,
          'aria-label': ariaLabel || label,
          'aria-describedby': describedBy || undefined,
          'aria-invalid': isInvalid,
          'aria-required': required,
          disabled,
          className: `form-input ${isInvalid ? 'error' : ''}`.trim(),
        })}
        
        {renderError()}
        {renderHelperText()}
      </div>
      
      {layout === 'horizontal' && labelPosition === 'right' && renderLabel()}
    </div>
  );
}));

FormField.displayName = 'FormField';

export default FormField;
