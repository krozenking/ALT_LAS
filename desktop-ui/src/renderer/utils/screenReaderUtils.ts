/**
 * Utilities for improving screen reader compatibility
 */
import React, { useRef, useEffect, useCallback } from 'react';

/**
 * Options for screen reader announcements
 */
export interface AnnouncementOptions {
  /**
   * The politeness level of the announcement
   * @default 'polite'
   */
  politeness?: 'polite' | 'assertive';
  
  /**
   * The delay before the announcement is made (in milliseconds)
   * @default 0
   */
  delay?: number;
  
  /**
   * Whether to clear the announcement after it's made
   * @default true
   */
  clearAfter?: boolean;
  
  /**
   * The delay before the announcement is cleared (in milliseconds)
   * @default 5000
   */
  clearDelay?: number;
}

/**
 * A class for managing screen reader announcements
 */
export class ScreenReaderAnnouncer {
  private politeContainer: HTMLElement | null = null;
  private assertiveContainer: HTMLElement | null = null;
  
  /**
   * Creates a new ScreenReaderAnnouncer
   */
  constructor() {
    if (typeof document !== 'undefined') {
      this.createAnnouncementContainers();
    }
  }
  
  /**
   * Announces a message to screen readers
   * @param message The message to announce
   * @param options Options for the announcement
   */
  announce(message: string, options: AnnouncementOptions = {}): void {
    const {
      politeness = 'polite',
      delay = 0,
      clearAfter = true,
      clearDelay = 5000,
    } = options;
    
    if (typeof document === 'undefined') {
      return;
    }
    
    // Create containers if they don't exist
    if (!this.politeContainer || !this.assertiveContainer) {
      this.createAnnouncementContainers();
    }
    
    const container = politeness === 'assertive' ? this.assertiveContainer : this.politeContainer;
    
    if (!container) {
      return;
    }
    
    // Delay the announcement if needed
    setTimeout(() => {
      // Set the message
      container.textContent = message;
      
      // Clear the message after a delay if needed
      if (clearAfter) {
        setTimeout(() => {
          if (container.textContent === message) {
            container.textContent = '';
          }
        }, clearDelay);
      }
    }, delay);
  }
  
  /**
   * Creates the announcement containers
   * @private
   */
  private createAnnouncementContainers(): void {
    // Create polite container
    this.politeContainer = document.createElement('div');
    this.politeContainer.setAttribute('id', 'sr-polite-announcer');
    this.politeContainer.setAttribute('aria-live', 'polite');
    this.politeContainer.setAttribute('aria-atomic', 'true');
    this.setContainerStyles(this.politeContainer);
    document.body.appendChild(this.politeContainer);
    
    // Create assertive container
    this.assertiveContainer = document.createElement('div');
    this.assertiveContainer.setAttribute('id', 'sr-assertive-announcer');
    this.assertiveContainer.setAttribute('aria-live', 'assertive');
    this.assertiveContainer.setAttribute('aria-atomic', 'true');
    this.setContainerStyles(this.assertiveContainer);
    document.body.appendChild(this.assertiveContainer);
  }
  
  /**
   * Sets the styles for an announcement container
   * @param container The container to style
   * @private
   */
  private setContainerStyles(container: HTMLElement): void {
    container.style.position = 'absolute';
    container.style.width = '1px';
    container.style.height = '1px';
    container.style.padding = '0';
    container.style.margin = '-1px';
    container.style.overflow = 'hidden';
    container.style.clip = 'rect(0, 0, 0, 0)';
    container.style.whiteSpace = 'nowrap';
    container.style.border = '0';
  }
}

// Create a singleton instance
export const screenReaderAnnouncer = new ScreenReaderAnnouncer();

/**
 * A hook for announcing messages to screen readers
 * @returns A function to announce messages
 */
export function useAnnounce(): (message: string, options?: AnnouncementOptions) => void {
  return useCallback((message: string, options?: AnnouncementOptions) => {
    screenReaderAnnouncer.announce(message, options);
  }, []);
}

/**
 * Options for the useAriaLive hook
 */
export interface AriaLiveOptions {
  /**
   * The politeness level of the region
   * @default 'polite'
   */
  politeness?: 'polite' | 'assertive';
  
  /**
   * Whether the region is atomic
   * @default true
   */
  atomic?: boolean;
  
  /**
   * Whether the region is relevant
   * @default 'additions text'
   */
  relevant?: 'additions' | 'removals' | 'text' | 'all' | string;
}

/**
 * A hook for creating an ARIA live region
 * @param options Options for the live region
 * @returns A ref to attach to the live region element
 */
export function useAriaLive(options: AriaLiveOptions = {}): React.RefObject<HTMLDivElement> {
  const {
    politeness = 'polite',
    atomic = true,
    relevant = 'additions text',
  } = options;
  
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (ref.current) {
      ref.current.setAttribute('aria-live', politeness);
      
      if (atomic) {
        ref.current.setAttribute('aria-atomic', 'true');
      }
      
      if (relevant) {
        ref.current.setAttribute('aria-relevant', relevant);
      }
    }
  }, [politeness, atomic, relevant]);
  
  return ref;
}

