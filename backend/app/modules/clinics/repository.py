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

    async def add_doctor_to_clinic(self, clinic_code: str, doctor_data: dict) -> bool:
        res = await self.collection.update_one(
            {"code": clinic_code},
            {"$push": {"doctors": doctor_data}}
        )
        return res.modified_count > 0

    async def update_doctor_in_clinic(self, clinic_code: str, doctor_id: str, update_fields: dict) -> bool:
        set_dict = {f"doctors.$.{k}": v for k, v in update_fields.items()}
        res = await self.collection.update_one(
            {"code": clinic_code, "doctors.id": doctor_id},
            {"$set": set_dict}
        )
        return res.modified_count > 0

    async def set_doctor_status(self, clinic_code: str, doctor_id: str, is_active: bool) -> bool:
        res = await self.collection.update_one(
            {"code": clinic_code, "doctors.id": doctor_id},
            {"$set": {"doctors.$.is_active": is_active}}
        )
        return res.modified_count > 0

    async def update_schedule_config(self, clinic_code: str, config: dict) -> bool:
        res = await self.collection.update_one(
            {"code": clinic_code},
            {"$set": {"schedule_config": config}}
        )
        return res.modified_count > 0

    async def block_slot(self, clinic_code: str, block_data: dict) -> bool:
        res = await self.collection.update_one(
            {"code": clinic_code},
            {"$push": {"blocked_slots": block_data}}
        )
        return res.modified_count > 0

    async def unblock_slot(self, clinic_code: str, doctor_name: str, date: str, time_slot: str) -> bool:
        res = await self.collection.update_one(
            {"code": clinic_code},
            {"$pull": {"blocked_slots": {"doctor_name": doctor_name, "date": date, "time_slot": time_slot}}}
        )
        return res.modified_count > 0

    async def get_schedule_config(self, clinic_code: str) -> dict:
        clinic = await self.collection.find_one({"code": clinic_code}, {"_id": 0, "schedule_config": 1, "blocked_slots": 1, "timings": 1})
        if not clinic:
            return {
                "opening_time": "08:30 AM",
                "closing_time": "08:30 PM",
                "slot_duration": "20 mins",
                "buffer_time": "5 mins",
                "blocked_slots": []
            }
        cfg = clinic.get("schedule_config", {})
        return {
            "opening_time": cfg.get("opening_time", "08:30 AM"),
            "closing_time": cfg.get("closing_time", "08:30 PM"),
            "slot_duration": cfg.get("slot_duration", "20 mins"),
            "buffer_time": cfg.get("buffer_time", "5 mins"),
            "blocked_slots": clinic.get("blocked_slots", [])
        }
