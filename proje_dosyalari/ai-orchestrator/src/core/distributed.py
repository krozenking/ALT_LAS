"""
Distributed model execution module for AI Orchestrator.

This module provides functionality for running models across multiple machines,
including node discovery, workload distribution, and result aggregation.
"""
import logging
import asyncio
import json
import time
import uuid
from typing import Dict, List, Any, Optional, Union, Tuple, Set, Callable
from enum import Enum
from dataclasses import dataclass, field

from ..models.inference import InferenceRequest, InferenceResponse
from ..models.model import ModelInfo, ModelType
from ..services.model_manager import ModelManager, get_model_manager
from ..core.config import settings

logger = logging.getLogger(__name__)

class NodeStatus(str, Enum):
    """Node status enumeration."""
    ONLINE = "online"
    OFFLINE = "offline"
    BUSY = "busy"
    ERROR = "error"

class DistributionStrategy(str, Enum):
    """Workload distribution strategy enumeration."""
    ROUND_ROBIN = "round_robin"
    LEAST_LOADED = "least_loaded"
    MODEL_SPECIFIC = "model_specific"
    CAPABILITY_BASED = "capability_based"
    LATENCY_OPTIMIZED = "latency_optimized"

class ResultAggregationStrategy(str, Enum):
    """Result aggregation strategy enumeration."""
    FIRST_RESPONSE = "first_response"
    ALL_RESPONSES = "all_responses"
    MAJORITY_VOTE = "majority_vote"
    WEIGHTED_AVERAGE = "weighted_average"
    ENSEMBLE = "ensemble"
    CUSTOM = "custom"

@dataclass
class NodeInfo:
    """Information about a compute node."""
    node_id: str
    hostname: str
    ip_address: str
    status: NodeStatus = NodeStatus.OFFLINE
    available_models: List[str] = field(default_factory=list)
    capabilities: Dict[str, Any] = field(default_factory=dict)
    resources: Dict[str, Any] = field(default_factory=dict)
    last_heartbeat: Optional[float] = None
    current_tasks: int = 0
    total_tasks_processed: int = 0
    average_response_time: Optional[float] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class DistributedTask:
    """Distributed task information."""
    task_id: str
    request: InferenceRequest
    node_id: Optional[str] = None
    status: str = "pending"
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    result: Optional[InferenceResponse] = None
    error: Optional[str] = None

