"""
Unit tests for the Performance Optimizer module of ALT_LAS Segmentation Service

This module contains unit tests for the Performance Optimizer module, testing the
functionality of the PerformanceOptimizer class and its methods.
"""

import unittest
import time
import threading
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta
import concurrent.futures

from performance_optimizer import PerformanceOptimizer, get_performance_optimizer

class TestPerformanceOptimizer(unittest.TestCase):
    """Test cases for PerformanceOptimizer class"""
    
    def setUp(self):
        """Set up test data"""
        # Create a performance optimizer with small cache for testing
        self.optimizer = PerformanceOptimizer(cache_size=10, cache_ttl=60, max_workers=4)
    
    def tearDown(self):
        """Clean up resources"""
        self.optimizer.shutdown()
    
    def test_memoize(self):
        """Test memoization decorator"""
        # Create a mock function with side effect to track calls
        mock_func = MagicMock(side_effect=lambda x: x * 2)
        
        # Apply memoization decorator
        memoized_func = self.optimizer.memoize(mock_func)
        
        # Call the function multiple times with the same argument
        result1 = memoized_func(5)
        result2 = memoized_func(5)
        result3 = memoized_func(10)
        
        # Verify results
        self.assertEqual(result1, 10)
        self.assertEqual(result2, 10)
        self.assertEqual(result3, 20)
        
        # Verify that the original function was called only twice
        self.assertEqual(mock_func.call_count, 2)
        mock_func.assert_any_call(5)
        mock_func.assert_any_call(10)
    
    def test_memoize_ttl(self):
        """Test memoization with time-to-live"""
        # Create a mock function with side effect to track calls
        mock_func = MagicMock(side_effect=lambda x: x * 2)
        
        # Apply memoization decorator
        memoized_func = self.optimizer.memoize(mock_func)
        
        # Call the function
        result1 = memoized_func(5)
        
        # Manually modify the cache timestamp to simulate expiration
        cache_key = "mock_func:5"
        with self.optimizer._cache_lock:
            result, timestamp = self.optimizer._cache[cache_key]
            self.optimizer._cache[cache_key] = (result, timestamp - timedelta(seconds=61))
        
        # Call the function again with the same argument
        result2 = memoized_func(5)
        
        # Verify results
        self.assertEqual(result1, 10)
        self.assertEqual(result2, 10)
        
        # Verify that the original function was called twice
        self.assertEqual(mock_func.call_count, 2)
    
    def test_memoize_cache_size(self):
        """Test memoization with cache size limit"""
        # Create a mock function with side effect to track calls
        mock_func = MagicMock(side_effect=lambda x: x * 2)
        
        # Apply memoization decorator
        memoized_func = self.optimizer.memoize(mock_func)
        
        # Fill the cache with 10 items (cache_size=10)
        for i in range(10):
            memoized_func(i)
        
        # Verify that all calls hit the original function
        self.assertEqual(mock_func.call_count, 10)
        
        # Call the function with a new argument, which should evict the oldest entry
        memoized_func(10)
        
        # Call all functions again
        for i in range(11):
            memoized_func(i)
        
        # Verify that the original function was called 11 times (10 initial + 1 new)
        # plus 1 more time for the oldest entry that was evicted
        self.assertEqual(mock_func.call_count, 12)
    
    def test_clear_cache(self):
        """Test clearing the cache"""
        # Create a mock function with side effect to track calls
        mock_func = MagicMock(side_effect=lambda x: x * 2)
        
        # Apply memoization decorator
        memoized_func = self.optimizer.memoize(mock_func)
        
        # Call the function
        memoized_func(5)
        
        # Clear the cache
        self.optimizer.clear_cache()
        
        # Call the function again with the same argument
        memoized_func(5)
        
        # Verify that the original function was called twice
        self.assertEqual(mock_func.call_count, 2)
    
    def test_run_in_thread(self):
        """Test running a function in a separate thread"""
        # Create a function that sleeps and returns a value
        def slow_function(x):
            time.sleep(0.1)
            return x * 2
        
        # Run the function in a thread
        future = self.optimizer.run_in_thread(slow_function, 5)
        
        # Verify that the future completes and returns the correct result
        result = future.result()
        self.assertEqual(result, 10)
    
    def test_run_in_process(self):
        """Test running a function in a separate process"""
        # Create a function that sleeps and returns a value
        def slow_function(x):
            time.sleep(0.1)
            return x * 2
        
        # Run the function in a process
        future = self.optimizer.run_in_process(slow_function, 5)
        
        # Verify that the future completes and returns the correct result
        result = future.result()
        self.assertEqual(result, 10)
    
    def test_map_parallel_threads(self):
        """Test parallel mapping with threads"""
        # Create a function that sleeps and returns a value
        def slow_function(x):
            time.sleep(0.1)
            return x * 2
        
        # Map the function over a list of items
        items = [1, 2, 3, 4, 5]
        results = self.optimizer.map_parallel(slow_function, items)
        
        # Verify results
        self.assertEqual(results, [2, 4, 6, 8, 10])
    
    def test_map_parallel_processes(self):
        """Test parallel mapping with processes"""
        # Create a function that sleeps and returns a value
        def slow_function(x):
            time.sleep(0.1)
            return x * 2
        
        # Map the function over a list of items
        items = [1, 2, 3, 4, 5]
        results = self.optimizer.map_parallel(slow_function, items, use_processes=True)
        
        # Verify results
        self.assertEqual(results, [2, 4, 6, 8, 10])
    
    def test_batch_process(self):
        """Test batch processing"""
        # Create a function that processes a batch of items
        def process_batch(batch):
            return [x * 2 for x in batch]
        
        # Process a list of items in batches
        items = list(range(25))
        results = self.optimizer.batch_process(process_batch, items, batch_size=10)
        
        # Verify results
        self.assertEqual(results, [x * 2 for x in items])
    
    def test_time_execution(self):
        """Test timing function execution"""
        # Create a function that sleeps and returns a value
        def slow_function(x):
            time.sleep(0.1)
            return x * 2
        
        # Time the execution of the function
        result, execution_time = self.optimizer.time_execution(slow_function, 5)
        
        # Verify result
        self.assertEqual(result, 10)
        
        # Verify that execution time is reasonable (slightly more than 0.1 seconds)
        self.assertGreaterEqual(execution_time, 0.1)
        self.assertLess(execution_time, 0.2)  # Allow some overhead
    
    def test_lazy_load(self):
        """Test lazy loading decorator"""
        # Create a mock function with side effect to track calls
        mock_func = MagicMock(side_effect=lambda: "expensive resource")
        
        # Apply lazy loading decorator
        lazy_func = self.optimizer.lazy_load(mock_func)
        
        # Verify that the function hasn't been called yet
        mock_func.assert_not_called()
        
        # Call the function multiple times
        result1 = lazy_func()
        result2 = lazy_func()
        
        # Verify results
        self.assertEqual(result1, "expensive resource")
        self.assertEqual(result2, "expensive resource")
        
        # Verify that the original function was called only once
        self.assertEqual(mock_func.call_count, 1)
    
    def test_rate_limit(self):
        """Test rate limiting decorator"""
        # Create a mock function with side effect to track calls
        mock_func = MagicMock(side_effect=lambda x: x * 2)
        
        # Apply rate limiting decorator (10 calls per second)
        rate_limited_func = self.optimizer.rate_limit(mock_func, 10)
        
        # Call the function multiple times and measure time
        start_time = time.time()
        for i in range(5):
            rate_limited_func(i)
        end_time = time.time()
        
        # Verify that all calls were made
        self.assertEqual(mock_func.call_count, 5)
        
        # Verify that the calls took at least 0.4 seconds (5 calls at 10 calls/second)
        # The first call is immediate, then 4 more calls at 0.1 second intervals
        execution_time = end_time - start_time
        self.assertGreaterEqual(execution_time, 0.4)
    
    def test_optimize_memory(self):
        """Test memory optimization decorator"""
        # Create a function that allocates memory
        def memory_intensive_func():
            # Allocate a large list
            large_list = [0] * 1000000
            return sum(large_list)
        
        # Apply memory optimization decorator
        optimized_func = self.optimizer.optimize_memory(memory_intensive_func)
        
        # Call the function
        result = optimized_func()
        
        # Verify result
        self.assertEqual(result, 0)

class TestGetPerformanceOptimizer(unittest.TestCase):
    """Test cases for get_performance_optimizer function"""
    
    def test_get_performance_optimizer(self):
        """Test getting the performance optimizer instance"""
        optimizer1 = get_performance_optimizer()
        optimizer2 = get_performance_optimizer()
        
        # Verify that the same instance is returned
        self.assertIs(optimizer1, optimizer2)
        self.assertIsInstance(optimizer1, PerformanceOptimizer)

if __name__ == "__main__":
    unittest.main()
