"""
LLM service for AI Orchestrator.

This service is responsible for managing LLM models and running inference.
"""
import logging
import asyncio
import time # Import time for latency measurement
from typing import Dict, List, Any, Optional, Union

from ..models.inference import InferenceRequest, InferenceResponse
from ..models.model import ModelType
from ..services.model_manager import ModelManager, get_model_manager
from ..core.llm_integration import LLMIntegration, get_llm_integration
from ..core.model_cache import ModelCache, get_model_cache
from ..core.performance_monitor import PerformanceMonitor, get_performance_monitor # Import PerformanceMonitor

logger = logging.getLogger(__name__)

class LLMService:
    """
    Service for managing LLM models and running inference.
    """
    def __init__(self, model_manager: ModelManager, llm_integration: LLMIntegration, model_cache: ModelCache, performance_monitor: PerformanceMonitor):
        """Initialize the LLM service."""
        self.model_manager = model_manager
        self.llm_integration = llm_integration
        self.model_cache = model_cache
        self.performance_monitor = performance_monitor # Inject PerformanceMonitor
        
    async def run_llm_inference(self, request: InferenceRequest) -> InferenceResponse:
        """
        Run inference with an LLM model.
        
        Args:
            request: Inference request
            
        Returns:
            Inference response
            
        Raises:
            ValueError: If model not found or not an LLM model
            RuntimeError: If inference fails
        """
        start_time = time.time()
        model_id = request.model_id
        success = False
        response = None
        
        try:
            # Check cache first
            cached_response = await self.model_cache.get(model_id, request.inputs, request.parameters)
            if cached_response:
                logger.info(f"Returning cached response for LLM model {model_id}")
                response = InferenceResponse(**cached_response)
                success = True
                return response # Return early if cached
            
            # Get model info
            model_info = await self.model_manager.get_model(model_id)
            if not model_info:
                raise ValueError(f"Model {model_id} not found")
                
            # Check if model is an LLM
            if model_info.type != ModelType.LLM:
                raise ValueError(f"Model {model_id} is not an LLM model")
                
            # Check if model is loaded, load if necessary
            if not model_info.status or not model_info.status.loaded:
                logger.info(f"LLM model {model_id} not loaded, loading now")
                await self.model_manager.load_model(model_id)
                # Refresh model info after loading
                model_info = await self.model_manager.get_model(model_id)
                if not model_info or not model_info.status or not model_info.status.loaded:
                     raise RuntimeError(f"Failed to load model {model_id} before inference")
                
            # Get loaded model instance
            model = self.model_manager.loaded_models.get(model_id)
            if not model:
                raise RuntimeError(f"Failed to get loaded model instance for {model_id}")
                
            # Run inference based on model type
            if model.get("type") == "llama.cpp":
                # Run llama.cpp inference
                if not isinstance(request.inputs, str):
                    raise ValueError("llama.cpp models require string input")
                    
                result = await self.llm_integration.run_llama_inference(
                    model=model,
                    prompt=request.inputs,
                    params=request.parameters
                )
                
                # Create response
                response = InferenceResponse(
                    model_id=model_id,
                    outputs=result.get("text", ""),
                    metadata={
                        "usage": result.get("usage", {}),
                        "finish_reason": result.get("finish_reason", ""),
                        "model_version": model_info.version,
                        "cached": False
                    }
                )
                
            elif model.get("type") == "onnx":
                # Run ONNX inference
                result = await self.llm_integration.run_onnx_inference(
                    model=model,
                    inputs=request.inputs,
                    params=request.parameters
                )
                
                # Create response
                response = InferenceResponse(
                    model_id=model_id,
                    outputs=result.get("text", ""),
                    metadata={
                        "model_version": model_info.version,
                        "cached": False
                    }
                )
                
            else:
                raise ValueError(f"Unsupported LLM model type: {model.get("type")}")
                
            # Store result in cache
            await self.model_cache.set(model_id, request.inputs, request.parameters, response.dict())
            success = True
            return response
            
        except Exception as e:
            logger.error(f"Error running LLM inference with model {model_id}: {str(e)}")
            # Create error response if needed for batch processing
            response = InferenceResponse(
                model_id=model_id,
                outputs="Error during LLM inference",
                metadata={"error": str(e)}
            )
            raise RuntimeError(f"Failed to run LLM inference: {str(e)}")
        finally:
            # Record performance stats regardless of success/failure
            latency_ms = (time.time() - start_time) * 1000
            # Get memory usage from model status if available
            memory_usage_bytes = None
            if model_info and model_info.status and model_info.status.memory_usage:
                memory_usage_bytes = model_info.status.memory_usage * 1024 * 1024 # Convert MB to bytes
                
            await self.performance_monitor.record_inference_stats(
                model_id=model_id,
                latency_ms=latency_ms,
                memory_usage=memory_usage_bytes,
                success=success
            )
            # Update last used time in model status
            if success and model_info and model_info.status:
                 model_info.status.last_used = time.strftime("%Y-%m-%dT%H:%M:%S")
    
    async def run_batch_llm_inference(self, requests: List[InferenceRequest]) -> List[InferenceResponse]:
        """
        Run batch inference with LLM models.
        
        Args:
            requests: List of inference requests
            
        Returns:
            List of inference responses
        """
        tasks = [self.run_llm_inference(request) for request in requests]
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle exceptions and ensure InferenceResponse objects are returned
        results = []
        for i, response in enumerate(responses):
            if isinstance(response, Exception):
                logger.error(f"Error in batch LLM inference for request {i}: {str(response)}")
                # Create error response
                results.append(InferenceResponse(
                    model_id=requests[i].model_id,
                    outputs="Error during LLM inference",
                    metadata={"error": str(response)}
                ))
            elif isinstance(response, InferenceResponse):
                results.append(response)
            else:
                 # Should not happen, but handle unexpected return types
                 logger.error(f"Unexpected return type in batch LLM inference for request {i}: {type(response)}")
                 results.append(InferenceResponse(
                    model_id=requests[i].model_id,
                    outputs="Unexpected error during LLM inference",
                    metadata={"error": "Invalid response type"}
                ))
                
        return results


def get_llm_service(
    model_manager: ModelManager = get_model_manager(),
    llm_integration: LLMIntegration = get_llm_integration(),
    model_cache: ModelCache = get_model_cache(),
    performance_monitor: PerformanceMonitor = get_performance_monitor() # Inject PerformanceMonitor
) -> LLMService:
    """
    Factory function to create an LLM service instance.
    
    Args:
        model_manager: Model manager instance
        llm_integration: LLM integration instance
        model_cache: Model cache instance
        performance_monitor: Performance monitor instance
        
    Returns:
        LLMService instance
    """
    return LLMService(model_manager, llm_integration, model_cache, performance_monitor)
