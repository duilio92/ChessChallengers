from motor.motor_asyncio import AsyncIOMotorClient
from app_api.core.config import settings

class Database:
    client: AsyncIOMotorClient = None
    
db = Database()

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(settings.MONGODB_URI)

async def close_mongo_connection():
    if db.client:
        db.client.close()
