import React, { useState, useEffect, useRef } from 'react';
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

// Performans monitörü bileşeni
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
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
  
  // Metrikleri filtrele
  const filteredMetrics = metrics.filter(metric => {
    const categoryMatch = activeCategory === 'all' || metric.category === activeCategory;
    const criticalMatch = !showCriticalOnly || metric.critical;
    return categoryMatch && criticalMatch;
  });
  
  // Metrikleri sırala
  const sortedMetrics = [...filteredMetrics].sort((a, b) => {
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
  
  // Sıralama değiştir
  const handleSortChange = (newSortBy: 'name' | 'value' | 'trend') => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
  };
  
  // Metrik kartı bileşeni
  const MetricCard = React.memo(({ metric }: { metric: PerformanceMetric }) => {
    // Trend rengini belirle
    const getTrendColor = () => {
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
    };
    
    // İlerleme çubuğu rengi
    const getProgressColor = () => {
      if (metric.critical) return 'red.500';
      
      if (metric.unit === '%') {
        if (metric.value > 80) return 'orange.500';
        if (metric.value > 60) return 'yellow.500';
        return 'green.500';
      }
      
      return 'blue.500';
    };
    
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
                type={metric.trend === 'increase' ? 'increase' : 
                      metric.trend === 'decrease' ? 'decrease' : 'increase'} 
                color={getTrendColor()}
                visibility={metric.trend === 'stable' ? 'hidden' : 'visible'}
              />
              {metric.changePercentage > 0 ? `${metric.changePercentage}%` : 'Sabit'}
            </StatHelpText>
          </Stat>
          
          {metric.unit === '%' && (
            <Progress 
              value={metric.value} 
              colorScheme={getProgressColor().split('.')[0]} 
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
  
  // Kategori ikonu getir
  const getCategoryIcon = (category: 'cpu' | 'memory' | 'disk' | 'network' | 'system'): string => {
    switch (category) {
      case 'cpu': return '🔄';
      case 'memory': return '🧠';
      case 'disk': return '💾';
      case 'network': return '🌐';
      case 'system': return '⚙️';
    }
  };
  
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
      {metrics.filter(m => m.critical).length > 0 && (
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
          {metrics.filter(m => m.critical).length}
        </Badge>
      )}
      
      {/* Performans Monitörü Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size="xl"
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
              <HStack>
                <Button
                  size="sm"
                  colorScheme={showCriticalOnly ? 'red' : 'gray'}
                  variant={showCriticalOnly ? 'solid' : 'outline'}
                  onClick={() => setShowCriticalOnly(!showCriticalOnly)}
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
                      onClick={() => handleSortChange('name')}
                      icon={<Box>{sortBy === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ' '}</Box>}
                    >
                      İsme Göre
                    </MenuItem>
                    <MenuItem 
                      onClick={() => handleSortChange('value')}
                      icon={<Box>{sortBy === 'value' ? (sortDirection === 'asc' ? '↑' : '↓') : ' '}</Box>}
                    >
                      Değere Göre
                    </MenuItem>
                    <MenuItem 
                      onClick={() => handleSortChange('trend')}
                      icon={<Box>{sortBy === 'trend' ? (sortDirection === 'asc' ? '↑' : '↓') : ' '}</Box>}
                    >
                      Trende Göre
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </Flex>
          </DrawerHeader>
          
          <DrawerBody p={4}>
            <Flex direction="column" height="100%">
              {/* Kategori Filtreleri */}
              <HStack spacing={2} overflowX="auto" py={2} mb={4} className="category-filters">
                <Button
                  size="sm"
                  variant={activeCategory === 'all' ? 'solid' : 'outline'}
                  onClick={() => setActiveCategory('all')}
                >
                  Tümü
                </Button>
                <Button
                  size="sm"
                  variant={activeCategory === 'cpu' ? 'solid' : 'outline'}
                  onClick={() => setActiveCategory('cpu')}
                  leftIcon={<Box>{getCategoryIcon('cpu')}</Box>}
                >
                  CPU
                </Button>
                <Button
                  size="sm"
                  variant={activeCategory === 'memory' ? 'solid' : 'outline'}
                  onClick={() => setActiveCategory('memory')}
                  leftIcon={<Box>{getCategoryIcon('memory')}</Box>}
                >
                  Bellek
                </Button>
                <Button
                  size="sm"
                  variant={activeCategory === 'disk' ? 'solid' : 'outline'}
                  onClick={() => setActiveCategory('disk')}
                  leftIcon={<Box>{getCategoryIcon('disk')}</Box>}
                >
                  Disk
                </Button>
                <Button
                  size="sm"
                  variant={activeCategory === 'network' ? 'solid' : 'outline'}
                  onClick={() => setActiveCategory('network')}
                  leftIcon={<Box>{getCategoryIcon('network')}</Box>}
                >
                  Ağ
                </Button>
                <Button
                  size="sm"
                  variant={activeCategory === 'system' ? 'solid' : 'outline'}
                  onClick={() => setActiveCategory('system')}
                  leftIcon={<Box>{getCategoryIcon('system')}</Box>}
                >
                  Sistem
                </Button>
              </HStack>
              
              {/* Metrik Kartları */}
              {sortedMetrics.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {sortedMetrics.map(metric => (
                    <MetricCard key={metric.id} metric={metric} />
                  ))}
                </SimpleGrid>
              ) : (
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
              )}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default PerformanceMonitor;
