import React, { useId } from 'react';
import { Box, BoxProps, useColorMode, Heading } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';

export interface PanelProps extends BoxProps {
  title?: string;
  headerLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; // Allow specifying header level
  headerActions?: React.ReactNode;
  isDraggable?: boolean;
  isResizable?: boolean;
  minWidth?: string | number;
  minHeight?: string | number;
  onDragStart?: (e: React.MouseEvent | React.TouchEvent) => void; // Allow touch events
  onDragEnd?: (e: React.MouseEvent | React.TouchEvent) => void; // Allow touch events
  // Add props for keyboard resizing if implemented later
}

export const Panel: React.FC<PanelProps> = ({
  title,
  headerLevel = 'h3', // Default header level
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
  const panelId = useId();
  const headerId = title ? `${panelId}-header` : undefined;
  const contentId = `${panelId}-content`;

  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.75, 15, 1)
    : glassmorphism.createDark(0.75, 15, 1);

  // Focus style for the panel itself (if made focusable)
  const focusStyle = {
    _focus: {
        outline: 'none', // Remove default outline
        boxShadow: 'outline', // Use Chakra's focus outline style
        zIndex: 1, // Ensure focus style is visible
    }
  };

  // Focus style for the header (important for draggable indication)
  const headerFocusStyle = isDraggable ? {
    _focus: {
        outline: 'none',
        boxShadow: 'outline',
        zIndex: 1,
    }
  } : {};

  return (
    <Box
      {...glassStyle}
      {...focusStyle} // Apply focus style if panel becomes focusable
      display="flex"
      flexDirection="column"
      minWidth={minWidth}
      minHeight={minHeight}
      position="relative"
      transition="all 0.2s ease-in-out"
      _hover={{ boxShadow: 'lg' }}
      role="region" // Keep role as region
      aria-labelledby={headerId} // Label panel by its header title
      id={panelId}
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
          onTouchStart={isDraggable ? onDragStart : undefined} // Add touch support
          onTouchEnd={isDraggable ? onDragEnd : undefined} // Add touch support
          className="panel-header"
          tabIndex={isDraggable ? 0 : -1} // Make header focusable if draggable
          aria-roledescription={isDraggable ? "draggable header" : undefined}
          {...headerFocusStyle} // Apply focus style to header
        >
          {title && (
            <Heading as={headerLevel} size="sm" id={headerId} flex="1" mr={2}>
              {title}
            </Heading>
          )}
          {headerActions && <Box>{headerActions}</Box>}
        </Box>
      )}

      {/* Panel Content */}
      <Box
        flex="1"
        p={4}
        overflow="auto"
        className="panel-content"
        id={contentId}
        role="document" // Role document might be appropriate for main content area
      >
        {children}
      </Box>

      {/* Resize Handle (Visual Only - Needs Keyboard Implementation) */}
      {isResizable && (
        <Box
          position="absolute"
          bottom="0"
          right="0"
          width="15px"
          height="15px"
          cursor="nwse-resize"
          className="resize-handle"
          aria-hidden="true" // Hide visual handle from screen readers
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
        // TODO: Implement accessible resize handle (e.g., invisible button with keyboard controls)
      )}
    </Box>
  );
};

export default Panel;

