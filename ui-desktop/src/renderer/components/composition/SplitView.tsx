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
}

export const SplitView: React.FC<SplitViewProps> = ({
  direction = 'horizontal',
  initialRatio = 0.5,
  minSize = 100,
  maxSize,
  leftOrTopContent,
  rightOrBottomContent,
  resizable = true,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const [ratio, setRatio] = useState(initialRatio);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHorizontal = direction === 'horizontal';
  
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
          role="separator"
          aria-orientation={isHorizontal ? "vertical" : "horizontal"}
          tabIndex={0}
          aria-valuenow={Math.round(ratio * 100)}
          aria-valuemin={10} // Corresponds to 0.1 ratio
          aria-valuemax={90} // Corresponds to 0.9 ratio
          aria-label="Resize splitter"
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
      >
        {rightOrBottomContent}
      </Box>
    </Box>
  );
};

export default SplitView;
