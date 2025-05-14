/**
 * Utilities for checking and analyzing accessibility
 */

/**
 * Accessibility issue severity levels
 */
export enum AccessibilityIssueSeverity {
  /**
   * Critical issues that must be fixed
   */
  Critical = 'critical',
  
  /**
   * Serious issues that should be fixed
   */
  Serious = 'serious',
  
  /**
   * Moderate issues that are recommended to fix
   */
  Moderate = 'moderate',
  
  /**
   * Minor issues that are suggested to fix
   */
  Minor = 'minor',
}

/**
 * Accessibility issue categories
 */
export enum AccessibilityIssueCategory {
  /**
   * Issues related to keyboard accessibility
   */
  Keyboard = 'keyboard',
  
  /**
   * Issues related to screen readers
   */
  ScreenReader = 'screenReader',
  
  /**
   * Issues related to color and contrast
   */
  ColorContrast = 'colorContrast',
  
  /**
   * Issues related to ARIA attributes
   */
  ARIA = 'aria',
  
  /**
   * Issues related to semantic HTML
   */
  SemanticHTML = 'semanticHTML',
  
  /**
   * Issues related to focus management
   */
  Focus = 'focus',
  
  /**
   * Issues related to form inputs
   */
  Forms = 'forms',
  
  /**
   * Issues related to images and media
   */
  Media = 'media',
  
  /**
   * Issues related to dynamic content
   */
  DynamicContent = 'dynamicContent',
  
  /**
   * Other issues
   */
  Other = 'other',
}

/**
 * Accessibility issue
 */
export interface AccessibilityIssue {
  /**
   * The ID of the issue
   */
  id: string;
  
  /**
   * The element that has the issue
   */
  element: Element;
  
  /**
   * The severity of the issue
   */
  severity: AccessibilityIssueSeverity;
  
  /**
   * The category of the issue
   */
  category: AccessibilityIssueCategory;
  
  /**
   * The description of the issue
   */
  description: string;
  
  /**
   * The impact of the issue
   */
  impact: string;
  
  /**
   * Recommendations for fixing the issue
   */
  recommendations: string[];
  
  /**
   * The WCAG (Web Content Accessibility Guidelines) criteria that the issue violates
   */
  wcagCriteria?: string[];
}

/**
 * Options for accessibility checking
 */
export interface AccessibilityCheckerOptions {
  /**
   * The root element to check
   * @default document.body
   */
  rootElement?: Element;
  
  /**
   * Whether to include minor issues
   * @default true
   */
  includeMinorIssues?: boolean;
  
  /**
   * Categories to include in the check
   * @default all categories
   */
  includeCategories?: AccessibilityIssueCategory[];
  
  /**
   * Categories to exclude from the check
   * @default []
   */
  excludeCategories?: AccessibilityIssueCategory[];
  
  /**
   * Whether to check elements that are not visible
   * @default false
   */
  checkHiddenElements?: boolean;
}

/**
 * A class for checking and analyzing accessibility
 */
export class AccessibilityChecker {
  /**
   * Checks for accessibility issues
   * @param options Options for accessibility checking
   * @returns An array of accessibility issues
   */
  checkAccessibility(options: AccessibilityCheckerOptions = {}): AccessibilityIssue[] {
    const {
      rootElement = document.body,
      includeMinorIssues = true,
      includeCategories,
      excludeCategories = [],
      checkHiddenElements = false,
    } = options;
    
    const issues: AccessibilityIssue[] = [];
    
    // Check for missing alt text on images
    this.checkMissingAltText(rootElement, issues);
    
    // Check for missing form labels
    this.checkMissingFormLabels(rootElement, issues);
    
    // Check for insufficient color contrast
    this.checkColorContrast(rootElement, issues);
    
    // Check for keyboard accessibility issues
    this.checkKeyboardAccessibility(rootElement, issues);
    
    // Check for missing ARIA attributes
    this.checkMissingARIA(rootElement, issues);
    
    // Check for improper heading structure
    this.checkHeadingStructure(rootElement, issues);
    
    // Check for missing language attribute
    this.checkMissingLanguage(rootElement, issues);
    
    // Filter issues based on options
    return issues.filter((issue) => {
      // Filter by severity
      if (!includeMinorIssues && issue.severity === AccessibilityIssueSeverity.Minor) {
        return false;
      }
      
      // Filter by category
      if (includeCategories && !includeCategories.includes(issue.category)) {
        return false;
      }
      
      if (excludeCategories.includes(issue.category)) {
        return false;
      }
      
      // Filter by visibility
      if (!checkHiddenElements && !this.isElementVisible(issue.element)) {
        return false;
      }
      
      return true;
    });
  }
  
