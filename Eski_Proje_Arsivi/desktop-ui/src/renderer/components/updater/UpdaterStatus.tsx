import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  Progress,
  Badge,
  Flex,
  useColorMode,
  Tooltip,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
} from '@chakra-ui/react';
import { useUpdater } from '../../hooks/useUpdater';
import { UpdateStatus } from '../../../main/services/UpdaterService';

export interface UpdaterStatusProps {
  /**
   * Whether to check for updates on mount
   */
  checkOnMount?: boolean;
  /**
   * Check interval in milliseconds
   */
  checkInterval?: number;
  /**
   * Whether to show the version
   */
  showVersion?: boolean;
  /**
   * Whether to show as a badge
   */
  asBadge?: boolean;
  /**
   * Whether to show as a button
   */
  asButton?: boolean;
  /**
   * Whether to show as a popover
   */
  asPopover?: boolean;
  /**
   * Whether to auto download updates
   */
  autoDownload?: boolean;
}

/**
 * Updater status component
 */
export const UpdaterStatus: React.FC<UpdaterStatusProps> = ({
  checkOnMount = true,
  checkInterval = 60 * 60 * 1000, // 1 hour
  showVersion = true,
  asBadge = false,
  asButton = false,
  asPopover = true,
  autoDownload = true,
}) => {
  const { colorMode } = useColorMode();
  const {
    status,
    updateInfo,
    progress,
    error,
    currentVersion,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    isUpdateAvailable,
    isDownloading,
    isUpdateReady,
    isChecking,
  } = useUpdater();

  // Check for updates on mount and at interval
  useEffect(() => {
    if (checkOnMount) {
      checkForUpdates();
    }

    if (checkInterval > 0) {
      const interval = setInterval(() => {
        checkForUpdates();
      }, checkInterval);

      return () => {
        clearInterval(interval);
      };
    }
  }, [checkOnMount, checkInterval, checkForUpdates]);

  // Auto download updates
  useEffect(() => {
    if (autoDownload && isUpdateAvailable) {
      downloadUpdate();
    }
  }, [autoDownload, isUpdateAvailable, downloadUpdate]);

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case UpdateStatus.AVAILABLE:
        return 'yellow';
      case UpdateStatus.DOWNLOADING:
        return 'blue';
      case UpdateStatus.DOWNLOADED:
        return 'green';
      case UpdateStatus.ERROR:
        return 'red';
      case UpdateStatus.CHECKING:
        return 'purple';
      default:
        return 'gray';
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (status) {
      case UpdateStatus.AVAILABLE:
        return `Update available: ${updateInfo?.version}`;
      case UpdateStatus.DOWNLOADING:
        return `Downloading update: ${Math.round(progress?.percent || 0)}%`;
      case UpdateStatus.DOWNLOADED:
        return 'Update ready to install';
      case UpdateStatus.ERROR:
        return `Update error: ${error}`;
      case UpdateStatus.CHECKING:
        return 'Checking for updates...';
      default:
        return 'Up to date';
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (status) {
      case UpdateStatus.AVAILABLE:
        return '↓';
      case UpdateStatus.DOWNLOADING:
        return '⟳';
      case UpdateStatus.DOWNLOADED:
        return '↺';
      case UpdateStatus.ERROR:
        return '⚠';
      case UpdateStatus.CHECKING:
        return '⟳';
      default:
        return '✓';
    }
  };

  // Render as badge
  if (asBadge) {
    return (
      <Badge colorScheme={getStatusColor()} px={2} py={1}>
        {getStatusText()}
      </Badge>
    );
  }

  // Render as button
  if (asButton) {
    return (
      <Button
        size="sm"
        colorScheme={getStatusColor()}
        isLoading={isChecking || isDownloading}
        onClick={isUpdateReady ? installUpdate : checkForUpdates}
      >
        {getStatusText()}
      </Button>
    );
  }

  // Render as popover
  if (asPopover) {
    return (
      <Popover placement="bottom-end">
        <PopoverTrigger>
          <Tooltip label={getStatusText()}>
            <IconButton
              aria-label="Update status"
              icon={<Text>{getStatusIcon()}</Text>}
              size="sm"
              colorScheme={getStatusColor()}
              isLoading={isChecking || isDownloading}
              variant="ghost"
            />
          </Tooltip>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            <Flex justify="space-between" align="center">
              <Text fontWeight="bold">Updates</Text>
              {showVersion && (
                <Text fontSize="xs" color="gray.500">
                  Current version: {currentVersion}
                </Text>
              )}
            </Flex>
          </PopoverHeader>
          <PopoverBody>
            <Box>
              <Flex justify="space-between" align="center" mb={2}>
                <Badge colorScheme={getStatusColor()} px={2} py={1}>
                  {getStatusText()}
                </Badge>
                <Button
                  size="xs"
                  onClick={checkForUpdates}
                  isLoading={isChecking}
                  loadingText="Checking"
                >
                  Check
                </Button>
              </Flex>

              {isDownloading && progress && (
                <Box mt={2}>
                  <Progress
                    value={progress.percent}
                    size="sm"
                    colorScheme="blue"
                    mb={1}
                  />
                  <Flex justify="space-between" fontSize="xs">
                    <Text>{Math.round(progress.percent)}%</Text>
                    <Text>
                      {Math.round(progress.bytesPerSecond / 1024)} KB/s
                    </Text>
                  </Flex>
                </Box>
              )}

              {isUpdateAvailable && !isDownloading && (
                <Box mt={2}>
                  <Text fontSize="sm" mb={1}>
                    New version available: {updateInfo?.version}
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={downloadUpdate}
                    width="100%"
                  >
                    Download
                  </Button>
                </Box>
              )}

              {isUpdateReady && (
                <Box mt={2}>
                  <Text fontSize="sm" mb={1}>
                    Update ready to install
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={installUpdate}
                    width="100%"
                  >
                    Restart & Install
                  </Button>
                </Box>
              )}

              {status === UpdateStatus.ERROR && (
                <Box mt={2}>
                  <Text fontSize="sm" color="red.500">
                    {error}
                  </Text>
                </Box>
              )}
            </Box>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  }

  // Default render
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={2}>
        <Badge colorScheme={getStatusColor()} px={2} py={1}>
          {getStatusText()}
        </Badge>
        {showVersion && (
          <Text fontSize="xs" color="gray.500">
            Current version: {currentVersion}
          </Text>
        )}
      </Flex>

      {isDownloading && progress && (
        <Box mt={2}>
          <Progress
            value={progress.percent}
            size="sm"
            colorScheme="blue"
            mb={1}
          />
          <Flex justify="space-between" fontSize="xs">
            <Text>{Math.round(progress.percent)}%</Text>
            <Text>
              {Math.round(progress.bytesPerSecond / 1024)} KB/s
            </Text>
          </Flex>
        </Box>
      )}

      <Flex mt={2} gap={2}>
        <Button
          size="sm"
          onClick={checkForUpdates}
          isLoading={isChecking}
          loadingText="Checking"
        >
          Check for Updates
        </Button>

        {isUpdateAvailable && !isDownloading && (
          <Button
            size="sm"
            colorScheme="blue"
            onClick={downloadUpdate}
          >
            Download
          </Button>
        )}

        {isUpdateReady && (
          <Button
            size="sm"
            colorScheme="green"
            onClick={installUpdate}
          >
            Restart & Install
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default UpdaterStatus;
