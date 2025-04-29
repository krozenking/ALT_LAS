#!/usr/bin/env python3
"""
Parallel Processing Optimizer for Segmentation Service

This module provides tools for optimizing parallel processing in the Segmentation Service.
It includes functions for parallel execution, task distribution, and workload balancing.
"""

import os
import time
import logging
import threading
import multiprocessing
import concurrent.futures
from typing import Any, Callable, Dict, List, Tuple, TypeVar, Optional, Union, Iterable
import queue
import functools
import asyncio
import signal
import psutil

# Type variable for generic function
T = TypeVar('T')
U = TypeVar('U')

# Setup logging
logger = logging.getLogger(__name__)

class ParallelProcessingOptimizer:
    """
    Parallel processing optimizer for improving performance through concurrency
    
    Features:
    - Thread pool execution
    - Process pool execution
    - Asynchronous task execution
    - Batch processing
    - Workload balancing
    - Task prioritization
    """
    
    def __init__(self, max_workers: int = None, process_pool_size: int = None):
        """
        Initialize parallel processing optimizer
        
        Args:
            max_workers: Maximum number of worker threads (default: CPU count * 2)
            process_pool_size: Maximum number of worker processes (default: CPU count)
        """
        # Set default values based on CPU count
        cpu_count = psutil.cpu_count(logical=True)
        self.max_workers = max_workers or (cpu_count * 2)
        self.process_pool_size = process_pool_size or cpu_count
        
        # Create thread pool
        self._thread_pool = concurrent.futures.ThreadPoolExecutor(max_workers=self.max_workers)
        
        # Create process pool
        self._process_pool = concurrent.futures.ProcessPoolExecutor(max_workers=self.process_pool_size)
        
        # Create task queue
        self._task_queue = queue.PriorityQueue()
        
        # Create async event loop
        self._loop = None
        
        logger.info(f"Parallel processing optimizer initialized with {self.max_workers} threads and {self.process_pool_size} processes")
    
    def map_parallel(self, func: Callable[[T], U], items: Iterable[T], use_processes: bool = False, 
                     chunk_size: int = None, timeout: float = None) -> List[U]:
        """
        Execute a function on multiple items in parallel
        
        Args:
            func: Function to execute
            items: Items to process
            use_processes: Whether to use processes instead of threads
            chunk_size: Size of chunks for processing
            timeout: Timeout in seconds
            
        Returns:
            List of results
        """
        # Convert items to list if it's not already
        items_list = list(items)
        
        # Set default chunk size
        if chunk_size is None:
            chunk_size = max(1, len(items_list) // (self.process_pool_size if use_processes else self.max_workers))
        
        # Choose executor
        executor = self._process_pool if use_processes else self._thread_pool
        
        # Execute in parallel
        try:
            results = list(executor.map(func, items_list, chunksize=chunk_size, timeout=timeout))
            return results
        except concurrent.futures.TimeoutError:
            logger.warning(f"Timeout occurred while executing {func.__name__} in parallel")
            raise
    
    def execute_parallel(self, tasks: List[Callable[[], T]], use_processes: bool = False, 
                         timeout: float = None) -> List[T]:
        """
        Execute multiple tasks in parallel
        
        Args:
            tasks: List of task functions to execute
            use_processes: Whether to use processes instead of threads
            timeout: Timeout in seconds
            
        Returns:
            List of results
        """
        # Choose executor
        executor = self._process_pool if use_processes else self._thread_pool
        
        # Submit all tasks
        futures = [executor.submit(task) for task in tasks]
        
        # Wait for completion
        try:
            concurrent.futures.wait(futures, timeout=timeout)
        except concurrent.futures.TimeoutError:
            logger.warning(f"Timeout occurred while executing parallel tasks")
            # Cancel remaining futures
            for future in futures:
                if not future.done():
                    future.cancel()
            raise
        
        # Get results
        results = []
        for future in futures:
            if future.done():
                try:
                    results.append(future.result())
                except Exception as e:
                    logger.error(f"Error in parallel task: {str(e)}")
                    results.append(None)
            else:
                results.append(None)
        
        return results
    
    def execute_with_timeout(self, func: Callable[..., T], *args, timeout: float, 
                             default_value: Any = None, **kwargs) -> T:
        """
        Execute a function with a timeout
        
        Args:
            func: Function to execute
            *args: Arguments to pass to the function
            timeout: Timeout in seconds
            default_value: Default value to return if timeout occurs
            **kwargs: Keyword arguments to pass to the function
            
        Returns:
            Function result or default value if timeout occurs
        """
        # Submit task to thread pool
        future = self._thread_pool.submit(func, *args, **kwargs)
        
        try:
            # Wait for result with timeout
            return future.result(timeout=timeout)
        except concurrent.futures.TimeoutError:
            logger.warning(f"Timeout occurred while executing {func.__name__}")
            # Cancel the future
            future.cancel()
            return default_value
    
    def batch_process(self, batch_func: Callable[[List[T]], List[U]], items: List[T], 
                      batch_size: int, parallel: bool = True, use_processes: bool = False) -> List[U]:
        """
        Process items in batches
        
        Args:
            batch_func: Function to process a batch of items
            items: Items to process
            batch_size: Size of each batch
            parallel: Whether to process batches in parallel
            use_processes: Whether to use processes instead of threads
            
        Returns:
            List of results
        """
        # Create batches
        batches = [items[i:i+batch_size] for i in range(0, len(items), batch_size)]
        
        # Process batches
        if parallel:
            # Process batches in parallel
            batch_results = self.map_parallel(batch_func, batches, use_processes=use_processes)
        else:
            # Process batches sequentially
            batch_results = [batch_func(batch) for batch in batches]
        
        # Flatten results
        results = []
        for batch_result in batch_results:
            results.extend(batch_result)
        
        return results
    
    def enqueue_task(self, func: Callable[..., T], *args, priority: int = 0, **kwargs) -> concurrent.futures.Future:
        """
        Enqueue a task for execution
        
        Args:
            func: Function to execute
            *args: Arguments to pass to the function
            priority: Task priority (lower value = higher priority)
            **kwargs: Keyword arguments to pass to the function
            
        Returns:
            Future object
        """
        # Create future
        future = concurrent.futures.Future()
        
        # Create task
        def task():
            try:
                result = func(*args, **kwargs)
                future.set_result(result)
            except Exception as e:
                future.set_exception(e)
        
        # Enqueue task
        self._task_queue.put((priority, task))
        
        return future
    
    def start_task_worker(self, num_workers: int = 1):
        """
        Start task worker threads
        
        Args:
            num_workers: Number of worker threads
        """
        def worker():
            while True:
                try:
                    # Get task from queue
                    priority, task = self._task_queue.get()
                    
                    # Execute task
                    task()
                    
                    # Mark task as done
                    self._task_queue.task_done()
                except Exception as e:
                    logger.error(f"Error in task worker: {str(e)}")
        
        # Start worker threads
        for _ in range(num_workers):
            thread = threading.Thread(target=worker, daemon=True)
            thread.start()
    
    def parallel_decorator(self, use_processes: bool = False, timeout: float = None):
        """
        Decorator to execute a function in parallel for each argument
        
        Args:
            use_processes: Whether to use processes instead of threads
            timeout: Timeout in seconds
            
        Returns:
            Decorator function
        """
        def decorator(func):
            @functools.wraps(func)
            def wrapper(items, *args, **kwargs):
                # Create function to apply to each item
                def apply_func(item):
                    return func(item, *args, **kwargs)
                
                # Execute in parallel
                return self.map_parallel(apply_func, items, use_processes=use_processes, timeout=timeout)
            
            return wrapper
        
        return decorator
    
    def async_execute(self, func: Callable[..., T], *args, **kwargs) -> concurrent.futures.Future:
        """
        Execute a function asynchronously
        
        Args:
            func: Function to execute
            *args: Arguments to pass to the function
            **kwargs: Keyword arguments to pass to the function
            
        Returns:
            Future object
        """
        return self._thread_pool.submit(func, *args, **kwargs)
    
    def get_async_event_loop(self) -> asyncio.AbstractEventLoop:
        """
        Get or create async event loop
        
        Returns:
            Async event loop
        """
        if self._loop is None or self._loop.is_closed():
            try:
                self._loop = asyncio.get_event_loop()
            except RuntimeError:
                self._loop = asyncio.new_event_loop()
                asyncio.set_event_loop(self._loop)
        
        return self._loop
    
    def run_async(self, coro):
        """
        Run a coroutine in the event loop
        
        Args:
            coro: Coroutine to run
            
        Returns:
            Coroutine result
        """
        loop = self.get_async_event_loop()
        return loop.run_until_complete(coro)
    
    def distribute_workload(self, items: List[T], num_workers: int = None) -> List[List[T]]:
        """
        Distribute workload among workers
        
        Args:
            items: Items to distribute
            num_workers: Number of workers (default: CPU count)
            
        Returns:
            List of item lists, one for each worker
        """
        if num_workers is None:
            num_workers = psutil.cpu_count()
        
        # Ensure at least one worker
        num_workers = max(1, num_workers)
        
        # Ensure we don't have more workers than items
        num_workers = min(num_workers, len(items))
        
        # Distribute items
        result = [[] for _ in range(num_workers)]
        for i, item in enumerate(items):
            result[i % num_workers].append(item)
        
        return result
    
    def shutdown(self, wait: bool = True):
        """
        Shutdown the optimizer and release resources
        
        Args:
            wait: Whether to wait for pending tasks to complete
        """
        self._thread_pool.shutdown(wait=wait)
        self._process_pool.shutdown(wait=wait)
        
        if self._loop and not self._loop.is_closed():
            self._loop.close()
        
        logger.info("Parallel processing optimizer shutdown")

# Create a global instance
parallel_optimizer = ParallelProcessingOptimizer()

# Function to get the parallel processing optimizer instance
def get_parallel_optimizer() -> ParallelProcessingOptimizer:
    """
    Get the parallel processing optimizer instance
    
    Returns:
        Parallel processing optimizer instance
    """
    return parallel_optimizer

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Create a parallel processing optimizer
    optimizer = ParallelProcessingOptimizer()
    
    # Example function to process an item
    def process_item(item):
        time.sleep(0.1)  # Simulate work
        return item * 2
    
    # Example batch processing function
    def process_batch(batch):
        return [item * 2 for item in batch]
    
    # Test parallel mapping with threads
    items = list(range(100))
    
    logger.info("Testing parallel mapping with threads...")
    start_time = time.time()
    results_threads = optimizer.map_parallel(process_item, items)
    thread_time = time.time() - start_time
    
    logger.info("Testing parallel mapping with processes...")
    start_time = time.time()
    results_processes = optimizer.map_parallel(process_item, items, use_processes=True)
    process_time = time.time() - start_time
    
    logger.info("Testing batch processing...")
    start_time = time.time()
    results_batch = optimizer.batch_process(process_batch, items, batch_size=10)
    batch_time = time.time() - start_time
    
    logger.info("Testing sequential processing...")
    start_time = time.time()
    results_sequential = [process_item(item) for item in items]
    sequential_time = time.time() - start_time
    
    logger.info(f"Sequential processing: {sequential_time:.6f} seconds")
    logger.info(f"Thread pool: {thread_time:.6f} seconds (Speedup: {sequential_time/thread_time:.2f}x)")
    logger.info(f"Process pool: {process_time:.6f} seconds (Speedup: {sequential_time/process_time:.2f}x)")
    logger.info(f"Batch processing: {batch_time:.6f} seconds (Speedup: {sequential_time/batch_time:.2f}x)")
    
    # Verify results
    assert results_threads == results_sequential
    assert results_processes == results_sequential
    assert results_batch == results_sequential
    
    # Test task distribution
    distributed = optimizer.distribute_workload(items, num_workers=4)
    logger.info(f"Distributed workload: {len(distributed)} workers, items per worker: {[len(worker_items) for worker_items in distributed]}")
    
    # Shutdown
    optimizer.shutdown()
    logger.info("Optimizer shutdown complete")
