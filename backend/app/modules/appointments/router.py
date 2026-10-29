from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.modules.appointments.models import AppointmentCreateRequest, AppointmentRecord
from app.modules.appointments.service import AppointmentService

router = APIRouter(prefix="/appointments", tags=["Appointments"])
service = AppointmentService()

@router.post("", response_model=dict)
async def create_appointment(request: AppointmentCreateRequest):
    """
    Submits an appointment request.
    Executes backend verification against MongoDB doctor availability.
    Returns status: VERIFIED_CONFIRMED, PENDING_STAFF_FOLLOWUP, or ROUTED_TO_HUMAN_DESK.
    """
    try:
        result = await service.verify_and_create_appointment(request)
        return {
            "success": True,
            "data": result,
            "message": result.get("verification_message")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process appointment: {str(e)}")

@router.get("", response_model=List[dict])
async def list_appointments(limit: int = Query(25, ge=1, le=100)):
    """List recent appointments stored in MongoDB."""
    return await service.list_all()

@router.get("/overview", response_model=dict)
async def get_appointments_overview():
    """Retrieve summarized metrics and categorized bookings for clinic overview."""
    overview = await service.get_overview()
    return {"success": True, "data": overview}

@router.patch("/{reference_id}/status", response_model=dict)
async def update_appointment_status(reference_id: str, payload: dict):
    """Update appointment status (e.g. CANCELLED, VERIFIED_CONFIRMED, COMPLETED)."""
    status = payload.get("status")
    notes = payload.get("notes")
    if not status:
        raise HTTPException(status_code=400, detail="Status is required")
    success = await service.update_status(reference_id, status, notes)
    if not success:
        raise HTTPException(status_code=404, detail="Appointment not found or not updated")
    status_str = "updated"
    return {"success": True, "message": f"Appointment {reference_id} marked as {status}"}

@router.patch("/{reference_id}/reschedule", response_model=dict)
async def reschedule_appointment_route(reference_id: str, payload: dict):
    """Reschedule appointment to a new date/time with conflict check."""
    new_date = payload.get("preferred_date")
    new_time = payload.get("preferred_time")
    doctor_name = payload.get("doctor_name")
    if not new_date or not new_time:
        raise HTTPException(status_code=400, detail="New preferred_date and preferred_time are required")
    try:
        updated = await service.reschedule(reference_id, new_date, new_time, doctor_name)
        return {"success": True, "data": updated, "message": f"Appointment {reference_id} rescheduled to {new_date} at {new_time}."}
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reschedule: {str(e)}")

@router.get("/{reference_id}", response_model=dict)
async def get_appointment(reference_id: str):
    """Query appointment verification status by reference ID."""
    app = await service.get_by_reference(reference_id)
    if not app:
        raise HTTPException(status_code=404, detail="Appointment ticket not found")
    return {"success": True, "data": app}
