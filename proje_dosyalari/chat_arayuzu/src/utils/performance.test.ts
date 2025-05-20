/**
 * @jest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useRenderCount,
  useMeasureRender,
  measureExecutionTime,
  debounce,
  throttle
} from '../utils/performance';

// Mock performance API
const originalPerformance = global.performance;

describe('Performance Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    
    // Mock performance.now
    global.performance = {
      ...originalPerformance,
      now: vi.fn()
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    global.performance = originalPerformance;
  });

  describe('useRenderCount', () => {
    it('should increment count on each render', () => {
      const { result, rerender } = renderHook(() => useRenderCount());
      
      expect(result.current).toBe(1);
      
      rerender();
      expect(result.current).toBe(2);
      
      rerender();
      expect(result.current).toBe(3);
    });
  });

  describe('useMeasureRender', () => {
    it('should measure render time', () => {
      // Mock performance.now to return incremental values
      let callCount = 0;
      (global.performance.now as any).mockImplementation(() => {
        callCount += 1;
        return callCount * 10; // 10ms increments
      });
      
      const { result, rerender } = renderHook(() => useMeasureRender('TestComponent'));
      
      // First render should initialize but not have measurements yet
      expect(result.current.renderCount).toBe(1);
      
      // Second render should have measurements
      rerender();
      expect(result.current.renderCount).toBe(2);
      expect(result.current.lastRenderTime).toBeGreaterThan(0);
      expect(result.current.averageRenderTime).toBeGreaterThan(0);
      
      // Third render should update measurements
      rerender();
      expect(result.current.renderCount).toBe(3);
    });
  });

  describe('measureExecutionTime', () => {
    it('should measure function execution time', async () => {
      // Mock performance.now to return incremental values
      (global.performance.now as any).mockImplementationOnce(() => 100);
      (global.performance.now as any).mockImplementationOnce(() => 150);
      
      const testFn = vi.fn(() => 'result');
      const { result, executionTime } = await measureExecutionTime(testFn);
      
      expect(result).toBe('result');
      expect(executionTime).toBe(50);
      expect(testFn).toHaveBeenCalledTimes(1);
    });

    it('should handle async functions', async () => {
      // Mock performance.now to return incremental values
      (global.performance.now as any).mockImplementationOnce(() => 100);
      (global.performance.now as any).mockImplementationOnce(() => 200);
      
      const asyncFn = vi.fn().mockResolvedValue('async result');
      const { result, executionTime } = await measureExecutionTime(asyncFn);
      
      expect(result).toBe('async result');
      expect(executionTime).toBe(100);
      expect(asyncFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();
      
      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(50);
      expect(mockFn).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(60);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to the debounced function', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn('test', 123);
      vi.advanceTimersByTime(110);
      
      expect(mockFn).toHaveBeenCalledWith('test', 123);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);
      
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      throttledFn();
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      vi.advanceTimersByTime(110);
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should pass arguments to the throttled function', () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);
      
      throttledFn('test', 123);
      expect(mockFn).toHaveBeenCalledWith('test', 123);
      
      throttledFn('ignored', 456);
      expect(mockFn).not.toHaveBeenCalledWith('ignored', 456);
      
      vi.advanceTimersByTime(110);
      throttledFn('second', 789);
      expect(mockFn).toHaveBeenCalledWith('second', 789);
    });
  });
});
