/**
 * Performance utilities for the chat application
 */

/**
 * Measure the performance of a function
 * 
 * @param name - Name of the measurement
 * @param fn - Function to measure
 * @returns Result of the function
 */
export function measurePerformance<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`Performance [${name}]: ${end - start}ms`);
  
  return result;
}

/**
 * Measure the performance of an async function
 * 
 * @param name - Name of the measurement
 * @param fn - Async function to measure
 * @returns Promise that resolves to the result of the function
 */
export async function measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  console.log(`Performance [${name}]: ${end - start}ms`);
  
  return result;
}

/**
 * Create a performance mark
 * 
 * @param name - Name of the mark
 */
export function mark(name: string): void {
  performance.mark(name);
}

/**
 * Create a performance measure between two marks
 * 
 * @param name - Name of the measure
 * @param startMark - Name of the start mark
 * @param endMark - Name of the end mark
 */
export function measure(name: string, startMark: string, endMark: string): void {
  performance.measure(name, startMark, endMark);
  
  const measures = performance.getEntriesByName(name, 'measure');
  const measure = measures[measures.length - 1];
  
  console.log(`Measure [${name}]: ${measure.duration}ms`);
}

/**
 * Clear all performance marks and measures
 */
export function clearPerformanceMarks(): void {
  performance.clearMarks();
  performance.clearMeasures();
}

/**
 * Track memory usage
 * 
 * @returns Memory usage in MB
 */
export function getMemoryUsage(): number | null {
  if (performance.memory) {
    return Math.round((performance.memory.usedJSHeapSize / 1024 / 1024) * 100) / 100;
  }
  
  return null;
}

/**
 * Log memory usage
 * 
 * @param label - Label for the log
 */
export function logMemoryUsage(label: string): void {
  const memory = getMemoryUsage();
  
  if (memory !== null) {
    console.log(`Memory [${label}]: ${memory} MB`);
  }
}

/**
 * Track frame rate
 */
export class FrameRateTracker {
  private frames = 0;
  private lastTime = performance.now();
  private fps = 0;
  private callback: (fps: number) => void;
  private rafId: number | null = null;
  
  /**
   * Create a new frame rate tracker
   * 
   * @param callback - Callback function that receives the FPS
   */
  constructor(callback: (fps: number) => void) {
    this.callback = callback;
  }
  
  /**
   * Start tracking frame rate
   */
  start(): void {
    if (this.rafId !== null) {
      return;
    }
    
    this.lastTime = performance.now();
    this.frames = 0;
    this.fps = 0;
    
    const tick = () => {
      this.frames++;
      
      const now = performance.now();
      const elapsed = now - this.lastTime;
      
      if (elapsed >= 1000) {
        this.fps = Math.round((this.frames * 1000) / elapsed);
        this.lastTime = now;
        this.frames = 0;
        
        this.callback(this.fps);
      }
      
      this.rafId = requestAnimationFrame(tick);
    };
    
    this.rafId = requestAnimationFrame(tick);
  }
  
  /**
   * Stop tracking frame rate
   */
  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  /**
   * Get the current FPS
   * 
   * @returns Current FPS
   */
  getFPS(): number {
    return this.fps;
  }
}

/**
 * Track long tasks
 */
export class LongTaskTracker {
  private observer: PerformanceObserver | null = null;
  private callback: (duration: number) => void;
  
  /**
   * Create a new long task tracker
   * 
   * @param callback - Callback function that receives the duration of the long task
   */
  constructor(callback: (duration: number) => void) {
    this.callback = callback;
  }
  
  /**
   * Start tracking long tasks
   */
  start(): void {
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('PerformanceObserver is not supported in this browser');
      return;
    }
    
    try {
      this.observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          this.callback(entry.duration);
        });
      });
      
      this.observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('Long task tracking is not supported in this browser', error);
    }
  }
  
  /**
   * Stop tracking long tasks
   */
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

/**
 * Track network requests
 */
export class NetworkTracker {
  private observer: PerformanceObserver | null = null;
  private callback: (entry: PerformanceResourceTiming) => void;
  
  /**
   * Create a new network tracker
   * 
   * @param callback - Callback function that receives the resource timing entry
   */
  constructor(callback: (entry: PerformanceResourceTiming) => void) {
    this.callback = callback;
  }
  
  /**
   * Start tracking network requests
   */
  start(): void {
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('PerformanceObserver is not supported in this browser');
      return;
    }
    
    try {
      this.observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          this.callback(entry as PerformanceResourceTiming);
        });
      });
      
      this.observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Network tracking is not supported in this browser', error);
    }
  }
  
  /**
   * Stop tracking network requests
   */
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

/**
 * Track user interactions
 */
export class InteractionTracker {
  private observer: PerformanceObserver | null = null;
  private callback: (entry: PerformanceEventTiming) => void;
  
  /**
   * Create a new interaction tracker
   * 
   * @param callback - Callback function that receives the event timing entry
   */
  constructor(callback: (entry: PerformanceEventTiming) => void) {
    this.callback = callback;
  }
  
  /**
   * Start tracking user interactions
   */
  start(): void {
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('PerformanceObserver is not supported in this browser');
      return;
    }
    
    try {
      this.observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          this.callback(entry as PerformanceEventTiming);
        });
      });
      
      this.observer.observe({ entryTypes: ['event'] });
    } catch (error) {
      console.warn('Interaction tracking is not supported in this browser', error);
    }
  }
  
  /**
   * Stop tracking user interactions
   */
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

/**
 * Track layout shifts
 */
export class LayoutShiftTracker {
  private observer: PerformanceObserver | null = null;
  private callback: (score: number) => void;
  private cumulativeScore = 0;
  
  /**
   * Create a new layout shift tracker
   * 
   * @param callback - Callback function that receives the layout shift score
   */
  constructor(callback: (score: number) => void) {
    this.callback = callback;
  }
  
  /**
   * Start tracking layout shifts
   */
  start(): void {
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('PerformanceObserver is not supported in this browser');
      return;
    }
    
    try {
      this.observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) {
            const score = (entry as any).value;
            this.cumulativeScore += score;
            this.callback(score);
          }
        });
      });
      
      this.observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('Layout shift tracking is not supported in this browser', error);
    }
  }
  
  /**
   * Stop tracking layout shifts
   */
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
  
  /**
   * Get the cumulative layout shift score
   * 
   * @returns Cumulative layout shift score
   */
  getCumulativeScore(): number {
    return Math.round(this.cumulativeScore * 1000) / 1000;
  }
}

/**
 * Track largest contentful paint
 */
export class LCPTracker {
  private observer: PerformanceObserver | null = null;
  private callback: (time: number) => void;
  private largestTime = 0;
  
  /**
   * Create a new LCP tracker
   * 
   * @param callback - Callback function that receives the LCP time
   */
  constructor(callback: (time: number) => void) {
    this.callback = callback;
  }
  
  /**
   * Start tracking LCP
   */
  start(): void {
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('PerformanceObserver is not supported in this browser');
      return;
    }
    
    try {
      this.observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const entry = entries[entries.length - 1];
        
        this.largestTime = entry.startTime;
        this.callback(this.largestTime);
      });
      
      this.observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP tracking is not supported in this browser', error);
    }
  }
  
  /**
   * Stop tracking LCP
   */
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
  
  /**
   * Get the largest contentful paint time
   * 
   * @returns LCP time in milliseconds
   */
  getLCPTime(): number {
    return Math.round(this.largestTime);
  }
}
