from fastapi import FastAPI, HTTPException, Depends, Path, Query
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import uuid
import datetime
import os
import logging
from command_parser import CommandParser, get_command_parser
from dsl_schema import AltFile, TaskSegment, TaskParameter
from alt_file_handler import AltFileHandler, get_file_handler
from task_prioritization import TaskPrioritizer, get_task_prioritizer
from language_processor import LanguageProcessor, get_language_processor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("segmentation-service")

app = FastAPI(
    title="ALT_LAS Segmentation Service",
    description="Segmentation Service for ALT_LAS platform",
    version="1.0.0",
)

# Models
class SegmentationRequest(BaseModel):
    command: str = Field(..., description="Command to segment")
    mode: Optional[str] = Field("Normal", description="Processing mode")
    persona: Optional[str] = Field("technical_expert", description="Persona to use")
    language: Optional[str] = Field("en", description="Language of the command")
    chaos_level: Optional[int] = Field(None, description="Chaos level (1-10) for Chaos mode")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class PrioritizationRequest(BaseModel):
    alt_file: str = Field(..., description="ALT file to prioritize")
    user_preferences: Optional[Dict[str, Any]] = Field(None, description="User preferences for prioritization")
    urgency_level: Optional[int] = Field(5, description="Overall urgency level (1-10)")
    deadline: Optional[str] = Field(None, description="Deadline in ISO format")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class TaskParameterModel(BaseModel):
    name: str
    value: Any
    type: str
    required: bool = True

class SegmentModel(BaseModel):
    id: str
    task_type: str
    content: str
    parameters: List[Dict[str, Any]]
    dependencies: List[str] = []
    metadata: Dict[str, Any] = {}

class AltFileModel(BaseModel):
    id: str
    command: str
    language: str
    mode: str
    persona: str
    chaos_level: Optional[int] = None
    segments: List[SegmentModel]
    metadata: Dict[str, Any] = {}

class SegmentationResponse(BaseModel):
    id: str
    status: str
    alt_file: str
    language: str
    segments_count: int
    metadata: Dict[str, Any]

class PrioritizationResponse(BaseModel):
    id: str
    status: str
    alt_file: str
    prioritized_segments: List[Dict[str, Any]]
    metadata: Dict[str, Any]

class PrioritizationVisualizationResponse(BaseModel):
    id: str
    alt_file: str
    visualization_data: Dict[str, Any]
    metadata: Dict[str, Any]

class PrioritizationConfigModel(BaseModel):
    default_urgency: int = Field(5, description="Default urgency level (1-10)")
    default_user_preference: int = Field(5, description="Default user preference level (1-10)")
    dependency_weight: float = Field(0.4, description="Weight for dependency factor")
    urgency_weight: float = Field(0.3, description="Weight for urgency factor")
    user_preference_weight: float = Field(0.2, description="Weight for user preference factor")
    confidence_weight: float = Field(0.1, description="Weight for confidence factor")

# Root endpoint
@app.get("/")
def read_root():
    """
    Root endpoint
    
    Returns:
        Welcome message
    """
    return {
        "message": "ALT_LAS Segmentation Service",
        "version": "1.0.0",
        "documentation": "/docs",
    }

# Health check endpoint
@app.get("/health")
def health_check():
    """
    Health check endpoint
    
    Returns:
        Health status
    """
    return {
        "status": "UP",
        "timestamp": datetime.datetime.now().isoformat(),
    }

# Segment command endpoint
@app.post("/segment", response_model=SegmentationResponse)
def segment_command(
    request: SegmentationRequest,
    command_parser = Depends(get_command_parser),
    file_handler = Depends(get_file_handler),
    language_processor = Depends(get_language_processor),
):
    """
    Segment a command into tasks
    
    Args:
        request: Segmentation request
        command_parser: Command parser
        file_handler: ALT file handler
        language_processor: Language processor
        
    Returns:
        Segmentation response
    """
    try:
        logger.info(f"Segmenting command: {request.command}")
        
        # Detect language if not specified
        if not request.language:
            detected_language = language_processor.detect_language(request.command)
            language = detected_language
        else:
            language = request.language
        
        # Parse command
        alt_file = command_parser.parse_command(
            command=request.command,
            language=language,
            mode=request.mode,
            persona=request.persona,
            chaos_level=request.chaos_level,
        )
        
        # Add metadata
        if request.metadata:
            alt_file.metadata.update(request.metadata)
        
        # Add timestamp
        alt_file.metadata["timestamp"] = datetime.datetime.now().isoformat()
        
        # Save ALT file
        alt_filename = file_handler.save_alt_file(alt_file)
        
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
        
        logger.info(f"Command segmented successfully: {alt_filename}")
        return response
    except Exception as e:
        logger.error(f"Error segmenting command: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Segmentation error: {str(e)}")

