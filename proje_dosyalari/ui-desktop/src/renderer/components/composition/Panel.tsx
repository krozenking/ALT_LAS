import React, { useId, useState } from 'react';
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
  onDragStart?: (e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => void; // Allow touch and keyboard events
  onDragEnd?: (e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => void; // Allow touch and keyboard events
  /**
   * Accessible label for the panel when the title is not provided
   */
  ariaLabel?: string;
  /**
   * ID for the panel, used for aria-labelledby
   */
  id?: string; // Allow external ID override
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
  ariaLabel,
  id: externalId,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const generatedId = useId();
  const panelId = externalId || generatedId;
  const headerId = title ? `${panelId}-header` : undefined;
  const contentId = `${panelId}-content`;
  const [isDragging, setIsDragging] = useState(false);

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

  // Keyboard handlers for draggable header
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    if (!isDraggable) return;
    setIsDragging(true);
    onDragStart?.(e);
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    if (!isDraggable || !isDragging) return;
    setIsDragging(false);
    onDragEnd?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDraggable) return;
    // Space or Enter to start/stop dragging
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (isDragging) {
        handleDragEnd(e);
      } else {
        handleDragStart(e);
      }
    }
    // TODO: Implement arrow key movement logic when dragging via keyboard
  };

  return (
    <Box
      {...glassStyle}
      // {...focusStyle} // Only apply if panel itself needs focus
      display="flex"
      flexDirection="column"
      minWidth={minWidth}
      minHeight={minHeight}
      position="relative"
      transition="all 0.2s ease-in-out"
      _hover={{ boxShadow: 'lg' }}
      role="region"
      aria-labelledby={headerId}
      aria-label={!title && ariaLabel ? ariaLabel : undefined}
      id={panelId}
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
          cursor={isDraggable ? (isDragging ? 'grabbing' : 'grab') : 'default'}
          userSelect="none"
          onMouseDown={isDraggable ? handleDragStart : undefined}
          onMouseUp={isDraggable ? handleDragEnd : undefined}
          onMouseLeave={isDraggable ? handleDragEnd : undefined} // End drag if mouse leaves header
          onTouchStart={isDraggable ? handleDragStart : undefined} // Add touch support
          onTouchEnd={isDraggable ? handleDragEnd : undefined} // Add touch support
          onKeyDown={handleKeyDown} // Add keyboard support
          className="panel-header"
          tabIndex={isDraggable ? 0 : -1} // Make header focusable if draggable
          aria-roledescription={isDraggable ? "draggable header" : undefined}
          aria-grabbed={isDraggable ? isDragging : undefined}
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
        id={contentId}
        flex="1"
        p={4}
        overflow="auto"
        className="panel-content"
        role="document" // Role document might be appropriate for main content area
      >
        {children}
      </Box>

      {/* Accessible Resize Handle Implementation Needed */}
      {isResizable && (
        <Box
          position="absolute"
          bottom="0"
          right="0"
          width="15px"
          height="15px"
          cursor="nwse-resize"
          className="resize-handle"
          role="button" // Use button role for interaction
          aria-label="Resize panel" // Accessible label
          tabIndex={0} // Make it focusable
          _focus={{
            outline: '2px solid',
            outlineColor: 'primary.500',
            zIndex: 1,
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              // TODO: Implement keyboard resize activation/logic
              console.log('Activate resize mode');
            }
            // TODO: Implement arrow key resize logic
          }}
          // TODO: Add onMouseDown/onTouchStart for visual handle dragging
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
        // Consider using a dedicated library or more robust implementation for resizing
      )}
    </Box>
  );
};

export default Panel;

