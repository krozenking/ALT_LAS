"""
Tests for enhanced model selection functionality.

This module contains tests for the enhanced model selection module,
including advanced selection strategies and optimized parallel execution.
"""
import asyncio
import unittest
import pytest
from unittest.mock import patch, MagicMock

from ..core.model_selection import (
    EnhancedModelOrchestrator,
    AdvancedModelSelectionStrategy
)
from ..models.inference import InferenceRequest, InferenceResponse
from ..models.model import ModelInfo, ModelType, ModelStatus


class TestEnhancedModelOrchestrator(unittest.TestCase):
    """Test cases for EnhancedModelOrchestrator."""
    
    def setUp(self):
        """Set up test environment."""
        # Create mock model manager
        self.model_manager = MagicMock()
        
        # Create test models
        self.test_models = [
            ModelInfo(
                model_id="test-model-1",
                name="Test Model 1",
                type=ModelType.LLM,
                description="Test model 1",
                version="1.0",
                size=1024 * 1024 * 1024,  # 1 GB
                parameters=7 * 1000 * 1000 * 1000,  # 7B
                supports_gpu=True,
                supports_cpu=True,
                tags=["general"]
            ),
            ModelInfo(
                model_id="test-model-2",
                name="Test Model 2",
                type=ModelType.LLM,
                description="Test model 2",
                version="1.0",
                size=2 * 1024 * 1024 * 1024,  # 2 GB
                parameters=13 * 1000 * 1000 * 1000,  # 13B
                supports_gpu=True,
                supports_cpu=True,
                tags=["general"]
            ),
            ModelInfo(
                model_id="code-model",
                name="Code Model",
                type=ModelType.LLM,
                description="Specialized code model",
                version="1.0",
                size=1.5 * 1024 * 1024 * 1024,  # 1.5 GB
                parameters=10 * 1000 * 1000 * 1000,  # 10B
                supports_gpu=True,
                supports_cpu=True,
                tags=["code"]
            ),
            ModelInfo(
                model_id="creative-model",
                name="Creative Model",
                type=ModelType.LLM,
                description="Creative writing model",
                version="1.0",
                size=1.8 * 1024 * 1024 * 1024,  # 1.8 GB
                parameters=11 * 1000 * 1000 * 1000,  # 11B
                supports_gpu=True,
                supports_cpu=True,
                tags=["creative"],
                metadata={"creativity_score": 0.9}
            )
        ]
        
        # Set up model manager mock
        self.model_manager.list_models.return_value = asyncio.Future()
        self.model_manager.list_models.return_value.set_result(self.test_models)
        
        self.model_manager.get_model.return_value = asyncio.Future()
        self.model_manager.get_model.return_value.set_result(self.test_models[0])
        
        # Create orchestrator
        self.orchestrator = EnhancedModelOrchestrator(self.model_manager)
    
    @pytest.mark.asyncio
    async def test_select_models_advanced_multi_objective(self):
        """Test multi-objective model selection strategy."""
        # Test with multi-objective strategy
        model_ids = await self.orchestrator.select_models_advanced(
            "text-generation",
            AdvancedModelSelectionStrategy.MULTI_OBJECTIVE,
            constraints={
                'objective_weights': {'accuracy': 0.6, 'speed': 0.2, 'cost': 0.2}
            }
        )
        
        # With higher weight on accuracy, the largest model should be first
        self.assertEqual(model_ids[0], "test-model-2")
    
    @pytest.mark.asyncio
    async def test_select_models_advanced_adaptive(self):
        """Test adaptive model selection strategy."""
        # Set up performance history
        self.orchestrator.model_performance_history = {
            "test-model-1": {
                "success_rate": 0.9,
                "avg_latency": 100
            },
            "test-model-2": {
                "success_rate": 0.8,
                "avg_latency": 200
            }
        }
        
        # Test with adaptive strategy
        model_ids = await self.orchestrator.select_models_advanced(
            "text-generation",
            AdvancedModelSelectionStrategy.ADAPTIVE
        )
        
        # Model with higher success rate should be first
        self.assertEqual(model_ids[0], "test-model-1")
    
    @pytest.mark.asyncio
    async def test_select_models_advanced_context_aware(self):
        """Test context-aware model selection strategy."""
        # Test with context-aware strategy and short input
        model_ids = await self.orchestrator.select_models_advanced(
            "text-generation",
            AdvancedModelSelectionStrategy.CONTEXT_AWARE,
            context={"input_length": 500}
        )
        
        # For short inputs, smaller model should be preferred
        self.assertEqual(model_ids[0], "test-model-1")
        
        # Test with context-aware strategy and long input
        model_ids = await self.orchestrator.select_models_advanced(
            "text-generation",
            AdvancedModelSelectionStrategy.CONTEXT_AWARE,
            context={"input_length": 5000}
        )
        
        # For long inputs, model with larger context window should be preferred
        # In this test, we don't have context_length set, so it falls back to parameters
        self.assertEqual(model_ids[0], "test-model-2")
    
    @pytest.mark.asyncio
    async def test_select_models_advanced_specialized(self):
        """Test specialized model selection strategy."""
        # Test with specialized strategy for code generation
        model_ids = await self.orchestrator.select_models_advanced(
            "text-generation",
            AdvancedModelSelectionStrategy.SPECIALIZED,
            context={"task_subtype": "code_generation"}
        )
        
        # Code model should be preferred for code generation
        self.assertEqual(model_ids[0], "code-model")
        
        # Test with specialized strategy for creative writing
        model_ids = await self.orchestrator.select_models_advanced(
            "text-generation",
            AdvancedModelSelectionStrategy.SPECIALIZED,
            context={"task_subtype": "creative_writing"}
        )
        
        # Creative model should be preferred for creative writing
        self.assertEqual(model_ids[0], "creative-model")
    
    @pytest.mark.asyncio
    async def test_run_optimized_parallel_inference(self):
        """Test optimized parallel inference execution."""
        # Mock the run_inference method
        self.orchestrator.run_inference = MagicMock()
        
        # Create mock responses
        responses = [
            InferenceResponse(
                model_id="test-model-1",
                outputs="Test output 1",
                metadata={"processing_time_ms": 100}
            ),
            InferenceResponse(
                model_id="test-model-2",
                outputs="Test output 2",
                metadata={"processing_time_ms": 200}
            )
        ]
        
        # Set up mock return values for run_inference
        async def mock_run_inference(req, strategy):
            # Simulate different execution times
            if req.model_id == "test-model-1":
                await asyncio.sleep(0.1)
                return responses[0]
            else:
                await asyncio.sleep(0.2)
                return responses[1]
        
        self.orchestrator.run_inference.side_effect = mock_run_inference
        
        # Create test request
        request = InferenceRequest(
            model_id="test-model-1",
            inputs="Test input"
        )
        
        # Run optimized parallel inference with early stopping
        results = await self.orchestrator.run_optimized_parallel_inference(
            request,
            ["test-model-1", "test-model-2"],
            early_stopping=True
        )
        
        # Should have at least one result (the faster one)
        self.assertGreaterEqual(len(results), 1)
        
        # Run optimized parallel inference with timeout
        results = await self.orchestrator.run_optimized_parallel_inference(
            request,
            ["test-model-1", "test-model-2"],
            timeout=0.15  # Only the faster model should complete
        )
        
        # Should have at least one result (the faster one)
        self.assertGreaterEqual(len(results), 1)
    
    @pytest.mark.asyncio
    async def test_update_model_usage_stats(self):
        """Test updating model usage statistics."""
        # Update usage stats for a model
        await self.orchestrator.update_model_usage_stats(
            "test-model-1",
            {
                "tokens": 100,
                "processing_time": 200
            }
        )
        
        # Check that stats were updated
        stats = await self.orchestrator.get_model_usage_stats("test-model-1")
        self.assertIsNotNone(stats)
        self.assertEqual(stats["call_count"], 1)
        self.assertEqual(stats["total_tokens"], 100)
        self.assertEqual(stats["total_processing_time"], 200)
        
        # Update again
        await self.orchestrator.update_model_usage_stats(
            "test-model-1",
            {
                "tokens": 50,
                "processing_time": 100
            }
        )
        
        # Check that stats were accumulated
        stats = await self.orchestrator.get_model_usage_stats("test-model-1")
        self.assertEqual(stats["call_count"], 2)
        self.assertEqual(stats["total_tokens"], 150)
        self.assertEqual(stats["total_processing_time"], 300)


if __name__ == '__main__':
    unittest.main()
