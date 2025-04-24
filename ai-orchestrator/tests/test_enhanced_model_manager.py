"""
Test module for enhanced model manager functionality

This module contains tests for the EnhancedModelManager class with
its advanced capabilities including model versioning, caching, and OS integration.
"""

import pytest
import asyncio
import os
import json
from unittest.mock import MagicMock, patch, AsyncMock
import time

from src.models.enhanced_model_manager import EnhancedModelManager
from src.integration.os_integration import OSIntegrationManager

# Mock configuration for testing
@pytest.fixture
def mock_config():
    with patch('src.config.config') as mock_conf:
        mock_conf.get.side_effect = lambda key, default=None: {
            "model_paths.llm": "/tmp/models/llm",
            "model_paths.vision": "/tmp/models/vision",
            "model_paths.voice": "/tmp/models/voice",
            "model_paths.versions_file": "/tmp/models/versions.json",
            "model_cache.llm.enabled": True,
            "model_cache.llm.max_items": 10,
            "model_cache.llm.ttl_seconds": 60,
            "model_cache.vision.enabled": True,
            "model_cache.vision.max_items": 5,
            "model_cache.vision.ttl_seconds": 60,
            "model_cache.voice.enabled": True,
            "model_cache.voice.max_items": 3,
            "model_cache.voice.ttl_seconds": 60,
            "services.os_integration.url": "http://localhost:8080",
            "services.os_integration.timeout": 5
        }.get(key, default)
        yield mock_conf

# Mock OS Integration Manager
@pytest.fixture
async def mock_os_integration():
    mock_manager = AsyncMock(spec=OSIntegrationManager)
    mock_manager.initialize.return_value = True
    mock_manager.get_platform_info.return_value = {
        "os_type": "Linux",
        "os_version": "Ubuntu 22.04",
        "architecture": "x86_64",
        "hostname": "test-host",
        "username": "test-user",
        "cpu_cores": 4,
        "memory_total": 8589934592  # 8 GB
    }
    mock_manager.capture_screenshot.return_value = {
        "status": "success",
        "image_data": "base64_encoded_image_data",
        "image_path": "/tmp/screenshot.png",
        "width": 1920,
        "height": 1080
    }
    mock_manager.list_processes.return_value = {
        "status": "success",
        "processes": [
            {"pid": 1, "name": "systemd", "cpu": 0.1, "memory": 10240},
            {"pid": 2, "name": "kthreadd", "cpu": 0.0, "memory": 0}
        ]
    }
    mock_manager.list_directory.return_value = {
        "status": "success",
        "entries": [
            {"name": "file1.txt", "type": "file", "size": 1024},
            {"name": "dir1", "type": "directory"}
        ],
        "path": "/tmp"
    }
    mock_manager.get_system_resources.return_value = {
        "status": "success",
        "resources": {
            "cpu": {"percent": 10.5, "cores": 4},
            "memory": {"total": 8589934592, "available": 4294967296, "percent": 50.0},
            "disk": {"total": 107374182400, "free": 53687091200, "percent": 50.0}
        }
    }
    yield mock_manager

# Test initialization
@pytest.mark.asyncio
async def test_enhanced_model_manager_init(mock_config, mock_os_integration):
    """Test initialization of EnhancedModelManager"""
    manager = EnhancedModelManager(mock_os_integration)
    assert manager is not None
    assert manager.models["llm"] is None
    assert manager.models["vision"] is None
    assert manager.models["voice"] is None
    assert manager.os_integration == mock_os_integration

# Test model loading
@pytest.mark.asyncio
async def test_enhanced_model_loading(mock_config, mock_os_integration):
    """Test loading models in EnhancedModelManager"""
    # Create temporary model files
    os.makedirs("/tmp/models", exist_ok=True)
    with open("/tmp/models/llm", "w") as f:
        f.write("mock llm model data")
    with open("/tmp/models/vision", "w") as f:
        f.write("mock vision model data")
    with open("/tmp/models/voice", "w") as f:
        f.write("mock voice model data")
    
    # Create versions file
    with open("/tmp/models/versions.json", "w") as f:
        json.dump({
            "llm": [{"version": "0.1.0", "path": "/tmp/models/llm", "default": True}],
            "vision": [{"version": "0.1.0", "path": "/tmp/models/vision", "default": True}],
            "voice": [{"version": "0.1.0", "path": "/tmp/models/voice", "default": True}]
        }, f)
    
    manager = EnhancedModelManager(mock_os_integration)
    await manager.initialize()
    
    assert manager.models["llm"] is not None
    assert manager.models["vision"] is not None
    assert manager.models["voice"] is not None
    assert manager.model_info["llm"]["loaded"] is True
    assert manager.model_info["vision"]["loaded"] is True
    assert manager.model_info["voice"]["loaded"] is True
    
    # Clean up
    os.remove("/tmp/models/llm")
    os.remove("/tmp/models/vision")
    os.remove("/tmp/models/voice")
    os.remove("/tmp/models/versions.json")
    os.rmdir("/tmp/models")

