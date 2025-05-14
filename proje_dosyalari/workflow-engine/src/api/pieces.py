# API endpoints for listing available pieces
from fastapi import APIRouter, Depends
from typing import Dict, Type

from ..engine.registry import get_registry, PieceBase

router = APIRouter()

@router.get("/", response_model=Dict[str, str]) # Return a dict of piece_type: piece_name
async def list_available_pieces(registry = Depends(get_registry)):
    """List all registered workflow pieces (triggers and actions)."""
    pieces = registry.list_pieces()
    # Return a simple dictionary mapping the piece type (key) to its class name or description
    # For simplicity, let's return the class name.
    return {key: piece.__name__ for key, piece in pieces.items()}

# Potentially add an endpoint to get details/schema of a specific piece
# @router.get("/{piece_type}/schema")
# async def get_piece_schema(piece_type: str, registry = Depends(get_registry)):
#     piece_class = registry.get_piece(piece_type)
#     if not piece_class:
#         raise HTTPException(status_code=404, detail="Piece type not found")
#     # Assuming pieces have a method to return their config/input/output schema
#     if hasattr(piece_class, 'get_schema'):
#          return piece_class.get_schema()
#     else:
#          return {"info": "Schema not available for this piece."}

