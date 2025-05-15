"""
Test script for AI Orchestrator inference service and orchestration functionality.

This script tests the inference service and orchestration capabilities.
"""
import asyncio
import logging
import sys
import os
from pathlib import Path
from unittest.mock import patch, AsyncMock, MagicMock

import pytest

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from src.services.inference_service import get_inference_service
from src.services.model_manager import get_model_manager
from src.services.llm_service import get_llm_service
from src.services.vision_service import get_vision_service
from src.services.audio_service import get_audio_service
from src.core.model_cache import get_model_cache
from src.core.performance_monitor import get_performance_monitor
from src.models.inference import InferenceRequest, InferenceResponse
from src.models.model import ModelInfo, ModelType, ModelStatus

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("test_inference_service")

# Use pytest-asyncio for async tests
pytestmark = pytest.mark.asyncio

@pytest.fixture
def mock_model_manager():
    """Fixture for mocking the ModelManager."""
    mock = AsyncMock()
    
    # Setup list_models to return different model types
    mock.list_models = AsyncMock(return_value=[
        ModelInfo(
            model_id="test-llm-model",
            name="Test LLM Model",
            type=ModelType.LLM,
            version="1.0.0",
            status=ModelStatus(model_id="test-llm-model", loaded=True, status="ready", instances=1)
        ),
        ModelInfo(
            model_id="test-vision-model",
            name="Test Vision Model",
            type=ModelType.VISION,
            version="1.0.0",
            status=ModelStatus(model_id="test-vision-model", loaded=True, status="ready", instances=1)
        ),
        ModelInfo(
            model_id="test-audio-model",
            name="Test Audio Model",
            type=ModelType.AUDIO,
            version="1.0.0",
            status=ModelStatus(model_id="test-audio-model", loaded=True, status="ready", instances=1)
        )
    ])
    
    # Setup get_model to return appropriate model based on ID
    def get_model_side_effect(model_id):
        if model_id == "test-llm-model":
            return ModelInfo(
                model_id="test-llm-model",
                name="Test LLM Model",
                type=ModelType.LLM,
                version="1.0.0",
                status=ModelStatus(model_id="test-llm-model", loaded=True, status="ready", instances=1)
            )
        elif model_id == "test-vision-model":
            return ModelInfo(
                model_id="test-vision-model",
                name="Test Vision Model",
                type=ModelType.VISION,
                version="1.0.0",
                status=ModelStatus(model_id="test-vision-model", loaded=True, status="ready", instances=1)
            )
        elif model_id == "test-audio-model":
            return ModelInfo(
                model_id="test-audio-model",
                name="Test Audio Model",
                type=ModelType.AUDIO,
                version="1.0.0",
                status=ModelStatus(model_id="test-audio-model", loaded=True, status="ready", instances=1)
            )
        return None
    
    mock.get_model = AsyncMock(side_effect=get_model_side_effect)
    mock.load_model = AsyncMock()
    
    return mock

@pytest.fixture
def mock_llm_service():
    """Fixture for mocking the LLMService."""
    mock = AsyncMock()
    mock.run_llm_inference = AsyncMock(return_value=InferenceResponse(
        model_id="test-llm-model",
        outputs="Simulated LLM response",
        metadata={"model_version": "1.0.0", "cached": False}
    ))
    return mock

@pytest.fixture
def mock_vision_service():
    """Fixture for mocking the VisionService."""
    mock = AsyncMock()
    mock.run_vision_inference = AsyncMock(return_value=InferenceResponse(
        model_id="test-vision-model",
        outputs={"detected_objects": [{"class": "object", "confidence": 0.95}]},
        metadata={"model_version": "1.0.0", "cached": False}
    ))
    return mock

@pytest.fixture
def mock_audio_service():
    """Fixture for mocking the AudioService."""
    mock = AsyncMock()
    mock.run_audio_inference = AsyncMock(return_value=InferenceResponse(
        model_id="test-audio-model",
        outputs="Simulated audio transcription",
        metadata={"model_version": "1.0.0", "cached": False}
    ))
    return mock

@pytest.fixture
def mock_model_cache():
    """Fixture for mocking the ModelCache."""
    mock = AsyncMock()
    mock.get = AsyncMock(return_value=None)  # Simulate cache miss
    mock.set = AsyncMock()
    return mock

