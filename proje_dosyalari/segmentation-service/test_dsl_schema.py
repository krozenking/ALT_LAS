"""
Unit tests for the DSL schema module of ALT_LAS Segmentation Service

This module contains unit tests for the DSL schema module, testing the
functionality of the AltFile, TaskSegment, and TaskParameter models.
"""

import unittest
import os
import tempfile
from datetime import datetime
import json
import yaml

from dsl_schema import (
    AltFile, TaskSegment, TaskParameter,
    alt_to_yaml, alt_to_json, yaml_to_alt, json_to_alt,
    save_alt_file, load_alt_file
)

class TestTaskParameter(unittest.TestCase):
    """Test cases for TaskParameter model"""
    
    def test_task_parameter_creation(self):
        """Test creating a TaskParameter"""
        param = TaskParameter(
            name="query",
            value="information about AI",
            type="string",
            required=True,
            description="Search query"
        )
        
        self.assertEqual(param.name, "query")
        self.assertEqual(param.value, "information about AI")
        self.assertEqual(param.type, "string")
        self.assertTrue(param.required)
        self.assertEqual(param.description, "Search query")
    
    def test_task_parameter_defaults(self):
        """Test TaskParameter default values"""
        param = TaskParameter(
            name="query",
            value="information about AI"
        )
        
        self.assertEqual(param.type, "string")
        self.assertFalse(param.required)
        self.assertIsNone(param.description)
    
    def test_task_parameter_dict(self):
        """Test TaskParameter dict conversion"""
        param = TaskParameter(
            name="query",
            value="information about AI",
            type="string",
            required=True,
            description="Search query"
        )
        
        param_dict = param.dict()
        self.assertEqual(param_dict["name"], "query")
        self.assertEqual(param_dict["value"], "information about AI")
        self.assertEqual(param_dict["type"], "string")
        self.assertTrue(param_dict["required"])
        self.assertEqual(param_dict["description"], "Search query")

class TestTaskSegment(unittest.TestCase):
    """Test cases for TaskSegment model"""
    
    def test_task_segment_creation(self):
        """Test creating a TaskSegment"""
        param = TaskParameter(
            name="query",
            value="information about AI",
            type="string",
            required=True
        )
        
        segment = TaskSegment(
            task_type="search",
            content="Search for information about AI",
            parameters=[param],
            dependencies=["task1"],
            metadata={"confidence": 0.95}
        )
        
        self.assertEqual(segment.task_type, "search")
        self.assertEqual(segment.content, "Search for information about AI")
        self.assertEqual(len(segment.parameters), 1)
        self.assertEqual(segment.parameters[0].name, "query")
        self.assertEqual(len(segment.dependencies), 1)
        self.assertEqual(segment.dependencies[0], "task1")
        self.assertEqual(segment.metadata["confidence"], 0.95)
    
    def test_task_segment_defaults(self):
        """Test TaskSegment default values"""
        segment = TaskSegment(
            task_type="search",
            content="Search for information about AI"
        )
        
        self.assertIsNotNone(segment.id)
        self.assertEqual(len(segment.parameters), 0)
        self.assertEqual(len(segment.dependencies), 0)
        self.assertEqual(len(segment.metadata), 0)
    
    def test_task_segment_dict(self):
        """Test TaskSegment dict conversion"""
        param = TaskParameter(
            name="query",
            value="information about AI",
            type="string",
            required=True
        )
        
        segment = TaskSegment(
            id="test-id",
            task_type="search",
            content="Search for information about AI",
            parameters=[param],
            dependencies=["task1"],
            metadata={"confidence": 0.95}
        )
        
        segment_dict = segment.dict()
        self.assertEqual(segment_dict["id"], "test-id")
        self.assertEqual(segment_dict["task_type"], "search")
        self.assertEqual(segment_dict["content"], "Search for information about AI")
        self.assertEqual(len(segment_dict["parameters"]), 1)
        self.assertEqual(segment_dict["parameters"][0]["name"], "query")
        self.assertEqual(len(segment_dict["dependencies"]), 1)
        self.assertEqual(segment_dict["dependencies"][0], "task1")
        self.assertEqual(segment_dict["metadata"]["confidence"], 0.95)

