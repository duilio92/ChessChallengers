import pytest
import json
from pathlib import Path
from fastapi.testclient import TestClient
from app_api.main import app
from app_api.domain.puzzle import PuzzleInDB
from app_api.api.routes.puzzles import get_puzzle_service

client = TestClient(app)

FIXTURES_DIR = Path(__file__).parent.parent / "fixtures"

def load_mock_puzzle():
    with open(FIXTURES_DIR / "mock_puzzle.json", "r") as f:
        return json.load(f)

class MockPuzzleService:
    def __init__(self):
        self.mock_data = load_mock_puzzle()
        
    async def get_puzzle_by_id(self, puzzle_id: str):
        if puzzle_id == self.mock_data["id"]:
            return PuzzleInDB(**self.mock_data)
        return None

    async def get_random_puzzle(self):
        return PuzzleInDB(**self.mock_data)

    async def create_puzzle(self, puzzle):
        # Return the puzzle but assign it the mock ID
        data = puzzle.model_dump()
        data["id"] = self.mock_data["id"]
        return PuzzleInDB(**data)

@pytest.fixture
def override_puzzle_service():
    app.dependency_overrides[get_puzzle_service] = lambda: MockPuzzleService()
    yield
    app.dependency_overrides.clear()

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Chess Puzzle API"}

def test_generate_endpoint_returns_202():
    response = client.post("/api/v1/puzzles/generate")
    # This endpoint is decoupled and just pushes to a queue
    assert response.status_code == 202
    assert response.json() == {"message": "Puzzle generation task queued"}

def test_get_puzzle_success(override_puzzle_service):
    mock_id = load_mock_puzzle()["id"]
    response = client.get(f"/api/v1/puzzles/{mock_id}")
    assert response.status_code == 200
    assert response.json()["id"] == mock_id
    assert response.json()["fen"] == load_mock_puzzle()["fen"]

def test_get_puzzle_not_found(override_puzzle_service):
    response = client.get("/api/v1/puzzles/nonexistent_id")
    assert response.status_code == 404
    assert response.json()["detail"] == "Puzzle not found"

def test_get_random_puzzle_success(override_puzzle_service):
    response = client.get("/api/v1/puzzles/random")
    assert response.status_code == 200
    assert response.json()["id"] == load_mock_puzzle()["id"]

class EmptyMockPuzzleService(MockPuzzleService):
    async def get_random_puzzle(self):
        return None

def test_get_random_puzzle_not_found():
    app.dependency_overrides[get_puzzle_service] = lambda: EmptyMockPuzzleService()
    response = client.get("/api/v1/puzzles/random")
    assert response.status_code == 404
    assert response.json()["detail"] == "No puzzles found in the database."
    app.dependency_overrides.clear()

def test_create_puzzle_success(override_puzzle_service):
    new_puzzle = {
        "fen": "8/8/8/8/8/8/8/8 w - - 0 1",
        "moves": [{"uci": "e2e4"}]
    }
    response = client.post("/api/v1/puzzles", json=new_puzzle)
    assert response.status_code == 201
    assert response.json()["fen"] == new_puzzle["fen"]
    assert "id" in response.json()

def test_create_puzzle_validation_error(override_puzzle_service):
    bad_puzzle = {
        "fen": "8/8/8/8/8/8/8/8 w - - 0 1",
        # missing the required "moves" field
    }
    response = client.post("/api/v1/puzzles", json=bad_puzzle)
    assert response.status_code == 422
