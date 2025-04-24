"""
Comprehensive tests for microservice optimization features of Segmentation Service

This module contains tests for service communication protocol, service discovery,
and resilience patterns implemented in the Segmentation Service.
"""

import unittest
import asyncio
import json
import time
from unittest.mock import MagicMock, patch, AsyncMock
import aiohttp
from aiohttp import ClientSession, ClientResponse, ClientError
import pytest

from service_discovery import ServiceRegistry, ServiceClient, AIOrchestrator, RunnerService, ArchiveService
from resilience import (
    CircuitBreaker, CircuitState, RetryConfig, FallbackStrategy, BulkheadConfig,
    TimeoutConfig, ResilienceDecorator, with_circuit_breaker, with_retry,
    with_fallback, with_bulkhead, with_timeout, with_resilience, ErrorHandler
)


class TestServiceDiscovery(unittest.TestCase):
    """Test cases for service discovery module"""
    
    def setUp(self):
        """Set up test environment"""
        self.config = {
            "service_registry_url": "http://service-registry:8080",
            "version": "1.0.0",
            "http_endpoint": "http://segmentation-service:8080",
            "grpc_endpoint": "grpc://segmentation-service:9090",
            "health_check_path": "/api/v1/health",
            "health_check_interval": 30,
            "health_check_timeout": 5,
            "metadata": {
                "capabilities": ["text-segmentation", "alt-file-processing"],
                "supported_languages": ["en", "tr"]
            },
            "ai-orchestrator": {
                "endpoints": {
                    "http": "http://ai-orchestrator:8080",
                    "grpc": "grpc://ai-orchestrator:9090"
                }
            },
            "runner-service": {
                "endpoints": {
                    "http": "http://runner-service:8080",
                    "grpc": "grpc://runner-service:9090"
                }
            },
            "archive-service": {
                "endpoints": {
                    "http": "http://archive-service:8080",
                    "grpc": "grpc://archive-service:9090"
                }
            }
        }
        self.registry = ServiceRegistry(self.config)
    
    @patch('aiohttp.ClientSession.post')
    def test_register_service(self, mock_post):
        """Test service registration"""
        # Mock response
        mock_response = AsyncMock()
        mock_response.status = 201
        mock_post.return_value.__aenter__.return_value = mock_response
        
        # Test registration
        async def test():
            result = await self.registry.register_service()
            self.assertTrue(result)
            self.assertTrue(self.registry.registered)
            
            # Check if post was called with correct data
            mock_post.assert_called_once()
            call_args = mock_post.call_args[1]
            self.assertEqual(call_args['timeout'], 10)
            
            # Check JSON data
            json_data = call_args['json']
            self.assertEqual(json_data['service_name'], "segmentation-service")
            self.assertEqual(json_data['version'], "1.0.0")
            self.assertIn('endpoints', json_data)
            self.assertIn('http', json_data['endpoints'])
            self.assertIn('grpc', json_data['endpoints'])
        
        # Run test
        asyncio.run(test())
    
    @patch('aiohttp.ClientSession.get')
    def test_discover_service(self, mock_get):
        """Test service discovery"""
        # Mock response
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json = AsyncMock(return_value={
            "service_id": "ai-orchestrator-123",
            "service_name": "ai-orchestrator",
            "version": "1.0.0",
            "endpoints": {
                "http": "http://ai-orchestrator:8080",
                "grpc": "grpc://ai-orchestrator:9090"
            }
        })
        mock_get.return_value.__aenter__.return_value = mock_response
        
        # Test discovery
        async def test():
            service_info = await self.registry.discover_service("ai-orchestrator")
            self.assertIsNotNone(service_info)
            self.assertEqual(service_info['service_name'], "ai-orchestrator")
            self.assertEqual(service_info['endpoints']['http'], "http://ai-orchestrator:8080")
            
            # Check if get was called with correct URL
            mock_get.assert_called_once()
            call_args = mock_get.call_args
            self.assertIn('http://service-registry:8080/services/ai-orchestrator', str(call_args))
        
        # Run test
        asyncio.run(test())
    
    @patch('aiohttp.ClientSession.get')
    def test_discover_service_fallback(self, mock_get):
        """Test service discovery fallback to configuration"""
        # Mock response to fail
        mock_response = AsyncMock()
        mock_response.status = 500
        mock_get.return_value.__aenter__.return_value = mock_response
        
        # Test discovery with fallback
        async def test():
            service_info = await self.registry.discover_service("ai-orchestrator")
            self.assertIsNotNone(service_info)
            self.assertEqual(service_info['endpoints']['http'], "http://ai-orchestrator:8080")
        
        # Run test
        asyncio.run(test())
    
    @patch('aiohttp.ClientSession.get')
    def test_get_service_endpoint(self, mock_get):
        """Test getting service endpoint"""
        # Mock response
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json = AsyncMock(return_value={
            "service_id": "runner-service-123",
            "service_name": "runner-service",
            "version": "1.0.0",
            "endpoints": {
                "http": "http://runner-service:8080",
                "grpc": "grpc://runner-service:9090"
            }
        })
        mock_get.return_value.__aenter__.return_value = mock_response
        
        # Test getting endpoint
        async def test():
            endpoint = await self.registry.get_service_endpoint("runner-service", "http")
            self.assertEqual(endpoint, "http://runner-service:8080")
            
            grpc_endpoint = await self.registry.get_service_endpoint("runner-service", "grpc")
            self.assertEqual(grpc_endpoint, "grpc://runner-service:9090")
        
        # Run test
        asyncio.run(test())


