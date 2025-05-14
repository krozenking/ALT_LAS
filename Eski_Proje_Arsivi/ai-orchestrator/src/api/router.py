"""
API router for AI Orchestrator.
"""
from fastapi import APIRouter

from .endpoints import models, inference, vision, audio

# Create API router
api_router = APIRouter()

# Include routers from endpoint modules
api_router.include_router(models.router, prefix="/models", tags=["models"])
api_router.include_router(inference.router, prefix="/inference", tags=["inference"])
api_router.include_router(vision.router, prefix="/vision", tags=["vision"])
api_router.include_router(audio.router, prefix="/audio", tags=["audio"])
