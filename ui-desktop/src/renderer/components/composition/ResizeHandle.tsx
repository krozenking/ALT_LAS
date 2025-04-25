import React, { useState, useRef } from 'react';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';

export interface ResizeHandleProps extends BoxProps {
  orientation?: 'horizontal' | 'vertical' | 'corner';
  onResizeStart?: (e: React.MouseEvent) => void;
  onResize?: (e: React.MouseEvent, delta: { x: number, y: number }) => void;
  onResizeEnd?: (e: React.MouseEvent) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  orientation = 'corner',
  onResizeStart,
  onResize,
  onResizeEnd,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const [isResizing, setIsResizing] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  
  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    
    if (onResizeStart) {
      onResizeStart(e);
    }
    
    // Add event listeners for resize and resize end
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Handle mouse move
  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const delta = {
      x: e.clientX - startPosRef.current.x,
      y: e.clientY - startPosRef.current.y
    };
    
    if (onResize) {
      onResize(e as unknown as React.MouseEvent, delta);
    }
    
    startPosRef.current = { x: e.clientX, y: e.clientY };
  };
  
  // Handle mouse up
  const handleMouseUp = (e: MouseEvent) => {
    setIsResizing(false);
    
    if (onResizeEnd) {
      onResizeEnd(e as unknown as React.MouseEvent);
    }
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  // Get cursor style based on orientation
  const getCursorStyle = () => {
    switch (orientation) {
      case 'horizontal':
        return 'ew-resize';
      case 'vertical':
        return 'ns-resize';
      case 'corner':
      default:
        return 'nwse-resize';
    }
  };
  
  // Get position and size based on orientation
  const getPositionAndSize = () => {
    switch (orientation) {
      case 'horizontal':
        return {
          top: 0,
          right: 0,
          width: '4px',
          height: '100%',
        };
      case 'vertical':
        return {
          bottom: 0,
          left: 0,
          width: '100%',
          height: '4px',
        };
      case 'corner':
      default:
        return {
          bottom: 0,
          right: 0,
          width: '15px',
          height: '15px',
        };
    }
  };
  
  return (
    <Box
      position="absolute"
      cursor={getCursorStyle()}
      zIndex={10}
      {...getPositionAndSize()}
      onMouseDown={handleMouseDown}
      _before={orientation === 'corner' ? {
        content: '""',
        position: 'absolute',
        bottom: '3px',
        right: '3px',
        width: '9px',
        height: '9px',
        borderRight: '2px solid',
        borderBottom: '2px solid',
        borderColor: colorMode === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
        opacity: 0.7,
      } : undefined}
      {...rest}
    />
  );
};

export default ResizeHandle;
