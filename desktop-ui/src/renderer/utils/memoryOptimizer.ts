/**
 * Utilities for optimizing memory usage in the application
 */
import { memoryMonitor } from './memoryMonitor';
import { leakDetector } from './leakDetector';
import { dataStructureOptimizer } from './dataStructureOptimizer';
import { mediaOptimizer } from './mediaOptimizer';

/**
 * Options for memory optimization
 */
export interface MemoryOptimizationOptions {
  /**
   * Whether to enable debug logging
   * @default false
   */
  debug?: boolean;
  
  /**
   * Whether to enable automatic memory monitoring
   * @default false
   */
  enableMonitoring?: boolean;
  
  /**
   * The interval in milliseconds for automatic memory monitoring
   * @default 10000 (10 seconds)
   */
  monitoringInterval?: number;
  
  /**
   * Whether to enable automatic leak detection
   * @default false
   */
  enableLeakDetection?: boolean;
  
  /**
   * The interval in milliseconds for automatic leak detection
   * @default 30000 (30 seconds)
   */
  leakDetectionInterval?: number;
  
  /**
   * Whether to enable automatic garbage collection
   * @default false
   */
  enableAutoGC?: boolean;
  
  /**
   * The threshold for automatic garbage collection (percentage of heap size limit)
   * @default 0.8 (80%)
   */
  gcThreshold?: number;
}

/**
 * A class for optimizing memory usage in the application
 */
export class MemoryOptimizer {
  private options: Required<MemoryOptimizationOptions>;
  private isInitialized = false;
  
  /**
   * Creates a new MemoryOptimizer
   * @param options Options for memory optimization
   */
  constructor(options: MemoryOptimizationOptions = {}) {
    this.options = {
      debug: options.debug ?? false,
      enableMonitoring: options.enableMonitoring ?? false,
      monitoringInterval: options.monitoringInterval ?? 10000,
      enableLeakDetection: options.enableLeakDetection ?? false,
      leakDetectionInterval: options.leakDetectionInterval ?? 30000,
      enableAutoGC: options.enableAutoGC ?? false,
      gcThreshold: options.gcThreshold ?? 0.8,
    };
  }
  
  /**
   * Initializes memory optimization
   */
  initialize(): void {
    if (this.isInitialized) {
      this.logDebug('Memory optimizer is already initialized');
      return;
    }
    
    this.logDebug('Initializing memory optimizer');
    
    // Initialize memory monitoring
    if (this.options.enableMonitoring) {
      memoryMonitor.startTracking(this.options.monitoringInterval);
    }
    
    // Initialize leak detection
    if (this.options.enableLeakDetection) {
      leakDetector.startChecking(this.options.leakDetectionInterval);
    }
    
    // Add event listeners for low memory situations
    this.addLowMemoryListeners();
    
    this.isInitialized = true;
  }
  
  /**
   * Shuts down memory optimization
   */
  shutdown(): void {
    if (!this.isInitialized) {
      this.logDebug('Memory optimizer is not initialized');
      return;
    }
    
    this.logDebug('Shutting down memory optimizer');
    
    // Stop memory monitoring
    memoryMonitor.stopTracking();
    
    // Stop leak detection
    leakDetector.stopChecking();
    
    // Remove event listeners
    this.removeLowMemoryListeners();
    
    this.isInitialized = false;
  }
  
  /**
   * Optimizes memory usage
   * @returns A promise that resolves when optimization is complete
   */
  async optimizeMemory(): Promise<void> {
    this.logDebug('Optimizing memory usage');
    
    // Take a memory snapshot before optimization
    const beforeSnapshot = memoryMonitor.takeSnapshot('Before optimization');
    
    // Clear caches
    this.clearCaches();
    
    // Trigger garbage collection
    this.triggerGarbageCollection();
    
    // Take a memory snapshot after optimization
    const afterSnapshot = memoryMonitor.takeSnapshot('After optimization');
    
    // Log memory usage reduction
    if (beforeSnapshot && afterSnapshot) {
      const reduction = beforeSnapshot.usedJSHeapSize - afterSnapshot.usedJSHeapSize;
      const reductionMB = Math.round(reduction / (1024 * 1024));
      this.logDebug(`Memory usage reduced by ${reductionMB} MB`);
    }
  }
  
