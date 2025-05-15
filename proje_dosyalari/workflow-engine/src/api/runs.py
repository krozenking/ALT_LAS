# API endpoints for workflow execution (trigger, status, history)
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any

from ..database import get_db
from ..models.workflow import WorkflowRun, WorkflowDefinition # Pydantic models
from ..models import db_models # SQLAlchemy models
from ..engine.executor import WorkflowExecutor
from ..engine.registry import get_registry
from sqlalchemy.future import select
import uuid
import json

router = APIRouter()

@router.post("/{workflow_id}/trigger", response_model=WorkflowRun, status_code=status.HTTP_202_ACCEPTED)
async def trigger_workflow(
    workflow_id: str,
    background_tasks: BackgroundTasks,
    trigger_data: Dict[str, Any] | None = None,
    db: AsyncSession = Depends(get_db)
):
    """Trigger a workflow execution asynchronously."""
    # 1. Fetch the latest workflow definition
    result = await db.execute(select(db_models.Workflow).where(db_models.Workflow.id == workflow_id))
    db_workflow = result.scalar_one_or_none()
    if db_workflow is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")

    try:
        workflow_def = WorkflowDefinition.model_validate_json(db_workflow.definition)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to parse workflow definition: {e}")

    # 2. Create a new workflow run record
    run_id = str(uuid.uuid4())
    db_run = db_models.WorkflowRun(
        id=run_id,
        workflow_id=workflow_def.id,
        workflow_version=workflow_def.version,
        status="pending", # Initial status
        trigger_data=json.dumps(trigger_data) if trigger_data else None
    )
    db.add(db_run)
    try:
        await db.commit()
        await db.refresh(db_run)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create workflow run record: {e}")

    # 3. Start execution in the background
    executor = WorkflowExecutor(workflow_def, run_id, get_registry(), db)
    background_tasks.add_task(executor.run)

    # 4. Return the initial run details
    # Convert db_run to Pydantic model for response
    run_data = {
        "id": db_run.id,
        "workflow_id": db_run.workflow_id,
        "workflow_version": db_run.workflow_version,
        "status": db_run.status,
        "start_time": db_run.start_time.isoformat() if db_run.start_time else None,
        "end_time": db_run.end_time.isoformat() if db_run.end_time else None,
        "trigger_data": json.loads(db_run.trigger_data) if db_run.trigger_data else None,
        "node_states": json.loads(db_run.node_states) if db_run.node_states else {},
        "node_outputs": json.loads(db_run.node_outputs) if db_run.node_outputs else {},
        "error_message": db_run.error_message
    }
    return WorkflowRun(**run_data)

@router.get("/{run_id}/status", response_model=WorkflowRun)
async def get_run_status(run_id: str, db: AsyncSession = Depends(get_db)):
    """Get the status and details of a specific workflow run."""
    result = await db.execute(select(db_models.WorkflowRun).where(db_models.WorkflowRun.id == run_id))
    db_run = result.scalar_one_or_none()
    if db_run is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow run not found")

    # Convert db_run to Pydantic model
    run_data = {
        "id": db_run.id,
        "workflow_id": db_run.workflow_id,
        "workflow_version": db_run.workflow_version,
        "status": db_run.status,
        "start_time": db_run.start_time.isoformat() if db_run.start_time else None,
        "end_time": db_run.end_time.isoformat() if db_run.end_time else None,
        "trigger_data": json.loads(db_run.trigger_data) if db_run.trigger_data else None,
        "node_states": json.loads(db_run.node_states) if db_run.node_states else {},
        "node_outputs": json.loads(db_run.node_outputs) if db_run.node_outputs else {},
        "error_message": db_run.error_message
    }
    return WorkflowRun(**run_data)

