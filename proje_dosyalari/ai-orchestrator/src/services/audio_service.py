"""
Audio processing service for AI Orchestrator.

This service is responsible for managing audio models and running inference.
"""
import logging
import asyncio
from typing import Dict, List, Any, Optional, Union

from ..models.inference import InferenceRequest, InferenceResponse
from ..models.model import ModelType
from ..services.model_manager import ModelManager, get_model_manager
from ..core.audio_integration import AudioIntegration, get_audio_integration
from ..core.model_cache import ModelCache, get_model_cache

logger = logging.getLogger(__name__)

class AudioService:
    """
    Service for managing audio models and running inference.
    """
    def __init__(self, model_manager: ModelManager, audio_integration: AudioIntegration, model_cache: ModelCache):
        """Initialize the Audio service."""
        self.model_manager = model_manager
        self.audio_integration = audio_integration
        self.model_cache = model_cache
        
    async def run_audio_inference(self, request: InferenceRequest) -> InferenceResponse:
        """
        Run inference with an audio model.
        
        Args:
            request: Inference request (inputs should contain audio path or data)
            
        Returns:
            Inference response
            
        Raises:
            ValueError: If model not found or not an audio model
            RuntimeError: If inference fails
        """
        model_id = request.model_id
        
        # Check cache first
        cached_response = await self.model_cache.get(model_id, request.inputs, request.parameters)
        if cached_response:
            logger.info(f"Returning cached response for audio model {model_id}")
            return InferenceResponse(**cached_response)
        
        # Get model info
        model_info = await self.model_manager.get_model(model_id)
        if not model_info:
            raise ValueError(f"Model {model_id} not found")
            
        # Check if model is an audio model
        if model_info.type != ModelType.AUDIO:
            raise ValueError(f"Model {model_id} is not an audio model")
            
        # Check if model is loaded, load if necessary
        if not model_info.status or not model_info.status.loaded:
            logger.info(f"Audio model {model_id} not loaded, loading now")
            await self.model_manager.load_model(model_id)
            
        # Get loaded model instance
        model = self.model_manager.loaded_models.get(model_id)
        if not model:
            raise RuntimeError(f"Failed to get loaded model instance for {model_id}")
            
        # Extract audio path/data from inputs
        # Assuming inputs is a dict with "audio_path" or "audio_data"
        audio_input = None
        if isinstance(request.inputs, dict):
            audio_input = request.inputs.get("audio_path") or request.inputs.get("audio_data")
        elif isinstance(request.inputs, str):
            # Assume it's a path if it's a string
            audio_input = request.inputs
            
        if not audio_input:
             raise ValueError("Missing audio_path or audio_data in audio inference request inputs")

        # TODO: Handle audio_data (e.g., base64 encoded) by saving to a temp file
        if not isinstance(audio_input, str):
            raise ValueError("Currently only audio_path is supported for audio inference")
        audio_path = audio_input

        # Run inference based on model type
        try:
            if model.get("type") == "whisper":
                # Run Whisper inference
                result = await self.audio_integration.run_whisper_inference(
                    model=model,
                    audio_path=audio_path,
                    params=request.parameters
                )
                
                # Create response
                response = InferenceResponse(
                    model_id=model_id,
                    outputs=result.get("transcription", ""),
                    metadata={
                        "language": result.get("language", ""),
                        "model_version": model_info.version,
                        "cached": False
                    }
                )
                
            else:
                raise ValueError(f"Unsupported audio model type: {model.get('type')}")
                
            # Store result in cache
            await self.model_cache.set(model_id, request.inputs, request.parameters, response.dict())
            
            return response
            
        except Exception as e:
            logger.error(f"Error running audio inference with model {model_id}: {str(e)}")
            raise RuntimeError(f"Failed to run audio inference: {str(e)}")


def get_audio_service(
    model_manager: ModelManager = get_model_manager(),
    audio_integration: AudioIntegration = get_audio_integration(),
    model_cache: ModelCache = get_model_cache()
) -> AudioService:
    """
    Factory function to create an Audio service instance.
    
    Args:
        model_manager: Model manager instance
        audio_integration: Audio integration instance
        model_cache: Model cache instance
        
    Returns:
        AudioService instance
    """
    return AudioService(model_manager, audio_integration, model_cache)