class TestServiceClient(unittest.TestCase):
    """Test cases for service client classes"""
    
    def setUp(self):
        """Set up test environment"""
        self.config = {
            "service_registry_url": "http://service-registry:8080",
            "ai-orchestrator": {
                "endpoints": {
                    "http": "http://ai-orchestrator:8080"
                }
            },
            "runner-service": {
                "endpoints": {
                    "http": "http://runner-service:8080"
                }
            },
            "archive-service": {
                "endpoints": {
                    "http": "http://archive-service:8080"
                }
            }
        }
        self.registry = ServiceRegistry(self.config)
    
    @patch('service_discovery.ServiceRegistry.get_service_endpoint')
    @patch('aiohttp.ClientSession.post')
    def test_ai_orchestrator_client(self, mock_post, mock_get_endpoint):
        """Test AI Orchestrator client"""
        # Mock endpoint discovery
        mock_get_endpoint.return_value = asyncio.Future()
        mock_get_endpoint.return_value.set_result("http://ai-orchestrator:8080")
        
        # Mock response
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.raise_for_status = AsyncMock()
        mock_response.json = AsyncMock(return_value={
            "result": "processed text",
            "model_type": "llm",
            "status": "success"
        })
        mock_post.return_value.__aenter__.return_value = mock_response
        
        # Test client
        async def test():
            client = AIOrchestrator(self.registry)
            await client.initialize()
            
            result = await client.process_llm("Process this text", {"language": "en"})
            self.assertEqual(result["result"], "processed text")
            self.assertEqual(result["status"], "success")
            
            # Check if post was called with correct data
            mock_post.assert_called_once()
            call_args = mock_post.call_args
            self.assertIn('http://ai-orchestrator:8080/api/llm', str(call_args))
            self.assertIn('Process this text', str(call_args))
        
        # Run test
        asyncio.run(test())
    
    @patch('service_discovery.ServiceRegistry.get_service_endpoint')
    @patch('aiohttp.ClientSession.post')
    def test_runner_service_client(self, mock_post, mock_get_endpoint):
        """Test Runner Service client"""
        # Mock endpoint discovery
        mock_get_endpoint.return_value = asyncio.Future()
        mock_get_endpoint.return_value.set_result("http://runner-service:8080")
        
        # Mock response
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.raise_for_status = AsyncMock()
        mock_response.json = AsyncMock(return_value={
            "task_id": "task-123",
            "status": "queued"
        })
        mock_post.return_value.__aenter__.return_value = mock_response
        
        # Test client
        async def test():
            client = RunnerService(self.registry)
            await client.initialize()
            
            task_data = {
                "command": "search",
                "parameters": {"query": "test"}
            }
            result = await client.execute_task(task_data)
            self.assertEqual(result["task_id"], "task-123")
            self.assertEqual(result["status"], "queued")
            
            # Check if post was called with correct data
            mock_post.assert_called_once()
            call_args = mock_post.call_args
            self.assertIn('http://runner-service:8080/api/tasks', str(call_args))
            self.assertIn('search', str(call_args))
        
        # Run test
        asyncio.run(test())
    
    @patch('service_discovery.ServiceRegistry.get_service_endpoint')
    @patch('aiohttp.ClientSession.post')
    def test_archive_service_client(self, mock_post, mock_get_endpoint):
        """Test Archive Service client"""
        # Mock endpoint discovery
        mock_get_endpoint.return_value = asyncio.Future()
        mock_get_endpoint.return_value.set_result("http://archive-service:8080")
        
        # Mock response
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.raise_for_status = AsyncMock()
        mock_response.json = AsyncMock(return_value={
            "result_id": "result-123",
            "status": "stored"
        })
        mock_post.return_value.__aenter__.return_value = mock_response
        
        # Test client
        async def test():
            client = ArchiveService(self.registry)
            await client.initialize()
            
            result_data = {
                "content": "Test result",
                "metadata": {"type": "test"}
            }
            result = await client.store_result(result_data)
            self.assertEqual(result["result_id"], "result-123")
            self.assertEqual(result["status"], "stored")
            
            # Check if post was called with correct data
            mock_post.assert_called_once()
            call_args = mock_post.call_args
            self.assertIn('http://archive-service:8080/api/results', str(call_args))
            self.assertIn('Test result', str(call_args))
        
        # Run test
        asyncio.run(test())


