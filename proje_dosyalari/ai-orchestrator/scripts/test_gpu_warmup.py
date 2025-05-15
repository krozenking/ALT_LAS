#!/usr/bin/env python
"""
Test script for GPU warmup and memory management.

This script tests the GPU warmup and memory management functionality
by loading and unloading models and measuring performance.
"""

import os
import sys
import time
import asyncio
import argparse
import json
import logging
from pathlib import Path

# Add src directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.core.gpu_warmup import get_gpu_warmup_manager
from src.core.gpu_memory_pool import get_gpu_memory_pool
from src.core.model_loader import get_model_loader
from src.core.model_cache import get_model_cache
from src.config.settings import config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('gpu_warmup_test.log')
    ]
)

logger = logging.getLogger(__name__)


async def test_gpu_warmup():
    """Test GPU warmup functionality."""
    logger.info("Testing GPU warmup functionality")
    
    # Get GPU warmup manager
    gpu_warmup_manager = get_gpu_warmup_manager()
    
    # Initialize GPU warmup manager
    logger.info("Initializing GPU warmup manager")
    start_time = time.time()
    result = await gpu_warmup_manager.initialize()
    init_time = time.time() - start_time
    
    logger.info(f"GPU warmup manager initialized in {init_time:.2f} seconds, result: {result}")
    
    # Warm up GPU
    logger.info("Warming up GPU")
    start_time = time.time()
    result = await gpu_warmup_manager.warmup_gpu()
    warmup_time = time.time() - start_time
    
    logger.info(f"GPU warmed up in {warmup_time:.2f} seconds, result: {result}")
    
    # Get memory info
    memory_info = gpu_warmup_manager.get_memory_info()
    logger.info(f"GPU memory info: {json.dumps(memory_info, indent=2)}")
    
    return {
        "init_time": init_time,
        "warmup_time": warmup_time,
        "memory_info": memory_info
    }


async def test_gpu_memory_pool():
    """Test GPU memory pool functionality."""
    logger.info("Testing GPU memory pool functionality")
    
    # Get GPU memory pool
    gpu_memory_pool = get_gpu_memory_pool()
    
    # Initialize GPU memory pool
    logger.info("Initializing GPU memory pool")
    start_time = time.time()
    result = await gpu_memory_pool.initialize()
    init_time = time.time() - start_time
    
    logger.info(f"GPU memory pool initialized in {init_time:.2f} seconds, result: {result}")
    
    # Allocate blocks
    block_sizes = [128, 256, 512]  # MB
    blocks = []
    
    for size_mb in block_sizes:
        size_bytes = size_mb * 1024 * 1024
        logger.info(f"Allocating {size_mb} MB block")
        start_time = time.time()
        block = await gpu_memory_pool.allocate_block(size_bytes, 0)
        alloc_time = time.time() - start_time
        
        if block:
            blocks.append(block)
            logger.info(f"Allocated {size_mb} MB block in {alloc_time:.2f} seconds")
        else:
            logger.warning(f"Failed to allocate {size_mb} MB block")
    
    # Get memory info
    memory_info = gpu_memory_pool.get_memory_info()
    logger.info(f"GPU memory pool info: {json.dumps(memory_info, indent=2)}")
    
    # Release blocks
    for block in blocks:
        block.release()
    
    return {
        "init_time": init_time,
        "memory_info": memory_info
    }


async def test_model_loading_with_gpu():
    """Test model loading with GPU optimizations."""
    logger.info("Testing model loading with GPU optimizations")
    
    # Get model loader
    model_loader = get_model_loader()
    
    # Initialize model loader
    logger.info("Initializing model loader")
    start_time = time.time()
    result = await model_loader.initialize()
    init_time = time.time() - start_time
    
    logger.info(f"Model loader initialized in {init_time:.2f} seconds, result: {result}")
    
    # Define test models
    test_models = [
        {
            "id": "test-model-1",
            "config": {
                "type": "llama.cpp",
                "path": "models/test-model-1.bin"
            }
        },
        {
            "id": "test-model-2",
            "config": {
                "type": "onnx",
                "path": "models/test-model-2.onnx"
            }
        }
    ]
    
    # Create dummy model files if they don't exist
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    
    for model in test_models:
        model_path = models_dir / model["config"]["path"].split("/")[-1]
        if not model_path.exists():
            logger.info(f"Creating dummy model file: {model_path}")
            with open(model_path, "wb") as f:
                f.write(b"x" * 1024 * 1024)  # 1 MB dummy model
    
    # Load models
    loading_times = {}
    
    for model in test_models:
        model_id = model["id"]
        model_config = model["config"]
        
        logger.info(f"Loading model {model_id}")
        start_time = time.time()
        
        try:
            model_obj, metadata = await model_loader.load_model(model_id, model_config)
            load_time = time.time() - start_time
            
            loading_times[model_id] = {
                "load_time": load_time,
                "metadata": metadata
            }
            
            logger.info(f"Loaded model {model_id} in {load_time:.2f} seconds")
        except Exception as e:
            logger.error(f"Error loading model {model_id}: {str(e)}")
    
    # Get model loading stats
    model_stats = await model_loader.get_model_loading_stats()
    logger.info(f"Model loading stats: {json.dumps(model_stats, indent=2)}")
    
    # Unload models
    unloading_times = {}
    
    for model in test_models:
        model_id = model["id"]
        
        if model_id in model_loader.loaded_models:
            logger.info(f"Unloading model {model_id}")
            start_time = time.time()
            
            try:
                metadata = await model_loader.unload_model(model_id)
                unload_time = time.time() - start_time
                
                unloading_times[model_id] = {
                    "unload_time": unload_time,
                    "metadata": metadata
                }
                
                logger.info(f"Unloaded model {model_id} in {unload_time:.2f} seconds")
            except Exception as e:
                logger.error(f"Error unloading model {model_id}: {str(e)}")
    
    return {
        "init_time": init_time,
        "loading_times": loading_times,
        "unloading_times": unloading_times,
        "model_stats": model_stats
    }


async def run_tests():
    """Run all tests."""
    results = {}
    
    # Test GPU warmup
    results["gpu_warmup"] = await test_gpu_warmup()
    
    # Test GPU memory pool
    results["gpu_memory_pool"] = await test_gpu_memory_pool()
    
    # Test model loading with GPU
    results["model_loading"] = await test_model_loading_with_gpu()
    
    # Save results to file
    with open("gpu_warmup_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    logger.info("All tests completed")
    logger.info(f"Results saved to gpu_warmup_test_results.json")
    
    return results


def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Test GPU warmup and memory management")
    parser.add_argument("--test", choices=["warmup", "memory", "model", "all"], default="all", help="Test to run")
    args = parser.parse_args()
    
    logger.info(f"Running test: {args.test}")
    
    if args.test == "warmup":
        asyncio.run(test_gpu_warmup())
    elif args.test == "memory":
        asyncio.run(test_gpu_memory_pool())
    elif args.test == "model":
        asyncio.run(test_model_loading_with_gpu())
    else:
        asyncio.run(run_tests())


if __name__ == "__main__":
    main()
