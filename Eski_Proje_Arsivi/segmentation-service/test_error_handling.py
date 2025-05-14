"""
Unit tests for the Error Handling module of ALT_LAS Segmentation Service

This module contains unit tests for the Error Handling module, testing the
functionality of the ErrorHandler, RequestLogger, and logging decorators.
"""

import unittest
from unittest.mock import patch, MagicMock, AsyncMock
import logging
import json
import time
from datetime import datetime
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

from error_handling import (
    ErrorHandler, RequestLogger, log_function_call,
    configure_app_logging, ErrorCode, ErrorResponse, get_logger
)

class TestErrorHandler(unittest.TestCase):
    """Test cases for ErrorHandler class"""
    
    def setUp(self):
        """Set up test data"""
        # Create a mock request
        self.mock_request = MagicMock()
        self.mock_request.headers = {"X-Request-ID": "test-request-id"}
        self.mock_request.url = MagicMock()
        self.mock_request.url.path = "/test/path"
    
    @patch("error_handling.logger")
    def test_handle_http_exception_404(self, mock_logger):
        """Test handling HTTP 404 exception"""
        # Create a 404 exception
        exc = HTTPException(status_code=404, detail="Resource not found")
        
        # Handle exception
        response = ErrorHandler.handle_exception(self.mock_request, exc)
        
        # Verify response
        self.assertIsInstance(response, JSONResponse)
        self.assertEqual(response.status_code, 404)
        
        # Verify response content
        content = json.loads(response.body)
        self.assertEqual(content["error_code"], ErrorCode.NOT_FOUND_ERROR)
        self.assertEqual(content["message"], "Resource not found")
        self.assertEqual(content["request_id"], "test-request-id")
        self.assertEqual(content["path"], "/test/path")
        
        # Verify logger was called
        mock_logger.error.assert_called_once()
    
    @patch("error_handling.logger")
    def test_handle_http_exception_422(self, mock_logger):
        """Test handling HTTP 422 exception"""
        # Create a 422 exception
        exc = HTTPException(status_code=422, detail="Validation error")
        
        # Handle exception
        response = ErrorHandler.handle_exception(self.mock_request, exc)
        
        # Verify response
        self.assertIsInstance(response, JSONResponse)
        self.assertEqual(response.status_code, 422)
        
        # Verify response content
        content = json.loads(response.body)
        self.assertEqual(content["error_code"], ErrorCode.VALIDATION_ERROR)
        self.assertEqual(content["message"], "Validation error")
        
        # Verify logger was called
        mock_logger.error.assert_called_once()
    
    @patch("error_handling.logger")
    def test_handle_general_exception(self, mock_logger):
        """Test handling general exception"""
        # Create a general exception
        exc = Exception("Something went wrong")
        
        # Handle exception
        response = ErrorHandler.handle_exception(self.mock_request, exc)
        
        # Verify response
        self.assertIsInstance(response, JSONResponse)
        self.assertEqual(response.status_code, 500)
        
        # Verify response content
        content = json.loads(response.body)
        self.assertEqual(content["error_code"], ErrorCode.GENERAL_ERROR)
        self.assertTrue("Something went wrong" in content["message"])
        self.assertEqual(content["details"]["type"], "Exception")
        
        # Verify logger was called
        mock_logger.error.assert_called_once()
    
    @patch("error_handling.logger")
    def test_handle_file_exception(self, mock_logger):
        """Test handling file exception"""
        # Create a file exception
        exc = FileNotFoundError("File not found")
        
        # Handle exception
        response = ErrorHandler.handle_exception(self.mock_request, exc)
        
        # Verify response
        self.assertIsInstance(response, JSONResponse)
        self.assertEqual(response.status_code, 500)
        
        # Verify response content
        content = json.loads(response.body)
        self.assertEqual(content["error_code"], ErrorCode.FILE_ERROR)
        self.assertTrue("File not found" in content["message"])
        
        # Verify logger was called
        mock_logger.error.assert_called_once()

class TestRequestLogger(unittest.TestCase):
    """Test cases for RequestLogger class"""
    
    def setUp(self):
        """Set up test data"""
        # Create a mock request
        self.mock_request = MagicMock()
        self.mock_request.headers = {"X-Request-ID": "test-request-id", "User-Agent": "test-agent"}
        self.mock_request.url = MagicMock()
        self.mock_request.url.path = "/test/path"
        self.mock_request.method = "GET"
        self.mock_request.query_params = {}
        self.mock_request.client = MagicMock()
        self.mock_request.client.host = "127.0.0.1"
        self.mock_request.state = MagicMock()
        
        # Create a mock response
        self.mock_response = MagicMock()
        self.mock_response.status_code = 200
        self.mock_response.headers = {}
        
        # Create a mock call_next function
        self.mock_call_next = AsyncMock(return_value=self.mock_response)
    
    @patch("error_handling.logger")
    @patch("error_handling.time.time")
    async def test_log_request_success(self, mock_time, mock_logger):
        """Test logging successful request"""
        # Configure mock time
        mock_time.side_effect = [100.0, 100.5]  # Start time, end time
        
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
    
    @patch("error_handling.logger")
    @patch("error_handling.time.time")
    async def test_log_request_exception(self, mock_time, mock_logger):
        """Test logging request with exception"""
        # Configure mock time
        mock_time.side_effect = [100.0, 100.5]  # Start time, end time
        
        # Configure mock call_next to raise exception
        self.mock_call_next.side_effect = Exception("Test exception")
        
        # Log request
        with self.assertRaises(Exception):
            await RequestLogger.log_request(self.mock_request, self.mock_call_next)
        
        # Verify logger was called
        mock_logger.info.assert_called_once()  # Only request log
        mock_logger.error.assert_called_once()  # Exception log

class TestLogFunctionCall(unittest.TestCase):
    """Test cases for log_function_call decorator"""
    
    @patch("error_handling.logger")
    @patch("error_handling.time.time")
    def test_log_function_call_success(self, mock_time, mock_logger):
        """Test logging successful function call"""
        # Configure mock time
        mock_time.side_effect = [100.0, 100.5]  # Start time, end time
        
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
    
    @patch("error_handling.logger")
    @patch("error_handling.time.time")
    def test_log_function_call_exception(self, mock_time, mock_logger):
        """Test logging function call with exception"""
        # Configure mock time
        mock_time.side_effect = [100.0, 100.5]  # Start time, end time
        
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

class TestConfigureAppLogging(unittest.TestCase):
    """Test cases for configure_app_logging function"""
    
    def test_configure_app_logging(self):
        """Test configuring application logging"""
        # Create a mock app
        mock_app = MagicMock()
        
        # Configure app logging
        configure_app_logging(mock_app)
        
        # Verify app methods were called
        mock_app.exception_handler.assert_called_once()
        mock_app.middleware.assert_called_once_with("http")

class TestGetLogger(unittest.TestCase):
    """Test cases for get_logger function"""
    
    def test_get_logger_default(self):
        """Test getting default logger"""
        logger = get_logger()
        self.assertEqual(logger.name, "segmentation_service")
    
    def test_get_logger_custom(self):
        """Test getting custom logger"""
        logger = get_logger("custom_logger")
        self.assertEqual(logger.name, "custom_logger")

if __name__ == "__main__":
    unittest.main()
