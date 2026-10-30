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
        gender: Optional[str] = None,
        blood_group: Optional[str] = None,
        limit: int = 150
    ) -> List[dict]:
        return await self.repo.get_all(search, report_status, consent_status, gender, blood_group, limit)

    async def get_patient(self, patient_id: str) -> Optional[dict]:
        return await self.repo.get_by_id(patient_id)

    async def get_metrics(self) -> Dict[str, int]:
        return await self.repo.get_summary_metrics()

    async def check_phone_exists(self, phone: str) -> Optional[dict]:
        return await self.repo.get_by_phone(phone)

    async def create_patient(self, req: PatientCreateRequest) -> dict:
        now_iso = datetime.utcnow().isoformat() + "Z"
        
        # Check duplicate by phone
        existing_phone = await self.repo.get_by_phone(req.phone)
        if existing_phone:
            raise ValueError(
                f"Patient with phone {req.phone} is already registered as '{existing_phone.get('name')}' ({existing_phone.get('id')}). Duplicate registrations are prevented."
            )

        # Generate unique sequential ID
        patient_code = await self.repo.get_next_patient_id()
        report_code = f"RPT-{str(uuid.uuid4())[:4].upper()}"

        masked = mask_phone_number(req.phone)
        status = req.consent_status or "Pending"
        if status == "Consented":
            channels = req.consent_channels if req.consent_channels is not None else ["Voice AI Call", "SMS", "WhatsApp"]
            consented_at = now_iso
        else:
            channels = req.consent_channels or []
            consented_at = None

        consent_record = {
            "status": status,
            "channels": channels,
            "consented_at": consented_at,
            "recorded_by": "Front Desk Reception",
            "source": req.consent_source or "Clinical Intake Form",
            "consent_notes": req.consent_notes or ("Explicit communication consent recorded during intake." if status == "Consented" else "Awaiting patient consent.")
        }

        patient_doc = {
            "id": patient_code,
            "name": req.name.strip(),
            "phone": req.phone.strip(),
            "masked_phone": masked,
            "email": req.email.strip() if req.email else None,
            "age": req.age,
            "gender": req.gender or "Unspecified",
            "blood_group": req.blood_group.strip().upper() if req.blood_group else "O+",
            "address": req.address.strip() if req.address else "",
            "city": req.city.strip() if req.city else "Bengaluru",
            "pincode": req.pincode.strip() if req.pincode else "",
            "emergency_contact_name": req.emergency_contact_name.strip() if req.emergency_contact_name else "",
            "emergency_contact_phone": req.emergency_contact_phone.strip() if req.emergency_contact_phone else "",
            "emergency_contact_relation": req.emergency_contact_relation.strip() if req.emergency_contact_relation else "Family",
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
        if req.blood_group is not None:
            updates["blood_group"] = req.blood_group.strip().upper()
        if req.address is not None:
            updates["address"] = req.address.strip()
        if req.city is not None:
            updates["city"] = req.city.strip()
        if req.pincode is not None:
            updates["pincode"] = req.pincode.strip()
        if req.emergency_contact_name is not None:
            updates["emergency_contact_name"] = req.emergency_contact_name.strip()
        if req.emergency_contact_phone is not None:
            updates["emergency_contact_phone"] = req.emergency_contact_phone.strip()
        if req.emergency_contact_relation is not None:
            updates["emergency_contact_relation"] = req.emergency_contact_relation.strip()
        if req.report_status is not None:
            updates["report_status"] = req.report_status
            updates["report_updated_at"] = datetime.utcnow().isoformat() + "Z"
        if req.report_type is not None:
            updates["report_type"] = req.report_type
        if req.clinical_notes is not None:
            updates["clinical_notes"] = req.clinical_notes

        if req.consent_status is not None:
            now_iso = datetime.utcnow().isoformat() + "Z"
            existing_consent = existing.get("communication_consent", {})
            st = req.consent_status
            if st == "Consented":
                ch = req.consent_channels if req.consent_channels is not None else (existing_consent.get("channels") or ["Voice AI Call", "SMS", "WhatsApp"])
                cat = existing_consent.get("consented_at") or now_iso
            else:
                ch = req.consent_channels if req.consent_channels is not None else []
                cat = None

            consent_record = {
                "status": st,
                "channels": ch,
                "consented_at": cat,
                "recorded_by": "Front Desk Reception",
                "source": req.consent_source or existing_consent.get("source") or "Patient Profile Update",
                "consent_notes": req.consent_notes or existing_consent.get("consent_notes") or f"Consent updated to {st} by clinic staff."
            }
            updates["communication_consent"] = consent_record
            try:
                from app.core.database import get_database
                await get_database()["diagnostic_reports"].update_many(
                    {"patient_id": patient_id},
                    {"$set": {"communication_consent": consent_record, "updated_at": now_iso}}
                )
            except Exception:
                pass

        if updates:
            await self.repo.update(patient_id, updates)
        return await self.repo.get_by_id(patient_id)

    async def record_consent(self, patient_id: str, req: ConsentRecordRequest) -> Optional[dict]:
        existing = await self.repo.get_by_id(patient_id)
        if not existing:
            return None

        now_iso = datetime.utcnow().isoformat() + "Z"
        if req.status == "Consented":
            channels = req.channels if req.channels is not None else ["Voice AI Call", "SMS", "WhatsApp"]
            consented_at = now_iso
        else:
            channels = req.channels if req.channels is not None else []
            consented_at = None

        consent_record = {
            "status": req.status,
            "channels": channels,
            "consented_at": consented_at,
            "recorded_by": req.recorded_by or "Front Desk Reception",
            "source": req.source or "Front Desk Verbal Verification",
            "consent_notes": req.consent_notes or f"Consent updated to {req.status} by clinic staff."
        }

        await self.repo.record_consent(patient_id, consent_record)
        try:
            from app.core.database import get_database
            await get_database()["diagnostic_reports"].update_many(
                {"patient_id": patient_id},
                {"$set": {"communication_consent": consent_record, "updated_at": now_iso}}
            )
        except Exception:
            pass
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

    async def get_patient_appointments(self, patient_id: str) -> List[dict]:
        """Retrieve all historical and upcoming appointments for patient."""
        patient = await self.repo.get_by_id(patient_id)
        if not patient:
            return []
        return await self.repo.get_patient_appointments(patient)

    async def get_patient_reports(self, patient_id: str) -> List[dict]:
        """Retrieve all diagnostic laboratory and imaging reports for patient."""
        patient = await self.repo.get_by_id(patient_id)
        if not patient:
            return []
        return await self.repo.get_patient_diagnostic_reports(patient)
