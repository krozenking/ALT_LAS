/**
 * @jest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  sanitizeInput,
  validateApiKey,
  encryptData,
  decryptData,
  hashPassword,
  verifyPassword,
  generateCSRFToken,
  validateCSRFToken,
  sanitizeHTML
} from '../../utils/security';

describe('Security Utilities', () => {
  describe('Input Sanitization', () => {
    it('should sanitize HTML in input strings', () => {
      const maliciousInput = '<script>alert("XSS")</script>Hello';
      const sanitized = sanitizeInput(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Hello');
    });
    
    it('should handle null and undefined inputs', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
    });
    
    it('should preserve safe HTML elements', () => {
      const safeInput = '<p>This is <strong>bold</strong> text</p>';
      const sanitized = sanitizeInput(safeInput);
      
      expect(sanitized).toContain('<p>');
      expect(sanitized).toContain('<strong>');
    });
  });
  
  describe('API Key Validation', () => {
    it('should validate correct API key format', () => {
      const validApiKey = 'sk-1234567890abcdefghijklmnopqrstuvwxyz';
      expect(validateApiKey(validApiKey, 'openai')).toBe(true);
    });
    
    it('should reject invalid API key format', () => {
      const invalidApiKey = 'invalid-key';
      expect(validateApiKey(invalidApiKey, 'openai')).toBe(false);
    });
    
    it('should validate different API key formats for different providers', () => {
      const googleApiKey = 'AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz';
      const ollamaApiKey = 'ollama_1234567890abcdefghijklmnopqrstuvwxyz';
      
      expect(validateApiKey(googleApiKey, 'google')).toBe(true);
      expect(validateApiKey(ollamaApiKey, 'ollama')).toBe(true);
    });
  });
  
  describe('Data Encryption and Decryption', () => {
    const testData = 'sensitive data';
    const encryptionKey = 'test-encryption-key';
    
    it('should encrypt and decrypt data correctly', () => {
      const encrypted = encryptData(testData, encryptionKey);
      
      // Encrypted data should be different from original
      expect(encrypted).not.toBe(testData);
      
      const decrypted = decryptData(encrypted, encryptionKey);
      
      // Decrypted data should match original
      expect(decrypted).toBe(testData);
    });
    
    it('should fail decryption with wrong key', () => {
      const encrypted = encryptData(testData, encryptionKey);
      const wrongKey = 'wrong-key';
      
      expect(() => decryptData(encrypted, wrongKey)).toThrow();
    });
  });
  
  describe('Password Hashing and Verification', () => {
    const testPassword = 'secure-password-123';
    
    it('should hash password and verify it correctly', async () => {
      const hashedPassword = await hashPassword(testPassword);
      
      // Hashed password should be different from original
      expect(hashedPassword).not.toBe(testPassword);
      
      // Verification should succeed with correct password
      const isValid = await verifyPassword(testPassword, hashedPassword);
      expect(isValid).toBe(true);
    });
    
    it('should fail verification with wrong password', async () => {
      const hashedPassword = await hashPassword(testPassword);
      const wrongPassword = 'wrong-password';
      
      const isValid = await verifyPassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });
  
  describe('CSRF Protection', () => {
    const mockSessionId = 'test-session-123';
    
    it('should generate and validate CSRF tokens', () => {
      const token = generateCSRFToken(mockSessionId);
      
      // Token should be a non-empty string
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      
      // Validation should succeed with correct session ID
      const isValid = validateCSRFToken(token, mockSessionId);
      expect(isValid).toBe(true);
    });
    
    it('should fail validation with wrong session ID', () => {
      const token = generateCSRFToken(mockSessionId);
      const wrongSessionId = 'wrong-session';
      
      const isValid = validateCSRFToken(token, wrongSessionId);
      expect(isValid).toBe(false);
    });
    
    it('should fail validation with tampered token', () => {
      const token = generateCSRFToken(mockSessionId);
      const tamperedToken = token + 'tampered';
      
      const isValid = validateCSRFToken(tamperedToken, mockSessionId);
      expect(isValid).toBe(false);
    });
  });
  
  describe('HTML Sanitization', () => {
    it('should remove dangerous HTML', () => {
      const dangerous = '<div onclick="alert(\'xss\')">Click me</div><script>alert("xss")</script>';
      const safe = sanitizeHTML(dangerous);
      
      expect(safe).toContain('<div>Click me</div>');
      expect(safe).not.toContain('onclick');
      expect(safe).not.toContain('<script>');
    });
    
    it('should allow safe HTML elements and attributes', () => {
      const safe = '<p><a href="https://example.com" target="_blank" rel="noopener noreferrer">Link</a></p>';
      const sanitized = sanitizeHTML(safe);
      
      expect(sanitized).toContain('<p>');
      expect(sanitized).toContain('<a href="https://example.com"');
      expect(sanitized).toContain('rel="noopener noreferrer"');
    });
  });
});
