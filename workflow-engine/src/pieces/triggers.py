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

