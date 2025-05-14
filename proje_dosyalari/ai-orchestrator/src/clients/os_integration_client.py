#!/usr/bin/env python3
"""
Client for interacting with the OS Integration Service API.
Created by Worker 1.
Includes performance optimizations (caching).
"""

import requests
import logging
import json # Added import
from typing import Dict, Any, Optional, List
from functools import wraps
import time
import asyncio

# Basic async LRU cache implementation (can be moved to a shared utils module later)
def async_lru_cache(maxsize: int = 128, ttl: Optional[int] = None):
    """
    Decorator to cache the result of an async function.
    Args:
        maxsize: Maximum cache size
        ttl: Time to live in seconds (None for no expiration)
    Returns:
        Decorated function
    """
    cache = {}
    timestamps = {}
    lock = asyncio.Lock()

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Create a cache key from the function arguments (excluding self)
            key_args = args[1:] # Exclude self from key
            key = str(key_args) + str(sorted(kwargs.items()))

            async with lock:
                # Check if result is in cache and not expired
                if key in cache:
                    timestamp = timestamps[key]
                    if ttl is None or time.time() - timestamp < ttl:
                        # print(f"Cache HIT for {func.__name__} with key: {key}") # Debugging
                        return cache[key]
                    else:
                        # print(f"Cache EXPIRED for {func.__name__} with key: {key}") # Debugging
                        # Remove expired entry
                        del cache[key]
                        del timestamps[key]
                # else:
                    # print(f"Cache MISS for {func.__name__} with key: {key}") # Debugging

                # If cache is full, remove the oldest entry
                if len(cache) >= maxsize:
                    try:
                        oldest_key = min(timestamps.items(), key=lambda x: x[1])[0]
                        del cache[oldest_key]
                        del timestamps[oldest_key]
                        # print(f"Cache evicted oldest key: {oldest_key}") # Debugging
                    except ValueError: # Handle empty timestamps dict
                        pass

            # Call the original function
            result = await func(*args, **kwargs)

            # Cache the result only if it's not None (or handle errors appropriately)
            if result is not None:
                async with lock:
                    cache[key] = result
                    timestamps[key] = time.time()

            return result

        # Add a method to clear the cache for this specific function
        async def clear_cache():
            async with lock:
                cache.clear()
                timestamps.clear()
                # print(f"Cache CLEARED for {func.__name__}") # Debugging
        wrapper.clear_cache = clear_cache

        return wrapper

    return decorator

logger = logging.getLogger(__name__)

