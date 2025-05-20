// src/utils/a11y-test-utils.ts

/**
 * Erişilebilirlik testleri için yardımcı fonksiyonlar
 */

import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { axe, toHaveNoViolations, JestAxeConfigureOptions, Result } from 'jest-axe';
import React from 'react';

// Jest-axe matchers'ı extend et
expect.extend(toHaveNoViolations);

/**
 * Erişilebilirlik test sonuçlarını formatlar
 * @param violations Erişilebilirlik ihlalleri
 * @returns Formatlanmış erişilebilirlik ihlalleri
 */
export const formatAxeViolations = (violations: Result[]): string => {
  if (violations.length === 0) {
    return 'No accessibility violations found.';
  }

  return violations
    .map((violation) => {
      const nodes = violation.nodes.map((node) => {
        return `\n  - ${node.html}\n    ${node.failureSummary}`;
      }).join('\n');

      return `\nRule: ${violation.id} (${violation.impact})\nDescription: ${violation.description}\nHelp: ${violation.help}\nLink: ${violation.helpUrl}\nElements:${nodes}`;
    })
    .join('\n\n');
};

/**
 * Bileşenin erişilebilirlik testini yapar
 * @param ui Test edilecek bileşen
 * @param options Axe yapılandırma seçenekleri
 * @returns Test sonucu
 */
export const testA11y = async (
  ui: React.ReactElement,
  options?: JestAxeConfigureOptions
): Promise<void> => {
  const { container } = render(ui);
  const results = await axe(container, options);
  
  expect(results).toHaveNoViolations();
};

/**
 * Erişilebilirlik testleri için özel render fonksiyonu
 * @param ui Test edilecek bileşen
 * @param options Render seçenekleri
 * @returns Render sonucu ve axe test fonksiyonu
 */
export const renderWithA11y = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>
): RenderResult & { testA11y: (axeOptions?: JestAxeConfigureOptions) => Promise<void> } => {
  const renderResult = render(ui, options);
  
  return {
    ...renderResult,
    testA11y: async (axeOptions?: JestAxeConfigureOptions) => {
      const results = await axe(renderResult.container, axeOptions);
      expect(results).toHaveNoViolations();
    },
  };
};

/**
 * WCAG 2.1 AA kuralları için axe yapılandırması
 */
export const wcag2aaTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * WCAG 2.1 AA kuralları için axe yapılandırması
 */
export const wcag2aaConfig: JestAxeConfigureOptions = {
  rules: {
    // Form etiketleri
    'label': { enabled: true },
    'label-content-name-mismatch': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    
    // Renk kontrastı
    'color-contrast': { enabled: true },
    
    // Klavye erişilebilirliği
    'tabindex': { enabled: true },
    'focus-order-semantics': { enabled: true },
    
    // Alternatif metinler
    'image-alt': { enabled: true },
    'input-image-alt': { enabled: true },
    'area-alt': { enabled: true },
    'object-alt': { enabled: true },
    
    // Başlıklar ve yapı
    'document-title': { enabled: true },
    'landmark-one-main': { enabled: true },
    'heading-order': { enabled: true },
    'landmark-banner-is-top-level': { enabled: true },
    'landmark-complementary-is-top-level': { enabled: true },
    'landmark-contentinfo-is-top-level': { enabled: true },
    'landmark-main-is-top-level': { enabled: true },
    'landmark-no-duplicate-banner': { enabled: true },
    'landmark-no-duplicate-contentinfo': { enabled: true },
    'landmark-no-duplicate-main': { enabled: true },
    'landmark-unique': { enabled: true },
    
    // ARIA
    'aria-allowed-attr': { enabled: true },
    'aria-hidden-body': { enabled: true },
    'aria-hidden-focus': { enabled: true },
    'aria-input-field-name': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-toggle-field-name': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'aria-valid-attr': { enabled: true },
  },
};

/**
 * Klavye navigasyonu için yardımcı fonksiyonlar
 */
export const keyboardNavigation = {
  /**
   * Tab tuşu ile navigasyon yapar
   * @param times Tab tuşuna basma sayısı
   */
  tab: (times: number = 1) => {
    for (let i = 0; i < times; i++) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    }
  },
  
  /**
   * Shift+Tab tuşları ile navigasyon yapar
   * @param times Shift+Tab tuşlarına basma sayısı
   */
  shiftTab: (times: number = 1) => {
    for (let i = 0; i < times; i++) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
    }
  },
  
  /**
   * Enter tuşu ile tıklama yapar
   */
  enter: () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  },
  
  /**
   * Space tuşu ile tıklama yapar
   */
  space: () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
  },
  
  /**
   * Escape tuşu ile işlemi iptal eder
   */
  escape: () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  },
  
  /**
   * Arrow tuşları ile navigasyon yapar
   * @param direction Ok yönü
   */
  arrow: (direction: 'up' | 'down' | 'left' | 'right') => {
    const key = `Arrow${direction.charAt(0).toUpperCase()}${direction.slice(1)}`;
    document.dispatchEvent(new KeyboardEvent('keydown', { key }));
  },
};
