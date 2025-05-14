import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box, BoxProps, useColorMode, VisuallyHidden } from '@chakra-ui/react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { glassmorphism } from '@/styles/theme';
import DraggablePanel from './DraggablePanel';
import Panel from './Panel';
import DropZone from './DropZone';

export interface PanelData {
  id: string;
  title: string;
  content: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized?: boolean;
  isMaximized?: boolean;
}

export interface DraggablePanelContainerProps extends BoxProps {
  initialPanels?: PanelData[];
  allowDragDrop?: boolean;
  allowResize?: boolean;
  allowCombine?: boolean;
  gridSize?: number;
  /**
   * Accessible label for the panel container
   */
  ariaLabel?: string;
  /**
   * ID for the panel container, used for aria attributes
   */
  id?: string;
  /**
   * Callback when panels change
   */
  onPanelsChange?: (panels: PanelData[]) => void;
}

export const DraggablePanelContainer: React.FC<DraggablePanelContainerProps> = ({
  initialPanels = [],
  allowDragDrop = true,
  allowResize = true,
  allowCombine = true,
  gridSize = 20,
  ariaLabel = "Panel Container",
  id: externalId,
  onPanelsChange,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const containerRef = useRef<HTMLDivElement>(null);
  const [panels, setPanels] = useState<PanelData[]>(initialPanels);
  const [activePanelId, setActivePanelId] = useState<string | null>(null);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [dropZones, setDropZones] = useState<Array<{ id: string; position: { x: number; y: number } }>>([]);
  const [announcement, setAnnouncement] = useState<string>('');
  
  // Create unique IDs
  const containerId = externalId || `panel-container-${Math.random().toString(36).substr(2, 9)}`;
  const instructionsId = `${containerId}-instructions`;

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: (event) => {
        const { active, context } = event;
        if (!active || !context.active) return { x: 0, y: 0 };
        
        const currentPanel = panels.find(p => p.id === active.id);
        if (!currentPanel) return { x: 0, y: 0 };
        
        const { x, y } = currentPanel.position;
        const moveAmount = event.shiftKey ? gridSize * 5 : gridSize;
        
        switch (event.code) {
          case 'ArrowUp':
            return { x, y: Math.max(0, y - moveAmount) };
          case 'ArrowDown':
            return { x, y: y + moveAmount };
          case 'ArrowLeft':
            return { x: Math.max(0, x - moveAmount), y };
          case 'ArrowRight':
            return { x: x + moveAmount, y };
          default:
            return { x, y };
        }
      },
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    if (!allowDragDrop) return;
    
    const { active } = event;
    setActivePanelId(active.id as string);
    
    // Announce drag start to screen readers
    const panel = panels.find(p => p.id === active.id);
    setAnnouncement(`Started dragging panel ${panel?.title || active.id}`);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta, over } = event;
    setActivePanelId(null);
    
    if (!active) return;
    
    const panelId = active.id as string;
    const panel = panels.find(p => p.id === panelId);
    
    if (!panel) return;
    
    // Update panel position
    setPanels(prevPanels => {
      const updatedPanels = prevPanels.map(p => {
        if (p.id === panelId) {
          // Calculate new position
          const newX = p.position.x + delta.x;
          const newY = p.position.y + delta.y;
          
          // Snap to grid if gridSize is provided
          const snappedX = Math.round(newX / gridSize) * gridSize;
          const snappedY = Math.round(newY / gridSize) * gridSize;
          
          // Ensure panel stays within container bounds
          const maxX = containerRef.current ? containerRef.current.offsetWidth - p.size.width : 0;
          const maxY = containerRef.current ? containerRef.current.offsetHeight - p.size.height : 0;
          
          return {
            ...p,
            position: {
              x: Math.max(0, Math.min(snappedX, maxX)),
              y: Math.max(0, Math.min(snappedY, maxY)),
            },
          };
        }
        return p;
      });
      
      // Notify parent of panel changes
      if (onPanelsChange) {
        onPanelsChange(updatedPanels);
      }
      
      return updatedPanels;
    });
    
    // Announce drag end to screen readers
    setAnnouncement(`Stopped dragging panel ${panel.title}`);
  };

  // Handle panel resize
  const handlePanelResize = (id: string, delta: { width: number; height: number }) => {
    if (!allowResize) return;
    
    setPanels(prevPanels => {
      const updatedPanels = prevPanels.map(panel => {
        if (panel.id === id) {
          // Calculate new size
          const newWidth = Math.max(200, panel.size.width + delta.width);
          const newHeight = Math.max(150, panel.size.height + delta.height);
          
          // Ensure panel stays within container bounds
          const maxWidth = containerRef.current ? containerRef.current.offsetWidth - panel.position.x : 1000;
          const maxHeight = containerRef.current ? containerRef.current.offsetHeight - panel.position.y : 800;
          
          return {
            ...panel,
            size: {
              width: Math.min(newWidth, maxWidth),
              height: Math.min(newHeight, maxHeight),
            },
          };
        }
        return panel;
      });
      
      // Notify parent of panel changes
      if (onPanelsChange) {
        onPanelsChange(updatedPanels);
      }
      
      return updatedPanels;
    });
    
    // Announce resize to screen readers
    const panel = panels.find(p => p.id === id);
    setAnnouncement(`Resizing panel ${panel?.title}`);
  };

  // Handle panel selection
  const handlePanelSelect = (id: string) => {
    setSelectedPanelId(id);
    
    // Announce selection to screen readers
    const panel = panels.find(p => p.id === id);
    setAnnouncement(`Selected panel ${panel?.title}`);
  };

  // Handle panel close
  const handlePanelClose = (id: string) => {
    const panel = panels.find(p => p.id === id);
    
    setPanels(prevPanels => {
      const updatedPanels = prevPanels.filter(p => p.id !== id);
      
      // Notify parent of panel changes
      if (onPanelsChange) {
        onPanelsChange(updatedPanels);
      }
      
      return updatedPanels;
    });
    
    // Clear selected panel if it was the closed one
    if (selectedPanelId === id) {
      setSelectedPanelId(null);
    }
    
    // Announce panel removal to screen readers
    setAnnouncement(`Removed panel ${panel?.title}`);
  };

  // Toggle panel maximize state
  const togglePanelMaximize = (id: string) => {
    setPanels(prevPanels => {
      const updatedPanels = prevPanels.map(panel => {
        if (panel.id === id) {
          return {
            ...panel,
            isMaximized: !panel.isMaximized,
            isMinimized: false, // Unminimize if maximizing
          };
        }
        // If one panel is maximized, others should be hidden
        return panel.id !== id && !panel.isMaximized
          ? panel
          : { ...panel, isMaximized: false };
      });
      
      // Notify parent of panel changes
      if (onPanelsChange) {
        onPanelsChange(updatedPanels);
      }
      
      return updatedPanels;
    });
    
    // Announce maximize state change to screen readers
    const panel = panels.find(p => p.id === id);
    const isCurrentlyMaximized = panel?.isMaximized || false;
    setAnnouncement(`${isCurrentlyMaximized ? 'Restored' : 'Maximized'} panel ${panel?.title}`);
  };

  // Toggle panel minimize state
  const togglePanelMinimize = (id: string) => {
    setPanels(prevPanels => {
      const updatedPanels = prevPanels.map(panel => {
        if (panel.id === id) {
          return {
            ...panel,
            isMinimized: !panel.isMinimized,
            isMaximized: false, // Unmaximize if minimizing
          };
        }
        return panel;
      });
      
      // Notify parent of panel changes
      if (onPanelsChange) {
        onPanelsChange(updatedPanels);
      }
      
      return updatedPanels;
    });
    
    // Announce minimize state change to screen readers
    const panel = panels.find(p => p.id === id);
    const isCurrentlyMinimized = panel?.isMinimized || false;
    setAnnouncement(`${isCurrentlyMinimized ? 'Restored' : 'Minimized'} panel ${panel?.title}`);
  };

  return (
    <Box
      ref={containerRef}
      position="relative"
      width="100%"
      height="100%"
      overflow="hidden"
      role="region"
      aria-label={ariaLabel}
      aria-roledescription="Draggable panel container area"
      id={containerId}
      {...rest}
    >
      {/* Screen reader announcements */}
      <VisuallyHidden aria-live="polite" aria-atomic="true">
        {announcement}
      </VisuallyHidden>

      {/* Instructions for keyboard users */}
      <VisuallyHidden id={instructionsId}>
        Use arrow keys to move panels. Hold shift with arrow keys for larger movements.
        Alt + Delete or Alt + Backspace to remove a panel. Tab to navigate between panels.
      </VisuallyHidden>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
      >
        {/* Render panels */}
        {panels.map((panel) => {
          // Skip rendering maximized panels if another panel is maximized
          const anotherPanelMaximized = panels.some(p => p.isMaximized && p.id !== panel.id);
          if (anotherPanelMaximized && !panel.isMaximized) {
            return null;
          }
          
          // Determine panel style based on state
          const panelStyle = panel.isMaximized
            ? { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }
            : panel.isMinimized
              ? { position: 'absolute', bottom: 0, height: '40px', width: '200px' }
              : {
                  position: 'absolute',
                  top: panel.position.y,
                  left: panel.position.x,
                  width: panel.size.width,
                  height: panel.size.height,
                };
          
          return (
            <DraggablePanel
              key={panel.id}
              id={panel.id}
              title={panel.title}
              isSelected={selectedPanelId === panel.id}
              isMaximized={panel.isMaximized}
              isMinimized={panel.isMinimized}
              toggleMaximize={() => togglePanelMaximize(panel.id)}
              toggleMinimize={() => togglePanelMinimize(panel.id)}
              onClose={() => handlePanelClose(panel.id)}
              onFocus={() => handlePanelSelect(panel.id)}
              onResize={(delta) => handlePanelResize(panel.id, delta)}
              aria-describedby={instructionsId}
              {...panelStyle}
            >
              {panel.content}
            </DraggablePanel>
          );
        })}

        {/* Drag overlay */}
        <DragOverlay>
          {activePanelId ? (
            <Panel
              title={panels.find(p => p.id === activePanelId)?.title || ''}
              opacity={0.6}
              boxShadow="lg"
              width={panels.find(p => p.id === activePanelId)?.size.width || 300}
              height={panels.find(p => p.id === activePanelId)?.size.height || 200}
            >
              {panels.find(p => p.id === activePanelId)?.content}
            </Panel>
          ) : null}
        </DragOverlay>
      </DndContext>
    </Box>
  );
};

export default DraggablePanelContainer;
