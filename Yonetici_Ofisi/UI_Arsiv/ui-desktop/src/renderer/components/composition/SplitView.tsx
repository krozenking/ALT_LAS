import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';
import Panel from './Panel';
import ResizeHandle from './ResizeHandle';
import DropZone from './DropZone';

export interface SplitViewProps extends BoxProps {
  direction?: 'horizontal' | 'vertical';
  initialRatio?: number;
  minSize?: number; // Minimum size in pixels for either panel
  maxSize?: number; // Maximum size in pixels for the first panel
  leftOrTopContent: React.ReactNode;
  rightOrBottomContent: React.ReactNode;
  resizable?: boolean;
  /**
   * Accessible label for the split view container
   */
  ariaLabel?: string;
  /**
   * ID for the split view, used for aria attributes
   */
  id?: string; // Allow external ID override
  /**
   * Keyboard resize step (percentage)
   */
  resizeStep?: number;
}

export const SplitView: React.FC<SplitViewProps> = ({
  direction = 'horizontal',
  initialRatio = 0.5,
  minSize = 100,
  maxSize,
  leftOrTopContent,
  rightOrBottomContent,
  resizable = true,
  ariaLabel,
  id: externalId,
  resizeStep = 5, // Default to 5% step for keyboard resize
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const [ratio, setRatio] = useState(initialRatio);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHorizontal = direction === 'horizontal';
  const generatedId = useId();
  const splitViewId = externalId || generatedId;
  const leftOrTopId = `${splitViewId}-left-top`;
  const rightOrBottomId = `${splitViewId}-right-bottom`;
  const dividerId = `${splitViewId}-divider`;

  // Function to update ratio, handling constraints
  const updateRatio = useCallback((newRatio: number) => {
    if (!containerRef.current) return;

    const containerSize = isHorizontal
      ? containerRef.current.offsetWidth
      : containerRef.current.offsetHeight;

    // Calculate min/max ratios based on pixel constraints
    const minRatio = minSize / containerSize;
    // maxSize applies to the first panel, so maxRatio is maxSize / containerSize
    // The second panel also needs minSize, so the max ratio for the first panel is 1 - (minSize / containerSize)
    const maxRatioConstraint = 1 - (minSize / containerSize);
    let effectiveMaxRatio = maxSize ? maxSize / containerSize : maxRatioConstraint;
    effectiveMaxRatio = Math.min(effectiveMaxRatio, maxRatioConstraint); // Ensure second panel also respects minSize

    // Ensure ratio is within calculated bounds, defaulting to 0.1-0.9 if no constraints
    const lowerBound = Math.max(0.1, minRatio);
    const upperBound = Math.min(0.9, effectiveMaxRatio);

    newRatio = Math.max(lowerBound, Math.min(upperBound, newRatio));

    setRatio(newRatio);
  }, [isHorizontal, minSize, maxSize]);

  // Handle mouse resize
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!resizable) return;
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

      if (containerSize === 0) return; // Avoid division by zero

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
    if (!resizable) return;
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
      role="group" // Use group role for the container
      aria-label={ariaLabel || `${isHorizontal ? 'Horizontal' : 'Vertical'} split view`}
      id={splitViewId}
      {...rest}
    >
      {/* Left/Top Panel */}
      <Box
        flex={`0 0 ${ratio * 100}%`}
        height={isHorizontal ? '100%' : `${ratio * 100}%`}
        width={isHorizontal ? `${ratio * 100}%` : '100%'}
        overflow="hidden"
        id={leftOrTopId}
        role="region" // Use region role for panels
        aria-label={`${isHorizontal ? 'Left' : 'Top'} panel`}
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
          aria-valuemax={Math.round((maxSize && containerRef.current ? 1 - (minSize / (isHorizontal ? containerRef.current.offsetWidth : containerRef.current.offsetHeight)) : 0.9) * 100)} // Max value considers minSize of second panel
          aria-label={`${isHorizontal ? 'Horizontal' : 'Vertical'} resize splitter`}
          aria-controls={`${leftOrTopId} ${rightOrBottomId}`}
          id={dividerId}
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
        id={rightOrBottomId}
        role="region" // Use region role for panels
        aria-label={`${isHorizontal ? 'Right' : 'Bottom'} panel`}
      >
        {rightOrBottomContent}
      </Box>
    </Box>
  );
};

export default SplitView;

