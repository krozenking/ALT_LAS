#!/usr/bin/env python3
"""
Performance Tests for Segmentation Service

This module contains performance tests for the Segmentation Service components.
"""

import unittest
import time
import os
import json
import tempfile
import matplotlib.pyplot as plt
from pathlib import Path
import numpy as np
from dsl_schema import AltFile, TaskSegment, TaskParameter
from task_prioritization import TaskPrioritizer
from prioritization_visualizer import PrioritizationVisualizer

class TestTaskPrioritizationPerformance(unittest.TestCase):
    """Performance tests for TaskPrioritizer"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Create a prioritizer
        self.prioritizer = TaskPrioritizer()
        
        # Create reports directory
        self.reports_dir = Path("./performance_reports")
        self.reports_dir.mkdir(exist_ok=True)
        
        # Create sample segments for testing
        self.segments = []
        for i in range(100):  # Create 100 segments for testing
            segment = TaskSegment(
                id=f"task{i}",
                task_type=["search", "create", "analyze", "execute"][i % 4],
                content=f"Task {i} content",
                parameters=[],
                dependencies=[f"task{j}" for j in range(i) if j % 5 == 0],  # Add some dependencies
                metadata={"confidence": 0.5 + (i % 10) / 20}  # Vary confidence between 0.5 and 0.95
            )
            self.segments.append(segment)
    
    def tearDown(self):
        """Tear down test fixtures"""
        pass
    
    def test_prioritization_performance_scaling(self):
        """Test prioritization performance with increasing number of segments"""
        # Define segment counts to test
        segment_counts = [5, 10, 20, 50, 100]
        
        # Store results
        execution_times = []
        
        # Run tests for each segment count
        for count in segment_counts:
            # Create ALT file with specified number of segments
            alt_file = AltFile(
                id=f"perf_test_{count}",
                command="Performance test command",
                language="en",
                mode="Normal",
                persona="tester",
                segments=self.segments[:count],
                metadata={"test_type": "performance"}
            )
            
            # Measure execution time
            start_time = time.time()
            self.prioritizer.prioritize_alt_file(alt_file)
            end_time = time.time()
            
            # Calculate execution time in milliseconds
            execution_time = (end_time - start_time) * 1000
            execution_times.append(execution_time)
            
            print(f"Prioritizing {count} segments took {execution_time:.2f} ms")
        
        # Generate performance report
        self._generate_performance_report(segment_counts, execution_times)
        
        # Verify that execution time scales reasonably
        # For small segment counts, we expect roughly linear scaling
        # This is a simple check to catch major performance regressions
        if len(execution_times) >= 2:
            # Calculate scaling factor between smallest and largest segment count
            scaling_factor = segment_counts[-1] / segment_counts[0]
            time_factor = execution_times[-1] / execution_times[0]
            
            # We expect time_factor to be less than scaling_factor^2
            # This allows for some non-linear scaling but catches major issues
            self.assertLess(time_factor, scaling_factor ** 2)
    
    def test_prioritization_with_complex_dependencies(self):
        """Test prioritization performance with complex dependency structures"""
        # Create segments with complex dependencies
        complex_segments = []
        for i in range(50):
            # Create dependencies that form a complex graph
            # Each segment depends on multiple previous segments
            dependencies = []
            for j in range(i):
                if (i - j) % 3 == 0 or (i - j) % 7 == 0:
                    dependencies.append(f"complex_task{j}")
            
            segment = TaskSegment(
                id=f"complex_task{i}",
                task_type=["search", "create", "analyze", "execute"][i % 4],
                content=f"Complex task {i}",
                parameters=[],
                dependencies=dependencies,
                metadata={"confidence": 0.7 + (i % 6) / 20}
            )
            complex_segments.append(segment)
        
        # Create ALT file with complex segments
        alt_file = AltFile(
            id="complex_dependencies_test",
            command="Test with complex dependencies",
            language="en",
            mode="Normal",
            persona="tester",
            segments=complex_segments,
            metadata={"test_type": "complex_dependencies"}
        )
        
        # Measure execution time
        start_time = time.time()
        prioritized_alt = self.prioritizer.prioritize_alt_file(alt_file)
        end_time = time.time()
        
        # Calculate execution time in milliseconds
        execution_time = (end_time - start_time) * 1000
        
        print(f"Prioritizing with complex dependencies took {execution_time:.2f} ms")
        
        # Verify that all segments have execution orders
        for segment in prioritized_alt.segments:
            self.assertIn("execution_order", segment.metadata)
        
        # Verify that execution orders respect dependencies
        for segment in prioritized_alt.segments:
            segment_order = segment.metadata["execution_order"]
            for dep_id in segment.dependencies:
                # Find the dependency segment
                dep_segment = next((s for s in prioritized_alt.segments if s.id == dep_id), None)
                if dep_segment:
                    dep_order = dep_segment.metadata["execution_order"]
                    # Dependency must be executed before dependent segment
                    self.assertGreater(segment_order, dep_order)
    
    def test_prioritization_with_varying_weights(self):
        """Test prioritization performance with varying weights"""
        # Define weight configurations to test
        weight_configs = [
            {"dependency_weight": 0.7, "urgency_weight": 0.1, "user_preference_weight": 0.1, "confidence_weight": 0.1},
            {"dependency_weight": 0.1, "urgency_weight": 0.7, "user_preference_weight": 0.1, "confidence_weight": 0.1},
            {"dependency_weight": 0.1, "urgency_weight": 0.1, "user_preference_weight": 0.7, "confidence_weight": 0.1},
            {"dependency_weight": 0.1, "urgency_weight": 0.1, "user_preference_weight": 0.1, "confidence_weight": 0.7},
            {"dependency_weight": 0.25, "urgency_weight": 0.25, "user_preference_weight": 0.25, "confidence_weight": 0.25}
        ]
        
        # Create ALT file for testing
        alt_file = AltFile(
            id="weight_test",
            command="Test with varying weights",
            language="en",
            mode="Normal",
            persona="tester",
            segments=self.segments[:20],  # Use 20 segments for this test
            metadata={"test_type": "varying_weights"}
        )
        
        # Store results
        execution_times = []
        
        # Run tests for each weight configuration
        for i, config in enumerate(weight_configs):
            # Update prioritizer weights
            self.prioritizer.update_config(config)
            
            # Measure execution time
            start_time = time.time()
            self.prioritizer.prioritize_alt_file(alt_file)
            end_time = time.time()
            
            # Calculate execution time in milliseconds
            execution_time = (end_time - start_time) * 1000
            execution_times.append(execution_time)
            
            print(f"Configuration {i+1}: {execution_time:.2f} ms")
        
        # Verify that execution times are reasonably consistent
        # Weight changes shouldn't drastically affect performance
        if execution_times:
            avg_time = sum(execution_times) / len(execution_times)
            for time in execution_times:
                # Each time should be within 50% of the average
                self.assertLess(abs(time - avg_time) / avg_time, 0.5)
    
    def _generate_performance_report(self, segment_counts, execution_times):
        """Generate performance report with charts"""
        # Create figure
        plt.figure(figsize=(10, 6))
        
        # Create bar chart
        plt.bar(range(len(segment_counts)), execution_times, tick_label=segment_counts)
        
        # Add labels and title
        plt.xlabel("Number of Segments")
        plt.ylabel("Execution Time (ms)")
        plt.title("Task Prioritization Performance Scaling")
        
        # Add grid
        plt.grid(axis="y", linestyle="--", alpha=0.7)
        
        # Save chart
        chart_path = self.reports_dir / "prioritization_performance.png"
        plt.savefig(chart_path)
        plt.close()
        
        # Create JSON report
        report = {
            "timestamp": time.time(),
            "test_name": "prioritization_performance_scaling",
            "segment_counts": segment_counts,
            "execution_times": execution_times,
            "avg_time_per_segment": [time / count for time, count in zip(execution_times, segment_counts)]
        }
        
        # Save report
        report_path = self.reports_dir / "prioritization_performance.json"
        with open(report_path, "w") as f:
            json.dump(report, f, indent=2)
        
        print(f"Performance report generated: {report_path}")
        print(f"Performance chart generated: {chart_path}")

class TestVisualizerPerformance(unittest.TestCase):
    """Performance tests for PrioritizationVisualizer"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Create a prioritizer
        self.prioritizer = TaskPrioritizer()
        
        # Create a visualizer
        self.visualizer = PrioritizationVisualizer()
        
        # Create test output directory
        self.test_output_dir = tempfile.mkdtemp()
        self.visualizer.output_dir = self.test_output_dir
        
        # Create reports directory
        self.reports_dir = Path("./performance_reports")
        self.reports_dir.mkdir(exist_ok=True)
        
        # Create sample segments for testing
        self.segments = []
        for i in range(100):  # Create 100 segments for testing
            segment = TaskSegment(
                id=f"task{i}",
                task_type=["search", "create", "analyze", "execute"][i % 4],
                content=f"Task {i} content",
                parameters=[],
                dependencies=[f"task{j}" for j in range(i) if j % 5 == 0],  # Add some dependencies
                metadata={
                    "confidence": 0.5 + (i % 10) / 20,  # Vary confidence between 0.5 and 0.95
                    "priority_score": 0.5 + (i % 10) / 20,
                    "execution_order": i + 1
                }
            )
            self.segments.append(segment)
    
    def tearDown(self):
        """Tear down test fixtures"""
        # Remove test output directory
        if os.path.exists(self.test_output_dir):
            import shutil
            shutil.rmtree(self.test_output_dir)
    
    def test_visualization_performance_scaling(self):
        """Test visualization performance with increasing number of segments"""
        # Define segment counts to test
        segment_counts = [5, 10, 20, 50, 100]
        
        # Store results
        execution_times = {
            "dependency_graph": [],
            "priority_chart": [],
            "execution_timeline": [],
            "all_visualizations": []
        }
        
        # Run tests for each segment count
        for count in segment_counts:
            # Create ALT file with specified number of segments
            alt_file = AltFile(
                id=f"viz_perf_test_{count}",
                command="Visualization performance test command",
                language="en",
                mode="Normal",
                persona="tester",
                segments=self.segments[:count],
                metadata={"test_type": "visualization_performance"}
            )
            
            # Test dependency graph generation
            start_time = time.time()
            self.visualizer.generate_dependency_graph(alt_file, "png")
            end_time = time.time()
            execution_times["dependency_graph"].append((end_time - start_time) * 1000)
            
            # Test priority chart generation
            start_time = time.time()
            self.visualizer.generate_priority_chart(alt_file, "png")
            end_time = time.time()
            execution_times["priority_chart"].append((end_time - start_time) * 1000)
            
            # Test execution timeline generation
            start_time = time.time()
            self.visualizer.generate_execution_timeline(alt_file, "png")
            end_time = time.time()
            execution_times["execution_timeline"].append((end_time - start_time) * 1000)
            
            # Test all visualizations generation
            start_time = time.time()
            self.visualizer.generate_all_visualizations(alt_file, "png")
            end_time = time.time()
            execution_times["all_visualizations"].append((end_time - start_time) * 1000)
            
            print(f"Visualizing {count} segments:")
            print(f"  Dependency graph: {execution_times['dependency_graph'][-1]:.2f} ms")
            print(f"  Priority chart: {execution_times['priority_chart'][-1]:.2f} ms")
            print(f"  Execution timeline: {execution_times['execution_timeline'][-1]:.2f} ms")
            print(f"  All visualizations: {execution_times['all_visualizations'][-1]:.2f} ms")
        
        # Generate performance report
        self._generate_visualization_performance_report(segment_counts, execution_times)
        
        # Verify that execution time scales reasonably
        # For visualization, we expect potentially non-linear scaling
        # This is a simple check to catch major performance regressions
        if len(segment_counts) >= 2:
            # Calculate scaling factor between smallest and largest segment count
            scaling_factor = segment_counts[-1] / segment_counts[0]
            
            for viz_type, times in execution_times.items():
                if times:
                    time_factor = times[-1] / times[0]
                    
                    # We expect time_factor to be less than scaling_factor^2.5
                    # Visualization can be more non-linear than prioritization
                    self.assertLess(time_factor, scaling_factor ** 2.5)
    
    def _generate_visualization_performance_report(self, segment_counts, execution_times):
        """Generate visualization performance report with charts"""
        # Create figure
        plt.figure(figsize=(12, 8))
        
        # Create line chart
        for viz_type, times in execution_times.items():
            plt.plot(segment_counts, times, marker='o', label=viz_type)
        
        # Add labels and title
        plt.xlabel("Number of Segments")
        plt.ylabel("Execution Time (ms)")
        plt.title("Visualization Performance Scaling")
        
        # Add legend
        plt.legend()
        
        # Add grid
        plt.grid(linestyle="--", alpha=0.7)
        
        # Save chart
        chart_path = self.reports_dir / "visualization_performance.png"
        plt.savefig(chart_path)
        plt.close()
        
        # Create JSON report
        report = {
            "timestamp": time.time(),
            "test_name": "visualization_performance_scaling",
            "segment_counts": segment_counts,
            "execution_times": execution_times,
            "avg_time_per_segment": {
                viz_type: [time / count for time, count in zip(times, segment_counts)]
                for viz_type, times in execution_times.items()
            }
        }
        
        # Save report
        report_path = self.reports_dir / "visualization_performance.json"
        with open(report_path, "w") as f:
            json.dump(report, f, indent=2)
        
        print(f"Visualization performance report generated: {report_path}")
        print(f"Visualization performance chart generated: {chart_path}")

if __name__ == "__main__":
    unittest.main()
