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

    async def update_status(self, reference_id: str, status: str, notes: Optional[str] = None) -> bool:
        update_data = {"status": status}
        if notes:
            update_data["status_notes"] = notes
        res = await self.collection.update_one(
            {"reference_id": reference_id},
            {"$set": update_data}
        )
        return res.modified_count > 0

    async def reschedule_appointment(self, reference_id: str, new_date: str, new_time: str, doctor_name: Optional[str] = None) -> bool:
        update_data = {
            "preferred_date": new_date,
            "preferred_time": new_time,
            "status": "VERIFIED_CONFIRMED"
        }
        if doctor_name:
            update_data["doctor_name"] = doctor_name
        res = await self.collection.update_one(
            {"reference_id": reference_id},
            {"$set": update_data}
        )
        return res.modified_count > 0

    async def get_overview_counts(self, today_date: str) -> dict:
        total_today = await self.collection.count_documents({"preferred_date": today_date})
        pending_count = await self.collection.count_documents({
            "status": {"$in": ["PENDING_STAFF_FOLLOWUP", "ROUTED_TO_HUMAN_DESK"]}
        })
        cancellations_count = await self.collection.count_documents({"status": "CANCELLED"})
        upcoming_count = await self.collection.count_documents({
            "preferred_date": {"$gte": today_date},
            "status": "VERIFIED_CONFIRMED"
        })
        return {
            "today_count": total_today,
            "upcoming_count": upcoming_count,
            "pending_count": pending_count,
            "cancellations_count": cancellations_count
        }
