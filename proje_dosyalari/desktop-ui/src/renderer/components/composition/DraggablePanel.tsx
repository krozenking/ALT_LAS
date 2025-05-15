import React, { useRef, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Box, useColorMode } from '@chakra-ui/react';
import Panel, { PanelProps } from './Panel';

export interface DraggablePanelProps extends PanelProps {
  id: string;
  index?: number;
  onResizeStart?: () => void;
  onResize?: (delta: { width: number; height: number }) => void;
  onResizeEnd?: () => void;
  /**
   * Callback when panel is focused
   */
  onFocus?: () => void;
  /**
   * Callback when panel is closed
   */
  onClose?: () => void;
  /**
   * Whether the panel is currently selected
   */
  isSelected?: boolean;
  /**
   * Whether the panel is currently maximized
   */
  isMaximized?: boolean;
  /**
   * Whether the panel is currently minimized
   */
  isMinimized?: boolean;
  /**
   * Toggle panel maximized state
   */
  toggleMaximize?: () => void;
  /**
   * Toggle panel minimized state
   */
  toggleMinimize?: () => void;
}

export const DraggablePanel: React.FC<DraggablePanelProps> = ({
  id,
  index,
  children,
  onResizeStart,
  onResize,
  onResizeEnd,
  onFocus,
  onClose,
  isSelected = false,
  isMaximized = false,
  isMinimized = false,
  toggleMaximize,
  toggleMinimize,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const panelRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });

  // Set up draggable
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: {
      index,
      type: 'panel',
    },
  });

  // Apply transform style when dragging
  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 100 : isSelected ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    transition: isDragging ? 'none' : 'all 0.2s ease-in-out',
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    if (!panelRef.current) return;
    
    setResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({
      width: panelRef.current.offsetWidth,
      height: panelRef.current.offsetHeight,
    });
    
    onResizeStart?.();
    
    // Add event listeners for resize and resize end
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };
  
  // Handle resize move
  const handleResizeMove = (e: MouseEvent) => {
    if (!resizing) return;
    
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    
    onResize?.({
      width: deltaX,
      height: deltaY,
    });
  };
  
  // Handle resize end
  const handleResizeEnd = () => {
    setResizing(false);
    onResizeEnd?.();
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // Handle panel focus
  const handleFocus = () => {
    onFocus?.();
  };

  // Handle panel close
  const handleClose = () => {
    onClose?.();
  };

  // Create header actions
  const headerActions = (
    <Box display="flex" alignItems="center" gap={1}>
      {toggleMinimize && (
        <Box
          as="button"
          fontSize="sm"
          opacity={0.7}
          _hover={{ opacity: 1 }}
          onClick={toggleMinimize}
          aria-label={isMinimized ? "Restore panel" : "Minimize panel"}
        >
          {isMinimized ? "□" : "_"}
        </Box>
      )}
      {toggleMaximize && (
        <Box
          as="button"
          fontSize="sm"
          opacity={0.7}
          _hover={{ opacity: 1 }}
          onClick={toggleMaximize}
          aria-label={isMaximized ? "Restore panel" : "Maximize panel"}
        >
          {isMaximized ? "❐" : "□"}
        </Box>
      )}
      {onClose && (
        <Box
          as="button"
          fontSize="sm"
          opacity={0.7}
          _hover={{ opacity: 1 }}
          onClick={handleClose}
          aria-label="Close panel"
        >
          ✕
        </Box>
      )}
    </Box>
  );

  return (
    <Panel
      ref={setNodeRef}
      {...rest}
      style={style}
      isDraggable={!isMaximized}
      isResizable={!isMaximized && !isMinimized}
      onDragStart={attributes.onMouseDown}
      headerActions={headerActions}
      onFocus={handleFocus}
      _focus={{
        outline: isSelected ? `2px solid ${colorMode === 'light' ? 'primary.500' : 'primary.300'}` : 'none',
      }}
    >
      {children}
      
      {/* Resize handle */}
      {!isMaximized && !isMinimized && (
        <Box
          position="absolute"
          bottom="0"
          right="0"
          width="15px"
          height="15px"
          cursor="nwse-resize"
          onMouseDown={handleResizeStart}
          role="button"
          aria-label="Resize panel"
          tabIndex={0}
          _focus={{
            outline: '2px solid',
            outlineColor: 'primary.500',
            zIndex: 1,
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
    </Panel>
  );
};

export default DraggablePanel;
