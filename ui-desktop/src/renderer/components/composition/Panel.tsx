import React from 'react';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';

export interface PanelProps extends BoxProps {
  title?: string;
  headerActions?: React.ReactNode;
  isDraggable?: boolean;
  isResizable?: boolean;
  minWidth?: string | number;
  minHeight?: string | number;
  onDragStart?: (e: React.MouseEvent) => void;
  onDragEnd?: (e: React.MouseEvent) => void;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  headerActions,
  isDraggable = true,
  isResizable = true,
  minWidth = '200px',
  minHeight = '150px',
  onDragStart,
  onDragEnd,
  children,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light' 
    ? glassmorphism.create(0.75, 15, 1)
    : glassmorphism.createDark(0.75, 15, 1);

  return (
    <Box
      {...glassStyle}
      display="flex"
      flexDirection="column"
      minWidth={minWidth}
      minHeight={minHeight}
      position="relative"
      transition="all 0.2s ease-in-out"
      _hover={{ boxShadow: 'lg' }}
      role="region"
      aria-label={title || 'Panel'}
      {...rest}
    >
      {/* Panel Header */}
      {(title || headerActions) && (
        <Box
          as="header"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          p={2}
          borderBottom="1px solid"
          borderColor={colorMode === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}
          cursor={isDraggable ? 'grab' : 'default'}
          userSelect="none"
          onMouseDown={isDraggable ? onDragStart : undefined}
          onMouseUp={isDraggable ? onDragEnd : undefined}
          className="panel-header"
        >
          {title && <Box fontWeight="medium">{title}</Box>}
          {headerActions && <Box>{headerActions}</Box>}
        </Box>
      )}
      
      {/* Panel Content */}
      <Box
        flex="1"
        p={4}
        overflow="auto"
        className="panel-content"
      >
        {children}
      </Box>
      
      {/* Resize Handle */}
      {isResizable && (
        <Box
          position="absolute"
          bottom="0"
          right="0"
          width="15px"
          height="15px"
          cursor="nwse-resize"
          className="resize-handle"
          _before={{
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
          }}
        />
      )}
    </Box>
  );
};

export default Panel;
