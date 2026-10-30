import uuid
import re
from datetime import datetime
from typing import List, Optional, Dict, Any
from app.modules.patients.repository import PatientRepository
from app.modules.patients.models import (
    PatientCreateRequest,
    PatientUpdateRequest,
    ConsentRecordRequest,
    PatientNotifyRequest
)

def mask_phone_number(phone: str) -> str:
    cleaned = re.sub(r"[^\d]", "", phone or "")
    if len(cleaned) >= 10:
        last10 = cleaned[-10:]
        return f"{last10[:2]}XXXXXX{last10[-2:]}"
    elif len(cleaned) >= 6:
        return f"{cleaned[:2]}XXXX{cleaned[-2:]}"
    return phone or "—"

class PatientService:
    def __init__(self):
        self.repo = PatientRepository()

    async def list_patients(
        self, 
        search: Optional[str] = None, 
        report_status: Optional[str] = None, 
        consent_status: Optional[str] = None,
        limit: int = 100
    ) -> List[dict]:
        return await self.repo.get_all(search, report_status, consent_status, limit)

    async def get_patient(self, patient_id: str) -> Optional[dict]:
        return await self.repo.get_by_id(patient_id)

    async def get_metrics(self) -> Dict[str, int]:
        return await self.repo.get_summary_metrics()

    async def create_patient(self, req: PatientCreateRequest) -> dict:
        now_iso = datetime.utcnow().isoformat() + "Z"
        patient_code = f"PAT-{str(uuid.uuid4())[:4].upper()}"
        report_code = f"RPT-{str(uuid.uuid4())[:4].upper()}"

        masked = mask_phone_number(req.phone)
        consent_channels = req.consent_channels if req.consent_channels is not None else (["Voice AI Call", "SMS", "WhatsApp"] if (req.consent_status or "Consented") == "Consented" else [])
        consent_record = {
            "status": req.consent_status or "Consented",
            "channels": consent_channels,
            "consented_at": now_iso if (req.consent_status or "Consented") == "Consented" else None,
            "recorded_by": "Front Desk Reception",
            "source": "Clinical Intake Form",
            "consent_notes": req.consent_notes or "Explicit communication consent recorded during intake."
        }

        patient_doc = {
            "id": patient_code,
            "name": req.name.strip(),
            "phone": req.phone.strip(),
            "masked_phone": masked,
            "email": req.email.strip() if req.email else None,
            "age": req.age,
            "gender": req.gender or "Unspecified",
            "report_status": req.report_status or "Processing",
            "report_id": report_code,
            "report_type": req.report_type or "General Lab Report",
            "report_updated_at": now_iso,
            "communication_consent": consent_record,
            "notification_history": [],
            "clinical_notes": req.clinical_notes,
            "created_at": now_iso,
            "updated_at": now_iso
        }

        return await self.repo.create(patient_doc)

    async def update_patient(self, patient_id: str, req: PatientUpdateRequest) -> Optional[dict]:
        existing = await self.repo.get_by_id(patient_id)
        if not existing:
            return None

        updates: Dict[str, Any] = {}
        if req.name is not None:
            updates["name"] = req.name.strip()
        if req.phone is not None:
            updates["phone"] = req.phone.strip()
            updates["masked_phone"] = mask_phone_number(req.phone)
        if req.email is not None:
            updates["email"] = req.email.strip()
        if req.age is not None:
            updates["age"] = req.age
        if req.gender is not None:
            updates["gender"] = req.gender
        if req.report_status is not None:
            updates["report_status"] = req.report_status
            updates["report_updated_at"] = datetime.utcnow().isoformat() + "Z"
        if req.report_type is not None:
            updates["report_type"] = req.report_type
        if req.clinical_notes is not None:
            updates["clinical_notes"] = req.clinical_notes

        if updates:
            await self.repo.update(patient_id, updates)
        return await self.repo.get_by_id(patient_id)

    async def record_consent(self, patient_id: str, req: ConsentRecordRequest) -> Optional[dict]:
        existing = await self.repo.get_by_id(patient_id)
        if not existing:
            return None

        now_iso = datetime.utcnow().isoformat() + "Z"
        channels = req.channels if req.channels is not None else (["Voice AI Call", "SMS", "WhatsApp"] if req.status == "Consented" else [])
        consent_record = {
            "status": req.status,
            "channels": channels,
            "consented_at": now_iso if req.status == "Consented" else None,
            "recorded_by": req.recorded_by or "Front Desk Reception",
            "source": req.source or "Front Desk Verbal Verification",
            "consent_notes": req.consent_notes or f"Consent updated to {req.status} by clinic staff."
        }

        await self.repo.record_consent(patient_id, consent_record)
        return await self.repo.get_by_id(patient_id)

    async def notify_patient(self, patient_id: str, req: PatientNotifyRequest) -> Optional[dict]:
        existing = await self.repo.get_by_id(patient_id)
        if not existing:
            return None

        now_iso = datetime.utcnow().isoformat() + "Z"
        log_entry = {
            "notified_at": now_iso,
            "channel": req.channel or "Voice AI Call & SMS",
            "status": "Delivered",
            "message": req.custom_message or f"CareConnect AI: Dear {existing['name']}, your diagnostic report ({existing.get('report_type', 'Diagnostic Test')}) is ready for review.",
            "operator": "Priya Voice AI / Automated Dispatch"
        }

        await self.repo.log_notification(patient_id, log_entry)
        return await self.repo.get_by_id(patient_id)