class TestAltFile(unittest.TestCase):
    """Test cases for AltFile model"""
    
    def test_alt_file_creation(self):
        """Test creating an AltFile"""
        param = TaskParameter(
            name="query",
            value="information about AI",
            type="string",
            required=True
        )
        
        segment = TaskSegment(
            task_type="search",
            content="Search for information about AI",
            parameters=[param],
            metadata={"confidence": 0.95}
        )
        
        alt_file = AltFile(
            id="test-id",
            command="Search for information about AI",
            language="en",
            mode="Normal",
            persona="researcher",
            segments=[segment],
            metadata={"source": "user_input"}
        )
        
        self.assertEqual(alt_file.id, "test-id")
        self.assertEqual(alt_file.command, "Search for information about AI")
        self.assertEqual(alt_file.language, "en")
        self.assertEqual(alt_file.mode, "Normal")
        self.assertEqual(alt_file.persona, "researcher")
        self.assertEqual(len(alt_file.segments), 1)
        self.assertEqual(alt_file.segments[0].task_type, "search")
        self.assertEqual(alt_file.metadata["source"], "user_input")
    
    def test_alt_file_defaults(self):
        """Test AltFile default values"""
        segment = TaskSegment(
            task_type="search",
            content="Search for information about AI"
        )
        
        alt_file = AltFile(
            command="Search for information about AI",
            language="en",
            segments=[segment]
        )
        
        self.assertIsNotNone(alt_file.id)
        self.assertEqual(alt_file.version, "1.0")
        self.assertIsNotNone(alt_file.timestamp)
        self.assertEqual(alt_file.mode, "Normal")
        self.assertEqual(alt_file.persona, "technical_expert")
        self.assertIsNone(alt_file.chaos_level)
        self.assertEqual(len(alt_file.metadata), 0)
    
    def test_alt_file_mode_validation(self):
        """Test AltFile mode validation"""
        segment = TaskSegment(
            task_type="search",
            content="Search for information about AI"
        )
        
        # Valid mode
        alt_file = AltFile(
            command="Search for information about AI",
            language="en",
            mode="Dream",
            segments=[segment]
        )
        self.assertEqual(alt_file.mode, "Dream")
        
        # Invalid mode
        with self.assertRaises(ValueError):
            AltFile(
                command="Search for information about AI",
                language="en",
                mode="Invalid",
                segments=[segment]
            )
    
    def test_alt_file_chaos_level_validation(self):
        """Test AltFile chaos_level validation"""
        segment = TaskSegment(
            task_type="search",
            content="Search for information about AI"
        )
        
        # Valid chaos_level with Chaos mode
        alt_file = AltFile(
            command="Search for information about AI",
            language="en",
            mode="Chaos",
            chaos_level=5,
            segments=[segment]
        )
        self.assertEqual(alt_file.chaos_level, 5)
        
        # Invalid chaos_level with Chaos mode (out of range)
        with self.assertRaises(ValueError):
            AltFile(
                command="Search for information about AI",
                language="en",
                mode="Chaos",
                chaos_level=11,
                segments=[segment]
            )
        
        # Invalid chaos_level with non-Chaos mode
        with self.assertRaises(ValueError):
            AltFile(
                command="Search for information about AI",
                language="en",
                mode="Normal",
                chaos_level=5,
                segments=[segment]
            )
    
    def test_alt_file_dict(self):
        """Test AltFile dict conversion"""
        param = TaskParameter(
            name="query",
            value="information about AI",
            type="string",
            required=True
        )
        
        segment = TaskSegment(
            id="segment-id",
            task_type="search",
            content="Search for information about AI",
            parameters=[param],
            metadata={"confidence": 0.95}
        )
        
        alt_file = AltFile(
            id="test-id",
            version="1.0",
            timestamp="2023-01-01T00:00:00",
            command="Search for information about AI",
            language="en",
            mode="Normal",
            persona="researcher",
            segments=[segment],
            metadata={"source": "user_input"}
        )
        
        alt_dict = alt_file.dict()
        self.assertEqual(alt_dict["id"], "test-id")
        self.assertEqual(alt_dict["version"], "1.0")
        self.assertEqual(alt_dict["timestamp"], "2023-01-01T00:00:00")
        self.assertEqual(alt_dict["command"], "Search for information about AI")
        self.assertEqual(alt_dict["language"], "en")
        self.assertEqual(alt_dict["mode"], "Normal")
        self.assertEqual(alt_dict["persona"], "researcher")
        self.assertEqual(len(alt_dict["segments"]), 1)
        self.assertEqual(alt_dict["segments"][0]["id"], "segment-id")
        self.assertEqual(alt_dict["metadata"]["source"], "user_input")

