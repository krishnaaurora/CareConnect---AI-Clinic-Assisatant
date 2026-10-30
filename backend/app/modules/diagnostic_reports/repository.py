from typing import List, Optional, Dict, Any
from datetime import datetime
from app.core.database import get_database

INITIAL_DIAGNOSTIC_REPORTS = [
    {
        "id": "RPT-2001",
        "patient_id": "PAT-1001",
        "patient_name": "Rahul Sharma",
        "patient_phone": "8897371942",
        "masked_phone": "88XXXXXX42",
        "report_type": "Blood Test",
        "uploaded_date": "Oct 30",
        "uploaded_time": "09:30 AM",
        "status": "Ready",
        "file_name": "Rahul_Sharma_Complete_Blood_Count.pdf",
        "file_size": "1.4 MB",
        "notes": "Routine biochemical profile & CBC; verified by attending pathologist.",
        "communication_consent": {
            "status": "Consented",
            "channels": ["Voice AI Call", "SMS"],
            "verified": True
        },
        "created_at": "2026-10-30T09:30:00Z",
        "updated_at": "2026-10-30T09:30:00Z"
    },
    {
        "id": "RPT-2002",
        "patient_id": "PAT-1002",
        "patient_name": "Priya Reddy",
        "patient_phone": "8897371942",
        "masked_phone": "88XXXXXX42",
        "report_type": "MRI",
        "uploaded_date": "Oct 30",
        "uploaded_time": "10:15 AM",
        "status": "Processing",
        "file_name": "Priya_Reddy_Brain_Spine_MRI.pdf",
        "file_size": "4.6 MB",
        "notes": "Lumbar & spine magnetic resonance imaging; waiting for radiologist sign-off.",
        "communication_consent": {
            "status": "Consented",
            "channels": ["WhatsApp", "Voice AI Call", "SMS"],
            "verified": True
        },
        "created_at": "2026-10-30T10:15:00Z",
        "updated_at": "2026-10-30T10:15:00Z"
    },
    {
        "id": "RPT-2003",
        "patient_id": "PAT-1003",
        "patient_name": "Arjun Kumar",
        "patient_phone": "8897371942",
        "masked_phone": "88XXXXXX42",
        "report_type": "X-Ray",
        "uploaded_date": "Oct 30",
        "uploaded_time": "10:45 AM",
        "status": "Ready",
        "file_name": "Arjun_Kumar_Chest_PA_XRay.pdf",
        "file_size": "2.2 MB",
        "notes": "Chest PA digital X-Ray; cleared by Dr. Rajesh Sharma.",
        "communication_consent": {
            "status": "Consented",
            "channels": ["Voice AI Call", "SMS"],
            "verified": True
        },
        "created_at": "2026-10-30T10:45:00Z",
        "updated_at": "2026-10-30T10:45:00Z"
    }
]

class DiagnosticReportRepository:
    @property
    def col(self):
        return get_database()["diagnostic_reports"]

    async def seed_if_needed(self):
        count = await self.col.count_documents({})
        if count == 0:
            await self.col.insert_many([dict(r) for r in INITIAL_DIAGNOSTIC_REPORTS])

    async def get_all(
        self,
        search: Optional[str] = None,
        status: Optional[str] = None,
        report_type: Optional[str] = None,
        limit: int = 100
    ) -> List[dict]:
        await self.seed_if_needed()
        query: Dict[str, Any] = {}

        if status and status.lower() != "all":
            query["status"] = {"$regex": f"^{status}$", "$options": "i"}

        if report_type and report_type.lower() != "all":
            query["report_type"] = {"$regex": f"^{report_type}$", "$options": "i"}

        if search:
            s = search.strip()
            query["$or"] = [
                {"patient_name": {"$regex": s, "$options": "i"}},
                {"report_type": {"$regex": s, "$options": "i"}},
                {"patient_id": {"$regex": s, "$options": "i"}},
                {"id": {"$regex": s, "$options": "i"}},
                {"file_name": {"$regex": s, "$options": "i"}}
            ]

        cursor = self.col.find(query, {"_id": 0}).sort("created_at", -1).limit(limit)
        return await cursor.to_list(length=limit)

    async def get_by_id(self, report_id: str) -> Optional[dict]:
        await self.seed_if_needed()
        return await self.col.find_one({"id": report_id}, {"_id": 0})

    async def create(self, report_data: dict) -> dict:
        await self.col.insert_one(report_data)
        clean = dict(report_data)
        clean.pop("_id", None)
        return clean

    async def update(self, report_id: str, updates: dict) -> bool:
        updates["updated_at"] = datetime.utcnow().isoformat() + "Z"
        res = await self.col.update_one(
            {"id": report_id},
            {"$set": updates}
        )
        return res.modified_count > 0

    async def get_metrics(self) -> Dict[str, Any]:
        await self.seed_if_needed()
        db = get_database()
        total = await self.col.count_documents({})
        ready = await self.col.count_documents({"status": "Ready"})
        processing = await self.col.count_documents({"status": "Processing"})

        # Actual persisted Sarvam voice calls from voice_calls collection
        voice_calls_col = db["voice_calls"]
        calls_dispatched = await voice_calls_col.count_documents({
            "status": {"$in": ["INITIATED", "IN_PROGRESS", "QUEUED", "COMPLETED"]}
        })
        calls_completed = await voice_calls_col.count_documents({"status": "COMPLETED"})
        calls_failed = await voice_calls_col.count_documents({
            "status": {"$in": ["FAILED", "ERROR", "BUSY", "NO_ANSWER"]}
        })

        # Evaluate Ready reports against live patient consent
        reports = await self.col.find({"status": "Ready"}, {"_id": 0, "patient_id": 1, "communication_consent": 1, "sarvam_call": 1}).to_list(200)
        patient_ids = list({r.get("patient_id") for r in reports if r.get("patient_id")})
        patients = await db["patients"].find({"id": {"$in": patient_ids}}, {"_id": 0, "id": 1, "communication_consent": 1}).to_list(len(patient_ids)) if patient_ids else []
        patient_consent_map = {p["id"]: p.get("communication_consent", {}) for p in patients}

        calls_blocked_consent = 0
        ready_to_dispatch = 0
        for r in reports:
            consent = patient_consent_map.get(r.get("patient_id")) or r.get("communication_consent", {})
            st = (consent.get("status") or "Pending").strip().title()
            ch = consent.get("channels") or []
            has_voice = any("voice" in str(c).lower() for c in ch)
            if st != "Consented" or not has_voice:
                calls_blocked_consent += 1
            else:
                if not (r.get("sarvam_call") or {}).get("triggered"):
                    ready_to_dispatch += 1

        return {
            "total_reports": total,
            "ready_count": ready,
            "processing_count": processing,
            "calls_dispatched": calls_dispatched,
            "calls_completed": calls_completed,
            "calls_failed": calls_failed,
            "calls_blocked_consent": calls_blocked_consent,
            "ready_to_dispatch_count": ready_to_dispatch
        }
