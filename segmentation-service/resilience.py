"""
Error handling and resilience module for Segmentation Service

This module provides error handling, circuit breaking, retry mechanisms,
and other resilience patterns for the Segmentation Service.
"""

import logging
import asyncio
import time
import random
from typing import Dict, Any, List, Optional, Union, Callable, TypeVar, Generic, Awaitable
from enum import Enum
from functools import wraps
import traceback
from datetime import datetime, timedelta

logger = logging.getLogger("segmentation_service.resilience")

# Type definitions
T = TypeVar('T')
R = TypeVar('R')

class CircuitState(Enum):
    """Circuit breaker states"""
    CLOSED = "CLOSED"  # Normal operation, requests are allowed
    OPEN = "OPEN"      # Circuit is open, requests are not allowed
    HALF_OPEN = "HALF_OPEN"  # Testing if the service is back to normal


class CircuitBreaker:
    """Circuit breaker pattern implementation"""
    
    def __init__(
        self,
        name: str,
        failure_threshold: int = 5,
        recovery_timeout: int = 30,
        half_open_max_calls: int = 3
    ):
        """Initialize the circuit breaker
        
        Args:
            name: Name of the circuit breaker
            failure_threshold: Number of failures before opening the circuit
            recovery_timeout: Seconds to wait before trying to recover
            half_open_max_calls: Maximum number of calls in half-open state
        """
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.half_open_max_calls = half_open_max_calls
        
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = None
        self.half_open_calls = 0
        
        logger.info(f"Circuit breaker '{name}' initialized with threshold={failure_threshold}, "
                   f"timeout={recovery_timeout}s")
    
    def allow_request(self) -> bool:
        """Check if a request is allowed based on the circuit state
        
        Returns:
            bool: True if the request is allowed
        """
        now = datetime.now()
        
        if self.state == CircuitState.CLOSED:
            return True
            
        elif self.state == CircuitState.OPEN:
            # Check if recovery timeout has elapsed
            if self.last_failure_time and now > self.last_failure_time + timedelta(seconds=self.recovery_timeout):
                logger.info(f"Circuit breaker '{self.name}' transitioning from OPEN to HALF_OPEN")
                self.state = CircuitState.HALF_OPEN
                self.half_open_calls = 0
                return True
            return False
            
        elif self.state == CircuitState.HALF_OPEN:
            # Allow limited number of calls in half-open state
            if self.half_open_calls < self.half_open_max_calls:
                self.half_open_calls += 1
                return True
            return False
            
        return False
    
    def record_success(self) -> None:
        """Record a successful call"""
        if self.state == CircuitState.HALF_OPEN:
            logger.info(f"Circuit breaker '{self.name}' transitioning from HALF_OPEN to CLOSED")
            self.state = CircuitState.CLOSED
            self.failure_count = 0
            self.half_open_calls = 0
    
    def record_failure(self) -> None:
        """Record a failed call"""
        now = datetime.now()
        self.last_failure_time = now
        
        if self.state == CircuitState.CLOSED:
            self.failure_count += 1
            if self.failure_count >= self.failure_threshold:
                logger.warning(f"Circuit breaker '{self.name}' transitioning from CLOSED to OPEN "
                              f"after {self.failure_count} failures")
                self.state = CircuitState.OPEN
                
        elif self.state == CircuitState.HALF_OPEN:
            logger.warning(f"Circuit breaker '{self.name}' transitioning from HALF_OPEN to OPEN "
                          f"after a failure during recovery")
            self.state = CircuitState.OPEN
            self.half_open_calls = 0


class CircuitBreakerRegistry:
    """Registry for managing circuit breakers"""
    
    _instance = None
    
    def __new__(cls):
        """Singleton pattern implementation"""
        if cls._instance is None:
            cls._instance = super(CircuitBreakerRegistry, cls).__new__(cls)
            cls._instance.circuit_breakers = {}
        return cls._instance
    
    def get_circuit_breaker(
        self,
        name: str,
        failure_threshold: int = 5,
        recovery_timeout: int = 30,
        half_open_max_calls: int = 3
    ) -> CircuitBreaker:
        """Get or create a circuit breaker
        
        Args:
            name: Name of the circuit breaker
            failure_threshold: Number of failures before opening the circuit
            recovery_timeout: Seconds to wait before trying to recover
            half_open_max_calls: Maximum number of calls in half-open state
            
        Returns:
            CircuitBreaker: The circuit breaker instance
        """
        if name not in self.circuit_breakers:
            self.circuit_breakers[name] = CircuitBreaker(
                name,
                failure_threshold,
                recovery_timeout,
                half_open_max_calls
            )
        return self.circuit_breakers[name]
    
    def get_all_circuit_breakers(self) -> Dict[str, CircuitBreaker]:
        """Get all circuit breakers
        
        Returns:
            Dict[str, CircuitBreaker]: Dictionary of circuit breakers
        """
        return self.circuit_breakers


