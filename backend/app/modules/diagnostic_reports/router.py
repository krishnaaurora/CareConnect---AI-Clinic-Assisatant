import re
import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, Request, status
from typing import Optional, List, Dict, Any
from app.modules.diagnostic_reports.models import (
    DiagnosticReportCreateRequest,
    DiagnosticReportStatusUpdate
)
from app.modules.diagnostic_reports.service import DiagnosticReportService
from app.core.database import get_database

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/diagnostic-reports", tags=["Diagnostic Reports"])
service = DiagnosticReportService()

def normalize_dob(dob_str: Optional[str]) -> Optional[Dict[str, Any]]:
    """Parse and normalize date of birth in various formats."""
    if not dob_str:
        return None
    s = str(dob_str).strip()
    if not s or s.lower() in ["none", "null", "undefined", "string", ""]:
        return None

    # 4-digit year format: e.g. "1988"
    if re.fullmatch(r"^\d{4}$", s):
        y = int(s)
        if 1900 <= y <= 2026:
            return {"year": y, "month": None, "day": None, "raw": s}

    # YYYY-MM-DD or YYYY/MM/DD
    m1 = re.match(r"^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$", s)
    if m1:
        return {"year": int(m1.group(1)), "month": int(m1.group(2)), "day": int(m1.group(3)), "raw": s}

    # DD-MM-YYYY or DD/MM/YYYY
    m2 = re.match(r"^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$", s)
    if m2:
        return {"year": int(m2.group(3)), "month": int(m2.group(2)), "day": int(m2.group(1)), "raw": s}

    # Month DD, YYYY or DD Month YYYY (e.g. May 14, 1988 or 14 May 1988)
    months = {
        "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
        "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
        "january": 1, "february": 2, "march": 3, "april": 4, "june": 6,
        "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12
    }
    parts = re.findall(r"[A-Za-z]+|\d+", s)
    if len(parts) == 3:
        month_idx = None
        for i, p in enumerate(parts):
            if p.lower() in months:
                month_idx = i
                break
        if month_idx is not None:
            m_val = months[parts[month_idx].lower()]
            other_parts = [int(p) for i, p in enumerate(parts) if i != month_idx and p.isdigit()]
            if len(other_parts) == 2:
                y_val = max(other_parts)
                d_val = min(other_parts)
                if 1900 <= y_val <= 2026 and 1 <= d_val <= 31:
                    return {"year": y_val, "month": m_val, "day": d_val, "raw": s}

    # Fallback search for 4-digit year
    y_search = re.search(r"\b(19\d\d|20[0-2]\d)\b", s)
    if y_search:
        return {"year": int(y_search.group(1)), "month": None, "day": None, "raw": s}

    return None

def verify_dob_match(input_dob: Optional[Dict[str, Any]], patient: Optional[Dict[str, Any]]) -> bool:
    """Verify if caller DOB matches patient's recorded DOB or recorded age."""
    if not input_dob or not patient:
        return True

    recorded_dob_str = patient.get("dob") or patient.get("date_of_birth")
    if recorded_dob_str:
        rec_dob = normalize_dob(recorded_dob_str)
        if rec_dob:
            if input_dob.get("month") and rec_dob.get("month") and input_dob.get("day") and rec_dob.get("day"):
                return (
                    input_dob["year"] == rec_dob["year"] and
                    input_dob["month"] == rec_dob["month"] and
                    input_dob["day"] == rec_dob["day"]
                )
            return input_dob["year"] == rec_dob["year"]

    age = patient.get("age")
    if age and isinstance(age, (int, float)):
        expected_year = 2026 - int(age)
        return abs(input_dob["year"] - expected_year) <= 1

    return True

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