# Get segmentation status endpoint
@app.get("/segment/{task_id}", response_model=SegmentationResponse)
def get_segmentation_status(
    task_id: str = Path(..., description="Task ID"),
    file_handler = Depends(get_file_handler)
):
    """
    Get segmentation status
    
    Args:
        task_id: Task ID
        file_handler: ALT file handler
        
    Returns:
        Segmentation status
    """
    try:
        # Construct ALT filename
        alt_filename = f"task_{task_id}.alt"
        
        # Load ALT file
        try:
            alt_file = file_handler.load_alt_file(alt_filename)
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail=f"Task not found: {task_id}")
        
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
        logger.error(f"Error getting segmentation status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting segmentation status: {str(e)}")

# Prioritize ALT file endpoint
@app.post("/prioritize", response_model=PrioritizationResponse)
def prioritize_alt_file(
    request: PrioritizationRequest,
    file_handler = Depends(get_file_handler),
    task_prioritizer = Depends(get_task_prioritizer)
):
    """
    Prioritize tasks in an ALT file
    
    Args:
        request: Prioritization request
        file_handler: ALT file handler
        task_prioritizer: Task prioritizer
        
    Returns:
        Prioritization response
    """
    try:
        logger.info(f"Prioritizing ALT file: {request.alt_file}")
        
        # Load ALT file
        try:
            alt_file = file_handler.load_alt_file(request.alt_file)
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail=f"ALT file not found: {request.alt_file}")
        
        # Update ALT file metadata with prioritization parameters
        if request.user_preferences:
            alt_file.metadata["user_preferences"] = request.user_preferences
        
        if request.urgency_level:
            alt_file.metadata["urgency_level"] = request.urgency_level
            
        if request.deadline:
            alt_file.metadata["deadline"] = request.deadline
            
        if request.metadata:
            alt_file.metadata.update(request.metadata)
        
        # Prioritize ALT file
        prioritized_alt = task_prioritizer.prioritize_alt_file(alt_file)
        
        # Save prioritized ALT file
        prioritized_filename = file_handler.save_alt_file(prioritized_alt)
        
        # Create response with prioritized segments
        prioritized_segments = []
        for segment in prioritized_alt.segments:
            prioritized_segments.append({
                "id": segment.id,
                "task_type": segment.task_type,
                "content": segment.content,
                "priority_score": segment.metadata.get("priority_score", 0),
                "execution_order": segment.metadata.get("execution_order", 0),
                "dependencies": segment.dependencies
            })
        
        response = PrioritizationResponse(
            id=prioritized_alt.id,
            status="completed",
            alt_file=prioritized_filename,
            prioritized_segments=prioritized_segments,
            metadata={
                "timestamp": datetime.datetime.now().isoformat(),
                **prioritized_alt.metadata
            }
        )
        
        logger.info(f"ALT file prioritized successfully: {prioritized_filename}")
        return response
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"Error prioritizing ALT file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error prioritizing ALT file: {str(e)}")

# Get prioritization visualization endpoint
@app.get("/prioritize/{alt_file}/visualize", response_model=PrioritizationVisualizationResponse)
def visualize_prioritization(
    alt_file: str = Path(..., description="ALT file to visualize"),
    file_handler = Depends(get_file_handler),
    task_prioritizer = Depends(get_task_prioritizer)
):
    """
    Visualize task prioritization for an ALT file
    
    Args:
        alt_file: ALT file to visualize
        file_handler: ALT file handler
        task_prioritizer: Task prioritizer
        
    Returns:
        Prioritization visualization
    """
    try:
        logger.info(f"Visualizing prioritization for ALT file: {alt_file}")
        
        # Load ALT file
        try:
            alt_file_obj = file_handler.load_alt_file(alt_file)
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail=f"ALT file not found: {alt_file}")
        
        # Check if ALT file has been prioritized
        has_prioritization = any("priority_score" in segment.metadata for segment in alt_file_obj.segments)
        
        # Prioritize if not already prioritized
        if not has_prioritization:
            alt_file_obj = task_prioritizer.prioritize_alt_file(alt_file_obj)
        
        # Create visualization data
        visualization_data = {
            "nodes": [],
            "links": [],
            "priority_scores": {},
            "execution_order": {}
        }
        
        # Add nodes
        for segment in alt_file_obj.segments:
            visualization_data["nodes"].append({
                "id": segment.id,
                "task_type": segment.task_type,
                "content": segment.content,
                "priority_score": segment.metadata.get("priority_score", 0),
                "execution_order": segment.metadata.get("execution_order", 0)
            })
            
            visualization_data["priority_scores"][segment.id] = segment.metadata.get("priority_score", 0)
            visualization_data["execution_order"][segment.id] = segment.metadata.get("execution_order", 0)
        
        # Add links (dependencies)
        for segment in alt_file_obj.segments:
            for dependency in segment.dependencies:
                visualization_data["links"].append({
                    "source": dependency,
                    "target": segment.id
                })
        
        # Create response
        response = PrioritizationVisualizationResponse(
            id=alt_file_obj.id,
            alt_file=alt_file,
            visualization_data=visualization_data,
            metadata={
                "timestamp": datetime.datetime.now().isoformat(),
                **alt_file_obj.metadata
            }
        )
        
        logger.info(f"Prioritization visualization created successfully for: {alt_file}")
        return response
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"Error creating prioritization visualization: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating prioritization visualization: {str(e)}")

