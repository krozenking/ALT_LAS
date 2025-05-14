"""
Unit tests for the Mode Handler module
"""

import unittest
import random
from unittest.mock import patch, MagicMock

from dsl_schema import TaskSegment, TaskParameter
from mode_handler import ModeHandler

class TestModeHandler(unittest.TestCase):
    """Tests for the ModeHandler class"""

    def setUp(self):
        """Set up test fixtures"""
        self.handler = ModeHandler()
        self.segment1 = TaskSegment(
            id="seg1",
            task_type="search",
            content="Search for AI",
            parameters=[TaskParameter(name="query", value="AI", type="string")]
        )
        self.segment2 = TaskSegment(
            id="seg2",
            task_type="create",
            content="Create report",
            parameters=[TaskParameter(name="title", value="AI Report", type="string")]
        )
        self.segments = [self.segment1, self.segment2]

    def test_apply_mode_effects_normal(self):
        """Test Normal mode effects (should be none)"""
        result = self.handler.apply_mode_effects(self.segments, "Normal")
        self.assertEqual(result, self.segments)
        self.assertNotIn("applied_mode", result[0].metadata)

    @patch("random.random", return_value=0.2) # Ensure creative task type change
    @patch("random.choice", side_effect=lambda x: x[0]) # Choose first option
    def test_apply_dream_effects_task_type(self, mock_choice, mock_random):
        """Test Dream mode changing task type"""
        result = self.handler.apply_mode_effects(self.segments, "Dream")
        self.assertEqual(result[0].metadata["applied_mode"], "Dream")
        self.assertEqual(result[0].task_type, self.handler.creative_task_types[0]) # imagine
        self.assertEqual(result[0].metadata["original_task_type"], "search")
        self.assertEqual(result[1].task_type, self.handler.creative_task_types[0]) # imagine
        self.assertEqual(result[1].metadata["original_task_type"], "create")

    @patch("random.random", side_effect=[0.2, 0.6, 0.7, 0.4]) # Values for seg1_task, seg1_param, seg2_task, seg2_param
    @patch("random.choice", side_effect=lambda x: x[0]) # Choose first option
    def test_apply_dream_effects_parameter(self, mock_choice, mock_random):
        """Test Dream mode adding creative parameter"""
        result = self.handler.apply_mode_effects(self.segments, "Dream")
        self.assertEqual(result[0].metadata["applied_mode"], "Dream")
        # First segment random < 0.3, task type changed
        self.assertEqual(result[0].task_type, self.handler.creative_task_types[0]) # imagine
        # First segment random > 0.5, no param added
        self.assertEqual(len(result[0].parameters), 1)
        # Second segment random > 0.3, task type not changed
        self.assertEqual(result[1].task_type, "create")
        # Second segment random < 0.5, param added
        self.assertEqual(len(result[1].parameters), 2)
        added_param = result[1].parameters[1]
        self.assertEqual(added_param.name, self.handler.creative_parameters[0][0]) # style
        self.assertEqual(added_param.value, self.handler.creative_parameters[0][1][0]) # artistic

    @patch("random.sample", side_effect=lambda x, k: list(x)[:k]) # Choose first k options
    @patch("mode_handler.wordnet.synsets", return_value=[MagicMock(lemmas=lambda: [MagicMock(name=lambda: "artificial_intelligence"), MagicMock(name=lambda: "machine_learning")], hypernyms=lambda: [])])
    def test_apply_explore_effects(self, mock_synsets, mock_sample):
        """Test Explore mode adding alternative parameters"""
        # Patch related_concepts to ensure consistent test results
        with patch.dict(self.handler.related_concepts, {"AI": ["machine learning", "neural networks", "deep learning"]}):
            result = self.handler.apply_mode_effects(self.segments, "Explore")
            self.assertEqual(result[0].metadata["applied_mode"], "Explore")
            self.assertEqual(len(result[0].parameters), 2) # Original + alternatives
            alternatives_param = result[0].parameters[1]
            self.assertEqual(alternatives_param.name, "query_alternatives")
            self.assertIn("machine learning", alternatives_param.value)
        # Check second segment - Explore mode should add alternatives for "report"
        self.assertEqual(len(result[1].parameters), 2) # Expect title + title_alternatives
        self.assertEqual(result[1].parameters[1].name, "title_alternatives")

    @patch("random.random", return_value=0.8) # Ensure chaos effects trigger
    @patch("random.choice", side_effect=lambda x: x[0]) # Choose first option
    @patch("random.sample", side_effect=lambda x, k: list(x)[:k]) # Choose first k options
    @patch("random.shuffle", side_effect=lambda x: x.reverse()) # Reverse list for shuffle
    def test_apply_chaos_effects_high(self, mock_shuffle, mock_sample, mock_choice, mock_random):
        """Test Chaos mode with high chaos level"""
        result = self.handler.apply_mode_effects(self.segments, "Chaos", chaos_level=9)
        self.assertEqual(result[0].metadata["applied_mode"], "Chaos")
        self.assertEqual(result[0].metadata["chaos_level"], 9)
        
        # Check if task types were swapped (mock_random ensures swap happens)
        self.assertEqual(result[0].task_type, "create")
        self.assertEqual(result[1].task_type, "search")
        
        # Check if parameters were modified (mock_random ensures modification)
        # mock_choice selects "modify" and mock_shuffle reverses the words
        self.assertEqual(result[0].parameters[0].value, "AI") # Single word, no change from shuffle
        self.assertEqual(result[1].parameters[0].value, "Report AI") # Reversed words
        
        # Check if dependencies were modified (mock_random ensures modification)
        # No dependencies initially, chaos might add some
        self.assertTrue(hasattr(result[0], "dependencies"))
        self.assertTrue(hasattr(result[1], "dependencies"))

    @patch("random.random", return_value=0.1) # Ensure chaos effects don't trigger often
    def test_apply_chaos_effects_low(self, mock_random):
        """Test Chaos mode with low chaos level"""
        result = self.handler.apply_mode_effects(self.segments, "Chaos", chaos_level=1)
        self.assertEqual(result[0].metadata["applied_mode"], "Chaos")
        self.assertEqual(result[0].metadata["chaos_level"], 1)
        # With low probability, likely no changes occurred
        self.assertEqual(result[0].task_type, "search")
        self.assertEqual(result[1].task_type, "create")
        self.assertEqual(result[0].parameters[0].value, "AI")
        self.assertEqual(result[1].parameters[0].value, "AI Report")

if __name__ == "__main__":
    unittest.main()
