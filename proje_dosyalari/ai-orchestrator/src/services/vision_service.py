"""
Computer Vision service for AI Orchestrator.

This service is responsible for managing vision models and running inference.
"""
import logging
import asyncio
from typing import Dict, List, Any, Optional, Union

from ..models.inference import InferenceRequest, InferenceResponse
from ..models.model import ModelType
from ..services.model_manager import ModelManager, get_model_manager
from ..core.vision_integration import VisionIntegration, get_vision_integration
from ..core.model_cache import ModelCache, get_model_cache

logger = logging.getLogger(__name__)

class VisionService:
    """
    Service for managing vision models and running inference.
    """
    def __init__(self, model_manager: ModelManager, vision_integration: VisionIntegration, model_cache: ModelCache):
        """Initialize the Vision service."""
        self.model_manager = model_manager
        self.vision_integration = vision_integration
        self.model_cache = model_cache
        
    async def run_vision_inference(self, request: InferenceRequest) -> InferenceResponse:
        """
        Run inference with a vision model.
        
        Args:
            request: Inference request (inputs should contain image path or data)
            
        Returns:
            Inference response
            
        Raises:
            ValueError: If model not found or not a vision model
            RuntimeError: If inference fails
        """
        model_id = request.model_id
        
        # Check cache first
        cached_response = await self.model_cache.get(model_id, request.inputs, request.parameters)
        if cached_response:
            logger.info(f"Returning cached response for vision model {model_id}")
            return InferenceResponse(**cached_response)
        
        # Get model info
        model_info = await self.model_manager.get_model(model_id)
        if not model_info:
            raise ValueError(f"Model {model_id} not found")
            
        # Check if model is a vision model
        if model_info.type != ModelType.VISION:
            raise ValueError(f"Model {model_id} is not a vision model")
            
        # Check if model is loaded, load if necessary
        if not model_info.status or not model_info.status.loaded:
            logger.info(f"Vision model {model_id} not loaded, loading now")
            await self.model_manager.load_model(model_id)
            
        # Get loaded model instance
        model = self.model_manager.loaded_models.get(model_id)
        if not model:
            raise RuntimeError(f"Failed to get loaded model instance for {model_id}")
            
        # Extract image path/data from inputs
        # Assuming inputs is a dict with "image_path" or "image_data"
        image_input = None
        if isinstance(request.inputs, dict):
            image_input = request.inputs.get("image_path") or request.inputs.get("image_data")
        elif isinstance(request.inputs, str):
            # Assume it's a path if it's a string
            image_input = request.inputs
            
        if not image_input:
             raise ValueError("Missing image_path or image_data in vision inference request inputs")

        # TODO: Handle image_data (e.g., base64 encoded) by saving to a temp file
        if not isinstance(image_input, str):
            raise ValueError("Currently only image_path is supported for vision inference")
        image_path = image_input

        # Run inference based on model type
        try:
            if model.get("type") == "yolo":
                # Run YOLO inference
                result = await self.vision_integration.run_yolo_inference(
                    model=model,
                    image_path=image_path,
                    params=request.parameters
                )
                
                # Create response
                response = InferenceResponse(
                    model_id=model_id,
                    outputs=result, # YOLO output is already a dict
                    metadata={
                        "model_version": model_info.version,
                        "cached": False
                    }
                )
                
            elif model.get("type") == "tesseract":
                # Run Tesseract inference
                result = await self.vision_integration.run_tesseract_inference(
                    model=model,
                    image_path=image_path,
                    params=request.parameters
                )
                
                # Create response
                response = InferenceResponse(
                    model_id=model_id,
                    outputs=result.get("text", ""), # Tesseract output is text
                    metadata={
                        "language": result.get("language", ""),
                        "model_version": model_info.version,
                        "cached": False
                    }
                )
                
            else:
                raise ValueError(f"Unsupported vision model type: {model.get("type")}")
                
            # Store result in cache
            await self.model_cache.set(model_id, request.inputs, request.parameters, response.dict())
            
            return response
            
        except Exception as e:
            logger.error(f"Error running vision inference with model {model_id}: {str(e)}")
            raise RuntimeError(f"Failed to run vision inference: {str(e)}")


def get_vision_service(
    model_manager: ModelManager = get_model_manager(),
    vision_integration: VisionIntegration = get_vision_integration(),
    model_cache: ModelCache = get_model_cache()
) -> VisionService:
    """
    Factory function to create a Vision service instance.
    
    Args:
        model_manager: Model manager instance
        vision_integration: Vision integration instance
        model_cache: Model cache instance
        
    Returns:
        VisionService instance
    """
    return VisionService(model_manager, vision_integration, model_cache)