# Get prioritization configuration endpoint
@app.get("/prioritize/config", response_model=PrioritizationConfigModel)
def get_prioritization_config(
    task_prioritizer = Depends(get_task_prioritizer)
):
    """
    Get prioritization configuration
    
    Args:
        task_prioritizer: Task prioritizer
        
    Returns:
        Prioritization configuration
    """
    try:
        # Get configuration from task prioritizer
        config = PrioritizationConfigModel(
            default_urgency=task_prioritizer.default_urgency,
            default_user_preference=task_prioritizer.default_user_pref,
            dependency_weight=task_prioritizer.dependency_weight,
            urgency_weight=task_prioritizer.urgency_weight,
            user_preference_weight=task_prioritizer.user_pref_weight,
            confidence_weight=task_prioritizer.confidence_weight
        )
        
        return config
    except Exception as e:
        logger.error(f"Error getting prioritization configuration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting prioritization configuration: {str(e)}")

# Update prioritization configuration endpoint
@app.post("/prioritize/config", response_model=PrioritizationConfigModel)
def update_prioritization_config(
    config: PrioritizationConfigModel,
    task_prioritizer = Depends(get_task_prioritizer)
):
    """
    Update prioritization configuration
    
    Args:
        config: Prioritization configuration
        task_prioritizer: Task prioritizer
        
    Returns:
        Updated prioritization configuration
    """
    try:
        # Update task prioritizer configuration
        task_prioritizer.default_urgency = config.default_urgency
        task_prioritizer.default_user_pref = config.default_user_preference
        task_prioritizer.dependency_weight = config.dependency_weight
        task_prioritizer.urgency_weight = config.urgency_weight
        task_prioritizer.user_pref_weight = config.user_preference_weight
        task_prioritizer.confidence_weight = config.confidence_weight
        
        # Return updated configuration
        return config
    except Exception as e:
        logger.error(f"Error updating prioritization configuration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating prioritization configuration: {str(e)}")

# List ALT files endpoint
@app.get("/alt-files", response_model=List[str])
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
    try:
        return file_handler.list_alt_files()
    except Exception as e:
        logger.error(f"Error listing ALT files: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error listing ALT files: {str(e)}")

# Get ALT file endpoint
@app.get("/alt-files/{filename}", response_model=AltFileModel)
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
    try:
        try:
            alt_file = file_handler.load_alt_file(filename)
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail=f"ALT file not found: {filename}")
        
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
        logger.error(f"Error getting ALT file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting ALT file: {str(e)}")

# Delete ALT file endpoint
@app.delete("/alt-files/{filename}")
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
    try:
        success = file_handler.delete_alt_file(filename)
        if not success:
            raise HTTPException(status_code=404, detail=f"ALT file not found: {filename}")
        
        return {"message": f"ALT file deleted: {filename}"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"Error deleting ALT file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting ALT file: {str(e)}")

# List supported languages endpoint
@app.get("/languages")
def list_supported_languages(
    language_processor = Depends(get_language_processor)
):
    """
    List supported languages
    
    Args:
        language_processor: Language processor
        
    Returns:
        List of supported languages
    """
    return {
        "supported_languages": language_processor.get_supported_languages()
    }

# List supported modes endpoint
@app.get("/modes")
def list_supported_modes():
    """
    List supported modes
    
    Returns:
        List of supported modes
    """
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
    
    # Run the application
    uvicorn.run(app, host="0.0.0.0", port=port)
