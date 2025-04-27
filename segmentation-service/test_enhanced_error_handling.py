#!/usr/bin/env python3
"""
Test for Enhanced Error Handling and Logging System

This module contains tests for the enhanced error handling and logging system.
"""

import unittest
import os
import json
import logging
import tempfile
import time
from unittest.mock import MagicMock, patch, AsyncMock
from pathlib import Path
from fastapi import FastAPI, Request, Response
from fastapi.testclient import TestClient

from enhanced_error_handling import (
    ErrorCode, ErrorSeverity, ErrorResponse, SegmentationError,
    ValidationError, ProcessingError, DataError, IntegrationError,
    SegmentationProcessingError, PrioritizationError, ParsingError,
    VisualizationError, CustomFileNotFoundError, FileAccessError,
    LoggingConfig, LoggingManager, MetricsCollector, ErrorHandler,
    RequestLogger, HealthCheck, log_function_call, log_async_function_call,
    configure_app_logging, get_logger
)

class TestErrorClasses(unittest.TestCase):
    """Test cases for custom error classes"""
    
    def test_segmentation_error(self):
        """Test SegmentationError class"""
        # Create error
        error = SegmentationError(
            message="Test error",
            code=ErrorCode.UNKNOWN_ERROR,
            details={"test": "value"},
            severity=ErrorSeverity.MEDIUM
        )
        
        # Verify error properties
        self.assertEqual(error.message, "Test error")
        self.assertEqual(error.code, ErrorCode.UNKNOWN_ERROR)
        self.assertEqual(error.details, {"test": "value"})
        self.assertEqual(error.severity, ErrorSeverity.MEDIUM)
        self.assertIsNone(error.cause)
        
        # Verify to_dict method
        error_dict = error.to_dict()
        self.assertEqual(error_dict["message"], "Test error")
        self.assertEqual(error_dict["code"], ErrorCode.UNKNOWN_ERROR)
        self.assertEqual(error_dict["details"], {"test": "value"})
        self.assertEqual(error_dict["severity"], ErrorSeverity.MEDIUM)
        
        # Verify to_response method
        error_response = error.to_response(request_id="test-request-id", trace_id="test-trace-id")
        self.assertEqual(error_response.code, ErrorCode.UNKNOWN_ERROR)
        self.assertEqual(error_response.message, "Test error")
        self.assertEqual(error_response.details, {"test": "value"})
        self.assertEqual(error_response.severity, ErrorSeverity.MEDIUM)
        self.assertEqual(error_response.request_id, "test-request-id")
        self.assertEqual(error_response.trace_id, "test-trace-id")
    
    def test_segmentation_error_with_cause(self):
        """Test SegmentationError with cause exception"""
        # Create cause exception
        cause = ValueError("Cause error")
        
        # Create error with cause
        error = SegmentationError(
            message="Test error with cause",
            code=ErrorCode.UNKNOWN_ERROR,
            details={"test": "value"},
            severity=ErrorSeverity.HIGH,
            cause=cause
        )
        
        # Verify error properties
        self.assertEqual(error.message, "Test error with cause")
        self.assertEqual(error.code, ErrorCode.UNKNOWN_ERROR)
        self.assertEqual(error.details["test"], "value")
        self.assertEqual(error.details["cause"], "Cause error")
        self.assertEqual(error.details["cause_type"], "ValueError")
        self.assertEqual(error.severity, ErrorSeverity.HIGH)
        self.assertEqual(error.cause, cause)
    
    def test_validation_error(self):
        """Test ValidationError class"""
        # Create error
        error = ValidationError(
            message="Validation failed",
            code=ErrorCode.INVALID_PARAMETER,
            details={"parameter": "test"}
        )
        
        # Verify error properties
        self.assertEqual(error.message, "Validation failed")
        self.assertEqual(error.code, ErrorCode.INVALID_PARAMETER)
        self.assertEqual(error.details, {"parameter": "test"})
        self.assertEqual(error.severity, ErrorSeverity.MEDIUM)
    
    def test_processing_error(self):
        """Test ProcessingError class"""
        # Create error
        error = ProcessingError(
            message="Processing failed",
            code=ErrorCode.PROCESSING_ERROR,
            details={"process": "test"}
        )
        
        # Verify error properties
        self.assertEqual(error.message, "Processing failed")
        self.assertEqual(error.code, ErrorCode.PROCESSING_ERROR)
        self.assertEqual(error.details, {"process": "test"})
        self.assertEqual(error.severity, ErrorSeverity.MEDIUM)
    
    def test_specific_error_classes(self):
        """Test specific error classes"""
        # Test SegmentationProcessingError
        error = SegmentationProcessingError(
            message="Segmentation failed",
            details={"segment": "test"}
        )
        self.assertEqual(error.code, ErrorCode.SEGMENTATION_ERROR)
        self.assertEqual(error.severity, ErrorSeverity.HIGH)
        
        # Test PrioritizationError
        error = PrioritizationError(
            message="Prioritization failed",
            details={"priority": "test"}
        )
        self.assertEqual(error.code, ErrorCode.PRIORITIZATION_ERROR)
        self.assertEqual(error.severity, ErrorSeverity.MEDIUM)
        
        # Test ParsingError
        error = ParsingError(
            message="Parsing failed",
            details={"parser": "test"}
        )
        self.assertEqual(error.code, ErrorCode.PARSING_ERROR)
        self.assertEqual(error.severity, ErrorSeverity.MEDIUM)
        
        # Test VisualizationError
        error = VisualizationError(
            message="Visualization failed",
            details={"chart": "test"}
        )
        self.assertEqual(error.code, ErrorCode.VISUALIZATION_ERROR)
        self.assertEqual(error.severity, ErrorSeverity.LOW)

