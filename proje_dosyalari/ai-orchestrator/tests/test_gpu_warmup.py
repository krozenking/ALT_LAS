"""
Unit tests for GPU warmup and memory management.
"""
import os
import sys
import unittest
import asyncio
from unittest.mock import patch, MagicMock, AsyncMock
import tempfile
import shutil
import json
import time

import pytest
import torch

# Add src directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.core.gpu_warmup import GPUWarmupManager
from src.core.gpu_memory_pool import GPUMemoryPool
from src.core.model_loader import ModelLoader
from src.config.settings import config


# Skip tests if GPU is not available
gpu_available = torch.cuda.is_available()
skip_if_no_gpu = pytest.mark.skipif(not gpu_available, reason="GPU not available")


class TestGPUWarmup(unittest.TestCase):
    """Test GPU warmup functionality."""
    
    def setUp(self):
        """Set up test environment."""
        # Create a temporary directory for test files
        self.test_dir = tempfile.mkdtemp()
        
        # Mock config
        self.config_patcher = patch('src.core.gpu_warmup.config', {
            "gpu": {
                "enabled": True,
                "memory_fraction": 0.5,
                "precision": "float16",
                "warmup": {
                    "enabled": True,
                    "on_startup": True,
                    "operations": ["matmul", "conv2d", "memory"],
                    "size": "small"
                },
                "memory_pool": {
                    "enabled": True,
                    "preallocate_common_sizes": True,
                    "common_sizes_mb": [128, 256]
                }
            },
            "models": {
                "cache_dir": self.test_dir,
                "preload_models": ["test-model"]
            }
        })
        self.mock_config = self.config_patcher.start()
        
        # Create GPU warmup manager
        self.warmup_manager = GPUWarmupManager()
        
        # Mock torch.cuda.is_available if GPU is not available
        if not gpu_available:
            self.cuda_patcher = patch('torch.cuda.is_available', return_value=True)
            self.mock_cuda = self.cuda_patcher.start()
            
            # Mock other CUDA functions
            self.cuda_device_count_patcher = patch('torch.cuda.device_count', return_value=1)
            self.mock_device_count = self.cuda_device_count_patcher.start()
            
            self.cuda_get_device_name_patcher = patch('torch.cuda.get_device_name', return_value="Test GPU")
            self.mock_get_device_name = self.cuda_get_device_name_patcher.start()
            
            self.cuda_empty_cache_patcher = patch('torch.cuda.empty_cache')
            self.mock_empty_cache = self.cuda_empty_cache_patcher.start()
            
            # Mock tensor operations
            self.tensor_patcher = patch('torch.empty', return_value=MagicMock())
            self.mock_tensor = self.tensor_patcher.start()
            
            self.randn_patcher = patch('torch.randn', return_value=MagicMock())
            self.mock_randn = self.randn_patcher.start()
            
            self.matmul_patcher = patch('torch.matmul', return_value=MagicMock())
            self.mock_matmul = self.matmul_patcher.start()
            
            self.nn_conv2d_patcher = patch('torch.nn.Conv2d', return_value=MagicMock())
            self.mock_conv2d = self.nn_conv2d_patcher.start()
    
    def tearDown(self):
        """Clean up after tests."""
        # Remove temporary directory
        shutil.rmtree(self.test_dir)
        
        # Stop patchers
        self.config_patcher.stop()
        
        if not gpu_available:
            self.cuda_patcher.stop()
            self.cuda_device_count_patcher.stop()
            self.cuda_get_device_name_patcher.stop()
            self.cuda_empty_cache_patcher.stop()
            self.tensor_patcher.stop()
            self.randn_patcher.stop()
            self.matmul_patcher.stop()
            self.nn_conv2d_patcher.stop()
    
    @skip_if_no_gpu
    @pytest.mark.asyncio
    async def test_initialize(self):
        """Test initialization of GPU warmup manager."""
        # Initialize
        result = await self.warmup_manager.initialize()
        
        # Check result
        self.assertTrue(result)
        self.assertTrue(self.warmup_manager.is_warmed_up)
    
    @skip_if_no_gpu
    @pytest.mark.asyncio
    async def test_warmup_gpu(self):
        """Test GPU warmup."""
        # Warm up GPU
        result = await self.warmup_manager.warmup_gpu()
        
        # Check result
        self.assertTrue(result)
        self.assertTrue(self.warmup_manager.is_warmed_up)
    
    @skip_if_no_gpu
    @pytest.mark.asyncio
    async def test_preallocate_memory(self):
        """Test memory preallocation."""
        # Preallocate memory
        result = await self.warmup_manager.preallocate_memory()
        
        # Check result
        self.assertTrue(result)
        self.assertTrue(len(self.warmup_manager.preallocated_memory) > 0)
    
    @skip_if_no_gpu
    @pytest.mark.asyncio
    async def test_release_memory(self):
        """Test memory release."""
        # Preallocate memory
        await self.warmup_manager.preallocate_memory()
        
        # Release memory
        await self.warmup_manager.release_memory()
        
        # Check result
        self.assertEqual(len(self.warmup_manager.preallocated_memory), 0)
    
    @skip_if_no_gpu
    @pytest.mark.asyncio
    async def test_update_model_usage(self):
        """Test updating model usage statistics."""
        # Update model usage
        await self.warmup_manager.update_model_usage("test-model", 1024 * 1024 * 100)  # 100 MB
        
        # Check result
        self.assertIn("test-model", self.warmup_manager.model_usage_stats)
        self.assertEqual(self.warmup_manager.model_usage_stats["test-model"]["memory_usage"], 1024 * 1024 * 100)
    
    @skip_if_no_gpu
    def test_get_memory_info(self):
        """Test getting memory information."""
        # Get memory info
        info = self.warmup_manager.get_memory_info()
        
        # Check result
        self.assertTrue(info["enabled"])
        self.assertTrue(len(info["gpus"]) > 0)


