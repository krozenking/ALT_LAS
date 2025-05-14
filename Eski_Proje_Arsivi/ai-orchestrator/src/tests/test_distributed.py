import pytest
import asyncio
import time
from unittest.mock import MagicMock, patch
from typing import Dict, List, Any

from ...src.core.distributed import (
    DistributedModelOrchestrator,
    NodeStatus,
    DistributionStrategy,
    ResultAggregationStrategy,
    NodeInfo,
    DistributedTask,
    get_distributed_model_orchestrator
)
from ...src.models.inference import InferenceRequest, InferenceResponse
from ...src.models.model import ModelInfo, ModelType

# Mock model manager for testing
class MockModelManager:
    async def get_model(self, model_id: str) -> ModelInfo:
        return ModelInfo(
            model_id=model_id,
            name=f"Test Model {model_id}",
            model_type=ModelType.TEXT,
            supports_gpu=True,
            status="loaded"
        )

@pytest.fixture
def model_manager():
    return MockModelManager()

@pytest.fixture
def orchestrator(model_manager):
    orchestrator = DistributedModelOrchestrator(model_manager)
    return orchestrator

@pytest.mark.asyncio
async def test_init_local_node(orchestrator):
    """Test that local node is initialized correctly."""
    assert orchestrator.local_node is not None
    assert orchestrator.local_node.node_id == orchestrator._node_id
    assert orchestrator.local_node.status == NodeStatus.ONLINE
    assert orchestrator._node_id in orchestrator.nodes
    assert orchestrator._node_id in orchestrator.node_locks

@pytest.mark.asyncio
async def test_list_nodes(orchestrator):
    """Test listing nodes."""
    # Initially should only have local node
    nodes = await orchestrator.list_nodes()
    assert len(nodes) == 1
    assert nodes[0].node_id == orchestrator._node_id
    
    # Add a test node
    test_node = NodeInfo(
        node_id="test-node",
        hostname="test-host",
        ip_address="192.168.1.100",
        status=NodeStatus.ONLINE
    )
    orchestrator.nodes["test-node"] = test_node
    orchestrator.node_locks["test-node"] = asyncio.Lock()
    
    # Should now have two nodes
    nodes = await orchestrator.list_nodes()
    assert len(nodes) == 2
    
    # Add an offline node
    offline_node = NodeInfo(
        node_id="offline-node",
        hostname="offline-host",
        ip_address="192.168.1.101",
        status=NodeStatus.OFFLINE
    )
    orchestrator.nodes["offline-node"] = offline_node
    orchestrator.node_locks["offline-node"] = asyncio.Lock()
    
    # Should still have two online nodes
    nodes = await orchestrator.list_nodes()
    assert len(nodes) == 2
    
    # But three total nodes when including offline
    nodes = await orchestrator.list_nodes(include_offline=True)
    assert len(nodes) == 3

@pytest.mark.asyncio
async def test_get_node(orchestrator):
    """Test getting a specific node."""
    # Get local node
    node = await orchestrator.get_node(orchestrator._node_id)
    assert node is not None
    assert node.node_id == orchestrator._node_id
    
    # Get non-existent node
    node = await orchestrator.get_node("non-existent")
    assert node is None
    
    # Add a test node and get it
    test_node = NodeInfo(
        node_id="test-node",
        hostname="test-host",
        ip_address="192.168.1.100",
        status=NodeStatus.ONLINE
    )
    orchestrator.nodes["test-node"] = test_node
    
    node = await orchestrator.get_node("test-node")
    assert node is not None
    assert node.node_id == "test-node"

@pytest.mark.asyncio
async def test_select_node_for_model(orchestrator):
    """Test selecting a node for a model."""
    # Add some test nodes
    nodes = [
        NodeInfo(
            node_id=f"test-node-{i}",
            hostname=f"test-host-{i}",
            ip_address=f"192.168.1.{100+i}",
            status=NodeStatus.ONLINE,
            available_models=["model-1", "model-2"] if i % 2 == 0 else ["model-3"],
            current_tasks=i,
            resources={"cpu_percent": 10 * i, "memory_percent": 10 * i}
        )
        for i in range(5)
    ]
    
    for node in nodes:
        orchestrator.nodes[node.node_id] = node
        orchestrator.node_locks[node.node_id] = asyncio.Lock()
    
    # Test ROUND_ROBIN strategy
    node_id = await orchestrator.select_node_for_model(
        "model-1", 
        strategy=DistributionStrategy.ROUND_ROBIN
    )
    assert node_id is not None
    
    # Test LEAST_LOADED strategy
    node_id = await orchestrator.select_node_for_model(
        "model-1", 
        strategy=DistributionStrategy.LEAST_LOADED
    )
    assert node_id == "test-node-0"  # Should select node with fewest tasks
    
    # Test CAPABILITY_BASED strategy
    # Add GPU capability to one node
    nodes[2].capabilities["cuda_available"] = True
    nodes[2].resources["gpu_percent"] = 30
    
    node_id = await orchestrator.select_node_for_model(
        "model-1", 
        strategy=DistributionStrategy.CAPABILITY_BASED
    )
    assert node_id == "test-node-2"  # Should prefer GPU node for GPU model
    
    # Test LATENCY_OPTIMIZED strategy
    # Add response time to nodes
    for i, node in enumerate(nodes):
        node.average_response_time = 0.1 * (i + 1)
    
    node_id = await orchestrator.select_node_for_model(
        "model-1", 
        strategy=DistributionStrategy.LATENCY_OPTIMIZED
    )
    assert node_id == "test-node-0"  # Should select node with lowest response time

