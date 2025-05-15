"""
Unit tests for the Task Prioritization module of ALT_LAS Segmentation Service

This module contains unit tests for the Task Prioritization module, testing the
functionality of the TaskPrioritizer class and its methods.
"""

import unittest
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta

from task_prioritization import TaskPrioritizer, get_task_prioritizer
from dsl_schema import AltFile, TaskSegment, TaskParameter

class TestTaskPrioritizer(unittest.TestCase):
    """Test cases for TaskPrioritizer class"""
    
    def setUp(self):
        """Set up test data"""
        # Create a task prioritizer
        self.prioritizer = TaskPrioritizer()
        
        # Create sample parameters
        self.param1 = TaskParameter(
            name="query",
            value="information about AI",
            type="string",
            required=True
        )
        
        self.param2 = TaskParameter(
            name="format",
            value="pdf",
            type="string",
            required=True
        )
        
        self.param3 = TaskParameter(
            name="subject",
            value="AI research papers",
            type="string",
            required=True
        )
        
        # Create sample segments
        self.segment1 = TaskSegment(
            id="task1",
            task_type="search",
            content="Search for information about AI",
            parameters=[self.param1],
            metadata={"confidence": 0.95}
        )
        
        self.segment2 = TaskSegment(
            id="task2",
            task_type="create",
            content="Create a report",
            parameters=[self.param2],
            dependencies=["task1"],
            metadata={"confidence": 0.9}
        )
        
        self.segment3 = TaskSegment(
            id="task3",
            task_type="analyze",
            content="Analyze AI research papers",
            parameters=[self.param3],
            dependencies=["task1"],
            metadata={"confidence": 0.8}
        )
        
        # Create a sample ALT file
        self.alt_file = AltFile(
            command="Search for information about AI, analyze research papers, and create a report",
            language="en",
            mode="Normal",
            persona="researcher",
            segments=[self.segment1, self.segment2, self.segment3],
            metadata={"source": "user_input"}
        )
    
    def test_prioritize_alt_file(self):
        """Test prioritizing an ALT file"""
        # Prioritize the ALT file
        prioritized_alt = self.prioritizer.prioritize_alt_file(self.alt_file)
        
        # Verify that prioritization metadata was added
        self.assertTrue(prioritized_alt.metadata.get("prioritized", False))
        self.assertIsNotNone(prioritized_alt.metadata.get("prioritization_timestamp"))
        
        # Verify that priority was added to each segment
        for segment in prioritized_alt.segments:
            self.assertIn("priority", segment.metadata)
            self.assertIn("priority_score", segment.metadata)
            self.assertIn("execution_order", segment.metadata)
            
            # Verify that priority is a float between 0 and 1
            self.assertIsInstance(segment.metadata["priority"], float)
            self.assertGreaterEqual(segment.metadata["priority"], 0.0)
            self.assertLessEqual(segment.metadata["priority"], 1.0)
            
            # Verify that priority_score is rounded to 1 decimal place
            self.assertAlmostEqual(segment.metadata["priority_score"] * 10, 
                                  round(segment.metadata["priority_score"] * 10))
            
            # Verify that execution_order is an integer
            self.assertIsInstance(segment.metadata["execution_order"], int)
            self.assertGreaterEqual(segment.metadata["execution_order"], 1)
            self.assertLessEqual(segment.metadata["execution_order"], 
                               len(prioritized_alt.segments))
        
        # Verify that segments are sorted by priority (descending)
        for i in range(1, len(prioritized_alt.segments)):
            self.assertGreaterEqual(
                prioritized_alt.segments[i-1].metadata["priority"],
                prioritized_alt.segments[i].metadata["priority"]
            )
    
    def test_calculate_priority(self):
        """Test calculating priority for a task segment"""
        # Mock the individual factor calculation methods
        self.prioritizer._calculate_dependency_factor = MagicMock(return_value=0.8)
        self.prioritizer._calculate_complexity_factor = MagicMock(return_value=0.6)
        self.prioritizer._calculate_urgency_factor = MagicMock(return_value=0.7)
        self.prioritizer._calculate_user_preference_factor = MagicMock(return_value=0.5)
        self.prioritizer._calculate_confidence_factor = MagicMock(return_value=0.9)
        
        # Calculate priority
        priority = self.prioritizer.calculate_priority(self.segment1, self.alt_file)
        
        # Verify that priority is a float between 0 and 1
        self.assertIsInstance(priority, float)
        self.assertGreaterEqual(priority, 0.0)
        self.assertLessEqual(priority, 1.0)
        
        # Verify that the individual factor calculation methods were called
        self.prioritizer._calculate_dependency_factor.assert_called_once_with(
            self.segment1, self.alt_file)
        self.prioritizer._calculate_complexity_factor.assert_called_once_with(
            self.segment1)
        self.prioritizer._calculate_urgency_factor.assert_called_once_with(
            self.segment1)
        self.prioritizer._calculate_user_preference_factor.assert_called_once_with(
            self.segment1, self.alt_file)
        self.prioritizer._calculate_confidence_factor.assert_called_once_with(
            self.segment1)
        
        # Verify that the priority is calculated correctly
        expected_priority = (
            self.prioritizer.weights["dependency"] * 0.8 +
            self.prioritizer.weights["complexity"] * 0.6 +
            self.prioritizer.weights["urgency"] * 0.7 +
            self.prioritizer.weights["user_pref"] * 0.5 +
            self.prioritizer.weights["confidence"] * 0.9
        )
        self.assertAlmostEqual(priority, expected_priority)
    
    def test_calculate_dependency_factor_no_dependencies(self):
        """Test calculating dependency factor for a segment with no dependencies"""
        # Calculate dependency factor
        factor = self.prioritizer._calculate_dependency_factor(self.segment1, self.alt_file)
        
        # Verify that the factor is 1.0 (highest priority)
        self.assertEqual(factor, 1.0)
    
    def test_calculate_dependency_factor_with_dependencies(self):
        """Test calculating dependency factor for a segment with dependencies"""
        # Calculate dependency factor
        factor = self.prioritizer._calculate_dependency_factor(self.segment2, self.alt_file)
        
        # Verify that the factor is less than 1.0
        self.assertLess(factor, 1.0)
        
        # Verify that the factor is greater than 0.0 (dependencies are satisfied)
        self.assertGreater(factor, 0.0)
    
    def test_calculate_dependency_factor_unsatisfied_dependencies(self):
        """Test calculating dependency factor for a segment with unsatisfied dependencies"""
        # Create a segment with unsatisfied dependencies
        segment = TaskSegment(
            id="task4",
            task_type="execute",
            content="Execute a command",
            parameters=[],
            dependencies=["non_existent_task"]
        )
        
        # Calculate dependency factor
        factor = self.prioritizer._calculate_dependency_factor(segment, self.alt_file)
        
        # Verify that the factor is 0.0 (lowest priority)
        self.assertEqual(factor, 0.0)
    
    def test_calculate_dependency_depth(self):
        """Test calculating dependency depth"""
        # Calculate dependency depth for segment with no dependencies
        depth1 = self.prioritizer._calculate_dependency_depth(self.segment1, self.alt_file)
        self.assertEqual(depth1, 0)
        
        # Calculate dependency depth for segment with one dependency
        depth2 = self.prioritizer._calculate_dependency_depth(self.segment2, self.alt_file)
        self.assertEqual(depth2, 1)
        
        # Create a segment with deeper dependencies
        segment4 = TaskSegment(
            id="task4",
            task_type="execute",
            content="Execute a command",
            parameters=[],
            dependencies=["task2"]
        )
        
        # Add the segment to the ALT file
        alt_file = AltFile(
            command="Test command",
            language="en",
            segments=[self.segment1, self.segment2, segment4]
        )
        
        # Calculate dependency depth for segment with deeper dependencies
        depth4 = self.prioritizer._calculate_dependency_depth(segment4, alt_file)
        self.assertEqual(depth4, 2)
    
    def test_calculate_complexity_factor(self):
        """Test calculating complexity factor"""
        # Calculate complexity factor for different task types
        factor1 = self.prioritizer._calculate_complexity_factor(self.segment1)  # search
        factor2 = self.prioritizer._calculate_complexity_factor(self.segment2)  # create
        factor3 = self.prioritizer._calculate_complexity_factor(self.segment3)  # analyze
        
        # Verify that the factors are between 0 and 1
        self.assertGreaterEqual(factor1, 0.0)
        self.assertLessEqual(factor1, 1.0)
        self.assertGreaterEqual(factor2, 0.0)
        self.assertLessEqual(factor2, 1.0)
        self.assertGreaterEqual(factor3, 0.0)
        self.assertLessEqual(factor3, 1.0)
        
        # Verify that more complex tasks have higher factors
        self.assertLess(factor1, factor2)  # search < create
        self.assertLess(factor1, factor3)  # search < analyze
    
    def test_calculate_urgency_factor_default(self):
        """Test calculating urgency factor with default values"""
        # Calculate urgency factor
        factor = self.prioritizer._calculate_urgency_factor(self.segment1)
        
        # Verify that the factor is the default urgency
        self.assertEqual(factor, self.prioritizer.default_urgency / 10)
    
    def test_calculate_urgency_factor_with_metadata(self):
        """Test calculating urgency factor with metadata"""
        # Create a segment with urgency metadata
        segment = TaskSegment(
            id="task4",
            task_type="execute",
            content="Execute a command",
            parameters=[],
            metadata={"urgency": 8}
        )
        
        # Calculate urgency factor
        factor = self.prioritizer._calculate_urgency_factor(segment)
        
        # Verify that the factor is based on the metadata
        self.assertEqual(factor, 0.8)
        
        # Create a segment with string urgency metadata
        segment = TaskSegment(
            id="task5",
            task_type="execute",
            content="Execute a command",
            parameters=[],
            metadata={"urgency": "high"}
        )
        
        # Calculate urgency factor
        factor = self.prioritizer._calculate_urgency_factor(segment)
        
        # Verify that the factor is based on the string metadata
        self.assertEqual(factor, 0.8)  # "high" maps to 8
    
    def test_calculate_urgency_factor_with_deadline(self):
        """Test calculating urgency factor with deadline"""
        # Create a segment with deadline metadata (past deadline)
        past_deadline = (datetime.now() - timedelta(hours=1)).isoformat()
        segment1 = TaskSegment(
            id="task4",
            task_type="execute",
            content="Execute a command",
            parameters=[],
            metadata={"deadline": past_deadline}
        )
        
        # Calculate urgency factor
        factor1 = self.prioritizer._calculate_urgency_factor(segment1)
        
        # Verify that the factor is maximum (1.0)
        self.assertEqual(factor1, 1.0)
        
        # Create a segment with deadline metadata (future deadline)
        future_deadline = (datetime.now() + timedelta(days=7)).isoformat()
        segment2 = TaskSegment(
            id="task5",
            task_type="execute",
            content="Execute a command",
            parameters=[],
            metadata={"deadline": future_deadline}
        )
        
        # Calculate urgency factor
        factor2 = self.prioritizer._calculate_urgency_factor(segment2)
        
        # Verify that the factor is the default urgency
        self.assertEqual(factor2, self.prioritizer.default_urgency / 10)
    
    def test_calculate_user_preference_factor_default(self):
        """Test calculating user preference factor with default values"""
        # Calculate user preference factor
        factor = self.prioritizer._calculate_user_preference_factor(self.segment1, self.alt_file)
        
        # Verify that the factor is the default user preference
        self.assertEqual(factor, self.prioritizer.default_user_pref / 10)
    
    def test_calculate_user_preference_factor_with_metadata(self):
        """Test calculating user preference factor with metadata"""
        # Create a segment with user preference metadata
        segment = TaskSegment(
            id="task4",
            task_type="execute",
            content="Execute a command",
            parameters=[],
            metadata={"user_preference": 8}
        )
        
        # Calculate user preference factor
        factor = self.prioritizer._calculate_user_preference_factor(segment, self.alt_file)
        
        # Verify that the factor is based on the metadata
        self.assertEqual(factor, 0.8)
        
        # Create a segment with string user preference metadata
        segment = TaskSegment(
            id="task5",
            task_type="execute",
            content="Execute a command",
            parameters=[],
            metadata={"user_preference": "high"}
        )
        
        # Calculate user preference factor
        factor = self.prioritizer._calculate_user_preference_factor(segment, self.alt_file)
        
        # Verify that the factor is based on the string metadata
        self.assertEqual(factor, 0.8)  # "high" maps to 8
    
    def test_calculate_user_preference_factor_with_alt_metadata(self):
        """Test calculating user preference factor with ALT file metadata"""
        # Create an ALT file with user preferences metadata
        alt_file = AltFile(
            command="Test command",
            language="en",
            segments=[self.segment1],
            metadata={"user_preferences": {"search": 9, "create": 7}}
        )
        
        # Calculate user preference factor for search segment
        factor = self.prioritizer._calculate_user_preference_factor(self.segment1, alt_file)
        
        # Verify that the factor is based on the ALT file metadata
        self.assertEqual(factor, 0.9)
    
    def test_calculate_confidence_factor_default(self):
        """Test calculating confidence factor with default values"""
        # Create a segment without confidence metadata
        segment = TaskSegment(
            id="task4",
            task_type="execute",
            content="Execute a command",
            parameters=[]
        )
        
        # Calculate confidence factor
        factor = self.prioritizer._calculate_confidence_factor(segment)
        
        # Verify that the factor is the default confidence (0.5)
        self.assertEqual(factor, 0.5)
    
    def test_calculate_confidence_factor_with_metadata(self):
        """Test calculating confidence factor with metadata"""
        # Calculate confidence factor
        factor = self.prioritizer._calculate_confidence_factor(self.segment1)
        
        # Verify that the factor is based on the metadata
        self.assertEqual(factor, 0.95)
        
        # Create a segment with out-of-range confidence
        segment = TaskSegment(
            id="task4",
            task_type="execute",
            content="Execute a command",
            parameters=[],
            metadata={"confidence": 1.5}
        )
        
        # Calculate confidence factor
        factor = self.prioritizer._calculate_confidence_factor(segment)
        
        # Verify that the factor is clamped to 1.0
        self.assertEqual(factor, 1.0)
        
        # Create a segment with non-numeric confidence
        segment = TaskSegment(
            id="task5",
            task_type="execute",
            content="Execute a command",
            parameters=[],
            metadata={"confidence": "high"}
        )
        
        # Calculate confidence factor
        factor = self.prioritizer._calculate_confidence_factor(segment)
        
        # Verify that the factor is the default confidence (0.5)
        self.assertEqual(factor, 0.5)

class TestGetTaskPrioritizer(unittest.TestCase):
    """Test cases for get_task_prioritizer function"""
    
    def test_get_task_prioritizer(self):
        """Test getting the task prioritizer instance"""
        prioritizer1 = get_task_prioritizer()
        prioritizer2 = get_task_prioritizer()
        
        # Verify that the same instance is returned
        self.assertIs(prioritizer1, prioritizer2)
        self.assertIsInstance(prioritizer1, TaskPrioritizer)

if __name__ == "__main__":
    unittest.main()
