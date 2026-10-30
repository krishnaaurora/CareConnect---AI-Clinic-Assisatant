import uuid
from typing import List, Optional
from app.modules.clinics.repository import ClinicRepository
from app.modules.clinics.models import (
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
        if "is_active" not in doc_dict:
            doc_dict["is_active"] = True
        if "department" not in doc_dict:
            doc_dict["department"] = doc_dict.get("specialty", "General Medicine")
        if "duty_status" not in doc_dict:
            doc_dict["duty_status"] = "Available"
        if "current_room" not in doc_dict:
            doc_dict["current_room"] = "Consultation Room"
        if "shifts" not in doc_dict:
            doc_dict["shifts"] = ["09:00 AM - 01:00 PM (Morning)", "04:30 PM - 08:00 PM (Evening)"]
        if "breaks" not in doc_dict:
            doc_dict["breaks"] = ["01:00 PM - 02:00 PM (Lunch)"]

        success = await self.repository.add_doctor_to_clinic(clinic_code, doc_dict)
        if not success:
            raise ValueError(f"Clinic with code {clinic_code} not found")

        # Audit Log
        await self.repository.add_audit_log(
            action="DOCTOR_ADDED",
            target=f"{doc_dict['name']} ({doc_dict['specialty']})",
            details=f"Physician added to roster at {clinic_code} with consultation fee ₹{doc_dict.get('consultation_fee', 800)}",
            clinic_code=clinic_code,
            user="Vikram Sethi (Clinic Admin)"
        )
        return doc_dict

    async def update_doctor(self, clinic_code: str, doctor_id: str, update_req: DoctorUpdateRequest) -> dict:
        fields = {k: v for k, v in update_req.model_dump().items() if v is not None}
        if not fields:
            return {"id": doctor_id}
        success = await self.repository.update_doctor_in_clinic(clinic_code, doctor_id, fields)
        if not success:
            raise ValueError(f"Doctor {doctor_id} in clinic {clinic_code} not found")

        # Audit Log
        await self.repository.add_audit_log(
            action="DOCTOR_UPDATED",
            target=f"Doctor ID {doctor_id}",
            details=f"Updated doctor profile fields: {', '.join(fields.keys())}",
            clinic_code=clinic_code,
            user="Vikram Sethi (Clinic Admin)"
        )
        return fields

    async def toggle_doctor_status(self, clinic_code: str, doctor_id: str, is_active: bool) -> bool:
        success = await self.repository.set_doctor_status(clinic_code, doctor_id, is_active)
        if success:
            status_text = "activated" if is_active else "deactivated"
            await self.repository.add_audit_log(
                action="DOCTOR_STATUS_TOGGLED",
                target=f"Doctor ID {doctor_id}",
                details=f"Physician status switched to {status_text} in {clinic_code}",
                clinic_code=clinic_code,
                user="Vikram Sethi (Clinic Admin)"
            )
        return success

    async def get_doctors_on_duty(self, day_name: Optional[str] = None) -> List[dict]:
        all_docs = await self.get_all_doctors()
        if not day_name:
            return all_docs
        return [
            d for d in all_docs
            if day_name.lower() in [day.lower() for day in d.get("available_days", [])]
        ]

    async def get_schedule_config(self, clinic_code: Optional[str] = None) -> dict:
        return await self.repository.get_schedule_config(clinic_code)

    async def update_schedule_config(self, clinic_code: str, config_req: ScheduleConfigRequest) -> dict:
        cfg = config_req.model_dump()
        await self.repository.update_schedule_config(clinic_code, cfg)
        await self.repository.add_audit_log(
            action="SCHEDULE_CONFIG_SAVED",
            target=f"Clinic {clinic_code} Schedule",
            details=f"Opening: {cfg.get('opening_time')}, Closing: {cfg.get('closing_time')}, Duration: {cfg.get('slot_duration')}",
            clinic_code=clinic_code,
            user="Vikram Sethi (Clinic Admin)"
        )
        return cfg

    async def block_slot(self, clinic_code: str, req: BlockSlotRequest) -> dict:
        data = req.model_dump()
        await self.repository.block_slot(clinic_code, data)
        await self.repository.add_audit_log(
            action="SLOT_BLOCKED",
            target=f"{data.get('doctor_name')} ({data.get('time_slot')})",
            details=f"Blocked on {data.get('date')} for: {data.get('reason', 'Scheduled maintenance / break')}",
            clinic_code=clinic_code,
            user="Vikram Sethi (Clinic Admin)"
        )
        return data

    async def unblock_slot(self, clinic_code: str, doctor_name: str, date: str, time_slot: str) -> bool:
        success = await self.repository.unblock_slot(clinic_code, doctor_name, date, time_slot)
        if success:
            await self.repository.add_audit_log(
                action="SLOT_UNBLOCKED",
                target=f"{doctor_name} ({time_slot})",
                details=f"Slot unblocked and restored to availability for {date}",
                clinic_code=clinic_code,
                user="Vikram Sethi (Clinic Admin)"
            )
        return success

    async def get_clinic_settings(self, clinic_code: str) -> dict:
        return await self.repository.get_clinic_settings(clinic_code)

    async def update_clinic_settings(self, clinic_code: str, settings_payload: dict) -> dict:
        updated = await self.repository.update_clinic_settings(clinic_code, settings_payload)
        await self.repository.add_audit_log(
            action="SETTINGS_UPDATED",
            target=f"Clinic Configuration ({clinic_code})",
            details=f"Updated clinic details, AI receptionist greeting, and hours: {settings_payload.get('timings', '')}",
            clinic_code=clinic_code,
            user="Vikram Sethi (Clinic Admin)"
        )
        return updated

    async def get_clinic_staff(self, clinic_code: str) -> List[dict]:
        return await self.repository.get_clinic_staff(clinic_code)

    async def add_clinic_staff(self, clinic_code: str, staff_data: dict) -> dict:
        new_staff = await self.repository.add_clinic_staff(clinic_code, staff_data)
        await self.repository.add_audit_log(
            action="STAFF_MEMBER_ADDED",
            target=f"{new_staff.get('name')} ({new_staff.get('role')})",
            details=f"Assigned to {new_staff.get('department')} with active privileges",
            clinic_code=clinic_code,
            user="Admin IT Operations"
        )
        return new_staff

    async def get_audit_logs(self, clinic_code: str) -> List[dict]:
        return await self.repository.get_audit_logs(clinic_code)
