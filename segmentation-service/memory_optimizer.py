#!/usr/bin/env python3
"""
Enhanced Memory Optimizer for Segmentation Service

This module provides tools for optimizing memory usage in the Segmentation Service.
It includes functions for memory profiling, memory optimization, and memory management.
"""

import os
import gc
import sys
import time
import weakref
import functools
import logging
import tracemalloc
from typing import Any, Callable, Dict, List, Set, Tuple, TypeVar, Optional, Union
import psutil
from collections import defaultdict

# Type variable for generic function
T = TypeVar('T')

# Setup logging
logger = logging.getLogger(__name__)

class MemoryOptimizer:
    """
    Memory optimizer for reducing and managing memory usage
    
    Features:
    - Memory usage tracking
    - Automatic garbage collection
    - Object lifecycle management
    - Memory leak detection
    - Resource cleanup
    - Lazy loading
    """
    
    def __init__(self, threshold_mb: float = 100.0, gc_threshold: int = 1000):
        """
        Initialize memory optimizer
        
        Args:
            threshold_mb: Memory threshold in MB to trigger optimization
            gc_threshold: Number of objects to trigger garbage collection
        """
        self.threshold_mb = threshold_mb
        self.gc_threshold = gc_threshold
        self.object_count = 0
        self.tracked_objects = weakref.WeakSet()
        self.memory_usage_history = []
        self.last_gc_time = time.time()
        self.gc_interval = 60  # seconds
        
        # Enable automatic garbage collection
        gc.enable()
        
        logger.info(f"Memory optimizer initialized with threshold: {threshold_mb} MB, GC threshold: {gc_threshold} objects")
    
    def track_memory_usage(self) -> float:
        """
        Track current memory usage
        
        Returns:
            Current memory usage in MB
        """
        process = psutil.Process()
        memory_info = process.memory_info()
        memory_mb = memory_info.rss / 1024 / 1024  # Convert to MB
        
        # Add to history
        self.memory_usage_history.append((time.time(), memory_mb))
        
        # Keep only the last 100 measurements
        if len(self.memory_usage_history) > 100:
            self.memory_usage_history.pop(0)
        
        return memory_mb
    
    def check_memory_threshold(self) -> bool:
        """
        Check if memory usage exceeds threshold
        
        Returns:
            True if memory usage exceeds threshold, False otherwise
        """
        current_memory = self.track_memory_usage()
        return current_memory > self.threshold_mb
    
    def optimize_if_needed(self):
        """Optimize memory usage if threshold is exceeded"""
        if self.check_memory_threshold():
            self.optimize_memory()
        
        # Check if it's time for periodic garbage collection
        current_time = time.time()
        if current_time - self.last_gc_time > self.gc_interval:
            self.force_garbage_collection()
            self.last_gc_time = current_time
    
    def optimize_memory(self):
        """Optimize memory usage"""
        logger.info("Optimizing memory usage...")
        
        # Force garbage collection
        self.force_garbage_collection()
        
        # Clear caches
        self.clear_caches()
        
        # Log memory usage after optimization
        memory_after = self.track_memory_usage()
        logger.info(f"Memory usage after optimization: {memory_after:.2f} MB")
    
    def force_garbage_collection(self):
        """Force garbage collection"""
        collected = gc.collect()
        logger.info(f"Garbage collection: collected {collected} objects")
    
    def clear_caches(self):
        """Clear various caches to free memory"""
        # Clear function cache if available
        if hasattr(functools, 'lru_cache'):
            for func in gc.get_objects():
                if hasattr(func, 'cache_clear') and callable(func.cache_clear):
                    try:
                        func.cache_clear()
                    except:
                        pass
        
        # Clear regex cache
        try:
            import re
            if hasattr(re, 'purge'):
                re.purge()
        except:
            pass
    
    def track_object(self, obj: Any):
        """
        Track an object for memory management
        
        Args:
            obj: Object to track
        """
        self.tracked_objects.add(obj)
        self.object_count += 1
        
        # Check if we need to run garbage collection
        if self.object_count >= self.gc_threshold:
            self.force_garbage_collection()
            self.object_count = len(self.tracked_objects)
    
    def lazy_load(self, func: Callable[..., T]) -> Callable[..., T]:
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
        def wrapper(*args, **kwargs):
            nonlocal result
            if result is sentinel:
                result = func(*args, **kwargs)
                # Track the loaded resource
                self.track_object(result)
            return result
        
        return wrapper
    
    def memory_efficient(self, func: Callable[..., T]) -> Callable[..., T]:
        """
        Decorator to make a function memory efficient
        
        Args:
            func: Function to optimize
            
        Returns:
            Memory-optimized function
        """
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Track memory usage before
            memory_before = self.track_memory_usage()
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Track memory usage after
            memory_after = self.track_memory_usage()
            memory_diff = memory_after - memory_before
            
            # Log memory usage
            logger.debug(f"Function {func.__name__} memory usage: {memory_diff:.2f} MB")
            
            # Optimize memory if needed
            if memory_diff > 10:  # If function used more than 10 MB
                self.optimize_memory()
            
            return result
        
        return wrapper
    
    def detect_memory_leaks(self, iterations: int = 5, func: Callable = None, *args, **kwargs) -> Dict[str, Any]:
        """
        Detect potential memory leaks
        
        Args:
            iterations: Number of iterations to run
            func: Function to test for memory leaks
            *args: Arguments to pass to the function
            **kwargs: Keyword arguments to pass to the function
            
        Returns:
            Dictionary with memory leak detection results
        """
        # Start tracking memory allocations
        tracemalloc.start()
        
        memory_usage = []
        
        # Run the function multiple times
        for i in range(iterations):
            if func:
                func(*args, **kwargs)
            
            # Force garbage collection
            gc.collect()
            
            # Get current memory usage
            current, peak = tracemalloc.get_traced_memory()
            memory_usage.append(current / 1024 / 1024)  # Convert to MB
            
            # Sleep briefly to allow for garbage collection
            time.sleep(0.1)
        
        # Get memory snapshot
        snapshot = tracemalloc.take_snapshot()
        tracemalloc.stop()
        
        # Analyze top memory users
        top_stats = snapshot.statistics('lineno')
        
        # Check for memory growth
        memory_growth = memory_usage[-1] - memory_usage[0]
        has_leak = memory_growth > 0.5  # More than 0.5 MB growth
        
        # Prepare results
        results = {
            "memory_usage": memory_usage,
            "memory_growth": memory_growth,
            "has_leak": has_leak,
            "top_memory_users": [(str(stat.traceback), stat.size / 1024 / 1024) for stat in top_stats[:10]]
        }
        
        if has_leak:
            logger.warning(f"Potential memory leak detected: {memory_growth:.2f} MB growth over {iterations} iterations")
            for trace, size in results["top_memory_users"]:
                logger.warning(f"Memory user: {size:.2f} MB - {trace}")
        
        return results
    
    def get_memory_usage_report(self) -> Dict[str, Any]:
        """
        Get memory usage report
        
        Returns:
            Dictionary with memory usage report
        """
        process = psutil.Process()
        memory_info = process.memory_info()
        
        # Get system memory info
        system_memory = psutil.virtual_memory()
        
        # Get garbage collector stats
        gc_stats = {
            "garbage": len(gc.garbage),
            "objects": len(gc.get_objects()),
            "collections": gc.get_count()
        }
        
        # Prepare report
        report = {
            "process": {
                "rss": memory_info.rss / 1024 / 1024,  # MB
                "vms": memory_info.vms / 1024 / 1024,  # MB
                "shared": getattr(memory_info, 'shared', 0) / 1024 / 1024,  # MB
                "text": getattr(memory_info, 'text', 0) / 1024 / 1024,  # MB
                "data": getattr(memory_info, 'data', 0) / 1024 / 1024,  # MB
            },
            "system": {
                "total": system_memory.total / 1024 / 1024,  # MB
                "available": system_memory.available / 1024 / 1024,  # MB
                "used": system_memory.used / 1024 / 1024,  # MB
                "percent": system_memory.percent
            },
            "gc": gc_stats,
            "history": self.memory_usage_history
        }
        
        return report
    
    def log_memory_usage(self):
        """Log current memory usage"""
        memory_mb = self.track_memory_usage()
        logger.info(f"Current memory usage: {memory_mb:.2f} MB")
    
    def set_threshold(self, threshold_mb: float):
        """
        Set memory threshold
        
        Args:
            threshold_mb: Memory threshold in MB
        """
        self.threshold_mb = threshold_mb
        logger.info(f"Memory threshold set to {threshold_mb} MB")
    
    def set_gc_threshold(self, gc_threshold: int):
        """
        Set garbage collection threshold
        
        Args:
            gc_threshold: Number of objects to trigger garbage collection
        """
        self.gc_threshold = gc_threshold
        logger.info(f"GC threshold set to {gc_threshold} objects")
    
    def cleanup(self):
        """Clean up resources and optimize memory"""
        self.tracked_objects.clear()
        self.object_count = 0
        self.force_garbage_collection()
        self.clear_caches()
        logger.info("Memory optimizer cleanup completed")

