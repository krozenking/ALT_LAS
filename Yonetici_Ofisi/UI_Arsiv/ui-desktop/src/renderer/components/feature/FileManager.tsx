import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  useColorMode, 
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  HStack,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VisuallyHidden,
  useFocusOnShow,
  useFocusOnHide,
  useDimensions // Import useDimensions to get container size
} from '@chakra-ui/react';
import { FixedSizeList, FixedSizeGrid } from 'react-window'; // Import virtual list components
import AutoSizer from 'react-virtualized-auto-sizer'; // Import AutoSizer
import { animations } from '@/styles/animations';

// Dosya türleri
export type FileType = 'image' | 'document' | 'code' | 'video' | 'audio' | 'other';

// Dosya nesnesi arayüzü
export interface FileObject {
  id: string;
  name: string;
  type: FileType;
  size: number; // bytes cinsinden
  lastModified: Date;
  path: string;
  favorite: boolean;
  tags: string[];
  thumbnail?: string;
}

// Dosya yöneticisi özellikleri
interface FileManagerProps {
  initialFiles?: FileObject[];
  onFileOpen?: (file: FileObject) => void;
  onFileDelete?: (file: FileObject) => void;
  onFileRename?: (file: FileObject, newName: string) => void;
  onFileFavorite?: (file: FileObject, isFavorite: boolean) => void;
  onFileTagAdd?: (file: FileObject, tag: string) => void;
  onFileTagRemove?: (file: FileObject, tag: string) => void;
}

// Dosya boyutunu formatla - Memoize edilebilir bir fonksiyon
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

// Dosya türüne göre ikon getir - Memoize edilebilir bir fonksiyon
const getFileTypeIcon = (type: FileType): string => {
  switch (type) {
    case 'image': return '🖼️';
    case 'document': return '📄';
    case 'code': return '📝';
    case 'video': return '🎬';
    case 'audio': return '🎵';
    case 'other':
    default: return '📁';
  }
};

// Tarih formatla - Memoize edilebilir bir fonksiyon
const formatDate = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Az önce';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} dakika önce`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} saat önce`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} gün önce`;
  }
};

// Memoize edilmiş FileItem bileşeni (Grid görünümü için)
const FileGridItem = memo(({ 
  columnIndex, // Add columnIndex
  rowIndex, // Add rowIndex
  style, // Add style prop from react-window
  data // Add data prop
}: { 
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties; // Style prop for positioning
  data: { 
    files: FileObject[]; 
    columnCount: number; 
    selectedFileId: string | null; 
    colorMode: string; 
    onSelect: (file: FileObject) => void; 
    onOpen: (file: FileObject) => void; 
  }
}) => {
  const { files, columnCount, selectedFileId, colorMode, onSelect, onOpen } = data;
  const index = rowIndex * columnCount + columnIndex;
  const file = files[index];

  // If there's no file for this index, render nothing
  if (!file) {
    return null;
  }

  const isSelected = selectedFileId === file.id;

  // Dosya türü ikonunu memoize et
  const fileIcon = useMemo(() => getFileTypeIcon(file.type), [file.type]);
  
  // Dosya boyutunu memoize et
  const fileSize = useMemo(() => formatFileSize(file.size), [file.size]);
  
  // Olay işleyicilerini memoize et
  const handleClick = useCallback(() => onSelect(file), [file, onSelect]);
  const handleDoubleClick = useCallback(() => onOpen(file), [file, onOpen]);
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onSelect(file);
      e.preventDefault();
    }
    // Add arrow key navigation logic if needed within the grid container
  }, [file, onSelect]);
  
  return (
    <Box
      style={style} // Apply style for positioning
      key={file.id} // Keep key for React reconciliation
      p={3} // Padding inside the cell
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      role="gridcell" // Use gridcell role
      aria-selected={isSelected} // Indicate selection state
      aria-label={`Dosya: ${file.name}, Boyut: ${fileSize}`}
      tabIndex={0} // Make focusable
    >
      {/* Inner content box for styling */}
      <Box
        width="100%" // Take full width of the cell
        height="100%" // Take full height of the cell
        borderWidth="1px"
        borderRadius="md"
        borderColor={isSelected ? 'blue.500' : 'transparent'}
        bg={colorMode === 'light' ? 'white' : 'gray.700'}
        boxShadow="sm"
        cursor="pointer"
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown} // Add keyboard handler
        _hover={{ boxShadow: 'md', borderColor: 'blue.300' }}
        _focus={{ 
          outline: 'none',
          boxShadow: 'outline',
          borderColor: 'blue.500'
        }}
        transition="all 0.2s"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        position="relative" // Keep relative for absolute positioned elements like favorite star
        {...animations.performanceUtils.forceGPU}
      >
        {file.favorite && (
          <Box 
            position="absolute" 
            top="2" 
            right="2" 
            fontSize="sm"
            aria-label="Favori dosya"
          >
            ⭐
          </Box>
        )}
        <Box fontSize="3xl" mb={2} aria-hidden="true">
          {fileIcon}
        </Box>
        <Text 
          fontSize="sm" 
          fontWeight="medium" 
          textAlign="center"
          noOfLines={2}
          px={1} // Add some padding for text
        >
          {file.name}
        </Text>
        <Text fontSize="xs" color="gray.500" mt={1}>
          {fileSize}
        </Text>
      </Box>
    </Box>
  );
});

