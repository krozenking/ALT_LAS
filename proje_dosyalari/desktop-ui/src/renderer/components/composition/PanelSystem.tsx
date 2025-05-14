import React, { useState, useCallback } from 'react';
import { Box, Button, Flex, Text, useColorMode, useDisclosure } from '@chakra-ui/react';
import DraggablePanelContainer, { PanelData } from './DraggablePanelContainer';
import { glassmorphism } from '@/styles/theme';

export interface PanelSystemProps {
  /**
   * Initial panels to display
   */
  initialPanels?: PanelData[];
  /**
   * Whether to allow creating new panels
   */
  allowCreatePanel?: boolean;
  /**
   * Whether to show the panel toolbar
   */
  showToolbar?: boolean;
  /**
   * Whether to allow panel drag and drop
   */
  allowDragDrop?: boolean;
  /**
   * Whether to allow panel resizing
   */
  allowResize?: boolean;
  /**
   * Whether to allow panel combining
   */
  allowCombine?: boolean;
  /**
   * Grid size for snapping
   */
  gridSize?: number;
  /**
   * Callback when panels change
   */
  onPanelsChange?: (panels: PanelData[]) => void;
}

export const PanelSystem: React.FC<PanelSystemProps> = ({
  initialPanels = [],
  allowCreatePanel = true,
  showToolbar = true,
  allowDragDrop = true,
  allowResize = true,
  allowCombine = true,
  gridSize = 20,
  onPanelsChange,
}) => {
  const { colorMode } = useColorMode();
  const [panels, setPanels] = useState<PanelData[]>(initialPanels);
  
  // Handle panel changes
  const handlePanelsChange = useCallback((newPanels: PanelData[]) => {
    setPanels(newPanels);
    if (onPanelsChange) {
      onPanelsChange(newPanels);
    }
  }, [onPanelsChange]);
  
  // Create a new panel
  const createPanel = useCallback(() => {
    const id = `panel-${Date.now()}`;
    const newPanel: PanelData = {
      id,
      title: `Panel ${panels.length + 1}`,
      content: (
        <Box p={4}>
          <Text>This is a new panel. You can drag it around and resize it.</Text>
        </Box>
      ),
      position: {
        x: Math.floor(Math.random() * 200),
        y: Math.floor(Math.random() * 100),
      },
      size: {
        width: 300,
        height: 200,
      },
    };
    
    const updatedPanels = [...panels, newPanel];
    setPanels(updatedPanels);
    
    if (onPanelsChange) {
      onPanelsChange(updatedPanels);
    }
  }, [panels, onPanelsChange]);
  
  // Reset all panels
  const resetPanels = useCallback(() => {
    setPanels(initialPanels);
    
    if (onPanelsChange) {
      onPanelsChange(initialPanels);
    }
  }, [initialPanels, onPanelsChange]);
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  return (
    <Box position="relative" width="100%" height="100%">
      {/* Panel toolbar */}
      {showToolbar && (
        <Flex
          position="absolute"
          top={4}
          right={4}
          zIndex={100}
          gap={2}
          p={2}
          borderRadius="md"
          {...glassStyle}
        >
          {allowCreatePanel && (
            <Button
              size="sm"
              colorScheme="primary"
              onClick={createPanel}
              aria-label="Create new panel"
            >
              Add Panel
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={resetPanels}
            aria-label="Reset panels"
          >
            Reset
          </Button>
        </Flex>
      )}
      
      {/* Panel container */}
      <DraggablePanelContainer
        initialPanels={panels}
        allowDragDrop={allowDragDrop}
        allowResize={allowResize}
        allowCombine={allowCombine}
        gridSize={gridSize}
        onPanelsChange={handlePanelsChange}
        ariaLabel="Panel System"
      />
    </Box>
  );
};

export default PanelSystem;
