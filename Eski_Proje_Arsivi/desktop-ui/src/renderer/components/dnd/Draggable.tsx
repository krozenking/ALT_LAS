import React, { forwardRef, useEffect, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
import { useDragDrop } from './DragDropContext';

export interface DraggableProps extends BoxProps {
  /**
   * Unique identifier for the draggable item
   */
  id: string;
  /**
   * Whether the item is draggable
   */
  isDraggable?: boolean;
  /**
   * Data to be passed to the drag event
   */
  data?: Record<string, any>;
  /**
   * Callback when drag starts
   */
  onDragStart?: () => void;
  /**
   * Callback when drag ends
   */
  onDragEnd?: () => void;
  /**
   * Handle component to use as drag handle
   */
  handle?: React.ReactNode;
  /**
   * Whether to disable the default drag animation
   */
  disableAnimation?: boolean;
  /**
   * Accessible label for the draggable item
   */
  ariaLabel?: string;
  /**
   * Accessible description for the draggable item
   */
  ariaDescription?: string;
}

export const Draggable = forwardRef<HTMLDivElement, DraggableProps>(({
  id,
  isDraggable = true,
  data,
  onDragStart,
  onDragEnd,
  handle,
  disableAnimation = false,
  ariaLabel,
  ariaDescription,
  children,
  ...rest
}, ref) => {
  const { colorMode } = useColorMode();
  const { isDragging: isContextDragging } = useDragDrop();
  const handleRef = useRef<HTMLDivElement>(null);
  
  // Set up draggable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
    active,
  } = useDraggable({
    id,
    data,
    disabled: !isDraggable,
  });
  
  // Combine refs
  const setRefs = (node: HTMLDivElement) => {
    setNodeRef(node);
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLDivElement>).current = node;
    }
  };
  
  // Call callbacks
  useEffect(() => {
    if (isDragging && onDragStart) {
      onDragStart();
    } else if (!isDragging && active && onDragEnd) {
      onDragEnd();
    }
  }, [isDragging, active, onDragStart, onDragEnd]);
  
  // Apply transform style when dragging
  const style = {
    transform: disableAnimation ? undefined : CSS.Translate.toString(transform),
    transition: disableAnimation || isDragging ? 'none' : 'transform 0.2s ease-in-out',
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.8 : 1,
    position: 'relative' as const,
    cursor: isDraggable ? (isDragging ? 'grabbing' : 'grab') : 'default',
  };
  
  // Render with handle or without
  if (handle) {
    return (
      <Box
        ref={setRefs}
        {...rest}
        style={{
          ...style,
          ...(rest.style || {}),
        }}
        aria-label={ariaLabel}
        aria-description={ariaDescription}
        aria-grabbed={isDragging}
        data-draggable={isDraggable ? 'true' : 'false'}
        data-dragging={isDragging ? 'true' : 'false'}
        role="application"
        tabIndex={isDraggable ? 0 : undefined}
        _focus={{
          outline: isDraggable ? '2px solid' : 'none',
          outlineColor: 'primary.500',
        }}
      >
        <Box
          ref={handleRef}
          as="div"
          {...attributes}
          {...listeners}
          cursor={isDraggable ? (isDragging ? 'grabbing' : 'grab') : 'default'}
          aria-label={`Drag handle for ${ariaLabel || 'draggable item'}`}
          role="button"
          tabIndex={0}
          _focus={{
            outline: '2px solid',
            outlineColor: 'primary.500',
          }}
        >
          {handle}
        </Box>
        {children}
      </Box>
    );
  }
  
  return (
    <Box
      ref={setRefs}
      {...attributes}
      {...listeners}
      {...rest}
      style={{
        ...style,
        ...(rest.style || {}),
      }}
      aria-label={ariaLabel}
      aria-description={ariaDescription}
      aria-grabbed={isDragging}
      data-draggable={isDraggable ? 'true' : 'false'}
      data-dragging={isDragging ? 'true' : 'false'}
      role="application"
      tabIndex={isDraggable ? 0 : undefined}
      _focus={{
        outline: isDraggable ? '2px solid' : 'none',
        outlineColor: 'primary.500',
      }}
    >
      {children}
    </Box>
  );
});

Draggable.displayName = 'Draggable';

export default Draggable;
