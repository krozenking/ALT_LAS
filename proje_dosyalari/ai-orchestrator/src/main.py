"""
Main application module for AI Orchestrator.

This module initializes the FastAPI application and sets up the necessary
components for the AI Orchestrator service, including GPU optimizations.
"""
import logging
import time
import asyncio
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .core.config import settings
from .config.settings import config
from .api.router import api_router
from .core.logging import setup_logging
from .core.model_loader import get_model_loader
from .core.gpu_warmup import get_gpu_warmup_manager
from .core.gpu_memory_pool import get_gpu_memory_pool
from .core.model_cache import get_model_cache

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI application.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting AI Orchestrator service")

    # Initialize GPU warmup and memory management
    if config["gpu"].get("enabled", True):
        try:
            # Get GPU warmup manager
            gpu_warmup_manager = get_gpu_warmup_manager()

            # Initialize GPU warmup manager
            logger.info("Initializing GPU warmup manager")
            await gpu_warmup_manager.initialize()

            # Get GPU memory pool
            gpu_memory_pool = get_gpu_memory_pool()

            # Initialize GPU memory pool
            logger.info("Initializing GPU memory pool")
            await gpu_memory_pool.initialize()

            # Warm up GPU if configured
            if config["gpu"].get("warmup", {}).get("on_startup", True):
                logger.info("Warming up GPU")
                await gpu_warmup_manager.warmup_gpu()

            logger.info("GPU optimizations initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing GPU optimizations: {str(e)}")
            logger.warning("Continuing without GPU optimizations")

    # Initialize model loader
    try:
        model_loader = get_model_loader()

        # Initialize model loader
        logger.info("Initializing model loader")
        await model_loader.initialize()

        # Preload models if configured
        preload_models = config["models"].get("preload_models", [])
        if preload_models:
            logger.info(f"Preloading models: {', '.join(preload_models)}")
            preload_result = await model_loader.preload_models(preload_models)
            logger.info(f"Preloaded {len(preload_result.get('preloaded', []))} models successfully")

            if preload_result.get("failed"):
                logger.warning(f"Failed to preload {len(preload_result['failed'])} models: {', '.join(preload_result['failed'])}")
    except Exception as e:
        logger.error(f"Error initializing model loader: {str(e)}")

    # Initialize model cache
    try:
        model_cache = get_model_cache()
        logger.info("Model cache initialized")
    except Exception as e:
        logger.error(f"Error initializing model cache: {str(e)}")

    logger.info("AI Orchestrator service started successfully")

    yield

    # Shutdown
    logger.info("Shutting down AI Orchestrator service")

    # Cleanup GPU resources
    if config["gpu"].get("enabled", True):
        try:
            # Release GPU memory
            gpu_warmup_manager = get_gpu_warmup_manager()
            logger.info("Releasing GPU memory")
            await gpu_warmup_manager.release_memory()
        except Exception as e:
            logger.error(f"Error releasing GPU memory: {str(e)}")

    # Unload models
    try:
        model_loader = get_model_loader()

        # Get loaded models
        loaded_models = list(model_loader.loaded_models.keys())

        if loaded_models:
            logger.info(f"Unloading {len(loaded_models)} models")

            for model_id in loaded_models:
                try:
                    await model_loader.unload_model(model_id)
                    logger.info(f"Unloaded model {model_id}")
                except Exception as e:
                    logger.error(f"Error unloading model {model_id}: {str(e)}")
    except Exception as e:
        logger.error(f"Error during model cleanup: {str(e)}")

    logger.info("AI Orchestrator service shutdown complete")

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
    # Get GPU status if available
    gpu_status = {}
    try:
        if config["gpu"].get("enabled", True):
            gpu_warmup_manager = get_gpu_warmup_manager()
            gpu_status = {
                "gpu_enabled": True,
                "gpu_warmed_up": gpu_warmup_manager.is_warmed_up,
                "gpu_info": gpu_warmup_manager.get_memory_info()
            }
        else:
            gpu_status = {"gpu_enabled": False}
    except Exception as e:
        gpu_status = {"gpu_enabled": False, "error": str(e)}

    # Get model loader status if available
    model_status = {}
    try:
        model_loader = get_model_loader()
        model_status = {
            "loaded_models": len(model_loader.loaded_models),
            "models": list(model_loader.loaded_models.keys())
        }
    except Exception as e:
        model_status = {"error": str(e)}

    # Get cache status if available
    cache_status = {}
    try:
        model_cache = get_model_cache()
        cache_stats = asyncio.create_task(model_cache.get_stats())
        cache_status = {"stats": cache_stats}
    except Exception as e:
        cache_status = {"error": str(e)}

    return {
        "status": "ok",
        "service": "ai-orchestrator",
        "gpu": gpu_status,
        "models": model_status,
        "cache": cache_status
    }

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "AI Orchestrator",
        "version": "0.1.0",
        "documentation": "/docs",
        "gpu_optimized": config["gpu"].get("enabled", True) and get_gpu_warmup_manager().is_warmed_up if config["gpu"].get("enabled", True) else False
    }

@app.get("/gpu/status")
async def gpu_status():
    """GPU status endpoint."""
    if not config["gpu"].get("enabled", True):
        return {"gpu_enabled": False}

    try:
        gpu_warmup_manager = get_gpu_warmup_manager()
        gpu_memory_pool = get_gpu_memory_pool()

        return {
            "gpu_enabled": True,
            "gpu_warmed_up": gpu_warmup_manager.is_warmed_up,
            "memory_info": gpu_warmup_manager.get_memory_info(),
            "memory_pool": gpu_memory_pool.get_memory_info()
        }
    except Exception as e:
        return {"gpu_enabled": False, "error": str(e)}

@app.get("/models/status")
async def models_status():
    """Models status endpoint."""
    try:
        model_loader = get_model_loader()
        model_stats = await model_loader.get_model_loading_stats()

        return {
            "status": "ok",
            "stats": model_stats
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

@app.get("/cache/status")
async def cache_status():
    """Cache status endpoint."""
    try:
        model_cache = get_model_cache()
        cache_stats = await model_cache.get_stats()

        return {
            "status": "ok",
            "stats": cache_stats
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}
