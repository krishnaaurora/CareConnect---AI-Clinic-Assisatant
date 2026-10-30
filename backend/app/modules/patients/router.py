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
    limit: int = Query(100, ge=1, le=200)
):
    """Retrieve filtered list of registered patients."""
    patients = await patient_service.list_patients(
        search=search,
        report_status=report_status,
        consent_status=consent_status,
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

@router.post("", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_patient(payload: PatientCreateRequest):
    """Register a new patient into the registry."""
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="Patient name is required")
    if not payload.phone.strip():
        raise HTTPException(status_code=400, detail="Patient phone number is required")

    created = await patient_service.create_patient(payload)
    return {
        "success": True,
        "message": f"Patient {created['name']} registered successfully",
        "data": created
    }

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

    updated = await patient_service.notify_patient(patient_id, payload)
    return {
        "success": True,
        "message": f"Notification dispatched to {patient['name']} via {payload.channel or 'Voice AI Call & SMS'}",
        "data": updated
    }

