import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  Button,
  Code,
  useColorMode,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { glassmorphism } from '../../styles/themes/creator';
import { KeyboardShortcutProvider, useKeyboardShortcuts } from './KeyboardShortcutContext';
import KeyboardShortcutList from './KeyboardShortcutList';
import KeyboardShortcutRecorder from './KeyboardShortcutRecorder';

// Keyboard shortcut demo component
const KeyboardShortcutDemo: React.FC = () => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const toast = useToast();
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // State
  const [isShortcutListOpen, setIsShortcutListOpen] = useState(false);
  
  return (
    <Box p={4} height="100%">
      <VStack spacing={4} align="stretch" height="100%">
        <Heading size="lg">{t('common.keyboardShortcuts')}</Heading>
        
        <Text>
          {t('common.keyboardShortcutsDescription')}
        </Text>
        
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>{t('common.info')}</AlertTitle>
          <AlertDescription>
            {t('common.keyboardShortcutsInfo')}
          </AlertDescription>
        </Alert>
        
        <Tabs variant="enclosed">
          <TabList>
            <Tab>{t('common.demo')}</Tab>
            <Tab>{t('common.code')}</Tab>
            <Tab>{t('common.api')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <VStack align="stretch" spacing={6}>
                  <Heading size="md">{t('common.keyboardShortcutsDemo')}</Heading>
                  
                  <Text>
                    Click the button below to open the keyboard shortcuts list. You can view, customize, and manage keyboard shortcuts.
                  </Text>
                  
                  <Button
                    colorScheme="blue"
                    onClick={() => setIsShortcutListOpen(true)}
                  >
                    {t('common.openKeyboardShortcuts')}
                  </Button>
                  
                  <Divider />
                  
                  <Heading size="md">{t('common.shortcutRecorderDemo')}</Heading>
                  
                  <Text>
                    Below is a demo of the keyboard shortcut recorder component. Click "Record" to set a new shortcut.
                  </Text>
                  
                  <HStack spacing={4}>
                    <Box flex="1">
                      <Text fontWeight="medium" mb={2}>
                        Save File
                      </Text>
                      <KeyboardShortcutRecorder
                        shortcutId="saveFile"
                      />
                    </Box>
                    
                    <Box flex="1">
                      <Text fontWeight="medium" mb={2}>
                        Open File
                      </Text>
                      <KeyboardShortcutRecorder
                        shortcutId="openFile"
                      />
                    </Box>
                  </HStack>
                  
                  <Text>
                    Try pressing some of the keyboard shortcuts defined in the system:
                  </Text>
                  
                  <VStack align="stretch" spacing={2}>
                    <HStack>
                      <Code>Ctrl+S</Code>
                      <Text>Save file</Text>
                    </HStack>
                    <HStack>
                      <Code>Ctrl+O</Code>
                      <Text>Open file</Text>
                    </HStack>
                    <HStack>
                      <Code>Ctrl+N</Code>
                      <Text>New file</Text>
                    </HStack>
                    <HStack>
                      <Code>Ctrl+,</Code>
                      <Text>Open settings</Text>
                    </HStack>
                    <HStack>
                      <Code>Ctrl+Shift+K</Code>
                      <Text>Open keyboard shortcuts</Text>
                    </HStack>
                  </VStack>
                  
                  <Modal
                    isOpen={isShortcutListOpen}
                    onClose={() => setIsShortcutListOpen(false)}
                    size="xl"
                  >
                    <ModalOverlay />
                    <ModalContent maxWidth="800px" maxHeight="80vh">
                      <ModalHeader>Keyboard Shortcuts</ModalHeader>
                      <ModalCloseButton />
                      <ModalBody p={0} overflow="auto">
                        <KeyboardShortcutList />
                      </ModalBody>
                    </ModalContent>
                  </Modal>
                </VStack>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">{t('common.code')}</Heading>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.basicUsage')}</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { KeyboardShortcutProvider, useKeyboardShortcuts } from '@/components/keyboard-shortcuts';

// Wrap your app with KeyboardShortcutProvider
const App = () => {
  return (
    <KeyboardShortcutProvider>
      <YourApp />
    </KeyboardShortcutProvider>
  );
};

// Use keyboard shortcuts in your components
const YourComponent = () => {
  const { state, setActiveScope } = useKeyboardShortcuts();
  
  // Set active scope when component mounts
  useEffect(() => {
    setActiveScope('editor');
    
    return () => {
      setActiveScope(null);
    };
  }, []);
  
  return (
    <div>
      <p>Press keyboard shortcuts to perform actions</p>
    </div>
  );
};`}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.shortcutRecorderUsage')}</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { KeyboardShortcutRecorder } from '@/components/keyboard-shortcuts';

const YourComponent = () => {
  const handleShortcutChange = (shortcutId, shortcut) => {
    console.log(\`Shortcut changed: \${shortcutId}\`, shortcut);
  };
  
  return (
    <div>
      <h2>Save File Shortcut</h2>
      <KeyboardShortcutRecorder
        shortcutId="saveFile"
        onChange={handleShortcutChange}
      />
    </div>
  );
};`}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.shortcutListUsage')}</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { KeyboardShortcutList } from '@/components/keyboard-shortcuts';

const YourComponent = () => {
  const handleSave = () => {
    console.log('Shortcuts saved');
  };
  
  return (
    <div>
      <h2>Keyboard Shortcuts</h2>
      <KeyboardShortcutList
        onSave={handleSave}
      />
    </div>
  );
};`}
                    </Code>
                  </Box>
                </VStack>
              </Box>
            </TabPanel>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">{t('common.api')}</Heading>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.keyboardShortcutContext')}</Heading>
                    <Text>
                      The keyboard shortcut context provides methods and state for managing keyboard shortcuts.
                    </Text>
                    <Text mt={2}>
                      <strong>{t('common.methods')}:</strong>
                    </Text>
                    <VStack align="stretch" mt={1} pl={4}>
                      <Text>• <strong>getShortcut(shortcutId)</strong>: Get a shortcut by ID</Text>
                      <Text>• <strong>setShortcut(shortcutId, key, modifiers, disabled)</strong>: Set a shortcut</Text>
                      <Text>• <strong>resetShortcut(shortcutId)</strong>: Reset a shortcut to its default value</Text>
                      <Text>• <strong>resetAllShortcuts()</strong>: Reset all shortcuts to their default values</Text>
                      <Text>• <strong>resetGroupShortcuts(groupId)</strong>: Reset all shortcuts in a group</Text>
                      <Text>• <strong>saveShortcuts()</strong>: Save shortcuts to storage</Text>
                      <Text>• <strong>importShortcuts(values)</strong>: Import shortcuts from a values object</Text>
                      <Text>• <strong>exportShortcuts()</strong>: Export shortcuts to a values object</Text>
                      <Text>• <strong>setActiveScope(scope)</strong>: Set the active scope</Text>
                      <Text>• <strong>startRecording(shortcutId)</strong>: Start recording a shortcut</Text>
                      <Text>• <strong>stopRecording()</strong>: Stop recording a shortcut</Text>
                      <Text>• <strong>handleKeyDown(event)</strong>: Handle key down event</Text>
                      <Text>• <strong>formatShortcut(shortcut, options)</strong>: Format a shortcut for display</Text>
                    </VStack>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.keyboardShortcutComponents')}</Heading>
                    <Text>
                      Components provided by the keyboard shortcut system:
                    </Text>
                    <VStack align="stretch" mt={1} pl={4}>
                      <Text>• <strong>KeyboardShortcutProvider</strong>: Provider component for the keyboard shortcut system</Text>
                      <Text>• <strong>KeyboardShortcutRecorder</strong>: Component for recording keyboard shortcuts</Text>
                      <Text>• <strong>KeyboardShortcutList</strong>: Component for displaying and managing keyboard shortcuts</Text>
                    </VStack>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.keyboardShortcutSchema')}</Heading>
                    <Text>
                      The keyboard shortcut schema defines the available shortcuts, groups, and scopes:
                    </Text>
                    <VStack align="stretch" mt={1} pl={4}>
                      <Text>• <strong>groups</strong>: Groups of shortcuts (e.g., General, Navigation, Editing)</Text>
                      <Text>• <strong>scopes</strong>: Scopes where shortcuts are active (e.g., Global, Editor, File Manager)</Text>
                      <Text>• <strong>shortcuts</strong>: Shortcut definitions with default key combinations and actions</Text>
                    </VStack>
                  </Box>
                </VStack>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
        
        <Divider />
        
        <Box>
          <Heading size="md" mb={4}>{t('common.details')}</Heading>
          
          <VStack align="stretch" spacing={3}>
            <Text>
              {t('common.keyboardShortcutsDetails')}
            </Text>
            
            <Box pl={4}>
              <Text>• <strong>{t('common.shortcutManagement')}</strong>: {t('common.shortcutManagementDescription')}</Text>
              <Text>• <strong>{t('common.shortcutCustomization')}</strong>: {t('common.shortcutCustomizationDescription')}</Text>
              <Text>• <strong>{t('common.shortcutScopes')}</strong>: {t('common.shortcutScopesDescription')}</Text>
              <Text>• <strong>{t('common.shortcutGroups')}</strong>: {t('common.shortcutGroupsDescription')}</Text>
              <Text>• <strong>{t('common.shortcutPersistence')}</strong>: {t('common.shortcutPersistenceDescription')}</Text>
            </Box>
            
            <Text>
              {t('common.keyboardShortcutsFeatures')}
            </Text>
            
            <Box pl={4}>
              <Text>• {t('common.shortcutRecording')}</Text>
              <Text>• {t('common.shortcutFiltering')}</Text>
              <Text>• {t('common.shortcutSearch')}</Text>
              <Text>• {t('common.shortcutReset')}</Text>
              <Text>• {t('common.shortcutImportExport')}</Text>
              <Text>• {t('common.shortcutConflictDetection')}</Text>
              <Text>• {t('common.shortcutFormatting')}</Text>
              <Text>• {t('common.platformSpecificShortcuts')}</Text>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

// Wrap with KeyboardShortcutProvider
const KeyboardShortcutDemoWithProvider: React.FC = () => {
  return (
    <KeyboardShortcutProvider>
      <KeyboardShortcutDemo />
    </KeyboardShortcutProvider>
  );
};

export default KeyboardShortcutDemoWithProvider;
