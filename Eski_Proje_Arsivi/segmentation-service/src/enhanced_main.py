# /home/ubuntu/ALT_LAS/segmentation-service/src/enhanced_main.py

from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field
from typing import Dict, Any, Literal, Optional
from loguru import logger
import yaml
import uuid
import os
import datetime

# --- Configuration ---
# In a real application, these would come from a config file or environment variables
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
ALT_FILE_STORAGE_PATH = os.getenv("ALT_FILE_STORAGE_PATH", "/tmp/alt_files") # Ensure this path exists or is created

# --- Logging Setup ---
logger.add(lambda msg: print(msg, end=""), level=LOG_LEVEL, format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>")

# Ensure ALT_FILE_STORAGE_PATH exists
if not os.path.exists(ALT_FILE_STORAGE_PATH):
    try:
        os.makedirs(ALT_FILE_STORAGE_PATH)
        logger.info(f"Created ALT file storage directory: {ALT_FILE_STORAGE_PATH}")
    except OSError as e:
        logger.error(f"Could not create ALT file storage directory {ALT_FILE_STORAGE_PATH}: {e}")
        # Depending on requirements, you might want to exit if this fails

# --- Pydantic Models for Request/Response ---
class SegmentationRequest(BaseModel):
    command: str = Field(..., description="The natural language command or structured input to be segmented.")
    mode: Optional[Literal["Normal", "Dream", "Explore", "Chaos"]] = Field("Normal", description="The operational mode for segmentation.")
    persona: Optional[str] = Field("technical_expert", description="The AI persona to use for interpreting the command.")
    user_id: Optional[str] = Field(None, description="Optional user ID for context.")
    metadata: Optional[Dict[str, Any]] = Field({}, description="Any additional metadata for the segmentation task.")

class SegmentationTask(BaseModel):
    task_id: str
    command: str
    segments: list[Dict[str, Any]] # Simplified representation of segments
    parameters: Dict[str, Any]
    dependencies: list[str]

class SegmentationResponse(BaseModel):
    segmentation_id: str
    status: str
    alt_file_path: str
    message: Optional[str] = None
    mode_used: str
    persona_used: str

# --- FastAPI Application Setup ---
app = FastAPI(
    title="ALT_LAS Segmentation Service",
    description="Handles the segmentation of user commands into machine-understandable tasks (`*.alt` files).",
    version="0.1.0"
)

# --- Helper Functions ---
def generate_alt_file(task_id: str, request_data: SegmentationRequest) -> str:
    """Generates a placeholder *.alt file based on the request.
    In a real implementation, this would involve complex NLP and task planning.
    """
    logger.info(f"Generating ALT file for task {task_id} based on command: {request_data.command}")
    # Simplified placeholder logic for *.alt file content
    # This should be replaced with actual segmentation logic
    alt_content = {
        "version": "1.0",
        "task_id": task_id,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "original_command": request_data.command,
        "mode": request_data.mode,
        "persona": request_data.persona,
        "user_id": request_data.user_id,
        "metadata": request_data.metadata,
        "segments": [
            {
                "segment_id": "seg_001",
                "type": "action", # or "query", "control_flow"
                "description": f"Placeholder segment for: {request_data.command}",
                "service_target": "runner-service", # Example target service
                "action_name": "execute_generic_task",
                "parameters": {
                    "detail": request_data.command
                },
                "dependencies": []
            }
        ],
        "global_parameters": {},
        "output_expectations": {
            "format": "json",
            "schema_ref": None
        }
    }

    file_name = f"{task_id}.alt"
    file_path = os.path.join(ALT_FILE_STORAGE_PATH, file_name)

    try:
        with open(file_path, "w") as f:
            yaml.dump(alt_content, f, sort_keys=False)
        logger.info(f"Successfully generated ALT file: {file_path}")
        return file_path
    except IOError as e:
        logger.error(f"Failed to write ALT file {file_path}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Could not generate ALT file: {e}")

# --- API Endpoints ---
@app.get("/health", tags=["Status"], summary="Health Check Endpoint")
async def health_check():
    """Provides a simple health check for the Segmentation Service."""
    logger.debug("Health check endpoint called.")
    return {"status": "ok", "service": "Segmentation Service", "version": app.version}

@app.post("/segment", response_model=SegmentationResponse, tags=["Segmentation"], summary="Segment a User Command")
async def create_segmentation(request: SegmentationRequest):
    """Receives a user command and segments it into an ALT file.

    This endpoint takes a natural language command or structured input and processes it
    based on the specified mode and persona to generate a `*.alt` task definition file.
    """
    logger.info(f"Received segmentation request: Mode=\"{request.mode}\", Persona=\"{request.persona}\"")
    logger.debug(f"Full request payload: {request.dict()}")

    segmentation_id = f"seg_{uuid.uuid4().hex[:12]}"

    try:
        # --- Placeholder for actual segmentation logic ---
        # This is where NLP, intent recognition, entity extraction, and task planning would occur.
        # For now, we just generate a basic ALT file.
        alt_file_path = generate_alt_file(segmentation_id, request)
        
        response_data = SegmentationResponse(
            segmentation_id=segmentation_id,
            status="success",
            alt_file_path=alt_file_path,
            message="Command segmented successfully (placeholder logic).",
            mode_used=request.mode,
            persona_used=request.persona
        )
        logger.info(f"Segmentation successful for ID {segmentation_id}. ALT file at {alt_file_path}")
        return response_data

    except HTTPException as http_exc: # Re-raise HTTPExceptions from helpers
        raise http_exc
    except Exception as e:
        logger.exception(f"Error during segmentation for command {request.command}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during segmentation: {str(e)}"
        )

# --- Exception Handlers ---
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request_obj: Request, exc: RequestValidationError):
    logger.error(f"Validation error for request {request_obj.method} {request_obj.url}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Request validation failed", "errors": exc.errors()},
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request_obj: Request, exc: HTTPException):
    logger.warning(f"HTTP exception for request {request_obj.method} {request_obj.url}: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request_obj: Request, exc: Exception):
    logger.exception(f"Unhandled exception for request {request_obj.method} {request_obj.url}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred.", "error_type": type(exc).__name__},
    )

# --- Middleware (Optional) ---
@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url} from {request.client.host}")
    response = await call_next(request)
    logger.info(f"Outgoing response: {request.method} {request.url} - Status {response.status_code}")
    return response

# --- Main Execution (for development) ---
if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Segmentation Service in development mode with Uvicorn...")
    # Ensure ALT_FILE_STORAGE_PATH is writable by the user running this script
    if not os.access(ALT_FILE_STORAGE_PATH, os.W_OK):
        logger.warning(f"Warning: ALT file storage path {ALT_FILE_STORAGE_PATH} may not be writable.")
    uvicorn.run(app, host="0.0.0.0", port=os.getenv("PORT", 8002), reload=True) # Port for Segmentation Service

