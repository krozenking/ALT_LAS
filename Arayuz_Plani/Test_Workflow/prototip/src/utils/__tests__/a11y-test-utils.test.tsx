// src/utils/__tests__/a11y-test-utils.test.tsx
import React from 'react';
import { axe, Result } from 'jest-axe';
import { 
  formatAxeViolations, 
  testA11y, 
  renderWithA11y, 
  wcag2aaConfig 
} from '../a11y-test-utils';

// Mock jest-axe
jest.mock('jest-axe', () => {
  const originalModule = jest.requireActual('jest-axe');
  
  return {
    ...originalModule,
    axe: jest.fn(),
  };
});

describe('Accessibility Test Utilities', () => {
  describe('formatAxeViolations', () => {
    test('returns message for no violations', () => {
      const result = formatAxeViolations([]);
      expect(result).toBe('No accessibility violations found.');
    });
    
    test('formats violations correctly', () => {
      const mockViolations: Result[] = [
        {
          id: 'color-contrast',
          impact: 'serious',
          tags: ['wcag2aa', 'wcag143'],
          description: 'Elements must have sufficient color contrast',
          help: 'Elements must have sufficient color contrast',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
          nodes: [
            {
              html: '<button style="color: gray; background-color: white;">Low Contrast</button>',
              target: ['button'],
              failureSummary: 'Fix any of the following:\n  Element has insufficient color contrast of 2.5:1',
              any: [],
              all: [],
              none: [],
            },
          ],
        },
      ];
      
      const result = formatAxeViolations(mockViolations);
      
      expect(result).toContain('Rule: color-contrast (serious)');
      expect(result).toContain('Description: Elements must have sufficient color contrast');
      expect(result).toContain('Help: Elements must have sufficient color contrast');
      expect(result).toContain('Link: https://dequeuniversity.com/rules/axe/4.4/color-contrast');
      expect(result).toContain('<button style="color: gray; background-color: white;">Low Contrast</button>');
      expect(result).toContain('Fix any of the following:');
      expect(result).toContain('Element has insufficient color contrast of 2.5:1');
    });
  });
  
  describe('testA11y', () => {
    beforeEach(() => {
      (axe as jest.Mock).mockReset();
    });
    
    test('passes when no violations are found', async () => {
      (axe as jest.Mock).mockResolvedValue({ violations: [] });
      
      await expect(testA11y(<button>Accessible Button</button>)).resolves.not.toThrow();
    });
    
    test('calls axe with the provided options', async () => {
      (axe as jest.Mock).mockResolvedValue({ violations: [] });
      
      await testA11y(<button>Accessible Button</button>, wcag2aaConfig);
      
      expect(axe).toHaveBeenCalledWith(expect.anything(), wcag2aaConfig);
    });
  });
  
  describe('renderWithA11y', () => {
    beforeEach(() => {
      (axe as jest.Mock).mockReset();
    });
    
    test('returns render result with testA11y function', async () => {
      (axe as jest.Mock).mockResolvedValue({ violations: [] });
      
      const { getByText, testA11y } = renderWithA11y(<button>Accessible Button</button>);
      
      expect(getByText('Accessible Button')).toBeInTheDocument();
      expect(testA11y).toBeInstanceOf(Function);
      
      await expect(testA11y()).resolves.not.toThrow();
    });
    
    test('testA11y function calls axe with the provided options', async () => {
      (axe as jest.Mock).mockResolvedValue({ violations: [] });
      
      const { testA11y } = renderWithA11y(<button>Accessible Button</button>);
      
      await testA11y(wcag2aaConfig);
      
      expect(axe).toHaveBeenCalledWith(expect.anything(), wcag2aaConfig);
    });
  });
  
  describe('wcag2aaConfig', () => {
    test('includes important WCAG 2.1 AA rules', () => {
      expect(wcag2aaConfig.rules).toBeDefined();
      
      // Form etiketleri
      expect(wcag2aaConfig.rules?.label).toEqual({ enabled: true });
      
      // Renk kontrastı
      expect(wcag2aaConfig.rules?.['color-contrast']).toEqual({ enabled: true });
      
      // Klavye erişilebilirliği
      expect(wcag2aaConfig.rules?.tabindex).toEqual({ enabled: true });
      
      // Alternatif metinler
      expect(wcag2aaConfig.rules?.['image-alt']).toEqual({ enabled: true });
      
      // Başlıklar ve yapı
      expect(wcag2aaConfig.rules?.['document-title']).toEqual({ enabled: true });
      expect(wcag2aaConfig.rules?.['heading-order']).toEqual({ enabled: true });
      
      // ARIA
      expect(wcag2aaConfig.rules?.['aria-roles']).toEqual({ enabled: true });
      expect(wcag2aaConfig.rules?.['aria-required-attr']).toEqual({ enabled: true });
    });
  });
});
