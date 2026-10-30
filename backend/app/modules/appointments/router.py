from fastapi import APIRouter, HTTPException, Query, Body, status
from typing import List, Optional, Dict, Any
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

@router.get("/check-availability", response_model=Dict[str, Any])
@router.post("/check-availability", response_model=Dict[str, Any])
async def check_doctor_availability_route(
    doctor_name: str = Query(..., description="Doctor name (e.g. Dr. Rajesh Sharma)"),
    date: str = Query(..., description="Date (YYYY-MM-DD, e.g. 2026-10-31)"),
    clinic_code: str = Query("CARE-IND-01", description="Clinic identifier (e.g. CARE-IND-01)")
):
    """
    Check doctor availability and return open appointment slots for a specific date.
    Used by Sarvam Inbound tool 'check_doctor_availability'.
    """
    try:
        data = await service.check_doctor_availability(
            doctor_name=doctor_name,
            date_str=date,
            clinic_code=clinic_code
        )
        return {"success": True, "data": data}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

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
async def create_appointment(request: AppointmentCreateRequest):
    """
    Book a new appointment.
    Validates physician schedule, leave status, and slot conflict in MongoDB.
    Returns status: VERIFIED_CONFIRMED, PENDING_STAFF_FOLLOWUP, or ROUTED_TO_HUMAN_DESK.
    """
    try:
        result = await service.verify_and_create_appointment(request)
        return {
            "success": True,
            "data": result,
            "message": result.get("verification_message")
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process appointment: {str(e)}")

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
