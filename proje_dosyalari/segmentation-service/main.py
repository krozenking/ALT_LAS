from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import uuid
import datetime
import os
import logging
import time
import gc

# Import memory optimization components
from memory_optimizer import get_memory_optimizer
from enhanced_language_processor import get_enhanced_language_processor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("segmentation_service.log")
    ]
)
logger = logging.getLogger("segmentation_service")

# Get configuration from environment variables
memory_threshold_mb = float(os.environ.get("MEMORY_THRESHOLD_MB", "500"))
high_memory_threshold_mb = float(os.environ.get("HIGH_MEMORY_THRESHOLD_MB", "1000"))
gc_interval = int(os.environ.get("GC_INTERVAL", "60"))
max_cache_size = int(os.environ.get("MAX_CACHE_SIZE", "100"))

logger.info(f"Memory configuration: threshold={memory_threshold_mb}MB, high_threshold={high_memory_threshold_mb}MB, gc_interval={gc_interval}s, max_cache_size={max_cache_size}")

# Initialize memory optimizer with configuration
memory_optimizer = get_memory_optimizer()
memory_optimizer.threshold_mb = memory_threshold_mb
memory_optimizer.high_memory_threshold_mb = high_memory_threshold_mb
memory_optimizer.gc_interval = gc_interval

# Initialize language processor with configuration
language_processor = get_enhanced_language_processor()
language_processor.max_cache_size = max_cache_size

# Create FastAPI app
app = FastAPI(title="ALT_LAS Segmentation Service")

# Add GZip compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Middleware for memory optimization
@app.middleware("http")
async def memory_optimization_middleware(request: Request, call_next):
    # Check memory usage before processing request
    memory_before = memory_optimizer.track_memory_usage()

    # Process request
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    # Check memory usage after processing request
    memory_after = memory_optimizer.track_memory_usage()
    memory_diff = memory_after - memory_before

    # Log request processing time and memory usage
    logger.info(f"Request processed in {process_time:.4f} seconds, memory usage: {memory_diff:.2f} MB")

    # Optimize memory if needed
    if memory_diff > 10:  # If request used more than 10 MB
        memory_optimizer.optimize_if_needed()

    return response

class SegmentationRequest(BaseModel):
    command: str
    mode: Optional[str] = "Normal"
    persona: Optional[str] = "technical_expert"
    metadata: Optional[Dict[str, Any]] = None

class SegmentationResponse(BaseModel):
    id: str
    status: str
    alt_file: str
    metadata: Dict[str, Any]

@app.get("/")
def read_root():
    return {"message": "ALT_LAS Segmentation Service"}

@app.get("/health")
def health_check():
    # Basic health check
    return {"status": "UP"}

@app.get("/memory-stats")
def memory_stats():
    """Get memory usage statistics"""
    # Get memory usage report
    memory_report = memory_optimizer.get_memory_usage_report()

    # Get language processor stats
    language_stats = {
        "cache_size": len(language_processor.doc_cache),
        "loaded_models": list(language_processor.nlp_models.keys())
    }

    # Return combined stats
    return {
        "memory": memory_report,
        "language_processor": language_stats,
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.post("/optimize-memory")
def optimize_memory(aggressive: bool = False):
    """Manually trigger memory optimization"""
    # Get memory usage before optimization
    memory_before = memory_optimizer.track_memory_usage()

    # Optimize memory
    memory_optimizer.optimize_memory(aggressive=aggressive)

    # Get memory usage after optimization
    memory_after = memory_optimizer.track_memory_usage()
    memory_reduction = memory_before - memory_after

    # Return optimization results
    return {
        "memory_before": memory_before,
        "memory_after": memory_after,
        "memory_reduction": memory_reduction,
        "aggressive": aggressive,
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.post("/segment", response_model=SegmentationResponse)
def segment_command(request: SegmentationRequest):
    try:
        # Generate a unique ID for this segmentation task
        task_id = str(uuid.uuid4())

        # Log request
        logger.info(f"Processing segmentation request: {task_id}, command length: {len(request.command)}")

        # Detect language
        language = None
        if request.metadata and "language" in request.metadata:
            language = request.metadata["language"]
        else:
            # Auto-detect language
            language = language_processor.detect_language(request.command)
            logger.info(f"Detected language: {language}")

        # Process text with language processor
        # This will use the lazy loading and caching mechanisms
        doc = language_processor.process_text(request.command, language)

        # In a real implementation, this would analyze the command and create an ALT file
        # For now, we'll just create a mock response with some NLP-derived information

        # Create metadata with NLP-derived information
        metadata = {
            "timestamp": datetime.datetime.now().isoformat(),
            "mode": request.mode,
            "persona": request.persona,
            "command_length": len(request.command),
            "language": language,
            "sentence_count": len(list(language_processor.get_sentences(doc))) if doc else 1,
            "token_count": len(list(language_processor.get_tokens(doc))) if doc else len(request.command.split())
        }

        # If additional metadata was provided, merge it
        if request.metadata:
            metadata.update(request.metadata)

        # Create response
        response = SegmentationResponse(
            id=task_id,
            status="completed",
            alt_file=f"task_{task_id}.alt",
            metadata=metadata
        )

        # Check memory usage and optimize if needed
        memory_optimizer.optimize_if_needed()

        return response
    except Exception as e:
        logger.error(f"Error processing segmentation request: {str(e)}", exc_info=True)
        # Force memory optimization after error
        memory_optimizer.optimize_memory(aggressive=True)
        raise HTTPException(status_code=500, detail=f"Segmentation error: {str(e)}")

@app.get("/segment/{task_id}", response_model=SegmentationResponse)
def get_segmentation_status(task_id: str):
    # In a real implementation, this would check the status of a segmentation task
    # For now, we'll just return a mock response

    # Log request
    logger.info(f"Checking segmentation status for task: {task_id}")

    # Check if the task exists (mock check)
    if not task_id:
        logger.warning(f"Task not found: {task_id}")
        raise HTTPException(status_code=404, detail="Task not found")

    # Create mock response
    response = SegmentationResponse(
        id=task_id,
        status="completed",
        alt_file=f"task_{task_id}.alt",
        metadata={
            "timestamp": datetime.datetime.now().isoformat(),
            "mode": "Normal",
            "persona": "technical_expert",
            "memory_usage": memory_optimizer.track_memory_usage()
        }
    )

    return response

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    # Startup event
    logger.info("Starting Segmentation Service")

    # Log initial memory usage
    memory_usage = memory_optimizer.track_memory_usage()
    logger.info(f"Initial memory usage: {memory_usage:.2f} MB")

    # Force garbage collection at startup
    gc.collect()

    # Set up periodic memory optimization
    # In a real implementation, we would use a background task for this
    logger.info("Memory optimization initialized")

@app.on_event("shutdown")
async def shutdown_event():
    # Shutdown event
    logger.info("Shutting down Segmentation Service")

    # Clean up resources
    memory_optimizer.cleanup()

    # Force final garbage collection
    gc.collect()

    # Log final memory usage
    memory_usage = memory_optimizer.track_memory_usage()
    logger.info(f"Final memory usage: {memory_usage:.2f} MB")

if __name__ == "__main__":
    import uvicorn

    # Configure uvicorn logging
    log_config = uvicorn.config.LOGGING_CONFIG
    log_config["formatters"]["access"]["fmt"] = "%(asctime)s - %(levelname)s - %(message)s"
    log_config["formatters"]["default"]["fmt"] = "%(asctime)s - %(levelname)s - %(message)s"

    # Run the application
    uvicorn.run(app, host="0.0.0.0", port=8000, log_config=log_config)
