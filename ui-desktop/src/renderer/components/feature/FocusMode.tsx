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
  Divider,
  useToast, // Added for notifications
  Badge // Added for cycle display
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
  const [completedSessions, setCompletedSessions] = useState(0); // Basic statistics

  // Access global state if needed (replace with actual implementation)
  // const { setFocusModeActive, filterNotifications } = useAppStore();

  // Placeholder for notification filtering
  const filterNotifications = (shouldFilter: boolean) => {
    console.log(`Placeholder: Notifications filtering set to ${shouldFilter}`);
    // TODO: Implement actual notification filtering logic via global state/service
  };

  // Placeholder for saving stats
  const saveFocusStats = (stats: { completed: number }) => {
    console.log(`Placeholder: Saving focus stats - Completed: ${stats.completed}`);
    // TODO: Implement logic to persist stats (e.g., localStorage, backend)
  };

  // Function to start the next session (work or break)
  const startNextSession = useCallback(() => {
    let nextSessionType: SessionType;
    let nextDuration: number;
    let sessionsCompleted = completedSessions;

    if (sessionType === 'work') {
      sessionsCompleted += 1;
      setCompletedSessions(sessionsCompleted);
      saveFocusStats({ completed: sessionsCompleted }); // Save stats

      if (sessionsCompleted % SESSIONS_BEFORE_LONG_BREAK === 0) {
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

  }, [sessionType, workDuration, completedSessions, toast]);

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
        width="350px"
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
        {...animations.presets.dropdown} // Apply dropdown animation
      >
        <PopoverArrow bg={colorMode === 'light' ? 'white' : 'gray.800'} />
        <PopoverCloseButton />
        <PopoverHeader fontWeight="bold">
          {isActive ? `${label} Aktif` : "Odaklanma Modunu Ayarla"}
        </PopoverHeader>
        <PopoverBody>
          {isActive ? (
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
                <StatLabel>Tamamlanan Çalışma Seansları</StatLabel>
                <StatNumber>{completedSessions}</StatNumber>
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
                {/* TODO: Load stats from persistence */}
                <StatNumber>{completedSessions}</StatNumber>
              </Stat>
            </VStack>
          )}
        </PopoverBody>
        {!isActive && (
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

