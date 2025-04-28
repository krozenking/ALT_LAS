import asyncio
from typing import Dict, Any
from models.workflow import WorkflowDefinition, WorkflowRun, NodeStatus, WorkflowStatus, Node
from pieces.base import Piece
from .registry import PieceRegistry

class WorkflowExecutor:
    """Handles the execution of a single workflow run."""

    def __init__(self, workflow_def: WorkflowDefinition, workflow_run: WorkflowRun, registry: PieceRegistry):
        self.workflow_def = workflow_def
        self.workflow_run = workflow_run
        self.registry = registry
        self.node_map: Dict[str, Node] = {node.id: node for node in workflow_def.nodes}
        self.adjacency_list: Dict[str, List[str]] = {node.id: [] for node in workflow_def.nodes}
        self.in_degree: Dict[str, int] = {node.id: 0 for node in workflow_def.nodes}
        self._build_graph()

    def _build_graph(self):
        """Builds the adjacency list and in-degree map from the workflow edges."""
        for edge in self.workflow_def.edges:
            if edge.source_node_id in self.node_map and edge.target_node_id in self.node_map:
                self.adjacency_list[edge.source_node_id].append(edge.target_node_id)
                self.in_degree[edge.target_node_id] += 1
            else:
                # Handle potential inconsistencies (e.g., edge points to non-existent node)
                print(f"Warning: Edge {edge.id} connects non-existent nodes.")

    async def execute(self):
        """Executes the workflow using topological sort."""
        self.workflow_run.status = WorkflowStatus.RUNNING
        # TODO: Persist status update

        queue = asyncio.Queue()
        active_tasks = 0

        # Initialize queue with nodes having in-degree 0 (start nodes/triggers)
        for node_id, degree in self.in_degree.items():
            if degree == 0:
                await queue.put(node_id)
                self.workflow_run.node_states[node_id] = NodeStatus.PENDING
                active_tasks += 1

        while active_tasks > 0:
            node_id = await queue.get()
            node = self.node_map.get(node_id)

            if not node:
                print(f"Error: Node {node_id} not found in definition.")
                active_tasks -= 1
                queue.task_done()
                continue

            self.workflow_run.node_states[node_id] = NodeStatus.RUNNING
            # TODO: Persist status update

            try:
                piece_class = self.registry.get_piece(node.piece_type)
                if not piece_class:
                    raise ValueError(f"Piece type 	{node.piece_type}	 not found in registry.")

                piece_instance: Piece = piece_class(node)

                # Gather input data (simplified: assumes single input from predecessors)
                # TODO: Handle multiple inputs, specific handles
                input_data = {}
                for pred_id, neighbors in self.adjacency_list.items():
                    if node_id in neighbors:
                        # Find the edge connecting pred_id to node_id
                        # This assumes a simple structure; needs refinement for handles
                        if pred_id in self.workflow_run.node_outputs:
                           # Simple merge, might need more sophisticated handling
                           input_data.update(self.workflow_run.node_outputs.get(pred_id, {}))

                # If it's a trigger node, use trigger_data
                if node.type == NodeType.TRIGGER:
                    input_data.update(self.workflow_run.trigger_data or {})

                output_data = await piece_instance.execute(input_data)
                self.workflow_run.node_outputs[node_id] = output_data
                self.workflow_run.node_states[node_id] = NodeStatus.COMPLETED
                # TODO: Persist status and output

                # Add successors to the queue
                for neighbor_id in self.adjacency_list[node_id]:
                    self.in_degree[neighbor_id] -= 1
                    if self.in_degree[neighbor_id] == 0:
                        await queue.put(neighbor_id)
                        self.workflow_run.node_states[neighbor_id] = NodeStatus.PENDING
                        active_tasks += 1

            except Exception as e:
                print(f"Error executing node {node_id}: {e}")
                self.workflow_run.node_states[node_id] = NodeStatus.FAILED
                self.workflow_run.status = WorkflowStatus.FAILED
                self.workflow_run.error_message = f"Node {node_id} failed: {e}"
                # TODO: Persist status and error
                # Stop further execution on failure (optional, could be configurable)
                break # Exit the loop on first failure
            finally:
                active_tasks -= 1
                queue.task_done()

        if self.workflow_run.status != WorkflowStatus.FAILED:
            self.workflow_run.status = WorkflowStatus.COMPLETED
        # TODO: Persist final status
        print(f"Workflow run {self.workflow_run.id} finished with status: {self.workflow_run.status}")

