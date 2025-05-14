import React, { useState } from 'react';
import {
  Box,
  Button,
  Text,
  Heading,
  Flex,
  VStack,
  HStack,
  Divider,
  FormControl,
  FormLabel,
  Switch,
  Select,
  useColorMode,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useUpdater } from '../../hooks/useUpdater';
import UpdaterStatus from './UpdaterStatus';
import { glassmorphism } from '@/styles/theme';

/**
 * Updater demo component
 */
export const UpdaterDemo: React.FC = () => {
  const { colorMode } = useColorMode();
  const [displayMode, setDisplayMode] = useState<'badge' | 'button' | 'popover' | 'full'>('full');
  const [autoCheck, setAutoCheck] = useState<boolean>(true);
  const [autoDownload, setAutoDownload] = useState<boolean>(true);
  
  const {
    status,
    updateInfo,
    progress,
    error,
    currentVersion,
    isUpdateAvailable,
    isDownloading,
    isUpdateReady,
    isChecking,
  } = useUpdater();
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  return (
    <Box p={4} height="100%">
      <VStack spacing={4} align="stretch" height="100%">
        <Heading size="lg">Auto Updater Demo</Heading>
        
        <Text>
          This demo shows how the auto updater works in the ALT_LAS Desktop UI. The updater checks for updates automatically,
          downloads them in the background, and prompts the user to install them when ready.
        </Text>
        
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>Development Mode</AlertTitle>
          <AlertDescription>
            The auto updater is disabled in development mode. It will only work in packaged applications.
          </AlertDescription>
        </Alert>
        
        <Flex wrap="wrap" gap={4}>
          <Card flex="1" minW="300px" {...glassStyle}>
            <CardHeader>
              <Heading size="md">Current Status</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Flex justify="space-between">
                  <Text fontWeight="bold">Current Version:</Text>
                  <Text>{currentVersion}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontWeight="bold">Status:</Text>
                  <Text>{status}</Text>
                </Flex>
                {updateInfo && (
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Latest Version:</Text>
                    <Text>{updateInfo.version}</Text>
                  </Flex>
                )}
                {isDownloading && progress && (
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Download Progress:</Text>
                    <Text>{Math.round(progress.percent)}%</Text>
                  </Flex>
                )}
                {error && (
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Error:</Text>
                    <Text color="red.500">{error}</Text>
                  </Flex>
                )}
              </VStack>
            </CardBody>
          </Card>
          
          <Card flex="1" minW="300px" {...glassStyle}>
            <CardHeader>
              <Heading size="md">Updater Configuration</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="auto-check" mb="0">
                    Auto Check for Updates
                  </FormLabel>
                  <Switch
                    id="auto-check"
                    isChecked={autoCheck}
                    onChange={(e) => setAutoCheck(e.target.checked)}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="auto-download" mb="0">
                    Auto Download Updates
                  </FormLabel>
                  <Switch
                    id="auto-download"
                    isChecked={autoDownload}
                    onChange={(e) => setAutoDownload(e.target.checked)}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel htmlFor="display-mode">Display Mode</FormLabel>
                  <Select
                    id="display-mode"
                    value={displayMode}
                    onChange={(e) => setDisplayMode(e.target.value as any)}
                  >
                    <option value="badge">Badge</option>
                    <option value="button">Button</option>
                    <option value="popover">Popover</option>
                    <option value="full">Full</option>
                  </Select>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>
        </Flex>
        
        <Divider />
        
        <Box>
          <Heading size="md" mb={4}>Updater Display</Heading>
          
          <Box p={4} borderRadius="md" {...glassStyle}>
            {displayMode === 'badge' && (
              <UpdaterStatus
                asBadge
                checkOnMount={autoCheck}
                autoDownload={autoDownload}
              />
            )}
            
            {displayMode === 'button' && (
              <UpdaterStatus
                asButton
                checkOnMount={autoCheck}
                autoDownload={autoDownload}
              />
            )}
            
            {displayMode === 'popover' && (
              <UpdaterStatus
                asPopover
                checkOnMount={autoCheck}
                autoDownload={autoDownload}
              />
            )}
            
            {displayMode === 'full' && (
              <UpdaterStatus
                checkOnMount={autoCheck}
                autoDownload={autoDownload}
              />
            )}
          </Box>
        </Box>
        
        <Divider />
        
        <Box>
          <Heading size="md" mb={4}>Implementation Details</Heading>
          
          <VStack align="stretch" spacing={3}>
            <Text>
              The auto updater uses <code>electron-updater</code> to check for updates, download them, and install them.
              It supports GitHub, S3, and generic update servers.
            </Text>
            
            <Text>
              The updater is configured in the main process and communicates with the renderer process via IPC.
              The <code>useUpdater</code> hook provides a simple interface for checking, downloading, and installing updates.
            </Text>
            
            <Text>
              The <code>UpdaterStatus</code> component provides a UI for displaying the update status and controlling the update process.
              It can be displayed as a badge, button, popover, or full component.
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default UpdaterDemo;
