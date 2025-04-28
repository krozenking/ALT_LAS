import React, { useState, useRef, useEffect } from 'react';
import { Box, BoxProps, useColorMode, Flex, VisuallyHidden } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';
import Panel from './Panel';
import DropZone from './DropZone';

export interface PanelContainerProps extends BoxProps {
  initialPanels?: Array<{
    id: string;
    title: string;
    content: React.ReactNode;
    position?: { x: number; y: number };
    size?: { width: number; height: number };
  }>;
  allowDragDrop?: boolean;
  allowResize?: boolean;
  allowCombine?: boolean;
  gridSize?: number;
}

export const PanelContainer: React.FC<PanelContainerProps> = ({
  initialPanels = [],
  allowDragDrop = true,
  allowResize = true,
  allowCombine = true,
  gridSize = 20,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const containerRef = useRef<HTMLDivElement>(null);
  const [panels, setPanels] = useState(initialPanels);
  const [activePanelId, setActivePanelId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dropZones, setDropZones] = useState<Array<{ id: string; position: { x: number; y: number } }>>([]);
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);
  // State for screen reader announcements
  const [announcement, setAnnouncement] = useState<string>('');

  // Handle panel drag start
  const handlePanelDragStart = (id: string, e: React.MouseEvent) => {
    if (!allowDragDrop) return;
    
    setActivePanelId(id);
    
    // Calculate drag offset
    const panel = panels.find(p => p.id === id);
    if (panel && panel.position) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      
      // Announce drag start to screen readers
      setAnnouncement(`Started dragging panel ${panel.title}`);
    }
    
    // Add event listeners for drag and drag end
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Handle mouse move during drag
  const handleMouseMove = (e: MouseEvent) => {
    if (!activePanelId || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left - dragOffset.x;
    const y = e.clientY - containerRect.top - dragOffset.y;
    
    // Snap to grid if gridSize is provided
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;
    
    // Update panel position
    setPanels(prevPanels => 
      prevPanels.map(panel => 
        panel.id === activePanelId 
          ? { 
              ...panel, 
              position: { 
                x: Math.max(0, Math.min(snappedX, containerRect.width - 200)), 
                y: Math.max(0, Math.min(snappedY, containerRect.height - 150)) 
              } 
            }
          : panel
      )
    );
    
    // Check if panel is over a drop zone
    const activeZone = dropZones.find(zone => {
      const zoneRect = document.getElementById(`dropzone-${zone.id}`)?.getBoundingClientRect();
      if (!zoneRect) return false;
      
      return (
        e.clientX >= zoneRect.left &&
        e.clientX <= zoneRect.right &&
        e.clientY >= zoneRect.top &&
        e.clientY <= zoneRect.bottom
      );
    });
    
    // If entering a new drop zone, announce it
    if (activeZone?.id !== activeDropZone) {
      if (activeZone) {
        setAnnouncement(`Panel over drop zone ${activeZone.id}`);
      }
    }
    
    setActiveDropZone(activeZone?.id || null);
  };
  
  // Handle mouse up after drag
  const handleMouseUp = () => {
    if (activePanelId) {
      const panel = panels.find(p => p.id === activePanelId);
      
      if (activeDropZone && allowCombine) {
        // Handle panel combination logic here
        console.log(`Combining panel ${activePanelId} with drop zone ${activeDropZone}`);
        
        // Example: Remove the dragged panel and update the drop zone content
        // This is simplified; actual implementation would depend on your panel combination UI
        setPanels(prevPanels => prevPanels.filter(panel => panel.id !== activePanelId));
        
        // Announce panel combination to screen readers
        setAnnouncement(`Panel ${panel?.title} combined with drop zone ${activeDropZone}`);
      } else {
        // Announce drag end to screen readers
        setAnnouncement(`Stopped dragging panel ${panel?.title}`);
      }
    }
    
    setActivePanelId(null);
    setActiveDropZone(null);
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  // Handle panel resize
  const handlePanelResize = (id: string, delta: { width: number; height: number }) => {
    if (!allowResize) return;
    
    setPanels(prevPanels => 
      prevPanels.map(panel => 
        panel.id === id && panel.size
          ? { 
              ...panel, 
              size: { 
                width: Math.max(200, panel.size.width + delta.width), 
                height: Math.max(150, panel.size.height + delta.height) 
              } 
            }
          : panel
      )
    );
    
    // Announce resize to screen readers
    const panel = panels.find(p => p.id === id);
    setAnnouncement(`Resizing panel ${panel?.title}`);
  };
  
  // Add a new panel
  const addPanel = (panel: {
    id: string;
    title: string;
    content: React.ReactNode;
    position?: { x: number; y: number };
    size?: { width: number; height: number };
  }) => {
    setPanels(prevPanels => [...prevPanels, panel]);
    
    // Announce new panel to screen readers
    setAnnouncement(`Added new panel: ${panel.title}`);
  };
  
  // Remove a panel
  const removePanel = (id: string) => {
    const panel = panels.find(p => p.id === id);
    setPanels(prevPanels => prevPanels.filter(panel => panel.id !== id));
    
    // Announce panel removal to screen readers
    setAnnouncement(`Removed panel: ${panel?.title}`);
  };

  // Keyboard navigation for panels
  const handleKeyDown = (e: React.KeyboardEvent, panelId: string) => {
    const panel = panels.find(p => p.id === panelId);
    if (!panel || !panel.position) return;
    
    const moveAmount = e.shiftKey ? gridSize * 5 : gridSize;
    let newPosition = { ...panel.position };
    
    switch (e.key) {
      case 'ArrowUp':
        newPosition.y = Math.max(0, newPosition.y - moveAmount);
        e.preventDefault();
        break;
      case 'ArrowDown':
        newPosition.y = newPosition.y + moveAmount;
        e.preventDefault();
        break;
      case 'ArrowLeft':
        newPosition.x = Math.max(0, newPosition.x - moveAmount);
        e.preventDefault();
        break;
      case 'ArrowRight':
        newPosition.x = newPosition.x + moveAmount;
        e.preventDefault();
        break;
      case 'Delete':
      case 'Backspace':
        if (e.altKey) {
          removePanel(panelId);
          e.preventDefault();
        }
        break;
      default:
        return;
    }
    
    // Update panel position
    setPanels(prevPanels => 
      prevPanels.map(p => 
        p.id === panelId 
          ? { ...p, position: newPosition } 
          : p
      )
    );
    
    // Announce movement to screen readers
    setAnnouncement(`Moved panel ${panel.title} using keyboard`);
  };
  
  return (
    <Box
      ref={containerRef}
      position="relative"
      width="100%"
      height="100%"
      overflow="hidden"
      role="region"
      aria-label="Panel Container"
      aria-roledescription="Draggable panel container area"
      {...rest}
    >
      {/* Screen reader announcements */}
      <VisuallyHidden aria-live="polite" aria-atomic="true">
        {announcement}
      </VisuallyHidden>
      
      {/* Instructions for keyboard users */}
      <VisuallyHidden>
        <div id="panel-container-instructions">
          Use arrow keys to move panels. Hold shift with arrow keys for larger movements.
          Alt + Delete to remove a panel. Tab to navigate between panels.
        </div>
      </VisuallyHidden>
      
      {/* Render panels */}
      {panels.map((panel, index) => (
        <Panel
          key={panel.id}
          title={panel.title}
          position="absolute"
          top={panel.position?.y || 0}
          left={panel.position?.x || 0}
          width={panel.size?.width || 300}
          height={panel.size?.height || 200}
          zIndex={activePanelId === panel.id ? 10 : 1}
          isDraggable={allowDragDrop}
          isResizable={allowResize}
          onDragStart={(e) => handlePanelDragStart(panel.id, e)}
          onKeyDown={(e) => handleKeyDown(e, panel.id)}
          tabIndex={0} // Make panels focusable
          aria-describedby="panel-container-instructions"
          aria-label={`Panel: ${panel.title}`}
          aria-grabbed={activePanelId === panel.id}
          headerActions={
            <Box 
              as="button"
              fontSize="sm"
              opacity={0.7}
              _hover={{ opacity: 1 }}
              onClick={() => removePanel(panel.id)}
              aria-label={`Remove panel: ${panel.title}`}
            >
              ✕
            </Box>
          }
        >
          {panel.content}
        </Panel>
      ))}
      
      {/* Render drop zones */}
      {allowCombine && dropZones.map(zone => (
        <DropZone
          key={zone.id}
          id={`dropzone-${zone.id}`}
          position="absolute"
          top={zone.position.y}
          left={zone.position.x}
          width="200px"
          height="150px"
          isActive={activeDropZone === zone.id}
          aria-label={`Drop zone ${zone.id}`}
          role="region"
          aria-roledescription="Panel drop zone"
        />
      ))}
    </Box>
  );
};

export default PanelContainer;
