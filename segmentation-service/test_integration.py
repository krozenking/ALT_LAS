"""
Integration Tests for ALT_LAS Segmentation Service

This module contains integration tests for the Segmentation Service,
testing the interaction between different components.
"""

import unittest
import os
import sys
import json
import tempfile
import shutil
from fastapi.testclient import TestClient

# Import modules to test
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from enhanced_main import app
from dsl_schema import AltFile, TaskSegment, TaskParameter
from command_parser import get_command_parser
from alt_file_handler import get_alt_file_handler
from task_prioritization import get_task_prioritizer
from performance_optimizer import get_performance_optimizer
from error_handling import get_logger

# Get logger
logger = get_logger("integration_tests")

class IntegrationTests(unittest.TestCase):
    """Integration tests for Segmentation Service"""
    
    def setUp(self):
        """Set up test environment"""
        # Create test client
        self.client = TestClient(app)
        
        # Create temporary directory for ALT files
        self.temp_dir = tempfile.mkdtemp()
        
        # Get components
        self.parser = get_command_parser()
        self.file_handler = get_alt_file_handler()
        self.prioritizer = get_task_prioritizer()
        self.optimizer = get_performance_optimizer()
        
        # Override ALT files directory
        self.original_alt_files_dir = self.file_handler.alt_files_dir
        self.file_handler.alt_files_dir = self.temp_dir
        
        # Sample commands for testing
        self.sample_commands = [
            "Dosyaları sırala ve en büyük 10 tanesini göster",
            "Tüm .jpg dosyalarını bir klasöre taşı ve sıkıştır",
            "Google'da yapay zeka hakkında arama yap ve sonuçları bir dosyaya kaydet"
        ]
    
    def tearDown(self):
        """Clean up test environment"""
        # Restore original ALT files directory
        self.file_handler.alt_files_dir = self.original_alt_files_dir
        
        # Remove temporary directory
        shutil.rmtree(self.temp_dir)
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("message", response.json())
        self.assertIn("version", response.json())
    
    def test_health_endpoint(self):
        """Test health endpoint"""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "UP")
        self.assertIn("timestamp", response.json())
    
    def test_segment_endpoint(self):
        """Test segment endpoint"""
        # Test with a simple command
        request_data = {
            "command": "Dosyaları sırala ve en büyük 10 tanesini göster",
            "mode": "Normal",
            "persona": "technical_expert",
            "metadata": {
                "user_id": "test_user",
                "session_id": "test_session"
            }
        }
        
        response = self.client.post("/segment", json=request_data)
        self.assertEqual(response.status_code, 200)
        
        # Verify response structure
        response_data = response.json()
        self.assertIn("id", response_data)
        self.assertIn("status", response_data)
        self.assertIn("alt_file", response_data)
        self.assertIn("language", response_data)
        self.assertIn("segments_count", response_data)
        self.assertIn("metadata", response_data)
        
        # Verify metadata
        self.assertIn("user_id", response_data["metadata"])
        self.assertEqual(response_data["metadata"]["user_id"], "test_user")
        self.assertIn("session_id", response_data["metadata"])
        self.assertEqual(response_data["metadata"]["session_id"], "test_session")
        
        # Verify ALT file was created
        alt_filename = response_data["alt_file"]
        alt_file_path = os.path.join(self.temp_dir, alt_filename)
        self.assertTrue(os.path.exists(alt_file_path))
        
        # Test with a different command
        request_data = {
            "command": "Google'da yapay zeka hakkında arama yap ve sonuçları bir dosyaya kaydet",
            "mode": "Explore",
            "persona": "data_analyst"
        }
        
        response = self.client.post("/segment", json=request_data)
        self.assertEqual(response.status_code, 200)
        
        # Verify response
        response_data = response.json()
        self.assertEqual(response_data["status"], "completed")
        self.assertEqual(response_data["language"], "tr")
        self.assertGreater(response_data["segments_count"], 0)
        
        # Verify ALT file was created
        alt_filename = response_data["alt_file"]
        alt_file_path = os.path.join(self.temp_dir, alt_filename)
        self.assertTrue(os.path.exists(alt_file_path))
    
    def test_get_segment_status_endpoint(self):
        """Test get segment status endpoint"""
        # First create a segment
        request_data = {
            "command": "Dosyaları sırala ve en büyük 10 tanesini göster",
            "mode": "Normal",
            "persona": "technical_expert"
        }
        
        response = self.client.post("/segment", json=request_data)
        self.assertEqual(response.status_code, 200)
        
        # Get the task ID
        task_id = response.json()["id"]
        
        # Get the segment status
        response = self.client.get(f"/segment/{task_id}")
        self.assertEqual(response.status_code, 200)
        
        # Verify response
        response_data = response.json()
        self.assertEqual(response_data["id"], task_id)
        self.assertEqual(response_data["status"], "completed")
        
        # Test with non-existent task ID
        response = self.client.get("/segment/non-existent-task-id")
        self.assertEqual(response.status_code, 404)
    
    def test_alt_files_list_endpoint(self):
        """Test ALT files list endpoint"""
        # First create some ALT files
        for command in self.sample_commands:
            request_data = {
                "command": command,
                "mode": "Normal",
                "persona": "technical_expert"
            }
            
            response = self.client.post("/segment", json=request_data)
            self.assertEqual(response.status_code, 200)
        
        # Get the list of ALT files
        response = self.client.get("/alt-files")
        self.assertEqual(response.status_code, 200)
        
        # Verify response
        alt_files = response.json()
        self.assertIsInstance(alt_files, list)
        self.assertEqual(len(alt_files), len(self.sample_commands))
    
    def test_get_alt_file_endpoint(self):
        """Test get ALT file endpoint"""
        # First create an ALT file
        request_data = {
            "command": "Dosyaları sırala ve en büyük 10 tanesini göster",
            "mode": "Normal",
            "persona": "technical_expert"
        }
        
        response = self.client.post("/segment", json=request_data)
        self.assertEqual(response.status_code, 200)
        
        # Get the ALT filename
        alt_filename = response.json()["alt_file"]
        
        # Get the ALT file
        response = self.client.get(f"/alt-files/{alt_filename}")
        self.assertEqual(response.status_code, 200)
        
        # Verify response
        alt_file = response.json()
        self.assertIn("id", alt_file)
        self.assertIn("command", alt_file)
        self.assertIn("language", alt_file)
        self.assertIn("mode", alt_file)
        self.assertIn("persona", alt_file)
        self.assertIn("segments", alt_file)
        self.assertIn("metadata", alt_file)
        
        # Verify command
        self.assertEqual(alt_file["command"], request_data["command"])
        
        # Verify segments
        self.assertIsInstance(alt_file["segments"], list)
        self.assertGreater(len(alt_file["segments"]), 0)
        
        # Test with non-existent ALT file
        response = self.client.get("/alt-files/non-existent-file.alt.yaml")
        self.assertEqual(response.status_code, 404)
    
    def test_delete_alt_file_endpoint(self):
        """Test delete ALT file endpoint"""
        # First create an ALT file
        request_data = {
            "command": "Dosyaları sırala ve en büyük 10 tanesini göster",
            "mode": "Normal",
            "persona": "technical_expert"
        }
        
        response = self.client.post("/segment", json=request_data)
        self.assertEqual(response.status_code, 200)
        
        # Get the ALT filename
        alt_filename = response.json()["alt_file"]
        
        # Verify the file exists
        alt_file_path = os.path.join(self.temp_dir, alt_filename)
        self.assertTrue(os.path.exists(alt_file_path))
        
        # Delete the ALT file
        response = self.client.delete(f"/alt-files/{alt_filename}")
        self.assertEqual(response.status_code, 200)
        
        # Verify response
        response_data = response.json()
        self.assertIn("message", response_data)
        
        # Verify the file was deleted
        self.assertFalse(os.path.exists(alt_file_path))
        
        # Test with non-existent ALT file
        response = self.client.delete("/alt-files/non-existent-file.alt.yaml")
        self.assertEqual(response.status_code, 404)
    
    def test_languages_endpoint(self):
        """Test languages endpoint"""
        response = self.client.get("/languages")
        self.assertEqual(response.status_code, 200)
        
        # Verify response
        response_data = response.json()
        self.assertIn("supported_languages", response_data)
        self.assertIsInstance(response_data["supported_languages"], list)
        self.assertGreater(len(response_data["supported_languages"]), 0)
        
        # Verify languages
        languages = response_data["supported_languages"]
        language_codes = [lang["code"] for lang in languages]
        self.assertIn("en", language_codes)
        self.assertIn("tr", language_codes)
    
    def test_modes_endpoint(self):
        """Test modes endpoint"""
        response = self.client.get("/modes")
        self.assertEqual(response.status_code, 200)
        
        # Verify response
        response_data = response.json()
        self.assertIn("supported_modes", response_data)
        self.assertIsInstance(response_data["supported_modes"], list)
        self.assertGreater(len(response_data["supported_modes"]), 0)
        
        # Verify modes
        modes = response_data["supported_modes"]
        mode_codes = [mode["code"] for mode in modes]
        self.assertIn("Normal", mode_codes)
        self.assertIn("Dream", mode_codes)
        self.assertIn("Explore", mode_codes)
        self.assertIn("Chaos", mode_codes)
    
    def test_end_to_end_workflow(self):
        """Test end-to-end workflow"""
        # 1. Create a segment
        request_data = {
            "command": "Google'da yapay zeka hakkında arama yap ve sonuçları bir dosyaya kaydet",
            "mode": "Explore",
            "persona": "data_analyst",
            "metadata": {
                "priority": "high",
                "tags": ["search", "ai", "file"]
            }
        }
        
        response = self.client.post("/segment", json=request_data)
        self.assertEqual(response.status_code, 200)
        
        # Get the task ID and ALT filename
        task_id = response.json()["id"]
        alt_filename = response.json()["alt_file"]
        
        # 2. Get the segment status
        response = self.client.get(f"/segment/{task_id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], task_id)
        
        # 3. Get the ALT file
        response = self.client.get(f"/alt-files/{alt_filename}")
        self.assertEqual(response.status_code, 200)
        alt_file = response.json()
        
        # Verify ALT file
        self.assertEqual(alt_file["command"], request_data["command"])
        self.assertEqual(alt_file["mode"], request_data["mode"])
        self.assertEqual(alt_file["persona"], request_data["persona"])
        
        # 4. Get the list of ALT files
        response = self.client.get("/alt-files")
        self.assertEqual(response.status_code, 200)
        alt_files = response.json()
        self.assertIn(alt_filename, alt_files)
        
        # 5. Delete the ALT file
        response = self.client.delete(f"/alt-files/{alt_filename}")
        self.assertEqual(response.status_code, 200)
        
        # 6. Verify the file was deleted
        response = self.client.get(f"/alt-files/{alt_filename}")
        self.assertEqual(response.status_code, 404)
        
        # 7. Verify the file is no longer in the list
        response = self.client.get("/alt-files")
        self.assertEqual(response.status_code, 200)
        alt_files = response.json()
        self.assertNotIn(alt_filename, alt_files)

if __name__ == "__main__":
    unittest.main()
