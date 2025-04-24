"""
Integration Module for ALT_LAS Segmentation Service

This module provides integration capabilities for the Segmentation Service,
including clients for communicating with other services in the ALT_LAS ecosystem.
"""

import json
import logging
import aiohttp
import asyncio
from typing import Dict, List, Any, Optional, Union
from datetime import datetime

# Configure logging
logger = logging.getLogger('integration_module')

class ServiceClient:
    """Base class for service clients"""
    
    def __init__(self, base_url: str, timeout: int = 10):
        """
        Initialize the service client
        
        Args:
            base_url: Base URL of the service
            timeout: Request timeout in seconds
        """
        self.base_url = base_url
        self.timeout = timeout
        self.session = None
    
    async def _ensure_session(self):
        """Ensure aiohttp session exists"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=self.timeout)
            )
    
    async def _close_session(self):
        """Close aiohttp session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def get(self, path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Send GET request to service
        
        Args:
            path: Request path
            params: Query parameters
            
        Returns:
            Response data
        """
        await self._ensure_session()
        url = f"{self.base_url.rstrip('/')}/{path.lstrip('/')}"
        
        try:
            async with self.session.get(url, params=params) as response:
                response.raise_for_status()
                return await response.json()
        except aiohttp.ClientError as e:
            logger.error(f"GET request to {url} failed: {str(e)}")
            raise
    
    async def post(self, path: str, data: Any) -> Dict[str, Any]:
        """
        Send POST request to service
        
        Args:
            path: Request path
            data: Request data
            
        Returns:
            Response data
        """
        await self._ensure_session()
        url = f"{self.base_url.rstrip('/')}/{path.lstrip('/')}"
        
        try:
            async with self.session.post(url, json=data) as response:
                response.raise_for_status()
                return await response.json()
        except aiohttp.ClientError as e:
            logger.error(f"POST request to {url} failed: {str(e)}")
            raise
    
    async def check_health(self) -> Dict[str, Any]:
        """
        Check service health
        
        Returns:
            Health status
        """
        try:
            return await self.get("health")
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return {"status": "down", "error": str(e)}

class AIOrchestrator(ServiceClient):
    """Client for AI Orchestrator service"""
    
    async def process_llm(self, input_text: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Process text using LLM
        
        Args:
            input_text: Input text
            parameters: Processing parameters
            
        Returns:
            Processing result
        """
        data = {
            "input": input_text,
            "parameters": parameters or {}
        }
        return await self.post("llm", data)
    
    async def process_vision(self, input_data: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Process image using Vision model
        
        Args:
            input_data: Input image data (base64 encoded)
            parameters: Processing parameters
            
        Returns:
            Processing result
        """
        data = {
            "input": input_data,
            "parameters": parameters or {}
        }
        return await self.post("vision", data)
    
    async def get_models_info(self) -> Dict[str, Any]:
        """
        Get information about available models
        
        Returns:
            Models information
        """
        return await self.get("models")

class RunnerService(ServiceClient):
    """Client for Runner service"""
    
    async def execute_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a task
        
        Args:
            task_data: Task data
            
        Returns:
            Execution result
        """
        return await self.post("execute", task_data)
    
    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """
        Get task status
        
        Args:
            task_id: Task ID
            
        Returns:
            Task status
        """
        return await self.get(f"tasks/{task_id}")
    
    async def cancel_task(self, task_id: str) -> Dict[str, Any]:
        """
        Cancel a task
        
        Args:
            task_id: Task ID
            
        Returns:
            Cancellation result
        """
        return await self.post(f"tasks/{task_id}/cancel", {})

class OSIntegrationService(ServiceClient):
    """Client for OS Integration service"""
    
    async def get_platform_info(self) -> Dict[str, Any]:
        """
        Get platform information
        
        Returns:
            Platform information
        """
        return await self.get("api/platform")
    
    async def list_directory(self, path: str) -> Dict[str, Any]:
        """
        List directory contents
        
        Args:
            path: Directory path
            
        Returns:
            Directory contents
        """
        return await self.get("api/filesystem", {"path": path})
    
    async def list_processes(self) -> Dict[str, Any]:
        """
        List running processes
        
        Returns:
            Process list
        """
        return await self.get("api/process")
    
    async def capture_screenshot(self) -> Dict[str, Any]:
        """
        Capture screenshot
        
        Returns:
            Screenshot data
        """
        return await self.get("api/screenshot")

class ServiceRegistry:
    """Registry for service clients"""
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the service registry
        
        Args:
            config: Service configuration
        """
        self.config = config
        self.services = {}
    
    def get_ai_orchestrator(self) -> AIOrchestrator:
        """
        Get AI Orchestrator client
        
        Returns:
            AI Orchestrator client
        """
        if "ai_orchestrator" not in self.services:
            base_url = self.config.get("ai_orchestrator_url", "http://ai-orchestrator:8080")
            timeout = self.config.get("ai_orchestrator_timeout", 30)
            self.services["ai_orchestrator"] = AIOrchestrator(base_url, timeout)
        
        return self.services["ai_orchestrator"]
    
    def get_runner_service(self) -> RunnerService:
        """
        Get Runner service client
        
        Returns:
            Runner service client
        """
        if "runner_service" not in self.services:
            base_url = self.config.get("runner_service_url", "http://runner-service:8080")
            timeout = self.config.get("runner_service_timeout", 30)
            self.services["runner_service"] = RunnerService(base_url, timeout)
        
        return self.services["runner_service"]
    
    def get_os_integration_service(self) -> OSIntegrationService:
        """
        Get OS Integration service client
        
        Returns:
            OS Integration service client
        """
        if "os_integration_service" not in self.services:
            base_url = self.config.get("os_integration_service_url", "http://os-integration-service:8080")
            timeout = self.config.get("os_integration_service_timeout", 30)
            self.services["os_integration_service"] = OSIntegrationService(base_url, timeout)
        
        return self.services["os_integration_service"]
    
    async def check_all_services(self) -> Dict[str, Dict[str, Any]]:
        """
        Check health of all services
        
        Returns:
            Health status of all services
        """
        results = {}
        
        # Get all services
        ai_orchestrator = self.get_ai_orchestrator()
        runner_service = self.get_runner_service()
        os_integration_service = self.get_os_integration_service()
        
        # Check health in parallel
        tasks = [
            asyncio.create_task(ai_orchestrator.check_health()),
            asyncio.create_task(runner_service.check_health()),
            asyncio.create_task(os_integration_service.check_health())
        ]
        
        # Wait for all tasks to complete
        health_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        results["ai_orchestrator"] = health_results[0] if not isinstance(health_results[0], Exception) else {"status": "down", "error": str(health_results[0])}
        results["runner_service"] = health_results[1] if not isinstance(health_results[1], Exception) else {"status": "down", "error": str(health_results[1])}
        results["os_integration_service"] = health_results[2] if not isinstance(health_results[2], Exception) else {"status": "down", "error": str(health_results[2])}
        
        return results
    
    async def close_all(self):
        """Close all service clients"""
        for service in self.services.values():
            await service._close_session()

# Create a global instance with default config
service_registry = ServiceRegistry({})

# Function to get the service registry instance
def get_service_registry(config: Optional[Dict[str, Any]] = None) -> ServiceRegistry:
    """
    Get the service registry instance
    
    Args:
        config: Service configuration
        
    Returns:
        Service registry instance
    """
    global service_registry
    if config is not None:
        service_registry = ServiceRegistry(config)
    return service_registry

# Main function for testing
if __name__ == "__main__":
    async def test_services():
        # Create registry with test config
        registry = ServiceRegistry({
            "ai_orchestrator_url": "http://localhost:8080",
            "runner_service_url": "http://localhost:8081",
            "os_integration_service_url": "http://localhost:8082"
        })
        
        # Check all services
        try:
            health_status = await registry.check_all_services()
            print(f"Health status: {json.dumps(health_status, indent=2)}")
        except Exception as e:
            print(f"Error checking services: {str(e)}")
        
        # Close all connections
        await registry.close_all()
    
    # Run the test
    asyncio.run(test_services())
