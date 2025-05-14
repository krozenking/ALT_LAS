import React from 'react';
import { DragOverlay as DndKitDragOverlay, useDndContext } from '@dnd-kit/core';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';

export interface DragOverlayProps extends BoxProps {
  /**
   * Content to render when nothing is being dragged
   */
  children?: React.ReactNode;
  /**
   * Content to render when an item is being dragged
   */
  renderOverlay?: (id: string) => React.ReactNode;
  /**
   * Whether to adjust the overlay position
   */
  adjustScale?: boolean;
  /**
   * Whether to apply a glassmorphism effect
   */
  useGlassmorphism?: boolean;
  /**
   * Opacity of the overlay
   */
  opacity?: number;
  /**
   * Z-index of the overlay
   */
  zIndex?: number;
}

export const DragOverlay: React.FC<DragOverlayProps> = ({
  children,
  renderOverlay,
  adjustScale = true,
  useGlassmorphism = true,
  opacity = 0.8,
  zIndex = 1000,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const { active } = useDndContext();
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = useGlassmorphism
    ? (colorMode === 'light'
      ? glassmorphism.create(0.7, 10, 1)
      : glassmorphism.createDark(0.7, 10, 1))
    : {};
  
  return (
    <DndKitDragOverlay
      adjustScale={adjustScale}
      zIndex={zIndex}
      dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}
    >
      {active ? (
        <Box
          opacity={opacity}
          boxShadow="lg"
          {...glassStyle}
          {...rest}
        >
          {renderOverlay ? renderOverlay(active.id as string) : children}
        </Box>
      ) : null}
    </DndKitDragOverlay>
  );
};

export default DragOverlay;
