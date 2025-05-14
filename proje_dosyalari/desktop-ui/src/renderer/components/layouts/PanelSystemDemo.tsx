import React from 'react';
import { Box, Text, Heading, Flex, Button, Input, FormControl, FormLabel, useColorMode } from '@chakra-ui/react';
import PanelSystem from '../composition/PanelSystem';
import { PanelData } from '../composition/DraggablePanelContainer';

const PanelSystemDemo: React.FC = () => {
  const { colorMode } = useColorMode();
  
  // Create initial panels for the demo
  const initialPanels: PanelData[] = [
    {
      id: 'panel-1',
      title: 'Task Manager',
      content: (
        <Box p={4}>
          <Heading size="sm" mb={4}>Tasks</Heading>
          <Box mb={2}>
            <FormControl>
              <FormLabel fontSize="xs">New Task</FormLabel>
              <Flex>
                <Input size="sm" placeholder="Enter task..." />
                <Button size="sm" ml={2} colorScheme="primary">Add</Button>
              </Flex>
            </FormControl>
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="bold" mb={1}>Active Tasks:</Text>
            <Box p={2} bg={colorMode === 'light' ? 'gray.50' : 'gray.700'} borderRadius="md">
              <Text fontSize="sm">• Analyze segmentation results</Text>
              <Text fontSize="sm">• Review model performance</Text>
              <Text fontSize="sm">• Prepare dataset for training</Text>
            </Box>
          </Box>
        </Box>
      ),
      position: { x: 20, y: 20 },
      size: { width: 300, height: 300 },
    },
    {
      id: 'panel-2',
      title: 'System Status',
      content: (
        <Box p={4}>
          <Heading size="sm" mb={4}>System Resources</Heading>
          <Flex direction="column" gap={2}>
            <Box>
              <Text fontSize="xs">CPU Usage</Text>
              <Flex align="center">
                <Box flex="1" h="8px" bg={colorMode === 'light' ? 'gray.200' : 'gray.600'} borderRadius="full">
                  <Box w="45%" h="100%" bg="green.400" borderRadius="full" />
                </Box>
                <Text fontSize="xs" ml={2}>45%</Text>
              </Flex>
            </Box>
            <Box>
              <Text fontSize="xs">Memory Usage</Text>
              <Flex align="center">
                <Box flex="1" h="8px" bg={colorMode === 'light' ? 'gray.200' : 'gray.600'} borderRadius="full">
                  <Box w="72%" h="100%" bg="blue.400" borderRadius="full" />
                </Box>
                <Text fontSize="xs" ml={2}>72%</Text>
              </Flex>
            </Box>
            <Box>
              <Text fontSize="xs">GPU Usage</Text>
              <Flex align="center">
                <Box flex="1" h="8px" bg={colorMode === 'light' ? 'gray.200' : 'gray.600'} borderRadius="full">
                  <Box w="30%" h="100%" bg="purple.400" borderRadius="full" />
                </Box>
                <Text fontSize="xs" ml={2}>30%</Text>
              </Flex>
            </Box>
            <Box>
              <Text fontSize="xs">Disk Usage</Text>
              <Flex align="center">
                <Box flex="1" h="8px" bg={colorMode === 'light' ? 'gray.200' : 'gray.600'} borderRadius="full">
                  <Box w="60%" h="100%" bg="orange.400" borderRadius="full" />
                </Box>
                <Text fontSize="xs" ml={2}>60%</Text>
              </Flex>
            </Box>
          </Flex>
        </Box>
      ),
      position: { x: 340, y: 20 },
      size: { width: 300, height: 250 },
    },
    {
      id: 'panel-3',
      title: 'Recent Activity',
      content: (
        <Box p={4}>
          <Heading size="sm" mb={4}>Recent Activity</Heading>
          <Box>
            <Flex direction="column" gap={2}>
              <Box p={2} borderRadius="md" bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}>
                <Text fontSize="xs" color="gray.500">10:45 AM</Text>
                <Text fontSize="sm">Segmentation completed for dataset A</Text>
              </Box>
              <Box p={2} borderRadius="md" bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}>
                <Text fontSize="xs" color="gray.500">09:30 AM</Text>
                <Text fontSize="sm">Model training started on GPU</Text>
              </Box>
              <Box p={2} borderRadius="md" bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}>
                <Text fontSize="xs" color="gray.500">Yesterday</Text>
                <Text fontSize="sm">New dataset uploaded (125 images)</Text>
              </Box>
            </Flex>
          </Box>
        </Box>
      ),
      position: { x: 20, y: 340 },
      size: { width: 300, height: 250 },
    },
  ];
  
  return (
    <Box width="100%" height="100vh" p={0}>
      <PanelSystem
        initialPanels={initialPanels}
        allowCreatePanel={true}
        showToolbar={true}
        allowDragDrop={true}
        allowResize={true}
        allowCombine={true}
        gridSize={10}
      />
    </Box>
  );
};

export default PanelSystemDemo;
