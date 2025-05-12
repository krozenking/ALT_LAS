from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uuid
import datetime

app = FastAPI(title="ALT_LAS Segmentation Service")

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

@app.post("/segment", response_model=SegmentationResponse)
def segment_command(request: SegmentationRequest):
    try:
        # Generate a unique ID for this segmentation task
        task_id = str(uuid.uuid4())
        
        # Create metadata with basic information
        metadata = {
            "timestamp": datetime.datetime.now().isoformat(),
            "mode": request.mode,
            "persona": request.persona,
            "command_length": len(request.command)
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
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Segmentation error: {str(e)}")

@app.get("/segment/{task_id}", response_model=SegmentationResponse)
def get_segmentation_status(task_id: str):
    # In a real implementation, this would check the status of a segmentation task
    # For now, we'll just return a mock response
    
    # Check if the task exists (mock check)
    if not task_id:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Create mock response
    response = SegmentationResponse(
        id=task_id,
        status="completed",
        alt_file=f"task_{task_id}.alt",
        metadata={
            "timestamp": datetime.datetime.now().isoformat(),
            "mode": "Normal",
            "persona": "technical_expert"
        }
    )
    
    return response
