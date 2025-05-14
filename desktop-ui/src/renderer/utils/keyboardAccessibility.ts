/**
 * Utilities for improving keyboard accessibility
 */
import React, { useRef, useEffect, useCallback, KeyboardEvent } from 'react';

/**
 * Options for keyboard navigation
 */
export interface KeyboardNavigationOptions {
  /**
   * Whether to enable keyboard navigation
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Whether to wrap around when reaching the end of the list
   * @default true
   */
  wrap?: boolean;
  
  /**
   * Whether to focus the first item when the component mounts
   * @default false
   */
  autoFocus?: boolean;
  
  /**
   * The selector for focusable items
   * @default '[tabindex="0"], button, a, input, select, textarea, [role="button"]'
   */
  itemSelector?: string;
  
  /**
   * The keys to use for navigation
   * @default { next: ['ArrowDown', 'ArrowRight'], previous: ['ArrowUp', 'ArrowLeft'], select: ['Enter', ' '] }
   */
  keys?: {
    next?: string[];
    previous?: string[];
    select?: string[];
    first?: string[];
    last?: string[];
  };
  
  /**
   * Whether to prevent the default behavior of navigation keys
   * @default true
   */
  preventDefault?: boolean;
  
  /**
   * Whether to stop propagation of navigation key events
   * @default false
   */
  stopPropagation?: boolean;
  
  /**
   * A callback to handle item selection
   */
  onSelect?: (item: HTMLElement, index: number) => void;
}

/**
 * A hook for implementing keyboard navigation
 * @param containerRef A ref to the container element
 * @param options Options for keyboard navigation
 * @returns An object with keyboard navigation utilities
 */
export function useKeyboardNavigation(
  containerRef: React.RefObject<HTMLElement>,
  options: KeyboardNavigationOptions = {}
): {
  handleKeyDown: (event: KeyboardEvent) => void;
  focusItem: (index: number) => void;
  focusFirstItem: () => void;
  focusLastItem: () => void;
  focusNextItem: () => void;
  focusPreviousItem: () => void;
} {
  const {
    enabled = true,
    wrap = true,
    autoFocus = false,
    itemSelector = '[tabindex="0"], button, a, input, select, textarea, [role="button"]',
    keys = {
      next: ['ArrowDown', 'ArrowRight'],
      previous: ['ArrowUp', 'ArrowLeft'],
      select: ['Enter', ' '],
      first: ['Home'],
      last: ['End'],
    },
    preventDefault = true,
    stopPropagation = false,
    onSelect,
  } = options;
  
  // Store the currently focused item index
  const focusedIndexRef = useRef<number>(-1);
  
  // Get all focusable items in the container
  const getFocusableItems = useCallback((): HTMLElement[] => {
    if (!containerRef.current) {
      return [];
    }
    
    return Array.from(containerRef.current.querySelectorAll<HTMLElement>(itemSelector));
  }, [containerRef, itemSelector]);
  
  // Focus an item by index
  const focusItem = useCallback(
    (index: number): void => {
      const items = getFocusableItems();
      
      if (items.length === 0) {
        return;
      }
      
      // Ensure index is within bounds
      if (index < 0) {
        index = wrap ? items.length - 1 : 0;
      } else if (index >= items.length) {
        index = wrap ? 0 : items.length - 1;
      }
      
      // Focus the item
      const item = items[index];
      item.focus();
      focusedIndexRef.current = index;
    },
    [getFocusableItems, wrap]
  );
  
  // Focus the first item
  const focusFirstItem = useCallback((): void => {
    focusItem(0);
  }, [focusItem]);
  
  // Focus the last item
  const focusLastItem = useCallback((): void => {
    const items = getFocusableItems();
    focusItem(items.length - 1);
  }, [getFocusableItems, focusItem]);
  
  // Focus the next item
  const focusNextItem = useCallback((): void => {
    focusItem(focusedIndexRef.current + 1);
  }, [focusItem]);
  
  // Focus the previous item
  const focusPreviousItem = useCallback((): void => {
    focusItem(focusedIndexRef.current - 1);
  }, [focusItem]);
  
  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent): void => {
      if (!enabled) {
        return;
      }
      
      const { key } = event;
      
      // Handle navigation keys
      if (keys.next && keys.next.includes(key)) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
        focusNextItem();
      } else if (keys.previous && keys.previous.includes(key)) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
        focusPreviousItem();
      } else if (keys.first && keys.first.includes(key)) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
        focusFirstItem();
      } else if (keys.last && keys.last.includes(key)) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
        focusLastItem();
      } else if (keys.select && keys.select.includes(key) && onSelect) {
        const items = getFocusableItems();
        const index = focusedIndexRef.current;
        
        if (index >= 0 && index < items.length) {
          if (preventDefault) {
            event.preventDefault();
          }
          if (stopPropagation) {
            event.stopPropagation();
          }
          onSelect(items[index], index);
        }
      }
    },
    [
      enabled,
      keys,
      preventDefault,
      stopPropagation,
      focusNextItem,
      focusPreviousItem,
      focusFirstItem,
      focusLastItem,
      getFocusableItems,
      onSelect,
    ]
  );
  
  // Auto-focus the first item when the component mounts
  useEffect(() => {
    if (autoFocus) {
      focusFirstItem();
    }
  }, [autoFocus, focusFirstItem]);
  
  return {
    handleKeyDown,
    focusItem,
    focusFirstItem,
    focusLastItem,
    focusNextItem,
    focusPreviousItem,
  };
}

