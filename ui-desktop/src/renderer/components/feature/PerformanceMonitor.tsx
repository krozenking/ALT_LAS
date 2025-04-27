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
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
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
  CardFooter
} from '@chakra-ui/react';
import { animations } from '@/styles/animations';

// Performans izleme arayüzü
export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'increase' | 'decrease' | 'stable';
  changePercentage: number;
  category: 'cpu' | 'memory' | 'disk' | 'network' | 'system';
  critical: boolean;
  history: {
    timestamp: Date;
    value: number;
  }[];
}

// Performans monitörü özellikleri
interface PerformanceMonitorProps {
  initialMetrics?: PerformanceMetric[];
  refreshInterval?: number; // milisaniye cinsinden
  onMetricAlert?: (metric: PerformanceMetric) => void;
}

// Kategori ikonu getir - Memoize edilebilir
const getCategoryIcon = (category: 'cpu' | 'memory' | 'disk' | 'network' | 'system'): string => {
  switch (category) {
    case 'cpu': return '🔄';
    case 'memory': return '🧠';
    case 'disk': return '💾';
    case 'network': return '🌐';
    case 'system': return '⚙️';
  }
};

// Memoize edilmiş PerformanceButton bileşeni
const PerformanceButton = memo(({ 
  criticalCount, 
  onOpen 
}: { 
  criticalCount: number, 
  onOpen: () => void 
}) => {
  return (
    <>
      {/* Performans Monitörü Açma Butonu */}
      <Tooltip label="Performans Monitörü" aria-label="Performans Monitörü">
        <IconButton
          aria-label="Performans Monitörü"
          icon={<Box fontSize="xl">📊</Box>}
          variant="glass"
          onClick={onOpen}
          {...animations.performanceUtils.forceGPU}
        />
      </Tooltip>
      
      {/* Kritik Metrik Sayacı */}
      {criticalCount > 0 && (
        <Badge
          position="absolute"
          top="-2px"
          right="-2px"
          borderRadius="full"
          bg="red.500"
          color="white"
          fontSize="xs"
          fontWeight="bold"
          p="1"
          minW="18px"
          textAlign="center"
          animation={`${animations.keyframes.pulse} 2s infinite`}
          {...animations.performanceUtils.forceGPU}
        >
          {criticalCount}
        </Badge>
      )}
    </>
  );
});

// Memoize edilmiş MetricCard bileşeni
const MetricCard = memo(({ metric, colorMode }: { metric: PerformanceMetric, colorMode: string }) => {
  // Trend rengini belirle - useMemo ile optimize edildi
  const trendColor = useMemo(() => {
    if (metric.critical) return 'red.500';
    
    if (metric.category === 'cpu' || metric.category === 'memory' || metric.category === 'disk') {
      // Bu kategorilerde artış genellikle olumsuzdur
      return metric.trend === 'increase' ? 'orange.500' : 
             metric.trend === 'decrease' ? 'green.500' : 'gray.500';
    } else {
      // Diğer kategorilerde duruma göre değişir
      return metric.trend === 'increase' ? 'green.500' : 
             metric.trend === 'decrease' ? 'orange.500' : 'gray.500';
    }
  }, [metric.critical, metric.category, metric.trend]);
  
  // İlerleme çubuğu rengi - useMemo ile optimize edildi
  const progressColor = useMemo(() => {
    if (metric.critical) return 'red.500';
    
    if (metric.unit === '%') {
      if (metric.value > 80) return 'orange.500';
      if (metric.value > 60) return 'yellow.500';
      return 'green.500';
    }
    
    return 'blue.500';
  }, [metric.critical, metric.unit, metric.value]);
  
  // İlerleme çubuğu renk şeması - useMemo ile optimize edildi
  const progressColorScheme = useMemo(() => {
    return progressColor.split('.')[0];
  }, [progressColor]);
  
  // Trend oku görünürlüğü - useMemo ile optimize edildi
  const arrowVisibility = useMemo(() => {
    return metric.trend === 'stable' ? 'hidden' : 'visible';
  }, [metric.trend]);
  
  // Trend oku tipi - useMemo ile optimize edildi
  const arrowType = useMemo(() => {
    return metric.trend === 'increase' ? 'increase' : 
           metric.trend === 'decrease' ? 'decrease' : 'increase';
  }, [metric.trend]);
  
  // Değişim yüzdesi metni - useMemo ile optimize edildi
  const changeText = useMemo(() => {
    return metric.changePercentage > 0 ? `${metric.changePercentage}%` : 'Sabit';
  }, [metric.changePercentage]);
  
  return (
    <Card 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden"
      boxShadow="sm"
      bg={colorMode === 'light' ? 'white' : 'gray.700'}
      borderColor={metric.critical ? 'red.500' : 'transparent'}
      transition="all 0.2s"
      _hover={{ boxShadow: 'md' }}
      role="region"
      aria-label={`${metric.name} metriği`}
    >
      <CardHeader pb={0}>
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontWeight="medium" fontSize="md">{metric.name}</Text>
          {metric.critical && (
            <Badge colorScheme="red" variant="solid" borderRadius="full">
              Kritik
            </Badge>
          )}
        </Flex>
      </CardHeader>
      
      <CardBody>
        <Stat>
          <StatNumber fontSize="2xl">
            {metric.value}{metric.unit}
          </StatNumber>
          <StatHelpText>
            <StatArrow 
              type={arrowType} 
              color={trendColor}
              visibility={arrowVisibility}
            />
            {changeText}
          </StatHelpText>
        </Stat>
        
        {metric.unit === '%' && (
          <Progress 
            value={metric.value} 
            colorScheme={progressColorScheme} 
            size="sm" 
            borderRadius="full"
            mt={2}
            aria-label={`${metric.name} ilerleme çubuğu`}
          />
        )}
      </CardBody>
    </Card>
  );
});

