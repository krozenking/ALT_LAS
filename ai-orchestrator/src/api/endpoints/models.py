"""
Models API endpoints for AI Orchestrator.
"""
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, Query, Body, status

from ...models.model import ModelInfo, ModelStatus
from ...services.model_manager import ModelManager, get_model_manager
from ...core.model_registry import ModelRegistry, get_model_registry # Import ModelRegistry

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=List[ModelInfo])
async def list_models(
    model_manager: ModelManager = Depends(get_model_manager),
    type_filter: Optional[str] = Query(None, description="Filter models by type")
):
    """
    List all available models from the registry.
    
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
    Get information about a specific model from the registry.
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

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=ModelInfo)
async def register_model(
    model_info: ModelInfo,
    model_registry: ModelRegistry = Depends(get_model_registry)
):
    """
    Register a new model or update an existing one in the registry.
    """
    try:
        success = await model_registry.register_model(model_info)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to register model")
        
        # Return the registered model info
        registered_info = await model_registry.get_model_info(model_info.model_id)
        if not registered_info:
             raise HTTPException(status_code=500, detail="Failed to retrieve registered model info")
        return registered_info
    except Exception as e:
        logger.error(f"Error registering model {model_info.model_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to register model: {str(e)}")

@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_model(
    model_id: str,
    delete_files: bool = Query(False, description="Delete model files from disk"),
    model_registry: ModelRegistry = Depends(get_model_registry)
):
    """
    Delete a model from the registry.
    """
    try:
        success = await model_registry.delete_model(model_id, delete_files)
        if not success:
            # Check if model exists
            model_info = await model_registry.get_model_info(model_id)
            if not model_info:
                 raise HTTPException(status_code=404, detail=f"Model {model_id} not found")
            else:
                 raise HTTPException(status_code=500, detail="Failed to delete model")
        return
    except Exception as e:
        logger.error(f"Error deleting model {model_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete model: {str(e)}")

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
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
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
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
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
            raise HTTPException(status_code=404, detail=f"Model {model_id} not found or status unavailable")
        return status
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting status for model {model_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get model status: {str(e)}")

@router.get("/{model_id}/versions", response_model=Dict[str, Dict[str, Any]])
async def get_model_versions(
    model_id: str,
    model_registry: ModelRegistry = Depends(get_model_registry)
):
    """
    Get all registered versions for a model.
    """
    try:
        versions = await model_registry.get_model_versions(model_id)
        if not versions:
            # Check if model exists at all
            model_info = await model_registry.get_model_info(model_id)
            if not model_info:
                raise HTTPException(status_code=404, detail=f"Model {model_id} not found")
        return versions
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting versions for model {model_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get model versions: {str(e)}")

@router.post("/{model_id}/versions", status_code=status.HTTP_201_CREATED)
async def add_model_version(
    model_id: str,
    version: str = Body(..., embed=True),
    path: str = Body(..., embed=True),
    model_registry: ModelRegistry = Depends(get_model_registry)
):
    """
    Add a new version to a model.
    """
    try:
        success = await model_registry.add_model_version(model_id, version, path)
        if not success:
            # Check if model exists
            model_info = await model_registry.get_model_info(model_id)
            if not model_info:
                 raise HTTPException(status_code=404, detail=f"Model {model_id} not found")
            else:
                 raise HTTPException(status_code=400, detail=f"Failed to add version {version} to model {model_id}")
        return {"message": f"Version {version} added successfully to model {model_id}"}
    except Exception as e:
        logger.error(f"Error adding version {version} to model {model_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add model version: {str(e)}")

@router.post("/{model_id}/versions/activate", status_code=status.HTTP_200_OK)
async def activate_model_version(
    model_id: str,
    version: str = Body(..., embed=True),
    model_registry: ModelRegistry = Depends(get_model_registry)
):
    """
    Activate a specific version of a model.
    """
    try:
        success = await model_registry.activate_model_version(model_id, version)
        if not success:
            # Check if model/version exists
            model_info = await model_registry.get_model_info(model_id)
            if not model_info:
                 raise HTTPException(status_code=404, detail=f"Model {model_id} not found")
            versions = await model_registry.get_model_versions(model_id)
            if version not in versions:
                 raise HTTPException(status_code=404, detail=f"Version {version} not found for model {model_id}")
            else:
                 raise HTTPException(status_code=500, detail=f"Failed to activate version {version} for model {model_id}")
        return {"message": f"Version {version} activated successfully for model {model_id}"}
    except Exception as e:
        logger.error(f"Error activating version {version} for model {model_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to activate model version: {str(e)}")

