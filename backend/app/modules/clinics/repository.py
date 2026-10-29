import uuid
from datetime import datetime
from typing import List, Optional
from app.core.database import get_database

class ClinicRepository:
    @property
    def clinics_col(self):
        return get_database()["clinics"]

    @property
    def settings_col(self):
        return get_database()["clinic_settings"]

    @property
    def staff_col(self):
        return get_database()["clinic_staff"]

    @property
    def audit_col(self):
        return get_database()["audit_logs"]

    async def get_all_clinics(self) -> List[dict]:
        cursor = self.clinics_col.find({}, {"_id": 0})
        return await cursor.to_list(length=100)

    async def get_clinic_by_code(self, code: str) -> Optional[dict]:
        return await self.clinics_col.find_one({"code": code}, {"_id": 0})

    async def find_doctor_by_name(self, doctor_name: str) -> Optional[dict]:
        clinic = await self.clinics_col.find_one(
            {"doctors.name": {"$regex": doctor_name, "$options": "i"}},
            {"_id": 0, "name": 1, "branch": 1, "doctors.$": 1}
        )
        return clinic

    async def add_doctor_to_clinic(self, clinic_code: str, doctor_data: dict) -> bool:
        res = await self.clinics_col.update_one(
            {"code": clinic_code},
            {"$push": {"doctors": doctor_data}}
        )
        return res.modified_count > 0

    async def update_doctor_in_clinic(self, clinic_code: str, doctor_id: str, update_fields: dict) -> bool:
        set_dict = {f"doctors.$.{k}": v for k, v in update_fields.items()}
        res = await self.clinics_col.update_one(
            {"code": clinic_code, "doctors.id": doctor_id},
            {"$set": set_dict}
        )
        return res.modified_count > 0

    async def set_doctor_status(self, clinic_code: str, doctor_id: str, is_active: bool) -> bool:
        res = await self.clinics_col.update_one(
            {"code": clinic_code, "doctors.id": doctor_id},
            {"$set": {"doctors.$.is_active": is_active}}
        )
        return res.modified_count > 0

    async def update_schedule_config(self, clinic_code: str, config: dict) -> bool:
        res = await self.clinics_col.update_one(
            {"code": clinic_code},
            {"$set": {"schedule_config": config}}
        )
        return res.modified_count > 0

    async def block_slot(self, clinic_code: str, block_data: dict) -> bool:
        res = await self.clinics_col.update_one(
            {"code": clinic_code},
            {"$push": {"blocked_slots": block_data}}
        )
        return res.modified_count > 0

    async def unblock_slot(self, clinic_code: str, doctor_name: str, date: str, time_slot: str) -> bool:
        res = await self.clinics_col.update_one(
            {"code": clinic_code},
            {"$pull": {"blocked_slots": {"doctor_name": doctor_name, "date": date, "time_slot": time_slot}}}
        )
        return res.modified_count > 0

    async def get_schedule_config(self, clinic_code: str) -> dict:
        clinic = await self.clinics_col.find_one(
            {"code": clinic_code}, 
            {"_id": 0, "schedule_config": 1, "blocked_slots": 1, "timings": 1}
        )
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

    # ── Clinic Settings ──
    async def get_clinic_settings(self, clinic_code: str) -> dict:
        settings_doc = await self.settings_col.find_one({"clinic_code": clinic_code}, {"_id": 0})
        if settings_doc:
            return settings_doc
        
        # Fallback to clinic document
        clinic = await self.get_clinic_by_code(clinic_code)
        if clinic:
            return {
                "name": clinic.get("name", "Apollo Clinic & Diagnostics"),
                "branch": clinic.get("branch", "100ft Road, Indiranagar, Bengaluru"),
                "phone": clinic.get("phone", "+91 80 4125 7800"),
                "email": "support@careconnect.ai",
                "emergency_phone": "+91 80 4125 7899",
                "timings": clinic.get("timings", "08:00 AM - 08:30 PM (Mon-Sat)"),
                "emergency_opd": clinic.get("emergency_available", False),
                "ai_agent_name": "Priya",
                "ai_greeting": "Hello! I am Priya, your CareConnect AI multilingual voice receptionist.",
                "supported_languages": ["English", "Hindi", "Telugu", "Kannada"],
                "speech_speed": "Normal (1.0x)",
                "safety_guardrails_enabled": True
            }
        return {}

    async def update_clinic_settings(self, clinic_code: str, settings_data: dict) -> dict:
        clean_data = dict(settings_data)
        clean_data["clinic_code"] = clinic_code
        clean_data["updated_at"] = datetime.utcnow().isoformat() + "Z"
        
        await self.settings_col.update_one(
            {"clinic_code": clinic_code},
            {"$set": clean_data},
            upsert=True
        )
        
        # Also update main clinic profile details
        update_clinic_fields = {}
        if "name" in clean_data:
            update_clinic_fields["name"] = clean_data["name"]
        if "branch" in clean_data:
            update_clinic_fields["branch"] = clean_data["branch"]
        if "phone" in clean_data:
            update_clinic_fields["phone"] = clean_data["phone"]
        if "timings" in clean_data:
            update_clinic_fields["timings"] = clean_data["timings"]
        if "emergency_opd" in clean_data:
            update_clinic_fields["emergency_available"] = clean_data["emergency_opd"]

        if update_clinic_fields:
            await self.clinics_col.update_one({"code": clinic_code}, {"$set": update_clinic_fields})

        return clean_data

    # ── Clinic Staff ──
    async def get_clinic_staff(self, clinic_code: str) -> List[dict]:
        cursor = self.staff_col.find(
            {"$or": [{"clinic_code": clinic_code}, {"clinic_code": {"$exists": False}}]},
            {"_id": 0}
        )
        staff_list = await cursor.to_list(length=100)
        return staff_list

    async def add_clinic_staff(self, clinic_code: str, staff_data: dict) -> dict:
        staff_dict = dict(staff_data)
        if "id" not in staff_dict:
            staff_dict["id"] = f"stf-{uuid.uuid4().hex[:6]}"
        staff_dict["clinic_code"] = clinic_code
        staff_dict["created_at"] = datetime.utcnow().isoformat() + "Z"
        await self.staff_col.insert_one(staff_dict)
        clean = dict(staff_dict)
        clean.pop("_id", None)
        return clean

    # ── Audit Trail ──
    async def get_audit_logs(self, clinic_code: Optional[str] = None, limit: int = 50) -> List[dict]:
        query = {}
        if clinic_code:
            query = {"$or": [{"clinic_code": clinic_code}, {"clinic_code": {"$exists": False}}]}
        cursor = self.audit_col.find(query, {"_id": 0}).sort("created_at", -1).limit(limit)
        return await cursor.to_list(length=limit)

    async def add_audit_log(
        self,
        action: str,
        target: str,
        details: str,
        clinic_code: str = "CARE-IND-01",
        user: str = "Clinic Administrator",
        ip_address: str = "127.0.0.1"
    ) -> dict:
        now = datetime.utcnow()
        time_str = now.strftime("%I:%M %p")
        log_entry = {
            "id": f"LOG-{now.strftime('%H%M%S')}-{uuid.uuid4().hex[:4].upper()}",
            "clinic_code": clinic_code,
            "timestamp": f"Today, {time_str}",
            "user": user,
            "action": action,
            "target": target,
            "details": details,
            "ip_address": ip_address,
            "created_at": now.isoformat() + "Z"
        }
        await self.audit_col.insert_one(log_entry)
        clean = dict(log_entry)
        clean.pop("_id", None)
        return clean
