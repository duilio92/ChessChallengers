from abc import ABC, abstractmethod
from typing import Optional, List
from bson import ObjectId
from app_api.domain.puzzle import PuzzleInDB, PuzzleCreate
from app_api.infrastructure.database import db
from app_api.core.config import settings

class PuzzleRepository(ABC):
    @abstractmethod
    async def get_by_id(self, puzzle_id: str) -> Optional[PuzzleInDB]:
        pass

    @abstractmethod
    async def get_random(self, limit: int = 1) -> List[PuzzleInDB]:
        pass

    @abstractmethod
    async def insert(self, puzzle: PuzzleCreate) -> PuzzleInDB:
        pass

class MongoPuzzleRepository(PuzzleRepository):
    @property
    def collection(self):
        return db.client[settings.MONGODB_DB_NAME]["puzzles"]

    async def get_by_id(self, puzzle_id: str) -> Optional[PuzzleInDB]:
        if not ObjectId.is_valid(puzzle_id):
            return None
        doc = await self.collection.find_one({"_id": ObjectId(puzzle_id)})
        if doc:
            doc["id"] = str(doc.pop("_id"))
            return PuzzleInDB(**doc)
        return None

    async def get_random(self, limit: int = 1) -> List[PuzzleInDB]:
        pipeline = [{"$sample": {"size": limit}}]
        cursor = self.collection.aggregate(pipeline)
        puzzles = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            puzzles.append(PuzzleInDB(**doc))
        return puzzles

    async def insert(self, puzzle: PuzzleCreate) -> PuzzleInDB:
        puzzle_dict = puzzle.model_dump()
        result = await self.collection.insert_one(puzzle_dict)
        puzzle_dict["id"] = str(result.inserted_id)
        return PuzzleInDB(**puzzle_dict)
