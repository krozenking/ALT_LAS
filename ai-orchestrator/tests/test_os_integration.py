"""
Test module for OS Integration functionality

This module contains tests for the OSIntegrationManager class and its
integration with the OS Integration Service.
"""

import pytest
import asyncio
import os
import json
from unittest.mock import MagicMock, patch, AsyncMock
import time
import base64

from src.integration.os_integration import OSIntegrationManager
from src.services.os_integration_enhanced import EnhancedOSIntegrationClient

# Mock configuration for testing
@pytest.fixture
def mock_config():
    with patch('src.config.config') as mock_conf:
        mock_conf.get.side_effect = lambda key, default=None: {
            "services.os_integration.url": "http://localhost:8080",
            "services.os_integration.timeout": 5
        }.get(key, default)
        yield mock_conf

# Mock aiohttp ClientSession
@pytest.fixture
def mock_aiohttp_session():
    with patch('aiohttp.ClientSession') as mock_session:
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json = AsyncMock(return_value={
            "os_type": "Linux",
            "os_version": "Ubuntu 22.04",
            "architecture": "x86_64",
            "hostname": "test-host",
            "username": "test-user",
            "cpu_cores": 4,
            "memory_total": 8589934592  # 8 GB
        })
        
        mock_context = AsyncMock()
        mock_context.__aenter__.return_value = mock_response
        
        mock_session_instance = AsyncMock()
        mock_session_instance.get.return_value = mock_context
        
        mock_session.return_value = mock_session_instance
        yield mock_session

# Test initialization
@pytest.mark.asyncio
async def test_os_integration_manager_init(mock_config):
    """Test initialization of OSIntegrationManager"""
    manager = OSIntegrationManager()
    assert manager is not None
    assert manager.initialized is False
    assert manager.platform_info is None
    assert manager.resource_monitor_task is None
    assert manager.resource_data == []
    assert manager.resource_monitoring_active is False

# Test platform info retrieval
@pytest.mark.asyncio
async def test_get_platform_info(mock_config, mock_aiohttp_session):
    """Test getting platform information"""
    manager = OSIntegrationManager()
    
    # Mock the client's get_platform_info method
    async def mock_get_platform_info():
        return {
            "os_type": "Linux",
            "os_version": "Ubuntu 22.04",
            "architecture": "x86_64",
            "hostname": "test-host",
            "username": "test-user",
            "cpu_cores": 4,
            "memory_total": 8589934592  # 8 GB
        }
    
    manager.client = AsyncMock(spec=EnhancedOSIntegrationClient)
    manager.client.initialize.return_value = True
    manager.client.get_platform_info.side_effect = mock_get_platform_info
    
    # Initialize and get platform info
    await manager.initialize()
    platform_info = await manager.get_platform_info()
    
    assert platform_info is not None
    assert platform_info["os_type"] == "Linux"
    assert platform_info["os_version"] == "Ubuntu 22.04"
    assert platform_info["architecture"] == "x86_64"
    assert platform_info["hostname"] == "test-host"
    assert platform_info["username"] == "test-user"
    assert platform_info["cpu_cores"] == 4
    assert platform_info["memory_total"] == 8589934592

# Test screenshot capture
@pytest.mark.asyncio
async def test_capture_screenshot(mock_config):
    """Test capturing a screenshot"""
    manager = OSIntegrationManager()
    
    # Mock the client's capture_screenshot method
    async def mock_capture_screenshot(save_path=None):
        return {
            "status": "success",
            "image_data": "base64_encoded_image_data",
            "image_path": save_path if save_path else None,
            "width": 1920,
            "height": 1080
        }
    
    manager.client = AsyncMock(spec=EnhancedOSIntegrationClient)
    manager.client.initialize.return_value = True
    manager.client.capture_screenshot.side_effect = mock_capture_screenshot
    
    # Initialize and capture screenshot
    await manager.initialize()
    result = await manager.capture_screenshot("/tmp")
    
    assert result is not None
    assert result["status"] == "success"
    assert result["image_data"] == "base64_encoded_image_data"
    assert result["width"] == 1920
    assert result["height"] == 1080

# Test process listing
@pytest.mark.asyncio
async def test_list_processes(mock_config):
    """Test listing processes"""
    manager = OSIntegrationManager()
    
    # Mock the client's list_processes method
    async def mock_list_processes():
        return {
            "status": "success",
            "processes": [
                {"pid": 1, "name": "systemd", "cpu": 0.1, "memory": 10240},
                {"pid": 2, "name": "kthreadd", "cpu": 0.0, "memory": 0}
            ]
        }
    
    manager.client = AsyncMock(spec=EnhancedOSIntegrationClient)
    manager.client.initialize.return_value = True
    manager.client.list_processes.side_effect = mock_list_processes
    
    # Initialize and list processes
    await manager.initialize()
    result = await manager.list_processes()
    
    assert result is not None
    assert result["status"] == "success"
    assert len(result["processes"]) == 2
    assert result["processes"][0]["pid"] == 1
    assert result["processes"][0]["name"] == "systemd"

