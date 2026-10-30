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

@router.get("/status", response_model=Dict[str, Any])
async def get_report_status_route(
    report_id: Optional[str] = Query(None, description="Diagnostic report ID (e.g. RPT-2001)"),
    phone: Optional[str] = Query(None, description="Patient registered phone number")
):
    """
    Check diagnostic report status by report ID or patient phone.
    Used by Sarvam Inbound tool 'get_report_status'.
    """
    if not report_id and not phone:
        raise HTTPException(
            status_code=400,
            detail="Either report_id or phone query parameter is required to check report status."
        )

    # 1. Lookup by report_id
    if report_id and report_id.strip() and report_id.strip() not in ["{report_id}", ":report_id"]:
        report = await service.get_report(report_id.strip())
        if not report:
            raise HTTPException(
                status_code=404,
                detail=f"Diagnostic report '{report_id}' not found."
            )
        status_val = report.get("status", "Processing")
        summary = (
            f"Your {report.get('report_type')} report is Ready for collection at the clinic."
            if status_val == "Ready" else
            f"Your {report.get('report_type')} report is currently Processing and undergoing clinical verification."
        )
        return {
            "success": True,
            "data": {
                "report_id": report.get("id"),
                "patient_name": report.get("patient_name"),
                "report_type": report.get("report_type"),
                "status": status_val,
                "uploaded_date": report.get("uploaded_date"),
                "status_summary": summary
            }
        }

    # 2. Lookup by phone
    clean_phone = phone.strip() if phone else ""
    reports = await service.list_reports(search=clean_phone, limit=5)
    if not reports:
        raise HTTPException(
            status_code=404,
            detail=f"No diagnostic reports found for phone number {clean_phone}."
        )

    latest = reports[0]
    status_val = latest.get("status", "Processing")
    summary = (
        f"Your {latest.get('report_type')} report is Ready for collection."
        if status_val == "Ready" else
        f"Your {latest.get('report_type')} report is currently Processing."
    )
    return {
        "success": True,
        "count": len(reports),
        "data": {
            "latest_report": latest,
            "status": status_val,
            "status_summary": summary
        }
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


