"""
Performance optimization utilities for AI Orchestrator.

This module provides utilities for optimizing model performance,
including caching, batching, and resource management.
"""
import os
import logging
import asyncio
import time
from typing import Dict, List, Any, Optional, Union, Callable, TypeVar, Generic
from functools import wraps
from datetime import datetime, timedelta
import threading
import psutil

logger = logging.getLogger(__name__)

# Type variable for cache key
T = TypeVar('T')
R = TypeVar('R')

class LRUCache(Generic[T, R]):
    """
    LRU (Least Recently Used) cache implementation.
    """
    def __init__(self, max_size: int = 100):
        """
        Initialize the LRU cache.
        
        Args:
            max_size: Maximum number of items to store in the cache
        """
        self.max_size = max_size
        self.cache: Dict[T, R] = {}
        self.access_times: Dict[T, float] = {}
        self.lock = threading.RLock()
        
    def get(self, key: T) -> Optional[R]:
        """
        Get an item from the cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found
        """
        with self.lock:
            if key in self.cache:
                self.access_times[key] = time.time()
                return self.cache[key]
            return None
            
    def put(self, key: T, value: R) -> None:
        """
        Put an item in the cache.
        
        Args:
            key: Cache key
            value: Value to cache
        """
        with self.lock:
            if len(self.cache) >= self.max_size and key not in self.cache:
                # Remove least recently used item
                oldest_key = min(self.access_times.items(), key=lambda x: x[1])[0]
                del self.cache[oldest_key]
                del self.access_times[oldest_key]
                
            self.cache[key] = value
            self.access_times[key] = time.time()
            
    def clear(self) -> None:
        """Clear the cache."""
        with self.lock:
            self.cache.clear()
            self.access_times.clear()
            
    def remove(self, key: T) -> None:
        """
        Remove an item from the cache.
        
        Args:
            key: Cache key
        """
        with self.lock:
            if key in self.cache:
                del self.cache[key]
                del self.access_times[key]
                
    def size(self) -> int:
        """
        Get the current size of the cache.
        
        Returns:
            Number of items in the cache
        """
        with self.lock:
            return len(self.cache)


def async_lru_cache(maxsize: int = 128, ttl: Optional[int] = None):
    """
    Decorator to cache the result of an async function.
    
    Args:
        maxsize: Maximum cache size
        ttl: Time to live in seconds (None for no expiration)
        
    Returns:
        Decorated function
    """
    cache = {}
    timestamps = {}
    lock = asyncio.Lock()
    
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Create a cache key from the function arguments
            key = str(args) + str(sorted(kwargs.items()))
            
            async with lock:
                # Check if result is in cache and not expired
                if key in cache:
                    timestamp = timestamps[key]
                    if ttl is None or time.time() - timestamp < ttl:
                        return cache[key]
                
                # If cache is full, remove the oldest entry
                if len(cache) >= maxsize:
                    oldest_key = min(timestamps.items(), key=lambda x: x[1])[0]
                    del cache[oldest_key]
                    del timestamps[oldest_key]
            
            # Call the original function
            result = await func(*args, **kwargs)
            
            # Cache the result
            async with lock:
                cache[key] = result
                timestamps[key] = time.time()
                
            return result
            
        return wrapper
        
    return decorator


class ResourceMonitor:
    """
    Monitor system resources (CPU, memory, GPU).
    """
    def __init__(self, interval: float = 1.0):
        """
        Initialize the resource monitor.
        
        Args:
            interval: Monitoring interval in seconds
        """
        self.interval = interval
        self.running = False
        self.thread = None
        self.cpu_usage = []
        self.memory_usage = []
        self.gpu_usage = []
        self.lock = threading.RLock()
        
    def start(self):
        """Start monitoring resources."""
        if self.running:
            return
            
        self.running = True
        self.thread = threading.Thread(target=self._monitor_loop)
        self.thread.daemon = True
        self.thread.start()
        
    def stop(self):
        """Stop monitoring resources."""
        self.running = False
        if self.thread:
            self.thread.join(timeout=2.0)
            self.thread = None
            
    def _monitor_loop(self):
        """Resource monitoring loop."""
        while self.running:
            try:
                # Get CPU usage
                cpu_percent = psutil.cpu_percent(interval=None)
                
                # Get memory usage
                memory = psutil.virtual_memory()
                memory_percent = memory.percent
                
                # Get GPU usage (mock implementation)
                # In a real implementation, you'd use a library like pynvml
                gpu_percent = 0.0
                
                # Store measurements
                with self.lock:
                    self.cpu_usage.append((time.time(), cpu_percent))
                    self.memory_usage.append((time.time(), memory_percent))
                    self.gpu_usage.append((time.time(), gpu_percent))
                    
                    # Keep only the last 60 measurements
                    if len(self.cpu_usage) > 60:
                        self.cpu_usage = self.cpu_usage[-60:]
                    if len(self.memory_usage) > 60:
                        self.memory_usage = self.memory_usage[-60:]
                    if len(self.gpu_usage) > 60:
                        self.gpu_usage = self.gpu_usage[-60:]
                
            except Exception as e:
                logger.error(f"Error in resource monitoring: {str(e)}")
                
            # Sleep for the monitoring interval
            time.sleep(self.interval)
            
    def get_cpu_usage(self) -> List[tuple]:
        """
        Get CPU usage measurements.
        
        Returns:
            List of (timestamp, cpu_percent) tuples
        """
        with self.lock:
            return list(self.cpu_usage)
            
    def get_memory_usage(self) -> List[tuple]:
        """
        Get memory usage measurements.
        
        Returns:
            List of (timestamp, memory_percent) tuples
        """
        with self.lock:
            return list(self.memory_usage)
            
    def get_gpu_usage(self) -> List[tuple]:
        """
        Get GPU usage measurements.
        
        Returns:
            List of (timestamp, gpu_percent) tuples
        """
        with self.lock:
            return list(self.gpu_usage)
            
    def get_current_usage(self) -> Dict[str, float]:
        """
        Get current resource usage.
        
        Returns:
            Dictionary with current CPU, memory, and GPU usage
        """
        with self.lock:
            cpu = self.cpu_usage[-1][1] if self.cpu_usage else 0.0
            memory = self.memory_usage[-1][1] if self.memory_usage else 0.0
            gpu = self.gpu_usage[-1][1] if self.gpu_usage else 0.0
            
            return {
                "cpu": cpu,
                "memory": memory,
                "gpu": gpu
            }


