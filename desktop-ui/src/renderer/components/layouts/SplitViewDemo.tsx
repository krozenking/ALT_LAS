import React, { useState } from 'react';
import { Box, Text, Heading, Flex, Button, Select, FormControl, FormLabel, useColorMode } from '@chakra-ui/react';
import SplitView from '../composition/SplitView';
import { glassmorphism } from '@/styles/theme';

const SplitViewDemo: React.FC = () => {
  const { colorMode } = useColorMode();
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [ratio, setRatio] = useState<number>(0.3);
  const [resizable, setResizable] = useState<boolean>(true);
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // Left/Top content
  const leftOrTopContent = (
    <Box
      p={4}
      height="100%"
      borderRadius="md"
      bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
    >
      <Heading size="sm" mb={4}>Navigation</Heading>
      <Flex direction="column" gap={2}>
        <Button size="sm" variant="ghost" justifyContent="flex-start">Dashboard</Button>
        <Button size="sm" variant="ghost" justifyContent="flex-start">Tasks</Button>
        <Button size="sm" variant="ghost" justifyContent="flex-start">Models</Button>
        <Button size="sm" variant="ghost" justifyContent="flex-start">Datasets</Button>
        <Button size="sm" variant="ghost" justifyContent="flex-start">Results</Button>
        <Button size="sm" variant="ghost" justifyContent="flex-start">Settings</Button>
      </Flex>
    </Box>
  );
  
  // Right/Bottom content
  const rightOrBottomContent = (
    <Box height="100%">
      <SplitView
        direction={direction === 'horizontal' ? 'vertical' : 'horizontal'}
        initialRatio={0.6}
        resizable={resizable}
        leftOrTopContent={
          <Box
            p={4}
            height="100%"
            borderRadius="md"
            bg={colorMode === 'light' ? 'white' : 'gray.800'}
            boxShadow="sm"
            {...(colorMode === 'light' ? glassmorphism.create(0.5, 10, 1) : glassmorphism.createDark(0.5, 10, 1))}
          >
            <Heading size="md" mb={4}>Main Content</Heading>
            <Text mb={4}>
              This is a nested split view demo. You can customize the layout using the controls in the top right corner.
            </Text>
            <Text mb={4}>
              The current configuration is:
            </Text>
            <Box p={2} bg={colorMode === 'light' ? 'gray.100' : 'gray.700'} borderRadius="md" mb={4}>
              <Text fontSize="sm">Direction: {direction}</Text>
              <Text fontSize="sm">Ratio: {ratio.toFixed(2)}</Text>
              <Text fontSize="sm">Resizable: {resizable ? 'Yes' : 'No'}</Text>
            </Box>
            <Flex gap={2}>
              <Button colorScheme="primary">Primary Action</Button>
              <Button variant="outline">Secondary Action</Button>
            </Flex>
          </Box>
        }
        rightOrBottomContent={
          <Box
            p={4}
            height="100%"
            borderRadius="md"
            bg={colorMode === 'light' ? 'blue.50' : 'blue.900'}
          >
            <Heading size="sm" mb={4}>Information</Heading>
            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={1}>System Status:</Text>
              <Flex align="center" mb={2}>
                <Box w="10px" h="10px" borderRadius="full" bg="green.400" mr={2} />
                <Text fontSize="sm">All systems operational</Text>
              </Flex>
              
              <Text fontSize="sm" fontWeight="bold" mb={1}>Active Tasks:</Text>
              <Box p={2} bg={colorMode === 'light' ? 'white' : 'gray.700'} borderRadius="md" mb={2}>
                <Text fontSize="sm">• Model training (45%)</Text>
                <Text fontSize="sm">• Data preprocessing</Text>
              </Box>
              
              <Text fontSize="sm" fontWeight="bold" mb={1}>Resources:</Text>
              <Flex direction="column" gap={1}>
                <Flex align="center" justify="space-between">
                  <Text fontSize="xs">CPU:</Text>
                  <Text fontSize="xs">32%</Text>
                </Flex>
                <Flex align="center" justify="space-between">
                  <Text fontSize="xs">Memory:</Text>
                  <Text fontSize="xs">2.4 GB</Text>
                </Flex>
                <Flex align="center" justify="space-between">
                  <Text fontSize="xs">GPU:</Text>
                  <Text fontSize="xs">18%</Text>
                </Flex>
              </Flex>
            </Box>
          </Box>
        }
      />
    </Box>
  );
  
  return (
    <Box width="100%" height="100vh" p={0} position="relative">
      {/* Controls */}
      <Box
        position="absolute"
        top={4}
        right={4}
        zIndex={100}
        p={4}
        borderRadius="md"
        {...glassStyle}
      >
        <Flex direction="column" gap={4}>
          <FormControl>
            <FormLabel fontSize="sm">Direction</FormLabel>
            <Select
              size="sm"
              value={direction}
              onChange={(e) => setDirection(e.target.value as 'horizontal' | 'vertical')}
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel fontSize="sm">Ratio: {(ratio * 100).toFixed(0)}%</FormLabel>
            <Flex align="center" gap={2}>
              <Button
                size="xs"
                onClick={() => setRatio(Math.max(0.1, ratio - 0.1))}
                isDisabled={ratio <= 0.1}
              >
                -
              </Button>
              <Box flex="1" h="8px" bg={colorMode === 'light' ? 'gray.200' : 'gray.600'} borderRadius="full">
                <Box w={`${ratio * 100}%`} h="100%" bg="primary.400" borderRadius="full" />
              </Box>
              <Button
                size="xs"
                onClick={() => setRatio(Math.min(0.9, ratio + 0.1))}
                isDisabled={ratio >= 0.9}
              >
                +
              </Button>
            </Flex>
          </FormControl>
          
          <FormControl>
            <FormLabel fontSize="sm">Resizable</FormLabel>
            <Button
              size="sm"
              variant={resizable ? 'solid' : 'outline'}
              colorScheme={resizable ? 'primary' : 'gray'}
              onClick={() => setResizable(!resizable)}
              width="100%"
            >
              {resizable ? 'Enabled' : 'Disabled'}
            </Button>
          </FormControl>
        </Flex>
      </Box>
      
      {/* Main Split View */}
      <SplitView
        direction={direction}
        initialRatio={ratio}
        resizable={resizable}
        leftOrTopContent={leftOrTopContent}
        rightOrBottomContent={rightOrBottomContent}
        ariaLabel="Split View Demo"
      />
    </Box>
  );
};

export default SplitViewDemo;
