"""
Enhanced Error Handling and Logging System

This module provides a comprehensive error handling and logging system for the Segmentation Service.
It includes custom error classes, error codes, and a configurable logging system.
"""

import sys
import time
import json
import logging
import logging.handlers
import traceback
import os
from enum import Enum, auto
from functools import wraps
from typing import Dict, Any, Optional, Callable, List, Union, Type
from pathlib import Path
from fastapi import Request, Response, FastAPI
from pydantic import BaseModel, Field

# Default configuration
DEFAULT_LOG_LEVEL = "INFO"
DEFAULT_LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - [%(request_id)s] - %(message)s"
DEFAULT_LOG_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"
DEFAULT_LOG_DIR = "./logs"
DEFAULT_LOG_FILENAME = "segmentation_service.log"
DEFAULT_LOG_MAX_BYTES = 10 * 1024 * 1024  # 10 MB
DEFAULT_LOG_BACKUP_COUNT = 5
DEFAULT_METRICS_INTERVAL = 60  # seconds

# Create logs directory if it doesn't exist
log_dir = Path(os.environ.get("LOG_DIR", DEFAULT_LOG_DIR))
log_dir.mkdir(exist_ok=True)

# Error codes enum
class ErrorCode(str, Enum):
    """Error codes for the Segmentation Service"""
    # General errors (1000-1999)
    UNKNOWN_ERROR = "SE-1000"
    INTERNAL_SERVER_ERROR = "SE-1001"
    SERVICE_UNAVAILABLE = "SE-1002"
    TIMEOUT_ERROR = "SE-1003"
    CONFIGURATION_ERROR = "SE-1004"
    
    # Validation errors (2000-2999)
    VALIDATION_ERROR = "SE-2000"
    INVALID_REQUEST = "SE-2001"
    INVALID_PARAMETER = "SE-2002"
    MISSING_PARAMETER = "SE-2003"
    INVALID_FORMAT = "SE-2004"
    
    # Processing errors (3000-3999)
    PROCESSING_ERROR = "SE-3000"
    SEGMENTATION_ERROR = "SE-3001"
    PRIORITIZATION_ERROR = "SE-3002"
    PARSING_ERROR = "SE-3003"
    VISUALIZATION_ERROR = "SE-3004"
    
    # Data errors (4000-4999)
    DATA_ERROR = "SE-4000"
    FILE_NOT_FOUND = "SE-4001"
    FILE_ACCESS_ERROR = "SE-4002"
    DATA_CORRUPTION = "SE-4003"
    SERIALIZATION_ERROR = "SE-4004"
    
    # Integration errors (5000-5999)
    INTEGRATION_ERROR = "SE-5000"
    COMMUNICATION_ERROR = "SE-5001"
    DEPENDENCY_ERROR = "SE-5002"
    API_ERROR = "SE-5003"
    AUTHENTICATION_ERROR = "SE-5004"

# Error severity levels
class ErrorSeverity(str, Enum):
    """Error severity levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

# Custom error response model
class ErrorResponse(BaseModel):
    """Error response model"""
    code: str = Field(..., description="Error code")
    message: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Error details")
    severity: ErrorSeverity = Field(ErrorSeverity.MEDIUM, description="Error severity")
    request_id: Optional[str] = Field(None, description="Request ID")
    timestamp: str = Field(..., description="Error timestamp")
    trace_id: Optional[str] = Field(None, description="Trace ID for distributed tracing")
    
    class Config:
        schema_extra = {
            "example": {
                "code": "SE-1001",
                "message": "Internal server error",
                "details": {"reason": "Unexpected exception"},
                "severity": "high",
                "request_id": "123e4567-e89b-12d3-a456-426614174000",
                "timestamp": "2023-01-01T12:00:00Z",
                "trace_id": "abcdef123456"
            }
        }

# Base exception class
class SegmentationError(Exception):
    """Base exception class for Segmentation Service"""
    
    def __init__(
        self,
        message: str,
        code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
        details: Optional[Dict[str, Any]] = None,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        cause: Optional[Exception] = None
    ):
        """
        Initialize SegmentationError
        
        Args:
            message: Error message
            code: Error code
            details: Error details
            severity: Error severity
            cause: Cause exception
        """
        self.message = message
        self.code = code
        self.details = details or {}
        self.severity = severity
        self.cause = cause
        self.timestamp = time.time()
        
        # Add cause information to details if available
        if cause:
            self.details["cause"] = str(cause)
            self.details["cause_type"] = type(cause).__name__
        
        super().__init__(message)
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert exception to dictionary
        
        Returns:
            Exception as dictionary
        """
        return {
            "code": self.code,
            "message": self.message,
            "details": self.details,
            "severity": self.severity,
            "timestamp": self.timestamp
        }
    
    def to_response(self, request_id: Optional[str] = None, trace_id: Optional[str] = None) -> ErrorResponse:
        """
        Convert exception to error response
        
        Args:
            request_id: Request ID
            trace_id: Trace ID
            
        Returns:
            Error response
        """
        return ErrorResponse(
            code=self.code,
            message=self.message,
            details=self.details,
            severity=self.severity,
            request_id=request_id,
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(self.timestamp)),
            trace_id=trace_id
        )

