import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
  useColorMode,
  VStack,
  HStack,
  Text,
} from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';
import { LayoutConfig, LayoutType } from './LayoutManager';

export interface LayoutControlsProps {
  /**
   * Current layout configuration
   */
  layout: LayoutConfig;
  /**
   * Callback when layout changes
   */
  onLayoutChange: (layout: LayoutConfig) => void;
  /**
   * Whether the controls are expanded
   */
  isExpanded?: boolean;
  /**
   * Callback when expanded state changes
   */
  onExpandedChange?: (isExpanded: boolean) => void;
}

export const LayoutControls: React.FC<LayoutControlsProps> = ({
  layout,
  onLayoutChange,
  isExpanded = false,
  onExpandedChange,
}) => {
  const { colorMode } = useColorMode();
  const [localLayout, setLocalLayout] = useState<LayoutConfig>(layout);
  const [isOpen, setIsOpen] = useState<boolean>(isExpanded);
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // Handle layout type change
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as LayoutType;
    const newLayout = { ...localLayout, type: newType };
    
    // Set default values based on layout type
    if (newType === 'grid' && (!localLayout.areas || !localLayout.columns || !localLayout.rows)) {
      newLayout.areas = [['main']];
      newLayout.columns = ['1fr'];
      newLayout.rows = ['1fr'];
    } else if (newType === 'split' && !localLayout.splitDirection) {
      newLayout.splitDirection = 'horizontal';
      newLayout.splitRatio = 0.5;
    }
    
    setLocalLayout(newLayout);
    onLayoutChange(newLayout);
  };
  
  // Handle split direction change
  const handleSplitDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDirection = e.target.value as 'horizontal' | 'vertical';
    const newLayout = { ...localLayout, splitDirection: newDirection };
    setLocalLayout(newLayout);
    onLayoutChange(newLayout);
  };
  
  // Handle split ratio change
  const handleSplitRatioChange = (value: number) => {
    const newLayout = { ...localLayout, splitRatio: value };
    setLocalLayout(newLayout);
    onLayoutChange(newLayout);
  };
  
  // Handle gap change
  const handleGapChange = (value: number) => {
    const newLayout = { ...localLayout, gap: value };
    setLocalLayout(newLayout);
    onLayoutChange(newLayout);
  };
  
  // Handle grid areas change
  const handleGridAreasChange = (areas: string[][]) => {
    const newLayout = { ...localLayout, areas };
    setLocalLayout(newLayout);
    onLayoutChange(newLayout);
  };
  
  // Handle grid columns change
  const handleGridColumnsChange = (columns: string[]) => {
    const newLayout = { ...localLayout, columns };
    setLocalLayout(newLayout);
    onLayoutChange(newLayout);
  };
  
  // Handle grid rows change
  const handleGridRowsChange = (rows: string[]) => {
    const newLayout = { ...localLayout, rows };
    setLocalLayout(newLayout);
    onLayoutChange(newLayout);
  };
  
  // Toggle controls visibility
  const toggleControls = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onExpandedChange) {
      onExpandedChange(newState);
    }
  };
  
  // Render grid layout controls
  const renderGridControls = () => {
    const areas = localLayout.areas || [['main']];
    const columns = localLayout.columns || ['1fr'];
    const rows = localLayout.rows || ['1fr'];
    
    return (
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel fontSize="sm">Grid Areas</FormLabel>
          <VStack spacing={2} align="stretch">
            {areas.map((row, rowIndex) => (
              <HStack key={`row-${rowIndex}`} spacing={2}>
                {row.map((area, colIndex) => (
                  <Input
                    key={`area-${rowIndex}-${colIndex}`}
                    size="sm"
                    value={area}
                    onChange={(e) => {
                      const newAreas = [...areas];
                      newAreas[rowIndex][colIndex] = e.target.value;
                      handleGridAreasChange(newAreas);
                    }}
                  />
                ))}
                <IconButton
                  aria-label="Add column"
                  size="sm"
                  onClick={() => {
                    const newAreas = [...areas];
                    newAreas[rowIndex].push('area');
                    handleGridAreasChange(newAreas);
                  }}
                >
                  +
                </IconButton>
                <IconButton
                  aria-label="Remove column"
                  size="sm"
                  isDisabled={row.length <= 1}
                  onClick={() => {
                    const newAreas = [...areas];
                    newAreas[rowIndex].pop();
                    handleGridAreasChange(newAreas);
                  }}
                >
                  -
                </IconButton>
              </HStack>
            ))}
            <HStack spacing={2}>
              <Button
                size="sm"
                onClick={() => {
                  const newAreas = [...areas, ['area']];
                  handleGridAreasChange(newAreas);
                }}
              >
                Add Row
              </Button>
              <Button
                size="sm"
                isDisabled={areas.length <= 1}
                onClick={() => {
                  const newAreas = [...areas];
                  newAreas.pop();
                  handleGridAreasChange(newAreas);
                }}
              >
                Remove Row
              </Button>
            </HStack>
          </VStack>
        </FormControl>
        
        <FormControl>
          <FormLabel fontSize="sm">Grid Columns</FormLabel>
          <HStack spacing={2}>
            {columns.map((col, index) => (
              <Input
                key={`col-${index}`}
                size="sm"
                value={col}
                onChange={(e) => {
                  const newColumns = [...columns];
                  newColumns[index] = e.target.value;
                  handleGridColumnsChange(newColumns);
                }}
              />
            ))}
          </HStack>
        </FormControl>
        
        <FormControl>
          <FormLabel fontSize="sm">Grid Rows</FormLabel>
          <HStack spacing={2}>
            {rows.map((row, index) => (
              <Input
                key={`row-${index}`}
                size="sm"
                value={row}
                onChange={(e) => {
                  const newRows = [...rows];
                  newRows[index] = e.target.value;
                  handleGridRowsChange(newRows);
                }}
              />
            ))}
          </HStack>
        </FormControl>
      </VStack>
    );
  };
  
  // Render split layout controls
  const renderSplitControls = () => {
    return (
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel fontSize="sm">Split Direction</FormLabel>
          <Select
            size="sm"
            value={localLayout.splitDirection || 'horizontal'}
            onChange={handleSplitDirectionChange}
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel fontSize="sm">Split Ratio ({(localLayout.splitRatio || 0.5) * 100}%)</FormLabel>
          <Slider
            min={0.1}
            max={0.9}
            step={0.05}
            value={localLayout.splitRatio || 0.5}
            onChange={handleSplitRatioChange}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </FormControl>
      </VStack>
    );
  };
  
  // Render common controls
  const renderCommonControls = () => {
    return (
      <FormControl>
        <FormLabel fontSize="sm">Gap</FormLabel>
        <NumberInput
          size="sm"
          min={0}
          max={20}
          value={localLayout.gap || 4}
          onChange={(_, value) => handleGapChange(value)}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
    );
  };
  
  return (
    <Box
      position="absolute"
      top={4}
      left={4}
      zIndex={100}
      borderRadius="md"
      {...glassStyle}
    >
      <Flex direction="column">
        <Button
          size="sm"
          variant="ghost"
          onClick={toggleControls}
          width="100%"
          justifyContent="space-between"
          borderBottomRadius={isOpen ? 0 : 'md'}
        >
          <Text>Layout Controls</Text>
          <Text>{isOpen ? '▲' : '▼'}</Text>
        </Button>
        
        {isOpen && (
          <Box p={4} borderBottomRadius="md">
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm">Layout Type</FormLabel>
                <Select
                  size="sm"
                  value={localLayout.type}
                  onChange={handleTypeChange}
                >
                  <option value="grid">Grid</option>
                  <option value="flex">Flex</option>
                  <option value="split">Split</option>
                  <option value="free">Free</option>
                </Select>
              </FormControl>
              
              {renderCommonControls()}
              
              {localLayout.type === 'grid' && renderGridControls()}
              {localLayout.type === 'split' && renderSplitControls()}
            </VStack>
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default LayoutControls;