class TestLoggingConfig(unittest.TestCase):
    """Test cases for LoggingConfig"""
    
    def test_logging_config_defaults(self):
        """Test LoggingConfig with default values"""
        # Create config
        config = LoggingConfig()
        
        # Verify default values
        self.assertEqual(config.level, "INFO")
        self.assertEqual(config.format, "%(asctime)s - %(name)s - %(levelname)s - [%(request_id)s] - %(message)s")
        self.assertEqual(config.log_dir, "./logs")
        self.assertEqual(config.log_filename, "segmentation_service.log")
        self.assertTrue(config.log_to_console)
        self.assertTrue(config.log_to_file)
        
        # Verify log_path
        self.assertEqual(config.log_path, os.path.join("./logs", "segmentation_service.log"))
    
    def test_logging_config_custom_values(self):
        """Test LoggingConfig with custom values"""
        # Create config with custom values
        config = LoggingConfig(
            level="DEBUG",
            format="%(message)s",
            log_dir="/tmp/logs",
            log_filename="test.log",
            log_to_console=False,
            log_to_file=True
        )
        
        # Verify custom values
        self.assertEqual(config.level, "DEBUG")
        self.assertEqual(config.format, "%(message)s")
        self.assertEqual(config.log_dir, "/tmp/logs")
        self.assertEqual(config.log_filename, "test.log")
        self.assertFalse(config.log_to_console)
        self.assertTrue(config.log_to_file)
        
        # Verify log_path
        self.assertEqual(config.log_path, os.path.join("/tmp/logs", "test.log"))
    
    def test_logging_config_to_dict(self):
        """Test LoggingConfig to_dict method"""
        # Create config
        config = LoggingConfig(
            level="DEBUG",
            format="%(message)s",
            log_dir="/tmp/logs",
            log_filename="test.log"
        )
        
        # Convert to dict
        config_dict = config.to_dict()
        
        # Verify dict
        self.assertEqual(config_dict["level"], "DEBUG")
        self.assertEqual(config_dict["format"], "%(message)s")
        self.assertEqual(config_dict["log_dir"], "/tmp/logs")
        self.assertEqual(config_dict["log_filename"], "test.log")
    
    def test_logging_config_from_dict(self):
        """Test LoggingConfig from_dict method"""
        # Create dict
        config_dict = {
            "level": "DEBUG",
            "format": "%(message)s",
            "log_dir": "/tmp/logs",
            "log_filename": "test.log",
            "log_to_console": False,
            "log_to_file": True
        }
        
        # Create config from dict
        config = LoggingConfig.from_dict(config_dict)
        
        # Verify config
        self.assertEqual(config.level, "DEBUG")
        self.assertEqual(config.format, "%(message)s")
        self.assertEqual(config.log_dir, "/tmp/logs")
        self.assertEqual(config.log_filename, "test.log")
        self.assertFalse(config.log_to_console)
        self.assertTrue(config.log_to_file)
    
    @patch.dict(os.environ, {
        "LOG_LEVEL": "DEBUG",
        "LOG_FORMAT": "%(message)s",
        "LOG_DIR": "/tmp/logs",
        "LOG_FILENAME": "test.log",
        "LOG_TO_CONSOLE": "false",
        "LOG_TO_FILE": "true"
    })
    def test_logging_config_from_env(self):
        """Test LoggingConfig from_env method"""
        # Create config from environment
        config = LoggingConfig.from_env()
        
        # Verify config
        self.assertEqual(config.level, "DEBUG")
        self.assertEqual(config.format, "%(message)s")
        self.assertEqual(config.log_dir, "/tmp/logs")
        self.assertEqual(config.log_filename, "test.log")
        self.assertFalse(config.log_to_console)
        self.assertTrue(config.log_to_file)