class BatchProcessor:
    """
    Process items in batches for improved performance.
    """
    def __init__(
        self, 
        batch_size: int = 8, 
        max_wait_time: float = 0.1,
        processor: Optional[Callable[[List[Any]], List[Any]]] = None
    ):
        """
        Initialize the batch processor.
        
        Args:
            batch_size: Maximum batch size
            max_wait_time: Maximum wait time in seconds
            processor: Batch processing function
        """
        self.batch_size = batch_size
        self.max_wait_time = max_wait_time
        self.processor = processor
        self.queue = asyncio.Queue()
        self.results = {}
        self.running = False
        self.task = None
        
    async def start(self):
        """Start the batch processor."""
        if self.running:
            return
            
        self.running = True
        self.task = asyncio.create_task(self._process_loop())
        
    async def stop(self):
        """Stop the batch processor."""
        self.running = False
        if self.task:
            await self.task
            self.task = None
            
    async def _process_loop(self):
        """Batch processing loop."""
        while self.running:
            try:
                # Collect items for the batch
                batch = []
                batch_ids = []
                
                # Get the first item
                try:
                    item_id, item = await asyncio.wait_for(
                        self.queue.get(), 
                        timeout=0.1
                    )
                    batch.append(item)
                    batch_ids.append(item_id)
                    self.queue.task_done()
                except asyncio.TimeoutError:
                    # No items in the queue
                    continue
                
                # Try to get more items up to batch_size
                start_time = time.time()
                while len(batch) < self.batch_size and time.time() - start_time < self.max_wait_time:
                    try:
                        item_id, item = await asyncio.wait_for(
                            self.queue.get(), 
                            timeout=self.max_wait_time - (time.time() - start_time)
                        )
                        batch.append(item)
                        batch_ids.append(item_id)
                        self.queue.task_done()
                    except asyncio.TimeoutError:
                        # No more items within the wait time
                        break
                
                # Process the batch
                if self.processor and batch:
                    try:
                        results = await self.processor(batch)
                        # Store results
                        for i, item_id in enumerate(batch_ids):
                            if i < len(results):
                                self.results[item_id] = (results[i], None)  # (result, error)
                            else:
                                self.results[item_id] = (None, ValueError("Missing result"))
                    except Exception as e:
                        # Store error for all items in the batch
                        for item_id in batch_ids:
                            self.results[item_id] = (None, e)
                
            except Exception as e:
                logger.error(f"Error in batch processing: {str(e)}")
                
    async def process(self, item: Any) -> Any:
        """
        Process an item.
        
        Args:
            item: Item to process
            
        Returns:
            Processing result
            
        Raises:
            RuntimeError: If processing fails
        """
        if not self.running:
            await self.start()
            
        # Generate a unique ID for this item
        item_id = id(item)
        
        # Add the item to the queue
        await self.queue.put((item_id, item))
        
        # Wait for the result
        while item_id not in self.results:
            await asyncio.sleep(0.01)
            
        # Get and remove the result
        result, error = self.results.pop(item_id)
        
        # Raise error if processing failed
        if error:
            raise RuntimeError(f"Batch processing failed: {str(error)}")
            
        return result


# Create singleton instances
_resource_monitor = None

def get_resource_monitor() -> ResourceMonitor:
    """
    Get or create the resource monitor instance.
    
    Returns:
        ResourceMonitor instance
    """
    global _resource_monitor
    
    if _resource_monitor is None:
        _resource_monitor = ResourceMonitor()
        _resource_monitor.start()
        
    return _resource_monitor
