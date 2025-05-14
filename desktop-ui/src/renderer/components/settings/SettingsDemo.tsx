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
import { SettingsProvider, useSettings } from './SettingsContext';
import SettingsPanel from './SettingsPanel';

// Settings demo component
const SettingsDemo: React.FC = () => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const toast = useToast();
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // State
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  
  // Handle setting change
  const handleSettingChange = (groupId: string, settingId: string, value: any) => {
    toast({
      title: 'Setting changed',
      description: `${groupId}.${settingId} = ${JSON.stringify(value)}`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  return (
    <Box p={4} height="100%">
      <VStack spacing={4} align="stretch" height="100%">
        <Heading size="lg">{t('common.settings')}</Heading>
        
        <Text>
          {t('common.settingsDescription')}
        </Text>
        
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>{t('common.info')}</AlertTitle>
          <AlertDescription>
            {t('common.settingsInfo')}
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
                  <Heading size="md">{t('common.settingsDemo')}</Heading>
                  
                  <Text>
                    Click the button below to open the settings panel. You can change settings, save them, reset them, and more.
                  </Text>
                  
                  <Button
                    colorScheme="blue"
                    onClick={() => setIsSettingsPanelOpen(true)}
                  >
                    {t('common.openSettings')}
                  </Button>
                  
                  <SettingsPanel
                    isOpen={isSettingsPanelOpen}
                    onClose={() => setIsSettingsPanelOpen(false)}
                    onSettingChange={handleSettingChange}
                  />
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
{`import { SettingsProvider, useSettings } from '@/components/settings';

// Wrap your app with SettingsProvider
const App = () => {
  return (
    <SettingsProvider>
      <YourApp />
    </SettingsProvider>
  );
};

// Use settings in your components
const YourComponent = () => {
  const { getSettingValue, setSettingValue } = useSettings();
  
  // Get a setting value
  const theme = getSettingValue('general', 'theme', 'light');
  
  // Set a setting value
  const handleThemeChange = (newTheme) => {
    setSettingValue('general', 'theme', newTheme);
  };
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => handleThemeChange('dark')}>
        Switch to Dark Theme
      </button>
    </div>
  );
};`}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.settingsPanelUsage')}</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`import { SettingsPanel } from '@/components/settings';

const YourComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSettingChange = (groupId, settingId, value) => {
    console.log(\`Setting changed: \${groupId}.\${settingId} = \${value}\`);
  };
  
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Open Settings
      </button>
      
      <SettingsPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSettingChange={handleSettingChange}
      />
    </div>
  );
};`}
                    </Code>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.customSettingsSchema')}</Heading>
                    <Code p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
{`// In your SettingsStorage.ts file
async loadSchema(): Promise<SettingsSchema> {
  return {
    version: '1.0.0',
    groups: [
      {
        id: 'general',
        label: 'General',
        icon: '⚙️',
        settings: [
          {
            id: 'theme',
            label: 'Theme',
            description: 'Application theme',
            type: 'select',
            defaultValue: 'light',
            options: [
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
              { label: 'System', value: 'system' },
            ],
          },
          // More settings...
        ],
      },
      // More groups...
    ],
  };
}`}
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
                    <Heading size="sm" mb={2}>{t('common.settingsContext')}</Heading>
                    <Text>
                      The settings context provides methods and state for managing settings.
                    </Text>
                    <Text mt={2}>
                      <strong>{t('common.methods')}:</strong>
                    </Text>
                    <VStack align="stretch" mt={1} pl={4}>
                      <Text>• <strong>getSettingValue(groupId, settingId, defaultValue)</strong>: Get a setting value</Text>
                      <Text>• <strong>setSettingValue(groupId, settingId, value)</strong>: Set a setting value</Text>
                      <Text>• <strong>resetSettingValue(groupId, settingId)</strong>: Reset a setting to its default value</Text>
                      <Text>• <strong>resetAllSettings()</strong>: Reset all settings to their default values</Text>
                      <Text>• <strong>resetGroupSettings(groupId)</strong>: Reset all settings in a group</Text>
                      <Text>• <strong>saveSettings()</strong>: Save settings to storage</Text>
                      <Text>• <strong>importSettings(values)</strong>: Import settings from a values object</Text>
                      <Text>• <strong>exportSettings()</strong>: Export settings to a values object</Text>
                    </VStack>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.settingTypes')}</Heading>
                    <Text>
                      Supported setting types:
                    </Text>
                    <VStack align="stretch" mt={1} pl={4}>
                      <Text>• <strong>string</strong>: Text input</Text>
                      <Text>• <strong>number</strong>: Number input with optional slider</Text>
                      <Text>• <strong>boolean</strong>: Toggle switch</Text>
                      <Text>• <strong>select</strong>: Dropdown select</Text>
                      <Text>• <strong>multiselect</strong>: Multiple checkboxes</Text>
                      <Text>• <strong>color</strong>: Color picker</Text>
                    </VStack>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>{t('common.settingDefinition')}</Heading>
                    <Text>
                      Setting definition properties:
                    </Text>
                    <VStack align="stretch" mt={1} pl={4}>
                      <Text>• <strong>id</strong>: Setting ID</Text>
                      <Text>• <strong>label</strong>: Setting label</Text>
                      <Text>• <strong>description</strong>: Setting description</Text>
                      <Text>• <strong>type</strong>: Setting type</Text>
                      <Text>• <strong>defaultValue</strong>: Default value</Text>
                      <Text>• <strong>options</strong>: Options for select and multiselect</Text>
                      <Text>• <strong>validation</strong>: Validation rules</Text>
                      <Text>• <strong>disabled</strong>: Whether the setting is disabled</Text>
                      <Text>• <strong>hidden</strong>: Whether the setting is hidden</Text>
                      <Text>• <strong>icon</strong>: Setting icon</Text>
                      <Text>• <strong>dependsOn</strong>: Setting dependency</Text>
                      <Text>• <strong>requiresRestart</strong>: Whether the setting requires restart</Text>
                      <Text>• <strong>requiresReload</strong>: Whether the setting requires reload</Text>
                      <Text>• <strong>advanced</strong>: Whether the setting is advanced</Text>
                      <Text>• <strong>experimental</strong>: Whether the setting is experimental</Text>
                      <Text>• <strong>deprecated</strong>: Whether the setting is deprecated</Text>
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
              {t('common.settingsDetails')}
            </Text>
            
            <Box pl={4}>
              <Text>• <strong>{t('common.settingsStorage')}</strong>: {t('common.settingsStorageDescription')}</Text>
              <Text>• <strong>{t('common.settingsSchema')}</strong>: {t('common.settingsSchemaDescription')}</Text>
              <Text>• <strong>{t('common.settingsUI')}</strong>: {t('common.settingsUIDescription')}</Text>
              <Text>• <strong>{t('common.settingsValidation')}</strong>: {t('common.settingsValidationDescription')}</Text>
              <Text>• <strong>{t('common.settingsDependencies')}</strong>: {t('common.settingsDependenciesDescription')}</Text>
            </Box>
            
            <Text>
              {t('common.settingsFeatures')}
            </Text>
            
            <Box pl={4}>
              <Text>• {t('common.settingsGroups')}</Text>
              <Text>• {t('common.settingsSearch')}</Text>
              <Text>• {t('common.settingsFilters')}</Text>
              <Text>• {t('common.settingsImportExport')}</Text>
              <Text>• {t('common.settingsReset')}</Text>
              <Text>• {t('common.settingsValidation')}</Text>
              <Text>• {t('common.settingsDependencies')}</Text>
              <Text>• {t('common.settingsRestartReload')}</Text>
              <Text>• {t('common.settingsPersistence')}</Text>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

// Wrap with SettingsProvider
const SettingsDemoWithProvider: React.FC = () => {
  return (
    <SettingsProvider>
      <SettingsDemo />
    </SettingsProvider>
  );
};

export default SettingsDemoWithProvider;