class TestGPUMemoryPool(unittest.TestCase):
    """Test GPU memory pool functionality."""
    
    def setUp(self):
        """Set up test environment."""
        # Create a temporary directory for test files
        self.test_dir = tempfile.mkdtemp()
        
        # Mock config
        self.config_patcher = patch('src.core.gpu_memory_pool.config', {
            "gpu": {
                "enabled": True,
                "memory_fraction": 0.5,
                "precision": "float16",
                "warmup": {
                    "enabled": True,
                    "on_startup": True,
                    "operations": ["matmul", "conv2d", "memory"],
                    "size": "small"
                },
                "memory_pool": {
                    "enabled": True,
                    "preallocate_common_sizes": True,
                    "common_sizes_mb": [128, 256]
                }
            },
            "models": {
                "cache_dir": self.test_dir,
                "preload_models": ["test-model"]
            }
        })
        self.mock_config = self.config_patcher.start()
        
        # Create GPU memory pool
        self.memory_pool = GPUMemoryPool()
        
        # Mock torch.cuda.is_available if GPU is not available
        if not gpu_available:
            self.cuda_patcher = patch('torch.cuda.is_available', return_value=True)
            self.mock_cuda = self.cuda_patcher.start()
            
            # Mock other CUDA functions
            self.cuda_device_count_patcher = patch('torch.cuda.device_count', return_value=1)
            self.mock_device_count = self.cuda_device_count_patcher.start()
            
            self.cuda_get_device_properties_patcher = patch('torch.cuda.get_device_properties')
            self.mock_get_device_properties = self.cuda_get_device_properties_patcher.start()
            self.mock_get_device_properties.return_value.total_memory = 1024 * 1024 * 1024  # 1 GB
            
            # Mock tensor operations
            self.tensor_patcher = patch('torch.empty', return_value=MagicMock())
            self.mock_tensor = self.tensor_patcher.start()
    
    def tearDown(self):
        """Clean up after tests."""
        # Remove temporary directory
        shutil.rmtree(self.test_dir)
        
        # Stop patchers
        self.config_patcher.stop()
        
        if not gpu_available:
            self.cuda_patcher.stop()
            self.cuda_device_count_patcher.stop()
            self.cuda_get_device_properties_patcher.stop()
            self.tensor_patcher.stop()
    
    @skip_if_no_gpu
    @pytest.mark.asyncio
    async def test_initialize(self):
        """Test initialization of GPU memory pool."""
        # Initialize
        result = await self.memory_pool.initialize()
        
        # Check result
        self.assertTrue(result)
    
    @skip_if_no_gpu
    @pytest.mark.asyncio
    async def test_allocate_block(self):
        """Test allocating a memory block."""
        # Allocate block
        block = await self.memory_pool.allocate_block(1024 * 1024 * 100, 0)  # 100 MB
        
        # Check result
        self.assertIsNotNone(block)
        self.assertEqual(block.size, 1024 * 1024 * 100)
        self.assertEqual(block.device_id, 0)
    
    @skip_if_no_gpu
    @pytest.mark.asyncio
    async def test_get_block(self):
        """Test getting a memory block."""
        # Get block
        block = await self.memory_pool.get_block(1024 * 1024 * 100, 0, "test-model")  # 100 MB
        
        # Check result
        self.assertIsNotNone(block)
        self.assertEqual(block.size, 1024 * 1024 * 100)
        self.assertEqual(block.device_id, 0)
        self.assertEqual(block.owner, "test-model")
        self.assertTrue(block.in_use)
    
    @skip_if_no_gpu
    @pytest.mark.asyncio
    async def test_release_model_blocks(self):
        """Test releasing model blocks."""
        # Get block
        block = await self.memory_pool.get_block(1024 * 1024 * 100, 0, "test-model")  # 100 MB
        
        # Release blocks
        await self.memory_pool.release_model_blocks("test-model")
        
        # Check result
        self.assertFalse(block.in_use)
        self.assertIsNone(block.owner)
    
    @skip_if_no_gpu
    def test_get_memory_info(self):
        """Test getting memory information."""
        # Get memory info
        info = self.memory_pool.get_memory_info()
        
        # Check result
        self.assertTrue(info["enabled"])
        self.assertTrue(len(info["devices"]) > 0)


if __name__ == '__main__':
    unittest.main()
