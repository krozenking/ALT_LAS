from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum

class NodeType(str, Enum):
    TRIGGER = "trigger"
    ACTION = "action"

class NodeStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class WorkflowStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class Node(BaseModel):
    id: str
    type: NodeType
    piece_type: str # e.g., "webhook_trigger", "http_request", "code_executor"
    config: Dict[str, Any] = Field(default_factory=dict)
    position: Dict[str, int] = Field(default_factory=lambda: {"x": 0, "y": 0})

class Edge(BaseModel):
    id: str
    source_node_id: str
    target_node_id: str
    source_handle: Optional[str] = None # Optional: for nodes with multiple output handles
    target_handle: Optional[str] = None # Optional: for nodes with multiple input handles

class WorkflowDefinition(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    nodes: List[Node] = Field(default_factory=list)
    edges: List[Edge] = Field(default_factory=list)
    version: int = 1

class WorkflowRun(BaseModel):
    id: str
    workflow_id: str
    workflow_version: int
    status: WorkflowStatus = WorkflowStatus.IDLE
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    trigger_data: Optional[Dict[str, Any]] = None
    node_states: Dict[str, NodeStatus] = Field(default_factory=dict) # node_id -> status
    node_outputs: Dict[str, Any] = Field(default_factory=dict) # node_id -> output_data
    error_message: Optional[str] = None

