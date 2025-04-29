"""
Model loader module for AI Orchestrator.

This module provides functionality for loading different types of AI models:
- LLM models (llama.cpp, ONNX)
- Vision models (YOLO, Tesseract OCR)
- Audio models (Whisper)
- Multimodal models
"""
import os
import logging
from typing import Dict, Any, Optional, Union, Tuple
from enum import Enum
import asyncio
from pathlib import Path

import numpy as np
import torch

from ..models.model import ModelType
from ..core.config import settings
from ..core.llm_integration import get_llm_integration
from ..core.vision_integration import get_vision_integration # Import Vision integration
from ..core.audio_integration import get_audio_integration # Import Audio integration

logger = logging.getLogger(__name__)

class ModelLoader:
    """
    Model loader for different types of AI models.
    """
    def __init__(self):
        """Initialize the model loader."""
        self.model_dir = Path(settings.MODEL_DIR)
        self.model_dir.mkdir(exist_ok=True)
        self.use_gpu = settings.USE_GPU and torch.cuda.is_available()
        self.loaded_models: Dict[str, Any] = {}
        self.model_locks: Dict[str, asyncio.Lock] = {}
        self.llm_integration = get_llm_integration()
        self.vision_integration = get_vision_integration() # Get Vision integration instance
        self.audio_integration = get_audio_integration() # Get Audio integration instance
        
        # Log GPU availability
        if self.use_gpu:
            gpu_info = f"GPU available: {torch.cuda.get_device_name(0)}"
            if settings.GPU_MEMORY_LIMIT:
                gpu_info += f", Memory limit: {settings.GPU_MEMORY_LIMIT} MB"
            logger.info(gpu_info)
        else:
            if settings.USE_GPU:
                logger.warning("GPU requested but not available, falling back to CPU")
            else:
                logger.info("Running in CPU mode")
    
    async def load_model(self, model_id: str, model_config: Dict[str, Any]) -> Tuple[Any, Dict[str, Any]]:
        """
        Load a model based on its type.
        
        Args:
            model_id: ID of the model
            model_config: Model configuration
            
        Returns:
            Tuple of (model, metadata)
            
        Raises:
            ValueError: If model type is not supported
            RuntimeError: If loading fails
        """
        model_type = model_config.get("type", "").lower()
        model_path = model_config.get("path", "")
        
        # Create lock for this model if it doesn't exist
        if model_id not in self.model_locks:
            self.model_locks[model_id] = asyncio.Lock()
        
        # Acquire lock for this model
        async with self.model_locks[model_id]:
            # Check if already loaded
            if model_id in self.loaded_models:
                logger.info(f"Model {model_id} already loaded")
                # Return the stored model instance and its metadata
                # Assuming metadata was stored during initial load
                # This part needs refinement: metadata should ideally be part of the loaded model object or stored alongside
                # For now, return the model and a simple status
                return self.loaded_models[model_id], {"status": "already_loaded"}
            
            # Determine full model path
            full_path = self.model_dir / model_path
            if not os.path.exists(full_path):
                # Check if path is absolute
                if not os.path.isabs(model_path) or not os.path.exists(model_path):
                     raise FileNotFoundError(f"Model file not found: {full_path} or {model_path}")
                else:
                    full_path = Path(model_path)
            
            logger.info(f"Loading model {model_id} from {full_path}")
            
            # Load model based on type
            try:
                if "llama.cpp" in model_type or "ggml" in model_type:
                    model, metadata = await self.llm_integration.load_llama_model(model_id, full_path, model_config)
                elif "onnx" in model_type:
                    # Check if it's an LLM ONNX model based on config or naming convention
                    # For now, assume all ONNX models are handled by llm_integration
                    model, metadata = await self.llm_integration.load_onnx_model(model_id, full_path, model_config)
                elif "whisper" in model_type:
                    model, metadata = await self.audio_integration.load_whisper_model(model_id, full_path, model_config)
                elif "yolo" in model_type:
                    model, metadata = await self.vision_integration.load_yolo_model(model_id, full_path, model_config)
                elif "tesseract" in model_type:
                    model, metadata = await self.vision_integration.load_tesseract_model(model_id, full_path, model_config)
                else:
                    # Default to placeholder for now
                    logger.warning(f"Model type {model_type} not fully implemented, using placeholder")
                    model = {"model_id": model_id, "placeholder": True, "type": model_type}
                    metadata = {"status": "placeholder", "warning": "Model type not fully implemented"}
                
                # Store loaded model
                self.loaded_models[model_id] = model
                
                logger.info(f"Model {model_id} loaded successfully")
                return model, metadata
                
            except Exception as e:
                logger.error(f"Error loading model {model_id}: {str(e)}")
                raise RuntimeError(f"Failed to load model {model_id}: {str(e)}")
    
    async def unload_model(self, model_id: str) -> Dict[str, Any]:
        """
        Unload a model from memory.
        
        Args:
            model_id: ID of the model
            
        Returns:
            Metadata about the unloading process
            
        Raises:
            ValueError: If model not found
        """
        if model_id not in self.model_locks:
            self.model_locks[model_id] = asyncio.Lock()
        
        # Acquire lock for this model
        async with self.model_locks[model_id]:
            # Check if model is loaded
            if model_id not in self.loaded_models:
                logger.info(f"Model {model_id} not loaded")
                return {"status": "not_loaded"}
            
            logger.info(f"Unloading model {model_id}")
            
            try:
                # Get the model
                model = self.loaded_models[model_id]
                model_type = model.get("type", "").lower()
                
                # Unload based on model type
                if "llama.cpp" in model_type or "onnx" in model_type:
                    metadata = await self.llm_integration.unload_llm_model(model_id, model)
                elif "whisper" in model_type:
                    metadata = await self.audio_integration.unload_audio_model(model_id, model)
                elif "yolo" in model_type or "tesseract" in model_type:
                    metadata = await self.vision_integration.unload_vision_model(model_id, model)
                else:
                    logger.warning(f"Unload not fully implemented for model type {model_type}")
                    metadata = {"status": "unloaded", "warning": "Unload not fully implemented"}
                
                # Remove from loaded models
                del self.loaded_models[model_id]
                
                logger.info(f"Model {model_id} unloaded successfully")
                return metadata
                
            except Exception as e:
                logger.error(f"Error unloading model {model_id}: {str(e)}")
                raise RuntimeError(f"Failed to unload model {model_id}: {str(e)}")


# Singleton instance
_model_loader = None

def get_model_loader() -> ModelLoader:
    """
    Get or create the model loader instance.
    
    Returns:
        ModelLoader instance
    """
    global _model_loader
    if _model_loader is None:
        _model_loader = ModelLoader()
    return _model_loader
