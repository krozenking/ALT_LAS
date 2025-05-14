import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Heading,
  VStack,
  HStack,
  Badge,
  Divider,
  useColorMode,
  Code,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tooltip,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Select,
  Input,
  Checkbox,
} from '@chakra-ui/react';
import { useErrorTrackingContext } from '../../providers/ErrorTrackingProvider';
import { ErrorData } from '../../../main/services/ErrorTrackingService';
import { glassmorphism } from '@/styles/theme';

export interface ErrorLogProps {
  /**
   * Maximum number of errors to show
   */
  maxErrors?: number;
  /**
   * Whether to auto refresh
   */
  autoRefresh?: boolean;
  /**
   * Auto refresh interval in milliseconds
   */
  refreshInterval?: number;
  /**
   * Whether to show filters
   */
  showFilters?: boolean;
  /**
   * Whether to show clear button
   */
  showClearButton?: boolean;
  /**
   * Whether to show refresh button
   */
  showRefreshButton?: boolean;
  /**
   * Whether to show error details
   */
  showErrorDetails?: boolean;
  /**
   * Whether to show stack traces
   */
  showStackTraces?: boolean;
}

/**
 * Error log component
 */
export const ErrorLog: React.FC<ErrorLogProps> = ({
  maxErrors = 50,
  autoRefresh = true,
  refreshInterval = 10000,
  showFilters = true,
  showClearButton = true,
  showRefreshButton = true,
  showErrorDetails = true,
  showStackTraces = true,
}) => {
  const { colorMode } = useColorMode();
  const { errorLog, isLoading, refreshErrorLog, clearErrorLog } = useErrorTrackingContext();
  
  // Filters
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showHandledErrors, setShowHandledErrors] = useState<boolean>(true);
  const [showUnhandledErrors, setShowUnhandledErrors] = useState<boolean>(true);
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshErrorLog();
      }, refreshInterval);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [autoRefresh, refreshInterval, refreshErrorLog]);
  
  // Filter errors
  const filteredErrors = errorLog
    .filter(error => {
      // Filter by source
      if (sourceFilter !== 'all' && error.source !== sourceFilter) {
        return false;
      }
      
      // Filter by handled/unhandled
      if (!showHandledErrors && error.handled) {
        return false;
      }
      
      if (!showUnhandledErrors && !error.handled) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          error.message.toLowerCase().includes(query) ||
          error.name.toLowerCase().includes(query) ||
          (error.stack && error.stack.toLowerCase().includes(query))
        );
      }
      
      return true;
    })
    .slice(0, maxErrors);
  
  // Get source color
  const getSourceColor = (source: string) => {
    switch (source) {
      case 'main':
        return 'blue';
      case 'renderer':
        return 'green';
      case 'preload':
        return 'purple';
      default:
        return 'gray';
    }
  };
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Error Log</Heading>
        <HStack>
          {showRefreshButton && (
            <Button
              size="sm"
              onClick={() => refreshErrorLog()}
              isLoading={isLoading}
              loadingText="Refreshing"
            >
              Refresh
            </Button>
          )}
          {showClearButton && (
            <Button
              size="sm"
              colorScheme="red"
              onClick={() => clearErrorLog()}
              isDisabled={errorLog.length === 0}
            >
              Clear Log
            </Button>
          )}
        </HStack>
      </Flex>
      
      {/* Filters */}
      {showFilters && (
        <Box mb={4} p={3} borderRadius="md" {...glassStyle}>
          <Heading size="sm" mb={2}>Filters</Heading>
          <Flex wrap="wrap" gap={3}>
            <Box flex="1" minW="150px">
              <Text fontSize="sm" mb={1}>Source</Text>
              <Select
                size="sm"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="all">All Sources</option>
                <option value="main">Main Process</option>
                <option value="renderer">Renderer Process</option>
                <option value="preload">Preload Script</option>
                <option value="unknown">Unknown</option>
              </Select>
            </Box>
            <Box flex="1" minW="150px">
              <Text fontSize="sm" mb={1}>Search</Text>
              <Input
                size="sm"
                placeholder="Search errors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Box>
            <Box flex="1" minW="150px">
              <Text fontSize="sm" mb={1}>Error Type</Text>
              <HStack>
                <Checkbox
                  isChecked={showHandledErrors}
                  onChange={(e) => setShowHandledErrors(e.target.checked)}
                >
                  Handled
                </Checkbox>
                <Checkbox
                  isChecked={showUnhandledErrors}
                  onChange={(e) => setShowUnhandledErrors(e.target.checked)}
                >
                  Unhandled
                </Checkbox>
              </HStack>
            </Box>
          </Flex>
        </Box>
      )}
      
      {/* Error list */}
      {isLoading ? (
        <Flex justify="center" align="center" p={8}>
          <Spinner />
        </Flex>
      ) : filteredErrors.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>No errors found</AlertTitle>
          <AlertDescription>
            {errorLog.length > 0
              ? 'No errors match the current filters.'
              : 'The error log is empty.'}
          </AlertDescription>
        </Alert>
      ) : (
        <Accordion allowMultiple>
          {filteredErrors.map((error, index) => (
            <AccordionItem key={`${error.timestamp}-${index}`}>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Flex align="center" gap={2}>
                      <Badge colorScheme={error.handled ? 'green' : 'red'}>
                        {error.handled ? 'Handled' : 'Unhandled'}
                      </Badge>
                      <Badge colorScheme={getSourceColor(error.source)}>
                        {error.source}
                      </Badge>
                      <Text fontWeight="bold" isTruncated>
                        {error.name}: {error.message}
                      </Text>
                    </Flex>
                  </Box>
                  <Text fontSize="xs" color="gray.500" mr={2}>
                    {formatDate(error.timestamp)}
                  </Text>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <VStack align="stretch" spacing={3}>
                  <Box>
                    <Text fontWeight="bold">Error:</Text>
                    <Text>{error.message}</Text>
                  </Box>
                  
                  {showStackTraces && error.stack && (
                    <Box>
                      <Text fontWeight="bold">Stack Trace:</Text>
                      <Code p={2} borderRadius="md" fontSize="xs" whiteSpace="pre-wrap" overflowX="auto">
                        {error.stack}
                      </Code>
                    </Box>
                  )}
                  
                  {showErrorDetails && error.data && Object.keys(error.data).length > 0 && (
                    <Box>
                      <Text fontWeight="bold">Additional Data:</Text>
                      <Code p={2} borderRadius="md" fontSize="xs" whiteSpace="pre-wrap" overflowX="auto">
                        {JSON.stringify(error.data, null, 2)}
                      </Code>
                    </Box>
                  )}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </Box>
  );
};

export default ErrorLog;
