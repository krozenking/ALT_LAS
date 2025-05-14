import React, { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  rectSwappingStrategy,
} from '@dnd-kit/sortable';
import { Box, BoxProps } from '@chakra-ui/react';
import DragOverlay from './DragOverlay';

export type SortingStrategy = 'vertical' | 'horizontal' | 'grid' | 'flex';

export interface SortableProps extends BoxProps {
  /**
   * Items to be sorted
   */
  items: { id: UniqueIdentifier; [key: string]: any }[];
  /**
   * Callback when items are sorted
   */
  onSort: (items: { id: UniqueIdentifier; [key: string]: any }[]) => void;
  /**
   * Render function for each item
   */
  renderItem: (item: { id: UniqueIdentifier; [key: string]: any }, index: number) => React.ReactNode;
  /**
   * Render function for the overlay
   */
  renderOverlay?: (item: { id: UniqueIdentifier; [key: string]: any }) => React.ReactNode;
  /**
   * Sorting strategy
   */
  strategy?: SortingStrategy;
  /**
   * Whether to use the keyboard sensor
   */
  useKeyboardSensor?: boolean;
  /**
   * Whether to use the pointer sensor
   */
  usePointerSensor?: boolean;
  /**
   * Minimum distance to start dragging (in pixels)
   */
  activationDistance?: number;
  /**
   * Container style
   */
  containerStyle?: React.CSSProperties;
  /**
   * Whether to disable sorting
   */
  disabled?: boolean;
}

export const Sortable: React.FC<SortableProps> = ({
  items,
  onSort,
  renderItem,
  renderOverlay,
  strategy = 'vertical',
  useKeyboardSensor = true,
  usePointerSensor = true,
  activationDistance = 5,
  containerStyle,
  disabled = false,
  ...rest
}) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  
  // Get the appropriate sorting strategy
  const getSortingStrategy = () => {
    switch (strategy) {
      case 'vertical':
        return verticalListSortingStrategy;
      case 'horizontal':
        return horizontalListSortingStrategy;
      case 'grid':
        return rectSortingStrategy;
      case 'flex':
        return rectSwappingStrategy;
      default:
        return verticalListSortingStrategy;
    }
  };
  
  // Configure sensors
  const sensors = useSensors(
    usePointerSensor && useSensor(PointerSensor, {
      activationConstraint: {
        distance: activationDistance,
      },
    }),
    useKeyboardSensor && useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);
  
  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      onSort(newItems);
    }
    
    setActiveId(null);
  }, [items, onSort]);
  
  // Get the active item
  const getActiveItem = useCallback(() => {
    if (!activeId) return null;
    return items.find(item => item.id === activeId) || null;
  }, [activeId, items]);
  
  // Get container style based on strategy
  const getContainerStyle = () => {
    const baseStyle = { ...containerStyle };
    
    switch (strategy) {
      case 'vertical':
        return {
          display: 'flex',
          flexDirection: 'column',
          ...baseStyle,
        };
      case 'horizontal':
        return {
          display: 'flex',
          flexDirection: 'row',
          ...baseStyle,
        };
      case 'grid':
        return {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
          ...baseStyle,
        };
      case 'flex':
        return {
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          ...baseStyle,
        };
      default:
        return baseStyle;
    }
  };
  
  return (
    <Box {...rest}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={getSortingStrategy()}
          disabled={disabled}
        >
          <Box style={getContainerStyle()}>
            {items.map((item, index) => renderItem(item, index))}
          </Box>
        </SortableContext>
        
        <DragOverlay>
          {activeId && renderOverlay
            ? renderOverlay(getActiveItem()!)
            : null}
        </DragOverlay>
      </DndContext>
    </Box>
  );
};

export default Sortable;