# Validation error
class ValidationError(SegmentationError):
    """Validation error"""
    
    def __init__(
        self,
        message: str,
        code: ErrorCode = ErrorCode.VALIDATION_ERROR,
        details: Optional[Dict[str, Any]] = None,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        cause: Optional[Exception] = None
    ):
        """
        Initialize ValidationError
        
        Args:
            message: Error message
            code: Error code
            details: Error details
            severity: Error severity
            cause: Cause exception
        """
        super().__init__(message, code, details, severity, cause)

# Processing error
class ProcessingError(SegmentationError):
    """Processing error"""
    
    def __init__(
        self,
        message: str,
        code: ErrorCode = ErrorCode.PROCESSING_ERROR,
        details: Optional[Dict[str, Any]] = None,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        cause: Optional[Exception] = None
    ):
        """
        Initialize ProcessingError
        
        Args:
            message: Error message
            code: Error code
            details: Error details
            severity: Error severity
            cause: Cause exception
        """
        super().__init__(message, code, details, severity, cause)

# Data error
class DataError(SegmentationError):
    """Data error"""
    
    def __init__(
        self,
        message: str,
        code: ErrorCode = ErrorCode.DATA_ERROR,
        details: Optional[Dict[str, Any]] = None,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        cause: Optional[Exception] = None
    ):
        """
        Initialize DataError
        
        Args:
            message: Error message
            code: Error code
            details: Error details
            severity: Error severity
            cause: Cause exception
        """
        super().__init__(message, code, details, severity, cause)

# Integration error
class IntegrationError(SegmentationError):
    """Integration error"""
    
    def __init__(
        self,
        message: str,
        code: ErrorCode = ErrorCode.INTEGRATION_ERROR,
        details: Optional[Dict[str, Any]] = None,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        cause: Optional[Exception] = None
    ):
        """
        Initialize IntegrationError
        
        Args:
            message: Error message
            code: Error code
            details: Error details
            severity: Error severity
            cause: Cause exception
        """
        super().__init__(message, code, details, severity, cause)

# Specific error subclasses
class SegmentationProcessingError(ProcessingError):
    """Segmentation processing error"""
    
    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        severity: ErrorSeverity = ErrorSeverity.HIGH,
        cause: Optional[Exception] = None
    ):
        """
        Initialize SegmentationProcessingError
        
        Args:
            message: Error message
            details: Error details
            severity: Error severity
            cause: Cause exception
        """
        super().__init__(message, ErrorCode.SEGMENTATION_ERROR, details, severity, cause)

class PrioritizationError(ProcessingError):
    """Prioritization error"""
    
    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        cause: Optional[Exception] = None
    ):
        """
        Initialize PrioritizationError
        
        Args:
            message: Error message
            details: Error details
            severity: Error severity
            cause: Cause exception
        """
        super().__init__(message, ErrorCode.PRIORITIZATION_ERROR, details, severity, cause)

class ParsingError(ProcessingError):
    """Parsing error"""
    
    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        cause: Optional[Exception] = None
    ):
        """
        Initialize ParsingError
        
        Args:
            message: Error message
            details: Error details
            severity: Error severity
            cause: Cause exception
        """
        super().__init__(message, ErrorCode.PARSING_ERROR, details, severity, cause)

class VisualizationError(ProcessingError):
    """Visualization error"""
    
    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        severity: ErrorSeverity = ErrorSeverity.LOW,
        cause: Optional[Exception] = None
    ):
        """
        Initialize VisualizationError
        
        Args:
            message: Error message
            details: Error details
            severity: Error severity
            cause: Cause exception
        """
        super().__init__(message, ErrorCode.VISUALIZATION_ERROR, details, severity, cause)

