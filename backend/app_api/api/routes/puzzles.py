from fastapi import APIRouter, Depends, HTTPException, status
from app_api.domain.puzzle import PuzzleInDB, PuzzleCreate
from app_api.services.puzzle_service import PuzzleService
from app_api.services.puzzle_generation_service import PuzzleGenerationService
from app_api.repositories.puzzle_repo import MongoPuzzleRepository

router = APIRouter(prefix="/api/v1/puzzles", tags=["puzzles"])

def get_puzzle_service() -> PuzzleService:
    repo = MongoPuzzleRepository()
    return PuzzleService(repository=repo)

def get_generation_service() -> PuzzleGenerationService:
    return PuzzleGenerationService()

@router.get("/random", response_model=PuzzleInDB)
async def get_random_puzzle(service: PuzzleService = Depends(get_puzzle_service)):
    puzzle = await service.get_random_puzzle()
    if not puzzle:
        raise HTTPException(status_code=404, detail="No puzzles found in the database.")
    return puzzle

@router.get("/{puzzle_id}", response_model=PuzzleInDB)
async def get_puzzle(puzzle_id: str, service: PuzzleService = Depends(get_puzzle_service)):
    puzzle = await service.get_puzzle_by_id(puzzle_id)
    if not puzzle:
        raise HTTPException(status_code=404, detail="Puzzle not found")
    return puzzle

@router.post("", response_model=PuzzleInDB, status_code=status.HTTP_201_CREATED)
async def create_puzzle(puzzle: PuzzleCreate, service: PuzzleService = Depends(get_puzzle_service)):
    return await service.create_puzzle(puzzle)

@router.post("/generate", status_code=status.HTTP_202_ACCEPTED)
async def generate_puzzle(service: PuzzleGenerationService = Depends(get_generation_service)):
    await service.request_generation()
    return {"message": "Puzzle generation task queued"}
