/**
 * Utilities for optimizing data structures to reduce memory usage
 */

/**
 * Options for optimizing arrays
 */
export interface ArrayOptimizationOptions {
  /**
   * Whether to remove duplicate items
   * @default false
   */
  removeDuplicates?: boolean;
  
  /**
   * Whether to compact the array (remove null and undefined values)
   * @default false
   */
  compact?: boolean;
  
  /**
   * Whether to flatten nested arrays
   * @default false
   */
  flatten?: boolean;
  
  /**
   * The maximum depth for flattening
   * @default Infinity
   */
  flattenDepth?: number;
  
  /**
   * A function to get a unique key for an item (for removing duplicates)
   * @default item => item
   */
  getKey?: (item: any) => any;
}

/**
 * Options for optimizing objects
 */
export interface ObjectOptimizationOptions {
  /**
   * Whether to remove null and undefined properties
   * @default false
   */
  removeNullish?: boolean;
  
  /**
   * Whether to remove empty objects and arrays
   * @default false
   */
  removeEmpty?: boolean;
  
  /**
   * Properties to exclude from optimization
   * @default []
   */
  exclude?: string[];
  
  /**
   * Whether to optimize nested objects
   * @default true
   */
  deep?: boolean;
  
  /**
   * The maximum depth for deep optimization
   * @default Infinity
   */
  maxDepth?: number;
}

/**
 * A class for optimizing data structures
 */
export class DataStructureOptimizer {
  /**
   * Optimizes an array to reduce memory usage
   * @param array The array to optimize
   * @param options Options for optimization
   * @returns An optimized copy of the array
   */
  optimizeArray<T>(array: T[], options: ArrayOptimizationOptions = {}): T[] {
    const {
      removeDuplicates = false,
      compact = false,
      flatten = false,
      flattenDepth = Infinity,
      getKey = (item) => item,
    } = options;
    
    let result = [...array];
    
    // Flatten nested arrays
    if (flatten) {
      result = this.flattenArray(result, flattenDepth) as T[];
    }
    
    // Remove null and undefined values
    if (compact) {
      result = result.filter((item) => item != null);
    }
    
    // Remove duplicate items
    if (removeDuplicates) {
      result = this.removeDuplicates(result, getKey);
    }
    
    return result;
  }
  
  /**
   * Optimizes an object to reduce memory usage
   * @param obj The object to optimize
   * @param options Options for optimization
   * @returns An optimized copy of the object
   */
  optimizeObject<T extends Record<string, any>>(
    obj: T,
    options: ObjectOptimizationOptions = {}
  ): Partial<T> {
    const {
      removeNullish = false,
      removeEmpty = false,
      exclude = [],
      deep = true,
      maxDepth = Infinity,
    } = options;
    
    return this.optimizeObjectInternal(obj, {
      removeNullish,
      removeEmpty,
      exclude,
      deep,
      maxDepth,
      currentDepth: 0,
    }) as Partial<T>;
  }
  
  /**
   * Optimizes a large dataset by chunking it
   * @param data The data to optimize
   * @param chunkSize The size of each chunk
   * @returns An object with methods for accessing the chunked data
   */
  optimizeLargeDataset<T>(data: T[], chunkSize: number = 100): {
    getChunk: (index: number) => T[];
    getItem: (index: number) => T | undefined;
    getTotalChunks: () => number;
    getTotalItems: () => number;
  } {
    const chunks: T[][] = [];
    const totalItems = data.length;
    
    // Split the data into chunks
    for (let i = 0; i < totalItems; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    
    return {
      getChunk: (index: number) => chunks[index] || [],
      getItem: (index: number) => {
        const chunkIndex = Math.floor(index / chunkSize);
        const itemIndex = index % chunkSize;
        return chunks[chunkIndex]?.[itemIndex];
      },
      getTotalChunks: () => chunks.length,
      getTotalItems: () => totalItems,
    };
  }
  
  /**
   * Creates a memory-efficient version of a large object by using getters
   * @param obj The object to optimize
   * @returns A memory-efficient version of the object
   */
  createLazyObject<T extends Record<string, any>>(obj: T): T {
    const result = {} as T;
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        Object.defineProperty(result, key, {
          get: () => obj[key],
          enumerable: true,
          configurable: true,
        });
      }
    }
    
