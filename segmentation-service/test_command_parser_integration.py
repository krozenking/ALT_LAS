"""
Integration tests for the Command Parser with Mode and Persona system
"""

import unittest
from unittest.mock import patch

from dsl_schema import AltFile
from command_parser import CommandParser
from mode_handler import ModeHandler
from persona_handler import PersonaHandler

class TestCommandParserIntegration(unittest.TestCase):
    """Integration tests for the CommandParser with Mode and Persona system"""

    def setUp(self):
        """Set up test fixtures"""
        self.parser = CommandParser()
        self.test_command = "Search for information about AI and create a report"
    
    def test_parse_command_normal_mode(self):
        """Test parsing command with Normal mode and default persona"""
        alt_file = self.parser.parse_command(self.test_command, mode="Normal")
        
        # Check basic properties
        self.assertEqual(alt_file.command, self.test_command)
        self.assertEqual(alt_file.mode, "Normal")
        self.assertEqual(alt_file.persona, "technical_expert")
        self.assertIsNone(alt_file.chaos_level)
        
        # Check segments
        self.assertEqual(len(alt_file.segments), 2)
        self.assertEqual(alt_file.segments[0].task_type, "search")
        self.assertEqual(alt_file.segments[1].task_type, "create")
        
        # Check that no mode effects were applied
        self.assertNotIn("applied_mode", alt_file.segments[0].metadata)
        
        # Check that persona effects were applied
        self.assertEqual(alt_file.segments[0].metadata.get("applied_persona"), "technical_expert")
    
    @patch("random.random", return_value=0.2)  # Ensure effects are applied
    @patch("random.choice", side_effect=lambda x: x[0])  # Choose first option
    def test_parse_command_dream_mode(self, mock_choice, mock_random):
        """Test parsing command with Dream mode"""
        alt_file = self.parser.parse_command(self.test_command, mode="Dream")
        
        # Check basic properties
        self.assertEqual(alt_file.command, self.test_command)
        self.assertEqual(alt_file.mode, "Dream")
        self.assertEqual(alt_file.persona, "technical_expert")
        self.assertIsNone(alt_file.chaos_level)
        
        # Check segments
        self.assertEqual(len(alt_file.segments), 2)
        
        # Check that Dream mode effects were applied
        self.assertEqual(alt_file.segments[0].metadata.get("applied_mode"), "Dream")
        self.assertIn("original_task_type", alt_file.segments[0].metadata)
        
        # Check that persona effects were applied
        self.assertEqual(alt_file.segments[0].metadata.get("applied_persona"), "technical_expert")
    
    @patch("random.random", return_value=0.2)  # Ensure effects are applied
    @patch("random.choice", side_effect=lambda x: x[0])  # Choose first option
    @patch("random.sample", side_effect=lambda x, k: list(x)[:k])  # Choose first k options
    def test_parse_command_explore_mode(self, mock_sample, mock_choice, mock_random):
        """Test parsing command with Explore mode"""
        alt_file = self.parser.parse_command(self.test_command, mode="Explore")
        
        # Check basic properties
        self.assertEqual(alt_file.command, self.test_command)
        self.assertEqual(alt_file.mode, "Explore")
        self.assertEqual(alt_file.persona, "technical_expert")
        self.assertIsNone(alt_file.chaos_level)
        
        # Check segments
        self.assertEqual(len(alt_file.segments), 2)
        
        # Check that Explore mode effects were applied
        self.assertEqual(alt_file.segments[0].metadata.get("applied_mode"), "Explore")
        
        # Check that persona effects were applied
        self.assertEqual(alt_file.segments[0].metadata.get("applied_persona"), "technical_expert")
    
    @patch("random.random", return_value=0.2)  # Ensure effects are applied
    @patch("random.choice", side_effect=lambda x: x[0])  # Choose first option
    def test_parse_command_chaos_mode(self, mock_choice, mock_random):
        """Test parsing command with Chaos mode"""
        alt_file = self.parser.parse_command(self.test_command, mode="Chaos", metadata={"chaos_level": 7})
        
        # Check basic properties
        self.assertEqual(alt_file.command, self.test_command)
        self.assertEqual(alt_file.mode, "Chaos")
        self.assertEqual(alt_file.persona, "technical_expert")
        self.assertEqual(alt_file.chaos_level, 7)
        
        # Check segments
        self.assertEqual(len(alt_file.segments), 2)
        
        # Check that Chaos mode effects were applied
        self.assertEqual(alt_file.segments[0].metadata.get("applied_mode"), "Chaos")
        self.assertEqual(alt_file.segments[0].metadata.get("chaos_level"), 7)
        
        # Check that persona effects were applied
        self.assertEqual(alt_file.segments[0].metadata.get("applied_persona"), "technical_expert")
    
    @patch("random.random", return_value=0.2)  # Ensure effects are applied
    @patch("random.choice", side_effect=lambda x: x[0])  # Choose first option
    def test_parse_command_creative_writer_persona(self, mock_choice, mock_random):
        """Test parsing command with creative_writer persona"""
        alt_file = self.parser.parse_command(self.test_command, persona="creative_writer")
        
        # Check basic properties
        self.assertEqual(alt_file.command, self.test_command)
        self.assertEqual(alt_file.mode, "Normal")
        self.assertEqual(alt_file.persona, "creative_writer")
        self.assertIsNone(alt_file.chaos_level)
        
        # Check segments
        self.assertEqual(len(alt_file.segments), 2)
        
        # Check that no mode effects were applied
        self.assertNotIn("applied_mode", alt_file.segments[0].metadata)
        
        # Check that persona effects were applied
        self.assertEqual(alt_file.segments[0].metadata.get("applied_persona"), "creative_writer")
        self.assertIn("original_task_type", alt_file.segments[0].metadata)
    
    @patch("random.random", return_value=0.2)  # Ensure effects are applied
    @patch("random.choice", side_effect=lambda x: x[0])  # Choose first option
    def test_parse_command_researcher_persona(self, mock_choice, mock_random):
        """Test parsing command with researcher persona"""
        alt_file = self.parser.parse_command(self.test_command, persona="researcher")
        
        # Check basic properties
        self.assertEqual(alt_file.command, self.test_command)
        self.assertEqual(alt_file.mode, "Normal")
        self.assertEqual(alt_file.persona, "researcher")
        self.assertIsNone(alt_file.chaos_level)
        
        # Check segments
        self.assertEqual(len(alt_file.segments), 2)
        
        # Check that no mode effects were applied
        self.assertNotIn("applied_mode", alt_file.segments[0].metadata)
        
        # Check that persona effects were applied
        self.assertEqual(alt_file.segments[0].metadata.get("applied_persona"), "researcher")
        self.assertIn("original_task_type", alt_file.segments[0].metadata)
    
    @patch("random.random", return_value=0.2)  # Ensure effects are applied
    @patch("random.choice", side_effect=lambda x: x[0])  # Choose first option
    def test_parse_command_project_manager_persona(self, mock_choice, mock_random):
        """Test parsing command with project_manager persona"""
        alt_file = self.parser.parse_command(self.test_command, persona="project_manager")
        
        # Check basic properties
        self.assertEqual(alt_file.command, self.test_command)
        self.assertEqual(alt_file.mode, "Normal")
        self.assertEqual(alt_file.persona, "project_manager")
        self.assertIsNone(alt_file.chaos_level)
        
        # Check segments
        self.assertEqual(len(alt_file.segments), 2)
        
        # Check that no mode effects were applied
        self.assertNotIn("applied_mode", alt_file.segments[0].metadata)
        
        # Check that persona effects were applied
        self.assertEqual(alt_file.segments[0].metadata.get("applied_persona"), "project_manager")
        self.assertIn("original_task_type", alt_file.segments[0].metadata)
    
    @patch("random.random", return_value=0.2)  # Ensure effects are applied
    @patch("random.choice", side_effect=lambda x: x[0])  # Choose first option
    def test_parse_command_combined_mode_persona(self, mock_choice, mock_random):
        """Test parsing command with both Dream mode and creative_writer persona"""
        alt_file = self.parser.parse_command(self.test_command, mode="Dream", persona="creative_writer")
        
        # Check basic properties
        self.assertEqual(alt_file.command, self.test_command)
        self.assertEqual(alt_file.mode, "Dream")
        self.assertEqual(alt_file.persona, "creative_writer")
        self.assertIsNone(alt_file.chaos_level)
        
        # Check segments
        self.assertEqual(len(alt_file.segments), 2)
        
        # Check that Dream mode effects were applied
        self.assertEqual(alt_file.segments[0].metadata.get("applied_mode"), "Dream")
        
        # Check that persona effects were applied
        self.assertEqual(alt_file.segments[0].metadata.get("applied_persona"), "creative_writer")
        
        # Both should have modified the task type, but persona is applied last
        self.assertIn("original_task_type", alt_file.segments[0].metadata)

if __name__ == "__main__":
    unittest.main()