// Memoize edilmiş CategoryFilters bileşeni
const CategoryFilters = memo(({ 
  activeCategory, 
  onCategoryChange 
}: { 
  activeCategory: 'all' | 'cpu' | 'memory' | 'disk' | 'network' | 'system', 
  onCategoryChange: (category: 'all' | 'cpu' | 'memory' | 'disk' | 'network' | 'system') => void 
}) => {
  // Kategori değiştirme işleyicileri - useCallback ile optimize edildi
  const handleAllCategory = useCallback(() => onCategoryChange('all'), [onCategoryChange]);
  const handleCpuCategory = useCallback(() => onCategoryChange('cpu'), [onCategoryChange]);
  const handleMemoryCategory = useCallback(() => onCategoryChange('memory'), [onCategoryChange]);
  const handleDiskCategory = useCallback(() => onCategoryChange('disk'), [onCategoryChange]);
  const handleNetworkCategory = useCallback(() => onCategoryChange('network'), [onCategoryChange]);
  const handleSystemCategory = useCallback(() => onCategoryChange('system'), [onCategoryChange]);
  
  // Kategori ikonları - useMemo ile optimize edildi
  const cpuIcon = useMemo(() => getCategoryIcon('cpu'), []);
  const memoryIcon = useMemo(() => getCategoryIcon('memory'), []);
  const diskIcon = useMemo(() => getCategoryIcon('disk'), []);
  const networkIcon = useMemo(() => getCategoryIcon('network'), []);
  const systemIcon = useMemo(() => getCategoryIcon('system'), []);
  
  return (
    <HStack spacing={2} overflowX="auto" py={2} mb={4} className="category-filters">
      <Button
        size="sm"
        variant={activeCategory === 'all' ? 'solid' : 'outline'}
        onClick={handleAllCategory}
      >
        Tümü
      </Button>
      <Button
        size="sm"
        variant={activeCategory === 'cpu' ? 'solid' : 'outline'}
        onClick={handleCpuCategory}
        leftIcon={<Box>{cpuIcon}</Box>}
      >
        CPU
      </Button>
      <Button
        size="sm"
        variant={activeCategory === 'memory' ? 'solid' : 'outline'}
        onClick={handleMemoryCategory}
        leftIcon={<Box>{memoryIcon}</Box>}
      >
        Bellek
      </Button>
      <Button
        size="sm"
        variant={activeCategory === 'disk' ? 'solid' : 'outline'}
        onClick={handleDiskCategory}
        leftIcon={<Box>{diskIcon}</Box>}
      >
        Disk
      </Button>
      <Button
        size="sm"
        variant={activeCategory === 'network' ? 'solid' : 'outline'}
        onClick={handleNetworkCategory}
        leftIcon={<Box>{networkIcon}</Box>}
      >
        Ağ
      </Button>
      <Button
        size="sm"
        variant={activeCategory === 'system' ? 'solid' : 'outline'}
        onClick={handleSystemCategory}
        leftIcon={<Box>{systemIcon}</Box>}
      >
        Sistem
      </Button>
    </HStack>
  );
});

