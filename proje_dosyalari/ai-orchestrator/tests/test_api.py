"""
Test module for API endpoints of the AI Orchestrator

This module contains tests for the FastAPI endpoints of the AI Orchestrator
to ensure proper functionality of the API layer.
"""

import pytest
import asyncio
import os
import json
from unittest.mock import MagicMock, patch, AsyncMock
from fastapi.testclient import TestClient
from fastapi import FastAPI

from src.main import app, get_model_manager, get_os_integration
from src.models.enhanced_model_manager import EnhancedModelManager
from src.integration.os_integration import OSIntegrationManager

# Create test client
client = TestClient(app)

# Mock dependencies
@pytest.fixture
def mock_dependencies():
    # Create mock instances
    mock_model_manager = AsyncMock(spec=EnhancedModelManager)
    mock_os_integration = AsyncMock(spec=OSIntegrationManager)
    
    # Configure model manager mock
    mock_model_manager.get_status.return_value = {
        "llm": {"loaded": True, "info": {"version": "0.1.0"}, "cache_config": {}, "cache_size": 0},
        "vision": {"loaded": True, "info": {"version": "0.1.0"}, "cache_config": {}, "cache_size": 0},
        "voice": {"loaded": True, "info": {"version": "0.1.0"}, "cache_config": {}, "cache_size": 0}
    }
    mock_model_manager.get_stats.return_value = {
        "llm": {"requests": 10, "errors": 1, "average_latency": 100.0},
        "vision": {"requests": 5, "errors": 0, "average_latency": 200.0},
        "voice": {"requests": 3, "errors": 0, "average_latency": 150.0}
    }
    mock_model_manager.get_uptime.return_value = 3600.0
    mock_model_manager.process_llm.return_value = "LLM response"
    mock_model_manager.process_vision.return_value = {"detected_objects": ["object1", "object2"]}
    mock_model_manager.process_voice.return_value = {"transcription": "Voice transcription"}
    mock_model_manager.process_batch.return_value = [
        {"result": "LLM response", "model_type": "llm", "status": "success"},
        {"result": {"detected_objects": ["object1"]}, "model_type": "vision", "status": "success"}
    ]
    mock_model_manager.get_models_info.return_value = {
        "llm": {"name": "Local LLM", "version": "0.1.0", "loaded": True},
        "vision": {"name": "Computer Vision Model", "version": "0.1.0", "loaded": True},
        "voice": {"name": "Voice Processing Model", "version": "0.1.0", "loaded": True}
    }
    mock_model_manager.switch_model_version.return_value = True
    mock_model_manager.get_available_versions.return_value = [
        {"version": "0.1.0", "path": "/tmp/models/llm_v1", "default": True},
        {"version": "0.2.0", "path": "/tmp/models/llm_v2", "default": False}
    ]
    mock_model_manager.clear_cache.return_value = {"llm": 2, "vision": 1, "voice": 0}
    
    # Configure OS integration mock
    mock_os_integration.get_platform_info.return_value = {
        "os_type": "Linux",
        "os_version": "Ubuntu 22.04",
        "architecture": "x86_64",
        "hostname": "test-host",
        "username": "test-user",
        "cpu_cores": 4,
        "memory_total": 8589934592
    }
    mock_os_integration.capture_screenshot.return_value = {
        "status": "success",
        "image_data": "base64_encoded_image_data",
        "image_path": "/tmp/screenshot.png",
        "width": 1920,
        "height": 1080
    }
    mock_os_integration.list_processes.return_value = {
        "status": "success",
        "processes": [
            {"pid": 1, "name": "systemd", "cpu": 0.1, "memory": 10240},
            {"pid": 2, "name": "kthreadd", "cpu": 0.0, "memory": 0}
        ]
    }
    mock_os_integration.list_directory.return_value = {
        "status": "success",
        "entries": [
            {"name": "file1.txt", "type": "file", "size": 1024},
            {"name": "dir1", "type": "directory"}
        ],
        "path": "/tmp"
    }
    mock_os_integration.get_system_resources.return_value = {
        "status": "success",
        "resources": {
            "cpu": {"percent": 10.5, "cores": 4},
            "memory": {"total": 8589934592, "available": 4294967296, "percent": 50.0},
            "disk": {"total": 107374182400, "free": 53687091200, "percent": 50.0}
        }
    }
    mock_os_integration.start_resource_monitoring.return_value = True
    mock_os_integration.stop_resource_monitoring.return_value = True
    mock_os_integration.get_resource_history.return_value = [
        {
            "timestamp": "2025-04-24T12:00:00",
            "resources": {
                "cpu": {"percent": 10.5, "cores": 4},
                "memory": {"total": 8589934592, "available": 4294967296, "percent": 50.0},
                "disk": {"total": 107374182400, "free": 53687091200, "percent": 50.0}
            }
        }
    ]
    
    # Override the dependency injection
    app.dependency_overrides[get_model_manager] = lambda: mock_model_manager
    app.dependency_overrides[get_os_integration] = lambda: mock_os_integration
    
    yield mock_model_manager, mock_os_integration
    
    # Clean up
    app.dependency_overrides.clear()

