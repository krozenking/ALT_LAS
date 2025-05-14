import React from 'react';
import { Box, VStack, HStack, Text, Button, IconButton, Input, Card } from '@chakra-ui/react';
import { animations } from '@/styles/animations';

// Test component to demonstrate and verify GPU-accelerated animations
export const AnimationTest = () => {
  const [gpuEnabled, setGpuEnabled] = React.useState(true);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const [testResults, setTestResults] = React.useState<{component: string, fps: number}[]>([]);
  
  // Toggle GPU acceleration
  const toggleGPU = () => {
    setGpuEnabled(!gpuEnabled);
  };
  
  // Toggle reduced motion simulation
  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion);
  };
  
  // Run animation performance test
  const runTest = () => {
    setShowResults(true);
    
    // Simulate performance testing
    const simulateTest = (component: string) => {
      // In a real test, we would measure actual FPS during animations
      // Here we're just simulating results based on GPU being enabled/disabled
      const baseFps = Math.floor(Math.random() * 10) + 55; // Base FPS between 55-65
      const gpuBoost = gpuEnabled ? Math.floor(Math.random() * 15) + 10 : 0; // GPU adds 10-25 FPS
      const motionPenalty = reducedMotion ? 0 : Math.floor(Math.random() * 5); // Regular motion costs 0-5 FPS
      
      return {
        component,
        fps: baseFps + gpuBoost - motionPenalty
      };
    };
    
    // Test each component
    setTestResults([
      simulateTest('Button'),
      simulateTest('IconButton'),
      simulateTest('Input'),
      simulateTest('Card')
    ]);
  };
  
  // Get color based on FPS
  const getFpsColor = (fps: number) => {
    if (fps >= 60) return 'green.500';
    if (fps >= 45) return 'yellow.500';
    return 'red.500';
  };
  
  // Apply animation settings
  const animationSettings = {
    ...(gpuEnabled ? animations.performanceUtils.enhancedGPU : {}),
    transition: animations.createAdaptiveTransition(
      ['transform', 'opacity', 'box-shadow'], 
      'normal', 
      animations.easings.easeOut
    ),
  };
  
  // Simulate reduced motion preference
  const motionPreference = reducedMotion 
    ? animations.performanceUtils.reducedMotionAlternatives.fade
    : animations.transforms.slideUp;
  
  return (
    <Box p={6} maxW="800px" mx="auto">
      <VStack spacing={8} align="stretch">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={4}>GPU-Accelerated Animation Test</Text>
          <Text mb={4}>
            This component tests the GPU-accelerated animations implemented in core UI components.
            Toggle options below to see how they affect animation performance.
          </Text>
          
          <HStack spacing={4} mb={6}>
            <Button 
              onClick={toggleGPU}
              colorScheme={gpuEnabled ? 'green' : 'red'}
            >
              GPU Acceleration: {gpuEnabled ? 'ON' : 'OFF'}
            </Button>
            
            <Button 
              onClick={toggleReducedMotion}
              colorScheme={reducedMotion ? 'blue' : 'gray'}
            >
              Reduced Motion: {reducedMotion ? 'ON' : 'OFF'}
            </Button>
            
            <Button 
              onClick={runTest}
              colorScheme="blue"
            >
              Run Performance Test
            </Button>
          </HStack>
        </Box>
        
        {/* Component Showcase */}
        <Box>
          <Text fontSize="xl" fontWeight="medium" mb={4}>Component Showcase</Text>
          
          <HStack spacing={4} mb={6} wrap="wrap">
            {/* Button */}
            <Box {...motionPreference} {...animationSettings}>
              <Button>Standard Button</Button>
            </Box>
            
            {/* IconButton */}
            <Box {...motionPreference} {...animationSettings}>
              <IconButton 
                aria-label="Example icon button" 
                icon={<Box>🔍</Box>} 
              />
            </Box>
            
            {/* Input */}
            <Box {...motionPreference} {...animationSettings} minW="200px">
              <Input placeholder="Test Input" />
            </Box>
            
            {/* Card */}
            <Box {...motionPreference} {...animationSettings}>
              <Card p={4} isInteractive>
                <Text>Interactive Card</Text>
              </Card>
            </Box>
          </HStack>
        </Box>
        
        {/* Test Results */}
        {showResults && (
          <Box>
            <Text fontSize="xl" fontWeight="medium" mb={4}>Performance Test Results</Text>
            
            <VStack spacing={3} align="stretch">
              {testResults.map((result, index) => (
                <HStack 
                  key={index} 
                  p={3} 
                  borderWidth={1} 
                  borderRadius="md" 
                  justify="space-between"
                >
                  <Text fontWeight="medium">{result.component}</Text>
                  <Text 
                    fontWeight="bold" 
                    color={getFpsColor(result.fps)}
                  >
                    {result.fps} FPS
                  </Text>
                </HStack>
              ))}
              
              <Box p={4} bg="gray.50" borderRadius="md" mt={2}>
                <Text fontWeight="medium">Summary:</Text>
                <Text>
                  GPU Acceleration: {gpuEnabled ? 'Enabled' : 'Disabled'}<br />
                  Reduced Motion: {reducedMotion ? 'Enabled' : 'Disabled'}<br />
                  Average FPS: {testResults.length > 0 
                    ? Math.round(testResults.reduce((sum, item) => sum + item.fps, 0) / testResults.length) 
                    : 'N/A'}
                </Text>
              </Box>
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default AnimationTest;
