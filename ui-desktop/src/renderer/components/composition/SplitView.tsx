import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';
import Panel from './Panel';
import ResizeHandle from './ResizeHandle';
import DropZone from './DropZone';

export interface SplitViewProps extends BoxProps {
  direction?: 'horizontal' | 'vertical';
  initialRatio?: number;
  minSize?: number;
  maxSize?: number;
  leftOrTopContent: React.ReactNode;
  rightOrBottomContent: React.ReactNode;
  resizable?: boolean;
  resizeStep?: number; // Keyboard resize step (percentage)
}

export const SplitView: React.FC<SplitViewProps> = ({
  direction = 'horizontal',
  initialRatio = 0.5,
  minSize = 100,
  maxSize,
  leftOrTopContent,
  rightOrBottomContent,
  resizable = true,
  resizeStep = 5, // Default to 5% step for keyboard resize
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const [ratio, setRatio] = useState(initialRatio);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHorizontal = direction === 'horizontal';

  // Function to update ratio, handling constraints
  const updateRatio = useCallback((newRatio: number) => {
    if (!containerRef.current) return;

    const containerSize = isHorizontal
      ? containerRef.current.offsetWidth
      : containerRef.current.offsetHeight;

    // Apply min/max pixel constraints
    if (minSize) {
      const minRatio = minSize / containerSize;
      newRatio = Math.max(newRatio, minRatio);
    }

    if (maxSize) {
      const maxRatio = maxSize / containerSize;
      newRatio = Math.min(newRatio, maxRatio);
    }

    // Ensure ratio is between 0.1 and 0.9 (or min/max if stricter)
    const lowerBound = minSize ? minSize / containerSize : 0.1;
    const upperBound = maxSize ? maxSize / containerSize : 0.9;
    newRatio = Math.max(lowerBound, Math.min(upperBound, newRatio));

    setRatio(newRatio);
  }, [isHorizontal, minSize, maxSize]);

  // Handle mouse resize
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const initialPos = isHorizontal ? e.clientX : e.clientY;
    const initialRatio = ratio;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      const currentPos = isHorizontal ? moveEvent.clientX : moveEvent.clientY;
      const deltaPx = currentPos - initialPos;
      const containerSize = isHorizontal
        ? containerRef.current.offsetWidth
        : containerRef.current.offsetHeight;
      const deltaRatio = deltaPx / containerSize;
      updateRatio(initialRatio + deltaRatio);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle keyboard resize
  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newRatio = ratio;
    const stepRatio = resizeStep / 100;

    if (isHorizontal) {
      if (e.key === 'ArrowLeft') {
        newRatio -= stepRatio;
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        newRatio += stepRatio;
        e.preventDefault();
      }
    } else { // Vertical
      if (e.key === 'ArrowUp') {
        newRatio -= stepRatio;
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        newRatio += stepRatio;
        e.preventDefault();
      }
    }

    if (newRatio !== ratio) {
      updateRatio(newRatio);
    }
  };

  return (
    <Box
      ref={containerRef}
      display="flex"
      flexDirection={isHorizontal ? 'row' : 'column'}
      position="relative"
      height="100%"
      width="100%"
      {...rest}
    >
      {/* Left/Top Panel */}
      <Box
        flex={`0 0 ${ratio * 100}%`}
        height={isHorizontal ? '100%' : `${ratio * 100}%`}
        width={isHorizontal ? `${ratio * 100}%` : '100%'}
        overflow="hidden"
        // Add role group if needed, or let content define semantics
      >
        {leftOrTopContent}
      </Box>

      {/* Resize Handle */}
      {resizable && (
        <Box
          position="absolute"
          top={isHorizontal ? 0 : `calc(${ratio * 100}% - 2px)`}
          left={isHorizontal ? `calc(${ratio * 100}% - 2px)` : 0}
          width={isHorizontal ? '4px' : '100%'}
          height={isHorizontal ? '100%' : '4px'}
          bg={colorMode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'}
          cursor={isHorizontal ? 'col-resize' : 'row-resize'}
          zIndex={10}
          _hover={{
            bg: colorMode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
          }}
          _focus={{
            outline: 'none',
            bg: 'primary.500', // Highlight on focus
            boxShadow: 'outline',
          }}
          role="separator"
          aria-orientation={isHorizontal ? "vertical" : "horizontal"}
          tabIndex={0} // Make it focusable
          aria-valuenow={Math.round(ratio * 100)}
          aria-valuemin={Math.round((minSize && containerRef.current ? minSize / (isHorizontal ? containerRef.current.offsetWidth : containerRef.current.offsetHeight) : 0.1) * 100)}
          aria-valuemax={Math.round((maxSize && containerRef.current ? maxSize / (isHorizontal ? containerRef.current.offsetWidth : containerRef.current.offsetHeight) : 0.9) * 100)}
          aria-label="Resize splitter" // Consider making more descriptive if needed
          aria-controls={rest['aria-controls']} // Pass through aria-controls if provided
          onMouseDown={handleMouseDown}
          onKeyDown={handleKeyDown} // Add keyboard handler
        />
      )}

      {/* Right/Bottom Panel */}
      <Box
        flex={`1 1 auto`} // Use flex auto for the second panel
        height={isHorizontal ? '100%' : 'auto'}
        width={isHorizontal ? 'auto' : '100%'}
        overflow="hidden"
        // Add role group if needed, or let content define semantics
      >
        {rightOrBottomContent}
      </Box>
    </Box>
  );
};

export default SplitView;

