from fastapi import APIRouter, HTTPException
from typing import List
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
