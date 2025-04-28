"""
Unit tests for the Persona Handler module
"""

import unittest
import random
from unittest.mock import patch

from dsl_schema import TaskSegment, TaskParameter
from persona_handler import PersonaHandler

class TestPersonaHandler(unittest.TestCase):
    """Tests for the PersonaHandler class"""

    def setUp(self):
        """Set up test fixtures"""
        self.handler = PersonaHandler()
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

    @patch("random.random", return_value=0.1) # Ensure technical task type change
    @patch("random.choice", side_effect=lambda x: x[0]) # Choose first option
    def test_apply_technical_expert_effects_task_type(self, mock_choice, mock_random):
        """Test technical_expert persona changing task type"""
        result = self.handler.apply_persona_effects(self.segments, "technical_expert")
        self.assertEqual(result[0].metadata["applied_persona"], "technical_expert")
        self.assertEqual(result[0].task_type, "analyze") # search -> analyze
        self.assertEqual(result[0].metadata["original_task_type"], "search")
        self.assertEqual(result[1].task_type, "implement") # create -> implement
        self.assertEqual(result[1].metadata["original_task_type"], "create")

    @patch("random.random", side_effect=[0.5, 0.3]) # Ensure technical parameter add
    @patch("random.choice", side_effect=lambda x: x[0]) # Choose first option
    def test_apply_technical_expert_effects_parameter(self, mock_choice, mock_random):
        """Test technical_expert persona adding technical parameter"""
        result = self.handler.apply_persona_effects(self.segments, "technical_expert")
        self.assertEqual(result[0].metadata["applied_persona"], "technical_expert")
        # First segment random > 0.4, no param added
        self.assertEqual(len(result[0].parameters), 1)
        # Second segment random < 0.4, param added
        self.assertEqual(len(result[1].parameters), 2)
        added_param = result[1].parameters[1]
        self.assertEqual(added_param.name, self.handler.technical_parameters[0][0]) # precision
        self.assertEqual(added_param.value, self.handler.technical_parameters[0][1][0]) # high

    @patch("random.random", return_value=0.2) # Ensure creative task type change
    @patch("random.choice", side_effect=lambda x: x[0]) # Choose first option
    def test_apply_creative_writer_effects_task_type(self, mock_choice, mock_random):
        """Test creative_writer persona changing task type"""
        result = self.handler.apply_persona_effects(self.segments, "creative_writer")
        self.assertEqual(result[0].metadata["applied_persona"], "creative_writer")
        self.assertEqual(result[0].task_type, "explore") # search -> explore
        self.assertEqual(result[0].metadata["original_task_type"], "search")
        self.assertEqual(result[1].task_type, "compose") # create -> compose
        self.assertEqual(result[1].metadata["original_task_type"], "create")

    @patch("random.random", side_effect=[0.6, 0.4]) # Ensure creative parameter add
    @patch("random.choice", side_effect=lambda x: x[0]) # Choose first option
    def test_apply_creative_writer_effects_parameter(self, mock_choice, mock_random):
        """Test creative_writer persona adding creative parameter"""
        result = self.handler.apply_persona_effects(self.segments, "creative_writer")
        self.assertEqual(result[0].metadata["applied_persona"], "creative_writer")
        # First segment random > 0.5, no param added
        self.assertEqual(len(result[0].parameters), 1)
        # Second segment random < 0.5, param added
        self.assertEqual(len(result[1].parameters), 2)
        added_param = result[1].parameters[1]
        self.assertEqual(added_param.name, self.handler.creative_parameters[0][0]) # style
        self.assertEqual(added_param.value, self.handler.creative_parameters[0][1][0]) # narrative

    @patch("random.random", return_value=0.2) # Ensure research task type change
    @patch("random.choice", side_effect=lambda x: x[0]) # Choose first option
    def test_apply_researcher_effects_task_type(self, mock_choice, mock_random):
        """Test researcher persona changing task type"""
        result = self.handler.apply_persona_effects(self.segments, "researcher")
        self.assertEqual(result[0].metadata["applied_persona"], "researcher")
        self.assertEqual(result[0].task_type, "research") # search -> research
        self.assertEqual(result[0].metadata["original_task_type"], "search")
        self.assertEqual(result[1].task_type, "study") # create -> study
        self.assertEqual(result[1].metadata["original_task_type"], "create")

    @patch("random.random", side_effect=[0.6, 0.4]) # Ensure research parameter add
    @patch("random.choice", side_effect=lambda x: x[0]) # Choose first option
    @patch("random.sample", side_effect=lambda x, k: list(x)[:k]) # Choose first k options
    def test_apply_researcher_effects_parameter(self, mock_sample, mock_choice, mock_random):
        """Test researcher persona adding research parameter"""
        result = self.handler.apply_persona_effects(self.segments, "researcher")
        self.assertEqual(result[0].metadata["applied_persona"], "researcher")
        # First segment random > 0.45, no param added, but sources added
        self.assertEqual(len(result[0].parameters), 2)
        self.assertEqual(result[0].parameters[1].name, "sources")
        # Second segment random < 0.45, param added
        self.assertEqual(len(result[1].parameters), 2)
        added_param = result[1].parameters[1]
        self.assertEqual(added_param.name, self.handler.researcher_parameters[0][0]) # sources
        self.assertEqual(added_param.value, self.handler.researcher_parameters[0][1][0]) # academic

    @patch("random.random", return_value=0.1) # Ensure PM task type change
    @patch("random.choice", side_effect=lambda x: x[0]) # Choose first option
    def test_apply_project_manager_effects_task_type(self, mock_choice, mock_random):
        """Test project_manager persona changing task type"""
        result = self.handler.apply_persona_effects(self.segments, "project_manager")
        self.assertEqual(result[0].metadata["applied_persona"], "project_manager")
        self.assertEqual(result[0].task_type, "plan") # search -> plan
        self.assertEqual(result[0].metadata["original_task_type"], "search")
        self.assertEqual(result[1].task_type, "organize") # create -> organize
        self.assertEqual(result[1].metadata["original_task_type"], "create")

    @patch("random.random", side_effect=[0.7, 0.5]) # Ensure PM parameter add
    @patch("random.choice", side_effect=lambda x: x[0]) # Choose first option
    def test_apply_project_manager_effects_parameter(self, mock_choice, mock_random):
        """Test project_manager persona adding PM parameter"""
        result = self.handler.apply_persona_effects(self.segments, "project_manager")
        self.assertEqual(result[0].metadata["applied_persona"], "project_manager")
        # First segment random > 0.6, no param added, but deadline added
        self.assertEqual(len(result[0].parameters), 2)
        self.assertEqual(result[0].parameters[1].name, "deadline")
        # Second segment random < 0.6, param added, and deadline added
        self.assertEqual(len(result[1].parameters), 3)
        added_param = result[1].parameters[1]
        self.assertEqual(added_param.name, self.handler.project_manager_parameters[0][0]) # priority
        self.assertEqual(added_param.value, self.handler.project_manager_parameters[0][1][0]) # high
        self.assertEqual(result[1].parameters[2].name, "deadline")

if __name__ == "__main__":
    unittest.main()