@pytest.fixture
def mock_performance_monitor():
    """Fixture for mocking the PerformanceMonitor."""
    mock = AsyncMock()
    mock.record_inference_stats = AsyncMock()
    mock.get_model_stats = AsyncMock(return_value={
        "inference_count": 10,
        "success_count": 10,
        "avg_latency_ms": 100
    })
    return mock

async def test_inference_service_llm(mock_model_manager, mock_llm_service, mock_vision_service, 
                                    mock_audio_service, mock_model_cache, mock_performance_monitor):
    """Test running inference with an LLM model."""
    logger.info("Testing inference service with LLM model...")
    
    # Get service instance with mocks
    inference_service = get_inference_service(
        model_manager=mock_model_manager,
        model_cache=mock_model_cache,
        llm_service=mock_llm_service,
        vision_service=mock_vision_service,
        audio_service=mock_audio_service,
        performance_monitor=mock_performance_monitor
    )
    
    # Create inference request
    request = InferenceRequest(
        model_id="test-llm-model",
        inputs="Test prompt",
        parameters={"max_tokens": 100}
    )
    
    # Run inference
    response = await inference_service.run_inference(request)
    
    # Assertions
    assert response is not None, "Response should not be None"
    assert response.model_id == "test-llm-model", "Model ID mismatch"
    assert response.outputs == "Simulated LLM response", "Output mismatch"
    
    # Verify mocks were called
    mock_model_cache.get.assert_called_once()
    mock_model_manager.get_model.assert_called_once_with("test-llm-model")
    mock_llm_service.run_llm_inference.assert_called_once()
    mock_vision_service.run_vision_inference.assert_not_called()
    mock_audio_service.run_audio_inference.assert_not_called()
    
    logger.info("Inference service test with LLM model passed!")

async def test_inference_service_vision(mock_model_manager, mock_llm_service, mock_vision_service, 
                                       mock_audio_service, mock_model_cache, mock_performance_monitor):
    """Test running inference with a vision model."""
    logger.info("Testing inference service with vision model...")
    
    # Get service instance with mocks
    inference_service = get_inference_service(
        model_manager=mock_model_manager,
        model_cache=mock_model_cache,
        llm_service=mock_llm_service,
        vision_service=mock_vision_service,
        audio_service=mock_audio_service,
        performance_monitor=mock_performance_monitor
    )
    
    # Create inference request
    request = InferenceRequest(
        model_id="test-vision-model",
        inputs={"image_path": "/path/to/image.jpg"},
        parameters={"confidence": 0.5}
    )
    
    # Run inference
    response = await inference_service.run_inference(request)
    
    # Assertions
    assert response is not None, "Response should not be None"
    assert response.model_id == "test-vision-model", "Model ID mismatch"
    assert "detected_objects" in response.outputs, "Output should contain detected_objects"
    
    # Verify mocks were called
    mock_model_cache.get.assert_called_once()
    mock_model_manager.get_model.assert_called_once_with("test-vision-model")
    mock_llm_service.run_llm_inference.assert_not_called()
    mock_vision_service.run_vision_inference.assert_called_once()
    mock_audio_service.run_audio_inference.assert_not_called()
    
    logger.info("Inference service test with vision model passed!")

async def test_batch_inference(mock_model_manager, mock_llm_service, mock_vision_service, 
                              mock_audio_service, mock_model_cache, mock_performance_monitor):
    """Test running batch inference with multiple models."""
    logger.info("Testing batch inference...")
    
    # Get service instance with mocks
    inference_service = get_inference_service(
        model_manager=mock_model_manager,
        model_cache=mock_model_cache,
        llm_service=mock_llm_service,
        vision_service=mock_vision_service,
        audio_service=mock_audio_service,
        performance_monitor=mock_performance_monitor
    )
    
    # Create batch inference requests
    requests = [
        InferenceRequest(
            model_id="test-llm-model",
            inputs="Test prompt 1",
            parameters={"max_tokens": 100}
        ),
        InferenceRequest(
            model_id="test-llm-model",
            inputs="Test prompt 2",
            parameters={"max_tokens": 200}
        ),
        InferenceRequest(
            model_id="test-vision-model",
            inputs={"image_path": "/path/to/image.jpg"},
            parameters={"confidence": 0.5}
        )
    ]
    
    # Setup llm_service to handle batch requests
    mock_llm_service.run_batch_llm_inference = AsyncMock(return_value=[
        InferenceResponse(
            model_id="test-llm-model",
            outputs="Simulated LLM response 1",
            metadata={"model_version": "1.0.0", "cached": False}
        ),
        InferenceResponse(
            model_id="test-llm-model",
            outputs="Simulated LLM response 2",
            metadata={"model_version": "1.0.0", "cached": False}
        )
    ])
    
    # Run batch inference
    responses = await inference_service.run_batch_inference(requests)
    
    # Assertions
    assert len(responses) == 3, "Should return 3 responses"
    assert responses[0].outputs == "Simulated LLM response 1", "First output mismatch"
    assert responses[1].outputs == "Simulated LLM response 2", "Second output mismatch"
    assert "detected_objects" in responses[2].outputs, "Third output should contain detected_objects"
    
    # Verify mocks were called
    mock_llm_service.run_batch_llm_inference.assert_called_once()
    mock_vision_service.run_vision_inference.assert_called_once()
    
    logger.info("Batch inference test passed!")