    return result;
  }
  
  /**
   * Creates a memory-efficient version of a function that generates large data
   * @param generator A function that generates data
   * @returns A function that returns a lazy iterator for the generated data
   */
  createLazyGenerator<T, Args extends any[]>(
    generator: (...args: Args) => T[]
  ): (...args: Args) => IterableIterator<T> {
    return function* (...args: Args): IterableIterator<T> {
      const data = generator(...args);
      for (const item of data) {
        yield item;
      }
    };
  }
  
  /**
   * Optimizes a string to reduce memory usage
   * @param str The string to optimize
   * @param options Options for optimization
   * @returns An optimized version of the string
   */
  optimizeString(
    str: string,
    options: {
      trim?: boolean;
      removeExtraSpaces?: boolean;
      truncate?: boolean;
      maxLength?: number;
    } = {}
  ): string {
    const {
      trim = false,
      removeExtraSpaces = false,
      truncate = false,
      maxLength = 100,
    } = options;
    
    let result = str;
    
    if (trim) {
      result = result.trim();
    }
    
    if (removeExtraSpaces) {
      result = result.replace(/\s+/g, ' ');
    }
    
    if (truncate && result.length > maxLength) {
      result = result.slice(0, maxLength);
    }
    
    return result;
  }
  
  /**
   * Removes duplicate items from an array
   * @param array The array to process
   * @param getKey A function to get a unique key for an item
   * @returns A new array without duplicates
   * @private
   */
  private removeDuplicates<T>(array: T[], getKey: (item: T) => any): T[] {
    const seen = new Set();
    return array.filter((item) => {
      const key = getKey(item);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
  
  /**
   * Flattens a nested array
   * @param array The array to flatten
   * @param depth The maximum depth to flatten
   * @returns A flattened array
   * @private
   */
  private flattenArray(array: any[], depth: number): any[] {
    if (depth <= 0) {
      return array;
    }
    
    return array.reduce((result, item) => {
      if (Array.isArray(item)) {
        return result.concat(this.flattenArray(item, depth - 1));
      }
      return result.concat(item);
    }, []);
  }
  
  /**
   * Optimizes an object internally
   * @param obj The object to optimize
   * @param options Options for optimization
   * @returns An optimized copy of the object
   * @private
   */
  private optimizeObjectInternal(
    obj: Record<string, any>,
    options: ObjectOptimizationOptions & { currentDepth: number }
  ): Record<string, any> {
    const {
      removeNullish,
      removeEmpty,
      exclude,
      deep,
      maxDepth,
      currentDepth,
    } = options;
    
    if (currentDepth > maxDepth) {
      return obj;
    }
    
    const result: Record<string, any> = {};
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Skip excluded properties
        if (exclude.includes(key)) {
          result[key] = obj[key];
          continue;
        }
        
        const value = obj[key];
        
        // Skip null and undefined values if removeNullish is true
        if (removeNullish && value == null) {
          continue;
        }
        
        // Skip empty objects and arrays if removeEmpty is true
        if (removeEmpty) {
          if (
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && value !== null && Object.keys(value).length === 0)
          ) {
            continue;
          }
        }
        
        // Optimize nested objects and arrays if deep is true
        if (deep && typeof value === 'object' && value !== null) {
          if (Array.isArray(value)) {
            result[key] = value.map((item) => {
              if (typeof item === 'object' && item !== null) {
                return this.optimizeObjectInternal(item, {
                  ...options,
                  currentDepth: currentDepth + 1,
                });
              }
              return item;
            });
          } else {
            result[key] = this.optimizeObjectInternal(value, {
              ...options,
              currentDepth: currentDepth + 1,
            });
          }
        } else {
          result[key] = value;
        }
      }
    }
    
    return result;
  }
}

// Create a singleton instance
export const dataStructureOptimizer = new DataStructureOptimizer();

export default dataStructureOptimizer;
