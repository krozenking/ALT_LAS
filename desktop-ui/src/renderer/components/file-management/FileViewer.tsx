import React, { useState } from 'react';
import {
  Box,
  Flex,
  Image,
  Text,
  Button,
  IconButton,
  Tooltip,
  useColorMode,
  BoxProps,
} from '@chakra-ui/react';
import { glassmorphism } from '../../styles/themes/creator';

// File viewer props
export interface FileViewerProps extends BoxProps {
  /**
   * File URL
   */
  fileUrl: string;
  /**
   * File name
   */
  fileName: string;
  /**
   * File type
   */
  fileType: string;
  /**
   * File size in bytes
   */
  fileSize?: number;
  /**
   * File last modified date
   */
  lastModified?: Date;
  /**
   * Whether to show file info
   */
  showFileInfo?: boolean;
  /**
   * Whether to show download button
   */
  showDownloadButton?: boolean;
  /**
   * Whether to show print button
   */
  showPrintButton?: boolean;
  /**
   * Whether to show fullscreen button
   */
  showFullscreenButton?: boolean;
  /**
   * Whether to show zoom buttons
   */
  showZoomButtons?: boolean;
  /**
   * Whether to show rotate buttons
   */
  showRotateButtons?: boolean;
  /**
   * On download click callback
   */
  onDownloadClick?: () => void;
  /**
   * On print click callback
   */
  onPrintClick?: () => void;
  /**
   * On fullscreen click callback
   */
  onFullscreenClick?: () => void;
  /**
   * On close click callback
   */
  onCloseClick?: () => void;
}

/**
 * File viewer component
 */