class TestCircuitBreaker(unittest.TestCase):
    """Test cases for circuit breaker pattern"""
    
    def setUp(self):
        """Set up test environment"""
        self.circuit_breaker = CircuitBreaker(
            name="test-circuit",
            failure_threshold=3,
            recovery_timeout=1,  # Short timeout for testing
            half_open_max_calls=2
        )
    
    def test_initial_state(self):
        """Test initial circuit breaker state"""
        self.assertEqual(self.circuit_breaker.state, CircuitState.CLOSED)
        self.assertEqual(self.circuit_breaker.failure_count, 0)
        self.assertIsNone(self.circuit_breaker.last_failure_time)
        self.assertTrue(self.circuit_breaker.allow_request())
    
    def test_circuit_open_after_failures(self):
        """Test circuit opens after threshold failures"""
        # Record failures
        for _ in range(3):
            self.circuit_breaker.record_failure()
        
        # Check state
        self.assertEqual(self.circuit_breaker.state, CircuitState.OPEN)
        self.assertFalse(self.circuit_breaker.allow_request())
    
    def test_circuit_half_open_after_timeout(self):
        """Test circuit transitions to half-open after timeout"""
        # Open the circuit
        for _ in range(3):
            self.circuit_breaker.record_failure()
        
        # Wait for recovery timeout
        time.sleep(1.1)
        
        # Check state
        self.assertTrue(self.circuit_breaker.allow_request())
        self.assertEqual(self.circuit_breaker.state, CircuitState.HALF_OPEN)
    
    def test_circuit_closed_after_success(self):
        """Test circuit closes after success in half-open state"""
        # Open the circuit
        for _ in range(3):
            self.circuit_breaker.record_failure()
        
        # Wait for recovery timeout
        time.sleep(1.1)
        
        # Allow request and record success
        self.assertTrue(self.circuit_breaker.allow_request())
        self.circuit_breaker.record_success()
        
        # Check state
        self.assertEqual(self.circuit_breaker.state, CircuitState.CLOSED)
        self.assertEqual(self.circuit_breaker.failure_count, 0)
    
    def test_circuit_open_after_failure_in_half_open(self):
        """Test circuit opens after failure in half-open state"""
        # Open the circuit
        for _ in range(3):
            self.circuit_breaker.record_failure()
        
        # Wait for recovery timeout
        time.sleep(1.1)
        
        # Allow request and record failure
        self.assertTrue(self.circuit_breaker.allow_request())
        self.circuit_breaker.record_failure()
        
        # Check state
        self.assertEqual(self.circuit_breaker.state, CircuitState.OPEN)
    
    def test_limited_calls_in_half_open(self):
        """Test limited calls allowed in half-open state"""
        # Open the circuit
        for _ in range(3):
            self.circuit_breaker.record_failure()
        
        # Wait for recovery timeout
        time.sleep(1.1)
        
        # First two requests should be allowed
        self.assertTrue(self.circuit_breaker.allow_request())
        self.assertTrue(self.circuit_breaker.allow_request())
        
        # Third request should be rejected
        self.assertFalse(self.circuit_breaker.allow_request())


