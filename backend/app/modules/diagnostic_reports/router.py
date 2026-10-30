from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List, Dict, Any
from app.modules.diagnostic_reports.models import (
    DiagnosticReportCreateRequest,
    DiagnosticReportStatusUpdate
)
from app.modules.diagnostic_reports.service import DiagnosticReportService

router = APIRouter(prefix="/diagnostic-reports", tags=["Diagnostic Reports"])
service = DiagnosticReportService()

@router.get("", response_model=Dict[str, Any])
async def list_diagnostic_reports(
    search: Optional[str] = Query(None, description="Search by patient name, report type, or ID"),
    status: Optional[str] = Query(None, description="Filter by status: Ready, Processing, All"),
    report_type: Optional[str] = Query(None, description="Filter by report category"),
    limit: int = Query(100, ge=1, le=200)
):
    """Retrieve list of diagnostic reports."""
    reports = await service.list_reports(search=search, status=status, report_type=report_type, limit=limit)
    return {
        "success": True,
        "count": len(reports),
        "data": reports
    }

@router.get("/metrics", response_model=Dict[str, Any])
async def get_metrics():
    """Retrieve summary metrics for diagnostic reports."""
    metrics = await service.get_metrics()
    return {
        "success": True,
        "data": metrics
    }

@router.get("/{report_id}", response_model=Dict[str, Any])
async def get_diagnostic_report_by_id(report_id: str):
    """Get single diagnostic report details."""
    report = await service.get_report(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Diagnostic report {report_id} not found"
        )
    return {
        "success": True,
        "data": report
    }

@router.post("", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def upload_diagnostic_report(payload: DiagnosticReportCreateRequest):
    """
    Upload a diagnostic report:
    - Validates patient exists
    - Saves report to MongoDB with status (Ready or Processing)
    """
    created = await service.upload_report(payload)
    msg = f"Diagnostic report {created['id']} saved successfully for {created['patient_name']}."
    return {
        "success": True,
        "message": msg,
        "data": created
    }

@router.patch("/{report_id}/status", response_model=Dict[str, Any])
async def update_report_status(report_id: str, payload: DiagnosticReportStatusUpdate):
    """
    Update status of a diagnostic report (e.g. from Processing to Ready).
    """
    updated = await service.update_status(report_id, payload)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Diagnostic report {report_id} not found"
        )
    return {
        "success": True,
        "message": f"Report {report_id} updated to {payload.status}.",
        "data": updated
    }

@router.post("/{report_id}/notify", response_model=Dict[str, Any])
async def notify_diagnostic_report(report_id: str):
    """
    Triggers automated Priya voice call via Sarvam Instant Outbound API
    for a verified ready diagnostic report.
    """
    from app.modules.sarvam.service import SarvamService
    sarvam_svc = SarvamService()
    return await sarvam_svc.trigger_report_ready_call(report_id)


