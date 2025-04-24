"""
GGML model implementation for LLM models.

This module provides LLM model implementation using GGML format models.
"""

import os
import logging
import asyncio
from typing import Dict, Any, List, Optional, Union, Callable
import time
import json

from .base import BaseLLMModel

logger = logging.getLogger("ai_orchestrator.models.llm.ggml_model")

class GGMLModel(BaseLLMModel):
    """LLM model implementation using GGML format"""
    
    def __init__(self, model_name: str, model_path: Optional[str] = None, **kwargs):
        """
        Initialize the GGML LLM model.
        
        Args:
            model_name: Name of the model
            model_path: Path to model files if local
            **kwargs: Additional model-specific parameters
        """
        super().__init__(model_name, model_path, **kwargs)
        self.model = None
        self.context_size = kwargs.get("context_size", 2048)
        self.gpu_layers = kwargs.get("gpu_layers", 0)
        self.use_mmap = kwargs.get("use_mmap", True)
        self.metadata = {
            "type": "ggml",
            "name": model_name,
            "context_size": self.context_size,
            "gpu_layers": self.gpu_layers
        }
        
    async def load(self) -> bool:
        """
        Load the model into memory using GGML.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Import here to avoid dependency issues
            # Note: This is a placeholder as the actual implementation would depend on the specific GGML binding
            # For example, it could use ctransformers or another Python binding for GGML models
            from ctransformers import AutoModelForCausalLM
            
            logger.info(f"Loading GGML model: {self.model_name}")
            
            # Check if model path exists
            if not self.model_path:
                raise ValueError("Model path is required for GGML models")
                
            model_file = self.model_path
            if os.path.isdir(model_file):
                # Find the model file in the directory
                for file in os.listdir(model_file):
                    if file.endswith((".bin", ".ggml", ".gguf")):
                        model_file = os.path.join(model_file, file)
                        break
                else:
                    raise FileNotFoundError(f"No GGML model file found in: {model_file}")
            
            if not os.path.exists(model_file):
                raise FileNotFoundError(f"Model file not found: {model_file}")
            
            # Load the model
            self.model = AutoModelForCausalLM.from_pretrained(
                model_file,
                model_type=self._determine_model_type(model_file),
                context_length=self.context_size,
                gpu_layers=self.gpu_layers,
                **self.model_config
            )
            
            # Update metadata
            self.metadata.update({
                "model_size": os.path.getsize(model_file) / (1024 * 1024),  # Size in MB
                "model_type": self._determine_model_type(model_file),
                "quantized": "q" in os.path.basename(model_file).lower()
            })
            
            self.is_loaded = True
            logger.info(f"GGML model loaded successfully: {self.model_name}")
            return True
            
        except Exception as e:
            logger.error(f"Error loading GGML model: {str(e)}")
            self.is_loaded = False
            return False
    
    def _determine_model_type(self, model_path: str) -> str:
        """
        Determine the model type based on the file name.
        
        Args:
            model_path: Path to the model file
            
        Returns:
            Model type string
        """
        filename = os.path.basename(model_path).lower()
        
        if "llama" in filename:
            return "llama"
        elif "gpt-j" in filename or "gptj" in filename:
            return "gpt-j"
        elif "gpt-2" in filename or "gpt2" in filename:
            return "gpt2"
        elif "mpt" in filename:
            return "mpt"
        elif "falcon" in filename:
            return "falcon"
        elif "dolly" in filename:
            return "dolly"
        elif "replit" in filename:
            return "replit"
        elif "starcoder" in filename:
            return "starcoder"
        else:
            # Default to llama as it's common
            return "llama"
    
    async def unload(self) -> bool:
        """
        Unload the model from memory.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"Unloading GGML model: {self.model_name}")
            
            # Clear model
            self.model = None
            
            # Force garbage collection
            import gc
            gc.collect()
            
            self.is_loaded = False
            logger.info(f"GGML model unloaded successfully: {self.model_name}")
            return True
            
        except Exception as e:
            logger.error(f"Error unloading GGML model: {str(e)}")
            return False
    
    async def generate(self, 
                      prompt: str, 
                      max_tokens: int = 1024,
                      temperature: float = 0.7,
                      top_p: float = 0.9,
                      top_k: int = 40,
                      repetition_penalty: float = 1.0,
                      stop_sequences: Optional[List[str]] = None,
                      stream: bool = False,
                      callback: Optional[Callable[[str], None]] = None,
                      **kwargs) -> Union[str, None]:
        """
        Generate text based on the prompt using GGML.
        
        Args:
            prompt: Input text prompt
            max_tokens: Maximum number of tokens to generate
            temperature: Controls randomness of output (0.0-1.0)
            top_p: Nucleus sampling parameter (0.0-1.0)
            top_k: Top-k sampling parameter
            repetition_penalty: Penalty for token repetition
            stop_sequences: Sequences that stop generation
            stream: Whether to stream the response
            callback: Callback function for streaming
            **kwargs: Additional model-specific parameters
            
        Returns:
            Generated text or None if streaming
        """
        if not self.is_loaded:
            raise RuntimeError("Model is not loaded")
            
        try:
            start_time = time.time()
            logger.debug(f"Generating text with GGML model: {self.model_name}")
            
            # Prepare generation parameters
            params = {
                "max_new_tokens": max_tokens,
                "temperature": temperature,
                "top_p": top_p,
                "top_k": top_k,
                "repetition_penalty": repetition_penalty,
                "stop": stop_sequences if stop_sequences else []
            }
            
            # Add any additional parameters
            params.update({k: v for k, v in kwargs.items() if k not in params})
            
            # Generate text
            if stream:
                return await self._generate_stream(prompt, params, callback)
            else:
                return await self._generate_complete(prompt, params)
                
        except Exception as e:
            logger.error(f"Error generating text with GGML model: {str(e)}")
            raise
    
    async def _generate_complete(self, prompt: str, params: Dict[str, Any]) -> str:
        """
        Generate complete text at once.
        
        Args:
            prompt: Input text prompt
            params: Generation parameters
            
        Returns:
            Generated text
        """
        # Run in a thread to avoid blocking the event loop
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, 
            lambda: self.model(
                prompt,
                max_new_tokens=params["max_new_tokens"],
                temperature=params["temperature"],
                top_p=params["top_p"],
                top_k=params["top_k"],
                repetition_penalty=params["repetition_penalty"],
                stop=params["stop"]
            )
        )
        
        return result
    
    async def _generate_stream(self, prompt: str, params: Dict[str, Any], 
                             callback: Optional[Callable[[str], None]]) -> None:
        """
        Stream generated text token by token.
        
        Args:
            prompt: Input text prompt
            params: Generation parameters
            callback: Callback function for streaming
        """
        if not callback:
            return await self._generate_complete(prompt, params)
        
        # Create a generator for streaming
        # Note: This is a placeholder as the actual implementation would depend on the specific GGML binding
        loop = asyncio.get_event_loop()
        
        async def process_stream():
            try:
                # Initialize the generation
                tokens = self.model.tokenize(prompt)
                generated_tokens = []
                
                # Generate tokens one by one
                for _ in range(params["max_new_tokens"]):
                    # Get the next token
                    next_token = await loop.run_in_executor(
                        None,
                        lambda: self.model.generate_next_token(
                            tokens + generated_tokens,
                            temperature=params["temperature"],
                            top_p=params["top_p"],
                            top_k=params["top_k"],
                            repetition_penalty=params["repetition_penalty"]
                        )
                    )
                    
                    # Add the token to the generated tokens
                    generated_tokens.append(next_token)
                    
                    # Decode the token and send it to the callback
                    token_text = self.model.decode([next_token])
                    callback(token_text)
                    
                    # Check for stop sequences
                    full_text = self.model.decode(generated_tokens)
                    if any(stop_seq in full_text for stop_seq in params["stop"]):
                        break
                    
                    await asyncio.sleep(0)  # Yield to the event loop
            except Exception as e:
                logger.error(f"Error in stream processing: {str(e)}")
        
        await process_stream()
    
    async def get_stats(self) -> Dict[str, Any]:
        """
        Get model statistics.
        
        Returns:
            Dictionary of model statistics
        """
        stats = {
            "loaded": self.is_loaded,
            "model_name": self.model_name,
            "model_type": "ggml",
            "context_size": self.context_size,
            "gpu_layers": self.gpu_layers
        }
        
        if self.is_loaded and self.model:
            # Add model-specific stats if available
            stats.update({
                "vocab_size": getattr(self.model, "vocab_size", None),
                "model_type": self.metadata.get("model_type", "unknown")
            })
        
        return stats
    
    def get_metadata(self) -> Dict[str, Any]:
        """
        Get model metadata.
        
        Returns:
            Dictionary of model metadata
        """
        return self.metadata
