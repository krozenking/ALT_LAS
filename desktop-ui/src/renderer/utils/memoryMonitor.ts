/**
 * Memory monitoring and optimization utilities
 */

/**
 * Memory usage information
 */
export interface MemoryUsage {
  /**
   * Total JavaScript heap size in bytes
   */
  totalJSHeapSize: number;
  
  /**
   * Used JavaScript heap size in bytes
   */
  usedJSHeapSize: number;
  
  /**
   * JavaScript heap size limit in bytes
   */
  jsHeapSizeLimit: number;
  
  /**
   * Timestamp when the memory usage was measured
   */
  timestamp: number;
}

/**
 * Memory snapshot with additional information
 */
export interface MemorySnapshot extends MemoryUsage {
  /**
   * Unique ID for the snapshot
   */
  id: string;
  
  /**
   * Label for the snapshot
   */
  label: string;
  
  /**
   * Additional metadata for the snapshot
   */
  metadata?: Record<string, any>;
}

/**
 * Options for memory monitoring
 */
export interface MemoryMonitorOptions {
  /**
   * Whether to enable debug logging
   * @default false
   */
  debug?: boolean;
  
  /**
   * The interval in milliseconds for automatic memory usage tracking
   * @default 0 (disabled)
   */
  trackingInterval?: number;
  
  /**
   * The maximum number of snapshots to keep
   * @default 100
   */
  maxSnapshots?: number;
  
  /**
   * Whether to automatically collect garbage when memory usage exceeds a threshold
   * @default false
   */
  autoGC?: boolean;
  
  /**
   * The threshold for automatic garbage collection (percentage of heap size limit)
   * @default 0.8 (80%)
   */
  gcThreshold?: number;
}

/**
 * A class for monitoring and optimizing memory usage
 */
export class MemoryMonitor {
  private options: Required<MemoryMonitorOptions>;
  private snapshots: MemorySnapshot[] = [];
  private trackingIntervalId: number | null = null;
  private snapshotCounter = 0;
  
  /**
   * Creates a new MemoryMonitor
   * @param options Options for memory monitoring
   */
  constructor(options: MemoryMonitorOptions = {}) {
    this.options = {
      debug: options.debug ?? false,
      trackingInterval: options.trackingInterval ?? 0,
      maxSnapshots: options.maxSnapshots ?? 100,
      autoGC: options.autoGC ?? false,
      gcThreshold: options.gcThreshold ?? 0.8,
    };
    
    // Start automatic tracking if enabled
    if (this.options.trackingInterval > 0) {
      this.startTracking();
    }
  }
  
