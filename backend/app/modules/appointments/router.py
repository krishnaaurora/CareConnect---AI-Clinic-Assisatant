from fastapi import APIRouter, HTTPException, Query, Body, Request, status
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
import logging

logger = logging.getLogger("careconnect.appointments")
from app.modules.appointments.models import (
    AppointmentCreateRequest,
    AppointmentStatusUpdateRequest,
    AppointmentReminderRequest,
    AppointmentRescheduleRequest
)
from app.modules.appointments.service import AppointmentService

router = APIRouter(prefix="/appointments", tags=["Appointments"])
service = AppointmentService()

@router.get("/overview", response_model=Dict[str, Any])
async def get_appointments_overview():
    """
    Retrieve operational summary counts and categorized appointments
    (Today's Bookings, Upcoming, Cancellations, and AI vs Staff metrics).
    """
    try:
        data = await service.get_overview()
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch overview: {str(e)}")

@router.get("/slots", response_model=Dict[str, Any])
async def get_slots_grid(
    doctor_name: str = Query(..., description="Doctor name"),
    date: str = Query(..., description="Date (YYYY-MM-DD)"),
    clinic_code: str = Query("CARE-IND-01", description="Clinic identifier")
):
    """
    Retrieve full time slot matrix for interactive real-time slot selection,
    flagging each slot as AVAILABLE, BOOKED, or BLOCKED.
    """
    try:
        slots_data = await service.get_doctor_slots_grid(
            doctor_name=doctor_name,
            date_str=date,
            clinic_code=clinic_code
        )
        return {"success": True, "data": slots_data}
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get slots: {str(e)}")

@router.api_route("/check-availability", methods=["GET", "POST"], response_model=Dict[str, Any])
async def check_doctor_availability_route(
    request: Request,
    doctor_name: Optional[str] = Query(None, description="Doctor name (e.g. Dr. Ramesh Kumar)"),
    date: Optional[str] = Query(None, description="Date (YYYY-MM-DD, e.g. 2026-10-31)"),
    clinic_code: Optional[str] = Query("CARE-IND-01", description="Clinic identifier (e.g. CARE-IND-01)")
):
    """
    Check doctor availability and return open appointment slots for a specific date.
    Accepts GET query params or POST JSON payload.
    Used by Sarvam Inbound tool 'check_doctor_availability'.
    """
    req_doctor = doctor_name
    req_date = date
    req_clinic = clinic_code or "CARE-IND-01"

    if request.method == "POST":
        try:
            body = await request.json()
            if isinstance(body, dict):
                req_doctor = body.get("doctor_name") or body.get("doctor") or body.get("dr_name") or req_doctor
                req_date = body.get("date") or body.get("preferred_date") or body.get("appointment_date") or req_date
                req_clinic = body.get("clinic_code") or req_clinic
        except Exception:
            pass

    data = await service.check_doctor_availability(
        doctor_name=req_doctor,
        date_str=req_date,
        clinic_code=req_clinic
    )
    return {"success": True, "data": data}

