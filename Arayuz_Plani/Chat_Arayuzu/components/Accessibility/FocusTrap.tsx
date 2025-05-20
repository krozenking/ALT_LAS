import React, { useRef, useEffect } from 'react';

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  returnFocusOnDeactivate?: boolean;
}

/**
 * FocusTrap component for trapping focus within a component
 * 
 * @param children - Content to trap focus within
 * @param active - Whether the focus trap is active
 * @param returnFocusOnDeactivate - Whether to return focus to the previously focused element when deactivated
 */
const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active = true,
  returnFocusOnDeactivate = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  
  // Save the currently focused element when the component mounts
  useEffect(() => {
    if (active && returnFocusOnDeactivate) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
    }
  }, [active, returnFocusOnDeactivate]);
  
  // Return focus to the previously focused element when the component unmounts
  useEffect(() => {
    return () => {
      if (returnFocusOnDeactivate && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [returnFocusOnDeactivate]);
  
  // Handle tab key to trap focus
  useEffect(() => {
    if (!active) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !containerRef.current) return;
      
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      // If shift + tab and on first element, move to last element
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // If tab and on last element, move to first element
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Focus the first focusable element when the component mounts
    if (containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);
  
  return <div ref={containerRef}>{children}</div>;
};

export default FocusTrap;
