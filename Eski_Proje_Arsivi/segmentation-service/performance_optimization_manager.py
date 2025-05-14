#!/usr/bin/env python3
"""
Performance Optimization Integration for Segmentation Service

This module integrates all performance optimization components into the Segmentation Service.
It provides a unified interface for using the various optimization tools.
"""

import os
import time
import logging
from typing import Any, Callable, Dict, List, TypeVar, Optional, Union

# Import optimization components
from performance_profiler import get_performance_profiler
from memory_optimizer import get_memory_optimizer
from enhanced_cache_system import get_cache_manager
from parallel_processing_optimizer import get_parallel_optimizer
from regex_optimizer import get_regex_optimizer, optimize_regex

# Type variable for generic function
T = TypeVar('T')

# Setup logging
logger = logging.getLogger(__name__)

class PerformanceOptimizationManager:
    """
    Performance optimization manager for Segmentation Service
    
    This class integrates all performance optimization components:
    - Performance profiling
    - Memory optimization
    - Caching
    - Parallel processing
    - Regex optimization
    """
    
    def __init__(self):
        """Initialize performance optimization manager"""
        # Get component instances
        self.profiler = get_performance_profiler()
        self.memory_optimizer = get_memory_optimizer()
        self.cache_manager = get_cache_manager()
        self.parallel_optimizer = get_parallel_optimizer()
        self.regex_optimizer = get_regex_optimizer()
        
        # Configuration
        self.optimization_enabled = True
        
        logger.info("Performance optimization manager initialized")
    
    def optimize(self, func: Callable[..., T]) -> Callable[..., T]:
        """
        Decorator to apply all optimizations to a function
        
        Args:
            func: Function to optimize
            
        Returns:
            Optimized function
        """
        # Apply optimizations in order
        optimized_func = func
        
        # 1. Profile execution time
        optimized_func = self.profiler.profile_execution_time(optimized_func)
        
        # 2. Optimize memory usage
        optimized_func = self.memory_optimizer.memory_efficient(optimized_func)
        
        # 3. Cache function results
        optimized_func = self.cache_manager.memoize(optimized_func)
        
        # 4. Optimize regex operations
        optimized_func = optimize_regex(optimized_func)
        
        return optimized_func
    
    def optimize_memory_critical(self, func: Callable[..., T]) -> Callable[..., T]:
        """
        Decorator for memory-critical functions
        
        Args:
            func: Function to optimize
            
        Returns:
            Optimized function
        """
        # Apply memory-focused optimizations
        optimized_func = func
        
        # 1. Profile memory usage
        optimized_func = self.profiler.profile_memory_usage(optimized_func)
        
        # 2. Optimize memory usage
        optimized_func = self.memory_optimizer.memory_efficient(optimized_func)
        
        return optimized_func
    
    def optimize_cpu_critical(self, func: Callable[..., T]) -> Callable[..., T]:
        """
        Decorator for CPU-critical functions
        
        Args:
            func: Function to optimize
            
        Returns:
            Optimized function
        """
        # Apply CPU-focused optimizations
        optimized_func = func
        
        # 1. Profile execution time
        optimized_func = self.profiler.profile_execution_time(optimized_func)
        
        # 2. Cache function results
        optimized_func = self.cache_manager.memoize(optimized_func)
        
        # 3. Optimize regex operations
        optimized_func = optimize_regex(optimized_func)
        
        return optimized_func
    
    def lazy_load(self, func: Callable[..., T]) -> Callable[..., T]:
        """
        Decorator for lazy loading of resources
        
        Args:
            func: Function that loads a resource
            
        Returns:
            Function that lazily loads the resource
        """
        return self.memory_optimizer.lazy_load(func)
    
    def parallelize(self, func: Callable[..., T], use_processes: bool = False) -> Callable[..., List[T]]:
        """
        Decorator to parallelize a function
        
        Args:
            func: Function to parallelize
            use_processes: Whether to use processes instead of threads
            
        Returns:
            Parallelized function
        """
        return self.parallel_optimizer.parallel_decorator(use_processes=use_processes)(func)
    
    def enable_optimizations(self):
        """Enable all optimizations"""
        self.optimization_enabled = True
        self.profiler.enable_profiling()
        logger.info("Performance optimizations enabled")
    
    def disable_optimizations(self):
        """Disable all optimizations"""
        self.optimization_enabled = False
        self.profiler.disable_profiling()
        logger.info("Performance optimizations disabled")
    
    def generate_performance_report(self) -> Dict[str, Any]:
        """
        Generate comprehensive performance report
        
        Returns:
            Dictionary with performance report data
        """
        report = {
            "timestamp": time.time(),
            "profiling": self.profiler.generate_performance_report(),
            "memory": self.memory_optimizer.get_memory_usage_report(),
            "cache": self.cache_manager.get_cache_stats(),
            "regex": self.regex_optimizer.get_pattern_stats()
        }
        
        return report
    
    def save_performance_report(self, output_dir: str = None) -> str:
        """
        Save performance report to file
        
        Args:
            output_dir: Directory to save report (default: profiling_results)
            
        Returns:
            Path to saved report file
        """
        import json
        
        # Set default output directory
        if output_dir is None:
            output_dir = os.path.join(os.path.dirname(__file__), "profiling_results")
        
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate report
        report = self.generate_performance_report()
        
        # Generate filename
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = f"performance_report_{timestamp}.json"
        filepath = os.path.join(output_dir, filename)
        
        # Save report
        with open(filepath, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Performance report saved to {filepath}")
        
        return filepath
    
    def visualize_performance(self, output_dir: str = None) -> List[str]:
        """
        Generate performance visualizations
        
        Args:
            output_dir: Directory to save visualizations (default: profiling_results)
            
        Returns:
            List of paths to visualization files
        """
        # Set default output directory
        if output_dir is None:
            output_dir = os.path.join(os.path.dirname(__file__), "profiling_results")
        
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate visualizations
        viz_files = []
        
        # Execution time visualization
        exec_time_viz = self.profiler.visualize_execution_times()
        if exec_time_viz:
            viz_files.append(exec_time_viz)
        
        # Call frequency visualization
        call_freq_viz = self.profiler.visualize_call_frequency()
        if call_freq_viz:
            viz_files.append(call_freq_viz)
        
        return viz_files
    
    def cleanup(self):
        """Clean up resources and optimize memory"""
        # Clear caches
        self.cache_manager.invalidate_all_caches()
        self.regex_optimizer.clear_cache()
        
        # Clean up memory
        self.memory_optimizer.cleanup()
        
        # Reset profiler stats
        self.profiler.reset_stats()
        
        # Shutdown parallel optimizer
        self.parallel_optimizer.shutdown(wait=True)
        
        logger.info("Performance optimization manager cleanup completed")

# Create a global instance
optimization_manager = PerformanceOptimizationManager()

# Function to get the performance optimization manager instance
def get_optimization_manager() -> PerformanceOptimizationManager:
    """
    Get the performance optimization manager instance
    
    Returns:
        Performance optimization manager instance
    """
    return optimization_manager

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Create a performance optimization manager
    manager = PerformanceOptimizationManager()
    
    # Example of optimized function
    @manager.optimize
    def fibonacci(n):
        if n <= 1:
            return n
        return fibonacci(n-1) + fibonacci(n-2)
    
    # Example of memory-critical function
    @manager.optimize_memory_critical
    def process_large_data(size):
        data = [i for i in range(size)]
        result = sum(data)
        return result
    
    # Example of CPU-critical function
    @manager.optimize_cpu_critical
    def compute_prime_factors(n):
        factors = []
        d = 2
        while n > 1:
            while n % d == 0:
                factors.append(d)
                n //= d
            d += 1
            if d*d > n:
                if n > 1:
                    factors.append(n)
                break
        return factors
    
    # Example of lazy loading
    @manager.lazy_load
    def load_large_resource():
        logger.info("Loading large resource...")
        large_list = [0] * 1000000
        return large_list
    
    # Example of parallelized function
    @manager.parallelize
    def process_item(item):
        time.sleep(0.1)  # Simulate work
        return item * 2
    
    # Test optimized functions
    logger.info("Testing optimized fibonacci function...")
    result = fibonacci(30)
    logger.info(f"Fibonacci result: {result}")
    
    logger.info("Testing memory-critical function...")
    result = process_large_data(1000000)
    logger.info(f"Process large data result: {result}")
    
    logger.info("Testing CPU-critical function...")
    result = compute_prime_factors(123456789)
    logger.info(f"Prime factors: {result}")
    
    logger.info("Testing lazy loading...")
    resource = load_large_resource()
    resource = load_large_resource()  # Should use cached resource
    
    logger.info("Testing parallelized function...")
    items = list(range(10))
    results = process_item(items)
    logger.info(f"Parallel processing results: {results}")
    
    # Generate and save performance report
    report_path = manager.save_performance_report()
    logger.info(f"Performance report saved to: {report_path}")
    
    # Generate visualizations
    viz_paths = manager.visualize_performance()
    logger.info(f"Performance visualizations saved to: {viz_paths}")
    
    # Clean up
    manager.cleanup()
    logger.info("Cleanup completed")
