import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Progress,
  Button,
  IconButton,
  useColorMode,
  BoxProps,
} from '@chakra-ui/react';
import { glassmorphism } from '../../styles/themes/creator';

// File downloader props
export interface FileDownloaderProps extends BoxProps {
  /**
   * File URL
   */
  fileUrl: string;
  /**
   * File name
   */
  fileName: string;
  /**
   * File size in bytes
   */
  fileSize?: number;
  /**
   * Whether to auto start download
   */
  autoStart?: boolean;
  /**
   * Whether to show file info
   */
  showFileInfo?: boolean;
  /**
   * Whether to show progress
   */
  showProgress?: boolean;
  /**
   * Whether to show speed
   */
  showSpeed?: boolean;
  /**
   * Whether to show time remaining
   */
  showTimeRemaining?: boolean;
  /**
   * Whether to show cancel button
   */
  showCancelButton?: boolean;
  /**
   * Whether to show pause button
   */
  showPauseButton?: boolean;
  /**
   * Whether to show resume button
   */
  showResumeButton?: boolean;
  /**
   * Whether to show retry button
   */
  showRetryButton?: boolean;
  /**
   * Whether to show open button
   */
  showOpenButton?: boolean;
  /**
   * Whether to show open folder button
   */
  showOpenFolderButton?: boolean;
  /**
   * On download start callback
   */
  onDownloadStart?: () => void;
  /**
   * On download progress callback
   */
  onDownloadProgress?: (progress: number, loaded: number, total: number, speed: number) => void;
  /**
   * On download complete callback
   */
  onDownloadComplete?: (filePath: string) => void;
  /**
   * On download error callback
   */
  onDownloadError?: (error: Error) => void;
  /**
   * On download cancel callback
   */
  onDownloadCancel?: () => void;
  /**
   * On download pause callback
   */
  onDownloadPause?: () => void;
  /**
   * On download resume callback
   */
  onDownloadResume?: () => void;
  /**
   * On download retry callback
   */
  onDownloadRetry?: () => void;
  /**
   * On open file callback
   */
  onOpenFile?: (filePath: string) => void;
  /**
   * On open folder callback
   */
  onOpenFolder?: (folderPath: string) => void;
}

// Download status
type DownloadStatus = 'idle' | 'downloading' | 'paused' | 'completed' | 'error' | 'cancelled';

/**
 * File downloader component
 */
