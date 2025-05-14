"""
Performance Optimizer Module for ALT_LAS Segmentation Service

This module provides functionality to optimize the performance of the Segmentation Service
through caching, parallel processing, and other optimization techniques.
"""

import time
import functools
import logging
import threading
import multiprocessing
from typing import Dict, List, Any, Optional, Union, Callable, Tuple, TypeVar, Hashable
import concurrent.futures
from datetime import datetime, timedelta

# Configure logging
logger = logging.getLogger('performance_optimizer')

# Type variables for generic functions
T = TypeVar('T')
R = TypeVar('R')

class PerformanceOptimizer:
    """Class for optimizing the performance of the Segmentation Service"""
    
    def __init__(self, cache_size: int = 100, cache_ttl: int = 3600, 
                max_workers: Optional[int] = None):
        """
        Initialize the performance optimizer
        
        Args:
            cache_size: Maximum number of items to store in the cache
            cache_ttl: Time-to-live for cache items in seconds
            max_workers: Maximum number of worker threads/processes for parallel execution
        """
        self.cache_size = cache_size
        self.cache_ttl = cache_ttl
        self.max_workers = max_workers or min(32, (multiprocessing.cpu_count() * 2))
        
        # Initialize cache
        self._cache: Dict[str, Tuple[Any, datetime]] = {}
        self._cache_lock = threading.RLock()
        
        # Initialize thread pool
        self._thread_pool = concurrent.futures.ThreadPoolExecutor(
            max_workers=self.max_workers,
            thread_name_prefix="segmentation-worker"
        )
        
        # Initialize process pool
        self._process_pool = concurrent.futures.ProcessPoolExecutor(
            max_workers=self.max_workers
        )
        
        logger.info(f"Performance optimizer initialized with cache_size={cache_size}, "
                   f"cache_ttl={cache_ttl}, max_workers={self.max_workers}")
    
    def memoize(self, func: Callable[..., T]) -> Callable[..., T]:
        """
        Decorator to memoize a function
        
        Args:
            func: Function to memoize
            
        Returns:
            Memoized function
        """
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Create a cache key from the function name and arguments
            key_parts = [func.__name__]
            key_parts.extend(str(arg) for arg in args)
            key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
            cache_key = ":".join(key_parts)
            
            # Check if the result is in the cache
            with self._cache_lock:
                if cache_key in self._cache:
                    result, timestamp = self._cache[cache_key]
                    # Check if the cache entry is still valid
                    if datetime.now() - timestamp < timedelta(seconds=self.cache_ttl):
                        logger.debug(f"Cache hit for {func.__name__}")
                        return result
            
            # Execute the function
            result = func(*args, **kwargs)
            
            # Store the result in the cache
            with self._cache_lock:
                # If the cache is full, remove the oldest entry
                if len(self._cache) >= self.cache_size:
                    oldest_key = min(self._cache.items(), key=lambda x: x[1][1])[0]
                    del self._cache[oldest_key]
                
                # Add the new entry
                self._cache[cache_key] = (result, datetime.now())
            
            return result
        
        return wrapper
    
    def clear_cache(self):
        """Clear the cache"""
        with self._cache_lock:
            self._cache.clear()
        logger.info("Cache cleared")
    
    def run_in_thread(self, func: Callable[..., T], *args, **kwargs) -> concurrent.futures.Future:
        """
        Run a function in a separate thread
        
        Args:
            func: Function to run
            *args: Positional arguments for the function
            **kwargs: Keyword arguments for the function
            
        Returns:
            Future object representing the execution of the function
        """
        return self._thread_pool.submit(func, *args, **kwargs)
    
    def run_in_process(self, func: Callable[..., T], *args, **kwargs) -> concurrent.futures.Future:
        """
        Run a function in a separate process
        
        Args:
            func: Function to run
            *args: Positional arguments for the function
            **kwargs: Keyword arguments for the function
            
        Returns:
            Future object representing the execution of the function
        """
        return self._process_pool.submit(func, *args, **kwargs)
    
    def map_parallel(self, func: Callable[[T], R], items: List[T], 
                    use_processes: bool = False) -> List[R]:
        """
        Apply a function to each item in a list in parallel
        
        Args:
            func: Function to apply
            items: List of items to process
            use_processes: Whether to use processes instead of threads
            
        Returns:
            List of results
        """
        executor = self._process_pool if use_processes else self._thread_pool
        return list(executor.map(func, items))
    
    def batch_process(self, func: Callable[[List[T]], List[R]], items: List[T], 
                     batch_size: int = 10) -> List[R]:
        """
        Process a list of items in batches
        
        Args:
            func: Function to apply to each batch
            items: List of items to process
            batch_size: Size of each batch
            
        Returns:
            List of results
        """
        results = []
        
        # Process items in batches
        for i in range(0, len(items), batch_size):
            batch = items[i:i+batch_size]
            batch_results = func(batch)
            results.extend(batch_results)
        
        return results
    
    def time_execution(self, func: Callable[..., T], *args, **kwargs) -> Tuple[T, float]:
        """
        Time the execution of a function
        
        Args:
            func: Function to time
            *args: Positional arguments for the function
            **kwargs: Keyword arguments for the function
            
        Returns:
            Tuple of (result, execution_time_in_seconds)
        """
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        execution_time = end_time - start_time
        
        logger.info(f"Function {func.__name__} executed in {execution_time:.6f} seconds")
        
        return result, execution_time
    
    def lazy_load(self, func: Callable[[], T]) -> Callable[[], T]:
        """
        Decorator for lazy loading of resources
        
        Args:
            func: Function that loads a resource
            
        Returns:
            Function that lazily loads the resource
        """
        sentinel = object()
        result = sentinel
        
        @functools.wraps(func)
        def wrapper():
            nonlocal result
            if result is sentinel:
                result = func()
            return result
        
        return wrapper
    
    def rate_limit(self, func: Callable[..., T], calls_per_second: float) -> Callable[..., T]:
        """
        Decorator to rate limit a function
        
        Args:
            func: Function to rate limit
            calls_per_second: Maximum number of calls per second
            
        Returns:
            Rate-limited function
        """
        min_interval = 1.0 / calls_per_second
        last_call_time = 0.0
        call_lock = threading.Lock()
        
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            nonlocal last_call_time
            
            with call_lock:
                current_time = time.time()
                elapsed = current_time - last_call_time
                
                # If we've called the function too recently, sleep
                if elapsed < min_interval:
                    time.sleep(min_interval - elapsed)
                
                # Update the last call time
                last_call_time = time.time()
            
            # Call the function
            return func(*args, **kwargs)
        
        return wrapper
    
    def optimize_memory(self, func: Callable[..., T]) -> Callable[..., T]:
        """
        Decorator to optimize memory usage of a function
        
        Args:
            func: Function to optimize
            
        Returns:
            Memory-optimized function
        """
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Record memory usage before execution
            try:
                import psutil
                process = psutil.Process()
                memory_before = process.memory_info().rss / 1024 / 1024  # MB
            except ImportError:
                memory_before = None
            
            # Execute the function
            result = func(*args, **kwargs)
            
            # Record memory usage after execution
            try:
                if memory_before is not None:
                    memory_after = process.memory_info().rss / 1024 / 1024  # MB
                    memory_diff = memory_after - memory_before
                    logger.info(f"Function {func.__name__} memory usage: {memory_diff:.2f} MB")
            except:
                pass
            
            return result
        
        return wrapper
    
    def shutdown(self):
        """Shutdown the optimizer and release resources"""
        self._thread_pool.shutdown()
        self._process_pool.shutdown()
        self.clear_cache()
        logger.info("Performance optimizer shutdown")

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

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Create a performance optimizer
    optimizer = PerformanceOptimizer()
    
    # Example of memoization
    @optimizer.memoize
    def fibonacci(n):
        if n <= 1:
            return n
        return fibonacci(n-1) + fibonacci(n-2)
    
    # Example of parallel processing
    def process_item(item):
        time.sleep(0.1)  # Simulate work
        return item * 2
    
    # Test memoization
    start_time = time.time()
    result1 = fibonacci(30)
    time1 = time.time() - start_time
    
    start_time = time.time()
    result2 = fibonacci(30)  # Should be cached
    time2 = time.time() - start_time
    
    print(f"Fibonacci result: {result1}")
    print(f"First call: {time1:.6f} seconds")
    print(f"Second call (cached): {time2:.6f} seconds")
    print(f"Speedup: {time1/time2:.2f}x")
    
    # Test parallel processing
    items = list(range(100))
    
    start_time = time.time()
    results_serial = [process_item(item) for item in items]
    time_serial = time.time() - start_time
    
    start_time = time.time()
    results_parallel = optimizer.map_parallel(process_item, items)
    time_parallel = time.time() - start_time
    
    print(f"Serial processing: {time_serial:.6f} seconds")
    print(f"Parallel processing: {time_parallel:.6f} seconds")
    print(f"Speedup: {time_serial/time_parallel:.2f}x")
    
    # Shutdown the optimizer
    optimizer.shutdown()
