import React, { useState } from 'react';
import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Tooltip,
  HStack,
  Heading,
  useColorMode,
  FlexProps,
} from '@chakra-ui/react';
import { useTable } from './TableContext';
import { TableActionTypes } from './types';

// Table toolbar props
export interface TableToolbarProps extends FlexProps {
  /**
   * Table title
   */
  title?: string;
  /**
   * Whether to show search input
   */
  showSearch?: boolean;
  /**
   * Search placeholder
   */
  searchPlaceholder?: string;
  /**
   * Whether to show column visibility menu
   */
  showColumnVisibility?: boolean;
  /**
   * Whether to show export button
   */
  showExport?: boolean;
  /**
   * Whether to show import button
   */
  showImport?: boolean;
  /**
   * Whether to show print button
   */
  showPrint?: boolean;
  /**
   * Whether to show fullscreen button
   */
  showFullscreen?: boolean;
  /**
   * Whether to show refresh button
   */
  showRefresh?: boolean;
  /**
   * Whether to show density menu
   */
  showDensity?: boolean;
  /**
   * Whether to show filter button
   */
  showFilter?: boolean;
  /**
   * Whether to show clear filters button
   */
  showClearFilters?: boolean;
  /**
   * Whether to show selection actions
   */
  showSelectionActions?: boolean;
  /**
   * Custom actions
   */
  actions?: React.ReactNode;
  /**
   * On search change callback
   */
  onSearchChange?: (value: string) => void;
  /**
   * On export click callback
   */
  onExportClick?: () => void;
  /**
   * On import click callback
   */
  onImportClick?: () => void;
  /**
   * On print click callback
   */
  onPrintClick?: () => void;
  /**
   * On fullscreen click callback
   */
  onFullscreenClick?: () => void;
  /**
   * On refresh click callback
   */
  onRefreshClick?: () => void;
  /**
   * On density change callback
   */
  onDensityChange?: (density: 'compact' | 'normal' | 'comfortable') => void;
  /**
   * On filter click callback
   */
  onFilterClick?: () => void;
  /**
   * On clear filters click callback
   */
  onClearFiltersClick?: () => void;
  /**
   * On selection action click callback
   */
  onSelectionActionClick?: (action: string) => void;
}

/**
 * Table toolbar component
 */
