"""
Request schema definitions for AI Orchestrator API.

This module contains Pydantic models for request schemas.
"""

from typing import Dict, Any, List, Optional, Union
from pydantic import BaseModel, Field


class ModelParameters(BaseModel):
    """Base model for model parameters"""
    temperature: Optional[float] = Field(0.7, ge=0, le=1.0, description="Controls randomness of output")
    max_tokens: Optional[int] = Field(1024, ge=1, description="Maximum number of tokens to generate")
    top_p: Optional[float] = Field(0.9, ge=0, le=1.0, description="Nucleus sampling parameter")
    top_k: Optional[int] = Field(40, ge=0, description="Top-k sampling parameter")
    stop_sequences: Optional[List[str]] = Field(None, description="Sequences that stop generation")
    repetition_penalty: Optional[float] = Field(1.0, ge=0, description="Penalty for token repetition")


class LLMRequest(BaseModel):
    """Request model for LLM processing"""
    input: str = Field(..., description="Input text to process")
    parameters: Optional[ModelParameters] = Field(None, description="Model parameters")
    model_name: Optional[str] = Field(None, description="Specific model name to use")
    stream: Optional[bool] = Field(False, description="Whether to stream the response")


class VisionRequest(BaseModel):
    """Request model for Vision processing"""
    input: str = Field(..., description="Image URL or base64 encoded image")
    parameters: Optional[ModelParameters] = Field(None, description="Model parameters")
    model_name: Optional[str] = Field(None, description="Specific model name to use")
    detect_objects: Optional[bool] = Field(False, description="Whether to detect objects in the image")
    ocr: Optional[bool] = Field(False, description="Whether to perform OCR on the image")


class VoiceRequest(BaseModel):
    """Request model for Voice processing"""
    input: str = Field(..., description="Audio URL or base64 encoded audio")
    parameters: Optional[ModelParameters] = Field(None, description="Model parameters")
    model_name: Optional[str] = Field(None, description="Specific model name to use")
    language: Optional[str] = Field("en", description="Language code for speech recognition")
    task: Optional[str] = Field("transcribe", description="Task type: transcribe or translate")


class BatchRequestItem(BaseModel):
    """Single item in a batch request"""
    type: str = Field(..., description="Request type: llm, vision, or voice")
    input: str = Field(..., description="Input for the request")
    parameters: Optional[ModelParameters] = Field(None, description="Model parameters")
    model_name: Optional[str] = Field(None, description="Specific model name to use")


class BatchProcessRequest(BaseModel):
    """Request model for batch processing"""
    requests: List[BatchRequestItem] = Field(..., description="List of requests to process")
    parallel: Optional[bool] = Field(True, description="Whether to process requests in parallel")


class ModelVersionRequest(BaseModel):
    """Request model for switching model version"""
    model_type: str = Field(..., description="Model type: llm, vision, or voice")
    version: str = Field(..., description="Version to switch to")


class ModelCacheRequest(BaseModel):
    """Request model for model cache operations"""
    model_type: Optional[str] = Field(None, description="Model type to clear cache for")


class ModelLoadRequest(BaseModel):
    """Request model for loading a model"""
    model_type: str = Field(..., description="Model type: llm, vision, or voice")
    model_name: str = Field(..., description="Name of the model to load")
    model_path: Optional[str] = Field(None, description="Path to model files if local")
    quantization: Optional[str] = Field(None, description="Quantization type: int8, int4, etc.")
    device: Optional[str] = Field("auto", description="Device to load model on: cpu, cuda, etc.")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Additional model parameters")
