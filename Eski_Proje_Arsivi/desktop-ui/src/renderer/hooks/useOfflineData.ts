import { useState, useEffect, useCallback } from 'react';
import offlineDataManager, { OfflineDataItem } from '../services/OfflineDataManager';

/**
 * Offline data hook options
 */
export interface UseOfflineDataOptions<T> {
  /**
   * Item type
   */
  type: string;
  /**
   * Sync function
   */
  syncFunction?: (items: OfflineDataItem<T>[]) => Promise<{ [id: string]: 'success' | 'error' | 'retry' }>;
  /**
   * Whether to auto sync
   */
  autoSync?: boolean;
  /**
   * Auto sync interval in milliseconds
   */
  autoSyncInterval?: number;
}

/**
 * Offline data hook result
 */
export interface UseOfflineDataResult<T> {
  /**
   * Offline data items
   */
  items: OfflineDataItem<T>[];
  /**
   * Add offline data
   */
  add: (data: T, operation?: 'create' | 'update' | 'delete') => OfflineDataItem<T>;
  /**
   * Update offline data
   */
  update: (id: string, data: Partial<T>) => OfflineDataItem<T> | null;
  /**
   * Remove offline data
   */
  remove: (id: string) => OfflineDataItem<T> | null;
  /**
   * Sync offline data
   */
  sync: () => Promise<{ success: number; error: number; retry: number }>;
  /**
   * Clear all offline data
   */
  clear: () => void;
  /**
   * Whether sync is in progress
   */
  isSyncing: boolean;
  /**
   * Whether device is online
   */
  isOnline: boolean;
  /**
   * Last sync result
   */
  lastSyncResult: { success: number; error: number; retry: number } | null;
  /**
   * Last sync error
   */
  lastSyncError: Error | null;
}

/**
 * Hook for managing offline data
 * @param options Hook options
 * @returns Hook result
 */
export const useOfflineData = <T = any>(
  options: UseOfflineDataOptions<T>
): UseOfflineDataResult<T> => {
  const { type, syncFunction, autoSync = true, autoSyncInterval } = options;

  const [items, setItems] = useState<OfflineDataItem<T>[]>(offlineDataManager.getAll<T>(type));
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [lastSyncResult, setLastSyncResult] = useState<{ success: number; error: number; retry: number } | null>(null);
  const [lastSyncError, setLastSyncError] = useState<Error | null>(null);

  // Update items when offline data changes
  const updateItems = useCallback(() => {
    setItems(offlineDataManager.getAll<T>(type));
  }, [type]);

  // Add offline data
  const add = useCallback((data: T, operation: 'create' | 'update' | 'delete' = 'create'): OfflineDataItem<T> => {
    const item = offlineDataManager.add<T>(type, data, operation);
    updateItems();
    return item;
  }, [type, updateItems]);

  // Update offline data
  const update = useCallback((id: string, data: Partial<T>): OfflineDataItem<T> | null => {
    const item = offlineDataManager.update<T>(id, data);
    updateItems();
    return item;
  }, [updateItems]);

  // Remove offline data
  const remove = useCallback((id: string): OfflineDataItem<T> | null => {
    const item = offlineDataManager.remove(id) as OfflineDataItem<T> | null;
    updateItems();
    return item;
  }, [updateItems]);

  // Sync offline data
  const sync = useCallback(async (): Promise<{ success: number; error: number; retry: number }> => {
    if (!syncFunction || !isOnline) {
      return { success: 0, error: 0, retry: 0 };
    }

    setIsSyncing(true);
    setLastSyncError(null);

    try {
      const result = await offlineDataManager.sync<T>(syncFunction);
      setLastSyncResult(result);
      updateItems();
      return result;
    } catch (error) {
      setLastSyncError(error as Error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [syncFunction, isOnline, updateItems]);

  // Clear all offline data
  const clear = useCallback((): void => {
    offlineDataManager.clear();
    updateItems();
  }, [updateItems]);

  // Set up event listeners
  useEffect(() => {
    // Update items when offline data changes
    const handleAdd = () => updateItems();
    const handleUpdate = () => updateItems();
    const handleRemove = () => updateItems();
    const handleClear = () => updateItems();
    const handleStorageSync = () => updateItems();

    // Update sync status
    const handleSyncStart = () => setIsSyncing(true);
    const handleSyncComplete = (result: { success: number; error: number; retry: number }) => {
      setIsSyncing(false);
      setLastSyncResult(result);
    };
    const handleSyncError = (error: Error) => {
      setIsSyncing(false);
      setLastSyncError(error);
    };

    // Update online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Auto sync
    const handleAutoSyncTick = () => {
      if (autoSync && syncFunction && isOnline && !isSyncing) {
        sync().catch(console.error);
      }
    };

    // Add event listeners
    offlineDataManager.on('add', handleAdd);
    offlineDataManager.on('update', handleUpdate);
    offlineDataManager.on('remove', handleRemove);
    offlineDataManager.on('clear', handleClear);
    offlineDataManager.on('storageSync', handleStorageSync);
    offlineDataManager.on('syncStart', handleSyncStart);
    offlineDataManager.on('syncComplete', handleSyncComplete);
    offlineDataManager.on('syncError', handleSyncError);
    offlineDataManager.on('online', handleOnline);
    offlineDataManager.on('offline', handleOffline);
    offlineDataManager.on('autoSyncTick', handleAutoSyncTick);

    // Set up custom auto sync interval if provided
    let customSyncInterval: NodeJS.Timeout | null = null;
    if (autoSync && syncFunction && autoSyncInterval) {
      customSyncInterval = setInterval(() => {
        if (isOnline && !isSyncing) {
          sync().catch(console.error);
        }
      }, autoSyncInterval);
    }

    // Initial sync
    if (autoSync && syncFunction && isOnline) {
      sync().catch(console.error);
    }

    // Remove event listeners on cleanup
    return () => {
      offlineDataManager.off('add', handleAdd);
      offlineDataManager.off('update', handleUpdate);
      offlineDataManager.off('remove', handleRemove);
      offlineDataManager.off('clear', handleClear);
      offlineDataManager.off('storageSync', handleStorageSync);
      offlineDataManager.off('syncStart', handleSyncStart);
      offlineDataManager.off('syncComplete', handleSyncComplete);
      offlineDataManager.off('syncError', handleSyncError);
      offlineDataManager.off('online', handleOnline);
      offlineDataManager.off('offline', handleOffline);
      offlineDataManager.off('autoSyncTick', handleAutoSyncTick);

      if (customSyncInterval) {
        clearInterval(customSyncInterval);
      }
    };
  }, [type, syncFunction, autoSync, autoSyncInterval, isOnline, isSyncing, sync, updateItems]);

  return {
    items,
    add,
    update,
    remove,
    sync,
    clear,
    isSyncing,
    isOnline,
    lastSyncResult,
    lastSyncError,
  };
};

export default useOfflineData;