class TestLoggingManager(unittest.TestCase):
    """Test cases for LoggingManager"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Create temporary log directory
        self.temp_dir = tempfile.mkdtemp()
        
        # Create test config
        self.config = LoggingConfig(
            level="DEBUG",
            format="%(message)s",
            log_dir=self.temp_dir,
            log_filename="test.log",
            log_to_console=True,
            log_to_file=True
        )
        
        # Reset LoggingManager singleton
        LoggingManager._instance = None
    
    def tearDown(self):
        """Tear down test fixtures"""
        # Remove temporary log directory
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_logging_manager_singleton(self):
        """Test LoggingManager singleton pattern"""
        # Create two instances
        manager1 = LoggingManager(self.config)
        manager2 = LoggingManager()
        
        # Verify that they are the same instance
        self.assertIs(manager1, manager2)
    
    def test_logging_manager_get_logger(self):
        """Test LoggingManager get_logger method"""
        # Create manager
        manager = LoggingManager(self.config)
        
        # Get default logger
        logger = manager.get_logger()
        self.assertEqual(logger.name, "segmentation_service")
        
        # Get named logger
        named_logger = manager.get_logger("test_logger")
        self.assertEqual(named_logger.name, "test_logger")
    
    def test_logging_manager_update_config(self):
        """Test LoggingManager update_config method"""
        # Create manager
        manager = LoggingManager(self.config)
        
        # Verify initial config
        self.assertEqual(manager.config.level, "DEBUG")
        
        # Create new config
        new_config = LoggingConfig(
            level="INFO",
            format="%(asctime)s - %(message)s",
            log_dir=self.temp_dir,
            log_filename="new_test.log"
        )
        
        # Update config
        manager.update_config(new_config)
        
        # Verify updated config
        self.assertEqual(manager.config.level, "INFO")
        self.assertEqual(manager.config.format, "%(asctime)s - %(message)s")
        self.assertEqual(manager.config.log_filename, "new_test.log")
    
    def test_logging_manager_set_request_id(self):
        """Test LoggingManager set_request_id method"""
        # Create manager
        manager = LoggingManager(self.config)
        
        # Set request ID
        manager.set_request_id("test-request-id")
        
        # Verify request ID
        self.assertEqual(manager.request_id_filter.default_request_id, "test-request-id")
    
    def test_logging_manager_set_trace_id(self):
        """Test LoggingManager set_trace_id method"""
        # Create manager
        manager = LoggingManager(self.config)
        
        # Set trace ID
        manager.set_trace_id("test-trace-id")
        
        # Verify trace ID
        self.assertEqual(manager.trace_id_filter.default_trace_id, "test-trace-id")

class TestMetricsCollector(unittest.TestCase):
    """Test cases for MetricsCollector"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Reset MetricsCollector singleton
        MetricsCollector._instance = None
    
    def test_metrics_collector_singleton(self):
        """Test MetricsCollector singleton pattern"""
        # Create two instances
        collector1 = MetricsCollector()
        collector2 = MetricsCollector()
        
        # Verify that they are the same instance
        self.assertIs(collector1, collector2)
    
    def test_metrics_collector_record_request(self):
        """Test MetricsCollector record_request method"""
        # Create collector
        collector = MetricsCollector()
        
        # Reset metrics
        collector.reset_metrics()
        
        # Record successful request
        collector.record_request("/test", "GET", 200, 0.1)
        
        # Verify metrics
        self.assertEqual(collector.metrics["requests"]["total"], 1)
        self.assertEqual(collector.metrics["requests"]["success"], 1)
        self.assertEqual(collector.metrics["requests"]["error"], 0)
        self.assertEqual(collector.metrics["requests"]["by_path"]["GET:/test"]["total"], 1)
        self.assertEqual(collector.metrics["requests"]["by_path"]["GET:/test"]["success"], 1)
        self.assertEqual(collector.metrics["requests"]["by_path"]["GET:/test"]["error"], 0)
        self.assertEqual(collector.metrics["response_times"]["total"], 0.1)
        self.assertEqual(collector.metrics["response_times"]["count"], 1)
        self.assertEqual(collector.metrics["response_times"]["min"], 0.1)
        self.assertEqual(collector.metrics["response_times"]["max"], 0.1)
        
        # Record error request
        collector.record_request("/test", "GET", 500, 0.2)
        
        # Verify metrics
        self.assertEqual(collector.metrics["requests"]["total"], 2)
        self.assertEqual(collector.metrics["requests"]["success"], 1)
        self.assertEqual(collector.metrics["requests"]["error"], 1)
        self.assertEqual(collector.metrics["requests"]["by_path"]["GET:/test"]["total"], 2)
        self.assertEqual(collector.metrics["requests"]["by_path"]["GET:/test"]["success"], 1)
        self.assertEqual(collector.metrics["requests"]["by_path"]["GET:/test"]["error"], 1)
        self.assertEqual(collector.metrics["response_times"]["total"], 0.3)
        self.assertEqual(collector.metrics["response_times"]["count"], 2)
        self.assertEqual(collector.metrics["response_times"]["min"], 0.1)
        self.assertEqual(collector.metrics["response_times"]["max"], 0.2)
    
    def test_metrics_collector_record_error(self):
        """Test MetricsCollector record_error method"""
        # Create collector
        collector = MetricsCollector()
        
        # Reset metrics
        collector.reset_metrics()
        
        # Record error
        collector.record_error(ErrorCode.UNKNOWN_ERROR)
        
        # Verify metrics
        self.assertEqual(collector.metrics["errors"]["total"], 1)
        self.assertEqual(collector.metrics["errors"]["by_code"][ErrorCode.UNKNOWN_ERROR], 1)
        
        # Record another error
        collector.record_error(ErrorCode.VALIDATION_ERROR)
        
        # Verify metrics
        self.assertEqual(collector.metrics["errors"]["total"], 2)
        self.assertEqual(collector.metrics["errors"]["by_code"][ErrorCode.UNKNOWN_ERROR], 1)
        self.assertEqual(collector.metrics["errors"]["by_code"][ErrorCode.VALIDATION_ERROR], 1)
        
        # Record duplicate error
        collector.record_error(ErrorCode.VALIDATION_ERROR)
        
        # Verify metrics
        self.assertEqual(collector.metrics["errors"]["total"], 3)
        self.assertEqual(collector.metrics["errors"]["by_code"][ErrorCode.UNKNOWN_ERROR], 1)
        self.assertEqual(collector.metrics["errors"]["by_code"][ErrorCode.VALIDATION_ERROR], 2)
    
    def test_metrics_collector_get_metrics(self):
        """Test MetricsCollector get_metrics method"""
        # Create collector
        collector = MetricsCollector()
        
        # Reset metrics
        collector.reset_metrics()
        
        # Record some metrics
        collector.record_request("/test", "GET", 200, 0.1)
        collector.record_request("/test", "GET", 500, 0.2)
        collector.record_error(ErrorCode.UNKNOWN_ERROR)
        
        # Get metrics
        metrics = collector.get_metrics()
        
        # Verify metrics
        self.assertEqual(metrics["requests"]["total"], 2)
        self.assertEqual(metrics["requests"]["success"], 1)
        self.assertEqual(metrics["requests"]["error"], 1)
        self.assertEqual(metrics["errors"]["total"], 1)
        self.assertEqual(metrics["errors"]["by_code"][ErrorCode.UNKNOWN_ERROR], 1)
        self.assertEqual(metrics["response_times"]["avg"], 0.15)
        self.assertEqual(metrics["response_times"]["min"], 0.1)
        self.assertEqual(metrics["response_times"]["max"], 0.2)
        self.assertGreater(metrics["uptime"], 0)
        self.assertGreater(metrics["request_rate"], 0)
        self.assertEqual(metrics["error_rate"], 0.5)
    
    def test_metrics_collector_reset_metrics(self):
        """Test MetricsCollector reset_metrics method"""
        # Create collector
        collector = MetricsCollector()
        
        # Record some metrics
        collector.record_request("/test", "GET", 200, 0.1)
        collector.record_error(ErrorCode.UNKNOWN_ERROR)
        
        # Verify metrics
        self.assertEqual(collector.metrics["requests"]["total"], 1)
        self.assertEqual(collector.metrics["errors"]["total"], 1)
        
        # Reset metrics
        collector.reset_metrics()
        
        # Verify metrics
        self.assertEqual(collector.metrics["requests"]["total"], 0)
        self.assertEqual(collector.metrics["errors"]["total"], 0)
        self.assertEqual(len(collector.metrics["requests"]["by_path"]), 0)
        self.assertEqual(len(collector.metrics["errors"]["by_code"]), 0)

