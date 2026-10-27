from typing import List, Optional
from app.core.database import get_database

class AppointmentRepository:
    @property
    def collection(self):
        return get_database()["appointments"]

    async def create_appointment(self, appointment_data: dict) -> dict:
        await self.collection.insert_one(appointment_data)
        # Return without MongoDB internal _id
        appointment_data_clean = dict(appointment_data)
        appointment_data_clean.pop("_id", None)
        return appointment_data_clean

    async def get_by_reference(self, reference_id: str) -> Optional[dict]:
        return await self.collection.find_one({"reference_id": reference_id}, {"_id": 0})

    async def get_appointments_by_phone(self, phone: str) -> List[dict]:
        cursor = self.collection.find({"phone": phone}, {"_id": 0}).sort("created_at", -1)
        return await cursor.to_list(length=20)

    async def count_existing_bookings(self, clinic_code: str, doctor_name: str, preferred_date: str, preferred_time: str) -> int:
        return await self.collection.count_documents({
            "clinic_code": clinic_code,
            "doctor_name": doctor_name,
            "preferred_date": preferred_date,
            "preferred_time": preferred_time,
            "status": "VERIFIED_CONFIRMED"
        })

    async def get_recent_appointments(self, limit: int = 50) -> List[dict]:
        cursor = self.collection.find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
        return await cursor.to_list(length=limit)
