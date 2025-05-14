"""
Tests for model adapters and extended model types.

This module contains tests for the model adapter system and extended model types
implemented for the AI Orchestrator.
"""
import asyncio
import unittest
import pytest
from unittest.mock import patch, MagicMock

from ..core.model_adapters import (
    ExtendedModelType,
    ModelAdapter,
    BaseModelAdapter,
    LLMAdapter,
    VisionAdapter,
    AudioAdapter,
    MultimodalAdapter,
    EmbeddingAdapter,
    DiffusionAdapter,
    ClassificationAdapter,
    RecommendationAdapter,
    TabularAdapter,
    ReinforcementLearningAdapter,
    ModelAdapterFactory,
    get_model_adapter_factory
)
from ..models.model import ModelInfo, ModelType, ModelStatus


class TestExtendedModelType(unittest.TestCase):
    """Test cases for ExtendedModelType."""
    
    def test_extended_model_type_values(self):
        """Test that ExtendedModelType includes all required model types."""
        # Check original types
        self.assertEqual(ExtendedModelType.LLM.value, "llm")
        self.assertEqual(ExtendedModelType.VISION.value, "vision")
        self.assertEqual(ExtendedModelType.AUDIO.value, "audio")
        self.assertEqual(ExtendedModelType.MULTIMODAL.value, "multimodal")
        
        # Check new types
        self.assertEqual(ExtendedModelType.EMBEDDING.value, "embedding")
        self.assertEqual(ExtendedModelType.DIFFUSION.value, "diffusion")
        self.assertEqual(ExtendedModelType.CLASSIFICATION.value, "classification")
        self.assertEqual(ExtendedModelType.RECOMMENDATION.value, "recommendation")
        self.assertEqual(ExtendedModelType.TABULAR.value, "tabular")
        self.assertEqual(ExtendedModelType.REINFORCEMENT_LEARNING.value, "reinforcement_learning")
    
    def test_from_base_type(self):
        """Test conversion from base ModelType to ExtendedModelType."""
        self.assertEqual(
            ExtendedModelType.from_base_type(ModelType.LLM),
            ExtendedModelType.LLM
        )
        self.assertEqual(
            ExtendedModelType.from_base_type(ModelType.VISION),
            ExtendedModelType.VISION
        )
        self.assertEqual(
            ExtendedModelType.from_base_type(ModelType.AUDIO),
            ExtendedModelType.AUDIO
        )
        self.assertEqual(
            ExtendedModelType.from_base_type(ModelType.MULTIMODAL),
            ExtendedModelType.MULTIMODAL
        )
    
    def test_to_base_type(self):
        """Test conversion from ExtendedModelType to base ModelType."""
        # Test original types
        self.assertEqual(
            ExtendedModelType.LLM.to_base_type(),
            ModelType.LLM
        )
        self.assertEqual(
            ExtendedModelType.VISION.to_base_type(),
            ModelType.VISION
        )
        
        # Test new types
        self.assertEqual(
            ExtendedModelType.EMBEDDING.to_base_type(),
            ModelType.LLM  # Should map to closest base type
        )
        self.assertEqual(
            ExtendedModelType.DIFFUSION.to_base_type(),
            ModelType.VISION  # Should map to closest base type
        )


class TestModelAdapters(unittest.TestCase):
    """Test cases for model adapters."""
    
    def setUp(self):
        """Set up test environment."""
        # Create test model info
        self.test_model = ModelInfo(
            model_id="test-model",
            name="Test Model",
            type=ModelType.LLM,
            description="Test model",
            version="1.0",
            size=1024 * 1024 * 1024,  # 1 GB
            parameters=7 * 1000 * 1000 * 1000,  # 7B
            supports_gpu=True,
            supports_cpu=True
        )
    
    @pytest.mark.asyncio
    async def test_llm_adapter(self):
        """Test LLM adapter."""
        adapter = LLMAdapter()
        
        # Check model type
        self.assertEqual(adapter.model_type, ExtendedModelType.LLM)
        
        # Test load model
        model_instance = await adapter.load_model(self.test_model)
        self.assertIsNotNone(model_instance)
        self.assertEqual(model_instance["type"], "llm")
        
        # Test run inference
        result = await adapter.run_inference(model_instance, "Test input")
        self.assertIsNotNone(result)
        self.assertIn("output", result)
        
        # Test unload model
        await adapter.unload_model(model_instance)
        
        # Test metadata schema
        metadata_schema = adapter.get_metadata_schema()
        self.assertIsNotNone(metadata_schema)
        self.assertIn("properties", metadata_schema)
        self.assertIn("context_length", metadata_schema["properties"])
        
        # Test config schema
        config_schema = adapter.get_config_schema()
        self.assertIsNotNone(config_schema)
        self.assertIn("properties", config_schema)
        self.assertIn("temperature", config_schema["properties"])
    
    @pytest.mark.asyncio
    async def test_embedding_adapter(self):
        """Test Embedding adapter."""
        adapter = EmbeddingAdapter()
        
        # Check model type
        self.assertEqual(adapter.model_type, ExtendedModelType.EMBEDDING)
        
        # Test load model
        model_instance = await adapter.load_model(self.test_model)
        self.assertIsNotNone(model_instance)
        self.assertEqual(model_instance["type"], "embedding")
        
        # Test run inference
        result = await adapter.run_inference(model_instance, "Test input")
        self.assertIsNotNone(result)
        self.assertIn("embedding", result)
        self.assertIsInstance(result["embedding"], list)
        
        # Test unload model
        await adapter.unload_model(model_instance)
        
        # Test metadata schema
        metadata_schema = adapter.get_metadata_schema()
        self.assertIsNotNone(metadata_schema)
        self.assertIn("properties", metadata_schema)
        self.assertIn("vector_dimension", metadata_schema["properties"])
        
        # Test config schema
        config_schema = adapter.get_config_schema()
        self.assertIsNotNone(config_schema)
        self.assertIn("properties", config_schema)
        self.assertIn("normalize", config_schema["properties"])
    
    @pytest.mark.asyncio
    async def test_diffusion_adapter(self):
        """Test Diffusion adapter."""
        adapter = DiffusionAdapter()
        
        # Check model type
        self.assertEqual(adapter.model_type, ExtendedModelType.DIFFUSION)
        
        # Test load model
        model_instance = await adapter.load_model(self.test_model)
        self.assertIsNotNone(model_instance)
        self.assertEqual(model_instance["type"], "diffusion")
        
        # Test run inference
        result = await adapter.run_inference(model_instance, "A photo of a cat")
        self.assertIsNotNone(result)
        self.assertIn("output", result)
        
        # Test unload model
        await adapter.unload_model(model_instance)
        
        # Test metadata schema
        metadata_schema = adapter.get_metadata_schema()
        self.assertIsNotNone(metadata_schema)
        self.assertIn("properties", metadata_schema)
        self.assertIn("diffusion_steps", metadata_schema["properties"])
        
        # Test config schema
        config_schema = adapter.get_config_schema()
        self.assertIsNotNone(config_schema)
        self.assertIn("properties", config_schema)
        self.assertIn("guidance_scale", config_schema["properties"])


