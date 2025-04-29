import React, { useState, useRef, useEffect, useId } from 'react';
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
  /**
   * Accessible label for the panel container
   */
  ariaLabel?: string;
  /**
   * ID for the panel container, used for aria attributes
   */
  id?: string;
}

export const PanelContainer: React.FC<PanelContainerProps> = ({
  initialPanels = [],
  allowDragDrop = true,
  allowResize = true,
  allowCombine = true,
  gridSize = 20,
  ariaLabel = "Panel Container", // Default label
  id: externalId,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const containerRef = useRef<HTMLDivElement>(null);
  const [panels, setPanels] = useState(initialPanels);
  const [activePanelId, setActivePanelId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dropZones, setDropZones] = useState<Array<{ id: string; position: { x: number; y: number } }>>([]);
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);
  const generatedId = useId();
  const containerId = externalId || generatedId;
  const instructionsId = `${containerId}-instructions`;

  // State for screen reader announcements
  const [announcement, setAnnouncement] = useState<string>('');

  // Handle panel drag start
  const handlePanelDragStart = (id: string, e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    if (!allowDragDrop) return;

    setActivePanelId(id);

    // Calculate drag offset for mouse/touch events
    const panel = panels.find(p => p.id === id);
    if (panel && panel.position && 'clientX' in e) { // Check if it's a mouse/touch event
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
    }

    // Announce drag start to screen readers
    setAnnouncement(`Started dragging panel ${panel?.title || id}`);

    // Add event listeners for drag and drag end (only for mouse/touch)
    if ('clientX' in e) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }
  };

  // Handle mouse move during drag
  const handleMouseMove = (e: MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  // Handle touch move during drag
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Common logic for drag movement (mouse/touch)
  const handleDragMove = (clientX: number, clientY: number) => {
    if (!activePanelId || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const x = clientX - containerRect.left - dragOffset.x;
    const y = clientY - containerRect.top - dragOffset.y;

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
                x: Math.max(0, Math.min(snappedX, containerRect.width - (panel.size?.width || 200))),
                y: Math.max(0, Math.min(snappedY, containerRect.height - (panel.size?.height || 150)))
              }
            }
          : panel
      )
    );

    // Check if panel is over a drop zone
    const activeZone = dropZones.find(zone => {
      const zoneElement = document.getElementById(`dropzone-${zone.id}`);
      if (!zoneElement) return false;
      const zoneRect = zoneElement.getBoundingClientRect();

      return (
        clientX >= zoneRect.left &&
        clientX <= zoneRect.right &&
        clientY >= zoneRect.top &&
        clientY <= zoneRect.bottom
      );
    });

    // If entering a new drop zone, announce it
    if (activeZone?.id !== activeDropZone) {
      if (activeZone) {
        setAnnouncement(`Panel over drop zone ${activeZone.id}`);
      }
      setActiveDropZone(activeZone?.id || null);
    }
  };

  // Handle mouse up after drag
  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Handle touch end after drag
  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Common logic for drag end (mouse/touch/keyboard)
  const handleDragEnd = () => {
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
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
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

  // Keyboard navigation and interaction for panels
  const handleKeyDown = (e: React.KeyboardEvent, panelId: string) => {
    const panel = panels.find(p => p.id === panelId);
    if (!panel || !panel.position) return;

    const moveAmount = e.shiftKey ? gridSize * 5 : gridSize;
    let newPosition = { ...panel.position };
    let positionChanged = false;

    switch (e.key) {
      case 'ArrowUp':
        newPosition.y = Math.max(0, newPosition.y - moveAmount);
        positionChanged = true;
        e.preventDefault();
        break;
      case 'ArrowDown':
        newPosition.y = newPosition.y + moveAmount;
        // TODO: Add boundary check based on container height and panel height
        positionChanged = true;
        e.preventDefault();
        break;
      case 'ArrowLeft':
        newPosition.x = Math.max(0, newPosition.x - moveAmount);
        positionChanged = true;
        e.preventDefault();
        break;
      case 'ArrowRight':
        newPosition.x = newPosition.x + moveAmount;
        // TODO: Add boundary check based on container width and panel width
        positionChanged = true;
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
        // Allow other keys (like Enter/Space for header drag) to bubble up
        return;
    }

    if (positionChanged) {
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
    }
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
        Focus panel header and press Space or Enter to toggle keyboard drag mode (if implemented).
      </VisuallyHidden>

      {/* Render panels */}
      {panels.map((panel, index) => (
        <Panel
          key={panel.id}
          id={`panel-${panel.id}`}
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
          onDragEnd={handleDragEnd} // Pass the common drag end handler
          onKeyDown={(e) => handleKeyDown(e, panel.id)} // Pass keyboard handler
          tabIndex={0} // Make panels focusable
          aria-describedby={instructionsId}
          aria-label={`Panel: ${panel.title}`}
          aria-grabbed={activePanelId === panel.id} // Indicate if currently grabbed
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
          ariaLabel={`Drop zone ${zone.id}`}
          ariaDescription="Drop panel here to combine"
          role="region"
          aria-roledescription="Panel drop zone"
        />
      ))}
    </Box>
  );
};

export default PanelContainer;

