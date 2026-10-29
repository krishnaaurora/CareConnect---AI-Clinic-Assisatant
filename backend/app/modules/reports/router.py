from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.modules.reports.service import ReportService
from app.modules.reports.models import (
    ReportUploadRequest, 
    ReportStatusUpdateRequest,
    FollowupResolveRequest
)

router = APIRouter(prefix="/reports", tags=["Reports & Follow-ups"])
service = ReportService()

@router.get("", response_model=List[dict])
async def get_all_reports():
    """Retrieve all patient medical reports and verification statuses."""
    return await service.list_reports()

@router.get("/summary", response_model=dict)
async def get_reports_summary():
    """Retrieve 4 key summary metrics for Reports & Follow-ups."""
    summary = await service.get_summary()
    return {"success": True, "data": summary}

@router.post("/upload", response_model=dict)
async def upload_report_route(request: ReportUploadRequest):
    """Simulate and register an uploaded patient diagnostic report."""
    try:
        report = await service.upload_report(request)
        return {
            "success": True, 
            "data": report, 
            "message": f"Report {report['id']} for {report['patient_name']} uploaded successfully."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload report: {str(e)}")

@router.patch("/{report_id}/status", response_model=dict)
async def update_report_status_route(report_id: str, request: ReportStatusUpdateRequest):
    """Update report verification status (Verified, Rejected, Ready to Notify)."""
    try:
        updated = await service.update_status(report_id, request)
        return {
            "success": True, 
            "data": updated, 
            "message": f"Report {report_id} status updated successfully."
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update report status: {str(e)}")

@router.get("/followups", response_model=List[dict])
async def get_all_followups():
    """Retrieve list of outstanding follow-up tasks."""
    return await service.list_followups()

@router.patch("/followups/{followup_id}/resolve", response_model=dict)
async def resolve_followup_route(followup_id: str, payload: FollowupResolveRequest):
    """Mark a patient report follow-up task as resolved."""
    success = await service.resolve_followup(followup_id, payload.notes)
    if not success:
        raise HTTPException(status_code=404, detail="Follow-up task not found")
    return {"success": True, "message": f"Follow-up {followup_id} marked as resolved."}