class TestErrorHandler(unittest.TestCase):
    """Test cases for ErrorHandler"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Create mock request
        self.mock_request = MagicMock()
        self.mock_request.state.request_id = "test-request-id"
        self.mock_request.headers = {"X-Trace-ID": "test-trace-id"}
        
        # Reset MetricsCollector singleton
        MetricsCollector._instance = None
    
    @patch("enhanced_error_handling.logging.getLogger")
    @patch("enhanced_error_handling.MetricsCollector")
    def test_handle_segmentation_error(self, mock_metrics_collector, mock_get_logger):
        """Test handling SegmentationError"""
        # Create mock logger
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger
        
        # Create mock metrics collector
        mock_collector = MagicMock()
        mock_metrics_collector.return_value = mock_collector
        
        # Create error
        error = SegmentationError(
            message="Test error",
            code=ErrorCode.UNKNOWN_ERROR,
            details={"test": "value"},
            severity=ErrorSeverity.MEDIUM
        )
        
        # Handle error
        response = ErrorHandler.handle_exception(self.mock_request, error)
        
        # Verify response
        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.body.decode(), json.dumps({
            "code": ErrorCode.UNKNOWN_ERROR,
            "message": "Test error",
            "details": {"test": "value"},
            "severity": ErrorSeverity.MEDIUM,
            "request_id": "test-request-id",
            "timestamp": error.to_response().timestamp,
            "trace_id": "test-trace-id"
        }))
        
        # Verify logger was called
        mock_logger.error.assert_called_once()
        
        # Verify metrics collector was called
        mock_collector.record_error.assert_called_once_with(ErrorCode.UNKNOWN_ERROR)
    
    @patch("enhanced_error_handling.logging.getLogger")
    @patch("enhanced_error_handling.MetricsCollector")
    def test_handle_validation_error(self, mock_metrics_collector, mock_get_logger):
        """Test handling ValidationError"""
        # Create mock logger
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger
        
        # Create mock metrics collector
        mock_collector = MagicMock()
        mock_metrics_collector.return_value = mock_collector
        
        # Create error
        error = ValidationError(
            message="Validation failed",
            code=ErrorCode.INVALID_PARAMETER,
            details={"parameter": "test"}
        )
        
        # Handle error
        response = ErrorHandler.handle_exception(self.mock_request, error)
        
        # Verify response
        self.assertEqual(response.status_code, 400)  # Validation errors should return 400
        
        # Verify logger was called
        mock_logger.error.assert_called_once()
        
        # Verify metrics collector was called
        mock_collector.record_error.assert_called_once_with(ErrorCode.INVALID_PARAMETER)
    
    @patch("enhanced_error_handling.logging.getLogger")
    @patch("enhanced_error_handling.MetricsCollector")
    def test_handle_standard_exception(self, mock_metrics_collector, mock_get_logger):
        """Test handling standard exception"""
        # Create mock logger
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger
        
        # Create mock metrics collector
        mock_collector = MagicMock()
        mock_metrics_collector.return_value = mock_collector
        
        # Create error
        error = ValueError("Invalid value")
        
        # Handle error
        response = ErrorHandler.handle_exception(self.mock_request, error)
        
        # Verify response
        self.assertEqual(response.status_code, 400)  # ValueError should map to ValidationError (400)
        
        # Verify logger was called
        mock_logger.error.assert_called_once()
        
        # Verify metrics collector was called
        mock_collector.record_error.assert_called_once()

class TestRequestLogger(unittest.TestCase):
    """Test cases for RequestLogger"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Create mock request
        self.mock_request = MagicMock()
        self.mock_request.headers = {"X-Request-ID": "test-request-id", "X-Trace-ID": "test-trace-id"}
        self.mock_request.method = "GET"
        self.mock_request.url.path = "/test"
        self.mock_request.query_params = {}
        self.mock_request.client = MagicMock()
        self.mock_request.client.host = "127.0.0.1"
        self.mock_request.state = MagicMock()
        
        # Create mock response
        self.mock_response = MagicMock()
        self.mock_response.status_code = 200
        self.mock_response.headers = {}
        
        # Create mock call_next function
        self.mock_call_next = AsyncMock(return_value=self.mock_response)
        
        # Reset MetricsCollector singleton
        MetricsCollector._instance = None
        
        # Reset LoggingManager singleton
        LoggingManager._instance = None
    
    @patch("enhanced_error_handling.logging.getLogger")
    @patch("enhanced_error_handling.MetricsCollector")
    @patch("enhanced_error_handling.LoggingManager")
    @patch("enhanced_error_handling.time.time")
    async def test_log_request_success(self, mock_time, mock_logging_manager, mock_metrics_collector, mock_get_logger):
        """Test logging successful request"""
        # Configure mock time
        mock_time.side_effect = [100.0, 100.5]  # Start time, end time
        
        # Create mock logger
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger
        
        # Create mock metrics collector
        mock_collector = MagicMock()
        mock_metrics_collector.return_value = mock_collector
        
        # Create mock logging manager
        mock_manager = MagicMock()
        mock_logging_manager.return_value = mock_manager
        
        # Log request
        response = await RequestLogger.log_request(self.mock_request, self.mock_call_next)
        
        # Verify response
        self.assertEqual(response, self.mock_response)
        
        # Verify request ID was added to request state
        self.assertEqual(self.mock_request.state.request_id, "test-request-id")
        
        # Verify headers were added to response
        self.assertEqual(response.headers["X-Request-ID"], "test-request-id")
        self.assertEqual(response.headers["X-Process-Time"], "0.5")
        
        # Verify logger was called
        mock_logger.info.assert_called()
        self.assertEqual(mock_logger.info.call_count, 2)  # Request and response logs
        
        # Verify metrics collector was called
        mock_collector.record_request.assert_called_once_with("/test", "GET", 200, 0.5)
        
        # Verify logging manager was called
        mock_manager.set_request_id.assert_called_once_with("test-request-id")
        mock_manager.set_trace_id.assert_called_once_with("test-trace-id")
    
    @patch("enhanced_error_handling.logging.getLogger")
    @patch("enhanced_error_handling.MetricsCollector")
    @patch("enhanced_error_handling.LoggingManager")
    @patch("enhanced_error_handling.time.time")
    async def test_log_request_exception(self, mock_time, mock_logging_manager, mock_metrics_collector, mock_get_logger):
        """Test logging request with exception"""
        # Configure mock time
        mock_time.side_effect = [100.0, 100.5]  # Start time, end time
        
        # Create mock logger
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger
        
        # Create mock metrics collector
        mock_collector = MagicMock()
        mock_metrics_collector.return_value = mock_collector
        
        # Create mock logging manager
        mock_manager = MagicMock()
        mock_logging_manager.return_value = mock_manager
        
        # Configure mock call_next to raise exception
        self.mock_call_next.side_effect = Exception("Test exception")
        
        # Log request
        with self.assertRaises(Exception):
            await RequestLogger.log_request(self.mock_request, self.mock_call_next)
        
        # Verify logger was called
        mock_logger.info.assert_called_once()  # Only request log
        mock_logger.error.assert_called_once()  # Exception log
        
        # Verify metrics collector was called
        mock_collector.record_request.assert_called_once_with("/test", "GET", 500, 0.5)
        
        # Verify logging manager was called
        mock_manager.set_request_id.assert_called_once_with("test-request-id")
        mock_manager.set_trace_id.assert_called_once_with("test-trace-id")

