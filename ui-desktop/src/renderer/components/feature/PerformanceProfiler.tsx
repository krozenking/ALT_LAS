import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import {
  Box,
  Flex,
  Text,
  useColorMode,
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  HStack,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react';
import { animations } from '@/styles/animations';

// Performans profil verisi
export interface ComponentRenderData {
  id: string;
  name: string;
  renderCount: number;
  renderTime: number; // ms cinsinden
  lastRenderTimestamp: Date;
  wasted: boolean; // Gereksiz render olup olmadığı
  props: {
    name: string;
    type: string;
    changed: boolean;
  }[];
}

export interface BottleneckData {
  id: string;
  component: string;
  issue: 'heavy-render' | 'frequent-render' | 'large-data' | 'unoptimized-loop' | 'dom-thrashing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  affectedProps?: string[];
  code?: string;
}

// Performans profil özellikleri
interface PerformanceProfilerProps {
  initialComponentData?: ComponentRenderData[];
  initialBottlenecks?: BottleneckData[];
  onOptimizationApply?: (bottleneckId: string) => void;
}

// Memoize edilmiş BottleneckItem bileşeni
const BottleneckItem = memo(({
  bottleneck,
  onOptimize,
  colorMode
}: {
  bottleneck: BottleneckData;
  onOptimize: (id: string) => void;
  colorMode: string;
}) => {
  // Severity rengini belirle
  const severityColor = useMemo(() => {
    switch (bottleneck.severity) {
      case 'critical': return 'red.500';
      case 'high': return 'orange.500';
      case 'medium': return 'yellow.500';
      case 'low': return 'green.500';
      default: return 'gray.500';
    }
  }, [bottleneck.severity]);

  // Issue ikonunu belirle
  const issueIcon = useMemo(() => {
    switch (bottleneck.issue) {
      case 'heavy-render': return '⏱️';
      case 'frequent-render': return '🔄';
      case 'large-data': return '📊';
      case 'unoptimized-loop': return '🔁';
      case 'dom-thrashing': return '🔨';
      default: return '⚠️';
    }
  }, [bottleneck.issue]);

  // Issue adını belirle
  const issueName = useMemo(() => {
    switch (bottleneck.issue) {
      case 'heavy-render': return 'Ağır Render';
      case 'frequent-render': return 'Sık Render';
      case 'large-data': return 'Büyük Veri';
      case 'unoptimized-loop': return 'Optimize Edilmemiş Döngü';
      case 'dom-thrashing': return 'DOM Thrashing';
      default: return 'Bilinmeyen Sorun';
    }
  }, [bottleneck.issue]);

  // Severity adını belirle
  const severityName = useMemo(() => {
    switch (bottleneck.severity) {
      case 'critical': return 'Kritik';
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return 'Bilinmeyen';
    }
  }, [bottleneck.severity]);

  // Optimize et butonuna tıklama işleyicisi
  const handleOptimize = useCallback(() => {
    onOptimize(bottleneck.id);
  }, [bottleneck.id, onOptimize]);

  return (
    <AccordionItem>
      <h2>
        <AccordionButton>
          <Box flex="1" textAlign="left">
            <HStack>
              <Box aria-hidden="true">{issueIcon}</Box>
              <Text fontWeight="medium">{bottleneck.component}</Text>
              <Badge colorScheme={severityColor.split('.')[0]} ml={2}>
                {severityName}
              </Badge>
            </HStack>
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel pb={4}>
        <VStack align="stretch" spacing={3}>
          <Alert 
            status={
              bottleneck.severity === 'critical' ? 'error' :
              bottleneck.severity === 'high' ? 'warning' :
              bottleneck.severity === 'medium' ? 'warning' :
              'info'
            }
            variant="left-accent"
            borderRadius="md"
          >
            <AlertIcon />
            <Box>
              <AlertTitle>{issueName}</AlertTitle>
              <AlertDescription>{bottleneck.description}</AlertDescription>
            </Box>
          </Alert>

          {bottleneck.affectedProps && bottleneck.affectedProps.length > 0 && (
            <Box>
              <Text fontWeight="medium" mb={1}>Etkilenen Props:</Text>
              <HStack spacing={2} flexWrap="wrap">
                {bottleneck.affectedProps.map(prop => (
                  <Badge key={prop} colorScheme="blue" variant="outline">
                    {prop}
                  </Badge>
                ))}
              </HStack>
            </Box>
          )}

          {bottleneck.code && (
            <Box>
              <Text fontWeight="medium" mb={1}>Sorunlu Kod:</Text>
              <Code 
                p={2} 
                borderRadius="md" 
                bg={colorMode === 'light' ? 'gray.50' : 'gray.700'}
                overflowX="auto"
                display="block"
                whiteSpace="pre"
              >
                {bottleneck.code}
              </Code>
            </Box>
          )}

          <Box>
            <Text fontWeight="medium" mb={1}>Öneri:</Text>
            <Text>{bottleneck.recommendation}</Text>
          </Box>

          <Button 
            colorScheme="blue" 
            size="sm" 
            onClick={handleOptimize}
            leftIcon={<Box aria-hidden="true">✅</Box>}
          >
            Optimizasyonu Uygula
          </Button>
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
});

// Memoize edilmiş ComponentRenderTable bileşeni
const ComponentRenderTable = memo(({
  components,
  colorMode
}: {
  components: ComponentRenderData[];
  colorMode: string;
}) => {
  return (
    <Box overflowX="auto">
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Bileşen</Th>
            <Th isNumeric>Render Sayısı</Th>
            <Th isNumeric>Render Süresi (ms)</Th>
            <Th>Son Render</Th>
            <Th>Durum</Th>
          </Tr>
        </Thead>
        <Tbody>
          {components.map(component => (
            <Tr 
              key={component.id}
              bg={component.wasted ? (colorMode === 'light' ? 'red.50' : 'red.900') : undefined}
            >
              <Td fontWeight="medium">{component.name}</Td>
              <Td isNumeric>{component.renderCount}</Td>
              <Td isNumeric>{component.renderTime.toFixed(2)}</Td>
              <Td>{new Date(component.lastRenderTimestamp).toLocaleTimeString()}</Td>
              <Td>
                {component.wasted ? (
                  <Badge colorScheme="red">Gereksiz Render</Badge>
                ) : (
                  <Badge colorScheme="green">Normal</Badge>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
});

// Memoize edilmiş PerformanceStats bileşeni
const PerformanceStats = memo(({
  components
}: {
  components: ComponentRenderData[];
}) => {
  // Toplam render sayısı
  const totalRenders = useMemo(() => {
    return components.reduce((sum, comp) => sum + comp.renderCount, 0);
  }, [components]);

  // Toplam render süresi
  const totalRenderTime = useMemo(() => {
    return components.reduce((sum, comp) => sum + comp.renderTime, 0);
  }, [components]);

  // Gereksiz render sayısı
  const wastedRenders = useMemo(() => {
    return components.filter(comp => comp.wasted).reduce((sum, comp) => sum + comp.renderCount, 0);
  }, [components]);

  // Gereksiz render yüzdesi
  const wastedPercentage = useMemo(() => {
    return totalRenders > 0 ? (wastedRenders / totalRenders) * 100 : 0;
  }, [totalRenders, wastedRenders]);

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
      <Stat>
        <StatLabel>Toplam Render</StatLabel>
        <StatNumber>{totalRenders}</StatNumber>
        <StatHelpText>Tüm bileşenler</StatHelpText>
      </Stat>

      <Stat>
        <StatLabel>Toplam Render Süresi</StatLabel>
        <StatNumber>{totalRenderTime.toFixed(2)} ms</StatNumber>
        <StatHelpText>Kümülatif süre</StatHelpText>
      </Stat>

      <Stat>
        <StatLabel>Gereksiz Renderlar</StatLabel>
        <StatNumber>{wastedRenders} ({wastedPercentage.toFixed(1)}%)</StatNumber>
        <StatHelpText>
          <StatArrow type="decrease" />
          Optimize edilebilir
        </StatHelpText>
      </Stat>
    </SimpleGrid>
  );
});

// Performans profil bileşeni
export const PerformanceProfiler: React.FC<PerformanceProfilerProps> = memo(({
  initialComponentData = [],
  initialBottlenecks = [],
  onOptimizationApply
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const [components, setComponents] = useState<ComponentRenderData[]>(initialComponentData);
  const [bottlenecks, setBottlenecks] = useState<BottleneckData[]>(initialBottlenecks);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Demo veriler
  useEffect(() => {
    if (components.length === 0) {
      const demoComponents: ComponentRenderData[] = [
        {
          id: '1',
          name: 'NotificationCenter',
          renderCount: 24,
          renderTime: 18.5,
          lastRenderTimestamp: new Date(),
          wasted: true,
          props: [
            { name: 'notifications', type: 'array', changed: true },
            { name: 'onNotificationRead', type: 'function', changed: false },
            { name: 'onNotificationDismiss', type: 'function', changed: false }
          ]
        },
        {
          id: '2',
          name: 'FileManager',
          renderCount: 12,
          renderTime: 45.2,
          lastRenderTimestamp: new Date(),
          wasted: false,
          props: [
            { name: 'files', type: 'array', changed: true },
            { name: 'onFileOpen', type: 'function', changed: false },
            { name: 'onFileDelete', type: 'function', changed: false }
          ]
        },
        {
          id: '3',
          name: 'SettingsPanel',
          renderCount: 8,
          renderTime: 12.3,
          lastRenderTimestamp: new Date(),
          wasted: false,
          props: [
            { name: 'settings', type: 'object', changed: true },
            { name: 'onSettingChange', type: 'function', changed: false }
          ]
        },
        {
          id: '4',
          name: 'NotificationItem',
          renderCount: 120,
          renderTime: 5.7,
          lastRenderTimestamp: new Date(),
          wasted: true,
          props: [
            { name: 'notification', type: 'object', changed: false },
            { name: 'onDismiss', type: 'function', changed: false },
            { name: 'onMarkAsRead', type: 'function', changed: false }
          ]
        },
        {
          id: '5',
          name: 'FileGridItem',
          renderCount: 85,
          renderTime: 8.2,
          lastRenderTimestamp: new Date(),
          wasted: false,
          props: [
            { name: 'file', type: 'object', changed: true },
            { name: 'isSelected', type: 'boolean', changed: true },
            { name: 'onSelect', type: 'function', changed: false }
          ]
        }
      ];

      const demoBottlenecks: BottleneckData[] = [
        {
          id: '1',
          component: 'NotificationCenter',
          issue: 'frequent-render',
          severity: 'high',
          description: 'Bildirim listesi her bildirim değişikliğinde gereksiz yere yeniden render ediliyor.',
          recommendation: 'useMemo ve React.memo kullanarak bildirim listesini optimize edin. Ayrıca useCallback ile olay işleyicilerini memoize edin.',
          affectedProps: ['notifications'],
          code: `// Mevcut kod
const notificationList = notifications.map(notification => (
  <NotificationItem
    key={notification.id}
    notification={notification}
    onDismiss={handleDismiss}
    onMarkAsRead={handleMarkAsRead}
  />
));

// Önerilen kod
const notificationList = useMemo(() => {
  return notifications.map(notification => (
    <NotificationItem
      key={notification.id}
      notification={notification}
      onDismiss={handleDismiss}
      onMarkAsRead={handleMarkAsRead}
    />
  ));
}, [notifications, handleDismiss, handleMarkAsRead]);`
        },
        {
          id: '2',
          component: 'FileManager',
          issue: 'large-data',
          severity: 'medium',
          description: 'Büyük dosya listesi render performansını düşürüyor.',
          recommendation: 'react-window veya react-virtualized gibi sanal liste kütüphaneleri kullanarak sadece görünür öğeleri render edin.',
          affectedProps: ['files'],
          code: `// Mevcut kod
<Box>
  {files.map(file => (
    <FileItem key={file.id} file={file} />
  ))}
</Box>

// Önerilen kod
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={500}
  width="100%"
  itemCount={files.length}
  itemSize={50}
>
  {({ index, style }) => (
    <FileItem 
      style={style}
      key={files[index].id} 
      file={files[index]} 
    />
  )}
</FixedSizeList>`
        },
        {
          id: '3',
          component: 'NotificationItem',
          issue: 'dom-thrashing',
          severity: 'critical',
          description: 'Bildirim öğeleri gereksiz DOM güncellemeleri yapıyor ve layout thrashing\'e neden oluyor.',
          recommendation: 'DOM ölçümlerini ve güncellemelerini toplu halde yapın. requestAnimationFrame kullanarak DOM okuma ve yazma işlemlerini senkronize edin.',
          code: `// Mevcut kod
notifications.forEach(notification => {
  const height = notification.element.getBoundingClientRect().height;
  notification.element.style.maxHeight = height * 1.5 + 'px';
});

// Önerilen kod
// Önce tüm ölçümleri yap
const heights = notifications.map(notification => 
  notification.element.getBoundingClientRect().height
);

// Sonra tüm stil güncellemelerini yap
notifications.forEach((notification, i) => {
  notification.element.style.maxHeight = heights[i] * 1.5 + 'px';
});`
        },
        {
          id: '4',
          component: 'SettingsPanel',
          issue: 'unoptimized-loop',
          severity: 'low',
          description: 'Ayarlar panelinde verimsiz döngüler kullanılıyor.',
          recommendation: 'Array.forEach yerine daha verimli yöntemler kullanın. Büyük veri setleri için döngüleri optimize edin.',
          code: `// Mevcut kod
const processSettings = () => {
  let result = [];
  for (let i = 0; i < settings.length; i++) {
    for (let j = 0; j < settings[i].options.length; j++) {
      if (settings[i].options[j].enabled) {
        result.push(settings[i].options[j]);
      }
    }
  }
  return result;
};

// Önerilen kod
const processSettings = () => {
  return settings.flatMap(setting => 
    setting.options.filter(option => option.enabled)
  );
};`
        },
        {
          id: '5',
          component: 'FileGridItem',
          issue: 'heavy-render',
          severity: 'medium',
          description: 'Dosya grid öğeleri ağır render işlemleri yapıyor.',
          recommendation: 'Hesaplamaları useMemo ile önbelleğe alın ve bileşeni React.memo ile sarın.',
          affectedProps: ['file', 'isSelected'],
          code: `// Mevcut kod
const FileGridItem = ({ file, isSelected }) => {
  // Her render'da yeniden hesaplanıyor
  const fileIcon = getFileTypeIcon(file.type);
  const fileSize = formatFileSize(file.size);
  
  return (
    <Box>
      {/* Bileşen içeriği */}
    </Box>
  );
};

// Önerilen kod
const FileGridItem = React.memo(({ file, isSelected }) => {
  // Sadece file.type değiştiğinde yeniden hesaplanır
  const fileIcon = useMemo(() => getFileTypeIcon(file.type), [file.type]);
  // Sadece file.size değiştiğinde yeniden hesaplanır
  const fileSize = useMemo(() => formatFileSize(file.size), [file.size]);
  
  return (
    <Box>
      {/* Bileşen içeriği */}
    </Box>
  );
});`
        }
      ];

      setComponents(demoComponents);
      setBottlenecks(demoBottlenecks);
    }
  }, []);

  // Optimizasyon uygulama işleyicisi
  const handleOptimize = useCallback((bottleneckId: string) => {
    // Darboğazı çözüldü olarak işaretle
    setBottlenecks(prev => prev.filter(b => b.id !== bottleneckId));
    
    if (onOptimizationApply) {
      onOptimizationApply(bottleneckId);
    }
  }, [onOptimizationApply]);

  // Darboğaz sayısı
  const bottleneckCount = useMemo(() => bottlenecks.length, [bottlenecks]);

  // Kritik darboğaz sayısı
  const criticalBottleneckCount = useMemo(() => {
    return bottlenecks.filter(b => b.severity === 'critical' || b.severity === 'high').length;
  }, [bottlenecks]);

  return (
    <>
      {/* Profil Butonu */}
      <Tooltip label="Performans Profili" aria-label="Performans Profili">
        <Box position="relative">
          <IconButton
            ref={btnRef}
            aria-label="Performans Profili"
            icon={<Box fontSize="xl">📊</Box>}
            variant="glass"
            onClick={onOpen}
            {...animations.performanceUtils.forceGPU}
          />
          
          {/* Darboğaz Sayacı */}
          {bottleneckCount > 0 && (
            <Badge
              position="absolute"
              top="-2px"
              right="-2px"
              borderRadius="full"
              bg={criticalBottleneckCount > 0 ? "red.500" : "orange.500"}
              color="white"
              fontSize="xs"
              fontWeight="bold"
              p="1"
              minW="18px"
              textAlign="center"
              animation={criticalBottleneckCount > 0 ? `${animations.keyframes.pulse} 2s infinite` : undefined}
              {...animations.performanceUtils.forceGPU}
            >
              {bottleneckCount}
            </Badge>
          )}
        </Box>
      </Tooltip>
      
      {/* Profil Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="lg"
      >
        <DrawerOverlay />
        <DrawerContent
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
          borderLeftRadius="md"
        >
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" fontWeight="bold">Performans Profili</Text>
              {bottleneckCount > 0 && (
                <Badge 
                  colorScheme={criticalBottleneckCount > 0 ? "red" : "orange"}
                  fontSize="sm"
                  py={1}
                  px={2}
                  borderRadius="full"
                >
                  {bottleneckCount} Optimizasyon Fırsatı
                </Badge>
              )}
            </Flex>
          </DrawerHeader>
          
          <DrawerBody p={4}>
            <Tabs isFitted variant="enclosed">
              <TabList mb="1em">
                <Tab>Genel Bakış</Tab>
                <Tab>Bileşen Analizi</Tab>
                <Tab>Optimizasyon Önerileri</Tab>
              </TabList>
              
              <TabPanels>
                {/* Genel Bakış Paneli */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <PerformanceStats components={components} />
                    
                    <Box>
                      <Text fontSize="lg" fontWeight="medium" mb={3}>Performans Özeti</Text>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Card>
                          <CardHeader pb={0}>
                            <Text fontWeight="medium">En Çok Render Edilen Bileşenler</Text>
                          </CardHeader>
                          <CardBody>
                            <VStack align="stretch" spacing={2}>
                              {[...components]
                                .sort((a, b) => b.renderCount - a.renderCount)
                                .slice(0, 3)
                                .map(comp => (
                                  <HStack key={comp.id} justify="space-between">
                                    <Text>{comp.name}</Text>
                                    <Badge>{comp.renderCount} render</Badge>
                                  </HStack>
                                ))
                              }
                            </VStack>
                          </CardBody>
                        </Card>
                        
                        <Card>
                          <CardHeader pb={0}>
                            <Text fontWeight="medium">En Yavaş Bileşenler</Text>
                          </CardHeader>
                          <CardBody>
                            <VStack align="stretch" spacing={2}>
                              {[...components]
                                .sort((a, b) => b.renderTime - a.renderTime)
                                .slice(0, 3)
                                .map(comp => (
                                  <HStack key={comp.id} justify="space-between">
                                    <Text>{comp.name}</Text>
                                    <Badge>{comp.renderTime.toFixed(1)} ms</Badge>
                                  </HStack>
                                ))
                              }
                            </VStack>
                          </CardBody>
                        </Card>
                      </SimpleGrid>
                    </Box>
                    
                    {bottleneckCount > 0 && (
                      <Alert 
                        status={criticalBottleneckCount > 0 ? "error" : "warning"}
                        variant="left-accent"
                        borderRadius="md"
                      >
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Performans Darboğazları Tespit Edildi</AlertTitle>
                          <AlertDescription>
                            {criticalBottleneckCount > 0 
                              ? `${criticalBottleneckCount} kritik darboğaz dahil olmak üzere ${bottleneckCount} performans sorunu tespit edildi.`
                              : `${bottleneckCount} performans iyileştirme fırsatı tespit edildi.`
                            }
                            <Button 
                              size="sm" 
                              colorScheme={criticalBottleneckCount > 0 ? "red" : "orange"}
                              variant="outline"
                              mt={2}
                              onClick={() => document.querySelectorAll('[role="tab"]')[2].click()}
                            >
                              Önerileri Görüntüle
                            </Button>
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}
                  </VStack>
                </TabPanel>
                
                {/* Bileşen Analizi Paneli */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <ComponentRenderTable components={components} colorMode={colorMode} />
                    
                    <Box>
                      <Text fontSize="lg" fontWeight="medium" mb={3}>Render Dağılımı</Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {components.map(comp => (
                          <Box key={comp.id} p={4} borderWidth="1px" borderRadius="md">
                            <Text fontWeight="medium" mb={2}>{comp.name}</Text>
                            <HStack justify="space-between" mb={1}>
                              <Text fontSize="sm">Render Sayısı:</Text>
                              <Text fontSize="sm" fontWeight="medium">{comp.renderCount}</Text>
                            </HStack>
                            <HStack justify="space-between" mb={1}>
                              <Text fontSize="sm">Render Süresi:</Text>
                              <Text fontSize="sm" fontWeight="medium">{comp.renderTime.toFixed(2)} ms</Text>
                            </HStack>
                            <HStack justify="space-between" mb={3}>
                              <Text fontSize="sm">Durum:</Text>
                              <Badge colorScheme={comp.wasted ? "red" : "green"}>
                                {comp.wasted ? "Gereksiz Render" : "Normal"}
                              </Badge>
                            </HStack>
                            
                            <Divider mb={3} />
                            
                            <Text fontSize="sm" fontWeight="medium" mb={2}>Props:</Text>
                            <VStack align="stretch" spacing={1}>
                              {comp.props.map(prop => (
                                <HStack key={prop.name} justify="space-between">
                                  <Text fontSize="xs">{prop.name} <Badge size="xs" colorScheme="gray">{prop.type}</Badge></Text>
                                  <Badge colorScheme={prop.changed ? "blue" : "gray"} variant={prop.changed ? "solid" : "outline"}>
                                    {prop.changed ? "Değişti" : "Sabit"}
                                  </Badge>
                                </HStack>
                              ))}
                            </VStack>
                          </Box>
                        ))}
                      </SimpleGrid>
                    </Box>
                  </VStack>
                </TabPanel>
                
                {/* Optimizasyon Önerileri Paneli */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    {bottleneckCount === 0 ? (
                      <Alert status="success" borderRadius="md">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Tüm Optimizasyonlar Tamamlandı</AlertTitle>
                          <AlertDescription>
                            Şu anda tespit edilmiş bir performans darboğazı bulunmuyor. Harika iş!
                          </AlertDescription>
                        </Box>
                      </Alert>
                    ) : (
                      <>
                        <Text>
                          Aşağıdaki performans darboğazları tespit edildi. Her bir öneriyi inceleyip uygulamak için "Optimizasyonu Uygula" butonuna tıklayın.
                        </Text>
                        
                        <Accordion allowMultiple>
                          {bottlenecks.map(bottleneck => (
                            <BottleneckItem 
                              key={bottleneck.id} 
                              bottleneck={bottleneck} 
                              onOptimize={handleOptimize}
                              colorMode={colorMode}
                            />
                          ))}
                        </Accordion>
                      </>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
});

// Display name for debugging
PerformanceProfiler.displayName = 'PerformanceProfiler';

export default PerformanceProfiler;