# Test directory listing
@pytest.mark.asyncio
async def test_list_directory(mock_config):
    """Test listing directory contents"""
    manager = OSIntegrationManager()
    
    # Mock the client's list_directory method
    async def mock_list_directory(path):
        return {
            "status": "success",
            "entries": [
                {"name": "file1.txt", "type": "file", "size": 1024},
                {"name": "dir1", "type": "directory"}
            ],
            "path": path
        }
    
    manager.client = AsyncMock(spec=EnhancedOSIntegrationClient)
    manager.client.initialize.return_value = True
    manager.client.list_directory.side_effect = mock_list_directory
    
    # Initialize and list directory
    await manager.initialize()
    result = await manager.list_directory("/tmp")
    
    assert result is not None
    assert result["status"] == "success"
    assert len(result["entries"]) == 2
    assert result["entries"][0]["name"] == "file1.txt"
    assert result["entries"][0]["type"] == "file"
    assert result["entries"][1]["name"] == "dir1"
    assert result["entries"][1]["type"] == "directory"
    assert result["path"] == "/tmp"

# Test system resource monitoring
@pytest.mark.asyncio
async def test_resource_monitoring(mock_config):
    """Test system resource monitoring"""
    manager = OSIntegrationManager()
    
    # Mock the client's get_system_resources method
    async def mock_get_system_resources():
        return {
            "status": "success",
            "resources": {
                "cpu": {"percent": 10.5, "cores": 4},
                "memory": {"total": 8589934592, "available": 4294967296, "percent": 50.0},
                "disk": {"total": 107374182400, "free": 53687091200, "percent": 50.0}
            }
        }
    
    manager.client = AsyncMock(spec=EnhancedOSIntegrationClient)
    manager.client.initialize.return_value = True
    manager.client.get_system_resources.side_effect = mock_get_system_resources
    
    # Initialize
    await manager.initialize()
    
    # Start monitoring
    success = await manager.start_resource_monitoring(interval_seconds=1, max_samples=3)
    assert success is True
    assert manager.resource_monitoring_active is True
    
    # Wait for some samples to be collected
    await asyncio.sleep(2.5)
    
    # Get history
    history = manager.get_resource_history()
    assert len(history) > 0
    assert "timestamp" in history[0]
    assert "resources" in history[0]
    
    # Stop monitoring
    success = await manager.stop_resource_monitoring()
    assert success is True
    assert manager.resource_monitoring_active is False

# Test fallback to local platform detection
@pytest.mark.asyncio
async def test_local_platform_fallback(mock_config):
    """Test fallback to local platform detection when service is unavailable"""
    manager = OSIntegrationManager()
    
    # Mock the client to simulate service unavailability
    manager.client = AsyncMock(spec=EnhancedOSIntegrationClient)
    manager.client.initialize.return_value = True
    manager.client.get_platform_info.side_effect = Exception("Service unavailable")
    
    # Create a mock for the _get_local_platform_info method
    with patch.object(EnhancedOSIntegrationClient, '_get_local_platform_info') as mock_local:
        mock_local.return_value = {
            "os_type": "Linux",
            "os_version": "Ubuntu 22.04 (local)",
            "architecture": "x86_64",
            "hostname": "local-host",
            "username": "local-user",
            "cpu_cores": 2,
            "memory_total": 4294967296  # 4 GB
        }
        
        # Initialize the client with our mocked method
        manager.client._get_local_platform_info = mock_local
        
        # Initialize and get platform info
        await manager.initialize()
        platform_info = await manager.get_platform_info()
        
        assert platform_info is not None
        assert platform_info["os_type"] == "Linux"
        assert "(local)" in platform_info["os_version"]
        assert platform_info["hostname"] == "local-host"

# Test cleanup
@pytest.mark.asyncio
async def test_cleanup(mock_config):
    """Test cleanup of resources"""
    manager = OSIntegrationManager()
    
    # Mock the client
    manager.client = AsyncMock(spec=EnhancedOSIntegrationClient)
    manager.client.initialize.return_value = True
    
    # Initialize
    await manager.initialize()
    
    # Start monitoring
    manager.resource_monitoring_active = True
    manager.resource_monitor_task = asyncio.create_task(asyncio.sleep(10))
    manager.resource_data = [{"timestamp": "2025-04-24T12:00:00", "resources": {}}]
    
    # Cleanup
    await manager.cleanup()
    
    assert manager.resource_monitoring_active is False
    assert manager.resource_monitor_task is None
    assert manager.resource_data == []
    assert manager.initialized is False
