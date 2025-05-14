import React, { useEffect } from 'react';
import {
  Box,
  Table as ChakraTable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
  BoxProps,
  useColorMode,
} from '@chakra-ui/react';
import { TableProvider, useTable } from './TableContext';
import { TableColumn, TableActionTypes } from './types';
import { glassmorphism } from '../../styles/themes/creator';

// Table props
export interface TableProps<T = any> extends Omit<BoxProps, 'children'> {
  /**
   * Table columns
   */
  columns: TableColumn<T>[];
  /**
   * Table data
   */
  data: T[];
  /**
   * Whether to use glassmorphism effect
   */
  useGlassmorphism?: boolean;
  /**
   * Whether to show loading spinner
   */
  isLoading?: boolean;
  /**
   * Whether to show error message
   */
  isError?: boolean;
  /**
   * Error message
   */
  errorMessage?: string;
  /**
   * Whether to show empty message
   */
  isEmpty?: boolean;
  /**
   * Empty message
   */
  emptyMessage?: string;
  /**
   * Whether to use striped rows
   */
  isStriped?: boolean;
  /**
   * Whether to use hover effect
   */
  isHoverable?: boolean;
  /**
   * Whether to use bordered table
   */
  isBordered?: boolean;
  /**
   * Whether to use compact table
   */
  isCompact?: boolean;
  /**
   * Whether to use sticky header
   */
  isStickyHeader?: boolean;
  /**
   * Whether to use sortable columns
   */
  isSortable?: boolean;
  /**
   * Whether to use filterable columns
   */
  isFilterable?: boolean;
  /**
   * Whether to use selectable rows
   */
  isSelectable?: boolean;
  /**
   * Whether to use pagination
   */
  isPaginated?: boolean;
  /**
   * Whether to use resizable columns
   */
  isResizable?: boolean;
  /**
   * Whether to use reorderable columns
   */
  isReorderable?: boolean;
  /**
   * Whether to use expandable rows
   */
  isExpandable?: boolean;
  /**
   * Whether to use groupable rows
   */
  isGroupable?: boolean;
  /**
   * Whether to use editable cells
   */
  isEditable?: boolean;
  /**
   * Whether to use exportable table
   */
  isExportable?: boolean;
  /**
   * Whether to use importable table
   */
  isImportable?: boolean;
  /**
   * Whether to use printable table
   */
  isPrintable?: boolean;
  /**
   * Whether to use fullscreen table
   */
  isFullscreenable?: boolean;
  /**
   * Whether to use virtualized table
   */
  isVirtualized?: boolean;
  /**
   * Whether to use responsive table
   */
  isResponsive?: boolean;
  /**
   * Whether to use fixed layout
   */
  isFixedLayout?: boolean;
  /**
   * Table size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Table variant
   */
  variant?: 'simple' | 'striped' | 'unstyled';
  /**
   * Table color scheme
   */
  colorScheme?: string;
  /**
   * Table caption
   */
  caption?: React.ReactNode;
  /**
   * Table footer
   */
  footer?: React.ReactNode;
  /**
   * Table toolbar
   */
  toolbar?: React.ReactNode;
  /**
   * Table pagination
   */
  pagination?: React.ReactNode;
  /**
   * On row click callback
   */
  onRowClick?: (row: T, index: number) => void;
  /**
   * On cell click callback
   */
  onCellClick?: (value: any, row: T, columnId: string, index: number) => void;
  /**
   * On sort change callback
   */
  onSortChange?: (columnId: string, direction: 'asc' | 'desc') => void;
  /**
   * On filter change callback
   */
  onFilterChange?: (columnId: string, value: any) => void;
  /**
   * On selection change callback
   */
  onSelectionChange?: (selectedRows: T[], selectedRowIndices: number[]) => void;
  /**
   * On page change callback
   */
  onPageChange?: (page: number) => void;
  /**
   * On page size change callback
   */
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * Table inner component
 */
const TableInner = <T extends object>({
  useGlassmorphism = true,
  isStriped = true,
  isHoverable = true,
  isBordered = false,
  isCompact = false,
  isStickyHeader = false,
  size = 'md',
  variant = 'simple',
  colorScheme,
  caption,
  footer,
  toolbar,
  pagination,
  onRowClick,
  onCellClick,
  ...rest
}: Omit<TableProps<T>, 'columns' | 'data'>) => {
  const { state } = useTable();
  const { colorMode } = useColorMode();
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = useGlassmorphism
    ? colorMode === 'light'
      ? glassmorphism.create(0.7, 10, 1)
      : glassmorphism.createDark(0.7, 10, 1)
    : {};
  
  // Render loading state
  if (state.loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="200px"
        width="100%"
        {...glassStyle}
        {...rest}
      >
        <Spinner size="xl" color={colorMode === 'light' ? 'blue.500' : 'blue.300'} />
      </Box>
    );
  }
  