/**
 * Options for focus management
 */
export interface FocusManagerOptions {
  /**
   * Whether to trap focus within the container
   * @default false
   */
  trapFocus?: boolean;
  
  /**
   * Whether to restore focus when the component unmounts
   * @default true
   */
  restoreFocus?: boolean;
  
  /**
   * Whether to auto-focus the first focusable element
   * @default false
   */
  autoFocus?: boolean;
  
  /**
   * The selector for focusable items
   * @default 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
   */
  focusableSelector?: string;
}

/**
 * A hook for managing focus
 * @param containerRef A ref to the container element
 * @param options Options for focus management
 * @returns An object with focus management utilities
 */
export function useFocusManager(
  containerRef: React.RefObject<HTMLElement>,
  options: FocusManagerOptions = {}
): {
  handleFocusTrap: (event: KeyboardEvent) => void;
} {
  const {
    trapFocus = false,
    restoreFocus = true,
    autoFocus = false,
    focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  } = options;
  
  // Store the element that had focus before the component mounted
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  // Get all focusable elements in the container
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) {
      return [];
    }
    
    return Array.from(containerRef.current.querySelectorAll<HTMLElement>(focusableSelector));
  }, [containerRef, focusableSelector]);
  
  // Handle tab key to trap focus
  const handleFocusTrap = useCallback(
    (event: KeyboardEvent): void => {
      if (!trapFocus || event.key !== 'Tab') {
        return;
      }
      
      const focusableElements = getFocusableElements();
      
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (event.shiftKey) {
        // Shift+Tab: if focus is on the first element, move to the last element
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if focus is on the last element, move to the first element
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [trapFocus, getFocusableElements]
  );
  
  // Save the currently focused element and auto-focus the first focusable element
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    
    // Save the currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;
    
    // Auto-focus the first focusable element
    if (autoFocus) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
    
    // Restore focus when the component unmounts
    return () => {
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [autoFocus, restoreFocus, getFocusableElements]);
  
  return {
    handleFocusTrap,
  };
}

/**
 * Makes an element keyboard accessible
 * @param element The element to make keyboard accessible
 * @param options Options for keyboard accessibility
 */
export function makeKeyboardAccessible(
  element: HTMLElement,
  options: {
    role?: string;
    tabIndex?: number;
    onClick?: (event: MouseEvent) => void;
    onKeyDown?: (event: KeyboardEvent) => void;
  } = {}
): void {
  const { role = 'button', tabIndex = 0, onClick, onKeyDown } = options;
  
  // Set role and tabIndex
  element.setAttribute('role', role);
  element.setAttribute('tabindex', tabIndex.toString());
  
  // Add click handler
  if (onClick) {
    element.addEventListener('click', onClick);
  }
  
  // Add keydown handler
  if (onKeyDown) {
    element.addEventListener('keydown', onKeyDown);
  } else if (onClick) {
    // Default keydown handler for Enter and Space
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick(new MouseEvent('click'));
      }
    });
  }
}

/**
 * A higher-order component that adds keyboard accessibility to a component
 * @param Component The component to enhance
 * @param options Options for keyboard accessibility
 * @returns An enhanced component with keyboard accessibility
 */
export function withKeyboardAccessibility<P extends object>(
  Component: React.ComponentType<P>,
  options: KeyboardNavigationOptions = {}
): React.ComponentType<P> {
  const EnhancedComponent = (props: P) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { handleKeyDown } = useKeyboardNavigation(containerRef, options);
    
    return (
      <div ref={containerRef} onKeyDown={handleKeyDown}>
        <Component {...props} />
      </div>
    );
  };
  
  EnhancedComponent.displayName = `WithKeyboardAccessibility(${Component.displayName || Component.name || 'Component'})`;
  
  return EnhancedComponent;
}

export default {
  useKeyboardNavigation,
  useFocusManager,
  makeKeyboardAccessible,
  withKeyboardAccessibility,
};
