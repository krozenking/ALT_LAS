from sqlalchemy import Column, Integer, String, JSON, Enum as SQLEnum, ForeignKey, DateTime
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
from ..models.workflow import WorkflowStatus, NodeStatus # Import enums from Pydantic models

Base = declarative_base()

class WorkflowDefinitionDB(Base):
    __tablename__ = "workflow_definitions"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    nodes = Column(JSON) # Store Pydantic Node list as JSON
    edges = Column(JSON) # Store Pydantic Edge list as JSON
    version = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    runs = relationship("WorkflowRunDB", back_populates="definition")

class WorkflowRunDB(Base):
    __tablename__ = "workflow_runs"

    id = Column(String, primary_key=True, index=True)
    workflow_id = Column(String, ForeignKey("workflow_definitions.id"))
    workflow_version = Column(Integer)
    status = Column(SQLEnum(WorkflowStatus), default=WorkflowStatus.IDLE, index=True)
    start_time = Column(DateTime(timezone=True), nullable=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    trigger_data = Column(JSON, nullable=True)
    node_states = Column(JSON) # Store Dict[str, NodeStatus] as JSON
    node_outputs = Column(JSON) # Store Dict[str, Any] as JSON
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    definition = relationship("WorkflowDefinitionDB", back_populates="runs")

# You might add more models here later if needed, e.g., for storing piece execution logs separately.

