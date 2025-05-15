import { EventEmitter } from 'events';
import cacheService from './CacheService';

/**
 * Offline data item
 */
export interface OfflineDataItem<T> {
  /**
   * Item ID
   */
  id: string;
  /**
   * Item data
   */
  data: T;
  /**
   * Item type
   */
  type: string;
  /**
   * Created timestamp
   */
  createdAt: number;
  /**
   * Updated timestamp
   */
  updatedAt: number;
  /**
   * Sync status
   */
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  /**
   * Sync error
   */
  syncError?: string;
  /**
   * Operation type
   */
  operation: 'create' | 'update' | 'delete';
  /**
   * Retry count
   */
  retryCount: number;
}

/**
 * Offline data manager options
 */
export interface OfflineDataManagerOptions {
  /**
   * Storage key
   */
  storageKey?: string;
  /**
   * Maximum retry count
   */
  maxRetryCount?: number;
  /**
   * Sync interval in milliseconds
   */
  syncInterval?: number;
  /**
   * Whether to auto sync
   */
  autoSync?: boolean;
}

/**
 * Default offline data manager options
 */
const DEFAULT_OPTIONS: OfflineDataManagerOptions = {
  storageKey: 'alt_las_offline_data',
  maxRetryCount: 5,
  syncInterval: 60000, // 1 minute
  autoSync: true,
};

/**
 * Offline data manager
 */
class OfflineDataManager extends EventEmitter {
  private options: Required<OfflineDataManagerOptions>;
  private offlineData: Map<string, OfflineDataItem<any>> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing: boolean = false;
  private isOnline: boolean = navigator.onLine;

  /**
   * Constructor
   * @param options Offline data manager options
   */
  constructor(options: OfflineDataManagerOptions = {}) {
    super();
    this.options = { ...DEFAULT_OPTIONS, ...options } as Required<OfflineDataManagerOptions>;
    this.loadFromStorage();
    this.setupEventListeners();

    // Start auto sync if enabled
    if (this.options.autoSync) {
      this.startAutoSync();
    }
  }

  /**
   * Add offline data
   * @param type Item type
   * @param data Item data
   * @param operation Operation type
   * @returns Offline data item
   */
  public add<T>(type: string, data: T, operation: 'create' | 'update' | 'delete' = 'create'): OfflineDataItem<T> {
    const id = this.generateId();
    const now = Date.now();

    const item: OfflineDataItem<T> = {
      id,
      data,
      type,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
      operation,
      retryCount: 0,
    };

    this.offlineData.set(id, item);
    this.saveToStorage();
    this.emit('add', item);

    return item;
  }

  /**
   * Update offline data
   * @param id Item ID
   * @param data Item data
   * @returns Updated offline data item
   */
  public update<T>(id: string, data: Partial<T>): OfflineDataItem<T> | null {
    const item = this.offlineData.get(id) as OfflineDataItem<T> | undefined;
    if (!item) {
      return null;
    }

    const updatedItem: OfflineDataItem<T> = {
      ...item,
      data: { ...item.data, ...data },
      updatedAt: Date.now(),
      syncStatus: 'pending',
    };

    this.offlineData.set(id, updatedItem);
    this.saveToStorage();
    this.emit('update', updatedItem);

    return updatedItem;
  }

  /**
   * Remove offline data
   * @param id Item ID
   * @returns Removed offline data item
   */
  public remove(id: string): OfflineDataItem<any> | null {
    const item = this.offlineData.get(id);
    if (!item) {
      return null;
    }

    this.offlineData.delete(id);
    this.saveToStorage();
    this.emit('remove', item);

    return item;
  }

  /**
   * Get offline data
   * @param id Item ID
   * @returns Offline data item
   */
  public get<T>(id: string): OfflineDataItem<T> | null {
    return this.offlineData.get(id) as OfflineDataItem<T> | null;
  }

