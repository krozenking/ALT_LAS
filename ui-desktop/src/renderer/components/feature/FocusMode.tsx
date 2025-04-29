import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  useColorMode,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  PopoverFooter,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  CircularProgress,
  CircularProgressLabel,
  Tooltip,
  useDisclosure,
  useInterval,
  HStack,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  useToast,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { animations } from '@/styles/animations';
// Assuming a global store or context for managing focus state and notifications
// import useAppStore from '@/store/appStore';

// Focus Mode properties
interface FocusModeProps {
  // Props to control external behavior if needed
}

// Time constants (in seconds)
const MIN_WORK_DURATION = 5 * 60;
const MAX_WORK_DURATION = 120 * 60;
const DEFAULT_WORK_DURATION = 25 * 60; // 25 minutes (Pomodoro)
const DEFAULT_SHORT_BREAK = 5 * 60; // 5 minutes
const DEFAULT_LONG_BREAK = 15 * 60; // 15 minutes
const SESSIONS_BEFORE_LONG_BREAK = 4;

// Type for session state
type SessionType = 'work' | 'short-break' | 'long-break';

// Interface for focus statistics
interface FocusStats {
  dailyCompleted: number;
  weeklyCompleted: number;
  totalCompleted: number;
  lastSessionDate: string;
  history: Array<{
    date: string;
    completed: number;
    duration: number;
  }>;
}

// Default stats
const DEFAULT_STATS: FocusStats = {
  dailyCompleted: 0,
  weeklyCompleted: 0,
  totalCompleted: 0,
  lastSessionDate: '',
  history: []
};

// LocalStorage key
const FOCUS_STATS_KEY = 'alt_las_focus_stats';

