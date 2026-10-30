from fastapi import APIRouter, HTTPException, Body
from typing import List, Optional, Dict, Any
from app.modules.enquiries.models import CallbackRequest
from app.modules.enquiries.service import EnquiryService

router = APIRouter(prefix="/enquiries", tags=["Enquiries & Callbacks"])
service = EnquiryService()

@router.post("/callback", response_model=dict)
async def request_callback(req: CallbackRequest):
    """Register a patient callback request routed to clinic front desk."""
    try:
        saved = await service.register_callback(req)
        return {
            "success": True,
            "data": saved,
            "message": f"Callback queued. A clinic coordinator will call {req.phone} during {req.preferred_time}."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/callbacks", response_model=List[dict])
async def list_callbacks():
    """List recent callback requests in MongoDB."""
    return await service.get_all()

@router.patch("/callbacks/{callback_id}", response_model=Dict[str, Any])
async def update_callback_status_route(callback_id: str, payload: Dict[str, Any] = Body(...)):
    """Update status of a patient callback request (e.g. RESOLVED, IN_PROGRESS)."""
    status = payload.get("status", "RESOLVED")
    notes = payload.get("notes")
    success = await service.update_status(callback_id, status, notes)
    if not success:
        raise HTTPException(status_code=404, detail="Callback request not found")
    return {
        "success": True,
        "message": f"Callback {callback_id} updated to '{status}'."
    }
