"""
OS Integration Service Client Integration Module

This module enhances the OS Integration Client with direct integration capabilities
for the OS Integration Service's platform-specific features.
"""

import logging
import aiohttp
from typing import Dict, Any, Optional, List, Union
import os
import platform as py_platform
import json

from ..config import config

logger = logging.getLogger("ai_orchestrator.os_integration_enhanced")

class EnhancedOSIntegrationClient:
    """Enhanced client for deeper integration with the OS Integration Service"""
    
    def __init__(self, base_url: str, timeout: int = 30):
        """Initialize the Enhanced OS Integration client"""
        self.base_url = base_url
        self.timeout = timeout
        self.platform_info = None
    
    async def initialize(self) -> bool:
        """Initialize the client and cache platform information"""
        try:
            self.platform_info = await self.get_platform_info()
            logger.info(f"Enhanced OS Integration Client initialized for {self.platform_info.get('os_type', 'unknown')} platform")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize Enhanced OS Integration Client: {str(e)}")
            return False
    
    async def get_platform_info(self) -> Dict[str, Any]:
        """Get detailed platform information from the OS Integration Service"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/api/platform",
                    timeout=self.timeout
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data
                    else:
                        # Fallback to local platform detection if service is unavailable
                        logger.warning(f"OS Integration Service unavailable, using local platform detection")
                        return self._get_local_platform_info()
        except Exception as e:
            logger.error(f"Error getting platform info from service: {str(e)}")
            # Fallback to local platform detection
            return self._get_local_platform_info()
    
    def _get_local_platform_info(self) -> Dict[str, Any]:
        """Get platform information locally as fallback"""
        import psutil
        
        try:
            return {
                "os_type": py_platform.system(),
                "os_version": py_platform.version(),
                "architecture": py_platform.machine(),
                "hostname": py_platform.node(),
                "username": os.getlogin(),
                "cpu_cores": psutil.cpu_count(logical=True),
                "memory_total": psutil.virtual_memory().total
            }
        except Exception as e:
            logger.error(f"Error getting local platform info: {str(e)}")
            return {
                "os_type": "Unknown",
                "os_version": "Unknown",
                "architecture": "Unknown",
                "hostname": "unknown",
                "username": "unknown",
                "cpu_cores": 1,
                "memory_total": 0
            }
    
    async def capture_screenshot(self, save_path: Optional[str] = None) -> Dict[str, Any]:
        """Capture a screenshot using the OS Integration Service"""
        try:
            params = {}
            if save_path:
                params["save_path"] = save_path
                
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/api/screenshot",
                    params=params,
                    timeout=self.timeout
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "status": "success",
                            "image_data": data.get("image_data"),
                            "image_path": data.get("image_path"),
                            "width": data.get("width"),
                            "height": data.get("height")
                        }
                    else:
                        return {
                            "status": "error",
                            "error": f"Failed to capture screenshot: {response.status}"
                        }
        except Exception as e:
            logger.error(f"Error capturing screenshot: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def list_processes(self) -> Dict[str, Any]:
        """List running processes using the OS Integration Service"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/api/process",
                    timeout=self.timeout
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "status": "success",
                            "processes": data.get("processes", [])
                        }
                    else:
                        return {
                            "status": "error",
                            "error": f"Failed to list processes: {response.status}"
                        }
        except Exception as e:
            logger.error(f"Error listing processes: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def list_directory(self, path: str) -> Dict[str, Any]:
        """List directory contents using the OS Integration Service"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/api/filesystem",
                    params={"path": path},
                    timeout=self.timeout
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "status": "success",
                            "entries": data.get("entries", []),
                            "path": data.get("path")
                        }
                    else:
                        return {
                            "status": "error",
                            "error": f"Failed to list directory: {response.status}"
                        }
        except Exception as e:
            logger.error(f"Error listing directory: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def get_system_resources(self) -> Dict[str, Any]:
        """Get system resource usage information"""
        try:
            # This is a custom endpoint we'll need to add to the OS Integration Service
            # For now, we'll simulate it with local data if the endpoint doesn't exist
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/api/resources",
                    timeout=self.timeout
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "status": "success",
                            "resources": data
                        }
                    else:
                        # Fallback to local resource monitoring
                        return {
                            "status": "success",
                            "resources": self._get_local_resources(),
                            "source": "local_fallback"
                        }
        except Exception as e:
            logger.error(f"Error getting system resources: {str(e)}")
            # Fallback to local resource monitoring
            return {
                "status": "success",
                "resources": self._get_local_resources(),
                "source": "local_fallback"
            }
    
    def _get_local_resources(self) -> Dict[str, Any]:
        """Get local system resource usage as fallback"""
        import psutil
        
        try:
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                "cpu": {
                    "percent": cpu_percent,
                    "cores": psutil.cpu_count(logical=True)
                },
                "memory": {
                    "total": memory.total,
                    "available": memory.available,
                    "percent": memory.percent
                },
                "disk": {
                    "total": disk.total,
                    "free": disk.free,
                    "percent": disk.percent
                }
            }
        except Exception as e:
            logger.error(f"Error getting local resources: {str(e)}")
            return {
                "error": str(e)
            }
