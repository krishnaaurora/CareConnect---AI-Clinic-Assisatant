from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List, Dict, Any
from app.modules.patients.models import (
    PatientCreateRequest,
    PatientUpdateRequest,
    ConsentRecordRequest,
    PatientNotifyRequest
)
from app.modules.patients.service import PatientService

router = APIRouter(prefix="/patients", tags=["Patient Registry"])
patient_service = PatientService()

@router.get("", response_model=Dict[str, Any])
async def list_patients(
    search: Optional[str] = Query(None, description="Search by name, phone, or ID"),
    report_status: Optional[str] = Query(None, description="Filter by report status: Ready, Processing, All"),
    consent_status: Optional[str] = Query(None, description="Filter by consent status: Consented, Pending, Revoked"),
    gender: Optional[str] = Query(None, description="Filter by gender: Male, Female, Other, All"),
    blood_group: Optional[str] = Query(None, description="Filter by blood group: O+, A+, B+, etc."),
    limit: int = Query(150, ge=1, le=300)
):
    """Retrieve filtered list of registered patients."""
    patients = await patient_service.list_patients(
        search=search,
        report_status=report_status,
        consent_status=consent_status,
        gender=gender,
        blood_group=blood_group,
        limit=limit
    )
    return {
        "success": True,
        "count": len(patients),
        "data": patients
    }

@router.get("/metrics", response_model=Dict[str, Any])
async def get_patient_metrics():
    """Retrieve operational metrics for patient registry."""
    metrics = await patient_service.get_metrics()
    return {
        "success": True,
        "data": metrics
    }

@router.get("/check-phone/{phone}", response_model=Dict[str, Any])
async def check_phone_registered(phone: str):
    """Check if a phone number is already registered in the clinic patient directory."""
    existing = await patient_service.check_phone_exists(phone)
    return {
        "registered": existing is not None,
        "patient": {
            "id": existing["id"],
            "name": existing["name"],
            "masked_phone": existing.get("masked_phone", phone)
        } if existing else None
    }

@router.get("/{patient_id}", response_model=Dict[str, Any])
async def get_patient_by_id(patient_id: str):
    """Get single patient details by patient ID."""
    patient = await patient_service.get_patient(patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    return {
        "success": True,
        "data": patient
    }

@router.get("/{patient_id}/appointments", response_model=Dict[str, Any])
async def get_patient_appointments(patient_id: str):
    """Retrieve all historical and upcoming appointments for a patient from appointments collection."""
    patient = await patient_service.get_patient(patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    appointments = await patient_service.get_patient_appointments(patient_id)
    return {
        "success": True,
        "count": len(appointments),
        "data": appointments
    }

@router.get("/{patient_id}/reports", response_model=Dict[str, Any])
async def get_patient_diagnostic_reports(patient_id: str):
    """Retrieve all diagnostic laboratory and imaging reports for a patient from diagnostic_reports collection."""
    patient = await patient_service.get_patient(patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    reports = await patient_service.get_patient_reports(patient_id)
    return {
        "success": True,
        "count": len(reports),
        "data": reports
    }

@router.post("", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_patient(payload: PatientCreateRequest):
    """Register a new patient into the registry."""
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="Patient name is required")
    if not payload.phone.strip():
        raise HTTPException(status_code=400, detail="Patient phone number is required")

    try:
        created = await patient_service.create_patient(payload)
        return {
            "success": True,
            "message": f"Patient {created['name']} registered successfully with ID {created['id']}",
            "data": created
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.put("/{patient_id}", response_model=Dict[str, Any])
async def update_patient(patient_id: str, payload: PatientUpdateRequest):
    """Update patient demographic and report information."""
    updated = await patient_service.update_patient(patient_id, payload)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    return {
        "success": True,
        "message": f"Patient {patient_id} updated successfully",
        "data": updated
    }

@router.post("/{patient_id}/consent", response_model=Dict[str, Any])
async def record_consent(patient_id: str, payload: ConsentRecordRequest):
    """Record or update formal communication consent for a patient."""
    updated = await patient_service.record_consent(patient_id, payload)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    return {
        "success": True,
        "message": f"Communication consent recorded as '{payload.status}' for patient {patient_id}",
        "data": updated
    }

@router.post("/{patient_id}/notify", response_model=Dict[str, Any])
async def notify_patient(patient_id: str, payload: PatientNotifyRequest):
    """Trigger simulated or live notification for a patient with ready reports."""
    patient = await patient_service.get_patient(patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found"
        )
    if patient.get("report_status") != "Ready":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot notify patient: Diagnostic report is still Processing"
        )

    consent = patient.get("communication_consent", {})
    consent_status = consent.get("status", "Pending")
    if consent_status != "Consented":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Cannot notify patient: Communication consent status is '{consent_status}'. Explicit consent is required."
        )

    channels = consent.get("channels") or []
    req_channel = payload.channel or "Voice AI Call & SMS"
    if "voice" in req_channel.lower() and not any("voice" in str(ch).lower() for ch in channels):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Automated voice call blocked: Patient '{patient.get('name')}' has not consented to 'Voice AI Call'. Consented channels: {channels if channels else 'None'}. Please record Voice AI consent in the Patient Registry before calling."
        )

    updated = await patient_service.notify_patient(patient_id, payload)
    return {
        "success": True,
        "message": f"Notification dispatched to {patient['name']} via {payload.channel or 'Voice AI Call & SMS'}",
        "data": updated
    }
