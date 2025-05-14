import React, { forwardRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';

export interface DroppableProps extends BoxProps {
  /**
   * Unique identifier for the droppable area
   */
  id: string;
  /**
   * Whether the area accepts drops
   */
  isDroppable?: boolean;
  /**
   * Data to be passed to the drop event
   */
  data?: Record<string, any>;
  /**
   * Whether to show a visual indicator when an item is being dragged over
   */
  showDropIndicator?: boolean;
  /**
   * Style to apply when an item is being dragged over
   */
  dropIndicatorStyle?: React.CSSProperties;
  /**
   * Accessible label for the droppable area
   */
  ariaLabel?: string;
  /**
   * Accessible description for the droppable area
   */
  ariaDescription?: string;
}

export const Droppable = forwardRef<HTMLDivElement, DroppableProps>(({
  id,
  isDroppable = true,
  data,
  showDropIndicator = true,
  dropIndicatorStyle,
  ariaLabel,
  ariaDescription,
  children,
  ...rest
}, ref) => {
  const { colorMode } = useColorMode();
  
  // Set up droppable
  const {
    isOver,
    setNodeRef,
    active,
  } = useDroppable({
    id,
    data,
    disabled: !isDroppable,
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
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.4, 5, 1)
    : glassmorphism.createDark(0.4, 5, 1);
  
  // Default drop indicator style
  const defaultDropIndicatorStyle = {
    borderColor: isOver ? 'primary.500' : colorMode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
    borderWidth: isOver ? '2px' : '1px',
    borderStyle: 'dashed',
    borderRadius: 'md',
    transition: 'all 0.2s ease-in-out',
    transform: isOver ? 'scale(1.02)' : 'scale(1)',
    boxShadow: isOver ? `0 0 0 2px ${colorMode === 'light' ? 'rgba(62, 92, 118, 0.4)' : 'rgba(62, 92, 118, 0.3)'}` : 'none',
  };
  
  // Combine styles
  const combinedDropIndicatorStyle = showDropIndicator
    ? { ...defaultDropIndicatorStyle, ...(dropIndicatorStyle || {}) }
    : {};
  
  return (
    <Box
      ref={setRefs}
      {...rest}
      {...(showDropIndicator ? combinedDropIndicatorStyle : {})}
      aria-label={ariaLabel}
      aria-description={ariaDescription}
      data-droppable={isDroppable ? 'true' : 'false'}
      data-over={isOver ? 'true' : 'false'}
      role="region"
      aria-roledescription="Drop zone"
      aria-dropeffect={isDroppable ? (isOver ? 'move' : 'none') : 'none'}
      aria-busy={isOver}
      tabIndex={0}
      _focus={{
        outline: '2px solid',
        outlineColor: 'primary.500',
      }}
    >
      {children}
    </Box>
  );
});

Droppable.displayName = 'Droppable';

export default Droppable;
