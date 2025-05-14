"""
Tests for extended model manager with support for additional model types.

This module contains tests for the extended model manager that supports
the new model types and adapter system.
"""
import asyncio
import unittest
import pytest
from unittest.mock import patch, MagicMock

from ..services.extended_model_manager import ExtendedModelManager
from ..core.model_adapters import (
    ExtendedModelType,
    ModelAdapter,
    get_model_adapter_factory
)
from ..models.model import ModelInfo, ModelStatus, ModelType


class TestExtendedModelManager(unittest.TestCase):
    """Test cases for ExtendedModelManager."""
    
    def setUp(self):
        """Set up test environment."""
        # Patch the settings to avoid loading real model configs
        self.settings_patch = patch('ai_orchestrator.core.config.settings')
        self.mock_settings = self.settings_patch.start()
        self.mock_settings.MODEL_CONFIGS = {
            "test-llm": {
                "name": "Test LLM",
                "type": "llm",
                "description": "Test LLM model",
                "version": "1.0",
                "supports_gpu": True,
                "supports_cpu": True
            },
            "test-embedding": {
                "name": "Test Embedding",
                "type": "embedding",
                "description": "Test embedding model",
                "version": "1.0",
                "supports_gpu": True,
                "supports_cpu": True
            },
            "test-diffusion": {
                "name": "Test Diffusion",
                "type": "diffusion",
                "description": "Test diffusion model",
                "version": "1.0",
                "supports_gpu": True,
                "supports_cpu": True
            }
        }
        
        # Create manager
        self.manager = ExtendedModelManager()
        
        # Mock adapter factory methods
        self.factory = self.manager.adapter_factory
        self.original_get_adapter = self.factory.get_adapter
        
        # Create mock adapters
        self.mock_adapters = {}
        for model_type in ExtendedModelType:
            mock_adapter = MagicMock(spec=ModelAdapter)
            mock_adapter.model_type = model_type
            mock_adapter.load_model.return_value = asyncio.Future()
            mock_adapter.load_model.return_value.set_result({"type": model_type.value, "id": f"test-{model_type.value}"})
            mock_adapter.unload_model.return_value = asyncio.Future()
            mock_adapter.unload_model.return_value.set_result(None)
            mock_adapter.run_inference.return_value = asyncio.Future()
            mock_adapter.run_inference.return_value.set_result({"output": f"Result from {model_type.value} model"})
            mock_adapter.get_metadata_schema.return_value = {"type": "object", "properties": {}}
            mock_adapter.get_config_schema.return_value = {"type": "object", "properties": {}}
            self.mock_adapters[model_type] = mock_adapter
        
        # Patch the get_adapter method
        def mock_get_adapter(model_type):
            return self.mock_adapters[model_type]
        
        self.factory.get_adapter = mock_get_adapter
    
    def tearDown(self):
        """Clean up after tests."""
        self.settings_patch.stop()
        self.factory.get_adapter = self.original_get_adapter
    
    @pytest.mark.asyncio
    async def test_load_model(self):
        """Test loading a model with the extended manager."""
        # Test loading an LLM model
        status = await self.manager.load_model("test-llm")
        self.assertIsNotNone(status)
        self.assertTrue(status.loaded)
        self.assertEqual(status.status, "ready")
        
        # Check that the adapter was used
        self.mock_adapters[ExtendedModelType.LLM].load_model.assert_called_once()
        
        # Test loading an embedding model
        status = await self.manager.load_model("test-embedding")
        self.assertIsNotNone(status)
        self.assertTrue(status.loaded)
        self.assertEqual(status.status, "ready")
        
        # Check that the adapter was used
        self.mock_adapters[ExtendedModelType.EMBEDDING].load_model.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_unload_model(self):
        """Test unloading a model with the extended manager."""
        # First load a model
        await self.manager.load_model("test-llm")
        
        # Then unload it
        status = await self.manager.unload_model("test-llm")
        self.assertIsNotNone(status)
        self.assertFalse(status.loaded)
        self.assertEqual(status.status, "not_loaded")
        
        # Check that the adapter was used
        self.mock_adapters[ExtendedModelType.LLM].unload_model.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_run_inference(self):
        """Test running inference with the extended manager."""
        # First load a model
        await self.manager.load_model("test-llm")
        
        # Run inference
        result = await self.manager.run_inference("test-llm", "Test input")
        self.assertIsNotNone(result)
        self.assertIn("output", result)
        
        # Check that the adapter was used
        self.mock_adapters[ExtendedModelType.LLM].run_inference.assert_called_once()
        
        # Test with an embedding model
        await self.manager.load_model("test-embedding")
        result = await self.manager.run_inference("test-embedding", "Test input")
        self.assertIsNotNone(result)
        self.assertIn("output", result)
        
        # Check that the adapter was used
        self.mock_adapters[ExtendedModelType.EMBEDDING].run_inference.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_model_metadata_schema(self):
        """Test getting metadata schema for a model."""
        schema = await self.manager.get_model_metadata_schema("test-llm")
        self.assertIsNotNone(schema)
        self.assertIn("type", schema)
        self.assertEqual(schema["type"], "object")
        
        # Check that the adapter was used
        self.mock_adapters[ExtendedModelType.LLM].get_metadata_schema.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_model_config_schema(self):
        """Test getting configuration schema for a model."""
        schema = await self.manager.get_model_config_schema("test-llm")
        self.assertIsNotNone(schema)
        self.assertIn("type", schema)
        self.assertEqual(schema["type"], "object")
        
        # Check that the adapter was used
        self.mock_adapters[ExtendedModelType.LLM].get_config_schema.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_list_supported_model_types(self):
        """Test listing supported model types."""
        # Mock the factory method
        self.factory.list_supported_types = MagicMock(return_value=[
            "llm", "vision", "audio", "multimodal",
            "embedding", "diffusion", "classification",
            "recommendation", "tabular", "reinforcement_learning"
        ])
        
        types = await self.manager.list_supported_model_types()
        self.assertIsInstance(types, list)
        self.assertIn("llm", types)
        self.assertIn("embedding", types)
        self.assertIn("diffusion", types)
        
        # Check that the factory method was called
        self.factory.list_supported_types.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_register_custom_adapter(self):
        """Test registering a custom adapter."""
        # Create a mock adapter
        mock_adapter = MagicMock(spec=ModelAdapter)
        mock_adapter.model_type = ExtendedModelType.EMBEDDING
        
        # Mock the factory register_adapter method
        self.factory.register_adapter = MagicMock()
        
        # Register the adapter
        await self.manager.register_custom_adapter(ExtendedModelType.EMBEDDING, mock_adapter)
        
        # Check that the factory method was called
        self.factory.register_adapter.assert_called_once_with(ExtendedModelType.EMBEDDING, mock_adapter)


if __name__ == '__main__':
    unittest.main()
