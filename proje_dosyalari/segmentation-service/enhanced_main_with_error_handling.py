"""
Enhanced Main Application with Improved Error Handling and Logging

This module provides the main FastAPI application with enhanced error handling and logging.
"""

import os
import time
import json
from typing import Dict, Any, Optional, List, Union
from fastapi import FastAPI, Request, Response, HTTPException, Depends, Header, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from dsl_schema import AltFile, TaskSegment, TaskParameter
from task_prioritization import TaskPrioritizer, get_task_prioritizer
from prioritization_visualizer import PrioritizationVisualizer, get_prioritization_visualizer
from enhanced_error_handling import (
    ErrorCode, ErrorSeverity, ErrorResponse, SegmentationError,
    ValidationError, ProcessingError, DataError, IntegrationError,
    SegmentationProcessingError, PrioritizationError, ParsingError,
    VisualizationError, LoggingConfig, LoggingManager, MetricsCollector,
    configure_app_logging, get_logger, log_function_call, log_async_function_call
)

# Create FastAPI app
app = FastAPI(
    title="Segmentation Service",
    description="Service for segmenting commands into tasks",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
configure_app_logging(app)

# Get logger
logger = get_logger()

# Initialize task prioritizer
task_prioritizer = get_task_prioritizer()

# Initialize prioritization visualizer
prioritization_visualizer = get_prioritization_visualizer()

# Request models
class SegmentRequest(BaseModel):
    """Segment request model"""
    command: str = Field(..., description="Command to segment")
    mode: str = Field("Normal", description="Processing mode")
    persona: str = Field("default", description="User persona")
    language: str = Field("en", description="Command language")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class PrioritizeRequest(BaseModel):
    """Prioritize request model"""
    alt_file: str = Field(..., description="ALT file ID")
    urgency_level: Optional[int] = Field(5, description="Urgency level (1-10)")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

# Response models
class SegmentResponse(BaseModel):
    """Segment response model"""
    id: str = Field(..., description="Segmentation ID")
    alt_file: str = Field(..., description="ALT file ID")
    segments: List[Dict[str, Any]] = Field(..., description="Segmented tasks")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class PrioritizeResponse(BaseModel):
    """Prioritize response model"""
    alt_file: str = Field(..., description="ALT file ID")
    prioritized_segments: List[Dict[str, Any]] = Field(..., description="Prioritized segments")
    execution_order: List[str] = Field(..., description="Execution order of segment IDs")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class VisualizationResponse(BaseModel):
    """Visualization response model"""
    alt_file: str = Field(..., description="ALT file ID")
    visualization_type: str = Field(..., description="Visualization type")
    visualization_data: Dict[str, Any] = Field(..., description="Visualization data")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

# API endpoints
@app.get("/")
@log_function_call
def read_root():
    """Root endpoint"""
    return {
        "service": "Segmentation Service",
        "version": "2.0.0",
        "status": "running"
    }

@app.post("/segment", response_model=SegmentResponse)
@log_function_call
def segment_command(request: SegmentRequest):
    """
    Segment a command into tasks
    
    Args:
        request: Segment request
        
    Returns:
        Segment response
    """
    try:
        logger.info(f"Segmenting command: {request.command}")
        
        # Create ALT file
        alt_file = AltFile(
            id=f"alt-{int(time.time())}",
            command=request.command,
            language=request.language,
            mode=request.mode,
            persona=request.persona,
            segments=[],
            metadata=request.metadata or {}
        )
        
        # TODO: Implement actual segmentation logic
        # For now, create a simple segmentation
        segments = []
        
        # Example: Split command by commas
        parts = request.command.split(",")
        for i, part in enumerate(parts):
            segment = TaskSegment(
                id=f"task-{i+1}",
                task_type="generic",
                content=part.strip(),
                parameters=[],
                dependencies=[f"task-{j+1}" for j in range(i) if j % 2 == 0],
                metadata={"confidence": 0.9 - (i * 0.1)}
            )
            segments.append(segment)
            alt_file.segments.append(segment)
        
        # Return response
        return SegmentResponse(
            id=f"seg-{int(time.time())}",
            alt_file=alt_file.id,
            segments=[segment.dict() for segment in segments],
            metadata={"timestamp": time.time()}
        )
    except Exception as e:
        # Convert to SegmentationError
        if not isinstance(e, SegmentationError):
            e = SegmentationProcessingError(
                message=f"Error segmenting command: {str(e)}",
                details={"command": request.command},
                cause=e
            )
        raise e

@app.post("/prioritize", response_model=PrioritizeResponse)
@log_function_call
def prioritize_alt_file(request: PrioritizeRequest):
    """
    Prioritize tasks in an ALT file
    
    Args:
        request: Prioritize request
        
    Returns:
        Prioritize response
    """
    try:
        logger.info(f"Prioritizing ALT file: {request.alt_file}")
        
        # TODO: Implement actual ALT file retrieval
        # For now, create a sample ALT file
        alt_file = AltFile(
            id=request.alt_file,
            command="Sample command",
            language="en",
            mode="Normal",
            persona="default",
            segments=[],
            metadata=request.metadata or {}
        )
        
        # Create sample segments
        for i in range(3):
            segment = TaskSegment(
                id=f"task-{i+1}",
                task_type="generic",
                content=f"Task {i+1}",
                parameters=[],
                dependencies=[f"task-{j+1}" for j in range(i) if j % 2 == 0],
                metadata={"confidence": 0.9 - (i * 0.1)}
            )
            alt_file.segments.append(segment)
        
        # Set urgency level
        if request.urgency_level:
            alt_file.metadata["urgency_level"] = request.urgency_level
        
        # Prioritize ALT file
        prioritized_alt = task_prioritizer.prioritize_alt_file(alt_file)
        
        # Get prioritization stats
        stats = task_prioritizer.get_prioritization_stats(prioritized_alt)
        
        # Extract execution order
        execution_order = stats["execution_order"]
        
        # Return response
        return PrioritizeResponse(
            alt_file=prioritized_alt.id,
            prioritized_segments=[segment.dict() for segment in prioritized_alt.segments],
            execution_order=execution_order,
            metadata={
                "timestamp": time.time(),
                "stats": stats
            }
        )
    except Exception as e:
        # Convert to PrioritizationError
        if not isinstance(e, SegmentationError):
            e = PrioritizationError(
                message=f"Error prioritizing ALT file: {str(e)}",
                details={"alt_file": request.alt_file},
                cause=e
            )
        raise e

@app.get("/prioritize/{alt_file}/visualize", response_model=VisualizationResponse)
@log_function_call
def visualize_prioritization(
    alt_file: str = Path(..., description="ALT file ID"),
    type: str = Query("dependency", description="Visualization type (dependency, priority, timeline, all)")
):
    """
    Visualize prioritization of an ALT file
    
    Args:
        alt_file: ALT file ID
        type: Visualization type
        
    Returns:
        Visualization response
    """
    try:
        logger.info(f"Visualizing prioritization for ALT file: {alt_file}")
        
        # TODO: Implement actual ALT file retrieval
        # For now, create a sample ALT file
        sample_alt = AltFile(
            id=alt_file,
            command="Sample command",
            language="en",
            mode="Normal",
            persona="default",
            segments=[],
            metadata={}
        )
        
        # Create sample segments with prioritization metadata
        for i in range(3):
            segment = TaskSegment(
                id=f"task-{i+1}",
                task_type="generic",
                content=f"Task {i+1}",
                parameters=[],
                dependencies=[f"task-{j+1}" for j in range(i) if j % 2 == 0],
                metadata={
                    "confidence": 0.9 - (i * 0.1),
                    "priority_score": 0.9 - (i * 0.2),
                    "execution_order": i + 1
                }
            )
            sample_alt.segments.append(segment)
        
        # Generate visualization
        visualization_data = {}
        
        if type == "dependency":
            # Generate dependency graph
            result = prioritization_visualizer.generate_dependency_graph(sample_alt, "json")
            visualization_data = json.loads(result["data"])
        elif type == "priority":
            # Generate priority chart
            result = prioritization_visualizer.generate_priority_chart(sample_alt, "json")
            visualization_data = json.loads(result["data"])
        elif type == "timeline":
            # Generate execution timeline
            result = prioritization_visualizer.generate_execution_timeline(sample_alt, "json")
            visualization_data = json.loads(result["data"])
        elif type == "all":
            # Generate all visualizations
            result = prioritization_visualizer.generate_all_visualizations(sample_alt, "json")
            visualization_data = json.loads(result["json_data"]["data"])
        else:
            raise ValidationError(
                message=f"Invalid visualization type: {type}",
                code=ErrorCode.INVALID_PARAMETER,
                details={"parameter": "type", "value": type}
            )
        
        # Return response
        return VisualizationResponse(
            alt_file=alt_file,
            visualization_type=type,
            visualization_data=visualization_data,
            metadata={"timestamp": time.time()}
        )
    except Exception as e:
        # Convert to VisualizationError
        if not isinstance(e, SegmentationError):
            e = VisualizationError(
                message=f"Error visualizing prioritization: {str(e)}",
                details={"alt_file": alt_file, "type": type},
                cause=e
            )
        raise e

@app.get("/prioritize/config")
@log_function_call
def get_prioritization_config():
    """
    Get prioritization configuration
    
    Returns:
        Prioritization configuration
    """
    try:
        logger.info("Getting prioritization configuration")
        
        # Get configuration
        config = task_prioritizer.get_config()
        
        return config
    except Exception as e:
        # Convert to SegmentationError
        if not isinstance(e, SegmentationError):
            e = SegmentationError(
                message=f"Error getting prioritization configuration: {str(e)}",
                code=ErrorCode.CONFIGURATION_ERROR,
                cause=e
            )
        raise e

@app.post("/prioritize/config")
@log_function_call
def update_prioritization_config(config: Dict[str, Any]):
    """
    Update prioritization configuration
    
    Args:
        config: New configuration
        
    Returns:
        Updated configuration
    """
    try:
        logger.info("Updating prioritization configuration")
        
        # Update configuration
        task_prioritizer.update_config(config)
        
        # Get updated configuration
        updated_config = task_prioritizer.get_config()
        
        return updated_config
    except Exception as e:
        # Convert to SegmentationError
        if not isinstance(e, SegmentationError):
            e = SegmentationError(
                message=f"Error updating prioritization configuration: {str(e)}",
                code=ErrorCode.CONFIGURATION_ERROR,
                details={"config": config},
                cause=e
            )
        raise e

# Run the application
if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment or use default
    port = int(os.environ.get("PORT", 8000))
    
    # Run server
    uvicorn.run(app, host="0.0.0.0", port=port)
