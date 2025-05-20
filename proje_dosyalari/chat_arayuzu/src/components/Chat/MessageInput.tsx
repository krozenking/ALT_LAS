import React, { useState, useRef, useEffect, FormEvent, KeyboardEvent, forwardRef, useImperativeHandle } from 'react';
import { Tooltip, Box, Flex, IconButton, Collapse, useDisclosure, useColorModeValue } from '@chakra-ui/react';
import { AttachmentIcon, SmallCloseIcon } from '@chakra-ui/icons';
;
import FileUploader from './FileUploader';
import VoiceRecorder from './VoiceRecorder';

// Dosya metadata arayüzü
interface FileMetadata {
  name: string;
  type: string;
  size: number;
  url?: string;
  uploadStatus?: 'uploading' | 'success' | 'error';
}

interface MessageInputProps {
  onSendMessage: (message: string, file?: File) => void;
  loading: boolean;
  disabled?: boolean;
}

const MessageInput = forwardRef<HTMLTextAreaElement, MessageInputProps>(({
  onSendMessage,
  loading,
  disabled = false
}, ref) => {
  const [message, setMessage] = useState('');
  const [rows, setRows] = useState(1);
  const [showShortcutTooltip, setShowShortcutTooltip] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isOpen: isFileUploaderOpen, onToggle: toggleFileUploader, onClose: closeFileUploader } = useDisclosure();

  // Renk değişkenleri
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Dış ref'i iç ref'e bağla
  useImperativeHandle(ref, () => textareaRef.current!);

  // Otomatik yükseklik ayarı
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';

      const newRows = Math.min(
        Math.max(
          Math.ceil(textarea.scrollHeight / 24), // 24px satır yüksekliği
          1
        ),
        5 // maksimum 5 satır
      );

      setRows(newRows);
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Klavye kısayolları için tooltip gösterimi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === '/') || (e.ctrlKey && e.key === 'k')) {
        setShowShortcutTooltip(true);
        setTimeout(() => setShowShortcutTooltip(false), 2000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dosya seçme işlevi
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  // Dosya kaldırma işlevi
  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  // Ses kaydı tamamlandığında
  const handleVoiceRecordingComplete = (audioBlob: Blob, transcript: string) => {
    // Ses dosyasını File nesnesine dönüştür
    const audioFile = new File([audioBlob], `voice-message-${Date.now()}.wav`, {
      type: 'audio/wav'
    });

    // Dosyayı ayarla
    setSelectedFile(audioFile);

    // Transkripti mesaj alanına ekle
    if (transcript) {
      setMessage(transcript);

      // Textarea yüksekliğini güncelle
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        setRows(Math.min(Math.ceil(textareaRef.current.scrollHeight / 24), 5));
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if ((message.trim() || selectedFile) && !loading && !disabled) {
      onSendMessage(message, selectedFile || undefined);
      setMessage('');
      setSelectedFile(null);
      closeFileUploader();

      // Textarea'yı sıfırla
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        setRows(1);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        {/* Dosya yükleyici */}
        <Collapse in={isFileUploaderOpen} animateOpacity>
          <Box mb={3} borderWidth="1px" borderColor={borderColor} borderRadius="md" p={2}>
            <Flex justify="space-between" align="center" mb={2}>
              <Box fontSize="sm" fontWeight="medium">Dosya Ekle</Box>
              <IconButton
                aria-label="Dosya yükleyiciyi kapat"
                icon={<SmallCloseIcon />}
                size="xs"
                variant="ghost"
                onClick={toggleFileUploader}
              />
            </Flex>
            <FileUploader
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              disabled={loading || disabled}
            />
          </Box>
        </Collapse>

        <Flex>
          <Box position="relative" flex="1" mr={2}>
            <Tooltip
              label="Mesaj giriş alanına odaklandınız (Ctrl+K veya Ctrl+/)"
              isOpen={showShortcutTooltip}
              placement="top"
              hasArrow
            >
              <textarea
                ref={textareaRef}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={disabled ? "AI başlatılıyor..." : "Mesajınızı yazın... (Ctrl+K veya Ctrl+/)"}
                rows={rows}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading || disabled}
                aria-label="Mesaj giriş alanı"
              />
            </Tooltip>

            {/* Karakter sayacı */}
            {message.length > 0 && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
                {message.length} karakter
              </div>
            )}

            {/* Klavye kısayolları */}
            <div className="absolute bottom-2 left-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="hidden sm:inline">Enter = Gönder | Shift+Enter = Yeni satır</span>
            </div>
          </Box>

          {/* Dosya ekleme düğmesi */}
          <IconButton
            aria-label="Dosya ekle"
            icon={<AttachmentIcon />}
            mr={2}
            size="md"
            variant="ghost"
            onClick={toggleFileUploader}
            isDisabled={loading || disabled}
            className={selectedFile ? "text-blue-500" : ""}
          />

          {/* Ses kaydı düğmesi */}
          <Box mr={2}>
            <VoiceRecorder
              onRecordingComplete={handleVoiceRecordingComplete}
              disabled={loading || disabled}
            />
          </Box>

          {/* Gönder düğmesi */}
          <button
            type="submit"
            disabled={(!message.trim() && !selectedFile) || loading || disabled}
            className={`p-3 rounded-lg ${
              (!message.trim() && !selectedFile) || loading || disabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            aria-label="Mesaj gönder"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </Flex>

        {/* Seçilen dosya göstergesi */}
        {selectedFile && (
          <Flex
            mt={2}
            p={2}
            bg="blue.50"
            borderRadius="md"
            fontSize="xs"
            color="blue.700"
            align="center"
            className="dark:bg-blue-900 dark:text-blue-200"
          >
            <AttachmentIcon mr={1} />
            <Box flex="1" noOfLines={1}>{selectedFile.name}</Box>
            <IconButton
              aria-label="Dosyayı kaldır"
              icon={<SmallCloseIcon />}
              size="xs"
              variant="ghost"
              onClick={handleFileRemove}
            />
          </Flex>
        )}
      </form>
    </Box>
  );
});

export default MessageInput;