  // Render error state
  if (state.error) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="200px"
        width="100%"
        {...glassStyle}
        {...rest}
      >
        <Text color={colorMode === 'light' ? 'red.500' : 'red.300'} fontSize="lg" fontWeight="medium">
          {state.error.message || 'An error occurred while loading the table.'}
        </Text>
      </Box>
    );
  }
  
  // Render empty state
  if (state.data.length === 0) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="200px"
        width="100%"
        {...glassStyle}
        {...rest}
      >
        <Text color={colorMode === 'light' ? 'gray.500' : 'gray.400'} fontSize="lg" fontWeight="medium">
          No data available.
        </Text>
      </Box>
    );
  }
  
  return (
    <Box
      width="100%"
      overflow="auto"
      borderRadius="md"
      {...glassStyle}
      {...rest}
    >
      {toolbar}
      
      <ChakraTable
        size={size}
        variant={variant}
        colorScheme={colorScheme}
        layout={rest.isFixedLayout ? 'fixed' : 'auto'}
      >
        {caption && <caption>{caption}</caption>}
        
        <Thead position={isStickyHeader ? 'sticky' : undefined} top={0} zIndex={1} bg={colorMode === 'light' ? 'white' : 'gray.800'}>
          <Tr>
            {state.columns.map((column) => (
              <Th
                key={column.id}
                width={column.width}
                textAlign={column.align}
                hidden={column.hidden}
              >
                {column.header}
              </Th>
            ))}
          </Tr>
        </Thead>
        
        <Tbody>
          {state.data.map((row, rowIndex) => (
            <Tr
              key={rowIndex}
              onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
              cursor={onRowClick ? 'pointer' : undefined}
              _hover={isHoverable ? { bg: colorMode === 'light' ? 'gray.50' : 'gray.700' } : undefined}
              bg={isStriped && rowIndex % 2 === 1 ? (colorMode === 'light' ? 'gray.50' : 'gray.700') : undefined}
            >
              {state.columns.map((column) => (
                <Td
                  key={`${rowIndex}-${column.id}`}
                  textAlign={column.align}
                  hidden={column.hidden}
                  onClick={onCellClick ? (e) => {
                    e.stopPropagation();
                    const value = typeof column.accessor === 'function'
                      ? column.accessor(row)
                      : column.accessor
                        ? row[column.accessor as keyof T]
                        : undefined;
                    onCellClick(value, row, column.id, rowIndex);
                  } : undefined}
                  cursor={onCellClick ? 'pointer' : undefined}
                >
                  {column.cell
                    ? column.cell(
                        typeof column.accessor === 'function'
                          ? column.accessor(row)
                          : column.accessor
                            ? row[column.accessor as keyof T]
                            : undefined,
                        row,
                        rowIndex
                      )
                    : typeof column.accessor === 'function'
                      ? column.accessor(row)
                      : column.accessor
                        ? row[column.accessor as keyof T]
                        : undefined}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </ChakraTable>
      
      {footer}
      {pagination}
    </Box>
  );
};

/**
 * Table component
 */
const Table = <T extends object>({
  columns,
  data,
  ...rest
}: TableProps<T>) => {
  const initialState = {
    columns,
    data,
  };
  
  return (
    <TableProvider initialState={initialState}>
      <TableInner {...rest} />
    </TableProvider>
  );
};

export default Table;
