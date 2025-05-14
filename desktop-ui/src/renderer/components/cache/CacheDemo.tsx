import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Heading,
  Input,
  VStack,
  HStack,
  Badge,
  Divider,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  useColorMode,
  Code,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Switch,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { QueryProvider } from '../../providers/QueryProvider';
import cacheService from '../../services/CacheService';
import apiService from '../../services/ApiService';
import queryCacheManager from '../../services/QueryCacheManager';
import offlineDataManager from '../../services/OfflineDataManager';
import useOfflineData from '../../hooks/useOfflineData';
import { glassmorphism } from '@/styles/theme';

// Mock API data
const mockTasks = [
  { id: '1', title: 'Task 1', completed: false },
  { id: '2', title: 'Task 2', completed: true },
  { id: '3', title: 'Task 3', completed: false },
];

// Mock API functions
const fetchTasks = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [...mockTasks];
};

const addTask = async (task: { title: string; completed: boolean }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { id: `${Date.now()}`, ...task };
};

// Task component
const Task: React.FC<{ task: any; onDelete: (id: string) => void }> = ({ task, onDelete }) => {
  const { colorMode } = useColorMode();
  
  return (
    <Box
      p={3}
      borderRadius="md"
      bg={colorMode === 'light' ? 'white' : 'gray.700'}
      boxShadow="sm"
      mb={2}
    >
      <Flex justify="space-between" align="center">
        <HStack>
          <Badge colorScheme={task.completed ? 'green' : 'blue'}>
            {task.completed ? 'Completed' : 'Active'}
          </Badge>
          <Text fontWeight="medium">{task.title}</Text>
        </HStack>
        <IconButton
          aria-label="Delete task"
          size="sm"
          colorScheme="red"
          onClick={() => onDelete(task.id)}
        >
          ✕
        </IconButton>
      </Flex>
    </Box>
  );
};