@pytest.mark.asyncio
async def test_run_distributed_inference_local(orchestrator):
    """Test running inference on local node."""
    # Mock the local inference method
    async def mock_run_local(*args, **kwargs):
        return InferenceResponse(
            model_id="test-model",
            outputs="Test output",
            metadata={"local": True}
        )
    
    orchestrator._run_local_inference = mock_run_local
    
    # Create a test request
    request = InferenceRequest(
        model_id="test-model",
        inputs="Test input"
    )
    
    # Run inference
    response = await orchestrator.run_distributed_inference(request)
    
    # Check response
    assert response.model_id == "test-model"
    assert response.outputs == "Test output"
    assert response.metadata["local"] is True

@pytest.mark.asyncio
async def test_run_distributed_inference_remote(orchestrator):
    """Test running inference on remote node."""
    # Add a remote node
    remote_node = NodeInfo(
        node_id="remote-node",
        hostname="remote-host",
        ip_address="192.168.1.100",
        status=NodeStatus.ONLINE,
        available_models=["test-model"]
    )
    orchestrator.nodes["remote-node"] = remote_node
    orchestrator.node_locks["remote-node"] = asyncio.Lock()
    
    # Mock the remote inference method
    async def mock_run_remote(*args, **kwargs):
        return InferenceResponse(
            model_id="test-model",
            outputs="Remote output",
            metadata={"remote": True}
        )
    
    orchestrator._run_remote_inference = mock_run_remote
    
    # Mock the select_node_for_model method to return the remote node
    original_select = orchestrator.select_node_for_model
    async def mock_select(*args, **kwargs):
        return "remote-node"
    
    orchestrator.select_node_for_model = mock_select
    
    try:
        # Create a test request
        request = InferenceRequest(
            model_id="test-model",
            inputs="Test input"
        )
        
        # Run inference
        response = await orchestrator.run_distributed_inference(request)
        
        # Check response
        assert response.model_id == "test-model"
        assert response.outputs == "Remote output"
        assert response.metadata["remote"] is True
    finally:
        # Restore original method
        orchestrator.select_node_for_model = original_select

@pytest.mark.asyncio
async def test_run_distributed_parallel_inference(orchestrator):
    """Test running parallel inference across multiple nodes."""
    # Mock the distributed inference method
    original_run_distributed = orchestrator.run_distributed_inference
    
    async def mock_run_distributed(request, strategy):
        return InferenceResponse(
            model_id=request.model_id,
            outputs=f"Output from {request.model_id}",
            metadata={"model_id": request.model_id}
        )
    
    orchestrator.run_distributed_inference = mock_run_distributed
    
    try:
        # Create a test request
        base_request = InferenceRequest(
            model_id="base-model",
            inputs="Test input"
        )
        
        # Run parallel inference with ALL_RESPONSES strategy
        responses = await orchestrator.run_distributed_parallel_inference(
            base_request,
            model_ids=["model-1", "model-2", "model-3"],
            aggregation_strategy=ResultAggregationStrategy.ALL_RESPONSES
        )
        
        # Check responses
        assert len(responses) == 3
        assert responses[0].model_id == "model-1"
        assert responses[1].model_id == "model-2"
        assert responses[2].model_id == "model-3"
        
        # Run with FIRST_RESPONSE strategy
        response = await orchestrator.run_distributed_parallel_inference(
            base_request,
            model_ids=["model-1", "model-2", "model-3"],
            aggregation_strategy=ResultAggregationStrategy.FIRST_RESPONSE
        )
        
        # Check response
        assert response.model_id == "model-1"
        
        # Test other aggregation strategies
        for strategy in [
            ResultAggregationStrategy.MAJORITY_VOTE,
            ResultAggregationStrategy.WEIGHTED_AVERAGE,
            ResultAggregationStrategy.ENSEMBLE
        ]:
            response = await orchestrator.run_distributed_parallel_inference(
                base_request,
                model_ids=["model-1", "model-2", "model-3"],
                aggregation_strategy=strategy
            )
            
            # Just check that we get a response without error
            assert response is not None
    
    finally:
        # Restore original method
        orchestrator.run_distributed_inference = original_run_distributed

