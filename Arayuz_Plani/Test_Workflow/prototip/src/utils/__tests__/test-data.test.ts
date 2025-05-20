// src/utils/__tests__/test-data.test.ts
import {
  createValidFormData,
  createInvalidFormData,
  generateRandomUsername,
  generateRandomEmail,
  generateRandomUser,
  generateRandomFormData,
  countryOptions,
  testUsers,
} from '../test-data';

describe('Test Data Utilities', () => {
  describe('createValidFormData', () => {
    test('returns valid form data', () => {
      const formData = createValidFormData();
      
      expect(formData).toEqual({
        name: 'Test User',
        email: 'test@example.com',
        country: 'tr',
        agreeTerms: true,
      });
    });
  });
  
  describe('createInvalidFormData', () => {
    test('returns invalid form data with empty name', () => {
      const formData = createInvalidFormData({ name: true });
      
      expect(formData.name).toBe('');
      expect(formData.email).toBe('test@example.com');
      expect(formData.country).toBe('tr');
      expect(formData.agreeTerms).toBe(true);
    });
    
    test('returns invalid form data with invalid email', () => {
      const formData = createInvalidFormData({ email: true });
      
      expect(formData.name).toBe('Test User');
      expect(formData.email).toBe('invalid-email');
      expect(formData.country).toBe('tr');
      expect(formData.agreeTerms).toBe(true);
    });
    
    test('returns invalid form data with empty country', () => {
      const formData = createInvalidFormData({ country: true });
      
      expect(formData.name).toBe('Test User');
      expect(formData.email).toBe('test@example.com');
      expect(formData.country).toBe('');
      expect(formData.agreeTerms).toBe(true);
    });
    
    test('returns invalid form data with false agreeTerms', () => {
      const formData = createInvalidFormData({ agreeTerms: true });
      
      expect(formData.name).toBe('Test User');
      expect(formData.email).toBe('test@example.com');
      expect(formData.country).toBe('tr');
      expect(formData.agreeTerms).toBe(false);
    });
    
    test('returns invalid form data with multiple invalid fields', () => {
      const formData = createInvalidFormData({
        name: true,
        email: true,
        country: true,
        agreeTerms: true,
      });
      
      expect(formData.name).toBe('');
      expect(formData.email).toBe('invalid-email');
      expect(formData.country).toBe('');
      expect(formData.agreeTerms).toBe(false);
    });
  });
  
  describe('generateRandomUsername', () => {
    test('returns a random username', () => {
      const username1 = generateRandomUsername();
      const username2 = generateRandomUsername();
      
      expect(username1).toMatch(/^user_[a-z0-9]{8}$/);
      expect(username2).toMatch(/^user_[a-z0-9]{8}$/);
      expect(username1).not.toBe(username2);
    });
  });
  
  describe('generateRandomEmail', () => {
    test('returns a random email', () => {
      const email1 = generateRandomEmail();
      const email2 = generateRandomEmail();
      
      expect(email1).toMatch(/^test_[a-z0-9]{8}@example\.com$/);
      expect(email2).toMatch(/^test_[a-z0-9]{8}@example\.com$/);
      expect(email1).not.toBe(email2);
    });
  });
  
  describe('generateRandomUser', () => {
    test('returns a random user with default role', () => {
      const user = generateRandomUser();
      
      expect(user.id).toMatch(/^[a-z0-9]{8}$/);
      expect(user.username).toMatch(/^user_[a-z0-9]{8}$/);
      expect(user.name).toMatch(/^User_[a-z0-9]{8}$/);
      expect(user.email).toMatch(/^test_[a-z0-9]{8}@example\.com$/);
      expect(user.role).toBe('user');
    });
    
    test('returns a random user with specified role', () => {
      const user = generateRandomUser('admin');
      
      expect(user.id).toMatch(/^[a-z0-9]{8}$/);
      expect(user.username).toMatch(/^user_[a-z0-9]{8}$/);
      expect(user.name).toMatch(/^User_[a-z0-9]{8}$/);
      expect(user.email).toMatch(/^test_[a-z0-9]{8}@example\.com$/);
      expect(user.role).toBe('admin');
    });
  });
  
  describe('generateRandomFormData', () => {
    test('returns random form data', () => {
      const formData = generateRandomFormData();
      
      expect(formData.name).toMatch(/^user_[a-z0-9]{8}$/);
      expect(formData.email).toMatch(/^test_[a-z0-9]{8}@example\.com$/);
      expect(countryOptions.some(option => option.value === formData.country)).toBe(true);
      expect(typeof formData.agreeTerms).toBe('boolean');
    });
  });
  
  describe('countryOptions', () => {
    test('contains expected country options', () => {
      expect(countryOptions).toHaveLength(5);
      expect(countryOptions).toContainEqual({ value: 'tr', label: 'Türkiye' });
      expect(countryOptions).toContainEqual({ value: 'us', label: 'Amerika Birleşik Devletleri' });
      expect(countryOptions).toContainEqual({ value: 'gb', label: 'Birleşik Krallık' });
      expect(countryOptions).toContainEqual({ value: 'de', label: 'Almanya' });
      expect(countryOptions).toContainEqual({ value: 'fr', label: 'Fransa' });
    });
  });
  
  describe('testUsers', () => {
    test('contains expected test users', () => {
      expect(Object.keys(testUsers)).toHaveLength(3);
      expect(testUsers.admin).toEqual({
        id: '1',
        username: 'admin',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      });
      expect(testUsers.user).toEqual({
        id: '2',
        username: 'user',
        name: 'Regular User',
        email: 'user@example.com',
        role: 'user',
      });
      expect(testUsers.guest).toEqual({
        id: '3',
        username: 'guest',
        name: 'Guest User',
        email: 'guest@example.com',
        role: 'guest',
      });
    });
  });
});
