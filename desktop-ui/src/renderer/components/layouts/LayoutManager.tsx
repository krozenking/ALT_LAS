import React, { useState, useCallback, useEffect } from 'react';
import { Box, BoxProps, useColorMode, VisuallyHidden } from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';

export type LayoutType = 'grid' | 'flex' | 'split' | 'free';

export interface LayoutConfig {
  type: LayoutType;
  areas?: string[][];
  columns?: string[];
  rows?: string[];
  splitDirection?: 'horizontal' | 'vertical';
  splitRatio?: number;
  gap?: number;
}

export interface LayoutItem {
  id: string;
  area?: string;
  content: React.ReactNode;
  minWidth?: number;
  minHeight?: number;
  flex?: number;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface LayoutManagerProps extends BoxProps {
  /**
   * Layout configuration
   */
  layout: LayoutConfig;
  /**
   * Items to render in the layout
   */
  items: LayoutItem[];
  /**
   * Whether the layout is editable
   */
  isEditable?: boolean;
  /**
   * Callback when layout changes
   */
  onLayoutChange?: (layout: LayoutConfig) => void;
  /**
   * Callback when items change
   */
  onItemsChange?: (items: LayoutItem[]) => void;
  /**
   * Accessible label for the layout manager
   */
  ariaLabel?: string;
}

export const LayoutManager: React.FC<LayoutManagerProps> = ({
  layout,
  items,
  isEditable = false,
  onLayoutChange,
  onItemsChange,
  ariaLabel = "Layout Manager",
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const [activeLayout, setActiveLayout] = useState<LayoutConfig>(layout);
  const [activeItems, setActiveItems] = useState<LayoutItem[]>(items);
  const [announcement, setAnnouncement] = useState<string>('');
  
  // Update internal state when props change
  useEffect(() => {
    setActiveLayout(layout);
  }, [layout]);
  
  useEffect(() => {
    setActiveItems(items);
  }, [items]);
  
  // Handle layout change
  const handleLayoutChange = useCallback((newLayout: LayoutConfig) => {
    setActiveLayout(newLayout);
    if (onLayoutChange) {
      onLayoutChange(newLayout);
    }
    
    // Announce layout change to screen readers
    setAnnouncement(`Layout changed to ${newLayout.type} layout`);
  }, [onLayoutChange]);
  
  // Handle items change
  const handleItemsChange = useCallback((newItems: LayoutItem[]) => {
    setActiveItems(newItems);
    if (onItemsChange) {
      onItemsChange(newItems);
    }
  }, [onItemsChange]);
  
  // Render grid layout
  const renderGridLayout = () => {
    const { areas, columns, rows, gap = 4 } = activeLayout;
    
    if (!areas || !columns || !rows) {
      console.warn('Grid layout requires areas, columns, and rows to be defined');
      return renderFreeLayout();
    }
    
    return (
      <Box
        display="grid"
        gridTemplateAreas={areas.map(row => `"${row.join(' ')}"`).join('\n')}
        gridTemplateColumns={columns.join(' ')}
        gridTemplateRows={rows.join(' ')}
        gap={gap}
        width="100%"
        height="100%"
      >
        {activeItems.map(item => (
          <Box
            key={item.id}
            gridArea={item.area}
            minWidth={item.minWidth}
            minHeight={item.minHeight}
            overflow="auto"
          >
            {item.content}
          </Box>
        ))}
      </Box>
    );
  };
  
  // Render flex layout
  const renderFlexLayout = () => {
    const { splitDirection = 'horizontal', gap = 4 } = activeLayout;
    
    return (
      <Box
        display="flex"
        flexDirection={splitDirection === 'horizontal' ? 'row' : 'column'}
        gap={gap}
        width="100%"
        height="100%"
      >
        {activeItems.map(item => (
          <Box
            key={item.id}
            flex={item.flex || 1}
            minWidth={item.minWidth}
            minHeight={item.minHeight}
            overflow="auto"
          >
            {item.content}
          </Box>
        ))}
      </Box>
    );
  };
  
  // Render split layout
  const renderSplitLayout = () => {
    const { splitDirection = 'horizontal', splitRatio = 0.5, gap = 4 } = activeLayout;
    
    if (activeItems.length < 2) {
      console.warn('Split layout requires at least 2 items');
      return renderFreeLayout();
    }
    
    const firstItem = activeItems[0];
    const secondItem = activeItems[1];
    
    return (
      <Box
        display="flex"
        flexDirection={splitDirection === 'horizontal' ? 'row' : 'column'}
        gap={gap}
        width="100%"
        height="100%"
      >
        <Box
          flex={splitRatio}
          minWidth={firstItem.minWidth}
          minHeight={firstItem.minHeight}
          overflow="auto"
        >
          {firstItem.content}
        </Box>
        <Box
          flex={1 - splitRatio}
          minWidth={secondItem.minWidth}
          minHeight={secondItem.minHeight}
          overflow="auto"
        >
          {secondItem.content}
        </Box>
        {/* Render any additional items in a flex container */}
        {activeItems.length > 2 && (
          <Box
            flex={1}
            display="flex"
            flexDirection={splitDirection === 'horizontal' ? 'column' : 'row'}
            gap={gap}
            overflow="auto"
          >
            {activeItems.slice(2).map(item => (
              <Box
                key={item.id}
                flex={item.flex || 1}
                minWidth={item.minWidth}
                minHeight={item.minHeight}
                overflow="auto"
              >
                {item.content}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  };
  
  // Render free layout
  const renderFreeLayout = () => {
    return (
      <Box
        position="relative"
        width="100%"
        height="100%"
      >
        {activeItems.map(item => (
          <Box
            key={item.id}
            position="absolute"
            top={item.position?.y || 0}
            left={item.position?.x || 0}
            width={item.size?.width || 300}
            height={item.size?.height || 200}
            minWidth={item.minWidth}
            minHeight={item.minHeight}
            overflow="auto"
          >
            {item.content}
          </Box>
        ))}
      </Box>
    );
  };
  
  // Render layout based on type
  const renderLayout = () => {
    switch (activeLayout.type) {
      case 'grid':
        return renderGridLayout();
      case 'flex':
        return renderFlexLayout();
      case 'split':
        return renderSplitLayout();
      case 'free':
      default:
        return renderFreeLayout();
    }
  };
  
  return (
    <Box
      width="100%"
      height="100%"
      position="relative"
      role="region"
      aria-label={ariaLabel}
      {...rest}
    >
      {/* Screen reader announcements */}
      <VisuallyHidden aria-live="polite" aria-atomic="true">
        {announcement}
      </VisuallyHidden>
      
      {/* Render the appropriate layout */}
      {renderLayout()}
    </Box>
  );
};

export default LayoutManager;