class TestRetryMechanism(unittest.TestCase):
    """Test cases for retry mechanism"""
    
    def test_retry_config(self):
        """Test retry configuration"""
        config = RetryConfig(
            max_retries=3,
            initial_delay=1.0,
            max_delay=10.0,
            backoff_factor=2.0,
            jitter=False
        )
        
        # Check delay calculation
        self.assertEqual(config.get_delay(0), 1.0)
        self.assertEqual(config.get_delay(1), 2.0)
        self.assertEqual(config.get_delay(2), 4.0)
        self.assertEqual(config.get_delay(3), 8.0)
    
    def test_retry_decorator(self):
        """Test retry decorator"""
        # Create a function that fails twice then succeeds
        attempt = 0
        
        @with_retry(max_retries=3, initial_delay=0.1, jitter=False)
        async def test_function():
            nonlocal attempt
            attempt += 1
            if attempt <= 2:
                raise Exception(f"Failure {attempt}")
            return "success"
        
        # Test function
        async def test():
            result = await test_function()
            self.assertEqual(result, "success")
            self.assertEqual(attempt, 3)
        
        # Run test
        asyncio.run(test())
    
    def test_retry_with_fallback(self):
        """Test retry with fallback"""
        # Create a function that always fails
        @with_retry(max_retries=2, initial_delay=0.1, jitter=False)
        @with_fallback(fallback_value="fallback")
        async def test_function():
            raise Exception("Always fails")
        
        # Test function
        async def test():
            result = await test_function()
            self.assertEqual(result, "fallback")
        
        # Run test
        asyncio.run(test())


class TestBulkheadPattern(unittest.TestCase):
    """Test cases for bulkhead pattern"""
    
    def test_bulkhead_config(self):
        """Test bulkhead configuration"""
        config = BulkheadConfig(
            max_concurrent_calls=2,
            max_queue_size=1
        )
        
        # Test semaphore
        self.assertEqual(config.semaphore._value, 2)
        self.assertEqual(config.queue_size, 0)
    
    def test_bulkhead_decorator(self):
        """Test bulkhead decorator"""
        # Create a function with bulkhead
        running = 0
        max_running = 0
        
        @with_bulkhead(max_concurrent_calls=2, max_queue_size=1)
        async def test_function(delay):
            nonlocal running, max_running
            running += 1
            max_running = max(max_running, running)
            await asyncio.sleep(delay)
            running -= 1
            return "done"
        
        # Test function with multiple concurrent calls
        async def test():
            # Create tasks
            tasks = [
                asyncio.create_task(test_function(0.1)),
                asyncio.create_task(test_function(0.2)),
                asyncio.create_task(test_function(0.3)),
                asyncio.create_task(test_function(0.4))
            ]
            
            # Wait for all tasks
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Check results
            success_count = sum(1 for r in results if r == "done")
            exception_count = sum(1 for r in results if isinstance(r, Exception))
            
            self.assertEqual(success_count, 3)  # 2 concurrent + 1 queued
            self.assertEqual(exception_count, 1)  # 1 rejected
            self.assertEqual(max_running, 2)  # Max 2 running concurrently
        
        # Run test
        asyncio.run(test())


