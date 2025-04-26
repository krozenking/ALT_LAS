"""
Tests for distributed model execution functionality.

This module contains tests for the distributed model execution module,
including node discovery, workload distribution, and result aggregation.
"""
import asyncio
import unittest
import pytest
from unittest.mock import patch, MagicMock

from ..core.distributed import (
    DistributedModelOrchestrator, 
    NodeInfo, 
    NodeStatus,
    DistributionStrategy,
    DistributedTask
)
from ..models.inference import InferenceRequest, InferenceResponse
from ..models.model import ModelInfo, ModelType, ModelStatus


class TestDistributedModelOrchestrator(unittest.TestCase):
    """Test cases for DistributedModelOrchestrator."""
    
    def setUp(self):
        """Set up test environment."""
        # Create mock model manager
        self.model_manager = MagicMock()
        
        # Create test models
        self.test_models = [
            ModelInfo(
                model_id="test-model-1",
                name="Test Model 1",
                type=ModelType.LLM,
                description="Test model 1",
                version="1.0",
                size=1024 * 1024 * 1024,  # 1 GB
                parameters=7 * 1000 * 1000 * 1000,  # 7B
                supports_gpu=True,
                supports_cpu=True
            ),
            ModelInfo(
                model_id="test-model-2",
                name="Test Model 2",
                type=ModelType.LLM,
                description="Test model 2",
                version="1.0",
                size=2 * 1024 * 1024 * 1024,  # 2 GB
                parameters=13 * 1000 * 1000 * 1000,  # 13B
                supports_gpu=True,
                supports_cpu=True
            )
        ]
        
        # Set up model manager mock
        self.model_manager.list_models.return_value = asyncio.Future()
        self.model_manager.list_models.return_value.set_result(self.test_models)
        
        self.model_manager.get_model.return_value = asyncio.Future()
        self.model_manager.get_model.return_value.set_result(self.test_models[0])
        
        # Create orchestrator with mocked initialization
        with patch('uuid.uuid4', return_value="test-node-id"), \
             patch('socket.gethostname', return_value="test-host"), \
             patch('socket.gethostbyname', return_value="127.0.0.1"), \
             patch('platform.system', return_value="Linux"), \
             patch('platform.version', return_value="1.0"), \
             patch('psutil.cpu_count', return_value=8), \
             patch('psutil.virtual_memory', return_value=MagicMock(total=16 * 1024 * 1024 * 1024)):
            self.orchestrator = DistributedModelOrchestrator(self.model_manager)
    
    @pytest.mark.asyncio
    async def test_list_nodes(self):
        """Test listing nodes."""
        # Add a test node
        test_node = NodeInfo(
            node_id="test-node-2",
            hostname="test-host-2",
            ip_address="192.168.1.2",
            status=NodeStatus.ONLINE
        )
        self.orchestrator.nodes["test-node-2"] = test_node
        
        # Test listing all nodes
        nodes = await self.orchestrator.list_nodes(include_offline=True)
        self.assertEqual(len(nodes), 2)  # Local node + test node
        
        # Test listing only online nodes
        test_node.status = NodeStatus.OFFLINE
        nodes = await self.orchestrator.list_nodes(include_offline=False)
        self.assertEqual(len(nodes), 1)  # Only local node
    
    @pytest.mark.asyncio
    async def test_select_node_for_model(self):
        """Test selecting a node for a model."""
        # Add test nodes
        node1 = NodeInfo(
            node_id="test-node-1",
            hostname="test-host-1",
            ip_address="192.168.1.1",
            status=NodeStatus.ONLINE,
            available_models=["test-model-1"],
            current_tasks=2
        )
        
        node2 = NodeInfo(
            node_id="test-node-2",
            hostname="test-host-2",
            ip_address="192.168.1.2",
            status=NodeStatus.ONLINE,
            available_models=["test-model-1", "test-model-2"],
            current_tasks=1
        )
        
        self.orchestrator.nodes["test-node-1"] = node1
        self.orchestrator.nodes["test-node-2"] = node2
        
        # Test least loaded strategy
        node_id = await self.orchestrator.select_node_for_model(
            "test-model-1",
            DistributionStrategy.LEAST_LOADED
        )
        self.assertEqual(node_id, "test-node-2")  # Node 2 has fewer tasks
        
        # Test model specific strategy
        node_id = await self.orchestrator.select_node_for_model(
            "test-model-2",
            DistributionStrategy.MODEL_SPECIFIC
        )
        self.assertEqual(node_id, "test-node-2")  # Only node 2 has this model
    
    @pytest.mark.asyncio
    async def test_run_distributed_inference(self):
        """Test running distributed inference."""
        # Mock the _run_local_inference method
        self.orchestrator._run_local_inference = MagicMock()
        mock_response = InferenceResponse(
            model_id="test-model-1",
            outputs="Test output",
            metadata={"processing_time_ms": 100}
        )
        mock_future = asyncio.Future()
        mock_future.set_result(mock_response)
        self.orchestrator._run_local_inference.return_value = mock_future
        
        # Create test request
        request = InferenceRequest(
            model_id="test-model-1",
            inputs="Test input"
        )
        
        # Run inference
        response = await self.orchestrator.run_distributed_inference(request)
        
        # Check response
        self.assertEqual(response.model_id, "test-model-1")
        self.assertEqual(response.outputs, "Test output")
        
        # Check that _run_local_inference was called
        self.orchestrator._run_local_inference.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_run_distributed_parallel_inference(self):
        """Test running distributed parallel inference."""
        # Mock the run_distributed_inference method
        self.orchestrator.run_distributed_inference = MagicMock()
        
        # Create mock responses
        responses = [
            InferenceResponse(
                model_id="test-model-1",
                outputs="Test output 1",
                metadata={"processing_time_ms": 100}
            ),
            InferenceResponse(
                model_id="test-model-2",
                outputs="Test output 2",
                metadata={"processing_time_ms": 200}
            )
        ]
        
        # Set up mock return values
        mock_futures = [asyncio.Future(), asyncio.Future()]
        mock_futures[0].set_result(responses[0])
        mock_futures[1].set_result(responses[1])
        
        self.orchestrator.run_distributed_inference.side_effect = mock_futures
        
        # Create test request
        request = InferenceRequest(
            model_id="test-model-1",
            inputs="Test input"
        )
        
        # Run parallel inference
        results = await self.orchestrator.run_distributed_parallel_inference(
            request,
            ["test-model-1", "test-model-2"]
        )
        
        # Check results
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0].model_id, "test-model-1")
        self.assertEqual(results[1].model_id, "test-model-2")
        
        # Check that run_distributed_inference was called twice
        self.assertEqual(self.orchestrator.run_distributed_inference.call_count, 2)


if __name__ == '__main__':
    unittest.main()
