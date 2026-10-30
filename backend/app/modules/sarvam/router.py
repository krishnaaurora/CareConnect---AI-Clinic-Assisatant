from fastapi import APIRouter, HTTPException, Query, status
from typing import Dict, Any, Optional, List
from app.modules.sarvam.service import SarvamService
from app.modules.sarvam.models import ReportNotifyRequest

router = APIRouter(prefix="/sarvam", tags=["Sarvam Voice Agent (Priya)"])
service = SarvamService()

@router.post("/outbound/report-ready/{report_id}", response_model=Dict[str, Any])
async def trigger_report_ready_outbound_call(
    report_id: str,
    payload: Optional[ReportNotifyRequest] = None
):
    """
    Triggers a Sarvam Instant Outbound call for a ready diagnostic report.
    - Validates report status is READY
    - Verifies patient communication consent and phone number
    - Enforces calling hours and duplicate-call prevention
    - Dispatches Priya AI call via Sarvam Instant Outbound API
    - Records initial call attempt in MongoDB
    """
    return await service.trigger_report_ready_call(report_id, payload)

@router.post("/webhook", response_model=Dict[str, Any])
async def sarvam_call_webhook(payload: Dict[str, Any]):
    """
    Webhook receiver for Sarvam Instant Outbound call-completion events.
    Persists call outcome, duration, transcripts, and extracted variables (collection date, callback request) into MongoDB.
    Idempotent processing based on attempt_id.
    """
    return await service.process_webhook(payload)

@router.get("/calls", response_model=Dict[str, Any])
async def list_sarvam_calls(limit: int = Query(50, ge=1, le=100)):
    """Retrieve call logs and outcomes from the voice_calls collection."""
    calls = await service.list_recent_calls(limit)
    return {
        "success": True,
        "count": len(calls),
        "data": calls
    }

@router.get("/calls/{attempt_id}", response_model=Dict[str, Any])
async def get_sarvam_call_detail(attempt_id: str):
    """Retrieve full details, transcript, and extracted variables for a specific call attempt."""
    call = await service.get_call_details(attempt_id)
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Call record with attempt_id '{attempt_id}' not found."
        )
    return {
        "success": True,
        "data": call
    }

@router.get("/health", response_model=Dict[str, Any])
async def sarvam_health_check():
    """Verify Sarvam configuration, workspace ID, agent ID and connection settings without making calls."""
    return service.check_health()

