"""
Unit tests for the Mode and Persona functionality of ALT_LAS Segmentation Service

This module contains unit tests for the Mode and Persona functionality,
testing the integration of mode and persona effects in the command parsing process.
"""

import unittest
from unittest.mock import patch, MagicMock
import json
import os
import tempfile

from enhanced_command_parser import EnhancedCommandParser
from mode_handler import ModeHandler
from persona_handler import PersonaHandler
from dsl_schema import AltFile, TaskSegment, TaskParameter
from alt_file_handler import AltFileHandler

class TestModePersonaIntegration(unittest.TestCase):
    """Test cases for Mode and Persona integration in the command parsing process"""
    
    def setUp(self):
        """Set up test data"""
        # Create a command parser
        self.parser = EnhancedCommandParser()
        
        # Create a temporary directory for ALT files
        self.test_dir = tempfile.mkdtemp()
        self.alt_file_handler = AltFileHandler(self.test_dir)
    
    def tearDown(self):
        """Clean up temporary files"""
        import shutil
        shutil.rmtree(self.test_dir)
    
    def test_normal_mode_parsing(self):
        """Test parsing a command in Normal mode"""
        # Parse command in Normal mode
        alt_file = self.parser.parse_command(
            "Search for information about AI and create a report",
            mode="Normal",
            persona="technical_expert"
        )
        
        # Verify mode and persona
        self.assertEqual(alt_file.mode, "Normal")
        self.assertEqual(alt_file.persona, "technical_expert")
        
        # Verify that no mode-specific metadata is added in Normal mode
        for segment in alt_file.segments:
            self.assertNotIn("applied_mode", segment.metadata)
    
    def test_dream_mode_parsing(self):
        """Test parsing a command in Dream mode"""
        # Parse command in Dream mode
        alt_file = self.parser.parse_command(
            "Search for information about AI and create a report",
            mode="Dream",
            persona="creative_writer"
        )
        
        # Verify mode and persona
        self.assertEqual(alt_file.mode, "Dream")
        self.assertEqual(alt_file.persona, "creative_writer")
        
        # Verify that Dream mode effects are applied
        dream_effects_applied = False
        for segment in alt_file.segments:
            if "applied_mode" in segment.metadata and segment.metadata["applied_mode"] == "Dream":
                dream_effects_applied = True
                break
        
        self.assertTrue(dream_effects_applied, "Dream mode effects were not applied to any segment")
    
    def test_explore_mode_parsing(self):
        """Test parsing a command in Explore mode"""
        # Parse command in Explore mode
        alt_file = self.parser.parse_command(
            "Search for information about AI and create a report",
            mode="Explore",
            persona="researcher"
        )
        
        # Verify mode and persona
        self.assertEqual(alt_file.mode, "Explore")
        self.assertEqual(alt_file.persona, "researcher")
        
        # Verify that Explore mode effects are applied
        explore_effects_applied = False
        for segment in alt_file.segments:
            if "applied_mode" in segment.metadata and segment.metadata["applied_mode"] == "Explore":
                explore_effects_applied = True
                break
        
        self.assertTrue(explore_effects_applied, "Explore mode effects were not applied to any segment")
    
    def test_chaos_mode_parsing(self):
        """Test parsing a command in Chaos mode with different chaos levels"""
        # Test with low chaos level (3)
        alt_file_low = self.parser.parse_command(
            "Search for information about AI and create a report",
            mode="Chaos",
            persona="technical_expert",
            metadata={"chaos_level": 3}
        )
        
        # Verify chaos level
        self.assertEqual(alt_file_low.mode, "Chaos")
        self.assertEqual(alt_file_low.chaos_level, 3)
        
        # Verify that Chaos mode effects are applied
        chaos_effects_applied = False
        for segment in alt_file_low.segments:
            if "applied_mode" in segment.metadata and segment.metadata["applied_mode"] == "Chaos":
                chaos_effects_applied = True
                self.assertEqual(segment.metadata.get("chaos_level"), 3)
                break
        
        self.assertTrue(chaos_effects_applied, "Chaos mode effects were not applied to any segment")
        
        # Test with high chaos level (8)
        alt_file_high = self.parser.parse_command(
            "Search for information about AI and create a report",
            mode="Chaos",
            persona="technical_expert",
            metadata={"chaos_level": 8}
        )
        
        # Verify chaos level
        self.assertEqual(alt_file_high.mode, "Chaos")
        self.assertEqual(alt_file_high.chaos_level, 8)
        
        # Verify that Chaos mode effects are applied with higher intensity
        high_chaos_effects_applied = False
        for segment in alt_file_high.segments:
            if "applied_mode" in segment.metadata and segment.metadata["applied_mode"] == "Chaos":
                high_chaos_effects_applied = True
                self.assertEqual(segment.metadata.get("chaos_level"), 8)
                break
        
        self.assertTrue(high_chaos_effects_applied, "High chaos level effects were not applied to any segment")
    
    def test_persona_effects_technical_expert(self):
        """Test parsing a command with technical_expert persona"""
        # Parse command with technical_expert persona
        alt_file = self.parser.parse_command(
            "Search for information about AI and create a report",
            mode="Normal",
            persona="technical_expert"
        )
        
        # Verify persona
        self.assertEqual(alt_file.persona, "technical_expert")
        
        # Verify that technical_expert persona effects are applied
        persona_effects_applied = False
        for segment in alt_file.segments:
            if "applied_persona" in segment.metadata and segment.metadata["applied_persona"] == "technical_expert":
                persona_effects_applied = True
                break
        
        self.assertTrue(persona_effects_applied, "Technical expert persona effects were not applied to any segment")
    
    def test_persona_effects_creative_writer(self):
        """Test parsing a command with creative_writer persona"""
        # Parse command with creative_writer persona
        alt_file = self.parser.parse_command(
            "Search for information about AI and create a report",
            mode="Normal",
            persona="creative_writer"
        )
        
        # Verify persona
        self.assertEqual(alt_file.persona, "creative_writer")
        
        # Verify that creative_writer persona effects are applied
        persona_effects_applied = False
        for segment in alt_file.segments:
            if "applied_persona" in segment.metadata and segment.metadata["applied_persona"] == "creative_writer":
                persona_effects_applied = True
                break
        
        self.assertTrue(persona_effects_applied, "Creative writer persona effects were not applied to any segment")
    
    def test_persona_effects_researcher(self):
        """Test parsing a command with researcher persona"""
        # Parse command with researcher persona
        alt_file = self.parser.parse_command(
            "Search for information about AI and create a report",
            mode="Normal",
            persona="researcher"
        )
        
        # Verify persona
        self.assertEqual(alt_file.persona, "researcher")
        
        # Verify that researcher persona effects are applied
        persona_effects_applied = False
        for segment in alt_file.segments:
            if "applied_persona" in segment.metadata and segment.metadata["applied_persona"] == "researcher":
                persona_effects_applied = True
                break
        
        self.assertTrue(persona_effects_applied, "Researcher persona effects were not applied to any segment")
    
    def test_alt_file_metadata_persistence(self):
        """Test that mode and persona metadata is correctly saved to ALT files"""
        # Parse command with mode and persona
        alt_file = self.parser.parse_command(
            "Search for information about AI and create a report",
            mode="Dream",
            persona="creative_writer",
            metadata={"source": "test"}
        )
        
        # Save ALT file
        filename = "test_metadata.alt.yaml"
        file_path = self.alt_file_handler.save_alt_file(alt_file, filename)
        
        # Load ALT file
        loaded_alt = self.alt_file_handler.load_alt_file(filename)
        
        # Verify mode and persona
        self.assertEqual(loaded_alt.mode, "Dream")
        self.assertEqual(loaded_alt.persona, "creative_writer")
        
        # Verify metadata
        self.assertEqual(loaded_alt.metadata.get("source"), "test")
        
        # Verify segment metadata
        for segment in loaded_alt.segments:
            if "applied_mode" in segment.metadata:
                self.assertEqual(segment.metadata["applied_mode"], "Dream")
            
            if "applied_persona" in segment.metadata:
                self.assertEqual(segment.metadata["applied_persona"], "creative_writer")
    
    def test_combined_mode_persona_effects(self):
        """Test the combination of mode and persona effects"""
        # Parse command with Dream mode and researcher persona
        alt_file = self.parser.parse_command(
            "Search for information about AI and create a report",
            mode="Dream",
            persona="researcher"
        )
        
        # Verify mode and persona
        self.assertEqual(alt_file.mode, "Dream")
        self.assertEqual(alt_file.persona, "researcher")
        
        # Verify that both Dream mode and researcher persona effects are applied
        mode_effects_applied = False
        persona_effects_applied = False
        
        for segment in alt_file.segments:
            if "applied_mode" in segment.metadata and segment.metadata["applied_mode"] == "Dream":
                mode_effects_applied = True
            
            if "applied_persona" in segment.metadata and segment.metadata["applied_persona"] == "researcher":
                persona_effects_applied = True
        
        self.assertTrue(mode_effects_applied, "Dream mode effects were not applied to any segment")
        self.assertTrue(persona_effects_applied, "Researcher persona effects were not applied to any segment")

if __name__ == "__main__":
    unittest.main()
