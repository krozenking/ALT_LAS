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
import { PerformanceProfiler } from './PerformanceProfiler';

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
            { timestamp: new Date(Date.now() - 1000 * 60 * 3), value: 65 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 2), value: 68 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 1), value: 72 }
          ]
        },
        {
          id: '7',
          name: 'Sistem Uptime',
          value: 72,
          unit: 'saat',
          trend: 'increase',
          changePercentage: 1,
          category: 'system',
          critical: false,
          history: [
            { timestamp: new Date(Date.now() - 1000 * 60 * 5), value: 68 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 4), value: 69 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 3), value: 70 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 2), value: 71 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 1), value: 72 }
          ]
        },
        {
          id: '8',
          name: 'Boş Bellek',
          value: 1.2,
          unit: 'GB',
          trend: 'decrease',
          changePercentage: 15,
          category: 'memory',
          critical: true,
          history: [
            { timestamp: new Date(Date.now() - 1000 * 60 * 5), value: 2.5 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 4), value: 2.2 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 3), value: 1.8 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 2), value: 1.5 },
            { timestamp: new Date(Date.now() - 1000 * 60 * 1), value: 1.2 }
          ]
        }
      ];
      
      setMetrics(demoMetrics);
    }
  }, []);
  
  // Metrikleri periyodik olarak güncelle
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(prevMetrics => {
        return prevMetrics.map(metric => {
          // Rastgele değişim
          const change = Math.random() * 10 - 5; // -5 ile 5 arası
          let newValue = metric.value + (metric.value * change / 100);
          
          // Değer sınırlarını kontrol et
          if (metric.unit === '%') {
            newValue = Math.max(0, Math.min(100, newValue));
          } else {
            newValue = Math.max(0, newValue);
          }
          
          // Trend hesapla
          const lastValue = metric.history[metric.history.length - 1].value;
          const trend: 'increase' | 'decrease' | 'stable' = 
            newValue > lastValue * 1.02 ? 'increase' :
            newValue < lastValue * 0.98 ? 'decrease' : 'stable';
          
          // Değişim yüzdesi
          const changePercentage = lastValue > 0 
            ? Math.abs(((newValue - lastValue) / lastValue) * 100) 
            : 0;
          
          // Kritik durumu kontrol et
          let critical = false;
          if (metric.category === 'cpu' && newValue > 90) critical = true;
          if (metric.category === 'memory' && newValue > 90 && metric.unit === '%') critical = true;
          if (metric.category === 'disk' && newValue > 95 && metric.unit === '%') critical = true;
          if (metric.category === 'system' && metric.name === 'Sistem Sıcaklığı' && newValue > 80) critical = true;
          if (metric.category === 'memory' && metric.name === 'Boş Bellek' && newValue < 1.0) critical = true;
          
          // Yeni geçmiş değeri
          const newHistory = [
            ...metric.history.slice(-4), // Son 4 değeri al
            { timestamp: new Date(), value: newValue }
          ];
          
          // Kritik metrik uyarısı
          if (critical && !metric.critical && onMetricAlert) {
            onMetricAlert({
              ...metric,
              value: newValue,
              trend,
              changePercentage: Math.round(changePercentage),
              critical,
              history: newHistory
            });
          }
          
          return {
            ...metric,
            value: newValue,
            trend,
            changePercentage: Math.round(changePercentage),
            critical,
            history: newHistory
          };
        });
      });
    };
    
    refreshTimerRef.current = setInterval(updateMetrics, refreshInterval);
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [refreshInterval, onMetricAlert]);
  
  // Filtrelenmiş metrikler - useMemo ile optimize edildi
  const filteredMetrics = useMemo(() => {
    return metrics.filter(metric => {
      if (showCriticalOnly && !metric.critical) {
        return false;
      }
      
      if (activeCategory !== 'all' && metric.category !== activeCategory) {
        return false;
      }
      
      return true;
    });
  }, [metrics, showCriticalOnly, activeCategory]);
  
  // Sıralanmış metrikler - useMemo ile optimize edildi
  const sortedMetrics = useMemo(() => {
    return [...filteredMetrics].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'value':
          // Birim yüzde ise doğrudan karşılaştır
          if (a.unit === '%' && b.unit === '%') {
            comparison = a.value - b.value;
          } 
          // Birimler farklı ise kategoriye göre sırala
          else {
            comparison = a.category.localeCompare(b.category);
          }
          break;
        case 'trend':
          // Trend değerlerini sayısal değerlere dönüştür
          const trendValues = { 'increase': 2, 'stable': 1, 'decrease': 0 };
          comparison = trendValues[a.trend] - trendValues[b.trend];
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredMetrics, sortBy, sortDirection]);
  
  // Kategori değiştirme işleyicisi - useCallback ile optimize edildi
  const handleCategoryChange = useCallback((category: 'all' | 'cpu' | 'memory' | 'disk' | 'network' | 'system') => {
    setActiveCategory(category);
  }, []);
  
  // Kritik metrik filtresini değiştirme işleyicisi - useCallback ile optimize edildi
  const handleToggleCritical = useCallback(() => {
    setShowCriticalOnly(prev => !prev);
  }, []);
  
  // Sıralama değiştirme işleyicisi - useCallback ile optimize edildi
  const handleSortChange = useCallback((newSortBy: 'name' | 'value' | 'trend') => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('desc'); // Varsayılan olarak azalan sıralama
    }
  }, [sortBy]);
  
  // Optimizasyon uygulama işleyicisi
  const handleOptimizationApply = useCallback((bottleneckId: string) => {
    // Burada gerçek bir optimizasyon uygulanabilir
    console.log(`Optimizasyon uygulandı: ${bottleneckId}`);
  }, []);

  return (
    <>
      <Box position="relative">
        {/* Performans Monitörü Butonu */}
        <PerformanceButton criticalCount={criticalCount} onOpen={onOpen} />
        
        {/* Performans Profili Butonu */}
        <Box position="absolute" top="0" left="0" transform="translateX(-120%)">
          <PerformanceProfiler onOptimizationApply={handleOptimizationApply} />
        </Box>
      </Box>
      
      {/* Performans Monitörü Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
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
              <Text fontSize="xl" fontWeight="bold">Performans Monitörü</Text>
              {criticalCount > 0 && (
                <Badge colorScheme="red" fontSize="sm" py={1} px={2} borderRadius="full">
                  {criticalCount} Kritik Metrik
                </Badge>
              )}
            </Flex>
          </DrawerHeader>
          
          <DrawerBody p={4}>
            <VStack spacing={4} align="stretch">
              {/* Kontrol Paneli */}
              <Flex justifyContent="space-between" alignItems="center">
                <Text fontSize="lg" fontWeight="medium">Sistem Metrikleri</Text>
                <ControlPanel 
                  showCriticalOnly={showCriticalOnly}
                  onToggleCritical={handleToggleCritical}
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSortChange={handleSortChange}
                />
              </Flex>
              
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
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
});

// Display name for debugging
PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor;
