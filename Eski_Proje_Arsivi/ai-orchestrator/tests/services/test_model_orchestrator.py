"""
Tests for the Model Orchestrator service.

This module contains tests for the ModelOrchestrator class.
"""

import pytest
import asyncio
from unittest.mock import MagicMock, patch
import json

from ...src.services.model_orchestrator import ModelOrchestrator
from ...src.models.model_manager import ModelManager

# Mock model manager for testing
class MockModelManager:
    def __init__(self):
        self.models = {
            "llm:model1": {"name": "model1", "type": "llm"},
            "llm:model2": {"name": "model2", "type": "llm"},
            "llm:model3": {"name": "model3", "type": "llm"},
            "vision:model1": {"name": "model1", "type": "vision"},
            "voice:model1": {"name": "model1", "type": "voice"}
        }
        self.stats = {
            "model_usage": {
                "llm:model1": {"requests": 10, "latencies": [100, 120, 90]},
                "llm:model2": {"requests": 5, "latencies": [150, 160, 140]},
                "llm:model3": {"requests": 2, "latencies": [200, 210]}
            }
        }
    
    async def initialize(self):
        return True
    
    async def process_llm(self, prompt, parameters=None):
        model_name = parameters.get("model_name", "model1")
        return f"Response from {model_name}: {prompt[:20]}..."
    
    async def process_vision(self, input_data, parameters=None):
        model_name = parameters.get("model_name", "model1")
        return f"Vision result from {model_name}"
    
    async def process_voice(self, input_data, parameters=None):
        model_name = parameters.get("model_name", "model1")
        return f"Voice result from {model_name}"


@pytest.fixture
async def orchestrator():
    """Create a model orchestrator with mock model manager for testing."""
    model_manager = MockModelManager()
    orchestrator = ModelOrchestrator(model_manager)
    await orchestrator.initialize()
    return orchestrator


@pytest.mark.asyncio
async def test_orchestrator_initialization():
    """Test that the orchestrator initializes correctly."""
    model_manager = MockModelManager()
    orchestrator = ModelOrchestrator(model_manager)
    result = await orchestrator.initialize()
    
    assert result is True
    assert orchestrator.model_manager is not None
    assert orchestrator.stats["total_orchestrations"] == 0


@pytest.mark.asyncio
async def test_default_selection_strategy(orchestrator):
    """Test the default model selection strategy."""
    # Test with specific model name
    selected_models = await orchestrator._default_selection_strategy(
        "llm", {"model_name": "model2"}
    )
    
    assert "llm:model2" in selected_models
    assert selected_models["llm:model2"]["weight"] == 1.0
    
    # Test without specific model name
    with patch("src.config.config", {"models": {"default_llm": "model1"}}):
        selected_models = await orchestrator._default_selection_strategy("llm", {})
        assert "llm:model1" in selected_models


@pytest.mark.asyncio
async def test_performance_selection_strategy(orchestrator):
    """Test the performance-based model selection strategy."""
    selected_models = await orchestrator._performance_selection_strategy("llm", {})
    
    # model1 should be selected as it has the lowest average latency
    assert "llm:model1" in selected_models
    assert selected_models["llm:model1"]["weight"] == 1.0


@pytest.mark.asyncio
async def test_ensemble_selection_strategy(orchestrator):
    """Test the ensemble model selection strategy."""
    selected_models = await orchestrator._ensemble_selection_strategy(
        "llm", {"ensemble_size": 2}
    )
    
    # Should select 2 models
    assert len(selected_models) == 2
    
    # All selected models should have weights
    for model_config in selected_models.values():
        assert "weight" in model_config
        assert model_config["weight"] > 0


@pytest.mark.asyncio
async def test_execute_single_model(orchestrator):
    """Test execution of a single model."""
    result = await orchestrator._execute_single_model(
        model_key="llm:model1",
        model_config={"parameters": {"temperature": 0.7}},
        input_data="Test prompt",
        parameters={}
    )
    
    assert result["success"] is True
    assert "Response from model1" in result["result"]
    assert "latency_ms" in result
    assert result["model_type"] == "llm"
    assert result["model_name"] == "model1"


@pytest.mark.asyncio
async def test_execute_models_sequential(orchestrator):
    """Test sequential execution of multiple models."""
    selected_models = {
        "llm:model1": {"parameters": {}},
        "llm:model2": {"parameters": {}}
    }
    
    results = await orchestrator._execute_models_sequential(
        selected_models=selected_models,
        input_data="Test prompt",
        parameters={},
        timeout_ms=5000
    )
    
    assert len(results) == 2
    assert "llm:model1" in results
    assert "llm:model2" in results
    assert results["llm:model1"]["success"] is True
    assert results["llm:model2"]["success"] is True


@pytest.mark.asyncio
async def test_execute_models_parallel(orchestrator):
    """Test parallel execution of multiple models."""
    selected_models = {
        "llm:model1": {"parameters": {}},
        "llm:model2": {"parameters": {}}
    }
    
    results = await orchestrator._execute_models_parallel(
        selected_models=selected_models,
        input_data="Test prompt",
        parameters={},
        timeout_ms=5000
    )
    
    assert len(results) == 2
    assert "llm:model1" in results
    assert "llm:model2" in results
    assert results["llm:model1"]["success"] is True
    assert results["llm:model2"]["success"] is True


