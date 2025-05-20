/**
 * Optimization utilities for the chat application
 */

/**
 * Memoize a function to cache its results
 * 
 * @param fn - Function to memoize
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * Debounce a function to limit how often it can be called
 * 
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle a function to limit how often it can be called
 * 
 * @param fn - Function to throttle
 * @param limit - Limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, limit: number): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= limit) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      lastCall = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, limit - (now - lastCall));
    }
  };
}

/**
 * Batch multiple function calls into a single call
 * 
 * @param fn - Function to batch
 * @param delay - Delay in milliseconds
 * @returns Batched function
 */
export function batch<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let batch: Parameters<T>[] = [];
  
  return (...args: Parameters<T>) => {
    batch.push(args);
    
    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        const currentBatch = [...batch];
        batch = [];
        timeoutId = null;
        
        fn(...currentBatch[currentBatch.length - 1]);
      }, delay);
    }
  };
}

/**
 * Create a function that caches the result of an async function
 * 
 * @param fn - Async function to cache
 * @param ttl - Time to live in milliseconds
 * @returns Cached function
 */
export function asyncCache<T extends (...args: any[]) => Promise<any>>(fn: T, ttl: number = 60000): T {
  const cache = new Map<string, { value: any; timestamp: number }>();
  
  return (async (...args: any[]) => {
    const key = JSON.stringify(args);
    const now = Date.now();
    
    if (cache.has(key)) {
      const cached = cache.get(key)!;
      
      if (now - cached.timestamp < ttl) {
        return cached.value;
      }
    }
    
    const result = await fn(...args);
    cache.set(key, { value: result, timestamp: now });
    
    return result;
  }) as T;
}

/**
 * Chunk an array into smaller arrays
 * 
 * @param array - Array to chunk
 * @param size - Chunk size
 * @returns Array of chunks
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  
  return chunks;
}

/**
 * Flatten a nested array
 * 
 * @param array - Array to flatten
 * @returns Flattened array
 */
export function flatten<T>(array: (T | T[])[]): T[] {
  return array.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), [] as T[]);
}

/**
 * Group an array of objects by a key
 * 
 * @param array - Array to group
 * @param key - Key to group by
 * @returns Grouped object
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const groupKey = String(item[key]);
    
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    
    acc[groupKey].push(item);
    
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Create a function that runs only once
 * 
 * @param fn - Function to run once
 * @returns Function that runs only once
 */
export function once<T extends (...args: any[]) => any>(fn: T): T {
  let called = false;
  let result: ReturnType<T>;
  
  return ((...args: any[]) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    
    return result;
  }) as T;
}

/**
 * Create a function that retries on failure
 * 
 * @param fn - Function to retry
 * @param retries - Number of retries
 * @param delay - Delay between retries in milliseconds
 * @returns Function that retries on failure
 */
export async function retry<T>(fn: () => Promise<T>, retries: number, delay: number): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return retry(fn, retries - 1, delay);
  }
}

/**
 * Create a function that times out after a specified time
 * 
 * @param fn - Function to timeout
 * @param timeout - Timeout in milliseconds
 * @returns Function that times out
 */
export async function withTimeout<T>(fn: () => Promise<T>, timeout: number): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), timeout);
    }),
  ]);
}

/**
 * Create a function that limits the number of concurrent executions
 * 
 * @param fn - Function to limit
 * @param concurrency - Maximum number of concurrent executions
 * @returns Function that limits concurrency
 */
export function limitConcurrency<T>(fn: (item: T) => Promise<any>, concurrency: number): (items: T[]) => Promise<any[]> {
  return async (items: T[]) => {
    const results: any[] = [];
    const executing: Promise<any>[] = [];
    
    for (const item of items) {
      const p = fn(item).then(result => {
        results.push(result);
        executing.splice(executing.indexOf(p), 1);
      });
      
      executing.push(p);
      
      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }
    
    await Promise.all(executing);
    
    return results;
  };
}

/**
 * Create a function that caches the result of a function in localStorage
 * 
 * @param fn - Function to cache
 * @param key - Cache key
 * @param ttl - Time to live in milliseconds
 * @returns Cached function
 */
export function localStorageCache<T extends (...args: any[]) => any>(fn: T, key: string, ttl: number = 60000): T {
  return ((...args: any[]) => {
    try {
      const cacheKey = `cache_${key}_${JSON.stringify(args)}`;
      const now = Date.now();
      
      // Check if cache exists and is valid
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const { value, timestamp } = JSON.parse(cachedData);
        
        if (now - timestamp < ttl) {
          return value;
        }
      }
      
      // Cache miss or expired, call the function
      const result = fn(...args);
      
      // Store the result in cache
      localStorage.setItem(cacheKey, JSON.stringify({ value: result, timestamp: now }));
      
      return result;
    } catch (error) {
      // If localStorage fails, just call the function
      return fn(...args);
    }
  }) as T;
}

/**
 * Create a function that measures the execution time of a function
 * 
 * @param fn - Function to measure
 * @param label - Label for the measurement
 * @returns Measured function
 */
export function measure<T extends (...args: any[]) => any>(fn: T, label: string): T {
  return ((...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    console.log(`${label}: ${end - start}ms`);
    
    return result;
  }) as T;
}

/**
 * Create a function that logs the arguments and result of a function
 * 
 * @param fn - Function to log
 * @param label - Label for the log
 * @returns Logged function
 */
export function log<T extends (...args: any[]) => any>(fn: T, label: string): T {
  return ((...args: any[]) => {
    console.log(`${label} args:`, args);
    
    const result = fn(...args);
    
    console.log(`${label} result:`, result);
    
    return result;
  }) as T;
}
