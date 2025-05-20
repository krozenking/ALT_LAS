import React, { useState, useRef, ChangeEvent } from 'react';
import { Box, Flex, Text, Icon, IconButton, Progress, useColorModeValue, Tooltip, useToast, Badge } from '@chakra-ui/react';
import { AttachmentIcon, CloseIcon, CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { FiFile, FiImage, FiFileText, FiCode } from 'react-icons/fi';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  onFileRemove,
  maxSizeMB = 5,
  allowedTypes = ['image/*', 'text/*', 'application/pdf', 'application/json'],
  disabled = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  
  // Renk değişkenleri
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const dragBgColor = useColorModeValue('blue.50', 'blue.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  
  // Dosya boyutu formatla
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Dosya tipine göre ikon belirle
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return FiImage;
    if (fileType.startsWith('text/')) return FiFileText;
    if (fileType.includes('json') || fileType.includes('javascript') || fileType.includes('html')) return FiCode;
    return FiFile;
  };
  
  // Dosya seçme işlevi
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    validateAndProcessFile(file);
  };
  
  // Dosya sürükle bırak işlevleri
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    validateAndProcessFile(file);
  };
  
  // Dosya doğrulama ve işleme
  const validateAndProcessFile = (file: File) => {
    // Dosya boyutu kontrolü
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast({
        title: 'Dosya çok büyük',
        description: `Maksimum dosya boyutu ${maxSizeMB}MB olmalıdır.`,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // Dosya tipi kontrolü
    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const mainType = type.split('/')[0];
        return file.type.startsWith(`${mainType}/`);
      }
      return type === file.type;
    });
    
    if (!isValidType) {
      toast({
        title: 'Desteklenmeyen dosya tipi',
        description: 'Lütfen desteklenen bir dosya tipi yükleyin.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // Dosyayı ayarla ve yükleme simülasyonu başlat
    setSelectedFile(file);
    simulateUpload(file);
  };
  
  // Yükleme simülasyonu
  const simulateUpload = (file: File) => {
    setUploadStatus('uploading');
    setUploadProgress(0);
    
    // Gerçek bir API çağrısı yerine simülasyon
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus('success');
          onFileSelect(file);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };
  
  // Dosya kaldırma
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove();
  };
  
  return (
    <Box>
      {!selectedFile ? (
        <Box
          border="2px dashed"
          borderColor={isDragging ? 'blue.400' : borderColor}
          borderRadius="md"
          p={2}
          bg={isDragging ? dragBgColor : bgColor}
          transition="all 0.2s"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          cursor={disabled ? 'not-allowed' : 'pointer'}
          opacity={disabled ? 0.6 : 1}
        >
          <Flex direction="column" align="center" justify="center" py={2}>
            <Icon as={AttachmentIcon} boxSize={5} color={textColor} mb={2} />
            <Text fontSize="sm" color={textColor} textAlign="center">
              Dosya eklemek için tıklayın veya sürükleyip bırakın
            </Text>
            <Text fontSize="xs" color={textColor} mt={1}>
              Maksimum boyut: {maxSizeMB}MB
            </Text>
          </Flex>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept={allowedTypes.join(',')}
            disabled={disabled}
          />
        </Box>
      ) : (
        <Box
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          p={3}
          bg={bgColor}
        >
          <Flex justify="space-between" align="center" mb={2}>
            <Flex align="center">
              <Icon as={getFileIcon(selectedFile.type)} boxSize={5} mr={2} />
              <Box>
                <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                  {selectedFile.name}
                </Text>
                <Flex align="center">
                  <Text fontSize="xs" color={textColor}>
                    {formatFileSize(selectedFile.size)}
                  </Text>
                  {uploadStatus === 'success' && (
                    <Badge ml={2} colorScheme="green" fontSize="2xs">
                      Yüklendi
                    </Badge>
                  )}
                </Flex>
              </Box>
            </Flex>
            <Tooltip label="Dosyayı kaldır">
              <IconButton
                aria-label="Dosyayı kaldır"
                icon={<CloseIcon />}
                size="xs"
                variant="ghost"
                onClick={handleRemoveFile}
              />
            </Tooltip>
          </Flex>
          
          {uploadStatus === 'uploading' && (
            <Progress 
              value={uploadProgress} 
              size="xs" 
              colorScheme="blue" 
              borderRadius="full" 
            />
          )}
          
          {uploadStatus === 'success' && (
            <Flex align="center" color="green.500" fontSize="xs">
              <CheckIcon mr={1} />
              <Text>Dosya başarıyla yüklendi</Text>
            </Flex>
          )}
          
          {uploadStatus === 'error' && (
            <Flex align="center" color="red.500" fontSize="xs">
              <WarningIcon mr={1} />
              <Text>Yükleme sırasında bir hata oluştu</Text>
            </Flex>
          )}
        </Box>
      )}
    </Box>
  );
};

export default FileUploader;