class FileNotFoundError(DataError):
    """File not found error"""
    
    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        cause: Optional[Exception] = None
    ):
        """
        Initialize FileNotFoundError
        
        Args:
            message: Error message
            details: Error details
            severity: Error severity
            cause: Cause exception
        """
        super().__init__(message, ErrorCode.FILE_NOT_FOUND, details, severity, cause)

class FileAccessError(DataError):
    """File access error"""
    
    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        cause: Optional[Exception] = None
    ):
        """
        Initialize FileAccessError
        
        Args:
            message: Error message
            details: Error details
            severity: Error severity
            cause: Cause exception
        """
        super().__init__(message, ErrorCode.FILE_ACCESS_ERROR, details, severity, cause)

# Error mapping
ERROR_MAPPING = {
    ValueError: (ValidationError, "Validation error"),
    TypeError: (ValidationError, "Type error"),
    KeyError: (DataError, "Key error"),
    IndexError: (DataError, "Index error"),
    FileNotFoundError: (FileNotFoundError, "File not found"),
    PermissionError: (FileAccessError, "Permission denied"),
    TimeoutError: (IntegrationError, "Timeout error"),
    ConnectionError: (IntegrationError, "Connection error"),
    Exception: (SegmentationError, "Unexpected error")
}

# Logging configuration
class LoggingConfig:
    """Logging configuration"""
    
    def __init__(
        self,
        level: str = DEFAULT_LOG_LEVEL,
        format: str = DEFAULT_LOG_FORMAT,
        date_format: str = DEFAULT_LOG_DATE_FORMAT,
        log_dir: str = DEFAULT_LOG_DIR,
        log_filename: str = DEFAULT_LOG_FILENAME,
        log_to_console: bool = True,
        log_to_file: bool = True,
        max_bytes: int = DEFAULT_LOG_MAX_BYTES,
        backup_count: int = DEFAULT_LOG_BACKUP_COUNT
    ):
        """
        Initialize LoggingConfig
        
        Args:
            level: Log level
            format: Log format
            date_format: Log date format
            log_dir: Log directory
            log_filename: Log filename
            log_to_console: Whether to log to console
            log_to_file: Whether to log to file
            max_bytes: Maximum log file size in bytes
            backup_count: Number of backup log files
        """
        self.level = level
        self.format = format
        self.date_format = date_format
        self.log_dir = log_dir
        self.log_filename = log_filename
        self.log_to_console = log_to_console
        self.log_to_file = log_to_file
        self.max_bytes = max_bytes
        self.backup_count = backup_count
    
    @property
    def log_path(self) -> str:
        """
        Get log file path
        
        Returns:
            Log file path
        """
        return os.path.join(self.log_dir, self.log_filename)
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert configuration to dictionary
        
        Returns:
            Configuration as dictionary
        """
        return {
            "level": self.level,
            "format": self.format,
            "date_format": self.date_format,
            "log_dir": self.log_dir,
            "log_filename": self.log_filename,
            "log_to_console": self.log_to_console,
            "log_to_file": self.log_to_file,
            "max_bytes": self.max_bytes,
            "backup_count": self.backup_count
        }
    
    @classmethod
    def from_dict(cls, config_dict: Dict[str, Any]) -> 'LoggingConfig':
        """
        Create configuration from dictionary
        
        Args:
            config_dict: Configuration dictionary
            
        Returns:
            LoggingConfig instance
        """
        return cls(**config_dict)
    
    @classmethod
    def from_env(cls) -> 'LoggingConfig':
        """
        Create configuration from environment variables
        
        Returns:
            LoggingConfig instance
        """
        return cls(
            level=os.environ.get("LOG_LEVEL", DEFAULT_LOG_LEVEL),
            format=os.environ.get("LOG_FORMAT", DEFAULT_LOG_FORMAT),
            date_format=os.environ.get("LOG_DATE_FORMAT", DEFAULT_LOG_DATE_FORMAT),
            log_dir=os.environ.get("LOG_DIR", DEFAULT_LOG_DIR),
            log_filename=os.environ.get("LOG_FILENAME", DEFAULT_LOG_FILENAME),
            log_to_console=os.environ.get("LOG_TO_CONSOLE", "true").lower() == "true",
            log_to_file=os.environ.get("LOG_TO_FILE", "true").lower() == "true",
            max_bytes=int(os.environ.get("LOG_MAX_BYTES", DEFAULT_LOG_MAX_BYTES)),
            backup_count=int(os.environ.get("LOG_BACKUP_COUNT", DEFAULT_LOG_BACKUP_COUNT))
        )

# Request ID filter
class RequestIdFilter(logging.Filter):
    """Filter to add request ID to log records"""
    
    def __init__(self, default_request_id: str = "no-request-id"):
        """
        Initialize RequestIdFilter
        
        Args:
            default_request_id: Default request ID
        """
        super().__init__()
        self.default_request_id = default_request_id
    
    def filter(self, record):
        """
        Filter log record
        
        Args:
            record: Log record
            
        Returns:
            Whether to include the record
        """
        if not hasattr(record, "request_id"):
            record.request_id = self.default_request_id
        return True

# Trace ID filter
class TraceIdFilter(logging.Filter):
    """Filter to add trace ID to log records"""
    
    def __init__(self, default_trace_id: str = "no-trace-id"):
        """
        Initialize TraceIdFilter
        
        Args:
            default_trace_id: Default trace ID
        """
        super().__init__()
        self.default_trace_id = default_trace_id
    
    def filter(self, record):
        """
        Filter log record
        
        Args:
            record: Log record
            
        Returns:
            Whether to include the record
        """
        if not hasattr(record, "trace_id"):
            record.trace_id = self.default_trace_id
        return True

# JSON formatter
class JsonFormatter(logging.Formatter):
    """JSON formatter for log records"""
    
    def __init__(self, fmt=None, datefmt=None, style='%'):
        """
        Initialize JsonFormatter
        
        Args:
            fmt: Format string
            datefmt: Date format string
            style: Style
        """
        super().__init__(fmt, datefmt, style)
    
    def format(self, record):
        """
        Format log record as JSON
        
        Args:
            record: Log record
            
        Returns:
            Formatted log record
        """
        log_data = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
            "request_id": getattr(record, "request_id", "no-request-id"),
            "trace_id": getattr(record, "trace_id", "no-trace-id")
        }
        
        # Add extra attributes
        for key, value in record.__dict__.items():
            if key not in ["args", "asctime", "created", "exc_info", "exc_text", "filename",
                          "funcName", "id", "levelname", "levelno", "lineno", "module",
                          "msecs", "message", "msg", "name", "pathname", "process",
                          "processName", "relativeCreated", "stack_info", "thread", "threadName",
                          "request_id", "trace_id"]:
                log_data[key] = value
        
        # Add exception info if available
        if record.exc_info:
            log_data["exception"] = {
                "type": record.exc_info[0].__name__,
                "message": str(record.exc_info[1]),
                "traceback": traceback.format_exception(*record.exc_info)
            }
        
        return json.dumps(log_data)

# Logging manager
class LoggingManager:
    """Logging manager for the Segmentation Service"""
    
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        """
        Create singleton instance
        
        Returns:
            LoggingManager instance
        """
        if cls._instance is None:
            cls._instance = super(LoggingManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self, config: Optional[LoggingConfig] = None):
        """
        Initialize LoggingManager
        
        Args:
            config: Logging configuration
        """
        if self._initialized:
            return
        
        self.config = config or LoggingConfig.from_env()
        self.root_logger = logging.getLogger()
        self.service_logger = logging.getLogger("segmentation_service")
        self.request_id_filter = RequestIdFilter()
        self.trace_id_filter = TraceIdFilter()
        self.handlers = []
        
        # Configure logging
        self._configure_logging()
        
        self._initialized = True
    
    def _configure_logging(self):
        """Configure logging"""
        # Reset handlers
        self.root_logger.handlers = []
        self.service_logger.handlers = []
        self.handlers = []
        
        # Set log level
        level = getattr(logging, self.config.level.upper(), logging.INFO)
        self.root_logger.setLevel(level)
        self.service_logger.setLevel(level)
        
        # Add filters
        self.service_logger.addFilter(self.request_id_filter)
        self.service_logger.addFilter(self.trace_id_filter)
        
        # Create formatters
        text_formatter = logging.Formatter(
            fmt=self.config.format,
            datefmt=self.config.date_format
        )
        json_formatter = JsonFormatter(datefmt=self.config.date_format)
        
        # Add console handler
        if self.config.log_to_console:
            console_handler = logging.StreamHandler(sys.stdout)
            console_handler.setFormatter(text_formatter)
            self.service_logger.addHandler(console_handler)
            self.handlers.append(console_handler)
        
        # Add file handler
        if self.config.log_to_file:
            # Create log directory if it doesn't exist
            os.makedirs(self.config.log_dir, exist_ok=True)
            
            # Create rotating file handler
            file_handler = logging.handlers.RotatingFileHandler(
                filename=self.config.log_path,
                maxBytes=self.config.max_bytes,
                backupCount=self.config.backup_count
            )
            file_handler.setFormatter(text_formatter)
            self.service_logger.addHandler(file_handler)
            self.handlers.append(file_handler)
            
            # Create JSON file handler
            json_file_handler = logging.handlers.RotatingFileHandler(
                filename=os.path.join(self.config.log_dir, "json_" + self.config.log_filename),
                maxBytes=self.config.max_bytes,
                backupCount=self.config.backup_count
            )
            json_file_handler.setFormatter(json_formatter)
            self.service_logger.addHandler(json_file_handler)
            self.handlers.append(json_file_handler)
        
        self.service_logger.info(
            "Logging configured",
            extra={"config": self.config.to_dict()}
        )
    
    def update_config(self, config: LoggingConfig):
        """
        Update logging configuration
        
        Args:
            config: New logging configuration
        """
        self.config = config
        self._configure_logging()
        self.service_logger.info(
            "Logging configuration updated",
            extra={"config": self.config.to_dict()}
        )
    
    def get_logger(self, name: Optional[str] = None) -> logging.Logger:
        """
        Get logger
        
        Args:
            name: Logger name
            
        Returns:
            Logger
        """
        if name:
            logger = logging.getLogger(name)
            logger.addFilter(self.request_id_filter)
            logger.addFilter(self.trace_id_filter)
            return logger
        return self.service_logger
    
    def set_request_id(self, request_id: str):
        """
        Set request ID for current thread
        
        Args:
            request_id: Request ID
        """
        self.request_id_filter.default_request_id = request_id
    
    def set_trace_id(self, trace_id: str):
        """
        Set trace ID for current thread
        
        Args:
            trace_id: Trace ID
        """
        self.trace_id_filter.default_trace_id = trace_id

# Metrics collector
class MetricsCollector:
    """Metrics collector for the Segmentation Service"""
    
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        """
        Create singleton instance
        
        Returns:
            MetricsCollector instance
        """
        if cls._instance is None:
            cls._instance = super(MetricsCollector, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self, interval: int = DEFAULT_METRICS_INTERVAL):
        """
        Initialize MetricsCollector
        
        Args:
            interval: Metrics collection interval in seconds
        """
        if self._initialized:
            return
        
        self.interval = interval
        self.logger = logging.getLogger("segmentation_service.metrics")
        self.metrics = {
            "requests": {
                "total": 0,
                "success": 0,
                "error": 0,
                "by_path": {}
            },
            "errors": {
                "total": 0,
                "by_code": {}
            },
            "response_times": {
                "total": 0,
                "count": 0,
                "min": float("inf"),
                "max": 0,
                "by_path": {}
            },
            "start_time": time.time()
        }
        
        self._initialized = True
    
    def record_request(self, path: str, method: str, status_code: int, response_time: float):
        """
        Record request metrics
        
        Args:
            path: Request path
            method: Request method
            status_code: Response status code
            response_time: Response time in seconds
        """
        # Update request counts
        self.metrics["requests"]["total"] += 1
        
        if status_code < 400:
            self.metrics["requests"]["success"] += 1
        else:
            self.metrics["requests"]["error"] += 1
        
        # Update path-specific metrics
        path_key = f"{method}:{path}"
        if path_key not in self.metrics["requests"]["by_path"]:
            self.metrics["requests"]["by_path"][path_key] = {
                "total": 0,
                "success": 0,
                "error": 0
            }
        
        self.metrics["requests"]["by_path"][path_key]["total"] += 1
        
        if status_code < 400:
            self.metrics["requests"]["by_path"][path_key]["success"] += 1
        else:
            self.metrics["requests"]["by_path"][path_key]["error"] += 1
        
        # Update response time metrics
        self.metrics["response_times"]["total"] += response_time
        self.metrics["response_times"]["count"] += 1
        self.metrics["response_times"]["min"] = min(self.metrics["response_times"]["min"], response_time)
        self.metrics["response_times"]["max"] = max(self.metrics["response_times"]["max"], response_time)
        
        if path_key not in self.metrics["response_times"]["by_path"]:
            self.metrics["response_times"]["by_path"][path_key] = {
                "total": 0,
                "count": 0,
                "min": float("inf"),
                "max": 0
            }
        
        path_metrics = self.metrics["response_times"]["by_path"][path_key]
        path_metrics["total"] += response_time
        path_metrics["count"] += 1
        path_metrics["min"] = min(path_metrics["min"], response_time)
        path_metrics["max"] = max(path_metrics["max"], response_time)
    
    def record_error(self, error_code: str):
        """
        Record error metrics
        
        Args:
            error_code: Error code
        """
        # Update error counts
        self.metrics["errors"]["total"] += 1
        
        if error_code not in self.metrics["errors"]["by_code"]:
            self.metrics["errors"]["by_code"][error_code] = 0
        
        self.metrics["errors"]["by_code"][error_code] += 1
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get current metrics
        
        Returns:
            Current metrics
        """
        # Calculate derived metrics
        uptime = time.time() - self.metrics["start_time"]
        
        # Calculate average response time
        avg_response_time = 0
        if self.metrics["response_times"]["count"] > 0:
            avg_response_time = self.metrics["response_times"]["total"] / self.metrics["response_times"]["count"]
        
        # Calculate path-specific average response times
        for path_key, path_metrics in self.metrics["response_times"]["by_path"].items():
            if path_metrics["count"] > 0:
                path_metrics["avg"] = path_metrics["total"] / path_metrics["count"]
            else:
                path_metrics["avg"] = 0
        
        # Calculate request rate
        request_rate = self.metrics["requests"]["total"] / uptime if uptime > 0 else 0
        
        # Calculate error rate
        error_rate = 0
        if self.metrics["requests"]["total"] > 0:
            error_rate = self.metrics["requests"]["error"] / self.metrics["requests"]["total"]
        
        return {
            "requests": self.metrics["requests"],
            "errors": self.metrics["errors"],
            "response_times": {
                "avg": avg_response_time,
                "min": self.metrics["response_times"]["min"] if self.metrics["response_times"]["min"] != float("inf") else 0,
                "max": self.metrics["response_times"]["max"],
                "by_path": self.metrics["response_times"]["by_path"]
            },
            "uptime": uptime,
            "request_rate": request_rate,
            "error_rate": error_rate,
            "timestamp": time.time()
        }
    
    def log_metrics(self):
        """Log current metrics"""
        metrics = self.get_metrics()
        self.logger.info(
            "Service metrics",
            extra={"metrics": metrics}
        )
    
    def reset_metrics(self):
        """Reset metrics"""
        self.metrics = {
            "requests": {
                "total": 0,
                "success": 0,
                "error": 0,
                "by_path": {}
            },
            "errors": {
                "total": 0,
                "by_code": {}
            },
            "response_times": {
                "total": 0,
                "count": 0,
                "min": float("inf"),
                "max": 0,
                "by_path": {}
            },
            "start_time": time.time()
        }
        self.logger.info("Metrics reset")

