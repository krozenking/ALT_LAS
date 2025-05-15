"""
Unit tests for the Command Parser module of ALT_LAS Segmentation Service

This module contains unit tests for the Command Parser module, testing the
functionality of the CommandParser class and its methods.
"""

import unittest
from unittest.mock import patch, MagicMock
import re

from command_parser import CommandParser, get_command_parser
from dsl_schema import AltFile, TaskSegment, TaskParameter
from language_processor import LanguageProcessor

class TestCommandParser(unittest.TestCase):
    """Test cases for CommandParser class"""
    
    def setUp(self):
        """Set up test data"""
        # Create a mock language processor
        self.mock_language_processor = MagicMock(spec=LanguageProcessor)
        
        # Configure mock language processor
        self.mock_language_processor.detect_language.return_value = "en"
        # self.mock_language_processor.tokenize_by_language.return_value = ["search", "for", "information", "about", "ai"] # Removed mock, use actual tokenizer
        self.mock_language_processor.get_task_keywords.return_value = {
            "search": ["search", "find", "look", "query"],
            "create": ["create", "make", "generate", "build"],
            "analyze": ["analyze", "examine", "study", "investigate"],
            "summarize": ["summarize", "condense", "abstract"],
            "translate": ["translate", "convert language"]
        }
        self.mock_language_processor.get_dependency_indicators.return_value = ["after", "then", "next", "following"]
        self.mock_language_processor.get_conjunction_indicators.return_value = ["and", "also", "additionally"]
        self.mock_language_processor.get_alternative_indicators.return_value = ["or", "alternatively", "either"]
        self.mock_language_processor.get_context_keywords.return_value = {
            "format": ["pdf", "doc", "docx", "txt", "csv"],
            "language": ["french", "german", "spanish", "turkish"]
        }
        
        # Create command parser with mock language processor
        with patch("command_parser.get_language_processor", return_value=self.mock_language_processor):
            self.parser = CommandParser()
    
    def test_parse_command_simple(self):
        """Test parsing a simple command"""
        # Configure mock for _split_into_subtasks
        self.parser._split_into_subtasks = MagicMock(return_value=["Search for information about AI"])
        
        # Configure mock for _identify_task_type
        self.parser._identify_task_type = MagicMock(return_value=("search", 0.9))
        
        # Configure mock for _extract_parameters
        self.parser._extract_parameters = MagicMock(return_value=[
            TaskParameter(name="query", value="information about AI", type="string", required=True)
        ])
        
        # Configure mock for _identify_dependencies
        self.parser._identify_dependencies = MagicMock()
        
        # Parse command
        alt_file = self.parser.parse_command("Search for information about AI")
        
        # Verify result
        self.assertEqual(alt_file.command, "Search for information about AI")
        self.assertEqual(alt_file.language, "en")
        self.assertEqual(alt_file.mode, "Normal")
        self.assertEqual(alt_file.persona, "technical_expert")
        self.assertEqual(len(alt_file.segments), 1)
        self.assertEqual(alt_file.segments[0].task_type, "search")
        self.assertEqual(alt_file.segments[0].content, "Search for information about AI")
        self.assertEqual(len(alt_file.segments[0].parameters), 1)
        self.assertEqual(alt_file.segments[0].parameters[0].name, "query")
        self.assertEqual(alt_file.segments[0].parameters[0].value, "information about AI")
        
        # Verify method calls
        self.mock_language_processor.detect_language.assert_called_once_with("Search for information about AI")
        self.parser._split_into_subtasks.assert_called_once()
        self.parser._identify_task_type.assert_called_once()
        self.parser._extract_parameters.assert_called_once()
        self.parser._identify_dependencies.assert_called_once()
    
    def test_parse_command_with_mode_and_persona(self):
        """Test parsing a command with mode and persona"""
        # Configure mock for _split_into_subtasks
        self.parser._split_into_subtasks = MagicMock(return_value=["Search for information about AI"])
        
        # Configure mock for _identify_task_type
        self.parser._identify_task_type = MagicMock(return_value=("search", 0.9))
        
        # Configure mock for _extract_parameters
        self.parser._extract_parameters = MagicMock(return_value=[
            TaskParameter(name="query", value="information about AI", type="string", required=True)
        ])
        
        # Configure mock for _identify_dependencies
        self.parser._identify_dependencies = MagicMock()
        
        # Parse command with mode and persona
        alt_file = self.parser.parse_command(
            "Search for information about AI",
            mode="Dream",
            persona="creative_writer"
        )
        
        # Verify result
        self.assertEqual(alt_file.command, "Search for information about AI")
        self.assertEqual(alt_file.language, "en")
        self.assertEqual(alt_file.mode, "Dream")
        self.assertEqual(alt_file.persona, "creative_writer")
    
    def test_parse_command_with_metadata(self):
        """Test parsing a command with metadata"""
        # Configure mock for _split_into_subtasks
        self.parser._split_into_subtasks = MagicMock(return_value=["Search for information about AI"])
        
        # Configure mock for _identify_task_type
        self.parser._identify_task_type = MagicMock(return_value=("search", 0.9))
        
        # Configure mock for _extract_parameters
        self.parser._extract_parameters = MagicMock(return_value=[
            TaskParameter(name="query", value="information about AI", type="string", required=True)
        ])
        
        # Configure mock for _identify_dependencies
        self.parser._identify_dependencies = MagicMock()
        
        # Parse command with metadata
        alt_file = self.parser.parse_command(
            "Search for information about AI",
            metadata={"priority": "high", "source": "user_input"}
        )
        
        # Verify result
        self.assertEqual(alt_file.command, "Search for information about AI")
        self.assertEqual(alt_file.metadata["priority"], "high")
        self.assertEqual(alt_file.metadata["source"], "user_input")
    
    def test_parse_command_with_chaos_mode(self):
        """Test parsing a command with Chaos mode"""
        # Configure mock for _split_into_subtasks
        self.parser._split_into_subtasks = MagicMock(return_value=["Search for information about AI"])
        
        # Configure mock for _identify_task_type
        self.parser._identify_task_type = MagicMock(return_value=("search", 0.9))
        
        # Configure mock for _extract_parameters
        self.parser._extract_parameters = MagicMock(return_value=[
            TaskParameter(name="query", value="information about AI", type="string", required=True)
        ])
        
        # Configure mock for _identify_dependencies
        self.parser._identify_dependencies = MagicMock()
        
        # Parse command with Chaos mode
        alt_file = self.parser.parse_command(
            "Search for information about AI",
            mode="Chaos",
            metadata={"chaos_level": 7}
        )
        
        # Verify result
        self.assertEqual(alt_file.command, "Search for information about AI")
        self.assertEqual(alt_file.mode, "Chaos")
        self.assertEqual(alt_file.chaos_level, 7)
    
    def test_segment_command_complex(self):
        """Test segmenting a complex command with multiple tasks and dependencies"""
        command = "Search for recent AI papers, then analyze the results, and finally create a summary report in pdf format."
        
        # Configure mock for _split_into_subtasks
        self.parser._split_into_subtasks = MagicMock(return_value=[
            "Search for recent AI papers",
            "analyze the results",
            "create a summary report in pdf format"
        ])
        
        # Configure mock for _identify_task_type
        self.parser._identify_task_type = MagicMock(side_effect=[
            ("search", 0.95),
            ("analyze", 0.85),
            ("create", 0.9)
        ])
        
        # Configure mock for _extract_parameters
        self.parser._extract_parameters = MagicMock(side_effect=[
            [TaskParameter(name="query", value="recent AI papers", type="string", required=True)],
            [TaskParameter(name="input_data", value="the results", type="string", required=True)], # Assuming analyze needs input
            [TaskParameter(name="title", value="summary report", type="string", required=True),
             TaskParameter(name="format", value="pdf", type="string", required=False)]
        ])
        
        # Configure mock for _identify_dependencies
        # Let the actual dependency identification run, but mock the indicators
        self.mock_language_processor.get_dependency_indicators.return_value = ["then", "finally", "after"]
        self.mock_language_processor.get_conjunction_indicators.return_value = ["and"]
        
        # Segment command
        segments = self.parser.segment_command(command, "en")
        
        # Verify result
        self.assertEqual(len(segments), 3)
        
        # Segment 1: Search
        self.assertEqual(segments[0].task_type, "search")
        self.assertEqual(segments[0].content, "Search for recent AI papers")
        self.assertEqual(len(segments[0].parameters), 1)
        self.assertEqual(segments[0].parameters[0].value, "recent AI papers")
        self.assertEqual(len(segments[0].dependencies), 0)
        
        # Segment 2: Analyze
        self.assertEqual(segments[1].task_type, "analyze")
        self.assertEqual(segments[1].content, "analyze the results")
        self.assertEqual(len(segments[1].parameters), 1)
        self.assertEqual(segments[1].parameters[0].value, "the results")
        self.assertEqual(len(segments[1].dependencies), 1)
        self.assertEqual(segments[1].dependencies[0], segments[0].id) # Depends on search
        
        # Segment 3: Create
        self.assertEqual(segments[2].task_type, "create")
        self.assertEqual(segments[2].content, "create a summary report in pdf format")
        self.assertEqual(len(segments[2].parameters), 2)
        self.assertTrue(any(p.name == "title" and p.value == "summary report" for p in segments[2].parameters))
        self.assertTrue(any(p.name == "format" and p.value == "pdf" for p in segments[2].parameters))
        self.assertEqual(len(segments[2].dependencies), 1)
        self.assertEqual(segments[2].dependencies[0], segments[1].id) # Depends on analyze

    def test_split_into_subtasks_multiple_conjunctions(self):
        """Test splitting a sentence with multiple conjunctions"""
        self.mock_language_processor.get_conjunction_indicators.return_value = ["and", "also"]
        result = self.parser._split_into_subtasks(
            "Search for X and create Y also analyze Z",
            "en"
        )
        self.assertEqual(len(result), 3)
        self.assertEqual(result[0], "Search for X")
        self.assertEqual(result[1], "create Y")
        self.assertEqual(result[2], "analyze Z")

    def test_split_into_subtasks_mixed_indicators(self):
        """Test splitting with mixed conjunctions and dependencies"""
        self.mock_language_processor.get_conjunction_indicators.return_value = ["and"]
        self.mock_language_processor.get_dependency_indicators.return_value = ["then"]
        result = self.parser._split_into_subtasks(
            "Search for X then create Y and analyze Z",
            "en"
        )
        # Splitting should prioritize dependency indicators if needed, or just split
        # Current simple split logic might just split by any indicator
        self.assertEqual(len(result), 3)
        self.assertEqual(result[0], "Search for X")
        self.assertEqual(result[1], "create Y")
        self.assertEqual(result[2], "analyze Z")

    def test_identify_task_type_ambiguous(self):
        """Test identifying task type with ambiguous keywords"""
        task_keywords = {
            "search": ["search", "find"],
            "create": ["create", "make"]
        }
        # Command contains keywords for multiple tasks
        task_type, confidence = self.parser._identify_task_type(
            "Find the document and make a copy",
            "en",
            task_keywords
        )
        # Expect the first identified task type (or based on confidence)
        self.assertEqual(task_type, "search") # Assuming 'find' comes first
        self.assertGreater(confidence, 0.5)

    def test_extract_parameters_translate(self):
        """Test extracting parameters for translate task"""
        self.mock_language_processor.get_task_keywords.return_value = {
            "translate": ["translate", "convert language"]
        }
        self.mock_language_processor.get_context_keywords.return_value = {
            "language": ["french", "german", "spanish", "turkish"]
        }
        
        parameters = self.parser._extract_parameters(
            "Translate this text to french",
            "translate",
            "en"
        )
        
        self.assertEqual(len(parameters), 2)
        text_param = next((p for p in parameters if p.name == "text"), None)
        lang_param = next((p for p in parameters if p.name == "target_language"), None)
        
        self.assertIsNotNone(text_param)
        self.assertEqual(text_param.value, "this text")
        self.assertTrue(text_param.required)
        
        self.assertIsNotNone(lang_param)
        self.assertEqual(lang_param.value, "french")
        self.assertFalse(lang_param.required) # Target language might be optional

    def test_identify_dependencies_multiple(self):
        """Test identifying multiple dependencies"""
        segment1 = TaskSegment(id="s1", content="Task 1", task_type="generic") # Added task_type
        segment2 = TaskSegment(id="s2", content="Task 2", task_type="generic") # Added task_type
        segment3 = TaskSegment(id="s3", content="Task 3", task_type="generic") # Added task_type
        segments = [segment1, segment2, segment3]
        
        command = "Do Task 1 then Task 2 and after that Task 3"
        dependency_indicators = ["then", "after that"]
        
        self.parser._identify_dependencies(segments, command, "en", dependency_indicators)
        
        self.assertEqual(len(segments[0].dependencies), 0)
        self.assertEqual(len(segments[1].dependencies), 1)
        self.assertEqual(segments[1].dependencies[0], "s1")
        self.assertEqual(len(segments[2].dependencies), 1)
        self.assertEqual(segments[2].dependencies[0], "s2") # Depends on the preceding task

    def test_identify_dependencies_no_indicator(self):
        """Test dependency identification without explicit indicators (sequential assumption)"""
        segment1 = TaskSegment(id="s1", content="Task 1", task_type="generic") # Added task_type
        segment2 = TaskSegment(id="s2", content="Task 2", task_type="generic") # Added task_type
        segments = [segment1, segment2]
        
        command = "Do Task 1. Do Task 2."
        dependency_indicators = [] # No explicit indicators
        
        self.parser._identify_dependencies(segments, command, "en", dependency_indicators)
        
        # Assuming sequential dependency if no indicator is found
        self.assertEqual(len(segments[0].dependencies), 0)
        self.assertEqual(len(segments[1].dependencies), 1)
        self.assertEqual(segments[1].dependencies[0], "s1")

    def test_get_command_parser_singleton(self):
        """Test that get_command_parser returns a singleton instance"""
        parser1 = get_command_parser()
        parser2 = get_command_parser()
        self.assertIs(parser1, parser2)

if __name__ == "__main__":
    unittest.main()

