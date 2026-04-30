from typing import List, Optional
from pydantic import BaseModel, Field

class Move(BaseModel):
    uci: str = Field(..., description="Universal Chess Interface format string (e.g., 'e2e4')")
    san: Optional[str] = Field(None, description="Standard Algebraic Notation (e.g., 'Nf3')")

class PuzzleBase(BaseModel):
    fen: str = Field(..., description="FEN string of the starting position")
    moves: List[Move] = Field(..., description="List of correct moves representing the solution")
    rating: Optional[int] = Field(None, description="Puzzle difficulty rating (e.g., Elo)")
    themes: List[str] = Field(default_factory=list, description="List of tactical themes")

class PuzzleCreate(PuzzleBase):
    pass

class PuzzleInDB(PuzzleBase):
    id: str = Field(..., description="Unique identifier (e.g., MongoDB ObjectId as string)")
