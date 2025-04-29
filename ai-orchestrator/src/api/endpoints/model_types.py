"""
API endpoints for model types in AI Orchestrator.

This module provides API endpoints for interacting with the extended model types
and adapter system.
"""
import logging
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, Depends

from ...models.model import ModelInfo, ModelStatus
from ...services.extended_model_manager import get_extended_model_manager, ExtendedModelManager
from ...core.model_adapters import ExtendedModelType

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/model-types",
    tags=["model-types"],
    responses={404: {"description": "Not found"}},
)

async def get_manager() -> ExtendedModelManager:
    """Dependency to get the extended model manager."""
    return get_extended_model_manager()


@router.get("/", response_model=List[str])
async def list_model_types(manager: ExtendedModelManager = Depends(get_manager)):
    """
    List all supported model types.
    
    Returns:
        List of supported model type values
    """
    return await manager.list_supported_model_types()


@router.get("/{model_type}/metadata-schema", response_model=Dict[str, Any])
async def get_model_type_metadata_schema(
    model_type: str,
    manager: ExtendedModelManager = Depends(get_manager)
):
    """
    Get the metadata schema for a model type.
    
    Args:
        model_type: Type of model
        
    Returns:
        Dictionary describing the metadata schema
    """
    try:
        # Create a temporary model info to get the adapter
        model_info = ModelInfo(
            model_id="temp",
            name="Temporary Model",
            type=model_type,
            version="1.0"
        )
        
        # Get adapter for this model type
        adapter = manager.adapter_factory.get_adapter_for_model(model_info)
        
        # Get metadata schema
        return adapter.get_metadata_schema()
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting metadata schema for model type {model_type}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{model_type}/config-schema", response_model=Dict[str, Any])
async def get_model_type_config_schema(
    model_type: str,
    manager: ExtendedModelManager = Depends(get_manager)
):
    """
    Get the configuration schema for a model type.
    
    Args:
        model_type: Type of model
        
    Returns:
        Dictionary describing the configuration schema
    """
    try:
        # Create a temporary model info to get the adapter
        model_info = ModelInfo(
            model_id="temp",
            name="Temporary Model",
            type=model_type,
            version="1.0"
        )
        
        # Get adapter for this model type
        adapter = manager.adapter_factory.get_adapter_for_model(model_info)
        
        # Get configuration schema
        return adapter.get_config_schema()
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting config schema for model type {model_type}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{model_type}/models", response_model=List[ModelInfo])
async def list_models_by_type(
    model_type: str,
    manager: ExtendedModelManager = Depends(get_manager)
):
    """
    List all models of a specific type.
    
    Args:
        model_type: Type of model
        
    Returns:
        List of model info objects
    """
    try:
        return await manager.list_models(type_filter=model_type)
    except Exception as e:
        logger.error(f"Error listing models of type {model_type}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