  /**
   * Generates an accessibility report
   * @param issues An array of accessibility issues
   * @returns An accessibility report
   */
  generateReport(issues: AccessibilityIssue[]): Record<string, any> {
    // Count issues by severity
    const severityCounts = {
      [AccessibilityIssueSeverity.Critical]: 0,
      [AccessibilityIssueSeverity.Serious]: 0,
      [AccessibilityIssueSeverity.Moderate]: 0,
      [AccessibilityIssueSeverity.Minor]: 0,
    };
    
    // Count issues by category
    const categoryCounts: Record<string, number> = {};
    
    // Process issues
    issues.forEach((issue) => {
      // Count by severity
      severityCounts[issue.severity]++;
      
      // Count by category
      categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
    });
    
    // Calculate overall score (0-100)
    const totalIssues = issues.length;
    const weightedIssues =
      severityCounts[AccessibilityIssueSeverity.Critical] * 10 +
      severityCounts[AccessibilityIssueSeverity.Serious] * 5 +
      severityCounts[AccessibilityIssueSeverity.Moderate] * 2 +
      severityCounts[AccessibilityIssueSeverity.Minor] * 1;
    
    // Higher score is better (100 = no issues)
    const score = Math.max(0, 100 - Math.min(100, weightedIssues));
    
    // Determine compliance level
    let complianceLevel = 'AAA';
    if (severityCounts[AccessibilityIssueSeverity.Critical] > 0) {
      complianceLevel = 'Non-compliant';
    } else if (severityCounts[AccessibilityIssueSeverity.Serious] > 0) {
      complianceLevel = 'A';
    } else if (severityCounts[AccessibilityIssueSeverity.Moderate] > 0) {
      complianceLevel = 'AA';
    }
    
    return {
      score,
      complianceLevel,
      totalIssues,
      issuesBySeverity: severityCounts,
      issuesByCategory: categoryCounts,
      timestamp: new Date().toISOString(),
    };
  }
  
  /**
   * Checks for missing alt text on images
   * @param rootElement The root element to check
   * @param issues The array to add issues to
   * @private
   */
  private checkMissingAltText(rootElement: Element, issues: AccessibilityIssue[]): void {
    const images = rootElement.querySelectorAll('img');
    
    images.forEach((img, index) => {
      const alt = img.getAttribute('alt');
      
      if (alt === null) {
        issues.push({
          id: `missing-alt-${index}`,
          element: img,
          severity: AccessibilityIssueSeverity.Serious,
          category: AccessibilityIssueCategory.Media,
          description: 'Image is missing alt text',
          impact: 'Screen reader users will not know what the image represents',
          recommendations: [
            'Add alt text that describes the image',
            'If the image is decorative, use alt=""',
          ],
          wcagCriteria: ['1.1.1'],
        });
      } else if (alt === '') {
        // Check if the image is truly decorative
        const isDecorative = this.isDecorativeImage(img);
        
        if (!isDecorative) {
          issues.push({
            id: `empty-alt-${index}`,
            element: img,
            severity: AccessibilityIssueSeverity.Moderate,
            category: AccessibilityIssueCategory.Media,
            description: 'Image has empty alt text but may not be decorative',
            impact: 'Screen reader users may miss important content',
            recommendations: [
              'Add descriptive alt text if the image conveys information',
              'Keep alt="" only if the image is truly decorative',
            ],
            wcagCriteria: ['1.1.1'],
          });
        }
      }
    });
  }
  
