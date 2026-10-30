from typing import List, Optional
from datetime import datetime
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

    async def list_recent(self, limit: int = 50) -> List[dict]:
        cursor = self.collection.find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
        return await cursor.to_list(length=limit)

    async def update_status(self, callback_id: str, status: str, notes: Optional[str] = None) -> bool:
        update_data = {
            "status": status,
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
        if notes:
            update_data["resolution_notes"] = notes

        res = await self.collection.update_one(
            {"callback_id": callback_id},
            {"$set": update_data}
        )
        return res.modified_count > 0
