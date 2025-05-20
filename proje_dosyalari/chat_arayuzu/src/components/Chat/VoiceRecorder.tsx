import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Text,
  Flex,
  Progress,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { MdMic, MdStop, MdDelete } from 'react-icons/md';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, transcript: string) => void;
  disabled?: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const toast = useToast();
  
  // Renk değişkenleri
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const progressColorScheme = 'red';
  
  // Web Speech API desteğini kontrol et
  useEffect(() => {
    // @ts-expect-error
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition is not supported in this browser.');
    } else {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'tr-TR'; // Türkçe dil desteği
      
      recognitionRef.current.onresult = (event: unknown) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
      };
      
      recognitionRef.current.onerror = (event: unknown) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          toast({
            title: 'Mikrofon erişimi reddedildi',
            description: 'Ses kaydı yapabilmek için mikrofon erişimine izin vermeniz gerekiyor.',
            status: 'error',
            duration: 5000,
            isClosable: true
          });
          stopRecording();
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);
  
  // Kayıt başlatma
  const startRecording = async () => {
    if (disabled) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Ses tanıma tamamlandıktan sonra callback'i çağır
        setIsTranscribing(true);
        setTimeout(() => {
          setIsTranscribing(false);
          onRecordingComplete(audioBlob, transcript);
          setTranscript('');
          
          // Stream'i kapat
          stream.getTracks().forEach(track => track.stop());
        }, 1000);
      };
      
      // Kayda başla
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Ses tanımayı başlat
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      
      // Zamanlayıcıyı başlat
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Kayıt başlatılamadı',
        description: 'Mikrofon erişimi sağlanamadı veya bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };
  
  // Kaydı durdurma
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Ses tanımayı durdur
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      // Zamanlayıcıyı durdur
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setRecordingTime(0);
      }
    }
  };
  
  // Kaydı iptal etme
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Ses tanımayı durdur
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      // Zamanlayıcıyı durdur
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setRecordingTime(0);
      }
      
      // MediaRecorder'ı durdur ama ondataavailable'ı tetikleme
      const tracks = mediaRecorderRef.current.stream.getTracks();
      tracks.forEach(track => track.stop());
      
      setIsRecording(false);
      setTranscript('');
      audioChunksRef.current = [];
    }
  };
  
  // Kayıt süresini formatla
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <Box>
      {isRecording ? (
        <Box 
          p={3} 
          borderRadius="md" 
          bg={bgColor}
          borderWidth="1px"
          borderColor={useColorModeValue('red.200', 'red.700')}
        >
          <Flex justify="space-between" align="center" mb={2}>
            <Flex align="center">
              <Box 
                w="10px" 
                h="10px" 
                borderRadius="full" 
                bg="red.500" 
                mr={2}
                animation="pulse 1.5s infinite"
                sx={{
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.4 },
                    '100%': { opacity: 1 }
                  }
                }}
              />
              <Text fontWeight="medium" fontSize="sm" color={textColor}>
                Kayıt Yapılıyor: {formatTime(recordingTime)}
              </Text>
            </Flex>
            
            <Flex>
              <Tooltip label="Kaydı İptal Et">
                <IconButton
                  aria-label="Kaydı İptal Et"
                  icon={<MdDelete />}
                  size="sm"
                  colorScheme="gray"
                  variant="ghost"
                  onClick={cancelRecording}
                  mr={1}
                />
              </Tooltip>
              
              <Tooltip label="Kaydı Durdur">
                <IconButton
                  aria-label="Kaydı Durdur"
                  icon={<MdStop />}
                  size="sm"
                  colorScheme="red"
                  onClick={stopRecording}
                />
              </Tooltip>
            </Flex>
          </Flex>
          
          {transcript && (
            <Box mt={2} fontSize="sm" color={textColor}>
              <Text fontStyle="italic" noOfLines={2}>
                "{transcript}"
              </Text>
            </Box>
          )}
          
          <Progress 
            value={recordingTime} 
            max={60} 
            size="xs" 
            colorScheme={progressColorScheme} 
            mt={2}
            borderRadius="full"
          />
        </Box>
      ) : isTranscribing ? (
        <Flex 
          p={3} 
          borderRadius="md" 
          bg={bgColor}
          borderWidth="1px"
          borderColor={useColorModeValue('blue.200', 'blue.700')}
          align="center"
          justify="center"
        >
          <Text fontSize="sm" color={textColor}>
            Ses işleniyor...
          </Text>
          <Progress 
            size="xs" 
            isIndeterminate 
            width="100px" 
            ml={2}
            colorScheme="blue" 
          />
        </Flex>
      ) : (
        <Tooltip label="Sesli Mesaj Kaydet">
          <IconButton
            aria-label="Sesli Mesaj Kaydet"
            icon={<MdMic />}
            size="md"
            colorScheme="red"
            variant="ghost"
            isRound
            onClick={startRecording}
            isDisabled={disabled}
          />
        </Tooltip>
      )}
    </Box>
  );
};

export default VoiceRecorder;
