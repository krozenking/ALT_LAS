"""
Models API endpoints for AI Orchestrator.
"""
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, Query

from ...models.model import ModelInfo, ModelStatus
from ...services.model_manager import ModelManager, get_model_manager

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=List[ModelInfo])
async def list_models(
    model_manager: ModelManager = Depends(get_model_manager),
    type_filter: Optional[str] = Query(None, description="Filter models by type")
):
    """
    List all available models.
    
    Optionally filter by model type.
    """
    try:
        models = await model_manager.list_models(type_filter=type_filter)
        return models
    except Exception as e:
        logger.error(f"Error listing models: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list models: {str(e)}")

@router.get("/{model_id}", response_model=ModelInfo)
async def get_model(
    model_id: str,
    model_manager: ModelManager = Depends(get_model_manager)
):
    """
    Get information about a specific model.
    """
    try:
        model = await model_manager.get_model(model_id)
        if not model:
            raise HTTPException(status_code=404, detail=f"Model {model_id} not found")
        return model
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting model {model_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get model: {str(e)}")

@router.post("/{model_id}/load", response_model=ModelStatus)
async def load_model(
    model_id: str,
    model_manager: ModelManager = Depends(get_model_manager)
):
    """
    Load a model into memory.
    """
    try:
        status = await model_manager.load_model(model_id)
        return status
    except Exception as e:
        logger.error(f"Error loading model {model_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")

@router.post("/{model_id}/unload", response_model=ModelStatus)
async def unload_model(
    model_id: str,
    model_manager: ModelManager = Depends(get_model_manager)
):
    """
    Unload a model from memory.
    """
    try:
        status = await model_manager.unload_model(model_id)
        return status
    except Exception as e:
        logger.error(f"Error unloading model {model_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to unload model: {str(e)}")

@router.get("/{model_id}/status", response_model=ModelStatus)
async def get_model_status(
    model_id: str,
    model_manager: ModelManager = Depends(get_model_manager)
):
    """
    Get the current status of a model.
    """
    try:
        status = await model_manager.get_model_status(model_id)
        if not status:
            raise HTTPException(status_code=404, detail=f"Model {model_id} not found")
        return status
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting status for model {model_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get model status: {str(e)}")
