import React, { forwardRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';

export interface SortableItemProps extends BoxProps {
  /**
   * Unique identifier for the sortable item
   */
  id: string;
  /**
   * Whether the item is sortable
   */
  isSortable?: boolean;
  /**
   * Data to be passed to the sort event
   */
  data?: Record<string, any>;
  /**
   * Handle component to use as drag handle
   */
  handle?: React.ReactNode;
  /**
   * Whether to disable the default sort animation
   */
  disableAnimation?: boolean;
  /**
   * Accessible label for the sortable item
   */
  ariaLabel?: string;
  /**
   * Accessible description for the sortable item
   */
  ariaDescription?: string;
}

export const SortableItem = forwardRef<HTMLDivElement, SortableItemProps>(({
  id,
  isSortable = true,
  data,
  handle,
  disableAnimation = false,
  ariaLabel,
  ariaDescription,
  children,
  ...rest
}, ref) => {
  const { colorMode } = useColorMode();
  
  // Set up sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
  } = useSortable({
    id,
    data,
    disabled: !isSortable,
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
  
  // Apply transform style when dragging
  const style = {
    transform: disableAnimation ? undefined : CSS.Transform.toString(transform),
    transition: disableAnimation || isDragging ? 'none' : transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    cursor: isSortable ? (isDragging ? 'grabbing' : 'grab') : 'default',
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
        data-sortable={isSortable ? 'true' : 'false'}
        data-dragging={isDragging ? 'true' : 'false'}
        data-sorting={isSorting ? 'true' : 'false'}
        role="listitem"
        tabIndex={isSortable ? 0 : undefined}
        _focus={{
          outline: isSortable ? '2px solid' : 'none',
          outlineColor: 'primary.500',
        }}
      >
        <Box
          as="div"
          {...attributes}
          {...listeners}
          cursor={isSortable ? (isDragging ? 'grabbing' : 'grab') : 'default'}
          aria-label={`Drag handle for ${ariaLabel || 'sortable item'}`}
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
      data-sortable={isSortable ? 'true' : 'false'}
      data-dragging={isDragging ? 'true' : 'false'}
      data-sorting={isSorting ? 'true' : 'false'}
      role="listitem"
      tabIndex={isSortable ? 0 : undefined}
      _focus={{
        outline: isSortable ? '2px solid' : 'none',
        outlineColor: 'primary.500',
      }}
    >
      {children}
    </Box>
  );
});

SortableItem.displayName = 'SortableItem';

export default SortableItem;
