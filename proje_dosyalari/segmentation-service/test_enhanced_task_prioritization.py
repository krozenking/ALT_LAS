#!/usr/bin/env python3
"""
Test for Enhanced Task Prioritization

This module contains tests for the enhanced task prioritization system.
"""

import unittest
import os
import json
import tempfile
from pathlib import Path
from dsl_schema import AltFile, TaskSegment, TaskParameter
from task_prioritization import TaskPrioritizer, get_task_prioritizer

class TestConfigurableTaskPrioritizer(unittest.TestCase):
    """Test cases for configurable TaskPrioritizer class"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Create a test config file
        self.test_config_dir = tempfile.mkdtemp()
        self.test_config_file = os.path.join(self.test_config_dir, "test_config.json")
        
        # Create test configuration
        test_config = {
            "default_urgency": 7,
            "default_user_preference": 6,
            "dependency_weight": 0.5,
            "urgency_weight": 0.2,
            "user_preference_weight": 0.2,
            "confidence_weight": 0.1
        }
        
        # Write test configuration to file
        with open(self.test_config_file, "w") as f:
            json.dump(test_config, f)
        
        # Create a prioritizer with test configuration
        self.prioritizer = TaskPrioritizer(self.test_config_file)
        
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
        # Remove test config file and directory
        if os.path.exists(self.test_config_file):
            os.remove(self.test_config_file)
        if os.path.exists(self.test_config_dir):
            os.rmdir(self.test_config_dir)
    
    def test_load_config(self):
        """Test loading configuration from file"""
        # Verify that configuration was loaded correctly
        self.assertEqual(self.prioritizer.default_urgency, 7)
        self.assertEqual(self.prioritizer.default_user_pref, 6)
        self.assertEqual(self.prioritizer.dependency_weight, 0.5)
        self.assertEqual(self.prioritizer.urgency_weight, 0.2)
        self.assertEqual(self.prioritizer.user_pref_weight, 0.2)
        self.assertEqual(self.prioritizer.confidence_weight, 0.1)
    
    def test_get_config(self):
        """Test getting current configuration"""
        # Get configuration
        config = self.prioritizer.get_config()
        
        # Verify configuration
        self.assertEqual(config["default_urgency"], 7)
        self.assertEqual(config["default_user_preference"], 6)
        self.assertEqual(config["dependency_weight"], 0.5)
        self.assertEqual(config["urgency_weight"], 0.2)
        self.assertEqual(config["user_preference_weight"], 0.2)
        self.assertEqual(config["confidence_weight"], 0.1)
    
    def test_update_config(self):
        """Test updating configuration"""
        # Create new configuration
        new_config = {
            "default_urgency": 8,
            "default_user_preference": 5,
            "dependency_weight": 0.3,
            "urgency_weight": 0.3,
            "user_preference_weight": 0.3,
            "confidence_weight": 0.1
        }
        
        # Update configuration
        self.prioritizer.update_config(new_config)
        
        # Verify that configuration was updated
        self.assertEqual(self.prioritizer.default_urgency, 8)
        self.assertEqual(self.prioritizer.default_user_pref, 5)
        self.assertEqual(self.prioritizer.dependency_weight, 0.3)
        self.assertEqual(self.prioritizer.urgency_weight, 0.3)
        self.assertEqual(self.prioritizer.user_pref_weight, 0.3)
        self.assertEqual(self.prioritizer.confidence_weight, 0.1)
        
        # Get configuration and verify
        config = self.prioritizer.get_config()
        self.assertEqual(config["default_urgency"], 8)
    
    def test_prioritize_alt_file_with_custom_config(self):
        """Test prioritizing ALT file with custom configuration"""
        # Prioritize ALT file
        prioritized_alt = self.prioritizer.prioritize_alt_file(self.alt_file)
        
        # Verify that segments were prioritized
        for segment in prioritized_alt.segments:
            self.assertIn("priority_score", segment.metadata)
            self.assertIn("execution_order", segment.metadata)
            
            # Verify that individual factors were stored
            self.assertIn("dependency_factor", segment.metadata)
            self.assertIn("urgency_factor", segment.metadata)
            self.assertIn("user_preference_factor", segment.metadata)
            self.assertIn("confidence_factor", segment.metadata)
        
        # Verify that prioritization metadata was added to ALT file
        self.assertTrue(prioritized_alt.metadata.get("prioritized", False))
        self.assertIn("prioritization_timestamp", prioritized_alt.metadata)
        self.assertIn("prioritization_config", prioritized_alt.metadata)
        
        # Verify that prioritization config in metadata matches current config
        config = self.prioritizer.get_config()
        self.assertEqual(prioritized_alt.metadata["prioritization_config"], config)
    
    def test_get_prioritization_stats(self):
        """Test getting prioritization statistics"""
        # Prioritize ALT file
        prioritized_alt = self.prioritizer.prioritize_alt_file(self.alt_file)
        
        # Get prioritization statistics
        stats = self.prioritizer.get_prioritization_stats(prioritized_alt)
        
        # Verify statistics
        self.assertEqual(stats["total_segments"], 3)
        self.assertGreater(stats["avg_priority_score"], 0)
        self.assertGreater(stats["max_priority_score"], 0)
        self.assertLess(stats["min_priority_score"], 1)
        self.assertIn("priority_score_distribution", stats)
        self.assertIn("task_type_distribution", stats)
        self.assertIn("execution_order", stats)
        self.assertIn("prioritization_timestamp", stats)
        self.assertIn("prioritization_config", stats)
    
    def test_get_prioritization_stats_error(self):
        """Test error handling in get_prioritization_stats"""
        # Attempt to get statistics for non-prioritized ALT file
        with self.assertRaises(ValueError):
            self.prioritizer.get_prioritization_stats(self.alt_file)

class TestPrioritizationWithDeadline(unittest.TestCase):
    """Test cases for prioritization with deadline"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Create a prioritizer
        self.prioritizer = TaskPrioritizer()
        
        # Create a future deadline (tomorrow)
        import datetime
        self.future_deadline = (datetime.datetime.now() + datetime.timedelta(days=1)).isoformat()
        
        # Create a past deadline (yesterday)
        self.past_deadline = (datetime.datetime.now() - datetime.timedelta(days=1)).isoformat()
        
        # Create sample segment
        self.segment = TaskSegment(
            id="task1",
            task_type="search",
            content="Search for information",
            parameters=[]
        )
        
        # Create sample ALT file
        self.alt_file = AltFile(
            id="test_alt_file",
            command="Test command",
            language="en",
            segments=[self.segment],
            metadata={}
        )
    
    def test_urgency_factor_with_future_deadline_in_segment(self):
        """Test urgency factor with future deadline in segment metadata"""
        # Add future deadline to segment metadata
        self.segment.metadata["deadline"] = self.future_deadline
        
        # Calculate urgency factor
        factor = self.prioritizer._calculate_urgency_factor(self.segment, self.alt_file)
        
        # Verify that urgency factor is increased but not maximum
        self.assertGreater(factor, self.prioritizer.default_urgency / 10)
        self.assertLess(factor, 1.0)
    
    def test_urgency_factor_with_past_deadline_in_segment(self):
        """Test urgency factor with past deadline in segment metadata"""
        # Add past deadline to segment metadata
        self.segment.metadata["deadline"] = self.past_deadline
        
        # Calculate urgency factor
        factor = self.prioritizer._calculate_urgency_factor(self.segment, self.alt_file)
        
        # Verify that urgency factor is maximum
        self.assertEqual(factor, 1.0)
    
    def test_urgency_factor_with_future_deadline_in_alt_file(self):
        """Test urgency factor with future deadline in ALT file metadata"""
        # Add future deadline to ALT file metadata
        self.alt_file.metadata["deadline"] = self.future_deadline
        
        # Calculate urgency factor
        factor = self.prioritizer._calculate_urgency_factor(self.segment, self.alt_file)
        
        # Verify that urgency factor is increased but not maximum
        self.assertGreater(factor, self.prioritizer.default_urgency / 10)
        self.assertLess(factor, 1.0)
    
    def test_urgency_factor_with_past_deadline_in_alt_file(self):
        """Test urgency factor with past deadline in ALT file metadata"""
        # Add past deadline to ALT file metadata
        self.alt_file.metadata["deadline"] = self.past_deadline
        
        # Calculate urgency factor
        factor = self.prioritizer._calculate_urgency_factor(self.segment, self.alt_file)
        
        # Verify that urgency factor is maximum
        self.assertEqual(factor, 1.0)
    
    def test_urgency_factor_with_invalid_deadline(self):
        """Test urgency factor with invalid deadline format"""
        # Add invalid deadline to segment metadata
        self.segment.metadata["deadline"] = "not-a-date"
        
        # Calculate urgency factor
        factor = self.prioritizer._calculate_urgency_factor(self.segment, self.alt_file)
        
        # Verify that urgency factor is default
        self.assertEqual(factor, self.prioritizer.default_urgency / 10)

if __name__ == "__main__":
    unittest.main()
