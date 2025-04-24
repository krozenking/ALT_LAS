"""
Main API module for AI Orchestrator

This module provides the FastAPI application with enhanced endpoints
for AI model management, OS integration, and advanced features.
"""

import logging
import asyncio
from typing import Dict, Any, List, Optional, Union
import os
import json
from datetime import datetime

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Query, Body, File, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from .config import config
from .models.enhanced_model_manager import EnhancedModelManager
from .integration.os_integration import OSIntegrationManager
from .schemas.requests import (
    LLMRequest, VisionRequest, VoiceRequest, 
    BatchProcessRequest, ModelVersionRequest
)
from .schemas.responses import (
    LLMResponse, VisionResponse, VoiceResponse,
    BatchProcessResponse, StatusResponse, StatsResponse
)

logger = logging.getLogger("ai_orchestrator.main")

app = FastAPI(
    title="AI Orchestrator API",
    description="Advanced AI model orchestration with OS integration",
    version="0.2.0"
)

# Global instances
os_integration_manager = None
model_manager = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global os_integration_manager, model_manager
    
    logger.info("Initializing AI Orchestrator services")
    
    # Initialize OS Integration Manager
    os_integration_manager = OSIntegrationManager()
    await os_integration_manager.initialize()
    
    # Initialize Enhanced Model Manager with OS Integration
    model_manager = EnhancedModelManager(os_integration_manager)
    await model_manager.initialize()
    
    logger.info("AI Orchestrator services initialized successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown"""
    global os_integration_manager, model_manager
    
    logger.info("Shutting down AI Orchestrator services")
    
    if model_manager:
        await model_manager.cleanup()
    
    if os_integration_manager:
        await os_integration_manager.cleanup()
    
    logger.info("AI Orchestrator services shut down successfully")

# Dependency to get the model manager
async def get_model_manager():
    """Get the model manager instance"""
    if model_manager is None:
        raise HTTPException(status_code=503, detail="Model manager not initialized")
    return model_manager

# Dependency to get the OS integration manager
async def get_os_integration():
    """Get the OS integration manager instance"""
    if os_integration_manager is None:
        raise HTTPException(status_code=503, detail="OS integration manager not initialized")
    return os_integration_manager

@app.get("/", tags=["General"])
async def root():
    """Root endpoint returning service information"""
    return {
        "service": "AI Orchestrator",
        "version": "0.2.0",
        "status": "running",
        "documentation": "/docs"
    }

@app.get("/health", tags=["General"])
async def health_check(
    model_manager: EnhancedModelManager = Depends(get_model_manager),
    os_integration: OSIntegrationManager = Depends(get_os_integration)
):
    """Health check endpoint"""
    try:
        model_status = await model_manager.get_status()
        platform_info = await os_integration.get_platform_info()
        
        return {
            "status": "healthy",
            "uptime": model_manager.get_uptime(),
            "models": model_status,
            "platform": platform_info
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@app.post("/api/llm", response_model=LLMResponse, tags=["Models"])
async def process_llm(
    request: LLMRequest,
    model_manager: EnhancedModelManager = Depends(get_model_manager)
):
    """Process a request using the LLM model"""
    try:
        result = await model_manager.process_llm(
            request.input,
            request.parameters.dict() if request.parameters else None
        )
        
        return LLMResponse(
            result=result,
            model_type="llm",
            status="success"
        )
    except Exception as e:
        logger.error(f"Error processing LLM request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/vision", response_model=VisionResponse, tags=["Models"])
async def process_vision(
    request: VisionRequest,
    model_manager: EnhancedModelManager = Depends(get_model_manager)
):
    """Process a request using the Vision model"""
    try:
        result = await model_manager.process_vision(
            request.input,
            request.parameters.dict() if request.parameters else None
        )
        
        return VisionResponse(
            result=result,
            model_type="vision",
            status="success"
        )
    except Exception as e:
        logger.error(f"Error processing Vision request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice", response_model=VoiceResponse, tags=["Models"])
async def process_voice(
    request: VoiceRequest,
    model_manager: EnhancedModelManager = Depends(get_model_manager)
):
    """Process a request using the Voice model"""
    try:
        result = await model_manager.process_voice(
            request.input,
            request.parameters.dict() if request.parameters else None
        )
        
        return VoiceResponse(
            result=result,
            model_type="voice",
            status="success"
        )
    except Exception as e:
        logger.error(f"Error processing Voice request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/batch", response_model=BatchProcessResponse, tags=["Models"])
async def process_batch(
    request: BatchProcessRequest,
    model_manager: EnhancedModelManager = Depends(get_model_manager)
):
    """Process a batch of requests using multiple models"""
    try:
        results = await model_manager.process_batch(
            [req.dict() for req in request.requests]
        )
        
        return BatchProcessResponse(
            results=results,
            status="success"
        )
    except Exception as e:
        logger.error(f"Error processing batch request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models/info", tags=["Models"])
async def get_models_info(
    model_manager: EnhancedModelManager = Depends(get_model_manager)
):
    """Get information about available models"""
    try:
        info = await model_manager.get_models_info()
        return info
    except Exception as e:
        logger.error(f"Error getting models info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models/status", response_model=StatusResponse, tags=["Models"])
async def get_models_status(
    model_manager: EnhancedModelManager = Depends(get_model_manager)
):
    """Get status of all models"""
    try:
        status = await model_manager.get_status()
        return StatusResponse(
            status=status,
            uptime=model_manager.get_uptime()
        )
    except Exception as e:
        logger.error(f"Error getting models status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models/stats", response_model=StatsResponse, tags=["Models"])
async def get_models_stats(
    model_manager: EnhancedModelManager = Depends(get_model_manager)
):
    """Get usage statistics for all models"""
    try:
        stats = await model_manager.get_stats()
        return StatsResponse(
            stats=stats,
            uptime=model_manager.get_uptime()
        )
    except Exception as e:
        logger.error(f"Error getting models stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/models/version", tags=["Models"])
async def switch_model_version(
    request: ModelVersionRequest,
    model_manager: EnhancedModelManager = Depends(get_model_manager)
):
    """Switch to a different version of a model"""
    try:
        success = await model_manager.switch_model_version(
            request.model_type,
            request.version
        )
        
        if success:
            return {"status": "success", "message": f"Switched {request.model_type} to version {request.version}"}
        else:
            return {"status": "error", "message": f"Failed to switch {request.model_type} to version {request.version}"}
    except Exception as e:
        logger.error(f"Error switching model version: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models/versions/{model_type}", tags=["Models"])
async def get_available_versions(
    model_type: str,
    model_manager: EnhancedModelManager = Depends(get_model_manager)
):
    """Get available versions for a specific model type"""
    try:
        versions = await model_manager.get_available_versions(model_type)
        return {"model_type": model_type, "versions": versions}
    except Exception as e:
        logger.error(f"Error getting available versions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/models/cache/clear", tags=["Models"])
async def clear_cache(
    model_type: Optional[str] = None,
    model_manager: EnhancedModelManager = Depends(get_model_manager)
):
    """Clear the model cache for a specific model type or all models"""
    try:
        cleared = await model_manager.clear_cache(model_type)
        return {"status": "success", "cleared": cleared}
    except Exception as e:
        logger.error(f"Error clearing cache: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/platform/info", tags=["OS Integration"])
async def get_platform_info(
    os_integration: OSIntegrationManager = Depends(get_os_integration)
):
    """Get platform information"""
    try:
        info = await os_integration.get_platform_info()
        return info
    except Exception as e:
        logger.error(f"Error getting platform info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/platform/screenshot", tags=["OS Integration"])
async def capture_screenshot(
    save_dir: Optional[str] = None,
    os_integration: OSIntegrationManager = Depends(get_os_integration)
):
    """Capture a screenshot of the current desktop"""
    try:
        result = await os_integration.capture_screenshot(save_dir)
        return result
    except Exception as e:
        logger.error(f"Error capturing screenshot: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/platform/processes", tags=["OS Integration"])
async def list_processes(
    os_integration: OSIntegrationManager = Depends(get_os_integration)
):
    """List running processes on the system"""
    try:
        result = await os_integration.list_processes()
        return result
    except Exception as e:
        logger.error(f"Error listing processes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/platform/directory", tags=["OS Integration"])
async def list_directory(
    path: str,
    os_integration: OSIntegrationManager = Depends(get_os_integration)
):
    """List contents of a directory"""
    try:
        result = await os_integration.list_directory(path)
        return result
    except Exception as e:
        logger.error(f"Error listing directory: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/platform/resources", tags=["OS Integration"])
async def get_system_resources(
    os_integration: OSIntegrationManager = Depends(get_os_integration)
):
    """Get current system resource usage"""
    try:
        result = await os_integration.get_system_resources()
        return result
    except Exception as e:
        logger.error(f"Error getting system resources: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/platform/monitor/start", tags=["OS Integration"])
async def start_resource_monitoring(
    interval_seconds: int = Query(5, ge=1, le=60),
    max_samples: int = Query(100, ge=10, le=1000),
    os_integration: OSIntegrationManager = Depends(get_os_integration)
):
    """Start monitoring system resources at regular intervals"""
    try:
        success = await os_integration.start_resource_monitoring(interval_seconds, max_samples)
        if success:
            return {"status": "success", "message": f"Started resource monitoring with interval {interval_seconds}s"}
        else:
            return {"status": "error", "message": "Failed to start resource monitoring"}
    except Exception as e:
        logger.error(f"Error starting resource monitoring: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/platform/monitor/stop", tags=["OS Integration"])
async def stop_resource_monitoring(
    os_integration: OSIntegrationManager = Depends(get_os_integration)
):
    """Stop monitoring system resources"""
    try:
        success = await os_integration.stop_resource_monitoring()
        if success:
            return {"status": "success", "message": "Stopped resource monitoring"}
        else:
            return {"status": "error", "message": "Failed to stop resource monitoring"}
    except Exception as e:
        logger.error(f"Error stopping resource monitoring: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/platform/monitor/history", tags=["OS Integration"])
async def get_resource_history(
    os_integration: OSIntegrationManager = Depends(get_os_integration)
):
    """Get the history of resource usage samples"""
    try:
        history = os_integration.get_resource_history()
        return {"status": "success", "history": history}
    except Exception as e:
        logger.error(f"Error getting resource history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
