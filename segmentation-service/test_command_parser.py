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
            "analyze": ["analyze", "examine", "study", "investigate"]
        }
        self.mock_language_processor.get_dependency_indicators.return_value = ["after", "then", "next", "following"]
        self.mock_language_processor.get_conjunction_indicators.return_value = ["and", "also", "additionally"]
        self.mock_language_processor.get_alternative_indicators.return_value = ["or", "alternatively", "either"]
        self.mock_language_processor.get_context_keywords.return_value = {
            "format": ["pdf", "doc", "docx", "txt", "csv"]
        }
        
        # Create command parser with mock language processor
        with patch('command_parser.get_language_processor', return_value=self.mock_language_processor):
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
    
    def test_segment_command(self):
        """Test segmenting a command into tasks"""
        # Configure mock for _split_into_subtasks
        # This mock should return the expected split for the single sentence command
        self.parser._split_into_subtasks = MagicMock(return_value=[
            "Search for information about AI",
            "create a report"
        ])
        
        # Configure mock for _identify_task_type
        self.parser._identify_task_type = MagicMock(side_effect=[
            ("search", 0.9),
            ("create", 0.8)
        ])
        
        # Configure mock for _extract_parameters
        self.parser._extract_parameters = MagicMock(side_effect=[
            [TaskParameter(name="query", value="information about AI", type="string", required=True)],
            [TaskParameter(name="title", value="report", type="string", required=True)]
        ])
        
        # Configure mock for _identify_dependencies
        self.parser._identify_dependencies = MagicMock()
        
        # Segment command
        segments = self.parser.segment_command(
            "Search for information about AI and create a report",
            "en"
        )
        
        # Verify result
        self.assertEqual(len(segments), 2)
        self.assertEqual(segments[0].task_type, "search")
        self.assertEqual(segments[0].content, "Search for information about AI")
        self.assertEqual(segments[1].task_type, "create")
        self.assertEqual(segments[1].content, "create a report")
        
        # Verify method calls
        self.parser._identify_dependencies.assert_called_once()
    
    def test_split_into_subtasks(self):
        """Test splitting a sentence into subtasks"""
        # Reset mock
        self.mock_language_processor.get_conjunction_indicators.return_value = ["and", "also"]
        self.mock_language_processor.get_alternative_indicators.return_value = ["or", "alternatively"]
        
        # Test with conjunction
        result = self.parser._split_into_subtasks(
            "Search for information about AI and create a report",
            "en"
        )
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0], "Search for information about AI")
        self.assertEqual(result[1], "create a report")
        
        # Test with alternative
        result = self.parser._split_into_subtasks(
            "Search for information about AI or find recent papers",
            "en"
        )
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0], "Search for information about AI")
        self.assertEqual(result[1], "find recent papers")
        
        # Test with no indicators
        result = self.parser._split_into_subtasks(
            "Search for information about AI",
            "en"
        )
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0], "Search for information about AI")
    
    def test_identify_task_type(self):
        """Test identifying task type"""
        # Configure mock
        task_keywords = {
            "search": ["search", "find", "look", "query"],
            "create": ["create", "make", "generate", "build"],
            "analyze": ["analyze", "examine", "study", "investigate"]
        }
        
        # Test search task
        task_type, confidence = self.parser._identify_task_type(
            "Search for information about AI",
            "en",
            task_keywords
        )
        self.assertEqual(task_type, "search")
        self.assertGreater(confidence, 0.5)
        
        # Test create task
        task_type, confidence = self.parser._identify_task_type(
            "Create a report about AI",
            "en",
            task_keywords
        )
        self.assertEqual(task_type, "create")
        self.assertGreater(confidence, 0.5)
        
        # Test analyze task
        # Use a more specific analyze phrase without "create" to avoid confusion
        task_type, confidence = self.parser._identify_task_type(
            "Analyze the data for patterns",
            "en",
            task_keywords
        )
        self.assertEqual(task_type, "analyze")
        self.assertGreater(confidence, 0.5)
        
        # Test unknown task
        task_type, confidence = self.parser._identify_task_type(
            "Do something with AI",
            "en",
            task_keywords
        )
        self.assertEqual(task_type, "execute")
        self.assertEqual(confidence, 0.5)
    
    def test_extract_parameters_search(self):
        """Test extracting parameters for search task"""
        # Configure mock
        self.mock_language_processor.get_task_keywords.return_value = {
            "search": ["search", "find", "look", "query"]
        }
        
        # Extract parameters
        parameters = self.parser._extract_parameters(
            "Search for information about AI",
            "search",
            "en"
        )
        
        # Verify result
        self.assertEqual(len(parameters), 1)
        self.assertEqual(parameters[0].name, "query")
        self.assertEqual(parameters[0].value, "for information about AI")
        self.assertEqual(parameters[0].type, "string")
        self.assertTrue(parameters[0].required)
    
    def test_extract_parameters_create(self):
        """Test extracting parameters for create task"""
        # Configure mock
        self.mock_language_processor.get_task_keywords.return_value = {
            "create": ["create", "make", "generate", "build"]
        }
        self.mock_language_processor.get_context_keywords.return_value = {
            "format": ["pdf", "doc", "docx", "txt", "csv"]
        }
        
        # Extract parameters with format
        parameters = self.parser._extract_parameters(
            "Create a pdf report about AI",
            "create",
            "en"
        )
        
        # Verify result
        self.assertEqual(len(parameters), 2)
        
        format_param = next((p for p in parameters if p.name == "format"), None)
        self.assertIsNotNone(format_param)
        self.assertEqual(format_param.value, "pdf")
        self.assertEqual(format_param.type, "string")
        self.assertFalse(format_param.required)
        
        title_param = next((p for p in parameters if p.name == "title"), None)
        self.assertIsNotNone(title_param)
        self.assertEqual(title_param.value, "a report about AI")
        self.assertEqual(title_param.type, "string")
        self.assertTrue(title_param.required)
        
        # Extract parameters without format
        parameters = self.parser._extract_parameters(
            "Create a report about AI",
            "create",
            "en"
        )
        
        # Verify result
        self.assertEqual(len(parameters), 1)
        self.assertEqual(parameters[0].name, "title")
        self.assertEqual(parameters[0].value, "a report about AI")
    
    def test_identify_dependencies(self):
        """Test identifying dependencies between segments"""
        # Create segments
        segment1 = TaskSegment(
            id="segment1",
            task_type="search",
            content="Search for information about AI",
            parameters=[
                TaskParameter(name="query", value="information about AI", type="string", required=True)
            ]
        )
        
        segment2 = TaskSegment(
            id="segment2",
            task_type="create",
            content="Create a report",
            parameters=[
                TaskParameter(name="title", value="report", type="string", required=True)
            ]
        )
        
        segments = [segment1, segment2]
        
        # Configure mock
        dependency_indicators = ["after", "then", "next", "following"]
        
        # Test with dependency indicator
        command = "Search for information about AI then create a report"
        self.parser._identify_dependencies(segments, command, "en", dependency_indicators)
        
        # Verify result
        self.assertEqual(len(segments[1].dependencies), 1)
        self.assertEqual(segments[1].dependencies[0], "segment1")
        
        # Reset dependencies
        segments[1].dependencies = []
        
        # Test without dependency indicator
        command = "Search for information about AI and create a report"
        self.parser._identify_dependencies(segments, command, "en", dependency_indicators)
        
        # Verify result
        self.assertEqual(len(segments[1].dependencies), 0)

class TestGetCommandParser(unittest.TestCase):
    """Test cases for get_command_parser function"""
    
    def test_get_command_parser(self):
        """Test getting the command parser instance"""
        parser1 = get_command_parser()
        parser2 = get_command_parser()
        
        # Verify that the same instance is returned
        self.assertIs(parser1, parser2)
        self.assertIsInstance(parser1, CommandParser)

if __name__ == "__main__":
    unittest.main()