const TableToolbar: React.FC<TableToolbarProps> = ({
  title,
  showSearch = true,
  searchPlaceholder = 'Search...',
  showColumnVisibility = true,
  showExport = true,
  showImport = false,
  showPrint = false,
  showFullscreen = true,
  showRefresh = true,
  showDensity = true,
  showFilter = true,
  showClearFilters = true,
  showSelectionActions = true,
  actions,
  onSearchChange,
  onExportClick,
  onImportClick,
  onPrintClick,
  onFullscreenClick,
  onRefreshClick,
  onDensityChange,
  onFilterClick,
  onClearFiltersClick,
  onSelectionActionClick,
  ...rest
}) => {
  const { state, dispatch } = useTable();
  const { colorMode } = useColorMode();
  const [searchValue, setSearchValue] = useState('');
  
  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    
    if (onSearchChange) {
      onSearchChange(value);
    }
  };
  
  // Handle column visibility toggle
  const handleColumnVisibilityToggle = (columnId: string) => {
    const newColumns = state.columns.map((column) => {
      if (column.id === columnId) {
        return {
          ...column,
          hidden: !column.hidden,
        };
      }
      return column;
    });
    
    dispatch({
      type: TableActionTypes.SET_COLUMNS,
      payload: newColumns,
    });
  };
  
  // Handle clear filters
  const handleClearFilters = () => {
    dispatch({
      type: TableActionTypes.SET_FILTERS,
      payload: [],
    });
    
    if (onClearFiltersClick) {
      onClearFiltersClick();
    }
  };
  
  // Check if any filters are applied
  const hasFilters = state.filters.length > 0;
  
  // Check if any rows are selected
  const hasSelection = state.selection.selectedRows.length > 0;
  
  return (
    <Flex
      p={4}
      justifyContent="space-between"
      alignItems="center"
      borderBottom="1px solid"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      {...rest}
    >
      {/* Left section */}
      <HStack spacing={4}>
        {/* Title */}
        {title && (
          <Heading size="md">{title}</Heading>
        )}
        
        {/* Search input */}
        {showSearch && (
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              🔍
            </InputLeftElement>
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchChange}
              size="md"
            />
          </InputGroup>
        )}
      </HStack>
      
      {/* Right section */}
      <HStack spacing={2}>
        {/* Selection actions */}
        {showSelectionActions && hasSelection && (
          <HStack spacing={2} mr={2}>
            <Text fontSize="sm">
              {state.selection.selectedRows.length} selected
            </Text>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSelectionActionClick?.('delete')}
            >
              Delete
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSelectionActionClick?.('edit')}
            >
              Edit
            </Button>
          </HStack>
        )}
        
        {/* Custom actions */}
        {actions}
        
        {/* Filter button */}
        {showFilter && (
          <Tooltip label="Filter">
            <IconButton
              aria-label="Filter"
              icon={'🔍'}
              size="sm"
              variant="ghost"
              onClick={onFilterClick}
            />
          </Tooltip>
        )}
        
        {/* Clear filters button */}
        {showClearFilters && hasFilters && (
          <Tooltip label="Clear filters">
            <IconButton
              aria-label="Clear filters"
              icon={'🧹'}
              size="sm"
              variant="ghost"
              onClick={handleClearFilters}
            />
          </Tooltip>
        )}
        
        {/* Column visibility menu */}
        {showColumnVisibility && (
          <Menu closeOnSelect={false}>
            <Tooltip label="Column visibility">
              <MenuButton
                as={IconButton}
                aria-label="Column visibility"
                icon={'👁️'}
                size="sm"
                variant="ghost"
              />
            </Tooltip>
            <MenuList>
              {state.columns.map((column) => (
                <MenuItem
                  key={column.id}
                  onClick={() => handleColumnVisibilityToggle(column.id)}
                >
                  <input
                    type="checkbox"
                    checked={!column.hidden}
                    readOnly
                    style={{ marginRight: '8px' }}
                  />
                  {column.header}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        )}
        
        {/* Density menu */}
        {showDensity && (
          <Menu>
            <Tooltip label="Density">
              <MenuButton
                as={IconButton}
                aria-label="Density"
                icon={'📏'}
                size="sm"
                variant="ghost"
              />
            </Tooltip>
            <MenuList>
              <MenuItem onClick={() => onDensityChange?.('compact')}>
                Compact
              </MenuItem>
              <MenuItem onClick={() => onDensityChange?.('normal')}>
                Normal
              </MenuItem>
              <MenuItem onClick={() => onDensityChange?.('comfortable')}>
                Comfortable
              </MenuItem>
            </MenuList>
          </Menu>
        )}
        
        {/* Export button */}
        {showExport && (
          <Menu>
            <Tooltip label="Export">
              <MenuButton
                as={IconButton}
                aria-label="Export"
                icon={'📤'}
                size="sm"
                variant="ghost"
              />
            </Tooltip>
            <MenuList>
              <MenuItem onClick={() => onExportClick?.()}>
                Export as CSV
              </MenuItem>
              <MenuItem onClick={() => onExportClick?.()}>
                Export as Excel
              </MenuItem>
              <MenuItem onClick={() => onExportClick?.()}>
                Export as PDF
              </MenuItem>
            </MenuList>
          </Menu>
        )}
        
        {/* Import button */}
        {showImport && (
          <Tooltip label="Import">
            <IconButton
              aria-label="Import"
              icon={'📥'}
              size="sm"
              variant="ghost"
              onClick={onImportClick}
            />
          </Tooltip>
        )}
        
        {/* Print button */}
        {showPrint && (
          <Tooltip label="Print">
            <IconButton
              aria-label="Print"
              icon={'🖨️'}
              size="sm"
              variant="ghost"
              onClick={onPrintClick}
            />
          </Tooltip>
        )}
        
        {/* Refresh button */}
        {showRefresh && (
          <Tooltip label="Refresh">
            <IconButton
              aria-label="Refresh"
              icon={'🔄'}
              size="sm"
              variant="ghost"
              onClick={onRefreshClick}
            />
          </Tooltip>
        )}
        
        {/* Fullscreen button */}
        {showFullscreen && (
          <Tooltip label="Fullscreen">
            <IconButton
              aria-label="Fullscreen"
              icon={'⛶'}
              size="sm"
              variant="ghost"
              onClick={onFullscreenClick}
            />
          </Tooltip>
        )}
      </HStack>
    </Flex>
  );
};

// Text component for selection count
const Text: React.FC<{
  fontSize: string;
  children: React.ReactNode;
}> = ({ fontSize, children }) => {
  return (
    <div style={{ fontSize }}>
      {children}
    </div>
  );
};

export default TableToolbar;
