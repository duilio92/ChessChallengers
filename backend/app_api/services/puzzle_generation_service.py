from app_api.infrastructure.queue import publish_generate_task

class PuzzleGenerationService:
    async def request_generation(self) -> None:
        # In a real scenario, you might pass specific parameters for generation
        # e.g., themes, difficulty ranges, etc.
        payload = {"action": "generate_puzzle"}
        await publish_generate_task(payload)