  /**
   * Get all offline data
   * @param type Item type
   * @returns Offline data items
   */
  public getAll<T>(type?: string): OfflineDataItem<T>[] {
    const items = Array.from(this.offlineData.values()) as OfflineDataItem<T>[];
    return type ? items.filter(item => item.type === type) : items;
  }

  /**
   * Get pending offline data
   * @param type Item type
   * @returns Pending offline data items
   */
  public getPending<T>(type?: string): OfflineDataItem<T>[] {
    const items = Array.from(this.offlineData.values()) as OfflineDataItem<T>[];
    return items.filter(item => 
      item.syncStatus === 'pending' && 
      (type ? item.type === type : true)
    );
  }

  /**
   * Sync offline data
   * @param syncFunction Sync function
   * @returns Promise with sync results
   */
  public async sync<T>(
    syncFunction: (items: OfflineDataItem<T>[]) => Promise<{ [id: string]: 'success' | 'error' | 'retry' }>
  ): Promise<{ success: number; error: number; retry: number }> {
    if (this.isSyncing || !this.isOnline) {
      return { success: 0, error: 0, retry: 0 };
    }

    this.isSyncing = true;
    this.emit('syncStart');

    try {
      // Get pending items
      const pendingItems = this.getPending<T>();
      if (pendingItems.length === 0) {
        this.isSyncing = false;
        this.emit('syncComplete', { success: 0, error: 0, retry: 0 });
        return { success: 0, error: 0, retry: 0 };
      }

      // Sync items
      const results = await syncFunction(pendingItems);
      let success = 0;
      let error = 0;
      let retry = 0;

      // Process results
      Object.entries(results).forEach(([id, result]) => {
        const item = this.offlineData.get(id);
        if (!item) return;

        if (result === 'success') {
          // Remove successfully synced items
          this.offlineData.delete(id);
          success++;
        } else if (result === 'error') {
          // Mark as error
          item.syncStatus = 'error';
          item.retryCount++;
          error++;

          // Remove if max retry count reached
          if (item.retryCount >= this.options.maxRetryCount) {
            this.offlineData.delete(id);
          }
        } else if (result === 'retry') {
          // Mark for retry
          item.syncStatus = 'pending';
          item.retryCount++;
          retry++;
        }
      });

      this.saveToStorage();
      this.isSyncing = false;
      this.emit('syncComplete', { success, error, retry });
      return { success, error, retry };
    } catch (error) {
      this.isSyncing = false;
      this.emit('syncError', error);
      throw error;
    }
  }

  /**
   * Start auto sync
   */
  public startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.emit('autoSyncTick');
    }, this.options.syncInterval);
  }

  /**
   * Stop auto sync
   */
  public stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Clear all offline data
   */
  public clear(): void {
    this.offlineData.clear();
    this.saveToStorage();
    this.emit('clear');
  }

  /**
   * Load from storage
   */
  private loadFromStorage(): void {
    try {
      const storedData = localStorage.getItem(this.options.storageKey);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        
        // Convert to Map
        Object.entries(parsedData).forEach(([id, item]) => {
          this.offlineData.set(id, item as OfflineDataItem<any>);
        });
      }
    } catch (error) {
      console.error('Failed to load offline data from localStorage:', error);
    }
  }

  /**
   * Save to storage
   */
  private saveToStorage(): void {
    try {
      // Convert Map to object
      const dataObject: Record<string, OfflineDataItem<any>> = {};
      this.offlineData.forEach((value, key) => {
        dataObject[key] = value;
      });
      
      localStorage.setItem(this.options.storageKey, JSON.stringify(dataObject));
    } catch (error) {
      console.error('Failed to save offline data to localStorage:', error);
    }
  }

  /**
   * Generate ID
   * @returns Generated ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('offline');
    });

    // Storage event for cross-tab synchronization
    window.addEventListener('storage', (event) => {
      if (event.key === this.options.storageKey) {
        this.loadFromStorage();
        this.emit('storageSync');
      }
    });
  }
}

// Create singleton instance
const offlineDataManager = new OfflineDataManager();

export default offlineDataManager;
