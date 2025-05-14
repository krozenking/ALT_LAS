#!/usr/bin/env python3
"""
Test for Prioritization Visualizer

This module contains tests for the prioritization visualizer.
"""

import unittest
import os
import json
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend for testing
import shutil
from pathlib import Path
from dsl_schema import AltFile, TaskSegment, TaskParameter
from prioritization_visualizer import PrioritizationVisualizer, get_prioritization_visualizer

class TestPrioritizationVisualizer(unittest.TestCase):
    """Test cases for PrioritizationVisualizer class"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Create test output directory
        self.test_output_dir = Path("./test_visualizations")
        os.makedirs(self.test_output_dir, exist_ok=True)
        
        # Create a visualizer with test output directory
        self.visualizer = PrioritizationVisualizer()
        self.visualizer.output_dir = str(self.test_output_dir)
        
        # Create sample ALT file for testing
        param1 = TaskParameter(
            name="query",
            value="information about AI",
            type="string",
            required=True
        )
        
        param2 = TaskParameter(
            name="format",
            value="pdf",
            type="string",
            required=True
        )
        
        param3 = TaskParameter(
            name="subject",
            value="AI research papers",
            type="string",
            required=True
        )
        
        segment1 = TaskSegment(
            id="task1",
            task_type="search",
            content="Search for information about AI",
            parameters=[param1],
            metadata={"priority_score": 0.8, "execution_order": 1}
        )
        
        segment2 = TaskSegment(
            id="task2",
            task_type="create",
            content="Create a report",
            parameters=[param2],
            dependencies=["task1"],
            metadata={"priority_score": 0.6, "execution_order": 3}
        )
        
        segment3 = TaskSegment(
            id="task3",
            task_type="analyze",
            content="Analyze AI research papers",
            parameters=[param3],
            dependencies=["task1"],
            metadata={"priority_score": 0.7, "execution_order": 2}
        )
        
        self.alt_file = AltFile(
            id="test_alt_file",
            command="Search for information about AI, analyze research papers, and create a report",
            language="en",
            mode="Normal",
            persona="researcher",
            segments=[segment1, segment2, segment3],
            metadata={"source": "user_input"}
        )
    
    def tearDown(self):
        """Tear down test fixtures"""
        # Remove test output directory
        if os.path.exists(self.test_output_dir):
            shutil.rmtree(self.test_output_dir)
    
    def test_generate_dependency_graph_png(self):
        """Test generating dependency graph in PNG format"""
        # Generate dependency graph
        result = self.visualizer.generate_dependency_graph(self.alt_file, "png")
        
        # Verify result
        self.assertEqual(result["format"], "png")
        self.assertTrue("data" in result)
        self.assertTrue("filename" in result)
        self.assertTrue("filepath" in result)
        
        # Verify file exists
        self.assertTrue(os.path.exists(result["filepath"]))
    
    def test_generate_dependency_graph_json(self):
        """Test generating dependency graph in JSON format"""
        # Generate dependency graph
        result = self.visualizer.generate_dependency_graph(self.alt_file, "json")
        
        # Verify result
        self.assertEqual(result["format"], "json")
        self.assertTrue("data" in result)
        self.assertTrue("filename" in result)
        self.assertTrue("filepath" in result)
        
        # Verify file exists
        self.assertTrue(os.path.exists(result["filepath"]))
        
        # Verify JSON content
        with open(result["filepath"], "r") as f:
            data = json.load(f)
        
        self.assertTrue("nodes" in data)
        self.assertTrue("links" in data)
        self.assertEqual(len(data["nodes"]), 3)
        self.assertEqual(len(data["links"]), 2)
    
    def test_generate_priority_chart(self):
        """Test generating priority chart"""
        # Generate priority chart
        result = self.visualizer.generate_priority_chart(self.alt_file, "png")
        
        # Verify result
        self.assertEqual(result["format"], "png")
        self.assertTrue("data" in result)
        self.assertTrue("filename" in result)
        self.assertTrue("filepath" in result)
        
        # Verify file exists
        self.assertTrue(os.path.exists(result["filepath"]))
    
    def test_generate_execution_timeline(self):
        """Test generating execution timeline"""
        # Generate execution timeline
        result = self.visualizer.generate_execution_timeline(self.alt_file, "png")
        
        # Verify result
        self.assertEqual(result["format"], "png")
        self.assertTrue("data" in result)
        self.assertTrue("filename" in result)
        self.assertTrue("filepath" in result)
        
        # Verify file exists
        self.assertTrue(os.path.exists(result["filepath"]))
    
    def test_generate_all_visualizations(self):
        """Test generating all visualizations"""
        # Generate all visualizations
        result = self.visualizer.generate_all_visualizations(self.alt_file, "png")
        
        # Verify result
        self.assertTrue("dependency_graph" in result)
        self.assertTrue("priority_chart" in result)
        self.assertTrue("execution_timeline" in result)
        self.assertTrue("json_data" in result)
        
        # Verify files exist
        self.assertTrue(os.path.exists(result["dependency_graph"]["filepath"]))
        self.assertTrue(os.path.exists(result["priority_chart"]["filepath"]))
        self.assertTrue(os.path.exists(result["execution_timeline"]["filepath"]))
        self.assertTrue(os.path.exists(result["json_data"]["filepath"]))
    
    def test_invalid_output_format(self):
        """Test handling invalid output format"""
        # Attempt to generate with invalid format
        with self.assertRaises(ValueError):
            self.visualizer.generate_dependency_graph(self.alt_file, "invalid")

class TestGetPrioritizationVisualizer(unittest.TestCase):
    """Test cases for get_prioritization_visualizer function"""
    
    def test_get_prioritization_visualizer(self):
        """Test getting the prioritization visualizer instance"""
        visualizer1 = get_prioritization_visualizer()
        visualizer2 = get_prioritization_visualizer()
        
        # Verify that the same instance is returned
        self.assertIs(visualizer1, visualizer2)
        self.assertIsInstance(visualizer1, PrioritizationVisualizer)

if __name__ == "__main__":
    unittest.main()
