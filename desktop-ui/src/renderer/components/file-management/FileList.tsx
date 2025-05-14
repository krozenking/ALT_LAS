import React, { useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  useColorMode,
  BoxProps,
} from '@chakra-ui/react';
import { glassmorphism } from '../../styles/themes/creator';

// File type
export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: Date;
  url?: string;
  thumbnailUrl?: string;
}

// File list props
export interface FileListProps extends BoxProps {
  /**
   * Files
   */
  files: FileItem[];
  /**
   * Whether to show file thumbnail
   */
  showThumbnail?: boolean;
  /**
   * Whether to show file size
   */
  showSize?: boolean;
  /**
   * Whether to show file type
   */
  showType?: boolean;
  /**
   * Whether to show file last modified date
   */
  showLastModified?: boolean;
  /**
   * Whether to show file actions
   */
  showActions?: boolean;
  /**
   * Whether to show file selection
   */
  showSelection?: boolean;
  /**
   * Whether to show file search
   */
  showSearch?: boolean;
  /**
   * Whether to show file sort
   */
  showSort?: boolean;
  /**
   * Whether to show file filter
   */
  showFilter?: boolean;
  /**
   * Whether to show file toolbar
   */
  showToolbar?: boolean;
  /**
   * Whether to show file pagination
   */
  showPagination?: boolean;
  /**
   * On file select callback
   */
  onFileSelect?: (file: FileItem) => void;
  /**
   * On file download callback
   */
  onFileDownload?: (file: FileItem) => void;
  /**
   * On file view callback
   */
  onFileView?: (file: FileItem) => void;
  /**
   * On file delete callback
   */
  onFileDelete?: (file: FileItem) => void;
  /**
   * On file selection change callback
   */
  onSelectionChange?: (selectedFiles: FileItem[]) => void;
  /**
   * On file search callback
   */
  onSearch?: (searchTerm: string) => void;
  /**
   * On file sort callback
   */
  onSort?: (sortField: string, sortDirection: 'asc' | 'desc') => void;
  /**
   * On file filter callback
   */
  onFilter?: (filterField: string, filterValue: string) => void;
}

/**
 * File list component
 */
