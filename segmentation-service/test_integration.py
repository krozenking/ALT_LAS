#!/usr/bin/env python3
"""
Integration Tests for Segmentation Service

This module contains integration tests for the Segmentation Service components.
"""

import unittest
import os
import json
import tempfile
from fastapi.testclient import TestClient
from dsl_schema import AltFile, TaskSegment, TaskParameter
from task_prioritization import TaskPrioritizer
from prioritization_visualizer import PrioritizationVisualizer
from enhanced_main import app

class TestSegmentationServiceIntegration(unittest.TestCase):
    """Integration tests for Segmentation Service components"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Create test client
        self.client = TestClient(app)
        
        # Create test data directory
        self.test_data_dir = tempfile.mkdtemp()
        
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
        
        segment1 = TaskSegment(
            id="task1",
            task_type="search",
            content="Search for information about AI",
            parameters=[param1],
            metadata={"confidence": 0.95}
        )
        
        segment2 = TaskSegment(
            id="task2",
            task_type="create",
            content="Create a report",
            parameters=[param2],
            dependencies=["task1"],
            metadata={"confidence": 0.9, "urgency": "high"}
        )
        
        self.alt_file = AltFile(
            id="test_alt_file",
            command="Search for information about AI and create a report",
            language="en",
            mode="Normal",
            persona="researcher",
            segments=[segment1, segment2],
            metadata={"source": "integration_test"}
        )
    
    def tearDown(self):
        """Tear down test fixtures"""
        # Remove test data directory
        if os.path.exists(self.test_data_dir):
            import shutil
            shutil.rmtree(self.test_data_dir)
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "UP")
    
    def test_segment_and_prioritize_flow(self):
        """Test the segment and prioritize workflow"""
        # 1. Segment a command
        segment_response = self.client.post(
            "/segment",
            json={
                "command": "Search for information about AI and create a report",
                "mode": "Normal",
                "persona": "researcher",
                "language": "en",
                "metadata": {"source": "integration_test"}
            }
        )
        
        self.assertEqual(segment_response.status_code, 200)
        segment_data = segment_response.json()
        self.assertIn("id", segment_data)
        self.assertIn("alt_file", segment_data)
        
        # 2. Prioritize the ALT file
        alt_file = segment_data["alt_file"]
        prioritize_response = self.client.post(
            "/prioritize",
            json={
                "alt_file": alt_file,
                "urgency_level": 7,
                "metadata": {"test": True}
            }
        )
        
        self.assertEqual(prioritize_response.status_code, 200)
        prioritize_data = prioritize_response.json()
        self.assertIn("prioritized_segments", prioritize_data)
        self.assertTrue(len(prioritize_data["prioritized_segments"]) > 0)
        
        # 3. Visualize the prioritization
        visualize_response = self.client.get(f"/prioritize/{alt_file}/visualize")
        
        self.assertEqual(visualize_response.status_code, 200)
        visualize_data = visualize_response.json()
        self.assertIn("visualization_data", visualize_data)
        self.assertIn("nodes", visualize_data["visualization_data"])
        self.assertIn("links", visualize_data["visualization_data"])
    
    def test_prioritization_config_endpoints(self):
        """Test prioritization configuration endpoints"""
        # 1. Get current configuration
        get_config_response = self.client.get("/prioritize/config")
        
        self.assertEqual(get_config_response.status_code, 200)
        initial_config = get_config_response.json()
        
        # 2. Update configuration
        new_config = {
            "default_urgency": 8,
            "default_user_preference": 7,
            "dependency_weight": 0.3,
            "urgency_weight": 0.3,
            "user_preference_weight": 0.3,
            "confidence_weight": 0.1
        }
        
        update_config_response = self.client.post(
            "/prioritize/config",
            json=new_config
        )
        
        self.assertEqual(update_config_response.status_code, 200)
        updated_config = update_config_response.json()
        self.assertEqual(updated_config["default_urgency"], 8)
        self.assertEqual(updated_config["default_user_preference"], 7)
        
        # 3. Get updated configuration
        get_updated_config_response = self.client.get("/prioritize/config")
        
        self.assertEqual(get_updated_config_response.status_code, 200)
        current_config = get_updated_config_response.json()
        self.assertEqual(current_config["default_urgency"], 8)
        self.assertEqual(current_config["default_user_preference"], 7)
        
        # 4. Restore initial configuration
        restore_config_response = self.client.post(
            "/prioritize/config",
            json=initial_config
        )
        
        self.assertEqual(restore_config_response.status_code, 200)

class TestTaskPrioritizationVisualizerIntegration(unittest.TestCase):
    """Integration tests for TaskPrioritizer and PrioritizationVisualizer"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Create a prioritizer
        self.prioritizer = TaskPrioritizer()
        
        # Create a visualizer
        self.visualizer = PrioritizationVisualizer()
        
        # Create test output directory
        self.test_output_dir = tempfile.mkdtemp()
        self.visualizer.output_dir = self.test_output_dir
        
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
            metadata={"confidence": 0.95}
        )
        
        segment2 = TaskSegment(
            id="task2",
            task_type="create",
            content="Create a report",
            parameters=[param2],
            dependencies=["task1"],
            metadata={"confidence": 0.9, "urgency": "high"}
        )
        
        segment3 = TaskSegment(
            id="task3",
            task_type="analyze",
            content="Analyze AI research papers",
            parameters=[param3],
            dependencies=["task1"],
            metadata={"confidence": 0.8}
        )
        
        self.alt_file = AltFile(
            id="test_integration",
            command="Search for information about AI, analyze research papers, and create a report",
            language="en",
            mode="Normal",
            persona="researcher",
            segments=[segment1, segment2, segment3],
            metadata={"source": "integration_test"}
        )
    
    def tearDown(self):
        """Tear down test fixtures"""
        # Remove test output directory
        if os.path.exists(self.test_output_dir):
            import shutil
            shutil.rmtree(self.test_output_dir)
    
    def test_prioritize_and_visualize_flow(self):
        """Test the prioritize and visualize workflow"""
        # 1. Prioritize ALT file
        prioritized_alt = self.prioritizer.prioritize_alt_file(self.alt_file)
        
        # Verify prioritization
        for segment in prioritized_alt.segments:
            self.assertIn("priority_score", segment.metadata)
            self.assertIn("execution_order", segment.metadata)
        
        # 2. Generate visualizations
        visualizations = self.visualizer.generate_all_visualizations(prioritized_alt)
        
        # Verify visualizations
        self.assertIn("dependency_graph", visualizations)
        self.assertIn("priority_chart", visualizations)
        self.assertIn("execution_timeline", visualizations)
        self.assertIn("json_data", visualizations)
        
        # Verify files exist
        self.assertTrue(os.path.exists(visualizations["dependency_graph"]["filepath"]))
        self.assertTrue(os.path.exists(visualizations["priority_chart"]["filepath"]))
        self.assertTrue(os.path.exists(visualizations["execution_timeline"]["filepath"]))
        self.assertTrue(os.path.exists(visualizations["json_data"]["filepath"]))
        
        # 3. Get prioritization statistics
        stats = self.prioritizer.get_prioritization_stats(prioritized_alt)
        
        # Verify statistics
        self.assertEqual(stats["total_segments"], 3)
        self.assertIn("avg_priority_score", stats)
        self.assertIn("priority_score_distribution", stats)
        self.assertIn("task_type_distribution", stats)
        self.assertIn("execution_order", stats)

if __name__ == "__main__":
    unittest.main()
