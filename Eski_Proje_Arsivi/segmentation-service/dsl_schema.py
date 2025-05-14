"""
DSL (Domain Specific Language) Schema for ALT_LAS Segmentation Service

This module defines the DSL schema for the ALT_LAS Segmentation Service,
providing a structured format for command segmentation and processing.
"""

from typing import Dict, List, Any, Optional, Union
from pydantic import BaseModel, Field, validator
import yaml
import json
import uuid
import datetime

class TaskParameter(BaseModel):
    """Model for task parameters"""
    name: str = Field(..., description="Parameter name")
    value: Any = Field(..., description="Parameter value")
    type: str = Field("string", description="Parameter type (string, number, boolean, array, object)")
    required: bool = Field(False, description="Whether the parameter is required")
    description: Optional[str] = Field(None, description="Parameter description")

class TaskSegment(BaseModel):
    """Model for task segments"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique identifier for the segment")
    task_type: str = Field(..., description="Type of task (search, create, analyze, etc.)")
    content: str = Field(..., description="Original content of the segment")
    parameters: List[TaskParameter] = Field(default_factory=list, description="Parameters for the task")
    dependencies: List[str] = Field(default_factory=list, description="IDs of segments this segment depends on")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata for the segment")

class AltFile(BaseModel):
    """Model for ALT file format"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique identifier for the ALT file")
    version: str = Field("1.0", description="ALT file format version")
    timestamp: str = Field(default_factory=lambda: datetime.datetime.now().isoformat(), description="Creation timestamp")
    command: str = Field(..., description="Original command")
    language: str = Field(..., description="Detected language of the command")
    mode: str = Field("Normal", description="Processing mode (Normal, Dream, Explore, Chaos)")
    persona: str = Field("technical_expert", description="Persona to use for processing")
    chaos_level: Optional[int] = Field(None, description="Chaos level (1-10) for Chaos mode")
    segments: List[TaskSegment] = Field(..., description="Task segments")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

    @validator('mode')
    def validate_mode(cls, v):
        """Validate mode value"""
        valid_modes = ["Normal", "Dream", "Explore", "Chaos"]
        if v not in valid_modes:
            raise ValueError(f"Mode must be one of {valid_modes}")
        return v
    
    @validator('chaos_level')
    def validate_chaos_level(cls, v, values):
        """Validate chaos_level based on mode"""
        if values.get('mode') == "Chaos" and (v is None or not 1 <= v <= 10):
            raise ValueError("Chaos level must be between 1 and 10 when mode is Chaos")
        if values.get('mode') != "Chaos" and v is not None:
            raise ValueError("Chaos level should only be set when mode is Chaos")
        return v

def alt_to_yaml(alt_file: AltFile) -> str:
    """
    Convert ALT file to YAML format
    
    Args:
        alt_file: ALT file object
        
    Returns:
        YAML string representation
    """
    return yaml.dump(alt_file.dict(), sort_keys=False, default_flow_style=False)

def alt_to_json(alt_file: AltFile) -> str:
    """
    Convert ALT file to JSON format
    
    Args:
        alt_file: ALT file object
        
    Returns:
        JSON string representation
    """
    return json.dumps(alt_file.dict(), indent=2)

def yaml_to_alt(yaml_str: str) -> AltFile:
    """
    Convert YAML string to ALT file object
    
    Args:
        yaml_str: YAML string
        
    Returns:
        ALT file object
    """
    data = yaml.safe_load(yaml_str)
    return AltFile(**data)

def json_to_alt(json_str: str) -> AltFile:
    """
    Convert JSON string to ALT file object
    
    Args:
        json_str: JSON string
        
    Returns:
        ALT file object
    """
    data = json.loads(json_str)
    return AltFile(**data)

def save_alt_file(alt_file: AltFile, file_path: str, format: str = "yaml") -> None:
    """
    Save ALT file to disk
    
    Args:
        alt_file: ALT file object
        file_path: Path to save the file
        format: Format to save the file in (yaml or json)
    """
    if format.lower() == "yaml":
        content = alt_to_yaml(alt_file)
    elif format.lower() == "json":
        content = alt_to_json(alt_file)
    else:
        raise ValueError("Format must be either 'yaml' or 'json'")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def load_alt_file(file_path: str) -> AltFile:
    """
    Load ALT file from disk
    
    Args:
        file_path: Path to the file
        
    Returns:
        ALT file object
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if file_path.endswith('.yaml') or file_path.endswith('.yml'):
        return yaml_to_alt(content)
    elif file_path.endswith('.json'):
        return json_to_alt(content)
    else:
        # Try to determine format from content
        try:
            return json_to_alt(content)
        except:
            try:
                return yaml_to_alt(content)
            except:
                raise ValueError("Could not determine file format. Use .yaml or .json extension.")

# Example usage
if __name__ == "__main__":
    # Create a sample ALT file
    task1 = TaskSegment(
        task_type="search",
        content="Search for information about AI",
        parameters=[
            TaskParameter(name="query", value="information about AI", type="string", required=True)
        ],
        metadata={"confidence": 0.95}
    )
    
    task2 = TaskSegment(
        task_type="create",
        content="Create a report",
        parameters=[
            TaskParameter(name="format", value="pdf", type="string", required=True),
            TaskParameter(name="title", value="AI Report", type="string", required=True)
        ],
        dependencies=[task1.id],
        metadata={"confidence": 0.9}
    )
    
    alt_file = AltFile(
        command="Search for information about AI and create a report",
        language="en",
        mode="Normal",
        persona="researcher",
        segments=[task1, task2],
        metadata={"source": "user_input", "priority": "high"}
    )
    
    # Convert to YAML and print
    yaml_str = alt_to_yaml(alt_file)
    print("YAML representation:")
    print(yaml_str)
    
    # Convert to JSON and print
    json_str = alt_to_json(alt_file)
    print("\nJSON representation:")
    print(json_str)
    
    # Save to file
    save_alt_file(alt_file, "example.alt.yaml")
    
    # Load from file
    loaded_alt = load_alt_file("example.alt.yaml")
    print("\nLoaded ALT file:")
    print(f"ID: {loaded_alt.id}")
    print(f"Command: {loaded_alt.command}")
    print(f"Number of segments: {len(loaded_alt.segments)}")
