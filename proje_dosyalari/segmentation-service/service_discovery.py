"""
Service Discovery Module for Segmentation Service

This module provides service registration and discovery capabilities
for the Segmentation Service to interact with other microservices.
"""

import os
import json
import logging
import asyncio
import socket
import time
from typing import Dict, Any, List, Optional, Union, Callable
import uuid
import aiohttp
from fastapi import HTTPException

logger = logging.getLogger("segmentation_service.service_discovery")

class ServiceRegistry:
    """Service registry for microservice discovery and registration"""
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize the service registry
        
        Args:
            config: Configuration dictionary with service registry settings
        """
        self.config = config
        self.registry_url = config.get("service_registry_url", "http://service-registry:8080")
        self.service_id = f"segmentation-service-{uuid.uuid4().hex[:8]}"
        self.service_name = "segmentation-service"
        self.version = config.get("version", "1.0.0")
        self.http_endpoint = config.get("http_endpoint", f"http://{self._get_hostname()}:8080")
        self.grpc_endpoint = config.get("grpc_endpoint", f"grpc://{self._get_hostname()}:9090")
        self.health_check_path = config.get("health_check_path", "/api/v1/health")
        self.health_check_interval = config.get("health_check_interval", 30)
        self.health_check_timeout = config.get("health_check_timeout", 5)
        self.metadata = config.get("metadata", {
            "capabilities": ["text-segmentation", "alt-file-processing"],
            "supported_languages": ["en", "tr"]
        })
        self.registered = False
        self.services_cache = {}
        self.services_cache_timestamp = 0
        self.services_cache_ttl = config.get("services_cache_ttl", 60)  # seconds
        self.heartbeat_task = None
        self.session = None
    
    def _get_hostname(self) -> str:
        """Get the hostname of the current service
        
        Returns:
            str: Hostname or IP address
        """
        try:
            return socket.gethostname()
        except:
            return "localhost"
    
    async def initialize(self) -> bool:
        """Initialize the service registry client
        
        Returns:
            bool: True if initialization was successful
        """
        try:
            logger.info("Initializing service registry client")
            self.session = aiohttp.ClientSession()
            
            # Check if registry is available
            try:
                async with self.session.get(f"{self.registry_url}/health", timeout=5) as response:
                    if response.status == 200:
                        logger.info("Service registry is available")
                    else:
                        logger.warning(f"Service registry returned status {response.status}")
            except Exception as e:
                logger.warning(f"Service registry health check failed: {str(e)}")
                # Continue anyway, as registry might become available later
            
            # Start heartbeat task
            self.heartbeat_task = asyncio.create_task(self._heartbeat_loop())
            
            return True
        except Exception as e:
            logger.error(f"Error initializing service registry client: {str(e)}")
            return False
    
    async def register_service(self) -> bool:
        """Register this service with the service registry
        
        Returns:
            bool: True if registration was successful
        """
        if not self.session:
            await self.initialize()
            
        try:
            registration_data = {
                "service_id": self.service_id,
                "service_name": self.service_name,
                "version": self.version,
                "endpoints": {
                    "http": self.http_endpoint,
                    "grpc": self.grpc_endpoint
                },
                "health_check": {
                    "http": self.health_check_path,
                    "interval_seconds": self.health_check_interval,
                    "timeout_seconds": self.health_check_timeout
                },
                "metadata": self.metadata
            }
            
            logger.info(f"Registering service: {self.service_name}")
            
            try:
                async with self.session.post(
                    f"{self.registry_url}/services",
                    json=registration_data,
                    timeout=10
                ) as response:
                    if response.status in (200, 201):
                        self.registered = True
                        logger.info(f"Service registered successfully: {self.service_id}")
                        return True
                    else:
                        logger.warning(f"Service registration failed with status {response.status}")
                        return False
            except Exception as e:
                logger.error(f"Error during service registration: {str(e)}")
                # If registry is not available, register locally
                self.registered = True  # Pretend we're registered for local development
                logger.info("Service registered locally (registry unavailable)")
                return True
                
        except Exception as e:
            logger.error(f"Error registering service: {str(e)}")
            return False
    
    async def deregister_service(self) -> bool:
        """Deregister this service from the service registry
        
        Returns:
            bool: True if deregistration was successful
        """
        if not self.session or not self.registered:
            return True
            
        try:
            logger.info(f"Deregistering service: {self.service_id}")
            
            try:
                async with self.session.delete(
                    f"{self.registry_url}/services/{self.service_id}",
                    timeout=10
                ) as response:
                    if response.status in (200, 204):
                        self.registered = False
                        logger.info("Service deregistered successfully")
                        return True
                    else:
                        logger.warning(f"Service deregistration failed with status {response.status}")
                        return False
            except Exception as e:
                logger.error(f"Error during service deregistration: {str(e)}")
                self.registered = False  # Consider it deregistered anyway
                return True
                
        except Exception as e:
            logger.error(f"Error deregistering service: {str(e)}")
            return False
    
    async def discover_service(self, service_name: str) -> Optional[Dict[str, Any]]:
        """Discover a service by name
        
        Args:
            service_name: Name of the service to discover
            
        Returns:
            Optional[Dict[str, Any]]: Service information or None if not found
        """
        if not self.session:
            await self.initialize()
            
        # Check cache first
        if service_name in self.services_cache:
            service_info = self.services_cache[service_name]
            cache_age = time.time() - self.services_cache_timestamp
            
            if cache_age < self.services_cache_ttl:
                logger.debug(f"Using cached service info for {service_name}")
                return service_info
        
        try:
            logger.info(f"Discovering service: {service_name}")
            
            try:
                async with self.session.get(
                    f"{self.registry_url}/services/{service_name}",
                    timeout=10
                ) as response:
                    if response.status == 200:
                        service_info = await response.json()
                        
                        # Update cache
                        self.services_cache[service_name] = service_info
                        self.services_cache_timestamp = time.time()
                        
                        logger.info(f"Service discovered: {service_name}")
                        return service_info
                    elif response.status == 404:
                        logger.warning(f"Service not found: {service_name}")
                        return None
                    else:
                        logger.warning(f"Service discovery failed with status {response.status}")
                        return None
            except Exception as e:
                logger.error(f"Error during service discovery: {str(e)}")
                
                # If registry is not available, use fallback configuration
                if service_name in self.config:
                    logger.info(f"Using fallback configuration for {service_name}")
                    return self.config[service_name]
                
                return None
                
        except Exception as e:
            logger.error(f"Error discovering service: {str(e)}")
            return None
    
    async def discover_all_services(self) -> List[Dict[str, Any]]:
        """Discover all available services
        
        Returns:
            List[Dict[str, Any]]: List of service information
        """
        if not self.session:
            await self.initialize()
            
        # Check if cache is fresh enough
        cache_age = time.time() - self.services_cache_timestamp
        if self.services_cache and cache_age < self.services_cache_ttl:
            logger.debug("Using cached services list")
            return list(self.services_cache.values())
        
        try:
            logger.info("Discovering all services")
            
            try:
                async with self.session.get(
                    f"{self.registry_url}/services",
                    timeout=10
                ) as response:
                    if response.status == 200:
                        services = await response.json()
                        
                        # Update cache
                        self.services_cache = {
                            service["service_name"]: service
                            for service in services
                        }
                        self.services_cache_timestamp = time.time()
                        
                        logger.info(f"Discovered {len(services)} services")
                        return services
                    else:
                        logger.warning(f"Service discovery failed with status {response.status}")
                        return []
            except Exception as e:
                logger.error(f"Error during service discovery: {str(e)}")
                
                # If registry is not available, use fallback configuration
                if "services" in self.config:
                    logger.info("Using fallback configuration for services")
                    return self.config["services"]
                
                return []
                
        except Exception as e:
            logger.error(f"Error discovering services: {str(e)}")
            return []
    
    async def get_service_endpoint(self, service_name: str, endpoint_type: str = "http") -> Optional[str]:
        """Get a service endpoint by name and type
        
        Args:
            service_name: Name of the service
            endpoint_type: Type of endpoint (http, grpc, etc.)
            
        Returns:
            Optional[str]: Service endpoint URL or None if not found
        """
        service_info = await self.discover_service(service_name)
        
        if not service_info:
            return None
            
        endpoints = service_info.get("endpoints", {})
        return endpoints.get(endpoint_type)
    
    async def _heartbeat_loop(self) -> None:
        """Background task to send heartbeats to the service registry"""
        try:
            while True:
                if not self.registered:
                    await self.register_service()
                else:
                    try:
                        if self.session:
                            async with self.session.put(
                                f"{self.registry_url}/services/{self.service_id}/heartbeat",
                                timeout=5
                            ) as response:
                                if response.status != 200:
                                    logger.warning(f"Heartbeat failed with status {response.status}")
                                    self.registered = False
                    except Exception as e:
                        logger.warning(f"Error sending heartbeat: {str(e)}")
                        # Don't set registered to False here to avoid excessive re-registrations
                
                await asyncio.sleep(self.health_check_interval)
        except asyncio.CancelledError:
            logger.info("Heartbeat task cancelled")
            raise
        except Exception as e:
            logger.error(f"Heartbeat loop terminated with error: {str(e)}")
    
    async def cleanup(self) -> None:
        """Clean up resources"""
        logger.info("Cleaning up service registry client")
        
        if self.heartbeat_task:
            self.heartbeat_task.cancel()
            try:
                await self.heartbeat_task
            except asyncio.CancelledError:
                pass
            
        await self.deregister_service()
        
        if self.session:
            await self.session.close()
            self.session = None


class ServiceClient:
    """Base client for interacting with other microservices"""
    
    def __init__(self, service_name: str, registry: ServiceRegistry, endpoint_type: str = "http"):
        """Initialize the service client
        
        Args:
            service_name: Name of the target service
            registry: Service registry instance
            endpoint_type: Type of endpoint to use (http, grpc)
        """
        self.service_name = service_name
        self.registry = registry
        self.endpoint_type = endpoint_type
        self.base_url = None
        self.session = None
    
    async def initialize(self) -> bool:
        """Initialize the service client
        
        Returns:
            bool: True if initialization was successful
        """
        try:
            logger.info(f"Initializing client for {self.service_name}")
            
            # Discover service endpoint
            self.base_url = await self.registry.get_service_endpoint(
                self.service_name, self.endpoint_type
            )
            
            if not self.base_url:
                logger.warning(f"Could not discover {self.service_name} endpoint")
                return False
                
            self.session = aiohttp.ClientSession()
            logger.info(f"Client initialized for {self.service_name} at {self.base_url}")
            return True
        except Exception as e:
            logger.error(f"Error initializing client for {self.service_name}: {str(e)}")
            return False
    
    async def get(self, path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Send a GET request to the service
        
        Args:
            path: API path
            params: Query parameters
            
        Returns:
            Dict[str, Any]: Response data
            
        Raises:
            HTTPException: If the request fails
        """
        if not self.session:
            await self.initialize()
            
        if not self.base_url:
            raise HTTPException(status_code=503, detail=f"Service {self.service_name} not available")
            
        try:
            url = f"{self.base_url}{path}"
            logger.debug(f"GET {url}")
            
            async with self.session.get(url, params=params, timeout=30) as response:
                response.raise_for_status()
                return await response.json()
        except aiohttp.ClientResponseError as e:
            logger.error(f"HTTP error during GET {path}: {e.status} {e.message}")
            raise HTTPException(status_code=e.status, detail=e.message)
        except Exception as e:
            logger.error(f"Error during GET {path}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def post(self, path: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Send a POST request to the service
        
        Args:
            path: API path
            data: Request data
            
        Returns:
            Dict[str, Any]: Response data
            
        Raises:
            HTTPException: If the request fails
        """
        if not self.session:
            await self.initialize()
            
        if not self.base_url:
            raise HTTPException(status_code=503, detail=f"Service {self.service_name} not available")
            
        try:
            url = f"{self.base_url}{path}"
            logger.debug(f"POST {url}")
            
            async with self.session.post(url, json=data, timeout=30) as response:
                response.raise_for_status()
                return await response.json()
        except aiohttp.ClientResponseError as e:
            logger.error(f"HTTP error during POST {path}: {e.status} {e.message}")
            raise HTTPException(status_code=e.status, detail=e.message)
        except Exception as e:
            logger.error(f"Error during POST {path}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def cleanup(self) -> None:
        """Clean up resources"""
        logger.info(f"Cleaning up client for {self.service_name}")
        
        if self.session:
            await self.session.close()
            self.session = None


class AIOrchestrator(ServiceClient):
    """Client for interacting with the AI Orchestrator service"""
    
    def __init__(self, registry: ServiceRegistry):
        """Initialize the AI Orchestrator client
        
        Args:
            registry: Service registry instance
        """
        super().__init__("ai-orchestrator", registry)
    
    async def process_llm(self, text: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process text using the LLM model
        
        Args:
            text: Input text
            parameters: Processing parameters
            
        Returns:
            Dict[str, Any]: Processing result
        """
        data = {
            "input": text,
            "parameters": parameters or {}
        }
        return await self.post("/api/llm", data)
    
    async def process_vision(self, image_data: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process image using the Vision model
        
        Args:
            image_data: Base64 encoded image data
            parameters: Processing parameters
            
        Returns:
            Dict[str, Any]: Processing result
        """
        data = {
            "input": image_data,
            "parameters": parameters or {}
        }
        return await self.post("/api/vision", data)
    
    async def get_models_info(self) -> Dict[str, Any]:
        """Get information about available models
        
        Returns:
            Dict[str, Any]: Models information
        """
        return await self.get("/api/models/info")


class RunnerService(ServiceClient):
    """Client for interacting with the Runner service"""
    
    def __init__(self, registry: ServiceRegistry):
        """Initialize the Runner service client
        
        Args:
            registry: Service registry instance
        """
        super().__init__("runner-service", registry)
    
    async def execute_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a task
        
        Args:
            task_data: Task data
            
        Returns:
            Dict[str, Any]: Task execution result
        """
        return await self.post("/api/tasks", task_data)
    
    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Get task status
        
        Args:
            task_id: Task ID
            
        Returns:
            Dict[str, Any]: Task status
        """
        return await self.get(f"/api/tasks/{task_id}")


class ArchiveService(ServiceClient):
    """Client for interacting with the Archive service"""
    
    def __init__(self, registry: ServiceRegistry):
        """Initialize the Archive service client
        
        Args:
            registry: Service registry instance
        """
        super().__init__("archive-service", registry)
    
    async def store_result(self, result_data: Dict[str, Any]) -> Dict[str, Any]:
        """Store a result
        
        Args:
            result_data: Result data
            
        Returns:
            Dict[str, Any]: Storage result
        """
        return await self.post("/api/results", result_data)
    
    async def get_result(self, result_id: str) -> Dict[str, Any]:
        """Get a result
        
        Args:
            result_id: Result ID
            
        Returns:
            Dict[str, Any]: Result data
        """
        return await self.get(f"/api/results/{result_id}")
