from typing import List, Optional
from pydantic import BaseModel, Field

class DoctorModel(BaseModel):
    id: str
    name: str
    specialty: str
    experience: str
    languages: List[str]
    consultation_fee: int
    available_days: List[str]
    available_slots: List[str]

class ClinicModel(BaseModel):
    code: str
    name: str
    branch: str
    phone: str
    timings: str
    emergency_available: bool = False
    doctors: List[DoctorModel] = []

class ClinicResponse(BaseModel):
    id: Optional[str] = None
    code: str
    name: str
    branch: str
    phone: str
    timings: str
    emergency_available: bool = False
    doctors: List[DoctorModel] = []
