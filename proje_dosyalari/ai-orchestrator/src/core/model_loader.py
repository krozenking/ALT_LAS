"""
Model loader module for AI Orchestrator.

This module provides functionality for loading different types of AI models:
- LLM models (llama.cpp, ONNX)
- Vision models (YOLO, Tesseract OCR)
- Audio models (Whisper)
- Multimodal models

It also includes GPU warmup and memory management features to optimize
model loading and inference performance.
"""
import os
import logging
import time
from typing import Dict, Any, Optional, Union, Tuple, List
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
from ..core.gpu_warmup import get_gpu_warmup_manager # Import GPU warmup manager
from ..core.gpu_memory_pool import get_gpu_memory_pool # Import GPU memory pool

logger = logging.getLogger(__name__)

class ModelLoader:
    """
    Model loader for different types of AI models.

    Features:
    - Loading and unloading of different model types
    - GPU warmup and memory management
    - Efficient model caching and preloading
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

        # GPU warmup and memory management
        self.gpu_warmup_manager = get_gpu_warmup_manager()
        self.gpu_memory_pool = get_gpu_memory_pool()

        # Model loading performance metrics
        self.loading_times: Dict[str, List[float]] = {}
        self.memory_usage: Dict[str, int] = {}

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

    async def initialize(self) -> bool:
        """
        Initialize the model loader with GPU warmup and memory management.

        Returns:
            True if initialization was successful, False otherwise
        """
        try:
            logger.info("Initializing model loader with GPU optimizations")

            if self.use_gpu:
                # Initialize GPU warmup manager
                await self.gpu_warmup_manager.initialize()

                # Initialize GPU memory pool
                await self.gpu_memory_pool.initialize()

                # Warm up GPU
                await self.gpu_warmup_manager.warmup_gpu()

                logger.info("GPU warmup and memory management initialized successfully")

            return True
        except Exception as e:
            logger.error(f"Error initializing model loader: {str(e)}")
            return False

    async def load_model(self, model_id: str, model_config: Dict[str, Any]) -> Tuple[Any, Dict[str, Any]]:
        """
        Load a model based on its type with GPU optimization.

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

        # Start timing model loading
        start_time = time.time()

        # Acquire lock for this model
        async with self.model_locks[model_id]:
            # Check if already loaded
            if model_id in self.loaded_models:
                logger.info(f"Model {model_id} already loaded")
                # Update usage statistics if using GPU
                if self.use_gpu:
                    memory_usage = self.memory_usage.get(model_id, 0)
                    await self.gpu_warmup_manager.update_model_usage(model_id, memory_usage)

                # Return the stored model instance and its metadata
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

            # Prepare GPU if using GPU
            if self.use_gpu:
                # Ensure GPU is warmed up
                if not self.gpu_warmup_manager.is_warmed_up:
                    await self.gpu_warmup_manager.warmup_gpu()

                # Get estimated memory usage for this model
                estimated_memory = self._estimate_model_memory_usage(model_id, model_type, full_path)
                logger.debug(f"Estimated memory usage for {model_id}: {estimated_memory / (1024**2):.2f} MB")

                # Allocate memory block if using memory pool
                gpu_id = 0  # Default to first GPU for now
                if estimated_memory > 0:
                    # Try to get a memory block from the pool
                    memory_block = await self.gpu_memory_pool.get_block(estimated_memory, gpu_id, model_id)
                    if memory_block:
                        logger.debug(f"Allocated memory block of {memory_block.size / (1024**2):.2f} MB for {model_id}")

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

                # Record loading time
                loading_time = time.time() - start_time
                if model_id not in self.loading_times:
                    self.loading_times[model_id] = []
                self.loading_times[model_id].append(loading_time)

                # Record memory usage
                memory_usage = metadata.get("memory_usage_mb", 0) * 1024 * 1024  # Convert MB to bytes
                self.memory_usage[model_id] = memory_usage

                # Update GPU usage statistics if using GPU
                if self.use_gpu:
                    await self.gpu_warmup_manager.update_model_usage(model_id, memory_usage)

                # Add loading time to metadata
                metadata["loading_time_seconds"] = loading_time
                metadata["gpu_optimized"] = self.use_gpu

                logger.info(f"Model {model_id} loaded successfully in {loading_time:.2f} seconds")
                return model, metadata

            except Exception as e:
                logger.error(f"Error loading model {model_id}: {str(e)}")

                # Release memory block if allocated
                if self.use_gpu:
                    await self.gpu_memory_pool.release_model_blocks(model_id)

                raise RuntimeError(f"Failed to load model {model_id}: {str(e)}")

    def _estimate_model_memory_usage(self, model_id: str, model_type: str, model_path: Path) -> int:
        """
        Estimate memory usage for a model.

        Args:
            model_id: ID of the model
            model_type: Type of the model
            model_path: Path to the model file

        Returns:
            Estimated memory usage in bytes
        """
        # Check if we have historical data for this model
        if model_id in self.memory_usage:
            return self.memory_usage[model_id]

        # Estimate based on file size and model type
        try:
            if os.path.isfile(model_path):
                file_size = os.path.getsize(model_path)
            elif os.path.isdir(model_path):
                # Sum up sizes of all files in directory
                file_size = sum(os.path.getsize(os.path.join(model_path, f)) for f in os.listdir(model_path)
                               if os.path.isfile(os.path.join(model_path, f)))
            else:
                return 0

            # Apply multiplier based on model type
            if "llama.cpp" in model_type or "ggml" in model_type:
                # GGML models are quantized, so they use less memory than their file size
                return int(file_size * 1.2)  # 1.2x file size
            elif "onnx" in model_type:
                return int(file_size * 1.5)  # 1.5x file size
            elif "whisper" in model_type:
                return int(file_size * 1.3)  # 1.3x file size
            elif "yolo" in model_type:
                return int(file_size * 1.4)  # 1.4x file size
            else:
                return int(file_size * 2.0)  # Default: 2x file size

        except Exception as e:
            logger.warning(f"Error estimating memory usage for {model_id}: {str(e)}")
            # Default estimate: 1GB
            return 1024 * 1024 * 1024

    async def unload_model(self, model_id: str) -> Dict[str, Any]:
        """
        Unload a model from memory with GPU optimization.

        Args:
            model_id: ID of the model

        Returns:
            Metadata about the unloading process

        Raises:
            ValueError: If model not found
        """
        if model_id not in self.model_locks:
            self.model_locks[model_id] = asyncio.Lock()

        # Start timing model unloading
        start_time = time.time()

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

                # Release GPU memory if using GPU
                if self.use_gpu:
                    await self.gpu_memory_pool.release_model_blocks(model_id)

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

                # Record unloading time
                unloading_time = time.time() - start_time

                # Add unloading time to metadata
                metadata["unloading_time_seconds"] = unloading_time

                logger.info(f"Model {model_id} unloaded successfully in {unloading_time:.2f} seconds")
                return metadata

            except Exception as e:
                logger.error(f"Error unloading model {model_id}: {str(e)}")

                # Try to release GPU memory even if unloading failed
                if self.use_gpu:
                    try:
                        await self.gpu_memory_pool.release_model_blocks(model_id)
                    except Exception as e2:
                        logger.error(f"Error releasing GPU memory for {model_id}: {str(e2)}")

                raise RuntimeError(f"Failed to unload model {model_id}: {str(e)}")

    async def get_model_loading_stats(self) -> Dict[str, Any]:
        """
        Get statistics about model loading times and memory usage.

        Returns:
            Dictionary with loading statistics
        """
        stats = {
            "models": {},
            "gpu": {
                "enabled": self.use_gpu,
                "warmup_status": self.gpu_warmup_manager.is_warmed_up if self.use_gpu else False
            }
        }

        # Add stats for each model
        for model_id, times in self.loading_times.items():
            if not times:
                continue

            avg_time = sum(times) / len(times)
            min_time = min(times)
            max_time = max(times)

            stats["models"][model_id] = {
                "loading_times": {
                    "average_seconds": avg_time,
                    "min_seconds": min_time,
                    "max_seconds": max_time,
                    "samples": len(times)
                },
                "memory_usage_bytes": self.memory_usage.get(model_id, 0),
                "loaded": model_id in self.loaded_models
            }

        # Add GPU memory info if using GPU
        if self.use_gpu:
            stats["gpu"]["memory_info"] = self.gpu_memory_pool.get_memory_info()

        return stats

    async def preload_models(self, model_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Preload models to optimize startup time.

        Args:
            model_ids: List of model IDs to preload, or None to use configured preload_models

        Returns:
            Dictionary with preloading results
        """
        if model_ids is None:
            # Use configured preload models
            from ..config.settings import config
            model_ids = config["models"].get("preload_models", [])

        if not model_ids:
            logger.info("No models to preload")
            return {"status": "no_models", "preloaded": []}

        logger.info(f"Preloading {len(model_ids)} models: {', '.join(model_ids)}")

        results = {
            "status": "completed",
            "preloaded": [],
            "failed": []
        }

        # Preload models in parallel
        preload_tasks = []
        for model_id in model_ids:
            # Get model config from registry
            # This is a placeholder - in a real implementation we would get the config from a registry
            model_config = {
                "type": "llama.cpp",  # Placeholder
                "path": f"{model_id}.bin"  # Placeholder
            }

            # Create preload task
            task = asyncio.create_task(self._preload_model(model_id, model_config))
            preload_tasks.append((model_id, task))

        # Wait for all tasks to complete
        for model_id, task in preload_tasks:
            try:
                success = await task
                if success:
                    results["preloaded"].append(model_id)
                else:
                    results["failed"].append(model_id)
            except Exception as e:
                logger.error(f"Error preloading model {model_id}: {str(e)}")
                results["failed"].append(model_id)

        if results["failed"]:
            results["status"] = "partial"
            logger.warning(f"Failed to preload {len(results['failed'])} models: {', '.join(results['failed'])}")

        logger.info(f"Preloaded {len(results['preloaded'])} models successfully")
        return results

    async def _preload_model(self, model_id: str, model_config: Dict[str, Any]) -> bool:
        """
        Preload a single model.

        Args:
            model_id: ID of the model
            model_config: Model configuration

        Returns:
            True if preloading was successful, False otherwise
        """
        try:
            logger.info(f"Preloading model {model_id}")

            # Load the model
            model, metadata = await self.load_model(model_id, model_config)

            logger.info(f"Model {model_id} preloaded successfully")
            return True
        except Exception as e:
            logger.error(f"Error preloading model {model_id}: {str(e)}")
            return False


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
