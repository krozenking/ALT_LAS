/**
 * Performance utility functions for measuring and optimizing application performance
 */

/**
 * Measures the execution time of a function
 * @param fn The function to measure
 * @param args The arguments to pass to the function
 * @returns The result of the function and the execution time in milliseconds
 */
export function measureExecutionTime<T, Args extends any[]>(
  fn: (...args: Args) => T,
  ...args: Args
): { result: T; executionTime: number } {
  const start = performance.now();
  const result = fn(...args);
  const end = performance.now();
  const executionTime = end - start;
  return { result, executionTime };
}

/**
 * Measures the execution time of an async function
 * @param fn The async function to measure
 * @param args The arguments to pass to the function
 * @returns A promise that resolves to the result of the function and the execution time in milliseconds
 */
export async function measureAsyncExecutionTime<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  ...args: Args
): Promise<{ result: T; executionTime: number }> {
  const start = performance.now();
  const result = await fn(...args);
  const end = performance.now();
  const executionTime = end - start;
  return { result, executionTime };
}

/**
 * Creates a debounced version of a function
 * @param fn The function to debounce
 * @param delay The delay in milliseconds
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Creates a throttled version of a function
 * @param fn The function to throttle
 * @param limit The limit in milliseconds
 * @returns A throttled version of the function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return function(this: any, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

/**
 * Memoizes a function to cache its results
 * @param fn The function to memoize
 * @returns A memoized version of the function
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>();
  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Measures the frame rate of the application
 * @param duration The duration in milliseconds to measure
 * @returns A promise that resolves to the average FPS
 */
export function measureFrameRate(duration: number = 1000): Promise<number> {
  return new Promise((resolve) => {
    let frameCount = 0;
    let startTime = performance.now();
    
    function countFrame() {
      frameCount++;
      const currentTime = performance.now();
      if (currentTime - startTime >= duration) {
        const fps = Math.round((frameCount * 1000) / (currentTime - startTime));
        resolve(fps);
      } else {
        requestAnimationFrame(countFrame);
      }
    }
    
    requestAnimationFrame(countFrame);
  });
}

/**
 * Measures the memory usage of the application
 * @returns The memory usage in MB
 */
export function measureMemoryUsage(): number | null {
  if (window.performance && window.performance.memory) {
    const memory = (window.performance as any).memory;
    return Math.round(memory.usedJSHeapSize / (1024 * 1024));
  }
  return null;
}

/**
 * Logs performance metrics to the console
 * @param metrics The metrics to log
 */
export function logPerformanceMetrics(metrics: Record<string, number | string | null>): void {
  console.log('%c Performance Metrics ', 'background: #007acc; color: white; padding: 2px;');
  Object.entries(metrics).forEach(([key, value]) => {
    console.log(`%c ${key}: %c ${value}`, 'color: #007acc;', 'color: black;');
  });
}

/**
 * Creates a performance profile of the application
 * @param duration The duration in milliseconds to measure
 * @returns A promise that resolves to the performance profile
 */
export async function createPerformanceProfile(duration: number = 5000): Promise<Record<string, number | string | null>> {
  const startTime = performance.now();
  const fps = await measureFrameRate(duration);
  const memoryUsage = measureMemoryUsage();
  const endTime = performance.now();
  
  return {
    fps,
    memoryUsage: memoryUsage !== null ? `${memoryUsage} MB` : null,
    duration: `${Math.round(endTime - startTime)} ms`,
    timestamp: new Date().toISOString(),
  };
}
