"""
Unit tests for model loader with GPU optimizations.
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

from src.core.model_loader import ModelLoader
from src.core.gpu_warmup import GPUWarmupManager
from src.core.gpu_memory_pool import GPUMemoryPool
from src.config.settings import config


# Skip tests if GPU is not available
gpu_available = torch.cuda.is_available()
skip_if_no_gpu = pytest.mark.skipif(not gpu_available, reason="GPU not available")


class TestModelLoaderGPU(unittest.TestCase):
    """Test model loader with GPU optimizations."""
    
    def setUp(self):
        """Set up test environment."""
        # Create a temporary directory for test files
        self.test_dir = tempfile.mkdtemp()
        self.models_dir = os.path.join(self.test_dir, "models")
        os.makedirs(self.models_dir, exist_ok=True)
        
        # Create a test model file
        self.test_model_path = os.path.join(self.models_dir, "test-model.bin")
        with open(self.test_model_path, "wb") as f:
            f.write(b"x" * 1024 * 1024)  # 1 MB dummy model
        
        # Mock settings
        self.settings_patcher = patch('src.core.model_loader.settings')
        self.mock_settings = self.settings_patcher.start()
        self.mock_settings.MODEL_DIR = self.models_dir
        self.mock_settings.USE_GPU = True
        self.mock_settings.GPU_MEMORY_LIMIT = None
        
        # Mock config
        self.config_patcher = patch('src.core.model_loader.config', {
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
        
        # Mock GPU warmup manager
        self.gpu_warmup_patcher = patch('src.core.model_loader.get_gpu_warmup_manager')
        self.mock_gpu_warmup = self.gpu_warmup_patcher.start()
        self.mock_gpu_warmup_manager = AsyncMock()
        self.mock_gpu_warmup_manager.is_warmed_up = True
        self.mock_gpu_warmup_manager.warmup_gpu = AsyncMock(return_value=True)
        self.mock_gpu_warmup_manager.update_model_usage = AsyncMock()
        self.mock_gpu_warmup.return_value = self.mock_gpu_warmup_manager
        
        # Mock GPU memory pool
        self.gpu_memory_pool_patcher = patch('src.core.model_loader.get_gpu_memory_pool')
        self.mock_gpu_memory_pool = self.gpu_memory_pool_patcher.start()
        self.mock_memory_pool = AsyncMock()
        self.mock_memory_pool.get_block = AsyncMock(return_value=MagicMock())
        self.mock_memory_pool.release_model_blocks = AsyncMock()
        self.mock_gpu_memory_pool.return_value = self.mock_memory_pool
        
        # Mock integrations
        self.llm_integration_patcher = patch('src.core.model_loader.get_llm_integration')
        self.mock_llm_integration = self.llm_integration_patcher.start()
        self.mock_llm = AsyncMock()
        self.mock_llm.load_llama_model = AsyncMock(return_value=({"model_id": "test-model"}, {"memory_usage_mb": 100}))
        self.mock_llm.load_onnx_model = AsyncMock(return_value=({"model_id": "test-model"}, {"memory_usage_mb": 100}))
        self.mock_llm.unload_llm_model = AsyncMock(return_value={"status": "unloaded"})
        self.mock_llm_integration.return_value = self.mock_llm
        
        self.vision_integration_patcher = patch('src.core.model_loader.get_vision_integration')
        self.mock_vision_integration = self.vision_integration_patcher.start()
        self.mock_vision = AsyncMock()
        self.mock_vision_integration.return_value = self.mock_vision
        
        self.audio_integration_patcher = patch('src.core.model_loader.get_audio_integration')
        self.mock_audio_integration = self.audio_integration_patcher.start()
        self.mock_audio = AsyncMock()
        self.mock_audio_integration.return_value = self.mock_audio
        
        # Mock torch.cuda.is_available if GPU is not available
        if not gpu_available:
            self.cuda_patcher = patch('torch.cuda.is_available', return_value=True)
            self.mock_cuda = self.cuda_patcher.start()
            
            # Mock other CUDA functions
            self.cuda_device_count_patcher = patch('torch.cuda.device_count', return_value=1)
            self.mock_device_count = self.cuda_device_count_patcher.start()
            
            self.cuda_get_device_name_patcher = patch('torch.cuda.get_device_name', return_value="Test GPU")
            self.mock_get_device_name = self.cuda_get_device_name_patcher.start()
        
        # Create model loader
        self.model_loader = ModelLoader()
    
    def tearDown(self):
        """Clean up after tests."""
        # Remove temporary directory
        shutil.rmtree(self.test_dir)
        
        # Stop patchers
        self.settings_patcher.stop()
        self.config_patcher.stop()
        self.gpu_warmup_patcher.stop()
        self.gpu_memory_pool_patcher.stop()
        self.llm_integration_patcher.stop()
        self.vision_integration_patcher.stop()
        self.audio_integration_patcher.stop()
        
        if not gpu_available:
            self.cuda_patcher.stop()
            self.cuda_device_count_patcher.stop()
            self.cuda_get_device_name_patcher.stop()
    
    @skip_if_no_gpu
    @pytest.mark.asyncio
    async def test_initialize(self):
        """Test initialization of model loader with GPU optimizations."""
        # Initialize
        result = await self.model_loader.initialize()
        
        # Check result
        self.assertTrue(result)
        self.mock_gpu_warmup_manager.initialize.assert_called_once()
        self.mock_memory_pool.initialize.assert_called_once()
        self.mock_gpu_warmup_manager.warmup_gpu.assert_called_once()
    
    @skip_if_no_gpu
    @pytest.mark.asyncio
    async def test_load_model(self):
        """Test loading a model with GPU optimizations."""
        # Load model
        model_config = {
            "type": "llama.cpp",
            "path": "test-model.bin"
        }
        model, metadata = await self.model_loader.load_model("test-model", model_config)
        
        # Check result
        self.assertEqual(model["model_id"], "test-model")
        self.assertEqual(metadata["memory_usage_mb"], 100)
        self.assertTrue("loading_time_seconds" in metadata)
        self.assertTrue("gpu_optimized" in metadata)
        
        # Check GPU warmup and memory pool calls
        self.mock_gpu_warmup_manager.update_model_usage.assert_called_once()
        self.mock_memory_pool.get_block.assert_called_once()
    
    @skip_if_no_gpu
    @pytest.mark.asyncio
    async def test_unload_model(self):
        """Test unloading a model with GPU optimizations."""
        # Load model first
        model_config = {
            "type": "llama.cpp",
            "path": "test-model.bin"
        }
        await self.model_loader.load_model("test-model", model_config)
        
        # Unload model
        metadata = await self.model_loader.unload_model("test-model")
        
        # Check result
        self.assertEqual(metadata["status"], "unloaded")
        self.assertTrue("unloading_time_seconds" in metadata)
        
        # Check GPU memory pool calls
        self.mock_memory_pool.release_model_blocks.assert_called_once_with("test-model")
    
    @skip_if_no_gpu
    @pytest.mark.asyncio
    async def test_get_model_loading_stats(self):
        """Test getting model loading statistics."""
        # Load model first
        model_config = {
            "type": "llama.cpp",
            "path": "test-model.bin"
        }
        await self.model_loader.load_model("test-model", model_config)
        
        # Get stats
        stats = await self.model_loader.get_model_loading_stats()
        
        # Check result
        self.assertTrue("models" in stats)
        self.assertTrue("test-model" in stats["models"])
        self.assertTrue("loading_times" in stats["models"]["test-model"])
        self.assertTrue("memory_usage_bytes" in stats["models"]["test-model"])
        self.assertTrue("gpu" in stats)
        self.assertTrue("enabled" in stats["gpu"])
        self.assertTrue("warmup_status" in stats["gpu"])
    
    @skip_if_no_gpu
    @pytest.mark.asyncio
    async def test_preload_models(self):
        """Test preloading models."""
        # Preload models
        result = await self.model_loader.preload_models(["test-model"])
        
        # Check result
        self.assertEqual(result["status"], "completed")
        self.assertEqual(len(result["preloaded"]), 1)
        self.assertEqual(result["preloaded"][0], "test-model")
        
        # Check if model was loaded
        self.assertTrue("test-model" in self.model_loader.loaded_models)
    
    @skip_if_no_gpu
    @pytest.mark.asyncio
    async def test_estimate_model_memory_usage(self):
        """Test estimating model memory usage."""
        # Estimate memory usage
        memory_usage = self.model_loader._estimate_model_memory_usage("test-model", "llama.cpp", self.test_model_path)
        
        # Check result
        self.assertEqual(memory_usage, int(1024 * 1024 * 1.2))  # 1 MB * 1.2


if __name__ == '__main__':
    unittest.main()
