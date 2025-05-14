/**
 * Utilities for detecting and preventing memory leaks
 */

/**
 * Options for the LeakDetector
 */
export interface LeakDetectorOptions {
  /**
   * Whether to enable debug logging
   * @default false
   */
  debug?: boolean;
  
  /**
   * The interval in milliseconds for checking for leaks
   * @default 10000 (10 seconds)
   */
  checkInterval?: number;
  
  /**
   * The threshold for considering an object leaked (number of checks it has survived)
   * @default 3
   */
  leakThreshold?: number;
}

/**
 * A tracked object for leak detection
 */
interface TrackedObject {
  /**
   * The ID of the tracked object
   */
  id: string;
  
  /**
   * A weak reference to the object
   */
  ref: WeakRef<object>;
  
  /**
   * The name of the object
   */
  name: string;
  
  /**
   * The time when the object was registered
   */
  registeredAt: number;
  
  /**
   * The number of checks the object has survived
   */
  checkCount: number;
  
  /**
   * The stack trace when the object was registered
   */
  stack?: string;
  
  /**
   * Additional metadata for the object
   */
  metadata?: Record<string, any>;
}

/**
 * A class for detecting memory leaks
 */
export class LeakDetector {
  private options: Required<LeakDetectorOptions>;
  private trackedObjects: Map<string, TrackedObject> = new Map();
  private checkIntervalId: number | null = null;
  private objectCounter = 0;
  private finalizationRegistry: FinalizationRegistry<string>;
  
  /**
   * Creates a new LeakDetector
   * @param options Options for the leak detector
   */
  constructor(options: LeakDetectorOptions = {}) {
    this.options = {
      debug: options.debug ?? false,
      checkInterval: options.checkInterval ?? 10000,
      leakThreshold: options.leakThreshold ?? 3,
    };
    
    // Create a finalization registry to be notified when objects are garbage collected
    this.finalizationRegistry = new FinalizationRegistry<string>((id) => {
      this.logDebug(`Object ${id} was garbage collected`);
      this.trackedObjects.delete(id);
    });
    
    // Start automatic checking if enabled
    if (this.options.checkInterval > 0) {
      this.startChecking();
    }
  }
  
  /**
   * Tracks an object for leak detection
   * @param object The object to track
   * @param name The name of the object
   * @param captureStack Whether to capture the stack trace
   * @param metadata Additional metadata for the object
   * @returns The ID of the tracked object
   */
  trackObject(
    object: object,
    name: string = 'Unknown',
    captureStack: boolean = false,
    metadata?: Record<string, any>
  ): string {
    const id = `obj-${++this.objectCounter}`;
    
    // Create a weak reference to the object
    const ref = new WeakRef(object);
    
    // Register the object with the finalization registry
    this.finalizationRegistry.register(object, id);
    
    // Create a tracked object
    const trackedObject: TrackedObject = {
      id,
      ref,
      name,
      registeredAt: Date.now(),
      checkCount: 0,
      metadata,
    };
    
    // Capture stack trace if requested
    if (captureStack) {
      try {
        throw new Error('Stack trace capture');
      } catch (error) {
        trackedObject.stack = (error as Error).stack;
      }
    }
    
    // Add the tracked object to the map
    this.trackedObjects.set(id, trackedObject);
    
    this.logDebug(`Tracking object ${id} (${name})`);
    
    return id;
  }
  
  /**
   * Stops tracking an object
   * @param id The ID of the tracked object
   * @returns Whether the object was being tracked
   */
  untrackObject(id: string): boolean {
    const wasTracked = this.trackedObjects.has(id);
    
    if (wasTracked) {
      this.trackedObjects.delete(id);
      this.logDebug(`Stopped tracking object ${id}`);
    }
    
    return wasTracked;
  }
  
  /**
   * Checks for potential memory leaks
   * @returns Information about potential leaks
   */
  checkForLeaks(): Record<string, any> {
    const now = Date.now();
    const potentialLeaks: TrackedObject[] = [];
    let checkedCount = 0;
    
    // Check each tracked object
    for (const [id, trackedObject] of this.trackedObjects.entries()) {
      checkedCount++;
      
      // Try to get the object from the weak reference
      const object = trackedObject.ref.deref();
      
      if (object) {
        // Object still exists, increment check count
        trackedObject.checkCount++;
        
        // Check if the object has survived too many checks
        if (trackedObject.checkCount >= this.options.leakThreshold) {
          potentialLeaks.push(trackedObject);
        }
      } else {
        // Object has been garbage collected, remove it from tracking
        this.trackedObjects.delete(id);
        this.logDebug(`Object ${id} was garbage collected (detected during check)`);
      }
    }
    
    // Log results
    if (potentialLeaks.length > 0) {
      this.logDebug(`Found ${potentialLeaks.length} potential leaks out of ${checkedCount} tracked objects`);
    } else {
      this.logDebug(`No potential leaks found among ${checkedCount} tracked objects`);
    }
    
    return {
      timestamp: now,
      checkedCount,
      trackedCount: this.trackedObjects.size,
      potentialLeaks: potentialLeaks.map((leak) => ({
        id: leak.id,
        name: leak.name,
        age: now - leak.registeredAt,
        checkCount: leak.checkCount,
        stack: leak.stack,
        metadata: leak.metadata,
      })),
    };
  }
  
  /**
   * Starts automatic leak checking
   * @param interval The interval in milliseconds (overrides the option)
   */
  startChecking(interval?: number): void {
    // Stop existing checking
    this.stopChecking();
    
    const checkInterval = interval ?? this.options.checkInterval;
    
    if (checkInterval <= 0) {
      this.logDebug('Check interval must be greater than 0');
      return;
    }
    
    this.checkIntervalId = window.setInterval(() => {
      this.checkForLeaks();
    }, checkInterval);
    
    this.logDebug(`Automatic leak checking started with interval ${checkInterval}ms`);
  }
  
  /**
   * Stops automatic leak checking
   */
  stopChecking(): void {
    if (this.checkIntervalId !== null) {
      window.clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
      this.logDebug('Automatic leak checking stopped');
    }
  }
  
  /**
   * Gets all tracked objects
   * @returns All tracked objects
   */
  getTrackedObjects(): Record<string, any>[] {
    const now = Date.now();
    const result: Record<string, any>[] = [];
    
    for (const [id, trackedObject] of this.trackedObjects.entries()) {
      // Try to get the object from the weak reference
      const object = trackedObject.ref.deref();
      
      if (object) {
        result.push({
          id: trackedObject.id,
          name: trackedObject.name,
          age: now - trackedObject.registeredAt,
          checkCount: trackedObject.checkCount,
          metadata: trackedObject.metadata,
        });
      }
    }
    
    return result;
  }
  
  /**
   * Clears all tracked objects
   */
  clearTrackedObjects(): void {
    this.trackedObjects.clear();
    this.logDebug('All tracked objects cleared');
  }
  
  /**
   * Logs a debug message
   * @param message The message to log
   * @private
   */
  private logDebug(message: string): void {
    if (this.options.debug) {
      console.log(`[LeakDetector] ${message}`);
    }
  }
}

// Create a singleton instance
export const leakDetector = new LeakDetector();

// Add global access for debugging
if (typeof window !== 'undefined') {
  (window as any).__leakDetector = leakDetector;
}

export default leakDetector;
