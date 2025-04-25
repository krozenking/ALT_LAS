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
  /**
   * Accessible label for the panel when the title is not provided
   */
  ariaLabel?: string;
  /**
   * ID for the panel, used for aria-labelledby
   */
  id?: string;
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
  ariaLabel,
  id,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const panelId = id || `panel-${Math.random().toString(36).substr(2, 9)}`;
  const headerId = `${panelId}-header`;
  const contentId = `${panelId}-content`;
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light' 
    ? glassmorphism.create(0.75, 15, 1)
    : glassmorphism.createDark(0.75, 15, 1);

  // Accessibility attributes
  const accessibilityProps = {
    role: 'region',
    'aria-labelledby': title ? headerId : undefined,
    'aria-label': !title && ariaLabel ? ariaLabel : undefined,
    id: panelId,
  };

  // Keyboard handlers for draggable header
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDraggable) return;
    
    // Space or Enter to start dragging
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onDragStart?.(e as unknown as React.MouseEvent);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (!isDraggable) return;
    
    // Space or Enter to end dragging
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onDragEnd?.(e as unknown as React.MouseEvent);
    }
  };

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
      _focus={{ boxShadow: 'outline', outline: 'none' }}
      tabIndex={0}
      {...accessibilityProps}
      {...rest}
    >
      {/* Panel Header */}
      {(title || headerActions) && (
        <Box
          as="header"
          id={headerId}
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
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          className="panel-header"
          role="heading"
          aria-level={2}
          tabIndex={isDraggable ? 0 : -1}
          aria-grabbed={isDraggable ? false : undefined}
        >
          {title && <Box fontWeight="medium">{title}</Box>}
          {headerActions && <Box>{headerActions}</Box>}
        </Box>
      )}
      
      {/* Panel Content */}
      <Box
        id={contentId}
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
          role="button"
          aria-label="Resize panel"
          tabIndex={0}
          _focus={{
            outline: '2px solid',
            outlineColor: 'primary.500',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              // In a real implementation, this would trigger resize mode
              // and allow arrow keys to resize the panel
            }
          }}
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