// Cache demo component
const CacheDemoContent: React.FC = () => {
  const { colorMode } = useColorMode();
  const queryClient = useQueryClient();
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [showCacheInfo, setShowCacheInfo] = useState<boolean>(false);
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // Toggle offline mode
  const toggleOfflineMode = useCallback(() => {
    setIsOffline(prev => !prev);
  }, []);
  
  // Fetch tasks with React Query
  const {
    data: tasks,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery('tasks', fetchTasks, {
    enabled: !isOffline,
    staleTime: 30000, // 30 seconds
    cacheTime: 600000, // 10 minutes
    retry: 3,
    onError: (err) => {
      console.error('Failed to fetch tasks:', err);
    },
  });
  
  // Add task mutation
  const addTaskMutation = useMutation(addTask, {
    onSuccess: (newTask) => {
      queryClient.invalidateQueries('tasks');
    },
    onError: (err) => {
      console.error('Failed to add task:', err);
    },
  });
  
  // Offline data management
  const {
    items: offlineTasks,
    add: addOfflineTask,
    remove: removeOfflineTask,
    sync: syncOfflineTasks,
    isSyncing,
    isOnline,
    lastSyncResult,
  } = useOfflineData<any>({
    type: 'task',
    syncFunction: async (items) => {
      // Simulate sync with server
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const results: { [id: string]: 'success' | 'error' | 'retry' } = {};
      
      for (const item of items) {
        // Simulate 80% success rate
        if (Math.random() > 0.2) {
          results[item.id] = 'success';
        } else {
          results[item.id] = 'retry';
        }
      }
      
      return results;
    },
    autoSync: !isOffline,
    autoSyncInterval: 10000, // 10 seconds
  });
  
  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskTitle.trim()) return;
    
    const newTask = {
      title: newTaskTitle,
      completed: false,
    };
    
    if (isOffline) {
      // Add to offline storage
      addOfflineTask(newTask, 'create');
    } else {
      // Add to server
      addTaskMutation.mutate(newTask);
    }
    
    setNewTaskTitle('');
  };
  
  // Handle task delete
  const handleDeleteTask = (id: string) => {
    if (isOffline) {
      // Add delete operation to offline storage
      addOfflineTask({ id }, 'delete');
    } else {
      // Delete from server (not implemented in this demo)
      console.log('Delete task:', id);
    }
  };
  
  // Clear cache
  const clearCache = () => {
    queryClient.clear();
    cacheService.clear();
  };
  
  // Get cache info
  const getCacheInfo = () => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    return {
      queryCount: queries.length,
      cacheSize: cacheService.size(),
      cacheKeys: cacheService.keys(),
    };
  };
  
  // Combined tasks (from server and offline)
  const combinedTasks = [...(tasks || []), ...offlineTasks.filter(item => item.operation === 'create').map(item => item.data)];
  
  return (
    <Box p={4} height="100%">
      <VStack spacing={4} align="stretch" height="100%">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg">Cache Demo</Heading>
          <HStack>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="offline-mode" mb="0">
                Offline Mode
              </FormLabel>
              <Switch
                id="offline-mode"
                isChecked={isOffline}
                onChange={toggleOfflineMode}
                colorScheme="primary"
              />
            </FormControl>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={() => setShowCacheInfo(!showCacheInfo)}
            >
              {showCacheInfo ? 'Hide Cache Info' : 'Show Cache Info'}
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              onClick={clearCache}
            >
              Clear Cache
            </Button>
          </HStack>
        </Flex>
        
        {/* Status */}
        <Flex gap={2} wrap="wrap">
          <Badge colorScheme={isOffline ? 'orange' : 'green'} p={2}>
            {isOffline ? 'Offline Mode' : 'Online Mode'}
          </Badge>
          {isFetching && (
            <Badge colorScheme="blue" p={2}>
              Fetching Data...
            </Badge>
          )}
          {isSyncing && (
            <Badge colorScheme="purple" p={2}>
              Syncing Offline Data...
            </Badge>
          )}
          {lastSyncResult && (
            <Badge colorScheme="teal" p={2}>
              Last Sync: Success: {lastSyncResult.success}, Retry: {lastSyncResult.retry}, Error: {lastSyncResult.error}
            </Badge>
          )}
          {offlineTasks.length > 0 && (
            <Badge colorScheme="yellow" p={2}>
              Pending Offline Tasks: {offlineTasks.length}
            </Badge>
          )}
        </Flex>
        
        {/* Cache Info */}
        {showCacheInfo && (
          <Box p={4} borderRadius="md" {...glassStyle}>
            <Heading size="md" mb={2}>Cache Information</Heading>
            <TableContainer>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Metric</Th>
                    <Th>Value</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Query Cache Count</Td>
                    <Td>{getCacheInfo().queryCount}</Td>
                  </Tr>
                  <Tr>
                    <Td>Cache Service Size</Td>
                    <Td>{getCacheInfo().cacheSize}</Td>
                  </Tr>
                  <Tr>
                    <Td>Offline Tasks</Td>
                    <Td>{offlineTasks.length}</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        )}
        
        {/* Add Task Form */}
        <Box p={4} borderRadius="md" {...glassStyle}>
          <form onSubmit={handleSubmit}>
            <FormControl>
              <FormLabel>New Task</FormLabel>
              <Flex>
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter task title..."
                  mr={2}
                />
                <Button
                  type="submit"
                  colorScheme="primary"
                  isLoading={addTaskMutation.isLoading}
                >
                  Add Task
                </Button>
              </Flex>
            </FormControl>
          </form>
        </Box>
        
        {/* Tasks List */}
        <Box
          p={4}
          borderRadius="md"
          {...glassStyle}
          flex={1}
          overflowY="auto"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">Tasks</Heading>
            <HStack>
              <Button
                size="sm"
                onClick={() => refetch()}
                isDisabled={isOffline}
                isLoading={isFetching}
              >
                Refresh
              </Button>
              <Button
                size="sm"
                colorScheme="purple"
                onClick={() => syncOfflineTasks()}
                isDisabled={isOffline || offlineTasks.length === 0}
                isLoading={isSyncing}
              >
                Sync Offline Data
              </Button>
            </HStack>
          </Flex>
          
          {isLoading && !isOffline ? (
            <Text textAlign="center" py={4}>Loading tasks...</Text>
          ) : isError ? (
            <Alert status="error" mb={4}>
              <AlertIcon />
              <AlertTitle mr={2}>Error!</AlertTitle>
              <AlertDescription>{(error as Error).message}</AlertDescription>
            </Alert>
          ) : combinedTasks.length === 0 ? (
            <Text textAlign="center" py={4}>No tasks found.</Text>
          ) : (
            <VStack align="stretch" spacing={2}>
              {combinedTasks.map(task => (
                <Task
                  key={task.id}
                  task={task}
                  onDelete={handleDeleteTask}
                />
              ))}
            </VStack>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

// Wrap with QueryProvider
const CacheDemo: React.FC = () => {
  return (
    <QueryProvider>
      <CacheDemoContent />
    </QueryProvider>
  );
};

export default CacheDemo;