class TestLogFunctionCall(unittest.TestCase):
    """Test cases for log_function_call decorator"""
    
    @patch("enhanced_error_handling.logging.getLogger")
    @patch("enhanced_error_handling.time.time")
    def test_log_function_call_success(self, mock_time, mock_get_logger):
        """Test logging successful function call"""
        # Configure mock time
        mock_time.side_effect = [100.0, 100.5]  # Start time, end time
        
        # Create mock logger
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger
        
        # Create a test function
        @log_function_call
        def test_function(a, b, c=None):
            return a + b
        
        # Call the function
        result = test_function(1, 2, c=3)
        
        # Verify result
        self.assertEqual(result, 3)
        
        # Verify logger was called
        mock_logger.debug.assert_called()
        self.assertEqual(mock_logger.debug.call_count, 2)  # Call and result logs
    
    @patch("enhanced_error_handling.logging.getLogger")
    @patch("enhanced_error_handling.time.time")
    def test_log_function_call_exception(self, mock_time, mock_get_logger):
        """Test logging function call with exception"""
        # Configure mock time
        mock_time.side_effect = [100.0, 100.5]  # Start time, end time
        
        # Create mock logger
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger
        
        # Create a test function that raises exception
        @log_function_call
        def test_function():
            raise ValueError("Test error")
        
        # Call the function
        with self.assertRaises(ValueError):
            test_function()
        
        # Verify logger was called
        mock_logger.debug.assert_called_once()  # Only call log
        mock_logger.error.assert_called_once()  # Exception log

