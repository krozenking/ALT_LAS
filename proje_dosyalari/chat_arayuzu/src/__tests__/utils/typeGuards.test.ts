/**
 * @jest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import {
  isDefined,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isMessage,
  isUser,
  isFileMetadata,
  isAIModel,
  safelyParseJSON,
  safelyStringify
} from '../../utils/typeGuards';
import { IMessage, IUser, IFileMetadata, IAIModel } from '../../types';

describe('Type Guards', () => {
  describe('isDefined', () => {
    it('should return true for defined values', () => {
      expect(isDefined('')).toBe(true);
      expect(isDefined(0)).toBe(true);
      expect(isDefined(false)).toBe(true);
      expect(isDefined({})).toBe(true);
      expect(isDefined([])).toBe(true);
    });

    it('should return false for undefined or null values', () => {
      expect(isDefined(undefined)).toBe(false);
      expect(isDefined(null)).toBe(false);
    });
  });

  describe('isString', () => {
    it('should return true for string values', () => {
      expect(isString('')).toBe(true);
      expect(isString('hello')).toBe(true);
    });

    it('should return false for non-string values', () => {
      expect(isString(0)).toBe(false);
      expect(isString(false)).toBe(false);
      expect(isString({})).toBe(false);
      expect(isString([])).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('should return true for number values', () => {
      expect(isNumber(0)).toBe(true);
      expect(isNumber(1)).toBe(true);
      expect(isNumber(-1)).toBe(true);
      expect(isNumber(1.5)).toBe(true);
    });

    it('should return false for NaN', () => {
      expect(isNumber(NaN)).toBe(false);
    });

    it('should return false for non-number values', () => {
      expect(isNumber('')).toBe(false);
      expect(isNumber('1')).toBe(false);
      expect(isNumber(false)).toBe(false);
      expect(isNumber({})).toBe(false);
      expect(isNumber([])).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
    });
  });

  describe('isBoolean', () => {
    it('should return true for boolean values', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
    });

    it('should return false for non-boolean values', () => {
      expect(isBoolean('')).toBe(false);
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean({})).toBe(false);
      expect(isBoolean([])).toBe(false);
      expect(isBoolean(null)).toBe(false);
      expect(isBoolean(undefined)).toBe(false);
    });
  });

  describe('isObject', () => {
    it('should return true for object values', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
    });

    it('should return false for arrays', () => {
      expect(isObject([])).toBe(false);
    });

    it('should return false for non-object values', () => {
      expect(isObject('')).toBe(false);
      expect(isObject(0)).toBe(false);
      expect(isObject(false)).toBe(false);
      expect(isObject(null)).toBe(false);
      expect(isObject(undefined)).toBe(false);
    });
  });

  describe('isArray', () => {
    it('should return true for array values', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
    });

    it('should return false for non-array values', () => {
      expect(isArray('')).toBe(false);
      expect(isArray(0)).toBe(false);
      expect(isArray(false)).toBe(false);
      expect(isArray({})).toBe(false);
      expect(isArray(null)).toBe(false);
      expect(isArray(undefined)).toBe(false);
    });
  });

  describe('isMessage', () => {
    it('should return true for valid Message objects', () => {
      const validMessage: IMessage = {
        id: '1',
        content: 'Hello',
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      expect(isMessage(validMessage)).toBe(true);
    });

    it('should return false for invalid Message objects', () => {
      const invalidMessage1 = {
        id: '1',
        content: 'Hello',
        sender: 'invalid', // Invalid sender
        timestamp: new Date().toISOString()
      };
      const invalidMessage2 = {
        id: '1',
        content: 'Hello',
        // Missing sender
        timestamp: new Date().toISOString()
      };
      expect(isMessage(invalidMessage1)).toBe(false);
      expect(isMessage(invalidMessage2)).toBe(false);
      expect(isMessage({})).toBe(false);
      expect(isMessage(null)).toBe(false);
    });
  });

  describe('safelyParseJSON', () => {
    it('should parse valid JSON strings', () => {
      expect(safelyParseJSON('{"a":1}', {})).toEqual({ a: 1 });
      expect(safelyParseJSON('[1,2,3]', [])).toEqual([1, 2, 3]);
    });

    it('should return default value for invalid JSON strings', () => {
      expect(safelyParseJSON('invalid', {})).toEqual({});
      expect(safelyParseJSON('', [])).toEqual([]);
    });
  });

  describe('safelyStringify', () => {
    it('should stringify valid objects', () => {
      expect(safelyStringify({ a: 1 })).toBe('{"a":1}');
      expect(safelyStringify([1, 2, 3])).toBe('[1,2,3]');
    });

    it('should return empty string for circular references', () => {
      const circular: any = {};
      circular.self = circular;
      expect(safelyStringify(circular)).toBe('');
    });
  });
});