# Create a global instance
memory_optimizer = MemoryOptimizer()

# Function to get the memory optimizer instance
def get_memory_optimizer() -> MemoryOptimizer:
    """
    Get the memory optimizer instance
    
    Returns:
        Memory optimizer instance
    """
    return memory_optimizer

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Create a memory optimizer
    optimizer = MemoryOptimizer()
    
    # Example of lazy loading
    @optimizer.lazy_load
    def load_large_resource():
        # Simulate loading a large resource
        logger.info("Loading large resource...")
        large_list = [0] * 1000000
        return large_list
    
    # Example of memory efficient function
    @optimizer.memory_efficient
    def process_data():
        # Simulate processing data
        logger.info("Processing data...")
        data = [i for i in range(1000000)]
        result = sum(data)
        return result
    
    # Test lazy loading
    logger.info("Before first call to load_large_resource()")
    optimizer.log_memory_usage()
    
    resource = load_large_resource()
    logger.info("After first call to load_large_resource()")
    optimizer.log_memory_usage()
    
    resource = load_large_resource()  # Should use cached resource
    logger.info("After second call to load_large_resource()")
    optimizer.log_memory_usage()
    
    # Test memory efficient function
    logger.info("Before call to process_data()")
    optimizer.log_memory_usage()
    
    result = process_data()
    logger.info(f"Process data result: {result}")
    
    logger.info("After call to process_data()")
    optimizer.log_memory_usage()
    
    # Test memory leak detection
    def leaky_function():
        # This function has a "leak" (it adds to a global list)
        global leaky_list
        leaky_list.append([0] * 100000)
    
    global leaky_list
    leaky_list = []
    
    logger.info("Testing memory leak detection...")
    leak_results = optimizer.detect_memory_leaks(iterations=5, func=leaky_function)
    
    # Clean up
    optimizer.cleanup()
    logger.info("After cleanup")
    optimizer.log_memory_usage()