// Memoize edilmiş FileItem bileşeni (Liste görünümü için)
const FileListItem = memo(({ 
  index, // Add index
  style, // Add style prop from react-window
  data // Add data prop
}: { 
  index: number;
  style: React.CSSProperties; // Style prop for positioning
  data: { 
    files: FileObject[]; 
    selectedFileId: string | null; 
    colorMode: string; 
    onSelect: (file: FileObject) => void; 
    onOpen: (file: FileObject) => void;
    onRename: (file: FileObject) => void;
    onToggleFavorite: (file: FileObject) => void;
    onDelete: (file: FileObject) => void;
  }
}) => {
  const { files, selectedFileId, colorMode, onSelect, onOpen, onRename, onToggleFavorite, onDelete } = data;
  const file = files[index];
  const isSelected = selectedFileId === file.id;

  // Dosya türü ikonunu memoize et
  const fileIcon = useMemo(() => getFileTypeIcon(file.type), [file.type]);
  
  // Dosya boyutunu memoize et
  const fileSize = useMemo(() => formatFileSize(file.size), [file.size]);
  
  // Dosya tarihini memoize et
  const fileDate = useMemo(() => formatDate(file.lastModified), [file.lastModified]);
  
  // Olay işleyicilerini memoize et
  const handleClick = useCallback(() => onSelect(file), [file, onSelect]);
  const handleDoubleClick = useCallback(() => onOpen(file), [file, onOpen]);
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onSelect(file);
      e.preventDefault();
    }
    // Add arrow key navigation logic if needed within the list container
  }, [file, onSelect]);
  const handleRename = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRename(file);
  }, [file, onRename]);
  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(file);
  }, [file, onToggleFavorite]);
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(file);
  }, [file, onDelete]);
  
  return (
    <Flex
      style={style} // Apply style for positioning
      key={file.id} // Keep key for React reconciliation
      p={3}
      borderBottomWidth="1px"
      bg={isSelected 
        ? (colorMode === 'light' ? 'blue.50' : 'blue.900') 
        : 'transparent'}
      cursor="pointer"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown} // Add keyboard handler
      _hover={{
        bg: colorMode === 'light' ? 'gray.100' : 'gray.700'
      }}
      _focus={{ 
        outline: 'none',
        boxShadow: 'outline',
        bg: colorMode === 'light' ? 'blue.50' : 'blue.900'
      }}
      alignItems="center"
      role="row" // Use row role
      aria-selected={isSelected} // Indicate selection state
      aria-label={`Dosya: ${file.name}, Boyut: ${fileSize}, Tarih: ${fileDate}`}
      // aria-rowindex is handled by the virtual list container
      tabIndex={0} // Make focusable
    >
      <Box fontSize="xl" mr={3} aria-hidden="true">
        {fileIcon}
      </Box>
      <Box flex="1" role="gridcell"> {/* Use gridcell role */} 
        <Flex alignItems="center">
          <Text fontWeight="medium">
            {file.name}
          </Text>
          {file.favorite && (
            <Box ml={2} fontSize="sm" aria-label="Favori dosya">
              ⭐
            </Box>
          )}
        </Flex>
        <Flex fontSize="xs" color="gray.500" mt={1}>
          <Text mr={3}>{fileSize}</Text>
          <Text>{fileDate}</Text>
        </Flex>
      </Box>
      <Box role="gridcell"> {/* Use gridcell role */} 
        <Menu>
          <MenuButton 
            as={IconButton}
            aria-label={`Dosya işlemleri: ${file.name}`}
            icon={<Box>⋮</Box>}
            variant="ghost"
            size="sm"
            onClick={(e) => e.stopPropagation()}
          />
          <MenuList onClick={(e) => e.stopPropagation()}>
            <MenuItem 
              icon={<Box aria-hidden="true">📂</Box>} 
              onClick={() => onOpen(file)}
            >
              Aç
            </MenuItem>
            <MenuItem 
              icon={<Box aria-hidden="true">✏️</Box>} 
              onClick={handleRename}
            >
              Yeniden Adlandır
            </MenuItem>
            <MenuItem 
              icon={<Box aria-hidden="true">{file.favorite ? '⭐' : '☆'}</Box>} 
              onClick={handleToggleFavorite}
            >
              {file.favorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
            </MenuItem>
            <MenuItem 
              icon={<Box aria-hidden="true">🗑️</Box>} 
              onClick={handleDelete}
              color="red.500"
            >
              Sil
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </Flex>
  );
});

