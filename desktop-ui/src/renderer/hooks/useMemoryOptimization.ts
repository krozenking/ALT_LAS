import { useEffect, useRef, useState, useCallback } from 'react';
import { memoryOptimizer } from '../utils/memoryOptimizer';
import { memoryMonitor } from '../utils/memoryMonitor';
import { leakDetector } from '../utils/leakDetector';

/**
 * Options for the useMemoryOptimization hook
 */
export interface UseMemoryOptimizationOptions {
  /**
   * Whether to enable memory monitoring
   * @default true
   */
  enableMonitoring?: boolean;
  
  /**
   * The interval in milliseconds for memory monitoring
   * @default 10000 (10 seconds)
   */
  monitoringInterval?: number;
  
  /**
   * Whether to enable leak detection
   * @default false
   */
  enableLeakDetection?: boolean;
  
  /**
   * Whether to track component props for leak detection
   * @default false
   */
  trackProps?: boolean;
  
  /**
   * Whether to optimize memory when the component is unmounted
   * @default true
   */
  optimizeOnUnmount?: boolean;
  
  /**
   * Whether to optimize memory when the window is hidden
   * @default true
   */
  optimizeOnHidden?: boolean;
  
  /**
   * Whether to optimize memory periodically
   * @default false
   */
  optimizePeriodically?: boolean;
  
  /**
   * The interval in milliseconds for periodic optimization
   * @default 60000 (1 minute)
   */
  optimizationInterval?: number;
  
  /**
   * Resources to dispose when the component is unmounted
   */
  resources?: any[];
  
  /**
   * The name of the component (for debugging)
   */
  componentName?: string;
}

/**
 * A hook for optimizing memory usage in a component
 * @param options Options for memory optimization
 * @returns An object with memory optimization utilities
 */
export function useMemoryOptimization(
  options: UseMemoryOptimizationOptions = {}
): {
  memoryUsage: ReturnType<typeof memoryMonitor.getMemoryUsage>;
  optimizeMemory: () => Promise<void>;
  disposeResource: (resource: any) => void;
  trackObject: (object: object, name?: string) => string;
} {
  const {
    enableMonitoring = true,
    monitoringInterval = 10000,
    enableLeakDetection = false,
    trackProps = false,
    optimizeOnUnmount = true,
    optimizeOnHidden = true,
    optimizePeriodically = false,
    optimizationInterval = 60000,
    resources = [],
    componentName = 'Component',
  } = options;
  
  // Store memory usage
  const [memoryUsage, setMemoryUsage] = useState(memoryMonitor.getMemoryUsage());
  
  // Store resources to dispose
  const resourcesRef = useRef<any[]>([...resources]);
  
  // Store tracked objects
  const trackedObjectsRef = useRef<string[]>([]);
  
  // Store interval IDs
  const monitoringIntervalIdRef = useRef<number | null>(null);
  const optimizationIntervalIdRef = useRef<number | null>(null);
  
  // Update memory usage
  const updateMemoryUsage = useCallback(() => {
    const usage = memoryMonitor.getMemoryUsage();
    setMemoryUsage(usage);
  }, []);
  
  // Optimize memory
  const optimizeMemory = useCallback(async () => {
    await memoryOptimizer.optimizeMemory();
    updateMemoryUsage();
  }, [updateMemoryUsage]);
  
  // Dispose a resource
  const disposeResource = useCallback((resource: any) => {
    memoryOptimizer.disposeResource(resource);
  }, []);
  
  // Track an object for leak detection
  const trackObject = useCallback(
    (object: object, name: string = 'Object') => {
      if (!enableLeakDetection) {
        return '';
      }
      
      const id = leakDetector.trackObject(
        object,
        `${componentName}.${name}`,
        true
      );
      
      trackedObjectsRef.current.push(id);
      
      return id;
    },
    [enableLeakDetection, componentName]
  );
  
  // Handle visibility change
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'hidden' && optimizeOnHidden) {
      optimizeMemory();
    }
  }, [optimizeOnHidden, optimizeMemory]);
  
  // Initialize memory optimization
  useEffect(() => {
    // Track props if enabled
    if (trackProps) {
      trackObject(options, 'props');
    }
    
    // Start memory monitoring
    if (enableMonitoring) {
      monitoringIntervalIdRef.current = window.setInterval(() => {
        updateMemoryUsage();
      }, monitoringInterval);
    }
    
    // Start periodic optimization
    if (optimizePeriodically) {
      optimizationIntervalIdRef.current = window.setInterval(() => {
        optimizeMemory();
      }, optimizationInterval);
    }
    
    // Add visibility change listener
    if (optimizeOnHidden) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    // Initial memory usage update
    updateMemoryUsage();
    
    // Cleanup
    return () => {
      // Stop intervals
      if (monitoringIntervalIdRef.current !== null) {
        window.clearInterval(monitoringIntervalIdRef.current);
      }
      
      if (optimizationIntervalIdRef.current !== null) {
        window.clearInterval(optimizationIntervalIdRef.current);
      }
      
      // Remove visibility change listener
      if (optimizeOnHidden) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      
      // Dispose resources
      if (optimizeOnUnmount) {
        // Dispose tracked objects
        trackedObjectsRef.current.forEach((id) => {
          leakDetector.untrackObject(id);
        });
        
        // Dispose resources
        resourcesRef.current.forEach((resource) => {
          disposeResource(resource);
        });
        
        // Optimize memory
        optimizeMemory();
      }
    };
  }, [
    enableMonitoring,
    monitoringInterval,
    optimizePeriodically,
    optimizationInterval,
    optimizeOnHidden,
    optimizeOnUnmount,
    trackProps,
    updateMemoryUsage,
    optimizeMemory,
    disposeResource,
    handleVisibilityChange,
    trackObject,
    options,
  ]);
  
  // Add resources to the ref
  useEffect(() => {
    resourcesRef.current = [...resources];
  }, [resources]);
  
  return {
    memoryUsage,
    optimizeMemory,
    disposeResource,
    trackObject,
  };
}

export default useMemoryOptimization;
