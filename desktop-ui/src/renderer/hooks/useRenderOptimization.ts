import React, { useState, useCallback, useRef, useEffect, useMemo, DependencyList } from 'react';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';
import { debounce, throttle, memoize, measureExecutionTime } from '../utils/performance';

// Custom hook for memoizing components
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, dependencies);
}

// Custom hook for preventing unnecessary re-renders
export function useShallowMemoizedValue<T>(value: T): T {
  const ref = useRef<T>(value);

  // Only update ref if shallow comparison shows changes
  if (!shallowEqual(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
}

// Utility for shallow comparison
function shallowEqual(objA: any, objB: any): boolean {
  if (Object.is(objA, objB)) {
    return true;
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (
      !Object.prototype.hasOwnProperty.call(objB, key) ||
      !Object.is(objA[key], objB[key])
    ) {
      return false;
    }
  }

  return true;
}

// Component that only re-renders when props actually change
export interface MemoizedComponentProps extends BoxProps {
  children: React.ReactNode;
}

export const MemoizedComponent = React.memo<MemoizedComponentProps>(
  ({ children, ...rest }) => {
    const memoizedRest = useShallowMemoizedValue(rest);

    return <Box {...memoizedRest}>{children}</Box>;
  },
  (prevProps, nextProps) => {
    // Custom comparison function
    // Return true if props are equal (to prevent re-render)
    if (prevProps.children !== nextProps.children) {
      return false;
    }

    // Compare other props
    const prevRest = { ...prevProps };
    const nextRest = { ...nextProps };
    delete prevRest.children;
    delete nextRest.children;

    return shallowEqual(prevRest, nextRest);
  }
);

// Hook for deferring non-critical updates
export function useDeferredValue<T>(value: T, delay: number = 200): T {
  const [deferredValue, setDeferredValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDeferredValue(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return deferredValue;
}

// Hook for prioritizing critical updates
export function useTransitionState<T>(initialState: T): [T, (newState: T) => void, boolean] {
  const [state, setState] = useState<T>(initialState);
  const [isPending, setIsPending] = useState<boolean>(false);
  const timeoutRef = useRef<number | null>(null);

  const startTransition = useCallback((newState: T) => {
    setIsPending(true);

    // Clear any existing timeout
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    // Schedule the state update
    timeoutRef.current = window.setTimeout(() => {
      setState(newState);
      setIsPending(false);
      timeoutRef.current = null;
    }, 0);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, startTransition, isPending];
}

/**
 * Options for useRenderOptimization
 */
interface RenderOptimizationOptions {
  /**
   * Whether to log render information
   * @default false
   */
  logRenders?: boolean;

  /**
   * The component name for logging
   * @default 'Component'
   */
  componentName?: string;

  /**
   * Whether to measure render time
   * @default false
   */
  measureRenderTime?: boolean;
}

/**
 * A hook that helps optimize renders
 * @param options Options for render optimization
 * @returns An object with render optimization utilities
 */
export function useRenderOptimization(options: RenderOptimizationOptions = {}) {
  const {
    logRenders = false,
    componentName = 'Component',
    measureRenderTime = false,
  } = options;

  // Track render count
  const renderCount = useRef(0);

  // Track render time
  const renderStartTime = useRef(0);

  // Track previous props
  const prevPropsRef = useRef<Record<string, any>>({});

  // Log render information
  useEffect(() => {
    renderCount.current += 1;

    if (logRenders) {
      console.log(`[${componentName}] Render #${renderCount.current}`);
    }

    if (measureRenderTime) {
      const renderTime = performance.now() - renderStartTime.current;
      console.log(`[${componentName}] Render time: ${renderTime.toFixed(2)}ms`);
    }

    // Set start time for next render
    renderStartTime.current = performance.now();
  });

  /**
   * Checks if props have changed
   * @param props The props to check
   * @param propNames The names of props to check
   * @returns Whether any of the specified props have changed
   */
  const havePropsChanged = useCallback(
    (props: Record<string, any>, propNames: string[]): boolean => {
      const prevProps = prevPropsRef.current;

      // Update prevProps for next render
      prevPropsRef.current = { ...props };

      // Check if any of the specified props have changed
      return propNames.some((name) => prevProps[name] !== props[name]);
    },
    []
  );

  /**
   * Creates a debounced callback
   * @param callback The callback to debounce
   * @param delay The delay in milliseconds
   * @param deps The dependencies for the callback
   * @returns A debounced callback
   */
  const useDebouncedCallback = useCallback(
    <T extends (...args: any[]) => any>(
      callback: T,
      delay: number,
      deps: DependencyList = []
    ): ((...args: Parameters<T>) => void) => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const memoizedCallback = useCallback(callback, deps);

      // eslint-disable-next-line react-hooks/exhaustive-deps
      return useMemo(() => debounce(memoizedCallback, delay), [memoizedCallback, delay]);
    },
    []
  );

  /**
   * Creates a throttled callback
   * @param callback The callback to throttle
   * @param limit The limit in milliseconds
   * @param deps The dependencies for the callback
   * @returns A throttled callback
   */
  const useThrottledCallback = useCallback(
    <T extends (...args: any[]) => any>(
      callback: T,
      limit: number,
      deps: DependencyList = []
    ): ((...args: Parameters<T>) => void) => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const memoizedCallback = useCallback(callback, deps);

      // eslint-disable-next-line react-hooks/exhaustive-deps
      return useMemo(() => throttle(memoizedCallback, limit), [memoizedCallback, limit]);
    },
    []
  );

  /**
   * Creates a memoized value with deep comparison
   * @param value The value to memoize
   * @param deps The dependencies for the value
   * @returns A memoized value
   */
  const useMemoDeep = useCallback(
    <T>(value: T, deps: DependencyList): T => {
      const depsString = JSON.stringify(deps);

      // eslint-disable-next-line react-hooks/exhaustive-deps
      return useMemo(() => value, [depsString]);
    },
    []
  );

  return {
    renderCount: renderCount.current,
    havePropsChanged,
    useDebouncedCallback,
    useThrottledCallback,
    useMemoDeep,
  };
}

// Export all optimization utilities
export {
  MemoizedComponent as OptimizedContainer,
  useMemoizedCallback,
  useShallowMemoizedValue,
  useDeferredValue,
  useTransitionState
};
