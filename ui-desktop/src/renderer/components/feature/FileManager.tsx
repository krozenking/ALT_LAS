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
  TabPanel
} from '@chakra-ui/react';
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
  file, 
  isSelected, 
  colorMode, 
  onSelect, 
  onOpen 
}: { 
  file: FileObject, 
  isSelected: boolean, 
  colorMode: string, 
  onSelect: (file: FileObject) => void, 
  onOpen: (file: FileObject) => void 
}) => {
  // Dosya türü ikonunu memoize et
  const fileIcon = useMemo(() => getFileTypeIcon(file.type), [file.type]);
  
  // Dosya boyutunu memoize et
  const fileSize = useMemo(() => formatFileSize(file.size), [file.size]);
  
  // Olay işleyicilerini memoize et
  const handleClick = useCallback(() => onSelect(file), [file, onSelect]);
  const handleDoubleClick = useCallback(() => onOpen(file), [file, onOpen]);
  
  return (
    <Box
      key={file.id}
      width="120px"
      height="140px"
      m={2}
      p={3}
      borderWidth="1px"
      borderRadius="md"
      borderColor={isSelected ? 'blue.500' : 'transparent'}
      bg={colorMode === 'light' ? 'white' : 'gray.700'}
      boxShadow="sm"
      cursor="pointer"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      _hover={{ boxShadow: 'md', borderColor: 'blue.300' }}
      transition="all 0.2s"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      position="relative"
      role="listitem"
      aria-label={`Dosya: ${file.name}`}
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
      <Box fontSize="3xl" mb={2}>
        {fileIcon}
      </Box>
      <Text 
        fontSize="sm" 
        fontWeight="medium" 
        textAlign="center"
        noOfLines={2}
      >
        {file.name}
      </Text>
      <Text fontSize="xs" color="gray.500" mt={1}>
        {fileSize}
      </Text>
    </Box>
  );
});

