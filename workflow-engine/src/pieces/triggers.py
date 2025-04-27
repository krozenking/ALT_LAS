from typing import Dict, Any
from .base import Piece
from models.workflow import Node

class ManualTrigger(Piece):
    """A piece that represents a manual start of the workflow."""

    def __init__(self, node: Node):
        super().__init__(node)

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Simply passes through the initial trigger data."""
        print(f"Executing ManualTrigger for node {self.node.id}")
        # Input data for a manual trigger is the initial data provided at runtime
        return input_data

    @classmethod
    def get_config_schema(cls) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "description": {
                    "type": "string",
                    "title": "Description",
                    "description": "Optional description for this trigger."
                }
            }
        }

    @classmethod
    def get_output_schema(cls) -> Dict[str, Any]:
        # The output schema depends on the data provided when triggering
        # For now, let's assume it's an open object
        return {
            "type": "object",
            "title": "Trigger Data",
            "description": "Data provided when the workflow was manually triggered."
        }



import datetime
from fastapi import Request # Needed for WebhookTrigger context

class ScheduleTrigger(Piece):
    """Triggers the workflow based on a predefined schedule (e.g., cron)."""

    def __init__(self, node: Node):
        super().__init__(node)
        self.schedule = self.config.get("schedule") # e.g., cron string "*/5 * * * *"

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Returns context about the scheduled trigger event."""
        # The actual scheduling logic will be external (e.g., a separate scheduler service
        # or integration with system cron/Kubernetes CronJob).
        # This piece primarily defines the trigger point and its configuration.
        # The input_data might contain context from the scheduler (e.g., scheduled time).
        print(f"Executing ScheduleTrigger for node {self.node.id} with schedule 	{self.schedule}	")
        return {
            "trigger_type": "schedule",
            "schedule": self.schedule,
            "triggered_at": datetime.datetime.utcnow().isoformat(),
            "scheduler_context": input_data # Pass through any context from the scheduler
        }

    @classmethod
    def get_config_schema(cls) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "schedule": {
                    "type": "string",
                    "title": "Schedule (Cron)",
                    "description": "Cron-like string defining the schedule (e.g., 	*/5 * * * *	 for every 5 minutes).",
                    "examples": ["*/5 * * * *", "0 9 * * 1-5"]
                }
            },
            "required": ["schedule"]
        }

    @classmethod
    def get_input_schema(cls) -> Dict[str, Any]:
        # Input might come from the scheduler service
        return {
            "type": "object",
            "title": "Scheduler Context",
            "description": "Optional data provided by the external scheduler."
        }

    @classmethod
    def get_output_schema(cls) -> Dict[str, Any]:
        return {
            "type": "object",
            "title": "Schedule Trigger Output",
            "properties": {
                "trigger_type": {"type": "string", "const": "schedule"},
                "schedule": {"type": "string", "title": "Cron Schedule"},
                "triggered_at": {"type": "string", "format": "date-time", "title": "Trigger Timestamp"},
                "scheduler_context": {"type": "object", "title": "Scheduler Context"}
            }
        }

class WebhookTrigger(Piece):
    """Triggers the workflow when an HTTP request is received at a specific endpoint."""

    def __init__(self, node: Node):
        super().__init__(node)
        # Configuration might include path suffix, authentication method, etc.
        self.path_suffix = self.config.get("path_suffix") # Unique part of the webhook URL

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Processes the incoming webhook request data."""
        # The actual HTTP endpoint handling will be done by the API layer.
        # This piece defines the trigger and processes the data passed by the API.
        # input_data is expected to contain request details (headers, body, query_params).
        print(f"Executing WebhookTrigger for node {self.node.id}")
        return {
            "trigger_type": "webhook",
            "request_data": input_data
        }

    @classmethod
    def get_config_schema(cls) -> Dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "path_suffix": {
                    "type": "string",
                    "title": "Webhook Path Suffix",
                    "description": "Unique identifier for the webhook URL (e.g., /webhook/<path_suffix>). Leave empty to auto-generate."
                },
                "authentication": {
                    "type": "string",
                    "title": "Authentication Method",
                    "enum": ["none", "basic", "token"], # Example auth methods
                    "default": "none"
                }
                # Add more config for specific auth types if needed
            }
        }

    @classmethod
    def get_input_schema(cls) -> Dict[str, Any]:
        # Input is provided by the API layer handling the incoming request
        return {
            "type": "object",
            "title": "Webhook Request Data",
            "properties": {
                "method": {"type": "string", "title": "HTTP Method"},
                "headers": {"type": "object", "title": "Request Headers"},
                "query_params": {"type": "object", "title": "Query Parameters"},
                "body": {"type": ["object", "string", "null"], "title": "Request Body"}
            },
            "required": ["method", "headers", "query_params", "body"]
        }

    @classmethod
    def get_output_schema(cls) -> Dict[str, Any]:
        return {
            "type": "object",
            "title": "Webhook Trigger Output",
            "properties": {
                "trigger_type": {"type": "string", "const": "webhook"},
                "request_data": {
                    "type": "object",
                    "title": "Webhook Request Data",
                    "properties": {
                        "method": {"type": "string", "title": "HTTP Method"},
                        "headers": {"type": "object", "title": "Request Headers"},
                        "query_params": {"type": "object", "title": "Query Parameters"},
                        "body": {"type": ["object", "string", "null"], "title": "Request Body"}
                    }
                }
            }
        }

