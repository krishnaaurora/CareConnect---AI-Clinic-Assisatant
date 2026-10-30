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
            raise ValueError(f"Clinic with code '{req.clinic_code}' not found. Please select a verified clinic.")

        clinic_name = clinic.get("name", "CareConnect Partner Clinic")
        doctors = clinic.get("doctors", [])
        
        # Match doctor by name
        matched_doctor = None
        for d in doctors:
            if d.get("name", "").lower() == req.doctor_name.lower() or req.doctor_name.lower() in d.get("name", "").lower():
                matched_doctor = d
                break

        # Zero silent fallback to doctors[0]: keep matched_doctor as None if requested physician is not on roster
        specialty = matched_doctor.get("specialty", "General Consultation") if matched_doctor else "General Consultation"
        
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

        # Record in Audit Logs
        await self.clinic_repo.add_audit_log(
            action="APPOINTMENT_CREATED",
            target=f"Ticket {reference_id} ({appointment_doc['patient_name']})",
            details=f"Booked for {appointment_doc['preferred_date']} at {appointment_doc['preferred_time']} with {appointment_doc['doctor_name']} via {req.booking_source}",
            clinic_code=req.clinic_code,
            user=f"{req.booking_source} Bridge"
        )

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

        # Check active status
        if doctor.get("is_active") is False:
            return (
                False,
                AppointmentStatus.ROUTED_TO_HUMAN_DESK,
                f"Physician {doctor.get('name')} is currently inactive and not accepting new appointments. Routed to clinic desk."
            )

        # Check currently on leave
        if doctor.get("is_on_leave"):
            note = doctor.get("leave_note") or "On approved leave"
            return (
                False,
                AppointmentStatus.ROUTED_TO_HUMAN_DESK,
                f"Physician {doctor.get('name')} is currently on leave ({note}). Unable to confirm appointment for {preferred_date}."
            )

        # Check planned leave records for preferred_date
        leave_records = doctor.get("leave_records") or []
        for lr in leave_records:
            s_date = lr.get("start_date")
            e_date = lr.get("end_date")
            if s_date and e_date and s_date <= preferred_date <= e_date:
                return (
                    False,
                    AppointmentStatus.ROUTED_TO_HUMAN_DESK,
                    f"Physician {doctor.get('name')} is on approved leave from {s_date} to {e_date} ({lr.get('reason')}). Booking cannot be scheduled."
                )

        # Strict conflict check: Prevent double-booking the exact same slot
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

    async def get_by_phone(self, phone: str):
        return await self.repo.get_appointments_by_phone(phone)

    async def check_doctor_availability(
        self,
        doctor_name: str,
        date_str: str,
        clinic_code: str = "CARE-IND-01"
    ) -> Dict[str, Any]:
        clinic = await self.clinic_repo.get_clinic_by_code(clinic_code)
        if not clinic:
            raise ValueError(f"Clinic '{clinic_code}' not found.")

        doctors = clinic.get("doctors", [])
        matched_doctor = None
        for d in doctors:
            if doctor_name.lower() in d.get("name", "").lower() or d.get("name", "").lower() in doctor_name.lower():
                matched_doctor = d
                break

        if not matched_doctor:
            available_names = [d.get("name") for d in doctors if d.get("is_active", True)]
            raise ValueError(f"Doctor '{doctor_name}' not found at {clinic.get('name')}. Available doctors: {', '.join(available_names)}.")

        # Validate day of week
        day_name = None
        try:
            dt = datetime.strptime(date_str.strip(), "%Y-%m-%d")
            day_name = dt.strftime("%A")
        except Exception:
            pass

        available_days = matched_doctor.get("available_days", [])
        if day_name and available_days and day_name not in available_days:
            return {
                "doctor_name": matched_doctor["name"],
                "specialty": matched_doctor.get("specialty", "General"),
                "clinic_code": clinic_code,
                "clinic_name": clinic.get("name"),
                "date": date_str,
                "day_of_week": day_name,
                "is_available": False,
                "reason": f"{matched_doctor['name']} does not consult on {day_name}s.",
                "available_days": available_days,
                "available_slots": [],
                "availability_summary": f"{matched_doctor['name']} is not available on {day_name} ({date_str}). Consultation days are: {', '.join(available_days)}."
            }

        # Check active status
        if matched_doctor.get("is_active") is False:
            return {
                "doctor_name": matched_doctor["name"],
                "specialty": matched_doctor.get("specialty", "General"),
                "clinic_code": clinic_code,
                "clinic_name": clinic.get("name"),
                "date": date_str,
                "is_available": False,
                "reason": f"{matched_doctor['name']} is currently inactive.",
                "available_slots": [],
                "availability_summary": f"{matched_doctor['name']} is currently inactive and not accepting appointments."
            }

        # Check leaves
        if matched_doctor.get("is_on_leave"):
            return {
                "doctor_name": matched_doctor["name"],
                "specialty": matched_doctor.get("specialty", "General"),
                "clinic_code": clinic_code,
                "clinic_name": clinic.get("name"),
                "date": date_str,
                "is_available": False,
                "reason": f"{matched_doctor['name']} is currently on leave ({matched_doctor.get('leave_note') or 'Approved Leave'}).",
                "available_slots": [],
                "availability_summary": f"{matched_doctor['name']} is on leave and unavailable for booking on {date_str}."
            }

        for lr in matched_doctor.get("leave_records") or []:
            s_date = lr.get("start_date")
            e_date = lr.get("end_date")
            if s_date and e_date and s_date <= date_str <= e_date:
                return {
                    "doctor_name": matched_doctor["name"],
                    "specialty": matched_doctor.get("specialty", "General"),
                    "clinic_code": clinic_code,
                    "clinic_name": clinic.get("name"),
                    "date": date_str,
                    "is_available": False,
                    "reason": f"{matched_doctor['name']} is on approved leave from {s_date} to {e_date} ({lr.get('reason')}).",
                    "available_slots": [],
                    "availability_summary": f"{matched_doctor['name']} is on approved leave from {s_date} to {e_date} ({lr.get('reason')}) and unavailable for booking on {date_str}."
                }

        # Candidate slots
        candidate_slots = matched_doctor.get("available_slots", ["09:30 AM", "11:00 AM", "02:30 PM", "04:30 PM", "06:00 PM"])

        # Check existing confirmed bookings in appointments collection
        existing_bookings = await self.repo.collection.find({
            "clinic_code": clinic_code,
            "doctor_name": matched_doctor["name"],
            "preferred_date": date_str,
            "status": "VERIFIED_CONFIRMED"
        }, {"_id": 0, "preferred_time": 1}).to_list(100)
        booked_times = [b.get("preferred_time") for b in existing_bookings]

        # Check blocked slots in clinic
        blocked_slots = clinic.get("blocked_slots", [])
        blocked_times = [
            b.get("time_slot") for b in blocked_slots
            if b.get("doctor_name", "").lower() == matched_doctor["name"].lower() and b.get("date") == date_str
        ]

        # Available slots = candidates - booked - blocked
        unavailable = set(booked_times + blocked_times)
        available = [s for s in candidate_slots if s not in unavailable]

        summary = (
            f"{matched_doctor['name']} ({matched_doctor.get('specialty')}) has {len(available)} available slots on {day_name or ''} {date_str}: {', '.join(available)}."
            if available else
            f"All slots for {matched_doctor['name']} on {date_str} are fully booked."
        )

        return {
            "doctor_name": matched_doctor["name"],
            "specialty": matched_doctor.get("specialty", "General"),
            "clinic_code": clinic_code,
            "clinic_name": clinic.get("name"),
            "date": date_str,
            "day_of_week": day_name,
            "is_available": len(available) > 0,
            "consultation_fee": matched_doctor.get("consultation_fee", 800),
            "consultation_duration": matched_doctor.get("consultation_duration", "20 mins"),
            "available_slots": available,
            "booked_slots": booked_times,
            "blocked_slots": blocked_times,
            "availability_summary": summary
        }

    async def list_all(self):
        return await self.repo.get_recent_appointments(limit=100)

    async def get_by_doctor(self, doctor_name: str, limit: int = 100):
        return await self.repo.get_appointments_by_doctor(doctor_name, limit=limit)

    async def update_status(self, reference_id: str, status: str, notes: str = None):
        appt = await self.repo.get_by_reference(reference_id)
        success = await self.repo.update_status(reference_id, status, notes)
        if success and appt:
            action_name = "APPOINTMENT_CANCELLED" if status == "CANCELLED" else "APPOINTMENT_STATUS_UPDATED"
            await self.clinic_repo.add_audit_log(
                action=action_name,
                target=f"Ticket {reference_id} ({appt.get('patient_name')})",
                details=f"Status updated to {status}. Notes: {notes or 'No notes provided'}",
                clinic_code=appt.get("clinic_code", "CARE-IND-01"),
                user="Kavita Nair (Receptionist)"
            )
        return success

    async def reschedule(self, reference_id: str, new_date: str, new_time: str, doctor_name: str = None) -> dict:
        appt = await self.repo.get_by_reference(reference_id)
        if not appt:
            raise ValueError(f"Appointment {reference_id} not found")
        
        target_doctor = doctor_name or appt.get("doctor_name")
        clinic_code = appt.get("clinic_code", "CARE-IND-01")

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

        await self.clinic_repo.add_audit_log(
            action="APPOINTMENT_RESCHEDULED",
            target=f"Ticket {reference_id} ({appt.get('patient_name')})",
            details=f"Rescheduled to {new_date} at {new_time} with {target_doctor}",
            clinic_code=clinic_code,
            user="Kavita Nair (Receptionist)"
        )

        return {
            "reference_id": reference_id,
            "preferred_date": new_date,
            "preferred_time": new_time,
            "doctor_name": target_doctor,
            "status": "VERIFIED_CONFIRMED"
        }

    async def get_overview(self) -> Dict[str, Any]:
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        recent = await self.repo.get_recent_appointments(limit=100)
        
        # Categorize confirmed appointments (no manual approval queue needed)
        today_appointments = [a for a in recent if a.get("preferred_date") == today_str and a.get("status") != "CANCELLED"]
        upcoming = [a for a in recent if a.get("preferred_date", "") > today_str and a.get("status") != "CANCELLED"]
        cancellations = [a for a in recent if a.get("status") == "CANCELLED"]

        return {
            "metrics": {
                "today_count": len(today_appointments),
                "upcoming_count": len(upcoming),
                "cancellations_count": len(cancellations),
            },
            "today_appointments": today_appointments,
            "upcoming_bookings": upcoming,
            "cancellations": cancellations,
            "all_recent": recent
        }