# Test LLM processing
@pytest.mark.asyncio
async def test_enhanced_llm_processing(mock_config, mock_os_integration):
    """Test LLM processing in EnhancedModelManager"""
    manager = EnhancedModelManager(mock_os_integration)
    # Mock the model loading
    manager.models["llm"] = "mock_llm_model"
    manager.model_info["llm"]["loaded"] = True
    
    # Test processing
    result = await manager.process_llm("Hello, world!")
    assert result is not None
    assert "Hello, world" in result if isinstance(result, str) else True
    
    # Test with system info
    result = await manager.process_llm("Hello with system info", {"include_system_info": True})
    assert result is not None
    if isinstance(result, dict):
        assert "system_info" in result
    
    # Test stats
    assert manager.stats["llm"]["requests"] == 2
    assert manager.stats["llm"]["errors"] == 0
    assert len(manager.stats["llm"]["latencies"]) == 2

# Test vision processing
@pytest.mark.asyncio
async def test_enhanced_vision_processing(mock_config, mock_os_integration):
    """Test vision processing in EnhancedModelManager"""
    manager = EnhancedModelManager(mock_os_integration)
    # Mock the model loading
    manager.models["vision"] = "mock_vision_model"
    manager.model_info["vision"]["loaded"] = True
    
    # Test processing with file path
    result = await manager.process_vision("/tmp/test_image.jpg")
    assert result is not None
    assert "detected_objects" in result
    
    # Test with screenshot capture
    result = await manager.process_vision("dummy", {"capture_screenshot": True})
    assert result is not None
    assert "detected_objects" in result
    
    # Test stats
    assert manager.stats["vision"]["requests"] == 2
    assert manager.stats["vision"]["errors"] == 0
    assert len(manager.stats["vision"]["latencies"]) == 2

# Test voice processing
@pytest.mark.asyncio
async def test_enhanced_voice_processing(mock_config, mock_os_integration):
    """Test voice processing in EnhancedModelManager"""
    manager = EnhancedModelManager(mock_os_integration)
    # Mock the model loading
    manager.models["voice"] = "mock_voice_model"
    manager.model_info["voice"]["loaded"] = True
    
    # Test processing for speech-to-text
    result = await manager.process_voice("/tmp/test_audio.wav")
    assert result is not None
    assert "transcription" in result or "result" in result
    
    # Test processing for text-to-speech
    result = await manager.process_voice("Convert this text to speech", {"mode": "tts"})
    assert result is not None
    assert "audio_data" in result
    
    # Test stats
    assert manager.stats["voice"]["requests"] == 2
    assert manager.stats["voice"]["errors"] == 0
    assert len(manager.stats["voice"]["latencies"]) == 2

# Test caching
@pytest.mark.asyncio
async def test_enhanced_model_caching(mock_config, mock_os_integration):
    """Test model caching in EnhancedModelManager"""
    manager = EnhancedModelManager(mock_os_integration)
    # Mock the model loading
    manager.models["llm"] = "mock_llm_model"
    manager.model_info["llm"]["loaded"] = True
    
    # First request (cache miss)
    result1 = await manager.process_llm("Cache test")
    
    # Second request with same input (cache hit)
    result2 = await manager.process_llm("Cache test")
    
    # Different request (cache miss)
    result3 = await manager.process_llm("Different input")
    
    assert result1 == result2
    assert result1 != result3
    assert manager.stats["llm"]["cache_hits"] == 1
    assert manager.stats["llm"]["cache_misses"] == 2
    
    # Test cache clearing
    cleared = await manager.clear_cache("llm")
    assert cleared["llm"] == 2
    assert len(manager.model_cache["llm"]) == 0

