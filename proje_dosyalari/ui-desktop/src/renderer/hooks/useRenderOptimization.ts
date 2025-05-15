import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box, BoxProps, useColorMode } from '@chakra-ui/react';

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

// Export all optimization utilities
export {
  MemoizedComponent as OptimizedContainer,
  useMemoizedCallback,
  useShallowMemoizedValue,
  useDeferredValue,
  useTransitionState
};