/**
 * Options for the useAriaHidden hook
 */
export interface AriaHiddenOptions {
  /**
   * Whether the element is hidden
   * @default true
   */
  hidden?: boolean;
  
  /**
   * Whether to hide the element from screen readers only
   * @default false
   */
  visuallyHidden?: boolean;
}

/**
 * A hook for hiding elements from screen readers
 * @param options Options for hiding the element
 * @returns A ref to attach to the element
 */
export function useAriaHidden(options: AriaHiddenOptions = {}): React.RefObject<HTMLElement> {
  const { hidden = true, visuallyHidden = false } = options;
  
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (ref.current) {
      if (hidden) {
        ref.current.setAttribute('aria-hidden', 'true');
        
        if (visuallyHidden) {
          ref.current.style.position = 'absolute';
          ref.current.style.width = '1px';
          ref.current.style.height = '1px';
          ref.current.style.padding = '0';
          ref.current.style.margin = '-1px';
          ref.current.style.overflow = 'hidden';
          ref.current.style.clip = 'rect(0, 0, 0, 0)';
          ref.current.style.whiteSpace = 'nowrap';
          ref.current.style.border = '0';
        }
      } else {
        ref.current.removeAttribute('aria-hidden');
        
        if (visuallyHidden) {
          ref.current.style.position = '';
          ref.current.style.width = '';
          ref.current.style.height = '';
          ref.current.style.padding = '';
          ref.current.style.margin = '';
          ref.current.style.overflow = '';
          ref.current.style.clip = '';
          ref.current.style.whiteSpace = '';
          ref.current.style.border = '';
        }
      }
    }
  }, [hidden, visuallyHidden]);
  
  return ref;
}

/**
 * Options for the useAriaDescribedBy hook
 */
export interface AriaDescribedByOptions {
  /**
   * The ID of the element that describes the target element
   */
  descriptionId?: string;
  
  /**
   * The description text
   */
  description?: string;
  
  /**
   * Whether to create a hidden description element
   * @default true
   */
  createHiddenDescription?: boolean;
}

/**
 * A hook for adding aria-describedby to an element
 * @param options Options for the aria-describedby attribute
 * @returns An object with the ref to attach to the element and the description ID
 */
export function useAriaDescribedBy(
  options: AriaDescribedByOptions = {}
): {
  ref: React.RefObject<HTMLElement>;
  descriptionId: string;
} {
  const {
    descriptionId: providedDescriptionId,
    description,
    createHiddenDescription = true,
  } = options;
  
  const ref = useRef<HTMLElement>(null);
  const [descriptionId] = React.useState<string>(
    providedDescriptionId || `aria-desc-${Math.random().toString(36).substring(2, 9)}`
  );
  
  useEffect(() => {
    if (ref.current) {
      ref.current.setAttribute('aria-describedby', descriptionId);
    }
    
    // Create a hidden description element if needed
    if (createHiddenDescription && description) {
      let descriptionElement = document.getElementById(descriptionId);
      
      if (!descriptionElement) {
        descriptionElement = document.createElement('div');
        descriptionElement.id = descriptionId;
        descriptionElement.style.position = 'absolute';
        descriptionElement.style.width = '1px';
        descriptionElement.style.height = '1px';
        descriptionElement.style.padding = '0';
        descriptionElement.style.margin = '-1px';
        descriptionElement.style.overflow = 'hidden';
        descriptionElement.style.clip = 'rect(0, 0, 0, 0)';
        descriptionElement.style.whiteSpace = 'nowrap';
        descriptionElement.style.border = '0';
        document.body.appendChild(descriptionElement);
      }
      
      descriptionElement.textContent = description;
      
      return () => {
        if (descriptionElement && descriptionElement.parentNode) {
          descriptionElement.parentNode.removeChild(descriptionElement);
        }
      };
    }
  }, [descriptionId, description, createHiddenDescription]);
  
  return { ref, descriptionId };
}

/**
 * A component for visually hiding content while keeping it accessible to screen readers
 */
export const VisuallyHidden: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...props
}) => {
  return (
    <div
      {...props}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0',
      }}
    >
      {children}
    </div>
  );
};

/**
 * A component for creating a screen reader only label
 */
export const ScreenReaderOnly: React.FC<{
  id?: string;
  children: React.ReactNode;
}> = ({ id, children }) => {
  return (
    <VisuallyHidden id={id}>
      {children}
    </VisuallyHidden>
  );
};

export default {
  screenReaderAnnouncer,
  useAnnounce,
  useAriaLive,
  useAriaHidden,
  useAriaDescribedBy,
  VisuallyHidden,
  ScreenReaderOnly,
};
