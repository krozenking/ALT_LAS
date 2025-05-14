#!/usr/bin/env python3
"""
Enhanced Cache System for Segmentation Service

This module provides an advanced caching system for the Segmentation Service
to improve performance by storing and retrieving frequently used data.
"""

import os
import time
import json
import hashlib
import pickle
import logging
import threading
import functools
from typing import Any, Callable, Dict, List, Tuple, TypeVar, Optional, Union
from datetime import datetime, timedelta
import sqlite3
from pathlib import Path

# Type variable for generic function
T = TypeVar('T')

# Setup logging
logger = logging.getLogger(__name__)

class CacheItem:
    """Class representing a cached item with metadata"""
    
    def __init__(self, key: str, value: Any, ttl: int = None):
        """
        Initialize cache item
        
        Args:
            key: Cache key
            value: Cached value
            ttl: Time to live in seconds (None for no expiration)
        """
        self.key = key
        self.value = value
        self.created_at = time.time()
        self.last_accessed = time.time()
        self.access_count = 0
        self.ttl = ttl
    
    def is_expired(self) -> bool:
        """
        Check if the cache item is expired
        
        Returns:
            True if expired, False otherwise
        """
        if self.ttl is None:
            return False
        
        return time.time() > (self.created_at + self.ttl)
    
    def access(self):
        """Update last accessed time and access count"""
        self.last_accessed = time.time()
        self.access_count += 1
    
    def get_age(self) -> float:
        """
        Get age of cache item in seconds
        
        Returns:
            Age in seconds
        """
        return time.time() - self.created_at
    
    def get_idle_time(self) -> float:
        """
        Get idle time of cache item in seconds
        
        Returns:
            Idle time in seconds
        """
        return time.time() - self.last_accessed
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert cache item to dictionary
        
        Returns:
            Dictionary representation of cache item
        """
        return {
            "key": self.key,
            "created_at": self.created_at,
            "last_accessed": self.last_accessed,
            "access_count": self.access_count,
            "ttl": self.ttl,
            "age": self.get_age(),
            "idle_time": self.get_idle_time(),
            "expired": self.is_expired()
        }

class CacheBackend:
    """Base class for cache backends"""
    
    def __init__(self, name: str):
        """
        Initialize cache backend
        
        Args:
            name: Cache name
        """
        self.name = name
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found
        """
        raise NotImplementedError("Subclasses must implement get()")
    
    def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """
        Set value in cache
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds (None for no expiration)
            
        Returns:
            True if successful, False otherwise
        """
        raise NotImplementedError("Subclasses must implement set()")
    
    def delete(self, key: str) -> bool:
        """
        Delete value from cache
        
        Args:
            key: Cache key
            
        Returns:
            True if successful, False otherwise
        """
        raise NotImplementedError("Subclasses must implement delete()")
    
    def clear(self) -> bool:
        """
        Clear all values from cache
        
        Returns:
            True if successful, False otherwise
        """
        raise NotImplementedError("Subclasses must implement clear()")
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics
        
        Returns:
            Dictionary with cache statistics
        """
        raise NotImplementedError("Subclasses must implement get_stats()")

class MemoryCache(CacheBackend):
    """In-memory cache backend"""
    
    def __init__(self, name: str, max_size: int = 1000, cleanup_interval: int = 60):
        """
        Initialize memory cache
        
        Args:
            name: Cache name
            max_size: Maximum number of items in cache
            cleanup_interval: Interval in seconds for cleanup
        """
        super().__init__(name)
        self.cache = {}
        self.max_size = max_size
        self.cleanup_interval = cleanup_interval
        self.last_cleanup = time.time()
        self.hits = 0
        self.misses = 0
        self.lock = threading.RLock()
        
        logger.info(f"Memory cache '{name}' initialized with max size: {max_size}, cleanup interval: {cleanup_interval}s")
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found
        """
        with self.lock:
            # Check if cleanup is needed
            self._cleanup_if_needed()
            
            # Check if key exists
            if key not in self.cache:
                self.misses += 1
                return None
            
            # Get cache item
            item = self.cache[key]
            
            # Check if expired
            if item.is_expired():
                self.delete(key)
                self.misses += 1
                return None
            
            # Update access stats
            item.access()
            self.hits += 1
            
            return item.value
    
    def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """
        Set value in cache
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds (None for no expiration)
            
        Returns:
            True if successful, False otherwise
        """
        with self.lock:
            # Check if cleanup is needed
            self._cleanup_if_needed()
            
            # Check if cache is full
            if len(self.cache) >= self.max_size and key not in self.cache:
                self._evict_items()
            
            # Create cache item
            item = CacheItem(key, value, ttl)
            
            # Add to cache
            self.cache[key] = item
            
            return True
    
    def delete(self, key: str) -> bool:
        """
        Delete value from cache
        
        Args:
            key: Cache key
            
        Returns:
            True if successful, False otherwise
        """
        with self.lock:
            if key in self.cache:
                del self.cache[key]
                return True
            
            return False
    
    def clear(self) -> bool:
        """
        Clear all values from cache
        
        Returns:
            True if successful, False otherwise
        """
        with self.lock:
            self.cache.clear()
            return True
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics
        
        Returns:
            Dictionary with cache statistics
        """
        with self.lock:
            total_requests = self.hits + self.misses
            hit_rate = self.hits / total_requests if total_requests > 0 else 0
            
            return {
                "name": self.name,
                "type": "memory",
                "size": len(self.cache),
                "max_size": self.max_size,
                "hits": self.hits,
                "misses": self.misses,
                "hit_rate": hit_rate,
                "items": [item.to_dict() for item in self.cache.values()]
            }
    
    def _cleanup_if_needed(self):
        """Clean up expired items if needed"""
        current_time = time.time()
        if current_time - self.last_cleanup > self.cleanup_interval:
            self._cleanup()
            self.last_cleanup = current_time
    
    def _cleanup(self):
        """Clean up expired items"""
        expired_keys = []
        
        # Find expired keys
        for key, item in self.cache.items():
            if item.is_expired():
                expired_keys.append(key)
        
        # Delete expired keys
        for key in expired_keys:
            self.delete(key)
        
        if expired_keys:
            logger.debug(f"Cleaned up {len(expired_keys)} expired items from cache '{self.name}'")
    
    def _evict_items(self):
        """Evict items from cache when full"""
        # Strategy: Remove least recently used items
        if not self.cache:
            return
        
        # Sort items by last accessed time
        items = sorted(self.cache.items(), key=lambda x: x[1].last_accessed)
        
        # Remove 10% of items or at least one
        num_to_remove = max(1, int(len(items) * 0.1))
        for i in range(num_to_remove):
            if i < len(items):
                self.delete(items[i][0])
        
        logger.debug(f"Evicted {num_to_remove} items from cache '{self.name}'")

class DiskCache(CacheBackend):
    """Disk-based cache backend using SQLite"""
    
    def __init__(self, name: str, cache_dir: str = None, max_size_mb: int = 100, cleanup_interval: int = 300):
        """
        Initialize disk cache
        
        Args:
            name: Cache name
            cache_dir: Directory to store cache files
            max_size_mb: Maximum cache size in MB
            cleanup_interval: Interval in seconds for cleanup
        """
        super().__init__(name)
        
        # Set cache directory
        if cache_dir is None:
            cache_dir = os.path.join(os.path.dirname(__file__), "cache")
        
        self.cache_dir = os.path.join(cache_dir, name)
        os.makedirs(self.cache_dir, exist_ok=True)
        
        # Set database path
        self.db_path = os.path.join(self.cache_dir, "cache.db")
        
        # Set parameters
        self.max_size_mb = max_size_mb
        self.cleanup_interval = cleanup_interval
        self.last_cleanup = time.time()
        self.hits = 0
        self.misses = 0
        
        # Initialize database
        self._init_db()
        
        logger.info(f"Disk cache '{name}' initialized with max size: {max_size_mb}MB, cleanup interval: {cleanup_interval}s")
    
    def _init_db(self):
        """Initialize SQLite database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS cache_items (
            key TEXT PRIMARY KEY,
            value BLOB,
            created_at REAL,
            last_accessed REAL,
            access_count INTEGER,
            ttl REAL
        )
        ''')
        
        # Create indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_last_accessed ON cache_items (last_accessed)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_created_at ON cache_items (created_at)')
        
        conn.commit()
        conn.close()
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found
        """
        # Check if cleanup is needed
        self._cleanup_if_needed()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get item from database
        cursor.execute(
            'SELECT value, created_at, ttl FROM cache_items WHERE key = ?',
            (key,)
        )
        row = cursor.fetchone()
        
        if row is None:
            self.misses += 1
            conn.close()
            return None
        
        value_blob, created_at, ttl = row
        
        # Check if expired
        if ttl is not None and time.time() > (created_at + ttl):
            # Delete expired item
            cursor.execute('DELETE FROM cache_items WHERE key = ?', (key,))
            conn.commit()
            conn.close()
            self.misses += 1
            return None
        
        # Update access stats
        cursor.execute(
            'UPDATE cache_items SET last_accessed = ?, access_count = access_count + 1 WHERE key = ?',
            (time.time(), key)
        )
        conn.commit()
        
        # Deserialize value
        try:
            value = pickle.loads(value_blob)
            self.hits += 1
        except Exception as e:
            logger.error(f"Error deserializing cached value for key '{key}': {str(e)}")
            cursor.execute('DELETE FROM cache_items WHERE key = ?', (key,))
            conn.commit()
            conn.close()
            self.misses += 1
            return None
        
        conn.close()
        return value
    
    def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """
        Set value in cache
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds (None for no expiration)
            
        Returns:
            True if successful, False otherwise
        """
        # Check if cleanup is needed
        self._cleanup_if_needed()
        
        # Check if cache is full
        if self._get_cache_size_mb() >= self.max_size_mb:
            self._evict_items()
        
        # Serialize value
        try:
            value_blob = pickle.dumps(value)
        except Exception as e:
            logger.error(f"Error serializing value for key '{key}': {str(e)}")
            return False
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Insert or replace item
        cursor.execute(
            '''
            INSERT OR REPLACE INTO cache_items
            (key, value, created_at, last_accessed, access_count, ttl)
            VALUES (?, ?, ?, ?, ?, ?)
            ''',
            (key, value_blob, time.time(), time.time(), 0, ttl)
        )
        
        conn.commit()
        conn.close()
        
        return True
    
    def delete(self, key: str) -> bool:
        """
        Delete value from cache
        
        Args:
            key: Cache key
            
        Returns:
            True if successful, False otherwise
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM cache_items WHERE key = ?', (key,))
        deleted = cursor.rowcount > 0
        
        conn.commit()
        conn.close()
        
        return deleted
    
    def clear(self) -> bool:
        """
        Clear all values from cache
        
        Returns:
            True if successful, False otherwise
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM cache_items')
        
        conn.commit()
        conn.close()
        
        return True
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics
        
        Returns:
            Dictionary with cache statistics
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get item count
        cursor.execute('SELECT COUNT(*) FROM cache_items')
        item_count = cursor.fetchone()[0]
        
        # Get cache size
        cache_size_mb = self._get_cache_size_mb()
        
        # Get item stats
        cursor.execute(
            '''
            SELECT key, created_at, last_accessed, access_count, ttl
            FROM cache_items
            ORDER BY last_accessed DESC
            LIMIT 100
            '''
        )
        items = []
        for row in cursor.fetchall():
            key, created_at, last_accessed, access_count, ttl = row
            items.append({
                "key": key,
                "created_at": created_at,
                "last_accessed": last_accessed,
                "access_count": access_count,
                "ttl": ttl,
                "age": time.time() - created_at,
                "idle_time": time.time() - last_accessed,
                "expired": ttl is not None and time.time() > (created_at + ttl)
            })
        
        conn.close()
        
        total_requests = self.hits + self.misses
        hit_rate = self.hits / total_requests if total_requests > 0 else 0
        
        return {
            "name": self.name,
            "type": "disk",
            "size": item_count,
            "size_mb": cache_size_mb,
            "max_size_mb": self.max_size_mb,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": hit_rate,
            "items": items
        }
    
    def _get_cache_size_mb(self) -> float:
        """
        Get cache size in MB
        
        Returns:
            Cache size in MB
        """
        if not os.path.exists(self.db_path):
            return 0
        
        return os.path.getsize(self.db_path) / (1024 * 1024)
    
    def _cleanup_if_needed(self):
        """Clean up expired items if needed"""
        current_time = time.time()
        if current_time - self.last_cleanup > self.cleanup_interval:
            self._cleanup()
            self.last_cleanup = current_time
    
    def _cleanup(self):
        """Clean up expired items"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Delete expired items
        cursor.execute(
            'DELETE FROM cache_items WHERE ttl IS NOT NULL AND created_at + ttl < ?',
            (time.time(),)
        )
        expired_count = cursor.rowcount
        
        conn.commit()
        conn.close()
        
        if expired_count > 0:
            logger.debug(f"Cleaned up {expired_count} expired items from disk cache '{self.name}'")
    
    def _evict_items(self):
        """Evict items from cache when full"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get total item count
        cursor.execute('SELECT COUNT(*) FROM cache_items')
        total_items = cursor.fetchone()[0]
        
        if total_items == 0:
            conn.close()
            return
        
        # Remove 10% of items or at least one
        num_to_remove = max(1, int(total_items * 0.1))
        
        # Remove least recently accessed items
        cursor.execute(
            'DELETE FROM cache_items WHERE key IN (SELECT key FROM cache_items ORDER BY last_accessed ASC LIMIT ?)',
            (num_to_remove,)
        )
        
        conn.commit()
        conn.close()
        
        logger.debug(f"Evicted {num_to_remove} items from disk cache '{self.name}'")

class CacheManager:
    """
    Cache manager for managing multiple caches
    
    Features:
    - Multiple cache backends (memory, disk)
    - Function result caching
    - Cache statistics and monitoring
    - Automatic cache cleanup
    """
    
    def __init__(self):
        """Initialize cache manager"""
        self.caches = {}
        logger.info("Cache manager initialized")
    
    def get_cache(self, name: str, backend: str = "memory", **kwargs) -> CacheBackend:
        """
        Get or create a cache
        
        Args:
            name: Cache name
            backend: Cache backend type ('memory' or 'disk')
            **kwargs: Additional arguments for cache backend
            
        Returns:
            Cache backend
        """
        cache_key = f"{backend}:{name}"
        
        if cache_key in self.caches:
            return self.caches[cache_key]
        
        # Create new cache
        if backend == "memory":
            cache = MemoryCache(name, **kwargs)
        elif backend == "disk":
            cache = DiskCache(name, **kwargs)
        else:
            raise ValueError(f"Unknown cache backend: {backend}")
        
        self.caches[cache_key] = cache
        return cache
    
    def memoize(self, func: Callable[..., T] = None, ttl: int = None, cache_name: str = None, 
                backend: str = "memory", key_prefix: str = None) -> Callable[..., T]:
        """
        Decorator to cache function results
        
        Args:
            func: Function to cache
            ttl: Time to live in seconds (None for no expiration)
            cache_name: Cache name (default: function name)
            backend: Cache backend type ('memory' or 'disk')
            key_prefix: Prefix for cache keys
            
        Returns:
            Cached function
        """
        def decorator(func):
            # Set cache name
            nonlocal cache_name
            if cache_name is None:
                cache_name = func.__name__
            
            # Set key prefix
            nonlocal key_prefix
            if key_prefix is None:
                key_prefix = func.__name__
            
            # Get cache
            cache = self.get_cache(cache_name, backend=backend)
            
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                # Generate cache key
                key = self._generate_cache_key(key_prefix, *args, **kwargs)
                
                # Try to get from cache
                cached_value = cache.get(key)
                if cached_value is not None:
                    return cached_value
                
                # Call function
                result = func(*args, **kwargs)
                
                # Cache result
                cache.set(key, result, ttl)
                
                return result
            
            return wrapper
        
        # Handle both @memoize and @memoize() syntax
        if func is None:
            return decorator
        return decorator(func)
    
    def invalidate_cache(self, cache_name: str, backend: str = "memory") -> bool:
        """
        Invalidate (clear) a cache
        
        Args:
            cache_name: Cache name
            backend: Cache backend type ('memory' or 'disk')
            
        Returns:
            True if successful, False otherwise
        """
        cache_key = f"{backend}:{cache_name}"
        
        if cache_key in self.caches:
            return self.caches[cache_key].clear()
        
        return False
    
    def invalidate_all_caches(self) -> bool:
        """
        Invalidate (clear) all caches
        
        Returns:
            True if successful, False otherwise
        """
        success = True
        
        for cache in self.caches.values():
            if not cache.clear():
                success = False
        
        return success
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """
        Get statistics for all caches
        
        Returns:
            Dictionary with cache statistics
        """
        stats = {}
        
        for cache_key, cache in self.caches.items():
            stats[cache_key] = cache.get_stats()
        
        return stats
    
    def _generate_cache_key(self, prefix: str, *args, **kwargs) -> str:
        """
        Generate cache key from function arguments
        
        Args:
            prefix: Key prefix
            *args: Function arguments
            **kwargs: Function keyword arguments
            
        Returns:
            Cache key
        """
        # Create key components
        key_parts = [prefix]
        
        # Add args
        for arg in args:
            key_parts.append(self._hash_arg(arg))
        
        # Add kwargs (sorted by key)
        for key in sorted(kwargs.keys()):
            key_parts.append(f"{key}={self._hash_arg(kwargs[key])}")
        
        # Join parts
        key = ":".join(key_parts)
        
        # Hash if too long
        if len(key) > 250:
            key = f"{prefix}:{hashlib.md5(key.encode()).hexdigest()}"
        
        return key
    
    def _hash_arg(self, arg: Any) -> str:
        """
        Hash function argument for cache key
        
        Args:
            arg: Function argument
            
        Returns:
            String representation of argument
        """
        if arg is None:
            return "None"
        
        if isinstance(arg, (str, int, float, bool)):
            return str(arg)
        
        if isinstance(arg, (list, tuple)):
            return f"[{','.join(self._hash_arg(a) for a in arg)}]"
        
        if isinstance(arg, dict):
            return f"{{{','.join(f'{k}:{self._hash_arg(v)}' for k, v in sorted(arg.items()))}}}"
        
        # For other types, use hash of repr
        return hashlib.md5(repr(arg).encode()).hexdigest()

# Create a global instance
cache_manager = CacheManager()

# Function to get the cache manager instance
def get_cache_manager() -> CacheManager:
    """
    Get the cache manager instance
    
    Returns:
        Cache manager instance
    """
    return cache_manager

# Example usage
if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Create a cache manager
    manager = CacheManager()
    
    # Example of function caching
    @manager.memoize(ttl=60)
    def fibonacci(n):
        if n <= 1:
            return n
        return fibonacci(n-1) + fibonacci(n-2)
    
    # Test function caching
    logger.info("Calculating fibonacci(30) first time...")
    start_time = time.time()
    result1 = fibonacci(30)
    time1 = time.time() - start_time
    
    logger.info("Calculating fibonacci(30) second time (should be cached)...")
    start_time = time.time()
    result2 = fibonacci(30)
    time2 = time.time() - start_time
    
    logger.info(f"Fibonacci result: {result1}")
    logger.info(f"First call: {time1:.6f} seconds")
    logger.info(f"Second call (cached): {time2:.6f} seconds")
    logger.info(f"Speedup: {time1/time2:.2f}x")
    
    # Get cache stats
    stats = manager.get_cache_stats()
    logger.info(f"Cache stats: {json.dumps(stats, indent=2)}")
    
    # Test disk cache
    disk_cache = manager.get_cache("disk_test", backend="disk")
    
    # Set some values
    disk_cache.set("key1", "value1")
    disk_cache.set("key2", {"name": "test", "value": 123})
    disk_cache.set("key3", [1, 2, 3, 4, 5])
    
    # Get values
    logger.info(f"key1: {disk_cache.get('key1')}")
    logger.info(f"key2: {disk_cache.get('key2')}")
    logger.info(f"key3: {disk_cache.get('key3')}")
    
    # Get disk cache stats
    disk_stats = disk_cache.get_stats()
    logger.info(f"Disk cache stats: {json.dumps(disk_stats, indent=2)}")
    
    # Clear caches
    manager.invalidate_all_caches()
    logger.info("All caches cleared")
