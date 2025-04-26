"""
Unit tests for the ALT File Handler module of ALT_LAS Segmentation Service

This module contains unit tests for the ALT File Handler module, testing the
functionality of the AltFileHandler class and its methods.
"""

import unittest
import os
import tempfile
import shutil
from pathlib import Path

from alt_file_handler import AltFileHandler, get_alt_file_handler
from dsl_schema import AltFile, TaskSegment, TaskParameter

class TestAltFileHandler(unittest.TestCase):
    """Test cases for AltFileHandler class"""
    
    def setUp(self):
        """Set up test data and environment"""
        # Create a temporary directory for testing
        self.test_dir = tempfile.mkdtemp()
        
        # Create an AltFileHandler with the test directory
        self.handler = AltFileHandler(self.test_dir)
        
        # Create a sample ALT file for testing
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
            command="Search for information about AI and create a report",
            language="en",
            mode="Normal",
            persona="researcher",
            segments=[segment1, segment2],
            metadata={"source": "user_input"}
        )
    
    def tearDown(self):
        """Clean up temporary files and directories"""
        shutil.rmtree(self.test_dir)
    
    def test_init_creates_directory(self):
        """Test that initialization creates the directory if it doesn't exist"""
        # Create a path for a non-existent directory
        new_dir = os.path.join(self.test_dir, "new_dir")
        
        # Create a handler with the new directory
        handler = AltFileHandler(new_dir)
        
        # Verify that the directory was created
        self.assertTrue(os.path.exists(new_dir))
        self.assertTrue(os.path.isdir(new_dir))
    
    def test_save_alt_file_yaml(self):
        """Test saving an ALT file in YAML format"""
        # Save the ALT file
        filename = "test.alt.yaml"
        file_path = self.handler.save_alt_file(self.alt_file, filename, format="yaml")
        
        # Verify that the file was saved
        self.assertTrue(os.path.exists(file_path))
        self.assertTrue(os.path.isfile(file_path))
        
        # Verify the file path
        expected_path = os.path.join(self.test_dir, filename)
        self.assertEqual(file_path, expected_path)
        
        # Verify the file content
        with open(file_path, "r") as f:
            content = f.read()
        
        self.assertIn("id: test-id", content)
        self.assertIn("command: Search for information about AI and create a report", content)
        self.assertIn("language: en", content)
        self.assertIn("mode: Normal", content)
        self.assertIn("persona: researcher", content)
    
    def test_save_alt_file_json(self):
        """Test saving an ALT file in JSON format"""
        # Save the ALT file
        filename = "test.alt.json"
        file_path = self.handler.save_alt_file(self.alt_file, filename, format="json")
        
        # Verify that the file was saved
        self.assertTrue(os.path.exists(file_path))
        self.assertTrue(os.path.isfile(file_path))
        
        # Verify the file path
        expected_path = os.path.join(self.test_dir, filename)
        self.assertEqual(file_path, expected_path)
        
        # Verify the file content
        with open(file_path, "r") as f:
            content = f.read()
        
        self.assertIn('"id": "test-id"', content)
        self.assertIn('"command": "Search for information about AI and create a report"', content)
        self.assertIn('"language": "en"', content)
        self.assertIn('"mode": "Normal"', content)
        self.assertIn('"persona": "researcher"', content)
    
    def test_save_alt_file_default_filename(self):
        """Test saving an ALT file with default filename"""
        # Save the ALT file with default filename
        file_path = self.handler.save_alt_file(self.alt_file)
        
        # Verify that the file was saved
        self.assertTrue(os.path.exists(file_path))
        self.assertTrue(os.path.isfile(file_path))
        
        # Verify the file path format
        expected_filename = f"task_{self.alt_file.id}.alt.yaml"
        expected_path = os.path.join(self.test_dir, expected_filename)
        self.assertEqual(file_path, expected_path)
    
    def test_save_alt_file_invalid_format(self):
        """Test saving an ALT file with invalid format"""
        # Attempt to save with invalid format
        with self.assertRaises(ValueError):
            self.handler.save_alt_file(self.alt_file, "test.alt.invalid", format="invalid")
    
    def test_load_alt_file_yaml(self):
        """Test loading an ALT file in YAML format"""
        # Save the ALT file
        filename = "test.alt.yaml"
        file_path = self.handler.save_alt_file(self.alt_file, filename, format="yaml")
        
        # Load the ALT file
        loaded_alt = self.handler.load_alt_file(filename)
        
        # Verify the loaded ALT file
        self.assertEqual(loaded_alt.id, "test-id")
        self.assertEqual(loaded_alt.command, "Search for information about AI and create a report")
        self.assertEqual(loaded_alt.language, "en")
        self.assertEqual(loaded_alt.mode, "Normal")
        self.assertEqual(loaded_alt.persona, "researcher")
        self.assertEqual(len(loaded_alt.segments), 2)
        self.assertEqual(loaded_alt.segments[0].id, "segment1")
        self.assertEqual(loaded_alt.segments[1].id, "segment2")
        self.assertEqual(loaded_alt.metadata["source"], "user_input")
    
    def test_load_alt_file_json(self):
        """Test loading an ALT file in JSON format"""
        # Save the ALT file
        filename = "test.alt.json"
        file_path = self.handler.save_alt_file(self.alt_file, filename, format="json")
        
        # Load the ALT file
        loaded_alt = self.handler.load_alt_file(filename)
        
        # Verify the loaded ALT file
        self.assertEqual(loaded_alt.id, "test-id")
        self.assertEqual(loaded_alt.command, "Search for information about AI and create a report")
        self.assertEqual(loaded_alt.language, "en")
        self.assertEqual(loaded_alt.mode, "Normal")
        self.assertEqual(loaded_alt.persona, "researcher")
        self.assertEqual(len(loaded_alt.segments), 2)
        self.assertEqual(loaded_alt.segments[0].id, "segment1")
        self.assertEqual(loaded_alt.segments[1].id, "segment2")
        self.assertEqual(loaded_alt.metadata["source"], "user_input")
    
    def test_load_alt_file_not_found(self):
        """Test loading a non-existent ALT file"""
        # Attempt to load a non-existent file
        with self.assertRaises(FileNotFoundError):
            self.handler.load_alt_file("non_existent.alt.yaml")
    
    def test_list_alt_files(self):
        """Test listing ALT files"""
        # Save multiple ALT files
        self.handler.save_alt_file(self.alt_file, "test1.alt.yaml")
        self.handler.save_alt_file(self.alt_file, "test2.alt.json")
        self.handler.save_alt_file(self.alt_file, "test3.alt.yaml")
        
        # Create a non-ALT file
        with open(os.path.join(self.test_dir, "not_alt.txt"), "w") as f:
            f.write("This is not an ALT file")
        
        # List ALT files
        alt_files = self.handler.list_alt_files()
        
        # Verify the list
        self.assertEqual(len(alt_files), 3)
        self.assertIn("test1.alt.yaml", alt_files)
        self.assertIn("test2.alt.json", alt_files)
        self.assertIn("test3.alt.yaml", alt_files)
        self.assertNotIn("not_alt.txt", alt_files)
    
    def test_delete_alt_file(self):
        """Test deleting an ALT file"""
        # Save an ALT file
        filename = "test_delete.alt.yaml"
        file_path = self.handler.save_alt_file(self.alt_file, filename)
        
        # Verify that the file exists
        self.assertTrue(os.path.exists(file_path))
        
        # Delete the file
        result = self.handler.delete_alt_file(filename)
        
        # Verify the result and that the file was deleted
        self.assertTrue(result)
        self.assertFalse(os.path.exists(file_path))
    
    def test_delete_alt_file_not_found(self):
        """Test deleting a non-existent ALT file"""
        # Attempt to delete a non-existent file
        result = self.handler.delete_alt_file("non_existent.alt.yaml")
        
        # Verify the result
        self.assertFalse(result)

class TestGetAltFileHandler(unittest.TestCase):
    """Test cases for get_alt_file_handler function"""
    
    def test_get_alt_file_handler(self):
        """Test getting the ALT file handler instance"""
        handler1 = get_alt_file_handler()
        handler2 = get_alt_file_handler()
        
        # Verify that the same instance is returned
        self.assertIs(handler1, handler2)
        self.assertIsInstance(handler1, AltFileHandler)

if __name__ == "__main__":
    unittest.main()
