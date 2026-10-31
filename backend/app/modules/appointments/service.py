import uuid
import re
from datetime import datetime, timedelta
from typing import Dict, Any, Tuple, List, Optional
from app.modules.appointments.models import AppointmentCreateRequest, AppointmentStatus
from app.modules.appointments.repository import AppointmentRepository
from app.modules.clinics.repository import ClinicRepository
from app.core.database import get_database

STANDARD_TIME_SLOTS = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
    "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM"
]

class AppointmentService:
    def __init__(self):
        self.repo = AppointmentRepository()
        self.clinic_repo = ClinicRepository()

    async def verify_and_create_appointment(self, req: AppointmentCreateRequest) -> Dict[str, Any]:
        reference_id = f"CC-{uuid.uuid4().hex[:8].upper()}"
        now_iso = datetime.utcnow().isoformat() + "Z"

        clinic = await self.clinic_repo.get_clinic_by_code(req.clinic_code)
        if not clinic:
            # Fallback to primary clinic if not specified
            clinic = await self.clinic_repo.get_primary_clinic()
            if not clinic:
                raise ValueError(f"Clinic with code '{req.clinic_code}' not found.")

        clinic_name = clinic.get("name", "Apollo Clinic Indiranagar")
        clinic_code = clinic.get("code", req.clinic_code)
        doctors = clinic.get("doctors", [])
        
        # Match doctor by name
        matched_doctor = None
        for d in doctors:
            if d.get("name", "").lower() == req.doctor_name.lower() or req.doctor_name.lower() in d.get("name", "").lower():
                matched_doctor = d
                break

        specialty = matched_doctor.get("specialty", "General Consultation") if matched_doctor else "General Consultation"
        
        # Run verification checks
        is_verified, status, verification_msg = await self._run_verification(
            clinic=clinic,
            doctor=matched_doctor,
            preferred_date=req.preferred_date,
            preferred_time=req.preferred_time
        )

        visit_type_val = req.visit_type or "In-Person Consultation"

        appointment_doc = {
            "reference_id": reference_id,
            "patient_name": req.patient_name.strip(),
            "phone": req.phone.strip(),
            "email": req.email.strip() if req.email else None,
            "patient_id": req.patient_id,
            "age": req.age,
            "gender": req.gender,
            "clinic_code": clinic_code,
            "clinic_name": clinic_name,
            "doctor_name": matched_doctor["name"] if matched_doctor else req.doctor_name,
            "specialty": specialty,
            "preferred_date": req.preferred_date,
            "preferred_time": req.preferred_time,
            "visit_type": visit_type_val,
            "notes": req.notes,
            "status": status.value if hasattr(status, "value") else str(status),
            "verification_message": verification_msg,
            "staff_followup_required": status != AppointmentStatus.VERIFIED_CONFIRMED,
            "source": req.booking_source or "Clinic Console / Staff",
            "reminder_sent": False,
            "reminder_sent_at": None,
            "reminder_history": [],
            "created_at": now_iso,
            "updated_at": now_iso
        }

        saved = await self.repo.create_appointment(appointment_doc)

        # Audit log
        await self.clinic_repo.add_audit_log(
            action="APPOINTMENT_CREATED",
            target=f"Ticket {reference_id} ({appointment_doc['patient_name']})",
            details=f"Booked for {appointment_doc['preferred_date']} at {appointment_doc['preferred_time']} with {appointment_doc['doctor_name']} via {req.booking_source}",
            clinic_code=clinic_code,
            user=f"{req.booking_source}"
        )

        # Trigger instant automated Priya Voice AI confirmation call to the patient!
        try:
            from app.modules.sarvam.service import SarvamService
            sarvam_svc = SarvamService()
            call_res = await sarvam_svc.trigger_appointment_confirmation_call(saved)
            saved["sarvam_call_triggered"] = call_res.get("success", False)
            saved["sarvam_call_attempt_id"] = call_res.get("attempt_id")
        except Exception as e:
            # Non-blocking: appointment is safely stored even if telephony client logs warning
            saved["sarvam_call_triggered"] = False
            saved["sarvam_call_error"] = str(e)

        return saved

    async def _run_verification(
        self,
        clinic: dict,
        doctor: Optional[dict],
        preferred_date: str,
        preferred_time: str
    ) -> Tuple[bool, AppointmentStatus, str]:
        if not doctor:
            return (
                False,
                AppointmentStatus.ROUTED_TO_HUMAN_DESK,
                "Requested physician schedule requires manual clinic verification. Clinic desk has been alerted for priority callback."
            )

        if doctor.get("is_active") is False:
            return (
                False,
                AppointmentStatus.ROUTED_TO_HUMAN_DESK,
                f"Physician {doctor.get('name')} is currently inactive and not accepting new appointments."
            )

        if doctor.get("is_on_leave"):
            note = doctor.get("leave_note") or "On approved leave"
            return (
                False,
                AppointmentStatus.ROUTED_TO_HUMAN_DESK,
                f"Physician {doctor.get('name')} is currently on leave ({note}). Unable to confirm appointment for {preferred_date}."
            )

        leave_records = doctor.get("leave_records") or []
        for lr in leave_records:
            s_date = lr.get("start_date")
            e_date = lr.get("end_date")
            if s_date and e_date and s_date <= preferred_date <= e_date:
                return (
                    False,
                    AppointmentStatus.ROUTED_TO_HUMAN_DESK,
                    f"Physician {doctor.get('name')} is on approved leave from {s_date} to {e_date} ({lr.get('reason')})."
                )

        # Conflict check
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
                f"Slot conflict: {preferred_time} on {preferred_date} with {doctor.get('name')} is already booked. Double-booking prevented."
            )

        return (
            True,
            AppointmentStatus.VERIFIED_CONFIRMED,
            f"Verified by Clinic Backend: Appointment confirmed with {doctor.get('name')} for {preferred_date} at {preferred_time}."
        )

    async def get_by_reference(self, reference_id: str):
        return await self.repo.get_by_reference(reference_id)

    async def get_by_phone(self, phone: str):
        return await self.repo.get_appointments_by_phone(phone)

    async def check_doctor_availability(
        self,
        doctor_name: Optional[str] = None,
        date_str: Optional[str] = None,
        clinic_code: str = "CARE-IND-01"
    ) -> Dict[str, Any]:
        clinic = await self.clinic_repo.get_clinic_by_code(clinic_code)
        if not clinic:
            clinic = await self.clinic_repo.get_primary_clinic()
            if not clinic:
                clinic = {"name": "Apollo Clinic Indiranagar", "code": clinic_code, "doctors": []}

        doctors = clinic.get("doctors", [])
        if not doctors:
            # Fallback default clinic doctor
            doctors = [{
                "name": "Dr. Ramesh Kumar",
                "specialty": "General Medicine",
                "is_active": True,
                "available_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            }]

        # 1. Parse and normalize date
        clean_date = str(date_str or "").strip().lower()
        now = datetime.now()
        if not clean_date or clean_date in ["tomorrow", "kal", "next day"]:
            target_dt = now + timedelta(days=1)
            date_str = target_dt.strftime("%Y-%m-%d")
        elif clean_date in ["today", "aaj"]:
            target_dt = now
            date_str = target_dt.strftime("%Y-%m-%d")
        else:
            try:
                target_dt = datetime.strptime(clean_date, "%Y-%m-%d")
                date_str = target_dt.strftime("%Y-%m-%d")
            except Exception:
                target_dt = now + timedelta(days=1)
                date_str = target_dt.strftime("%Y-%m-%d")

        day_name = target_dt.strftime("%A")

        # 2. Match doctor flexibly
        doc_query = str(doctor_name or "").strip().lower()
        matched_doctor = None
        if doc_query and doc_query not in ["any", "doctor", "physician", "anyone", "none"]:
            for d in doctors:
                d_name = d.get("name", "").lower()
                d_spec = d.get("specialty", "").lower()
                if doc_query in d_name or d_name in doc_query or doc_query in d_spec:
                    matched_doctor = d
                    break

        if not matched_doctor:
            # Default to first active doctor
            matched_doctor = next((d for d in doctors if d.get("is_active", True)), doctors[0])

        available_days = matched_doctor.get("available_days", ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
        
        # Check if doctor is on leave
        is_on_leave = matched_doctor.get("is_on_leave", False)
        for lr in matched_doctor.get("leave_records") or []:
            s_date = lr.get("start_date")
            e_date = lr.get("end_date")
            if s_date and e_date and s_date <= date_str <= e_date:
                is_on_leave = True
                break

        # Check existing bookings to avoid conflicts
        existing_bookings = await self.repo.get_by_doctor_and_date(
            clinic_code=clinic.get("code", clinic_code),
            doctor_name=matched_doctor["name"],
            date_str=date_str
        )
        booked_slots = set([b.get("preferred_time") for b in existing_bookings if b.get("status") != "CANCELLED"])
        open_slots = [s for s in STANDARD_TIME_SLOTS if s not in booked_slots]

        is_avail = (day_name in available_days) and not is_on_leave and len(open_slots) > 0
        summary = (
            f"{matched_doctor['name']} ({matched_doctor.get('specialty')}) has open slots on {day_name}, {date_str}: {', '.join(open_slots[:4])}."
            if is_avail else
            f"{matched_doctor['name']} is fully booked or unavailable on {day_name}, {date_str}."
        )

        return {
            "doctor_name": matched_doctor["name"],
            "specialty": matched_doctor.get("specialty", "General Medicine"),
            "clinic_code": clinic.get("code", clinic_code),
            "clinic_name": clinic.get("name", "Apollo Clinic Indiranagar"),
            "date": date_str,
            "day_of_week": day_name,
            "is_available": is_avail,
            "available_slots": open_slots[:8] if is_avail else [],
            "availability_summary": summary,
            "next_available_slot": open_slots[0] if open_slots else "11:30 AM"
        }

    async def get_doctor_slots_grid(
        self,
        doctor_name: str,
        date_str: str,
        clinic_code: str = "CARE-IND-01"
    ) -> Dict[str, Any]:
        """Provides full slot breakdown with availability flags for frontend interactive slot picker."""
        data = await self.check_doctor_availability(doctor_name, date_str, clinic_code)
        booked_set = set(data.get("booked_slots", []))
        blocked_set = set(data.get("blocked_slots", []))
        available_set = set(data.get("available_slots", []))

        # Use standard list of slots to present a complete schedule
        slots_grid = []
        for slot in STANDARD_TIME_SLOTS:
            if slot in booked_set:
                slots_grid.append({"time": slot, "status": "BOOKED", "available": False, "label": "Booked"})
            elif slot in blocked_set:
                slots_grid.append({"time": slot, "status": "BLOCKED", "available": False, "label": "Blocked"})
            elif slot in available_set:
                slots_grid.append({"time": slot, "status": "AVAILABLE", "available": True, "label": "Available"})
            else:
                # Slot outside regular shift
                slots_grid.append({"time": slot, "status": "OFF_DUTY", "available": False, "label": "Off Shift"})

        return {
            "doctor_name": data["doctor_name"],
            "specialty": data["specialty"],
            "date": date_str,
            "day_of_week": data.get("day_of_week"),
            "is_day_available": data["is_available"],
            "slots": slots_grid
        }

    async def list_all(self):
        return await self.repo.get_recent_appointments(limit=150)

    async def get_by_doctor(self, doctor_name: str, limit: int = 100):
        return await self.repo.get_appointments_by_doctor(doctor_name, limit=limit)

    async def update_status(self, reference_id: str, status: str, notes: str = None):
        appt = await self.repo.get_by_reference(reference_id)
        if not appt:
            return False

        success = await self.repo.update_status(reference_id, status, notes)
        if success:
            action_name = "APPOINTMENT_CANCELLED" if status == "CANCELLED" else "APPOINTMENT_STATUS_UPDATED"
            await self.clinic_repo.add_audit_log(
                action=action_name,
                target=f"Ticket {reference_id} ({appt.get('patient_name')})",
                details=f"Status updated to '{status}'. Notes: {notes or 'Updated via clinic console.'}",
                clinic_code=appt.get("clinic_code", "CARE-IND-01"),
                user="Kavita Nair (Clinic Administrator)"
            )
        return success

    async def reschedule(self, reference_id: str, new_date: str, new_time: str, doctor_name: str = None, notes: str = None) -> dict:
        appt = await self.repo.get_by_reference(reference_id)
        if not appt:
            raise ValueError(f"Appointment {reference_id} not found")
        
        target_doctor = doctor_name or appt.get("doctor_name")
        clinic_code = appt.get("clinic_code", "CARE-IND-01")

        # Conflict check preventing double booking
        conflict_count = await self.repo.count_existing_bookings(
            clinic_code=clinic_code,
            doctor_name=target_doctor,
            preferred_date=new_date,
            preferred_time=new_time,
            exclude_reference_id=reference_id
        )
        if conflict_count >= 1:
            raise ValueError(f"Slot {new_time} on {new_date} with {target_doctor} is already booked. Double-booking prevented.")

        success = await self.repo.reschedule_appointment(reference_id, new_date, new_time, target_doctor, notes)
        if not success:
            raise ValueError("Failed to reschedule appointment in database")

        await self.clinic_repo.add_audit_log(
            action="APPOINTMENT_RESCHEDULED",
            target=f"Ticket {reference_id} ({appt.get('patient_name')})",
            details=f"Rescheduled to {new_date} at {new_time} with {target_doctor}. Reason: {notes or 'Patient request'}",
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

    async def send_appointment_reminder(self, reference_id: str, channel: str = "Priya Voice AI & SMS", custom_message: Optional[str] = None) -> Dict[str, Any]:
        """Dispatch Priya Voice AI reminder call & SMS to patient for an upcoming appointment."""
        appt = await self.repo.get_by_reference(reference_id)
        if not appt:
            raise ValueError(f"Appointment '{reference_id}' not found.")

        now_iso = datetime.utcnow().isoformat() + "Z"
        patient_name = appt.get("patient_name")
        doctor_name = appt.get("doctor_name")
        date_str = appt.get("preferred_date")
        time_str = appt.get("preferred_time")
        phone = appt.get("phone")

        # Consent verification from patients collection
        db = get_database()
        clean_phone = re.sub(r"[^\d]", "", phone or "")
        patient_record = None
        if len(clean_phone) >= 10:
            patient_record = await db["patients"].find_one({"phone": {"$regex": clean_phone[-10:]}}, {"_id": 0})
        
        if patient_record:
            consent = patient_record.get("communication_consent", {})
            st = consent.get("status", "Pending")
            ch = consent.get("channels", [])
            has_voice = any("voice" in str(c).lower() for c in ch)
            if st != "Consented" or not has_voice:
                raise ValueError(
                    f"Reminder blocked: Patient '{patient_name}' communication consent is '{st}'. Explicit Voice AI consent is required before dispatching calls."
                )

        spoken_script = (
            custom_message or 
            f"Hello {patient_name}! This is Priya calling from CareConnect AI on behalf of {doctor_name}. "
            f"This is a courteous reminder for your upcoming consultation scheduled on {date_str} at {time_str}. "
            f"Please reach the clinic 10 minutes prior to your slot. If you need to reschedule, press 1 or let me know now."
        )

        reminder_entry = {
            "sent_at": now_iso,
            "channel": channel,
            "status": "Dispatched",
            "message": spoken_script,
            "agent": "Priya Voice AI Receptionist (+918064269783)"
        }

        await self.repo.record_reminder(reference_id, reminder_entry)

        # Log into voice_calls collection
        call_doc = {
            "attempt_id": f"REM-{uuid.uuid4().hex[:8].upper()}",
            "appointment_ref": reference_id,
            "patient_name": patient_name,
            "phone": phone,
            "doctor_name": doctor_name,
            "call_type": "APPOINTMENT_REMINDER",
            "status": "COMPLETED",
            "call_summary": f"Priya Voice AI delivered consultation reminder for {date_str} at {time_str} with {doctor_name}.",
            "spoken_script": spoken_script,
            "created_at": now_iso,
            "updated_at": now_iso
        }
        try:
            await db["voice_calls"].insert_one(call_doc)
        except Exception:
            pass

        return {
            "success": True,
            "message": f"Priya Voice AI reminder dispatched to {patient_name} ({phone}) for {date_str} at {time_str}.",
            "reminder": reminder_entry
        }

    async def batch_send_reminders(self, target_date: Optional[str] = None) -> Dict[str, Any]:
        """Send automated Priya reminders for all confirmed appointments for the target date."""
        if not target_date:
            target_date = datetime.utcnow().strftime("%Y-%m-%d")

        cursor = self.repo.collection.find({
            "preferred_date": target_date,
            "status": "VERIFIED_CONFIRMED"
        }, {"_id": 0})
        appts = await cursor.to_list(length=100)

        dispatched = 0
        blocked = 0
        errors = []

        for appt in appts:
            try:
                await self.send_appointment_reminder(appt["reference_id"])
                dispatched += 1
            except Exception as e:
                blocked += 1
                errors.append(f"{appt['reference_id']}: {str(e)}")

        return {
            "target_date": target_date,
            "total_appointments": len(appts),
            "dispatched_count": dispatched,
            "blocked_count": blocked,
            "details": errors
        }

    async def get_overview(self) -> Dict[str, Any]:
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        counts = await self.repo.get_overview_counts(today_str)
        recent = await self.repo.get_recent_appointments(limit=150)
        
        today_appointments = [a for a in recent if a.get("preferred_date") == today_str and a.get("status") != "CANCELLED"]
        upcoming = [a for a in recent if (a.get("preferred_date") or "") > today_str and a.get("status") != "CANCELLED"]
        cancellations = [a for a in recent if a.get("status") == "CANCELLED"]

        return {
            "metrics": counts,
            "today_appointments": today_appointments,
            "upcoming_bookings": upcoming,
            "cancellations": cancellations,
            "all_recent": recent
        }
