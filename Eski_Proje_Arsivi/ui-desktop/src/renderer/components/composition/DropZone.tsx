import React, { useState, useRef } from 'react';
import { Box, BoxProps, useColorMode, VisuallyHidden } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';
import Panel from './Panel';
import ResizeHandle from './ResizeHandle';

export interface DropZoneProps extends BoxProps {
  id: string;
  onDrop?: (id: string, item: any) => void;
  isActive?: boolean;
  children?: React.ReactNode;
  /**
   * Accessible label for the drop zone
   */
  ariaLabel?: string;
  /**
   * Description for screen readers about what can be dropped here
   */
  ariaDescription?: string;
  /**
   * Custom label for the drop zone visual text
   */
  dropLabel?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  id,
  onDrop,
  isActive = false,
  children,
  ariaLabel,
  ariaDescription,
  dropLabel = "Paneli buraya sürükleyin", // Default label
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const dropZoneId = `dropzone-${id}`;
  const labelId = `${dropZoneId}-label`;
  const descriptionId = `${id}-description`;

  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.4, 5, 1)
    : glassmorphism.createDark(0.4, 5, 1);

  // Active state styles
  const activeStyle = isActive ? {
    borderColor: 'primary.500',
    boxShadow: `0 0 0 2px ${colorMode === 'light' ? 'rgba(62, 92, 118, 0.4)' : 'rgba(62, 92, 118, 0.3)'}`,
    transform: 'scale(1.02)',
  } : {};

  // Focus style
  const focusStyle = {
    _focus: {
      outline: 'none',
      boxShadow: 'outline',
      zIndex: 1,
    }
  };

  return (
    <Box
      id={dropZoneId}
      borderRadius="md"
      border="2px dashed"
      borderColor={colorMode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'}
      transition="all 0.2s ease-in-out"
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100px"
      p={4}
      {...glassStyle}
      {...activeStyle}
      {...focusStyle}
      role="region" // Use region role for container
      aria-labelledby={labelId} // Reference the label ID
      aria-describedby={ariaDescription ? descriptionId : undefined}
      aria-dropeffect={isActive ? "move" : "none"} // Indicate drop effect
      aria-busy={isActive} // Indicate busy state when active
      tabIndex={0} // Make focusable
      {...rest}
    >
      {/* Hidden label for screen readers */}
      <VisuallyHidden id={labelId}>
        {ariaLabel || (isActive ? "Bırakmak için hazır" : dropLabel)}
      </VisuallyHidden>

      {/* Optional hidden description */}
      {ariaDescription && (
        <VisuallyHidden id={descriptionId}>
          {ariaDescription}
        </VisuallyHidden>
      )}

      {children || (
        <Box
          textAlign="center"
          color={colorMode === 'light' ? 'gray.500' : 'gray.400'}
          fontSize="sm"
          aria-hidden="true" // Hide visual text from screen readers since we have the visually hidden label
        >
          {dropLabel}
        </Box>
      )}
    </Box>
  );
};

export default DropZone;

