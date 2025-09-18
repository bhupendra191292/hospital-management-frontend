/**
 * Enhanced Phone Number Utility Functions
 * Following Open/Closed Principle and Strategy Pattern
 */

// Strategy pattern for different phone formats
export interface PhoneFormatStrategy {
  name: string;
  validate: (phone: string) => boolean;
  format: (phone: string) => string;
  maxLength: number;
  pattern: RegExp;
}

// Concrete strategies
export const phoneFormats: Record<string, PhoneFormatStrategy> = {
  US: {
    name: 'US',
    validate: (phone: string) => /^\d{10}$/.test(phone),
    format: (phone: string) => {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
      return cleaned;
    },
    maxLength: 10,
    pattern: /^\d{10}$/
  },
  International: {
    name: 'International',
    validate: (phone: string) => /^\d{10,15}$/.test(phone),
    format: (phone: string) => {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return `+1 ${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
      } else if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
      return cleaned;
    },
    maxLength: 15,
    pattern: /^\d{10,15}$/
  },
  Flexible: {
    name: 'Flexible',
    validate: (phone: string) => /^\d{7,15}$/.test(phone),
    format: (phone: string) => {
      const cleaned = phone.replace(/\D/g, '');
      return cleaned;
    },
    maxLength: 15,
    pattern: /^\d{7,15}$/
  }
};

// Factory pattern for creating phone validators
export class PhoneValidatorFactory {
  private static validators = new Map<string, PhoneFormatStrategy>();

  static registerStrategy(name: string, strategy: PhoneFormatStrategy): void {
    this.validators.set(name, strategy);
  }

  static getStrategy(name: string): PhoneFormatStrategy {
    const strategy = this.validators.get(name);
    if (!strategy) {
      throw new Error(`Phone validation strategy '${name}' not found`);
    }
    return strategy;
  }

  static getAvailableStrategies(): string[] {
    return Array.from(this.validators.keys());
  }
}

// Initialize with default strategies
Object.entries(phoneFormats).forEach(([name, strategy]) => {
  PhoneValidatorFactory.registerStrategy(name, strategy);
});

/**
 * Validates if a string contains only numeric characters
 * @param value - The string to validate
 * @returns True if the string contains only numbers
 */
export const isNumericOnly = (value: string): boolean => {
  return /^\d*$/.test(value);
};

/**
 * Enhanced phone number formatting with strategy pattern
 * @param phone - The phone number to format
 * @param strategy - The formatting strategy to use
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (
  phone: string, 
  strategy: string = 'US'
): string => {
  try {
    const phoneStrategy = PhoneValidatorFactory.getStrategy(strategy);
    return phoneStrategy.format(phone);
  } catch (error) {
    console.warn(`Invalid phone strategy '${strategy}', using US format`);
    return phoneFormats.US.format(phone);
  }
};

/**
 * Enhanced phone number validation with strategy pattern
 * @param phone - The phone number to validate
 * @param strategy - The validation strategy to use
 * @returns True if the phone number is valid
 */
export const isValidPhoneNumber = (
  phone: string, 
  strategy: string = 'US'
): boolean => {
  try {
    const phoneStrategy = PhoneValidatorFactory.getStrategy(strategy);
    const cleaned = phone.replace(/\D/g, '');
    return phoneStrategy.validate(cleaned);
  } catch (error) {
    console.warn(`Invalid phone strategy '${strategy}', using US validation`);
    return phoneFormats.US.validate(phone.replace(/\D/g, ''));
  }
};

/**
 * Enhanced phone input change handler with dependency injection
 * @param value - The input value
 * @param setValue - Function to update the phone value
 * @param options - Configuration options
 */
export const handlePhoneInputChange = (
  value: string,
  setValue: (value: string) => void,
  options: {
    maxLength?: number;
    strategy?: string;
    allowFormatting?: boolean;
  } = {}
): void => {
  const { maxLength = 15, strategy = 'US', allowFormatting = false } = options;

  // Only allow numeric characters
  if (!isNumericOnly(value)) {
    return;
  }

  // Limit length based on strategy
  const phoneStrategy = PhoneValidatorFactory.getStrategy(strategy);
  const effectiveMaxLength = Math.min(maxLength, phoneStrategy.maxLength);

  if (value.length <= effectiveMaxLength) {
    if (allowFormatting && value.length === phoneStrategy.maxLength) {
      const formatted = phoneStrategy.format(value);
      setValue(formatted);
    } else {
      setValue(value);
    }
  }
};

/**
 * Gets the numeric-only value from a phone input
 * @param phone - The phone number (may contain formatting)
 * @returns Numeric-only phone number
 */
export const getNumericPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Enhanced phone number processing with strategy pattern
 * @param phone - The phone number to process
 * @param strategy - The validation strategy to use
 * @returns Object with validation result and processed phone number
 */
export const processPhoneNumber = (
  phone: string, 
  strategy: string = 'US'
): {
  isValid: boolean;
  numericPhone: string;
  formattedPhone: string;
  error?: string;
  strategy: string;
} => {
  const numericPhone = getNumericPhone(phone);
  
  if (numericPhone.length === 0) {
    return {
      isValid: false,
      numericPhone: '',
      formattedPhone: '',
      error: 'Phone number is required',
      strategy
    };
  }

  const isValid = isValidPhoneNumber(numericPhone, strategy);
  const formattedPhone = formatPhoneNumber(numericPhone, strategy);

  if (!isValid) {
    const phoneStrategy = PhoneValidatorFactory.getStrategy(strategy);
    return {
      isValid: false,
      numericPhone,
      formattedPhone,
      error: `Please enter a valid ${phoneStrategy.name} phone number`,
      strategy
    };
  }

  return {
    isValid: true,
    numericPhone,
    formattedPhone,
    strategy
  };
};

/**
 * Phone number mask utility for real-time formatting
 * @param value - Current input value
 * @param strategy - Formatting strategy
 * @returns Masked phone number
 */
export const maskPhoneNumber = (
  value: string, 
  strategy: string = 'US'
): string => {
  const numeric = getNumericPhone(value);
  const phoneStrategy = PhoneValidatorFactory.getStrategy(strategy);
  
  if (numeric.length <= 3) return numeric;
  if (numeric.length <= 6) return `${numeric.slice(0, 3)}-${numeric.slice(3)}`;
  if (numeric.length <= 10) return `${numeric.slice(0, 3)}-${numeric.slice(3, 6)}-${numeric.slice(6)}`;
  
  return phoneStrategy.format(numeric);
};

// Export for backward compatibility
export const phoneValidationStrategies = phoneFormats;
