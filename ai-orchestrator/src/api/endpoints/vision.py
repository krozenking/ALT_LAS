"""
Vision API endpoints for AI Orchestrator.
"""
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Query

from ...models.vision import VisionRequest, VisionResponse, ObjectDetectionResult
from ...services.vision_service import VisionService, get_vision_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/object-detection", response_model=ObjectDetectionResult)
async def detect_objects(
    image: UploadFile = File(...),
    confidence: float = Form(0.5),
    model_id: Optional[str] = Form("yolo-v8"),
    vision_service: VisionService = Depends(get_vision_service)
):
    """
    Detect objects in an image using object detection models.
    """
    try:
        image_data = await image.read()
        result = await vision_service.detect_objects(
            image_data=image_data,
            confidence=confidence,
            model_id=model_id
        )
        return result
    except Exception as e:
        logger.error(f"Error during object detection: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Object detection failed: {str(e)}")

@router.post("/ocr", response_model=VisionResponse)
async def perform_ocr(
    image: UploadFile = File(...),
    language: str = Form("en"),
    vision_service: VisionService = Depends(get_vision_service)
):
    """
    Perform OCR (Optical Character Recognition) on an image.
    """
    try:
        image_data = await image.read()
        result = await vision_service.perform_ocr(
            image_data=image_data,
            language=language
        )
        return result
    except Exception as e:
        logger.error(f"Error during OCR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)}")

@router.post("/image-classification", response_model=VisionResponse)
async def classify_image(
    image: UploadFile = File(...),
    model_id: Optional[str] = Form(None),
    top_k: int = Form(5),
    vision_service: VisionService = Depends(get_vision_service)
):
    """
    Classify an image using image classification models.
    """
    try:
        image_data = await image.read()
        result = await vision_service.classify_image(
            image_data=image_data,
            model_id=model_id,
            top_k=top_k
        )
        return result
    except Exception as e:
        logger.error(f"Error during image classification: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Image classification failed: {str(e)}")

@router.post("/image-segmentation", response_model=VisionResponse)
async def segment_image(
    image: UploadFile = File(...),
    model_id: Optional[str] = Form(None),
    vision_service: VisionService = Depends(get_vision_service)
):
    """
    Perform semantic segmentation on an image.
    """
    try:
        image_data = await image.read()
        result = await vision_service.segment_image(
            image_data=image_data,
            model_id=model_id
        )
        return result
    except Exception as e:
        logger.error(f"Error during image segmentation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Image segmentation failed: {str(e)}")