@pytest.mark.asyncio
async def test_default_merge_strategy(orchestrator):
    """Test the default result merging strategy."""
    results = {
        "llm:model1": {
            "result": "Result from model1",
            "success": True,
            "latency_ms": 100,
            "confidence": 0.8
        },
        "llm:model2": {
            "result": "Result from model2",
            "success": True,
            "latency_ms": 150,
            "confidence": 0.9
        }
    }
    
    merged_result = await orchestrator._default_merge_strategy(results, {})
    
    assert merged_result["result"] == "Result from model1"
    assert merged_result["model"] == "llm:model1"
    assert merged_result["latency_ms"] == 100
    assert "merge_info" in merged_result


@pytest.mark.asyncio
async def test_weighted_merge_strategy(orchestrator):
    """Test the weighted result merging strategy."""
    results = {
        "llm:model1": {
            "result": "Result from model1",
            "success": True,
            "latency_ms": 100,
            "confidence": 0.8
        },
        "llm:model2": {
            "result": "Result from model2",
            "success": True,
            "latency_ms": 150,
            "confidence": 0.9
        }
    }
    
    # Test with explicit weights
    parameters = {
        "llm:model1_weight": 0.7,
        "llm:model2_weight": 0.3
    }
    
    merged_result = await orchestrator._weighted_merge_strategy(results, parameters)
    
    assert "result" in merged_result
    assert "confidence" in merged_result
    assert "merge_info" in merged_result
    assert "weights" in merged_result["merge_info"]


@pytest.mark.asyncio
async def test_voting_merge_strategy(orchestrator):
    """Test the voting result merging strategy."""
    results = {
        "llm:model1": {
            "result": "Common result",
            "success": True,
            "latency_ms": 100
        },
        "llm:model2": {
            "result": "Common result",
            "success": True,
            "latency_ms": 150
        },
        "llm:model3": {
            "result": "Different result",
            "success": True,
            "latency_ms": 200
        }
    }
    
    merged_result = await orchestrator._voting_merge_strategy(results, {})
    
    assert merged_result["result"] == "Common result"
    assert len(merged_result["models"]) == 2
    assert merged_result["confidence"] == 2/3  # 2 out of 3 models agree


@pytest.mark.asyncio
async def test_chain_merge_strategy(orchestrator):
    """Test the chain result merging strategy."""
    results = {
        "llm:model1": {
            "result": "Result from model1",
            "success": True,
            "latency_ms": 100
        },
        "llm:model2": {
            "result": "Result from model2",
            "success": True,
            "latency_ms": 150
        }
    }
    
    # Test with explicit chain order
    parameters = {
        "chain_order": ["llm:model1", "llm:model2"]
    }
    
    merged_result = await orchestrator._chain_merge_strategy(results, parameters)
    
    assert "Result from model1" in merged_result["result"]
    assert "Result from model2" in merged_result["result"]
    assert len(merged_result["models"]) == 2
    assert merged_result["latency_ms"] == 250  # Sum of latencies


@pytest.mark.asyncio
async def test_orchestrate_single_model(orchestrator):
    """Test orchestration with a single model."""
    result = await orchestrator.orchestrate(
        input_data="Test prompt",
        parameters={
            "model_type": "llm",
            "selection_strategy": "default",
            "model_name": "model1"
        }
    )
    
    assert "result" in result
    assert "model" in result
    assert "confidence" in result
    assert "latency_ms" in result
    assert "orchestration" in result


@pytest.mark.asyncio
async def test_orchestrate_multiple_models_sequential(orchestrator):
    """Test orchestration with multiple models sequentially."""
    result = await orchestrator.orchestrate(
        input_data="Test prompt",
        parameters={
            "model_type": "llm",
            "selection_strategy": "ensemble",
            "ensemble_size": 2,
            "parallel_execution": False,
            "merge_strategy": "weighted"
        }
    )
    
    assert "result" in result
    assert "orchestration" in result
    assert result["orchestration"]["parallel_execution"] is False
    assert result["orchestration"]["merge_strategy"] == "weighted"


@pytest.mark.asyncio
async def test_orchestrate_multiple_models_parallel(orchestrator):
    """Test orchestration with multiple models in parallel."""
    result = await orchestrator.orchestrate(
        input_data="Test prompt",
        parameters={
            "model_type": "llm",
            "selection_strategy": "ensemble",
            "ensemble_size": 2,
            "parallel_execution": True,
            "merge_strategy": "voting"
        }
    )
    
    assert "result" in result
    assert "orchestration" in result
    assert result["orchestration"]["parallel_execution"] is True
    assert result["orchestration"]["merge_strategy"] == "voting"


@pytest.mark.asyncio
async def test_orchestrate_error_handling(orchestrator):
    """Test orchestration error handling."""
    # Mock process_llm to raise an exception
    with patch.object(
        orchestrator.model_manager, 
        "process_llm", 
        side_effect=Exception("Test error")
    ):
        with pytest.raises(Exception):
            await orchestrator.orchestrate(
                input_data="Test prompt",
                parameters={"model_type": "llm"}
            )
        
        # Check that stats were updated
        assert orchestrator.stats["failed_orchestrations"] == 1


@pytest.mark.asyncio
async def test_stats_update(orchestrator):
    """Test that statistics are updated correctly."""
    # Initial stats
    initial_total = orchestrator.stats["total_orchestrations"]
    initial_successful = orchestrator.stats["successful_orchestrations"]
    
    # Perform orchestration
    await orchestrator.orchestrate(
        input_data="Test prompt",
        parameters={"model_type": "llm"}
    )
    
    # Check stats were updated
    assert orchestrator.stats["total_orchestrations"] == initial_total + 1
    assert orchestrator.stats["successful_orchestrations"] == initial_successful + 1
    assert orchestrator.stats["average_latency_ms"] > 0
