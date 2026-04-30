from fastapi import FastAPI
from contextlib import asynccontextmanager

from app_api.core.config import settings
from app_api.api.routes import puzzles
from app_api.infrastructure.database import connect_to_mongo, close_mongo_connection
from app_api.infrastructure.queue import connect_to_redis, close_redis_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    await connect_to_redis()
    yield
    # Shutdown
    await close_redis_connection()
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

app.include_router(puzzles.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Chess Puzzle API"}
