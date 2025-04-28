"""
Model registry module for AI Orchestrator.

This module provides functionality for registering, versioning, and managing AI models.
"""
import os
import logging
import json
import asyncio
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
from pathlib import Path
import shutil

from ..models.model import ModelInfo, ModelType, ModelStatus
from ..core.config import settings

logger = logging.getLogger(__name__)

class ModelRegistry:
    """
    Registry for managing AI models, including versioning and metadata.
    """
    def __init__(self):
        """Initialize the model registry."""
        self.model_dir = Path(settings.MODEL_DIR)
        self.model_dir.mkdir(exist_ok=True)
        self.registry_file = self.model_dir / "registry.json"
        self.registry: Dict[str, Dict[str, Any]] = {}
        self.registry_lock = asyncio.Lock()
        
        # Initialize registry
        self._init_registry()
        
    def _init_registry(self):
        """Initialize registry and load metadata."""
        logger.info(f"Initializing model registry in {self.model_dir}")
        
        # Create registry file if it doesn't exist
        if not self.registry_file.exists():
            with open(self.registry_file, "w") as f:
                json.dump({
                    "created_at": datetime.now().isoformat(),
                    "last_updated": datetime.now().isoformat(),
                    "models": {}
                }, f, indent=2)
        
        # Load registry
        try:
            with open(self.registry_file, "r") as f:
                registry_data = json.load(f)
                self.registry = registry_data.get("models", {})
                
            logger.info(f"Registry initialized with {len(self.registry)} models")
                
        except Exception as e:
            logger.error(f"Error initializing registry: {str(e)}")
            # Create empty registry
            self.registry = {}
    
    async def save_registry(self):
        """Save registry to disk."""
        async with self.registry_lock:
            try:
                registry_data = {
                    "created_at": datetime.now().isoformat(),
                    "last_updated": datetime.now().isoformat(),
                    "models": self.registry
                }
                
                # Write to temporary file first
                temp_file = self.registry_file.with_suffix(".tmp")
                with open(temp_file, "w") as f:
                    json.dump(registry_data, f, indent=2)
                    
                # Rename to actual file
                temp_file.replace(self.registry_file)
                
                logger.debug("Registry saved successfully")
                
            except Exception as e:
                logger.error(f"Error saving registry: {str(e)}")
    
    async def register_model(self, model_info: ModelInfo) -> bool:
        """
        Register a new model or update existing model.
        
        Args:
            model_info: Model information
            
        Returns:
            True if successful, False otherwise
        """
        model_id = model_info.model_id
        
        async with self.registry_lock:
            # Check if model exists
            if model_id in self.registry:
                # Update existing model
                self.registry[model_id].update({
                    "name": model_info.name,
                    "type": model_info.type.value,
                    "description": model_info.description,
                    "version": model_info.version,
                    "size": model_info.size,
                    "parameters": model_info.parameters,
                    "context_length": model_info.context_length,
                    "quantization": model_info.quantization,
                    "supports_gpu": model_info.supports_gpu,
                    "supports_cpu": model_info.supports_cpu,
                    "tags": model_info.tags,
                    "metadata": model_info.metadata,
                    "updated_at": datetime.now().isoformat()
                })
                logger.info(f"Updated model {model_id} in registry")
            else:
                # Add new model
                self.registry[model_id] = {
                    "name": model_info.name,
                    "type": model_info.type.value,
                    "description": model_info.description,
                    "version": model_info.version,
                    "size": model_info.size,
                    "parameters": model_info.parameters,
                    "context_length": model_info.context_length,
                    "quantization": model_info.quantization,
                    "supports_gpu": model_info.supports_gpu,
                    "supports_cpu": model_info.supports_cpu,
                    "tags": model_info.tags,
                    "metadata": model_info.metadata,
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    "versions": {
                        model_info.version: {
                            "created_at": datetime.now().isoformat(),
                            "path": model_info.metadata.get("path", ""),
                            "active": True
                        }
                    }
                }
                logger.info(f"Added new model {model_id} to registry")
            
            # Save registry
            await self.save_registry()
            return True
    
    async def get_model_info(self, model_id: str) -> Optional[ModelInfo]:
        """
        Get information about a model.
        
        Args:
            model_id: ID of the model
            
        Returns:
            ModelInfo object or None if not found
        """
        async with self.registry_lock:
            if model_id not in self.registry:
                return None
                
            model_data = self.registry[model_id]
            
            # Convert to ModelInfo
            model_info = ModelInfo(
                model_id=model_id,
                name=model_data.get("name", model_id),
                type=ModelType(model_data.get("type", "llm")),
                description=model_data.get("description"),
                version=model_data.get("version", "1.0"),
                size=model_data.get("size"),
                parameters=model_data.get("parameters"),
                context_length=model_data.get("context_length"),
                quantization=model_data.get("quantization"),
                supports_gpu=model_data.get("supports_gpu", True),
                supports_cpu=model_data.get("supports_cpu", True),
                tags=model_data.get("tags", []),
                metadata=model_data.get("metadata", {})
            )
            
            return model_info
    
    async def list_models(self, type_filter: Optional[str] = None) -> List[ModelInfo]:
        """
        List all registered models.
        
        Args:
            type_filter: Optional filter by model type
            
        Returns:
            List of ModelInfo objects
        """
        result = []
        
        async with self.registry_lock:
            for model_id, model_data in self.registry.items():
                # Apply type filter if specified
                if type_filter and model_data.get("type") != type_filter:
                    continue
                    
                # Convert to ModelInfo
                model_info = ModelInfo(
                    model_id=model_id,
                    name=model_data.get("name", model_id),
                    type=ModelType(model_data.get("type", "llm")),
                    description=model_data.get("description"),
                    version=model_data.get("version", "1.0"),
                    size=model_data.get("size"),
                    parameters=model_data.get("parameters"),
                    context_length=model_data.get("context_length"),
                    quantization=model_data.get("quantization"),
                    supports_gpu=model_data.get("supports_gpu", True),
                    supports_cpu=model_data.get("supports_cpu", True),
                    tags=model_data.get("tags", []),
                    metadata=model_data.get("metadata", {})
                )
                
                result.append(model_info)
                
        return result
    
    async def add_model_version(self, model_id: str, version: str, path: str) -> bool:
        """
        Add a new version to an existing model.
        
        Args:
            model_id: ID of the model
            version: Version string
            path: Path to model file
            
        Returns:
            True if successful, False otherwise
        """
        async with self.registry_lock:
            if model_id not in self.registry:
                logger.error(f"Cannot add version to non-existent model {model_id}")
                return False
                
            # Add version
            if "versions" not in self.registry[model_id]:
                self.registry[model_id]["versions"] = {}
                
            self.registry[model_id]["versions"][version] = {
                "created_at": datetime.now().isoformat(),
                "path": path,
                "active": False
            }
            
            logger.info(f"Added version {version} to model {model_id}")
            
            # Save registry
            await self.save_registry()
            return True
    
    async def activate_model_version(self, model_id: str, version: str) -> bool:
        """
        Activate a specific version of a model.
        
        Args:
            model_id: ID of the model
            version: Version string
            
        Returns:
            True if successful, False otherwise
        """
        async with self.registry_lock:
            if model_id not in self.registry:
                logger.error(f"Cannot activate version for non-existent model {model_id}")
                return False
                
            if "versions" not in self.registry[model_id] or version not in self.registry[model_id]["versions"]:
                logger.error(f"Version {version} not found for model {model_id}")
                return False
                
            # Deactivate all versions
            for v in self.registry[model_id]["versions"]:
                self.registry[model_id]["versions"][v]["active"] = False
                
            # Activate specified version
            self.registry[model_id]["versions"][version]["active"] = True
            
            # Update model version
            self.registry[model_id]["version"] = version
            
            logger.info(f"Activated version {version} for model {model_id}")
            
            # Save registry
            await self.save_registry()
            return True
    
    async def delete_model(self, model_id: str, delete_files: bool = False) -> bool:
        """
        Delete a model from the registry.
        
        Args:
            model_id: ID of the model
            delete_files: Whether to delete model files
            
        Returns:
            True if successful, False otherwise
        """
        async with self.registry_lock:
            if model_id not in self.registry:
                logger.error(f"Cannot delete non-existent model {model_id}")
                return False
                
            # Delete files if requested
            if delete_files and "versions" in self.registry[model_id]:
                for version, version_data in self.registry[model_id]["versions"].items():
                    path = version_data.get("path", "")
                    if path and os.path.exists(path):
                        try:
                            if os.path.isdir(path):
                                shutil.rmtree(path)
                            else:
                                os.remove(path)
                            logger.info(f"Deleted model file: {path}")
                        except Exception as e:
                            logger.error(f"Error deleting model file {path}: {str(e)}")
            
            # Remove from registry
            del self.registry[model_id]
            
            logger.info(f"Deleted model {model_id} from registry")
            
            # Save registry
            await self.save_registry()
            return True
    
    async def get_model_versions(self, model_id: str) -> Dict[str, Dict[str, Any]]:
        """
        Get all versions of a model.
        
        Args:
            model_id: ID of the model
            
        Returns:
            Dictionary of version information
        """
        async with self.registry_lock:
            if model_id not in self.registry:
                return {}
                
            return self.registry[model_id].get("versions", {})
    
    async def get_active_version(self, model_id: str) -> Optional[str]:
        """
        Get the active version of a model.
        
        Args:
            model_id: ID of the model
            
        Returns:
            Active version string or None if not found
        """
        versions = await self.get_model_versions(model_id)
        
        for version, version_data in versions.items():
            if version_data.get("active", False):
                return version
                
        return None


# Singleton instance
_model_registry = None

def get_model_registry() -> ModelRegistry:
    """
    Get or create the model registry instance.
    
    Returns:
        ModelRegistry instance
    """
    global _model_registry
    if _model_registry is None:
        _model_registry = ModelRegistry()
    return _model_registry
