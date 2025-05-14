import React, { memo, useMemo, useCallback, ReactNode, ComponentType } from 'react';

/**
 * Props for the OptimizedRender component
 */
interface OptimizedRenderProps {
  /**
   * The component to render
   */
  component: ComponentType<any>;
  
  /**
   * The props to pass to the component
   */
  props: Record<string, any>;
  
  /**
   * Whether to use deep comparison for props
   * @default false
   */
  deepCompare?: boolean;
  
  /**
   * Props to exclude from comparison
   * @default []
   */
  excludeProps?: string[];
}

/**
 * A component that optimizes rendering using React.memo and useMemo
 */
function OptimizedRender({
  component: Component,
  props,
  deepCompare = false,
  excludeProps = [],
}: OptimizedRenderProps) {
  // Filter out excluded props
  const filteredProps = useMemo(() => {
    const result = { ...props };
    excludeProps.forEach((prop) => {
      delete result[prop];
    });
    return result;
  }, [props, excludeProps]);
  
  // Memoize the component
  const MemoizedComponent = useMemo(() => {
    return memo(Component, (prevProps, nextProps) => {
      if (!deepCompare) {
        return false; // Let React.memo handle shallow comparison
      }
      
      // Deep comparison
      const prevKeys = Object.keys(prevProps).filter((key) => !excludeProps.includes(key));
      const nextKeys = Object.keys(nextProps).filter((key) => !excludeProps.includes(key));
      
      if (prevKeys.length !== nextKeys.length) {
        return false;
      }
      
      return prevKeys.every((key) => {
        const prevValue = prevProps[key];
        const nextValue = nextProps[key];
        
        if (typeof prevValue === 'function' && typeof nextValue === 'function') {
          return true; // Assume functions are equal
        }
        
        if (
          typeof prevValue === 'object' &&
          prevValue !== null &&
          typeof nextValue === 'object' &&
          nextValue !== null
        ) {
          return JSON.stringify(prevValue) === JSON.stringify(nextValue);
        }
        
        return prevValue === nextValue;
      });
    });
  }, [Component, deepCompare, excludeProps]);
  
  // Render the memoized component with filtered props
  return <MemoizedComponent {...filteredProps} />;
}

/**
 * A higher-order component that optimizes rendering using React.memo
 * @param Component The component to optimize
 * @param options Options for optimization
 * @returns An optimized version of the component
 */
export function withOptimizedRender<P extends object>(
  Component: ComponentType<P>,
  options: {
    deepCompare?: boolean;
    excludeProps?: string[];
  } = {}
): ComponentType<P> {
  const { deepCompare = false, excludeProps = [] } = options;
  
  const OptimizedComponent = (props: P) => {
    return (
      <OptimizedRender
        component={Component}
        props={props}
        deepCompare={deepCompare}
        excludeProps={excludeProps}
      />
    );
  };
  
  OptimizedComponent.displayName = `OptimizedRender(${Component.displayName || Component.name || 'Component'})`;
  
  return OptimizedComponent;
}

export default OptimizedRender;