// Memoize edilmiş ControlPanel bileşeni
const ControlPanel = memo(({ 
  showCriticalOnly, 
  onToggleCritical, 
  sortBy, 
  sortDirection, 
  onSortChange 
}: { 
  showCriticalOnly: boolean, 
  onToggleCritical: () => void, 
  sortBy: 'name' | 'value' | 'trend', 
  sortDirection: 'asc' | 'desc', 
  onSortChange: (sortBy: 'name' | 'value' | 'trend') => void 
}) => {
  // Sıralama değiştirme işleyicileri - useCallback ile optimize edildi
  const handleNameSort = useCallback(() => onSortChange('name'), [onSortChange]);
  const handleValueSort = useCallback(() => onSortChange('value'), [onSortChange]);
  const handleTrendSort = useCallback(() => onSortChange('trend'), [onSortChange]);
  
  return (
    <HStack spacing={2}>
      <Button
        size="sm"
        variant={showCriticalOnly ? 'solid' : 'outline'}
        onClick={onToggleCritical}
        leftIcon={<Box>⚠️</Box>}
      >
        Kritik Metrikler
      </Button>
      <Menu>
        <MenuButton as={Button} size="sm" rightIcon={<Box>⏷</Box>}>
          Sırala
        </MenuButton>
        <MenuList>
          <MenuItem 
            onClick={handleNameSort}
            icon={<Box>{sortBy === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ' '}</Box>}
          >
            İsme Göre
          </MenuItem>
          <MenuItem 
            onClick={handleValueSort}
            icon={<Box>{sortBy === 'value' ? (sortDirection === 'asc' ? '↑' : '↓') : ' '}</Box>}
          >
            Değere Göre
          </MenuItem>
          <MenuItem 
            onClick={handleTrendSort}
            icon={<Box>{sortBy === 'trend' ? (sortDirection === 'asc' ? '↑' : '↓') : ' '}</Box>}
          >
            Trende Göre
          </MenuItem>
        </MenuList>
      </Menu>
    </HStack>
  );
});

// Memoize edilmiş MetricGrid bileşeni
const MetricGrid = memo(({ 
  metrics, 
  colorMode, 
  showCriticalOnly 
}: { 
  metrics: PerformanceMetric[], 
  colorMode: string, 
  showCriticalOnly: boolean 
}) => {
  if (metrics.length === 0) {
    return (
      <Flex 
        height="100%" 
        alignItems="center" 
        justifyContent="center" 
        p={8}
      >
        <Text color="gray.500">
          {showCriticalOnly 
            ? 'Kritik metrik bulunamadı' 
            : 'Seçilen kategoride metrik bulunamadı'}
        </Text>
      </Flex>
    );
  }
  
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
      {metrics.map(metric => (
        <MetricCard key={metric.id} metric={metric} colorMode={colorMode} />
      ))}
    </SimpleGrid>
  );
});

