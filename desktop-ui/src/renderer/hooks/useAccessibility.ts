/**
 * A hook for implementing accessibility features
 */
import { useRef, useEffect, useCallback, useState } from 'react';
import { accessibilityChecker, AccessibilityIssue } from '../utils/accessibilityChecker';
import { useKeyboardNavigation, useFocusManager } from '../utils/keyboardAccessibility';
import { useAnnounce, useAriaLive } from '../utils/screenReaderUtils';
import { colorContrastUtils } from '../utils/colorContrastUtils';
import { useAria, useAriaButton, AriaRole } from '../utils/ariaUtils';

/**
 * Options for the useAccessibility hook
 */
export interface UseAccessibilityOptions {
  /**
   * The role of the element
   */
  role?: AriaRole;
  
  /**
   * ARIA attributes for the element
   */
  ariaAttributes?: Record<string, string>;
  
  /**
   * Whether to enable keyboard navigation
   * @default false
   */
  enableKeyboardNavigation?: boolean;
  
  /**
   * Options for keyboard navigation
   */
  keyboardNavigationOptions?: Parameters<typeof useKeyboardNavigation>[1];
  
  /**
   * Whether to enable focus management
   * @default false
   */
  enableFocusManagement?: boolean;
  
  /**
   * Options for focus management
   */
  focusManagementOptions?: Parameters<typeof useFocusManager>[1];
  
  /**
   * Whether to enable screen reader announcements
   * @default false
   */
  enableScreenReaderAnnouncements?: boolean;
  
  /**
   * Whether to enable color contrast checking
   * @default false
   */
  enableColorContrastChecking?: boolean;
  
  /**
   * The background color for contrast checking
   */
  backgroundColor?: string;
  
  /**
   * The foreground color for contrast checking
   */
  foregroundColor?: string;
  
  /**
   * Whether to enable accessibility checking
   * @default false
   */
  enableAccessibilityChecking?: boolean;
  
  /**
   * Options for accessibility checking
   */
  accessibilityCheckingOptions?: Parameters<typeof accessibilityChecker.checkAccessibility>[0];
}

/**
 * A hook for implementing accessibility features
 * @param options Options for accessibility
 * @returns An object with accessibility utilities
 */
