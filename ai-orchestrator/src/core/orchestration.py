"""
Model orchestration module for AI Orchestrator.

This module provides functionality for orchestrating multiple models,
including model selection, parallel execution, and result aggregation.
"""
import logging
import asyncio
from typing import Dict, List, Any, Optional, Union, Tuple
from enum import Enum

from ..models.inference import InferenceRequest, InferenceResponse
from ..models.model import ModelType
from ..services.model_manager import ModelManager, get_model_manager
from ..core.llm.llama_cpp import get_llama_cpp_adapter
from ..core.llm.onnx_runtime import get_onnx_runtime_adapter

logger = logging.getLogger(__name__)

class ModelSelectionStrategy(str, Enum):
    """Model selection strategy enumeration."""
    AUTO = "auto"
    PERFORMANCE = "performance"
    ACCURACY = "accuracy"
    COST = "cost"
    ENSEMBLE = "ensemble"
    FALLBACK = "fallback"


class ModelOrchestrator:
    """
    Model orchestrator for managing multiple models.
    """
    def __init__(self, model_manager: ModelManager):
        """Initialize the model orchestrator."""
        self.model_manager = model_manager
        self.llama_cpp_adapter = get_llama_cpp_adapter()
        self.onnx_runtime_adapter = get_onnx_runtime_adapter()
        
    async def select_models(
        self, 
        task_type: str, 
        strategy: ModelSelectionStrategy = ModelSelectionStrategy.AUTO,
        constraints: Optional[Dict[str, Any]] = None
    ) -> List[str]:
        """
        Select appropriate models for a task based on strategy and constraints.
        
        Args:
            task_type: Type of task (e.g., 'text-generation', 'image-classification')
            strategy: Model selection strategy
            constraints: Optional constraints (e.g., max_memory, min_accuracy)
            
        Returns:
            List of selected model IDs
        """
        # Get all available models
        all_models = await self.model_manager.list_models()
        
        # Filter models by task type
        task_models = []
        for model in all_models:
            # Map task type to model type
            if task_type in ['text-generation', 'chat', 'completion']:
                if model.type == ModelType.LLM:
                    task_models.append(model)
            elif task_type in ['image-classification', 'object-detection', 'ocr']:
                if model.type == ModelType.VISION:
                    task_models.append(model)
            elif task_type in ['speech-to-text', 'text-to-speech', 'audio-classification']:
                if model.type == ModelType.AUDIO:
                    task_models.append(model)
            elif task_type in ['multimodal']:
                if model.type == ModelType.MULTIMODAL:
                    task_models.append(model)
        
        # Apply constraints if provided
        if constraints:
            filtered_models = []
            for model in task_models:
                meets_constraints = True
                
                # Check memory constraint
                if 'max_memory' in constraints and model.size:
                    if model.size > constraints['max_memory']:
                        meets_constraints = False
                        
                # Check parameters constraint
                if 'max_parameters' in constraints and model.parameters:
                    if model.parameters > constraints['max_parameters']:
                        meets_constraints = False
                
                # Add more constraint checks as needed
                
                if meets_constraints:
                    filtered_models.append(model)
            
            task_models = filtered_models
        
        # Sort models based on strategy
        if strategy == ModelSelectionStrategy.PERFORMANCE:
            # Sort by size (smaller models are typically faster)
            task_models.sort(key=lambda m: m.size if m.size else float('inf'))
        elif strategy == ModelSelectionStrategy.ACCURACY:
            # Sort by parameters (larger models are typically more accurate)
            task_models.sort(key=lambda m: m.parameters if m.parameters else 0, reverse=True)
        elif strategy == ModelSelectionStrategy.COST:
            # Sort by size (smaller models typically cost less to run)
            task_models.sort(key=lambda m: m.size if m.size else float('inf'))
        elif strategy == ModelSelectionStrategy.ENSEMBLE:
            # For ensemble, we want diverse models
            # This is a simplified approach - in a real system, you'd want more sophisticated diversity metrics
            if len(task_models) > 1:
                # Take the best and most diverse models
                selected = [task_models[0]]
                for model in task_models[1:]:
                    # Add if different enough from already selected models
                    if all(m.parameters != model.parameters for m in selected):
                        selected.append(model)
                        if len(selected) >= 3:  # Limit to 3 models for ensemble
                            break
                task_models = selected
        elif strategy == ModelSelectionStrategy.FALLBACK:
            # For fallback, sort by reliability (using a mock metric for now)
            # In a real system, you'd track model reliability over time
            task_models.sort(key=lambda m: 0.9)  # Mock reliability score
        
        # Return model IDs
        return [model.model_id for model in task_models]
    
    async def run_inference(
        self, 
        request: InferenceRequest,
        strategy: ModelSelectionStrategy = ModelSelectionStrategy.AUTO
    ) -> InferenceResponse:
        """
        Run inference using the appropriate model based on the request.
        
        Args:
            request: Inference request
            strategy: Model selection strategy
            
        Returns:
            Inference response
            
        Raises:
            ValueError: If no suitable model is found
            RuntimeError: If inference fails
        """
        model_id = request.model_id
        
        # Get model info
        model_info = await self.model_manager.get_model(model_id)
        if not model_info:
            raise ValueError(f"Model {model_id} not found")
        
        # Check if model is loaded, load if necessary
        if not model_info.status or not model_info.status.loaded:
            logger.info(f"Model {model_id} not loaded, loading now")
            await self.model_manager.load_model(model_id)
        
        # Determine model type and run inference
        model_type = model_info.type
        
        try:
            if model_type == ModelType.LLM:
                # Check if it's a llama.cpp model
                if "llama" in model_id.lower() or model_id.lower().endswith(".gguf"):
                    return await self.llama_cpp_adapter.generate(model_id, request)
                # Check if it's an ONNX model
                elif model_id.lower().endswith(".onnx"):
                    return await self.onnx_runtime_adapter.run_inference(model_id, request)
                else:
                    # Default to llama.cpp for now
                    return await self.llama_cpp_adapter.generate(model_id, request)
            else:
                # For other model types, use a generic approach
                # In a real implementation, you'd have specific adapters for each model type
                logger.info(f"Using generic inference for model type {model_type}")
                
                # Simulate inference
                await asyncio.sleep(0.5)
                
                # Create mock response
                response = InferenceResponse(
                    model_id=model_id,
                    outputs=f"Mock output for {model_type} model",
                    metadata={
                        "model_version": model_info.version,
                        "processing_time_ms": 500
                    }
                )
                
                return response
                
        except Exception as e:
            logger.error(f"Error running inference with model {model_id}: {str(e)}")
            
            # If using fallback strategy, try another model
            if strategy == ModelSelectionStrategy.FALLBACK:
                logger.info(f"Attempting fallback for failed model {model_id}")
                
                # Select fallback models
                task_type = self._infer_task_type(request)
                fallback_models = await self.select_models(
                    task_type, 
                    ModelSelectionStrategy.FALLBACK
                )
                
                # Remove the failed model
                if model_id in fallback_models:
                    fallback_models.remove(model_id)
                
                # Try fallback models
                if fallback_models:
                    fallback_id = fallback_models[0]
                    logger.info(f"Using fallback model {fallback_id}")
                    
                    # Create new request with fallback model
                    fallback_request = InferenceRequest(
                        model_id=fallback_id,
                        inputs=request.inputs,
                        parameters=request.parameters
                    )
                    
                    # Run inference with fallback model
                    return await self.run_inference(
                        fallback_request, 
                        ModelSelectionStrategy.AUTO  # Don't use fallback again to avoid loops
                    )
            
            # If no fallback or fallback failed, raise the original error
            raise RuntimeError(f"Inference failed: {str(e)}")
    
    async def run_parallel_inference(
        self,
        request: InferenceRequest,
        model_ids: List[str]
    ) -> List[InferenceResponse]:
        """
        Run inference in parallel using multiple models.
        
        Args:
            request: Base inference request
            model_ids: List of model IDs to use
            
        Returns:
            List of inference responses
        """
        # Create a request for each model
        requests = [
            InferenceRequest(
                model_id=model_id,
                inputs=request.inputs,
                parameters=request.parameters
            )
            for model_id in model_ids
        ]
        
        # Run inference in parallel
        tasks = [
            self.run_inference(req, ModelSelectionStrategy.AUTO)
            for req in requests
        ]
        
        # Gather results
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle exceptions
        results = []
        for i, response in enumerate(responses):
            if isinstance(response, Exception):
                logger.error(f"Error in parallel inference for model {model_ids[i]}: {str(response)}")
                # Create error response
                results.append(InferenceResponse(
                    model_id=model_ids[i],
                    outputs="Error during inference",
                    metadata={"error": str(response)}
                ))
            else:
                results.append(response)
        
        return results
    
    async def run_ensemble_inference(
        self,
        request: InferenceRequest,
        task_type: Optional[str] = None
    ) -> InferenceResponse:
        """
        Run ensemble inference using multiple models and aggregate results.
        
        Args:
            request: Inference request
            task_type: Optional task type (inferred if not provided)
            
        Returns:
            Aggregated inference response
            
        Raises:
            ValueError: If no suitable models are found
            RuntimeError: If inference fails
        """
        # Infer task type if not provided
        if not task_type:
            task_type = self._infer_task_type(request)
        
        # Select models for ensemble
        model_ids = await self.select_models(
            task_type,
            ModelSelectionStrategy.ENSEMBLE
        )
        
        if not model_ids:
            raise ValueError(f"No suitable models found for task type {task_type}")
        
        # Run parallel inference
        responses = await self.run_parallel_inference(request, model_ids)
        
        # Aggregate results
        aggregated_response = await self._aggregate_responses(responses, task_type)
        
        return aggregated_response
    
    async def _aggregate_responses(
        self,
        responses: List[InferenceResponse],
        task_type: str
    ) -> InferenceResponse:
        """
        Aggregate multiple responses into a single response.
        
        Args:
            responses: List of inference responses
            task_type: Type of task
            
        Returns:
            Aggregated inference response
        """
        # Filter out error responses
        valid_responses = [
            r for r in responses 
            if not (isinstance(r.outputs, str) and r.outputs.startswith("Error"))
        ]
        
        if not valid_responses:
            raise RuntimeError("All models failed to produce valid responses")
        
        # Different aggregation strategies based on task type
        if task_type in ['text-generation', 'chat', 'completion']:
            # For text generation, use the response with highest confidence
            # In a real system, you'd have more sophisticated aggregation
            best_response = max(
                valid_responses,
                key=lambda r: r.metadata.get("confidence", 0) 
                if isinstance(r.metadata, dict) else 0
            )
            
            return best_response
            
        elif task_type in ['image-classification', 'audio-classification']:
            # For classification, use voting
            if all(isinstance(r.outputs, list) for r in valid_responses):
                # Count votes for each class
                class_votes = {}
                for response in valid_responses:
                    for item in response.outputs:
                        if isinstance(item, dict) and "class" in item and "confidence" in item:
                            cls = item["class"]
                            conf = item["confidence"]
                            if cls not in class_votes:
                                class_votes[cls] = 0
                            class_votes[cls] += conf
                
                # Sort by votes
                sorted_classes = sorted(
                    class_votes.items(),
                    key=lambda x: x[1],
                    reverse=True
                )
                
                # Create aggregated output
                aggregated_output = [
                    {"class": cls, "confidence": votes / len(valid_responses)}
                    for cls, votes in sorted_classes[:5]  # Top 5 classes
                ]
                
                # Create response
                return InferenceResponse(
                    model_id="ensemble",
                    outputs=aggregated_output,
                    metadata={
                        "ensemble_size": len(valid_responses),
                        "aggregation_method": "weighted_voting"
                    }
                )
            else:
                # If outputs are not in expected format, use the first valid response
                return valid_responses[0]
                
        else:
            # For other task types, use the first valid response
            # In a real system, you'd have specific aggregation strategies for each task type
            return valid_responses[0]
    
    def _infer_task_type(self, request: InferenceRequest) -> str:
        """
        Infer the task type from the request.
        
        Args:
            request: Inference request
            
        Returns:
            Inferred task type
        """
        model_id = request.model_id.lower()
        
        # Infer from model ID
        if "llama" in model_id or "gpt" in model_id or "llm" in model_id:
            return "text-generation"
        elif "whisper" in model_id or "speech" in model_id or "audio" in model_id:
            return "speech-to-text"
        elif "yolo" in model_id or "detection" in model_id:
            return "object-detection"
        elif "classification" in model_id:
            # Check input type to distinguish between image and audio classification
            if isinstance(request.inputs, dict) and "image" in request.inputs:
                return "image-classification"
            elif isinstance(request.inputs, dict) and "audio" in request.inputs:
                return "audio-classification"
            else:
                return "classification"
        elif "ocr" in model_id or "tesseract" in model_id:
            return "ocr"
        elif "tts" in model_id or "text-to-speech" in model_id:
            return "text-to-speech"
        else:
            # Default to text generation
            return "text-generation"


# Create a singleton instance
_model_orchestrator: Optional[ModelOrchestrator] = None

def get_model_orchestrator(
    model_manager: ModelManager = get_model_manager()
) -> ModelOrchestrator:
    """
    Get or create the model orchestrator instance.
    
    Args:
        model_manager: Model manager instance
        
    Returns:
        ModelOrchestrator instance
    """
    global _model_orchestrator
    
    if _model_orchestrator is None:
        _model_orchestrator = ModelOrchestrator(model_manager)
        
    return _model_orchestrator
