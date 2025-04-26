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
from typing import Dict, List, Any, Optional, Union, Tuple, Set
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
        strategy: DistributionStrategy = DistributionStrategy.CAPABILITY_BASED
    ) -> List[InferenceResponse]:
        """
        Run inference in parallel across multiple nodes.
        
        Args:
            request: Base inference request
            model_ids: List of model IDs to use
            strategy: Node selection strategy
            
        Returns:
            List of inference responses
        """
        # Create a request for each model
        requests = [
            InferenceRequest(
                model_id=model_id,
                inputs=request.inputs,
                parameters=request.parameters
            )
            for model_id in model_ids
        ]
        
        # Run inference in parallel
        tasks = [
            self.run_distributed_inference(req, strategy)
            for req in requests
        ]
        
        # Gather results
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle exceptions
        results = []
        for i, response in enumerate(responses):
            if isinstance(response, Exception):
                logger.error(f"Error in parallel inference for model {model_ids[i]}: {str(response)}")
                # Create error response
                results.append(InferenceResponse(
                    model_id=model_ids[i],
                    outputs="Error during inference",
                    metadata={"error": str(response)}
                ))
            else:
                results.append(response)
        
        return results
    
    async def get_task(self, task_id: str) -> Optional[DistributedTask]:
        """
        Get information about a specific task.
        
        Args:
            task_id: ID of the task
            
        Returns:
            Task info object or None if not found
        """
        return self.tasks.get(task_id)
    
    async def list_tasks(
        self, 
        status_filter: Optional[str] = None,
        node_id: Optional[str] = None
    ) -> List[DistributedTask]:
        """
        List tasks.
        
        Args:
            status_filter: Optional filter by task status
            node_id: Optional filter by node ID
            
        Returns:
            List of task objects
        """
        result = []
        for task in self.tasks.values():
            # Apply status filter
            if status_filter and task.status != status_filter:
                continue
                
            # Apply node filter
            if node_id and task.node_id != node_id:
                continue
                
            result.append(task)
            
        return result


# Singleton instance
_distributed_orchestrator = None

def get_distributed_orchestrator() -> DistributedModelOrchestrator:
    """
    Factory function to get or create a distributed orchestrator instance.
    
    Returns:
        DistributedModelOrchestrator instance
    """
    global _distributed_orchestrator
    if _distributed_orchestrator is None:
        model_manager = get_model_manager()
        _distributed_orchestrator = DistributedModelOrchestrator(model_manager)
        
        # Start the orchestrator in the background
        asyncio.create_task(_distributed_orchestrator.start())
        
    return _distributed_orchestrator
