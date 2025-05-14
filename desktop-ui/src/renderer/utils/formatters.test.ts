import {
  formatDate,
  formatTime,
  formatDateTime,
  formatNumber,
  formatCurrency,
  formatFileSize,
  formatDuration,
  formatPercentage,
} from './formatters';

describe('Formatters', () => {
  describe('formatDate', () => {
    test('formats date correctly with default format', () => {
      const date = new Date('2023-05-15');
      expect(formatDate(date)).toBe('15/05/2023');
    });
    
    test('formats date correctly with custom format', () => {
      const date = new Date('2023-05-15');
      expect(formatDate(date, 'yyyy-MM-dd')).toBe('2023-05-15');
    });
    
    test('returns empty string for null or undefined', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });
  
  describe('formatTime', () => {
    test('formats time correctly with default format', () => {
      const date = new Date('2023-05-15T14:30:45');
      expect(formatTime(date)).toBe('14:30:45');
    });
    
    test('formats time correctly with custom format', () => {
      const date = new Date('2023-05-15T14:30:45');
      expect(formatTime(date, 'HH:mm')).toBe('14:30');
    });
    
    test('returns empty string for null or undefined', () => {
      expect(formatTime(null)).toBe('');
      expect(formatTime(undefined)).toBe('');
    });
  });
  
  describe('formatDateTime', () => {
    test('formats date and time correctly with default format', () => {
      const date = new Date('2023-05-15T14:30:45');
      expect(formatDateTime(date)).toBe('15/05/2023 14:30:45');
    });
    
    test('formats date and time correctly with custom format', () => {
      const date = new Date('2023-05-15T14:30:45');
      expect(formatDateTime(date, 'yyyy-MM-dd HH:mm')).toBe('2023-05-15 14:30');
    });
    
    test('returns empty string for null or undefined', () => {
      expect(formatDateTime(null)).toBe('');
      expect(formatDateTime(undefined)).toBe('');
    });
  });
  
  describe('formatNumber', () => {
    test('formats number correctly with default options', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56');
    });
    
    test('formats number correctly with custom options', () => {
      expect(formatNumber(1234.56, { minimumFractionDigits: 0, maximumFractionDigits: 0 })).toBe('1,235');
    });
    
    test('formats number correctly with different locale', () => {
      expect(formatNumber(1234.56, { locale: 'de-DE' })).toBe('1.234,56');
    });
    
    test('returns empty string for null or undefined', () => {
      expect(formatNumber(null)).toBe('');
      expect(formatNumber(undefined)).toBe('');
    });
  });
  
  describe('formatCurrency', () => {
    test('formats currency correctly with default options', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });
    
    test('formats currency correctly with custom currency', () => {
      expect(formatCurrency(1234.56, { currency: 'EUR' })).toBe('€1,234.56');
    });
    
    test('formats currency correctly with different locale', () => {
      expect(formatCurrency(1234.56, { locale: 'de-DE', currency: 'EUR' })).toBe('1.234,56 €');
    });
    
    test('returns empty string for null or undefined', () => {
      expect(formatCurrency(null)).toBe('');
      expect(formatCurrency(undefined)).toBe('');
    });
  });
  
  describe('formatFileSize', () => {
    test('formats file size in bytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });
    
    test('formats file size in kilobytes', () => {
      expect(formatFileSize(1500)).toBe('1.46 KB');
    });
    
    test('formats file size in megabytes', () => {
      expect(formatFileSize(1500000)).toBe('1.43 MB');
    });
    
    test('formats file size in gigabytes', () => {
      expect(formatFileSize(1500000000)).toBe('1.40 GB');
    });
    
    test('formats file size in terabytes', () => {
      expect(formatFileSize(1500000000000)).toBe('1.36 TB');
    });
    
    test('returns empty string for null or undefined', () => {
      expect(formatFileSize(null)).toBe('');
      expect(formatFileSize(undefined)).toBe('');
    });
  });
  
  describe('formatDuration', () => {
    test('formats duration in seconds', () => {
      expect(formatDuration(45)).toBe('45 seconds');
    });
    
    test('formats duration in minutes and seconds', () => {
      expect(formatDuration(125)).toBe('2 minutes, 5 seconds');
    });
    
    test('formats duration in hours, minutes, and seconds', () => {
      expect(formatDuration(3725)).toBe('1 hour, 2 minutes, 5 seconds');
    });
    
    test('formats duration in days, hours, minutes, and seconds', () => {
      expect(formatDuration(90125)).toBe('1 day, 1 hour, 2 minutes, 5 seconds');
    });
    
    test('handles singular units correctly', () => {
      expect(formatDuration(3661)).toBe('1 hour, 1 minute, 1 second');
    });
    
    test('returns empty string for null or undefined', () => {
      expect(formatDuration(null)).toBe('');
      expect(formatDuration(undefined)).toBe('');
    });
  });
  
  describe('formatPercentage', () => {
    test('formats percentage correctly with default options', () => {
      expect(formatPercentage(0.1234)).toBe('12.34%');
    });
    
    test('formats percentage correctly with custom options', () => {
      expect(formatPercentage(0.1234, { minimumFractionDigits: 0, maximumFractionDigits: 0 })).toBe('12%');
    });
    
    test('formats percentage correctly with different locale', () => {
      expect(formatPercentage(0.1234, { locale: 'de-DE' })).toBe('12,34 %');
    });
    
    test('returns empty string for null or undefined', () => {
      expect(formatPercentage(null)).toBe('');
      expect(formatPercentage(undefined)).toBe('');
    });
  });
});
