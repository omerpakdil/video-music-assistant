/**
 * Validation Utilities
 * Common validation functions for forms and inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Email validation
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

/**
 * Password validation
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long' };
  }

  return { isValid: true };
};

/**
 * Strong password validation
 */
export const validateStrongPassword = (password: string): ValidationResult => {
  const basicValidation = validatePassword(password);
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  return { isValid: true };
};

/**
 * Name validation
 */
export const validateName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, error: 'Name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }

  if (name.length > 50) {
    return { isValid: false, error: 'Name is too long' };
  }

  return { isValid: true };
};

/**
 * URL validation
 */
export const validateURL = (url: string): ValidationResult => {
  if (!url) {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
};

/**
 * Video URL validation (TikTok, YouTube, Instagram)
 */
export const validateVideoURL = (url: string): ValidationResult => {
  const basicValidation = validateURL(url);
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  const validDomains = [
    'tiktok.com',
    'vm.tiktok.com',
    'youtube.com',
    'youtu.be',
    'instagram.com',
  ];

  const urlObj = new URL(url);
  const isValidDomain = validDomains.some((domain) =>
    urlObj.hostname.includes(domain)
  );

  if (!isValidDomain) {
    return {
      isValid: false,
      error: 'Please enter a valid TikTok, YouTube, or Instagram URL',
    };
  }

  return { isValid: true };
};

/**
 * File size validation
 */
export const validateFileSize = (
  fileSize: number,
  maxSize: number = 50 * 1024 * 1024 // 50MB default
): ValidationResult => {
  if (fileSize > maxSize) {
    const maxSizeMB = Math.floor(maxSize / (1024 * 1024));
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  return { isValid: true };
};

/**
 * File type validation
 */
export const validateFileType = (
  fileName: string,
  allowedTypes: string[]
): ValidationResult => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (!extension || !allowedTypes.includes(extension)) {
    return {
      isValid: false,
      error: `Only ${allowedTypes.join(', ')} files are allowed`,
    };
  }

  return { isValid: true };
};

/**
 * Video duration validation
 */
export const validateVideoDuration = (
  duration: number,
  maxDuration: number = 300 // 5 minutes default
): ValidationResult => {
  if (duration > maxDuration) {
    return {
      isValid: false,
      error: `Video duration must be less than ${Math.floor(maxDuration / 60)} minutes`,
    };
  }

  if (duration < 1) {
    return {
      isValid: false,
      error: 'Video duration is too short',
    };
  }

  return { isValid: true };
};

/**
 * Required field validation
 */
export const validateRequired = (value: any, fieldName: string = 'This field'): ValidationResult => {
  if (value === null || value === undefined || value === '') {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  if (typeof value === 'string' && value.trim() === '') {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  return { isValid: true };
};

/**
 * Min length validation
 */
export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string = 'This field'
): ValidationResult => {
  if (value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  return { isValid: true };
};

/**
 * Max length validation
 */
export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string = 'This field'
): ValidationResult => {
  if (value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be less than ${maxLength} characters`,
    };
  }

  return { isValid: true };
};

/**
 * Number range validation
 */
export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string = 'This value'
): ValidationResult => {
  if (value < min || value > max) {
    return {
      isValid: false,
      error: `${fieldName} must be between ${min} and ${max}`,
    };
  }

  return { isValid: true };
};

/**
 * Phone number validation (basic)
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }

  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }

  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 10) {
    return { isValid: false, error: 'Phone number is too short' };
  }

  return { isValid: true };
};

/**
 * Validate form with multiple fields
 */
export const validateForm = (
  fields: Record<string, any>,
  validators: Record<string, (value: any) => ValidationResult>
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let isValid = true;

  Object.keys(validators).forEach((fieldName) => {
    const validator = validators[fieldName];
    const value = fields[fieldName];
    const result = validator(value);

    if (!result.isValid) {
      errors[fieldName] = result.error || 'Invalid value';
      isValid = false;
    }
  });

  return { isValid, errors };
};

/**
 * Sanitize string (remove HTML tags, trim)
 */
export const sanitizeString = (input: string): string => {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim();
};

/**
 * Validate and sanitize input
 */
export const validateAndSanitize = (
  input: string,
  validator: (value: string) => ValidationResult
): { isValid: boolean; value: string; error?: string } => {
  const sanitized = sanitizeString(input);
  const result = validator(sanitized);

  return {
    isValid: result.isValid,
    value: sanitized,
    error: result.error,
  };
};
