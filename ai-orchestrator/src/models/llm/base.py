"""
Base model interface for LLM implementations.

This module defines the base interface that all LLM implementations must follow.
"""

import abc
from typing import Dict, Any, List, Optional, Union, Callable
import logging

logger = logging.getLogger("ai_orchestrator.models.llm.base")

class BaseLLMModel(abc.ABC):
    """Base abstract class for all LLM model implementations"""
    
    def __init__(self, model_name: str, model_path: Optional[str] = None, **kwargs):
        """
        Initialize the LLM model.
        
        Args:
            model_name: Name of the model
            model_path: Path to model files if local
            **kwargs: Additional model-specific parameters
        """
        self.model_name = model_name
        self.model_path = model_path
        self.model_config = kwargs
        self.is_loaded = False
        self.metadata = {}
        
    @abc.abstractmethod
    async def load(self) -> bool:
        """
        Load the model into memory.
        
        Returns:
            True if successful, False otherwise
        """
        pass
    
    @abc.abstractmethod
    async def unload(self) -> bool:
        """
        Unload the model from memory.
        
        Returns:
            True if successful, False otherwise
        """
        pass
    
    @abc.abstractmethod
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
        Generate text based on the prompt.
        
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
        pass
    
    @abc.abstractmethod
    async def get_stats(self) -> Dict[str, Any]:
        """
        Get model statistics.
        
        Returns:
            Dictionary of model statistics
        """
        pass
    
    @abc.abstractmethod
    def get_metadata(self) -> Dict[str, Any]:
        """
        Get model metadata.
        
        Returns:
            Dictionary of model metadata
        """
        pass
    
    @property
    def is_ready(self) -> bool:
        """
        Check if the model is ready for inference.
        
        Returns:
            True if the model is loaded and ready, False otherwise
        """
        return self.is_loaded
