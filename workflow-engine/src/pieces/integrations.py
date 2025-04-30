from typing import Dict, Any
import httpx # Assuming services communicate via HTTP
from .base import Piece
from ..models.workflow import Node

from ..config import settings # Import settings
AI_ORCHESTRATOR_URL = "http://ai-orchestrator:8000" # Example URL
OS_INTEGRATION_URL = "http://os-integration-service:8000" # Example URL

class AiOrchestrator(Piece):
    """Interacts with the AI Orchestrator service."""

    def __init__(self, node: Node):
        super().__init__(node)
        self.endpoint = self.config.get("endpoint", "/process") # Example endpoint
        self.timeout = self.config.get("timeout", 120)

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sends data to the AI Orchestrator and returns the response."""
        target_url = f"{settings.AI_ORCHESTRATOR_URL}{self.endpoint}"
        print(f"Executing AiOrchestrator for node {self.node.id} to {target_url}")

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # Assuming POST request with input_data as JSON body
                response = await client.post(target_url, json=input_data)
                response.raise_for_status()
                return response.json()
        except httpx.RequestError as e:
            print(f"AI Orchestrator request failed for node {self.node.id}: {e}")
            return {"error": f"Request to AI Orchestrator failed: {e}"}
        except Exception as e:
            print(f"Error interacting with AI Orchestrator for node {self.node.id}: {e}")
            return {"error": f"An unexpected error occurred: {e}"}

    @classmethod
    def get_config_schema(cls) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "endpoint": {
                    "type": "string",
                    "title": "API Endpoint",
                    "description": "The specific endpoint on the AI Orchestrator service.",
                    "default": "/process"
                },
                "timeout": {
                    "type": "integer",
                    "title": "Timeout (seconds)",
                    "default": 120
                }
            },
            "required": ["endpoint"]
        }

    @classmethod
    def get_input_schema(cls) -> Dict[str, Any]:
        # Define expected input based on AI Orchestrator API
        return {
            "type": "object",
            "title": "AI Orchestrator Input",
            "description": "Data to be sent to the AI Orchestrator service."
            # Add specific properties based on the service's API
        }

    @classmethod
    def get_output_schema(cls) -> Dict[str, Any]:
        # Define expected output based on AI Orchestrator API
        return {
            "type": "object",
            "title": "AI Orchestrator Output",
            "description": "Response received from the AI Orchestrator service."
            # Add specific properties based on the service's API
        }

class OsIntegration(Piece):
    """Interacts with the OS Integration service."""

    def __init__(self, node: Node):
        super().__init__(node)
        self.endpoint = self.config.get("endpoint", "/execute") # Example endpoint
        self.timeout = self.config.get("timeout", 60)

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sends data to the OS Integration service and returns the response."""
        target_url = f"{settings.OS_INTEGRATION_URL}{self.endpoint}"
        print(f"Executing OsIntegration for node {self.node.id} to {target_url}")

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # Assuming POST request with input_data as JSON body
                response = await client.post(target_url, json=input_data)
                response.raise_for_status()
                return response.json()
        except httpx.RequestError as e:
            print(f"OS Integration request failed for node {self.node.id}: {e}")
            return {"error": f"Request to OS Integration service failed: {e}"}
        except Exception as e:
            print(f"Error interacting with OS Integration service for node {self.node.id}: {e}")
            return {"error": f"An unexpected error occurred: {e}"}

    @classmethod
    def get_config_schema(cls) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "endpoint": {
                    "type": "string",
                    "title": "API Endpoint",
                    "description": "The specific endpoint on the OS Integration service.",
                    "default": "/execute"
                },
                "timeout": {
                    "type": "integer",
                    "title": "Timeout (seconds)",
                    "default": 60
                }
            },
            "required": ["endpoint"]
        }

    @classmethod
    def get_input_schema(cls) -> Dict[str, Any]:
        # Define expected input based on OS Integration API
        return {
            "type": "object",
            "title": "OS Integration Input",
            "description": "Data to be sent to the OS Integration service."
            # Add specific properties based on the service's API
        }

    @classmethod
    def get_output_schema(cls) -> Dict[str, Any]:
        # Define expected output based on OS Integration API
        return {
            "type": "object",
            "title": "OS Integration Output",
            "description": "Response received from the OS Integration service."
            # Add specific properties based on the service's API
        }