@pytest.mark.asyncio
async def test_run_distributed_batch_inference(orchestrator):
    """Test running batch inference across distributed nodes."""
    # Mock the local and remote inference methods
    async def mock_run_local(task):
        return InferenceResponse(
            model_id=task.request.model_id,
            outputs=f"Local output for {task.request.model_id}",
            metadata={"local": True}
        )
    
    async def mock_run_remote(task):
        return InferenceResponse(
            model_id=task.request.model_id,
            outputs=f"Remote output for {task.request.model_id}",
            metadata={"remote": True}
        )
    
    orchestrator._run_local_inference = mock_run_local
    orchestrator._run_remote_inference = mock_run_remote
    
    # Mock the select_nodes_for_batch method
    async def mock_select_nodes(*args, **kwargs):
        return [orchestrator._node_id, "remote-node"]
    
    orchestrator._select_nodes_for_batch = mock_select_nodes
    
    # Add a remote node
    remote_node = NodeInfo(
        node_id="remote-node",
        hostname="remote-host",
        ip_address="192.168.1.100",
        status=NodeStatus.ONLINE
    )
    orchestrator.nodes["remote-node"] = remote_node
    orchestrator.node_locks["remote-node"] = asyncio.Lock()
    
    # Create test requests
    requests = [
        InferenceRequest(model_id="model-1", inputs="Input 1"),
        InferenceRequest(model_id="model-1", inputs="Input 2"),
        InferenceRequest(model_id="model-2", inputs="Input 3"),
        InferenceRequest(model_id="model-2", inputs="Input 4")
    ]
    
    # Run batch inference
    responses = await orchestrator.run_distributed_batch_inference(requests)
    
    # Check responses
    assert len(responses) == 4
    
    # Check that we got a mix of local and remote responses
    local_count = sum(1 for r in responses if r.metadata.get("local"))
    remote_count = sum(1 for r in responses if r.metadata.get("remote"))
    
    assert local_count > 0
    assert remote_count > 0
    assert local_count + remote_count == 4

@pytest.mark.asyncio
async def test_run_distributed_pipeline_inference(orchestrator):
    """Test running pipeline inference with dependencies."""
    # Mock the distributed inference method
    original_run_distributed = orchestrator.run_distributed_inference
    
    async def mock_run_distributed(request, strategy):
        # Check if this is a dependent stage
        if request.metadata and "dependency_results" in request.metadata:
            # Include dependency results in output
            deps = request.metadata["dependency_results"]
            return InferenceResponse(
                model_id=request.model_id,
                outputs=f"Output from {request.model_id} with deps: {deps}",
                metadata={"model_id": request.model_id, "has_deps": True}
            )
        else:
            return InferenceResponse(
                model_id=request.model_id,
                outputs=f"Output from {request.model_id}",
                metadata={"model_id": request.model_id}
            )
    
    orchestrator.run_distributed_inference = mock_run_distributed
    
    try:
        # Create test requests for a simple pipeline:
        # model-1 -> model-3
        # model-2 -> model-3
        # model-3 -> model-4
        requests = [
            InferenceRequest(model_id="model-1", inputs="Input 1"),
            InferenceRequest(model_id="model-2", inputs="Input 2"),
            InferenceRequest(model_id="model-3", inputs="Input 3"),
            InferenceRequest(model_id="model-4", inputs="Input 4")
        ]
        
        # Define dependencies (indices of requests that must complete before this one)
        dependencies = [
            [],      # model-1 has no dependencies
            [],      # model-2 has no dependencies
            [0, 1],  # model-3 depends on model-1 and model-2
            [2]      # model-4 depends on model-3
        ]
        
        # Run pipeline inference
        responses = await orchestrator.run_distributed_pipeline_inference(
            requests, dependencies
        )
        
        # Check responses
        assert len(responses) == 4
        
        # Check that dependencies were properly handled
        assert responses[0].model_id == "model-1"
        assert responses[1].model_id == "model-2"
        assert responses[2].model_id == "model-3"
        assert responses[3].model_id == "model-4"
        
        # Check that model-3 and model-4 have dependency results
        assert responses[2].metadata.get("has_deps") is True
        assert responses[3].metadata.get("has_deps") is True
        
        # Test with circular dependency
        circular_dependencies = [
            [3],  # model-1 depends on model-4
            [],   # model-2 has no dependencies
            [0],  # model-3 depends on model-1
            [2]   # model-4 depends on model-3
        ]
        
        # Should raise ValueError
        with pytest.raises(ValueError, match="Circular dependency"):
            await orchestrator.run_distributed_pipeline_inference(
                requests, circular_dependencies
            )
    
    finally:
        # Restore original method
        orchestrator.run_distributed_inference = original_run_distributed