# Test root endpoint
def test_root():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "AI Orchestrator"
    assert "version" in data
    assert data["status"] == "running"

# Test health check endpoint
def test_health_check(mock_dependencies):
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "uptime" in data
    assert "models" in data
    assert "platform" in data

# Test LLM processing endpoint
def test_process_llm(mock_dependencies):
    """Test the LLM processing endpoint"""
    mock_model_manager, _ = mock_dependencies
    
    response = client.post(
        "/api/llm",
        json={"input": "Hello, world!", "parameters": {"temperature": 0.7}}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["result"] == "LLM response"
    assert data["model_type"] == "llm"
    assert data["status"] == "success"
    
    # Verify the mock was called with correct parameters
    mock_model_manager.process_llm.assert_called_once()
    args, kwargs = mock_model_manager.process_llm.call_args
    assert args[0] == "Hello, world!"
    assert "temperature" in args[1]
    assert args[1]["temperature"] == 0.7

# Test Vision processing endpoint
def test_process_vision(mock_dependencies):
    """Test the Vision processing endpoint"""
    mock_model_manager, _ = mock_dependencies
    
    response = client.post(
        "/api/vision",
        json={"input": "/tmp/test_image.jpg", "parameters": {"capture_screenshot": False}}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "detected_objects" in data["result"]
    assert data["model_type"] == "vision"
    assert data["status"] == "success"
    
    # Verify the mock was called with correct parameters
    mock_model_manager.process_vision.assert_called_once()
    args, kwargs = mock_model_manager.process_vision.call_args
    assert args[0] == "/tmp/test_image.jpg"
    assert "capture_screenshot" in args[1]
    assert args[1]["capture_screenshot"] is False

# Test Voice processing endpoint
def test_process_voice(mock_dependencies):
    """Test the Voice processing endpoint"""
    mock_model_manager, _ = mock_dependencies
    
    response = client.post(
        "/api/voice",
        json={"input": "/tmp/test_audio.wav", "parameters": {"language": "en"}}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "transcription" in data["result"]
    assert data["model_type"] == "voice"
    assert data["status"] == "success"
    
    # Verify the mock was called with correct parameters
    mock_model_manager.process_voice.assert_called_once()
    args, kwargs = mock_model_manager.process_voice.call_args
    assert args[0] == "/tmp/test_audio.wav"
    assert "language" in args[1]
    assert args[1]["language"] == "en"

# Test batch processing endpoint
def test_process_batch(mock_dependencies):
    """Test the batch processing endpoint"""
    mock_model_manager, _ = mock_dependencies
    
    response = client.post(
        "/api/batch",
        json={
            "requests": [
                {"model_type": "llm", "input": "Hello from batch", "parameters": {}},
                {"model_type": "vision", "input": "/tmp/test_image.jpg", "parameters": {}}
            ]
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["results"]) == 2
    assert data["results"][0]["model_type"] == "llm"
    assert data["results"][1]["model_type"] == "vision"
    
    # Verify the mock was called
    mock_model_manager.process_batch.assert_called_once()

# Test models info endpoint
def test_get_models_info(mock_dependencies):
    """Test the models info endpoint"""
    response = client.get("/api/models/info")
    assert response.status_code == 200
    data = response.json()
    assert "llm" in data
    assert "vision" in data
    assert "voice" in data
    assert data["llm"]["name"] == "Local LLM"
    assert data["llm"]["version"] == "0.1.0"

# Test models status endpoint
def test_get_models_status(mock_dependencies):
    """Test the models status endpoint"""
    response = client.get("/api/models/status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "uptime" in data
    assert "llm" in data["status"]
    assert "vision" in data["status"]
    assert "voice" in data["status"]
    assert data["status"]["llm"]["loaded"] is True

# Test models stats endpoint
def test_get_models_stats(mock_dependencies):
    """Test the models stats endpoint"""
    response = client.get("/api/models/stats")
    assert response.status_code == 200
    data = response.json()
    assert "stats" in data
    assert "uptime" in data
    assert "llm" in data["stats"]
    assert "vision" in data["stats"]
    assert "voice" in data["stats"]
    assert data["stats"]["llm"]["requests"] == 10
    assert data["stats"]["llm"]["errors"] == 1

# Test switch model version endpoint
def test_switch_model_version(mock_dependencies):
    """Test the switch model version endpoint"""
    mock_model_manager, _ = mock_dependencies
    
    response = client.post(
        "/api/models/version",
        json={"model_type": "llm", "version": "0.2.0"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "Switched llm to version 0.2.0" in data["message"]
    
    # Verify the mock was called with correct parameters
    mock_model_manager.switch_model_version.assert_called_once_with("llm", "0.2.0")

# Test get available versions endpoint
def test_get_available_versions(mock_dependencies):
    """Test the get available versions endpoint"""
    response = client.get("/api/models/versions/llm")
    assert response.status_code == 200
    data = response.json()
    assert data["model_type"] == "llm"
    assert len(data["versions"]) == 2
    assert data["versions"][0]["version"] == "0.1.0"
    assert data["versions"][1]["version"] == "0.2.0"

# Test clear cache endpoint
def test_clear_cache(mock_dependencies):
    """Test the clear cache endpoint"""
    mock_model_manager, _ = mock_dependencies
    
    response = client.post("/api/models/cache/clear?model_type=llm")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["cleared"]["llm"] == 2
    
    # Verify the mock was called with correct parameters
    mock_model_manager.clear_cache.assert_called_once_with("llm")

# Test platform info endpoint
def test_get_platform_info(mock_dependencies):
    """Test the platform info endpoint"""
    response = client.get("/api/platform/info")
    assert response.status_code == 200
    data = response.json()
    assert data["os_type"] == "Linux"
    assert data["os_version"] == "Ubuntu 22.04"
    assert data["architecture"] == "x86_64"
    assert data["hostname"] == "test-host"
    assert data["username"] == "test-user"
    assert data["cpu_cores"] == 4

# Test screenshot capture endpoint
def test_capture_screenshot(mock_dependencies):
    """Test the screenshot capture endpoint"""
    _, mock_os_integration = mock_dependencies
    
    response = client.get("/api/platform/screenshot?save_dir=/tmp")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["image_data"] == "base64_encoded_image_data"
    assert data["image_path"] == "/tmp/screenshot.png"
    assert data["width"] == 1920
    assert data["height"] == 1080
    
    # Verify the mock was called with correct parameters
    mock_os_integration.capture_screenshot.assert_called_once_with("/tmp")

# Test process listing endpoint
def test_list_processes(mock_dependencies):
    """Test the process listing endpoint"""
    response = client.get("/api/platform/processes")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["processes"]) == 2
    assert data["processes"][0]["pid"] == 1
    assert data["processes"][0]["name"] == "systemd"

# Test directory listing endpoint
def test_list_directory(mock_dependencies):
    """Test the directory listing endpoint"""
    _, mock_os_integration = mock_dependencies
    
    response = client.get("/api/platform/directory?path=/tmp")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["entries"]) == 2
    assert data["entries"][0]["name"] == "file1.txt"
    assert data["entries"][0]["type"] == "file"
    assert data["path"] == "/tmp"
    
    # Verify the mock was called with correct parameters
    mock_os_integration.list_directory.assert_called_once_with("/tmp")

# Test system resources endpoint
def test_get_system_resources(mock_dependencies):
    """Test the system resources endpoint"""
    response = client.get("/api/platform/resources")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "cpu" in data["resources"]
    assert "memory" in data["resources"]
    assert "disk" in data["resources"]
    assert data["resources"]["cpu"]["percent"] == 10.5
    assert data["resources"]["cpu"]["cores"] == 4

# Test start resource monitoring endpoint
def test_start_resource_monitoring(mock_dependencies):
    """Test the start resource monitoring endpoint"""
    _, mock_os_integration = mock_dependencies
    
    response = client.post("/api/platform/monitor/start?interval_seconds=2&max_samples=50")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "Started resource monitoring" in data["message"]
    
    # Verify the mock was called with correct parameters
    mock_os_integration.start_resource_monitoring.assert_called_once_with(2, 50)

# Test stop resource monitoring endpoint
def test_stop_resource_monitoring(mock_dependencies):
    """Test the stop resource monitoring endpoint"""
    response = client.post("/api/platform/monitor/stop")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "Stopped resource monitoring" in data["message"]

# Test get resource history endpoint
def test_get_resource_history(mock_dependencies):
    """Test the get resource history endpoint"""
    response = client.get("/api/platform/monitor/history")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "history" in data
    assert len(data["history"]) == 1
    assert "timestamp" in data["history"][0]
    assert "resources" in data["history"][0]
    assert "cpu" in data["history"][0]["resources"]
    assert "memory" in data["history"][0]["resources"]
    assert "disk" in data["history"][0]["resources"]
