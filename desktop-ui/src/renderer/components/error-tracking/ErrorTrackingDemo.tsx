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
  Input,
  Textarea,
  Select,
  Switch,
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
} from '@chakra-ui/react';
import { ErrorTrackingProvider, useErrorTrackingContext } from '../../providers/ErrorTrackingProvider';
import ErrorLog from './ErrorLog';
import { glassmorphism } from '@/styles/theme';

// Error generator component
const ErrorGenerator: React.FC = () => {
  const { captureError } = useErrorTrackingContext();
  const [errorMessage, setErrorMessage] = useState<string>('Test error message');
  const [errorName, setErrorName] = useState<string>('TestError');
  const [errorSource, setErrorSource] = useState<string>('renderer');
  const [errorHandled, setErrorHandled] = useState<boolean>(true);
  const [additionalData, setAdditionalData] = useState<string>('{\n  "key": "value"\n}');
  
  // Generate error
  const generateError = () => {
    try {
      const error = new Error(errorMessage);
      error.name = errorName;
      
      let data = {};
      try {
        data = JSON.parse(additionalData);
      } catch (e) {
        console.warn('Invalid JSON for additional data:', e);
      }
      
      captureError(error, data, errorSource, errorHandled);
    } catch (error) {
      console.error('Failed to generate error:', error);
    }
  };
  
  // Generate unhandled error
  const generateUnhandledError = () => {
    setTimeout(() => {
      throw new Error('Unhandled error from setTimeout');
    }, 0);
  };
  
  // Generate promise rejection
  const generatePromiseRejection = () => {
    Promise.reject(new Error('Unhandled promise rejection'));
  };
  
  // Generate render error
  const generateRenderError = () => {
    throw new Error('Error during render');
  };
  
  return (
    <Box>
      <Heading size="md" mb={4}>Generate Errors</Heading>
      
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Error Message</FormLabel>
          <Input
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
          />
        </FormControl>
        
        <FormControl>
          <FormLabel>Error Name</FormLabel>
          <Input
            value={errorName}
            onChange={(e) => setErrorName(e.target.value)}
          />
        </FormControl>
        
        <FormControl>
          <FormLabel>Error Source</FormLabel>
          <Select
            value={errorSource}
            onChange={(e) => setErrorSource(e.target.value)}
          >
            <option value="renderer">Renderer Process</option>
            <option value="main">Main Process</option>
            <option value="preload">Preload Script</option>
            <option value="unknown">Unknown</option>
          </Select>
        </FormControl>
        
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="error-handled" mb="0">
            Handled Error
          </FormLabel>
          <Switch
            id="error-handled"
            isChecked={errorHandled}
            onChange={(e) => setErrorHandled(e.target.checked)}
          />
        </FormControl>
        
        <FormControl>
          <FormLabel>Additional Data (JSON)</FormLabel>
          <Textarea
            value={additionalData}
            onChange={(e) => setAdditionalData(e.target.value)}
            rows={5}
            fontFamily="monospace"
          />
        </FormControl>
        
        <Button colorScheme="blue" onClick={generateError}>
          Generate Error
        </Button>
        
        <Divider />
        
        <Heading size="sm">Test Unhandled Errors</Heading>
        <HStack>
          <Button colorScheme="red" onClick={generateUnhandledError}>
            Generate Unhandled Error
          </Button>
          <Button colorScheme="red" onClick={generatePromiseRejection}>
            Generate Promise Rejection
          </Button>
          <Button colorScheme="red" onClick={generateRenderError}>
            Generate Render Error
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

// Error tracking demo content
const ErrorTrackingDemoContent: React.FC = () => {
  const { colorMode } = useColorMode();
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  return (
    <Box p={4} height="100%">
      <VStack spacing={4} align="stretch" height="100%">
        <Heading size="lg">Error Tracking Demo</Heading>
        
        <Text>
          This demo shows how the error tracking system works in the ALT_LAS Desktop UI. The system captures errors from
          both the main and renderer processes, logs them, and provides a UI for viewing and managing errors.
        </Text>
        
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>Error Tracking</AlertTitle>
          <AlertDescription>
            The error tracking system captures both handled and unhandled errors, logs them to a file, and can optionally
            send them to a remote error tracking service like Sentry.
          </AlertDescription>
        </Alert>
        
        <Tabs variant="enclosed">
          <TabList>
            <Tab>Error Generator</Tab>
            <Tab>Error Log</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <ErrorGenerator />
              </Box>
            </TabPanel>
            <TabPanel>
              <Box p={4} borderRadius="md" {...glassStyle}>
                <ErrorLog
                  maxErrors={20}
                  autoRefresh={true}
                  refreshInterval={5000}
                  showFilters={true}
                  showClearButton={true}
                  showRefreshButton={true}
                  showErrorDetails={true}
                  showStackTraces={true}
                />
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
        
        <Divider />
        
        <Box>
          <Heading size="md" mb={4}>Implementation Details</Heading>
          
          <VStack align="stretch" spacing={3}>
            <Text>
              The error tracking system consists of several components:
            </Text>
            
            <Box pl={4}>
              <Text>• <strong>ErrorTrackingService</strong>: A main process service that captures and logs errors.</Text>
              <Text>• <strong>ErrorBoundary</strong>: A React component that catches errors in the component tree.</Text>
              <Text>• <strong>ErrorTrackingProvider</strong>: A React context provider for error tracking.</Text>
              <Text>• <strong>useErrorTracking</strong>: A React hook for using error tracking in components.</Text>
              <Text>• <strong>ErrorLog</strong>: A React component for displaying the error log.</Text>
            </Box>
            
            <Text>
              The system captures errors from various sources:
            </Text>
            
            <Box pl={4}>
              <Text>• Uncaught exceptions in the main process</Text>
              <Text>• Unhandled promise rejections in the main process</Text>
              <Text>• Renderer process crashes</Text>
              <Text>• Uncaught exceptions in the renderer process</Text>
              <Text>• Unhandled promise rejections in the renderer process</Text>
              <Text>• React component errors (via ErrorBoundary)</Text>
              <Text>• Manually captured errors</Text>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

// Wrap with error tracking provider
const ErrorTrackingDemo: React.FC = () => {
  return (
    <ErrorTrackingProvider>
      <ErrorTrackingDemoContent />
    </ErrorTrackingProvider>
  );
};

export default ErrorTrackingDemo;
