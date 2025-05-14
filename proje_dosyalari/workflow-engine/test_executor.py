#!/usr/bin/env python3
import asyncio
import uuid
import logging
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession

# Adjust imports based on actual project structure
from src.database import AsyncSessionLocal, engine
from src.models.db_models import Base, WorkflowDefinitionDB, WorkflowRunDB # Import Base from db_models
from src.models.workflow import WorkflowDefinition, WorkflowRun, Node, Edge, NodeType, WorkflowStatus, NodeStatus # Import Pydantic models
from src.engine.executor import WorkflowExecutor # Import WorkflowExecutor
from src.engine.registry import PieceRegistry, get_registry
from src.pieces.base import Piece

# Setup logging for testing
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("test_executor")

# --- Mock Pieces for Testing ---

class SuccessPiece(Piece):
    async def execute(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"Executing SuccessPiece (Node {self.node.id}) with inputs: {inputs}")
        await asyncio.sleep(0.1) # Simulate work
        return {"output": f"Success from {self.node.id}", **inputs}

class FailPiece(Piece):
    async def execute(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        attempt = inputs.get("_retry_attempt", 0) # Simple way to track attempts if needed
        logger.info(f"Executing FailPiece (Node {self.node.id}) - Attempt {attempt + 1}")
        await asyncio.sleep(0.1)
        # Fail on the first attempt (or always, depending on test case)
        if attempt < 1: # Fail only once for retry test
             raise ValueError(f"Intentional failure in Node {self.node.id}")
        logger.info(f"FailPiece (Node {self.node.id}) succeeded on attempt {attempt + 1}")
        return {"output": f"Success after failure from {self.node.id}"}

class DelayPiece(Piece):
    async def execute(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        delay = self.node.config.get("delay_seconds", 0.5)
        logger.info(f"Executing DelayPiece (Node {self.node.id}), delaying for {delay}s")
        await asyncio.sleep(delay)
        return {"output": f"Delayed output from {self.node.id}", **inputs}

# --- Test Setup ---

async def setup_test_workflow(session: AsyncSession) -> tuple[WorkflowDefinition, WorkflowRun]:
    """Creates a sample workflow definition and run record in the DB."""
    
    # Define Pydantic Workflow Definition
    wf_def_id = f"test_wf_exec_{uuid.uuid4()}"
    nodes = [
        Node(id="start", type=NodeType.TRIGGER, piece_type="manual_trigger", config={}),
        Node(id="task_a", type=NodeType.ACTION, piece_type="success_piece", config={}),
        Node(id="task_b", type=NodeType.ACTION, piece_type="delay_piece", config={"delay_seconds": 0.2}),
        Node(id="task_c_fail_retry", type=NodeType.ACTION, piece_type="fail_piece", config={"max_retries": 1, "retry_delay_seconds": 0.1}), # Should succeed on retry
        Node(id="task_d", type=NodeType.ACTION, piece_type="success_piece", config={}),
        Node(id="end", type=NodeType.ACTION, piece_type="success_piece", config={}),
    ]
    edges = [
        Edge(id="e1", source_node_id="start", target_node_id="task_a"),
        Edge(id="e2", source_node_id="start", target_node_id="task_b"),
        Edge(id="e3", source_node_id="task_a", target_node_id="task_c_fail_retry"),
        Edge(id="e4", source_node_id="task_b", target_node_id="task_d"),
        Edge(id="e5", source_node_id="task_c_fail_retry", target_node_id="end"),
        Edge(id="e6", source_node_id="task_d", target_node_id="end"),
    ]
    pydantic_def = WorkflowDefinition(id=wf_def_id, name="Executor Test Workflow", nodes=nodes, edges=edges)

    # Save Definition to DB
    db_def = WorkflowDefinitionDB(
        id=pydantic_def.id,
        name=pydantic_def.name,
        nodes=[n.model_dump() for n in pydantic_def.nodes],
        edges=[e.model_dump() for e in pydantic_def.edges],
        version=1
    )
    session.add(db_def)
    await session.commit()
    await session.refresh(db_def)
    logger.info(f"Created test WorkflowDefinitionDB: {wf_def_id}")

    # Create Run Record in DB
    run_id = f"test_run_exec_{uuid.uuid4()}"
    pydantic_run = WorkflowRun(
        id=run_id,
        workflow_id=wf_def_id,
        workflow_version=db_def.version,
        trigger_data={"initial_input": "test_value"}
    )
    db_run = WorkflowRunDB(
        id=pydantic_run.id,
        workflow_id=pydantic_run.workflow_id,
        workflow_version=pydantic_run.workflow_version,
        status=WorkflowStatus.IDLE,
        trigger_data=pydantic_run.trigger_data,
        node_states={},
        node_outputs={}
    )
    session.add(db_run)
    await session.commit()
    await session.refresh(db_run)
    logger.info(f"Created test WorkflowRunDB: {run_id}")

    return pydantic_def, pydantic_run

async def cleanup_test_data(session: AsyncSession, wf_def_id: str, run_id: str):
    """Deletes the test workflow definition and run from the DB."""
    await session.execute(WorkflowRunDB.__table__.delete().where(WorkflowRunDB.id == run_id))
    await session.execute(WorkflowDefinitionDB.__table__.delete().where(WorkflowDefinitionDB.id == wf_def_id))
    await session.commit()
    logger.info(f"Cleaned up test data for Def: {wf_def_id}, Run: {run_id}")

# --- Test Execution ---

async def test_executor_flow():
    logger.info("--- Starting Executor Test --- ")
    
    # Ensure tables exist (Alembic should handle this, but good practice for tests)
    # async with engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.create_all)

    registry = get_registry()
    registry.register("success_piece", SuccessPiece)
    registry.register("fail_piece", FailPiece)
    registry.register("delay_piece", DelayPiece)
    # Assuming manual_trigger is registered elsewhere or not needed for execution logic test
    if not registry.get_piece("manual_trigger"): 
        registry.register("manual_trigger", SuccessPiece) # Use SuccessPiece as placeholder if needed

    wf_def = None
    wf_run = None
    
    async with AsyncSessionLocal() as session:
        try:
            wf_def, wf_run = await setup_test_workflow(session)

            # Instantiate Executor
            executor = WorkflowExecutor(wf_def, wf_run, registry, session)

            # Execute the workflow
            await executor.execute()

            # --- Verification --- 
            # Refresh run data from DB
            await session.refresh(db_run, attribute_names=["status", "node_states", "node_outputs", "error_message"])
            
            logger.info(f"Final Run Status: {wf_run.status}")
            logger.info(f"Final Node States: {wf_run.node_states}")
            logger.info(f"Final Node Outputs: {wf_run.node_outputs}")

            # Assertions (adjust based on expected outcome)
            assert wf_run.status == WorkflowStatus.COMPLETED, f"Expected COMPLETED, got {wf_run.status}"
            assert wf_run.node_states.get("start") == NodeStatus.COMPLETED
            assert wf_run.node_states.get("task_a") == NodeStatus.COMPLETED
            assert wf_run.node_states.get("task_b") == NodeStatus.COMPLETED
            assert wf_run.node_states.get("task_c_fail_retry") == NodeStatus.COMPLETED, "Fail/Retry node did not complete"
            assert wf_run.node_states.get("task_d") == NodeStatus.COMPLETED
            assert wf_run.node_states.get("end") == NodeStatus.COMPLETED
            assert "output" in wf_run.node_outputs.get("end", {}), "Final node did not produce output"
            assert "initial_input" in wf_run.node_outputs.get("end", {}), "Initial input not propagated"

            logger.info("--- Executor Test Passed --- ")

        except Exception as e:
            logger.error(f"Executor test failed: {e}", exc_info=True)
            raise
        finally:
            # Cleanup DB data
            if wf_def and wf_run:
                await cleanup_test_data(session, wf_def.id, wf_run.id)
            logger.info("--- Executor Test Finished --- ")

if __name__ == "__main__":
    asyncio.run(test_executor_flow())

