from abc import ABC, abstractmethod
from typing import Dict, Any
from ..models.workflow import Node

class Piece(ABC):
    """Base class for all workflow pieces (nodes)."""

    def __init__(self, node: Node):
        self.node = node
        self.config = node.config

    @abstractmethod
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the piece logic."""
        pass

    @classmethod
    def get_config_schema(cls) -> Dict[str, Any]:
        """Return the JSON schema for the piece's configuration."""
        return {}

    @classmethod
    def get_input_schema(cls) -> Dict[str, Any]:
        """Return the JSON schema for the expected input data."""
        return {}

    @classmethod
    def get_output_schema(cls) -> Dict[str, Any]:
        """Return the JSON schema for the expected output data."""
        return {}

