"""
Unit tests for configuration module.
"""

import os
import json
import tempfile
import unittest
from unittest.mock import patch, MagicMock

import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))

from config.settings import load_config, get_model_path, get_available_models, DEFAULT_CONFIG


class TestConfig(unittest.TestCase):
    """Test cases for configuration module"""

    def setUp(self):
        """Set up test environment"""
        # Create a temporary directory for testing
        self.temp_dir = tempfile.TemporaryDirectory()
        
        # Create a test config file
        self.test_config = {
            "api": {
                "port": 9000,
                "debug": True
            },
            "models": {
                "cache_dir": os.path.join(self.temp_dir.name, "models_cache"),
                "default_llm": "test-model"
            }
        }
        
        self.config_path = os.path.join(self.temp_dir.name, "test_config.json")
        with open(self.config_path, 'w') as f:
            json.dump(self.test_config, f)
            
        # Create test model directories
        os.makedirs(os.path.join(self.temp_dir.name, "models_cache", "llm", "model1"), exist_ok=True)
        os.makedirs(os.path.join(self.temp_dir.name, "models_cache", "vision", "model2"), exist_ok=True)

    def tearDown(self):
        """Clean up test environment"""
        self.temp_dir.cleanup()

    def test_load_config_default(self):
        """Test loading default configuration"""
        with patch('config.settings.config', {}):
            config = load_config()
            self.assertEqual(config["api"]["port"], DEFAULT_CONFIG["api"]["port"])
            self.assertEqual(config["models"]["default_llm"], DEFAULT_CONFIG["models"]["default_llm"])

    def test_load_config_file(self):
        """Test loading configuration from file"""
        with patch('config.settings.config', {}):
            config = load_config(self.config_path)
            self.assertEqual(config["api"]["port"], 9000)
            self.assertEqual(config["api"]["debug"], True)
            self.assertEqual(config["models"]["default_llm"], "test-model")
            # Check that default values are preserved for unspecified settings
            self.assertEqual(config["logging"]["level"], DEFAULT_CONFIG["logging"]["level"])

    def test_get_model_path(self):
        """Test getting model path"""
        with patch('config.settings.config', {"models": {"cache_dir": self.temp_dir.name}}):
            path = get_model_path("model1", "llm")
            self.assertEqual(path, os.path.join(self.temp_dir.name, "llm", "model1"))

    def test_get_available_models(self):
        """Test getting available models"""
        with patch('config.settings.config', {"models": {"cache_dir": os.path.join(self.temp_dir.name, "models_cache")}}):
            models = get_available_models()
            self.assertIn("llm", models)
            self.assertIn("vision", models)
            self.assertIn("model1", models["llm"])
            self.assertIn("model2", models["vision"])

    def test_get_available_models_specific_type(self):
        """Test getting available models for specific type"""
        with patch('config.settings.config', {"models": {"cache_dir": os.path.join(self.temp_dir.name, "models_cache")}}):
            models = get_available_models("llm")
            self.assertIn("llm", models)
            self.assertNotIn("vision", models)
            self.assertIn("model1", models["llm"])


if __name__ == '__main__':
    unittest.main()
