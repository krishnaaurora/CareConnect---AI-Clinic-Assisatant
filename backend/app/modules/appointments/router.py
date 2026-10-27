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

@router.get("/{reference_id}", response_model=dict)
async def get_appointment(reference_id: str):
    """Query appointment verification status by reference ID."""
    app = await service.get_by_reference(reference_id)
    if not app:
        raise HTTPException(status_code=404, detail="Appointment ticket not found")
    return {"success": True, "data": app}