// Performans monitörü bileşeni
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = memo(({
  initialMetrics = [],
  refreshInterval = 5000, // 5 saniye
  onMetricAlert
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>(initialMetrics);
  const [activeCategory, setActiveCategory] = useState<'all' | 'cpu' | 'memory' | 'disk' | 'network' | 'system'>('all');
  const [showCriticalOnly, setShowCriticalOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'trend'>('value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Kritik metrik sayısı - useMemo ile optimize edildi
  const criticalCount = useMemo(() => {
    return metrics.filter(m => m.critical).length;
  }, [metrics]);
  
  // Demo metrikler
  useEffect(() => {
    if (metrics.length === 0) {
      const demoMetrics: PerformanceMetric[] = [
        {
          id: '1',
          name: 'CPU Kullanımı',
          value: 35,
          unit: '%',
          trend: 'increase',
          changePercentage: 5,
          category: 'cpu',
          critical: false,
          history: [
            { timestamp: new Date(Date.now() - 1000 * 60 * 5), value: 30 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 4), value: 28 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 3), value: 32 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 2), value: 33 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 1), value: 35 }
          ]
        },
        {
          id: '2',
          name: 'Bellek Kullanımı',
          value: 62,
          unit: '%',
          trend: 'increase',
          changePercentage: 8,
          category: 'memory',
          critical: false,
          history: [
            { timestamp: new Date(Date.now() - 1000 * 60 * 5), value: 54 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 4), value: 56 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 3), value: 58 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 2), value: 60 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 1), value: 62 }
          ]
        },
        {
          id: '3',
          name: 'Disk I/O',
          value: 12,
          unit: 'MB/s',
          trend: 'decrease',
          changePercentage: 3,
          category: 'disk',
          critical: false,
          history: [
            { timestamp: new Date(Date.now() - 1000 * 60 * 5), value: 15 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 4), value: 14 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 3), value: 13 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 2), value: 12.5 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 1), value: 12 }
          ]
        },
        {
          id: '4',
          name: 'Disk Kullanımı',
          value: 78,
          unit: '%',
          trend: 'increase',
          changePercentage: 2,
          category: 'disk',
          critical: false,
          history: [
            { timestamp: new Date(Date.now() - 1000 * 60 * 5), value: 76 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 4), value: 76.5 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 3), value: 77 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 2), value: 77.5 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 1), value: 78 }
          ]
        },
        {
          id: '5',
          name: 'Ağ Trafiği',
          value: 2.5,
          unit: 'MB/s',
          trend: 'stable',
          changePercentage: 0,
          category: 'network',
          critical: false,
          history: [
            { timestamp: new Date(Date.now() - 1000 * 60 * 5), value: 2.5 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 4), value: 2.4 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 3), value: 2.6 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 2), value: 2.5 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 1), value: 2.5 }
          ]
        },
        {
          id: '6',
          name: 'Sistem Sıcaklığı',
          value: 72,
          unit: '°C',
          trend: 'increase',
          changePercentage: 12,
          category: 'system',
          critical: true,
          history: [
            { timestamp: new Date(Date.now() - 1000 * 60 * 5), value: 60 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 4), value: 63 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 3), value: 67 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 2), value: 70 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 1), value: 72 }
          ]
        },
        {
          id: '7',
          name: 'İşlem Sayısı',
          value: 124,
          unit: '',
          trend: 'increase',
          changePercentage: 15,
          category: 'system',
          critical: false,
          history: [
            { timestamp: new Date(Date.now() - 1000 * 60 * 5), value: 105 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 4), value: 110 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 3), value: 115 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 2), value: 120 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 1), value: 124 }
          ]
        },
        {
          id: '8',
          name: 'Sayfa Hatası',
          value: 45,
          unit: '/s',
          trend: 'increase',
          changePercentage: 25,
          category: 'memory',
          critical: true,
          history: [
            { timestamp: new Date(Date.now() - 1000 * 60 * 5), value: 20 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 4), value: 25 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 3), value: 30 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 2), value: 38 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 1), value: 45 }
          ]
        }
      ];
      
      setMetrics(demoMetrics);
    }
  }, []);
  
  // Metrikleri periyodik olarak güncelle
  useEffect(() => {
    const simulateMetricUpdate = () => {
      setMetrics(prevMetrics => {
        return prevMetrics.map(metric => {
          // Rastgele değişim
          const randomChange = Math.random() * 6 - 3; // -3 ile +3 arasında
          let newValue = metric.value + randomChange;
          
          // Değer sınırlarını kontrol et
          if (metric.unit === '%') {
            newValue = Math.max(0, Math.min(100, newValue));
          } else {
            newValue = Math.max(0, newValue);
          }
          
          // Trend hesapla
          const lastValue = metric.history[metric.history.length - 1].value;
          let trend: 'increase' | 'decrease' | 'stable' = 'stable';
          let changePercentage = 0;
          
          if (newValue > lastValue) {
            trend = 'increase';
            changePercentage = ((newValue - lastValue) / lastValue) * 100;
          } else if (newValue < lastValue) {
            trend = 'decrease';
            changePercentage = ((lastValue - newValue) / lastValue) * 100;
          }
          
          // Kritik durumu kontrol et
          let critical = metric.critical;
          if (metric.unit === '%' && newValue > 90) {
            critical = true;
          } else if (metric.name === 'Sistem Sıcaklığı' && newValue > 70) {
            critical = true;
          } else if (metric.name === 'Sayfa Hatası' && newValue > 40) {
            critical = true;
          }
          
          // Kritik durum değiştiyse ve kritik olduysa bildirim gönder
          if (!metric.critical && critical && onMetricAlert) {
            onMetricAlert({
              ...metric,
              value: newValue,
              trend,
              changePercentage,
              critical,
              history: [
                ...metric.history,
                { timestamp: new Date(), value: newValue }
              ]
            });
          }
          
          // Yeni metrik nesnesi
          return {
            ...metric,
            value: parseFloat(newValue.toFixed(1)),
            trend,
            changePercentage: parseFloat(changePercentage.toFixed(1)),
            critical,
            history: [
              ...metric.history,
              { timestamp: new Date(), value: newValue }
            ].slice(-10) // Son 10 veriyi tut
          };
        });
      });
    };
    
    // Periyodik güncelleme başlat
    refreshTimerRef.current = setInterval(simulateMetricUpdate, refreshInterval);
    
    // Temizleme fonksiyonu
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [refreshInterval, onMetricAlert]);
  
  // Metrikleri filtrele - useMemo ile optimize edildi
  const filteredMetrics = useMemo(() => {
    return metrics.filter(metric => {
      const categoryMatch = activeCategory === 'all' || metric.category === activeCategory;
      const criticalMatch = !showCriticalOnly || metric.critical;
      return categoryMatch && criticalMatch;
    });
  }, [metrics, activeCategory, showCriticalOnly]);
  
  // Metrikleri sırala - useMemo ile optimize edildi
  const sortedMetrics = useMemo(() => {
    return [...filteredMetrics].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'value':
          comparison = a.value - b.value;
          break;
        case 'trend':
          // Trend sıralaması: artış > sabit > azalış
          const trendOrder = { 'increase': 2, 'stable': 1, 'decrease': 0 };
          comparison = trendOrder[a.trend] - trendOrder[b.trend];
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredMetrics, sortBy, sortDirection]);
  
  // Sıralama değiştir - useCallback ile optimize edildi
  const handleSortChange = useCallback((newSortBy: 'name' | 'value' | 'trend') => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
  }, [sortBy]);
  
  // Kategori değiştir - useCallback ile optimize edildi
  const handleCategoryChange = useCallback((category: 'all' | 'cpu' | 'memory' | 'disk' | 'network' | 'system') => {
    setActiveCategory(category);
  }, []);
  
  // Kritik metrik filtresini değiştir - useCallback ile optimize edildi
  const handleToggleCritical = useCallback(() => {
    setShowCriticalOnly(prev => !prev);
  }, []);
  
  // Bileşen displayName'leri
  PerformanceButton.displayName = 'PerformanceButton';
  MetricCard.displayName = 'MetricCard';
  CategoryFilters.displayName = 'CategoryFilters';
  ControlPanel.displayName = 'ControlPanel';
  MetricGrid.displayName = 'MetricGrid';
  
  return (
    <>
      {/* Performans Monitörü Açma Butonu */}
      <PerformanceButton criticalCount={criticalCount} onOpen={onOpen} />
      
      {/* Performans Monitörü Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size="xl"
        aria-labelledby="performance-monitor-header"
      >
        <DrawerOverlay />
        <DrawerContent
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
          borderLeftRadius="md"
        >
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" fontWeight="bold" id="performance-monitor-header">Performans Monitörü</Text>
              <ControlPanel 
                showCriticalOnly={showCriticalOnly}
                onToggleCritical={handleToggleCritical}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
              />
            </Flex>
          </DrawerHeader>
          
          <DrawerBody p={4}>
            <Flex direction="column" height="100%">
              {/* Kategori Filtreleri */}
              <CategoryFilters 
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
              />
              
              {/* Metrik Kartları */}
              <MetricGrid 
                metrics={sortedMetrics}
                colorMode={colorMode}
                showCriticalOnly={showCriticalOnly}
              />
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
});

// Ensure displayName is set for React DevTools
PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor;
