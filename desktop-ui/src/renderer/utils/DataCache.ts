/**
 * Options for the DataCache
 */
interface DataCacheOptions<T> {
  /**
   * The maximum number of items to store in the cache
   * @default 100
   */
  maxSize?: number;
  
  /**
   * The time-to-live for cache items in milliseconds
   * @default 5 minutes
   */
  ttl?: number;
  
  /**
   * A function to get a unique key for an item
   * @default item => item.id
   */
  getKey?: (item: T) => string;
  
  /**
   * Whether to enable debug logging
   * @default false
   */
  debug?: boolean;
}

/**
 * A cache item with metadata
 */
interface CacheItem<T> {
  /**
   * The cached data
   */
  data: T;
  
  /**
   * The timestamp when the item was added to the cache
   */
  timestamp: number;
  
  /**
   * The number of times the item has been accessed
   */
  accessCount: number;
}

/**
 * A cache for storing and retrieving data with LRU eviction policy
 */
export class DataCache<T> {
  private cache: Map<string, CacheItem<T>> = new Map();
  private maxSize: number;
  private ttl: number;
  private getKey: (item: T) => string;
  private debug: boolean;
  
  /**
   * Creates a new DataCache
   * @param options Options for the cache
   */
  constructor(options: DataCacheOptions<T> = {}) {
    this.maxSize = options.maxSize || 100;
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes
    this.getKey = options.getKey || ((item: any) => item.id);
    this.debug = options.debug || false;
  }
  
  /**
   * Gets an item from the cache
   * @param key The key of the item
   * @returns The item, or undefined if not found
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      this.logDebug(`Cache miss for key: ${key}`);
      return undefined;
    }
    
    // Check if the item has expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.logDebug(`Cache item expired for key: ${key}`);
      this.cache.delete(key);
      return undefined;
    }
    
    // Update access count
    item.accessCount++;
    this.logDebug(`Cache hit for key: ${key}, access count: ${item.accessCount}`);
    
    return item.data;
  }
  
  /**
   * Sets an item in the cache
   * @param item The item to cache
   * @returns The key of the cached item
   */
  set(item: T): string {
    // Evict items if the cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLeastRecentlyUsed();
    }
    
    const key = this.getKey(item);
    
    this.cache.set(key, {
      data: item,
      timestamp: Date.now(),
      accessCount: 0,
    });
    
    this.logDebug(`Cache set for key: ${key}`);
    
    return key;
  }
  
  /**
   * Checks if an item exists in the cache
   * @param key The key of the item
   * @returns Whether the item exists in the cache
   */
  has(key: string): boolean {
    const exists = this.cache.has(key);
    
    if (exists) {
      const item = this.cache.get(key)!;
      
      // Check if the item has expired
      if (Date.now() - item.timestamp > this.ttl) {
        this.logDebug(`Cache item expired for key: ${key}`);
        this.cache.delete(key);
        return false;
      }
    }
    
    return exists;
  }
  
  /**
   * Removes an item from the cache
   * @param key The key of the item
   * @returns Whether the item was removed
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.logDebug(`Cache delete for key: ${key}, success: ${deleted}`);
    return deleted;
  }
  
  /**
   * Clears the cache
   */
  clear(): void {
    this.cache.clear();
    this.logDebug('Cache cleared');
  }
  
  /**
   * Gets the number of items in the cache
   */
  get size(): number {
    return this.cache.size;
  }
  
  /**
   * Gets all keys in the cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
  
  /**
   * Gets all values in the cache
   */
  values(): T[] {
    return Array.from(this.cache.values()).map((item) => item.data);
  }
  
  /**
   * Gets all entries in the cache
   */
  entries(): [string, T][] {
    return Array.from(this.cache.entries()).map(([key, item]) => [key, item.data]);
  }
  
  /**
   * Evicts the least recently used item from the cache
   * @private
   */
  private evictLeastRecentlyUsed(): void {
    let lruKey: string | null = null;
    let lruAccessCount = Infinity;
    let lruTimestamp = Infinity;
    
    for (const [key, item] of this.cache.entries()) {
      // First, prioritize by access count
      if (item.accessCount < lruAccessCount) {
        lruKey = key;
        lruAccessCount = item.accessCount;
        lruTimestamp = item.timestamp;
      }
      // If access counts are equal, prioritize by timestamp
      else if (item.accessCount === lruAccessCount && item.timestamp < lruTimestamp) {
        lruKey = key;
        lruTimestamp = item.timestamp;
      }
    }
    
    if (lruKey) {
      this.logDebug(`Evicting least recently used item with key: ${lruKey}`);
      this.cache.delete(lruKey);
    }
  }
  
  /**
   * Logs a debug message
   * @param message The message to log
   * @private
   */
  private logDebug(message: string): void {
    if (this.debug) {
      console.log(`[DataCache] ${message}`);
    }
  }
}
