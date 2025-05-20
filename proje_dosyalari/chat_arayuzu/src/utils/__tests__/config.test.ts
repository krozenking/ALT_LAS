import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getEnvString, getEnvNumber, getEnvBoolean, getEnvArray, config } from '../config';

describe('Config Utils', () => {
  beforeEach(() => {
    // Reset import.meta.env mock before each test
    vi.stubGlobal('import.meta', {
      env: {
        VITE_API_BASE_URL: 'http://test-api.example.com',
        VITE_API_TIMEOUT: '5000',
        VITE_ENABLE_STREAMING: 'true',
        VITE_ALLOWED_FILE_TYPES: 'image/jpeg,image/png,application/pdf',
        MODE: 'test'
      }
    });
  });
  
  describe('getEnvString', () => {
    it('returns environment variable as string', () => {
      expect(getEnvString('VITE_API_BASE_URL')).toBe('http://test-api.example.com');
    });
    
    it('returns default value when environment variable is not defined', () => {
      expect(getEnvString('VITE_UNDEFINED_VAR', 'default-value')).toBe('default-value');
    });
  });
  
  describe('getEnvNumber', () => {
    it('returns environment variable as number', () => {
      expect(getEnvNumber('VITE_API_TIMEOUT')).toBe(5000);
    });
    
    it('returns default value when environment variable is not defined', () => {
      expect(getEnvNumber('VITE_UNDEFINED_VAR', 1000)).toBe(1000);
    });
    
    it('returns default value when environment variable is not a valid number', () => {
      vi.stubGlobal('import.meta', {
        env: {
          VITE_INVALID_NUMBER: 'not-a-number'
        }
      });
      
      expect(getEnvNumber('VITE_INVALID_NUMBER', 1000)).toBe(1000);
    });
  });
  
  describe('getEnvBoolean', () => {
    it('returns environment variable as boolean', () => {
      expect(getEnvBoolean('VITE_ENABLE_STREAMING')).toBe(true);
    });
    
    it('returns default value when environment variable is not defined', () => {
      expect(getEnvBoolean('VITE_UNDEFINED_VAR', true)).toBe(true);
    });
    
    it('handles different truthy values', () => {
      vi.stubGlobal('import.meta', {
        env: {
          VITE_BOOL_TRUE: 'true',
          VITE_BOOL_1: '1',
          VITE_BOOL_YES: 'yes',
          VITE_BOOL_FALSE: 'false'
        }
      });
      
      expect(getEnvBoolean('VITE_BOOL_TRUE')).toBe(true);
      expect(getEnvBoolean('VITE_BOOL_1')).toBe(true);
      expect(getEnvBoolean('VITE_BOOL_YES')).toBe(true);
      expect(getEnvBoolean('VITE_BOOL_FALSE')).toBe(false);
    });
  });
  
  describe('getEnvArray', () => {
    it('returns environment variable as array', () => {
      expect(getEnvArray('VITE_ALLOWED_FILE_TYPES')).toEqual(['image/jpeg', 'image/png', 'application/pdf']);
    });
    
    it('returns default value when environment variable is not defined', () => {
      expect(getEnvArray('VITE_UNDEFINED_VAR', ',', ['default'])).toEqual(['default']);
    });
    
    it('returns default value when environment variable is empty', () => {
      vi.stubGlobal('import.meta', {
        env: {
          VITE_EMPTY_ARRAY: ''
        }
      });
      
      expect(getEnvArray('VITE_EMPTY_ARRAY', ',', ['default'])).toEqual(['default']);
    });
  });
  
  describe('config object', () => {
    it('contains all expected sections', () => {
      expect(config).toHaveProperty('api');
      expect(config).toHaveProperty('ai');
      expect(config).toHaveProperty('fileUpload');
      expect(config).toHaveProperty('speechRecognition');
      expect(config).toHaveProperty('app');
      expect(config).toHaveProperty('storage');
      expect(config).toHaveProperty('accessibility');
      expect(config).toHaveProperty('theme');
      expect(config).toHaveProperty('dev');
      expect(config).toHaveProperty('env');
    });
    
    it('has correct values from environment variables', () => {
      expect(config.api.baseUrl).toBe('http://test-api.example.com');
      expect(config.api.timeout).toBe(5000);
      expect(config.ai.enableStreaming).toBe(true);
      expect(config.env.mode).toBe('test');
    });
  });
});