  /**
   * Checks for missing form labels
   * @param rootElement The root element to check
   * @param issues The array to add issues to
   * @private
   */
  private checkMissingFormLabels(rootElement: Element, issues: AccessibilityIssue[]): void {
    const formControls = rootElement.querySelectorAll('input, select, textarea');
    
    formControls.forEach((control, index) => {
      // Skip hidden inputs
      if (control instanceof HTMLInputElement && control.type === 'hidden') {
        return;
      }
      
      const id = control.getAttribute('id');
      const ariaLabelledBy = control.getAttribute('aria-labelledby');
      const ariaLabel = control.getAttribute('aria-label');
      
      // Check if the control has an associated label
      const hasLabel = id && rootElement.querySelector(`label[for="${id}"]`);
      
      if (!hasLabel && !ariaLabelledBy && !ariaLabel) {
        issues.push({
          id: `missing-label-${index}`,
          element: control,
          severity: AccessibilityIssueSeverity.Serious,
          category: AccessibilityIssueCategory.Forms,
          description: 'Form control is missing a label',
          impact: 'Screen reader users will not know the purpose of the form control',
          recommendations: [
            'Add a label element with a for attribute that matches the control\'s id',
            'Add aria-labelledby attribute that references the id of a labelling element',
            'Add aria-label attribute with a descriptive label',
          ],
          wcagCriteria: ['1.3.1', '3.3.2'],
        });
      }
    });
  }
  
