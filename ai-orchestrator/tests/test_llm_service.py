"""
Test script for AI Orchestrator LLM service functionality.

This script tests the LLM integration and service components.
"""
import asyncio
import logging
import sys
import os
from pathlib import Path
from unittest.mock import patch, AsyncMock

import pytest

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from src.core.llm_integration import get_llm_integration
from src.services.llm_service import get_llm_service
from src.services.model_manager import get_model_manager
from src.core.model_cache import get_model_cache
from src.core.performance_monitor import get_performance_monitor
from src.models.inference import InferenceRequest
from src.models.model import ModelInfo, ModelType, ModelStatus

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("test_llm_service")

# Use pytest-asyncio for async tests
pytestmark = pytest.mark.asyncio

@pytest.fixture
def mock_model_manager():
    """Fixture for mocking the ModelManager."""
    mock = AsyncMock()
    mock.get_model = AsyncMock(return_value=ModelInfo(
        model_id="test-llama-model",
        name="Test Llama Model",
        type=ModelType.LLM,
        version="1.0.0",
        status=ModelStatus(model_id="test-llama-model", loaded=True, status="ready", instances=1)
    ))
    mock.load_model = AsyncMock()
    mock.loaded_models = {
        "test-llama-model": {
            "model_id": "test-llama-model",
            "type": "llama.cpp",
            "path": "/path/to/model.gguf",
            "context_length": 4096,
            "max_tokens": 2048
        }
    }
    return mock

@pytest.fixture
def mock_llm_integration():
    """Fixture for mocking the LLMIntegration."""
    mock = AsyncMock()
    mock.run_llama_inference = AsyncMock(return_value={
        "text": "Simulated llama response",
        "usage": {"prompt_tokens": 10, "completion_tokens": 5, "total_tokens": 15},
        "finish_reason": "stop"
    })
    mock.run_onnx_inference = AsyncMock(return_value={
        "text": "Simulated onnx response"
    })
    return mock

@pytest.fixture
def mock_model_cache():
    """Fixture for mocking the ModelCache."""
    mock = AsyncMock()
    mock.get = AsyncMock(return_value=None) # Simulate cache miss
    mock.set = AsyncMock()
    return mock

@pytest.fixture
def mock_performance_monitor():
    """Fixture for mocking the PerformanceMonitor."""
    mock = AsyncMock()
    mock.record_inference_stats = AsyncMock()
    return mock

async def test_llm_inference_llama(mock_model_manager, mock_llm_integration, mock_model_cache, mock_performance_monitor):
    """Test running inference with a mock llama.cpp model."""
    logger.info("Testing LLM inference (llama.cpp)...")
    
    # Get service instance with mocks
    llm_service = get_llm_service(
        model_manager=mock_model_manager,
        llm_integration=mock_llm_integration,
        model_cache=mock_model_cache,
        performance_monitor=mock_performance_monitor
    )
    
    # Create inference request
    request = InferenceRequest(
        model_id="test-llama-model",
        inputs="Test prompt",
        parameters={"max_tokens": 100}
    )
    
    # Run inference
    response = await llm_service.run_llm_inference(request)
    
    # Assertions
    assert response is not None, "Response should not be None"
    assert response.model_id == "test-llama-model", "Model ID mismatch"
    assert response.outputs == "Simulated llama response", "Output mismatch"
    assert "usage" in response.metadata, "Usage metadata missing"
    assert response.metadata["cached"] is False, "Cached status should be False"
    
    # Verify mocks were called
    mock_model_cache.get.assert_called_once()
    mock_model_manager.get_model.assert_called_once_with("test-llama-model")
    mock_llm_integration.run_llama_inference.assert_called_once()
    mock_model_cache.set.assert_called_once()
    mock_performance_monitor.record_inference_stats.assert_called_once()
    
    logger.info("LLM inference test (llama.cpp) passed!")

async def test_llm_inference_cache_hit(mock_model_manager, mock_llm_integration, mock_model_cache, mock_performance_monitor):
    """Test running inference with a cache hit."""
    logger.info("Testing LLM inference (cache hit)...")
    
    # Setup cache mock to return a value
    cached_data = {
        "model_id": "test-llama-model",
        "outputs": "Cached response",
        "metadata": {"cached": True}
    }
    mock_model_cache.get = AsyncMock(return_value=cached_data)
    
    # Get service instance with mocks
    llm_service = get_llm_service(
        model_manager=mock_model_manager,
        llm_integration=mock_llm_integration,
        model_cache=mock_model_cache,
        performance_monitor=mock_performance_monitor
    )
    
    # Create inference request
    request = InferenceRequest(
        model_id="test-llama-model",
        inputs="Test prompt",
        parameters={"max_tokens": 100}
    )
    
    # Run inference
    response = await llm_service.run_llm_inference(request)
    
    # Assertions
    assert response is not None, "Response should not be None"
    assert response.outputs == "Cached response", "Output should be from cache"
    assert response.metadata["cached"] is True, "Cached status should be True"
    
    # Verify mocks were called (or not called)
    mock_model_cache.get.assert_called_once()
    mock_model_manager.get_model.assert_not_called()
    mock_llm_integration.run_llama_inference.assert_not_called()
    mock_model_cache.set.assert_not_called()
    # Performance stats should still be recorded even for cache hits
    mock_performance_monitor.record_inference_stats.assert_called_once()
    
    logger.info("LLM inference test (cache hit) passed!")

