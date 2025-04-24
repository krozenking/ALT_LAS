"""
llama.cpp implementation for LLM models.

This module provides LLM model implementation using llama.cpp Python bindings.
"""

import os
import logging
import asyncio
from typing import Dict, Any, List, Optional, Union, Callable
import time
import json

from .base import BaseLLMModel

logger = logging.getLogger("ai_orchestrator.models.llm.llama_cpp")

class LlamaCppModel(BaseLLMModel):
    """LLM model implementation using llama.cpp"""
    
    def __init__(self, model_name: str, model_path: Optional[str] = None, **kwargs):
        """
        Initialize the llama.cpp LLM model.
        
        Args:
            model_name: Name of the model
            model_path: Path to model files if local
            **kwargs: Additional model-specific parameters
        """
        super().__init__(model_name, model_path, **kwargs)
        self.llm = None
        self.n_ctx = kwargs.get("n_ctx", 2048)
        self.n_batch = kwargs.get("n_batch", 512)
        self.n_gpu_layers = kwargs.get("n_gpu_layers", -1)  # -1 means use all available
        self.use_mlock = kwargs.get("use_mlock", False)
        self.use_mmap = kwargs.get("use_mmap", True)
        self.metadata = {
            "type": "llama.cpp",
            "name": model_name,
            "n_ctx": self.n_ctx,
            "n_batch": self.n_batch,
            "n_gpu_layers": self.n_gpu_layers
        }
        
    async def load(self) -> bool:
        """
        Load the model into memory using llama.cpp.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Import here to avoid dependency issues
            from llama_cpp import Llama
            
            logger.info(f"Loading llama.cpp model: {self.model_name}")
            
            # Check if model path exists
            if not self.model_path:
                raise ValueError("Model path is required for llama.cpp models")
                
            model_file = self.model_path
            if os.path.isdir(model_file):
                # Find the model file in the directory
                for file in os.listdir(model_file):
                    if file.endswith(".gguf"):
                        model_file = os.path.join(model_file, file)
                        break
                else:
                    raise FileNotFoundError(f"No .gguf model file found in: {model_file}")
            
            if not os.path.exists(model_file):
                raise FileNotFoundError(f"Model file not found: {model_file}")
            
            # Load the model
            self.llm = Llama(
                model_path=model_file,
                n_ctx=self.n_ctx,
                n_batch=self.n_batch,
                n_gpu_layers=self.n_gpu_layers,
                use_mlock=self.use_mlock,
                use_mmap=self.use_mmap,
                **self.model_config
            )
            
            # Update metadata
            self.metadata.update({
                "n_vocab": self.llm.n_vocab() if hasattr(self.llm, "n_vocab") else None,
                "model_size": os.path.getsize(model_file) / (1024 * 1024),  # Size in MB
                "quantized": "q" in os.path.basename(model_file).lower()
            })
            
            self.is_loaded = True
            logger.info(f"llama.cpp model loaded successfully: {self.model_name}")
            return True
            
        except Exception as e:
            logger.error(f"Error loading llama.cpp model: {str(e)}")
            self.is_loaded = False
            return False
    
    async def unload(self) -> bool:
        """
        Unload the model from memory.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"Unloading llama.cpp model: {self.model_name}")
            
            # Clear llama.cpp model
            self.llm = None
            
            # Force garbage collection
            import gc
            gc.collect()
            
            self.is_loaded = False
            logger.info(f"llama.cpp model unloaded successfully: {self.model_name}")
            return True
            
        except Exception as e:
            logger.error(f"Error unloading llama.cpp model: {str(e)}")
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
        Generate text based on the prompt using llama.cpp.
        
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
            logger.debug(f"Generating text with llama.cpp model: {self.model_name}")
            
            # Prepare generation parameters
            params = {
                "max_tokens": max_tokens,
                "temperature": temperature,
                "top_p": top_p,
                "top_k": top_k,
                "repeat_penalty": repetition_penalty,
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
            logger.error(f"Error generating text with llama.cpp model: {str(e)}")
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
            lambda: self.llm(
                prompt,
                max_tokens=params["max_tokens"],
                temperature=params["temperature"],
                top_p=params["top_p"],
                top_k=params["top_k"],
                repeat_penalty=params["repeat_penalty"],
                stop=params["stop"]
            )
        )
        
        # Extract the generated text
        if isinstance(result, dict) and "choices" in result:
            return result["choices"][0]["text"]
        elif isinstance(result, str):
            return result
        else:
            return json.dumps(result)
    
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
        generator = self.llm(
            prompt,
            max_tokens=params["max_tokens"],
            temperature=params["temperature"],
            top_p=params["top_p"],
            top_k=params["top_k"],
            repeat_penalty=params["repeat_penalty"],
            stop=params["stop"],
            stream=True
        )
        
        # Process the stream in a separate thread
        loop = asyncio.get_event_loop()
        
        async def process_stream():
            try:
                for chunk in generator:
                    if isinstance(chunk, dict) and "choices" in chunk:
                        text = chunk["choices"][0]["text"]
                    elif isinstance(chunk, str):
                        text = chunk
                    else:
                        text = json.dumps(chunk)
                    
                    if text:
                        callback(text)
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
            "model_type": "llama.cpp",
            "n_ctx": self.n_ctx,
            "n_batch": self.n_batch,
            "n_gpu_layers": self.n_gpu_layers
        }
        
        if self.is_loaded and self.llm:
            # Add llama.cpp specific stats
            stats.update({
                "n_vocab": self.llm.n_vocab() if hasattr(self.llm, "n_vocab") else None,
                "n_ctx": self.llm.n_ctx() if hasattr(self.llm, "n_ctx") else self.n_ctx,
                "mem_per_token": self.llm.mem_per_token() if hasattr(self.llm, "mem_per_token") else None
            })
        
        return stats
    
    def get_metadata(self) -> Dict[str, Any]:
        """
        Get model metadata.
        
        Returns:
            Dictionary of model metadata
        """
        return self.metadata
