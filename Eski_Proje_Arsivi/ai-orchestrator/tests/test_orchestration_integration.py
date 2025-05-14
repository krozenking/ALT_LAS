#!/usr/bin/env python3
"""
Tests for AI Orchestrator core components.
Updated by Worker 1 to include OS Integration Client tests.
"""

import unittest
from unittest.mock import patch, MagicMock
import os
import sys

# Add src directory to path to import modules
src_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src"))
sys.path.insert(0, src_path)

from core.orchestration import AIOrchestrator
from clients.os_integration_client import OSIntegrationClient

class TestAIOrchestratorIntegration(unittest.TestCase):

    @patch("core.orchestration.load_config")
    @patch("clients.os_integration_client.requests.request") # Mock the requests library used by the client
    def test_orchestrator_initialization_with_os_client(self, mock_requests, mock_load_config):
        """Test if AIOrchestrator initializes OSIntegrationClient and calls get_platform_info."""
        
        # Mock config
        mock_config_data = {
            "services": {
                "os_integration_service_url": "http://mock-os-service:8083"
            },
            "models": []
        }
        mock_load_config.return_value = mock_config_data
        
        # Mock the response from OS Integration Service get_platform_info
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"os_name": "MockOS", "os_version": "1.0"}
        mock_requests.return_value = mock_response

        # Initialize Orchestrator
        orchestrator = AIOrchestrator()

        # Assertions
        self.assertIsInstance(orchestrator.os_client, OSIntegrationClient)
        self.assertEqual(orchestrator.os_client.base_url, "http://mock-os-service:8083/")
        
        # Check if get_platform_info was called via the client
        mock_requests.assert_called_once_with(
            "GET", 
            "http://mock-os-service:8083/api/platform/info", 
            headers=unittest.mock.ANY, # Check headers if needed
        )
        # Check logs or add logging assertions if necessary

    @patch("core.orchestration.load_config")
    @patch("core.orchestration.select_model")
    @patch("core.orchestration.load_model")
    @patch("core.orchestration.run_model")
    @patch.object(OSIntegrationClient, "take_screenshot") # Mock the take_screenshot method directly
    def test_process_task_calls_take_screenshot(self, mock_take_screenshot, mock_run_model, mock_load_model, mock_select_model, mock_load_config):
        """Test if process_task calls the OS client's take_screenshot method."""
        
        # Mock config and models
        mock_load_config.return_value = {
            "services": {"os_integration_service_url": "http://mock-os-service:8083"},
            "models": [{"id": "test-model", "type": "mock"}]
        }
        mock_select_model.return_value = "test-model"
        mock_load_model.return_value = MagicMock() # Mock model instance
        mock_run_model.return_value = "Mock Result"
        mock_take_screenshot.return_value = {"status": "success", "path": "/tmp/screenshot.png"}

        # Initialize Orchestrator
        orchestrator = AIOrchestrator()
        
        # Process a task
        result = orchestrator.process_task("test task", "test data")

        # Assertions
        self.assertEqual(result, "Mock Result")
        mock_take_screenshot.assert_called_once_with(output_path="/tmp/before_task_test_task.png")

if __name__ == "__main__":
    unittest.main()
