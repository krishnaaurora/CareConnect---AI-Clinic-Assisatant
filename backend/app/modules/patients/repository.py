from typing import List, Optional, Dict, Any
from datetime import datetime
import re
from app.core.database import get_database

INITIAL_PATIENTS = [
    {
        "id": "PAT-1001",
        "name": "Rahul Sharma",
        "phone": "8897371942",
        "masked_phone": "88XXXXXX42",
        "email": "rahul.sharma@example.com",
        "age": 38,
        "gender": "Male",
        "blood_group": "O+",
        "address": "#142, 4th Cross, 100ft Road, Indiranagar",
        "city": "Bengaluru",
        "pincode": "560038",
        "emergency_contact_name": "Sunita Sharma",
        "emergency_contact_phone": "+91 98765 43210",
        "emergency_contact_relation": "Spouse",
        "report_status": "Ready",
        "report_id": "RPT-1001",
        "report_type": "Comprehensive Metabolic Panel",
        "report_updated_at": "2026-10-29T14:30:00Z",
        "communication_consent": {
            "status": "Consented",
            "channels": ["Voice AI Call", "SMS"],
            "consented_at": "2026-10-28T09:30:00Z",
            "recorded_by": "Front Desk Reception",
            "source": "Digital Intake Form",
            "consent_notes": "Patient authorized automated Priya voice calls and SMS alerts for diagnostic updates."
        },
        "notification_history": [],
        "clinical_notes": "Annual executive health checkup; report analyzed and verified by Dr. Rajesh Sharma.",
        "created_at": "2026-10-28T09:00:00Z",
        "updated_at": "2026-10-29T14:30:00Z"
    },
    {
        "id": "PAT-1002",
        "name": "Priya Reddy",
        "phone": "8897371942",
        "masked_phone": "88XXXXXX42",
        "email": "priya.reddy@example.com",
        "age": 29,
        "gender": "Female",
        "blood_group": "B+",
        "address": "Flat 302, Green Glen Heights, Koramangala 4th Block",
        "city": "Bengaluru",
        "pincode": "560034",
        "emergency_contact_name": "Vikram Reddy",
        "emergency_contact_phone": "+91 98450 12345",
        "emergency_contact_relation": "Brother",
        "report_status": "Processing",
        "report_id": "RPT-1002",
        "report_type": "Thyroid Profile (T3, T4, TSH)",
        "report_updated_at": "2026-10-30T08:15:00Z",
        "communication_consent": {
            "status": "Consented",
            "channels": ["WhatsApp", "Voice AI Call", "SMS"],
            "consented_at": "2026-10-29T11:15:00Z",
            "recorded_by": "Web Intake",
            "source": "Online Verification",
            "consent_notes": "Explicit consent captured during online appointment reservation."
        },
        "notification_history": [],
        "clinical_notes": "Sample collected at Apollo Clinic lab; automated biochemical assay currently in progress.",
        "created_at": "2026-10-29T11:00:00Z",
        "updated_at": "2026-10-30T08:15:00Z"
    },
    {
        "id": "PAT-1003",
        "name": "Arjun Kumar",
        "phone": "8897371942",
        "masked_phone": "88XXXXXX42",
        "email": "arjun.kumar@example.com",
        "age": 45,
        "gender": "Male",
        "blood_group": "A+",
        "address": "Villa 12, Sobha Primrose, HSR Layout Sector 2",
        "city": "Bengaluru",
        "pincode": "560102",
        "emergency_contact_name": "Meera Kumar",
        "emergency_contact_phone": "+91 97312 34567",
        "emergency_contact_relation": "Spouse",
        "report_status": "Ready",
        "report_id": "RPT-1003",
        "report_type": "HbA1c & Fasting Lipid Profile",
        "report_updated_at": "2026-10-29T16:45:00Z",
        "communication_consent": {
            "status": "Consented",
            "channels": ["Voice AI Call", "SMS"],
            "consented_at": "2026-10-27T14:20:00Z",
            "recorded_by": "Front Desk Reception",
            "source": "Verbal Consent at Intake",
            "consent_notes": "Patient confirmed primary phone number for outbound voice notifications."
        },
        "notification_history": [],
        "clinical_notes": "Diabetic profile review. Dr. Sneha Kulkarni cleared the report for patient delivery.",
        "created_at": "2026-10-27T14:00:00Z",
        "updated_at": "2026-10-29T16:45:00Z"
    },
    {
        "id": "PAT-1004",
        "name": "Ananya Deshmukh",
        "phone": "8897371942",
        "masked_phone": "88XXXXXX42",
        "email": "ananya.d@example.com",
        "age": 32,
        "gender": "Female",
        "blood_group": "AB+",
        "address": "Apartment 5B, Prestige Palms, Whitefield Main Road",
        "city": "Bengaluru",
        "pincode": "560066",
        "emergency_contact_name": "Suresh Deshmukh",
        "emergency_contact_phone": "+91 99001 23456",
        "emergency_contact_relation": "Father",
        "report_status": "Ready",
        "report_id": "RPT-1004",
        "report_type": "Allergy Sensitivity Panel",
        "report_updated_at": "2026-10-29T10:00:00Z",
        "communication_consent": {
            "status": "Consented",
            "channels": ["SMS", "WhatsApp"],
            "consented_at": "2026-10-29T09:30:00Z",
            "recorded_by": "Digital Intake",
            "source": "Patient Portal",
            "consent_notes": "Prefers SMS and WhatsApp summary over voice calls."
        },
        "notification_history": [],
        "clinical_notes": "Dermatology referral from Dr. Ananya Reddy.",
        "created_at": "2026-10-29T09:00:00Z",
        "updated_at": "2026-10-29T10:00:00Z"
    },
    {
        "id": "PAT-1005",
        "name": "Vikram Malhotra",
        "phone": "8897371942",
        "masked_phone": "88XXXXXX42",
        "email": "vikram.m@example.com",
        "age": 52,
        "gender": "Male",
        "blood_group": "O-",
        "address": "#78, 9th Main, Jayanagar 4th Block",
        "city": "Bengaluru",
        "pincode": "560011",
        "emergency_contact_name": "Anita Malhotra",
        "emergency_contact_phone": "+91 98860 98765",
        "emergency_contact_relation": "Spouse",
        "report_status": "Processing",
        "report_id": "RPT-1005",
        "report_type": "Cardiac Stress & Echo Doppler",
        "report_updated_at": "2026-10-30T09:00:00Z",
        "communication_consent": {
            "status": "Pending",
            "channels": ["Voice AI Call"],
            "consented_at": None,
            "recorded_by": "Pending Intake Verification",
            "source": "Pending",
            "consent_notes": "Formal written consent pending at next clinical visit."
        },
        "notification_history": [],
        "clinical_notes": "Follow-up test after ECG findings; awaiting cardiologist report sign-off.",
        "created_at": "2026-10-29T15:00:00Z",
        "updated_at": "2026-10-30T09:00:00Z"
    }
]

