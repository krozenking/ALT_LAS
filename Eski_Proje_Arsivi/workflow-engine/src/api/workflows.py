# API endpoints for workflow management (CRUD)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..database import get_db
from ..models.workflow import WorkflowDefinition # Pydantic model for request/response
from ..models import db_models # SQLAlchemy models
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
import uuid

router = APIRouter()

@router.post("/", response_model=WorkflowDefinition, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    workflow_data: WorkflowDefinition,
    db: AsyncSession = Depends(get_db)
):
    """Create a new workflow definition."""
    # Basic validation or use Pydantic
    if not workflow_data.id:
        workflow_data.id = str(uuid.uuid4())

    db_workflow = db_models.Workflow(
        id=workflow_data.id,
        name=workflow_data.name,
        description=workflow_data.description,
        definition=workflow_data.model_dump_json() # Store the whole definition as JSON
    )
    db.add(db_workflow)
    try:
        await db.commit()
        await db.refresh(db_workflow)
        # Return the Pydantic model, parsing the stored JSON
        return WorkflowDefinition.model_validate_json(db_workflow.definition)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Workflow with ID {workflow_data.id} already exists."
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create workflow: {e}"
        )

@router.get("/", response_model=List[WorkflowDefinition])
async def get_workflows(db: AsyncSession = Depends(get_db)):
    """Retrieve all workflow definitions."""
    result = await db.execute(select(db_models.Workflow))
    db_workflows = result.scalars().all()
    # Parse the stored JSON definition back into Pydantic models
    return [WorkflowDefinition.model_validate_json(wf.definition) for wf in db_workflows]

@router.get("/{workflow_id}", response_model=WorkflowDefinition)
async def get_workflow(workflow_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve a specific workflow definition by ID."""
    result = await db.execute(select(db_models.Workflow).where(db_models.Workflow.id == workflow_id))
    db_workflow = result.scalar_one_or_none()
    if db_workflow is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")
    return WorkflowDefinition.model_validate_json(db_workflow.definition)

@router.put("/{workflow_id}", response_model=WorkflowDefinition)
async def update_workflow(
    workflow_id: str,
    workflow_data: WorkflowDefinition,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing workflow definition."""
    result = await db.execute(select(db_models.Workflow).where(db_models.Workflow.id == workflow_id))
    db_workflow = result.scalar_one_or_none()

    if db_workflow is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")

    # Ensure the ID in the path matches the ID in the body if provided
    if workflow_data.id != workflow_id:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Workflow ID mismatch")

    # Update fields
    db_workflow.name = workflow_data.name
    db_workflow.description = workflow_data.description
    # Increment version or handle versioning as needed
    workflow_data.version += 1
    db_workflow.definition = workflow_data.model_dump_json()

    try:
        await db.commit()
        await db.refresh(db_workflow)
        return WorkflowDefinition.model_validate_json(db_workflow.definition)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update workflow: {e}"
        )

@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow(workflow_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a workflow definition."""
    result = await db.execute(select(db_models.Workflow).where(db_models.Workflow.id == workflow_id))
    db_workflow = result.scalar_one_or_none()

    if db_workflow is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")

    await db.delete(db_workflow)
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete workflow: {e}"
        )
    return None