class OSIntegrationClient:
    """Client to interact with the OS Integration Service REST API."""

    def __init__(self, base_url: str, auth_token: Optional[str] = None):
        """Initialize the client.

        Args:
            base_url: The base URL of the OS Integration Service (e.g., http://os-integration-service:8083).
            auth_token: Optional authentication token.
        """
        if not base_url.endswith("/"):
            base_url += "/"
        self.base_url = base_url
        self.headers = {"Content-Type": "application/json"}
        if auth_token:
            self.headers["Authorization"] = f"Bearer {auth_token}"
        logger.info(f"OS Integration Client initialized for URL: {self.base_url}")

    # Use a helper for async requests
    async def _async_request(self, method: str, endpoint: str, **kwargs) -> Optional[Dict[str, Any]]:
        """Helper method to make async requests to the API."""
        url = self.base_url + endpoint.lstrip("/")
        try:
            # Using requests library synchronously within async function is blocking.
            # For a truly async client, httpx or aiohttp should be used.
            # Simulating async behavior for now, assuming underlying service call is quick
            # or replacing this with a proper async HTTP client is a future task.
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, # Use default executor (ThreadPoolExecutor)
                lambda: requests.request(method, url, headers=self.headers, **kwargs)
            )
            response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
            if response.content:
                # Check if content type is JSON before decoding
                if "application/json" in response.headers.get("Content-Type", ""):
                    return response.json()
                else:
                    logger.warning(f"Non-JSON response received from {method} {url}: {response.text[:100]}...")
                    return {"raw_content": response.text} # Or handle differently
            return None # Return None for empty responses (e.g., 204 No Content)
        except requests.exceptions.RequestException as e:
            logger.error(f"Error calling OS Integration Service API ({method} {url}): {e}")
            return None
        except json.JSONDecodeError:
            logger.error(f"Error decoding JSON response from OS Integration Service API ({method} {url})")
            return None

    # --- Platform API Methods ---
    @async_lru_cache(maxsize=2, ttl=300) # Cache platform info for 5 minutes
    async def get_platform_info(self) -> Optional[Dict[str, Any]]:
        """Get OS information."""
        return await self._async_request("GET", "api/platform/info")

    async def list_processes(self) -> Optional[List[Dict[str, Any]]]:
        """List running processes."""
        return await self._async_request("GET", "api/platform/processes")

    async def run_process(self, command: str, args: List[str] = []) -> Optional[Dict[str, Any]]:
        """Run a new process."""
        payload = {"command": command, "args": args}
        return await self._async_request("POST", "api/platform/run", json=payload)

    async def kill_process(self, process_id: int) -> Optional[Dict[str, Any]]:
        """Kill a running process by ID."""
        payload = {"id": process_id}
        return await self._async_request("POST", "api/platform/kill", json=payload)

    @async_lru_cache(maxsize=2, ttl=60) # Cache display info for 1 minute
    async def get_display_info(self) -> Optional[List[Dict[str, Any]]]:
        """Get information about connected displays."""
        return await self._async_request("GET", "api/platform/displays")

    # --- Filesystem API Methods ---
    # Caching list_directory might be risky if content changes frequently
    async def list_directory(self, path: str) -> Optional[List[Dict[str, Any]]]:
        """List files and directories at a given path."""
        params = {"path": path}
        return await self._async_request("GET", "api/fs/list", params=params)

    # Caching read_file might consume too much memory if files are large
    async def read_file(self, path: str) -> Optional[Dict[str, Any]]:
        """Read the content of a file."""
        params = {"path": path}
        return await self._async_request("GET", "api/fs/read", params=params)

    # --- Screenshot API Methods ---
    # Screenshots are unlikely to be cacheable
    async def take_screenshot(self, output_path: str, use_cuda: bool = False) -> Optional[Dict[str, Any]]:
        """Take a screenshot."""
        endpoint = "api/screenshot/cuda" if use_cuda else "api/screenshot"
        params = {"output_path": output_path}
        return await self._async_request("GET", endpoint, params=params)

    # --- Authentication API Methods (Example) ---
    async def login(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        """Login to get an authentication token."""
        payload = {"username": username, "password": password}
        # Don't cache login
        response_data = await self._async_request("POST", "api/auth/login", json=payload)
        if response_data and "token" in response_data:
            self.headers["Authorization"] = f"Bearer {response_data["token"]}"
            logger.info("Successfully logged in and updated auth token.")
            # Clear caches that might depend on auth state if necessary
            await self.get_platform_info.clear_cache()
            await self.get_display_info.clear_cache()
        return response_data

# Example Usage (if run directly)
async def main():
    logging.basicConfig(level=logging.INFO)
    # Assuming OS Integration Service is running locally on port 8083
    client = OSIntegrationClient(base_url="http://localhost:8083")

    # Example: Get platform info (will be cached)
    print("--- Getting Platform Info (1st time) ---")
    info1 = await client.get_platform_info()
    if info1:
        print("Platform Info:", info1)
    else:
        print("Failed to get platform info.")

    print("--- Getting Platform Info (2nd time - should be cached) ---")
    info2 = await client.get_platform_info()
    if info2:
        print("Platform Info:", info2)
    else:
        print("Failed to get platform info.")

    # Example: Get display info (will be cached)
    print("--- Getting Display Info (1st time) ---")
    displays1 = await client.get_display_info()
    if displays1:
        print(f"Found {len(displays1)} displays.")
    else:
        print("Failed to get display info.")

    print("--- Getting Display Info (2nd time - should be cached) ---")
    displays2 = await client.get_display_info()
    if displays2:
        print(f"Found {len(displays2)} displays.")
    else:
        print("Failed to get display info.")

if __name__ == "__main__":
    asyncio.run(main())

