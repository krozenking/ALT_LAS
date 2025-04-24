"""
Performance Optimization Module for ALT_LAS Segmentation Service

This module provides performance optimization capabilities for the Segmentation Service,
including caching, parallel processing, and lazy loading of resources.
"""

import time
import logging
import functools
import threading
from typing import Dict, List, Any, Optional, Callable, Tuple
import concurrent.futures
from datetime import datetime, timedelta

# Configure logging
logger = logging.getLogger('performance_optimizer')

class Cache:
    """Simple in-memory cache with expiration"""
    
    def __init__(self, max_size: int = 100, ttl_seconds: int = 3600):
        """
        Initialize the cache
        
        Args:
            max_size: Maximum number of items in cache
            ttl_seconds: Time to live in seconds
        """
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self.cache = {}
        self.timestamps = {}
        self.lock = threading.RLock()
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found or expired
        """
        with self.lock:
            if key not in self.cache:
                return None
            
            timestamp = self.timestamps.get(key)
            if timestamp and datetime.now() - timestamp > timedelta(seconds=self.ttl_seconds):
                # Expired
                del self.cache[key]
                del self.timestamps[key]
                return None
            
            return self.cache[key]
    
    def set(self, key: str, value: Any) -> None:
        """
        Set value in cache
        
        Args:
            key: Cache key
            value: Value to cache
        """
        with self.lock:
            # If cache is full, remove oldest item
            if len(self.cache) >= self.max_size and key not in self.cache:
                oldest_key = min(self.timestamps.items(), key=lambda x: x[1])[0]
                del self.cache[oldest_key]
                del self.timestamps[oldest_key]
            
            self.cache[key] = value
            self.timestamps[key] = datetime.now()
    
    def clear(self) -> None:
        """Clear the cache"""
        with self.lock:
            self.cache.clear()
            self.timestamps.clear()
    
    def size(self) -> int:
        """
        Get current cache size
        
        Returns:
            Number of items in cache
        """
        with self.lock:
            return len(self.cache)

class PerformanceOptimizer:
    """Class for performance optimization"""
    
    def __init__(self):
        """Initialize the performance optimizer"""
        self.cache = Cache()
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=4)
        self.stats = {
            'cache_hits': 0,
            'cache_misses': 0,
            'processing_times': [],
            'parallel_tasks': 0
        }
    
    def cached(self, func: Callable) -> Callable:
        """
        Decorator for caching function results
        
        Args:
            func: Function to cache
            
        Returns:
            Decorated function
        """
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Create cache key from function name and arguments
            key_parts = [func.__name__]
            key_parts.extend([str(arg) for arg in args])
            key_parts.extend([f"{k}={v}" for k, v in sorted(kwargs.items())])
            cache_key = ":".join(key_parts)
            
            # Try to get from cache
            cached_result = self.cache.get(cache_key)
            if cached_result is not None:
                self.stats['cache_hits'] += 1
                return cached_result
            
            # Cache miss, call function
            self.stats['cache_misses'] += 1
            start_time = time.time()
            result = func(*args, **kwargs)
            processing_time = time.time() - start_time
            self.stats['processing_times'].append(processing_time)
            
            # Cache result
            self.cache.set(cache_key, result)
            
            return result
        
        return wrapper
    
    def parallel(self, func: Callable, items: List[Any], *args, **kwargs) -> List[Any]:
        """
        Execute function in parallel for each item
        
        Args:
            func: Function to execute
            items: List of items to process
            *args: Additional arguments for func
            **kwargs: Additional keyword arguments for func
            
        Returns:
            List of results
        """
        self.stats['parallel_tasks'] += 1
        
        # Create partial function with fixed args and kwargs
        partial_func = functools.partial(func, *args, **kwargs)
        
        # Submit all tasks
        futures = [self.executor.submit(partial_func, item) for item in items]
        
        # Wait for all tasks to complete
        concurrent.futures.wait(futures)
        
        # Get results
        results = [future.result() for future in futures]
        
        return results
    
    def timed(self, func: Callable) -> Callable:
        """
        Decorator for timing function execution
        
        Args:
            func: Function to time
            
        Returns:
            Decorated function
        """
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            result = func(*args, **kwargs)
            processing_time = time.time() - start_time
            self.stats['processing_times'].append(processing_time)
            logger.debug(f"Function {func.__name__} took {processing_time:.4f} seconds")
            return result
        
        return wrapper
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get performance statistics
        
        Returns:
            Dictionary of statistics
        """
        stats = self.stats.copy()
        
        # Calculate average processing time
        if stats['processing_times']:
            stats['avg_processing_time'] = sum(stats['processing_times']) / len(stats['processing_times'])
            stats['max_processing_time'] = max(stats['processing_times'])
            stats['min_processing_time'] = min(stats['processing_times'])
        else:
            stats['avg_processing_time'] = 0
            stats['max_processing_time'] = 0
            stats['min_processing_time'] = 0
        
        # Add cache stats
        stats['cache_size'] = self.cache.size()
        
        return stats
    
    def clear_cache(self) -> None:
        """Clear the cache"""
        self.cache.clear()
    
    def shutdown(self) -> None:
        """Shutdown the executor"""
        self.executor.shutdown(wait=True)

# Create a global instance
performance_optimizer = PerformanceOptimizer()

# Function to get the performance optimizer instance
def get_performance_optimizer() -> PerformanceOptimizer:
    """
    Get the performance optimizer instance
    
    Returns:
        Performance optimizer instance
    """
    return performance_optimizer

# Main function for testing
if __name__ == "__main__":
    # Test the performance optimizer
    optimizer = PerformanceOptimizer()
    
    # Test caching
    @optimizer.cached
    def expensive_function(n):
        time.sleep(0.1)  # Simulate expensive operation
        return n * n
    
    # First call (cache miss)
    result1 = expensive_function(5)
    print(f"Result 1: {result1}")
    
    # Second call (cache hit)
    result2 = expensive_function(5)
    print(f"Result 2: {result2}")
    
    # Different argument (cache miss)
    result3 = expensive_function(10)
    print(f"Result 3: {result3}")
    
    # Test parallel processing
    def process_item(item):
        time.sleep(0.1)  # Simulate processing
        return item * 2
    
    items = [1, 2, 3, 4, 5]
    
    # Sequential processing
    start_time = time.time()
    sequential_results = [process_item(item) for item in items]
    sequential_time = time.time() - start_time
    print(f"Sequential results: {sequential_results}")
    print(f"Sequential time: {sequential_time:.4f} seconds")
    
    # Parallel processing
    start_time = time.time()
    parallel_results = optimizer.parallel(process_item, items)
    parallel_time = time.time() - start_time
    print(f"Parallel results: {parallel_results}")
    print(f"Parallel time: {parallel_time:.4f} seconds")
    
    # Print stats
    print(f"Stats: {optimizer.get_stats()}")
