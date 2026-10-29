import uuid
from typing import List, Optional
from app.modules.clinics.repository import ClinicRepository
from app.modules.clinics.models import (
    ClinicResponse, 
    DoctorModel, 
    DoctorCreateRequest, 
    DoctorUpdateRequest,
    ScheduleConfigRequest,
    BlockSlotRequest
)

class ClinicService:
    def __init__(self):
        self.repository = ClinicRepository()

    async def list_clinics(self) -> List[dict]:
        return await self.repository.get_all_clinics()

    async def get_clinic_details(self, code: str) -> Optional[dict]:
        return await self.repository.get_clinic_by_code(code)

    async def get_all_doctors(self) -> List[dict]:
        clinics = await self.repository.get_all_clinics()
        doctors = []
        for c in clinics:
            clinic_name = c.get("name")
            clinic_code = c.get("code")
            for doc in c.get("doctors", []):
                doc_copy = dict(doc)
                doc_copy["clinic_name"] = clinic_name
                doc_copy["clinic_code"] = clinic_code
                doctors.append(doc_copy)
        return doctors

    async def add_doctor(self, clinic_code: str, doctor_req: DoctorCreateRequest) -> dict:
        doc_dict = doctor_req.model_dump()
        doc_dict["id"] = f"doc-{uuid.uuid4().hex[:6]}"
        success = await self.repository.add_doctor_to_clinic(clinic_code, doc_dict)
        if not success:
            raise ValueError(f"Clinic with code {clinic_code} not found")
        return doc_dict

    async def update_doctor(self, clinic_code: str, doctor_id: str, update_req: DoctorUpdateRequest) -> dict:
        fields = {k: v for k, v in update_req.model_dump().items() if v is not None}
        if not fields:
            return {"id": doctor_id}
        success = await self.repository.update_doctor_in_clinic(clinic_code, doctor_id, fields)
        if not success:
            raise ValueError(f"Doctor {doctor_id} in clinic {clinic_code} not found")
        return fields

    async def toggle_doctor_status(self, clinic_code: str, doctor_id: str, is_active: bool) -> bool:
        return await self.repository.set_doctor_status(clinic_code, doctor_id, is_active)

    async def get_doctors_on_duty(self, day_name: Optional[str] = None) -> List[dict]:
        all_docs = await self.get_all_doctors()
        if not day_name:
            return all_docs
        return [
            d for d in all_docs
            if day_name.lower() in [day.lower() for day in d.get("available_days", [])]
        ]

    async def get_schedule_config(self, clinic_code: str) -> dict:
        return await self.repository.get_schedule_config(clinic_code)

    async def update_schedule_config(self, clinic_code: str, config_req: ScheduleConfigRequest) -> dict:
        cfg = config_req.model_dump()
        await self.repository.update_schedule_config(clinic_code, cfg)
        return cfg

    async def block_slot(self, clinic_code: str, req: BlockSlotRequest) -> dict:
        data = req.model_dump()
        await self.repository.block_slot(clinic_code, data)
        return data

    async def unblock_slot(self, clinic_code: str, doctor_name: str, date: str, time_slot: str) -> bool:
        return await self.repository.unblock_slot(clinic_code, doctor_name, date, time_slot)

    async def get_clinic_settings(self, clinic_code: str) -> dict:
        clinic = await self.get_clinic_details(clinic_code)
        if not clinic:
            clinic = {}
        return {
            "name": clinic.get("name", "Apollo Clinic & Diagnostics"),
            "branch": clinic.get("branch", "100ft Road, Indiranagar, Bengaluru"),
            "phone": clinic.get("phone", "+91 80 4125 7800"),
            "email": "support@careconnect.ai",
            "emergency_phone": "+91 80 4125 7899",
            "timings": clinic.get("timings", "08:00 AM - 08:30 PM (Mon-Sat)"),
            "emergency_opd": clinic.get("emergency_available", False),
            "ai_agent_name": "Priya",
            "ai_greeting": "Hello! I am Priya, your CareConnect AI multilingual voice receptionist. How may I assist you with your appointment today?",
            "supported_languages": ["English", "Hindi", "Telugu", "Kannada"],
            "speech_speed": "Normal (1.0x)",
            "safety_guardrails_enabled": True
        }

    async def get_clinic_staff(self, clinic_code: str) -> List[dict]:
        return [
            {
                "id": "stf-01",
                "name": "Dr. Rajesh Sharma",
                "email": "rajesh.sharma@careconnect.ai",
                "role": "Doctor / Physician",
                "department": "Cardiology",
                "status": "Active",
                "last_active": "Today, 11:45 AM"
            },
            {
                "id": "stf-02",
                "name": "Kavita Nair",
                "email": "kavita.nair@careconnect.ai",
                "role": "Receptionist / Front Desk",
                "department": "Front Office",
                "status": "Active",
                "last_active": "Today, 12:02 PM"
            },
            {
                "id": "stf-03",
                "name": "Vikram Sethi",
                "email": "vikram.sethi@careconnect.ai",
                "role": "Clinic Administrator",
                "department": "Operations",
                "status": "Active",
                "last_active": "Today, 10:15 AM"
            },
            {
                "id": "stf-04",
                "name": "Admin IT Operations",
                "email": "admin@careconnect.ai",
                "role": "Super Admin",
                "department": "IT & Security",
                "status": "Active",
                "last_active": "Just Now"
            }
        ]

    async def get_audit_logs(self, clinic_code: str) -> List[dict]:
        return [
            {
                "id": "LOG-1049",
                "timestamp": "Today, 11:32 AM",
                "user": "Kavita Nair (Receptionist)",
                "action": "APPOINTMENT_RESCHEDULED",
                "target": "Ticket CC-8A91F2C1 (Anita Deshmukh)",
                "details": "Rescheduled slot to 2026-10-29 at 10:30 AM with Dr. Rajesh Sharma",
                "ip_address": "192.168.1.45"
            },
            {
                "id": "LOG-1048",
                "timestamp": "Today, 10:52 AM",
                "user": "Priya Voice AI (Bolna Bridge)",
                "action": "APPOINTMENT_CREATED",
                "target": "Ticket CC-9E55A771 (Karan Johar)",
                "details": "Automated voice appointment booked for Cardiology Consultation",
                "ip_address": "Bolna Telephony Gateway"
            },
            {
                "id": "LOG-1047",
                "timestamp": "Today, 09:45 AM",
                "user": "Vikram Sethi (Clinic Admin)",
                "action": "SLOT_BLOCKED",
                "target": "Dr. Rajesh Sharma (01:00 PM)",
                "details": "Blocked slot for Hospital Medical Board Meeting",
                "ip_address": "192.168.1.12"
            },
            {
                "id": "LOG-1046",
                "timestamp": "Yesterday, 05:20 PM",
                "user": "Priya Voice AI (Bolna Bridge)",
                "action": "APPOINTMENT_CANCELLED",
                "target": "Ticket CC-CNL-008 (Deepak Choudhury)",
                "details": "Caller requested cancellation; slot released back to waitlist",
                "ip_address": "Bolna Telephony Gateway"
            },
            {
                "id": "LOG-1045",
                "timestamp": "Yesterday, 02:10 PM",
                "user": "Vikram Sethi (Clinic Admin)",
                "action": "SETTINGS_UPDATED",
                "target": "Clinic Operating Timings",
                "details": "Extended Saturday evening OPD from 07:00 PM to 08:30 PM",
                "ip_address": "192.168.1.12"
            }
        ]
