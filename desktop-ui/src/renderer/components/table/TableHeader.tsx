import React from 'react';
import {
  Th,
  ThProps,
  Flex,
  Icon,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react';
import { useTable } from './TableContext';
import { TableActionTypes, SortDirection } from './types';

// Table header props
export interface TableHeaderProps extends ThProps {
  /**
   * Column ID
   */
  columnId: string;
  /**
   * Whether the column is sortable
   */
  isSortable?: boolean;
  /**
   * Whether the column is filterable
   */
  isFilterable?: boolean;
  /**
   * Whether the column is resizable
   */
  isResizable?: boolean;
  /**
   * Whether the column is reorderable
   */
  isReorderable?: boolean;
  /**
   * Column width
   */
  width?: number | string;
  /**
   * Column minimum width
   */
  minWidth?: number;
  /**
   * Column maximum width
   */
  maxWidth?: number;
  /**
   * Column alignment
   */
  align?: 'left' | 'center' | 'right';
  /**
   * On sort change callback
   */
  onSortChange?: (columnId: string, direction: SortDirection) => void;
  /**
   * On filter change callback
   */
  onFilterChange?: (columnId: string, value: any) => void;
  /**
   * On resize callback
   */
  onResize?: (columnId: string, width: number) => void;
  /**
   * On reorder callback
   */
  onReorder?: (columnId: string, targetColumnId: string) => void;
}

/**
 * Table header component
 */
const TableHeader: React.FC<TableHeaderProps> = ({
  columnId,
  children,
  isSortable = false,
  isFilterable = false,
  isResizable = false,
  isReorderable = false,
  width,
  minWidth,
  maxWidth,
  align = 'left',
  onSortChange,
  onFilterChange,
  onResize,
  onReorder,
  ...rest
}) => {
  const { state, dispatch } = useTable();
  const { colorMode } = useColorMode();
  
  // Find current sort for this column
  const currentSort = state.sort.find((sort) => sort.id === columnId);
  const sortDirection = currentSort?.direction;
  
  // Handle sort click
  const handleSortClick = () => {
    if (!isSortable) return;
    
    let newDirection: SortDirection = 'asc';
    
    if (sortDirection === 'asc') {
      newDirection = 'desc';
    } else if (sortDirection === 'desc') {
      newDirection = 'asc';
    }
    
    const newSort = state.sort.filter((sort) => sort.id !== columnId);
    
    if (newDirection) {
      newSort.push({
        id: columnId,
        direction: newDirection,
      });
    }
    
    dispatch({
      type: TableActionTypes.SET_SORT,
      payload: newSort,
    });
    
    if (onSortChange) {
      onSortChange(columnId, newDirection);
    }
  };
  
  // Render sort icon
  const renderSortIcon = () => {
    if (!isSortable) return null;
    
    return (
      <Flex
        direction="column"
        ml={2}
        h="1em"
        w="1em"
        alignItems="center"
        justifyContent="center"
        position="relative"
      >
        {/* Up arrow */}
        <Icon
          viewBox="0 0 24 24"
          w="1em"
          h="0.5em"
          position="absolute"
          top={0}
          opacity={sortDirection === 'asc' ? 1 : 0.3}
          color={sortDirection === 'asc' ? 'blue.500' : undefined}
        >
          <path
            fill="currentColor"
            d="M7 14l5-5 5 5H7z"
          />
        </Icon>
        
        {/* Down arrow */}
        <Icon
          viewBox="0 0 24 24"
          w="1em"
          h="0.5em"
          position="absolute"
          bottom={0}
          opacity={sortDirection === 'desc' ? 1 : 0.3}
          color={sortDirection === 'desc' ? 'blue.500' : undefined}
        >
          <path
            fill="currentColor"
            d="M7 10l5 5 5-5H7z"
          />
        </Icon>
      </Flex>
    );
  };
  
  // Render resize handle
  const renderResizeHandle = () => {
    if (!isResizable) return null;
    
    return (
      <Box
        position="absolute"
        right={0}
        top={0}
        bottom={0}
        width="4px"
        cursor="col-resize"
        userSelect="none"
        _hover={{
          backgroundColor: colorMode === 'light' ? 'blue.500' : 'blue.300',
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          
          const startX = e.clientX;
          const startWidth = width ? parseFloat(width.toString()) : 0;
          
          const handleMouseMove = (moveEvent: MouseEvent) => {
            const newWidth = startWidth + (moveEvent.clientX - startX);
            
            if (onResize) {
              onResize(columnId, newWidth);
            }
          };
          
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      />
    );
  };
  
  return (
    <Th
      position="relative"
      width={width}
      minWidth={minWidth}
      maxWidth={maxWidth}
      textAlign={align}
      cursor={isSortable ? 'pointer' : undefined}
      userSelect="none"
      onClick={handleSortClick}
      {...rest}
    >
      <Flex alignItems="center" justifyContent={align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'}>
        {children}
        {renderSortIcon()}
      </Flex>
      
      {renderResizeHandle()}
    </Th>
  );
};

// Box component for resize handle
const Box: React.FC<{
  position: string;
  right: number;
  top: number;
  bottom: number;
  width: string;
  cursor: string;
  userSelect: string;
  _hover: { backgroundColor: string };
  onMouseDown: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}> = ({ position, right, top, bottom, width, cursor, userSelect, _hover, onMouseDown, children }) => {
  return (
    <div
      style={{
        position: position as any,
        right,
        top,
        bottom,
        width,
        cursor,
        userSelect: userSelect as any,
      }}
      onMouseDown={onMouseDown}
    >
      {children}
    </div>
  );
};

export default TableHeader;
