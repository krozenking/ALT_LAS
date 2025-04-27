"""
Model manager service for AI Orchestrator.

This service is responsible for managing AI models, including:
- Loading and unloading models
- Model versioning
- Model caching
- Model status tracking
"""
import os
import logging
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
from functools import lru_cache

from ..models.model import ModelInfo, ModelStatus, ModelType
from ..core.config import settings

logger = logging.getLogger(__name__)

class ModelManager:
    """
    Model manager service for handling AI models.
    """
    def __init__(self):
        """Initialize the model manager."""
        self.models: Dict[str, ModelInfo] = {}
        self.loaded_models: Dict[str, Any] = {}
        self.model_statuses: Dict[str, ModelStatus] = {}
        self.model_locks: Dict[str, asyncio.Lock] = {}
        self.load_model_configs()
        
    def load_model_configs(self):
        """Load model configurations from settings."""
        logger.info("Loading model configurations")
        for model_id, config in settings.MODEL_CONFIGS.items():
            model_type = self._get_model_type(config.get("type", ""))
            
            # Create model info
            model_info = ModelInfo(
                model_id=model_id,
                name=config.get("name", model_id),
                type=model_type,
                description=config.get("description", ""),
                version=config.get("version", "1.0"),
                size=config.get("size"),
                parameters=config.get("parameters"),
                context_length=config.get("context_length"),
                quantization=config.get("quantization"),
                supports_gpu=config.get("supports_gpu", True),
                supports_cpu=config.get("supports_cpu", True),
                tags=config.get("tags", []),
                metadata=config.get("metadata", {})
            )
            
            # Create model status
            model_status = ModelStatus(
                model_id=model_id,
                loaded=False,
                status="not_loaded",
                instances=0
            )
            
            # Store model info and status
            self.models[model_id] = model_info
            self.model_statuses[model_id] = model_status
            self.model_locks[model_id] = asyncio.Lock()
            
        logger.info(f"Loaded {len(self.models)} model configurations")
    
    def _get_model_type(self, type_str: str) -> ModelType:
        """Convert string type to ModelType enum."""
        type_map = {
            "llama.cpp": ModelType.LLM,
            "onnx": ModelType.LLM,
            "whisper": ModelType.AUDIO,
            "yolo": ModelType.VISION,
            "tesseract": ModelType.VISION,
            "llm": ModelType.LLM,
            "vision": ModelType.VISION,
            "audio": ModelType.AUDIO,
            "multimodal": ModelType.MULTIMODAL
        }
        return type_map.get(type_str, ModelType.LLM)
    
    async def list_models(self, type_filter: Optional[str] = None) -> List[ModelInfo]:
        """
        List all available models.
        
        Args:
            type_filter: Optional filter by model type
            
        Returns:
            List of model info objects
        """
        result = []
        for model_id, model_info in self.models.items():
            # Apply type filter if specified
            if type_filter and model_info.type.value != type_filter:
                continue
                
            # Update model info with current status
            updated_info = model_info.copy()
            updated_info.status = self.model_statuses.get(model_id)
            result.append(updated_info)
            
        return result
    
    async def get_model(self, model_id: str) -> Optional[ModelInfo]:
        """
        Get information about a specific model.
        
        Args:
            model_id: ID of the model
            
        Returns:
            Model info object or None if not found
        """
        if model_id not in self.models:
            return None
            
        model_info = self.models[model_id].copy()
        model_info.status = self.model_statuses.get(model_id)
        return model_info
    
    async def get_model_status(self, model_id: str) -> Optional[ModelStatus]:
        """
        Get the current status of a model.
        
        Args:
            model_id: ID of the model
            
        Returns:
            Model status object or None if not found
        """
        return self.model_statuses.get(model_id)
    
    async def load_model(self, model_id: str) -> ModelStatus:
        """
        Load a model into memory.
        
        Args:
            model_id: ID of the model
            
        Returns:
            Updated model status
        
        Raises:
            ValueError: If model not found
            RuntimeError: If loading fails
        """
        if model_id not in self.models:
            raise ValueError(f"Model {model_id} not found")
            
        # Acquire lock for this model
        async with self.model_locks[model_id]:
            # Check if already loaded
            if self.model_statuses[model_id].loaded:
                logger.info(f"Model {model_id} already loaded")
                return self.model_statuses[model_id]
                
            # Update status to loading
            self.model_statuses[model_id].status = "loading"
            
            try:
                # TODO: Implement actual model loading based on model type
                # This is a placeholder for the actual implementation
                logger.info(f"Loading model {model_id}")
                
                # Simulate loading delay
                await asyncio.sleep(1)
                
                # Update status
                self.model_statuses[model_id].loaded = True
                self.model_statuses[model_id].status = "ready"
                self.model_statuses[model_id].instances = 1
                self.model_statuses[model_id].last_used = datetime.now().isoformat()
                self.model_statuses[model_id].uptime = 0
                
                # TODO: Measure actual memory usage
                self.model_statuses[model_id].memory_usage = 1024  # Placeholder
                
                logger.info(f"Model {model_id} loaded successfully")
                return self.model_statuses[model_id]
                
            except Exception as e:
                logger.error(f"Error loading model {model_id}: {str(e)}")
                self.model_statuses[model_id].status = "error"
                self.model_statuses[model_id].error = str(e)
                raise RuntimeError(f"Failed to load model {model_id}: {str(e)}")
    
    async def unload_model(self, model_id: str) -> ModelStatus:
        """
        Unload a model from memory.
        
        Args:
            model_id: ID of the model
            
        Returns:
            Updated model status
        
        Raises:
            ValueError: If model not found
            RuntimeError: If unloading fails
        """
        if model_id not in self.models:
            raise ValueError(f"Model {model_id} not found")
            
        # Acquire lock for this model
        async with self.model_locks[model_id]:
            # Check if already unloaded
            if not self.model_statuses[model_id].loaded:
                logger.info(f"Model {model_id} already unloaded")
                return self.model_statuses[model_id]
                
            # Update status to unloading
            self.model_statuses[model_id].status = "unloading"
            
            try:
                # TODO: Implement actual model unloading
                # This is a placeholder for the actual implementation
                logger.info(f"Unloading model {model_id}")
                
                # Simulate unloading delay
                await asyncio.sleep(0.5)
                
                # Update status
                self.model_statuses[model_id].loaded = False
                self.model_statuses[model_id].status = "not_loaded"
                self.model_statuses[model_id].instances = 0
                self.model_statuses[model_id].memory_usage = None
                self.model_statuses[model_id].gpu_usage = None
                self.model_statuses[model_id].uptime = None
                
                logger.info(f"Model {model_id} unloaded successfully")
                return self.model_statuses[model_id]
                
            except Exception as e:
                logger.error(f"Error unloading model {model_id}: {str(e)}")
                self.model_statuses[model_id].status = "error"
                self.model_statuses[model_id].error = str(e)
                raise RuntimeError(f"Failed to unload model {model_id}: {str(e)}")


@lru_cache()
def get_model_manager() -> ModelManager:
    """
    Factory function to get or create a model manager instance.
    
    Returns:
        ModelManager instance
    """
    return ModelManager()