// Memoize edilmiş FileItem bileşeni (Liste görünümü için)
const FileListItem = memo(({ 
  file, 
  isSelected, 
  colorMode, 
  onSelect, 
  onOpen,
  onRename,
  onToggleFavorite,
  onDelete
}: { 
  file: FileObject, 
  isSelected: boolean, 
  colorMode: string, 
  onSelect: (file: FileObject) => void, 
  onOpen: (file: FileObject) => void,
  onRename: (file: FileObject) => void,
  onToggleFavorite: (file: FileObject) => void,
  onDelete: (file: FileObject) => void
}) => {
  // Dosya türü ikonunu memoize et
  const fileIcon = useMemo(() => getFileTypeIcon(file.type), [file.type]);
  
  // Dosya boyutunu memoize et
  const fileSize = useMemo(() => formatFileSize(file.size), [file.size]);
  
  // Dosya tarihini memoize et
  const fileDate = useMemo(() => formatDate(file.lastModified), [file.lastModified]);
  
  // Olay işleyicilerini memoize et
  const handleClick = useCallback(() => onSelect(file), [file, onSelect]);
  const handleDoubleClick = useCallback(() => onOpen(file), [file, onOpen]);
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
      key={file.id}
      p={3}
      borderBottomWidth="1px"
      bg={isSelected 
        ? (colorMode === 'light' ? 'blue.50' : 'blue.900') 
        : 'transparent'}
      cursor="pointer"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      _hover={{
        bg: colorMode === 'light' ? 'gray.100' : 'gray.700'
      }}
      alignItems="center"
      role="row"
      aria-label={`Dosya: ${file.name}`}
    >
      <Box fontSize="xl" mr={3}>
        {fileIcon}
      </Box>
      <Box flex="1">
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
      <Menu>
        <MenuButton 
          as={IconButton}
          aria-label="Dosya işlemleri"
          icon={<Box>⋮</Box>}
          variant="ghost"
          size="sm"
          onClick={(e) => e.stopPropagation()}
        />
        <MenuList onClick={(e) => e.stopPropagation()}>
          <MenuItem 
            icon={<Box>📂</Box>} 
            onClick={() => onOpen(file)}
          >
            Aç
          </MenuItem>
          <MenuItem 
            icon={<Box>✏️</Box>} 
            onClick={handleRename}
          >
            Yeniden Adlandır
          </MenuItem>
          <MenuItem 
            icon={<Box>{file.favorite ? '⭐' : '☆'}</Box>} 
            onClick={handleToggleFavorite}
          >
            {file.favorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
          </MenuItem>
          <MenuItem 
            icon={<Box>🗑️</Box>} 
            onClick={handleDelete}
            color="red.500"
          >
            Sil
          </MenuItem>
        </MenuList>
      </Menu>
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
  
  return (
    <Box 
      width="300px" 
      borderWidth="1px" 
      borderRadius="md" 
      p={4}
      overflowY="auto"
      role="region"
      aria-label="File details"
    >
      <VStack align="stretch" spacing={4}>
        <Flex justifyContent="center" mb={2}>
          <Box fontSize="5xl">
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
                aria-label="Rename file"
                autoFocus
              />
            </InputGroup>
          </Box>
        ) : (
          <Text fontSize="lg" fontWeight="bold" textAlign="center">
            {file.name}
          </Text>
        )}
        
        <Divider />
        
        <Box>
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
        
        <Box>
          <Flex justifyContent="space-between" alignItems="center" mb={2}>
            <Text fontWeight="medium">Etiketler</Text>
            <Button
              size="xs"
              variant="outline"
              onClick={handleToggleFavorite}
            >
              {file.favorite ? '⭐ Favorilerde' : '☆ Favorilere Ekle'}
            </Button>
          </Flex>
          
          <Flex flexWrap="wrap" mb={2}>
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
                <Box
                  as="span"
                  cursor="pointer"
                  onClick={() => onRemoveTag(tag)}
                  ml={1}
                  aria-label={`Remove tag ${tag}`}
                >
                  ✕
                </Box>
              </Badge>
            ))}
          </Flex>
          
          <Flex mt={2}>
            <Input
              size="sm"
              aria-label="Add new tag"
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
          >
            Aç
          </Button>
          <Button
            colorScheme="red"
            variant="outline"
            onClick={handleDelete}
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
    <Flex justifyContent="space-between" alignItems="center">
      <HStack spacing={2} overflowX="auto" py={2} className="file-filters">
        <Button
          size="sm"
          variant={activeFilter === 'all' ? 'solid' : 'outline'}
          onClick={handleFilterAll}
        >
          Tümü
        </Button>
        <Button
          size="sm"
          variant={activeFilter === 'favorites' ? 'solid' : 'outline'}
          onClick={handleFilterFavorites}
          leftIcon={<Box>⭐</Box>}
        >
          Favoriler
        </Button>
        <Button
          size="sm"
          variant={activeFilter === 'image' ? 'solid' : 'outline'}
          onClick={handleFilterImage}
          leftIcon={<Box>🖼️</Box>}
        >
          Resimler
        </Button>
        <Button
          size="sm"
          variant={activeFilter === 'document' ? 'solid' : 'outline'}
          onClick={handleFilterDocument}
          leftIcon={<Box>📄</Box>}
        >
          Belgeler
        </Button>
        <Button
          size="sm"
          variant={activeFilter === 'code' ? 'solid' : 'outline'}
          onClick={handleFilterCode}
          leftIcon={<Box>📝</Box>}
        >
          Kod
        </Button>
        <Button
          size="sm"
          variant={activeFilter === 'video' ? 'solid' : 'outline'}
          onClick={handleFilterVideo}
          leftIcon={<Box>🎬</Box>}
        >
          Video
        </Button>
        <Button
          size="sm"
          variant={activeFilter === 'audio' ? 'solid' : 'outline'}
          onClick={handleFilterAudio}
          leftIcon={<Box>🎵</Box>}
        >
          Ses
        </Button>
      </HStack>
      
      <Menu>
        <MenuButton as={Button} size="sm" rightIcon={<Box>⏷</Box>}>
          Sırala
        </MenuButton>
        <MenuList>
          <MenuItem 
            onClick={handleSortByName}
            icon={<Box>{sortBy === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ' '}</Box>}
          >
            İsme Göre
          </MenuItem>
          <MenuItem 
            onClick={handleSortByDate}
            icon={<Box>{sortBy === 'date' ? (sortDirection === 'asc' ? '↑' : '↓') : ' '}</Box>}
          >
            Tarihe Göre
          </MenuItem>
          <MenuItem 
            onClick={handleSortBySize}
            icon={<Box>{sortBy === 'size' ? (sortDirection === 'asc' ? '↑' : '↓') : ' '}</Box>}
          >
            Boyuta Göre
          </MenuItem>
          <MenuItem 
            onClick={handleSortByType}
            icon={<Box>{sortBy === 'type' ? (sortDirection === 'asc' ? '↑' : '↓') : ' '}</Box>}
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
  
  // Demo dosyaları
  useEffect(() => {
    if (files.length === 0) {
      const demoFiles: FileObject[] = [
        {
          id: '1',
          name: 'proje_goruntusu.png',
          type: 'image',
          size: 1024 * 1024 * 2.5, // 2.5 MB
          lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 saat önce
          path: '/projeler/ALT_LAS/ekran_goruntuleri/',
          favorite: true,
          tags: ['ekran görüntüsü', 'proje', 'UI']
        },
        {
          id: '2',
          name: 'rapor.docx',
          type: 'document',
          size: 1024 * 512, // 512 KB
          lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 gün önce
          path: '/projeler/ALT_LAS/dokumanlar/',
          favorite: false,
          tags: ['rapor', 'doküman']
        },
        {
          id: '3',
          name: 'main.py',
          type: 'code',
          size: 1024 * 15, // 15 KB
          lastModified: new Date(Date.now() - 1000 * 60 * 30), // 30 dakika önce
          path: '/projeler/ALT_LAS/kod/',
          favorite: true,
          tags: ['python', 'kod', 'ana dosya']
        },
        {
          id: '4',
          name: 'demo_video.mp4',
          type: 'video',
          size: 1024 * 1024 * 15, // 15 MB
          lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 gün önce
          path: '/projeler/ALT_LAS/medya/',
          favorite: false,
          tags: ['video', 'demo', 'sunum']
        },
        {
          id: '5',
          name: 'bildirim_sesi.mp3',
          type: 'audio',
          size: 1024 * 800, // 800 KB
          lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 gün önce
          path: '/projeler/ALT_LAS/medya/',
          favorite: false,
          tags: ['ses', 'bildirim']
        },
        {
          id: '6',
          name: 'config.json',
          type: 'code',
          size: 1024 * 2, // 2 KB
          lastModified: new Date(Date.now() - 1000 * 60 * 10), // 10 dakika önce
          path: '/projeler/ALT_LAS/ayarlar/',
          favorite: true,
          tags: ['json', 'yapılandırma', 'ayarlar']
        }
      ];
      
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
          comparison = a.lastModified.getTime() - b.lastModified.getTime();
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
  }, []);
  
  const handleFileOpen = useCallback((file: FileObject) => {
    if (onFileOpen) {
      onFileOpen(file);
    }
  }, [onFileOpen]);
  
  const handleFileDelete = useCallback((file: FileObject) => {
    setFiles(prev => prev.filter(f => f.id !== file.id));
    if (selectedFile?.id === file.id) {
      setSelectedFile(null);
    }
    if (onFileDelete) {
      onFileDelete(file);
    }
  }, [selectedFile, onFileDelete]);
  
  const handleRenameStart = useCallback((file: FileObject) => {
    setSelectedFile(file);
    setNewFileName(file.name);
    setIsRenaming(true);
    setTimeout(() => {
      if (renameInputRef.current) {
        renameInputRef.current.focus();
      }
    }, 100);
  }, []);
  
  const handleRenameComplete = useCallback(() => {
    if (selectedFile && newFileName.trim()) {
      const updatedFile = { ...selectedFile, name: newFileName.trim() };
      setFiles(prev => prev.map(f => f.id === selectedFile.id ? updatedFile : f));
      setSelectedFile(updatedFile);
      if (onFileRename) {
        onFileRename(selectedFile, newFileName.trim());
      }
    }
    setIsRenaming(false);
  }, [selectedFile, newFileName, onFileRename]);
  
  const handleToggleFavorite = useCallback((file: FileObject) => {
    const updatedFile = { ...file, favorite: !file.favorite };
    setFiles(prev => prev.map(f => f.id === file.id ? updatedFile : f));
    if (selectedFile?.id === file.id) {
      setSelectedFile(updatedFile);
    }
    if (onFileFavorite) {
      onFileFavorite(file, !file.favorite);
    }
  }, [selectedFile, onFileFavorite]);
  
  const handleAddTag = useCallback(() => {
    if (selectedFile && newTag.trim()) {
      if (!selectedFile.tags.includes(newTag.trim())) {
        const updatedFile = { 
          ...selectedFile, 
          tags: [...selectedFile.tags, newTag.trim()] 
        };
        setFiles(prev => prev.map(f => f.id === selectedFile.id ? updatedFile : f));
        setSelectedFile(updatedFile);
        if (onFileTagAdd) {
          onFileTagAdd(selectedFile, newTag.trim());
        }
      }
      setNewTag('');
    }
  }, [selectedFile, newTag, onFileTagAdd]);
  
  const handleRemoveTag = useCallback((tag: string) => {
    if (selectedFile) {
      const updatedFile = { 
        ...selectedFile, 
        tags: selectedFile.tags.filter(t => t !== tag) 
      };
      setFiles(prev => prev.map(f => f.id === selectedFile.id ? updatedFile : f));
      setSelectedFile(updatedFile);
      if (onFileTagRemove) {
        onFileTagRemove(selectedFile, tag);
      }
    }
  }, [selectedFile, onFileTagRemove]);
  
  const handleSortChange = useCallback((newSortBy: 'name' | 'date' | 'size' | 'type') => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('asc');
    }
  }, [sortBy]);
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);
  
  const handleFilterChange = useCallback((filter: FileType | 'all' | 'favorites') => {
    setActiveFilter(filter);
  }, []);
  
  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);
  
  const handleRenameChange = useCallback((value: string) => {
    setNewFileName(value);
  }, []);
  
  const handleTagChange = useCallback((value: string) => {
    setNewTag(value);
  }, []);
  
  // Görünüm modu değiştirme işleyicileri
  const handleGridView = useCallback(() => handleViewModeChange('grid'), [handleViewModeChange]);
  const handleListView = useCallback(() => handleViewModeChange('list'), [handleViewModeChange]);
  
  // Bileşen displayName'leri
  FileGridItem.displayName = 'FileGridItem';
  FileListItem.displayName = 'FileListItem';
  FileDetails.displayName = 'FileDetails';
  FileFilters.displayName = 'FileFilters';
  
  return (
    <>
      {/* Dosya Yöneticisi Açma Butonu */}
      <Tooltip label="Dosya Yöneticisi" aria-label="Dosya Yöneticisi">
        <IconButton
          aria-label="Dosya Yöneticisi"
          icon={<Box fontSize="xl">📂</Box>}
          variant="glass"
          onClick={onOpen}
          {...animations.performanceUtils.forceGPU}
        />
      </Tooltip>
      
      {/* Dosya Yöneticisi Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size="xl"
        aria-labelledby="file-manager-header"
      >
        <DrawerOverlay />
        <DrawerContent
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
          borderLeftRadius="md"
        >
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" fontWeight="bold" id="file-manager-header">Dosya Yöneticisi</Text>
              <HStack>
                <Tooltip label="Liste Görünümü" aria-label="Liste Görünümü">
                  <IconButton
                    aria-label="Liste Görünümü"
                    icon={<Box>📋</Box>}
                    size="sm"
                    variant={viewMode === 'list' ? 'solid' : 'outline'}
                    onClick={handleListView}
                  />
                </Tooltip>
                <Tooltip label="Izgara Görünümü" aria-label="Izgara Görünümü">
                  <IconButton
                    aria-label="Izgara Görünümü"
                    icon={<Box>📊</Box>}
                    size="sm"
                    variant={viewMode === 'grid' ? 'solid' : 'outline'}
                    onClick={handleGridView}
                  />
                </Tooltip>
              </HStack>
            </Flex>
          </DrawerHeader>
          
          <DrawerBody p={4}>
            <Flex direction="column" height="100%">
              {/* Arama ve Filtreler */}
              <Box mb={4}>
                <InputGroup mb={3}>
                  <InputLeftElement pointerEvents="none">
                    <Box color="gray.500">🔍</Box>
                  </InputLeftElement>
                  <Input
                    placeholder="Dosya ara..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    aria-label="Dosya ara"
                  />
                </InputGroup>
                
                <FileFilters
                  activeFilter={activeFilter}
                  onFilterChange={handleFilterChange}
                  onSortChange={handleSortChange}
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                />
              </Box>
              
              {/* Dosya Listesi ve Detaylar */}
              <Flex flex="1" overflow="hidden">
                {/* Dosya Listesi */}
                <Box 
                  flex="1" 
                  overflowY="auto" 
                  borderWidth="1px" 
                  borderRadius="md" 
                  mr={selectedFile ? 4 : 0}
                  role="region"
                  aria-label="File list"
                >
                  {sortedFiles.length > 0 ? (
                    viewMode === 'grid' ? (
                      <Flex flexWrap="wrap" p={2}>
                        {sortedFiles.map(file => (
                          <FileGridItem
                            key={file.id}
                            file={file}
                            isSelected={selectedFile?.id === file.id}
                            colorMode={colorMode}
                            onSelect={handleFileSelect}
                            onOpen={handleFileOpen}
                          />
                        ))}
                      </Flex>
                    ) : (
                      <Box>
                        {sortedFiles.map(file => (
                          <FileListItem
                            key={file.id}
                            file={file}
                            isSelected={selectedFile?.id === file.id}
                            colorMode={colorMode}
                            onSelect={handleFileSelect}
                            onOpen={handleFileOpen}
                            onRename={handleRenameStart}
                            onToggleFavorite={handleToggleFavorite}
                            onDelete={handleFileDelete}
                          />
                        ))}
                      </Box>
                    )
                  ) : (
                    <Flex 
                      height="100%" 
                      alignItems="center" 
                      justifyContent="center" 
                      p={8}
                    >
                      <Text color="gray.500">
                        {searchQuery 
                          ? 'Arama kriterlerine uygun dosya bulunamadı' 
                          : 'Dosya bulunamadı'}
                      </Text>
                    </Flex>
                  )}
                </Box>
                
                {/* Dosya Detayları */}
                {selectedFile && (
                  <FileDetails
                    file={selectedFile}
                    isRenaming={isRenaming}
                    newFileName={newFileName}
                    newTag={newTag}
                    renameInputRef={renameInputRef}
                    onRenameChange={handleRenameChange}
                    onRenameComplete={handleRenameComplete}
                    onToggleFavorite={handleToggleFavorite}
                    onTagChange={handleTagChange}
                    onAddTag={handleAddTag}
                    onRemoveTag={handleRemoveTag}
                    onOpen={handleFileOpen}
                    onDelete={handleFileDelete}
                  />
                )}
              </Flex>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
});

// Ensure displayName is set for React DevTools
FileManager.displayName = 'FileManager';

export default FileManager;