@router.get("/history/{workflow_id}", response_model=List[WorkflowRun])
async def get_workflow_run_history(
    workflow_id: str,
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """Get the execution history for a specific workflow."""
    result = await db.execute(
        select(db_models.WorkflowRun)
        .where(db_models.WorkflowRun.workflow_id == workflow_id)
        .order_by(db_models.WorkflowRun.start_time.desc())
        .limit(limit)
        .offset(offset)
    )
    db_runs = result.scalars().all()

    history = []
    for db_run in db_runs:
        run_data = {
            "id": db_run.id,
            "workflow_id": db_run.workflow_id,
            "workflow_version": db_run.workflow_version,
            "status": db_run.status,
            "start_time": db_run.start_time.isoformat() if db_run.start_time else None,
            "end_time": db_run.end_time.isoformat() if db_run.end_time else None,
            "trigger_data": json.loads(db_run.trigger_data) if db_run.trigger_data else None,
            "node_states": json.loads(db_run.node_states) if db_run.node_states else {},
            "node_outputs": json.loads(db_run.node_outputs) if db_run.node_outputs else {},
            "error_message": db_run.error_message
        }
        history.append(WorkflowRun(**run_data))

    return history

# TODO: Implement Webhook trigger endpoint. This might need a separate router
# or careful handling here if integrated directly.




# Webhook Trigger Endpoint
@router.post("/webhook/{workflow_id}/{trigger_node_id}", status_code=status.HTTP_202_ACCEPTED)
async def webhook_trigger(
    workflow_id: str,
    trigger_node_id: str,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Receive webhook calls and trigger corresponding workflows."""
    # 1. Fetch the workflow definition
    result = await db.execute(select(db_models.Workflow).where(db_models.Workflow.id == workflow_id))
    db_workflow = result.scalar_one_or_none()
    if db_workflow is None:
        # Log error but return 200/202 to webhook sender to avoid retries?
        # Or return 404? Let's return 404 for now.
        logger.error(f"Webhook received for non-existent workflow ID: {workflow_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")

    try:
        workflow_def = WorkflowDefinition.model_validate_json(db_workflow.definition)
    except Exception as e:
        logger.error(f"Failed to parse workflow definition {workflow_id} for webhook: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to parse workflow definition")

    # 2. Find the specific webhook trigger node
    trigger_node = next((node for node in workflow_def.nodes if node.id == trigger_node_id and node.piece_type == "webhook_trigger"), None)
    if trigger_node is None:
        logger.error(f"Webhook received for non-existent or non-webhook trigger node ID: {trigger_node_id} in workflow {workflow_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Webhook trigger node not found in workflow")

    # 3. Extract webhook data (headers, body)
    # TODO: Add validation based on trigger_node.config if needed (e.g., secret validation)
    webhook_data = {
        "headers": dict(request.headers),
        "query_params": dict(request.query_params),
        "body": await request.json() # Assuming JSON body, might need to handle other types
    }

    # 4. Create a new workflow run record
    run_id = str(uuid.uuid4())
    db_run = db_models.WorkflowRun(
        id=run_id,
        workflow_id=workflow_def.id,
        workflow_version=workflow_def.version,
        status="pending",
        trigger_data=json.dumps(webhook_data) # Store the full webhook context
    )
    db.add(db_run)
    try:
        await db.commit()
        await db.refresh(db_run)
        logger.info(f"Webhook triggered workflow run {run_id} for workflow {workflow_id}")
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to create workflow run record for webhook trigger {workflow_id}/{trigger_node_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create workflow run record")

    # 5. Start execution in the background
    # Need to pass the specific trigger node ID to the executor
    # The executor should then use this ID to start the flow from that node
    # For now, let's assume the executor handles starting from a specific trigger
    # or that the webhook_data is sufficient for the WebhookTrigger piece.
    executor = WorkflowExecutor(workflow_def, run_id, get_registry(), db, start_node_id=trigger_node_id)
    background_tasks.add_task(executor.run)

    # 6. Return acceptance
    # We don't return the full WorkflowRun here as the webhook sender usually just needs confirmation
    return {"status": "accepted", "run_id": run_id}


