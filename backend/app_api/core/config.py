from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Chess Puzzle API"
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "chess_puzzles"
    REDIS_URI: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
