import redis.asyncio as redis
from app_api.core.config import settings
import json

class Queue:
    client: redis.Redis = None

redis_queue = Queue()

async def connect_to_redis():
    redis_queue.client = await redis.from_url(settings.REDIS_URI)

async def close_redis_connection():
    if redis_queue.client:
        await redis_queue.client.close()

async def publish_generate_task(payload: dict):
    if redis_queue.client:
        await redis_queue.client.lpush("puzzle_generation_queue", json.dumps(payload))
