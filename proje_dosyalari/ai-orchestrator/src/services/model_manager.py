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
import time
from typing import Dict, List, Optional, Any
from datetime import datetime
from functools import lru_cache

from ..models.model import ModelInfo, ModelStatus, ModelType
from ..core.config import settings
from ..core.model_loader import ModelLoader, get_model_loader
from ..core.model_registry import ModelRegistry, get_model_registry
from ..core.performance_monitor import PerformanceMonitor, get_performance_monitor # Import PerformanceMonitor

logger = logging.getLogger(__name__)

class ModelManager:
    """
    Model manager service for handling AI models.
    """
    def __init__(self, model_loader: ModelLoader, model_registry: ModelRegistry, performance_monitor: PerformanceMonitor):
        """Initialize the model manager."""
        self.model_loader = model_loader
        self.model_registry = model_registry
        self.performance_monitor = performance_monitor # Inject PerformanceMonitor
        self.loaded_models: Dict[str, Any] = {}
        self.model_statuses: Dict[str, ModelStatus] = {}
        self.model_locks: Dict[str, asyncio.Lock] = {}
        asyncio.create_task(self.initialize_models()) # Initialize models asynchronously
        
    async def initialize_models(self):
        """Load model configurations from registry and initialize statuses."""
        logger.info("Initializing models from registry")
        models = await self.model_registry.list_models()
        for model_info in models:
            model_id = model_info.model_id
            # Create model status
            self.model_statuses[model_id] = ModelStatus(
                model_id=model_id,
                loaded=False,
                status="not_loaded",
                instances=0
            )
            # Create lock
            self.model_locks[model_id] = asyncio.Lock()
            
        logger.info(f"Initialized {len(models)} models")
    
    async def list_models(self, type_filter: Optional[str] = None) -> List[ModelInfo]:
        """
        List all available models from the registry.
        
        Args:
            type_filter: Optional filter by model type
            
        Returns:
            List of model info objects
        """
        models = await self.model_registry.list_models(type_filter=type_filter)
        
        # Update model info with current status
        for model_info in models:
            model_info.status = self.model_statuses.get(model_info.model_id)
            
        return models
    
    async def get_model(self, model_id: str) -> Optional[ModelInfo]:
        """
        Get information about a specific model from the registry.
        
        Args:
            model_id: ID of the model
            
        Returns:
            Model info object or None if not found
        """
        model_info = await self.model_registry.get_model_info(model_id)
        if not model_info:
            return None
            
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
        # Ensure status is initialized
        if model_id not in self.model_statuses:
            # Check registry if model exists
            model_info = await self.model_registry.get_model_info(model_id)
            if model_info:
                self.model_statuses[model_id] = ModelStatus(
                    model_id=model_id,
                    loaded=False,
                    status="not_loaded",
                    instances=0
                )
                self.model_locks[model_id] = asyncio.Lock()
            else:
                return None
                
        return self.model_statuses.get(model_id)
    
    async def load_model(self, model_id: str) -> ModelStatus:
        """
        Load a model into memory using the ModelLoader.
        
        Args:
            model_id: ID of the model
            
        Returns:
            Updated model status
        
        Raises:
            ValueError: If model not found
            RuntimeError: If loading fails
        """
        start_time = time.time()
        model_info = await self.model_registry.get_model_info(model_id)
        if not model_info:
            raise ValueError(f"Model {model_id} not found in registry")
            
        # Ensure status and lock exist
        if model_id not in self.model_statuses:
            self.model_statuses[model_id] = ModelStatus(model_id=model_id, loaded=False, status="not_loaded", instances=0)
            self.model_locks[model_id] = asyncio.Lock()
            
        # Acquire lock for this model
        async with self.model_locks[model_id]:
            # Check if already loaded
            if self.model_statuses[model_id].loaded:
                logger.info(f"Model {model_id} already loaded")
                return self.model_statuses[model_id]
                
            # Update status to loading
            self.model_statuses[model_id].status = "loading"
            
            try:
                # Get model config from registry (using metadata)
                active_version = await self.model_registry.get_active_version(model_id)
                if not active_version:
                    raise RuntimeError(f"No active version found for model {model_id}")
                
                versions = await self.model_registry.get_model_versions(model_id)
                version_data = versions.get(active_version, {})
                model_path = version_data.get("path")
                if not model_path:
                    raise RuntimeError(f"Path not found for active version {active_version} of model {model_id}")
                
                # Create config dict for loader
                model_config = {
                    "type": model_info.type.value,
                    "path": model_path,
                    "context_length": model_info.context_length,
                    "max_tokens": model_info.metadata.get("max_tokens"),
                    "language": model_info.metadata.get("language"),
                    "confidence": model_info.metadata.get("confidence")
                }
                
                # Load model using ModelLoader
                model, metadata = await self.model_loader.load_model(model_id, model_config)
                
                # Store loaded model instance
                self.loaded_models[model_id] = model
                
                # Update status
                self.model_statuses[model_id].loaded = True
                self.model_statuses[model_id].status = "ready"
                self.model_statuses[model_id].instances = 1
                self.model_statuses[model_id].last_used = datetime.now().isoformat()
                self.model_statuses[model_id].uptime = 0 # Reset uptime on load
                
                memory_usage_mb = metadata.get("memory_usage_mb", 1024) # Placeholder
                self.model_statuses[model_id].memory_usage = memory_usage_mb
                
                # Record performance stats
                load_time_ms = (time.time() - start_time) * 1000
                await self.performance_monitor.record_inference_stats(
                    model_id=model_id,
                    latency_ms=load_time_ms, # Record load time as a stat
                    memory_usage=memory_usage_mb * 1024 * 1024, # Convert MB to bytes
                    success=True
                )
                
                logger.info(f"Model {model_id} (version {active_version}) loaded successfully in {load_time_ms:.2f} ms")
                return self.model_statuses[model_id]
                
            except Exception as e:
                logger.error(f"Error loading model {model_id}: {str(e)}")
                self.model_statuses[model_id].status = "error"
                self.model_statuses[model_id].error = str(e)
                # Remove from loaded models if loading failed
                if model_id in self.loaded_models:
                    del self.loaded_models[model_id]
                
                # Record failure
                load_time_ms = (time.time() - start_time) * 1000
                await self.performance_monitor.record_inference_stats(
                    model_id=model_id,
                    latency_ms=load_time_ms,
                    success=False
                )
                raise RuntimeError(f"Failed to load model {model_id}: {str(e)}")
    
    async def unload_model(self, model_id: str) -> ModelStatus:
        """
        Unload a model from memory using the ModelLoader.
        
        Args:
            model_id: ID of the model
            
        Returns:
            Updated model status
        
        Raises:
            ValueError: If model not found
            RuntimeError: If unloading fails
        """
        model_info = await self.model_registry.get_model_info(model_id)
        if not model_info:
            raise ValueError(f"Model {model_id} not found in registry")
            
        # Ensure status and lock exist
        if model_id not in self.model_statuses:
            self.model_statuses[model_id] = ModelStatus(model_id=model_id, loaded=False, status="not_loaded", instances=0)
            self.model_locks[model_id] = asyncio.Lock()
            
        # Acquire lock for this model
        async with self.model_locks[model_id]:
            # Check if already unloaded
            if not self.model_statuses[model_id].loaded:
                logger.info(f"Model {model_id} already unloaded")
                return self.model_statuses[model_id]
                
            # Update status to unloading
            self.model_statuses[model_id].status = "unloading"
            
            try:
                # Unload model using ModelLoader
                metadata = await self.model_loader.unload_model(model_id)
                
                # Remove from internal tracking
                if model_id in self.loaded_models:
                    del self.loaded_models[model_id]
                
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
def get_model_manager(
    model_loader: ModelLoader = get_model_loader(),
    model_registry: ModelRegistry = get_model_registry(),
    performance_monitor: PerformanceMonitor = get_performance_monitor() # Inject PerformanceMonitor
) -> ModelManager:
    """
    Factory function to get or create a model manager instance.
    
    Args:
        model_loader: ModelLoader instance
        model_registry: ModelRegistry instance
        performance_monitor: PerformanceMonitor instance
        
    Returns:
        ModelManager instance
    """
    return ModelManager(model_loader, model_registry, performance_monitor)