# Error handler
class ErrorHandler:
    """Error handler for the Segmentation Service"""
    
    @staticmethod
    def handle_exception(request: Request, exc: Exception) -> Response:
        """
        Handle exception
        
        Args:
            request: FastAPI request
            exc: Exception
            
        Returns:
            FastAPI response
        """
        # Get logger
        logger = logging.getLogger("segmentation_service.error_handler")
        
        # Get request ID
        request_id = getattr(request.state, "request_id", "unknown")
        
        # Get trace ID
        trace_id = request.headers.get("X-Trace-ID", "unknown")
        
        # Get metrics collector
        metrics_collector = MetricsCollector()
        
        # Handle SegmentationError
        if isinstance(exc, SegmentationError):
            # Log error
            logger.error(
                f"SegmentationError: {exc.message}",
                extra={
                    "request_id": request_id,
                    "trace_id": trace_id,
                    "error_code": exc.code,
                    "error_details": exc.details,
                    "error_severity": exc.severity
                },
                exc_info=True
            )
            
            # Record error metrics
            metrics_collector.record_error(exc.code)
            
            # Create error response
            error_response = exc.to_response(request_id, trace_id)
            
            # Determine status code based on error code
            status_code = 500
            if exc.code.startswith("SE-2"):
                status_code = 400
            elif exc.code.startswith("SE-4"):
                status_code = 404
            elif exc.code.startswith("SE-5"):
                status_code = 503
            
            # Return response
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=status_code,
                content=error_response.dict()
            )
        
        # Map standard exceptions to SegmentationError
        for exc_type, (error_class, error_message) in ERROR_MAPPING.items():
            if isinstance(exc, exc_type):
                # Create SegmentationError
                segmentation_error = error_class(
                    message=f"{error_message}: {str(exc)}",
                    details={"exception_type": type(exc).__name__},
                    cause=exc
                )
                
                # Handle SegmentationError
                return ErrorHandler.handle_exception(request, segmentation_error)
        
        # Handle unknown exceptions
        logger.error(
            f"Unhandled exception: {str(exc)}",
            extra={
                "request_id": request_id,
                "trace_id": trace_id,
                "exception_type": type(exc).__name__
            },
            exc_info=True
        )
        
        # Record error metrics
        metrics_collector.record_error(ErrorCode.UNKNOWN_ERROR)
        
        # Create error response
        error_response = ErrorResponse(
            code=ErrorCode.UNKNOWN_ERROR,
            message=f"Unhandled exception: {str(exc)}",
            details={"exception_type": type(exc).__name__},
            severity=ErrorSeverity.HIGH,
            request_id=request_id,
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            trace_id=trace_id
        )
        
        # Return response
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content=error_response.dict()
        )