class RetryConfig:
    """Configuration for retry mechanism"""
    
    def __init__(
        self,
        max_retries: int = 3,
        initial_delay: float = 1.0,
        max_delay: float = 30.0,
        backoff_factor: float = 2.0,
        jitter: bool = True
    ):
        """Initialize retry configuration
        
        Args:
            max_retries: Maximum number of retry attempts
            initial_delay: Initial delay in seconds
            max_delay: Maximum delay in seconds
            backoff_factor: Exponential backoff factor
            jitter: Whether to add random jitter to delay
        """
        self.max_retries = max_retries
        self.initial_delay = initial_delay
        self.max_delay = max_delay
        self.backoff_factor = backoff_factor
        self.jitter = jitter
    
    def get_delay(self, attempt: int) -> float:
        """Calculate delay for a retry attempt
        
        Args:
            attempt: Current attempt number (0-based)
            
        Returns:
            float: Delay in seconds
        """
        delay = min(
            self.max_delay,
            self.initial_delay * (self.backoff_factor ** attempt)
        )
        
        if self.jitter:
            # Add random jitter (±20%)
            jitter_factor = 1.0 + random.uniform(-0.2, 0.2)
            delay *= jitter_factor
            
        return delay


class FallbackStrategy:
    """Strategy for fallback behavior when all retries fail"""
    
    def __init__(
        self,
        fallback_value: Optional[Any] = None,
        fallback_function: Optional[Callable] = None
    ):
        """Initialize fallback strategy
        
        Args:
            fallback_value: Static fallback value
            fallback_function: Function to call for fallback
        """
        self.fallback_value = fallback_value
        self.fallback_function = fallback_function
    
    async def execute(self, *args, **kwargs) -> Any:
        """Execute the fallback strategy
        
        Returns:
            Any: Fallback result
        """
        if self.fallback_function:
            if asyncio.iscoroutinefunction(self.fallback_function):
                return await self.fallback_function(*args, **kwargs)
            else:
                return self.fallback_function(*args, **kwargs)
        return self.fallback_value


class BulkheadConfig:
    """Configuration for bulkhead pattern (limiting concurrent executions)"""
    
    def __init__(
        self,
        max_concurrent_calls: int = 10,
        max_queue_size: int = 20
    ):
        """Initialize bulkhead configuration
        
        Args:
            max_concurrent_calls: Maximum number of concurrent calls
            max_queue_size: Maximum queue size for waiting calls
        """
        self.max_concurrent_calls = max_concurrent_calls
        self.max_queue_size = max_queue_size
        self.semaphore = asyncio.Semaphore(max_concurrent_calls)
        self.queue_size = 0
    
    async def acquire(self) -> bool:
        """Acquire a permit to execute
        
        Returns:
            bool: True if acquired, False if rejected
        """
        if self.queue_size >= self.max_queue_size:
            return False
            
        self.queue_size += 1
        try:
            await self.semaphore.acquire()
            return True
        except:
            self.queue_size -= 1
            return False
    
    def release(self) -> None:
        """Release a permit after execution"""
        self.queue_size -= 1
        self.semaphore.release()


class TimeoutConfig:
    """Configuration for timeout pattern"""
    
    def __init__(self, timeout_seconds: float = 30.0):
        """Initialize timeout configuration
        
        Args:
            timeout_seconds: Timeout in seconds
        """
        self.timeout_seconds = timeout_seconds