# Test batch processing
@pytest.mark.asyncio
async def test_enhanced_batch_processing(mock_config, mock_os_integration):
    """Test batch processing in EnhancedModelManager"""
    manager = EnhancedModelManager(mock_os_integration)
    # Mock the model loading
    manager.models["llm"] = "mock_llm_model"
    manager.models["vision"] = "mock_vision_model"
    manager.model_info["llm"]["loaded"] = True
    manager.model_info["vision"]["loaded"] = True
    
    # Create batch request
    batch = [
        {"model_type": "llm", "input": "Hello from batch", "parameters": {}},
        {"model_type": "vision", "input": "/tmp/test_image.jpg", "parameters": {}}
    ]
    
    results = await manager.process_batch(batch)
    
    assert len(results) == 2
    assert results[0]["model_type"] == "llm"
    assert results[0]["status"] == "success"
    assert results[1]["model_type"] == "vision"
    assert results[1]["status"] == "success"

# Test model version switching
@pytest.mark.asyncio
async def test_enhanced_model_version_switching(mock_config, mock_os_integration):
    """Test model version switching in EnhancedModelManager"""
    # Create temporary model files and versions file
    os.makedirs("/tmp/models", exist_ok=True)
    with open("/tmp/models/llm_v1", "w") as f:
        f.write("mock llm model data v1")
    with open("/tmp/models/llm_v2", "w") as f:
        f.write("mock llm model data v2")
    
    versions = {
        "llm": [
            {"version": "0.1.0", "path": "/tmp/models/llm_v1", "default": True},
            {"version": "0.2.0", "path": "/tmp/models/llm_v2", "default": False}
        ]
    }
    
    with open("/tmp/models/versions.json", "w") as f:
        json.dump(versions, f)
    
    manager = EnhancedModelManager(mock_os_integration)
    manager.model_versions = versions
    
    # Mock the model loading methods
    async def mock_load_llm():
        manager.models["llm"] = "mock_llm_model"
        manager.model_info["llm"]["loaded"] = True
        manager.model_info["llm"]["version"] = next(
            (v["version"] for v in manager.model_versions["llm"] if v["default"]), "unknown"
        )
        return True
    
    manager._load_llm_model = mock_load_llm
    
    # Initialize and check initial version
    await manager.initialize()
    assert manager.model_info["llm"]["version"] == "0.1.0"
    
    # Switch version
    success = await manager.switch_model_version("llm", "0.2.0")
    assert success is True
    assert manager.model_info["llm"]["version"] == "0.2.0"
    
    # Check that default was updated in model_versions
    assert not manager.model_versions["llm"][0]["default"]
    assert manager.model_versions["llm"][1]["default"]
    
    # Clean up
    os.remove("/tmp/models/llm_v1")
    os.remove("/tmp/models/llm_v2")
    os.remove("/tmp/models/versions.json")
    os.rmdir("/tmp/models")

# Test status and stats
@pytest.mark.asyncio
async def test_enhanced_model_status_and_stats(mock_config, mock_os_integration):
    """Test getting status and stats in EnhancedModelManager"""
    manager = EnhancedModelManager(mock_os_integration)
    # Mock the model loading
    manager.models["llm"] = "mock_llm_model"
    manager.models["vision"] = "mock_vision_model"
    manager.models["voice"] = "mock_voice_model"
    manager.model_info["llm"]["loaded"] = True
    manager.model_info["vision"]["loaded"] = True
    manager.model_info["voice"]["loaded"] = True
    
    # Add some stats
    manager.stats["llm"]["requests"] = 10
    manager.stats["llm"]["errors"] = 1
    manager.stats["llm"]["latencies"] = [100, 110, 90, 105, 95]
    manager.stats["llm"]["tokens_processed"] = 500
    
    # Get status
    status = await manager.get_status()
    assert "llm" in status
    assert "vision" in status
    assert "voice" in status
    assert status["llm"]["loaded"] is True
    
    # Get stats
    stats = await manager.get_stats()
    assert "llm" in stats
    assert "vision" in stats
    assert "voice" in stats
    assert stats["llm"]["requests"] == 10
    assert stats["llm"]["errors"] == 1
    assert "average_latency" in stats["llm"]
    assert "tokens_processed" in stats["llm"]
    
    # Check uptime
    uptime = manager.get_uptime()
    assert uptime > 0
