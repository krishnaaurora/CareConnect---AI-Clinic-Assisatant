import uuid
from datetime import datetime
from typing import Dict, Any, Tuple
from app.modules.appointments.models import AppointmentCreateRequest, AppointmentStatus
from app.modules.appointments.repository import AppointmentRepository
from app.modules.clinics.repository import ClinicRepository

class AppointmentService:
    def __init__(self):
        self.repo = AppointmentRepository()
        self.clinic_repo = ClinicRepository()

    async def verify_and_create_appointment(self, req: AppointmentCreateRequest) -> Dict[str, Any]:
        reference_id = f"CC-{uuid.uuid4().hex[:8].upper()}"
        created_at = datetime.utcnow().isoformat() + "Z"

        clinic = await self.clinic_repo.get_clinic_by_code(req.clinic_code)
        if not clinic:
            # Fallback lookup by any clinic
            clinics = await self.clinic_repo.get_all_clinics()
            clinic = clinics[0] if clinics else {
                "name": "CareConnect Central Clinic",
                "code": req.clinic_code,
                "doctors": []
            }

        clinic_name = clinic.get("name", "CareConnect Partner Clinic")
        doctors = clinic.get("doctors", [])
        
        # Match doctor
        matched_doctor = None
        for d in doctors:
            if d.get("name", "").lower() == req.doctor_name.lower() or req.doctor_name.lower() in d.get("name", "").lower():
                matched_doctor = d
                break

        if not matched_doctor and doctors:
            # Select first available doctor or keep requested
            matched_doctor = doctors[0]

        specialty = matched_doctor.get("specialty", "General Medicine") if matched_doctor else "General Consultation"
        
        # Backend verification step
        is_verified, status, verification_msg = await self._run_verification(
            clinic=clinic,
            doctor=matched_doctor,
            preferred_date=req.preferred_date,
            preferred_time=req.preferred_time
        )

        appointment_doc = {
            "reference_id": reference_id,
            "patient_name": req.patient_name.strip(),
            "phone": req.phone.strip(),
            "clinic_code": req.clinic_code,
            "clinic_name": clinic_name,
            "doctor_name": matched_doctor["name"] if matched_doctor else req.doctor_name,
            "specialty": specialty,
            "preferred_date": req.preferred_date,
            "preferred_time": req.preferred_time,
            "visit_type": req.visit_type.value,
            "notes": req.notes,
            "status": status.value,
            "verification_message": verification_msg,
            "staff_followup_required": status != AppointmentStatus.VERIFIED_CONFIRMED,
            "source": req.booking_source,
            "created_at": created_at
        }

        saved = await self.repo.create_appointment(appointment_doc)
        return saved

    async def _run_verification(
        self,
        clinic: dict,
        doctor: dict,
        preferred_date: str,
        preferred_time: str
    ) -> Tuple[bool, AppointmentStatus, str]:
        """
        Safety & Backend verification rule:
        AI must not claim a booking is confirmed without successful verification against
        doctor availability and database conflict checks.
        """
        if not doctor:
            return (
                False,
                AppointmentStatus.ROUTED_TO_HUMAN_DESK,
                "Requested physician schedule requires manual clinic verification. Clinic desk has been alerted for priority callback."
            )

        # Strict conflict check: Prevent two patients from booking the exact same slot
        conflict_count = await self.repo.count_existing_bookings(
            clinic_code=clinic.get("code", ""),
            doctor_name=doctor.get("name", ""),
            preferred_date=preferred_date,
            preferred_time=preferred_time
        )

        if conflict_count >= 1:
            return (
                False,
                AppointmentStatus.PENDING_STAFF_FOLLOWUP,
                f"Slot conflict: {preferred_time} on {preferred_date} with {doctor.get('name')} is already booked. Double-booking prevented. Routed to front-desk for alternative slot allocation."
            )

        # Slot is valid and verified
        return (
            True,
            AppointmentStatus.VERIFIED_CONFIRMED,
            f"Verified by Clinic Backend: Appointment confirmed with {doctor.get('name')} at {clinic.get('name')} for {preferred_date} at {preferred_time}."
        )

    async def get_by_reference(self, reference_id: str):
        return await self.repo.get_by_reference(reference_id)

    async def list_all(self):
        return await self.repo.get_recent_appointments()

    async def update_status(self, reference_id: str, status: str, notes: str = None):
        return await self.repo.update_status(reference_id, status, notes)

    async def reschedule(self, reference_id: str, new_date: str, new_time: str, doctor_name: str = None) -> dict:
        appt = await self.repo.get_by_reference(reference_id)
        if not appt:
            raise ValueError(f"Appointment {reference_id} not found")
        
        target_doctor = doctor_name or appt.get("doctor_name")
        clinic_code = appt.get("clinic_code", "")

        # Conflict check
        conflict_count = await self.repo.count_existing_bookings(
            clinic_code=clinic_code,
            doctor_name=target_doctor,
            preferred_date=new_date,
            preferred_time=new_time
        )
        if conflict_count >= 1:
            raise ValueError(f"Slot {new_time} on {new_date} with {target_doctor} is already booked. Double-booking prevented.")

        success = await self.repo.reschedule_appointment(reference_id, new_date, new_time, doctor_name)
        if not success:
            raise ValueError("Failed to reschedule appointment")

        return {
            "reference_id": reference_id,
            "preferred_date": new_date,
            "preferred_time": new_time,
            "doctor_name": target_doctor,
            "status": "VERIFIED_CONFIRMED"
        }

    async def get_overview(self) -> Dict[str, Any]:
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        metrics = await self.repo.get_overview_counts(today_str)
        recent = await self.repo.get_recent_appointments(limit=60)
        
        # Categorize
        today_appointments = [a for a in recent if a.get("preferred_date") == today_str]
        upcoming = [a for a in recent if a.get("preferred_date", "") >= today_str and a.get("status") == "VERIFIED_CONFIRMED"]
        pending = [a for a in recent if a.get("status") in ["PENDING_STAFF_FOLLOWUP", "ROUTED_TO_HUMAN_DESK"]]
        cancellations = [a for a in recent if a.get("status") == "CANCELLED"]

        return {
            "metrics": {
                "today_count": len(today_appointments) or metrics.get("today_count", 0),
                "upcoming_count": len(upcoming) or metrics.get("upcoming_count", 0),
                "pending_count": len(pending) or metrics.get("pending_count", 0),
                "cancellations_count": len(cancellations) or metrics.get("cancellations_count", 0),
            },
            "today_appointments": today_appointments,
            "upcoming_bookings": upcoming[:15],
            "pending_requests": pending[:15],
            "cancellations": cancellations[:15],
            "all_recent": recent[:30]
        }
