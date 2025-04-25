import React, { useState, useRef } from 'react';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
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
}

export const DropZone: React.FC<DropZoneProps> = ({
  id,
  onDrop,
  isActive = false,
  children,
  ariaLabel,
  ariaDescription,
  ...rest
}) => {
  const { colorMode } = useColorMode();
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

  // Accessibility attributes
  const accessibilityProps = {
    role: 'region',
    'aria-label': ariaLabel || 'Bırakma bölgesi',
    'aria-describedby': ariaDescription ? descriptionId : undefined,
    'aria-dropeffect': 'move',
    tabIndex: 0,
  };
  
  return (
    <Box
      borderRadius="md"
      border="2px dashed"
      borderColor={colorMode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'}
      transition="all 0.2s ease-in-out"
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100px"
      p={4}
      _focus={{
        boxShadow: 'outline',
        outline: 'none',
      }}
      {...glassStyle}
      {...activeStyle}
      {...accessibilityProps}
      {...rest}
    >
      {ariaDescription && (
        <Box id={descriptionId} className="sr-only">
          {ariaDescription}
        </Box>
      )}
      {children || (
        <Box 
          textAlign="center" 
          color={colorMode === 'light' ? 'gray.500' : 'gray.400'}
          fontSize="sm"
        >
          Paneli buraya sürükleyin
        </Box>
      )}
    </Box>
  );
};

export default DropZone;
