import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Flex, 
  Heading, 
  Text, 
  SimpleGrid, 
  VStack,
  HStack,
  Select,
  Switch,
  FormControl,
  FormLabel,
  Divider,
  Card,
  CardHeader,
  CardBody,
  Badge,
  useColorMode
} from '@chakra-ui/react';
import { animations } from '@/styles/animations';

// Animasyon test bileşeni
const AnimationTest: React.FC = () => {
  const { colorMode } = useColorMode();
  const [selectedAnimation, setSelectedAnimation] = useState<string>('slideUp');
  const [selectedPreset, setSelectedPreset] = useState<string>('button');
  const [isLowPerformanceMode, setIsLowPerformanceMode] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [isGpuAccelerated, setIsGpuAccelerated] = useState<boolean>(true);
  
  // Düşük performans modunu simüle et
  useEffect(() => {
    if (isLowPerformanceMode) {
      console.log('Düşük performans modu etkinleştirildi');
    } else {
      console.log('Normal performans modu etkinleştirildi');
    }
  }, [isLowPerformanceMode]);
  
  // Animasyon başlat
  const startAnimation = () => {
    setIsAnimating(true);
    
    // Animasyon performansını ölç
    animations.testUtils.detectDroppedFrames(1000, (metrics) => {
      setPerformanceMetrics(metrics);
    });
    
    // Animasyonu 1 saniye sonra durdur
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };
  
  // Seçilen animasyonu getir
  const getSelectedTransform = () => {
    return animations.transforms[selectedAnimation as keyof typeof animations.transforms] || animations.transforms.fade;
  };
  
  // Seçilen preseti getir
  const getSelectedPreset = () => {
    const presetCategory = animations.presets[selectedPreset as keyof typeof animations.presets];
    
    if (typeof presetCategory === 'object' && 'hover' in presetCategory) {
      return presetCategory.hover;
    }
    
    return animations.presets.button.hover;
  };
  
  // GPU hızlandırma ayarlarını getir
  const getGpuSettings = () => {
    return isGpuAccelerated 
      ? animations.performanceUtils.enhancedGPU 
      : {};
  };
  
  // Animasyon stilini oluştur
  const getAnimationStyle = () => {
    const transform = getSelectedTransform();
    const currentState = isAnimating ? transform.animate : transform.initial;
    
    return {
      ...currentState,
      transition: animations.createAdaptiveTransition(
        ['transform', 'opacity'], 
        isLowPerformanceMode ? 'slow' : 'normal',
        animations.easings.easeOutBack
      ),
      ...getGpuSettings()
    };
  };
  
  // Preset stilini oluştur
  const getPresetStyle = () => {
    const preset = getSelectedPreset();
    
    return {
      ...preset,
      ...getGpuSettings()
    };
  };
  
  return (
    <Box p={6} maxWidth="1200px" mx="auto">
      <Heading as="h1" mb={6}>Animasyon Performans Testi</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mb={8}>
        <Card>
          <CardHeader>
            <Heading size="md">Animasyon Kontrolleri</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Animasyon Tipi</FormLabel>
                <Select 
                  value={selectedAnimation}
                  onChange={(e) => setSelectedAnimation(e.target.value)}
                >
                  <option value="fade">Fade</option>
                  <option value="slideUp">Slide Up</option>
                  <option value="slideDown">Slide Down</option>
                  <option value="slideLeft">Slide Left</option>
                  <option value="slideRight">Slide Right</option>
                  <option value="scaleUp">Scale Up</option>
                  <option value="scaleDown">Scale Down</option>
                  <option value="slideUpAndFade">Slide Up and Fade</option>
                  <option value="slideDownAndFade">Slide Down and Fade</option>
                  <option value="slideLeftAndFade">Slide Left and Fade</option>
                  <option value="slideRightAndFade">Slide Right and Fade</option>
                  <option value="flip">Flip</option>
                  <option value="flipVertical">Flip Vertical</option>
                  <option value="rotateIn">Rotate In</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Preset Tipi</FormLabel>
                <Select 
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(e.target.value)}
                >
                  <option value="button">Button</option>
                  <option value="card">Card</option>
                  <option value="toast">Toast</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="tooltip">Tooltip</option>
                </Select>
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">
                  Düşük Performans Modu
                </FormLabel>
                <Switch 
                  isChecked={isLowPerformanceMode}
                  onChange={() => setIsLowPerformanceMode(!isLowPerformanceMode)}
                />
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">
                  GPU Hızlandırma
                </FormLabel>
                <Switch 
                  isChecked={isGpuAccelerated}
                  onChange={() => setIsGpuAccelerated(!isGpuAccelerated)}
                />
              </FormControl>
              
              <Button 
                colorScheme="blue" 
                onClick={startAnimation}
                isDisabled={isAnimating}
              >
                Animasyonu Başlat
              </Button>
            </VStack>
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader>
            <Heading size="md">Performans Metrikleri</Heading>
          </CardHeader>
          <CardBody>
            {performanceMetrics ? (
              <VStack spacing={3} align="stretch">
                <HStack justifyContent="space-between">
                  <Text fontWeight="bold">Süre:</Text>
                  <Text>{performanceMetrics.duration}ms</Text>
                </HStack>
                
                <HStack justifyContent="space-between">
                  <Text fontWeight="bold">Render Edilen Kareler:</Text>
                  <Text>{performanceMetrics.framesRendered}</Text>
                </HStack>
                
                <HStack justifyContent="space-between">
                  <Text fontWeight="bold">Beklenen Kareler:</Text>
                  <Text>{performanceMetrics.expectedFrames.toFixed(1)}</Text>
                </HStack>
                
                <HStack justifyContent="space-between">
                  <Text fontWeight="bold">Düşen Kareler:</Text>
                  <Text>{performanceMetrics.droppedFrames.toFixed(1)}</Text>
                </HStack>
                
                <HStack justifyContent="space-between">
                  <Text fontWeight="bold">Düşen Kare Yüzdesi:</Text>
                  <Badge 
                    colorScheme={
                      performanceMetrics.droppedPercentage < 10 ? 'green' :
                      performanceMetrics.droppedPercentage < 30 ? 'yellow' : 'red'
                    }
                  >
                    %{performanceMetrics.droppedPercentage.toFixed(1)}
                  </Badge>
                </HStack>
                
                <Divider my={2} />
                
                <Text fontWeight="bold">
                  Performans Değerlendirmesi:
                </Text>
                <Text>
                  {performanceMetrics.droppedPercentage < 10 
                    ? 'Mükemmel! Animasyon çok akıcı çalışıyor.'
                    : performanceMetrics.droppedPercentage < 30
                    ? 'İyi. Animasyon genellikle akıcı ancak bazı kareler düşüyor.'
                    : 'Zayıf. Animasyon akıcı değil, optimizasyon gerekiyor.'}
                </Text>
              </VStack>
            ) : (
              <Flex 
                height="100%" 
                alignItems="center" 
                justifyContent="center"
                minHeight="200px"
              >
                <Text color="gray.500">
                  Animasyonu başlatarak performans metriklerini görüntüleyin
                </Text>
              </Flex>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>
      
      <Box mb={8}>
        <Heading as="h2" size="md" mb={4}>Animasyon Önizleme</Heading>
        
        <Flex justifyContent="center" alignItems="center" height="300px" position="relative">
          <Box 
            width="200px"
            height="200px"
            bg={colorMode === 'light' ? 'blue.500' : 'blue.300'}
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontWeight="bold"
            boxShadow="lg"
            style={getAnimationStyle()}
          >
            {selectedAnimation}
          </Box>
        </Flex>
      </Box>
      
      <Box mb={8}>
        <Heading as="h2" size="md" mb={4}>Preset Önizleme</Heading>
        
        <Flex justifyContent="center" alignItems="center" height="200px">
          <Box 
            width="200px"
            height="100px"
            bg={colorMode === 'light' ? 'purple.500' : 'purple.300'}
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontWeight="bold"
            boxShadow="md"
            _hover={getPresetStyle()}
            transition={animations.createTransition(['transform', 'box-shadow'], animations.durations.normal)}
          >
            Hover Me ({selectedPreset})
          </Box>
        </Flex>
      </Box>
      
      <Box>
        <Heading as="h2" size="md" mb={4}>Keyframe Animasyon Örnekleri</Heading>
        
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          <Box 
            height="100px"
            bg={colorMode === 'light' ? 'green.500' : 'green.300'}
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontWeight="bold"
            animation={`${animations.keyframes.spin.replace('@keyframes spin {', '').replace('}', '')} 2s infinite linear`}
            {...animations.performanceUtils.forceGPU}
          >
            Spin
          </Box>
          
          <Box 
            height="100px"
            bg={colorMode === 'light' ? 'red.500' : 'red.300'}
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontWeight="bold"
            animation={`${animations.keyframes.pulse.replace('@keyframes pulse {', '').replace('}', '')} 2s infinite`}
            {...animations.performanceUtils.forceGPU}
          >
            Pulse
          </Box>
          
          <Box 
            height="100px"
            bg={colorMode === 'light' ? 'orange.500' : 'orange.300'}
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontWeight="bold"
            animation={`${animations.keyframes.bounce.replace('@keyframes bounce {', '').replace('}', '')} 2s infinite`}
            {...animations.performanceUtils.forceGPU}
          >
            Bounce
          </Box>
          
          <Box 
            height="100px"
            bg={colorMode === 'light' ? 'teal.500' : 'teal.300'}
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontWeight="bold"
            animation={`${animations.keyframes.breathe.replace('@keyframes breathe {', '').replace('}', '')} 3s infinite`}
            {...animations.performanceUtils.forceGPU}
          >
            Breathe
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default AnimationTest;
