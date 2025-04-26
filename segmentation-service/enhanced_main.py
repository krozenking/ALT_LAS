"""
Enhanced main module for ALT_LAS Segmentation Service with improved error handling

This module provides the FastAPI application for the Segmentation Service,
with endpoints for segmenting commands and managing ALT files.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os
import uuid
import datetime

from dsl_schema import AltFile, TaskSegment, TaskParameter
from command_parser import get_command_parser
from alt_file_handler import get_alt_file_handler
from language_processor import get_language_processor
from task_prioritization import get_task_prioritizer
from performance_optimizer import get_performance_optimizer
from error_handling import configure_app_logging, log_function_call, get_logger

# Get logger
logger = get_logger()

# Create FastAPI app
app = FastAPI(
    title="ALT_LAS Segmentation Service",
    description="Service for segmenting commands into tasks using NLP and DSL",
    version="1.0.0"
)

# Configure application logging
configure_app_logging(app)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request and response models
class SegmentationRequest(BaseModel):
    command: str
    mode: Optional[str] = "Normal"
    persona: Optional[str] = "technical_expert"
    metadata: Optional[Dict[str, Any]] = None

class SegmentationResponse(BaseModel):
    id: str
    status: str
    alt_file: str
    language: str
    segments_count: int
    metadata: Dict[str, Any]

class SegmentModel(BaseModel):
    id: str
    task_type: str
    content: str
    parameters: List[Dict[str, Any]]
    dependencies: List[str]
    metadata: Dict[str, Any]

class AltFileModel(BaseModel):
    id: str
    command: str
    language: str
    mode: str
    persona: str
    chaos_level: Optional[int] = None
    segments: List[SegmentModel]
    metadata: Dict[str, Any]

# Define dependencies
def get_parser():
    return get_command_parser()

def get_file_handler():
    return get_alt_file_handler()

def get_prioritizer():
    return get_task_prioritizer()

def get_optimizer():
    return get_performance_optimizer()

# Define routes
@app.get("/")
@log_function_call
def read_root():
    """Root endpoint"""
    logger.info("Root endpoint accessed")
    return {"message": "ALT_LAS Segmentation Service", "version": "1.0.0"}

@app.get("/health")
@log_function_call
def health_check():
    """Health check endpoint"""
    logger.info("Health check endpoint accessed")
    return {"status": "UP", "timestamp": datetime.datetime.now().isoformat()}

@app.post("/segment", response_model=SegmentationResponse)
@log_function_call
def segment_command(
    request: SegmentationRequest,
    background_tasks: BackgroundTasks,
    parser = Depends(get_parser),
    file_handler = Depends(get_file_handler),
    prioritizer = Depends(get_prioritizer),
    optimizer = Depends(get_optimizer)
):
    """
    Segment a command into tasks and generate an ALT file
    
    Args:
        request: Segmentation request
        background_tasks: Background tasks
        parser: Command parser
        file_handler: ALT file handler
        prioritizer: Task prioritizer
        optimizer: Performance optimizer
        
    Returns:
        Segmentation response
    """
    logger.info(f"Processing segmentation request: {request.command}")
    
    try:
        # Use performance optimizer to time execution
        parse_result, parse_time = optimizer.time_execution(
            parser.parse_command,
            command=request.command,
            mode=request.mode,
            persona=request.persona,
            metadata=request.metadata
        )
        
        # Get the parsed ALT file
        alt_file = parse_result
        
        # Prioritize tasks
        alt_file = prioritizer.prioritize_alt_file(alt_file)
        
        # Save ALT file
        alt_filename = f"task_{alt_file.id}.alt.yaml"
        file_path = file_handler.save_alt_file(alt_file, alt_filename)
        
        logger.info(f"Segmentation completed for command: {request.command[:50]}...")
        logger.debug(f"Parse time: {parse_time:.4f}s, Segments: {len(alt_file.segments)}")
        
        # Create response
        response = SegmentationResponse(
            id=alt_file.id,
            status="completed",
            alt_file=alt_filename,
            language=alt_file.language,
            segments_count=len(alt_file.segments),
            metadata={
                "timestamp": datetime.datetime.now().isoformat(),
                "mode": alt_file.mode,
                "persona": alt_file.persona,
                "parse_time_seconds": round(parse_time, 4),
                **alt_file.metadata
            }
        )
        
        return response
    except Exception as e:
        logger.error(f"Segmentation error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Segmentation error: {str(e)}")

@app.get("/segment/{task_id}", response_model=SegmentationResponse)
@log_function_call
def get_segmentation_status(
    task_id: str = Path(..., description="Task ID"),
    file_handler = Depends(get_file_handler)
):
    """
    Get the status of a segmentation task
    
    Args:
        task_id: Task ID
        file_handler: ALT file handler
        
    Returns:
        Segmentation response
    """
    logger.info(f"Getting segmentation status for task: {task_id}")
    
    try:
        # Find ALT file
        alt_filename = f"task_{task_id}.alt.yaml"
        
        try:
            alt_file = file_handler.load_alt_file(alt_filename)
        except FileNotFoundError:
            logger.warning(f"Task not found: {task_id}")
            raise HTTPException(status_code=404, detail=f"Task not found: {task_id}")
        
        logger.info(f"Found task: {task_id}")
        
        # Create response
        response = SegmentationResponse(
            id=alt_file.id,
            status="completed",
            alt_file=alt_filename,
            language=alt_file.language,
            segments_count=len(alt_file.segments),
            metadata={
                "timestamp": datetime.datetime.now().isoformat(),
                "mode": alt_file.mode,
                "persona": alt_file.persona,
                **alt_file.metadata
            }
        )
        
        return response
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"Error getting segmentation status: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error getting segmentation status: {str(e)}")

@app.get("/alt-files", response_model=List[str])
@log_function_call
def list_alt_files(
    file_handler = Depends(get_file_handler)
):
    """
    List all ALT files
    
    Args:
        file_handler: ALT file handler
        
    Returns:
        List of ALT filenames
    """
    logger.info("Listing ALT files")
    
    try:
        files = file_handler.list_alt_files()
        logger.info(f"Found {len(files)} ALT files")
        return files
    except Exception as e:
        logger.error(f"Error listing ALT files: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error listing ALT files: {str(e)}")

@app.get("/alt-files/{filename}", response_model=AltFileModel)
@log_function_call
def get_alt_file(
    filename: str = Path(..., description="ALT filename"),
    file_handler = Depends(get_file_handler)
):
    """
    Get an ALT file
    
    Args:
        filename: ALT filename
        file_handler: ALT file handler
        
    Returns:
        ALT file
    """
    logger.info(f"Getting ALT file: {filename}")
    
    try:
        try:
            alt_file = file_handler.load_alt_file(filename)
        except FileNotFoundError:
            logger.warning(f"ALT file not found: {filename}")
            raise HTTPException(status_code=404, detail=f"ALT file not found: {filename}")
        
        logger.info(f"Found ALT file: {filename}")
        
        # Convert to response model
        segments = []
        for segment in alt_file.segments:
            segments.append(SegmentModel(
                id=segment.id,
                task_type=segment.task_type,
                content=segment.content,
                parameters=[p.dict() for p in segment.parameters],
                dependencies=segment.dependencies,
                metadata=segment.metadata
            ))
        
        return AltFileModel(
            id=alt_file.id,
            command=alt_file.command,
            language=alt_file.language,
            mode=alt_file.mode,
            persona=alt_file.persona,
            chaos_level=alt_file.chaos_level,
            segments=segments,
            metadata=alt_file.metadata
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"Error getting ALT file: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error getting ALT file: {str(e)}")

@app.delete("/alt-files/{filename}")
@log_function_call
def delete_alt_file(
    filename: str = Path(..., description="ALT filename"),
    file_handler = Depends(get_file_handler)
):
    """
    Delete an ALT file
    
    Args:
        filename: ALT filename
        file_handler: ALT file handler
        
    Returns:
        Success message
    """
    logger.info(f"Deleting ALT file: {filename}")
    
    try:
        success = file_handler.delete_alt_file(filename)
        if not success:
            logger.warning(f"ALT file not found: {filename}")
            raise HTTPException(status_code=404, detail=f"ALT file not found: {filename}")
        
        logger.info(f"Deleted ALT file: {filename}")
        return {"message": f"ALT file deleted: {filename}"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"Error deleting ALT file: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error deleting ALT file: {str(e)}")

@app.get("/languages")
@log_function_call
def list_supported_languages():
    """
    List supported languages
    
    Returns:
        List of supported languages
    """
    logger.info("Listing supported languages")
    
    return {
        "supported_languages": [
            {"code": "en", "name": "English"},
            {"code": "tr", "name": "Turkish"}
        ]
    }

@app.get("/modes")
@log_function_call
def list_supported_modes():
    """
    List supported modes
    
    Returns:
        List of supported modes
    """
    logger.info("Listing supported modes")
    
    return {
        "supported_modes": [
            {"code": "Normal", "description": "Standard processing mode"},
            {"code": "Dream", "description": "Creative processing mode"},
            {"code": "Explore", "description": "Exploratory processing mode"},
            {"code": "Chaos", "description": "Unpredictable processing mode with chaos level (1-10)"}
        ]
    }

# Run the application
if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment or use default
    port = int(os.environ.get("PORT", 8000))
    
    # Configure logging
    logger.info(f"Starting Segmentation Service on port {port}")
    
    # Run the application
    uvicorn.run(app, host="0.0.0.0", port=port)
