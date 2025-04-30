import asyncio
import logging
import time
from typing import Dict, Any, List, Set
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from src.models.workflow import WorkflowDefinition, WorkflowRun, NodeStatus, WorkflowStatus, Node, NodeType
from src.models.db_models import WorkflowRunDB # Import the DB model
from src.pieces.base import Piece
from src.engine.registry import PieceRegistry

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Default retry configuration
DEFAULT_MAX_RETRIES = 3
DEFAULT_RETRY_DELAY_SECONDS = 5

# Default concurrency limit
DEFAULT_MAX_CONCURRENT_NODES = 5

class WorkflowExecutor:
    """Handles the execution of a single workflow run, including persistence, retries, and parallel execution."""

    def __init__(self, workflow_def: WorkflowDefinition, workflow_run: WorkflowRun, registry: PieceRegistry, db_session: AsyncSession):
        self.workflow_def = workflow_def
        self.workflow_run = workflow_run # Pydantic model for in-memory state
        self.registry = registry
        self.db_session = db_session
        self.node_map: Dict[str, Node] = {node.id: node for node in workflow_def.nodes}
        self.adjacency_list: Dict[str, List[str]] = {node.id: [] for node in workflow_def.nodes}
        self.in_degree: Dict[str, int] = {node.id: 0 for node in workflow_def.nodes}
        self.processed_nodes: Set[str] = set()
        self.max_concurrent_nodes = workflow_def.config.get("max_concurrent_nodes", DEFAULT_MAX_CONCURRENT_NODES) if hasattr(workflow_def, 'config') else DEFAULT_MAX_CONCURRENT_NODES
        self._build_graph()

    def _build_graph(self):
        """Builds the adjacency list and in-degree map from the workflow edges."""
        for edge in self.workflow_def.edges:
            if edge.source_node_id in self.node_map and edge.target_node_id in self.node_map:
                self.adjacency_list[edge.source_node_id].append(edge.target_node_id)
                self.in_degree[edge.target_node_id] += 1
            else:
                logger.warning(f"Edge {edge.id} connects non-existent nodes.")

    async def _update_run_status(self, status: WorkflowStatus, error_message: str | None = None):
        """Updates the workflow run status in memory and persists to DB."""
        # Avoid overwriting a FAILED status with COMPLETED
        if self.workflow_run.status == WorkflowStatus.FAILED and status == WorkflowStatus.COMPLETED:
            logger.info(f"WorkflowRun {self.workflow_run.id} already marked as FAILED. Ignoring COMPLETED update.")
            return
            
        self.workflow_run.status = status
        if error_message:
            self.workflow_run.error_message = error_message
        if status == WorkflowStatus.RUNNING and not self.workflow_run.start_time:
            self.workflow_run.start_time = datetime.now(timezone.utc).isoformat()
        elif status in [WorkflowStatus.COMPLETED, WorkflowStatus.FAILED]:
            self.workflow_run.end_time = datetime.now(timezone.utc).isoformat()

        try:
            db_run_data = {
                "id": self.workflow_run.id,
                "status": status,
                "error_message": error_message,
                "start_time": datetime.fromisoformat(self.workflow_run.start_time) if self.workflow_run.start_time else None,
                "end_time": datetime.fromisoformat(self.workflow_run.end_time) if self.workflow_run.end_time else None,
                "workflow_id": self.workflow_run.workflow_id,
                "workflow_version": self.workflow_run.workflow_version,
                "trigger_data": self.workflow_run.trigger_data,
                "node_states": self.workflow_run.node_states,
                "node_outputs": self.workflow_run.node_outputs
            }
            await self.db_session.merge(WorkflowRunDB(**db_run_data))
            await self.db_session.commit()
            logger.info(f"Persisted WorkflowRun {self.workflow_run.id} status: {status}")
        except Exception as e:
            logger.error(f"Failed to persist WorkflowRun {self.workflow_run.id} status: {e}", exc_info=True)
            await self.db_session.rollback()

    async def _update_node_state(self, node_id: str, status: NodeStatus, output_data: Any | None = None):
        """Updates a node's state in memory and persists the run state to DB."""
        self.workflow_run.node_states[node_id] = status
        if output_data is not None:
            self.workflow_run.node_outputs[node_id] = output_data

        try:
            db_run_data = {
                "id": self.workflow_run.id,
                "node_states": self.workflow_run.node_states,
                "node_outputs": self.workflow_run.node_outputs,
                "status": self.workflow_run.status,
                "error_message": self.workflow_run.error_message,
                "start_time": datetime.fromisoformat(self.workflow_run.start_time) if self.workflow_run.start_time else None,
                "end_time": datetime.fromisoformat(self.workflow_run.end_time) if self.workflow_run.end_time else None,
                "workflow_id": self.workflow_run.workflow_id,
                "workflow_version": self.workflow_run.workflow_version,
                "trigger_data": self.workflow_run.trigger_data
            }
            await self.db_session.merge(WorkflowRunDB(**db_run_data))
            await self.db_session.commit()
            logger.info(f"Persisted Node {node_id} state: {status} for Run {self.workflow_run.id}")
        except Exception as e:
            logger.error(f"Failed to persist Node {node_id} state for Run {self.workflow_run.id}: {e}", exc_info=True)
            await self.db_session.rollback()

    async def _execute_node(self, node_id: str):
        """Executes a single node with retry logic."""
        node = self.node_map.get(node_id)
        if not node:
            # This case should ideally be caught before calling _execute_node
            raise RuntimeError(f"Node {node_id} not found in definition during execution.")

        await self._update_node_state(node_id, NodeStatus.RUNNING)
        logger.info(f"Executing Node {node_id} ({node.piece_type}) for Run {self.workflow_run.id}")

        retries = 0
        max_retries = node.config.get("max_retries", DEFAULT_MAX_RETRIES)
        retry_delay = node.config.get("retry_delay_seconds", DEFAULT_RETRY_DELAY_SECONDS)
        last_exception = None

        while retries <= max_retries:
            try:
                piece_class = self.registry.get_piece(node.piece_type)
                if not piece_class:
                    raise ValueError(f"Piece type 	{node.piece_type}	 not found in registry.")

                piece_instance: Piece = piece_class(node)

                # Gather input data (simplified)
                # TODO: Handle multiple inputs, specific handles
                input_data = {}
                # Find predecessors based on graph structure
                predecessors = [pred_id for pred_id, neighbors in self.adjacency_list.items() if node_id in neighbors]
                for pred_id in predecessors:
                     if pred_id in self.workflow_run.node_outputs:
                        input_data.update(self.workflow_run.node_outputs.get(pred_id, {}))

                if node.type == NodeType.TRIGGER:
                    input_data.update(self.workflow_run.trigger_data or {})

                # Execute the piece
                output_data = await piece_instance.execute(input_data)

                # Success!
                await self._update_node_state(node_id, NodeStatus.COMPLETED, output_data)
                logger.info(f"Node {node_id} completed successfully on attempt {retries + 1} for Run {self.workflow_run.id}")
                return # Return on success

            except Exception as e:
                last_exception = e
                retries += 1
                if retries <= max_retries:
                    logger.warning(f"Node {node_id} failed on attempt {retries}/{max_retries + 1} for Run {self.workflow_run.id}. Retrying in {retry_delay}s... Error: {e}")
                    await asyncio.sleep(retry_delay)
                else:
                    logger.error(f"Node {node_id} failed after {max_retries + 1} attempts for Run {self.workflow_run.id}. Error: {e}", exc_info=True)
                    # Raise the exception after final attempt to signal failure
                    raise last_exception

    async def execute(self):
        """Executes the workflow with parallel node processing, persistence, and retries."""
        logger.info(f"Starting execution for WorkflowRun ID: {self.workflow_run.id}")
        await self._update_run_status(WorkflowStatus.RUNNING)

        semaphore = asyncio.Semaphore(self.max_concurrent_nodes)
        running_tasks: Dict[str, asyncio.Task] = {}
        nodes_to_process: Set[str] = set()
        final_status = WorkflowStatus.COMPLETED # Assume success initially
        final_error_message = None

        # Initialize with nodes having in-degree 0
        for node_id, degree in self.in_degree.items():
            if degree == 0:
                nodes_to_process.add(node_id)
                await self._update_node_state(node_id, NodeStatus.PENDING)

        while nodes_to_process or running_tasks:
            # Start new tasks if possible
            while nodes_to_process and len(running_tasks) < self.max_concurrent_nodes:
                node_id = nodes_to_process.pop()
                if node_id not in self.processed_nodes and node_id not in running_tasks:
                    logger.debug(f"Creating task for node {node_id}")
                    task = asyncio.create_task(self._execute_node_wrapper(node_id, semaphore))
                    running_tasks[node_id] = task

            if not running_tasks:
                # Should not happen if nodes_to_process was not empty, but safety check
                await asyncio.sleep(0.1) # Prevent tight loop if something unexpected happens
                continue

            # Wait for any task to complete
            done, pending = await asyncio.wait(running_tasks.values(), return_when=asyncio.FIRST_COMPLETED)

            for task in done:
                node_id = None
                # Find the node_id associated with the completed task
                for nid, t in running_tasks.items():
                    if t == task:
                        node_id = nid
                        break
                
                if node_id is None:
                    logger.error("Completed task not found in running_tasks mapping!")
                    continue

                del running_tasks[node_id] # Remove from running tasks
                self.processed_nodes.add(node_id)

                try:
                    await task # Raise exception if task failed
                    # Task completed successfully, process successors
                    for neighbor_id in self.adjacency_list[node_id]:
                        self.in_degree[neighbor_id] -= 1
                        if self.in_degree[neighbor_id] == 0 and neighbor_id not in self.processed_nodes:
                            nodes_to_process.add(neighbor_id)
                            # Persist PENDING state for newly ready nodes
                            await self._update_node_state(neighbor_id, NodeStatus.PENDING)
                except Exception as e:
                    # Task failed (exception raised in _execute_node_wrapper)
                    logger.error(f"Task for node {node_id} failed: {e}")
                    final_status = WorkflowStatus.FAILED
                    final_error_message = self.workflow_run.error_message or f"Node {node_id} processing failed."
                    # Cancel remaining tasks (optional, could be configurable)
                    logger.info(f"Cancelling remaining {len(pending)} tasks due to failure in node {node_id}.")
                    for remaining_task in pending:
                        remaining_task.cancel()
                    # Clear nodes_to_process to stop scheduling new tasks
                    nodes_to_process.clear()
                    # Ensure loop terminates
                    running_tasks.clear()
                    break # Exit the outer while loop
            
            # Check if a failure occurred in the inner loop
            if final_status == WorkflowStatus.FAILED:
                break

        # Final status update
        await self._update_run_status(final_status, final_error_message)
        logger.info(f"Workflow run {self.workflow_run.id} finished with status: {self.workflow_run.status}")

    async def _execute_node_wrapper(self, node_id: str, semaphore: asyncio.Semaphore):
        """Wrapper to handle semaphore acquisition/release and exceptions for _execute_node."""
        async with semaphore:
            try:
                await self._execute_node(node_id)
            except Exception as e:
                # Ensure failure state is persisted if _execute_node fails after retries
                if self.workflow_run.node_states.get(node_id) != NodeStatus.FAILED:
                    error_msg = f"Node {node_id} failed after retries: {e}"
                    await self._update_node_state(node_id, NodeStatus.FAILED)
                    # Update run status only if it's not already failed
                    if self.workflow_run.status != WorkflowStatus.FAILED:
                         await self._update_run_status(WorkflowStatus.FAILED, error_msg)
                # Re-raise the exception so the main loop can catch it
                raise

