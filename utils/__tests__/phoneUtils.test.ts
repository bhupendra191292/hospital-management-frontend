import { describe, it, expect } from 'vitest';
import {
  isNumericOnly,
  formatPhoneNumber,
  isValidPhoneNumber,
  handlePhoneInputChange,
  getNumericPhone,
  processPhoneNumber,
  phoneFormats,
  PhoneValidatorFactory
} from '../phoneUtils';

describe('Phone Utils', () => {
  describe('isNumericOnly', () => {
    it('should return true for numeric strings', () => {
      expect(isNumericOnly('1234567890')).toBe(true);
      expect(isNumericOnly('')).toBe(true);
    });

    it('should return false for non-numeric strings', () => {
      expect(isNumericOnly('123abc')).toBe(false);
      expect(isNumericOnly('abc123')).toBe(false);
      expect(isNumericOnly('123-456-7890')).toBe(false);
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 10-digit numbers correctly', () => {
      expect(formatPhoneNumber('1234567890')).toBe('123-456-7890');
    });

    it('should format 11-digit numbers starting with 1', () => {
      expect(formatPhoneNumber('11234567890', 'International')).toBe('+1 123-456-7890');
    });

    it('should handle already formatted numbers', () => {
      expect(formatPhoneNumber('123-456-7890')).toBe('123-456-7890');
      expect(formatPhoneNumber('+1 123-456-7890', 'International')).toBe('+1 123-456-7890');
    });

    it('should handle short numbers', () => {
      expect(formatPhoneNumber('123')).toBe('123');
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should validate 10-digit numbers', () => {
      expect(isValidPhoneNumber('1234567890')).toBe(true);
      expect(isValidPhoneNumber('123456789')).toBe(false);
    });

    it('should validate 11-digit numbers starting with 1', () => {
      expect(isValidPhoneNumber('11234567890', 'International')).toBe(true);
      expect(isValidPhoneNumber('123456789', 'International')).toBe(false);
    });

    it('should reject invalid numbers', () => {
      expect(isValidPhoneNumber('123456789012')).toBe(false);
      expect(isValidPhoneNumber('abc123def')).toBe(false);
    });
  });

  describe('getNumericPhone', () => {
    it('should extract numeric characters only', () => {
      expect(getNumericPhone('123-456-7890')).toBe('1234567890');
      expect(getNumericPhone('+1 (123) 456-7890')).toBe('11234567890');
    });

    it('should handle already numeric strings', () => {
      expect(getNumericPhone('1234567890')).toBe('1234567890');
    });
  });

  describe('processPhoneNumber', () => {
    it('should process valid phone numbers', () => {
      const result = processPhoneNumber('1234567890');
      expect(result.isValid).toBe(true);
      expect(result.numericPhone).toBe('1234567890');
      expect(result.formattedPhone).toBe('123-456-7890');
      expect(result.strategy).toBe('US');
    });

    it('should handle empty phone numbers', () => {
      const result = processPhoneNumber('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Phone number is required');
    });

    it('should handle invalid phone numbers', () => {
      const result = processPhoneNumber('123456789');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid US phone number');
    });

    it('should handle formatted phone numbers', () => {
      const result = processPhoneNumber('123-456-7890');
      expect(result.isValid).toBe(true);
      expect(result.numericPhone).toBe('1234567890');
    });
  });

  describe('handlePhoneInputChange', () => {
    it('should update value for valid input', () => {
      const setValue = vi.fn();
      handlePhoneInputChange('123', setValue, { maxLength: 15 });
      expect(setValue).toHaveBeenCalledWith('123');
    });

    it('should not update value for non-numeric input', () => {
      const setValue = vi.fn();
      handlePhoneInputChange('123abc', setValue, { maxLength: 15 });
      expect(setValue).not.toHaveBeenCalled();
    });

    it('should respect max length', () => {
      const setValue = vi.fn();
      handlePhoneInputChange('1234567890123456', setValue, { maxLength: 10 });
      expect(setValue).not.toHaveBeenCalled();
    });
  });

  describe('PhoneValidatorFactory', () => {
    it('should register and retrieve strategies', () => {
      const customStrategy = {
        name: 'Custom',
        validate: (phone) => phone.length === 8,
        format: (phone) => phone,
        maxLength: 8,
        pattern: /^\d{8}$/
      };

      PhoneValidatorFactory.registerStrategy('Custom', customStrategy);
      const retrieved = PhoneValidatorFactory.getStrategy('Custom');
      expect(retrieved).toEqual(customStrategy);
    });

    it('should throw error for non-existent strategy', () => {
      expect(() => PhoneValidatorFactory.getStrategy('NonExistent')).toThrow();
    });

    it('should return available strategies', () => {
      const strategies = PhoneValidatorFactory.getAvailableStrategies();
      expect(strategies).toContain('US');
      expect(strategies).toContain('International');
      expect(strategies).toContain('Flexible');
    });
  });

  describe('phoneFormats', () => {
    it('should have US format strategy', () => {
      expect(phoneFormats.US).toBeDefined();
      expect(phoneFormats.US.name).toBe('US');
      expect(phoneFormats.US.maxLength).toBe(10);
    });

    it('should have International format strategy', () => {
      expect(phoneFormats.International).toBeDefined();
      expect(phoneFormats.International.name).toBe('International');
      expect(phoneFormats.International.maxLength).toBe(15);
    });

    it('should have Flexible format strategy', () => {
      expect(phoneFormats.Flexible).toBeDefined();
      expect(phoneFormats.Flexible.name).toBe('Flexible');
      expect(phoneFormats.Flexible.maxLength).toBe(15);
    });
  });
});
