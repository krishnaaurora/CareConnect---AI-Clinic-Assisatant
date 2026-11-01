from fastapi import APIRouter, HTTPException, Request, Body, Query
from typing import List, Optional, Dict, Any
import logging
from app.modules.enquiries.models import CallbackRequest
from app.modules.enquiries.service import EnquiryService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/enquiries", tags=["Enquiries & Callbacks"])
service = EnquiryService()

@router.api_route("", methods=["POST", "GET"], response_model=Dict[str, Any])
@router.api_route("/callback", methods=["POST", "GET"], response_model=Dict[str, Any])
async def request_callback(request: Request):
    """
    Register a patient callback request routed to clinic front desk.
    Supports both POST (JSON body) and GET (query params) for Sarvam Voice Agent tools.
    """
    try:
        payload = {}
        if request.method == "POST":
            try:
                body_data = await request.json()
                if isinstance(body_data, dict):
                    payload = dict(body_data)
            except Exception:
                pass
        
        # Merge query parameters from request
        query_params = dict(request.query_params)
        for k, v in query_params.items():
            if k not in payload or not payload[k]:
                payload[k] = v

        logger.info(f"Callback request received ({request.method}): {payload}")
        req_obj = CallbackRequest(**payload)
        saved = await service.register_callback(req_obj)
        
        pref_time = saved.get('preferred_time', 'Earliest Available')
        pat_name = saved.get('patient_name') or saved.get('name') or "Valued Patient"
        pat_phone = saved.get('phone') or saved.get('phone_number')
        reason_val = saved.get('callback_reason') or saved.get('enquiry_topic')
        cb_id = saved.get('callback_id')

        msg = f"Callback request registered for {pat_name} ({pat_phone}). Front desk staff will follow up {pref_time} regarding: {reason_val}."
        return {
            "success": True,
            "status": "QUEUED_FOR_CLINIC_STAFF",
            "callback_id": cb_id,
            "id": cb_id,
            "patient_name": pat_name,
            "caller_name": pat_name,
            "name": pat_name,
            "phone": pat_phone,
            "caller_phone": pat_phone,
            "phone_number": pat_phone,
            "callback_reason": reason_val,
            "reason": reason_val,
            "enquiry_topic": reason_val,
            "preferred_time": pref_time,
            "message": msg,
            "data": saved
        }
    except Exception as e:
        logger.error(f"Error handling callback request: {e}", exc_info=True)
        return {
            "success": False,
            "status": "CALLBACK_REGISTRATION_FAILED",
            "error": str(e),
            "message": f"Unable to register callback: {str(e)}"
        }

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