// Memoize edilmiş FileDetails bileşeni
const FileDetails = memo(({
  file,
  isRenaming,
  newFileName,
  newTag,
  renameInputRef,
  onRenameChange,
  onRenameComplete,
  onToggleFavorite,
  onTagChange,
  onAddTag,
  onRemoveTag,
  onOpen,
  onDelete
}: {
  file: FileObject,
  isRenaming: boolean,
  newFileName: string,
  newTag: string,
  renameInputRef: React.RefObject<HTMLInputElement>,
  onRenameChange: (value: string) => void,
  onRenameComplete: () => void,
  onToggleFavorite: (file: FileObject) => void,
  onTagChange: (value: string) => void,
  onAddTag: () => void,
  onRemoveTag: (tag: string) => void,
  onOpen: (file: FileObject) => void,
  onDelete: (file: FileObject) => void
}) => {
  // Dosya türü ikonunu memoize et
  const fileIcon = useMemo(() => getFileTypeIcon(file.type), [file.type]);
  
  // Dosya boyutunu memoize et
  const fileSize = useMemo(() => formatFileSize(file.size), [file.size]);
  
  // Dosya tarihini memoize et
  const fileDate = useMemo(() => formatDate(file.lastModified), [file.lastModified]);
  
  // Dosya türü adını memoize et
  const fileTypeName = useMemo(() => 
    file.type.charAt(0).toUpperCase() + file.type.slice(1), 
    [file.type]
  );
  
  // Olay işleyicilerini memoize et
  const handleRenameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onRenameChange(e.target.value);
  }, [onRenameChange]);
  
  const handleRenameKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onRenameComplete();
    }
  }, [onRenameComplete]);
  
  const handleTagChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onTagChange(e.target.value);
  }, [onTagChange]);
  
  const handleTagKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAddTag();
    }
  }, [onAddTag]);
  
  const handleToggleFavorite = useCallback(() => onToggleFavorite(file), [file, onToggleFavorite]);
  const handleOpen = useCallback(() => onOpen(file), [file, onOpen]);
  const handleDelete = useCallback(() => onDelete(file), [file, onDelete]);
  
  const detailsId = `file-details-${file.id}`;
  const nameId = `${detailsId}-name`;
  const tagsId = `${detailsId}-tags`;
  const addTagId = `${detailsId}-addtag`;

  return (
    <Box 
      width="300px" 
      borderWidth="1px" 
      borderRadius="md" 
      p={4}
      overflowY="auto"
      role="region"
      aria-labelledby={nameId} // Label region by file name
      id={detailsId}
    >
      <VStack align="stretch" spacing={4}>
        <Flex justifyContent="center" mb={2}>
          <Box fontSize="5xl" aria-hidden="true">
            {fileIcon}
          </Box>
        </Flex>
        
        {isRenaming ? (
          <Box>
            <InputGroup size="md">
              <Input
                ref={renameInputRef}
                value={newFileName}
                onChange={handleRenameChange}
                onBlur={onRenameComplete}
                onKeyPress={handleRenameKeyPress}
                aria-label="Dosya adını düzenle"
                autoFocus
              />
            </InputGroup>
          </Box>
        ) : (
          <Text fontSize="lg" fontWeight="bold" textAlign="center" id={nameId}>
            {file.name}
          </Text>
        )}
        
        <Divider />
        
        <Box role="group" aria-label="Dosya Bilgileri">
          <Text fontWeight="medium" mb={1}>Dosya Bilgileri</Text>
          <HStack fontSize="sm">
            <Text fontWeight="medium" color="gray.500">Tür:</Text>
            <Text>{fileTypeName}</Text>
          </HStack>
          <HStack fontSize="sm">
            <Text fontWeight="medium" color="gray.500">Boyut:</Text>
            <Text>{fileSize}</Text>
          </HStack>
          <HStack fontSize="sm">
            <Text fontWeight="medium" color="gray.500">Değiştirilme:</Text>
            <Text>{fileDate}</Text>
          </HStack>
          <HStack fontSize="sm">
            <Text fontWeight="medium" color="gray.500">Konum:</Text>
            <Text noOfLines={1}>{file.path}</Text>
          </HStack>
        </Box>
        
        <Divider />
        
        <Box role="group" aria-labelledby={tagsId}>
          <Flex justifyContent="space-between" alignItems="center" mb={2}>
            <Text fontWeight="medium" id={tagsId}>Etiketler</Text>
            <Button
              size="xs"
              variant="outline"
              onClick={handleToggleFavorite}
              aria-pressed={file.favorite}
            >
              {file.favorite ? '⭐ Favorilerde' : '☆ Favorilere Ekle'}
            </Button>
          </Flex>
          
          <Flex flexWrap="wrap" mb={2} aria-label="Mevcut etiketler">
            {file.tags.map(tag => (
              <Badge
                key={tag}
                m={1}
                p={1}
                borderRadius="full"
                colorScheme="blue"
                display="flex"
                alignItems="center"
              >
                <Text mr={1}>{tag}</Text>
                <IconButton
                  as="span"
                  variant="unstyled"
                  size="xs"
                  height="auto"
                  minWidth="auto"
                  cursor="pointer"
                  onClick={() => onRemoveTag(tag)}
                  ml={1}
                  aria-label={`Etiketi kaldır: ${tag}`}
                  icon={<Box aria-hidden="true">✕</Box>}
                />
              </Badge>
            ))}
          </Flex>
          
          <Flex mt={2}>
            <Input
              size="sm"
              aria-labelledby={addTagId}
              placeholder="Yeni etiket..."
              value={newTag}
              onChange={handleTagChange}
              onKeyPress={handleTagKeyPress}
            />
            <Button
              size="sm"
              ml={2}
              onClick={onAddTag}
              isDisabled={!newTag.trim()}
              id={addTagId}
            >
              Ekle
            </Button>
          </Flex>
        </Box>
        
        <Divider />
        
        <Flex justifyContent="space-between">
          <Button
            colorScheme="blue"
            onClick={handleOpen}
            aria-label={`Dosyayı aç: ${file.name}`}
          >
            Aç
          </Button>
          <Button
            colorScheme="red"
            variant="outline"
            onClick={handleDelete}
            aria-label={`Dosyayı sil: ${file.name}`}
          >
            Sil
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
});

