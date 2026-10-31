from typing import List, Optional, Dict, Any
from datetime import datetime
from app.core.database import get_database

class AppointmentRepository:
    @property
    def collection(self):
        return get_database()["appointments"]

    async def create_appointment(self, appointment_data: dict) -> dict:
        await self.collection.insert_one(appointment_data)
        appointment_data_clean = dict(appointment_data)
        appointment_data_clean.pop("_id", None)
        return appointment_data_clean

    async def get_by_reference(self, reference_id: str) -> Optional[dict]:
        return await self.collection.find_one({"reference_id": reference_id}, {"_id": 0})

    async def get_appointments_by_phone(self, phone: str) -> List[dict]:
        clean_digits = "".join(filter(str.isdigit, str(phone)))
        query: dict = {"$or": [{"phone": phone}]}
        if len(clean_digits) >= 10:
            last10 = clean_digits[-10:]
            query["$or"].append({"phone": {"$regex": last10}})
        cursor = self.collection.find(query, {"_id": 0}).sort("created_at", -1)
        return await cursor.to_list(length=50)

    async def count_existing_bookings(
        self, 
        clinic_code: str, 
        doctor_name: str, 
        preferred_date: str, 
        preferred_time: str,
        exclude_reference_id: Optional[str] = None
    ) -> int:
        query = {
            "doctor_name": {"$regex": f"^{doctor_name}$", "$options": "i"},
            "preferred_date": preferred_date,
            "preferred_time": preferred_time,
            "status": {"$in": ["VERIFIED_CONFIRMED", "IN_CONSULTATION"]}
        }
        if clinic_code:
            query["clinic_code"] = clinic_code
        if exclude_reference_id:
            query["reference_id"] = {"$ne": exclude_reference_id}

        return await self.collection.count_documents(query)

    async def get_by_doctor_and_date(self, clinic_code: str, doctor_name: str, date_str: str) -> List[dict]:
        query = {
            "doctor_name": {"$regex": f"^{doctor_name}$", "$options": "i"},
            "preferred_date": date_str,
            "status": {"$in": ["VERIFIED_CONFIRMED", "IN_CONSULTATION"]}
        }
        if clinic_code:
            query["clinic_code"] = clinic_code
        cursor = self.collection.find(query, {"_id": 0})
        return await cursor.to_list(length=100)

    async def get_recent_appointments(self, limit: int = 150) -> List[dict]:
        cursor = self.collection.find({}, {"_id": 0}).sort("preferred_date", -1).limit(limit)
        return await cursor.to_list(length=limit)

    async def get_appointments_by_doctor(self, doctor_name: str, limit: int = 100) -> List[dict]:
        cursor = self.collection.find(
            {"doctor_name": {"$regex": doctor_name, "$options": "i"}},
            {"_id": 0}
        ).sort("preferred_date", -1).limit(limit)
        return await cursor.to_list(length=limit)

    async def update_status(self, reference_id: str, status: str, notes: Optional[str] = None) -> bool:
        update_data = {
            "status": status,
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
        if notes:
            update_data["status_notes"] = notes
        res = await self.collection.update_one(
            {"reference_id": reference_id},
            {"$set": update_data}
        )
        return res.modified_count > 0

    async def reschedule_appointment(
        self, 
        reference_id: str, 
        new_date: str, 
        new_time: str, 
        doctor_name: Optional[str] = None,
        notes: Optional[str] = None
    ) -> bool:
        update_data = {
            "preferred_date": new_date,
            "preferred_time": new_time,
            "status": "VERIFIED_CONFIRMED",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
        if doctor_name:
            update_data["doctor_name"] = doctor_name
        if notes:
            update_data["notes"] = notes

        res = await self.collection.update_one(
            {"reference_id": reference_id},
            {"$set": update_data}
        )
        return res.modified_count > 0

    async def record_reminder(self, reference_id: str, reminder_entry: dict) -> bool:
        res = await self.collection.update_one(
            {"reference_id": reference_id},
            {
                "$set": {
                    "reminder_sent": True,
                    "reminder_sent_at": reminder_entry.get("sent_at"),
                    "reminder_status": reminder_entry.get("status", "Dispatched"),
                    "reminder_channel": reminder_entry.get("channel", "Priya Voice AI & SMS"),
                    "updated_at": datetime.utcnow().isoformat() + "Z"
                },
                "$push": {
                    "reminder_history": reminder_entry
                }
            }
        )
        return res.modified_count > 0

    async def get_overview_counts(self, today_date: str) -> dict:
        total = await self.collection.count_documents({})
        total_today = await self.collection.count_documents({"preferred_date": today_date, "status": {"$ne": "CANCELLED"}})
        pending_count = await self.collection.count_documents({
            "status": {"$in": ["PENDING_STAFF_FOLLOWUP", "ROUTED_TO_HUMAN_DESK", "PENDING"]}
        })
        confirmed_count = await self.collection.count_documents({"status": "VERIFIED_CONFIRMED"})
        completed_count = await self.collection.count_documents({"status": "COMPLETED"})
        cancellations_count = await self.collection.count_documents({"status": "CANCELLED"})
        upcoming_count = await self.collection.count_documents({
            "preferred_date": {"$gt": today_date},
            "status": "VERIFIED_CONFIRMED"
        })
        ai_count = await self.collection.count_documents({
            "source": {"$regex": "AI|Priya", "$options": "i"}
        })
        staff_count = total - ai_count

        return {
            "total_count": total,
            "today_count": total_today,
            "upcoming_count": upcoming_count,
            "pending_count": pending_count,
            "confirmed_count": confirmed_count,
            "completed_count": completed_count,
            "cancellations_count": cancellations_count,
            "ai_count": ai_count,
            "staff_count": staff_count
        }
