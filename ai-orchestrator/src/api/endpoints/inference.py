"""
Inference API endpoints for AI Orchestrator.
"""
import logging
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, HTTPException, Depends, Body

from ...models.inference import InferenceRequest, InferenceResponse
from ...services.inference_service import InferenceService, get_inference_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=InferenceResponse)
async def run_inference(
    request: InferenceRequest,
    inference_service: InferenceService = Depends(get_inference_service)
):
    """
    Run inference using the specified model.
    """
    try:
        response = await inference_service.run_inference(request)
        return response
    except Exception as e:
        logger.error(f"Error during inference: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

@router.post("/batch", response_model=List[InferenceResponse])
async def run_batch_inference(
    requests: List[InferenceRequest],
    inference_service: InferenceService = Depends(get_inference_service)
):
    """
    Run batch inference using the specified models.
    """
    try:
        responses = await inference_service.run_batch_inference(requests)
        return responses
    except Exception as e:
        logger.error(f"Error during batch inference: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch inference failed: {str(e)}")

@router.post("/parallel", response_model=List[InferenceResponse])
async def run_parallel_inference(
    request: InferenceRequest,
    model_ids: List[str] = Body(..., embed=True),
    inference_service: InferenceService = Depends(get_inference_service)
):
    """
    Run inference in parallel using multiple models for the same input.
    """
    try:
        responses = await inference_service.run_parallel_inference(request, model_ids)
        return responses
    except Exception as e:
        logger.error(f"Error during parallel inference: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Parallel inference failed: {str(e)}")

@router.post("/orchestrated", response_model=InferenceResponse)
async def run_orchestrated_inference(
    request: InferenceRequest,
    strategy: Optional[str] = Body("auto", embed=True),
    inference_service: InferenceService = Depends(get_inference_service)
):
    """
    Run orchestrated inference using the optimal model selection strategy.
    """
    try:
        response = await inference_service.run_orchestrated_inference(request, strategy)
        return response
    except Exception as e:
        logger.error(f"Error during orchestrated inference: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Orchestrated inference failed: {str(e)}")
