"""
Inference data models for AI Orchestrator.
"""
from typing import Dict, Any, Optional, List, Union
from pydantic import BaseModel, Field


class InferenceRequest(BaseModel):
    """Inference request model."""
    model_id: str
    inputs: Union[str, Dict[str, Any], List[Any]]
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    class Config:
        schema_extra = {
            "example": {
                "model_id": "llama2-7b-q4",
                "inputs": "What is the capital of France?",
                "parameters": {
                    "max_tokens": 100,
                    "temperature": 0.7,
                    "top_p": 0.95
                }
            }
        }


class InferenceResponse(BaseModel):
    """Inference response model."""
    model_id: str
    outputs: Union[str, Dict[str, Any], List[Any]]
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        schema_extra = {
            "example": {
                "model_id": "llama2-7b-q4",
                "outputs": "The capital of France is Paris.",
                "metadata": {
                    "tokens_generated": 7,
                    "generation_time_ms": 150,
                    "model_version": "2.0"
                }
            }
        }
