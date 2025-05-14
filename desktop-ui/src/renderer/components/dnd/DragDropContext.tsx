import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  DndContext as DndKitContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragCancelEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  MouseSensor,
  Modifiers,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { restrictToWindowEdges, snapCenterToCursor } from '@dnd-kit/modifiers';

// Define the context type
interface DragDropContextValue {
  activeId: UniqueIdentifier | null;
  isDragging: boolean;
  startDrag: (id: UniqueIdentifier) => void;
  endDrag: () => void;
}

// Create the context
const DragDropContext = createContext<DragDropContextValue | undefined>(undefined);

// Custom hook to use the context
export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
};

export interface DragDropProviderProps {
  children: ReactNode;
  modifiers?: Modifiers;
  onDragStart?: (event: DragStartEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  onDragCancel?: (event: DragCancelEvent) => void;
  /**
   * Whether to use the keyboard sensor
   */
  useKeyboardSensor?: boolean;
  /**
   * Whether to use the touch sensor
   */
  useTouchSensor?: boolean;
  /**
   * Whether to use the mouse sensor
   */
  useMouseSensor?: boolean;
  /**
   * Whether to use the pointer sensor
   */
  usePointerSensor?: boolean;
  /**
   * Minimum distance to start dragging (in pixels)
   */
  activationDistance?: number;
  /**
   * Minimum press delay to start dragging (in milliseconds)
   */
  activationDelay?: number;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({
  children,
  modifiers = [restrictToWindowEdges],
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragCancel,
  useKeyboardSensor = true,
  useTouchSensor = true,
  useMouseSensor = false,
  usePointerSensor = true,
  activationDistance = 5,
  activationDelay = 0,
}) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Configure sensors
  const sensors = useSensors(
    usePointerSensor && useSensor(PointerSensor, {
      activationConstraint: {
        distance: activationDistance,
        delay: activationDelay,
      },
    }),
    useMouseSensor && useSensor(MouseSensor, {
      activationConstraint: {
        distance: activationDistance,
        delay: activationDelay,
      },
    }),
    useTouchSensor && useSensor(TouchSensor, {
      activationConstraint: {
        delay: activationDelay,
        tolerance: activationDistance,
      },
    }),
    useKeyboardSensor && useSensor(KeyboardSensor, {
      coordinateGetter: (event) => {
        const { active, context } = event;
        if (!active || !context.active) return { x: 0, y: 0 };
        
        // Get the current position
        const { x, y } = context.active.rect.current.translated || { x: 0, y: 0 };
        
        // Define the step size
        const step = event.shiftKey ? 10 : 5;
        
        switch (event.code) {
          case 'ArrowUp':
            return { x, y: y - step };
          case 'ArrowDown':
            return { x, y: y + step };
          case 'ArrowLeft':
            return { x: x - step, y };
          case 'ArrowRight':
            return { x: x + step, y };
          default:
            return { x, y };
        }
      },
    })
  );

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
    setIsDragging(true);
    
    if (onDragStart) {
      onDragStart(event);
    }
  }, [onDragStart]);

  // Handle drag over
  const handleDragOver = useCallback((event: DragOverEvent) => {
    if (onDragOver) {
      onDragOver(event);
    }
  }, [onDragOver]);

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    setIsDragging(false);
    
    if (onDragEnd) {
      onDragEnd(event);
    }
  }, [onDragEnd]);

  // Handle drag cancel
  const handleDragCancel = useCallback((event: DragCancelEvent) => {
    setActiveId(null);
    setIsDragging(false);
    
    if (onDragCancel) {
      onDragCancel(event);
    }
  }, [onDragCancel]);

  // Context value
  const startDrag = useCallback((id: UniqueIdentifier) => {
    setActiveId(id);
    setIsDragging(true);
  }, []);

  const endDrag = useCallback(() => {
    setActiveId(null);
    setIsDragging(false);
  }, []);

  const contextValue: DragDropContextValue = {
    activeId,
    isDragging,
    startDrag,
    endDrag,
  };

  return (
    <DragDropContext.Provider value={contextValue}>
      <DndKitContext
        sensors={sensors}
        modifiers={modifiers}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
      </DndKitContext>
    </DragDropContext.Provider>
  );
};

export default DragDropProvider;
