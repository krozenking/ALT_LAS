/**
 * Cache item interface
 */
export interface CacheItem<T> {
  /**
   * Cached data
   */
  data: T;
  /**
   * Expiration timestamp
   */
  expiry: number;
  /**
   * Last updated timestamp
   */
  lastUpdated: number;
  /**
   * Cache tags for invalidation
   */
  tags?: string[];
}

/**
 * Cache options interface
 */
export interface CacheOptions {
  /**
   * Time to live in milliseconds
   */
  ttl?: number;
  /**
   * Cache tags for invalidation
   */
  tags?: string[];
  /**
   * Whether to persist in localStorage
   */
  persist?: boolean;
  /**
   * Whether to update the expiry on get
   */
  updateExpiryOnGet?: boolean;
  /**
   * Maximum size of the cache in bytes (for localStorage only)
   */
  maxSize?: number;
}

/**
 * Default cache options
 */
const DEFAULT_OPTIONS: CacheOptions = {
  ttl: 5 * 60 * 1000, // 5 minutes
  tags: [],
  persist: false,
  updateExpiryOnGet: false,
  maxSize: 5 * 1024 * 1024, // 5MB
};

/**
 * Cache service for storing and retrieving data
 */
class CacheService {
  private memoryCache: Map<string, CacheItem<any>> = new Map();
  private persistenceKey = 'alt_las_cache';
  private maxSize: number = DEFAULT_OPTIONS.maxSize!;

  /**
   * Constructor
   */
  constructor() {
    this.loadFromStorage();
    this.setupStorageListener();
  }

  /**
   * Set cache item
   * @param key Cache key
   * @param data Data to cache
   * @param options Cache options
   */
  public set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const now = Date.now();
    const expiry = now + opts.ttl!;

    const cacheItem: CacheItem<T> = {
      data,
      expiry,
      lastUpdated: now,
      tags: opts.tags,
    };

    // Store in memory cache
    this.memoryCache.set(key, cacheItem);

    // Store in localStorage if persist is true
    if (opts.persist) {
      this.saveToStorage();
    }
  }

  /**
   * Get cache item
   * @param key Cache key
   * @param options Cache options
   * @returns Cached data or null if not found or expired
   */
  public get<T>(key: string, options: CacheOptions = {}): T | null {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const cacheItem = this.memoryCache.get(key) as CacheItem<T> | undefined;

    // Return null if not found
    if (!cacheItem) {
      return null;
    }

    const now = Date.now();

    // Return null if expired
    if (cacheItem.expiry < now) {
      this.remove(key);
      return null;
    }

    // Update expiry if updateExpiryOnGet is true
    if (opts.updateExpiryOnGet) {
      cacheItem.expiry = now + opts.ttl!;
      this.memoryCache.set(key, cacheItem);

      // Update in localStorage if persist is true
      if (opts.persist) {
        this.saveToStorage();
      }
    }

    return cacheItem.data;
  }

  /**
   * Remove cache item
   * @param key Cache key
   */
  public remove(key: string): void {
    this.memoryCache.delete(key);
    this.saveToStorage();
  }

  /**
   * Clear all cache items
   */
  public clear(): void {
    this.memoryCache.clear();
    this.saveToStorage();
  }

  /**
   * Invalidate cache items by tags
   * @param tags Tags to invalidate
   */
  public invalidateByTags(tags: string[]): void {
    if (!tags || tags.length === 0) {
      return;
    }

    const keysToRemove: string[] = [];

    // Find keys to remove
    this.memoryCache.forEach((item, key) => {
      if (item.tags && item.tags.some(tag => tags.includes(tag))) {
        keysToRemove.push(key);
      }
    });

    // Remove keys
    keysToRemove.forEach(key => {
      this.memoryCache.delete(key);
    });

    // Update localStorage
    this.saveToStorage();
  }

  /**
   * Check if cache item exists and is not expired
   * @param key Cache key
   * @returns True if cache item exists and is not expired
   */
  public has(key: string): boolean {
    const cacheItem = this.memoryCache.get(key);
    if (!cacheItem) {
      return false;
    }

    return cacheItem.expiry >= Date.now();
  }

  /**
   * Get cache item metadata
   * @param key Cache key
   * @returns Cache item metadata or null if not found
   */
  public getMetadata(key: string): Omit<CacheItem<any>, 'data'> | null {
    const cacheItem = this.memoryCache.get(key);
    if (!cacheItem) {
      return null;
    }

    const { data, ...metadata } = cacheItem;
    return metadata;
  }

  /**
   * Get all cache keys
   * @returns Array of cache keys
   */
  public keys(): string[] {
    return Array.from(this.memoryCache.keys());
  }

  /**
   * Get cache size
   * @returns Number of cache items
   */
  public size(): number {
    return this.memoryCache.size;
  }

  /**
   * Set maximum cache size
   * @param size Maximum size in bytes
   */
  public setMaxSize(size: number): void {
    this.maxSize = size;
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const storedCache = localStorage.getItem(this.persistenceKey);
      if (storedCache) {
        const parsedCache = JSON.parse(storedCache);
        
        // Convert to Map
        Object.keys(parsedCache).forEach(key => {
          this.memoryCache.set(key, parsedCache[key]);
        });
        
        // Clean expired items
        this.cleanExpired();
      }
    } catch (error) {
      console.error('Failed to load cache from localStorage:', error);
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    try {
      // Convert Map to object
      const cacheObject: Record<string, CacheItem<any>> = {};
      this.memoryCache.forEach((value, key) => {
        cacheObject[key] = value;
      });
      
      const serialized = JSON.stringify(cacheObject);
      
      // Check size
      if (serialized.length > this.maxSize) {
        console.warn(`Cache size exceeds maximum size (${serialized.length} > ${this.maxSize}). Trimming oldest items.`);
        this.trimCache(serialized.length);
        return;
      }
      
      localStorage.setItem(this.persistenceKey, serialized);
    } catch (error) {
      console.error('Failed to save cache to localStorage:', error);
    }
  }

  /**
   * Clean expired items
   */
  private cleanExpired(): void {
    const now = Date.now();
    const keysToRemove: string[] = [];

    this.memoryCache.forEach((item, key) => {
      if (item.expiry < now) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => {
      this.memoryCache.delete(key);
    });

    if (keysToRemove.length > 0) {
      this.saveToStorage();
    }
  }

  /**
   * Trim cache to fit within maximum size
   * @param currentSize Current size in bytes
   */
  private trimCache(currentSize: number): void {
    // Sort items by lastUpdated
    const items = Array.from(this.memoryCache.entries())
      .sort((a, b) => a[1].lastUpdated - b[1].lastUpdated);
    
    let sizeToRemove = currentSize - this.maxSize;
    
    // Remove oldest items until we're under the limit
    while (sizeToRemove > 0 && items.length > 0) {
      const [key, item] = items.shift()!;
      const itemSize = JSON.stringify(item).length;
      this.memoryCache.delete(key);
      sizeToRemove -= itemSize;
    }
    
    this.saveToStorage();
  }

  /**
   * Setup storage event listener for cross-tab synchronization
   */
  private setupStorageListener(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === this.persistenceKey) {
        this.loadFromStorage();
      }
    });
  }
}

// Create singleton instance
const cacheService = new CacheService();

export default cacheService;
