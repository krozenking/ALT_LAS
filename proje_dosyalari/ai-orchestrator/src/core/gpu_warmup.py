"""
GPU Warmup and Preloading Module for AI Orchestrator.

This module provides functionality for GPU memory preallocation, warmup,
and efficient model preloading to reduce model loading times and optimize
GPU memory usage.
"""

import asyncio
import logging
import time
import os
from typing import Dict, List, Optional, Any, Tuple, Set
import json
import numpy as np
import torch
from pathlib import Path

from ..config.settings import config

logger = logging.getLogger(__name__)

class GPUWarmupManager:
    """
    Manager for GPU warmup, memory preallocation, and model preloading.
    
    This class provides functionality to:
    1. Preallocate GPU memory to avoid fragmentation
    2. Warm up GPU by running simple operations
    3. Preload frequently used models
    4. Manage GPU memory efficiently
    """
    
    def __init__(self):
        """Initialize the GPU warmup manager."""
        self.enabled = config["gpu"].get("enabled", True) and torch.cuda.is_available()
        self.memory_fraction = config["gpu"].get("memory_fraction", 0.9)
        self.precision = config["gpu"].get("precision", "float16")
        self.preload_models = config["models"].get("preload_models", [])
        self.max_loaded_models = config["models"].get("max_loaded_models", 5)
        
        # GPU memory management
        self.preallocated_memory: Dict[int, torch.Tensor] = {}
        self.reserved_memory: Dict[int, int] = {}  # GPU ID -> reserved memory in bytes
        self.model_memory_usage: Dict[str, int] = {}  # model_id -> memory usage in bytes
        
        # Locks for thread safety
        self.gpu_locks: Dict[int, asyncio.Lock] = {}
        
        # Model usage statistics for smart preloading
        self.model_usage_stats: Dict[str, Dict[str, Any]] = {}
        
        # Warmup status
        self.is_warmed_up = False
        self.warmup_lock = asyncio.Lock()
        
        # Initialize locks for each available GPU
        if self.enabled:
            for i in range(torch.cuda.device_count()):
                self.gpu_locks[i] = asyncio.Lock()
    
    async def initialize(self) -> bool:
        """
        Initialize the GPU warmup manager.
        
        Returns:
            True if initialization was successful, False otherwise
        """
        if not self.enabled:
            logger.info("GPU warmup disabled or GPU not available")
            return False
        
        try:
            # Load model usage statistics if available
            await self._load_model_usage_stats()
            
            # Warm up GPU
            await self.warmup_gpu()
            
            # Preallocate memory
            await self.preallocate_memory()
            
            logger.info("GPU warmup manager initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Error initializing GPU warmup manager: {str(e)}")
            return False
    
    async def warmup_gpu(self) -> bool:
        """
        Warm up the GPU by running simple operations.
        
        Returns:
            True if warmup was successful, False otherwise
        """
        if not self.enabled:
            return False
        
        async with self.warmup_lock:
            if self.is_warmed_up:
                logger.debug("GPU already warmed up")
                return True
            
            try:
                logger.info("Warming up GPU...")
                start_time = time.time()
                
                # Get number of available GPUs
                num_gpus = torch.cuda.device_count()
                
                # Warm up each GPU
                for gpu_id in range(num_gpus):
                    async with self.gpu_locks[gpu_id]:
                        # Set current device
                        torch.cuda.set_device(gpu_id)
                        
                        # Run a series of operations to warm up the GPU
                        # 1. Matrix multiplication
                        size = 2000
                        a = torch.randn(size, size, device=f"cuda:{gpu_id}")
                        b = torch.randn(size, size, device=f"cuda:{gpu_id}")
                        c = torch.matmul(a, b)
                        del c
                        
                        # 2. Convolution
                        batch_size = 16
                        in_channels = 3
                        out_channels = 64
                        kernel_size = 3
                        size = 224
                        input_tensor = torch.randn(batch_size, in_channels, size, size, device=f"cuda:{gpu_id}")
                        conv = torch.nn.Conv2d(in_channels, out_channels, kernel_size, padding=1).to(f"cuda:{gpu_id}")
                        output = conv(input_tensor)
                        del output, conv, input_tensor
                        
                        # 3. Memory allocation and deallocation
                        for _ in range(5):
                            x = torch.randn(1000, 1000, device=f"cuda:{gpu_id}")
                            y = x + x
                            del x, y
                            torch.cuda.empty_cache()
                
                # Clear cache after warmup
                torch.cuda.empty_cache()
                
                elapsed_time = time.time() - start_time
                logger.info(f"GPU warmup completed in {elapsed_time:.2f} seconds")
                
                self.is_warmed_up = True
                return True
                
            except Exception as e:
                logger.error(f"Error warming up GPU: {str(e)}")
                return False
    
    async def preallocate_memory(self) -> bool:
        """
        Preallocate GPU memory to avoid fragmentation.
        
        Returns:
            True if preallocation was successful, False otherwise
        """
        if not self.enabled:
            return False
        
        try:
            logger.info("Preallocating GPU memory...")
            
            # Get number of available GPUs
            num_gpus = torch.cuda.device_count()
            
            # Preallocate memory for each GPU
            for gpu_id in range(num_gpus):
                async with self.gpu_locks[gpu_id]:
                    # Set current device
                    torch.cuda.set_device(gpu_id)
                    
                    # Get total memory
                    total_memory = torch.cuda.get_device_properties(gpu_id).total_memory
                    
                    # Calculate memory to preallocate
                    memory_to_allocate = int(total_memory * self.memory_fraction)
                    
                    # Preallocate memory
                    try:
                        # Release any previously allocated memory
                        if gpu_id in self.preallocated_memory:
                            del self.preallocated_memory[gpu_id]
                            torch.cuda.empty_cache()
                        
                        # Allocate memory
                        self.preallocated_memory[gpu_id] = torch.empty(
                            memory_to_allocate, 
                            dtype=torch.uint8, 
                            device=f"cuda:{gpu_id}"
                        )
                        
                        # Record reserved memory
                        self.reserved_memory[gpu_id] = memory_to_allocate
                        
                        logger.info(f"Preallocated {memory_to_allocate / (1024**2):.2f} MB on GPU {gpu_id}")
                    except Exception as e:
                        logger.warning(f"Could not preallocate full memory on GPU {gpu_id}: {str(e)}")
                        # Try with a smaller fraction
                        reduced_fraction = self.memory_fraction * 0.8
                        memory_to_allocate = int(total_memory * reduced_fraction)
                        
                        try:
                            self.preallocated_memory[gpu_id] = torch.empty(
                                memory_to_allocate, 
                                dtype=torch.uint8, 
                                device=f"cuda:{gpu_id}"
                            )
                            
                            # Record reserved memory
                            self.reserved_memory[gpu_id] = memory_to_allocate
                            
                            logger.info(f"Preallocated {memory_to_allocate / (1024**2):.2f} MB on GPU {gpu_id} (reduced)")
                        except Exception as e2:
                            logger.error(f"Failed to preallocate memory on GPU {gpu_id}: {str(e2)}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error preallocating GPU memory: {str(e)}")
            return False
    
    async def release_memory(self, gpu_id: Optional[int] = None) -> None:
        """
        Release preallocated memory.
        
        Args:
            gpu_id: ID of the GPU to release memory from, or None for all GPUs
        """
        if not self.enabled:
            return
        
        try:
            if gpu_id is not None:
                # Release memory for specific GPU
                if gpu_id in self.preallocated_memory:
                    async with self.gpu_locks[gpu_id]:
                        del self.preallocated_memory[gpu_id]
                        self.preallocated_memory[gpu_id] = None
                        self.reserved_memory[gpu_id] = 0
                        torch.cuda.empty_cache()
                        logger.info(f"Released preallocated memory on GPU {gpu_id}")
            else:
                # Release memory for all GPUs
                for gpu_id in list(self.preallocated_memory.keys()):
                    async with self.gpu_locks[gpu_id]:
                        del self.preallocated_memory[gpu_id]
                        self.preallocated_memory[gpu_id] = None
                        self.reserved_memory[gpu_id] = 0
                        torch.cuda.empty_cache()
                        logger.info(f"Released preallocated memory on GPU {gpu_id}")
        except Exception as e:
            logger.error(f"Error releasing GPU memory: {str(e)}")
    
    async def _load_model_usage_stats(self) -> None:
        """Load model usage statistics from file."""
        stats_file = Path(config["models"].get("cache_dir", "./models_cache")) / "model_usage_stats.json"
        
        if not stats_file.exists():
            logger.info("No model usage statistics file found")
            return
        
        try:
            with open(stats_file, "r") as f:
                self.model_usage_stats = json.load(f)
                logger.info(f"Loaded usage statistics for {len(self.model_usage_stats)} models")
        except Exception as e:
            logger.error(f"Error loading model usage statistics: {str(e)}")
    
    async def _save_model_usage_stats(self) -> None:
        """Save model usage statistics to file."""
        stats_file = Path(config["models"].get("cache_dir", "./models_cache")) / "model_usage_stats.json"
        
        try:
            # Create directory if it doesn't exist
            stats_file.parent.mkdir(exist_ok=True)
            
            with open(stats_file, "w") as f:
                json.dump(self.model_usage_stats, f)
                logger.debug(f"Saved usage statistics for {len(self.model_usage_stats)} models")
        except Exception as e:
            logger.error(f"Error saving model usage statistics: {str(e)}")
    
    async def update_model_usage(self, model_id: str, memory_usage: int) -> None:
        """
        Update usage statistics for a model.
        
        Args:
            model_id: ID of the model
            memory_usage: Memory usage in bytes
        """
        if model_id not in self.model_usage_stats:
            self.model_usage_stats[model_id] = {
                "count": 0,
                "last_used": time.time(),
                "memory_usage": memory_usage
            }
        
        self.model_usage_stats[model_id]["count"] += 1
        self.model_usage_stats[model_id]["last_used"] = time.time()
        self.model_usage_stats[model_id]["memory_usage"] = memory_usage
        
        # Update model memory usage
        self.model_memory_usage[model_id] = memory_usage
        
        # Save statistics periodically (every 10 updates)
        if sum(stats["count"] for stats in self.model_usage_stats.values()) % 10 == 0:
            await self._save_model_usage_stats()
    
    def get_memory_info(self) -> Dict[str, Any]:
        """
        Get information about GPU memory usage.
        
        Returns:
            Dictionary with memory information
        """
        if not self.enabled:
            return {"enabled": False}
        
        info = {
            "enabled": True,
            "gpus": []
        }
        
        for gpu_id in range(torch.cuda.device_count()):
            total = torch.cuda.get_device_properties(gpu_id).total_memory
            reserved = torch.cuda.memory_reserved(gpu_id)
            allocated = torch.cuda.memory_allocated(gpu_id)
            free = total - allocated
            
            info["gpus"].append({
                "id": gpu_id,
                "name": torch.cuda.get_device_name(gpu_id),
                "total_memory": total,
                "reserved_memory": reserved,
                "allocated_memory": allocated,
                "free_memory": free,
                "utilization": allocated / total if total > 0 else 0
            })
        
        return info


# Singleton instance
_gpu_warmup_manager: Optional[GPUWarmupManager] = None


def get_gpu_warmup_manager() -> GPUWarmupManager:
    """
    Get or create the GPU warmup manager instance.
    
    Returns:
        GPUWarmupManager instance
    """
    global _gpu_warmup_manager
    
    if _gpu_warmup_manager is None:
        _gpu_warmup_manager = GPUWarmupManager()
    
    return _gpu_warmup_manager
