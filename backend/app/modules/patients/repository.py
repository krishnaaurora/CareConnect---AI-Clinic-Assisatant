from typing import List, Optional, Dict, Any
from datetime import datetime
from app.core.database import get_database

INITIAL_PATIENTS = [
    {
        "id": "PAT-1001",
        "name": "Rahul Sharma",
        "phone": "9876543210",
        "masked_phone": "98XXXXXX10",
        "email": "rahul.sharma@example.com",
        "age": 38,
        "gender": "Male",
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
        "phone": "9988776620",
        "masked_phone": "99XXXXXX20",
        "email": "priya.reddy@example.com",
        "age": 29,
        "gender": "Female",
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
        "phone": "9765432130",
        "masked_phone": "97XXXXXX30",
        "email": "arjun.kumar@example.com",
        "age": 45,
        "gender": "Male",
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
        "phone": "9820154310",
        "masked_phone": "98XXXXXX10",
        "email": "ananya.d@example.com",
        "age": 32,
        "gender": "Female",
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
        "phone": "9922334450",
        "masked_phone": "99XXXXXX50",
        "email": "vikram.m@example.com",
        "age": 52,
        "gender": "Male",
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

    async def get_all(
        self, 
        search: Optional[str] = None, 
        report_status: Optional[str] = None, 
        consent_status: Optional[str] = None,
        limit: int = 100
    ) -> List[dict]:
        await self.seed_if_needed()
        query: Dict[str, Any] = {}

        if report_status and report_status.lower() != "all":
            query["report_status"] = {"$regex": f"^{report_status}$", "$options": "i"}

        if consent_status and consent_status.lower() != "all":
            query["communication_consent.status"] = {"$regex": f"^{consent_status}$", "$options": "i"}

        if search:
            s = search.strip()
            query["$or"] = [
                {"name": {"$regex": s, "$options": "i"}},
                {"phone": {"$regex": s, "$options": "i"}},
                {"masked_phone": {"$regex": s, "$options": "i"}},
                {"id": {"$regex": s, "$options": "i"}},
                {"report_type": {"$regex": s, "$options": "i"}},
                {"email": {"$regex": s, "$options": "i"}}
            ]

        cursor = self.col.find(query, {"_id": 0}).sort("created_at", -1).limit(limit)
        return await cursor.to_list(length=limit)

    async def get_by_id(self, patient_id: str) -> Optional[dict]:
        await self.seed_if_needed()
        return await self.col.find_one({"id": patient_id}, {"_id": 0})

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

