from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.modules.clinics.service import ClinicService
from app.modules.clinics.models import (
    DoctorCreateRequest, 
    DoctorUpdateRequest, 
    ScheduleConfigRequest, 
    BlockSlotRequest
)

router = APIRouter(prefix="/clinics", tags=["Clinics & Doctors"])
service = ClinicService()

@router.get("", response_model=List[dict])
async def get_clinics():
    """Retrieve list of verified clinics and operating schedules."""
    return await service.list_clinics()

@router.get("/doctors", response_model=List[dict])
async def get_all_doctors():
    """Retrieve list of verified doctors across all clinic branches."""
    return await service.get_all_doctors()

@router.get("/on-duty", response_model=List[dict])
@router.get("/doctors/on-duty", response_model=List[dict])
async def get_doctors_on_duty(
    day: Optional[str] = Query(None, description="Day of the week (e.g. Wednesday)"),
    clinic_code: Optional[str] = Query(None, description="Clinic code (e.g. CARE-IND-01)"),
    specialty: Optional[str] = Query(None, description="Specialty or department filter")
):
    """
    Retrieve doctors on duty.
    Used by Sarvam Inbound tool 'get_doctors_on_duty'.
    """
    return await service.get_doctors_on_duty(day_name=day, clinic_code=clinic_code, specialty=specialty)

@router.post("/{clinic_code}/doctors", response_model=dict)
async def add_doctor_to_clinic(clinic_code: str, request: DoctorCreateRequest):
    """Add a verified physician to a clinic roster."""
    try:
        doctor = await service.add_doctor(clinic_code, request)
        return {"success": True, "data": doctor, "message": f"Doctor {doctor['name']} added successfully."}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add doctor: {str(e)}")

@router.put("/{clinic_code}/doctors/{doctor_id}", response_model=dict)
async def update_doctor_profile(clinic_code: str, doctor_id: str, request: DoctorUpdateRequest):
    """Update doctor profile details (specialty, department, shifts, breaks, leave)."""
    try:
        updated = await service.update_doctor(clinic_code, doctor_id, request)
        return {"success": True, "data": updated, "message": f"Doctor {doctor_id} profile updated."}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update doctor: {str(e)}")

@router.patch("/{clinic_code}/doctors/{doctor_id}/status", response_model=dict)
async def toggle_doctor_active_status(clinic_code: str, doctor_id: str, payload: dict):
    """Deactivate or reactivate a doctor in the clinic system."""
    is_active = payload.get("is_active", True)
    success = await service.toggle_doctor_status(clinic_code, doctor_id, is_active)
    if not success:
        raise HTTPException(status_code=404, detail="Doctor not found or status not changed")
    status_str = "activated" if is_active else "deactivated"
    return {"success": True, "message": f"Doctor {doctor_id} has been {status_str}."}

@router.get("/schedule", response_model=dict)
@router.get("/schedule-config", response_model=dict)
async def get_clinic_schedule_query(
    clinic_code: Optional[str] = Query(None, description="Clinic code (e.g. CARE-IND-01)")
):
    """
    Retrieve verified clinic schedule, operating days, opening/closing hours, and slot info.
    Requires an explicit, valid clinic_code (no silent fallback).
    """
    try:
        config = await service.get_schedule_config(clinic_code)
        if not config:
            raise HTTPException(
                status_code=404,
                detail=f"Clinic with code '{clinic_code}' not found."
            )
        return {"success": True, "data": config}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{clinic_code}/schedule", response_model=dict)
@router.get("/{clinic_code}/schedule-config", response_model=dict)
async def get_clinic_schedule_path(clinic_code: str):
    """
    Retrieve verified clinic opening/closing hours, operating days, and blocked slots by clinic code in path.
    Requires an explicit, valid clinic_code (no silent fallback).
    """
    try:
        config = await service.get_schedule_config(clinic_code)
        if not config:
            raise HTTPException(
                status_code=404,
                detail=f"Clinic with code '{clinic_code}' not found."
            )
        return {"success": True, "data": config}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{clinic_code}/schedule-config", response_model=dict)
async def save_clinic_schedule_config(clinic_code: str, request: ScheduleConfigRequest):
    """Configure clinic opening/closing hours and default slot duration."""
    updated = await service.update_schedule_config(clinic_code, request)
    return {"success": True, "data": updated, "message": "Clinic schedule config saved successfully."}

@router.post("/{clinic_code}/block-slot", response_model=dict)
async def block_clinic_slot(clinic_code: str, request: BlockSlotRequest):
    """Block a physician slot (break, sanitization, emergency)."""
    blocked = await service.block_slot(clinic_code, request)
    return {"success": True, "data": blocked, "message": "Slot blocked successfully."}

@router.post("/{clinic_code}/unblock-slot", response_model=dict)
async def unblock_clinic_slot(clinic_code: str, payload: dict):
    """Unblock a previously blocked physician slot."""
    doctor_name = payload.get("doctor_name")
    date = payload.get("date")
    time_slot = payload.get("time_slot")
    await service.unblock_slot(clinic_code, doctor_name, date, time_slot)
    return {"success": True, "message": "Slot unblocked and reopened."}

@router.get("/{clinic_code}/settings", response_model=dict)
async def get_clinic_settings_route(clinic_code: str):
    """Retrieve clinic name, address, contact details, opening hours, and AI greeting settings."""
    settings = await service.get_clinic_settings(clinic_code)
    return {"success": True, "data": settings}

@router.put("/{clinic_code}/settings", response_model=dict)
async def update_clinic_settings_route(clinic_code: str, payload: dict):
    """Update clinic configuration, opening hours, AI greeting, and language preferences in MongoDB."""
    updated = await service.update_clinic_settings(clinic_code, payload)
    return {"success": True, "data": updated, "message": "Clinic settings updated successfully in database."}

@router.get("/{clinic_code}/staff", response_model=dict)
async def get_clinic_staff_route(clinic_code: str):
    """Retrieve staff credentials, roles, and access control permissions from MongoDB."""
    staff = await service.get_clinic_staff(clinic_code)
    return {"success": True, "data": staff}

@router.post("/{clinic_code}/staff", response_model=dict)
async def add_clinic_staff_route(clinic_code: str, payload: dict):
    """Create a new staff member profile in MongoDB."""
    staff = await service.add_clinic_staff(clinic_code, payload)
    return {"success": True, "data": staff, "message": f"Staff member {staff.get('name')} created successfully."}

@router.get("/{clinic_code}/audit-logs", response_model=dict)
async def get_clinic_audit_logs_route(clinic_code: str):
    """Retrieve chronological audit trail of booking and configuration changes from MongoDB."""
    logs = await service.get_audit_logs(clinic_code)
    return {"success": True, "data": logs}

@router.get("/{clinic_code}")
async def get_clinic_by_code(clinic_code: str):
    """Retrieve details for a specific clinic branch."""
    clinic = await service.get_clinic_details(clinic_code)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return clinic
