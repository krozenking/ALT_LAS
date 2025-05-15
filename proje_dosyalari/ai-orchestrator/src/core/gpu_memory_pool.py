"""
GPU Memory Pool Module for AI Orchestrator.

This module provides a memory pool for efficient GPU memory management,
reducing fragmentation and improving model loading/unloading performance.
"""

import asyncio
import logging
import time
from typing import Dict, List, Optional, Any, Tuple, Set
import torch
import numpy as np
from collections import defaultdict, deque

from ..config.settings import config

logger = logging.getLogger(__name__)

class GPUMemoryBlock:
    """
    Represents a block of GPU memory.
    """
    def __init__(self, size: int, device_id: int, tensor: Optional[torch.Tensor] = None):
        """
        Initialize a GPU memory block.
        
        Args:
            size: Size of the block in bytes
            device_id: GPU device ID
            tensor: Tensor holding the memory, or None if not allocated
        """
        self.size = size
        self.device_id = device_id
        self.tensor = tensor
        self.in_use = False
        self.last_used = time.time()
        self.owner: Optional[str] = None  # ID of the model using this block
    
    def allocate(self) -> bool:
        """
        Allocate memory for this block if not already allocated.
        
        Returns:
            True if allocation was successful, False otherwise
        """
        if self.tensor is not None:
            return True
        
        try:
            self.tensor = torch.empty(
                self.size, 
                dtype=torch.uint8, 
                device=f"cuda:{self.device_id}"
            )
            return True
        except Exception as e:
            logger.error(f"Error allocating GPU memory block: {str(e)}")
            return False
    
    def release(self) -> None:
        """Release the memory held by this block."""
        if self.tensor is not None:
            del self.tensor
            self.tensor = None
            self.in_use = False
            self.owner = None
    
    def mark_used(self, owner: str) -> None:
        """
        Mark this block as in use.
        
        Args:
            owner: ID of the model using this block
        """
        self.in_use = True
        self.last_used = time.time()
        self.owner = owner
    
    def mark_unused(self) -> None:
        """Mark this block as not in use."""
        self.in_use = False
        self.last_used = time.time()
        self.owner = None


