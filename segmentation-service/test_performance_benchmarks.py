"""
Performance Benchmark Tests for ALT_LAS Segmentation Service

This module contains benchmark tests for the Segmentation Service,
measuring the performance of various operations.
"""

import time
import statistics
import random
import string
import unittest
from typing import List, Dict, Any, Tuple, Callable
import json
import os
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("benchmark_tests")

# Import modules to test
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dsl_schema import AltFile, TaskSegment, TaskParameter
from command_parser import get_command_parser
from alt_file_handler import get_alt_file_handler
from task_prioritization import get_task_prioritizer
from performance_optimizer import get_performance_optimizer, PerformanceOptimizer

class BenchmarkTests(unittest.TestCase):
    """Benchmark tests for Segmentation Service"""
    
    def setUp(self):
        """Set up test data"""
        self.parser = get_command_parser()
        self.file_handler = get_alt_file_handler()
        self.prioritizer = get_task_prioritizer()
        self.optimizer = get_performance_optimizer()
        
        # Sample commands for testing
        self.sample_commands = [
            "Dosyaları sırala ve en büyük 10 tanesini göster",
            "Tüm .jpg dosyalarını bir klasöre taşı ve sıkıştır",
            "Google'da yapay zeka hakkında arama yap ve sonuçları bir dosyaya kaydet",
            "Sistem performansını kontrol et ve bir rapor oluştur",
            "E-postalarımı kontrol et ve önemli olanları işaretle",
            "Masaüstündeki tüm dosyaları tarihlerine göre sırala",
            "Bir web sayfası oluştur ve localhost'ta çalıştır",
            "Python ile basit bir hesap makinesi programı yaz",
            "Veritabanındaki müşteri bilgilerini güncelle",
            "Bir makale yazıp PDF olarak kaydet"
        ]
        
        # Sample modes and personas
        self.modes = ["Normal", "Dream", "Explore", "Chaos"]
        self.personas = ["technical_expert", "creative_writer", "data_analyst", "system_admin"]
    
    def generate_random_command(self, length: int = 50) -> str:
        """Generate a random command string"""
        words = []
        for _ in range(random.randint(5, 15)):
            word_length = random.randint(3, 10)
            word = ''.join(random.choice(string.ascii_lowercase) for _ in range(word_length))
            words.append(word)
        return ' '.join(words)
    
    def run_benchmark(self, func: Callable, args: List[Any] = None, kwargs: Dict[str, Any] = None, 
                     iterations: int = 100) -> Dict[str, float]:
        """
        Run a benchmark test on a function
        
        Args:
            func: Function to benchmark
            args: Positional arguments for the function
            kwargs: Keyword arguments for the function
            iterations: Number of iterations to run
            
        Returns:
            Dictionary with benchmark results
        """
        if args is None:
            args = []
        if kwargs is None:
            kwargs = {}
        
        # Run the function once to warm up
        func(*args, **kwargs)
        
        # Run the benchmark
        times = []
        for _ in range(iterations):
            start_time = time.time()
            func(*args, **kwargs)
            end_time = time.time()
            execution_time = (end_time - start_time) * 1000  # Convert to milliseconds
            times.append(execution_time)
        
        # Calculate statistics
        min_time = min(times)
        max_time = max(times)
        avg_time = statistics.mean(times)
        percentile_95 = statistics.quantiles(times, n=20)[18]  # 95th percentile
        
        return {
            "min": min_time,
            "max": max_time,
            "avg": avg_time,
            "p95": percentile_95,
            "iterations": iterations
        }
    
    def test_command_parsing_performance(self):
        """Test the performance of command parsing"""
        logger.info("Running command parsing benchmark...")
        
        # Benchmark with sample commands
        results = []
        for command in self.sample_commands:
            mode = random.choice(self.modes)
            persona = random.choice(self.personas)
            
            result = self.run_benchmark(
                self.parser.parse_command,
                kwargs={
                    "command": command,
                    "mode": mode,
                    "persona": persona
                },
                iterations=10
            )
            
            results.append(result)
        
        # Calculate average results
        avg_min = statistics.mean([r["min"] for r in results])
        avg_max = statistics.mean([r["max"] for r in results])
        avg_avg = statistics.mean([r["avg"] for r in results])
        avg_p95 = statistics.mean([r["p95"] for r in results])
        
        logger.info(f"Command Parsing Benchmark Results (average of {len(results)} commands):")
        logger.info(f"- Minimum: {avg_min:.2f}ms")
        logger.info(f"- Maximum: {avg_max:.2f}ms")
        logger.info(f"- Average: {avg_avg:.2f}ms")
        logger.info(f"- 95th Percentile: {avg_p95:.2f}ms")
        
        # Test with memoization
        logger.info("Testing command parsing with memoization...")
        
        # Create a memoized version of parse_command
        memoized_parse = self.optimizer.memoize(self.parser.parse_command)
        
        # Run the same command multiple times
        command = self.sample_commands[0]
        mode = "Normal"
        persona = "technical_expert"
        
        # First run (not cached)
        first_run = self.run_benchmark(
            memoized_parse,
            kwargs={
                "command": command,
                "mode": mode,
                "persona": persona
            },
            iterations=1
        )
        
        # Second run (should be cached)
        second_run = self.run_benchmark(
            memoized_parse,
            kwargs={
                "command": command,
                "mode": mode,
                "persona": persona
            },
            iterations=10
        )
        
        logger.info("Memoization Results:")
        logger.info(f"- First run (not cached): {first_run['avg']:.2f}ms")
        logger.info(f"- Second run (cached): {second_run['avg']:.2f}ms")
        logger.info(f"- Speedup: {first_run['avg'] / second_run['avg']:.2f}x")
        
        # Verify that the second run is significantly faster
        self.assertLess(second_run["avg"], first_run["avg"] * 0.5)
    
    def test_alt_file_handling_performance(self):
        """Test the performance of ALT file handling"""
        logger.info("Running ALT file handling benchmark...")
        
        # Create sample ALT files
        alt_files = []
        for i in range(5):
            command = self.sample_commands[i % len(self.sample_commands)]
            mode = random.choice(self.modes)
            persona = random.choice(self.personas)
            
            alt_file = self.parser.parse_command(
                command=command,
                mode=mode,
                persona=persona
            )
            
            alt_files.append(alt_file)
        
        # Benchmark saving ALT files
        save_results = []
        for i, alt_file in enumerate(alt_files):
            filename = f"benchmark_test_{i}.alt.yaml"
            
            result = self.run_benchmark(
                self.file_handler.save_alt_file,
                args=[alt_file, filename],
                iterations=10
            )
            
            save_results.append(result)
            
            # Clean up the file
            try:
                os.remove(os.path.join(self.file_handler.alt_files_dir, filename))
            except:
                pass
        
        # Calculate average results for saving
        avg_min_save = statistics.mean([r["min"] for r in save_results])
        avg_max_save = statistics.mean([r["max"] for r in save_results])
        avg_avg_save = statistics.mean([r["avg"] for r in save_results])
        avg_p95_save = statistics.mean([r["p95"] for r in save_results])
        
        logger.info(f"ALT File Saving Benchmark Results (average of {len(save_results)} files):")
        logger.info(f"- Minimum: {avg_min_save:.2f}ms")
        logger.info(f"- Maximum: {avg_max_save:.2f}ms")
        logger.info(f"- Average: {avg_avg_save:.2f}ms")
        logger.info(f"- 95th Percentile: {avg_p95_save:.2f}ms")
    
    def test_task_prioritization_performance(self):
        """Test the performance of task prioritization"""
        logger.info("Running task prioritization benchmark...")
        
        # Create sample ALT files with varying numbers of segments
        alt_files = []
        for num_segments in [5, 10, 20, 50]:
            command = self.generate_random_command(100)
            mode = random.choice(self.modes)
            persona = random.choice(self.personas)
            
            alt_file = self.parser.parse_command(
                command=command,
                mode=mode,
                persona=persona
            )
            
            # Add more segments if needed
            while len(alt_file.segments) < num_segments:
                segment = TaskSegment(
                    id=f"segment_{len(alt_file.segments)}",
                    task_type=random.choice(["file", "web", "system", "data"]),
                    content=self.generate_random_command(30),
                    parameters=[],
                    dependencies=[],
                    metadata={}
                )
                alt_file.segments.append(segment)
            
            # Trim segments if needed
            alt_file.segments = alt_file.segments[:num_segments]
            
            alt_files.append((alt_file, num_segments))
        
        # Benchmark prioritization
        for alt_file, num_segments in alt_files:
            result = self.run_benchmark(
                self.prioritizer.prioritize_alt_file,
                args=[alt_file],
                iterations=10
            )
            
            logger.info(f"Task Prioritization Benchmark Results ({num_segments} segments):")
            logger.info(f"- Minimum: {result['min']:.2f}ms")
            logger.info(f"- Maximum: {result['max']:.2f}ms")
            logger.info(f"- Average: {result['avg']:.2f}ms")
            logger.info(f"- 95th Percentile: {result['p95']:.2f}ms")
    
    def test_parallel_processing_performance(self):
        """Test the performance of parallel processing"""
        logger.info("Running parallel processing benchmark...")
        
        # Create a test function that simulates work
        def process_item(item):
            time.sleep(0.01)  # Simulate work
            return item * 2
        
        # Create test data
        items = list(range(100))
        
        # Benchmark serial processing
        start_time = time.time()
        serial_results = [process_item(item) for item in items]
        serial_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        # Benchmark parallel processing with threads
        start_time = time.time()
        thread_results = self.optimizer.map_parallel(process_item, items)
        thread_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        # Benchmark parallel processing with processes
        start_time = time.time()
        process_results = self.optimizer.map_parallel(process_item, items, use_processes=True)
        process_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        # Benchmark batch processing
        def process_batch(batch):
            return [process_item(item) for item in batch]
        
        start_time = time.time()
        batch_results = self.optimizer.batch_process(process_batch, items, batch_size=10)
        batch_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        logger.info("Parallel Processing Benchmark Results:")
        logger.info(f"- Serial processing: {serial_time:.2f}ms")
        logger.info(f"- Thread pool: {thread_time:.2f}ms (Speedup: {serial_time/thread_time:.2f}x)")
        logger.info(f"- Process pool: {process_time:.2f}ms (Speedup: {serial_time/process_time:.2f}x)")
        logger.info(f"- Batch processing: {batch_time:.2f}ms (Speedup: {serial_time/batch_time:.2f}x)")
        
        # Verify that parallel processing is faster
        self.assertLess(thread_time, serial_time)
        self.assertLess(process_time, serial_time)
        
        # Verify that results are correct
        self.assertEqual(serial_results, thread_results)
        self.assertEqual(serial_results, process_results)
        self.assertEqual(serial_results, batch_results)

if __name__ == "__main__":
    unittest.main()
