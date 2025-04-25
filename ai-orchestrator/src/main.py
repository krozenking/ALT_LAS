"""
Main application module for AI Orchestrator.
"""
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .core.config import settings
from .api.router import api_router
from .core.logging import setup_logging

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI application.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting AI Orchestrator service")
    # Initialize model management system
    # TODO: Implement model loading and initialization
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI Orchestrator service")
    # Cleanup resources
    # TODO: Implement model unloading and resource cleanup

# Create FastAPI application
app = FastAPI(
    title="AI Orchestrator",
    description="AI model management and orchestration service for ALT_LAS",
    version="0.1.0",
    lifespan=lifespan,
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup logging
setup_logging()

# Include API router
app.include_router(api_router, prefix="/api")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "ai-orchestrator"}

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "AI Orchestrator",
        "version": "0.1.0",
        "documentation": "/docs",
    }
