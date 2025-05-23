import React, { useState, useRef } from 'react';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';

export interface ResizeHandleProps extends BoxProps {
  orientation?: 'horizontal' | 'vertical' | 'corner';
  onResizeStart?: (e: React.MouseEvent) => void;
  onResize?: (e: React.MouseEvent, delta: { x: number, y: number }) => void;
  onResizeEnd?: (e: React.MouseEvent) => void;
  /**
   * Accessible label for the resize handle
   */
  ariaLabel?: string;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  orientation = 'corner',
  onResizeStart,
  onResize,
  onResizeEnd,
  ariaLabel,
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

  // Keyboard handlers for resize
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = 5; // 5px step for keyboard navigation
    let deltaX = 0;
    let deltaY = 0;
    
    if (orientation === 'horizontal' || orientation === 'corner') {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        deltaX = -step;
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        deltaX = step;
      }
    }
    
    if (orientation === 'vertical' || orientation === 'corner') {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        deltaY = -step;
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        deltaY = step;
      }
    }
    
    if (deltaX !== 0 || deltaY !== 0) {
      onResize?.(e as unknown as React.MouseEvent, { x: deltaX, y: deltaY });
    }
  };

  // Get orientation-specific label
  const getOrientationLabel = () => {
    switch (orientation) {
      case 'horizontal':
        return 'Yatay yeniden boyutlandırma kolu';
      case 'vertical':
        return 'Dikey yeniden boyutlandırma kolu';
      case 'corner':
      default:
        return 'Köşe yeniden boyutlandırma kolu';
    }
  };

  // Accessibility attributes
  const accessibilityProps = {
    role: 'button',
    'aria-label': ariaLabel || getOrientationLabel(),
    'aria-pressed': isResizing,
    tabIndex: 0,
  };
  
  return (
    <Box
      position="absolute"
      cursor={getCursorStyle()}
      zIndex={10}
      _focus={{
        boxShadow: 'outline',
        outline: 'none',
      }}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      {...getPositionAndSize()}
      {...accessibilityProps}
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
      role="separator"
      aria-orientation={orientation === 'horizontal' ? 'vertical' : (orientation === 'vertical' ? 'horizontal' : undefined)} // Orientation of the boundary it controls
      tabIndex={0}
      aria-label="Resize handle"
      aria-roledescription="Use arrow keys to resize adjacent elements when focused"
      onKeyDown={(e) => {
        // TODO: Implement keyboard interaction logic
        // e.g., check e.key for ArrowLeft/Right/Up/Down
        // Call a parent handler to adjust size based on orientation
        console.log("ResizeHandle key down:", e.key);
      }}
      {...rest}
    />
  );
};

export default ResizeHandle;