export function useAccessibility(
  options: UseAccessibilityOptions = {}
): {
  ref: React.RefObject<HTMLElement>;
  announce: ReturnType<typeof useAnnounce>;
  ariaLiveRef: ReturnType<typeof useAriaLive>;
  keyboardNavigation: ReturnType<typeof useKeyboardNavigation>;
  focusManagement: ReturnType<typeof useFocusManager>;
  accessibilityIssues: AccessibilityIssue[];
  checkAccessibility: () => AccessibilityIssue[];
  contrastRatio: number | null;
  isContrastSufficient: boolean;
  makeColorAccessible: (color: string) => string;
} {
  const {
    role,
    ariaAttributes,
    enableKeyboardNavigation = false,
    keyboardNavigationOptions,
    enableFocusManagement = false,
    focusManagementOptions,
    enableScreenReaderAnnouncements = false,
    enableColorContrastChecking = false,
    backgroundColor = '#FFFFFF',
    foregroundColor = '#000000',
    enableAccessibilityChecking = false,
    accessibilityCheckingOptions,
  } = options;
  
  // Create a ref for the element
  const ref = useRef<HTMLElement>(null);
  
  // Set up ARIA attributes
  useEffect(() => {
    if (ref.current && role) {
      ref.current.setAttribute('role', role);
      
      if (ariaAttributes) {
        for (const [key, value] of Object.entries(ariaAttributes)) {
          ref.current.setAttribute(key, value);
        }
      }
    }
  }, [role, ariaAttributes]);
  
  // Set up keyboard navigation
  const keyboardNavigation = useKeyboardNavigation(
    ref,
    enableKeyboardNavigation ? keyboardNavigationOptions : { enabled: false }
  );
  
  // Set up focus management
  const focusManagement = useFocusManager(
    ref,
    enableFocusManagement ? focusManagementOptions : { trapFocus: false }
  );
  
  // Set up screen reader announcements
  const announce = useAnnounce();
  const ariaLiveRef = useAriaLive({ politeness: 'polite' });
  
  // Set up color contrast checking
  const [contrastRatio, setContrastRatio] = useState<number | null>(null);
  const [isContrastSufficient, setIsContrastSufficient] = useState<boolean>(true);
  
  useEffect(() => {
    if (enableColorContrastChecking && backgroundColor && foregroundColor) {
      const ratio = colorContrastUtils.calculateContrastRatio(foregroundColor, backgroundColor);
      setContrastRatio(ratio);
      setIsContrastSufficient(ratio >= 4.5); // WCAG AA standard for normal text
    }
  }, [enableColorContrastChecking, backgroundColor, foregroundColor]);
  
  // Make a color accessible
  const makeColorAccessible = useCallback(
    (color: string): string => {
      if (!enableColorContrastChecking || !backgroundColor) {
        return color;
      }
      
      return colorContrastUtils.makeColorAccessible(color, {
        background: backgroundColor,
        targetRatio: 4.5, // WCAG AA standard for normal text
        preserveHue: true,
      });
    },
    [enableColorContrastChecking, backgroundColor]
  );
  
  // Set up accessibility checking
  const [accessibilityIssues, setAccessibilityIssues] = useState<AccessibilityIssue[]>([]);
  
  const checkAccessibility = useCallback((): AccessibilityIssue[] => {
    if (!enableAccessibilityChecking || !ref.current) {
      return [];
    }
    
    const issues = accessibilityChecker.checkAccessibility({
      rootElement: ref.current,
      ...accessibilityCheckingOptions,
    });
    
    setAccessibilityIssues(issues);
    return issues;
  }, [enableAccessibilityChecking, accessibilityCheckingOptions]);
  
  // Check accessibility on mount and when dependencies change
  useEffect(() => {
    if (enableAccessibilityChecking && ref.current) {
      // Wait for the component to render completely
      const timeoutId = setTimeout(() => {
        checkAccessibility();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [enableAccessibilityChecking, checkAccessibility]);
  
  return {
    ref,
    announce,
    ariaLiveRef,
    keyboardNavigation,
    focusManagement,
    accessibilityIssues,
    checkAccessibility,
    contrastRatio,
    isContrastSufficient,
    makeColorAccessible,
  };
}

/**
 * A hook for implementing an accessible button
 * @param options Options for the button
 * @returns An object with the ref and event handlers
 */
export function useAccessibleButton(
  options: {
    pressed?: boolean;
    expanded?: boolean;
    disabled?: boolean;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    onFocus?: (event: React.FocusEvent<HTMLElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
    announceOnClick?: string;
    enableColorContrastChecking?: boolean;
    backgroundColor?: string;
    foregroundColor?: string;
  } = {}
): {
  ref: React.RefObject<HTMLElement>;
  buttonProps: {
    role: string;
    tabIndex: number;
    'aria-pressed'?: string;
    'aria-expanded'?: string;
    'aria-disabled'?: string;
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
    onFocus: (event: React.FocusEvent<HTMLElement>) => void;
    onBlur: (event: React.FocusEvent<HTMLElement>) => void;
  };
  contrastRatio: number | null;
  isContrastSufficient: boolean;
  makeColorAccessible: (color: string) => string;
} {
  const {
    pressed,
    expanded,
    disabled,
    onClick,
    onFocus,
    onBlur,
    announceOnClick,
    enableColorContrastChecking = false,
    backgroundColor = '#FFFFFF',
    foregroundColor = '#000000',
  } = options;
  
  const { ref, buttonProps } = useAriaButton({
    pressed,
    expanded,
    disabled,
    onClick: announceOnClick
      ? (event) => {
          announce(announceOnClick);
          onClick?.(event);
        }
      : onClick,
  });
  
  const announce = useAnnounce();
  
  // Set up color contrast checking
  const [contrastRatio, setContrastRatio] = useState<number | null>(null);
  const [isContrastSufficient, setIsContrastSufficient] = useState<boolean>(true);
  
  useEffect(() => {
    if (enableColorContrastChecking && backgroundColor && foregroundColor) {
      const ratio = colorContrastUtils.calculateContrastRatio(foregroundColor, backgroundColor);
      setContrastRatio(ratio);
      setIsContrastSufficient(ratio >= 4.5); // WCAG AA standard for normal text
    }
  }, [enableColorContrastChecking, backgroundColor, foregroundColor]);
  
  // Make a color accessible
  const makeColorAccessible = useCallback(
    (color: string): string => {
      if (!enableColorContrastChecking || !backgroundColor) {
        return color;
      }
      
      return colorContrastUtils.makeColorAccessible(color, {
        background: backgroundColor,
        targetRatio: 4.5, // WCAG AA standard for normal text
        preserveHue: true,
      });
    },
    [enableColorContrastChecking, backgroundColor]
  );
  
  // Add focus and blur handlers
  const handleFocus = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      onFocus?.(event);
    },
    [onFocus]
  );
  
  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      onBlur?.(event);
    },
    [onBlur]
  );
  
  return {
    ref,
    buttonProps: {
      ...buttonProps,
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
    contrastRatio,
    isContrastSufficient,
    makeColorAccessible,
  };
}

/**
 * A hook for implementing an accessible form field
 * @param options Options for the form field
 * @returns An object with the ref and event handlers
 */
export function useAccessibleFormField(
  options: {
    id: string;
    label: string;
    required?: boolean;
    invalid?: boolean;
    errorMessage?: string;
    helpText?: string;
    enableColorContrastChecking?: boolean;
    backgroundColor?: string;
    foregroundColor?: string;
  }
): {
  ref: React.RefObject<HTMLElement>;
  labelProps: {
    htmlFor: string;
    id: string;
  };
  inputProps: {
    id: string;
    'aria-labelledby': string;
    'aria-required'?: string;
    'aria-invalid'?: string;
    'aria-errormessage'?: string;
    'aria-describedby'?: string;
  };
  errorProps: {
    id: string;
    role: string;
  };
  helpProps: {
    id: string;
  };
  contrastRatio: number | null;
  isContrastSufficient: boolean;
  makeColorAccessible: (color: string) => string;
} {
  const {
    id,
    label,
    required = false,
    invalid = false,
    errorMessage,
    helpText,
    enableColorContrastChecking = false,
    backgroundColor = '#FFFFFF',
    foregroundColor = '#000000',
  } = options;
  
  const ref = useRef<HTMLElement>(null);
  
  // Generate IDs
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  
  // Set up color contrast checking
  const [contrastRatio, setContrastRatio] = useState<number | null>(null);
  const [isContrastSufficient, setIsContrastSufficient] = useState<boolean>(true);
  
  useEffect(() => {
    if (enableColorContrastChecking && backgroundColor && foregroundColor) {
      const ratio = colorContrastUtils.calculateContrastRatio(foregroundColor, backgroundColor);
      setContrastRatio(ratio);
      setIsContrastSufficient(ratio >= 4.5); // WCAG AA standard for normal text
    }
  }, [enableColorContrastChecking, backgroundColor, foregroundColor]);
  
  // Make a color accessible
  const makeColorAccessible = useCallback(
    (color: string): string => {
      if (!enableColorContrastChecking || !backgroundColor) {
        return color;
      }
      
      return colorContrastUtils.makeColorAccessible(color, {
        background: backgroundColor,
        targetRatio: 4.5, // WCAG AA standard for normal text
        preserveHue: true,
      });
    },
    [enableColorContrastChecking, backgroundColor]
  );
  
  // Determine describedby value
  const describedBy = [
    helpText ? helpId : null,
    invalid && errorMessage ? errorId : null,
  ]
    .filter(Boolean)
    .join(' ');
  
  return {
    ref,
    labelProps: {
      htmlFor: id,
      id: labelId,
    },
    inputProps: {
      id,
      'aria-labelledby': labelId,
      ...(required && { 'aria-required': 'true' }),
      ...(invalid && { 'aria-invalid': 'true' }),
      ...(invalid && errorMessage && { 'aria-errormessage': errorId }),
      ...(describedBy && { 'aria-describedby': describedBy }),
    },
    errorProps: {
      id: errorId,
      role: 'alert',
    },
    helpProps: {
      id: helpId,
    },
    contrastRatio,
    isContrastSufficient,
    makeColorAccessible,
  };
}

export default {
  useAccessibility,
  useAccessibleButton,
  useAccessibleFormField,
};
