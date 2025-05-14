"""
Integration module for AI Orchestrator and OS Integration Service

This module provides the integration layer between the AI Orchestrator and
the OS Integration Service, enabling AI models to interact with the operating system.
"""

import logging
import asyncio
from typing import Dict, Any, Optional, List, Union
import os
import base64
from datetime import datetime

from ..config import config
from .os_integration_enhanced import EnhancedOSIntegrationClient

logger = logging.getLogger("ai_orchestrator.integration.os_integration")

class OSIntegrationManager:
    """Manager for OS Integration features in AI Orchestrator"""
    
    def __init__(self):
        """Initialize the OS Integration Manager"""
        self.client = EnhancedOSIntegrationClient(
            base_url=config.get("services.os_integration.url"),
            timeout=config.get("services.os_integration.timeout", 30)
        )
        self.initialized = False
        self.platform_info = None
        self.resource_monitor_task = None
        self.resource_data = []
        self.resource_monitoring_active = False
    
    async def initialize(self) -> bool:
        """Initialize the OS Integration Manager"""
        try:
            logger.info("Initializing OS Integration Manager")
            self.initialized = await self.client.initialize()
            
            if self.initialized:
                self.platform_info = await self.client.get_platform_info()
                logger.info(f"OS Integration Manager initialized for {self.platform_info.get('os_type', 'unknown')} platform")
            else:
                logger.warning("OS Integration Manager initialization failed")
                
            return self.initialized
        except Exception as e:
            logger.error(f"Error initializing OS Integration Manager: {str(e)}")
            return False
    
    async def get_platform_info(self) -> Dict[str, Any]:
        """Get platform information"""
        if not self.initialized:
            await self.initialize()
            
        if self.platform_info:
            return self.platform_info
        else:
            return await self.client.get_platform_info()
    
    async def capture_screenshot(self, save_dir: Optional[str] = None) -> Dict[str, Any]:
        """Capture a screenshot of the current desktop"""
        if not self.initialized:
            await self.initialize()
        
        # Generate a filename based on timestamp if save_dir is provided
        save_path = None
        if save_dir:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            save_path = os.path.join(save_dir, f"screenshot_{timestamp}.png")
        
        result = await self.client.capture_screenshot(save_path)
        
        # If we have image data but no path (service didn't save it), save it locally
        if result.get("status") == "success" and result.get("image_data") and not result.get("image_path") and save_dir:
            try:
                image_data = base64.b64decode(result["image_data"])
                with open(save_path, "wb") as f:
                    f.write(image_data)
                result["image_path"] = save_path
                logger.info(f"Screenshot saved locally to {save_path}")
            except Exception as e:
                logger.error(f"Error saving screenshot locally: {str(e)}")
        
        return result
    
    async def list_processes(self) -> Dict[str, Any]:
        """List running processes on the system"""
        if not self.initialized:
            await self.initialize()
            
        return await self.client.list_processes()
    
    async def list_directory(self, path: str) -> Dict[str, Any]:
        """List contents of a directory"""
        if not self.initialized:
            await self.initialize()
            
        return await self.client.list_directory(path)
    
    async def get_system_resources(self) -> Dict[str, Any]:
        """Get current system resource usage"""
        if not self.initialized:
            await self.initialize()
            
        return await self.client.get_system_resources()
    
    async def start_resource_monitoring(self, interval_seconds: int = 5, max_samples: int = 100) -> bool:
        """Start monitoring system resources at regular intervals"""
        if self.resource_monitoring_active:
            logger.warning("Resource monitoring is already active")
            return True
            
        if not self.initialized:
            await self.initialize()
        
        try:
            self.resource_monitoring_active = True
            self.resource_monitor_task = asyncio.create_task(
                self._resource_monitor_loop(interval_seconds, max_samples)
            )
            logger.info(f"Started resource monitoring with interval {interval_seconds}s")
            return True
        except Exception as e:
            logger.error(f"Error starting resource monitoring: {str(e)}")
            self.resource_monitoring_active = False
            return False
    
    async def stop_resource_monitoring(self) -> bool:
        """Stop monitoring system resources"""
        if not self.resource_monitoring_active:
            logger.warning("Resource monitoring is not active")
            return True
            
        try:
            self.resource_monitoring_active = False
            if self.resource_monitor_task:
                self.resource_monitor_task.cancel()
                try:
                    await self.resource_monitor_task
                except asyncio.CancelledError:
                    pass
                self.resource_monitor_task = None
            logger.info("Stopped resource monitoring")
            return True
        except Exception as e:
            logger.error(f"Error stopping resource monitoring: {str(e)}")
            return False
    
    async def _resource_monitor_loop(self, interval_seconds: int, max_samples: int) -> None:
        """Background task to monitor system resources"""
        try:
            while self.resource_monitoring_active:
                try:
                    resources = await self.get_system_resources()
                    if resources.get("status") == "success":
                        timestamp = datetime.now().isoformat()
                        sample = {
                            "timestamp": timestamp,
                            "resources": resources.get("resources", {})
                        }
                        self.resource_data.append(sample)
                        
                        # Limit the number of samples stored
                        if len(self.resource_data) > max_samples:
                            self.resource_data.pop(0)
                except Exception as e:
                    logger.error(f"Error in resource monitoring loop: {str(e)}")
                
                await asyncio.sleep(interval_seconds)
        except asyncio.CancelledError:
            logger.info("Resource monitoring task cancelled")
            raise
        except Exception as e:
            logger.error(f"Resource monitoring loop terminated with error: {str(e)}")
            self.resource_monitoring_active = False
    
    def get_resource_history(self) -> List[Dict[str, Any]]:
        """Get the history of resource usage samples"""
        return self.resource_data
    
    async def cleanup(self) -> None:
        """Clean up resources"""
        logger.info("Cleaning up OS Integration Manager resources")
        await self.stop_resource_monitoring()
        self.resource_data = []
        self.initialized = False
