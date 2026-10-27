from fastapi import APIRouter, HTTPException
from typing import List
from app.modules.clinics.service import ClinicService

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

@router.get("/{clinic_code}")
async def get_clinic_by_code(clinic_code: str):
    """Retrieve details for a specific clinic branch."""
    clinic = await service.get_clinic_details(clinic_code)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return clinic
