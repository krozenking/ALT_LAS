"""
Unit tests for model manager.
"""

import os
import unittest
from unittest.mock import patch, MagicMock, AsyncMock

import sys

from src.models.model_manager import ModelManager
from src.models.llm.base import BaseLLMModel


class MockLLMModel(BaseLLMModel):
    """Mock LLM model for testing"""
    
    def __init__(self, model_name, model_path=None, **kwargs):
        super().__init__(model_name, model_path, **kwargs)
        self.load_called = False
        self.unload_called = False
        self.generate_called = False
        self.metadata = {"type": "mock", "name": model_name}
        
    async def load(self):
        self.load_called = True
        self.is_loaded = True
        return True
        
    async def unload(self):
        self.unload_called = True
        self.is_loaded = False
        return True
        
    async def generate(self, prompt, **kwargs):
        self.generate_called = True
        return f"Generated text for: {prompt}"
        
    async def get_stats(self):
        return {"loaded": self.is_loaded, "model_name": self.model_name}
        
    def get_metadata(self):
        return self.metadata


class TestModelManager(unittest.TestCase):
    """Test cases for model manager"""

    def setUp(self):
        """Set up test environment"""
        self.manager = ModelManager()
        
    @patch('models.model_manager.config')
    @patch('os.makedirs')
    async def test_initialize(self, mock_makedirs, mock_config):
        """Test initialization"""
        # Mock config
        mock_config.get_available_models.return_value = {}
        mock_config.models = {"preload_models": []}
        
        # Test initialize
        result = await self.manager.initialize()
        
        self.assertTrue(result)
        mock_makedirs.assert_called_once()
        mock_config.get_available_models.assert_called_once()
        
    def test_register_model(self):
        """Test registering a model"""
        # Test register
        result = self.manager.register_model("test-model", "llm", "/path/to/model")
        
        self.assertTrue(result)
        self.assertIn("llm:test-model", self.manager.models)
        self.assertEqual(self.manager.models["llm:test-model"]["name"], "test-model")
        self.assertEqual(self.manager.models["llm:test-model"]["type"], "llm")
        self.assertEqual(self.manager.models["llm:test-model"]["path"], "/path/to/model")
        
        # Test registering again (should fail)
        result = self.manager.register_model("test-model", "llm", "/path/to/model")
        self.assertFalse(result)
        
    @patch('models.model_manager.ONNXLLMModel', MockLLMModel)
    @patch('models.model_manager.LlamaCppModel', MockLLMModel)
    @patch('models.model_manager.GGMLModel', MockLLMModel)
    @patch('models.model_manager.config')
    @patch('os.path.exists', return_value=True)
    async def test_load_model(self, mock_exists, mock_config):
        """Test loading a model"""
        # Mock config
        mock_config.get_model_path.return_value = "/path/to/model"
        mock_config.models = {"max_loaded_models": 5}
        
        # Test load
        result = await self.manager.load_model("test-model", "llm")
        
        self.assertTrue(result)
        self.assertIn("llm:test-model", self.manager.loaded_models)
        self.assertTrue(self.manager.loaded_models["llm:test-model"].load_called)
        self.assertTrue(self.manager.loaded_models["llm:test-model"].is_loaded)
        
    @patch('models.model_manager.ONNXLLMModel', MockLLMModel)
    @patch('models.model_manager.LlamaCppModel', MockLLMModel)
    @patch('models.model_manager.GGMLModel', MockLLMModel)
    @patch('models.model_manager.config')
    @patch('os.path.exists', return_value=True)
    async def test_unload_model(self, mock_exists, mock_config):
        """Test unloading a model"""
        # Mock config
        mock_config.get_model_path.return_value = "/path/to/model"
        mock_config.models = {"max_loaded_models": 5}
        
        # Load a model first
        await self.manager.load_model("test-model", "llm")
        
        # Test unload
        result = await self.manager.unload_model("llm:test-model")
        
        self.assertTrue(result)
        self.assertNotIn("llm:test-model", self.manager.loaded_models)
        
    @patch('models.model_manager.ONNXLLMModel', MockLLMModel)
    @patch('models.model_manager.LlamaCppModel', MockLLMModel)
    @patch('models.model_manager.GGMLModel', MockLLMModel)
    @patch('models.model_manager.config')
    @patch('os.path.exists', return_value=True)
    async def test_process_llm(self, mock_exists, mock_config):
        """Test processing LLM request"""
        # Mock config
        mock_config.get_model_path.return_value = "/path/to/model"
        mock_config.models = {"max_loaded_models": 5, "default_llm": "test-model"}
        mock_config.llm = {
            "default_max_tokens": 1024,
            "default_temperature": 0.7,
            "default_top_p": 0.9,
            "default_top_k": 40,
            "default_repetition_penalty": 1.0
        }
        
        # Test process
        result = await self.manager.process_llm("Hello, world!")
        
        self.assertEqual(result, "Generated text for: Hello, world!")
        self.assertIn("llm:test-model", self.manager.loaded_models)
        self.assertTrue(self.manager.loaded_models["llm:test-model"].generate_called)
        self.assertEqual(self.manager.stats["total_requests"], 1)
        self.assertEqual(self.manager.stats["successful_requests"], 1)
        
    @patch('models.model_manager.ONNXLLMModel', MockLLMModel)
    @patch('models.model_manager.LlamaCppModel', MockLLMModel)
    @patch('models.model_manager.GGMLModel', MockLLMModel)
    @patch('models.model_manager.config')
    @patch('os.path.exists', return_value=True)
    async def test_get_models_info(self, mock_exists, mock_config):
        """Test getting models info"""
        # Mock config
        mock_config.get_model_path.return_value = "/path/to/model"
        mock_config.models = {"max_loaded_models": 5}
        
        # Register and load a model
        self.manager.register_model("test-model", "llm", "/path/to/model")
        await self.manager.load_model("test-model", "llm")
        
        # Test get info
        info = await self.manager.get_models_info()
        
        self.assertIn("registered_models", info)
        self.assertIn("loaded_models", info)
        self.assertIn("llm:test-model", info["registered_models"])
        self.assertIn("llm:test-model", info["loaded_models"])
        
    @patch('models.model_manager.ONNXLLMModel', MockLLMModel)
    @patch('models.model_manager.LlamaCppModel', MockLLMModel)
    @patch('models.model_manager.GGMLModel', MockLLMModel)
    @patch('models.model_manager.config')
    @patch('os.path.exists', return_value=True)
    async def test_get_status(self, mock_exists, mock_config):
        """Test getting status"""
        # Mock config
        mock_config.get_model_path.return_value = "/path/to/model"
        mock_config.models = {"max_loaded_models": 5}
        
        # Register and load a model
        self.manager.register_model("test-model", "llm", "/path/to/model")
        await self.manager.load_model("test-model", "llm")
        
        # Test get status
        status = await self.manager.get_status()
        
        self.assertIn("loaded_models", status)
        self.assertIn("registered_models", status)
        self.assertIn("models", status)
        self.assertEqual(status["loaded_models"], 1)
        self.assertEqual(status["registered_models"], 1)
        self.assertIn("llm:test-model", status["models"])
        
    @patch('models.model_manager.ONNXLLMModel', MockLLMModel)
    @patch('models.model_manager.LlamaCppModel', MockLLMModel)
    @patch('models.model_manager.GGMLModel', MockLLMModel)
    @patch('models.model_manager.config')
    @patch('os.path.exists', return_value=True)
    async def test_get_stats(self, mock_exists, mock_config):
        """Test getting stats"""
        # Mock config
        mock_config.get_model_path.return_value = "/path/to/model"
        mock_config.models = {"max_loaded_models": 5, "default_llm": "test-model"}
        mock_config.llm = {
            "default_max_tokens": 1024,
            "default_temperature": 0.7,
            "default_top_p": 0.9,
            "default_top_k": 40,
            "default_repetition_penalty": 1.0
        }
        
        # Process a request to generate stats
        await self.manager.process_llm("Hello, world!")
        
        # Test get stats
        stats = await self.manager.get_stats()
        
        self.assertIn("uptime", stats)
        self.assertIn("total_requests", stats)
        self.assertIn("successful_requests", stats)
        self.assertIn("failed_requests", stats)
        self.assertIn("success_rate", stats)
        self.assertIn("model_usage", stats)
        self.assertEqual(stats["total_requests"], 1)
        self.assertEqual(stats["successful_requests"], 1)
        self.assertEqual(stats["failed_requests"], 0)
        self.assertEqual(stats["success_rate"], 1.0)
        self.assertIn("llm:test-model", stats["model_usage"])
        
    def test_get_uptime(self):
        """Test getting uptime"""
        uptime = self.manager.get_uptime()
        self.assertGreaterEqual(uptime, 0)
        
    @patch('models.model_manager.config')
    async def test_switch_model_version(self, mock_config):
        """Test switching model version"""
        # Mock config
        mock_config.models = {"default_llm": "old-model"}
        
        # Test switch
        result = await self.manager.switch_model_version("llm", "new-model")
        
        self.assertTrue(result)
        self.assertEqual(mock_config.models["default_llm"], "new-model")
        
    @patch('models.model_manager.config')
    async def test_get_available_versions(self, mock_config):
        """Test getting available versions"""
        # Mock config
        mock_config.get_available_models.return_value = {"llm": ["model1", "model2"]}
        
        # Test get versions
        versions = await self.manager.get_available_versions("llm")
        
        self.assertEqual(versions, ["model1", "model2"])
        mock_config.get_available_models.assert_called_once_with("llm")
        
    @patch('models.model_manager.ONNXLLMModel', MockLLMModel)
    @patch('models.model_manager.LlamaCppModel', MockLLMModel)
    @patch('models.model_manager.GGMLModel', MockLLMModel)
    @patch('models.model_manager.config')
    @patch('os.path.exists', return_value=True)
    async def test_clear_cache(self, mock_exists, mock_config):
        """Test clearing cache"""
        # Mock config
        mock_config.get_model_path.return_value = "/path/to/model"
        mock_config.models = {"max_loaded_models": 5}
        
        # Load models
        await self.manager.load_model("model1", "llm")
        await self.manager.load_model("model2", "vision")
        
        # Test clear cache for specific type
        result = await self.manager.clear_cache("llm")
        
        self.assertEqual(result["total"], 1)
        self.assertEqual(result["llm"], 1)
        self.assertNotIn("llm:model1", self.manager.loaded_models)
        self.assertIn("vision:model2", self.manager.loaded_models)
        
        # Test clear all cache
        result = await self.manager.clear_cache()
        
        self.assertEqual(result["total"], 1)
        self.assertEqual(result["vision"], 1)
        self.assertNotIn("vision:model2", self.manager.loaded_models)
        
    @patch('models.model_manager.ONNXLLMModel', MockLLMModel)
    @patch('models.model_manager.LlamaCppModel', MockLLMModel)
    @patch('models.model_manager.GGMLModel', MockLLMModel)
    @patch('models.model_manager.config')
    @patch('os.path.exists', return_value=True)
    async def test_cleanup(self, mock_exists, mock_config):
        """Test cleanup"""
        # Mock config
        mock_config.get_model_path.return_value = "/path/to/model"
        mock_config.models = {"max_loaded_models": 5}
        
        # Load models
        await self.manager.load_model("model1", "llm")
        await self.manager.load_model("model2", "vision")
        
        # Test cleanup
        result = await self.manager.cleanup()
        
        self.assertTrue(result)
        self.assertEqual(len(self.manager.loaded_models), 0)


if __name__ == '__main__':
    unittest.main()
