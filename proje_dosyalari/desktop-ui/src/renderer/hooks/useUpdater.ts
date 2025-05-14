import { useState, useEffect, useCallback } from 'react';
import { UpdateDetails, UpdateStatus } from '../../main/services/UpdaterService';

// Declare electron global
declare global {
  interface Window {
    electron: {
      updater: {
        checkForUpdates: () => Promise<any>;
        downloadUpdate: () => Promise<void>;
        installUpdate: () => Promise<void>;
        getUpdateDetails: () => Promise<UpdateDetails>;
        onUpdateStatus: (callback: (details: UpdateDetails) => void) => () => void;
      };
      app: {
        getVersion: () => Promise<string>;
        restart: () => Promise<void>;
      };
    };
  }
}

/**
 * Updater hook result
 */
export interface UseUpdaterResult {
  /**
   * Current update status
   */
  status: UpdateStatus;
  /**
   * Update info
   */
  updateInfo: any;
  /**
   * Update progress
   */
  progress?: {
    percent: number;
    bytesPerSecond: number;
    total: number;
    transferred: number;
  };
  /**
   * Error message
   */
  error?: string;
  /**
   * Current app version
   */
  currentVersion: string;
  /**
   * Check for updates
   */
  checkForUpdates: () => Promise<void>;
  /**
   * Download update
   */
  downloadUpdate: () => Promise<void>;
  /**
   * Install update
   */
  installUpdate: () => Promise<void>;
  /**
   * Whether an update is available
   */
  isUpdateAvailable: boolean;
  /**
   * Whether an update is downloading
   */
  isDownloading: boolean;
  /**
   * Whether an update is ready to install
   */
  isUpdateReady: boolean;
  /**
   * Whether checking for updates
   */
  isChecking: boolean;
}

/**
 * Hook for using the updater
 * @returns Updater state and methods
 */
export const useUpdater = (): UseUpdaterResult => {
  const [updateDetails, setUpdateDetails] = useState<UpdateDetails>({ status: UpdateStatus.NOT_AVAILABLE });
  const [currentVersion, setCurrentVersion] = useState<string>('');

  // Get current version on mount
  useEffect(() => {
    window.electron.app.getVersion().then(setCurrentVersion);
  }, []);

  // Listen for update status changes
  useEffect(() => {
    const unsubscribe = window.electron.updater.onUpdateStatus((details) => {
      setUpdateDetails(details);
    });

    // Get initial update details
    window.electron.updater.getUpdateDetails().then(setUpdateDetails);

    return () => {
      unsubscribe();
    };
  }, []);

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    try {
      await window.electron.updater.checkForUpdates();
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }, []);

  // Download update
  const downloadUpdate = useCallback(async () => {
    try {
      await window.electron.updater.downloadUpdate();
    } catch (error) {
      console.error('Failed to download update:', error);
    }
  }, []);

  // Install update
  const installUpdate = useCallback(async () => {
    try {
      await window.electron.updater.installUpdate();
    } catch (error) {
      console.error('Failed to install update:', error);
    }
  }, []);

  // Derived state
  const isUpdateAvailable = updateDetails.status === UpdateStatus.AVAILABLE;
  const isDownloading = updateDetails.status === UpdateStatus.DOWNLOADING;
  const isUpdateReady = updateDetails.status === UpdateStatus.DOWNLOADED;
  const isChecking = updateDetails.status === UpdateStatus.CHECKING;

  return {
    status: updateDetails.status,
    updateInfo: updateDetails.info,
    progress: updateDetails.progress,
    error: updateDetails.error,
    currentVersion,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    isUpdateAvailable,
    isDownloading,
    isUpdateReady,
    isChecking,
  };
};

export default useUpdater;