class TestLogAsyncFunctionCall(unittest.TestCase):
    """Test cases for log_async_function_call decorator"""
    
    @patch("enhanced_error_handling.logging.getLogger")
    @patch("enhanced_error_handling.time.time")
    async def test_log_async_function_call_success(self, mock_time, mock_get_logger):
        """Test logging successful async function call"""
        # Configure mock time
        mock_time.side_effect = [100.0, 100.5]  # Start time, end time
        
        # Create mock logger
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger
        
        # Create a test async function
        @log_async_function_call
        async def test_function(a, b, c=None):
            return a + b
        
        # Call the function
        result = await test_function(1, 2, c=3)
        
        # Verify result
        self.assertEqual(result, 3)
        
        # Verify logger was called
        mock_logger.debug.assert_called()
        self.assertEqual(mock_logger.debug.call_count, 2)  # Call and result logs
    
    @patch("enhanced_error_handling.logging.getLogger")
    @patch("enhanced_error_handling.time.time")
    async def test_log_async_function_call_exception(self, mock_time, mock_get_logger):
        """Test logging async function call with exception"""
        # Configure mock time
        mock_time.side_effect = [100.0, 100.5]  # Start time, end time
        
        # Create mock logger
        mock_logger = MagicMock()
        mock_get_logger.return_value = mock_logger
        
        # Create a test async function that raises exception
        @log_async_function_call
        async def test_function():
            raise ValueError("Test error")
        
        # Call the function
        with self.assertRaises(ValueError):
            await test_function()
        
        # Verify logger was called
        mock_logger.debug.assert_called_once()  # Only call log
        mock_logger.error.assert_called_once()  # Exception log

