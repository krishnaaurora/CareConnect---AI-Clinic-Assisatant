from typing import List, Optional, Dict, Any
from app.core.database import get_database

class ReportRepository:
    @property
    def reports_col(self):
        return get_database()["patient_reports"]

    @property
    def followups_col(self):
        return get_database()["report_followups"]

    async def get_all_reports(self, limit: int = 100) -> List[dict]:
        cursor = self.reports_col.find({}, {"_id": 0}).sort("uploaded_date", -1).limit(limit)
        return await cursor.to_list(length=limit)

    async def get_report_by_id(self, report_id: str) -> Optional[dict]:
        return await self.reports_col.find_one({"id": report_id}, {"_id": 0})

    async def create_report(self, report_data: dict) -> dict:
        await self.reports_col.insert_one(report_data)
        clean = dict(report_data)
        clean.pop("_id", None)
        return clean

    async def update_report_status(self, report_id: str, updates: dict) -> bool:
        res = await self.reports_col.update_one(
            {"id": report_id},
            {"$set": updates}
        )
        return res.modified_count > 0

    async def get_summary_counts(self) -> Dict[str, int]:
        awaiting = await self.reports_col.count_documents({"verification_status": "Awaiting Verification"})
        ready = await self.reports_col.count_documents({"verification_status": "Ready to Notify"})
        pending = await self.reports_col.count_documents({"notification_status": "Pending"})
        followup = await self.reports_col.count_documents({
            "$or": [
                {"notification_status": "Follow-up Required"},
                {"notification_status": "No Answer"},
                {"notification_status": "Call Failed"}
            ]
        })
        return {
            "awaiting_verification": awaiting,
            "ready_to_notify": ready,
            "notification_pending": pending,
            "followup_required": followup
        }

    async def get_all_followups(self, limit: int = 100) -> List[dict]:
        cursor = self.followups_col.find({}, {"_id": 0}).sort("due_date", 1).limit(limit)
        return await cursor.to_list(length=limit)

    async def resolve_followup(self, followup_id: str, notes: Optional[str] = None) -> bool:
        update_data = {"status": "Resolved"}
        if notes:
            update_data["resolution_notes"] = notes
        res = await self.followups_col.update_one(
            {"id": followup_id},
            {"$set": update_data}
        )
        return res.modified_count > 0

