"""
Logging and Error Handling Module for ALT_LAS Segmentation Service

This module provides enhanced logging and error handling functionality
for the Segmentation Service.
"""

import logging
import sys
import os
import traceback
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional, Union, List, Tuple
from functools import wraps
from fastapi import HTTPException, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Configure logging format
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()
LOG_FILE = os.environ.get("LOG_FILE", "")

# Create logger
logger = logging.getLogger("segmentation_service")
logger.setLevel(getattr(logging, LOG_LEVEL))

# Create console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(logging.Formatter(LOG_FORMAT))
logger.addHandler(console_handler)

# Create file handler if LOG_FILE is specified
if LOG_FILE:
    file_handler = logging.FileHandler(LOG_FILE)
    file_handler.setFormatter(logging.Formatter(LOG_FORMAT))
    logger.addHandler(file_handler)

# Error codes
class ErrorCode:
    """Error codes for the Segmentation Service"""
    GENERAL_ERROR = "SEGMENTATION_GENERAL_ERROR"
    VALIDATION_ERROR = "SEGMENTATION_VALIDATION_ERROR"
    NOT_FOUND_ERROR = "SEGMENTATION_NOT_FOUND_ERROR"
    PARSING_ERROR = "SEGMENTATION_PARSING_ERROR"
    FILE_ERROR = "SEGMENTATION_FILE_ERROR"
    DEPENDENCY_ERROR = "SEGMENTATION_DEPENDENCY_ERROR"
    CONFIGURATION_ERROR = "SEGMENTATION_CONFIGURATION_ERROR"
    RATE_LIMIT_ERROR = "SEGMENTATION_RATE_LIMIT_ERROR"

class ErrorResponse(BaseModel):
    """Error response model"""
    error_code: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: str
    request_id: Optional[str] = None
    path: Optional[str] = None

class ErrorHandler:
    """Error handler for the Segmentation Service"""
    
    @staticmethod
    def handle_exception(
        request: Request,
        exc: Exception
    ) -> JSONResponse:
        """
        Handle exception and return appropriate response
        
        Args:
            request: FastAPI request
            exc: Exception
            
        Returns:
            JSON response with error details
        """
        # Get request ID from headers or generate one
        request_id = request.headers.get("X-Request-ID", str(time.time_ns()))
        
        # Get request path
        path = request.url.path
        
        # Get timestamp
        timestamp = datetime.now().isoformat()
        
        # Handle HTTPException
        if isinstance(exc, HTTPException):
            if exc.status_code == 404:
                error_code = ErrorCode.NOT_FOUND_ERROR
            elif exc.status_code == 422:
                error_code = ErrorCode.VALIDATION_ERROR
            elif exc.status_code == 429:
                error_code = ErrorCode.RATE_LIMIT_ERROR
            else:
                error_code = ErrorCode.GENERAL_ERROR
            
            # Log error
            logger.error(
                f"HTTP error {exc.status_code}: {exc.detail}",
                extra={
                    "request_id": request_id,
                    "path": path,
                    "status_code": exc.status_code,
                    "error_code": error_code
                }
            )
            
            # Create error response
            error_response = ErrorResponse(
                error_code=error_code,
                message=str(exc.detail),
                details=getattr(exc, "details", None),
                timestamp=timestamp,
                request_id=request_id,
                path=path
            )
            
            return JSONResponse(
                status_code=exc.status_code,
                content=error_response.dict()
            )
        
        # Handle other exceptions
        error_code = ErrorCode.GENERAL_ERROR
        
        # Determine more specific error code based on exception type
        if "NotFound" in exc.__class__.__name__:
            error_code = ErrorCode.NOT_FOUND_ERROR
        elif "Validation" in exc.__class__.__name__:
            error_code = ErrorCode.VALIDATION_ERROR
        elif "Parse" in exc.__class__.__name__ or "Syntax" in exc.__class__.__name__:
            error_code = ErrorCode.PARSING_ERROR
        elif "File" in exc.__class__.__name__ or "IO" in exc.__class__.__name__:
            error_code = ErrorCode.FILE_ERROR
        elif "Dependency" in exc.__class__.__name__:
            error_code = ErrorCode.DEPENDENCY_ERROR
        elif "Config" in exc.__class__.__name__:
            error_code = ErrorCode.CONFIGURATION_ERROR
        
        # Get exception details
        exc_type, exc_value, exc_traceback = sys.exc_info()
        stack_trace = traceback.format_exception(exc_type, exc_value, exc_traceback)
        
        # Log error with stack trace
        logger.error(
            f"Unhandled exception: {str(exc)}",
            extra={
                "request_id": request_id,
                "path": path,
                "error_code": error_code,
                "exception_type": exc.__class__.__name__,
                "stack_trace": "".join(stack_trace)
            }
        )
        
        # Create error response
        error_response = ErrorResponse(
            error_code=error_code,
            message=f"An unexpected error occurred: {str(exc)}",
            details={"type": exc.__class__.__name__},
            timestamp=timestamp,
            request_id=request_id,
            path=path
        )
        
        return JSONResponse(
            status_code=500,
            content=error_response.dict()
        )

