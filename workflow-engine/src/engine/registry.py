from typing import Dict, Type, Any
from pieces.base import Piece

class PieceRegistry:
    """Registry for all available workflow pieces."""
    
    def __init__(self):
        self._pieces: Dict[str, Type[Piece]] = {}
        
    def register(self, piece_type: str, piece_class: Type[Piece]):
        """Register a piece class with its type identifier."""
        self._pieces[piece_type] = piece_class
        
    def get_piece(self, piece_type: str) -> Type[Piece]:
        """Get a piece class by its type identifier."""
        return self._pieces.get(piece_type)
        
    def list_pieces(self) -> Dict[str, Dict[str, Any]]:
        """List all registered pieces with their metadata."""
        result = {}
        for piece_type, piece_class in self._pieces.items():
            result[piece_type] = {
                "config_schema": piece_class.get_config_schema(),
                "input_schema": piece_class.get_input_schema(),
                "output_schema": piece_class.get_output_schema()
            }
        return result

# Create a global registry instance
registry = PieceRegistry()

def get_registry() -> PieceRegistry:
    """Get the global piece registry."""
    return registry