async def test_orchestrated_inference(mock_model_manager, mock_llm_service, mock_vision_service, 
                                     mock_audio_service, mock_model_cache, mock_performance_monitor):
    """Test running orchestrated inference with automatic model selection."""
    logger.info("Testing orchestrated inference...")
    
    # Get service instance with mocks
    inference_service = get_inference_service(
        model_manager=mock_model_manager,
        model_cache=mock_model_cache,
        llm_service=mock_llm_service,
        vision_service=mock_vision_service,
        audio_service=mock_audio_service,
        performance_monitor=mock_performance_monitor
    )
    
    # Create inference request without specifying model_id
    request = InferenceRequest(
        model_id="",  # Empty to trigger orchestration
        inputs="Test prompt for orchestration",
        parameters={"max_tokens": 100}
    )
    
    # Run orchestrated inference
    response = await inference_service.run_orchestrated_inference(request, strategy="auto")
    
    # Assertions
    assert response is not None, "Response should not be None"
    assert "orchestration_strategy" in response.metadata, "Orchestration metadata missing"
    assert "selected_models" in response.metadata, "Selected models metadata missing"
    
    # Verify performance stats were recorded
    mock_performance_monitor.record_inference_stats.assert_called()
    
    logger.info("Orchestrated inference test passed!")

async def test_parallel_inference(mock_model_manager, mock_llm_service, mock_vision_service, 
                                 mock_audio_service, mock_model_cache, mock_performance_monitor):
    """Test running parallel inference with multiple models."""
    logger.info("Testing parallel inference...")
    
    # Get service instance with mocks
    inference_service = get_inference_service(
        model_manager=mock_model_manager,
        model_cache=mock_model_cache,
        llm_service=mock_llm_service,
        vision_service=mock_vision_service,
        audio_service=mock_audio_service,
        performance_monitor=mock_performance_monitor
    )
    
    # Create inference request
    request = InferenceRequest(
        inputs="Test prompt for parallel inference",
        parameters={"max_tokens": 100}
    )
    
    # Specify multiple models
    model_ids = ["test-llm-model", "test-llm-model"]  # Use same model twice for simplicity
    
    # Run parallel inference
    responses = await inference_service.run_parallel_inference(request, model_ids)
    
    # Assertions
    assert len(responses) == 2, "Should return 2 responses"
    assert responses[0].model_id == "test-llm-model", "First model ID mismatch"
    assert responses[1].model_id == "test-llm-model", "Second model ID mismatch"
    
    # Verify performance stats were recorded
    mock_performance_monitor.record_inference_stats.assert_called()
    
    logger.info("Parallel inference test passed!")

# Add more tests for error handling, ensemble methods, etc.

# Example of how to run tests (if not using pytest runner):
# async def main():
#     try:
#         # Create mocks manually if not using fixtures
#         # ...
#         await test_inference_service_llm(...)
#         await test_inference_service_vision(...)
#         await test_batch_inference(...)
#         await test_orchestrated_inference(...)
#         await test_parallel_inference(...)
#         logger.info("All inference service tests passed!")
#     except AssertionError as e:
#         logger.error(f"Test failed: {str(e)}")
#     except Exception as e:
#         logger.error(f"Error during testing: {str(e)}")

# if __name__ == "__main__":
#     asyncio.run(main())