class DistributedModelOrchestrator:
    """
    Orchestrator for distributed model execution across multiple nodes.
    """
    def __init__(self, model_manager: ModelManager):
        """Initialize the distributed model orchestrator."""
        self.model_manager = model_manager
        self.nodes: Dict[str, NodeInfo] = {}
        self.tasks: Dict[str, DistributedTask] = {}
        self.node_locks: Dict[str, asyncio.Lock] = {}
        self.discovery_interval = settings.DISCOVERY_INTERVAL or 60  # seconds
        self.heartbeat_timeout = settings.HEARTBEAT_TIMEOUT or 120  # seconds
        self._discovery_task = None
        self._node_id = str(uuid.uuid4())
        
        # Initialize this node
        self._init_local_node()
        
    def _init_local_node(self):
        """Initialize the local node information."""
        import socket
        import platform
        import psutil
        
        hostname = socket.gethostname()
        ip_address = socket.gethostbyname(hostname)
        
        # Get system capabilities
        capabilities = {
            "os": platform.system(),
            "os_version": platform.version(),
            "cpu_count": psutil.cpu_count(logical=True),
            "physical_cpu_count": psutil.cpu_count(logical=False),
            "total_memory": psutil.virtual_memory().total,
        }
        
        # Check for GPU
        try:
            import torch
            capabilities["cuda_available"] = torch.cuda.is_available()
            if capabilities["cuda_available"]:
                capabilities["cuda_devices"] = torch.cuda.device_count()
                capabilities["cuda_version"] = torch.version.cuda
        except ImportError:
            capabilities["cuda_available"] = False
        
        # Create node info
        self.local_node = NodeInfo(
            node_id=self._node_id,
            hostname=hostname,
            ip_address=ip_address,
            status=NodeStatus.ONLINE,
            capabilities=capabilities,
            resources={
                "cpu_percent": 0,
                "memory_percent": 0,
                "gpu_percent": 0 if capabilities.get("cuda_available", False) else None
            },
            last_heartbeat=time.time(),
            metadata={
                "start_time": time.time(),
                "platform": platform.platform()
            }
        )
        
        # Add to nodes dict
        self.nodes[self._node_id] = self.local_node
        self.node_locks[self._node_id] = asyncio.Lock()
        
        logger.info(f"Initialized local node: {self._node_id} ({hostname})")
    
    async def start(self):
        """Start the distributed orchestrator."""
        logger.info("Starting distributed model orchestrator")
        
        # Start node discovery
        self._discovery_task = asyncio.create_task(self._node_discovery_loop())
        
        # Start resource monitoring
        asyncio.create_task(self._resource_monitoring_loop())
        
        logger.info("Distributed model orchestrator started")
    
    async def stop(self):
        """Stop the distributed orchestrator."""
        logger.info("Stopping distributed model orchestrator")
        
        if self._discovery_task:
            self._discovery_task.cancel()
            try:
                await self._discovery_task
            except asyncio.CancelledError:
                pass
        
        logger.info("Distributed model orchestrator stopped")
    
    async def _node_discovery_loop(self):
        """Background task for node discovery."""
        logger.info("Starting node discovery loop")
        
        while True:
            try:
                await self._discover_nodes()
                await self._check_node_health()
                await asyncio.sleep(self.discovery_interval)
            except asyncio.CancelledError:
                logger.info("Node discovery loop cancelled")
                break
            except Exception as e:
                logger.error(f"Error in node discovery loop: {str(e)}")
                await asyncio.sleep(10)  # Shorter interval on error
    
    async def _discover_nodes(self):
        """Discover other nodes in the network."""
        logger.debug("Discovering nodes")
        
        # In a real implementation, this would use a service discovery mechanism
        # like mDNS, Consul, etcd, or a custom registry service
        
        # For now, we'll simulate discovery with a placeholder
        # In a real system, you'd implement one of:
        # 1. Multicast DNS (mDNS) for local network discovery
        # 2. A central registry service that nodes register with
        # 3. A distributed key-value store like etcd or Consul
        # 4. A custom discovery protocol
        
        # Simulate finding a new node occasionally
        if len(self.nodes) < 5 and time.time() % 60 < 1:
            node_id = f"node-{uuid.uuid4()}"
            new_node = NodeInfo(
                node_id=node_id,
                hostname=f"simulated-host-{len(self.nodes)}",
                ip_address=f"192.168.1.{100 + len(self.nodes)}",
                status=NodeStatus.ONLINE,
                available_models=["llama-7b", "whisper-small"],
                capabilities={
                    "os": "Linux",
                    "cpu_count": 8,
                    "total_memory": 16 * 1024 * 1024 * 1024,
                    "cuda_available": True,
                    "cuda_devices": 1
                },
                resources={
                    "cpu_percent": 20,
                    "memory_percent": 30,
                    "gpu_percent": 10
                },
                last_heartbeat=time.time()
            )
            
            self.nodes[node_id] = new_node
            self.node_locks[node_id] = asyncio.Lock()
            logger.info(f"Discovered new node: {node_id}")
    
    async def _check_node_health(self):
        """Check the health of all known nodes."""
        current_time = time.time()
        
        for node_id, node in list(self.nodes.items()):
            if node_id == self._node_id:
                # Skip local node
                continue
                
            # Check if node has timed out
            if node.last_heartbeat and current_time - node.last_heartbeat > self.heartbeat_timeout:
                logger.warning(f"Node {node_id} has timed out")
                node.status = NodeStatus.OFFLINE
                
                # In a real system, you'd try to reconnect or remove the node
                # For now, we'll just mark it as offline
            
            # In a real system, you'd send a heartbeat to each node
            # and update its status based on the response
    
    async def _resource_monitoring_loop(self):
        """Background task for monitoring local resources."""
        logger.info("Starting resource monitoring loop")
        
        import psutil
        
        while True:
            try:
                # Update CPU and memory usage
                self.local_node.resources["cpu_percent"] = psutil.cpu_percent()
                self.local_node.resources["memory_percent"] = psutil.virtual_memory().percent
                
                # Update GPU usage if available
                if self.local_node.capabilities.get("cuda_available", False):
                    try:
                        import torch
                        if torch.cuda.is_available():
                            # This is a placeholder - in a real system you'd use
                            # nvidia-smi or a similar tool to get actual GPU usage
                            self.local_node.resources["gpu_percent"] = 50
                    except ImportError:
                        pass
                
                # Update last heartbeat
                self.local_node.last_heartbeat = time.time()
                
                await asyncio.sleep(5)  # Update every 5 seconds
            except asyncio.CancelledError:
                logger.info("Resource monitoring loop cancelled")
                break
            except Exception as e:
                logger.error(f"Error in resource monitoring loop: {str(e)}")
                await asyncio.sleep(10)  # Shorter interval on error
    
    async def list_nodes(self, include_offline: bool = False) -> List[NodeInfo]:
        """
        List all known nodes.
        
        Args:
            include_offline: Whether to include offline nodes
            
        Returns:
            List of node info objects
        """
        if include_offline:
            return list(self.nodes.values())
        else:
            return [node for node in self.nodes.values() if node.status != NodeStatus.OFFLINE]
    
    async def get_node(self, node_id: str) -> Optional[NodeInfo]:
        """
        Get information about a specific node.
        
        Args:
            node_id: ID of the node
            
        Returns:
            Node info object or None if not found
        """
        return self.nodes.get(node_id)
    
    async def select_node_for_model(
        self, 
        model_id: str,
        strategy: DistributionStrategy = DistributionStrategy.LEAST_LOADED
    ) -> Optional[str]:
        """
        Select a node for running a specific model.
        
        Args:
            model_id: ID of the model
            strategy: Node selection strategy
            
        Returns:
            Selected node ID or None if no suitable node found
        """
        # Get online nodes
        online_nodes = [
            node for node in self.nodes.values() 
            if node.status == NodeStatus.ONLINE
        ]
        
        if not online_nodes:
            logger.warning("No online nodes available")
            return None
        
        # Filter nodes that have the model available
        suitable_nodes = [
            node for node in online_nodes
            if model_id in node.available_models
        ]
        
        # If no nodes have the model, use any online node
        # (assuming the model can be loaded on demand)
        if not suitable_nodes:
            suitable_nodes = online_nodes
        
        # Apply selection strategy
        if strategy == DistributionStrategy.ROUND_ROBIN:
            # Simple round-robin selection
            return suitable_nodes[0].node_id
            
        elif strategy == DistributionStrategy.LEAST_LOADED:
            # Select node with fewest current tasks
            return min(
                suitable_nodes,
                key=lambda node: node.current_tasks
            ).node_id
            
        elif strategy == DistributionStrategy.CAPABILITY_BASED:
            # Select node with best capabilities for the model
            # This is a simplified implementation
            model_info = await self.model_manager.get_model(model_id)
            
            if model_info and model_info.supports_gpu:
                # Prefer nodes with GPU for GPU-capable models
                gpu_nodes = [
                    node for node in suitable_nodes
                    if node.capabilities.get("cuda_available", False)
                ]
                
                if gpu_nodes:
                    # Select GPU node with most free GPU memory
                    return min(
                        gpu_nodes,
                        key=lambda node: node.resources.get("gpu_percent", 100)
                    ).node_id
            
            # Fall back to CPU selection
            return min(
                suitable_nodes,
                key=lambda node: node.resources.get("cpu_percent", 100)
            ).node_id
            
        elif strategy == DistributionStrategy.LATENCY_OPTIMIZED:
            # Select node with lowest average response time
            nodes_with_timing = [
                node for node in suitable_nodes
                if node.average_response_time is not None
            ]
            
            if nodes_with_timing:
                return min(
                    nodes_with_timing,
                    key=lambda node: node.average_response_time
                ).node_id
            else:
                # Fall back to least loaded if no timing data
                return min(
                    suitable_nodes,
                    key=lambda node: node.current_tasks
                ).node_id
                
        else:
            # Default to least loaded
            return min(
                suitable_nodes,
                key=lambda node: node.current_tasks
            ).node_id
    
    async def run_distributed_inference(
        self,
        request: InferenceRequest,
        strategy: DistributionStrategy = DistributionStrategy.LEAST_LOADED
    ) -> InferenceResponse:
        """
        Run inference on a distributed node.
        
        Args:
            request: Inference request
            strategy: Node selection strategy
            
        Returns:
            Inference response
            
        Raises:
            ValueError: If no suitable node is found
            RuntimeError: If inference fails
        """
        model_id = request.model_id
        
        # Select node for this model
        node_id = await self.select_node_for_model(model_id, strategy)
        
        if not node_id:
            raise ValueError(f"No suitable node found for model {model_id}")
        
        # Create task
        task_id = str(uuid.uuid4())
        task = DistributedTask(
            task_id=task_id,
            request=request,
            node_id=node_id,
            status="pending"
        )
        
        self.tasks[task_id] = task
        
        try:
            # Update node task count
            async with self.node_locks[node_id]:
                self.nodes[node_id].current_tasks += 1
            
            # If local node, run locally
            if node_id == self._node_id:
                return await self._run_local_inference(task)
            else:
                return await self._run_remote_inference(task)
                
        finally:
            # Update node task count
            if node_id in self.node_locks:
                async with self.node_locks[node_id]:
                    if node_id in self.nodes:
                        self.nodes[node_id].current_tasks = max(0, self.nodes[node_id].current_tasks - 1)
                        self.nodes[node_id].total_tasks_processed += 1
    
    async def _run_local_inference(self, task: DistributedTask) -> InferenceResponse:
        """
        Run inference locally.
        
        Args:
            task: Distributed task
            
        Returns:
            Inference response
        """
        from ..core.orchestration import ModelOrchestrator
        
        logger.info(f"Running task {task.task_id} locally")
        
        # Update task status
        task.status = "running"
        task.start_time = time.time()
        
        try:
            # Get local orchestrator
            orchestrator = ModelOrchestrator(self.model_manager)
            
            # Run inference
            response = await orchestrator.run_inference(task.request)
            
            # Update task
            task.status = "completed"
            task.end_time = time.time()
            task.result = response
            
            # Update node stats
            if task.start_time and task.end_time:
                response_time = task.end_time - task.start_time
                
                if self.local_node.average_response_time is None:
                    self.local_node.average_response_time = response_time
                else:
                    # Exponential moving average
                    alpha = 0.2  # Smoothing factor
                    self.local_node.average_response_time = (
                        alpha * response_time + 
                        (1 - alpha) * self.local_node.average_response_time
                    )
            
            return response
            
        except Exception as e:
            logger.error(f"Error running local inference for task {task.task_id}: {str(e)}")
            
            # Update task
            task.status = "error"
            task.end_time = time.time()
            task.error = str(e)
            
            raise RuntimeError(f"Local inference failed: {str(e)}")
    
    async def _run_remote_inference(self, task: DistributedTask) -> InferenceResponse:
        """
        Run inference on a remote node.
        
        Args:
            task: Distributed task
            
        Returns:
            Inference response
        """
        logger.info(f"Running task {task.task_id} on remote node {task.node_id}")
        
        # Update task status
        task.status = "running"
        task.start_time = time.time()
        
        try:
            # In a real implementation, this would make an API call to the remote node
            # For now, we'll simulate a remote call
            
            # Simulate network delay
            await asyncio.sleep(0.1)
            
            # Simulate remote processing
            await asyncio.sleep(0.5)
            
            # Create mock response
            response = InferenceResponse(
                model_id=task.request.model_id,
                outputs=f"Mock output from remote node {task.node_id}",
                metadata={
                    "node_id": task.node_id,
                    "processing_time_ms": 500
                }
            )
            
            # Update task
            task.status = "completed"
            task.end_time = time.time()
            task.result = response
            
            # Update node stats
            if task.node_id in self.nodes and task.start_time and task.end_time:
                node = self.nodes[task.node_id]
                response_time = task.end_time - task.start_time
                
                if node.average_response_time is None:
                    node.average_response_time = response_time
                else:
                    # Exponential moving average
                    alpha = 0.2  # Smoothing factor
                    node.average_response_time = (
                        alpha * response_time + 
                        (1 - alpha) * node.average_response_time
                    )
            
            return response
            
        except Exception as e:
            logger.error(f"Error running remote inference for task {task.task_id}: {str(e)}")
            
            # Update task
            task.status = "error"
            task.end_time = time.time()
            task.error = str(e)
            
            raise RuntimeError(f"Remote inference failed: {str(e)}")
    
    async def run_distributed_parallel_inference(
        self,
        request: InferenceRequest,
        model_ids: List[str],
        strategy: DistributionStrategy = DistributionStrategy.CAPABILITY_BASED,
        aggregation_strategy: ResultAggregationStrategy = ResultAggregationStrategy.ALL_RESPONSES
    ) -> Union[InferenceResponse, List[InferenceResponse]]:
        """
        Run inference in parallel across multiple nodes.
        
        Args:
            request: Base inference request
            model_ids: List of model IDs to use
            strategy: Node selection strategy
            aggregation_strategy: How to aggregate results
            
        Returns:
            Single or list of inference responses based on aggregation strategy
        """
        # Create a request for each model
        requests = [
            InferenceRequest(
                model_id=model_id,
                inputs=request.inputs,
                parameters=request.parameters,
                metadata=request.metadata
            )
            for model_id in model_ids
        ]
        
        # Run all requests in parallel
        tasks = []
        for req in requests:
            task = asyncio.create_task(
                self.run_distributed_inference(req, strategy)
            )
            tasks.append(task)
        
        # Wait for all tasks to complete
        if aggregation_strategy == ResultAggregationStrategy.FIRST_RESPONSE:
            # Return as soon as first response is available
            done, pending = await asyncio.wait(
                tasks, 
                return_when=asyncio.FIRST_COMPLETED
            )
            
            # Cancel remaining tasks
            for task in pending:
                task.cancel()
            
            # Return first result
            return next(iter(done)).result()
            
        else:
            # Wait for all responses
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Filter out exceptions
            valid_results = [
                r for r in results 
                if not isinstance(r, Exception)
            ]
            
            if not valid_results:
                raise RuntimeError("All parallel inference requests failed")
            
            # Apply aggregation strategy
            if aggregation_strategy == ResultAggregationStrategy.ALL_RESPONSES:
                return valid_results
                
            elif aggregation_strategy == ResultAggregationStrategy.MAJORITY_VOTE:
                return self._aggregate_by_majority_vote(valid_results)
                
            elif aggregation_strategy == ResultAggregationStrategy.WEIGHTED_AVERAGE:
                return self._aggregate_by_weighted_average(valid_results)
                
            elif aggregation_strategy == ResultAggregationStrategy.ENSEMBLE:
                return self._aggregate_by_ensemble(valid_results)
                
            else:
                # Default to returning all responses
                return valid_results
    
    def _aggregate_by_majority_vote(self, responses: List[InferenceResponse]) -> InferenceResponse:
        """
        Aggregate responses by majority vote.
        
        Args:
            responses: List of inference responses
            
        Returns:
            Aggregated response
        """
        # This is a simplified implementation that works for classification tasks
        # In a real system, you'd need to handle different output formats
        
        # Count outputs
        output_counts = {}
        for response in responses:
            output = str(response.outputs)
            output_counts[output] = output_counts.get(output, 0) + 1
        
        # Find majority
        majority_output, count = max(
            output_counts.items(),
            key=lambda x: x[1]
        )
        
        # Create aggregated response
        return InferenceResponse(
            model_id=responses[0].model_id,
            outputs=majority_output,
            metadata={
                "aggregation_strategy": "majority_vote",
                "vote_count": count,
                "total_votes": len(responses),
                "confidence": count / len(responses)
            }
        )
    
    def _aggregate_by_weighted_average(self, responses: List[InferenceResponse]) -> InferenceResponse:
        """
        Aggregate responses by weighted average.
        
        Args:
            responses: List of inference responses
            
        Returns:
            Aggregated response
        """
        # This is a simplified implementation that works for numerical outputs
        # In a real system, you'd need to handle different output formats
        
        try:
            # Try to convert outputs to numbers
            outputs = []
            weights = []
            
            for response in responses:
                # Extract output
                try:
                    output = float(response.outputs)
                    outputs.append(output)
                    
                    # Extract weight from metadata if available
                    weight = response.metadata.get("confidence", 1.0)
                    weights.append(weight)
                except (ValueError, TypeError):
                    # Skip non-numeric outputs
                    continue
            
            if not outputs:
                raise ValueError("No numeric outputs found")
            
            # Normalize weights
            total_weight = sum(weights)
            if total_weight == 0:
                # Equal weights if all weights are zero
                weights = [1.0] * len(outputs)
                total_weight = len(outputs)
            
            # Calculate weighted average
            weighted_sum = sum(output * weight for output, weight in zip(outputs, weights))
            weighted_average = weighted_sum / total_weight
            
            # Create aggregated response
            return InferenceResponse(
                model_id=responses[0].model_id,
                outputs=str(weighted_average),
                metadata={
                    "aggregation_strategy": "weighted_average",
                    "num_models": len(outputs),
                    "weights": weights
                }
            )
            
        except Exception as e:
            logger.error(f"Error in weighted average aggregation: {str(e)}")
            
            # Fall back to first response
            return responses[0]
    
    def _aggregate_by_ensemble(self, responses: List[InferenceResponse]) -> InferenceResponse:
        """
        Aggregate responses by ensemble methods.
        
        Args:
            responses: List of inference responses
            
        Returns:
            Aggregated response
        """
        # This is a placeholder for a more sophisticated ensemble method
        # In a real system, you'd implement model-specific ensemble techniques
        
        # For now, we'll just concatenate the outputs
        ensemble_output = "\n".join([
            f"Model {response.model_id}: {response.outputs}"
            for response in responses
        ])
        
        # Create aggregated response
        return InferenceResponse(
            model_id="ensemble",
            outputs=ensemble_output,
            metadata={
                "aggregation_strategy": "ensemble",
                "num_models": len(responses),
                "model_ids": [response.model_id for response in responses]
            }
        )
    
    async def run_distributed_batch_inference(
        self,
        requests: List[InferenceRequest],
        strategy: DistributionStrategy = DistributionStrategy.LEAST_LOADED
    ) -> List[InferenceResponse]:
        """
        Run batch inference across distributed nodes.
        
        Args:
            requests: List of inference requests
            strategy: Node selection strategy
            
        Returns:
            List of inference responses
        """
        # Group requests by model ID
        model_requests = {}
        for request in requests:
            model_id = request.model_id
            if model_id not in model_requests:
                model_requests[model_id] = []
            model_requests[model_id].append(request)
        
        # For each model, select optimal nodes
        model_nodes = {}
        for model_id, reqs in model_requests.items():
            # Select nodes for this model
            nodes = await self._select_nodes_for_batch(model_id, len(reqs), strategy)
            model_nodes[model_id] = nodes
        
        # Distribute requests to nodes
        tasks = []
        for model_id, reqs in model_requests.items():
            nodes = model_nodes[model_id]
            
            # Distribute requests evenly across nodes
            for i, request in enumerate(reqs):
                # Select node using round-robin
                node_idx = i % len(nodes)
                node_id = nodes[node_idx]
                
                # Create task for this request
                task_id = str(uuid.uuid4())
                task = DistributedTask(
                    task_id=task_id,
                    request=request,
                    node_id=node_id,
                    status="pending"
                )
                
                self.tasks[task_id] = task
                
                # Create async task
                if node_id == self._node_id:
                    # Run locally
                    async_task = asyncio.create_task(self._run_local_inference(task))
                else:
                    # Run remotely
                    async_task = asyncio.create_task(self._run_remote_inference(task))
                
                tasks.append(async_task)
        
        # Wait for all tasks to complete
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        responses = []
        for result in results:
            if isinstance(result, Exception):
                # Create error response
                responses.append(InferenceResponse(
                    model_id="error",
                    outputs="Error during inference",
                    metadata={"error": str(result)}
                ))
            else:
                responses.append(result)
        
        return responses
    
    async def _select_nodes_for_batch(
        self,
        model_id: str,
        num_requests: int,
        strategy: DistributionStrategy
    ) -> List[str]:
        """
        Select nodes for a batch of requests.
        
        Args:
            model_id: ID of the model
            num_requests: Number of requests in the batch
            strategy: Node selection strategy
            
        Returns:
            List of node IDs
        """
        # Get online nodes
        online_nodes = [
            node for node in self.nodes.values() 
            if node.status == NodeStatus.ONLINE
        ]
        
        if not online_nodes:
            logger.warning("No online nodes available")
            return [self._node_id]  # Fall back to local node
        
        # Filter nodes that have the model available
        suitable_nodes = [
            node for node in online_nodes
            if model_id in node.available_models
        ]
        
        # If no nodes have the model, use any online node
        if not suitable_nodes:
            suitable_nodes = online_nodes
        
        # Apply selection strategy
        if strategy == DistributionStrategy.CAPABILITY_BASED:
            # Sort nodes by capability
            model_info = await self.model_manager.get_model(model_id)
            
            if model_info and model_info.supports_gpu:
                # Prefer nodes with GPU for GPU-capable models
                gpu_nodes = [
                    node for node in suitable_nodes
                    if node.capabilities.get("cuda_available", False)
                ]
                
                if gpu_nodes:
                    # Sort GPU nodes by GPU usage (ascending)
                    sorted_nodes = sorted(
                        gpu_nodes,
                        key=lambda node: node.resources.get("gpu_percent", 100)
                    )
                    
                    # If we need more nodes than available GPU nodes,
                    # add CPU nodes at the end
                    if num_requests > len(sorted_nodes):
                        cpu_nodes = [
                            node for node in suitable_nodes
                            if not node.capabilities.get("cuda_available", False)
                        ]
                        
                        # Sort CPU nodes by CPU usage (ascending)
                        sorted_cpu_nodes = sorted(
                            cpu_nodes,
                            key=lambda node: node.resources.get("cpu_percent", 100)
                        )
                        
                        sorted_nodes.extend(sorted_cpu_nodes)
                    
                    return [node.node_id for node in sorted_nodes]
            
            # Fall back to CPU selection
            sorted_nodes = sorted(
                suitable_nodes,
                key=lambda node: node.resources.get("cpu_percent", 100)
            )
            
            return [node.node_id for node in sorted_nodes]
            
        elif strategy == DistributionStrategy.LATENCY_OPTIMIZED:
            # Sort nodes by response time
            nodes_with_timing = [
                node for node in suitable_nodes
                if node.average_response_time is not None
            ]
            
            if nodes_with_timing:
                sorted_nodes = sorted(
                    nodes_with_timing,
                    key=lambda node: node.average_response_time
                )
                
                # If we need more nodes than those with timing data,
                # add the rest at the end
                if num_requests > len(sorted_nodes):
                    nodes_without_timing = [
                        node for node in suitable_nodes
                        if node.average_response_time is None
                    ]
                    
                    # Sort by task count (ascending)
                    sorted_untimed_nodes = sorted(
                        nodes_without_timing,
                        key=lambda node: node.current_tasks
                    )
                    
                    sorted_nodes.extend(sorted_untimed_nodes)
                
                return [node.node_id for node in sorted_nodes]
            
            # Fall back to least loaded if no timing data
            sorted_nodes = sorted(
                suitable_nodes,
                key=lambda node: node.current_tasks
            )
            
            return [node.node_id for node in sorted_nodes]
            
        else:
            # Default to least loaded
            sorted_nodes = sorted(
                suitable_nodes,
                key=lambda node: node.current_tasks
            )
            
            return [node.node_id for node in sorted_nodes]
    
    async def run_distributed_pipeline_inference(
        self,
        requests: List[InferenceRequest],
        dependencies: List[List[int]],
        strategy: DistributionStrategy = DistributionStrategy.CAPABILITY_BASED
    ) -> List[InferenceResponse]:
        """
        Run pipeline inference with dependencies across distributed nodes.
        
        Args:
            requests: List of inference requests in execution order
            dependencies: List of dependency indices for each request
            strategy: Node selection strategy
            
        Returns:
            List of inference responses
        """
        if len(requests) != len(dependencies):
            raise ValueError("Length of requests and dependencies must match")
        
        # Results storage
        results: List[Optional[InferenceResponse]] = [None] * len(requests)
        
        # Track completed stages
        completed_stages = set()
        
        # Process stages in topological order
        while len(completed_stages) < len(requests):
            # Find stages that can be executed (all dependencies satisfied)
            ready_stages = []
            for i, deps in enumerate(dependencies):
                if i not in completed_stages and all(d in completed_stages for d in deps):
                    ready_stages.append(i)
            
            if not ready_stages:
                # No stages ready but not all completed - circular dependency
                raise ValueError("Circular dependency detected in pipeline")
            
            # Execute ready stages in parallel
            stage_tasks = []
            for stage_idx in ready_stages:
                # Get request for this stage
                request = requests[stage_idx]
                
                # Update inputs with results from dependencies if needed
                if dependencies[stage_idx]:
                    # Create a copy of the request to modify
                    request = InferenceRequest(
                        model_id=request.model_id,
                        inputs=request.inputs,
                        parameters=request.parameters,
                        metadata=dict(request.metadata) if request.metadata else {}
                    )
                    
                    # Add dependency results to metadata
                    request.metadata["dependency_results"] = {
                        f"stage_{dep}": results[dep].outputs
                        for dep in dependencies[stage_idx]
                    }
                
                # Create task for this stage
                task = asyncio.create_task(
                    self.run_distributed_inference(request, strategy)
                )
                stage_tasks.append((stage_idx, task))
            
            # Wait for all ready stages to complete
            for stage_idx, task in stage_tasks:
                try:
                    result = await task
                    results[stage_idx] = result
                    completed_stages.add(stage_idx)
                except Exception as e:
                    logger.error(f"Error in pipeline stage {stage_idx}: {str(e)}")
                    # Create error response
                    results[stage_idx] = InferenceResponse(
                        model_id=requests[stage_idx].model_id,
                        outputs=f"Error: {str(e)}",
                        metadata={"error": str(e), "stage": stage_idx}
                    )
                    completed_stages.add(stage_idx)
        
        return results
    
    async def register_node(self, node_info: NodeInfo) -> bool:
        """
        Register a new node with the orchestrator.
        
        Args:
            node_info: Information about the node
            
        Returns:
            True if registration was successful
        """
        node_id = node_info.node_id
        
        if node_id in self.nodes:
            # Update existing node
            logger.info(f"Updating existing node: {node_id}")
            self.nodes[node_id] = node_info
        else:
            # Add new node
            logger.info(f"Registering new node: {node_id}")
            self.nodes[node_id] = node_info
            self.node_locks[node_id] = asyncio.Lock()
        
        return True
    
    async def unregister_node(self, node_id: str) -> bool:
        """
        Unregister a node from the orchestrator.
        
        Args:
            node_id: ID of the node
            
        Returns:
            True if unregistration was successful
        """
        if node_id in self.nodes:
            logger.info(f"Unregistering node: {node_id}")
            del self.nodes[node_id]
            
            if node_id in self.node_locks:
                del self.node_locks[node_id]
            
            return True
        else:
            logger.warning(f"Attempted to unregister unknown node: {node_id}")
            return False
    
    async def update_node_status(self, node_id: str, status: NodeStatus) -> bool:
        """
        Update the status of a node.
        
        Args:
            node_id: ID of the node
            status: New status
            
        Returns:
            True if update was successful
        """
        if node_id in self.nodes:
            logger.info(f"Updating status of node {node_id} to {status}")
            self.nodes[node_id].status = status
            self.nodes[node_id].last_heartbeat = time.time()
            return True
        else:
            logger.warning(f"Attempted to update status of unknown node: {node_id}")
            return False
    
    async def update_node_resources(self, node_id: str, resources: Dict[str, Any]) -> bool:
        """
        Update the resource usage of a node.
        
        Args:
            node_id: ID of the node
            resources: Resource usage information
            
        Returns:
            True if update was successful
        """
        if node_id in self.nodes:
            logger.debug(f"Updating resources of node {node_id}")
            self.nodes[node_id].resources.update(resources)
            self.nodes[node_id].last_heartbeat = time.time()
            return True
        else:
            logger.warning(f"Attempted to update resources of unknown node: {node_id}")
            return False
    
    async def update_node_models(self, node_id: str, models: List[str]) -> bool:
        """
        Update the available models on a node.
        
        Args:
            node_id: ID of the node
            models: List of available model IDs
            
        Returns:
            True if update was successful
        """
        if node_id in self.nodes:
            logger.info(f"Updating models of node {node_id}: {models}")
            self.nodes[node_id].available_models = models
            self.nodes[node_id].last_heartbeat = time.time()
            return True
        else:
            logger.warning(f"Attempted to update models of unknown node: {node_id}")
            return False
    
    async def get_task(self, task_id: str) -> Optional[DistributedTask]:
        """
        Get information about a specific task.
        
        Args:
            task_id: ID of the task
            
        Returns:
            Task info object or None if not found
        """
        return self.tasks.get(task_id)
    
    async def list_tasks(self, status_filter: Optional[str] = None) -> List[DistributedTask]:
        """
        List all tasks.
        
        Args:
            status_filter: Optional filter by task status
            
        Returns:
            List of task info objects
        """
        if status_filter:
            return [task for task in self.tasks.values() if task.status == status_filter]
        else:
            return list(self.tasks.values())
    
    async def cancel_task(self, task_id: str) -> bool:
        """
        Cancel a running task.
        
        Args:
            task_id: ID of the task
            
        Returns:
            True if cancellation was successful
        """
        if task_id not in self.tasks:
            logger.warning(f"Attempted to cancel unknown task: {task_id}")
            return False
        
        task = self.tasks[task_id]
        
        if task.status in ["completed", "error"]:
            logger.warning(f"Attempted to cancel already finished task: {task_id}")
            return False
        
        logger.info(f"Cancelling task: {task_id}")
        
        # Update task status
        task.status = "cancelled"
        task.end_time = time.time()
        
        # In a real implementation, you'd need to send a cancellation
        # signal to the node running the task
        
        return True


# Factory function
def get_distributed_model_orchestrator() -> DistributedModelOrchestrator:
    """
    Get or create a distributed model orchestrator instance.
    
    Returns:
        DistributedModelOrchestrator instance
    """
    from ..services.model_manager import get_model_manager
    
    # Get model manager
    model_manager = get_model_manager()
    
    # Create orchestrator
    orchestrator = DistributedModelOrchestrator(model_manager)
    
    return orchestrator
