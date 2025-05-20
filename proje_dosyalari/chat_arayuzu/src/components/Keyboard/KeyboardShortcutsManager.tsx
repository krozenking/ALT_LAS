import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  VStack,
  Badge,
  IconButton,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon, RepeatIcon } from '@chakra-ui/icons';
import useTranslation from '../../hooks/useTranslation';

// Klavye kısayolu tipi
interface KeyboardShortcut {
  id: string;
  key: string;
  description: string;
  category: string;
  isEnabled: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

interface KeyboardShortcutsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
  onUpdateShortcut: (id: string, shortcut: Partial<KeyboardShortcut>) => void;
  onToggleShortcut: (id: string, isEnabled: boolean) => void;
  onResetShortcuts: () => void;
  onAddShortcut?: (shortcut: Omit<KeyboardShortcut, 'id'>) => void;
  onRemoveShortcut?: (id: string) => void;
}

const KeyboardShortcutsManager: React.FC<KeyboardShortcutsManagerProps> = ({
  isOpen,
  onClose,
  shortcuts,
  onUpdateShortcut,
  onToggleShortcut,
  onResetShortcuts,
  onAddShortcut,
  onRemoveShortcut
}) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingShortcut, setEditingShortcut] = useState<KeyboardShortcut | null>(null);
  const [recordingKey, setRecordingKey] = useState(false);
  const [newShortcut, setNewShortcut] = useState<Omit<KeyboardShortcut, 'id'>>({
    key: '',
    description: '',
    category: 'system',
    isEnabled: true,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false
  });
  
  const { 
    isOpen: isEditModalOpen, 
    onOpen: onEditModalOpen, 
    onClose: onEditModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isAddModalOpen, 
    onOpen: onAddModalOpen, 
    onClose: onAddModalClose 
  } = useDisclosure();
  
  // Renk değişkenleri
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  // Kategorileri al
  const categories = Array.from(new Set(shortcuts.map(s => s.category)));
  
  // Filtrelenmiş kısayollar
  const filteredShortcuts = shortcuts.filter(shortcut => {
    const matchesFilter = 
      shortcut.description.toLowerCase().includes(filter.toLowerCase()) ||
      shortcut.key.toLowerCase().includes(filter.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || shortcut.category === categoryFilter;
    
    return matchesFilter && matchesCategory;
  });
  
  // Kısayol düzenleme
  const handleEditShortcut = (shortcut: KeyboardShortcut) => {
    setEditingShortcut(shortcut);
    onEditModalOpen();
  };
  
  // Kısayol silme
  const handleRemoveShortcut = (id: string) => {
    if (onRemoveShortcut) {
      onRemoveShortcut(id);
    }
  };
  
  // Kısayol etkinleştirme/devre dışı bırakma
  const handleToggleShortcut = (id: string, isEnabled: boolean) => {
    onToggleShortcut(id, isEnabled);
  };
  
  // Kısayol kaydetme
  const handleSaveShortcut = () => {
    if (editingShortcut) {
      onUpdateShortcut(editingShortcut.id, editingShortcut);
      setEditingShortcut(null);
      onEditModalClose();
    }
  };
  
  // Yeni kısayol ekleme
  const handleAddShortcut = () => {
    if (onAddShortcut && newShortcut.key && newShortcut.description) {
      onAddShortcut(newShortcut);
      setNewShortcut({
        key: '',
        description: '',
        category: 'system',
        isEnabled: true,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false
      });
      onAddModalClose();
    }
  };
  
  // Tuş kaydı
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (recordingKey) {
      e.preventDefault();
      
      if (e.key === 'Escape') {
        setRecordingKey(false);
        return;
      }
      
      if (e.key === 'Backspace') {
        if (editingShortcut) {
          setEditingShortcut({
            ...editingShortcut,
            key: '',
            ctrlKey: false,
            shiftKey: false,
            altKey: false,
            metaKey: false
          });
        } else {
          setNewShortcut({
            ...newShortcut,
            key: '',
            ctrlKey: false,
            shiftKey: false,
            altKey: false,
            metaKey: false
          });
        }
        setRecordingKey(false);
        return;
      }
      
      // Modifier tuşlarını yoksay
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        return;
      }
      
      if (editingShortcut) {
        setEditingShortcut({
          ...editingShortcut,
          key: e.key,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
          altKey: e.altKey,
          metaKey: e.metaKey
        });
      } else {
        setNewShortcut({
          ...newShortcut,
          key: e.key,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
          altKey: e.altKey,
          metaKey: e.metaKey
        });
      }
      
      setRecordingKey(false);
    }
  };
  
  // Kısayol gösterimi
  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const parts = [];
    
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.metaKey) parts.push('Meta');
    
    parts.push(shortcut.key.toUpperCase());
    
    return parts.join(' + ');
  };
  
  // Kategori etiketi
  const getCategoryBadge = (category: string) => {
    let colorScheme = 'gray';
    
    switch (category) {
      case 'navigation':
        colorScheme = 'blue';
        break;
      case 'editing':
        colorScheme = 'green';
        break;
      case 'system':
        colorScheme = 'purple';
        break;
      case 'accessibility':
        colorScheme = 'orange';
        break;
      case 'chat':
        colorScheme = 'teal';
        break;
    }
    
    return (
      <Badge colorScheme={colorScheme} fontSize="xs">
        {t(`keyboard.categories.${category}`)}
      </Badge>
    );
  };
  
  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size="lg"
      >
        <DrawerOverlay />
        <DrawerContent bg={bgColor}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
            {t('keyboard.manager')}
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <Flex mb={4}>
                <Input
                  placeholder={t('keyboard.search')}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  mr={2}
                />
                
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  width="200px"
                >
                  <option value="all">{t('keyboard.allCategories')}</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {t(`keyboard.categories.${category}`)}
                    </option>
                  ))}
                </Select>
              </Flex>
              
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>{t('keyboard.shortcut')}</Th>
                      <Th>{t('keyboard.description')}</Th>
                      <Th>{t('keyboard.category')}</Th>
                      <Th>{t('keyboard.enabled')}</Th>
                      <Th>{t('common.actions')}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredShortcuts.map(shortcut => (
                      <Tr 
                        key={shortcut.id}
                        _hover={{ bg: hoverBg }}
                      >
                        <Td>
                          <Text fontFamily="monospace" fontWeight="bold">
                            {formatShortcut(shortcut)}
                          </Text>
                        </Td>
                        <Td>{shortcut.description}</Td>
                        <Td>{getCategoryBadge(shortcut.category)}</Td>
                        <Td>
                          <Switch
                            isChecked={shortcut.isEnabled}
                            onChange={(e) => handleToggleShortcut(shortcut.id, e.target.checked)}
                            colorScheme="blue"
                          />
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <Tooltip label={t('common.edit')}>
                              <IconButton
                                aria-label={t('common.edit')}
                                icon={<EditIcon />}
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditShortcut(shortcut)}
                              />
                            </Tooltip>
                            
                            {onRemoveShortcut && (
                              <Tooltip label={t('common.delete')}>
                                <IconButton
                                  aria-label={t('common.delete')}
                                  icon={<DeleteIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleRemoveShortcut(shortcut.id)}
                                />
                              </Tooltip>
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              
              {filteredShortcuts.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Text color="gray.500">{t('keyboard.noShortcuts')}</Text>
                </Box>
              )}
            </VStack>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px" borderColor={borderColor}>
            <Button
              leftIcon={<RepeatIcon />}
              variant="outline"
              mr={3}
              onClick={onResetShortcuts}
            >
              {t('keyboard.resetToDefault')}
            </Button>
            
            {onAddShortcut && (
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                onClick={onAddModalOpen}
                mr={3}
              >
                {t('keyboard.addShortcut')}
              </Button>
            )}
            
            <Button onClick={onClose}>
              {t('common.close')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      
      {/* Kısayol Düzenleme Modalı */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose}>
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader>{t('keyboard.editShortcut')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editingShortcut && (
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>{t('keyboard.shortcut')}</FormLabel>
                  <Flex>
                    <Input
                      value={formatShortcut(editingShortcut)}
                      readOnly
                      onKeyDown={handleKeyDown}
                      onClick={() => setRecordingKey(true)}
                      placeholder={t('keyboard.pressKeys')}
                      bg={recordingKey ? 'red.50' : undefined}
                      _dark={{
                        bg: recordingKey ? 'red.900' : undefined
                      }}
                      mr={2}
                    />
                    <Button
                      onClick={() => setRecordingKey(!recordingKey)}
                      colorScheme={recordingKey ? 'red' : 'blue'}
                    >
                      {recordingKey ? t('keyboard.recording') : t('keyboard.record')}
                    </Button>
                  </Flex>
                </FormControl>
                
                <FormControl>
                  <FormLabel>{t('keyboard.description')}</FormLabel>
                  <Input
                    value={editingShortcut.description}
                    onChange={(e) => setEditingShortcut({
                      ...editingShortcut,
                      description: e.target.value
                    })}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>{t('keyboard.category')}</FormLabel>
                  <Select
                    value={editingShortcut.category}
                    onChange={(e) => setEditingShortcut({
                      ...editingShortcut,
                      category: e.target.value
                    })}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {t(`keyboard.categories.${category}`)}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="is-enabled" mb="0">
                    {t('keyboard.enabled')}
                  </FormLabel>
                  <Switch
                    id="is-enabled"
                    isChecked={editingShortcut.isEnabled}
                    onChange={(e) => setEditingShortcut({
                      ...editingShortcut,
                      isEnabled: e.target.checked
                    })}
                    colorScheme="blue"
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onEditModalClose}>
              {t('common.cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleSaveShortcut}>
              {t('common.save')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Yeni Kısayol Ekleme Modalı */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose}>
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader>{t('keyboard.addShortcut')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>{t('keyboard.shortcut')}</FormLabel>
                <Flex>
                  <Input
                    value={formatShortcut(newShortcut as KeyboardShortcut)}
                    readOnly
                    onKeyDown={handleKeyDown}
                    onClick={() => setRecordingKey(true)}
                    placeholder={t('keyboard.pressKeys')}
                    bg={recordingKey ? 'red.50' : undefined}
                    _dark={{
                      bg: recordingKey ? 'red.900' : undefined
                    }}
                    mr={2}
                  />
                  <Button
                    onClick={() => setRecordingKey(!recordingKey)}
                    colorScheme={recordingKey ? 'red' : 'blue'}
                  >
                    {recordingKey ? t('keyboard.recording') : t('keyboard.record')}
                  </Button>
                </Flex>
              </FormControl>
              
              <FormControl>
                <FormLabel>{t('keyboard.description')}</FormLabel>
                <Input
                  value={newShortcut.description}
                  onChange={(e) => setNewShortcut({
                    ...newShortcut,
                    description: e.target.value
                  })}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>{t('keyboard.category')}</FormLabel>
                <Select
                  value={newShortcut.category}
                  onChange={(e) => setNewShortcut({
                    ...newShortcut,
                    category: e.target.value
                  })}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {t(`keyboard.categories.${category}`)}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="new-is-enabled" mb="0">
                  {t('keyboard.enabled')}
                </FormLabel>
                <Switch
                  id="new-is-enabled"
                  isChecked={newShortcut.isEnabled}
                  onChange={(e) => setNewShortcut({
                    ...newShortcut,
                    isEnabled: e.target.checked
                  })}
                  colorScheme="blue"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onAddModalClose}>
              {t('common.cancel')}
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleAddShortcut}
              isDisabled={!newShortcut.key || !newShortcut.description}
            >
              {t('common.add')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default KeyboardShortcutsManager;