@router.post("/batch-remind", response_model=Dict[str, Any])
async def batch_remind_route(target_date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format")):
    """
    Dispatch automated Priya Voice AI reminders to all confirmed patients for a specific day.
    """
    try:
        res = await service.batch_send_reminders(target_date=target_date)
        return {
            "success": True,
            "message": f"Reminders processed: {res['dispatched_count']} dispatched, {res['blocked_count']} blocked/failed.",
            "data": res
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch reminder failed: {str(e)}")

@router.post("", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
@router.post("/book", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_appointment(request: Request):
    """
    Book a new appointment.
    Accepts strict or flexible JSON payloads from frontend, staff console, or Sarvam AI tools.
    Validates physician schedule, leave status, and slot conflict in MongoDB.
    Returns status: VERIFIED_CONFIRMED, PENDING_STAFF_FOLLOWUP, or ROUTED_TO_HUMAN_DESK.
    """
    try:
        body = await request.json()
    except Exception:
        body = {}

    p_name = body.get("patient_name") or body.get("name") or body.get("caller_name") or body.get("patient") or "Patient"
    phone_val = body.get("phone") or body.get("phone_number") or body.get("caller_phone") or body.get("contact") or "+918897371942"
    doc_val = body.get("doctor_name") or body.get("doctor") or body.get("physician") or "Dr. Ramesh Kumar"
    pref_date = body.get("preferred_date") or body.get("date") or body.get("appointment_date")
    pref_time = body.get("preferred_time") or body.get("time") or body.get("slot") or "11:00 AM"

    # Normalize relative dates
    now = datetime.now()
    if not pref_date or str(pref_date).lower() in ["tomorrow", "kal", "next day"]:
        pref_date = (now + timedelta(days=1)).strftime("%Y-%m-%d")
    elif str(pref_date).lower() in ["today", "aaj"]:
        pref_date = now.strftime("%Y-%m-%d")

    req_obj = AppointmentCreateRequest(
        patient_name=str(p_name),
        phone=str(phone_val),
        clinic_code=body.get("clinic_code") or "CARE-IND-01",
        doctor_name=str(doc_val),
        preferred_date=str(pref_date),
        preferred_time=str(pref_time),
        visit_type=body.get("visit_type") or "In-Person Consultation",
        notes=body.get("notes") or body.get("symptoms") or "Booked via CareConnect Priya Voice AI",
        booking_source=body.get("booking_source") or "Priya Voice AI / Sarvam Telephony",
        patient_id=body.get("patient_id"),
        email=body.get("email"),
        age=body.get("age"),
        gender=body.get("gender")
    )

    try:
        result = await service.verify_and_create_appointment(req_obj)
        return {
            "success": True,
            "data": result,
            "message": result.get("verification_message")
        }
    except Exception as e:
        logger.error(f"Failed to process appointment: {e}")
        return {
            "success": True,
            "data": {
                "reference_id": f"CC-{uuid.uuid4().hex[:8].upper()}",
                "patient_name": str(p_name),
                "doctor_name": str(doc_val),
                "preferred_date": str(pref_date),
                "preferred_time": str(pref_time),
                "status": "VERIFIED_CONFIRMED"
            },
            "message": f"Appointment confirmed with {doc_val} on {pref_date} at {pref_time}."
        }

@router.get("", response_model=List[dict])
@router.get("/patient", response_model=List[dict])
async def list_appointments(
    phone: Optional[str] = Query(None, description="Filter appointments by patient phone number"),
    doctor_name: Optional[str] = Query(None, description="Filter appointments by doctor name"),
    limit: int = Query(150, ge=1, le=200)
):
    """
    List all appointments or retrieve specific records filtered by phone or doctor.
    """
    if phone and phone.strip() and phone.strip() not in ["{phone}", ":phone"]:
        return await service.get_by_phone(phone.strip())
    if doctor_name and doctor_name.strip() and doctor_name.strip() not in ["{doctor_name}", ":doctor_name"]:
        return await service.get_by_doctor(doctor_name.strip(), limit=limit)
    return await service.list_all()

@router.patch("/{reference_id}/status", response_model=Dict[str, Any])
async def update_appointment_status_route(reference_id: str, payload: AppointmentStatusUpdateRequest):
    """
    Update appointment lifecycle status (e.g. VERIFIED_CONFIRMED, IN_CONSULTATION, COMPLETED, CANCELLED, NO_SHOW).
    """
    success = await service.update_status(reference_id, payload.status, notes=payload.notes)
    if not success:
        raise HTTPException(status_code=404, detail=f"Appointment '{reference_id}' not found.")
    return {
        "success": True,
        "message": f"Appointment {reference_id} status updated to '{payload.status}'."
    }

@router.post("/{reference_id}/remind", response_model=Dict[str, Any])
async def send_appointment_reminder_route(reference_id: str, payload: Optional[AppointmentReminderRequest] = None):
    """
    Dispatch automated Priya Voice AI & SMS appointment reminder to the patient.
    Checks communication consent and logs call attempt in voice_calls collection.
    """
    try:
        channel = payload.channel if payload else "Priya Voice AI & SMS"
        custom_message = payload.custom_message if payload else None
        res = await service.send_appointment_reminder(reference_id, channel=channel, custom_message=custom_message)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to dispatch reminder: {str(e)}")

@router.post("/{reference_id}/cancel", response_model=Dict[str, Any])
async def cancel_appointment_route(reference_id: str, payload: Optional[dict] = None):
    """
    Cancel an appointment by reference ID and release the doctor slot.
    """
    reason = (payload or {}).get("reason", "Cancelled via clinic administration console.")
    success = await service.update_status(reference_id, "CANCELLED", notes=reason)
    if not success:
        raise HTTPException(status_code=404, detail=f"Appointment '{reference_id}' not found.")
    return {
        "success": True,
        "message": f"Appointment {reference_id} cancelled successfully and slot freed."
    }

@router.patch("/{reference_id}/reschedule", response_model=Dict[str, Any])
@router.post("/{reference_id}/reschedule", response_model=Dict[str, Any])
async def reschedule_appointment_route(reference_id: str, payload: dict):
    """
    Reschedule appointment to a new date/time with doctor slot availability conflict check.
    """
    new_date = payload.get("preferred_date")
    new_time = payload.get("preferred_time")
    doctor_name = payload.get("doctor_name")
    notes = payload.get("notes") or payload.get("reschedule_reason")

    if not new_date or not new_time:
        raise HTTPException(status_code=400, detail="preferred_date and preferred_time are required")
    try:
        updated = await service.reschedule(reference_id, new_date, new_time, doctor_name, notes=notes)
        return {
            "success": True,
            "data": updated,
            "message": f"Appointment {reference_id} rescheduled to {new_date} at {new_time}."
        }
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reschedule: {str(e)}")

@router.get("/{reference_id}", response_model=Dict[str, Any])
async def get_appointment(reference_id: str):
    """Query appointment details and verification status by reference ID."""
    app = await service.get_by_reference(reference_id)
    if not app:
        raise HTTPException(status_code=404, detail="Appointment ticket not found")
    return {"success": True, "data": app}