@pytest.mark.asyncio
async def test_node_management(orchestrator):
    """Test node management methods."""
    # Test registering a new node
    new_node = NodeInfo(
        node_id="new-node",
        hostname="new-host",
        ip_address="192.168.1.200",
        status=NodeStatus.ONLINE
    )
    
    result = await orchestrator.register_node(new_node)
    assert result is True
    assert "new-node" in orchestrator.nodes
    assert "new-node" in orchestrator.node_locks
    
    # Test updating an existing node
    updated_node = NodeInfo(
        node_id="new-node",
        hostname="updated-host",
        ip_address="192.168.1.201",
        status=NodeStatus.ONLINE
    )
    
    result = await orchestrator.register_node(updated_node)
    assert result is True
    assert orchestrator.nodes["new-node"].hostname == "updated-host"
    
    # Test updating node status
    result = await orchestrator.update_node_status("new-node", NodeStatus.BUSY)
    assert result is True
    assert orchestrator.nodes["new-node"].status == NodeStatus.BUSY
    
    # Test updating non-existent node status
    result = await orchestrator.update_node_status("non-existent", NodeStatus.ONLINE)
    assert result is False
    
    # Test updating node resources
    resources = {"cpu_percent": 50, "memory_percent": 60}
    result = await orchestrator.update_node_resources("new-node", resources)
    assert result is True
    assert orchestrator.nodes["new-node"].resources["cpu_percent"] == 50
    assert orchestrator.nodes["new-node"].resources["memory_percent"] == 60
    
    # Test updating node models
    models = ["model-a", "model-b", "model-c"]
    result = await orchestrator.update_node_models("new-node", models)
    assert result is True
    assert orchestrator.nodes["new-node"].available_models == models
    
    # Test unregistering a node
    result = await orchestrator.unregister_node("new-node")
    assert result is True
    assert "new-node" not in orchestrator.nodes
    assert "new-node" not in orchestrator.node_locks
    
    # Test unregistering non-existent node
    result = await orchestrator.unregister_node("non-existent")
    assert result is False

@pytest.mark.asyncio
async def test_task_management(orchestrator):
    """Test task management methods."""
    # Create some test tasks
    tasks = [
        DistributedTask(
            task_id=f"task-{i}",
            request=InferenceRequest(model_id=f"model-{i}", inputs=f"Input {i}"),
            node_id=orchestrator._node_id,
            status=["pending", "running", "completed", "error"][i % 4]
        )
        for i in range(4)
    ]
    
    for task in tasks:
        orchestrator.tasks[task.task_id] = task
    
    # Test getting a task
    task = await orchestrator.get_task("task-0")
    assert task is not None
    assert task.task_id == "task-0"
    
    # Test getting non-existent task
    task = await orchestrator.get_task("non-existent")
    assert task is None
    
    # Test listing all tasks
    all_tasks = await orchestrator.list_tasks()
    assert len(all_tasks) == 4
    
    # Test listing tasks with status filter
    pending_tasks = await orchestrator.list_tasks(status_filter="pending")
    assert len(pending_tasks) == 1
    assert pending_tasks[0].task_id == "task-0"
    
    running_tasks = await orchestrator.list_tasks(status_filter="running")
    assert len(running_tasks) == 1
    assert running_tasks[0].task_id == "task-1"
    
    # Test cancelling a task
    result = await orchestrator.cancel_task("task-1")
    assert result is True
    assert orchestrator.tasks["task-1"].status == "cancelled"
    
    # Test cancelling completed task
    result = await orchestrator.cancel_task("task-2")
    assert result is False
    assert orchestrator.tasks["task-2"].status == "completed"
    
    # Test cancelling non-existent task
    result = await orchestrator.cancel_task("non-existent")
    assert result is False

@pytest.mark.asyncio
async def test_factory_function():
    """Test the factory function."""
    # Mock the model_manager module
    with patch("src.core.distributed.get_model_manager") as mock_get_manager:
        mock_get_manager.return_value = MockModelManager()
        
        # Get orchestrator from factory function
        orchestrator = get_distributed_model_orchestrator()
        
        # Check that we got a valid orchestrator
        assert isinstance(orchestrator, DistributedModelOrchestrator)
        assert orchestrator.model_manager is not None
