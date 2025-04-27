import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
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
  VStack
} from '@chakra-ui/react';
import { animations } from '@/styles/animations';
// Assuming a global store or context for managing focus state and notifications
// import useAppStore from '@/store/appStore'; 

// Focus Mode properties
interface FocusModeProps {
  // Props to control external behavior if needed
}

// Time constants (in seconds)
const MIN_DURATION = 5 * 60; // 5 minutes
const MAX_DURATION = 120 * 60; // 120 minutes (2 hours)
const DEFAULT_DURATION = 25 * 60; // 25 minutes (Pomodoro)

export const FocusMode: React.FC<FocusModeProps> = memo(() => {
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  const { colorMode } = useColorMode();
  const btnRef = useRef<HTMLButtonElement>(null);

  // State for focus mode
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(DEFAULT_DURATION); // Duration in seconds
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION); // Time left in seconds

  // Access global state if needed (replace with actual implementation)
  // const { setFocusModeActive, filterNotifications } = useAppStore();

  // Timer logic using useInterval
  useInterval(() => {
    if (isActive && timeLeft > 0) {
      setTimeLeft(prev => prev - 1);
    } else if (isActive && timeLeft === 0) {
      // Focus session ended
      setIsActive(false);
      // setFocusModeActive(false); // Update global state
      // Notify user (e.g., with a sound or notification)
      console.log("Focus session ended!");
      // Reset timer for next session
      setTimeLeft(duration);
    }
  }, isActive ? 1000 : null); // Run interval only when active

  // Handle starting the focus session
  const handleStartFocus = useCallback(() => {
    setTimeLeft(duration);
    setIsActive(true);
    // setFocusModeActive(true); // Update global state
    // filterNotifications(true); // Start filtering notifications
    onClose(); // Close the popover
    console.log(`Focus session started for ${duration / 60} minutes.`);
  }, [duration, onClose]);

  // Handle stopping the focus session
  const handleStopFocus = useCallback(() => {
    setIsActive(false);
    // setFocusModeActive(false); // Update global state
    // filterNotifications(false); // Stop filtering notifications
    setTimeLeft(duration); // Reset timer
    console.log("Focus session stopped.");
  }, [duration]);

  // Handle duration change from slider
  const handleDurationSliderChange = useCallback((value: number) => {
    setDuration(value * 60); // Convert minutes to seconds
  }, []);

  // Handle duration change from number input
  const handleDurationInputChange = useCallback((valueAsString: string, valueAsNumber: number) => {
    const seconds = Math.max(MIN_DURATION / 60, Math.min(MAX_DURATION / 60, valueAsNumber)) * 60;
    setDuration(seconds);
  }, []);

  // Format time left (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercent = useMemo(() => {
    if (!isActive || duration === 0) return 0;
    return ((duration - timeLeft) / duration) * 100;
  }, [isActive, duration, timeLeft]);

  const focusIcon = isActive ? '🧘‍♀️' : '🧘'; // Change icon when active

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
        <Tooltip label={isActive ? `Odaklanma Modu Aktif (${formatTime(timeLeft)} kaldı)` : "Odaklanma Modu"} aria-label="Odaklanma Modu">
          <IconButton
            ref={btnRef}
            aria-label="Odaklanma Modunu Aç/Kapat"
            icon={<Box fontSize="xl" aria-hidden="true">{focusIcon}</Box>}
            variant="glass"
            colorScheme={isActive ? "purple" : "gray"} // Indicate active state
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
          {isActive ? "Odaklanma Modu Aktif" : "Odaklanma Modunu Ayarla"}
        </PopoverHeader>
        <PopoverBody>
          {isActive ? (
            <VStack spacing={4} align="center">
              <CircularProgress 
                value={progressPercent} 
                size="120px" 
                thickness="8px"
                color="purple.400"
                trackColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
              >
                <CircularProgressLabel fontSize="2xl" fontWeight="bold">
                  {formatTime(timeLeft)}
                </CircularProgressLabel>
              </CircularProgress>
              <Text>Kalan Süre</Text>
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
              <Text>Odaklanma süresini (dakika) seçin:</Text>
              <HStack>
                <NumberInput
                  min={MIN_DURATION / 60}
                  max={MAX_DURATION / 60}
                  step={5}
                  value={duration / 60}
                  onChange={handleDurationInputChange}
                  width="100px"
                >
                  <NumberInputField aria-label="Odaklanma süresi (dakika)" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Slider
                  aria-label="odaklanma-suresi-slider"
                  min={MIN_DURATION / 60}
                  max={MAX_DURATION / 60}
                  step={5}
                  value={duration / 60}
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
                Bu süre boyunca bildirimler sessize alınacak.
              </Text>
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
              Odaklanmaya Başla ({duration / 60} dk)
            </Button>
          </PopoverFooter>
        )}
      </PopoverContent>
    </Popover>
  );
});

FocusMode.displayName = 'FocusMode';

export default FocusMode;

