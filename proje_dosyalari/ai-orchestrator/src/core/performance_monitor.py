"""
Performance monitoring and optimization module for AI Orchestrator.

This module provides functionality for monitoring and optimizing AI model performance:
- Resource usage tracking (memory, GPU)
- Inference latency monitoring
- Automatic model scaling
- Load balancing
"""
import os
import logging
import asyncio
import time
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
import json
from pathlib import Path
import psutil
try:
    import torch
except ImportError:
    torch = None

from ..models.model import ModelType
from ..core.config import settings

logger = logging.getLogger(__name__)

class PerformanceMonitor:
    """
    Monitor and optimize AI model performance.
    """
    def __init__(self):
        """Initialize the performance monitor."""
        self.stats_dir = Path("./stats")
        self.stats_dir.mkdir(exist_ok=True)
        self.stats_file = self.stats_dir / "performance_stats.json"
        self.model_stats: Dict[str, Dict[str, Any]] = {}
        self.system_stats: Dict[str, Any] = {}
        self.stats_lock = asyncio.Lock()
        self.monitoring_interval = 60  # seconds
        self.monitoring_task = None
        self.is_monitoring = False
        
        # Initialize stats
        self._init_stats()
        
    def _init_stats(self):
        """Initialize performance statistics."""
        logger.info("Initializing performance statistics")
        
        # Load existing stats if available
        if self.stats_file.exists():
            try:
                with open(self.stats_file, "r") as f:
                    stats_data = json.load(f)
                    self.model_stats = stats_data.get("model_stats", {})
                    self.system_stats = stats_data.get("system_stats", {})
                logger.info(f"Loaded performance statistics for {len(self.model_stats)} models")
            except Exception as e:
                logger.error(f"Error loading performance statistics: {str(e)}")
                self.model_stats = {}
                self.system_stats = {}
        
        # Initialize system stats
        self.system_stats.update({
            "last_updated": datetime.now().isoformat(),
            "cpu_count": psutil.cpu_count(),
            "memory_total": psutil.virtual_memory().total,
            "gpu_available": torch is not None and torch.cuda.is_available(),
            "gpu_count": torch.cuda.device_count() if torch is not None and torch.cuda.is_available() else 0,
            "gpu_memory_total": [torch.cuda.get_device_properties(i).total_memory for i in range(torch.cuda.device_count())] if torch is not None and torch.cuda.is_available() else [],
            "monitoring_interval": self.monitoring_interval
        })
    
    async def start_monitoring(self):
        """Start performance monitoring."""
        if self.is_monitoring:
            logger.info("Performance monitoring already running")
            return
            
        logger.info("Starting performance monitoring")
        self.is_monitoring = True
        self.monitoring_task = asyncio.create_task(self._monitoring_loop())
    
    async def stop_monitoring(self):
        """Stop performance monitoring."""
        if not self.is_monitoring:
            logger.info("Performance monitoring not running")
            return
            
        logger.info("Stopping performance monitoring")
        self.is_monitoring = False
        if self.monitoring_task:
            self.monitoring_task.cancel()
            try:
                await self.monitoring_task
            except asyncio.CancelledError:
                pass
            self.monitoring_task = None
    
    async def _monitoring_loop(self):
        """Background monitoring loop."""
        try:
            while self.is_monitoring:
                await self._collect_system_stats()
                await asyncio.sleep(self.monitoring_interval)
        except asyncio.CancelledError:
            logger.info("Performance monitoring loop cancelled")
        except Exception as e:
            logger.error(f"Error in performance monitoring loop: {str(e)}")
            self.is_monitoring = False
    
    async def _collect_system_stats(self):
        """Collect system-wide performance statistics."""
        try:
            # Get CPU stats
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            
            # Get GPU stats if available
            gpu_stats = []
            if torch is not None and torch.cuda.is_available():
                for i in range(torch.cuda.device_count()):
                    # This is a placeholder - in a real implementation we would use
                    # nvidia-smi or similar to get actual GPU utilization
                    gpu_stats.append({
                        "device": i,
                        "name": torch.cuda.get_device_name(i),
                        "memory_allocated": torch.cuda.memory_allocated(i),
                        "memory_reserved": torch.cuda.memory_reserved(i),
                        "utilization": 0  # Placeholder
                    })
            
            # Update system stats
            async with self.stats_lock:
                self.system_stats.update({
                    "last_updated": datetime.now().isoformat(),
                    "cpu_percent": cpu_percent,
                    "memory_used": memory.used,
                    "memory_percent": memory.percent,
                    "gpu_stats": gpu_stats
                })
                
                # Save stats to file
                await self._save_stats()
                
            logger.debug(f"Collected system stats: CPU {cpu_percent}%, Memory {memory.percent}%")
            
        except Exception as e:
            logger.error(f"Error collecting system stats: {str(e)}")
    
    async def record_inference_stats(self, model_id: str, latency_ms: float, memory_usage: Optional[int] = None, success: bool = True):
        """
        Record inference statistics for a model.
        
        Args:
            model_id: ID of the model
            latency_ms: Inference latency in milliseconds
            memory_usage: Memory usage in bytes (optional)
            success: Whether inference was successful
        """
        async with self.stats_lock:
            # Initialize model stats if not exists
            if model_id not in self.model_stats:
                self.model_stats[model_id] = {
                    "inference_count": 0,
                    "success_count": 0,
                    "failure_count": 0,
                    "total_latency_ms": 0,
                    "avg_latency_ms": 0,
                    "min_latency_ms": float('inf'),
                    "max_latency_ms": 0,
                    "last_inference": None,
                    "memory_usage": None,
                    "latency_history": []
                }
            
            # Update stats
            stats = self.model_stats[model_id]
            stats["inference_count"] += 1
            if success:
                stats["success_count"] += 1
            else:
                stats["failure_count"] += 1
                
            stats["total_latency_ms"] += latency_ms
            stats["avg_latency_ms"] = stats["total_latency_ms"] / stats["inference_count"]
            stats["min_latency_ms"] = min(stats["min_latency_ms"], latency_ms)
            stats["max_latency_ms"] = max(stats["max_latency_ms"], latency_ms)
            stats["last_inference"] = datetime.now().isoformat()
            
            if memory_usage is not None:
                stats["memory_usage"] = memory_usage
                
            # Keep a history of recent latencies (last 100)
            stats["latency_history"].append({
                "timestamp": datetime.now().isoformat(),
                "latency_ms": latency_ms,
                "success": success
            })
            if len(stats["latency_history"]) > 100:
                stats["latency_history"] = stats["latency_history"][-100:]
                
            # Save stats to file
            await self._save_stats()
    
    async def _save_stats(self):
        """Save performance statistics to file."""
        try:
            stats_data = {
                "timestamp": datetime.now().isoformat(),
                "model_stats": self.model_stats,
                "system_stats": self.system_stats
            }
            
            # Write to temporary file first
            temp_file = self.stats_file.with_suffix(".tmp")
            with open(temp_file, "w") as f:
                json.dump(stats_data, f, indent=2)
                
            # Rename to actual file
            temp_file.replace(self.stats_file)
            
        except Exception as e:
            logger.error(f"Error saving performance statistics: {str(e)}")
    
    async def get_model_stats(self, model_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get performance statistics for a model or all models.
        
        Args:
            model_id: ID of the model (optional, if None returns all models)
            
        Returns:
            Dictionary of model statistics
        """
        async with self.stats_lock:
            if model_id:
                return self.model_stats.get(model_id, {})
            else:
                return self.model_stats
    
    async def get_system_stats(self) -> Dict[str, Any]:
        """
        Get system-wide performance statistics.
        
        Returns:
            Dictionary of system statistics
        """
        async with self.stats_lock:
            return self.system_stats
    
    async def optimize_model_allocation(self, available_models: List[str], active_models: List[str]) -> List[str]:
        """
        Optimize model allocation based on performance statistics.
        
        Args:
            available_models: List of all available model IDs
            active_models: List of currently active model IDs
            
        Returns:
            List of recommended model IDs to load
        """
        # This is a placeholder for a more sophisticated optimization algorithm
        # In a real implementation, we would consider:
        # - Model usage patterns
        # - Available resources (memory, GPU)
        # - Model performance characteristics
        # - Load balancing requirements
        
        async with self.stats_lock:
            # Get system resources
            memory_available = psutil.virtual_memory().available
            gpu_memory_available = []
            if torch is not None and torch.cuda.is_available():
                for i in range(torch.cuda.device_count()):
                    total = torch.cuda.get_device_properties(i).total_memory
                    allocated = torch.cuda.memory_allocated(i)
                    gpu_memory_available.append(total - allocated)
            
            # Sort models by usage frequency
            model_usage = []
            for model_id in available_models:
                stats = self.model_stats.get(model_id, {})
                inference_count = stats.get("inference_count", 0)
                last_inference = stats.get("last_inference")
                
                # Calculate a score based on usage
                # Higher score = higher priority for loading
                score = inference_count
                
                # Boost score for recently used models
                if last_inference:
                    last_time = datetime.fromisoformat(last_inference)
                    time_diff = datetime.now() - last_time
                    if time_diff < timedelta(hours=1):
                        score *= 2
                    elif time_diff < timedelta(hours=24):
                        score *= 1.5
                
                model_usage.append((model_id, score))
            
            # Sort by score (descending)
            model_usage.sort(key=lambda x: x[1], reverse=True)
            
            # For now, just return the top N models based on available resources
            # This is a very simplistic approach
            max_models = 5  # Placeholder
            recommended_models = [model_id for model_id, _ in model_usage[:max_models]]
            
            logger.info(f"Recommended models to load: {recommended_models}")
            return recommended_models


# Singleton instance
_performance_monitor = None

def get_performance_monitor() -> PerformanceMonitor:
    """
    Get or create the performance monitor instance.
    
    Returns:
        PerformanceMonitor instance
    """
    global _performance_monitor
    if _performance_monitor is None:
        _performance_monitor = PerformanceMonitor()
    return _performance_monitor