  /**
   * Optimizes a React component to reduce memory usage
   * @param Component The component to optimize
   * @param options Options for optimization
   * @returns An optimized component
   */
  optimizeReactComponent<P>(
    Component: React.ComponentType<P>,
    options: {
      memoize?: boolean;
      trackProps?: boolean;
      trackRenders?: boolean;
      name?: string;
    } = {}
  ): React.ComponentType<P> {
    const { memoize = true, trackProps = false, trackRenders = false, name = Component.displayName || Component.name || 'Component' } = options;
    
    // Create a wrapper component
    const OptimizedComponent = (props: P) => {
      // Track props if enabled
      if (trackProps) {
        leakDetector.trackObject(props, `${name} props`, false);
      }
      
      // Track renders if enabled
      if (trackRenders) {
        const renderCount = React.useRef(0);
        renderCount.current++;
        this.logDebug(`${name} render #${renderCount.current}`);
      }
      
      return React.createElement(Component, props);
    };
    
    OptimizedComponent.displayName = `Optimized(${name})`;
    
    // Memoize the component if enabled
    return memoize ? React.memo(OptimizedComponent) : OptimizedComponent;
  }
  
  /**
   * Optimizes an image for memory efficiency
   * @param imageSource The image source
   * @param options Options for optimization
   * @returns A promise that resolves to an optimized image blob
   */
  async optimizeImage(
    imageSource: string | File | Blob | HTMLImageElement,
    options: Parameters<typeof mediaOptimizer.optimizeImage>[1] = {}
  ): Promise<Blob> {
    return mediaOptimizer.optimizeImage(imageSource, options);
  }
  
  /**
   * Optimizes a data structure for memory efficiency
   * @param data The data to optimize
   * @returns Optimized data
   */
  optimizeData<T>(data: T): T {
    if (Array.isArray(data)) {
      return dataStructureOptimizer.optimizeArray(data, {
        removeDuplicates: true,
        compact: true,
      }) as unknown as T;
    } else if (typeof data === 'object' && data !== null) {
      return dataStructureOptimizer.optimizeObject(data as Record<string, any>, {
        removeNullish: true,
        removeEmpty: true,
      }) as unknown as T;
    }
    
    return data;
  }
  
  /**
   * Disposes of resources to prevent memory leaks
   * @param resource The resource to dispose
   */
  disposeResource(resource: any): void {
    if (!resource) {
      return;
    }
    
    // Handle different types of resources
    if (typeof resource.dispose === 'function') {
      // Resource has a dispose method
      resource.dispose();
    } else if (typeof resource.destroy === 'function') {
      // Resource has a destroy method
      resource.destroy();
    } else if (typeof resource.close === 'function') {
      // Resource has a close method
      resource.close();
    } else if (typeof resource.release === 'function') {
      // Resource has a release method
      resource.release();
    } else if (resource instanceof HTMLElement) {
      // Remove event listeners and references
      this.cleanupElement(resource);
    } else if (Array.isArray(resource)) {
      // Dispose each item in the array
      resource.forEach((item) => this.disposeResource(item));
    } else if (typeof resource === 'object' && resource !== null) {
      // Dispose each property in the object
      Object.values(resource).forEach((value) => this.disposeResource(value));
    }
  }
  
