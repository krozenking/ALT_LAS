import React, { useState, useRef, useEffect } from 'react';
import { Box, BoxProps, useColorMode, Flex } from '@chakra-ui/react';
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
    
    setActiveDropZone(activeZone?.id || null);
  };
  
  // Handle mouse up after drag
  const handleMouseUp = () => {
    if (activePanelId && activeDropZone && allowCombine) {
      // Handle panel combination logic here
      console.log(`Combining panel ${activePanelId} with drop zone ${activeDropZone}`);
      
      // Example: Remove the dragged panel and update the drop zone content
      // This is simplified; actual implementation would depend on your panel combination UI
      setPanels(prevPanels => prevPanels.filter(panel => panel.id !== activePanelId));
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
  };
  
  // Remove a panel
  const removePanel = (id: string) => {
    setPanels(prevPanels => prevPanels.filter(panel => panel.id !== id));
  };
  
  return (
    <Box
      ref={containerRef}
      position="relative"
      width="100%"
      height="100%"
      overflow="hidden"
      {...rest}
    >
      {/* Render panels */}
      {panels.map(panel => (
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
          headerActions={
            <Box 
              as="button"
              fontSize="sm"
              opacity={0.7}
              _hover={{ opacity: 1 }}
              onClick={() => removePanel(panel.id)}
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
        />
      ))}
    </Box>
  );
};

export default PanelContainer;