# Request logger
class RequestLogger:
    """Request logger for the Segmentation Service"""
    
    @staticmethod
    async def log_request(request: Request, call_next):
        """
        Log request
        
        Args:
            request: FastAPI request
            call_next: Next middleware function
            
        Returns:
            FastAPI response
        """
        # Get logger
        logger = logging.getLogger("segmentation_service.request_logger")
        
        # Get metrics collector
        metrics_collector = MetricsCollector()
        
        # Generate request ID if not provided
        request_id = request.headers.get("X-Request-ID", str(time.time_ns()))
        
        # Add request ID to request state
        request.state.request_id = request_id
        
        # Get trace ID
        trace_id = request.headers.get("X-Trace-ID", "unknown")
        
        # Set request ID and trace ID for logging
        logging_manager = LoggingManager()
        logging_manager.set_request_id(request_id)
        logging_manager.set_trace_id(trace_id)
        
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
                "trace_id": trace_id,
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
                    "trace_id": trace_id,
                    "method": method,
                    "path": path,
                    "status_code": response.status_code,
                    "process_time": process_time
                }
            )
            
            # Record request metrics
            metrics_collector.record_request(path, method, response.status_code, process_time)
            
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
                    "trace_id": trace_id,
                    "method": method,
                    "path": path,
                    "process_time": process_time,
                    "exception": str(exc),
                    "exception_type": type(exc).__name__
                },
                exc_info=True
            )
            
            # Record request metrics (as error)
            metrics_collector.record_request(path, method, 500, process_time)
            
            # Re-raise exception for error handler
            raise