class PatientRepository:
    @property
    def col(self):
        return get_database()["patients"]

    async def seed_if_needed(self):
        count = await self.col.count_documents({})
        if count == 0:
            await self.col.insert_many([dict(p) for p in INITIAL_PATIENTS])
        else:
            # Upgrade existing records if demographic fields missing
            for patient in INITIAL_PATIENTS:
                await self.col.update_one(
                    {"id": patient["id"], "blood_group": {"$exists": False}},
                    {"$set": {
                        "blood_group": patient.get("blood_group", "O+"),
                        "address": patient.get("address", ""),
                        "city": patient.get("city", "Bengaluru"),
                        "pincode": patient.get("pincode", ""),
                        "emergency_contact_name": patient.get("emergency_contact_name", ""),
                        "emergency_contact_phone": patient.get("emergency_contact_phone", ""),
                        "emergency_contact_relation": patient.get("emergency_contact_relation", "")
                    }}
                )

    async def get_next_patient_id(self) -> str:
        """Generate the next sequential unique patient ID e.g. PAT-1006."""
        await self.seed_if_needed()
        cursor = self.col.find({}, {"_id": 0, "id": 1})
        all_patients = await cursor.to_list(length=1000)
        max_num = 1000
        for p in all_patients:
            pid = p.get("id", "")
            match = re.match(r"^PAT-(\d+)$", pid)
            if match:
                num = int(match.group(1))
                if num > max_num:
                    max_num = num
        return f"PAT-{max_num + 1}"

    async def get_all(
        self, 
        search: Optional[str] = None, 
        report_status: Optional[str] = None, 
        consent_status: Optional[str] = None,
        gender: Optional[str] = None,
        blood_group: Optional[str] = None,
        limit: int = 150
    ) -> List[dict]:
        await self.seed_if_needed()
        query: Dict[str, Any] = {}

        if report_status and report_status.lower() != "all":
            query["report_status"] = {"$regex": f"^{report_status}$", "$options": "i"}

        if consent_status and consent_status.lower() != "all":
            query["communication_consent.status"] = {"$regex": f"^{consent_status}$", "$options": "i"}

        if gender and gender.lower() != "all":
            query["gender"] = {"$regex": f"^{gender}$", "$options": "i"}

        if blood_group and blood_group.lower() != "all":
            query["blood_group"] = {"$regex": f"^{re.escape(blood_group)}$", "$options": "i"}

        if search:
            s = search.strip()
            query["$or"] = [
                {"name": {"$regex": s, "$options": "i"}},
                {"phone": {"$regex": s, "$options": "i"}},
                {"masked_phone": {"$regex": s, "$options": "i"}},
                {"id": {"$regex": s, "$options": "i"}},
                {"report_type": {"$regex": s, "$options": "i"}},
                {"email": {"$regex": s, "$options": "i"}},
                {"city": {"$regex": s, "$options": "i"}},
                {"blood_group": {"$regex": s, "$options": "i"}}
            ]

        cursor = self.col.find(query, {"_id": 0}).sort("created_at", -1).limit(limit)
        return await cursor.to_list(length=limit)

    async def get_by_id(self, patient_id: str) -> Optional[dict]:
        await self.seed_if_needed()
        return await self.col.find_one({"id": patient_id}, {"_id": 0})

    async def get_by_phone(self, phone: str) -> Optional[dict]:
        await self.seed_if_needed()
        clean = re.sub(r"[^\d]", "", phone or "")
        if len(clean) >= 10:
            last10 = clean[-10:]
            return await self.col.find_one({"phone": {"$regex": last10}}, {"_id": 0})
        return await self.col.find_one({"phone": phone}, {"_id": 0})

    async def create(self, patient_data: dict) -> dict:
        await self.col.insert_one(patient_data)
        clean = dict(patient_data)
        clean.pop("_id", None)
        return clean

    async def update(self, patient_id: str, updates: dict) -> bool:
        updates["updated_at"] = datetime.utcnow().isoformat() + "Z"
        res = await self.col.update_one(
            {"id": patient_id},
            {"$set": updates}
        )
        return res.modified_count > 0

    async def record_consent(self, patient_id: str, consent_data: dict) -> bool:
        res = await self.col.update_one(
            {"id": patient_id},
            {
                "$set": {
                    "communication_consent": consent_data,
                    "updated_at": datetime.utcnow().isoformat() + "Z"
                }
            }
        )
        return res.modified_count > 0

    async def log_notification(self, patient_id: str, log_entry: dict) -> bool:
        res = await self.col.update_one(
            {"id": patient_id},
            {
                "$push": {"notification_history": log_entry},
                "$set": {
                    "last_notified_at": log_entry["notified_at"],
                    "updated_at": datetime.utcnow().isoformat() + "Z"
                }
            }
        )
        return res.modified_count > 0

    async def get_summary_metrics(self) -> Dict[str, int]:
        await self.seed_if_needed()
        total = await self.col.count_documents({})
        ready = await self.col.count_documents({"report_status": "Ready"})
        processing = await self.col.count_documents({"report_status": "Processing"})
        consented = await self.col.count_documents({"communication_consent.status": "Consented"})
        pending_consent = await self.col.count_documents({"communication_consent.status": "Pending"})

        return {
            "total_patients": total,
            "reports_ready": ready,
            "reports_processing": processing,
            "consented_count": consented,
            "pending_consent_count": pending_consent
        }

    async def get_patient_appointments(self, patient: dict) -> List[dict]:
        """Fetch all appointments linked to this patient from appointments collection."""
        db = get_database()
        appt_col = db["appointments"]

        patient_name = patient.get("name", "").strip()
        patient_phone = patient.get("phone", "").strip()
        patient_id = patient.get("id", "").strip()

        clean_digits = re.sub(r"[^\d]", "", patient_phone)

        or_conditions = []
        if patient_id:
            or_conditions.append({"patient_id": patient_id})
        if patient_phone:
            or_conditions.append({"phone": patient_phone})
        if len(clean_digits) >= 10:
            last10 = clean_digits[-10:]
            or_conditions.append({"phone": {"$regex": last10}})
        if patient_name:
            or_conditions.append({"patient_name": {"$regex": f"^{re.escape(patient_name)}$", "$options": "i"}})

        if not or_conditions:
            return []

        cursor = appt_col.find({"$or": or_conditions}, {"_id": 0}).sort("preferred_date", -1)
        results = await cursor.to_list(length=50)
        return results

    async def get_patient_diagnostic_reports(self, patient: dict) -> List[dict]:
        """Fetch all diagnostic reports linked to this patient from diagnostic_reports collection."""
        db = get_database()
        reports_col = db["diagnostic_reports"]

        patient_id = patient.get("id", "").strip()
        patient_phone = patient.get("phone", "").strip()
        patient_name = patient.get("name", "").strip()

        clean_digits = re.sub(r"[^\d]", "", patient_phone)

        or_conditions = []
        if patient_id:
            or_conditions.append({"patient_id": patient_id})
        if patient_phone:
            or_conditions.append({"patient_phone": patient_phone})
        if len(clean_digits) >= 10:
            last10 = clean_digits[-10:]
            or_conditions.append({"patient_phone": {"$regex": last10}})
        if patient_name:
            or_conditions.append({"patient_name": {"$regex": f"^{re.escape(patient_name)}$", "$options": "i"}})

        if not or_conditions:
            return []

        cursor = reports_col.find({"$or": or_conditions}, {"_id": 0}).sort("created_at", -1)
        results = await cursor.to_list(length=50)
        return results