async def test_llm_inference_model_not_loaded(mock_model_manager, mock_llm_integration, mock_model_cache, mock_performance_monitor):
    """Test running inference when the model is not initially loaded."""
    logger.info("Testing LLM inference (model not loaded)...")
    
    # Modify model manager mock to simulate not loaded state initially
    mock_model_manager.get_model = AsyncMock(side_effect=[
        ModelInfo(
            model_id="test-llama-model",
            name="Test Llama Model",
            type=ModelType.LLM,
            version="1.0.0",
            status=ModelStatus(model_id="test-llama-model", loaded=False, status="not_loaded", instances=0)
        ),
        ModelInfo(
            model_id="test-llama-model",
            name="Test Llama Model",
            type=ModelType.LLM,
            version="1.0.0",
            status=ModelStatus(model_id="test-llama-model", loaded=True, status="ready", instances=1)
        ) # Second call returns loaded status
    ])
    
    # Get service instance with mocks
    llm_service = get_llm_service(
        model_manager=mock_model_manager,
        llm_integration=mock_llm_integration,
        model_cache=mock_model_cache,
        performance_monitor=mock_performance_monitor
    )
    
    # Create inference request
    request = InferenceRequest(
        model_id="test-llama-model",
        inputs="Test prompt",
        parameters={"max_tokens": 100}
    )
    
    # Run inference
    response = await llm_service.run_llm_inference(request)
    
    # Assertions
    assert response is not None, "Response should not be None"
    assert response.outputs == "Simulated llama response", "Output mismatch"
    
    # Verify mocks were called
    mock_model_cache.get.assert_called_once()
    assert mock_model_manager.get_model.call_count == 2 # Called twice: initial check, after load
    mock_model_manager.load_model.assert_called_once_with("test-llama-model")
    mock_llm_integration.run_llama_inference.assert_called_once()
    mock_model_cache.set.assert_called_once()
    mock_performance_monitor.record_inference_stats.assert_called_once()
    
    logger.info("LLM inference test (model not loaded) passed!")

async def test_llm_inference_model_not_found(mock_model_manager, mock_llm_integration, mock_model_cache, mock_performance_monitor):
    """Test running inference with a non-existent model ID."""
    logger.info("Testing LLM inference (model not found)...")
    
    # Modify model manager mock to return None
    mock_model_manager.get_model = AsyncMock(return_value=None)
    
    # Get service instance with mocks
    llm_service = get_llm_service(
        model_manager=mock_model_manager,
        llm_integration=mock_llm_integration,
        model_cache=mock_model_cache,
        performance_monitor=mock_performance_monitor
    )
    
    # Create inference request
    request = InferenceRequest(
        model_id="non-existent-model",
        inputs="Test prompt",
        parameters={}
    )
    
    # Run inference and expect an exception
    with pytest.raises(RuntimeError) as excinfo:
        await llm_service.run_llm_inference(request)
        
    assert "Model non-existent-model not found" in str(excinfo.value), "Incorrect exception message"
    
    # Verify mocks were called
    mock_model_cache.get.assert_called_once()
    mock_model_manager.get_model.assert_called_once_with("non-existent-model")
    mock_llm_integration.run_llama_inference.assert_not_called()
    mock_model_cache.set.assert_not_called()
    mock_performance_monitor.record_inference_stats.assert_called_once() # Stats recorded even on failure
    
    logger.info("LLM inference test (model not found) passed!")

# Add more tests for ONNX, batch inference, error handling etc.

# Example of how to run tests (if not using pytest runner):
# async def main():
#     try:
#         # Create mocks manually if not using fixtures
#         # ...
#         await test_llm_inference_llama(mock_model_manager(), mock_llm_integration(), mock_model_cache(), mock_performance_monitor())
#         await test_llm_inference_cache_hit(mock_model_manager(), mock_llm_integration(), mock_model_cache(), mock_performance_monitor())
#         await test_llm_inference_model_not_loaded(mock_model_manager(), mock_llm_integration(), mock_model_cache(), mock_performance_monitor())
#         await test_llm_inference_model_not_found(mock_model_manager(), mock_llm_integration(), mock_model_cache(), mock_performance_monitor())
#         logger.info("All LLM service tests passed!")
#     except AssertionError as e:
#         logger.error(f"Test failed: {str(e)}")
#     except Exception as e:
#         logger.error(f"Error during testing: {str(e)}")

# if __name__ == "__main__":
#     asyncio.run(main())
