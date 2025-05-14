"""
Audio data models for AI Orchestrator.
"""
from typing import Dict, Any, Optional, List, Union
from pydantic import BaseModel, Field


class TranscriptionSegment(BaseModel):
    """Segment of transcribed audio."""
    text: str
    start: float
    end: float
    confidence: Optional[float] = None
    speaker: Optional[str] = None


class TranscriptionResult(BaseModel):
    """Transcription result model."""
    text: str
    segments: List[TranscriptionSegment]
    language: str
    model_id: str
    processing_time: float
    audio_duration: float
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AudioRequest(BaseModel):
    """Audio request model."""
    model_id: str
    audio_data: bytes
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)


class AudioResponse(BaseModel):
    """Audio response model."""
    model_id: str
    results: Union[Dict[str, Any], List[Dict[str, Any]], str, bytes]
    processing_time: float
    metadata: Dict[str, Any] = Field(default_factory=dict)
