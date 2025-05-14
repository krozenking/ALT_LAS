import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  Text,
  Button,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Switch,
  Divider,
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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Collapse,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { useSettings } from './SettingsContext';
import SettingField from './SettingField';
import { SettingGroup, SettingsValues } from './types';
import { glassmorphism } from '../../styles/themes/creator';

// Settings panel props
export interface SettingsPanelProps {
  /**
   * Whether the panel is open
   */
  isOpen?: boolean;
  /**
   * On close callback
   */
  onClose?: () => void;
  /**
   * On setting change callback
   */
  onSettingChange?: (groupId: string, settingId: string, value: any) => void;
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
  onImport?: (values: SettingsValues) => void;
  /**
   * On export callback
   */
  onExport?: (values: SettingsValues) => void;
}

/**
 * Settings panel component
 */
const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen = false,
  onClose,
  onSettingChange,
  onSave,
  onReset,
  onImport,
  onExport,
}) => {
  const {
    state,
    dispatch,
    saveSettings,
    resetAllSettings,
    resetGroupSettings,
    importSettings,
    exportSettings,
    isGroupVisible,
    isSettingVisible,
  } = useSettings();
  const { colorMode } = useColorMode();
  const toast = useToast();
  
  // Local state
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showExperimental, setShowExperimental] = useState(false);
  const [showDeprecated, setShowDeprecated] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<'all' | string>('all');
  const [showRestartAlert, setShowRestartAlert] = useState(false);
  const [showReloadAlert, setShowReloadAlert] = useState(false);
  
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
        showAdvanced,
        showExperimental,
        showDeprecated,
      },
    });
  }, [searchTerm, showAdvanced, showExperimental, showDeprecated, dispatch]);
  
  // Show restart/reload alerts when needed
  useEffect(() => {
    setShowRestartAlert(state.requiresRestart);
    setShowReloadAlert(state.requiresReload && !state.requiresRestart);
  }, [state.requiresRestart, state.requiresReload]);
  
  // Get visible groups
  const visibleGroups = state.schema.groups
    .filter(group => isGroupVisible(group.id))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  
  // Handle setting change
  const handleSettingChange = (groupId: string, settingId: string, value: any) => {
    if (onSettingChange) {
      onSettingChange(groupId, settingId, value);
    }
  };
  
  // Handle save
  const handleSave = async () => {
    try {
      await saveSettings();
      
      toast({
        title: 'Settings saved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      toast({
        title: 'Failed to save settings',
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
  const handleResetConfirm = async () => {
    try {
      if (resetTarget === 'all') {
        await resetAllSettings();
      } else {
        await resetGroupSettings(resetTarget);
      }
      
      setIsResetModalOpen(false);
      
      toast({
        title: resetTarget === 'all' ? 'All settings reset' : 'Group settings reset',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      if (onReset) {
        onReset();
      }
    } catch (error) {
      toast({
        title: 'Failed to reset settings',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle import
  const handleImport = async () => {
    try {
      // In a real application, this would open a file picker
      // For this demo, we'll just import the current settings
      const values = await exportSettings();
      await importSettings(values);
      
      toast({
        title: 'Settings imported',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      if (onImport) {
        onImport(values);
      }
    } catch (error) {
      toast({
        title: 'Failed to import settings',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle export
  const handleExport = async () => {
    try {
      const values = await exportSettings();
      
      // In a real application, this would download a file
      // For this demo, we'll just log the values
      console.log('Exported settings:', values);
      
      toast({
        title: 'Settings exported',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      if (onExport) {
        onExport(values);
      }
    } catch (error) {
      toast({
        title: 'Failed to export settings',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // If panel is not open, return null
  if (!isOpen) {
    return null;
  }
  
  return (
    <Box
      position="fixed"
      top={0}
      right={0}
      bottom={0}
      width="600px"
      zIndex={9999}
      boxShadow="lg"
      display="flex"
      flexDirection="column"
      {...glassStyle}
    >
      {/* Header */}
      <Flex
        p={4}
        borderBottomWidth="1px"
        borderBottomColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
        justifyContent="space-between"
        alignItems="center"
      >
        <Heading size="lg">Settings</Heading>
        
        <IconButton
          aria-label="Close settings"
          icon={'✖️'}
          variant="ghost"
          onClick={onClose}
        />
      </Flex>
      
      {/* Alerts */}
      <Collapse in={showRestartAlert || showReloadAlert} animateOpacity>
        <Alert
          status="warning"
          variant="solid"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          p={4}
        >
          <AlertIcon boxSize="24px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            {showRestartAlert ? 'Restart Required' : 'Reload Required'}
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            {showRestartAlert
              ? 'Some changes require restarting the application to take effect.'
              : 'Some changes require reloading the application to take effect.'}
          </AlertDescription>
          <Button
            colorScheme="orange"
            variant="outline"
            size="sm"
            mt={4}
            onClick={() => {
              // In a real application, this would restart or reload the app
              toast({
                title: showRestartAlert ? 'Application restart' : 'Application reload',
                description: 'This is a demo. In a real application, this would restart or reload the app.',
                status: 'info',
                duration: 5000,
                isClosable: true,
              });
            }}
          >
            {showRestartAlert ? 'Restart Now' : 'Reload Now'}
          </Button>
        </Alert>
      </Collapse>
      
      {/* Search and filters */}
      <Box p={4} borderBottomWidth="1px" borderBottomColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}>
        <InputGroup mb={4}>
          <InputLeftElement pointerEvents="none">
            🔍
          </InputLeftElement>
          <Input
            placeholder="Search settings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        
        <HStack spacing={4}>
          <HStack>
            <Text fontSize="sm">Show Advanced</Text>
            <Switch
              isChecked={showAdvanced}
              onChange={(e) => setShowAdvanced(e.target.checked)}
              colorScheme="purple"
              size="sm"
            />
          </HStack>
          
          <HStack>
            <Text fontSize="sm">Show Experimental</Text>
            <Switch
              isChecked={showExperimental}
              onChange={(e) => setShowExperimental(e.target.checked)}
              colorScheme="orange"
              size="sm"
            />
          </HStack>
          
          <HStack>
            <Text fontSize="sm">Show Deprecated</Text>
            <Switch
              isChecked={showDeprecated}
              onChange={(e) => setShowDeprecated(e.target.checked)}
              colorScheme="red"
              size="sm"
            />
          </HStack>
        </HStack>
      </Box>
      
      {/* Settings content */}
      <Box flex="1" overflow="auto">
        {state.loading ? (
          <Flex height="100%" alignItems="center" justifyContent="center">
            <Text>Loading settings...</Text>
          </Flex>
        ) : state.error ? (
          <Flex height="100%" alignItems="center" justifyContent="center">
            <Text color="red.500">{state.error}</Text>
          </Flex>
        ) : visibleGroups.length === 0 ? (
          <Flex height="100%" alignItems="center" justifyContent="center" flexDirection="column" p={4}>
            <Text fontSize="lg" fontWeight="medium" mb={2}>
              No settings found
            </Text>
            <Text color={colorMode === 'light' ? 'gray.600' : 'gray.400'} textAlign="center">
              {searchTerm
                ? `No settings match the search term "${searchTerm}"`
                : 'No settings available'}
            </Text>
          </Flex>
        ) : (
          <Tabs
            variant="line"
            colorScheme="blue"
            index={activeTab}
            onChange={setActiveTab}
            isLazy
          >
            <TabList px={4} overflowX="auto" overflowY="hidden" whiteSpace="nowrap">
              {visibleGroups.map((group, index) => (
                <Tab key={group.id}>
                  <HStack spacing={2}>
                    {group.icon && (
                      <Box fontSize="lg">{group.icon}</Box>
                    )}
                    <Text>{group.label}</Text>
                  </HStack>
                </Tab>
              ))}
            </TabList>
            
            <TabPanels>
              {visibleGroups.map((group) => (
                <TabPanel key={group.id} p={4}>
                  <Box mb={4}>
                    <HStack justify="space-between" mb={2}>
                      <Heading size="md">{group.label}</Heading>
                      
                      <Tooltip label="Reset group settings">
                        <IconButton
                          aria-label="Reset group settings"
                          icon={'🔄'}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleGroupReset(group.id)}
                        />
                      </Tooltip>
                    </HStack>
                    
                    {group.description && (
                      <Text color={colorMode === 'light' ? 'gray.600' : 'gray.400'} mb={4}>
                        {group.description}
                      </Text>
                    )}
                  </Box>
                  
                  <Divider mb={4} />
                  
                  {group.settings
                    .filter(setting => isSettingVisible(group.id, setting.id))
                    .map((setting) => (
                      <SettingField
                        key={setting.id}
                        groupId={group.id}
                        settingId={setting.id}
                        setting={setting}
                        onChange={handleSettingChange}
                      />
                    ))}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        )}
      </Box>
      
      {/* Footer */}
      <Flex
        p={4}
        borderTopWidth="1px"
        borderTopColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
        justifyContent="space-between"
      >
        <HStack spacing={2}>
          <Button
            colorScheme="red"
            variant="outline"
            onClick={handleReset}
          >
            Reset
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
      </Flex>
      
      {/* Reset confirmation modal */}
      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {resetTarget === 'all' ? 'Reset All Settings' : 'Reset Group Settings'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              {resetTarget === 'all'
                ? 'Are you sure you want to reset all settings to their default values?'
                : `Are you sure you want to reset the "${visibleGroups.find(g => g.id === resetTarget)?.label}" group settings to their default values?`}
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

export default SettingsPanel;
