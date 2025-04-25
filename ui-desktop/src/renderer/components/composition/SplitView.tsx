import React, { useState, useRef, useEffect } from 'react';
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
  /**
   * Accessible label for the split view container
   */
  ariaLabel?: string;
  /**
   * ID for the split view, used for aria attributes
   */
  id?: string;
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
  id,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const [ratio, setRatio] = useState(initialRatio);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHorizontal = direction === 'horizontal';
  const splitViewId = id || `split-view-${Math.random().toString(36).substr(2, 9)}`;
  const leftOrTopId = `${splitViewId}-left-top`;
  const rightOrBottomId = `${splitViewId}-right-bottom`;
  const dividerId = `${splitViewId}-divider`;
  
  // Handle resize
  const handleResize = (e: React.MouseEvent, delta: { x: number, y: number }) => {
    if (!containerRef.current) return;
    
    const containerSize = isHorizontal 
      ? containerRef.current.offsetWidth 
      : containerRef.current.offsetHeight;
    
    const deltaPx = isHorizontal ? delta.x : delta.y;
    const deltaRatio = deltaPx / containerSize;
    
    let newRatio = ratio + deltaRatio;
    
    // Apply min/max constraints
    if (minSize) {
      const minRatio = minSize / containerSize;
      newRatio = Math.max(newRatio, minRatio);
    }
    
    if (maxSize) {
      const maxRatio = maxSize / containerSize;
      newRatio = Math.min(newRatio, maxRatio);
    }
    
    // Ensure ratio is between 0.1 and 0.9
    newRatio = Math.max(0.1, Math.min(0.9, newRatio));
    
    setRatio(newRatio);
  };

  // Keyboard handler for resize
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!resizable) return;
    
    const step = 0.01; // 1% step for keyboard navigation
    let newRatio = ratio;
    
    if (isHorizontal) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        newRatio = Math.max(0.1, ratio - step);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        newRatio = Math.min(0.9, ratio + step);
      }
    } else {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        newRatio = Math.max(0.1, ratio - step);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        newRatio = Math.min(0.9, ratio + step);
      }
    }
    
    if (newRatio !== ratio) {
      setRatio(newRatio);
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
      role="group"
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
        role="region"
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
            bg: colorMode === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
            outline: '2px solid',
            outlineColor: 'primary.500',
          }}
          role="separator"
          aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
          aria-valuenow={ratio * 100}
          aria-valuemin={10}
          aria-valuemax={90}
          aria-controls={`${leftOrTopId} ${rightOrBottomId}`}
          tabIndex={0}
          id={dividerId}
          aria-label={`${isHorizontal ? 'Horizontal' : 'Vertical'} resize handle`}
          onKeyDown={handleKeyDown}
          onMouseDown={(e) => {
            e.preventDefault();
            const initialPos = isHorizontal ? e.clientX : e.clientY;
            const initialRatio = ratio;
            
            const handleMouseMove = (moveEvent: MouseEvent) => {
              const currentPos = isHorizontal ? moveEvent.clientX : moveEvent.clientY;
              const deltaPx = currentPos - initialPos;
              
              if (!containerRef.current) return;
              
              const containerSize = isHorizontal 
                ? containerRef.current.offsetWidth 
                : containerRef.current.offsetHeight;
              
              const deltaRatio = deltaPx / containerSize;
              let newRatio = initialRatio + deltaRatio;
              
              // Apply min/max constraints
              if (minSize) {
                const minRatio = minSize / containerSize;
                newRatio = Math.max(newRatio, minRatio);
              }
              
              if (maxSize) {
                const maxRatio = maxSize / containerSize;
                newRatio = Math.min(newRatio, maxRatio);
              }
              
              // Ensure ratio is between 0.1 and 0.9
              newRatio = Math.max(0.1, Math.min(0.9, newRatio));
              
              setRatio(newRatio);
            };
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />
      )}
      
      {/* Right/Bottom Panel */}
      <Box
        flex={`0 0 ${(1 - ratio) * 100}%`}
        height={isHorizontal ? '100%' : `${(1 - ratio) * 100}%`}
        width={isHorizontal ? `${(1 - ratio) * 100}%` : '100%'}
        overflow="hidden"
        id={rightOrBottomId}
        role="region"
        aria-label={`${isHorizontal ? 'Right' : 'Bottom'} panel`}
      >
        {rightOrBottomContent}
      </Box>
    </Box>
  );
};

export default SplitView;
