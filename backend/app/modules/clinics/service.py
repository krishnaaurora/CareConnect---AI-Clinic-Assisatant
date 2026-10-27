from typing import List, Optional
from app.modules.clinics.repository import ClinicRepository
from app.modules.clinics.models import ClinicResponse, DoctorModel

class ClinicService:
    def __init__(self):
        self.repository = ClinicRepository()

    async def list_clinics(self) -> List[dict]:
        return await self.repository.get_all_clinics()

    async def get_clinic_details(self, code: str) -> Optional[dict]:
        return await self.repository.get_clinic_by_code(code)

    async def get_all_doctors(self) -> List[dict]:
        clinics = await self.repository.get_all_clinics()
        doctors = []
        for c in clinics:
            clinic_name = c.get("name")
            clinic_code = c.get("code")
            for doc in c.get("doctors", []):
                doc_copy = dict(doc)
                doc_copy["clinic_name"] = clinic_name
                doc_copy["clinic_code"] = clinic_code
                doctors.append(doc_copy)
        return doctors
