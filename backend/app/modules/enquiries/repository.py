from typing import List
from app.core.database import get_database

class EnquiryRepository:
    @property
    def collection(self):
        return get_database()["enquiries"]

    async def save_callback(self, record: dict) -> dict:
        await self.collection.insert_one(record)
        record_clean = dict(record)
        record_clean.pop("_id", None)
        return record_clean

    async def list_recent(self, limit: int = 20) -> List[dict]:
        cursor = self.collection.find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
        return await cursor.to_list(length=limit)
