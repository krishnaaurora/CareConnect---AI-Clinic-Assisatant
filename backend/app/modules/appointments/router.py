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
@router.get("/patient", response_model=List[dict])
async def list_appointments(
    phone: Optional[str] = Query(None, description="Filter appointments by patient phone number"),
    limit: int = Query(25, ge=1, le=100)
):
    """
    List recent appointments or retrieve a specific patient's appointments by phone.
    Used by Sarvam Inbound tool 'get_patient_appointments'.
    """
    if phone and phone.strip() and phone.strip() not in ["{phone}", ":phone"]:
        return await service.get_by_phone(phone.strip())
    return await service.list_all()

@router.get("/check-availability", response_model=dict)
@router.post("/check-availability", response_model=dict)
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

@router.post("/{reference_id}/cancel", response_model=dict)
async def cancel_appointment_route(reference_id: str, payload: Optional[dict] = None):
    """
    Cancel an appointment by reference ID.
    Used by Sarvam Inbound tool 'cancel_appointment'.
    """
    reason = (payload or {}).get("reason", "Patient requested cancellation via Voice AI")
    success = await service.update_status(reference_id, "CANCELLED", notes=reason)
    if not success:
        raise HTTPException(status_code=404, detail=f"Appointment '{reference_id}' not found.")
    return {"success": True, "message": f"Appointment {reference_id} cancelled successfully."}

@router.patch("/{reference_id}/reschedule", response_model=dict)
@router.post("/{reference_id}/reschedule", response_model=dict)
async def reschedule_appointment_route(reference_id: str, payload: dict):
    """
    Reschedule appointment to a new date/time with conflict check.
    Supports both PATCH and POST for Sarvam tool calling compatibility.
    """
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
