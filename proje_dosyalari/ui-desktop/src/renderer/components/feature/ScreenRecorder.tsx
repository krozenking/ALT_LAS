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
  Select,
  RadioGroup,
  Radio,
  Stack,
  Tooltip,
  useDisclosure,
  Spinner,
  Badge,
  HStack,
  VStack,
  useToast
} from '@chakra-ui/react';
import { animations } from '@/styles/animations';

// Recording status
type RecordingStatus = 'idle' | 'preparing' | 'recording' | 'paused' | 'stopped' | 'error';

// Recording mode
type RecordingMode = 'fullscreen' | 'window' | 'region';

// Audio source
type AudioSource = 'none' | 'system' | 'microphone' | 'system_and_microphone';

// ScreenRecorder properties
interface ScreenRecorderProps {
  // Props to interact with the core recording logic
  onStartRecording?: (mode: RecordingMode, audioSource: AudioSource) => Promise<void>;
  onStopRecording?: () => Promise<string | null>; // Returns file path or null
  onPauseRecording?: () => Promise<void>;
  onResumeRecording?: () => Promise<void>;
  onGetSources?: () => Promise<{ windows: { id: string; name: string }[], screens: { id: string; name: string }[] }>; // Example
}

export const ScreenRecorder: React.FC<ScreenRecorderProps> = memo(({
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onGetSources
}) => {
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  const { colorMode } = useColorMode();
  const btnRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  // State for recording
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [mode, setMode] = useState<RecordingMode>('fullscreen');
  const [audioSource, setAudioSource] = useState<AudioSource>('system_and_microphone');
  const [recordingTime, setRecordingTime] = useState(0); // Time in seconds
  const [availableWindows, setAvailableWindows] = useState<{ id: string; name: string }[]>([]);
  const [selectedWindow, setSelectedWindow] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Timer interval ref
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch available windows/screens when popover opens (if mode is window)
  useEffect(() => {
    if (isOpen && mode === 'window' && onGetSources) {
      const fetchSources = async () => {
        try {
          const sources = await onGetSources();
          setAvailableWindows(sources.windows || []);
          // Select first window by default if available
          if (sources.windows && sources.windows.length > 0 && !selectedWindow) {
            setSelectedWindow(sources.windows[0].id);
          }
        } catch (err) {
          console.error("Error fetching sources:", err);
          setError("Kaynaklar alınırken hata oluştu.");
        }
      };
      fetchSources();
    }
  }, [isOpen, mode, onGetSources, selectedWindow]);

  // Timer logic
  useEffect(() => {
    if (status === 'recording') {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (status === 'idle' || status === 'stopped') {
        setRecordingTime(0); // Reset time when idle or stopped
      }
    }
    // Cleanup interval on unmount or status change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status]);

  // Format recording time (HH:MM:SS)
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Handle Start Recording
  const handleStart = useCallback(async () => {
    if (!onStartRecording) {
      console.warn("onStartRecording not provided");
      setStatus('error');
      setError("Kayıt başlatılamıyor.");
      return;
    }
    
    // Validate window selection if mode is 'window'
    if (mode === 'window' && !selectedWindow) {
        toast({
            title: "Pencere Seçilmedi",
            description: "Lütfen kaydetmek için bir pencere seçin.",
            status: "warning",
            duration: 3000,
            isClosable: true,
        });
        return;
    }

    setStatus('preparing');
    setError(null);
    onClose(); // Close popover

    try {
      // Pass selected window/screen ID if applicable (modify onStartRecording signature if needed)
      const effectiveMode = mode === 'window' ? selectedWindow || 'window' : mode;
      await onStartRecording(effectiveMode as RecordingMode, audioSource);
      setStatus('recording');
      setRecordingTime(0);
      toast({
        title: "Kayıt Başladı",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error starting recording:", err);
      setStatus('error');
      setError("Kayıt başlatılırken bir hata oluştu.");
      toast({
        title: "Kayıt Başlatılamadı",
        description: error || "Bilinmeyen bir hata oluştu.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [onStartRecording, mode, audioSource, selectedWindow, error, onClose, toast]);

  // Handle Stop Recording
  const handleStop = useCallback(async () => {
    if (!onStopRecording) {
      console.warn("onStopRecording not provided");
      return;
    }
    
    const initialStatus = status;
    setStatus('preparing'); // Indicate processing

    try {
      const filePath = await onStopRecording();
      setStatus('stopped');
      toast({
        title: "Kayıt Durduruldu",
        description: filePath ? `Kayıt şuraya kaydedildi: ${filePath}` : "Kayıt başarıyla tamamlandı.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error stopping recording:", err);
      setStatus(initialStatus); // Revert to previous status on error
      setError("Kayıt durdurulurken bir hata oluştu.");
      toast({
        title: "Kayıt Durdurulamadı",
        description: "Bir hata oluştu.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [onStopRecording, status, toast]);

  // Handle Pause Recording
  const handlePause = useCallback(async () => {
    if (!onPauseRecording || status !== 'recording') return;
    try {
      await onPauseRecording();
      setStatus('paused');
    } catch (err) {
      console.error("Error pausing recording:", err);
      // Handle error (e.g., show toast)
    }
  }, [onPauseRecording, status]);

  // Handle Resume Recording
  const handleResume = useCallback(async () => {
    if (!onResumeRecording || status !== 'paused') return;
    try {
      await onResumeRecording();
      setStatus('recording');
    } catch (err) {
      console.error("Error resuming recording:", err);
      // Handle error
    }
  }, [onResumeRecording, status]);

  // Determine button icon and tooltip based on status
  const getButtonProps = () => {
    switch (status) {
      case 'recording':
        return { icon: '🛑', label: 'Kaydı Durdur', action: handleStop, colorScheme: 'red' };
      case 'paused':
        return { icon: '▶️', label: 'Kayda Devam Et', action: handleResume, colorScheme: 'yellow' };
      case 'preparing':
        return { icon: <Spinner size="sm" />, label: 'Hazırlanıyor...', action: () => {}, colorScheme: 'gray', isDisabled: true };
      case 'error':
      case 'stopped':
      case 'idle':
      default:
        return { icon: '⏺️', label: 'Ekran Kaydını Başlat', action: onToggle, colorScheme: 'red' };
    }
  };

  const buttonProps = getButtonProps();

  return (
    <Popover
      isOpen={isOpen && status === 'idle'} // Only open popover when idle
      onOpen={onOpen}
      onClose={onClose}
      placement="bottom-start"
      closeOnBlur={true}
      initialFocusRef={btnRef}
    >
      <PopoverTrigger>
        <Tooltip label={buttonProps.label} aria-label={buttonProps.label}>
          <IconButton
            ref={btnRef}
            aria-label={buttonProps.label}
            icon={typeof buttonProps.icon === 'string' ? <Box fontSize="xl" aria-hidden="true">{buttonProps.icon}</Box> : buttonProps.icon}
            variant="glass"
            colorScheme={buttonProps.colorScheme}
            onClick={buttonProps.action}
            isLoading={status === 'preparing'}
            isDisabled={buttonProps.isDisabled}
            isActive={isOpen && status === 'idle'} // Style trigger when popover is open
            {...animations.performanceUtils.forceGPU}
          />
        </Tooltip>
      </PopoverTrigger>
      
      {/* Display recording status/timer when active */} 
      {(status === 'recording' || status === 'paused') && (
        <Flex 
          align="center" 
          bg={colorMode === 'light' ? 'red.100' : 'red.900'} 
          color={colorMode === 'light' ? 'red.800' : 'red.100'} 
          px={3} 
          py={1} 
          borderRadius="md" 
          ml={2}
        >
          <Badge colorScheme="red" variant="solid" mr={2}>{status === 'recording' ? 'REC' : 'PAUSED'}</Badge>
          <Text fontSize="sm" fontWeight="medium">{formatTime(recordingTime)}</Text>
          {status === 'recording' && (
            <Tooltip label="Kaydı Duraklat" aria-label="Kaydı Duraklat">
              <IconButton 
                icon={<Box>⏸️</Box>} 
                size="xs" 
                variant="ghost" 
                colorScheme="red" 
                ml={2} 
                onClick={handlePause} 
                aria-label="Kaydı Duraklat"
              />
            </Tooltip>
          )}
        </Flex>
      )}

      <PopoverContent 
        width="400px" 
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
        {...animations.presets.dropdown} // Apply dropdown animation
      >
        <PopoverArrow bg={colorMode === 'light' ? 'white' : 'gray.800'} />
        <PopoverCloseButton />
        <PopoverHeader fontWeight="bold">Ekran Kaydı Ayarları</PopoverHeader>
        <PopoverBody>
          <VStack spacing={4} align="stretch">
            {/* Recording Mode */} 
            <Box>
              <Text mb={2} fontWeight="medium">Kayıt Modu:</Text>
              <RadioGroup onChange={(val) => setMode(val as RecordingMode)} value={mode}>
                <Stack direction="row" spacing={4}>
                  <Radio value="fullscreen">Tam Ekran</Radio>
                  <Radio value="window">Pencere</Radio>
                  <Radio value="region" isDisabled>Bölge (Yakında)</Radio> 
                </Stack>
              </RadioGroup>
            </Box>

            {/* Window Selection (if mode is window) */} 
            {mode === 'window' && (
              <Box>
                <Text mb={2} fontWeight="medium">Kaydedilecek Pencere:</Text>
                <Select 
                  placeholder="Pencere seçin..." 
                  value={selectedWindow || ''} 
                  onChange={(e) => setSelectedWindow(e.target.value)}
                  isDisabled={availableWindows.length === 0}
                >
                  {availableWindows.map(win => (
                    <option key={win.id} value={win.id}>{win.name}</option>
                  ))}
                </Select>
                {availableWindows.length === 0 && <Text fontSize="xs" color="gray.500" mt={1}>Açık pencere bulunamadı veya alınamadı.</Text>}
              </Box>
            )}

            {/* Audio Source */} 
            <Box>
              <Text mb={2} fontWeight="medium">Ses Kaynağı:</Text>
              <Select value={audioSource} onChange={(e) => setAudioSource(e.target.value as AudioSource)}>
                <option value="system_and_microphone">Sistem Sesi + Mikrofon</option>
                <option value="system">Sistem Sesi</option>
                <option value="microphone">Mikrofon</option>
                <option value="none">Ses Yok</option>
              </Select>
            </Box>

            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}
          </VStack>
        </PopoverBody>
        <PopoverFooter borderTopWidth="1px" pt={4}>
          <Button 
            colorScheme="red" 
            onClick={handleStart}
            width="100%"
            leftIcon={<Box>⏺️</Box>}
            isDisabled={mode === 'window' && !selectedWindow}
          >
            Kaydı Başlat
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
});

ScreenRecorder.displayName = 'ScreenRecorder';

export default ScreenRecorder;