const FileList: React.FC<FileListProps> = ({
  files,
  showThumbnail = true,
  showSize = true,
  showType = true,
  showLastModified = true,
  showActions = true,
  showSelection = true,
  showSearch = true,
  showSort = true,
  showFilter = true,
  showToolbar = true,
  showPagination = true,
  onFileSelect,
  onFileDownload,
  onFileView,
  onFileDelete,
  onSelectionChange,
  onSearch,
  onSort,
  onFilter,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterField, setFilterField] = useState<string>('type');
  const [filterValue, setFilterValue] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Handle file selection
  const handleFileSelection = (file: FileItem) => {
    const isSelected = selectedFiles.some(f => f.id === file.id);
    let newSelectedFiles: FileItem[];
    
    if (isSelected) {
      newSelectedFiles = selectedFiles.filter(f => f.id !== file.id);
    } else {
      newSelectedFiles = [...selectedFiles, file];
    }
    
    setSelectedFiles(newSelectedFiles);
    
    if (onSelectionChange) {
      onSelectionChange(newSelectedFiles);
    }
  };
  
  // Handle select all
  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles([...files]);
    }
    
    if (onSelectionChange) {
      onSelectionChange(selectedFiles.length === files.length ? [] : [...files]);
    }
  };
  
  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    if (onSearch) {
      onSearch(value);
    }
  };
  
  // Handle sort
  const handleSort = (field: string) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    if (onSort) {
      onSort(field, newDirection);
    }
  };
  
  // Handle filter
  const handleFilterFieldChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterField(event.target.value);
  };
  
  const handleFilterValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilterValue(value);
    
    if (onFilter) {
      onFilter(filterField, value);
    }
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle page size change
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };
  
  // Filter and sort files
  const filteredFiles = files.filter(file => {
    if (!filterValue) return true;
    
    switch (filterField) {
      case 'name':
        return file.name.toLowerCase().includes(filterValue.toLowerCase());
      case 'type':
        return file.type.toLowerCase().includes(filterValue.toLowerCase());
      default:
        return true;
    }
  }).filter(file => {
    if (!searchTerm) return true;
    return file.name.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'lastModified':
        comparison = a.lastModified.getTime() - b.lastModified.getTime();
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Paginate files
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredFiles.length / pageSize);
  
  return (
    <Box {...glassStyle} borderRadius="md" overflow="hidden" {...rest}>
      {/* Toolbar */}
      {showToolbar && (
        <Flex
          p={4}
          justifyContent="space-between"
          alignItems="center"
          borderBottomWidth="1px"
          borderBottomColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
        >
          {/* Left section */}
          <Flex alignItems="center">
            {/* Selection actions */}
            {showSelection && selectedFiles.length > 0 && (
              <Flex alignItems="center" mr={4}>
                <Text fontSize="sm" mr={2}>
                  {selectedFiles.length} selected
                </Text>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (onFileDownload && selectedFiles.length > 0) {
                      selectedFiles.forEach(file => onFileDownload(file));
                    }
                  }}
                  mr={1}
                >
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => {
                    if (onFileDelete && selectedFiles.length > 0) {
                      selectedFiles.forEach(file => onFileDelete(file));
                      setSelectedFiles([]);
                    }
                  }}
                >
                  Delete
                </Button>
              </Flex>
            )}
            
            {/* Filter */}
            {showFilter && (
              <Flex alignItems="center" mr={4}>
                <Select
                  size="sm"
                  value={filterField}
                  onChange={handleFilterFieldChange}
                  mr={2}
                  width="auto"
                >
                  <option value="name">Name</option>
                  <option value="type">Type</option>
                </Select>
                <Input
                  size="sm"
                  placeholder="Filter..."
                  value={filterValue}
                  onChange={handleFilterValueChange}
                  width="auto"
                />
              </Flex>
            )}
          </Flex>
          
          {/* Right section */}
          <Flex alignItems="center">
            {/* Search */}
            {showSearch && (
              <InputGroup size="sm" width="auto" mr={4}>
                <InputLeftElement pointerEvents="none">
                  🔍
                </InputLeftElement>
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </InputGroup>
            )}
            
            {/* Sort */}
            {showSort && (
              <Select
                size="sm"
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSortField(field);
                  setSortDirection(direction as 'asc' | 'desc');
                  
                  if (onSort) {
                    onSort(field, direction as 'asc' | 'desc');
                  }
                }}
                width="auto"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="type-asc">Type (A-Z)</option>
                <option value="type-desc">Type (Z-A)</option>
                <option value="size-asc">Size (Small-Large)</option>
                <option value="size-desc">Size (Large-Small)</option>
                <option value="lastModified-asc">Date (Old-New)</option>
                <option value="lastModified-desc">Date (New-Old)</option>
              </Select>
            )}
          </Flex>
        </Flex>
      )}
      
      {/* File list */}
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            {/* Selection checkbox */}
            {showSelection && (
              <Th width="40px" px={2}>
                <Checkbox
                  isChecked={selectedFiles.length === files.length && files.length > 0}
                  isIndeterminate={selectedFiles.length > 0 && selectedFiles.length < files.length}
                  onChange={handleSelectAll}
                />
              </Th>
            )}
            
            {/* Thumbnail */}
            {showThumbnail && (
              <Th width="60px">Thumbnail</Th>
            )}
            
            {/* Name */}
            <Th
              cursor="pointer"
              onClick={() => handleSort('name')}
            >
              Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Th>
            
            {/* Type */}
            {showType && (
              <Th
                cursor="pointer"
                onClick={() => handleSort('type')}
              >
                Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
            )}
            
            {/* Size */}
            {showSize && (
              <Th
                cursor="pointer"
                onClick={() => handleSort('size')}
              >
                Size {sortField === 'size' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
            )}
            
            {/* Last modified */}
            {showLastModified && (
              <Th
                cursor="pointer"
                onClick={() => handleSort('lastModified')}
              >
                Last Modified {sortField === 'lastModified' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
            )}
            
            {/* Actions */}
            {showActions && (
              <Th width="120px">Actions</Th>
            )}
          </Tr>
        </Thead>
        <Tbody>
          {paginatedFiles.length === 0 ? (
            <Tr>
              <Td colSpan={
                (showSelection ? 1 : 0) +
                (showThumbnail ? 1 : 0) +
                1 + // Name column is always shown
                (showType ? 1 : 0) +
                (showSize ? 1 : 0) +
                (showLastModified ? 1 : 0) +
                (showActions ? 1 : 0)
              }>
                <Text textAlign="center" py={4}>
                  No files found
                </Text>
              </Td>
            </Tr>
          ) : (
            paginatedFiles.map(file => (
              <Tr
                key={file.id}
                _hover={{ bg: colorMode === 'light' ? 'gray.50' : 'gray.700' }}
                cursor={onFileSelect ? 'pointer' : undefined}
                onClick={() => onFileSelect && onFileSelect(file)}
              >
                {/* Selection checkbox */}
                {showSelection && (
                  <Td px={2}>
                    <Checkbox
                      isChecked={selectedFiles.some(f => f.id === file.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleFileSelection(file);
                      }}
                    />
                  </Td>
                )}
                
                {/* Thumbnail */}
                {showThumbnail && (
                  <Td>
                    {file.thumbnailUrl ? (
                      <Box
                        width="40px"
                        height="40px"
                        borderRadius="md"
                        overflow="hidden"
                        bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
                      >
                        <img
                          src={file.thumbnailUrl}
                          alt={file.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                    ) : (
                      <Box
                        width="40px"
                        height="40px"
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
                        fontSize="xl"
                      >
                        {file.type.startsWith('image/') ? '🖼️' :
                          file.type.startsWith('video/') ? '🎬' :
                          file.type.startsWith('audio/') ? '🎵' :
                          file.type === 'application/pdf' ? '📄' :
                          file.type.includes('word') ? '📝' :
                          file.type.includes('excel') || file.type.includes('spreadsheet') ? '📊' :
                          file.type.includes('presentation') || file.type.includes('powerpoint') ? '📊' :
                          file.type.includes('zip') || file.type.includes('compressed') ? '🗜️' :
                          '📄'}
                      </Box>
                    )}
                  </Td>
                )}
                
                {/* Name */}
                <Td>
                  <Text fontWeight="medium" noOfLines={1}>
                    {file.name}
                  </Text>
                </Td>
                
                {/* Type */}
                {showType && (
                  <Td>
                    <Text fontSize="sm" noOfLines={1}>
                      {file.type}
                    </Text>
                  </Td>
                )}
                
                {/* Size */}
                {showSize && (
                  <Td>
                    <Text fontSize="sm">
                      {formatFileSize(file.size)}
                    </Text>
                  </Td>
                )}
                
                {/* Last modified */}
                {showLastModified && (
                  <Td>
                    <Text fontSize="sm">
                      {formatDate(file.lastModified)}
                    </Text>
                  </Td>
                )}
                
                {/* Actions */}
                {showActions && (
                  <Td>
                    <Flex>
                      {onFileView && (
                        <IconButton
                          aria-label="View file"
                          icon={'👁️'}
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onFileView(file);
                          }}
                          mr={1}
                        />
                      )}
                      
                      {onFileDownload && (
                        <IconButton
                          aria-label="Download file"
                          icon={'⬇️'}
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onFileDownload(file);
                          }}
                          mr={1}
                        />
                      )}
                      
                      {onFileDelete && (
                        <IconButton
                          aria-label="Delete file"
                          icon={'🗑️'}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            onFileDelete(file);
                          }}
                        />
                      )}
                    </Flex>
                  </Td>
                )}
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
      
      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <Flex
          p={4}
          justifyContent="space-between"
          alignItems="center"
          borderTopWidth="1px"
          borderTopColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
        >
          <Flex alignItems="center">
            <Text fontSize="sm" mr={2}>
              Rows per page:
            </Text>
            <Select
              size="sm"
              value={pageSize}
              onChange={handlePageSizeChange}
              width="auto"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Select>
          </Flex>
          
          <Flex alignItems="center">
            <Text fontSize="sm" mr={4}>
              {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredFiles.length)} of {filteredFiles.length}
            </Text>
            
            <IconButton
              aria-label="First page"
              icon={'⏮️'}
              size="sm"
              variant="ghost"
              isDisabled={currentPage === 1}
              onClick={() => handlePageChange(1)}
              mr={1}
            />
            
            <IconButton
              aria-label="Previous page"
              icon={'◀️'}
              size="sm"
              variant="ghost"
              isDisabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              mr={1}
            />
            
            <IconButton
              aria-label="Next page"
              icon={'▶️'}
              size="sm"
              variant="ghost"
              isDisabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              mr={1}
            />
            
            <IconButton
              aria-label="Last page"
              icon={'⏭️'}
              size="sm"
              variant="ghost"
              isDisabled={currentPage === totalPages}
              onClick={() => handlePageChange(totalPages)}
            />
          </Flex>
        </Flex>
      )}
    </Box>
  );
};

export default FileList;