class GPUMemoryPool:
    """
    Pool for managing GPU memory blocks.
    
    This class provides functionality to:
    1. Allocate and manage GPU memory blocks of different sizes
    2. Efficiently reuse memory blocks to reduce fragmentation
    3. Prioritize memory allocation for frequently used models
    """
    
    def __init__(self):
        """Initialize the GPU memory pool."""
        self.enabled = config["gpu"].get("enabled", True) and torch.cuda.is_available()
        self.memory_fraction = config["gpu"].get("memory_fraction", 0.9)
        
        # Memory blocks by size and device
        # device_id -> size -> list of blocks
        self.blocks: Dict[int, Dict[int, List[GPUMemoryBlock]]] = defaultdict(lambda: defaultdict(list))
        
        # Total allocated memory per device
        self.allocated_memory: Dict[int, int] = defaultdict(int)
        
        # Maximum memory per device
        self.max_memory: Dict[int, int] = {}
        
        # Locks for thread safety
        self.device_locks: Dict[int, asyncio.Lock] = {}
        
        # Model to blocks mapping
        self.model_blocks: Dict[str, List[GPUMemoryBlock]] = defaultdict(list)
        
        # Initialize locks and max memory for each available GPU
        if self.enabled:
            for i in range(torch.cuda.device_count()):
                self.device_locks[i] = asyncio.Lock()
                total_memory = torch.cuda.get_device_properties(i).total_memory
                self.max_memory[i] = int(total_memory * self.memory_fraction)
    
    async def initialize(self) -> bool:
        """
        Initialize the GPU memory pool.
        
        Returns:
            True if initialization was successful, False otherwise
        """
        if not self.enabled:
            logger.info("GPU memory pool disabled or GPU not available")
            return False
        
        try:
            logger.info("Initializing GPU memory pool...")
            
            # Pre-allocate some common block sizes
            common_sizes_mb = [128, 256, 512, 1024]
            
            for device_id in range(torch.cuda.device_count()):
                for size_mb in common_sizes_mb:
                    size_bytes = size_mb * 1024 * 1024
                    
                    # Check if we have enough memory
                    if self.allocated_memory[device_id] + size_bytes <= self.max_memory[device_id]:
                        # Allocate a block
                        await self.allocate_block(size_bytes, device_id)
            
            logger.info("GPU memory pool initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Error initializing GPU memory pool: {str(e)}")
            return False
    
    async def allocate_block(self, size: int, device_id: int) -> Optional[GPUMemoryBlock]:
        """
        Allocate a memory block of the specified size.
        
        Args:
            size: Size of the block in bytes
            device_id: GPU device ID
            
        Returns:
            Allocated memory block, or None if allocation failed
        """
        if not self.enabled:
            return None
        
        async with self.device_locks[device_id]:
            # Check if we have enough memory
            if self.allocated_memory[device_id] + size > self.max_memory[device_id]:
                # Try to free some memory
                freed = await self._free_memory(device_id, size)
                if not freed:
                    logger.warning(f"Not enough memory on GPU {device_id} to allocate {size / (1024**2):.2f} MB")
                    return None
            
            # Create a new block
            block = GPUMemoryBlock(size, device_id)
            
            # Allocate memory
            if not block.allocate():
                return None
            
            # Add to pool
            self.blocks[device_id][size].append(block)
            
            # Update allocated memory
            self.allocated_memory[device_id] += size
            
            logger.debug(f"Allocated {size / (1024**2):.2f} MB on GPU {device_id}")
            return block
    
    async def get_block(self, size: int, device_id: int, model_id: str) -> Optional[GPUMemoryBlock]:
        """
        Get a memory block of the specified size.
        
        Args:
            size: Size of the block in bytes
            device_id: GPU device ID
            model_id: ID of the model requesting the block
            
        Returns:
            Memory block, or None if no block is available
        """
        if not self.enabled:
            return None
        
        async with self.device_locks[device_id]:
            # Check if we have an available block of the exact size
            if size in self.blocks[device_id]:
                for block in self.blocks[device_id][size]:
                    if not block.in_use:
                        block.mark_used(model_id)
                        self.model_blocks[model_id].append(block)
                        logger.debug(f"Reusing {size / (1024**2):.2f} MB block on GPU {device_id} for {model_id}")
                        return block
            
            # Find the smallest block that is large enough
            suitable_sizes = [s for s in self.blocks[device_id].keys() if s >= size]
            if suitable_sizes:
                best_size = min(suitable_sizes)
                for block in self.blocks[device_id][best_size]:
                    if not block.in_use:
                        block.mark_used(model_id)
                        self.model_blocks[model_id].append(block)
                        logger.debug(f"Using {best_size / (1024**2):.2f} MB block on GPU {device_id} for {model_id} (requested {size / (1024**2):.2f} MB)")
                        return block
            
            # Allocate a new block
            block = await self.allocate_block(size, device_id)
            if block:
                block.mark_used(model_id)
                self.model_blocks[model_id].append(block)
            return block
    
    async def release_model_blocks(self, model_id: str) -> None:
        """
        Release all blocks used by a model.
        
        Args:
            model_id: ID of the model
        """
        if not self.enabled or model_id not in self.model_blocks:
            return
        
        blocks = self.model_blocks[model_id].copy()
        for block in blocks:
            device_id = block.device_id
            async with self.device_locks[device_id]:
                block.mark_unused()
                logger.debug(f"Released {block.size / (1024**2):.2f} MB block on GPU {device_id} from {model_id}")
        
        # Clear model blocks
        self.model_blocks[model_id] = []
    
    async def _free_memory(self, device_id: int, required_size: int) -> bool:
        """
        Free memory on a device to make room for a new allocation.
        
        Args:
            device_id: GPU device ID
            required_size: Size in bytes that needs to be freed
            
        Returns:
            True if enough memory was freed, False otherwise
        """
        # Get all unused blocks
        unused_blocks = []
        for size, blocks in self.blocks[device_id].items():
            for block in blocks:
                if not block.in_use:
                    unused_blocks.append(block)
        
        # Sort by last used time (oldest first)
        unused_blocks.sort(key=lambda b: b.last_used)
        
        # Free blocks until we have enough memory
        freed_memory = 0
        for block in unused_blocks:
            if freed_memory >= required_size:
                break
            
            # Remove from blocks list
            self.blocks[device_id][block.size].remove(block)
            
            # Release memory
            freed_memory += block.size
            self.allocated_memory[device_id] -= block.size
            block.release()
            
            logger.debug(f"Freed {block.size / (1024**2):.2f} MB on GPU {device_id}")
        
        return freed_memory >= required_size
    
    def get_memory_info(self) -> Dict[str, Any]:
        """
        Get information about the memory pool.
        
        Returns:
            Dictionary with memory pool information
        """
        if not self.enabled:
            return {"enabled": False}
        
        info = {
            "enabled": True,
            "devices": []
        }
        
        for device_id in range(torch.cuda.device_count()):
            device_info = {
                "id": device_id,
                "name": torch.cuda.get_device_name(device_id),
                "total_memory": self.max_memory[device_id],
                "allocated_memory": self.allocated_memory[device_id],
                "free_memory": self.max_memory[device_id] - self.allocated_memory[device_id],
                "blocks": {
                    "total": sum(len(blocks) for blocks in self.blocks[device_id].values()),
                    "in_use": sum(sum(1 for block in blocks if block.in_use) for blocks in self.blocks[device_id].values()),
                    "by_size": {
                        f"{size / (1024**2):.0f}MB": {
                            "total": len(blocks),
                            "in_use": sum(1 for block in blocks if block.in_use)
                        }
                        for size, blocks in self.blocks[device_id].items()
                    }
                }
            }
            
            info["devices"].append(device_info)
        
        return info


# Singleton instance
_gpu_memory_pool: Optional[GPUMemoryPool] = None


def get_gpu_memory_pool() -> GPUMemoryPool:
    """
    Get or create the GPU memory pool instance.
    
    Returns:
        GPUMemoryPool instance
    """
    global _gpu_memory_pool
    
    if _gpu_memory_pool is None:
        _gpu_memory_pool = GPUMemoryPool()
    
    return _gpu_memory_pool
