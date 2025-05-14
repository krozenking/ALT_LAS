#!/usr/bin/env python3
"""
Performance Profiler for Segmentation Service

This module provides tools for profiling and analyzing performance bottlenecks
in the Segmentation Service. It includes functions for memory profiling,
execution time profiling, and generating performance reports.
"""

import os
import time
import cProfile
import pstats
import io
import gc
import functools
import logging
import tracemalloc
import statistics
from typing import Any, Callable, Dict, List, Tuple, TypeVar, Optional, Union
from datetime import datetime
import matplotlib.pyplot as plt
import numpy as np
import psutil

# Type variable for generic function
T = TypeVar('T')

# Setup logging
logger = logging.getLogger(__name__)

class PerformanceProfiler:
    """
    Performance profiler for analyzing and optimizing code performance
    
    Features:
    - Function execution time profiling
    - Memory usage profiling
    - CPU usage profiling
    - Call frequency analysis
    - Performance bottleneck identification
    - Visualization of performance metrics
    """
    
    def __init__(self, output_dir: str = None):
        """
        Initialize performance profiler
        
        Args:
            output_dir: Directory to save profiling results (default: current directory)
        """
        self.output_dir = output_dir or os.path.join(os.path.dirname(__file__), "profiling_results")
        os.makedirs(self.output_dir, exist_ok=True)
        
        self.profiling_enabled = True
        self.memory_tracking_enabled = True
        self.function_stats = {}
        self.memory_snapshots = {}
        
        logger.info(f"Performance profiler initialized with output directory: {self.output_dir}")
    
    def profile_execution_time(self, func: Callable[..., T]) -> Callable[..., T]:
        """
        Decorator to profile function execution time
        
        Args:
            func: Function to profile
            
        Returns:
            Profiled function
        """
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            if not self.profiling_enabled:
                return func(*args, **kwargs)
            
            # Record start time
            start_time = time.time()
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Calculate execution time
            execution_time = time.time() - start_time
            
            # Update function stats
            func_name = func.__name__
            if func_name not in self.function_stats:
                self.function_stats[func_name] = {
                    "calls": 0,
                    "total_time": 0,
                    "min_time": float('inf'),
                    "max_time": 0,
                    "times": []
                }
            
            stats = self.function_stats[func_name]
            stats["calls"] += 1
            stats["total_time"] += execution_time
            stats["min_time"] = min(stats["min_time"], execution_time)
            stats["max_time"] = max(stats["max_time"], execution_time)
            stats["times"].append(execution_time)
            
            logger.debug(f"Function {func_name} executed in {execution_time:.6f} seconds")
            
            return result
        
        return wrapper
    
    def profile_memory_usage(self, func: Callable[..., T]) -> Callable[..., T]:
        """
        Decorator to profile function memory usage
        
        Args:
            func: Function to profile
            
        Returns:
            Profiled function
        """
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            if not self.memory_tracking_enabled:
                return func(*args, **kwargs)
            
            # Start memory tracking
            tracemalloc.start()
            
            # Record memory usage before execution
            process = psutil.Process()
            memory_before = process.memory_info().rss / 1024 / 1024  # MB
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Record memory usage after execution
            memory_after = process.memory_info().rss / 1024 / 1024  # MB
            memory_diff = memory_after - memory_before
            
            # Get memory snapshot
            snapshot = tracemalloc.take_snapshot()
            tracemalloc.stop()
            
            # Store memory snapshot
            func_name = func.__name__
            self.memory_snapshots[func_name] = snapshot
            
            logger.debug(f"Function {func_name} memory usage: {memory_diff:.2f} MB")
            
            return result
        
        return wrapper
    
    def profile_function(self, func: Callable[..., T]) -> Callable[..., T]:
        """
        Decorator to profile function execution time and memory usage
        
        Args:
            func: Function to profile
            
        Returns:
            Profiled function
        """
        # Apply both profiling decorators
        profiled_func = self.profile_execution_time(self.profile_memory_usage(func))
        return profiled_func
    
    def run_cprofile(self, func: Callable[..., T], *args, **kwargs) -> Tuple[T, str]:
        """
        Run cProfile on a function and return the result and profiling stats
        
        Args:
            func: Function to profile
            *args: Arguments to pass to the function
            **kwargs: Keyword arguments to pass to the function
            
        Returns:
            Tuple of (function result, profiling stats string)
        """
        # Create profiler
        profiler = cProfile.Profile()
        
        # Profile function execution
        profiler.enable()
        result = func(*args, **kwargs)
        profiler.disable()
        
        # Get profiling stats
        s = io.StringIO()
        ps = pstats.Stats(profiler, stream=s).sort_stats('cumulative')
        ps.print_stats()
        
        return result, s.getvalue()
    
    def save_cprofile_stats(self, func: Callable[..., T], *args, **kwargs) -> T:
        """
        Run cProfile on a function and save the stats to a file
        
        Args:
            func: Function to profile
            *args: Arguments to pass to the function
            **kwargs: Keyword arguments to pass to the function
            
        Returns:
            Function result
        """
        # Create profiler
        profiler = cProfile.Profile()
        
        # Profile function execution
        profiler.enable()
        result = func(*args, **kwargs)
        profiler.disable()
        
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{func.__name__}_{timestamp}.prof"
        filepath = os.path.join(self.output_dir, filename)
        
        # Save profiling stats
        profiler.dump_stats(filepath)
        logger.info(f"Saved cProfile stats to {filepath}")
        
        return result
    
    def analyze_memory_snapshot(self, func_name: str) -> List[Tuple[str, int]]:
        """
        Analyze memory snapshot for a function
        
        Args:
            func_name: Name of the function
            
        Returns:
            List of (trace, size) tuples
        """
        if func_name not in self.memory_snapshots:
            logger.warning(f"No memory snapshot found for function {func_name}")
            return []
        
        snapshot = self.memory_snapshots[func_name]
        top_stats = snapshot.statistics('lineno')
        
        return [(str(stat.traceback), stat.size) for stat in top_stats[:10]]
    
    def generate_performance_report(self) -> Dict[str, Any]:
        """
        Generate performance report from collected stats
        
        Returns:
            Dictionary with performance report data
        """
        report = {
            "timestamp": datetime.now().isoformat(),
            "function_stats": {},
            "system_info": {
                "cpu_count": psutil.cpu_count(),
                "memory_total": psutil.virtual_memory().total / (1024 * 1024),  # MB
                "memory_available": psutil.virtual_memory().available / (1024 * 1024),  # MB
                "cpu_percent": psutil.cpu_percent(interval=1)
            }
        }
        
        # Process function stats
        for func_name, stats in self.function_stats.items():
            if stats["calls"] > 0:
                avg_time = stats["total_time"] / stats["calls"]
                
                # Calculate percentiles if we have enough data
                percentiles = {}
                if len(stats["times"]) >= 10:
                    times = sorted(stats["times"])
                    percentiles = {
                        "50th": statistics.median(times),
                        "90th": times[int(0.9 * len(times))],
                        "95th": times[int(0.95 * len(times))],
                        "99th": times[int(0.99 * len(times))]
                    }
                
                report["function_stats"][func_name] = {
                    "calls": stats["calls"],
                    "total_time": stats["total_time"],
                    "avg_time": avg_time,
                    "min_time": stats["min_time"],
                    "max_time": stats["max_time"],
                    "percentiles": percentiles
                }
        
        return report
    
    def save_performance_report(self) -> str:
        """
        Save performance report to a file
        
        Returns:
            Path to the saved report file
        """
        import json
        
        # Generate report
        report = self.generate_performance_report()
        
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"performance_report_{timestamp}.json"
        filepath = os.path.join(self.output_dir, filename)
        
        # Save report
        with open(filepath, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Saved performance report to {filepath}")
        
        return filepath
    
    def visualize_execution_times(self, output_file: str = None) -> str:
        """
        Visualize function execution times
        
        Args:
            output_file: Output file path (default: auto-generated)
            
        Returns:
            Path to the saved visualization file
        """
        if not self.function_stats:
            logger.warning("No function stats available for visualization")
            return None
        
        # Generate filename if not provided
        if output_file is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = os.path.join(self.output_dir, f"execution_times_{timestamp}.png")
        
        # Prepare data
        func_names = []
        avg_times = []
        min_times = []
        max_times = []
        
        for func_name, stats in self.function_stats.items():
            if stats["calls"] > 0:
                func_names.append(func_name)
                avg_times.append(stats["total_time"] / stats["calls"])
                min_times.append(stats["min_time"])
                max_times.append(stats["max_time"])
        
        # Create figure
        plt.figure(figsize=(12, 8))
        
        # Create bar positions
        x = np.arange(len(func_names))
        width = 0.25
        
        # Create bars
        plt.bar(x - width, min_times, width, label='Min Time')
        plt.bar(x, avg_times, width, label='Avg Time')
        plt.bar(x + width, max_times, width, label='Max Time')
        
        # Add labels and title
        plt.xlabel('Function')
        plt.ylabel('Execution Time (seconds)')
        plt.title('Function Execution Times')
        plt.xticks(x, func_names, rotation=45, ha='right')
        plt.legend()
        
        # Adjust layout and save
        plt.tight_layout()
        plt.savefig(output_file)
        plt.close()
        
        logger.info(f"Saved execution time visualization to {output_file}")
        
        return output_file
    
    def visualize_call_frequency(self, output_file: str = None) -> str:
        """
        Visualize function call frequency
        
        Args:
            output_file: Output file path (default: auto-generated)
            
        Returns:
            Path to the saved visualization file
        """
        if not self.function_stats:
            logger.warning("No function stats available for visualization")
            return None
        
        # Generate filename if not provided
        if output_file is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = os.path.join(self.output_dir, f"call_frequency_{timestamp}.png")
        
        # Prepare data
        func_names = []
        call_counts = []
        
        for func_name, stats in self.function_stats.items():
            func_names.append(func_name)
            call_counts.append(stats["calls"])
        
        # Create figure
        plt.figure(figsize=(12, 8))
        
        # Create bars
        plt.bar(func_names, call_counts)
        
        # Add labels and title
        plt.xlabel('Function')
        plt.ylabel('Number of Calls')
        plt.title('Function Call Frequency')
        plt.xticks(rotation=45, ha='right')
        
        # Adjust layout and save
        plt.tight_layout()
        plt.savefig(output_file)
        plt.close()
        
        logger.info(f"Saved call frequency visualization to {output_file}")
        
        return output_file
    
    def reset_stats(self):
        """Reset all collected stats"""
        self.function_stats = {}
        self.memory_snapshots = {}
        gc.collect()
        logger.info("Performance profiler stats reset")
    
    def enable_profiling(self):
        """Enable profiling"""
        self.profiling_enabled = True
        logger.info("Profiling enabled")
    
    def disable_profiling(self):
        """Disable profiling"""
        self.profiling_enabled = False
        logger.info("Profiling disabled")
    
    def enable_memory_tracking(self):
        """Enable memory tracking"""
        self.memory_tracking_enabled = True
        logger.info("Memory tracking enabled")
    
    def disable_memory_tracking(self):
        """Disable memory tracking"""
        self.memory_tracking_enabled = False
        logger.info("Memory tracking disabled")

# Create a global instance
performance_profiler = PerformanceProfiler()

# Function to get the performance profiler instance
def get_performance_profiler() -> PerformanceProfiler:
    """
    Get the performance profiler instance
    
    Returns:
        Performance profiler instance
    """
    return performance_profiler

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Create a performance profiler
    profiler = PerformanceProfiler()
    
    # Example function to profile
    @profiler.profile_function
    def fibonacci(n):
        if n <= 1:
            return n
        return fibonacci(n-1) + fibonacci(n-2)
    
    # Run the function
    result = fibonacci(30)
    print(f"Fibonacci result: {result}")
    
    # Generate and save performance report
    report_path = profiler.save_performance_report()
    print(f"Performance report saved to: {report_path}")
    
    # Visualize execution times
    viz_path = profiler.visualize_execution_times()
    print(f"Execution time visualization saved to: {viz_path}")
    
    # Visualize call frequency
    freq_path = profiler.visualize_call_frequency()
    print(f"Call frequency visualization saved to: {freq_path}")