class ResilienceDecorator:
    """Decorator for adding resilience patterns to functions"""
    
    def __init__(
        self,
        circuit_breaker: Optional[CircuitBreaker] = None,
        retry_config: Optional[RetryConfig] = None,
        fallback_strategy: Optional[FallbackStrategy] = None,
        bulkhead_config: Optional[BulkheadConfig] = None,
        timeout_config: Optional[TimeoutConfig] = None
    ):
        """Initialize resilience decorator
        
        Args:
            circuit_breaker: Circuit breaker instance
            retry_config: Retry configuration
            fallback_strategy: Fallback strategy
            bulkhead_config: Bulkhead configuration
            timeout_config: Timeout configuration
        """
        self.circuit_breaker = circuit_breaker
        self.retry_config = retry_config
        self.fallback_strategy = fallback_strategy
        self.bulkhead_config = bulkhead_config
        self.timeout_config = timeout_config
    
    def __call__(self, func):
        """Apply resilience patterns to a function
        
        Args:
            func: Function to decorate
            
        Returns:
            Callable: Decorated function
        """
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Apply circuit breaker
            if self.circuit_breaker and not self.circuit_breaker.allow_request():
                logger.warning(f"Circuit breaker '{self.circuit_breaker.name}' is open, "
                              f"request rejected")
                if self.fallback_strategy:
                    return await self.fallback_strategy.execute(*args, **kwargs)
                raise Exception(f"Circuit breaker '{self.circuit_breaker.name}' is open")
            
            # Apply bulkhead
            if self.bulkhead_config:
                if not await self.bulkhead_config.acquire():
                    logger.warning("Bulkhead rejected request due to queue full")
                    if self.fallback_strategy:
                        return await self.fallback_strategy.execute(*args, **kwargs)
                    raise Exception("Bulkhead rejected request")
                
                bulkhead_acquired = True
            else:
                bulkhead_acquired = False
            
            # Apply retry logic
            attempt = 0
            max_retries = self.retry_config.max_retries if self.retry_config else 0
            
            while True:
                try:
                    # Apply timeout
                    if self.timeout_config:
                        try:
                            result = await asyncio.wait_for(
                                func(*args, **kwargs),
                                timeout=self.timeout_config.timeout_seconds
                            )
                        except asyncio.TimeoutError:
                            logger.warning(f"Function {func.__name__} timed out after "
                                          f"{self.timeout_config.timeout_seconds}s")
                            raise Exception(f"Timeout after {self.timeout_config.timeout_seconds}s")
                    else:
                        result = await func(*args, **kwargs)
                    
                    # Record success for circuit breaker
                    if self.circuit_breaker:
                        self.circuit_breaker.record_success()
                    
                    return result
                    
                except Exception as e:
                    logger.warning(f"Function {func.__name__} failed with error: {str(e)}")
                    
                    # Record failure for circuit breaker
                    if self.circuit_breaker:
                        self.circuit_breaker.record_failure()
                    
                    # Check if we should retry
                    if self.retry_config and attempt < max_retries:
                        attempt += 1
                        delay = self.retry_config.get_delay(attempt)
                        
                        logger.info(f"Retrying {func.__name__} after {delay:.2f}s "
                                   f"(attempt {attempt}/{max_retries})")
                        
                        await asyncio.sleep(delay)
                        continue
                    
                    # If we reach here, all retries failed or no retry configured
                    if self.fallback_strategy:
                        return await self.fallback_strategy.execute(*args, **kwargs)
                    
                    # Re-raise the exception
                    raise
                finally:
                    # Release bulkhead if acquired
                    if bulkhead_acquired:
                        self.bulkhead_config.release()
        
        return wrapper


# Convenience functions for creating resilient functions

def with_circuit_breaker(
    name: str,
    failure_threshold: int = 5,
    recovery_timeout: int = 30,
    half_open_max_calls: int = 3
):
    """Decorator for adding circuit breaker to a function
    
    Args:
        name: Name of the circuit breaker
        failure_threshold: Number of failures before opening the circuit
        recovery_timeout: Seconds to wait before trying to recover
        half_open_max_calls: Maximum number of calls in half-open state
        
    Returns:
        Callable: Decorator function
    """
    registry = CircuitBreakerRegistry()
    circuit_breaker = registry.get_circuit_breaker(
        name,
        failure_threshold,
        recovery_timeout,
        half_open_max_calls
    )
    
    return ResilienceDecorator(circuit_breaker=circuit_breaker)


def with_retry(
    max_retries: int = 3,
    initial_delay: float = 1.0,
    max_delay: float = 30.0,
    backoff_factor: float = 2.0,
    jitter: bool = True
):
    """Decorator for adding retry logic to a function
    
    Args:
        max_retries: Maximum number of retry attempts
        initial_delay: Initial delay in seconds
        max_delay: Maximum delay in seconds
        backoff_factor: Exponential backoff factor
        jitter: Whether to add random jitter to delay
        
    Returns:
        Callable: Decorator function
    """
    retry_config = RetryConfig(
        max_retries,
        initial_delay,
        max_delay,
        backoff_factor,
        jitter
    )
    
    return ResilienceDecorator(retry_config=retry_config)


