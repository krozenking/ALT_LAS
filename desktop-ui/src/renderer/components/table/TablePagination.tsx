import React from 'react';
import {
  Flex,
  Button,
  IconButton,
  Text,
  Select,
  HStack,
  Box,
  useColorMode,
  FlexProps,
} from '@chakra-ui/react';
import { useTable } from './TableContext';
import { TableActionTypes } from './types';

// Table pagination props
export interface TablePaginationProps extends FlexProps {
  /**
   * Page sizes
   */
  pageSizes?: number[];
  /**
   * Whether to show page size selector
   */
  showPageSizeSelector?: boolean;
  /**
   * Whether to show page info
   */
  showPageInfo?: boolean;
  /**
   * Whether to show first and last page buttons
   */
  showFirstLastButtons?: boolean;
  /**
   * Whether to show previous and next page buttons
   */
  showPrevNextButtons?: boolean;
  /**
   * Whether to show page buttons
   */
  showPageButtons?: boolean;
  /**
   * Maximum number of page buttons to show
   */
  maxPageButtons?: number;
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
 * Table pagination component
 */
const TablePagination: React.FC<TablePaginationProps> = ({
  pageSizes = [10, 25, 50, 100],
  showPageSizeSelector = true,
  showPageInfo = true,
  showFirstLastButtons = true,
  showPrevNextButtons = true,
  showPageButtons = true,
  maxPageButtons = 5,
  onPageChange,
  onPageSizeChange,
  ...rest
}) => {
  const { state, dispatch } = useTable();
  const { colorMode } = useColorMode();
  
  const { page, pageSize, totalRows } = state.pagination;
  const totalPages = Math.ceil(totalRows / pageSize);
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    dispatch({
      type: TableActionTypes.SET_PAGINATION,
      payload: {
        page: newPage,
      },
    });
    
    if (onPageChange) {
      onPageChange(newPage);
    }
  };
  
  // Handle page size change
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    
    dispatch({
      type: TableActionTypes.SET_PAGINATION,
      payload: {
        pageSize: newPageSize,
        page: 1, // Reset to first page when changing page size
      },
    });
    
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };
  
  // Calculate page buttons to show
  const getPageButtons = () => {
    const buttons: number[] = [];
    
    if (totalPages <= maxPageButtons) {
      // Show all pages if total pages is less than or equal to max buttons
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      // Calculate start and end page
      let startPage = Math.max(1, page - Math.floor(maxPageButtons / 2));
      let endPage = startPage + maxPageButtons - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPageButtons + 1);
      }
      
      // Add first page if not included
      if (startPage > 1) {
        buttons.push(1);
        if (startPage > 2) {
          buttons.push(-1); // -1 represents ellipsis
        }
      }
      
      // Add pages
      for (let i = startPage; i <= endPage; i++) {
        buttons.push(i);
      }
      
      // Add last page if not included
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          buttons.push(-2); // -2 represents ellipsis
        }
        buttons.push(totalPages);
      }
    }
    
    return buttons;
  };
  
  // Calculate start and end row
  const startRow = (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, totalRows);
  
  return (
    <Flex
      p={4}
      justifyContent="space-between"
      alignItems="center"
      borderTop="1px solid"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      {...rest}
    >
      {/* Page size selector */}
      {showPageSizeSelector && (
        <HStack spacing={2}>
          <Text fontSize="sm">Rows per page:</Text>
          <Select
            size="sm"
            value={pageSize}
            onChange={handlePageSizeChange}
            width="auto"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </HStack>
      )}
      
      {/* Page info */}
      {showPageInfo && (
        <Text fontSize="sm">
          {startRow}-{endRow} of {totalRows}
        </Text>
      )}
      
      {/* Pagination controls */}
      <HStack spacing={1}>
        {/* First page button */}
        {showFirstLastButtons && (
          <IconButton
            aria-label="First page"
            icon={'⏮️'}
            size="sm"
            variant="ghost"
            isDisabled={page === 1}
            onClick={() => handlePageChange(1)}
          />
        )}
        
        {/* Previous page button */}
        {showPrevNextButtons && (
          <IconButton
            aria-label="Previous page"
            icon={'◀️'}
            size="sm"
            variant="ghost"
            isDisabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
          />
        )}
        
        {/* Page buttons */}
        {showPageButtons && getPageButtons().map((pageNumber, index) => (
          <React.Fragment key={index}>
            {pageNumber < 0 ? (
              <Box px={2}>...</Box>
            ) : (
              <Button
                size="sm"
                variant={page === pageNumber ? 'solid' : 'ghost'}
                colorScheme={page === pageNumber ? 'blue' : undefined}
                onClick={() => handlePageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            )}
          </React.Fragment>
        ))}
        
        {/* Next page button */}
        {showPrevNextButtons && (
          <IconButton
            aria-label="Next page"
            icon={'▶️'}
            size="sm"
            variant="ghost"
            isDisabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
          />
        )}
        
        {/* Last page button */}
        {showFirstLastButtons && (
          <IconButton
            aria-label="Last page"
            icon={'⏭️'}
            size="sm"
            variant="ghost"
            isDisabled={page === totalPages}
            onClick={() => handlePageChange(totalPages)}
          />
        )}
      </HStack>
    </Flex>
  );
};

export default TablePagination;