const FileDownloader: React.FC<FileDownloaderProps> = ({
  fileUrl,
  fileName,
  fileSize,
  autoStart = true,
  showFileInfo = true,
  showProgress = true,
  showSpeed = true,
  showTimeRemaining = true,
  showCancelButton = true,
  showPauseButton = true,
  showResumeButton = true,
  showRetryButton = true,
  showOpenButton = true,
  showOpenFolderButton = true,
  onDownloadStart,
  onDownloadProgress,
  onDownloadComplete,
  onDownloadError,
  onDownloadCancel,
  onDownloadPause,
  onDownloadResume,
  onDownloadRetry,
  onOpenFile,
  onOpenFolder,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(fileSize || 0);
  const [speed, setSpeed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [filePath, setFilePath] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [lastLoaded, setLastLoaded] = useState(0);
  const [lastTime, setLastTime] = useState(0);
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format time
  const formatTime = (seconds: number): string => {
    if (seconds === Infinity || isNaN(seconds)) return 'Calculating...';
    if (seconds < 60) return `${Math.floor(seconds)} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ${Math.floor(seconds % 60)} seconds`;
    return `${Math.floor(seconds / 3600)} hours ${Math.floor((seconds % 3600) / 60)} minutes`;
  };
  
  // Start download
  const startDownload = () => {
    if (downloadStatus === 'downloading') return;
    
    setDownloadStatus('downloading');
    setProgress(0);
    setLoaded(0);
    setSpeed(0);
    setTimeRemaining(0);
    setError(null);
    setStartTime(Date.now());
    setLastLoaded(0);
    setLastTime(Date.now());
    
    if (onDownloadStart) {
      onDownloadStart();
    }
    
    // Simulate download progress
    const simulateDownload = () => {
      const totalSize = total || 1024 * 1024 * 10; // 10MB if size is unknown
      const interval = setInterval(() => {
        setLoaded(prevLoaded => {
          if (downloadStatus !== 'downloading') {
            clearInterval(interval);
            return prevLoaded;
          }
          
          const now = Date.now();
          const timeDiff = now - lastTime;
          const loadedDiff = prevLoaded - lastLoaded;
          
          // Calculate speed (bytes per second)
          const currentSpeed = timeDiff > 0 ? (loadedDiff / timeDiff) * 1000 : 0;
          setSpeed(currentSpeed);
          
          // Calculate time remaining
          const remainingBytes = totalSize - prevLoaded;
          const timeRemainingSeconds = currentSpeed > 0 ? remainingBytes / currentSpeed : 0;
          setTimeRemaining(timeRemainingSeconds);
          
          // Update last values
          setLastLoaded(prevLoaded);
          setLastTime(now);
          
          // Calculate progress
          const newLoaded = Math.min(prevLoaded + Math.random() * 1024 * 1024, totalSize);
          const newProgress = (newLoaded / totalSize) * 100;
          setProgress(newProgress);
          
          if (onDownloadProgress) {
            onDownloadProgress(newProgress, newLoaded, totalSize, currentSpeed);
          }
          
          // Check if download is complete
          if (newLoaded >= totalSize) {
            clearInterval(interval);
            setDownloadStatus('completed');
            setFilePath(`C:\\Downloads\\${fileName}`);
            
            if (onDownloadComplete) {
              onDownloadComplete(`C:\\Downloads\\${fileName}`);
            }
          }
          
          return newLoaded;
        });
      }, 500);
      
      return () => clearInterval(interval);
    };
    
    simulateDownload();
  };
  
  // Pause download
  const pauseDownload = () => {
    if (downloadStatus !== 'downloading') return;
    
    setDownloadStatus('paused');
    
    if (onDownloadPause) {
      onDownloadPause();
    }
  };
  
  // Resume download
  const resumeDownload = () => {
    if (downloadStatus !== 'paused') return;
    
    setDownloadStatus('downloading');
    setLastTime(Date.now());
    
    if (onDownloadResume) {
      onDownloadResume();
    }
    
    // Simulate download progress
    const simulateDownload = () => {
      const totalSize = total || 1024 * 1024 * 10; // 10MB if size is unknown
      const interval = setInterval(() => {
        setLoaded(prevLoaded => {
          if (downloadStatus !== 'downloading') {
            clearInterval(interval);
            return prevLoaded;
          }
          
          const now = Date.now();
          const timeDiff = now - lastTime;
          const loadedDiff = prevLoaded - lastLoaded;
          
          // Calculate speed (bytes per second)
          const currentSpeed = timeDiff > 0 ? (loadedDiff / timeDiff) * 1000 : 0;
          setSpeed(currentSpeed);
          
          // Calculate time remaining
          const remainingBytes = totalSize - prevLoaded;
          const timeRemainingSeconds = currentSpeed > 0 ? remainingBytes / currentSpeed : 0;
          setTimeRemaining(timeRemainingSeconds);
          
          // Update last values
          setLastLoaded(prevLoaded);
          setLastTime(now);
          
          // Calculate progress
          const newLoaded = Math.min(prevLoaded + Math.random() * 1024 * 1024, totalSize);
          const newProgress = (newLoaded / totalSize) * 100;
          setProgress(newProgress);
          
          if (onDownloadProgress) {
            onDownloadProgress(newProgress, newLoaded, totalSize, currentSpeed);
          }
          
          // Check if download is complete
          if (newLoaded >= totalSize) {
            clearInterval(interval);
            setDownloadStatus('completed');
            setFilePath(`C:\\Downloads\\${fileName}`);
            
            if (onDownloadComplete) {
              onDownloadComplete(`C:\\Downloads\\${fileName}`);
            }
          }
          
          return newLoaded;
        });
      }, 500);
      
      return () => clearInterval(interval);
    };
    
    simulateDownload();
  };
  
  // Cancel download
  const cancelDownload = () => {
    if (downloadStatus !== 'downloading' && downloadStatus !== 'paused') return;
    
    setDownloadStatus('cancelled');
    
    if (onDownloadCancel) {
      onDownloadCancel();
    }
  };
  
  // Retry download
  const retryDownload = () => {
    if (downloadStatus !== 'error' && downloadStatus !== 'cancelled') return;
    
    startDownload();
    
    if (onDownloadRetry) {
      onDownloadRetry();
    }
  };
  
  // Open file
  const openFile = () => {
    if (downloadStatus !== 'completed') return;
    
    if (onOpenFile) {
      onOpenFile(filePath);
    }
  };
  
  // Open folder
  const openFolder = () => {
    if (downloadStatus !== 'completed') return;
    
    if (onOpenFolder) {
      onOpenFolder('C:\\Downloads');
    }
  };
  
  // Auto start download
  useEffect(() => {
    if (autoStart && downloadStatus === 'idle') {
      startDownload();
    }
  }, [autoStart]);
  
  return (
    <Box
      p={4}
      borderRadius="md"
      {...glassStyle}
      {...rest}
    >
      {/* File info */}
      {showFileInfo && (
        <Flex alignItems="center" mb={4}>
          <Box
            width="40px"
            height="40px"
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
            fontSize="xl"
            mr={3}
          >
            {fileName.endsWith('.pdf') ? '📄' :
              fileName.endsWith('.jpg') || fileName.endsWith('.png') || fileName.endsWith('.gif') ? '🖼️' :
              fileName.endsWith('.mp4') || fileName.endsWith('.avi') || fileName.endsWith('.mov') ? '🎬' :
              fileName.endsWith('.mp3') || fileName.endsWith('.wav') || fileName.endsWith('.ogg') ? '🎵' :
              fileName.endsWith('.doc') || fileName.endsWith('.docx') ? '📝' :
              fileName.endsWith('.xls') || fileName.endsWith('.xlsx') ? '📊' :
              fileName.endsWith('.ppt') || fileName.endsWith('.pptx') ? '📊' :
              fileName.endsWith('.zip') || fileName.endsWith('.rar') ? '🗜️' :
              '📄'}
          </Box>
          
          <Box flex="1">
            <Text fontWeight="medium" noOfLines={1}>
              {fileName}
            </Text>
            <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
              {total > 0 ? formatFileSize(total) : 'Unknown size'}
            </Text>
          </Box>
        </Flex>
      )}
      
      {/* Progress */}
      {showProgress && (
        <Box mb={2}>
          <Flex justifyContent="space-between" mb={1}>
            <Text fontSize="sm">
              {downloadStatus === 'completed'
                ? 'Download completed'
                : downloadStatus === 'error'
                  ? 'Download failed'
                  : downloadStatus === 'cancelled'
                    ? 'Download cancelled'
                    : downloadStatus === 'paused'
                      ? 'Download paused'
                      : 'Downloading...'}
            </Text>
            <Text fontSize="sm">
              {progress.toFixed(1)}%
            </Text>
          </Flex>
          <Progress
            value={progress}
            size="sm"
            colorScheme={
              downloadStatus === 'completed'
                ? 'green'
                : downloadStatus === 'error'
                  ? 'red'
                  : downloadStatus === 'cancelled'
                    ? 'red'
                    : downloadStatus === 'paused'
                      ? 'yellow'
                      : 'blue'
            }
            borderRadius="md"
          />
        </Box>
      )}
      
      {/* Download info */}
      <Flex justifyContent="space-between" mb={4}>
        {/* Speed */}
        {showSpeed && downloadStatus === 'downloading' && (
          <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
            {formatFileSize(speed)}/s
          </Text>
        )}
        
        {/* Time remaining */}
        {showTimeRemaining && downloadStatus === 'downloading' && (
          <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
            {formatTime(timeRemaining)} remaining
          </Text>
        )}
        
        {/* Downloaded / Total */}
        {total > 0 && (
          <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.400'}>
            {formatFileSize(loaded)} / {formatFileSize(total)}
          </Text>
        )}
      </Flex>
      
      {/* Actions */}
      <Flex justifyContent="flex-end">
        {/* Cancel button */}
        {showCancelButton && (downloadStatus === 'downloading' || downloadStatus === 'paused') && (
          <Button
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={cancelDownload}
            mr={2}
          >
            Cancel
          </Button>
        )}
        
        {/* Pause button */}
        {showPauseButton && downloadStatus === 'downloading' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={pauseDownload}
            mr={2}
          >
            Pause
          </Button>
        )}
        
        {/* Resume button */}
        {showResumeButton && downloadStatus === 'paused' && (
          <Button
            size="sm"
            variant="ghost"
            colorScheme="blue"
            onClick={resumeDownload}
            mr={2}
          >
            Resume
          </Button>
        )}
        
        {/* Retry button */}
        {showRetryButton && (downloadStatus === 'error' || downloadStatus === 'cancelled') && (
          <Button
            size="sm"
            variant="ghost"
            colorScheme="blue"
            onClick={retryDownload}
            mr={2}
          >
            Retry
          </Button>
        )}
        
        {/* Open button */}
        {showOpenButton && downloadStatus === 'completed' && (
          <Button
            size="sm"
            variant="ghost"
            colorScheme="green"
            onClick={openFile}
            mr={2}
          >
            Open
          </Button>
        )}
        
        {/* Open folder button */}
        {showOpenFolderButton && downloadStatus === 'completed' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={openFolder}
          >
            Open Folder
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default FileDownloader;
