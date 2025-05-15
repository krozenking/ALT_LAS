"""
Test script for AI Orchestrator model management functionality.

This script tests the model registry and model manager components.
"""
import asyncio
import logging
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from src.core.model_registry import get_model_registry
from src.services.model_manager import get_model_manager
from src.models.model import ModelType, ModelInfo

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("test_model_management")

async def test_model_registry():
    """Test model registry functionality."""
    logger.info("Testing model registry...")
    
    # Get registry instance
    registry = get_model_registry()
    
    # Test registering a model
    model_info = ModelInfo(
        model_id="test-llm-model",
        name="Test LLM Model",
        description="A test LLM model for unit testing",
        type=ModelType.LLM,
        version="1.0.0",
        context_length=4096,
        metadata={
            "author": "AI Orchestrator Team",
            "license": "MIT",
            "max_tokens": 2048
        }
    )
    
    await registry.register_model(model_info)
    logger.info("Registered test model")
    
    # Test getting model info
    retrieved_model = await registry.get_model_info("test-llm-model")
    assert retrieved_model is not None, "Failed to retrieve model info"
    assert retrieved_model.model_id == "test-llm-model", "Model ID mismatch"
    assert retrieved_model.type == ModelType.LLM, "Model type mismatch"
    logger.info("Successfully retrieved model info")
    
    # Test registering a model version
    version_data = {
        "path": "models/test-llm-model.bin",
        "size_mb": 4096,
        "sha256": "abcdef1234567890",
        "parameters": "7B",
        "quantization": "Q4_0"
    }
    
    await registry.register_model_version("test-llm-model", "1.0.0", version_data)
    logger.info("Registered model version")
    
    # Test getting model versions
    versions = await registry.get_model_versions("test-llm-model")
    assert "1.0.0" in versions, "Version not found"
    assert versions["1.0.0"]["path"] == "models/test-llm-model.bin", "Version path mismatch"
    logger.info("Successfully retrieved model versions")
    
    # Test setting active version
    await registry.set_active_version("test-llm-model", "1.0.0")
    active_version = await registry.get_active_version("test-llm-model")
    assert active_version == "1.0.0", "Active version mismatch"
    logger.info("Successfully set and retrieved active version")
    
    # Test listing models
    models = await registry.list_models()
    assert any(m.model_id == "test-llm-model" for m in models), "Model not found in list"
    logger.info("Successfully listed models")
    
    # Test listing models with type filter
    llm_models = await registry.list_models(type_filter="llm")
    assert all(m.type == ModelType.LLM for m in llm_models), "Type filter not working"
    logger.info("Successfully filtered models by type")
    
    logger.info("All model registry tests passed!")

async def test_model_manager():
    """Test model manager functionality."""
    logger.info("Testing model manager...")
    
    # Get manager instance
    manager = get_model_manager()
    
    # Wait for initialization
    await asyncio.sleep(1)
    
    # Test listing models
    models = await manager.list_models()
    logger.info(f"Found {len(models)} models")
    
    # Test getting model status
    if models:
        model_id = models[0].model_id
        status = await manager.get_model_status(model_id)
        logger.info(f"Model {model_id} status: {status.status if status else 'None'}")
    
    # Note: We're not testing actual model loading/unloading here
    # as that would require real model files and could be resource-intensive
    # Those should be tested in integration tests with mock models
    
    logger.info("Model manager tests completed")

async def main():
    """Run all tests."""
    try:
        await test_model_registry()
        await test_model_manager()
        logger.info("All tests passed!")
    except AssertionError as e:
        logger.error(f"Test failed: {str(e)}")
    except Exception as e:
        logger.error(f"Error during testing: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())