# Function logging decorator
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
        # Get logger
        logger = logging.getLogger("segmentation_service.function_logger")
        
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
                    "exception": str(exc),
                    "exception_type": type(exc).__name__
                },
                exc_info=True
            )
            
            # Re-raise exception
            raise
    
    return wrapper

# Async function logging decorator
def log_async_function_call(func):
    """
    Decorator to log async function calls
    
    Args:
        func: Async function to decorate
        
    Returns:
        Decorated async function
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # Get logger
        logger = logging.getLogger("segmentation_service.function_logger")
        
        # Get function details
        func_name = func.__name__
        module_name = func.__module__
        
        # Log function call
        logger.debug(
            f"Calling async {module_name}.{func_name}",
            extra={
                "function": func_name,
                "module": module_name,
                "args_count": len(args),
                "kwargs_count": len(kwargs),
                "async": True
            }
        )
        
        # Measure function execution time
        start_time = time.time()
        
        try:
            # Call function
            result = await func(*args, **kwargs)
            
            # Calculate execution time
            exec_time = time.time() - start_time
            
            # Log function result
            logger.debug(
                f"Async function {module_name}.{func_name} completed in {exec_time:.4f}s",
                extra={
                    "function": func_name,
                    "module": module_name,
                    "exec_time": exec_time,
                    "async": True
                }
            )
            
            return result
        except Exception as exc:
            # Calculate execution time
            exec_time = time.time() - start_time
            
            # Log exception
            logger.error(
                f"Exception in async {module_name}.{func_name}: {str(exc)}",
                extra={
                    "function": func_name,
                    "module": module_name,
                    "exec_time": exec_time,
                    "exception": str(exc),
                    "exception_type": type(exc).__name__,
                    "async": True
                },
                exc_info=True
            )
            
            # Re-raise exception
            raise
    
    return wrapper

# Health check
class HealthCheck:
    """Health check for the Segmentation Service"""
    
    @staticmethod
    def check_health() -> Dict[str, Any]:
        """
        Check service health
        
        Returns:
            Health check result
        """
        # Get metrics
        metrics_collector = MetricsCollector()
        metrics = metrics_collector.get_metrics()
        
        # Check health
        status = "UP"
        details = {
            "uptime": metrics["uptime"],
            "request_rate": metrics["request_rate"],
            "error_rate": metrics["error_rate"],
            "avg_response_time": metrics["response_times"]["avg"]
        }
        
        # Check error rate
        if metrics["error_rate"] > 0.1:  # More than 10% errors
            status = "DEGRADED"
            details["degraded_reason"] = "High error rate"
        
        # Check response time
        if metrics["response_times"]["avg"] > 1.0:  # More than 1 second average response time
            status = "DEGRADED"
            details["degraded_reason"] = "High response time"
        
        return {
            "status": status,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "details": details
        }
    
    @staticmethod
    def check_readiness() -> Dict[str, Any]:
        """
        Check service readiness
        
        Returns:
            Readiness check result
        """
        # Check dependencies
        dependencies = {
            "database": "UP",
            "api_gateway": "UP",
            "runner_service": "UP"
        }
        
        # Check overall status
        status = "READY"
        if "DOWN" in dependencies.values():
            status = "NOT_READY"
        
        return {
            "status": status,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "dependencies": dependencies
        }
    
    @staticmethod
    def check_liveness() -> Dict[str, Any]:
        """
        Check service liveness
        
        Returns:
            Liveness check result
        """
        return {
            "status": "ALIVE",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }

# Configure application
def configure_app_logging(app: FastAPI):
    """
    Configure application logging
    
    Args:
        app: FastAPI application
    """
    # Initialize logging manager
    logging_manager = LoggingManager()
    logger = logging_manager.get_logger()
    
    # Add exception handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request, exc):
        return ErrorHandler.handle_exception(request, exc)
    
    # Add middleware for request logging
    @app.middleware("http")
    async def request_logger_middleware(request, call_next):
        return await RequestLogger.log_request(request, call_next)
    
    # Add health check endpoints
    @app.get("/health")
    def health_check():
        return HealthCheck.check_health()
    
    @app.get("/health/ready")
    def readiness_check():
        return HealthCheck.check_readiness()
    
    @app.get("/health/live")
    def liveness_check():
        return HealthCheck.check_liveness()
    
    # Add metrics endpoint
    @app.get("/metrics")
    def get_metrics():
        metrics_collector = MetricsCollector()
        return metrics_collector.get_metrics()
    
    # Add logging configuration endpoint
    @app.get("/logging/config")
    def get_logging_config():
        return logging_manager.config.to_dict()
    
    @app.post("/logging/config")
    def update_logging_config(config: Dict[str, Any]):
        new_config = LoggingConfig.from_dict(config)
        logging_manager.update_config(new_config)
        return {"status": "success", "config": new_config.to_dict()}
    
    logger.info("Application logging configured")

# Get logger
def get_logger(name: Optional[str] = None) -> logging.Logger:
    """
    Get logger
    
    Args:
        name: Logger name
        
    Returns:
        Logger
    """
    logging_manager = LoggingManager()
    return logging_manager.get_logger(name)

# Initialize logging
logging_manager = LoggingManager()
logger = logging_manager.get_logger()

# Initialize metrics collector
metrics_collector = MetricsCollector()

# Export logger
__all__ = [
    "ErrorCode",
    "ErrorSeverity",
    "ErrorResponse",
    "SegmentationError",
    "ValidationError",
    "ProcessingError",
    "DataError",
    "IntegrationError",
    "SegmentationProcessingError",
    "PrioritizationError",
    "ParsingError",
    "VisualizationError",
    "FileNotFoundError",
    "FileAccessError",
    "LoggingConfig",
    "LoggingManager",
    "MetricsCollector",
    "ErrorHandler",
    "RequestLogger",
    "HealthCheck",
    "log_function_call",
    "log_async_function_call",
    "configure_app_logging",
    "get_logger"
]
