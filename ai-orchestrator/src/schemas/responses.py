"""
Response schema definitions for AI Orchestrator API.

This module contains Pydantic models for response schemas.
"""

from typing import Dict, Any, List, Optional, Union
from pydantic import BaseModel, Field
from datetime import datetime


class BaseResponse(BaseModel):
    """Base response model"""
    status: str = Field(..., description="Status of the request: success or error")
    timestamp: datetime = Field(default_factory=datetime.now, description="Timestamp of the response")


class LLMResponse(BaseResponse):
    """Response model for LLM processing"""
    result: str = Field(..., description="Generated text result")
    model_type: str = Field("llm", description="Model type used for processing")
    model_name: Optional[str] = Field(None, description="Name of the model used")
    tokens_used: Optional[int] = Field(None, description="Number of tokens used")
    processing_time: Optional[float] = Field(None, description="Processing time in seconds")


class VisionResponse(BaseResponse):
    """Response model for Vision processing"""
    result: Union[str, Dict[str, Any]] = Field(..., description="Vision processing result")
    model_type: str = Field("vision", description="Model type used for processing")
    model_name: Optional[str] = Field(None, description="Name of the model used")
    detected_objects: Optional[List[Dict[str, Any]]] = Field(None, description="Detected objects in the image")
    ocr_text: Optional[str] = Field(None, description="OCR extracted text")
    processing_time: Optional[float] = Field(None, description="Processing time in seconds")


class VoiceResponse(BaseResponse):
    """Response model for Voice processing"""
    result: str = Field(..., description="Transcribed or translated text")
    model_type: str = Field("voice", description="Model type used for processing")
    model_name: Optional[str] = Field(None, description="Name of the model used")
    confidence: Optional[float] = Field(None, description="Confidence score")
    language: Optional[str] = Field(None, description="Detected or specified language")
    processing_time: Optional[float] = Field(None, description="Processing time in seconds")


class BatchResultItem(BaseModel):
    """Single result item in a batch response"""
    type: str = Field(..., description="Request type: llm, vision, or voice")
    result: Union[str, Dict[str, Any]] = Field(..., description="Processing result")
    model_name: Optional[str] = Field(None, description="Name of the model used")
    processing_time: Optional[float] = Field(None, description="Processing time in seconds")
    status: str = Field(..., description="Status of the individual request")


class BatchProcessResponse(BaseResponse):
    """Response model for batch processing"""
    results: List[BatchResultItem] = Field(..., description="List of processing results")
    total_time: Optional[float] = Field(None, description="Total processing time in seconds")


class ModelInfo(BaseModel):
    """Model information"""
    name: str = Field(..., description="Model name")
    type: str = Field(..., description="Model type: llm, vision, or voice")
    version: str = Field(..., description="Model version")
    description: Optional[str] = Field(None, description="Model description")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Model parameters")
    capabilities: Optional[List[str]] = Field(None, description="Model capabilities")
    loaded: bool = Field(..., description="Whether the model is currently loaded")
    local: bool = Field(..., description="Whether the model is local or remote")
    quantized: Optional[str] = Field(None, description="Quantization type if applicable")
    size_mb: Optional[float] = Field(None, description="Model size in MB")


class StatusResponse(BaseResponse):
    """Response model for status information"""
    status: Dict[str, Any] = Field(..., description="Status information")
    uptime: float = Field(..., description="Service uptime in seconds")
    models_loaded: int = Field(..., description="Number of models currently loaded")
    gpu_available: bool = Field(..., description="Whether GPU is available")
    memory_usage: Optional[Dict[str, Any]] = Field(None, description="Memory usage information")


class StatsResponse(BaseResponse):
    """Response model for statistics information"""
    stats: Dict[str, Any] = Field(..., description="Statistics information")
    uptime: float = Field(..., description="Service uptime in seconds")
    total_requests: int = Field(..., description="Total number of requests processed")
    average_response_time: Optional[float] = Field(None, description="Average response time in seconds")
    model_usage: Optional[Dict[str, int]] = Field(None, description="Model usage counts")


class ModelVersionsResponse(BaseResponse):
    """Response model for model versions information"""
    model_type: str = Field(..., description="Model type")
    versions: List[str] = Field(..., description="Available versions")
    current_version: Optional[str] = Field(None, description="Currently active version")


class ModelLoadResponse(BaseResponse):
    """Response model for model loading operation"""
    model_type: str = Field(..., description="Model type")
    model_name: str = Field(..., description="Model name")
    success: bool = Field(..., description="Whether the loading was successful")
    message: str = Field(..., description="Status message")
    load_time: Optional[float] = Field(None, description="Time taken to load the model in seconds")
"""
