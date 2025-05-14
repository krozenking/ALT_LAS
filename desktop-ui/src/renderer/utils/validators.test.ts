import {
  isRequired,
  isEmail,
  isUrl,
  isNumeric,
  isAlpha,
  isAlphanumeric,
  minLength,
  maxLength,
  minValue,
  maxValue,
  pattern,
  isDate,
  isTime,
  isDateTime,
  isPhoneNumber,
  isPostalCode,
  isIPAddress,
  isCreditCard,
} from './validators';

describe('Validators', () => {
  describe('isRequired', () => {
    test('returns error message for empty values', () => {
      expect(isRequired('')).toBe('This field is required');
      expect(isRequired(null)).toBe('This field is required');
      expect(isRequired(undefined)).toBe('This field is required');
    });
    
    test('returns undefined for non-empty values', () => {
      expect(isRequired('test')).toBeUndefined();
      expect(isRequired(0)).toBeUndefined();
      expect(isRequired(false)).toBeUndefined();
    });
    
    test('accepts custom error message', () => {
      expect(isRequired('', 'Please fill this field')).toBe('Please fill this field');
    });
  });
  
  describe('isEmail', () => {
    test('returns error message for invalid email addresses', () => {
      expect(isEmail('test')).toBe('Invalid email address');
      expect(isEmail('test@')).toBe('Invalid email address');
      expect(isEmail('test@example')).toBe('Invalid email address');
      expect(isEmail('@example.com')).toBe('Invalid email address');
    });
    
    test('returns undefined for valid email addresses', () => {
      expect(isEmail('test@example.com')).toBeUndefined();
      expect(isEmail('test.name@example.com')).toBeUndefined();
      expect(isEmail('test+name@example.com')).toBeUndefined();
      expect(isEmail('test@subdomain.example.com')).toBeUndefined();
    });
    
    test('accepts custom error message', () => {
      expect(isEmail('test', 'Please enter a valid email')).toBe('Please enter a valid email');
    });
  });
  
  describe('isUrl', () => {
    test('returns error message for invalid URLs', () => {
      expect(isUrl('test')).toBe('Invalid URL');
      expect(isUrl('http://')).toBe('Invalid URL');
      expect(isUrl('http://.')).toBe('Invalid URL');
    });
    
    test('returns undefined for valid URLs', () => {
      expect(isUrl('http://example.com')).toBeUndefined();
      expect(isUrl('https://example.com')).toBeUndefined();
      expect(isUrl('https://www.example.com')).toBeUndefined();
      expect(isUrl('https://example.com/path')).toBeUndefined();
      expect(isUrl('https://example.com/path?query=value')).toBeUndefined();
    });
    
    test('accepts custom error message', () => {
      expect(isUrl('test', 'Please enter a valid URL')).toBe('Please enter a valid URL');
    });
  });
  
  describe('isNumeric', () => {
    test('returns error message for non-numeric values', () => {
      expect(isNumeric('test')).toBe('Must be a number');
      expect(isNumeric('123a')).toBe('Must be a number');
      expect(isNumeric('a123')).toBe('Must be a number');
    });
    
    test('returns undefined for numeric values', () => {
      expect(isNumeric('123')).toBeUndefined();
      expect(isNumeric('123.45')).toBeUndefined();
      expect(isNumeric('-123')).toBeUndefined();
      expect(isNumeric('-123.45')).toBeUndefined();
    });
    
    test('accepts custom error message', () => {
      expect(isNumeric('test', 'Please enter a number')).toBe('Please enter a number');
    });
  });
  
  describe('isAlpha', () => {
    test('returns error message for non-alphabetic values', () => {
      expect(isAlpha('test123')).toBe('Must contain only letters');
      expect(isAlpha('test 123')).toBe('Must contain only letters');
      expect(isAlpha('test-123')).toBe('Must contain only letters');
    });
    
    test('returns undefined for alphabetic values', () => {
      expect(isAlpha('test')).toBeUndefined();
      expect(isAlpha('Test')).toBeUndefined();
      expect(isAlpha('TEST')).toBeUndefined();
    });
    
    test('accepts custom error message', () => {
      expect(isAlpha('test123', 'Please enter only letters')).toBe('Please enter only letters');
    });
  });
  
  describe('isAlphanumeric', () => {
    test('returns error message for non-alphanumeric values', () => {
      expect(isAlphanumeric('test 123')).toBe('Must contain only letters and numbers');
      expect(isAlphanumeric('test-123')).toBe('Must contain only letters and numbers');
      expect(isAlphanumeric('test@123')).toBe('Must contain only letters and numbers');
    });
    
    test('returns undefined for alphanumeric values', () => {
      expect(isAlphanumeric('test')).toBeUndefined();
      expect(isAlphanumeric('123')).toBeUndefined();
      expect(isAlphanumeric('test123')).toBeUndefined();
      expect(isAlphanumeric('Test123')).toBeUndefined();
    });
    
    test('accepts custom error message', () => {
      expect(isAlphanumeric('test 123', 'Please enter only letters and numbers')).toBe('Please enter only letters and numbers');
    });
  });
  
  describe('minLength', () => {
    test('returns error message for values shorter than minimum length', () => {
      expect(minLength(3)('ab')).toBe('Must be at least 3 characters');
      expect(minLength(5)('abcd')).toBe('Must be at least 5 characters');
    });
    
    test('returns undefined for values with minimum length or longer', () => {
      expect(minLength(3)('abc')).toBeUndefined();
      expect(minLength(3)('abcd')).toBeUndefined();
      expect(minLength(5)('abcde')).toBeUndefined();
      expect(minLength(5)('abcdef')).toBeUndefined();
    });
    
    test('accepts custom error message', () => {
      expect(minLength(3, 'Too short')('ab')).toBe('Too short');
    });
  });
  
  describe('maxLength', () => {
    test('returns error message for values longer than maximum length', () => {
      expect(maxLength(3)('abcd')).toBe('Must be at most 3 characters');
      expect(maxLength(5)('abcdef')).toBe('Must be at most 5 characters');
    });
    
    test('returns undefined for values with maximum length or shorter', () => {
      expect(maxLength(3)('abc')).toBeUndefined();
      expect(maxLength(3)('ab')).toBeUndefined();
      expect(maxLength(5)('abcde')).toBeUndefined();
      expect(maxLength(5)('abcd')).toBeUndefined();
    });
    
    test('accepts custom error message', () => {
      expect(maxLength(3, 'Too long')('abcd')).toBe('Too long');
    });
  });
  
  describe('minValue', () => {
    test('returns error message for values less than minimum value', () => {
      expect(minValue(3)(2)).toBe('Must be at least 3');
      expect(minValue(0)(-1)).toBe('Must be at least 0');
    });
    
    test('returns undefined for values with minimum value or greater', () => {
      expect(minValue(3)(3)).toBeUndefined();
      expect(minValue(3)(4)).toBeUndefined();
      expect(minValue(0)(0)).toBeUndefined();
      expect(minValue(0)(1)).toBeUndefined();
    });
    
    test('accepts custom error message', () => {
      expect(minValue(3, 'Too small')(2)).toBe('Too small');
    });
  });
  
  describe('maxValue', () => {
    test('returns error message for values greater than maximum value', () => {
      expect(maxValue(3)(4)).toBe('Must be at most 3');
      expect(maxValue(0)(1)).toBe('Must be at most 0');
    });
    
    test('returns undefined for values with maximum value or less', () => {
      expect(maxValue(3)(3)).toBeUndefined();
      expect(maxValue(3)(2)).toBeUndefined();
      expect(maxValue(0)(0)).toBeUndefined();
      expect(maxValue(0)(-1)).toBeUndefined();
    });
    
    test('accepts custom error message', () => {
      expect(maxValue(3, 'Too large')(4)).toBe('Too large');
    });
  });
  
  describe('pattern', () => {
    test('returns error message for values that do not match pattern', () => {
      expect(pattern(/^[A-Z]+$/)('abc')).toBe('Invalid format');
      expect(pattern(/^\d{3}-\d{3}-\d{4}$/)('1234567890')).toBe('Invalid format');
    });
    
    test('returns undefined for values that match pattern', () => {
      expect(pattern(/^[A-Z]+$/)('ABC')).toBeUndefined();
      expect(pattern(/^\d{3}-\d{3}-\d{4}$/)('123-456-7890')).toBeUndefined();
    });
    
    test('accepts custom error message', () => {
      expect(pattern(/^[A-Z]+$/, 'Must be uppercase')('abc')).toBe('Must be uppercase');
    });
  });
});