class TestTimeoutPattern(unittest.TestCase):
    """Test cases for timeout pattern"""
    
    def test_timeout_decorator(self):
        """Test timeout decorator"""
        # Create a function that takes longer than timeout
        @with_timeout(timeout_seconds=0.1)
        async def slow_function():
            await asyncio.sleep(0.2)
            return "done"
        
        # Create a function that completes within timeout
        @with_timeout(timeout_seconds=0.2)
        async def fast_function():
            await asyncio.sleep(0.1)
            return "done"
        
        # Test functions
        async def test():
            # Slow function should timeout
            with self.assertRaises(Exception):
                await slow_function()
            
            # Fast function should complete
            result = await fast_function()
            self.assertEqual(result, "done")
        
        # Run test
        asyncio.run(test())


class TestResilienceDecorator(unittest.TestCase):
    """Test cases for combined resilience patterns"""
    
    def test_combined_resilience(self):
        """Test combined resilience patterns"""
        # Create a function with multiple resilience patterns
        attempts = 0
        
        @with_resilience(
            circuit_breaker_name="test-combined",
            max_retries=2,
            timeout_seconds=0.5,
            max_concurrent_calls=2,
            fallback_value="fallback"
        )
        async def test_function(fail=True, slow=False):
            nonlocal attempts
            attempts += 1
            
            if slow:
                await asyncio.sleep(1.0)  # Will trigger timeout
            
            if fail:
                raise Exception("Deliberate failure")
                
            return "success"
        
        # Test function with different scenarios
        async def test():
            # Test with failure (should retry and fallback)
            result1 = await test_function(fail=True, slow=False)
            self.assertEqual(result1, "fallback")
            self.assertEqual(attempts, 3)  # Initial + 2 retries
            
            # Reset attempts
            attempts = 0
            
            # Test with timeout (should fallback)
            result2 = await test_function(fail=False, slow=True)
            self.assertEqual(result2, "fallback")
            self.assertEqual(attempts, 1)  # Only 1 attempt due to timeout
            
            # Reset attempts
            attempts = 0
            
            # Test with success
            result3 = await test_function(fail=False, slow=False)
            self.assertEqual(result3, "success")
            self.assertEqual(attempts, 1)  # Only 1 attempt needed
        
        # Run test
        asyncio.run(test())


class TestErrorHandler(unittest.TestCase):
    """Test cases for error handler"""
    
    def test_format_error_response(self):
        """Test formatting error response"""
        # Create an exception
        exception = ValueError("Invalid parameter")
        
        # Format error response
        response = ErrorHandler.format_error_response(
            exception,
            error_code="INVALID_PARAMETER",
            status_code=400,
            request_id="req-123"
        )
        
        # Check response
        self.assertEqual(response["status"], "error")
        self.assertEqual(response["error"]["code"], "INVALID_PARAMETER")
        self.assertEqual(response["error"]["message"], "Invalid parameter")
        self.assertEqual(response["error"]["status_code"], 400)
        self.assertEqual(response["error"]["request_id"], "req-123")
    
    def test_is_retriable_error(self):
        """Test checking if an error is retriable"""
        # Test retriable errors
        self.assertTrue(ErrorHandler.is_retriable_error(asyncio.TimeoutError()))
        self.assertTrue(ErrorHandler.is_retriable_error(ConnectionError()))
        self.assertTrue(ErrorHandler.is_retriable_error(Exception("connection refused")))
        self.assertTrue(ErrorHandler.is_retriable_error(Exception("timeout occurred")))
        self.assertTrue(ErrorHandler.is_retriable_error(Exception("too many requests")))
        
        # Test non-retriable errors
        self.assertFalse(ErrorHandler.is_retriable_error(ValueError("invalid value")))
        self.assertFalse(ErrorHandler.is_retriable_error(KeyError("missing key")))
        self.assertFalse(ErrorHandler.is_retriable_error(Exception("permission denied")))


if __name__ == '__main__':
    unittest.main()