// Memoize edilmiş FileFilters bileşeni
const FileFilters = memo(({
  activeFilter,
  onFilterChange,
  onSortChange,
  sortBy,
  sortDirection
}: {
  activeFilter: FileType | 'all' | 'favorites',
  onFilterChange: (filter: FileType | 'all' | 'favorites') => void,
  onSortChange: (sortBy: 'name' | 'date' | 'size' | 'type') => void,
  sortBy: 'name' | 'date' | 'size' | 'type',
  sortDirection: 'asc' | 'desc'
}) => {
  // Olay işleyicilerini memoize et
  const handleFilterAll = useCallback(() => onFilterChange('all'), [onFilterChange]);
  const handleFilterFavorites = useCallback(() => onFilterChange('favorites'), [onFilterChange]);
  const handleFilterImage = useCallback(() => onFilterChange('image'), [onFilterChange]);
  const handleFilterDocument = useCallback(() => onFilterChange('document'), [onFilterChange]);
  const handleFilterCode = useCallback(() => onFilterChange('code'), [onFilterChange]);
  const handleFilterVideo = useCallback(() => onFilterChange('video'), [onFilterChange]);
  const handleFilterAudio = useCallback(() => onFilterChange('audio'), [onFilterChange]);
  
  const handleSortByName = useCallback(() => onSortChange('name'), [onSortChange]);
  const handleSortByDate = useCallback(() => onSortChange('date'), [onSortChange]);
  const handleSortBySize = useCallback(() => onSortChange('size'), [onSortChange]);
  const handleSortByType = useCallback(() => onSortChange('type'), [onSortChange]);
  
  return (
    <Flex justifyContent="space-between" alignItems="center" role="toolbar" aria-label="Dosya filtreleri ve sıralama">
      <HStack spacing={2} overflowX="auto" py={2} className="file-filters" role="group" aria-label="Filtreleme seçenekleri">
        <Button
          size="sm"
          variant={activeFilter === 'all' ? 'solid' : 'outline'}
          onClick={handleFilterAll}
          aria-pressed={activeFilter === 'all'}
        >
          Tümü
        </Button>
        <Button
          size="sm"
          variant={activeFilter === 'favorites' ? 'solid' : 'outline'}
          onClick={handleFilterFavorites}
          leftIcon={<Box aria-hidden="true">⭐</Box>}
          aria-pressed={activeFilter === 'favorites'}
        >
          Favoriler
        </Button>
        <Button
          size="sm"
          variant={activeFilter === 'image' ? 'solid' : 'outline'}
          onClick={handleFilterImage}
          leftIcon={<Box aria-hidden="true">🖼️</Box>}
          aria-pressed={activeFilter === 'image'}
        >
          Resimler
        </Button>
        <Button
          size="sm"
          variant={activeFilter === 'document' ? 'solid' : 'outline'}
          onClick={handleFilterDocument}
          leftIcon={<Box aria-hidden="true">📄</Box>}
          aria-pressed={activeFilter === 'document'}
        >
          Belgeler
        </Button>
        <Button
          size="sm"
          variant={activeFilter === 'code' ? 'solid' : 'outline'}
          onClick={handleFilterCode}
          leftIcon={<Box aria-hidden="true">📝</Box>}
          aria-pressed={activeFilter === 'code'}
        >
          Kodlar
        </Button>
        <Button
          size="sm"
          variant={activeFilter === 'video' ? 'solid' : 'outline'}
          onClick={handleFilterVideo}
          leftIcon={<Box aria-hidden="true">🎬</Box>}
          aria-pressed={activeFilter === 'video'}
        >
          Videolar
        </Button>
        <Button
          size="sm"
          variant={activeFilter === 'audio' ? 'solid' : 'outline'}
          onClick={handleFilterAudio}
          leftIcon={<Box aria-hidden="true">🎵</Box>}
          aria-pressed={activeFilter === 'audio'}
        >
          Sesler
        </Button>
      </HStack>
      
      <Menu>
        <MenuButton as={Button} size="sm" rightIcon={<Box aria-hidden="true">⏷</Box>}>
          Sırala: {sortBy === 'name' ? 'İsim' : sortBy === 'date' ? 'Tarih' : sortBy === 'size' ? 'Boyut' : 'Tür'} ({sortDirection === 'asc' ? 'Artan' : 'Azalan'})
        </MenuButton>
        <MenuList>
          <MenuItem 
            onClick={handleSortByName}
            icon={<Box aria-hidden="true">{sortBy === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ' '}</Box>}
            aria-current={sortBy === 'name'}
          >
            İsme Göre
          </MenuItem>
          <MenuItem 
            onClick={handleSortByDate}
            icon={<Box aria-hidden="true">{sortBy === 'date' ? (sortDirection === 'asc' ? '↑' : '↓') : ' '}</Box>}
            aria-current={sortBy === 'date'}
          >
            Tarihe Göre
          </MenuItem>
          <MenuItem 
            onClick={handleSortBySize}
            icon={<Box aria-hidden="true">{sortBy === 'size' ? (sortDirection === 'asc' ? '↑' : '↓') : ' '}</Box>}
            aria-current={sortBy === 'size'}
          >
            Boyuta Göre
          </MenuItem>
          <MenuItem 
            onClick={handleSortByType}
            icon={<Box aria-hidden="true">{sortBy === 'type' ? (sortDirection === 'asc' ? '↑' : '↓') : ' '}</Box>}
            aria-current={sortBy === 'type'}
          >
            Türe Göre
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
});

// Dosya yöneticisi bileşeni
export const FileManager: React.FC<FileManagerProps> = memo(({
  initialFiles = [],
  onFileOpen,
  onFileDelete,
  onFileRename,
  onFileFavorite,
  onFileTagAdd,
  onFileTagRemove
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const [files, setFiles] = useState<FileObject[]>(initialFiles);
  const [selectedFile, setSelectedFile] = useState<FileObject | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeFilter, setActiveFilter] = useState<FileType | 'all' | 'favorites'>('all');
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [newTag, setNewTag] = useState<string>('');
  const renameInputRef = useRef<HTMLInputElement>(null);
  const drawerContentRef = useRef<HTMLDivElement>(null); // Ref for drawer content
  const openButtonRef = useRef<HTMLButtonElement>(null); // Ref for the button that opens the drawer
  const listRef = useRef<FixedSizeList>(null); // Ref for virtual list
  const gridRef = useRef<FixedSizeGrid>(null); // Ref for virtual grid

  // Focus management for Drawer
  useFocusOnShow(drawerContentRef, { shouldFocus: isOpen });
  useFocusOnHide(drawerContentRef, { focusRef: openButtonRef, shouldFocus: isOpen });
  
  // Demo dosyaları - Increased to 1000 items to better demonstrate virtualization benefits
  useEffect(() => {
    if (files.length === 0) {
      const demoFiles: FileObject[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i + 1}`,
        name: `dosya_${i + 1}_${Math.random().toString(36).substring(7)}.txt`,
        type: i % 5 === 0 ? 'image' : i % 5 === 1 ? 'document' : i % 5 === 2 ? 'code' : i % 5 === 3 ? 'video' : 'audio',
        size: Math.floor(Math.random() * 1024 * 1024 * 10), // 0-10 MB
        lastModified: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)), // Son 30 gün
        path: `/demo/path/${i % 10}/`,
        favorite: Math.random() < 0.1, // %10 favori
        tags: [`tag${i % 10}`, `demo`, Math.random() < 0.2 ? 'important' : 'general']
      }));
      
      setFiles(demoFiles);
    }
  }, []);
  
  // Dosyaları filtrele - useMemo ile optimize edildi
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      // Arama sorgusu filtresi
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Dosya türü filtresi
      const matchesType = activeFilter === 'all' || 
                        (activeFilter === 'favorites' ? file.favorite : file.type === activeFilter);
      
      return matchesSearch && matchesType;
    });
  }, [files, searchQuery, activeFilter]);
  
  // Dosyaları sırala - useMemo ile optimize edildi
  const sortedFiles = useMemo(() => {
    return [...filteredFiles].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = b.lastModified.getTime() - a.lastModified.getTime(); // Default date sort: newest first
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredFiles, sortBy, sortDirection]);
  
  // Olay işleyicileri - useCallback ile optimize edildi
  const handleFileSelect = useCallback((file: FileObject) => {
    setSelectedFile(file);
    setIsRenaming(false); // Stop renaming if a different file is selected
  }, []);
  
  const handleFileOpen = useCallback((file: FileObject) => {
    if (onFileOpen) {
      onFileOpen(file);
    }
    // Potentially close drawer on open?
    // onClose(); 
  }, [onFileOpen]);
  
  const handleFileDelete = useCallback((file: FileObject) => {
    setFiles(prev => prev.filter(f => f.id !== file.id));
    if (selectedFile?.id === file.id) {
      setSelectedFile(null);
    }
    if (onFileDelete) {
      onFileDelete(file);
    }
    // Focus management after delete might be needed
  }, [selectedFile, onFileDelete]);
  
  const handleRenameStart = useCallback((file: FileObject) => {
    setSelectedFile(file);
    setNewFileName(file.name);
    setIsRenaming(true);
    // Focus is handled by autoFocus on Input
  }, []);
  
  const handleRenameComplete = useCallback(() => {
    if (isRenaming && selectedFile && newFileName.trim()) {
      const updatedFile = { ...selectedFile, name: newFileName.trim() };
      setFiles(prev => prev.map(f => f.id === selectedFile.id ? updatedFile : f));
      setSelectedFile(updatedFile);
      if (onFileRename) {
        onFileRename(selectedFile, newFileName.trim());
      }
    }
    setIsRenaming(false);
    // Focus should ideally return to the renamed item or details pane
  }, [isRenaming, selectedFile, newFileName, onFileRename]);
  
  const handleToggleFavorite = useCallback((file: FileObject) => {
    const updatedFile = { ...file, favorite: !file.favorite };
    setFiles(prev => prev.map(f => f.id === file.id ? updatedFile : f));
    if (selectedFile?.id === file.id) {
      setSelectedFile(updatedFile);
    }
    if (onFileFavorite) {
      onFileFavorite(file, updatedFile.favorite);
    }
  }, [selectedFile, onFileFavorite]);
  
  const handleTagChange = useCallback((value: string) => {
    setNewTag(value);
  }, []);
  
  const handleAddTag = useCallback(() => {
    if (selectedFile && newTag.trim()) {
      const tagToAdd = newTag.trim().toLowerCase();
      if (!selectedFile.tags.includes(tagToAdd)) {
        const updatedFile = { ...selectedFile, tags: [...selectedFile.tags, tagToAdd] };
        setFiles(prev => prev.map(f => f.id === selectedFile.id ? updatedFile : f));
        setSelectedFile(updatedFile);
        if (onFileTagAdd) {
          onFileTagAdd(selectedFile, tagToAdd);
        }
      }
      setNewTag(''); // Clear input
    }
  }, [selectedFile, newTag, onFileTagAdd]);
  
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    if (selectedFile) {
      const updatedFile = { ...selectedFile, tags: selectedFile.tags.filter(tag => tag !== tagToRemove) };
      setFiles(prev => prev.map(f => f.id === selectedFile.id ? updatedFile : f));
      setSelectedFile(updatedFile);
      if (onFileTagRemove) {
        onFileTagRemove(selectedFile, tagToRemove);
      }
    }
  }, [selectedFile, onFileTagRemove]);
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);
  
  const handleFilterChange = useCallback((filter: FileType | 'all' | 'favorites') => {
    setActiveFilter(filter);
  }, []);
  
  const handleSortChange = useCallback((newSortBy: 'name' | 'date' | 'size' | 'type') => {
    if (newSortBy === sortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('asc'); // Default to ascending when changing sort column
    }
  }, [sortBy]);

  // Memoized item data for virtual lists
  const itemData = useMemo(() => ({
    files: sortedFiles,
    selectedFileId: selectedFile?.id ?? null,
    colorMode,
    onSelect: handleFileSelect,
    onOpen: handleFileOpen,
    onRename: handleRenameStart,
    onToggleFavorite: handleToggleFavorite,
    onDelete: handleFileDelete,
  }), [sortedFiles, selectedFile, colorMode, handleFileSelect, handleFileOpen, handleRenameStart, handleToggleFavorite, handleFileDelete]);

  // Grid view specific calculations
  const gridItemWidth = 136; // Width of grid item + margin (120 + 8*2)
  const gridItemHeight = 156; // Height of grid item + margin (140 + 8*2)

  return (
    <>
      <Tooltip label="Dosya Yöneticisi" placement="left">
        <IconButton
          ref={openButtonRef} // Attach ref to the button
          aria-label="Dosya Yöneticisini Aç"
          icon={<Box>🗂️</Box>}
          onClick={onOpen}
          variant="glass"
        />
      </Tooltip>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
        <DrawerOverlay />
        <DrawerContent ref={drawerContentRef} role="dialog" aria-modal="true" aria-label="Dosya Yöneticisi">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Dosya Yöneticisi
          </DrawerHeader>

          <DrawerBody display="flex" flexDirection="column" p={0}>
            {/* Search and View Mode Controls */}
            <Flex p={4} borderBottomWidth="1px" alignItems="center">
              <InputGroup flex="1" mr={4}>
                <InputLeftElement pointerEvents="none">
                  <Box>🔍</Box>
                </InputLeftElement>
                <Input 
                  placeholder="Dosyalarda veya etiketlerde ara..." 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  aria-label="Dosya arama"
                />
              </InputGroup>
              <HStack>
                <Tooltip label="Liste Görünümü" placement="bottom">
                  <IconButton
                    aria-label="Liste Görünümü"
                    icon={<Box>☰</Box>}
                    variant={viewMode === 'list' ? 'solid' : 'ghost'}
                    onClick={() => setViewMode('list')}
                    aria-pressed={viewMode === 'list'}
                  />
                </Tooltip>
                <Tooltip label="Izgara Görünümü" placement="bottom">
                  <IconButton
                    aria-label="Izgara Görünümü"
                    icon={<Box>▦</Box>}
                    variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                    onClick={() => setViewMode('grid')}
                    aria-pressed={viewMode === 'grid'}
                  />
                </Tooltip>
              </HStack>
            </Flex>

            {/* Filters and Sorting */}
            <Box p={4} borderBottomWidth="1px">
              <FileFilters 
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                sortBy={sortBy}
                sortDirection={sortDirection}
              />
            </Box>

            {/* File List and Details Pane */}
            <Flex flex="1" overflow="hidden"> {/* Main content area */} 
              {/* File List Area - Takes remaining space and handles overflow */}
              <Box flex="1" overflow="hidden" p={2} role="region" aria-label="Dosya listesi">
                {/* Use AutoSizer to provide dimensions to virtual lists */} 
                <AutoSizer>
                  {({ height, width }) => {
                    if (viewMode === 'list') {
                      return (
                        <FixedSizeList
                          ref={listRef}
                          height={height}
                          width={width}
                          itemCount={sortedFiles.length}
                          itemSize={73} // Approx height of FileListItem + border
                          itemData={itemData} // Pass memoized data
                          overscanCount={5} // Render a few items outside the viewport
                        >
                          {FileListItem}
                        </FixedSizeList>
                      );
                    } else {
                      // Calculate column count based on available width
                      const columnCount = Math.max(1, Math.floor(width / gridItemWidth));
                      const rowCount = Math.ceil(sortedFiles.length / columnCount);
                      
                      // Pass columnCount to itemData for grid item calculation
                      const gridItemData = { ...itemData, columnCount };

                      return (
                        <FixedSizeGrid
                          ref={gridRef}
                          height={height}
                          width={width}
                          columnCount={columnCount}
                          rowCount={rowCount}
                          columnWidth={gridItemWidth}
                          rowHeight={gridItemHeight}
                          itemCount={sortedFiles.length} // Total number of items
                          itemData={gridItemData} // Pass memoized data including columnCount
                          overscanRowCount={2} // Render a few rows outside the viewport
                          overscanColumnCount={1}
                        >
                          {FileGridItem}
                        </FixedSizeGrid>
                      );
                    }
                  }}
                </AutoSizer>
              </Box>

              {/* Details Pane - Only show if a file is selected */}
              {selectedFile && (
                <Box 
                  width="300px" 
                  borderLeftWidth="1px" 
                  overflowY="auto"
                  p={0} // Remove padding, FileDetails has its own
                >
                  <FileDetails 
                    file={selectedFile}
                    isRenaming={isRenaming}
                    newFileName={newFileName}
                    newTag={newTag}
                    renameInputRef={renameInputRef}
                    onRenameChange={setNewFileName}
                    onRenameComplete={handleRenameComplete}
                    onToggleFavorite={handleToggleFavorite}
                    onTagChange={handleTagChange}
                    onAddTag={handleAddTag}
                    onRemoveTag={handleRemoveTag}
                    onOpen={handleFileOpen}
                    onDelete={handleFileDelete}
                  />
                </Box>
              )}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
});

// Display name for debugging
FileManager.displayName = 'FileManager';

export default FileManager;