  /**
   * Gets the current memory usage
   * @returns The current memory usage, or null if not available
   */
  getMemoryUsage(): MemoryUsage | null {
    if (!this.isMemoryAPIAvailable()) {
      this.logDebug('Memory API is not available');
      return null;
    }
    
    const memory = (performance as any).memory;
    
    return {
      totalJSHeapSize: memory.totalJSHeapSize,
      usedJSHeapSize: memory.usedJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Takes a snapshot of the current memory usage
   * @param label A label for the snapshot
   * @param metadata Additional metadata for the snapshot
   * @returns The snapshot, or null if memory API is not available
   */
  takeSnapshot(label: string = '', metadata?: Record<string, any>): MemorySnapshot | null {
    const memoryUsage = this.getMemoryUsage();
    
    if (!memoryUsage) {
      return null;
    }
    
    const snapshot: MemorySnapshot = {
      ...memoryUsage,
      id: `snapshot-${++this.snapshotCounter}`,
      label: label || `Snapshot ${this.snapshotCounter}`,
      metadata,
    };
    
    // Add snapshot to the list
    this.snapshots.push(snapshot);
    
    // Limit the number of snapshots
    if (this.snapshots.length > this.options.maxSnapshots) {
      this.snapshots.shift();
    }
    
    this.logDebug(`Snapshot taken: ${snapshot.label}`);
    
    // Check if we need to trigger garbage collection
    if (this.options.autoGC) {
      this.checkAndTriggerGC(memoryUsage);
    }
    
    return snapshot;
  }
  
  /**
   * Gets all snapshots
   * @returns All snapshots
   */
  getSnapshots(): MemorySnapshot[] {
    return [...this.snapshots];
  }
  
  /**
   * Clears all snapshots
   */
  clearSnapshots(): void {
    this.snapshots = [];
    this.logDebug('Snapshots cleared');
  }
  
  /**
   * Starts automatic memory usage tracking
   * @param interval The interval in milliseconds (overrides the option)
   */
  startTracking(interval?: number): void {
    // Stop existing tracking
    this.stopTracking();
    
    const trackingInterval = interval ?? this.options.trackingInterval;
    
    if (trackingInterval <= 0) {
      this.logDebug('Tracking interval must be greater than 0');
      return;
    }
    
    this.trackingIntervalId = window.setInterval(() => {
      this.takeSnapshot('Auto');
    }, trackingInterval);
    
    this.logDebug(`Automatic tracking started with interval ${trackingInterval}ms`);
  }
  
  /**
   * Stops automatic memory usage tracking
   */
  stopTracking(): void {
    if (this.trackingIntervalId !== null) {
      window.clearInterval(this.trackingIntervalId);
      this.trackingIntervalId = null;
      this.logDebug('Automatic tracking stopped');
    }
  }
  
  /**
   * Suggests when to perform garbage collection
   * @returns Whether garbage collection is recommended
   */
  shouldCollectGarbage(): boolean {
    const memoryUsage = this.getMemoryUsage();
    
    if (!memoryUsage) {
      return false;
    }
    
    const usageRatio = memoryUsage.usedJSHeapSize / memoryUsage.jsHeapSizeLimit;
    return usageRatio > this.options.gcThreshold;
  }
  
  /**
   * Attempts to trigger garbage collection
   * Note: This is not guaranteed to work in all browsers
   */
  triggerGarbageCollection(): void {
    if (typeof window.gc === 'function') {
      try {
        window.gc();
        this.logDebug('Garbage collection triggered');
      } catch (error) {
        this.logDebug(`Failed to trigger garbage collection: ${error}`);
      }
    } else {
      this.logDebug('Garbage collection is not available');
      
      // Alternative approach: try to force GC indirectly
      try {
        const largeArray: any[] = [];
        for (let i = 0; i < 1000000; i++) {
          largeArray.push(new Array(100));
        }
        // Clear the reference to allow GC
        // eslint-disable-next-line no-unused-vars
        largeArray.length = 0;
        this.logDebug('Attempted to trigger garbage collection indirectly');
      } catch (error) {
        this.logDebug(`Failed to trigger garbage collection indirectly: ${error}`);
      }
    }
  }
  
  /**
   * Analyzes memory usage and returns a report
   * @returns A memory usage report
   */
  analyzeMemoryUsage(): Record<string, any> {
    if (this.snapshots.length < 2) {
      return {
        status: 'insufficient_data',
        message: 'Need at least 2 snapshots for analysis',
      };
    }
    
    const firstSnapshot = this.snapshots[0];
    const lastSnapshot = this.snapshots[this.snapshots.length - 1];
    const duration = lastSnapshot.timestamp - firstSnapshot.timestamp;
    
    // Calculate memory growth
    const memoryGrowth = lastSnapshot.usedJSHeapSize - firstSnapshot.usedJSHeapSize;
    const memoryGrowthRate = duration > 0 ? (memoryGrowth / duration) * 1000 : 0; // bytes per second
    
    // Check for potential memory leaks
    const potentialLeak = memoryGrowthRate > 1024 * 10; // More than 10KB/s growth
    
    return {
      status: 'ok',
      snapshots: this.snapshots.length,
      duration: duration,
      memoryGrowth: memoryGrowth,
      memoryGrowthRate: memoryGrowthRate,
      potentialLeak: potentialLeak,
      currentUsage: {
        used: lastSnapshot.usedJSHeapSize,
        total: lastSnapshot.totalJSHeapSize,
        limit: lastSnapshot.jsHeapSizeLimit,
        usagePercentage: (lastSnapshot.usedJSHeapSize / lastSnapshot.jsHeapSizeLimit) * 100,
      },
    };
  }
  
  /**
   * Checks if the memory API is available
   * @returns Whether the memory API is available
   * @private
   */
  private isMemoryAPIAvailable(): boolean {
    return typeof performance !== 'undefined' && 
           typeof (performance as any).memory !== 'undefined';
  }
  
  /**
   * Checks if garbage collection should be triggered and triggers it if needed
   * @param memoryUsage The current memory usage
   * @private
   */
  private checkAndTriggerGC(memoryUsage: MemoryUsage): void {
    const usageRatio = memoryUsage.usedJSHeapSize / memoryUsage.jsHeapSizeLimit;
    
    if (usageRatio > this.options.gcThreshold) {
      this.logDebug(`Memory usage (${(usageRatio * 100).toFixed(2)}%) exceeds threshold (${(this.options.gcThreshold * 100).toFixed(2)}%)`);
      this.triggerGarbageCollection();
    }
  }
  
  /**
   * Logs a debug message
   * @param message The message to log
   * @private
   */
  private logDebug(message: string): void {
    if (this.options.debug) {
      console.log(`[MemoryMonitor] ${message}`);
    }
  }
}

// Create a singleton instance
export const memoryMonitor = new MemoryMonitor();

// Add global access for debugging
if (typeof window !== 'undefined') {
  (window as any).__memoryMonitor = memoryMonitor;
}

export default memoryMonitor;
