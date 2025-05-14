"""
Extended model manager with support for additional model types.

This module extends the base model manager to support the new model types
and adapter system for AI Orchestrator.
"""
import logging
import asyncio
from typing import Dict, List, Optional, Any, Union

from ..models.model import ModelInfo, ModelStatus, ModelType
from ..services.model_manager import ModelManager as BaseModelManager
from ..core.model_adapters import (
    ExtendedModelType, 
    ModelAdapter, 
    get_model_adapter_factory
)

logger = logging.getLogger(__name__)

class ExtendedModelManager(BaseModelManager):
    """
    Extended model manager with support for additional model types.
    
    This class extends the base ModelManager to support the new model types
    and adapter system.
    """
    
    def __init__(self):
        """Initialize the extended model manager."""
        super().__init__()
        self.adapter_factory = get_model_adapter_factory()
        self.model_adapters: Dict[str, ModelAdapter] = {}
        
    def _get_model_type(self, type_str: str) -> ModelType:
        """Convert string type to ModelType enum."""
        # First try to convert to ExtendedModelType
        try:
            extended_type = ExtendedModelType(type_str)
            # Convert back to base ModelType
            return extended_type.to_base_type()
        except ValueError:
            # Fall back to base implementation
            return super()._get_model_type(type_str)
    
    async def load_model(self, model_id: str) -> ModelStatus:
        """
        Load a model into memory using the appropriate adapter.
        
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
                # Get model info
                model_info = self.models[model_id]
                
                # Get appropriate adapter for this model type
                try:
                    model_type = ExtendedModelType(model_info.type.value)
                except ValueError:
                    # If conversion fails, use the closest matching type
                    model_type = ExtendedModelType.from_base_type(model_info.type)
                
                adapter = self.adapter_factory.get_adapter(model_type)
                
                # Load model using adapter
                logger.info(f"Loading model {model_id} using {model_type.value} adapter")
                model_instance = await adapter.load_model(model_info)
                
                # Store loaded model and adapter
                self.loaded_models[model_id] = model_instance
                self.model_adapters[model_id] = adapter
                
                # Update status
                self.model_statuses[model_id].loaded = True
                self.model_statuses[model_id].status = "ready"
                self.model_statuses[model_id].instances = 1
                self.model_statuses[model_id].last_used = asyncio.get_event_loop().time()
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
        Unload a model from memory using the appropriate adapter.
        
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
                # Get model instance and adapter
                model_instance = self.loaded_models.get(model_id)
                adapter = self.model_adapters.get(model_id)
                
                if model_instance and adapter:
                    # Unload model using adapter
                    logger.info(f"Unloading model {model_id}")
                    await adapter.unload_model(model_instance)
                    
                    # Remove from loaded models and adapters
                    del self.loaded_models[model_id]
                    del self.model_adapters[model_id]
                
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
    
    async def run_inference(self, model_id: str, inputs: Any, **kwargs) -> Any:
        """
        Run inference with a model using the appropriate adapter.
        
        Args:
            model_id: ID of the model
            inputs: Input data for inference
            **kwargs: Additional keyword arguments
            
        Returns:
            Inference results
            
        Raises:
            ValueError: If model not found or not loaded
            RuntimeError: If inference fails
        """
        if model_id not in self.models:
            raise ValueError(f"Model {model_id} not found")
            
        # Check if model is loaded
        if not self.model_statuses[model_id].loaded:
            # Auto-load model if not loaded
            await self.load_model(model_id)
            
        # Get model instance and adapter
        model_instance = self.loaded_models.get(model_id)
        adapter = self.model_adapters.get(model_id)
        
        if not model_instance or not adapter:
            raise ValueError(f"Model {model_id} is not properly loaded")
            
        try:
            # Run inference using adapter
            logger.info(f"Running inference with model {model_id}")
            result = await adapter.run_inference(model_instance, inputs, **kwargs)
            
            # Update last used time
            self.model_statuses[model_id].last_used = asyncio.get_event_loop().time()
            
            return result
            
        except Exception as e:
            logger.error(f"Error running inference with model {model_id}: {str(e)}")
            raise RuntimeError(f"Failed to run inference with model {model_id}: {str(e)}")
    
    async def get_model_metadata_schema(self, model_id: str) -> Dict[str, Any]:
        """
        Get the metadata schema for a model.
        
        Args:
            model_id: ID of the model
            
        Returns:
            Dictionary describing the metadata schema
            
        Raises:
            ValueError: If model not found
        """
        if model_id not in self.models:
            raise ValueError(f"Model {model_id} not found")
            
        # Get model info
        model_info = self.models[model_id]
        
        # Get appropriate adapter for this model type
        try:
            model_type = ExtendedModelType(model_info.type.value)
        except ValueError:
            # If conversion fails, use the closest matching type
            model_type = ExtendedModelType.from_base_type(model_info.type)
        
        adapter = self.adapter_factory.get_adapter(model_type)
        
        # Get metadata schema
        return adapter.get_metadata_schema()
    
    async def get_model_config_schema(self, model_id: str) -> Dict[str, Any]:
        """
        Get the configuration schema for a model.
        
        Args:
            model_id: ID of the model
            
        Returns:
            Dictionary describing the configuration schema
            
        Raises:
            ValueError: If model not found
        """
        if model_id not in self.models:
            raise ValueError(f"Model {model_id} not found")
            
        # Get model info
        model_info = self.models[model_id]
        
        # Get appropriate adapter for this model type
        try:
            model_type = ExtendedModelType(model_info.type.value)
        except ValueError:
            # If conversion fails, use the closest matching type
            model_type = ExtendedModelType.from_base_type(model_info.type)
        
        adapter = self.adapter_factory.get_adapter(model_type)
        
        # Get configuration schema
        return adapter.get_config_schema()
    
    async def list_supported_model_types(self) -> List[str]:
        """
        List all supported model types.
        
        Returns:
            List of supported model type values
        """
        return self.adapter_factory.list_supported_types()
    
    async def register_custom_adapter(self, model_type: Union[str, ExtendedModelType], adapter: ModelAdapter) -> None:
        """
        Register a custom model adapter.
        
        Args:
            model_type: Type of model (string or ExtendedModelType)
            adapter: Model adapter instance
            
        Raises:
            ValueError: If model type is invalid
            TypeError: If adapter is invalid
        """
        # Convert string to ExtendedModelType if necessary
        if isinstance(model_type, str):
            try:
                model_type = ExtendedModelType(model_type)
            except ValueError:
                raise ValueError(f"Invalid model type: {model_type}")
        
        # Register adapter
        self.adapter_factory.register_adapter(model_type, adapter)
        logger.info(f"Registered custom adapter for model type: {model_type.value}")


# Factory function
def get_extended_model_manager() -> ExtendedModelManager:
    """
    Factory function to get or create an extended model manager instance.
    
    Returns:
        ExtendedModelManager instance
    """
    return ExtendedModelManager()
