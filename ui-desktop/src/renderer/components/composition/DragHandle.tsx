import React from 'react';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';

export interface DragHandleProps extends BoxProps {
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  onDragStart?: (e: React.MouseEvent) => void;
  onDrag?: (e: React.MouseEvent) => void;
  onDragEnd?: (e: React.MouseEvent) => void;
}

export const DragHandle: React.FC<DragHandleProps> = ({
  orientation = 'horizontal',
  size = 'md',
  onDragStart,
  onDrag,
  onDragEnd,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  
  // Size styles
  const getSizeStyle = () => {
    const isHorizontal = orientation === 'horizontal';
    
    switch (size) {
      case 'sm':
        return isHorizontal 
          ? { width: '16px', height: '4px' } 
          : { width: '4px', height: '16px' };
      case 'lg':
        return isHorizontal 
          ? { width: '32px', height: '6px' } 
          : { width: '6px', height: '32px' };
      case 'md':
      default:
        return isHorizontal 
          ? { width: '24px', height: '5px' } 
          : { width: '5px', height: '24px' };
    }
  };
  
  return (
    <Box
      borderRadius="full"
      bg={colorMode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'}
      cursor={orientation === 'horizontal' ? 'grab' : 'col-resize'}
      transition="all 0.2s ease-in-out"
      _hover={{
        bg: colorMode === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
      }}
      _active={{
        bg: colorMode === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
        cursor: orientation === 'horizontal' ? 'grabbing' : 'col-resize',
      }}
      onMouseDown={onDragStart}
      onMouseMove={onDrag}
      onMouseUp={onDragEnd}
      onMouseLeave={onDragEnd}
      role="separator"
      aria-orientation={orientation}
      tabIndex={0}
      {...getSizeStyle()}
      {...rest}
    />
  );
};

export default DragHandle;
