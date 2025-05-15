"""
Model cache module for AI Orchestrator.

This module provides caching functionality for model outputs to improve performance
and reduce redundant computations. It includes GPU-aware caching strategies to
optimize performance for GPU-accelerated models.
"""
import os
import logging
import json
import hashlib
import asyncio
import time
from typing import Dict, Any, Optional, Union, Tuple, List, Set
from datetime import datetime, timedelta
from pathlib import Path
import pickle
import torch

from ..core.config import settings
from ..config.settings import config

logger = logging.getLogger(__name__)

class ModelCache:
    """
    Cache for model outputs to improve performance.

    Features:
    - Disk and memory caching of model outputs
    - GPU-aware caching strategies
    - Automatic cache cleanup
    - Cache statistics
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
            "size_bytes": 0,
            "gpu_hits": 0,
            "gpu_misses": 0
        }

        # GPU-specific caching
        self.use_gpu = config["gpu"].get("enabled", True) and torch.cuda.is_available()
        self.gpu_cache_enabled = self.use_gpu and config["gpu"].get("memory_pool", {}).get("enabled", True)

        # Priority models for caching
        self.priority_models: Set[str] = set(config["models"].get("preload_models", []))

        # Cache TTL (time to live) in seconds
        self.cache_ttl = config.get("cache_ttl", 3600)  # Default: 1 hour

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
        is_gpu_request = self.use_gpu and "gpu" in parameters.get("device", "").lower()

        async with self.cache_lock:
            if cache_key in self.memory_cache:
                entry = self.memory_cache[cache_key]

                # Check if entry has expired
                if "created_at" in entry and time.time() - entry["created_at"] > self.cache_ttl:
                    # Entry has expired, remove it
                    logger.debug(f"Cache entry for {model_id} has expired")

                    # Remove from disk
                    try:
                        cache_path = Path(entry["path"])
                        if cache_path.exists():
                            cache_path.unlink()
                    except Exception as e:
                        logger.error(f"Error removing expired cache file: {str(e)}")

                    # Update stats
                    self.cache_stats["size_bytes"] -= entry.get("size", 0)

                    # Remove from memory
                    del self.memory_cache[cache_key]

                    # Count as miss
                    if is_gpu_request:
                        self.cache_stats["gpu_misses"] += 1
                    else:
                        self.cache_stats["misses"] += 1

                    return None

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

                        # Count as miss
                        if is_gpu_request:
                            self.cache_stats["gpu_misses"] += 1
                        else:
                            self.cache_stats["misses"] += 1

                        return None

                # Increment hit counter
                if is_gpu_request:
                    self.cache_stats["gpu_hits"] += 1
                else:
                    self.cache_stats["hits"] += 1

                # Log with priority info
                is_priority = model_id in self.priority_models
                logger.debug(f"Cache hit for {model_id} (priority: {is_priority}, gpu: {is_gpu_request})")

                return self.memory_cache[cache_key]["value"]

        # Increment miss counter
        if is_gpu_request:
            self.cache_stats["gpu_misses"] += 1
        else:
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
        # Check if this model is eligible for caching
        should_cache = True

        # Skip caching if result is too large (>100MB) unless it's a priority model
        result_size_estimate = len(str(result)) * 2  # Rough estimate
        if result_size_estimate > 100 * 1024 * 1024 and model_id not in self.priority_models:
            logger.debug(f"Skipping cache for large result from {model_id} ({result_size_estimate / (1024*1024):.2f} MB)")
            should_cache = False

        if not should_cache:
            return

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
                    "value": result,
                    "model_id": model_id,  # Store model_id for stats
                    "created_at": time.time(),  # Store creation time for TTL
                    "is_gpu": self.use_gpu and "gpu" in parameters.get("device", "").lower()  # Flag GPU results
                }

                # Update cache stats
                self.cache_stats["size_bytes"] += file_size

                # Log with more details
                is_priority = model_id in self.priority_models
                logger.debug(f"Cached result for {model_id}, size: {file_size / 1024:.2f} KB, priority: {is_priority}")

                # Check if cleanup needed
                if self.cache_stats["size_bytes"] > self.cache_size_limit * 1024 * 1024:
                    asyncio.create_task(self.cleanup_cache())

        except Exception as e:
            logger.error(f"Error caching result for {model_id}: {str(e)}")

    async def cleanup_cache(self) -> None:
        """
        Clean up the cache by removing least recently used entries.

        The cleanup strategy prioritizes keeping entries for priority models
        and removes expired entries first.
        """
        logger.info("Starting cache cleanup")

        async with self.cache_lock:
            # First, remove expired entries
            current_time = time.time()
            expired_entries = [
                key for key, entry in self.memory_cache.items()
                if "created_at" in entry and current_time - entry["created_at"] > self.cache_ttl
            ]

            expired_size = 0
            for key in expired_entries:
                try:
                    entry = self.memory_cache[key]

                    # Remove from disk
                    cache_path = Path(entry["path"])
                    if cache_path.exists():
                        cache_path.unlink()

                    # Update stats
                    entry_size = entry.get("size", 0)
                    self.cache_stats["size_bytes"] -= entry_size
                    expired_size += entry_size

                    # Remove from memory
                    del self.memory_cache[key]

                except Exception as e:
                    logger.error(f"Error removing expired cache entry: {str(e)}")

            logger.info(f"Removed {len(expired_entries)} expired entries, freed {expired_size / (1024*1024):.2f} MB")

            # If we're still over the limit, remove more entries
            if self.cache_stats["size_bytes"] > self.cache_size_limit * 1024 * 1024 * 0.9:
                # Calculate target size (75% of limit)
                target_size = self.cache_size_limit * 1024 * 1024 * 0.75

                # Group entries by priority
                priority_entries = []
                normal_entries = []

                for key, entry in self.memory_cache.items():
                    model_id = entry.get("model_id", "")
                    if model_id in self.priority_models:
                        priority_entries.append((key, entry))
                    else:
                        normal_entries.append((key, entry))

                # Sort non-priority entries by last accessed time (oldest first)
                normal_entries.sort(key=lambda x: x[1].get("last_accessed", ""), reverse=False)

                # Remove non-priority entries until we're under target size
                removed_count = 0
                removed_size = 0

                for key, entry in normal_entries:
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

                logger.info(f"Removed {removed_count} non-priority entries, freed {removed_size / (1024*1024):.2f} MB")

                # If we're still over the limit, remove priority entries too
                if self.cache_stats["size_bytes"] > target_size:
                    # Sort priority entries by last accessed time (oldest first)
                    priority_entries.sort(key=lambda x: x[1].get("last_accessed", ""), reverse=False)

                    priority_removed_count = 0
                    priority_removed_size = 0

                    for key, entry in priority_entries:
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
                            priority_removed_size += entry_size
                            priority_removed_count += 1

                            # Remove from memory
                            del self.memory_cache[key]

                        except Exception as e:
                            logger.error(f"Error removing priority cache entry {key}: {str(e)}")

                    logger.info(f"Removed {priority_removed_count} priority entries, freed {priority_removed_size / (1024*1024):.2f} MB")

            # Update metadata
            metadata_path = self.cache_dir / "metadata.json"
            try:
                with open(metadata_path, "r") as f:
                    metadata = json.load(f)

                metadata["last_cleanup"] = datetime.now().isoformat()
                metadata["entries"] = len(self.memory_cache)
                metadata["size_bytes"] = self.cache_stats["size_bytes"]
                metadata["priority_models"] = list(self.priority_models)

                with open(metadata_path, "w") as f:
                    json.dump(metadata, f)

            except Exception as e:
                logger.error(f"Error updating cache metadata: {str(e)}")

            logger.info(f"Cache cleanup complete: current size {self.cache_stats['size_bytes'] / (1024*1024):.2f} MB, entries: {len(self.memory_cache)}")

    async def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.

        Returns:
            Dictionary of cache statistics
        """
        async with self.cache_lock:
            total_hits = self.cache_stats["hits"] + self.cache_stats["gpu_hits"]
            total_misses = self.cache_stats["misses"] + self.cache_stats["gpu_misses"]

            stats = {
                "entries": len(self.memory_cache),
                "size_mb": self.cache_stats["size_bytes"] / (1024 * 1024),
                "hits": {
                    "total": total_hits,
                    "regular": self.cache_stats["hits"],
                    "gpu": self.cache_stats["gpu_hits"]
                },
                "misses": {
                    "total": total_misses,
                    "regular": self.cache_stats["misses"],
                    "gpu": self.cache_stats["gpu_misses"]
                },
                "hit_ratio": total_hits / (total_hits + total_misses) if (total_hits + total_misses) > 0 else 0,
                "limit_mb": self.cache_size_limit,
                "gpu_enabled": self.gpu_cache_enabled
            }

            # Add model-specific stats if available
            model_stats = {}
            for key, entry in self.memory_cache.items():
                if "model_id" in entry:
                    model_id = entry["model_id"]
                    if model_id not in model_stats:
                        model_stats[model_id] = {
                            "entries": 0,
                            "size_bytes": 0
                        }
                    model_stats[model_id]["entries"] += 1
                    model_stats[model_id]["size_bytes"] += entry.get("size", 0)

            if model_stats:
                stats["models"] = model_stats

            return stats

    async def is_cached(self, model_id: str, inputs: Any, parameters: Dict[str, Any]) -> bool:
        """
        Check if a result is cached without loading it.

        Args:
            model_id: ID of the model
            inputs: Model inputs
            parameters: Model parameters

        Returns:
            True if cached, False otherwise
        """
        cache_key = self._generate_cache_key(model_id, inputs, parameters)

        async with self.cache_lock:
            return cache_key in self.memory_cache

    async def add_priority_model(self, model_id: str) -> None:
        """
        Add a model to the priority list for caching.

        Args:
            model_id: ID of the model
        """
        self.priority_models.add(model_id)

    async def remove_priority_model(self, model_id: str) -> None:
        """
        Remove a model from the priority list for caching.

        Args:
            model_id: ID of the model
        """
        if model_id in self.priority_models:
            self.priority_models.remove(model_id)


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
