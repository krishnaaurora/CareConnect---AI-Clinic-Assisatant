from typing import List, Optional
from app.core.database import get_database

class ClinicRepository:
    def __init__(self):
        pass

    @property
    def collection(self):
        return get_database()["clinics"]

    async def get_all_clinics(self) -> List[dict]:
        cursor = self.collection.find({}, {"_id": 0})
        return await cursor.to_list(length=100)

    async def get_clinic_by_code(self, code: str) -> Optional[dict]:
        return await self.collection.find_one({"code": code}, {"_id": 0})

    async def find_doctor_by_name(self, doctor_name: str) -> Optional[dict]:
        clinic = await self.collection.find_one(
            {"doctors.name": {"$regex": doctor_name, "$options": "i"}},
            {"_id": 0, "name": 1, "branch": 1, "doctors.$": 1}
        )
        return clinic
