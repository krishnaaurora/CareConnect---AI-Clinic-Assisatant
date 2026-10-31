from fastapi import APIRouter, HTTPException, Query, status
from typing import Dict, Any, Optional, List
from app.modules.sarvam.service import SarvamService
from app.modules.sarvam.models import ReportNotifyRequest, BrowserSessionRequest, BrowserSessionResponse
from app.core.config import settings

router = APIRouter(prefix="/sarvam", tags=["Sarvam Voice Agent (Priya)"])
service = SarvamService()

@router.post("/session", response_model=Dict[str, Any])
async def create_sarvam_browser_session(payload: Optional[BrowserSessionRequest] = None):
    """
    POST /api/v1/sarvam/session
    Creates a fresh real-time browser session with Priya using the deployed Sarvam Conversational Agent.
    - Reads SARVAM_API_KEY securely from environment variables.
    - Authenticates to Sarvam runtime with X-API-Key preserving full sk_samvaad_ prefix.
    - Requests a fresh signed WebSocket session URL from Sarvam.
    - Returns session information needed by the frontend without exposing API keys.
    - Never logs or persists signed session URLs.
    """
    user_name = payload.user_name if payload else "Website Visitor"
    language = payload.preferred_language if payload else "English"
    return await service.create_browser_voice_session(user_name=user_name, language=language)

@router.get("/proxy/orgs/{org_id}/workspaces/{workspace_id}/apps/{app_id}/url")
async def proxy_sarvam_runtime_url(
    org_id: str,
    workspace_id: str,
    app_id: str,
    interaction_type: str = Query("call"),
    version: Optional[str] = Query(None)
):
    """
    GET /api/v1/sarvam/proxy/orgs/{org_id}/workspaces/{workspace_id}/apps/{app_id}/url
    SDK-compatible proxy endpoint.
    Allows sarvam-conv-ai-sdk's internal getSignedUrl() to retrieve the signed URL through the backend proxy
    without ever requiring an API key in frontend client code.
    """
    if org_id != settings.SARVAM_ORG_ID or workspace_id != settings.SARVAM_WORKSPACE_ID or app_id != settings.SARVAM_AGENT_ID:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized agent, workspace, or organization scope."
        )
    target_version = int(version) if version and version.isdigit() else settings.SARVAM_AGENT_VERSION
    result = await service.caller.request_browser_session_url(
        interaction_type=interaction_type,
        version=target_version
    )
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=result.get("error", "Failed to retrieve signed WebSocket URL from Sarvam runtime.")
        )
    return {
        "url": result["signed_url"],
        "reference_id": result["reference_id"],
        "expires_at": result.get("expires_at")
    }

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

