"""
Model data models for AI Orchestrator.
"""
from enum import Enum
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field


class ModelType(str, Enum):
    """Model type enumeration."""
    LLM = "llm"
    VISION = "vision"
    AUDIO = "audio"
    MULTIMODAL = "multimodal"


class ModelStatus(BaseModel):
    """Model status information."""
    model_id: str
    loaded: bool
    status: str = Field(..., description="Model status: 'ready', 'loading', 'unloading', 'error'")
    error: Optional[str] = None
    memory_usage: Optional[int] = Field(None, description="Memory usage in MB")
    gpu_usage: Optional[int] = Field(None, description="GPU memory usage in MB")
    instances: int = Field(1, description="Number of model instances")
    last_used: Optional[str] = None
    uptime: Optional[int] = Field(None, description="Uptime in seconds")


class ModelInfo(BaseModel):
    """Model information."""
    model_id: str
    name: str
    type: ModelType
    description: Optional[str] = None
    version: str
    size: Optional[int] = Field(None, description="Model size in MB")
    parameters: Optional[int] = Field(None, description="Number of parameters in millions")
    context_length: Optional[int] = None
    quantization: Optional[str] = None
    supports_gpu: bool = True
    supports_cpu: bool = True
    tags: List[str] = []
    metadata: Dict[str, Any] = {}
    status: Optional[ModelStatus] = None
    
    class Config:
        schema_extra = {
            "example": {
                "model_id": "llama2-7b-q4",
                "name": "Llama 2 7B Chat (Q4)",
                "type": "llm",
                "description": "Llama 2 7B chat model with 4-bit quantization",
                "version": "2.0",
                "size": 4096,
                "parameters": 7000,
                "context_length": 4096,
                "quantization": "Q4_K_M",
                "supports_gpu": True,
                "supports_cpu": True,
                "tags": ["llm", "chat", "quantized"],
                "metadata": {
                    "license": "llama2",
                    "family": "llama"
                }
            }
        }
