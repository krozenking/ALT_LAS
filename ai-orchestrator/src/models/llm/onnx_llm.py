"""
ONNX Runtime implementation for LLM models.

This module provides LLM model implementation using ONNX Runtime.
"""

import os
import logging
import asyncio
from typing import Dict, Any, List, Optional, Union, Callable
import numpy as np
import time

from .base import BaseLLMModel

logger = logging.getLogger("ai_orchestrator.models.llm.onnx_llm")

class ONNXLLMModel(BaseLLMModel):
    """LLM model implementation using ONNX Runtime"""
    
    def __init__(self, model_name: str, model_path: Optional[str] = None, **kwargs):
        """
        Initialize the ONNX LLM model.
        
        Args:
            model_name: Name of the model
            model_path: Path to model files if local
            **kwargs: Additional model-specific parameters
        """
        super().__init__(model_name, model_path, **kwargs)
        self.ort_session = None
        self.tokenizer = None
        self.device = kwargs.get("device", "cpu")
        self.metadata = {
            "type": "onnx",
            "name": model_name,
            "device": self.device,
            "quantized": kwargs.get("quantized", False)
        }
        
    async def load(self) -> bool:
        """
        Load the model into memory using ONNX Runtime.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Import here to avoid dependency issues
            import onnxruntime as ort
            from transformers import AutoTokenizer
            
            logger.info(f"Loading ONNX model: {self.model_name}")
            
            # Set up ONNX Runtime session options
            options = ort.SessionOptions()
            options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            
            # Set up execution providers
            providers = []
            if self.device == "cuda" and "CUDAExecutionProvider" in ort.get_available_providers():
                providers.append("CUDAExecutionProvider")
            providers.append("CPUExecutionProvider")
            
            # Load the model
            if not self.model_path:
                raise ValueError("Model path is required for ONNX models")
                
            model_file = os.path.join(self.model_path, "model.onnx")
            if not os.path.exists(model_file):
                raise FileNotFoundError(f"Model file not found: {model_file}")
                
            self.ort_session = ort.InferenceSession(model_file, options, providers=providers)
            
            # Load the tokenizer
            tokenizer_path = self.model_path
            self.tokenizer = AutoTokenizer.from_pretrained(tokenizer_path)
            
            # Update metadata
            self.metadata.update({
                "input_names": [input.name for input in self.ort_session.get_inputs()],
                "output_names": [output.name for output in self.ort_session.get_outputs()],
                "providers": self.ort_session.get_providers()
            })
            
            self.is_loaded = True
            logger.info(f"ONNX model loaded successfully: {self.model_name}")
            return True
            
        except Exception as e:
            logger.error(f"Error loading ONNX model: {str(e)}")
            self.is_loaded = False
            return False
    
    async def unload(self) -> bool:
        """
        Unload the model from memory.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"Unloading ONNX model: {self.model_name}")
            
            # Clear ONNX session
            self.ort_session = None
            self.tokenizer = None
            
            # Force garbage collection
            import gc
            gc.collect()
            
            self.is_loaded = False
            logger.info(f"ONNX model unloaded successfully: {self.model_name}")
            return True
            
        except Exception as e:
            logger.error(f"Error unloading ONNX model: {str(e)}")
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
        Generate text based on the prompt using ONNX Runtime.
        
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
            logger.debug(f"Generating text with ONNX model: {self.model_name}")
            
            # Tokenize the prompt
            inputs = self.tokenizer(prompt, return_tensors="np")
            input_ids = inputs["input_ids"]
            attention_mask = inputs["attention_mask"]
            
            # Prepare inputs for the model
            ort_inputs = {
                "input_ids": input_ids,
                "attention_mask": attention_mask
            }
            
            # Add additional inputs if required by the model
            for input_name in self.ort_session.get_inputs():
                if input_name.name not in ort_inputs:
                    if input_name.name == "token_type_ids" and "token_type_ids" in inputs:
                        ort_inputs["token_type_ids"] = inputs["token_type_ids"]
            
            # Generate text
            if stream:
                return await self._generate_stream(ort_inputs, max_tokens, temperature, top_p, top_k, 
                                                 repetition_penalty, stop_sequences, callback, **kwargs)
            else:
                return await self._generate_complete(ort_inputs, max_tokens, temperature, top_p, top_k, 
                                                   repetition_penalty, stop_sequences, **kwargs)
                
        except Exception as e:
            logger.error(f"Error generating text with ONNX model: {str(e)}")
            raise
    
    async def _generate_complete(self, 
                               ort_inputs: Dict[str, np.ndarray],
                               max_tokens: int,
                               temperature: float,
                               top_p: float,
                               top_k: int,
                               repetition_penalty: float,
                               stop_sequences: Optional[List[str]],
                               **kwargs) -> str:
        """
        Generate complete text at once.
        
        Args:
            ort_inputs: ONNX Runtime inputs
            max_tokens: Maximum number of tokens to generate
            temperature: Controls randomness of output
            top_p: Nucleus sampling parameter
            top_k: Top-k sampling parameter
            repetition_penalty: Penalty for token repetition
            stop_sequences: Sequences that stop generation
            **kwargs: Additional parameters
            
        Returns:
            Generated text
        """
        # For complete generation, we'll use a simplified approach
        # In a real implementation, this would use the model's generation capabilities
        
        # Run inference
        outputs = self.ort_session.run(None, ort_inputs)
        
        # Process outputs based on model architecture
        # This is a simplified example and would need to be adapted for specific models
        if len(outputs) > 0 and isinstance(outputs[0], np.ndarray):
            output_ids = outputs[0]
            
            # Decode the output
            decoded_text = self.tokenizer.decode(output_ids[0], skip_special_tokens=True)
            
            # Check for stop sequences
            if stop_sequences:
                for stop_seq in stop_sequences:
                    if stop_seq in decoded_text:
                        decoded_text = decoded_text[:decoded_text.find(stop_seq)]
            
            return decoded_text
        
        return "Error: Unable to generate text with this model"
    
    async def _generate_stream(self,
                             ort_inputs: Dict[str, np.ndarray],
                             max_tokens: int,
                             temperature: float,
                             top_p: float,
                             top_k: int,
                             repetition_penalty: float,
                             stop_sequences: Optional[List[str]],
                             callback: Optional[Callable[[str], None]],
                             **kwargs) -> None:
        """
        Stream generated text token by token.
        
        Args:
            ort_inputs: ONNX Runtime inputs
            max_tokens: Maximum number of tokens to generate
            temperature: Controls randomness of output
            top_p: Nucleus sampling parameter
            top_k: Top-k sampling parameter
            repetition_penalty: Penalty for token repetition
            stop_sequences: Sequences that stop generation
            callback: Callback function for streaming
            **kwargs: Additional parameters
        """
        # This is a simplified implementation
        # In a real implementation, this would generate tokens one by one
        
        # For demonstration, we'll generate the complete text and then simulate streaming
        complete_text = await self._generate_complete(
            ort_inputs, max_tokens, temperature, top_p, top_k, 
            repetition_penalty, stop_sequences, **kwargs
        )
        
        # Simulate streaming by sending chunks
        if callback:
            words = complete_text.split()
            for i in range(0, len(words), 3):  # Send 3 words at a time
                chunk = " ".join(words[i:i+3])
                callback(chunk + " ")
                await asyncio.sleep(0.1)  # Simulate generation time
    
    async def get_stats(self) -> Dict[str, Any]:
        """
        Get model statistics.
        
        Returns:
            Dictionary of model statistics
        """
        stats = {
            "loaded": self.is_loaded,
            "model_name": self.model_name,
            "model_type": "onnx",
            "device": self.device
        }
        
        if self.is_loaded and self.ort_session:
            # Add ONNX Runtime specific stats
            stats.update({
                "providers": self.ort_session.get_providers(),
                "input_names": [input.name for input in self.ort_session.get_inputs()],
                "output_names": [output.name for output in self.ort_session.get_outputs()]
            })
        
        return stats
    
    def get_metadata(self) -> Dict[str, Any]:
        """
        Get model metadata.
        
        Returns:
            Dictionary of model metadata
        """
        return self.metadata