class RequestLogger:
    """Request logger for the Segmentation Service"""
    
    @staticmethod
    async def log_request(request: Request, call_next):
        """
        Log request and response
        
        Args:
            request: FastAPI request
            call_next: Next middleware
            
        Returns:
            Response
        """
        # Get request ID from headers or generate one
        request_id = request.headers.get("X-Request-ID", str(time.time_ns()))
        
        # Add request ID to request state
        request.state.request_id = request_id
        
        # Get request details
        method = request.method
        path = request.url.path
        query_params = dict(request.query_params)
        client_host = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("User-Agent", "unknown")
        
        # Log request
        logger.info(
            f"Request: {method} {path}",
            extra={
                "request_id": request_id,
                "method": method,
                "path": path,
                "query_params": query_params,
                "client_host": client_host,
                "user_agent": user_agent
            }
        )
        
        # Measure request processing time
        start_time = time.time()
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate processing time
            process_time = time.time() - start_time
            
            # Log response
            logger.info(
                f"Response: {response.status_code} - {process_time:.4f}s",
                extra={
                    "request_id": request_id,
                    "method": method,
                    "path": path,
                    "status_code": response.status_code,
                    "process_time": process_time
                }
            )
            
            # Add custom headers to response
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time"] = str(process_time)
            
            return response
        except Exception as exc:
            # Calculate processing time
            process_time = time.time() - start_time
            
            # Log exception
            logger.error(
                f"Exception during request processing: {str(exc)}",
                extra={
                    "request_id": request_id,
                    "method": method,
                    "path": path,
                    "process_time": process_time,
                    "exception": str(exc)
                }
            )
            
            # Re-raise exception for error handler
            raise

def log_function_call(func):
    """
    Decorator to log function calls
    
    Args:
        func: Function to decorate
        
    Returns:
        Decorated function
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Get function details
        func_name = func.__name__
        module_name = func.__module__
        
        # Log function call
        logger.debug(
            f"Calling {module_name}.{func_name}",
            extra={
                "function": func_name,
                "module": module_name,
                "args_count": len(args),
                "kwargs_count": len(kwargs)
            }
        )
        
        # Measure function execution time
        start_time = time.time()
        
        try:
            # Call function
            result = func(*args, **kwargs)
            
            # Calculate execution time
            exec_time = time.time() - start_time
            
            # Log function result
            logger.debug(
                f"Function {module_name}.{func_name} completed in {exec_time:.4f}s",
                extra={
                    "function": func_name,
                    "module": module_name,
                    "exec_time": exec_time
                }
            )
            
            return result
        except Exception as exc:
            # Calculate execution time
            exec_time = time.time() - start_time
            
            # Log exception
            logger.error(
                f"Exception in {module_name}.{func_name}: {str(exc)}",
                extra={
                    "function": func_name,
                    "module": module_name,
                    "exec_time": exec_time,
                    "exception": str(exc)
                }
            )
            
            # Re-raise exception
            raise
    
    return wrapper

def configure_app_logging(app):
    """
    Configure application logging
    
    Args:
        app: FastAPI application
    """
    # Add exception handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request, exc):
        return ErrorHandler.handle_exception(request, exc)
    
    # Add middleware for request logging
    @app.middleware("http")
    async def request_logger_middleware(request, call_next):
        return await RequestLogger.log_request(request, call_next)
    
    logger.info("Application logging configured")

# Export logger
get_logger = lambda name=None: logging.getLogger(name or "segmentation_service")
