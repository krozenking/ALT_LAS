"""
Vision data models for AI Orchestrator.
"""
from typing import Dict, Any, Optional, List, Union
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    """Bounding box for object detection."""
    x: float
    y: float
    width: float
    height: float
    confidence: float


class DetectedObject(BaseModel):
    """Detected object model."""
    label: str
    confidence: float
    box: BoundingBox


class ObjectDetectionResult(BaseModel):
    """Object detection result model."""
    objects: List[DetectedObject]
    model_id: str
    processing_time: float
    image_dimensions: Dict[str, int]
    metadata: Dict[str, Any] = Field(default_factory=dict)


class VisionRequest(BaseModel):
    """Vision request model."""
    model_id: str
    image_data: bytes
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)


class VisionResponse(BaseModel):
    """Vision response model."""
    model_id: str
    results: Union[List[Dict[str, Any]], Dict[str, Any], str]
    processing_time: float
    metadata: Dict[str, Any] = Field(default_factory=dict)
