import React, { useState, useEffect, useRef } from 'react';
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

// Dosya boyutunu formatla
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

// Dosya türüne göre ikon getir
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

// Dosya yöneticisi bileşeni
export const FileManager: React.FC<FileManagerProps> = ({
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
  
  // Dosyaları filtrele
  const filteredFiles = files.filter(file => {
    // Arama sorgusu filtresi
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Dosya türü filtresi
    const matchesType = activeFilter === 'all' || 
                       (activeFilter === 'favorites' ? file.favorite : file.type === activeFilter);
    
    return matchesSearch && matchesType;
  });
  
  // Dosyaları sırala
  const sortedFiles = [...filteredFiles].sort((a, b) => {
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
  
  // Dosya seç
  const handleFileSelect = (file: FileObject) => {
    setSelectedFile(file);
  };
  
  // Dosya aç
  const handleFileOpen = (file: FileObject) => {
    if (onFileOpen) {
      onFileOpen(file);
    }
  };
  
  // Dosya sil
  const handleFileDelete = (file: FileObject) => {
    setFiles(prev => prev.filter(f => f.id !== file.id));
    if (selectedFile?.id === file.id) {
      setSelectedFile(null);
    }
    if (onFileDelete) {
      onFileDelete(file);
    }
  };
  
  // Dosya yeniden adlandır
  const handleRenameStart = (file: FileObject) => {
    setSelectedFile(file);
    setNewFileName(file.name);
    setIsRenaming(true);
    setTimeout(() => {
      if (renameInputRef.current) {
        renameInputRef.current.focus();
      }
    }, 100);
  };
  
  const handleRenameComplete = () => {
    if (selectedFile && newFileName.trim()) {
      const updatedFile = { ...selectedFile, name: newFileName.trim() };
      setFiles(prev => prev.map(f => f.id === selectedFile.id ? updatedFile : f));
      setSelectedFile(updatedFile);
      if (onFileRename) {
        onFileRename(selectedFile, newFileName.trim());
      }
    }
    setIsRenaming(false);
  };
  
  // Favori durumunu değiştir
  const handleToggleFavorite = (file: FileObject) => {
    const updatedFile = { ...file, favorite: !file.favorite };
    setFiles(prev => prev.map(f => f.id === file.id ? updatedFile : f));
    if (selectedFile?.id === file.id) {
      setSelectedFile(updatedFile);
    }
    if (onFileFavorite) {
      onFileFavorite(file, !file.favorite);
    }
  };
  
  // Etiket ekle
  const handleAddTag = () => {
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
  };
  
  // Etiket kaldır
  const handleRemoveTag = (tag: string) => {
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
  };
  
  // Sıralama değiştir
  const handleSortChange = (newSortBy: 'name' | 'date' | 'size' | 'type') => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('asc');
    }
  };
  
  // Tarih formatla
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
      >
        <DrawerOverlay />
        <DrawerContent
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
          borderLeftRadius="md"
        >
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" fontWeight="bold">Dosya Yöneticisi</Text>
              <HStack>
                <Tooltip label="Liste Görünümü" aria-label="Liste Görünümü">
                  <IconButton
                    aria-label="Liste Görünümü"
                    icon={<Box>📋</Box>}
                    size="sm"
                    variant={viewMode === 'list' ? 'solid' : 'outline'}
                    onClick={() => setViewMode('list')}
                  />
                </Tooltip>
                <Tooltip label="Izgara Görünümü" aria-label="Izgara Görünümü">
                  <IconButton
                    aria-label="Izgara Görünümü"
                    icon={<Box>📊</Box>}
                    size="sm"
                    variant={viewMode === 'grid' ? 'solid' : 'outline'}
                    onClick={() => setViewMode('grid')}
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Dosya ara"
                  />
                </InputGroup>
                
                <Flex justifyContent="space-between" alignItems="center">
                  <HStack spacing={2} overflowX="auto" py={2} className="file-filters">
                    <Button
                      size="sm"
                      variant={activeFilter === 'all' ? 'solid' : 'outline'}
                      onClick={() => setActiveFilter('all')}
                    >
                      Tümü
                    </Button>
                    <Button
                      size="sm"
                      variant={activeFilter === 'favorites' ? 'solid' : 'outline'}
                      onClick={() => setActiveFilter('favorites')}
                      leftIcon={<Box>⭐</Box>}
                    >
                      Favoriler
                    </Button>
                    <Button
                      size="sm"
                      variant={activeFilter === 'image' ? 'solid' : 'outline'}
                      onClick={() => setActiveFilter('image')}
                      leftIcon={<Box>🖼️</Box>}
                    >
                      Resimler
                    </Button>
                    <Button
                      size="sm"
                      variant={activeFilter === 'document' ? 'solid' : 'outline'}
                      onClick={() => setActiveFilter('document')}
                      leftIcon={<Box>📄</Box>}
                    >
                      Belgeler
                    </Button>
                    <Button
                      size="sm"
                      variant={activeFilter === 'code' ? 'solid' : 'outline'}
                      onClick={() => setActiveFilter('code')}
                      leftIcon={<Box>📝</Box>}
                    >
                      Kod
                    </Button>
                    <Button
                      size="sm"
                      variant={activeFilter === 'video' ? 'solid' : 'outline'}
                      onClick={() => setActiveFilter('video')}
                      leftIcon={<Box>🎬</Box>}
                    >
                      Video
                    </Button>
                    <Button
                      size="sm"
                      variant={activeFilter === 'audio' ? 'solid' : 'outline'}
                      onClick={() => setActiveFilter('audio')}
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
                        onClick={() => handleSortChange('name')}
                        icon={<Box>{sortBy === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ' '}</Box>}
                      >
                        İsme Göre
                      </MenuItem>
                      <MenuItem 
                        onClick={() => handleSortChange('date')}
                        icon={<Box>{sortBy === 'date' ? (sortDirection === 'asc' ? '↑' : '↓') : ' '}</Box>}
                      >
                        Tarihe Göre
                      </MenuItem>
                      <MenuItem 
                        onClick={() => handleSortChange('size')}
                        icon={<Box>{sortBy === 'size' ? (sortDirection === 'asc' ? '↑' : '↓') : ' '}</Box>}
                      >
                        Boyuta Göre
                      </MenuItem>
                      <MenuItem 
                        onClick={() => handleSortChange('type')}
                        icon={<Box>{sortBy === 'type' ? (sortDirection === 'asc' ? '↑' : '↓') : ' '}</Box>}
                      >
                        Türe Göre
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
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
                >
                  {sortedFiles.length > 0 ? (
                    viewMode === 'grid' ? (
                      <Flex flexWrap="wrap" p={2}>
                        {sortedFiles.map(file => (
                          <Box
                            key={file.id}
                            width="120px"
                            height="140px"
                            m={2}
                            p={3}
                            borderWidth="1px"
                            borderRadius="md"
                            borderColor={selectedFile?.id === file.id ? 'blue.500' : 'transparent'}
                            bg={colorMode === 'light' ? 'white' : 'gray.700'}
                            boxShadow="sm"
                            cursor="pointer"
                            onClick={() => handleFileSelect(file)}
                            onDoubleClick={() => handleFileOpen(file)}
                            _hover={{ boxShadow: 'md', borderColor: 'blue.300' }}
                            transition="all 0.2s"
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            position="relative"
                            role="group"
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
                              {getFileTypeIcon(file.type)}
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
                              {formatFileSize(file.size)}
                            </Text>
                          </Box>
                        ))}
                      </Flex>
                    ) : (
                      <Box>
                        {sortedFiles.map(file => (
                          <Flex
                            key={file.id}
                            p={3}
                            borderBottomWidth="1px"
                            bg={selectedFile?.id === file.id 
                              ? (colorMode === 'light' ? 'blue.50' : 'blue.900') 
                              : 'transparent'}
                            cursor="pointer"
                            onClick={() => handleFileSelect(file)}
                            onDoubleClick={() => handleFileOpen(file)}
                            _hover={{
                              bg: colorMode === 'light' ? 'gray.100' : 'gray.700'
                            }}
                            alignItems="center"
                            role="row"
                            aria-label={`Dosya: ${file.name}`}
                          >
                            <Box fontSize="xl" mr={3}>
                              {getFileTypeIcon(file.type)}
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
                                <Text mr={3}>{formatFileSize(file.size)}</Text>
                                <Text>{formatDate(file.lastModified)}</Text>
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
                                  onClick={() => handleFileOpen(file)}
                                >
                                  Aç
                                </MenuItem>
                                <MenuItem 
                                  icon={<Box>✏️</Box>} 
                                  onClick={() => handleRenameStart(file)}
                                >
                                  Yeniden Adlandır
                                </MenuItem>
                                <MenuItem 
                                  icon={<Box>{file.favorite ? '⭐' : '☆'}</Box>} 
                                  onClick={() => handleToggleFavorite(file)}
                                >
                                  {file.favorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                                </MenuItem>
                                <MenuItem 
                                  icon={<Box>🗑️</Box>} 
                                  onClick={() => handleFileDelete(file)}
                                  color="red.500"
                                >
                                  Sil
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Flex>
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
                  <Box 
                    width="300px" 
                    borderWidth="1px" 
                    borderRadius="md" 
                    p={4}
                    overflowY="auto"
                  >
                    <VStack align="stretch" spacing={4}>
                      <Flex justifyContent="center" mb={2}>
                        <Box fontSize="5xl">
                          {getFileTypeIcon(selectedFile.type)}
                        </Box>
                      </Flex>
                      
                      {isRenaming ? (
                        <Box>
                          <InputGroup size="md">
                            <Input
                              ref={renameInputRef}
                              value={newFileName}
                              onChange={(e) => setNewFileName(e.target.value)}
                              onBlur={handleRenameComplete}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleRenameComplete();
                                }
                              }}
                              autoFocus
                            />
                          </InputGroup>
                        </Box>
                      ) : (
                        <Text fontSize="lg" fontWeight="bold" textAlign="center">
                          {selectedFile.name}
                        </Text>
                      )}
                      
                      <Divider />
                      
                      <Box>
                        <Text fontWeight="medium" mb={1}>Dosya Bilgileri</Text>
                        <HStack fontSize="sm">
                          <Text fontWeight="medium" color="gray.500">Tür:</Text>
                          <Text>{selectedFile.type.charAt(0).toUpperCase() + selectedFile.type.slice(1)}</Text>
                        </HStack>
                        <HStack fontSize="sm">
                          <Text fontWeight="medium" color="gray.500">Boyut:</Text>
                          <Text>{formatFileSize(selectedFile.size)}</Text>
                        </HStack>
                        <HStack fontSize="sm">
                          <Text fontWeight="medium" color="gray.500">Değiştirilme:</Text>
                          <Text>{formatDate(selectedFile.lastModified)}</Text>
                        </HStack>
                        <HStack fontSize="sm">
                          <Text fontWeight="medium" color="gray.500">Konum:</Text>
                          <Text noOfLines={1}>{selectedFile.path}</Text>
                        </HStack>
                      </Box>
                      
                      <Divider />
                      
                      <Box>
                        <Flex justifyContent="space-between" alignItems="center" mb={2}>
                          <Text fontWeight="medium">Etiketler</Text>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleToggleFavorite(selectedFile)}
                          >
                            {selectedFile.favorite ? '⭐ Favorilerde' : '☆ Favorilere Ekle'}
                          </Button>
                        </Flex>
                        
                        <Flex flexWrap="wrap" mb={2}>
                          {selectedFile.tags.map(tag => (
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
                                onClick={() => handleRemoveTag(tag)}
                                ml={1}
                              >
                                ✕
                              </Box>
                            </Badge>
                          ))}
                        </Flex>
                        
                        <Flex mt={2}>
                          <Input
                            size="sm"
                            placeholder="Yeni etiket..."
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddTag();
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            ml={2}
                            onClick={handleAddTag}
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
                          onClick={() => handleFileOpen(selectedFile)}
                        >
                          Aç
                        </Button>
                        <Button
                          colorScheme="red"
                          variant="outline"
                          onClick={() => handleFileDelete(selectedFile)}
                        >
                          Sil
                        </Button>
                      </Flex>
                    </VStack>
                  </Box>
                )}
              </Flex>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default FileManager;