const FileViewer: React.FC<FileViewerProps> = ({
  fileUrl,
  fileName,
  fileType,
  fileSize,
  lastModified,
  showFileInfo = true,
  showDownloadButton = true,
  showPrintButton = true,
  showFullscreenButton = true,
  showZoomButtons = true,
  showRotateButtons = true,
  onDownloadClick,
  onPrintClick,
  onFullscreenClick,
  onCloseClick,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format date
  const formatDate = (date?: Date): string => {
    if (!date) return '';
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Handle zoom in
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3));
  };
  
  // Handle zoom out
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };
  
  // Handle zoom reset
  const handleZoomReset = () => {
    setZoomLevel(1);
  };
  
  // Handle rotate left
  const handleRotateLeft = () => {
    setRotation(prev => prev - 90);
  };
  
  // Handle rotate right
  const handleRotateRight = () => {
    setRotation(prev => prev + 90);
  };
  
  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    setIsFullscreen(prev => !prev);
    
    if (onFullscreenClick) {
      onFullscreenClick();
    }
  };
  
  // Handle download
  const handleDownload = () => {
    if (onDownloadClick) {
      onDownloadClick();
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.click();
    }
  };
  
  // Handle print
  const handlePrint = () => {
    if (onPrintClick) {
      onPrintClick();
    } else {
      // Default print behavior
      const printWindow = window.open(fileUrl);
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    }
  };
  
  // Handle close
  const handleClose = () => {
    if (onCloseClick) {
      onCloseClick();
    }
  };
  
  // Render file content based on file type
  const renderFileContent = () => {
    if (fileType.startsWith('image/')) {
      return (
        <Image
          src={fileUrl}
          alt={fileName}
          maxH="100%"
          maxW="100%"
          objectFit="contain"
          transform={`scale(${zoomLevel}) rotate(${rotation}deg)`}
          transition="transform 0.2s"
        />
      );
    } else if (fileType === 'application/pdf') {
      return (
        <iframe
          src={fileUrl}
          title={fileName}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      );
    } else if (fileType.startsWith('video/')) {
      return (
        <video
          src={fileUrl}
          controls
          width="100%"
          height="100%"
          style={{ maxHeight: '100%', maxWidth: '100%' }}
        />
      );
    } else if (fileType.startsWith('audio/')) {
      return (
        <audio
          src={fileUrl}
          controls
          style={{ width: '100%' }}
        />
      );
    } else if (fileType === 'text/plain' || fileType === 'text/html' || fileType === 'text/css' || fileType === 'text/javascript') {
      return (
        <iframe
          src={fileUrl}
          title={fileName}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      );
    } else {
      return (
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          height="100%"
          p={4}
        >
          <Text fontSize="lg" fontWeight="medium" mb={4}>
            Preview not available for this file type
          </Text>
          <Button colorScheme="blue" onClick={handleDownload}>
            Download
          </Button>
        </Flex>
      );
    }
  };
  
  return (
    <Box
      position="relative"
      width="100%"
      height="100%"
      borderRadius="md"
      overflow="hidden"
      {...glassStyle}
      {...rest}
    >
      {/* Toolbar */}
      <Flex
        position="absolute"
        top={0}
        left={0}
        right={0}
        p={2}
        bg={colorMode === 'light' ? 'whiteAlpha.800' : 'blackAlpha.800'}
        zIndex={1}
        justifyContent="space-between"
        alignItems="center"
      >
        {/* File info */}
        {showFileInfo && (
          <Box>
            <Text fontWeight="medium" noOfLines={1}>
              {fileName}
            </Text>
            <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
              {formatFileSize(fileSize)} • {formatDate(lastModified)}
            </Text>
          </Box>
        )}
        
        {/* Actions */}
        <Flex>
          {/* Zoom buttons */}
          {showZoomButtons && (
            <>
              <Tooltip label="Zoom out">
                <IconButton
                  aria-label="Zoom out"
                  icon={'➖'}
                  size="sm"
                  variant="ghost"
                  onClick={handleZoomOut}
                  mr={1}
                />
              </Tooltip>
              <Tooltip label="Reset zoom">
                <IconButton
                  aria-label="Reset zoom"
                  icon={'🔍'}
                  size="sm"
                  variant="ghost"
                  onClick={handleZoomReset}
                  mr={1}
                />
              </Tooltip>
              <Tooltip label="Zoom in">
                <IconButton
                  aria-label="Zoom in"
                  icon={'➕'}
                  size="sm"
                  variant="ghost"
                  onClick={handleZoomIn}
                  mr={1}
                />
              </Tooltip>
            </>
          )}
          
          {/* Rotate buttons */}
          {showRotateButtons && (
            <>
              <Tooltip label="Rotate left">
                <IconButton
                  aria-label="Rotate left"
                  icon={'↪️'}
                  size="sm"
                  variant="ghost"
                  onClick={handleRotateLeft}
                  mr={1}
                />
              </Tooltip>
              <Tooltip label="Rotate right">
                <IconButton
                  aria-label="Rotate right"
                  icon={'↩️'}
                  size="sm"
                  variant="ghost"
                  onClick={handleRotateRight}
                  mr={1}
                />
              </Tooltip>
            </>
          )}
          
          {/* Download button */}
          {showDownloadButton && (
            <Tooltip label="Download">
              <IconButton
                aria-label="Download"
                icon={'⬇️'}
                size="sm"
                variant="ghost"
                onClick={handleDownload}
                mr={1}
              />
            </Tooltip>
          )}
          
          {/* Print button */}
          {showPrintButton && (
            <Tooltip label="Print">
              <IconButton
                aria-label="Print"
                icon={'🖨️'}
                size="sm"
                variant="ghost"
                onClick={handlePrint}
                mr={1}
              />
            </Tooltip>
          )}
          
          {/* Fullscreen button */}
          {showFullscreenButton && (
            <Tooltip label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              <IconButton
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                icon={isFullscreen ? '⛶' : '⛶'}
                size="sm"
                variant="ghost"
                onClick={handleFullscreenToggle}
                mr={1}
              />
            </Tooltip>
          )}
          
          {/* Close button */}
          {onCloseClick && (
            <Tooltip label="Close">
              <IconButton
                aria-label="Close"
                icon={'✖️'}
                size="sm"
                variant="ghost"
                onClick={handleClose}
              />
            </Tooltip>
          )}
        </Flex>
      </Flex>
      
      {/* File content */}
      <Box
        position="absolute"
        top="48px"
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
        overflow="auto"
      >
        {renderFileContent()}
      </Box>
    </Box>
  );
};

export default FileViewer;