  /**
   * Checks for insufficient color contrast
   * @param rootElement The root element to check
   * @param issues The array to add issues to
   * @private
   */
  private checkColorContrast(rootElement: Element, issues: AccessibilityIssue[]): void {
    const textElements = rootElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, label');
    
    textElements.forEach((element, index) => {
      const style = window.getComputedStyle(element);
      const backgroundColor = style.backgroundColor;
      const color = style.color;
      
      // Skip elements with transparent background
      if (backgroundColor === 'transparent' || backgroundColor === 'rgba(0, 0, 0, 0)') {
        return;
      }
      
      const contrast = this.calculateContrast(color, backgroundColor);
      const fontSize = parseFloat(style.fontSize);
      const isBold = parseInt(style.fontWeight, 10) >= 700;
      
      // WCAG 2.1 contrast requirements
      // Large text: 3:1 (18pt or 14pt bold)
      // Normal text: 4.5:1
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);
      const requiredContrast = isLargeText ? 3 : 4.5;
      
      if (contrast < requiredContrast) {
        issues.push({
          id: `low-contrast-${index}`,
          element: element,
          severity: AccessibilityIssueSeverity.Serious,
          category: AccessibilityIssueCategory.ColorContrast,
          description: `Text has insufficient color contrast (${contrast.toFixed(2)}:1)`,
          impact: 'Users with low vision or color blindness may have difficulty reading the text',
          recommendations: [
            `Increase contrast to at least ${requiredContrast}:1`,
            'Use a darker text color or lighter background color',
            'Consider using a larger font size or bold font weight',
          ],
          wcagCriteria: ['1.4.3'],
        });
      }
    });
  }
  
  /**
   * Checks for keyboard accessibility issues
   * @param rootElement The root element to check
   * @param issues The array to add issues to
   * @private
   */
  private checkKeyboardAccessibility(rootElement: Element, issues: AccessibilityIssue[]): void {
    // Check for elements with click handlers but no keyboard handlers
    const clickableElements = rootElement.querySelectorAll('[onclick], [role="button"], button, a');
    
    clickableElements.forEach((element, index) => {
      // Skip links with href (they're already keyboard accessible)
      if (element instanceof HTMLAnchorElement && element.hasAttribute('href')) {
        return;
      }
      
      // Skip buttons (they're already keyboard accessible)
      if (element instanceof HTMLButtonElement) {
        return;
      }
      
      // Check if the element has a tabindex
      const tabindex = element.getAttribute('tabindex');
      
      // Check if the element has a keydown or keyup handler
      const hasKeyboardHandler =
        element.hasAttribute('onkeydown') ||
        element.hasAttribute('onkeyup') ||
        element.hasAttribute('onkeypress');
      
      if (!tabindex && !hasKeyboardHandler) {
        issues.push({
          id: `keyboard-access-${index}`,
          element: element,
          severity: AccessibilityIssueSeverity.Serious,
          category: AccessibilityIssueCategory.Keyboard,
          description: 'Clickable element is not keyboard accessible',
          impact: 'Keyboard users will not be able to interact with this element',
          recommendations: [
            'Add tabindex="0" to make the element focusable',
            'Add keyboard event handlers (keydown, keyup) to handle keyboard interaction',
            'Consider using a native button or anchor element instead',
          ],
          wcagCriteria: ['2.1.1'],
        });
      }
    });
  }
  
  /**
   * Checks for missing ARIA attributes
   * @param rootElement The root element to check
   * @param issues The array to add issues to
   * @private
   */
  private checkMissingARIA(rootElement: Element, issues: AccessibilityIssue[]): void {
    // Check for elements with ARIA roles that require certain attributes
    const elementsWithRoles = rootElement.querySelectorAll('[role]');
    
    elementsWithRoles.forEach((element, index) => {
      const role = element.getAttribute('role');
      
      if (!role) {
        return;
      }
      
      // Check for required attributes based on role
      switch (role) {
        case 'checkbox':
        case 'switch':
          if (!element.hasAttribute('aria-checked')) {
            issues.push({
              id: `missing-aria-${index}`,
              element: element,
              severity: AccessibilityIssueSeverity.Serious,
              category: AccessibilityIssueCategory.ARIA,
              description: `Element with role="${role}" is missing aria-checked attribute`,
              impact: 'Screen reader users will not know the state of the control',
              recommendations: [
                `Add aria-checked attribute to the element with role="${role}"`,
                'Update aria-checked when the state changes',
              ],
              wcagCriteria: ['4.1.2'],
            });
          }
          break;
          
        case 'combobox':
        case 'listbox':
        case 'textbox':
          if (!element.hasAttribute('aria-expanded')) {
            issues.push({
              id: `missing-aria-${index}`,
              element: element,
              severity: AccessibilityIssueSeverity.Serious,
              category: AccessibilityIssueCategory.ARIA,
              description: `Element with role="${role}" is missing aria-expanded attribute`,
              impact: 'Screen reader users will not know if the control is expanded or collapsed',
              recommendations: [
                `Add aria-expanded attribute to the element with role="${role}"`,
                'Update aria-expanded when the state changes',
              ],
              wcagCriteria: ['4.1.2'],
            });
          }
          break;
          
        case 'tab':
          if (!element.hasAttribute('aria-selected')) {
            issues.push({
              id: `missing-aria-${index}`,
              element: element,
              severity: AccessibilityIssueSeverity.Serious,
              category: AccessibilityIssueCategory.ARIA,
              description: `Element with role="tab" is missing aria-selected attribute`,
              impact: 'Screen reader users will not know which tab is selected',
              recommendations: [
                'Add aria-selected attribute to the element with role="tab"',
                'Update aria-selected when the tab selection changes',
              ],
              wcagCriteria: ['4.1.2'],
            });
          }
          break;
      }
    });
  }
  
  /**
   * Checks for improper heading structure
   * @param rootElement The root element to check
   * @param issues The array to add issues to
   * @private
   */
  private checkHeadingStructure(rootElement: Element, issues: AccessibilityIssue[]): void {
    const headings = rootElement.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');
    let previousLevel = 0;
    
    headings.forEach((heading, index) => {
      let level = 0;
      
      if (heading.hasAttribute('role') && heading.getAttribute('role') === 'heading') {
        level = parseInt(heading.getAttribute('aria-level') || '2', 10);
      } else {
        level = parseInt(heading.tagName.substring(1), 10);
      }
      
      // Check for skipped heading levels
      if (previousLevel > 0 && level > previousLevel + 1) {
        issues.push({
          id: `heading-structure-${index}`,
          element: heading,
          severity: AccessibilityIssueSeverity.Moderate,
          category: AccessibilityIssueCategory.SemanticHTML,
          description: `Heading level ${level} follows heading level ${previousLevel}, skipping one or more levels`,
          impact: 'Screen reader users may have difficulty understanding the document structure',
          recommendations: [
            'Use heading levels in sequential order without skipping levels',
            `Change this heading to h${previousLevel + 1}`,
          ],
          wcagCriteria: ['1.3.1', '2.4.6'],
        });
      }
      
      previousLevel = level;
    });
  }
  
  /**
   * Checks for missing language attribute
   * @param rootElement The root element to check
   * @param issues The array to add issues to
   * @private
   */
  private checkMissingLanguage(rootElement: Element, issues: AccessibilityIssue[]): void {
    const html = document.querySelector('html');
    
    if (!html || !html.hasAttribute('lang')) {
      issues.push({
        id: 'missing-lang',
        element: html || document.documentElement,
        severity: AccessibilityIssueSeverity.Serious,
        category: AccessibilityIssueCategory.ScreenReader,
        description: 'HTML element is missing lang attribute',
        impact: 'Screen readers may not announce content correctly',
        recommendations: [
          'Add lang attribute to the HTML element (e.g., lang="en")',
        ],
        wcagCriteria: ['3.1.1'],
      });
    }
  }
  
  /**
   * Checks if an element is visible
   * @param element The element to check
   * @returns Whether the element is visible
   * @private
   */
  private isElementVisible(element: Element): boolean {
    const style = window.getComputedStyle(element);
    
    return !(
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.opacity === '0' ||
      (element instanceof HTMLElement && element.offsetParent === null)
    );
  }
  
  /**
   * Checks if an image is decorative
   * @param img The image element to check
   * @returns Whether the image is decorative
   * @private
   */
  private isDecorativeImage(img: HTMLImageElement): boolean {
    // Check if the image has a role="presentation" or role="none"
    const role = img.getAttribute('role');
    if (role === 'presentation' || role === 'none') {
      return true;
    }
    
    // Check if the image is small (likely an icon)
    if (img.width <= 24 && img.height <= 24) {
      return true;
    }
    
    // Check if the image has a CSS class that suggests it's decorative
    const className = img.className;
    if (
      className.includes('decoration') ||
      className.includes('icon') ||
      className.includes('background') ||
      className.includes('separator')
    ) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Calculates the contrast ratio between two colors
   * @param foreground The foreground color
   * @param background The background color
   * @returns The contrast ratio
   * @private
   */
  private calculateContrast(foreground: string, background: string): number {
    const fgRgb = this.parseColor(foreground);
    const bgRgb = this.parseColor(background);
    
    if (!fgRgb || !bgRgb) {
      return 1; // Default to lowest contrast
    }
    
    // Calculate luminance
    const fgLuminance = this.calculateLuminance(fgRgb);
    const bgLuminance = this.calculateLuminance(bgRgb);
    
    // Calculate contrast ratio
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    
    return (lighter + 0.05) / (darker + 0.05);
  }
  
  /**
   * Parses a CSS color string into RGB values
   * @param color The CSS color string
   * @returns The RGB values, or null if the color could not be parsed
   * @private
   */
  private parseColor(color: string): { r: number; g: number; b: number } | null {
    // Handle named colors
    if (color.startsWith('rgb')) {
      // Parse RGB or RGBA
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
      if (match) {
        return {
          r: parseInt(match[1], 10),
          g: parseInt(match[2], 10),
          b: parseInt(match[3], 10),
        };
      }
    } else if (color.startsWith('#')) {
      // Parse hex color
      let hex = color.substring(1);
      
      // Convert shorthand hex to full hex
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      
      if (hex.length === 6) {
        return {
          r: parseInt(hex.substring(0, 2), 16),
          g: parseInt(hex.substring(2, 4), 16),
          b: parseInt(hex.substring(4, 6), 16),
        };
      }
    }
    
    // For other formats, create a temporary element to get computed style
    const tempElement = document.createElement('div');
    tempElement.style.color = color;
    document.body.appendChild(tempElement);
    const computedColor = window.getComputedStyle(tempElement).color;
    document.body.removeChild(tempElement);
    
    // Parse the computed color
    const match = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
      };
    }
    
    return null;
  }
  
  /**
   * Calculates the luminance of a color
   * @param rgb The RGB values of the color
   * @returns The luminance value
   * @private
   */
  private calculateLuminance(rgb: { r: number; g: number; b: number }): number {
    // Convert RGB to sRGB
    const sRgb = {
      r: rgb.r / 255,
      g: rgb.g / 255,
      b: rgb.b / 255,
    };
    
    // Apply gamma correction
    const gammaCorrected = {
      r: sRgb.r <= 0.03928 ? sRgb.r / 12.92 : Math.pow((sRgb.r + 0.055) / 1.055, 2.4),
      g: sRgb.g <= 0.03928 ? sRgb.g / 12.92 : Math.pow((sRgb.g + 0.055) / 1.055, 2.4),
      b: sRgb.b <= 0.03928 ? sRgb.b / 12.92 : Math.pow((sRgb.b + 0.055) / 1.055, 2.4),
    };
    
    // Calculate luminance
    return 0.2126 * gammaCorrected.r + 0.7152 * gammaCorrected.g + 0.0722 * gammaCorrected.b;
  }
}

// Create a singleton instance
export const accessibilityChecker = new AccessibilityChecker();

export default accessibilityChecker;