class TestModelAdapterFactory(unittest.TestCase):
    """Test cases for ModelAdapterFactory."""
    
    def setUp(self):
        """Set up test environment."""
        self.factory = ModelAdapterFactory()
        
        # Create test model info
        self.test_model = ModelInfo(
            model_id="test-model",
            name="Test Model",
            type=ModelType.LLM,
            description="Test model",
            version="1.0"
        )
    
    def test_get_adapter(self):
        """Test getting adapters by model type."""
        # Test getting adapters for original types
        llm_adapter = self.factory.get_adapter(ExtendedModelType.LLM)
        self.assertIsNotNone(llm_adapter)
        self.assertEqual(llm_adapter.model_type, ExtendedModelType.LLM)
        
        vision_adapter = self.factory.get_adapter(ExtendedModelType.VISION)
        self.assertIsNotNone(vision_adapter)
        self.assertEqual(vision_adapter.model_type, ExtendedModelType.VISION)
        
        # Test getting adapters for new types
        embedding_adapter = self.factory.get_adapter(ExtendedModelType.EMBEDDING)
        self.assertIsNotNone(embedding_adapter)
        self.assertEqual(embedding_adapter.model_type, ExtendedModelType.EMBEDDING)
        
        diffusion_adapter = self.factory.get_adapter(ExtendedModelType.DIFFUSION)
        self.assertIsNotNone(diffusion_adapter)
        self.assertEqual(diffusion_adapter.model_type, ExtendedModelType.DIFFUSION)
    
    def test_get_adapter_for_model(self):
        """Test getting adapter for a specific model."""
        # Test with LLM model
        llm_model = self.test_model.copy()
        llm_model.type = ModelType.LLM
        adapter = self.factory.get_adapter_for_model(llm_model)
        self.assertIsNotNone(adapter)
        self.assertEqual(adapter.model_type, ExtendedModelType.LLM)
        
        # Test with Vision model
        vision_model = self.test_model.copy()
        vision_model.type = ModelType.VISION
        adapter = self.factory.get_adapter_for_model(vision_model)
        self.assertIsNotNone(adapter)
        self.assertEqual(adapter.model_type, ExtendedModelType.VISION)
    
    def test_register_adapter(self):
        """Test registering a custom adapter."""
        # Create a mock adapter
        mock_adapter = MagicMock(spec=ModelAdapter)
        mock_adapter.model_type = ExtendedModelType.EMBEDDING
        
        # Register the adapter
        self.factory.register_adapter(ExtendedModelType.EMBEDDING, mock_adapter)
        
        # Get the adapter back
        adapter = self.factory.get_adapter(ExtendedModelType.EMBEDDING)
        self.assertEqual(adapter, mock_adapter)
    
    def test_list_supported_types(self):
        """Test listing supported model types."""
        types = self.factory.list_supported_types()
        self.assertIsInstance(types, list)
        self.assertIn("llm", types)
        self.assertIn("vision", types)
        self.assertIn("embedding", types)
        self.assertIn("diffusion", types)
        self.assertIn("classification", types)
        self.assertIn("recommendation", types)
        self.assertIn("tabular", types)
        self.assertIn("reinforcement_learning", types)
    
    def test_singleton_factory(self):
        """Test that get_model_adapter_factory returns a singleton."""
        factory1 = get_model_adapter_factory()
        factory2 = get_model_adapter_factory()
        self.assertIs(factory1, factory2)


if __name__ == '__main__':
    unittest.main()
