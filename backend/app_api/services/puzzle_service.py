from typing import Optional, List
from app_api.domain.puzzle import PuzzleInDB, PuzzleCreate
from app_api.repositories.puzzle_repo import PuzzleRepository

class PuzzleService:
    def __init__(self, repository: PuzzleRepository):
        self.repository = repository

    async def get_puzzle_by_id(self, puzzle_id: str) -> Optional[PuzzleInDB]:
        return await self.repository.get_by_id(puzzle_id)

    async def get_random_puzzle(self) -> Optional[PuzzleInDB]:
        puzzles = await self.repository.get_random(limit=1)
        if puzzles:
            return puzzles[0]
        return None
    # TODO: I will remove this endpoint in the future, it is for testing only
    async def create_puzzle(self, puzzle: PuzzleCreate) -> PuzzleInDB:
        return await self.repository.insert(puzzle)