def with_fallback(fallback_value=None, fallback_function=None):
    """Decorator for adding fallback to a function
    
    Args:
        fallback_value: Static fallback value
        fallback_function: Function to call for fallback
        
    Returns:
        Callable: Decorator function
    """
    fallback_strategy = FallbackStrategy(
        fallback_value,
        fallback_function
    )
    
    return ResilienceDecorator(fallback_strategy=fallback_strategy)


def with_bulkhead(max_concurrent_calls: int = 10, max_queue_size: int = 20):
    """Decorator for adding bulkhead to a function
    
    Args:
        max_concurrent_calls: Maximum number of concurrent calls
        max_queue_size: Maximum queue size for waiting calls
        
    Returns:
        Callable: Decorator function
    """
    bulkhead_config = BulkheadConfig(
        max_concurrent_calls,
        max_queue_size
    )
    
    return ResilienceDecorator(bulkhead_config=bulkhead_config)


def with_timeout(timeout_seconds: float = 30.0):
    """Decorator for adding timeout to a function
    
    Args:
        timeout_seconds: Timeout in seconds
        
    Returns:
        Callable: Decorator function
    """
    timeout_config = TimeoutConfig(timeout_seconds)
    
    return ResilienceDecorator(timeout_config=timeout_config)


def with_resilience(
    circuit_breaker_name: Optional[str] = None,
    max_retries: int = 3,
    timeout_seconds: float = 30.0,
    max_concurrent_calls: int = 10,
    fallback_value: Any = None
):
    """Decorator for adding multiple resilience patterns to a function
    
    Args:
        circuit_breaker_name: Name of the circuit breaker (None to disable)
        max_retries: Maximum number of retry attempts (0 to disable)
        timeout_seconds: Timeout in seconds (0 to disable)
        max_concurrent_calls: Maximum number of concurrent calls (0 to disable)
        fallback_value: Static fallback value (None to disable)
        
    Returns:
        Callable: Decorator function
    """
    # Create components based on parameters
    circuit_breaker = None
    if circuit_breaker_name:
        registry = CircuitBreakerRegistry()
        circuit_breaker = registry.get_circuit_breaker(circuit_breaker_name)
    
    retry_config = None
    if max_retries > 0:
        retry_config = RetryConfig(max_retries=max_retries)
    
    timeout_config = None
    if timeout_seconds > 0:
        timeout_config = TimeoutConfig(timeout_seconds=timeout_seconds)
    
    bulkhead_config = None
    if max_concurrent_calls > 0:
        bulkhead_config = BulkheadConfig(max_concurrent_calls=max_concurrent_calls)
    
    fallback_strategy = None
    if fallback_value is not None:
        fallback_strategy = FallbackStrategy(fallback_value=fallback_value)
    
    return ResilienceDecorator(
        circuit_breaker=circuit_breaker,
        retry_config=retry_config,
        fallback_strategy=fallback_strategy,
        bulkhead_config=bulkhead_config,
        timeout_config=timeout_config
    )


# Error handling utilities

class ErrorHandler:
    """Utility for handling and logging errors"""
    
    @staticmethod
    def log_exception(e: Exception, context: Optional[Dict[str, Any]] = None) -> None:
        """Log an exception with context
        
        Args:
            e: Exception to log
            context: Additional context information
        """
        logger.error(f"Exception: {str(e)}")
        
        if context:
            logger.error(f"Context: {context}")
            
        logger.error(f"Traceback: {traceback.format_exc()}")
    
    @staticmethod
    def format_error_response(
        e: Exception,
        error_code: str = "INTERNAL_ERROR",
        status_code: int = 500,
        request_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Format an error response
        
        Args:
            e: Exception to format
            error_code: Error code
            status_code: HTTP status code
            request_id: Request ID
            
        Returns:
            Dict[str, Any]: Formatted error response
        """
        return {
            "status": "error",
            "error": {
                "code": error_code,
                "message": str(e),
                "status_code": status_code,
                "request_id": request_id
            }
        }
    
    @staticmethod
    def is_retriable_error(e: Exception) -> bool:
        """Check if an error is retriable
        
        Args:
            e: Exception to check
            
        Returns:
            bool: True if the error is retriable
        """
        # Network errors are generally retriable
        if isinstance(e, (
            asyncio.TimeoutError,
            ConnectionError,
            ConnectionRefusedError,
            ConnectionResetError,
            TimeoutError
        )):
            return True
            
        # Check for specific error messages
        error_str = str(e).lower()
        retriable_patterns = [
            "timeout",
            "connection",
            "network",
            "too many requests",
            "rate limit",
            "throttle",
            "overloaded",
            "try again",
            "temporary"
        ]
        
        for pattern in retriable_patterns:
            if pattern in error_str:
                return True
                
        return False
