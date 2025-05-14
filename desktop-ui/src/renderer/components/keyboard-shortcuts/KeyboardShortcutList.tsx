import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Switch,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorMode,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
} from '@chakra-ui/react';
import { useKeyboardShortcuts } from './KeyboardShortcutContext';
import KeyboardShortcutRecorder from './KeyboardShortcutRecorder';
import { KeyboardShortcut } from './types';
import { glassmorphism } from '../../styles/themes/creator';

// Keyboard shortcut list props
export interface KeyboardShortcutListProps {
  /**
   * On save callback
   */
  onSave?: () => void;
  /**
   * On reset callback
   */
  onReset?: () => void;
  /**
   * On import callback
   */
  onImport?: () => void;
  /**
   * On export callback
   */
  onExport?: () => void;
}

/**
 * Keyboard shortcut list component
 */
const KeyboardShortcutList: React.FC<KeyboardShortcutListProps> = ({
  onSave,
  onReset,
  onImport,
  onExport,
}) => {
  const {
    state,
    dispatch,
    getShortcut,
    resetAllShortcuts,
    resetGroupShortcuts,
    saveShortcuts,
  } = useKeyboardShortcuts();
  const { colorMode } = useColorMode();
  const toast = useToast();
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedScope, setSelectedScope] = useState<string>('');
  const [showCustom, setShowCustom] = useState(true);
  const [showDefault, setShowDefault] = useState(true);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<'all' | string>('all');
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // Update filter when search term or filter options change
  useEffect(() => {
    dispatch({
      type: 'SET_FILTER',
      payload: {
        searchTerm,
        group: selectedGroup || undefined,
        scope: selectedScope || undefined,
        showCustom,
        showDefault,
      },
    });
  }, [searchTerm, selectedGroup, selectedScope, showCustom, showDefault, dispatch]);
  
  // Get filtered shortcuts
  const getFilteredShortcuts = () => {
    return state.schema.shortcuts.filter(shortcut => {
      // Get custom shortcut
      const customShortcut = state.values.shortcuts[shortcut.id];
      const isCustom = !!customShortcut;
      
      // Filter by custom/default
      if (isCustom && !showCustom) {
        return false;
      }
      
      if (!isCustom && !showDefault) {
        return false;
      }
      
      // Filter by group
      if (selectedGroup && shortcut.group !== selectedGroup) {
        return false;
      }
      
      // Filter by scope
      if (selectedScope && shortcut.scope !== selectedScope) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          shortcut.id.toLowerCase().includes(searchLower) ||
          shortcut.description.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  };
  
  // Get shortcuts by group
  const getShortcutsByGroup = () => {
    const filteredShortcuts = getFilteredShortcuts();
    const shortcutsByGroup: Record<string, KeyboardShortcut[]> = {};
    
    // Group shortcuts by group
    filteredShortcuts.forEach(shortcut => {
      if (!shortcutsByGroup[shortcut.group]) {
        shortcutsByGroup[shortcut.group] = [];
      }
      
      shortcutsByGroup[shortcut.group].push(shortcut);
    });
    
    return shortcutsByGroup;
  };
  
  // Get group label
  const getGroupLabel = (groupId: string) => {
    const group = state.schema.groups.find(group => group.id === groupId);
    return group ? group.label : groupId;
  };
  
  // Get scope label
  const getScopeLabel = (scopeId: string) => {
    const scope = state.schema.scopes.find(scope => scope.id === scopeId);
    return scope ? scope.label : scopeId;
  };
  
  // Handle save
  const handleSave = async () => {
    try {
      await saveShortcuts();
      
      toast({
        title: 'Keyboard shortcuts saved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      toast({
        title: 'Failed to save keyboard shortcuts',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle reset
  const handleReset = () => {
    setIsResetModalOpen(true);
    setResetTarget('all');
  };
  
  // Handle group reset
  const handleGroupReset = (groupId: string) => {
    setIsResetModalOpen(true);
    setResetTarget(groupId);
  };
  
  // Handle reset confirm
  const handleResetConfirm = () => {
    if (resetTarget === 'all') {
      resetAllShortcuts();
    } else {
      resetGroupShortcuts(resetTarget);
    }
    
    setIsResetModalOpen(false);
    
    toast({
      title: resetTarget === 'all' ? 'All shortcuts reset' : `${getGroupLabel(resetTarget)} shortcuts reset`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    if (onReset) {
      onReset();
    }
  };
  
  // Handle import
  const handleImport = () => {
    // In a real application, this would open a file picker
    // For this demo, we'll just show a toast
    toast({
      title: 'Import keyboard shortcuts',
      description: 'This is a demo. In a real application, this would open a file picker.',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
    
    if (onImport) {
      onImport();
    }
  };
  
  // Handle export
  const handleExport = () => {
    // In a real application, this would download a file
    // For this demo, we'll just show a toast
    toast({
      title: 'Export keyboard shortcuts',
      description: 'This is a demo. In a real application, this would download a file.',
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
    
    if (onExport) {
      onExport();
    }
  };
  
  // Get shortcuts by group
  const shortcutsByGroup = getShortcutsByGroup();
  
  // Get groups
  const groups = Object.keys(shortcutsByGroup).sort((a, b) => {
    const groupA = state.schema.groups.find(group => group.id === a);
    const groupB = state.schema.groups.find(group => group.id === b);
    
    return (groupA?.order || 0) - (groupB?.order || 0);
  });
  
  return (
    <Box>
      {/* Filters */}
      <Box p={4} borderBottomWidth="1px" borderBottomColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}>
        <VStack spacing={4} align="stretch">
          {/* Search */}
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              🔍
            </InputLeftElement>
            <Input
              placeholder="Search shortcuts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <HStack spacing={4}>
            {/* Group filter */}
            <Select
              placeholder="All groups"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              {state.schema.groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.icon} {group.label}
                </option>
              ))}
            </Select>
            
            {/* Scope filter */}
            <Select
              placeholder="All scopes"
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
            >
              {state.schema.scopes.map(scope => (
                <option key={scope.id} value={scope.id}>
                  {scope.icon} {scope.label}
                </option>
              ))}
            </Select>
          </HStack>
          
          <HStack spacing={4}>
            {/* Show custom */}
            <HStack>
              <Text fontSize="sm">Show Custom</Text>
              <Switch
                isChecked={showCustom}
                onChange={(e) => setShowCustom(e.target.checked)}
                colorScheme="blue"
                size="sm"
              />
            </HStack>
            
            {/* Show default */}
            <HStack>
              <Text fontSize="sm">Show Default</Text>
              <Switch
                isChecked={showDefault}
                onChange={(e) => setShowDefault(e.target.checked)}
                colorScheme="blue"
                size="sm"
              />
            </HStack>
          </HStack>
        </VStack>
      </Box>
      
      {/* Shortcuts */}
      <Box p={4}>
        {groups.length === 0 ? (
          <Box
            p={4}
            borderRadius="md"
            borderWidth="1px"
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
            textAlign="center"
          >
            <Text>No shortcuts found</Text>
          </Box>
        ) : (
          <Accordion allowMultiple defaultIndex={[0]}>
            {groups.map(groupId => (
              <AccordionItem key={groupId}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <Text fontWeight="bold">
                        {getGroupLabel(groupId)}
                      </Text>
                      <Badge colorScheme="blue" borderRadius="full">
                        {shortcutsByGroup[groupId].length}
                      </Badge>
                    </HStack>
                  </Box>
                  <Button
                    size="xs"
                    colorScheme="red"
                    variant="outline"
                    mr={2}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGroupReset(groupId);
                    }}
                  >
                    Reset
                  </Button>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Command</Th>
                        <Th>Shortcut</Th>
                        <Th>Scope</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {shortcutsByGroup[groupId].map(shortcut => {
                        const shortcutWithCustom = getShortcut(shortcut.id);
                        
                        return (
                          <Tr key={shortcut.id}>
                            <Td>
                              <Text fontWeight="medium">
                                {shortcut.description}
                              </Text>
                              {shortcutWithCustom?.isCustom && (
                                <Badge colorScheme="blue" ml={2}>
                                  Custom
                                </Badge>
                              )}
                            </Td>
                            <Td>
                              <KeyboardShortcutRecorder
                                shortcutId={shortcut.id}
                                width="200px"
                              />
                            </Td>
                            <Td>
                              <Badge colorScheme={shortcut.scope === 'global' ? 'green' : 'purple'}>
                                {getScopeLabel(shortcut.scope || 'global')}
                              </Badge>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </Box>
      
      {/* Actions */}
      <Box
        p={4}
        borderTopWidth="1px"
        borderTopColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      >
        <HStack spacing={2} justifyContent="space-between">
          <HStack spacing={2}>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={handleReset}
            >
              Reset All
            </Button>
            
            <Button
              variant="outline"
              onClick={handleImport}
            >
              Import
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExport}
            >
              Export
            </Button>
          </HStack>
          
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isDisabled={!state.modified}
          >
            Save
          </Button>
        </HStack>
      </Box>
      
      {/* Reset confirmation modal */}
      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {resetTarget === 'all' ? 'Reset All Shortcuts' : `Reset ${getGroupLabel(resetTarget)} Shortcuts`}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              {resetTarget === 'all'
                ? 'Are you sure you want to reset all keyboard shortcuts to their default values?'
                : `Are you sure you want to reset the "${getGroupLabel(resetTarget)}" keyboard shortcuts to their default values?`}
            </Text>
            <Text mt={2} fontWeight="bold" color="red.500">
              This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleResetConfirm}>
              Reset
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default KeyboardShortcutList;