class TestAltFileConversion(unittest.TestCase):
    """Test cases for ALT file conversion functions"""
    
    def setUp(self):
        """Set up test data"""
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
            id="segment1",
            task_type="search",
            content="Search for information about AI",
            parameters=[param1],
            metadata={"confidence": 0.95}
        )
        
        segment2 = TaskSegment(
            id="segment2",
            task_type="create",
            content="Create a report",
            parameters=[param2],
            dependencies=["segment1"],
            metadata={"confidence": 0.9}
        )
        
        self.alt_file = AltFile(
            id="test-id",
            version="1.0",
            timestamp="2023-01-01T00:00:00",
            command="Search for information about AI and create a report",
            language="en",
            mode="Normal",
            persona="researcher",
            segments=[segment1, segment2],
            metadata={"source": "user_input"}
        )
    
    def test_alt_to_yaml(self):
        """Test converting AltFile to YAML"""
        yaml_str = alt_to_yaml(self.alt_file)
        self.assertIsInstance(yaml_str, str)
        
        # Parse YAML and verify
        data = yaml.safe_load(yaml_str)
        self.assertEqual(data["id"], "test-id")
        self.assertEqual(data["command"], "Search for information about AI and create a report")
        self.assertEqual(len(data["segments"]), 2)
    
    def test_alt_to_json(self):
        """Test converting AltFile to JSON"""
        json_str = alt_to_json(self.alt_file)
        self.assertIsInstance(json_str, str)
        
        # Parse JSON and verify
        data = json.loads(json_str)
        self.assertEqual(data["id"], "test-id")
        self.assertEqual(data["command"], "Search for information about AI and create a report")
        self.assertEqual(len(data["segments"]), 2)
    
    def test_yaml_to_alt(self):
        """Test converting YAML to AltFile"""
        yaml_str = alt_to_yaml(self.alt_file)
        alt_file = yaml_to_alt(yaml_str)
        
        self.assertEqual(alt_file.id, "test-id")
        self.assertEqual(alt_file.command, "Search for information about AI and create a report")
        self.assertEqual(len(alt_file.segments), 2)
    
    def test_json_to_alt(self):
        """Test converting JSON to AltFile"""
        json_str = alt_to_json(self.alt_file)
        alt_file = json_to_alt(json_str)
        
        self.assertEqual(alt_file.id, "test-id")
        self.assertEqual(alt_file.command, "Search for information about AI and create a report")
        self.assertEqual(len(alt_file.segments), 2)

class TestAltFileIO(unittest.TestCase):
    """Test cases for ALT file I/O functions"""
    
    def setUp(self):
        """Set up test data"""
        param = TaskParameter(
            name="query",
            value="information about AI",
            type="string",
            required=True
        )
        
        segment = TaskSegment(
            task_type="search",
            content="Search for information about AI",
            parameters=[param],
            metadata={"confidence": 0.95}
        )
        
        self.alt_file = AltFile(
            id="test-id",
            command="Search for information about AI",
            language="en",
            mode="Normal",
            persona="researcher",
            segments=[segment],
            metadata={"source": "user_input"}
        )
        
        # Create temporary directory
        self.temp_dir = tempfile.mkdtemp()
    
    def tearDown(self):
        """Clean up temporary files"""
        for file in os.listdir(self.temp_dir):
            os.remove(os.path.join(self.temp_dir, file))
        os.rmdir(self.temp_dir)
    
    def test_save_load_alt_file_yaml(self):
        """Test saving and loading ALT file in YAML format"""
        file_path = os.path.join(self.temp_dir, "test.alt.yaml")
        
        # Save file
        save_alt_file(self.alt_file, file_path, format="yaml")
        self.assertTrue(os.path.exists(file_path))
        
        # Load file
        loaded_alt = load_alt_file(file_path)
        
        self.assertEqual(loaded_alt.id, "test-id")
        self.assertEqual(loaded_alt.command, "Search for information about AI")
        self.assertEqual(len(loaded_alt.segments), 1)
    
    def test_save_load_alt_file_json(self):
        """Test saving and loading ALT file in JSON format"""
        file_path = os.path.join(self.temp_dir, "test.alt.json")
        
        # Save file
        save_alt_file(self.alt_file, file_path, format="json")
        self.assertTrue(os.path.exists(file_path))
        
        # Load file
        loaded_alt = load_alt_file(file_path)
        
        self.assertEqual(loaded_alt.id, "test-id")
        self.assertEqual(loaded_alt.command, "Search for information about AI")
        self.assertEqual(len(loaded_alt.segments), 1)
    
    def test_load_alt_file_unknown_format(self):
        """Test loading ALT file with unknown format"""
        file_path = os.path.join(self.temp_dir, "test.alt")
        
        # Save file as YAML but without extension
        with open(file_path, "w") as f:
            f.write(alt_to_yaml(self.alt_file))
        
        # Load file
        loaded_alt = load_alt_file(file_path)
        
        self.assertEqual(loaded_alt.id, "test-id")
        self.assertEqual(loaded_alt.command, "Search for information about AI")
        self.assertEqual(len(loaded_alt.segments), 1)

if __name__ == "__main__":
    unittest.main()
