"""
Inference service for AI Orchestrator.

This service is responsible for running inference using AI models, including:
- Single model inference
- Batch inference
- Parallel inference with multiple models
- Orchestrated inference with automatic model selection
"""
import logging
import asyncio
import random
import time
from typing import Dict, List, Any, Optional, Union

from ..models.inference import InferenceRequest, InferenceResponse
from ..models.model import ModelType, ModelInfo
from .model_manager import ModelManager, get_model_manager
from ..core.model_cache import ModelCache, get_model_cache
from .llm_service import LLMService, get_llm_service
from .vision_service import VisionService, get_vision_service
from .audio_service import AudioService, get_audio_service
from ..core.performance_monitor import PerformanceMonitor, get_performance_monitor

logger = logging.getLogger(__name__)

class InferenceService:
    """
    Inference service for running AI model inference.
    """
    def __init__(
        self, 
        model_manager: ModelManager, 
        model_cache: ModelCache, 
        llm_service: LLMService,
        vision_service: VisionService,
        audio_service: AudioService,
        performance_monitor: PerformanceMonitor
    ):
        """Initialize the inference service."""
        self.model_manager = model_manager
        self.model_cache = model_cache
        self.llm_service = llm_service
        self.vision_service = vision_service
        self.audio_service = audio_service
        self.performance_monitor = performance_monitor
        
    async def run_inference(self, request: InferenceRequest) -> InferenceResponse:
        """
        Run inference using the specified model.
        Delegates to the appropriate service based on model type.
        
        Args:
            request: Inference request
            
        Returns:
            Inference response
            
        Raises:
            ValueError: If model not found or type not supported
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
                logger.info(f"Returning cached response for model {model_id}")
                response = InferenceResponse(**cached_response)
                success = True
                return response
            
            # Get model info
            model_info = await self.model_manager.get_model(model_id)
            if not model_info:
                raise ValueError(f"Model {model_id} not found")
                
            # Delegate based on model type
            if model_info.type == ModelType.LLM:
                response = await self.llm_service.run_llm_inference(request)
            elif model_info.type == ModelType.VISION:
                response = await self.vision_service.run_vision_inference(request)
            elif model_info.type == ModelType.AUDIO:
                response = await self.audio_service.run_audio_inference(request)
            else:
                raise ValueError(f"Unsupported model type for inference: {model_info.type}")
                
            success = True
            return response
            
        except Exception as e:
            logger.error(f"Error running inference with model {model_id}: {str(e)}")
            raise RuntimeError(f"Failed to run inference: {str(e)}")
        finally:
            # Record performance stats if not already recorded by specialized service
            if model_info and model_info.type not in [ModelType.LLM]:  # LLM service already records stats
                latency_ms = (time.time() - start_time) * 1000
                memory_usage_bytes = None
                if model_info and model_info.status and model_info.status.memory_usage:
                    memory_usage_bytes = model_info.status.memory_usage * 1024 * 1024
                    
                await self.performance_monitor.record_inference_stats(
                    model_id=model_id,
                    latency_ms=latency_ms,
                    memory_usage=memory_usage_bytes,
                    success=success
                )
        
    async def run_batch_inference(self, requests: List[InferenceRequest]) -> List[InferenceResponse]:
        """
        Run batch inference using the specified models.
        
        Args:
            requests: List of inference requests
            
        Returns:
            List of inference responses
        """
        # Group requests by model type for more efficient processing
        llm_requests = []
        vision_requests = []
        audio_requests = []
        other_requests = []
        
        for request in requests:
            try:
                model_info = await self.model_manager.get_model(request.model_id)
                if not model_info:
                    other_requests.append(request)
                    continue
                    
                if model_info.type == ModelType.LLM:
                    llm_requests.append(request)
                elif model_info.type == ModelType.VISION:
                    vision_requests.append(request)
                elif model_info.type == ModelType.AUDIO:
                    audio_requests.append(request)
                else:
                    other_requests.append(request)
            except Exception:
                other_requests.append(request)
        
        # Process each group in parallel
        tasks = []
        if llm_requests:
            tasks.append(self.llm_service.run_batch_llm_inference(llm_requests))
        
        # For vision and audio, we don't have batch methods yet, so process individually
        for request in vision_requests + audio_requests + other_requests:
            tasks.append(self.run_inference(request))
        
        # Gather all results
        all_responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Flatten and handle exceptions
        results = []
        for response in all_responses:
            if isinstance(response, list):
                # This is from batch processing
                results.extend(response)
            elif isinstance(response, Exception):
                logger.error(f"Error in batch inference: {str(response)}")
                # Create error response - we don't know which request this is for
                results.append(InferenceResponse(
                    model_id="unknown",
                    outputs="Error during inference",
                    metadata={"error": str(response)}
                ))
            else:
                results.append(response)
                
        # Ensure we have the same number of responses as requests
        if len(results) != len(requests):
            logger.warning(f"Mismatch in batch inference: {len(requests)} requests, {len(results)} responses")
            # Add error responses if needed
            while len(results) < len(requests):
                results.append(InferenceResponse(
                    model_id="unknown",
                    outputs="Missing response in batch processing",
                    metadata={"error": "Internal error in batch processing"}
                ))
            # Truncate if we somehow have too many
            if len(results) > len(requests):
                results = results[:len(requests)]
                
        return results
        
    async def run_parallel_inference(
        self, request: InferenceRequest, model_ids: List[str]
    ) -> List[InferenceResponse]:
        """
        Run inference in parallel using multiple models for the same input.
        
        Args:
            request: Inference request
            model_ids: List of model IDs to use
            
        Returns:
            List of inference responses
        """
        start_time = time.time()
        
        # Create a request for each model
        requests = [
            InferenceRequest(
                model_id=model_id,
                inputs=request.inputs,
                parameters=request.parameters
            )
            for model_id in model_ids
        ]
        
        # Run batch inference
        responses = await self.run_batch_inference(requests)
        
        # Record parallel execution stats
        latency_ms = (time.time() - start_time) * 1000
        await self.performance_monitor.record_inference_stats(
            model_id="parallel_execution",
            latency_ms=latency_ms,
            success=True
        )
        
        return responses
        
    async def _select_models_for_orchestration(
        self, request: InferenceRequest, strategy: str
    ) -> List[str]:
        """
        Select appropriate model(s) based on the request and strategy.
        
        Args:
            request: Inference request
            strategy: Orchestration strategy (
                e.g., "auto", "fastest", "cheapest", "best_quality", "ensemble"
            )
            
        Returns:
            List of selected model IDs
        """
        # Get all models
        all_models = await self.model_manager.list_models()
        
        # Filter by type based on input (very basic)
        compatible_models = []
        if isinstance(request.inputs, str):
            compatible_models = [m.model_id for m in all_models if m.type == ModelType.LLM]
        elif isinstance(request.inputs, dict) and "image_path" in request.inputs:
            compatible_models = [m.model_id for m in all_models if m.type == ModelType.VISION]
        elif isinstance(request.inputs, dict) and "audio_path" in request.inputs:
            compatible_models = [m.model_id for m in all_models if m.type == ModelType.AUDIO]
        
        if not compatible_models:
            logger.warning(f"No compatible models found for orchestration strategy {strategy}")
            # Fallback to default model if specified in request
            if request.model_id:
                return [request.model_id]
            else:
                # Or maybe a system default? For now, return empty
                return []

        # Get performance stats for compatible models
        model_stats = {}
        for model_id in compatible_models:
            stats = await self.performance_monitor.get_model_stats(model_id)
            model_stats[model_id] = stats

        if strategy == "fastest":
            # Select based on historical latency
            sorted_models = sorted(
                [(model_id, stats.get("avg_latency_ms", float("inf"))) for model_id, stats in model_stats.items()],
                key=lambda x: x[1]
            )
            # Return the fastest model
            if sorted_models:
                return [sorted_models[0][0]]
            
        elif strategy == "cheapest":
            # TODO: Select based on cost metadata
            # For now, just return a random model
            return [random.choice(compatible_models)]
            
        elif strategy == "best_quality":
            # TODO: Select based on accuracy/benchmark metadata
            # For now, just return a random model
            return [random.choice(compatible_models)]
            
        elif strategy == "ensemble":
            # Select multiple diverse models
            # For now, just return up to 3 random models
            if len(compatible_models) <= 3:
                return compatible_models
            else:
                return random.sample(compatible_models, 3)
                
        elif strategy == "auto":
            # Intelligent auto-selection based on multiple factors
            # For now, prioritize models with higher success rates and lower latency
            
            # Calculate a score for each model
            model_scores = []
            for model_id, stats in model_stats.items():
                success_rate = stats.get("success_count", 0) / max(stats.get("inference_count", 1), 1)
                avg_latency = stats.get("avg_latency_ms", float("inf"))
                
                # Higher score is better
                # Normalize latency to 0-1 range (lower is better)
                max_latency = 5000  # 5 seconds
                latency_score = 1 - min(avg_latency / max_latency, 1)
                
                # Combine factors (weight success rate higher)
                score = (success_rate * 0.7) + (latency_score * 0.3)
                
                model_scores.append((model_id, score))
            
            # Sort by score (descending)
            sorted_models = sorted(model_scores, key=lambda x: x[1], reverse=True)
            
            # Return the highest scoring model
            if sorted_models:
                return [sorted_models[0][0]]
        
        # Default or unknown strategy
        if request.model_id:
            return [request.model_id]
        else:
            return [random.choice(compatible_models)] if compatible_models else []

    async def _combine_ensemble_results(
        self, responses: List[InferenceResponse]
    ) -> InferenceResponse:
        """
        Combine results from multiple models in an ensemble.
        
        Args:
            responses: List of responses from parallel inference
            
        Returns:
            Combined inference response
        """
        # Filter out error responses
        valid_responses = [r for r in responses if "error" not in r.metadata]
        
        if not valid_responses:
            # If all failed, return the first error response
            if responses:
                return responses[0]
            else:
                return InferenceResponse(
                    model_id="ensemble",
                    outputs="No responses to combine",
                    metadata={"error": "No models returned results"}
                )
        
        # Determine the type of outputs
        if all(isinstance(r.outputs, str) for r in valid_responses):
            # Text outputs - for now, just use the longest response
            # In a real implementation, we might use more sophisticated methods
            # like semantic similarity, voting, or aggregation
            longest_response = max(valid_responses, key=lambda r: len(r.outputs))
            
            combined_response = InferenceResponse(
                model_id="ensemble",
                outputs=longest_response.outputs,
                metadata={
                    "ensemble_method": "longest_text",
                    "original_model_ids": [r.model_id for r in valid_responses],
                    "ensemble_size": len(valid_responses)
                }
            )
            
        elif all(isinstance(r.outputs, dict) for r in valid_responses):
            # Dictionary outputs (e.g., from vision models)
            # For now, just use the response with the most keys
            most_detailed = max(valid_responses, key=lambda r: len(r.outputs.keys()) if isinstance(r.outputs, dict) else 0)
            
            combined_response = InferenceResponse(
                model_id="ensemble",
                outputs=most_detailed.outputs,
                metadata={
                    "ensemble_method": "most_detailed",
                    "original_model_ids": [r.model_id for r in valid_responses],
                    "ensemble_size": len(valid_responses)
                }
            )
            
        else:
            # Mixed or other types - just use the first valid response
            combined_response = valid_responses[0].copy()
            combined_response.model_id = "ensemble"
            combined_response.metadata["ensemble_method"] = "first_valid"
            combined_response.metadata["original_model_ids"] = [r.model_id for r in valid_responses]
            combined_response.metadata["ensemble_size"] = len(valid_responses)
            
        return combined_response

    async def run_orchestrated_inference(
        self, request: InferenceRequest, strategy: str = "auto"
    ) -> InferenceResponse:
        """
        Run orchestrated inference using the optimal model selection strategy.
        
        Args:
            request: Inference request
            strategy: Model selection strategy
            
        Returns:
            Inference response
        """
        start_time = time.time()
        success = False
        
        try:
            logger.info(f"Running orchestrated inference with strategy: {strategy}")
            
            # 1. Select model(s) based on strategy
            selected_model_ids = await self._select_models_for_orchestration(request, strategy)
            
            if not selected_model_ids:
                raise ValueError("No suitable models found for orchestration")
            
            logger.info(f"Selected models for orchestration: {selected_model_ids}")
            
            # 2. Run inference
            if len(selected_model_ids) == 1:
                # Single model selected
                orchestrated_request = InferenceRequest(
                    model_id=selected_model_ids[0],
                    inputs=request.inputs,
                    parameters=request.parameters
                )
                response = await self.run_inference(orchestrated_request)
            else:
                # Multiple models selected (ensemble or parallel execution)
                responses = await self.run_parallel_inference(request, selected_model_ids)
                
                # 3. Combine results if ensemble strategy
                if strategy == "ensemble":
                    response = await self._combine_ensemble_results(responses)
                else:
                    # For other parallel strategies, return the first successful response
                    valid_responses = [r for r in responses if "error" not in r.metadata]
                    if valid_responses:
                        response = valid_responses[0]
                    else:
                        response = InferenceResponse(
                            model_id=",".join(selected_model_ids),
                            outputs="Error in parallel execution",
                            metadata={"error": "No successful response from parallel execution"}
                        )
            
            # Add orchestration info to metadata
            if response.metadata is None:
                response.metadata = {}
            response.metadata["orchestration_strategy"] = strategy
            response.metadata["selected_models"] = selected_model_ids
            
            success = True
            return response
            
        except Exception as e:
            logger.error(f"Error during orchestrated inference: {str(e)}")
            raise RuntimeError(f"Orchestrated inference failed: {str(e)}")
        finally:
            # Record orchestration performance stats
            latency_ms = (time.time() - start_time) * 1000
            await self.performance_monitor.record_inference_stats(
                model_id=f"orchestration_{strategy}",
                latency_ms=latency_ms,
                success=success
            )


def get_inference_service(
    model_manager: ModelManager = get_model_manager(),
    model_cache: ModelCache = get_model_cache(),
    llm_service: LLMService = get_llm_service(),
    vision_service: VisionService = get_vision_service(),
    audio_service: AudioService = get_audio_service(),
    performance_monitor: PerformanceMonitor = get_performance_monitor()
) -> InferenceService:
    """
    Factory function to create an inference service instance.
    
    Args:
        model_manager: Model manager instance
        model_cache: Model cache instance
        llm_service: LLM service instance
        vision_service: Vision service instance
        audio_service: Audio service instance
        performance_monitor: Performance monitor instance
        
    Returns:
        InferenceService instance
    """
    return InferenceService(
        model_manager, 
        model_cache, 
        llm_service, 
        vision_service, 
        audio_service,
        performance_monitor
    )
