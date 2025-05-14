import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Text,
  Flex,
  Progress,
  Icon,
  useColorMode,
  BoxProps,
} from '@chakra-ui/react';
import { glassmorphism } from '../../styles/themes/creator';

// File uploader props
export interface FileUploaderProps extends BoxProps {
  /**
   * On file select callback
   */
  onFileSelect?: (files: File[]) => void;
  /**
   * On file upload callback
   */
  onFileUpload?: (files: File[]) => Promise<void>;
  /**
   * Whether to allow multiple files
   */
  multiple?: boolean;
  /**
   * Accepted file types
   */
  accept?: string;
  /**
   * Maximum file size in bytes
   */
  maxSize?: number;
  /**
   * Whether to auto upload
   */
  autoUpload?: boolean;
  /**
   * Upload button text
   */
  uploadButtonText?: string;
  /**
   * Browse button text
   */
  browseButtonText?: string;
  /**
   * Drag and drop text
   */
  dragDropText?: string;
  /**
   * Whether to show file preview
   */
  showPreview?: boolean;
  /**
   * Whether to show file progress
   */
  showProgress?: boolean;
}

/**
 * File uploader component
 */
const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  onFileUpload,
  multiple = false,
  accept,
  maxSize,
  autoUpload = false,
  uploadButtonText = 'Upload',
  browseButtonText = 'Browse',
  dragDropText = 'Drag and drop files here, or click to browse',
  showPreview = true,
  showProgress = true,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const fileList = Array.from(selectedFiles);
    
    // Validate file size if maxSize is provided
    if (maxSize) {
      const invalidFiles = fileList.filter(file => file.size > maxSize);
      if (invalidFiles.length > 0) {
        setError(`Some files exceed the maximum size of ${formatFileSize(maxSize)}`);
        return;
      }
    }
    
    setFiles(fileList);
    setError(null);
    
    if (onFileSelect) {
      onFileSelect(fileList);
    }
    
    if (autoUpload && onFileUpload) {
      handleUpload(fileList);
    }
  };
  
  // Handle drag events
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = event.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;
    
    const fileList = Array.from(droppedFiles);
    
    // Validate file size if maxSize is provided
    if (maxSize) {
      const invalidFiles = fileList.filter(file => file.size > maxSize);
      if (invalidFiles.length > 0) {
        setError(`Some files exceed the maximum size of ${formatFileSize(maxSize)}`);
        return;
      }
    }
    
    setFiles(fileList);
    setError(null);
    
    if (onFileSelect) {
      onFileSelect(fileList);
    }
    
    if (autoUpload && onFileUpload) {
      handleUpload(fileList);
    }
  };
  
  // Handle browse button click
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle upload button click
  const handleUploadClick = () => {
    if (files.length === 0) return;
    handleUpload(files);
  };
  
  // Handle file upload
  const handleUpload = async (filesToUpload: File[]) => {
    if (!onFileUpload) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 500);
      
      await onFileUpload(filesToUpload);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset after upload
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setFiles([]);
      }, 1000);
    } catch (error) {
      setError('Upload failed. Please try again.');
      setIsUploading(false);
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <Box {...rest}>
      {/* File input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
      
      {/* Drag and drop area */}
      <Box
        border="2px dashed"
        borderColor={isDragging ? 'blue.500' : colorMode === 'light' ? 'gray.300' : 'gray.600'}
        borderRadius="md"
        p={6}
        textAlign="center"
        cursor="pointer"
        transition="all 0.2s"
        bg={isDragging ? (colorMode === 'light' ? 'blue.50' : 'blue.900') : 'transparent'}
        _hover={{
          borderColor: 'blue.500',
          bg: colorMode === 'light' ? 'blue.50' : 'blue.900',
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        {...glassStyle}
      >
        <Icon
          viewBox="0 0 24 24"
          boxSize={12}
          color={colorMode === 'light' ? 'blue.500' : 'blue.300'}
          mb={4}
        >
          <path
            fill="currentColor"
            d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"
          />
        </Icon>
        
        <Text fontSize="lg" fontWeight="medium" mb={2}>
          {dragDropText}
        </Text>
        
        {maxSize && (
          <Text fontSize="sm" color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
            Maximum file size: {formatFileSize(maxSize)}
          </Text>
        )}
      </Box>
      
      {/* Error message */}
      {error && (
        <Text color="red.500" mt={2}>
          {error}
        </Text>
      )}
      
      {/* File preview */}
      {showPreview && files.length > 0 && (
        <Box mt={4}>
          <Text fontWeight="medium" mb={2}>
            Selected Files:
          </Text>
          
          {files.map((file, index) => (
            <Flex
              key={index}
              alignItems="center"
              p={2}
              borderWidth="1px"
              borderRadius="md"
              mb={2}
            >
              <Box flex="1">
                <Text fontWeight="medium" noOfLines={1}>
                  {file.name}
                </Text>
                <Text fontSize="sm" color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                  {formatFileSize(file.size)}
                </Text>
              </Box>
            </Flex>
          ))}
        </Box>
      )}
      
      {/* Upload progress */}
      {showProgress && isUploading && (
        <Box mt={4}>
          <Text mb={1}>Uploading... {uploadProgress}%</Text>
          <Progress value={uploadProgress} size="sm" colorScheme="blue" borderRadius="md" />
        </Box>
      )}
      
      {/* Upload button */}
      {!autoUpload && files.length > 0 && (
        <Button
          mt={4}
          colorScheme="blue"
          onClick={handleUploadClick}
          isLoading={isUploading}
          loadingText="Uploading..."
          isDisabled={isUploading}
        >
          {uploadButtonText}
        </Button>
      )}
    </Box>
  );
};

export default FileUploader;