  /**
   * Gets memory usage statistics
   * @returns Memory usage statistics
   */
  getMemoryStats(): Record<string, any> {
    const memoryUsage = memoryMonitor.getMemoryUsage();
    
    if (!memoryUsage) {
      return {
        available: false,
        message: 'Memory API is not available',
      };
    }
    
    const { totalJSHeapSize, usedJSHeapSize, jsHeapSizeLimit } = memoryUsage;
    
    return {
      available: true,
      totalHeapSize: this.formatBytes(totalJSHeapSize),
      usedHeapSize: this.formatBytes(usedJSHeapSize),
      heapSizeLimit: this.formatBytes(jsHeapSizeLimit),
      usagePercentage: Math.round((usedJSHeapSize / jsHeapSizeLimit) * 100),
      freeHeapSize: this.formatBytes(jsHeapSizeLimit - usedJSHeapSize),
      timestamp: new Date().toISOString(),
    };
  }
  
  /**
   * Adds event listeners for low memory situations
   * @private
   */
  private addLowMemoryListeners(): void {
    if (typeof window !== 'undefined') {
      // Listen for beforeunload to clean up resources
      window.addEventListener('beforeunload', this.handleBeforeUnload);
      
      // Listen for visibilitychange to optimize memory when tab is hidden
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      
      // Listen for low memory events (Chrome only)
      if ('onlowmemory' in window) {
        (window as any).addEventListener('lowmemory', this.handleLowMemory);
      }
    }
  }
  
  /**
   * Removes event listeners for low memory situations
   * @private
   */
  private removeLowMemoryListeners(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      
      if ('onlowmemory' in window) {
        (window as any).removeEventListener('lowmemory', this.handleLowMemory);
      }
    }
  }
  
  /**
   * Handles the beforeunload event
   * @private
   */
  private handleBeforeUnload = (): void => {
    this.logDebug('beforeunload event detected, cleaning up resources');
    this.clearCaches();
  };
  
  /**
   * Handles the visibilitychange event
   * @private
   */
  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') {
      this.logDebug('Tab hidden, optimizing memory usage');
      this.optimizeMemory();
    }
  };
  
  /**
   * Handles the lowmemory event
   * @private
   */
  private handleLowMemory = (): void => {
    this.logDebug('Low memory event detected, optimizing memory usage');
    this.optimizeMemory();
  };
  
  /**
   * Clears browser caches
   * @private
   */
  private clearCaches(): void {
    // Clear memory cache
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName);
        });
      });
    }
    
    // Clear session storage
    if ('sessionStorage' in window) {
      sessionStorage.clear();
    }
    
    // Clear IndexedDB
    if ('indexedDB' in window) {
      indexedDB.databases().then((databases) => {
        databases.forEach((database) => {
          if (database.name) {
            indexedDB.deleteDatabase(database.name);
          }
        });
      });
    }
  }
  
  /**
   * Triggers garbage collection
   * @private
   */
  private triggerGarbageCollection(): void {
    if (typeof window.gc === 'function') {
      try {
        window.gc();
        this.logDebug('Garbage collection triggered');
      } catch (error) {
        this.logDebug(`Failed to trigger garbage collection: ${error}`);
      }
    } else {
      this.logDebug('Garbage collection is not available');
    }
  }
  
  /**
   * Cleans up an HTML element
   * @param element The element to clean up
   * @private
   */
  private cleanupElement(element: HTMLElement): void {
    // Remove all event listeners
    const clone = element.cloneNode(false) as HTMLElement;
    element.parentNode?.replaceChild(clone, element);
    
    // Remove all children
    while (clone.firstChild) {
      clone.removeChild(clone.firstChild);
    }
  }
  
  /**
   * Formats bytes to a human-readable string
   * @param bytes The number of bytes
   * @returns A human-readable string
   * @private
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
  
  /**
   * Logs a debug message
   * @param message The message to log
   * @private
   */
  private logDebug(message: string): void {
    if (this.options.debug) {
      console.log(`[MemoryOptimizer] ${message}`);
    }
  }
}

// Create a singleton instance
export const memoryOptimizer = new MemoryOptimizer();

// Add global access for debugging
if (typeof window !== 'undefined') {
  (window as any).__memoryOptimizer = memoryOptimizer;
}

export default memoryOptimizer;