class TestHealthCheck(unittest.TestCase):
    """Test cases for HealthCheck"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Reset MetricsCollector singleton
        MetricsCollector._instance = None
    
    @patch("enhanced_error_handling.MetricsCollector")
    def test_check_health(self, mock_metrics_collector):
        """Test check_health method"""
        # Create mock metrics collector
        mock_collector = MagicMock()
        mock_metrics_collector.return_value = mock_collector
        
        # Configure mock metrics
        mock_collector.get_metrics.return_value = {
            "uptime": 3600,
            "request_rate": 10,
            "error_rate": 0.05,
            "response_times": {
                "avg": 0.1,
                "min": 0.01,
                "max": 0.5
            }
        }
        
        # Check health
        health = HealthCheck.check_health()
        
        # Verify health
        self.assertEqual(health["status"], "UP")
        self.assertEqual(health["details"]["uptime"], 3600)
        self.assertEqual(health["details"]["request_rate"], 10)
        self.assertEqual(health["details"]["error_rate"], 0.05)
        self.assertEqual(health["details"]["avg_response_time"], 0.1)
    
    @patch("enhanced_error_handling.MetricsCollector")
    def test_check_health_degraded(self, mock_metrics_collector):
        """Test check_health method with degraded status"""
        # Create mock metrics collector
        mock_collector = MagicMock()
        mock_metrics_collector.return_value = mock_collector
        
        # Configure mock metrics with high error rate
        mock_collector.get_metrics.return_value = {
            "uptime": 3600,
            "request_rate": 10,
            "error_rate": 0.15,  # > 0.1
            "response_times": {
                "avg": 0.1,
                "min": 0.01,
                "max": 0.5
            }
        }
        
        # Check health
        health = HealthCheck.check_health()
        
        # Verify health
        self.assertEqual(health["status"], "DEGRADED")
        self.assertEqual(health["details"]["degraded_reason"], "High error rate")
    
    def test_check_readiness(self):
        """Test check_readiness method"""
        # Check readiness
        readiness = HealthCheck.check_readiness()
        
        # Verify readiness
        self.assertEqual(readiness["status"], "READY")
        self.assertEqual(readiness["dependencies"]["database"], "UP")
        self.assertEqual(readiness["dependencies"]["api_gateway"], "UP")
        self.assertEqual(readiness["dependencies"]["runner_service"], "UP")
    
    def test_check_liveness(self):
        """Test check_liveness method"""
        # Check liveness
        liveness = HealthCheck.check_liveness()
        
        # Verify liveness
        self.assertEqual(liveness["status"], "ALIVE")

class TestConfigureAppLogging(unittest.TestCase):
    """Test cases for configure_app_logging function"""
    
    def test_configure_app_logging(self):
        """Test configuring application logging"""
        # Create a FastAPI app
        app = FastAPI()
        
        # Configure app logging
        configure_app_logging(app)
        
        # Verify that endpoints were added
        self.assertTrue(any(route.path == "/health" for route in app.routes))
        self.assertTrue(any(route.path == "/health/ready" for route in app.routes))
        self.assertTrue(any(route.path == "/health/live" for route in app.routes))
        self.assertTrue(any(route.path == "/metrics" for route in app.routes))
        self.assertTrue(any(route.path == "/logging/config" for route in app.routes))
        
        # Verify that exception handler was added
        self.assertTrue(Exception in app.exception_handlers)
        
        # Verify that middleware was added
        self.assertTrue(any(middleware.cls.__name__ == "RequestLoggerMiddleware" for middleware in app.user_middleware))

class TestGetLogger(unittest.TestCase):
    """Test cases for get_logger function"""
    
    @patch("enhanced_error_handling.LoggingManager")
    def test_get_logger_default(self, mock_logging_manager):
        """Test getting default logger"""
        # Create mock logging manager
        mock_manager = MagicMock()
        mock_logging_manager.return_value = mock_manager
        
        # Get logger
        logger = get_logger()
        
        # Verify that logging manager was called
        mock_manager.get_logger.assert_called_once_with(None)
    
    @patch("enhanced_error_handling.LoggingManager")
    def test_get_logger_custom(self, mock_logging_manager):
        """Test getting custom logger"""
        # Create mock logging manager
        mock_manager = MagicMock()
        mock_logging_manager.return_value = mock_manager
        
        # Get logger
        logger = get_logger("custom_logger")
        
        # Verify that logging manager was called
        mock_manager.get_logger.assert_called_once_with("custom_logger")

class TestIntegration(unittest.TestCase):
    """Integration tests for enhanced error handling and logging system"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Create a FastAPI app
        self.app = FastAPI()
        
        # Configure app logging
        configure_app_logging(self.app)
        
        # Add test endpoints
        @self.app.get("/test/success")
        def test_success():
            return {"status": "success"}
        
        @self.app.get("/test/validation-error")
        def test_validation_error():
            raise ValidationError(
                message="Validation failed",
                code=ErrorCode.INVALID_PARAMETER,
                details={"parameter": "test"}
            )
        
        @self.app.get("/test/processing-error")
        def test_processing_error():
            raise ProcessingError(
                message="Processing failed",
                code=ErrorCode.PROCESSING_ERROR,
                details={"process": "test"}
            )
        
        @self.app.get("/test/standard-error")
        def test_standard_error():
            raise ValueError("Invalid value")
        
        # Create test client
        self.client = TestClient(self.app)
    
    def test_success_endpoint(self):
        """Test successful endpoint"""
        # Call endpoint
        response = self.client.get("/test/success")
        
        # Verify response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "success"})
        
        # Verify headers
        self.assertIn("X-Request-ID", response.headers)
        self.assertIn("X-Process-Time", response.headers)
    
    def test_validation_error_endpoint(self):
        """Test endpoint with validation error"""
        # Call endpoint
        response = self.client.get("/test/validation-error")
        
        # Verify response
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["code"], ErrorCode.INVALID_PARAMETER)
        self.assertEqual(response.json()["message"], "Validation failed")
        self.assertEqual(response.json()["details"], {"parameter": "test"})
        self.assertEqual(response.json()["severity"], ErrorSeverity.MEDIUM)
        
        # Verify headers
        self.assertIn("X-Request-ID", response.headers)
        self.assertIn("X-Process-Time", response.headers)
    
    def test_processing_error_endpoint(self):
        """Test endpoint with processing error"""
        # Call endpoint
        response = self.client.get("/test/processing-error")
        
        # Verify response
        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.json()["code"], ErrorCode.PROCESSING_ERROR)
        self.assertEqual(response.json()["message"], "Processing failed")
        self.assertEqual(response.json()["details"], {"process": "test"})
        self.assertEqual(response.json()["severity"], ErrorSeverity.MEDIUM)
        
        # Verify headers
        self.assertIn("X-Request-ID", response.headers)
        self.assertIn("X-Process-Time", response.headers)
    
    def test_standard_error_endpoint(self):
        """Test endpoint with standard error"""
        # Call endpoint
        response = self.client.get("/test/standard-error")
        
        # Verify response
        self.assertEqual(response.status_code, 400)  # ValueError maps to ValidationError (400)
        self.assertEqual(response.json()["code"], ErrorCode.VALIDATION_ERROR)
        self.assertIn("Invalid value", response.json()["message"])
        
        # Verify headers
        self.assertIn("X-Request-ID", response.headers)
        self.assertIn("X-Process-Time", response.headers)
    
    def test_health_endpoint(self):
        """Test health endpoint"""
        # Call endpoint
        response = self.client.get("/health")
        
        # Verify response
        self.assertEqual(response.status_code, 200)
        self.assertIn("status", response.json())
        self.assertIn("details", response.json())
    
    def test_metrics_endpoint(self):
        """Test metrics endpoint"""
        # Call some endpoints to generate metrics
        self.client.get("/test/success")
        try:
            self.client.get("/test/validation-error")
        except:
            pass
        
        # Call metrics endpoint
        response = self.client.get("/metrics")
        
        # Verify response
        self.assertEqual(response.status_code, 200)
        self.assertIn("requests", response.json())
        self.assertIn("errors", response.json())
        self.assertIn("response_times", response.json())
        self.assertIn("uptime", response.json())
        self.assertIn("request_rate", response.json())
        self.assertIn("error_rate", response.json())
    
    def test_logging_config_endpoints(self):
        """Test logging configuration endpoints"""
        # Get current config
        get_response = self.client.get("/logging/config")
        
        # Verify response
        self.assertEqual(get_response.status_code, 200)
        self.assertIn("level", get_response.json())
        self.assertIn("format", get_response.json())
        
        # Update config
        update_response = self.client.post(
            "/logging/config",
            json={
                "level": "DEBUG",
                "format": "%(message)s",
                "log_dir": "./logs",
                "log_filename": "test.log",
                "log_to_console": True,
                "log_to_file": True
            }
        )
        
        # Verify response
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.json()["status"], "success")
        self.assertEqual(update_response.json()["config"]["level"], "DEBUG")
        self.assertEqual(update_response.json()["config"]["format"], "%(message)s")

if __name__ == "__main__":
    unittest.main()
