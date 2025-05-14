"""
Model cache module for AI Orchestrator.

This module provides caching functionality for model outputs to improve performance
and reduce redundant computations.
"""
import os
import logging
import json
import hashlib
import asyncio
from typing import Dict, Any, Optional, Union, Tuple
from datetime import datetime, timedelta
from pathlib import Path
import pickle

from ..core.config import settings

logger = logging.getLogger(__name__)

class ModelCache:
    """
    Cache for model outputs to improve performance.
    """
    def __init__(self):
        """Initialize the model cache."""
        self.cache_dir = Path(settings.CACHE_DIR)
        self.cache_dir.mkdir(exist_ok=True)
        self.cache_size_limit = settings.CACHE_SIZE_LIMIT  # MB
        self.memory_cache: Dict[str, Dict[str, Any]] = {}
        self.cache_lock = asyncio.Lock()
        self.cache_stats = {
            "hits": 0,
            "misses": 0,
            "size_bytes": 0
        }
        
        # Initialize cache
        self._init_cache()
        
    def _init_cache(self):
        """Initialize cache and load metadata."""
        logger.info(f"Initializing model cache in {self.cache_dir}")
        
        # Create metadata file if it doesn't exist
        metadata_path = self.cache_dir / "metadata.json"
        if not metadata_path.exists():
            with open(metadata_path, "w") as f:
                json.dump({
                    "created_at": datetime.now().isoformat(),
                    "last_cleanup": None,
                    "entries": 0,
                    "size_bytes": 0
                }, f)
        
        # Load existing cache entries into memory (just metadata, not values)
        try:
            total_size = 0
            entries = 0
            
            for cache_file in self.cache_dir.glob("*.cache"):
                if cache_file.name == "metadata.json":
                    continue
                    
                # Get file size
                file_size = os.path.getsize(cache_file)
                total_size += file_size
                entries += 1
                
                # Extract key from filename
                key = cache_file.stem
                
                # Add to memory cache index (without loading value)
                self.memory_cache[key] = {
                    "path": str(cache_file),
                    "size": file_size,
                    "last_accessed": datetime.now().isoformat()
                }
            
            # Update cache stats
            self.cache_stats["size_bytes"] = total_size
            
            logger.info(f"Cache initialized with {entries} entries, total size: {total_size / (1024*1024):.2f} MB")
            
            # Run cleanup if needed
            if total_size > self.cache_size_limit * 1024 * 1024:
                asyncio.create_task(self.cleanup_cache())
                
        except Exception as e:
            logger.error(f"Error initializing cache: {str(e)}")
    
    def _generate_cache_key(self, model_id: str, inputs: Any, parameters: Dict[str, Any]) -> str:
        """
        Generate a cache key from model ID, inputs, and parameters.
        
        Args:
            model_id: ID of the model
            inputs: Model inputs
            parameters: Model parameters
            
        Returns:
            Cache key string
        """
        # Convert inputs to string if not already
        if not isinstance(inputs, str):
            inputs_str = str(inputs)
        else:
            inputs_str = inputs
            
        # Create a string representation of the request
        request_str = f"{model_id}:{inputs_str}:{json.dumps(parameters, sort_keys=True)}"
        
        # Generate hash
        return hashlib.md5(request_str.encode()).hexdigest()
    
    async def get(self, model_id: str, inputs: Any, parameters: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Get a cached result if available.
        
        Args:
            model_id: ID of the model
            inputs: Model inputs
            parameters: Model parameters
            
        Returns:
            Cached result or None if not found
        """
        cache_key = self._generate_cache_key(model_id, inputs, parameters)
        
        async with self.cache_lock:
            if cache_key in self.memory_cache:
                # Update access time
                self.memory_cache[cache_key]["last_accessed"] = datetime.now().isoformat()
                
                # Load from disk if not loaded
                if "value" not in self.memory_cache[cache_key]:
                    try:
                        cache_path = Path(self.memory_cache[cache_key]["path"])
                        with open(cache_path, "rb") as f:
                            cached_data = pickle.load(f)
                            self.memory_cache[cache_key]["value"] = cached_data
                    except Exception as e:
                        logger.error(f"Error loading cache entry {cache_key}: {str(e)}")
                        return None
                
                # Increment hit counter
                self.cache_stats["hits"] += 1
                
                logger.debug(f"Cache hit for {model_id}")
                return self.memory_cache[cache_key]["value"]
        
        # Increment miss counter
        self.cache_stats["misses"] += 1
        
        logger.debug(f"Cache miss for {model_id}")
        return None
    
    async def set(self, model_id: str, inputs: Any, parameters: Dict[str, Any], result: Dict[str, Any]) -> None:
        """
        Store a result in the cache.
        
        Args:
            model_id: ID of the model
            inputs: Model inputs
            parameters: Model parameters
            result: Result to cache
        """
        cache_key = self._generate_cache_key(model_id, inputs, parameters)
        cache_path = self.cache_dir / f"{cache_key}.cache"
        
        try:
            # Serialize result
            with open(cache_path, "wb") as f:
                pickle.dump(result, f)
                
            # Get file size
            file_size = os.path.getsize(cache_path)
            
            async with self.cache_lock:
                # Store in memory cache
                self.memory_cache[cache_key] = {
                    "path": str(cache_path),
                    "size": file_size,
                    "last_accessed": datetime.now().isoformat(),
                    "value": result
                }
                
                # Update cache stats
                self.cache_stats["size_bytes"] += file_size
                
                logger.debug(f"Cached result for {model_id}, size: {file_size / 1024:.2f} KB")
                
                # Check if cleanup needed
                if self.cache_stats["size_bytes"] > self.cache_size_limit * 1024 * 1024:
                    asyncio.create_task(self.cleanup_cache())
                    
        except Exception as e:
            logger.error(f"Error caching result for {model_id}: {str(e)}")
    
    async def cleanup_cache(self) -> None:
        """
        Clean up the cache by removing least recently used entries.
        """
        logger.info("Starting cache cleanup")
        
        async with self.cache_lock:
            # Sort entries by last accessed time
            entries = sorted(
                self.memory_cache.items(),
                key=lambda x: x[1].get("last_accessed", ""),
                reverse=False  # Oldest first
            )
            
            # Calculate target size (75% of limit)
            target_size = self.cache_size_limit * 1024 * 1024 * 0.75
            
            # Remove entries until we're under target size
            removed_count = 0
            removed_size = 0
            
            for key, entry in entries:
                if self.cache_stats["size_bytes"] <= target_size:
                    break
                    
                try:
                    # Remove from disk
                    cache_path = Path(entry["path"])
                    if cache_path.exists():
                        cache_path.unlink()
                    
                    # Update stats
                    entry_size = entry.get("size", 0)
                    self.cache_stats["size_bytes"] -= entry_size
                    removed_size += entry_size
                    removed_count += 1
                    
                    # Remove from memory
                    del self.memory_cache[key]
                    
                except Exception as e:
                    logger.error(f"Error removing cache entry {key}: {str(e)}")
            
            # Update metadata
            metadata_path = self.cache_dir / "metadata.json"
            try:
                with open(metadata_path, "r") as f:
                    metadata = json.load(f)
                    
                metadata["last_cleanup"] = datetime.now().isoformat()
                metadata["entries"] = len(self.memory_cache)
                metadata["size_bytes"] = self.cache_stats["size_bytes"]
                
                with open(metadata_path, "w") as f:
                    json.dump(metadata, f)
                    
            except Exception as e:
                logger.error(f"Error updating cache metadata: {str(e)}")
            
            logger.info(f"Cache cleanup complete: removed {removed_count} entries, freed {removed_size / (1024*1024):.2f} MB")
    
    async def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.
        
        Returns:
            Dictionary of cache statistics
        """
        async with self.cache_lock:
            stats = {
                "entries": len(self.memory_cache),
                "size_mb": self.cache_stats["size_bytes"] / (1024 * 1024),
                "hits": self.cache_stats["hits"],
                "misses": self.cache_stats["misses"],
                "hit_ratio": self.cache_stats["hits"] / (self.cache_stats["hits"] + self.cache_stats["misses"]) if (self.cache_stats["hits"] + self.cache_stats["misses"]) > 0 else 0,
                "limit_mb": self.cache_size_limit
            }
            
            return stats


# Singleton instance
_model_cache = None

def get_model_cache() -> ModelCache:
    """
    Get or create the model cache instance.
    
    Returns:
        ModelCache instance
    """
    global _model_cache
    if _model_cache is None:
        _model_cache = ModelCache()
    return _model_cache
