"""
Model manager for AI Orchestrator.

This module provides a model manager for loading, unloading, and managing AI models.
"""

import os
import logging
import asyncio
import time
from typing import Dict, Any, List, Optional, Union, Callable
from datetime import datetime

from ..config import config
from .llm import ONNXLLMModel, LlamaCppModel, GGMLModel

logger = logging.getLogger("ai_orchestrator.models.model_manager")

class ModelManager:
    """Model manager for AI Orchestrator"""
    
    def __init__(self):
        """Initialize the model manager"""
        self.models = {}
        self.loaded_models = {}
        self.start_time = time.time()
        self.stats = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "model_usage": {}
        }
        
    async def initialize(self) -> bool:
        """
        Initialize the model manager.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info("Initializing model manager")
            
            # Create model cache directory if it doesn't exist
            os.makedirs(config["models"]["cache_dir"], exist_ok=True)
            
            # Discover available models
            await self.discover_models()
            
            # Preload models if configured
            if config["models"].get("preload_models"):
                for model_name in config["models"]["preload_models"]:
                    await self.load_model(model_name)
            
            logger.info("Model manager initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error initializing model manager: {str(e)}")
            return False
    
    async def discover_models(self) -> Dict[str, List[str]]:
        """
        Discover available models in the cache directory.
        
        Returns:
            Dictionary of model types and lists of model names
        """
        try:
            logger.info("Discovering available models")
            
            # Get available models from cache directory
            available_models = config.get_available_models()
            
            # Register discovered models
            for model_type, model_names in available_models.items():
                for model_name in model_names:
                    model_path = config.get_model_path(model_name, model_type)
                    self.register_model(model_name, model_type, model_path)
            
            logger.info(f"Discovered models: {available_models}")
            return available_models
            
        except Exception as e:
            logger.error(f"Error discovering models: {str(e)}")
            return {}
    
    def register_model(self, model_name: str, model_type: str, model_path: str) -> bool:
        """
        Register a model with the manager.
        
        Args:
            model_name: Name of the model
            model_type: Type of the model (llm, vision, voice)
            model_path: Path to the model files
            
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"Registering model: {model_name} ({model_type})")
            
            # Create a unique key for the model
            model_key = f"{model_type}:{model_name}"
            
            # Check if model is already registered
            if model_key in self.models:
                logger.warning(f"Model already registered: {model_key}")
                return False
            
            # Register the model
            self.models[model_key] = {
                "name": model_name,
                "type": model_type,
                "path": model_path,
                "registered_at": datetime.now().isoformat()
            }
            
            logger.info(f"Model registered successfully: {model_key}")
            return True
            
        except Exception as e:
            logger.error(f"Error registering model: {str(e)}")
            return False
    
    async def load_model(self, model_name: str, model_type: Optional[str] = None, **kwargs) -> bool:
        """
        Load a model into memory.
        
        Args:
            model_name: Name of the model
            model_type: Type of the model (llm, vision, voice)
            **kwargs: Additional model-specific parameters
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # If model_type is not specified, try to infer it
            if not model_type:
                # Check if model_name contains type information
                if ":" in model_name:
                    model_type, model_name = model_name.split(":", 1)
                else:
                    # Try to find the model in registered models
                    for key, model in self.models.items():
                        if model["name"] == model_name:
                            model_type = model["type"]
                            break
                    
                    # If still not found, use default type
                    if not model_type:
                        model_type = "llm"  # Default to LLM
            
            # Create a unique key for the model
            model_key = f"{model_type}:{model_name}"
            
            logger.info(f"Loading model: {model_key}")
            
            # Check if model is already loaded
            if model_key in self.loaded_models and self.loaded_models[model_key].is_loaded:
                logger.info(f"Model already loaded: {model_key}")
                return True
            
            # Check if we need to unload models due to limit
            if len(self.loaded_models) >= config["models"]["max_loaded_models"]:
                # Unload the least recently used model
                await self._unload_lru_model()
            
            # Get model path
            model_path = None
            if model_key in self.models:
                model_path = self.models[model_key]["path"]
            else:
                # Try to find the model in the cache directory
                model_path = config.get_model_path(model_name, model_type)
                if not os.path.exists(model_path):
                    logger.error(f"Model not found: {model_key}")
                    return False
            
            # Create and load the model based on type
            model = None
            if model_type == "llm":
                # Determine the model implementation based on file extension or kwargs
                model_impl = kwargs.get("implementation", self._determine_llm_implementation(model_path))
                
                if model_impl == "onnx":
                    model = ONNXLLMModel(model_name, model_path, **kwargs)
                elif model_impl == "llama.cpp":
                    model = LlamaCppModel(model_name, model_path, **kwargs)
                elif model_impl == "ggml":
                    model = GGMLModel(model_name, model_path, **kwargs)
                else:
                    raise ValueError(f"Unknown LLM implementation: {model_impl}")
            
            elif model_type == "vision":
                # Vision models will be implemented in a separate module
                raise NotImplementedError("Vision models not yet implemented")
            
            elif model_type == "voice":
                # Voice models will be implemented in a separate module
                raise NotImplementedError("Voice models not yet implemented")
            
            else:
                raise ValueError(f"Unknown model type: {model_type}")
            
            # Load the model
            success = await model.load()
            
            if success:
                # Store the loaded model
                self.loaded_models[model_key] = model
                
                # Update model registry if not already registered
                if model_key not in self.models:
                    self.register_model(model_name, model_type, model_path)
                
                logger.info(f"Model loaded successfully: {model_key}")
                return True
            else:
                logger.error(f"Failed to load model: {model_key}")
                return False
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            return False
    
    def _determine_llm_implementation(self, model_path: str) -> str:
        """
        Determine the LLM implementation based on the model path.
        
        Args:
            model_path: Path to the model files
            
        Returns:
            Implementation type: onnx, llama.cpp, or ggml
        """
        if os.path.isdir(model_path):
            # Check files in the directory
            for file in os.listdir(model_path):
                if file.endswith(".onnx"):
                    return "onnx"
                elif file.endswith(".gguf"):
                    return "llama.cpp"
                elif file.endswith((".bin", ".ggml")):
                    return "ggml"
        else:
            # Check the file extension
            if model_path.endswith(".onnx"):
                return "onnx"
            elif model_path.endswith(".gguf"):
                return "llama.cpp"
            elif model_path.endswith((".bin", ".ggml")):
                return "ggml"
        
        # Default to llama.cpp as it's common
        return "llama.cpp"
    
    async def _unload_lru_model(self) -> bool:
        """
        Unload the least recently used model.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Find the least recently used model
            lru_key = None
            lru_time = float('inf')
            
            for key, model in self.loaded_models.items():
                # Skip models that are not loaded
                if not model.is_loaded:
                    continue
                
                # Get last used time from stats
                last_used = self.stats.get("model_usage", {}).get(key, {}).get("last_used", 0)
                
                if last_used < lru_time:
                    lru_time = last_used
                    lru_key = key
            
            # If no model found, return
            if not lru_key:
                return False
            
            # Unload the model
            logger.info(f"Unloading least recently used model: {lru_key}")
            return await self.unload_model(lru_key)
            
        except Exception as e:
            logger.error(f"Error unloading LRU model: {str(e)}")
            return False
    
    async def unload_model(self, model_key: str) -> bool:
        """
        Unload a model from memory.
        
        Args:
            model_key: Key of the model to unload
            
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"Unloading model: {model_key}")
            
            # Check if model is loaded
            if model_key not in self.loaded_models:
                logger.warning(f"Model not loaded: {model_key}")
                return False
            
            # Get the model
            model = self.loaded_models[model_key]
            
            # Unload the model
            success = await model.unload()
            
            if success:
                # Remove from loaded models
                del self.loaded_models[model_key]
                
                logger.info(f"Model unloaded successfully: {model_key}")
                return True
            else:
                logger.error(f"Failed to unload model: {model_key}")
                return False
            
        except Exception as e:
            logger.error(f"Error unloading model: {str(e)}")
            return False
    
    async def process_llm(self, prompt: str, parameters: Optional[Dict[str, Any]] = None) -> str:
        """
        Process a request using an LLM model.
        
        Args:
            prompt: Input text prompt
            parameters: Model parameters
            
        Returns:
            Generated text
        """
        try:
            # Update stats
            self.stats["total_requests"] += 1
            
            # Get parameters
            params = parameters or {}
            model_name = params.get("model_name", config["models"]["default_llm"])
            
            # Create model key
            model_key = f"llm:{model_name}"
            
            # Load the model if not loaded
            if model_key not in self.loaded_models or not self.loaded_models[model_key].is_loaded:
                success = await self.load_model(model_name, "llm")
                if not success:
                    raise RuntimeError(f"Failed to load model: {model_key}")
            
            # Get the model
            model = self.loaded_models[model_key]
            
            # Update usage stats
            if model_key not in self.stats["model_usage"]:
                self.stats["model_usage"][model_key] = {
                    "requests": 0,
                    "tokens_generated": 0,
                    "last_used": 0
                }
            
            self.stats["model_usage"][model_key]["requests"] += 1
            self.stats["model_usage"][model_key]["last_used"] = time.time()
            
            # Process the request
            start_time = time.time()
            
            result = await model.generate(
                prompt=prompt,
                max_tokens=params.get("max_tokens", config["llm"]["default_max_tokens"]),
                temperature=params.get("temperature", config["llm"]["default_temperature"]),
                top_p=params.get("top_p", config["llm"]["default_top_p"]),
                top_k=params.get("top_k", config["llm"]["default_top_k"]),
                repetition_penalty=params.get("repetition_penalty", config["llm"]["default_repetition_penalty"]),
                stop_sequences=params.get("stop_sequences"),
                stream=params.get("stream", False),
                callback=params.get("callback")
            )
            
            # Update stats
            processing_time = time.time() - start_time
            self.stats["successful_requests"] += 1
            
            logger.info(f"Processed LLM request in {processing_time:.2f}s")
            
            return result
            
        except Exception as e:
            # Update stats
            self.stats["failed_requests"] += 1
            
            logger.error(f"Error processing LLM request: {str(e)}")
            raise
    
    async def process_vision(self, input_data: str, parameters: Optional[Dict[str, Any]] = None) -> Union[str, Dict[str, Any]]:
        """
        Process a request using a Vision model.
        
        Args:
            input_data: Input image data (URL or base64)
            parameters: Model parameters
            
        Returns:
            Vision processing result
        """
        # This is a placeholder for vision model processing
        # Will be implemented in a separate module
        raise NotImplementedError("Vision models not yet implemented")
    
    async def process_voice(self, input_data: str, parameters: Optional[Dict[str, Any]] = None) -> str:
        """
        Process a request using a Voice model.
        
        Args:
            input_data: Input audio data (URL or base64)
            parameters: Model parameters
            
        Returns:
            Voice processing result
        """
        # This is a placeholder for voice model processing
        # Will be implemented in a separate module
        raise NotImplementedError("Voice models not yet implemented")
    
    async def process_batch(self, requests: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Process a batch of requests using multiple models.
        
        Args:
            requests: List of request parameters
            
        Returns:
            List of processing results
        """
        try:
            # Update stats
            self.stats["total_requests"] += len(requests)
            
            # Process requests in parallel
            tasks = []
            for req in requests:
                req_type = req.get("type", "llm")
                
                if req_type == "llm":
                    tasks.append(self.process_llm(req["input"], req.get("parameters")))
                elif req_type == "vision":
                    tasks.append(self.process_vision(req["input"], req.get("parameters")))
                elif req_type == "voice":
                    tasks.append(self.process_voice(req["input"], req.get("parameters")))
                else:
                    raise ValueError(f"Unknown request type: {req_type}")
            
            # Wait for all tasks to complete
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Format results
            formatted_results = []
            for i, result in enumerate(results):
                req = requests[i]
                req_type = req.get("type", "llm")
                
                if isinstance(result, Exception):
                    # Update stats
                    self.stats["failed_requests"] += 1
                    
                    formatted_results.append({
                        "type": req_type,
                        "status": "error",
                        "error": str(result)
                    })
                else:
                    # Update stats
                    self.stats["successful_requests"] += 1
                    
                    formatted_results.append({
                        "type": req_type,
                        "status": "success",
                        "result": result
                    })
            
            return formatted_results
            
        except Exception as e:
            # Update stats
            self.stats["failed_requests"] += len(requests)
            
            logger.error(f"Error processing batch request: {str(e)}")
            raise
    
    async def get_models_info(self) -> Dict[str, Any]:
        """
        Get information about available models.
        
        Returns:
            Dictionary of model information
        """
        try:
            # Get registered models
            registered_models = {}
            for key, model in self.models.items():
                registered_models[key] = {
                    "name": model["name"],
                    "type": model["type"],
                    "path": model["path"],
                    "loaded": key in self.loaded_models and self.loaded_models[key].is_loaded
                }
            
            # Get loaded models
            loaded_models = {}
            for key, model in self.loaded_models.items():
                if model.is_loaded:
                    loaded_models[key] = model.get_metadata()
            
            return {
                "registered_models": registered_models,
                "loaded_models": loaded_models,
                "max_loaded_models": config["models"]["max_loaded_models"],
                "current_loaded_models": len(loaded_models)
            }
            
        except Exception as e:
            logger.error(f"Error getting models info: {str(e)}")
            raise
    
    async def get_status(self) -> Dict[str, Any]:
        """
        Get status of all models.
        
        Returns:
            Dictionary of model status
        """
        try:
            # Get status of loaded models
            model_status = {}
            for key, model in self.loaded_models.items():
                if model.is_loaded:
                    model_status[key] = await model.get_stats()
            
            return {
                "loaded_models": len(model_status),
                "registered_models": len(self.models),
                "models": model_status
            }
            
        except Exception as e:
            logger.error(f"Error getting model status: {str(e)}")
            raise
    
    async def get_stats(self) -> Dict[str, Any]:
        """
        Get usage statistics for all models.
        
        Returns:
            Dictionary of usage statistics
        """
        try:
            return {
                "uptime": self.get_uptime(),
                "total_requests": self.stats["total_requests"],
                "successful_requests": self.stats["successful_requests"],
                "failed_requests": self.stats["failed_requests"],
                "success_rate": self.stats["successful_requests"] / max(1, self.stats["total_requests"]),
                "model_usage": self.stats["model_usage"]
            }
            
        except Exception as e:
            logger.error(f"Error getting model stats: {str(e)}")
            raise
    
    def get_uptime(self) -> float:
        """
        Get service uptime in seconds.
        
        Returns:
            Uptime in seconds
        """
        return time.time() - self.start_time
    
    async def switch_model_version(self, model_type: str, version: str) -> bool:
        """
        Switch to a different version of a model.
        
        Args:
            model_type: Type of the model (llm, vision, voice)
            version: Version to switch to
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # This is a placeholder for model version switching
            # In a real implementation, this would update the default model for the type
            
            # Update config
            if model_type == "llm":
                config["models"]["default_llm"] = version
            elif model_type == "vision":
                config["models"]["default_vision"] = version
            elif model_type == "voice":
                config["models"]["default_voice"] = version
            else:
                raise ValueError(f"Unknown model type: {model_type}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error switching model version: {str(e)}")
            return False
    
    async def get_available_versions(self, model_type: str) -> List[str]:
        """
        Get available versions for a specific model type.
        
        Args:
            model_type: Type of the model (llm, vision, voice)
            
        Returns:
            List of available versions
        """
        try:
            # Get available models for the type
            available_models = config.get_available_models(model_type)
            
            # Extract model names
            if model_type in available_models:
                return available_models[model_type]
            else:
                return []
            
        except Exception as e:
            logger.error(f"Error getting available versions: {str(e)}")
            return []
    
    async def clear_cache(self, model_type: Optional[str] = None) -> Dict[str, int]:
        """
        Clear the model cache for a specific model type or all models.
        
        Args:
            model_type: Type of the model (llm, vision, voice) or None for all
            
        Returns:
            Dictionary of cleared models count by type
        """
        try:
            # Determine which models to unload
            models_to_unload = []
            
            for key, model in self.loaded_models.items():
                if model.is_loaded:
                    if model_type is None or key.startswith(f"{model_type}:"):
                        models_to_unload.append(key)
            
            # Unload models
            cleared = {"total": 0}
            for key in models_to_unload:
                model_type = key.split(":", 1)[0]
                
                if await self.unload_model(key):
                    if model_type not in cleared:
                        cleared[model_type] = 0
                    
                    cleared[model_type] += 1
                    cleared["total"] += 1
            
            return cleared
            
        except Exception as e:
            logger.error(f"Error clearing cache: {str(e)}")
            return {"total": 0}
    
    async def cleanup(self) -> bool:
        """
        Clean up resources.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info("Cleaning up model manager resources")
            
            # Unload all models
            for key, model in list(self.loaded_models.items()):
                if model.is_loaded:
                    await self.unload_model(key)
            
            logger.info("Model manager resources cleaned up successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error cleaning up model manager resources: {str(e)}")
            return False
