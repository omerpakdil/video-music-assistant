import {
  validateEmail,
  validatePassword,
  validateName,
  validateURL,
  validateVideoURL,
  validateFileSize,
  validateFileType,
  validateRequired,
} from '../validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid email', () => {
      const result = validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email is required');
    });
  });

  describe('validatePassword', () => {
    it('should validate correct password', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject short password', () => {
      const result = validatePassword('12345');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must be at least 6 characters');
    });

    it('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password is required');
    });
  });

  describe('validateName', () => {
    it('should validate correct name', () => {
      const result = validateName('John Doe');
      expect(result.isValid).toBe(true);
    });

    it('should reject short name', () => {
      const result = validateName('A');
      expect(result.isValid).toBe(false);
    });

    it('should reject empty name', () => {
      const result = validateName('');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateURL', () => {
    it('should validate correct URL', () => {
      const result = validateURL('https://example.com');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid URL', () => {
      const result = validateURL('not-a-url');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateVideoURL', () => {
    it('should validate TikTok URL', () => {
      const result = validateVideoURL('https://www.tiktok.com/@user/video/123');
      expect(result.isValid).toBe(true);
    });

    it('should validate YouTube URL', () => {
      const result = validateVideoURL('https://www.youtube.com/watch?v=123');
      expect(result.isValid).toBe(true);
    });

    it('should validate Instagram URL', () => {
      const result = validateVideoURL('https://www.instagram.com/p/123/');
      expect(result.isValid).toBe(true);
    });

    it('should reject non-video platform URL', () => {
      const result = validateVideoURL('https://www.facebook.com/video');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('should validate file within size limit', () => {
      const result = validateFileSize(1024 * 1024, 10 * 1024 * 1024); // 1MB < 10MB
      expect(result.isValid).toBe(true);
    });

    it('should reject file exceeding size limit', () => {
      const result = validateFileSize(100 * 1024 * 1024, 50 * 1024 * 1024); // 100MB > 50MB
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateFileType', () => {
    it('should validate allowed file type', () => {
      const result = validateFileType('video.mp4', ['mp4', 'mov']);
      expect(result.isValid).toBe(true);
    });

    it('should reject disallowed file type', () => {
      const result = validateFileType('document.pdf', ['mp4', 'mov']);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('should validate non-empty value', () => {
      const result = validateRequired('value', 'Field');
      expect(result.isValid).toBe(true);
    });

    it('should reject empty string', () => {
      const result = validateRequired('', 'Field');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Field is required');
    });

    it('should reject null value', () => {
      const result = validateRequired(null, 'Field');
      expect(result.isValid).toBe(false);
    });
  });
});