@router.api_route("/status", methods=["GET", "POST"], response_model=Dict[str, Any])
async def get_report_status_route(request: Request):
    """
    Check diagnostic report status by report ID or patient phone and DOB.
    Supports both GET and POST, query parameters and JSON body.
    Used by Sarvam Voice Agent 'get_report_status' tool.
    """
    payload = {}
    if request.method == "POST":
        try:
            body = await request.json()
            if isinstance(body, dict):
                payload = dict(body)
        except Exception:
            pass

    # Read query parameters
    query_params = dict(request.query_params)

    # Merge fields from JSON body and query parameters
    req_report_id = payload.get("report_id") or payload.get("id") or query_params.get("report_id") or query_params.get("id")
    req_phone = (
        payload.get("phone") or 
        payload.get("phone_number") or 
        payload.get("patient_phone") or 
        payload.get("caller_phone") or 
        query_params.get("phone") or 
        query_params.get("phone_number") or
        query_params.get("patient_phone")
    )
    req_dob = (
        payload.get("dob") or 
        payload.get("date_of_birth") or 
        payload.get("birth_date") or 
        payload.get("patient_dob") or 
        query_params.get("dob") or 
        query_params.get("date_of_birth") or
        query_params.get("birth_date")
    )
    req_name = payload.get("patient_name") or payload.get("name") or query_params.get("patient_name") or query_params.get("name")

    logger.info(f"Report status lookup ({request.method}): report_id={req_report_id}, phone={req_phone}, dob={req_dob}, name={req_name}")

    if not req_report_id and not req_phone and not req_name:
        return {
            "success": False,
            "status": "MISSING_IDENTIFIER",
            "report_status": "Missing Information",
            "ready_for_pickup": False,
            "patient_name": None,
            "report_id": None,
            "report_type": None,
            "message": "Please provide your registered phone number and date of birth to check your diagnostic report status.",
            "status_summary": "Missing required patient phone number or report ID.",
            "data": {
                "identity_verified": False,
                "error": "MISSING_REQUIRED_PARAMETERS"
            }
        }

    db = get_database()
    clean_digits = re.sub(r"\D", "", str(req_phone))[-10:] if req_phone else ""
    parsed_input_dob = normalize_dob(req_dob)

    # 1. Lookup patient from 'patients' collection for identity & DOB verification
    patient = None
    if clean_digits:
        patient = await db["patients"].find_one({
            "$or": [
                {"phone": {"$regex": clean_digits}},
                {"emergency_contact_phone": {"$regex": clean_digits}}
            ]
        }, {"_id": 0})
    if not patient and req_name:
        patient = await db["patients"].find_one({
            "name": {"$regex": str(req_name).strip(), "$options": "i"}
        }, {"_id": 0})

    # 2. Check patient identity & DOB matching if DOB was provided
    if req_dob and parsed_input_dob:
        if patient:
            is_dob_valid = verify_dob_match(parsed_input_dob, patient)
            if not is_dob_valid:
                logger.warning(
                    f"Report status DOB verification failed: input_dob='{req_dob}', "
                    f"patient='{patient.get('name')}', recorded_dob='{patient.get('dob')}', age={patient.get('age')}"
                )
                return {
                    "success": False,
                    "status": "IDENTITY_VERIFICATION_FAILED",
                    "report_status": "Verification Failed",
                    "ready_for_pickup": False,
                    "patient_name": patient.get("name"),
                    "report_id": req_report_id or patient.get("report_id"),
                    "report_type": patient.get("report_type"),
                    "message": "The date of birth provided does not match our clinic records. Please verify your details or request a callback.",
                    "status_summary": "Patient identity verification failed: date of birth does not match clinic records.",
                    "data": {
                        "identity_verified": False,
                        "error": "DOB_MISMATCH"
                    }
                }

    # 3. Lookup reports from diagnostic_reports and patient_reports
    report_doc = None

    # Lookup by explicit report_id first
    if req_report_id and str(req_report_id).strip() not in ["{report_id}", ":report_id", ""]:
        rid = str(req_report_id).strip()
        report_doc = await service.get_report(rid)
        if not report_doc:
            report_doc = await db["patient_reports"].find_one({"id": rid}, {"_id": 0})

    # Lookup by phone or patient identity
    if not report_doc:
        reports = []
        if clean_digits:
            reports = await service.list_reports(search=clean_digits, limit=5)
            if not reports:
                cursor = db["patient_reports"].find({
                    "$or": [
                        {"patient_phone": {"$regex": clean_digits}},
                        {"phone": {"$regex": clean_digits}}
                    ]
                }, {"_id": 0}).sort("created_at", -1).limit(5)
                reports = await cursor.to_list(5)
        
        if not reports and req_name:
            reports = await service.list_reports(search=str(req_name).strip(), limit=5)
            
        if reports:
            report_doc = reports[0]

    # 4. Fallback to patient's embedded report status if no standalone report doc exists
    if not report_doc and patient and patient.get("report_status"):
        report_doc = {
            "id": patient.get("report_id", "RPT-1001"),
            "patient_name": patient.get("name"),
            "patient_phone": patient.get("phone"),
            "report_type": patient.get("report_type", "Comprehensive Health Checkup"),
            "status": patient.get("report_status", "Ready"),
            "uploaded_date": patient.get("report_updated_at", "Oct 30"),
            "notes": patient.get("clinical_notes", "Diagnostic verification completed.")
        }

    if not report_doc:
        if patient:
            # Patient identity verified, but no diagnostic reports recorded yet
            pat_name = patient.get("name", "Valued Patient")
            logger.info(f"Patient {pat_name} verified but no diagnostic reports found on file.")
            msg = f"Hello {pat_name}, we verified your clinic profile but there are currently no diagnostic reports on file for your registered number."
            return {
                "success": False,
                "status": "NO_REPORTS_FOUND",
                "report_status": "No Reports Found",
                "ready_for_pickup": False,
                "patient_name": pat_name,
                "report_id": None,
                "report_type": None,
                "message": msg,
                "status_summary": f"Patient identity verified, but no diagnostic reports found on file for {pat_name}.",
                "data": {
                    "identity_verified": True,
                    "patient_name": pat_name,
                    "status": "NO_REPORTS_FOUND",
                    "report_status": "No Reports Found",
                    "reports_count": 0
                }
            }
        else:
            # Phone number not recognized in clinic records
            logger.info(f"Phone number {req_phone} not found in clinic database.")
            msg = f"No clinic record or diagnostic report found for phone number {req_phone}. Please verify your registered number or request a callback with our front desk."
            return {
                "success": False,
                "status": "PATIENT_NOT_FOUND",
                "report_status": "Not Registered",
                "ready_for_pickup": False,
                "patient_name": None,
                "report_id": None,
                "report_type": None,
                "message": msg,
                "status_summary": f"Phone number {req_phone} is not registered in clinic records.",
                "data": {
                    "identity_verified": False,
                    "error": "PHONE_NOT_REGISTERED"
                }
            }

    # 5. Build rich, voice-optimized response
    raw_status = report_doc.get("status") or report_doc.get("verification_status") or "Processing"
    is_ready = raw_status.strip().title() in ["Ready", "Verified", "Completed"]
    normalized_status = "Ready" if is_ready else "Processing"
    
    rep_type = report_doc.get("report_type") or report_doc.get("title") or "Diagnostic"
    pat_name = report_doc.get("patient_name") or (patient.get("name") if patient else "Valued Patient")
    rep_id = report_doc.get("id") or report_doc.get("report_id") or "RPT-2001"
    uploaded_date = report_doc.get("uploaded_date") or "Today"

    if is_ready:
        status_summary = (
            f"Your {rep_type} report for {pat_name} is Ready for pickup at Apollo Clinic Indiranagar. "
            f"The clinical laboratory has verified and approved the results."
        )
        msg = f"Your {rep_type} report is Ready for collection at the clinic."
    else:
        status_summary = (
            f"Your {rep_type} report for {pat_name} is currently Processing and undergoing review by the clinical laboratory."
        )
        msg = f"Your {rep_type} report is currently Processing. You will receive an automated alert once ready."

    response_payload = {
        "success": True,
        "status": normalized_status,
        "report_status": normalized_status,
        "report_type": rep_type,
        "patient_name": pat_name,
        "report_id": rep_id,
        "uploaded_date": uploaded_date,
        "ready_for_pickup": is_ready,
        "status_summary": status_summary,
        "message": msg,
        "data": {
            "report_id": rep_id,
            "patient_name": pat_name,
            "report_type": rep_type,
            "status": normalized_status,
            "report_status": normalized_status,
            "uploaded_date": uploaded_date,
            "ready_for_pickup": is_ready,
            "status_summary": status_summary,
            "message": msg,
            "latest_report": report_doc
        }
    }
    logger.info(f"Report status lookup successful: patient={pat_name}, report_id={rep_id}, status={normalized_status}")
    return response_payload

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