export const FocusMode: React.FC<FocusModeProps> = memo(() => {
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  const { colorMode } = useColorMode();
  const btnRef = useRef<HTMLButtonElement>(null);
  const toast = useToast(); // Initialize toast

  // State for focus mode
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [workDuration, setWorkDuration] = useState(DEFAULT_WORK_DURATION); // Work duration setting
  const [timeLeft, setTimeLeft] = useState(DEFAULT_WORK_DURATION); // Time left in current session
  const [focusStats, setFocusStats] = useState<FocusStats>(DEFAULT_STATS);
  const [showStats, setShowStats] = useState(false);

  // Load stats from localStorage on component mount
  useEffect(() => {
    const loadStats = () => {
      try {
        const savedStats = localStorage.getItem(FOCUS_STATS_KEY);
        if (savedStats) {
          const parsedStats = JSON.parse(savedStats) as FocusStats;
          
          // Check if it's a new day and reset daily count if needed
          const today = new Date().toISOString().split('T')[0];
          if (parsedStats.lastSessionDate !== today) {
            parsedStats.dailyCompleted = 0;
            parsedStats.lastSessionDate = today;
          }
          
          setFocusStats(parsedStats);
        } else {
          // Initialize with today's date
          const today = new Date().toISOString().split('T')[0];
          setFocusStats({
            ...DEFAULT_STATS,
            lastSessionDate: today
          });
        }
      } catch (error) {
        console.error('Error loading focus stats:', error);
        // Initialize with today's date on error
        const today = new Date().toISOString().split('T')[0];
        setFocusStats({
          ...DEFAULT_STATS,
          lastSessionDate: today
        });
      }
    };

    loadStats();
  }, []);

  // Access global state if needed (replace with actual implementation)
  // const { setFocusModeActive, filterNotifications } = useAppStore();

  // Placeholder for notification filtering
  const filterNotifications = (shouldFilter: boolean) => {
    console.log(`Placeholder: Notifications filtering set to ${shouldFilter}`);
    // TODO: Implement actual notification filtering logic via global state/service
  };

  // Save stats to localStorage
  const saveFocusStats = useCallback((stats: Partial<FocusStats>) => {
    try {
      const updatedStats = { ...focusStats, ...stats };
      localStorage.setItem(FOCUS_STATS_KEY, JSON.stringify(updatedStats));
      setFocusStats(updatedStats);
    } catch (error) {
      console.error('Error saving focus stats:', error);
      toast({
        title: "İstatistik Kaydetme Hatası",
        description: "İstatistikler kaydedilirken bir hata oluştu.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [focusStats, toast]);

  // Function to start the next session (work or break)
  const startNextSession = useCallback(() => {
    let nextSessionType: SessionType;
    let nextDuration: number;
    
    if (sessionType === 'work') {
      // Update stats when work session completes
      const today = new Date().toISOString().split('T')[0];
      const dailyCompleted = focusStats.dailyCompleted + 1;
      const weeklyCompleted = focusStats.weeklyCompleted + 1;
      const totalCompleted = focusStats.totalCompleted + 1;
      
      // Add to history
      const historyEntry = {
        date: today,
        completed: 1,
        duration: workDuration / 60 // in minutes
      };
      
      // Merge with existing history entry for today if exists
      const updatedHistory = [...focusStats.history];
      const todayEntryIndex = updatedHistory.findIndex(entry => entry.date === today);
      
      if (todayEntryIndex >= 0) {
        updatedHistory[todayEntryIndex] = {
          ...updatedHistory[todayEntryIndex],
          completed: updatedHistory[todayEntryIndex].completed + 1,
          duration: updatedHistory[todayEntryIndex].duration + (workDuration / 60)
        };
      } else {
        updatedHistory.push(historyEntry);
      }
      
      // Keep only last 30 days in history
      const limitedHistory = updatedHistory.slice(-30);
      
      // Save updated stats
      saveFocusStats({
        dailyCompleted,
        weeklyCompleted,
        totalCompleted,
        lastSessionDate: today,
        history: limitedHistory
      });

      // Determine next session type
      if (dailyCompleted % SESSIONS_BEFORE_LONG_BREAK === 0) {
        nextSessionType = 'long-break';
        nextDuration = DEFAULT_LONG_BREAK;
      } else {
        nextSessionType = 'short-break';
        nextDuration = DEFAULT_SHORT_BREAK;
      }
      
      toast({
        title: "Çalışma Seansı Tamamlandı!",
        description: `Şimdi ${nextDuration / 60} dakikalık bir mola zamanı.`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } else { // If current session was a break
      nextSessionType = 'work';
      nextDuration = workDuration;
      toast({
        title: "Mola Bitti!",
        description: "Yeni bir çalışma seansına başlama zamanı.",
        status: "info",
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    }

    setSessionType(nextSessionType);
    setTimeLeft(nextDuration);
    filterNotifications(nextSessionType === 'work'); // Filter only during work sessions

  }, [sessionType, workDuration, focusStats, saveFocusStats, toast]);

  // Timer logic using useInterval
  useInterval(() => {
    if (isActive && timeLeft > 0) {
      setTimeLeft(prev => prev - 1);
    } else if (isActive && timeLeft === 0) {
      // Current session ended, start the next one
      startNextSession();
    }
  }, isActive ? 1000 : null); // Run interval only when active

  // Handle starting the focus session (always starts with 'work')
  const handleStartFocus = useCallback(() => {
    setSessionType('work');
    setTimeLeft(workDuration);
    setIsActive(true);
    filterNotifications(true); // Start filtering notifications
    // setFocusModeActive(true); // Update global state
    onClose(); // Close the popover
    toast({
      title: "Odaklanma Başladı!",
      description: `${workDuration / 60} dakikalık çalışma seansı başladı.`,
      status: "info",
      duration: 3000,
      isClosable: true,
      position: 'top'
    });
  }, [workDuration, onClose, toast]);

  // Handle stopping the focus session completely
  const handleStopFocus = useCallback(() => {
    setIsActive(false);
    filterNotifications(false); // Stop filtering notifications
    // setFocusModeActive(false); // Update global state
    setTimeLeft(workDuration); // Reset timer to work duration
    setSessionType('work'); // Reset session type
    toast({
      title: "Odaklanma Durduruldu",
      status: "warning",
      duration: 3000,
      isClosable: true,
      position: 'top'
    });
  }, [workDuration, toast]);

  // Handle duration change from slider
  const handleDurationSliderChange = useCallback((value: number) => {
    setWorkDuration(value * 60); // Convert minutes to seconds
  }, []);

  // Handle duration change from number input
  const handleDurationInputChange = useCallback((valueAsString: string, valueAsNumber: number) => {
    const seconds = Math.max(MIN_WORK_DURATION / 60, Math.min(MAX_WORK_DURATION / 60, valueAsNumber)) * 60;
    setWorkDuration(seconds);
  }, []);

  // Format time left (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculate progress percentage based on the current session's total duration
  const currentSessionDuration = useMemo(() => {
    switch (sessionType) {
      case 'work': return workDuration;
      case 'short-break': return DEFAULT_SHORT_BREAK;
      case 'long-break': return DEFAULT_LONG_BREAK;
      default: return workDuration;
    }
  }, [sessionType, workDuration]);

  const progressPercent = useMemo(() => {
    if (!isActive || currentSessionDuration === 0) return 0;
    return ((currentSessionDuration - timeLeft) / currentSessionDuration) * 100;
  }, [isActive, currentSessionDuration, timeLeft]);

  // Determine icon and color based on session type
  const { icon, colorScheme, label } = useMemo(() => {
    if (!isActive) return { icon: '🧘', colorScheme: 'gray', label: 'Odaklanma Modu' };
    switch (sessionType) {
      case 'work': return { icon: '🧘‍♀️', colorScheme: 'purple', label: 'Çalışma' };
      case 'short-break': return { icon: '☕', colorScheme: 'green', label: 'Kısa Mola' };
      case 'long-break': return { icon: '🚶‍♂️', colorScheme: 'blue', label: 'Uzun Mola' };
      default: return { icon: '🧘', colorScheme: 'gray', label: 'Odaklanma Modu' };
    }
  }, [isActive, sessionType]);

  // Toggle stats view
  const toggleStats = useCallback(() => {
    setShowStats(prev => !prev);
  }, []);

  // Reset stats
  const handleResetStats = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    saveFocusStats({
      dailyCompleted: 0,
      weeklyCompleted: 0,
      totalCompleted: 0,
      lastSessionDate: today,
      history: []
    });
    toast({
      title: "İstatistikler Sıfırlandı",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  }, [saveFocusStats, toast]);

  return (
    <Popover
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      placement="bottom-start"
      closeOnBlur={true}
      initialFocusRef={btnRef} // Focus the trigger button initially
    >
      <PopoverTrigger>
        <Tooltip label={isActive ? `${label} (${formatTime(timeLeft)} kaldı)` : "Odaklanma Modu"} aria-label="Odaklanma Modu">
          <IconButton
            ref={btnRef}
            aria-label="Odaklanma Modunu Aç/Kapat"
            icon={<Box fontSize="xl" aria-hidden="true">{icon}</Box>}
            variant="glass"
            colorScheme={colorScheme}
            onClick={onToggle}
            isActive={isOpen} // Style when popover is open
            {...animations.performanceUtils.forceGPU}
          />
        </Tooltip>
      </PopoverTrigger>
      <PopoverContent
        width={showStats ? "450px" : "350px"}
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
        {...animations.presets.dropdown} // Apply dropdown animation
      >
        <PopoverArrow bg={colorMode === 'light' ? 'white' : 'gray.800'} />
        <PopoverCloseButton />
        <PopoverHeader fontWeight="bold">
          <Flex justify="space-between" align="center">
            <Text>{isActive ? `${label} Aktif` : "Odaklanma Modunu Ayarla"}</Text>
            <Button 
              size="xs" 
              variant="ghost" 
              onClick={toggleStats}
              leftIcon={<Box aria-hidden="true">{showStats ? '⏱️' : '📊'}</Box>}
            >
              {showStats ? 'Zamanlayıcı' : 'İstatistikler'}
            </Button>
          </Flex>
        </PopoverHeader>
        <PopoverBody>
          {showStats ? (
            <VStack spacing={4} align="stretch">
              <Tabs variant="soft-rounded" colorScheme="purple" size="sm">
                <TabList>
                  <Tab>Özet</Tab>
                  <Tab>Geçmiş</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel p={2}>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Stat>
                          <StatLabel>Bugün</StatLabel>
                          <StatNumber>{focusStats.dailyCompleted}</StatNumber>
                          <StatHelpText>Tamamlanan Seans</StatHelpText>
                        </Stat>
                        <Stat>
                          <StatLabel>Bu Hafta</StatLabel>
                          <StatNumber>{focusStats.weeklyCompleted}</StatNumber>
                          <StatHelpText>Tamamlanan Seans</StatHelpText>
                        </Stat>
                        <Stat>
                          <StatLabel>Toplam</StatLabel>
                          <StatNumber>{focusStats.totalCompleted}</StatNumber>
                          <StatHelpText>Tamamlanan Seans</StatHelpText>
                        </Stat>
                      </HStack>
                      <Button 
                        size="sm" 
                        colorScheme="red" 
                        variant="outline" 
                        onClick={handleResetStats}
                      >
                        İstatistikleri Sıfırla
                      </Button>
                    </VStack>
                  </TabPanel>
                  <TabPanel p={2}>
                    <Box maxH="200px" overflowY="auto">
                      <Table size="sm" variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Tarih</Th>
                            <Th isNumeric>Seans</Th>
                            <Th isNumeric>Süre (dk)</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {focusStats.history.length > 0 ? (
                            [...focusStats.history]
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .map((entry, index) => (
                                <Tr key={index}>
                                  <Td>{entry.date}</Td>
                                  <Td isNumeric>{entry.completed}</Td>
                                  <Td isNumeric>{entry.duration}</Td>
                                </Tr>
                              ))
                          ) : (
                            <Tr>
                              <Td colSpan={3} textAlign="center">Henüz kayıt yok</Td>
                            </Tr>
                          )}
                        </Tbody>
                      </Table>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
          ) : isActive ? (
            <VStack spacing={4} align="center">
              <CircularProgress
                value={progressPercent}
                size="120px"
                thickness="8px"
                color={`${colorScheme}.400`}
                trackColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
              >
                <CircularProgressLabel fontSize="2xl" fontWeight="bold">
                  {formatTime(timeLeft)}
                </CircularProgressLabel>
              </CircularProgress>
              <HStack>
                 <Text>Kalan Süre</Text>
                 <Badge colorScheme={colorScheme}>{label}</Badge>
              </HStack>
              <Stat textAlign="center">
                <StatLabel>Bugün Tamamlanan Seanslar</StatLabel>
                <StatNumber>{focusStats.dailyCompleted}</StatNumber>
              </Stat>
              <Button
                colorScheme="red"
                variant="outline"
                onClick={handleStopFocus}
                width="100%"
              >
                Odaklanmayı Durdur
              </Button>
            </VStack>
          ) : (
            <VStack spacing={4} align="stretch">
              <Text>Çalışma süresini (dakika) seçin:</Text>
              <HStack>
                <NumberInput
                  min={MIN_WORK_DURATION / 60}
                  max={MAX_WORK_DURATION / 60}
                  step={5}
                  value={workDuration / 60}
                  onChange={handleDurationInputChange}
                  width="100px"
                >
                  <NumberInputField aria-label="Çalışma süresi (dakika)" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Slider
                  aria-label="calisma-suresi-slider"
                  min={MIN_WORK_DURATION / 60}
                  max={MAX_WORK_DURATION / 60}
                  step={5}
                  value={workDuration / 60}
                  onChange={handleDurationSliderChange}
                  flex="1"
                >
                  <SliderTrack>
                    <SliderFilledTrack bg="purple.400" />
                  </SliderTrack>
                  <SliderThumb boxSize={6}>
                    <Box color="purple.400" fontSize="sm">⏱️</Box>
                  </SliderThumb>
                </Slider>
              </HStack>
              <Text fontSize="sm" color="gray.500">
                Çalışma seansları sırasında bildirimler sessize alınacak.
                {SESSIONS_BEFORE_LONG_BREAK} seans sonrası uzun mola verilir.
              </Text>
              <Divider />
              <Stat textAlign="center">
                <StatLabel>Bugün Tamamlanan Seanslar</StatLabel>
                <StatNumber>{focusStats.dailyCompleted}</StatNumber>
              </Stat>
            </VStack>
          )}
        </PopoverBody>
        {!isActive && !showStats && (
          <PopoverFooter borderTopWidth="1px" pt={4}>
            <Button
              colorScheme="purple"
              onClick={handleStartFocus}
              width="100%"
            >
              Odaklanmaya Başla ({workDuration / 60} dk)
            </Button>
          </PopoverFooter>
        )}
      </PopoverContent>
    </Popover>
  );
});

FocusMode.displayName = 'FocusMode';

export default FocusMode;
