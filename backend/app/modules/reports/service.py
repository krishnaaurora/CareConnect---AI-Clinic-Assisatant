import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.modules.reports.repository import ReportRepository
from app.modules.reports.models import ReportUploadRequest, ReportStatusUpdateRequest
from app.modules.clinics.repository import ClinicRepository

class ReportService:
    def __init__(self):
        self.repo = ReportRepository()
        self.clinic_repo = ClinicRepository()

    async def list_reports(self) -> List[dict]:
        return await self.repo.get_all_reports()

    async def get_summary(self) -> Dict[str, int]:
        return await self.repo.get_summary_counts()

    async def upload_report(self, req: ReportUploadRequest) -> dict:
        now = datetime.utcnow()
        report_id = f"RPT-{uuid.uuid4().hex[:4].upper()}"
        upload_date = req.uploaded_date or now.strftime("%Y-%m-%d")
        upload_time = now.strftime("%I:%M %p")
        title = req.title or f"{req.report_type} Diagnostic Record"

        report_doc = {
            "id": report_id,
            "patient_id": req.patient_id,
            "patient_name": req.patient_name,
            "patient_phone": req.patient_phone or "+91 99000 00000",
            "report_type": req.report_type,
            "title": title,
            "file_name": req.file_name,
            "file_size": req.file_size or "1.2 MB",
            "uploaded_date": upload_date,
            "uploaded_time": upload_time,
            "uploaded_by": req.uploaded_by or "Admin",
            "verification_status": "Awaiting Verification",
            "notification_status": "Not Started",
            "notes": req.notes or "Simulated report upload awaiting clinical physician verification.",
            "timeline": [
                {
                    "step": "Report Uploaded",
                    "timestamp": f"{upload_date} {upload_time}",
                    "actor": req.uploaded_by or "Admin",
                    "done": True
                },
                {
                    "step": "Physician Verification",
                    "timestamp": "Pending",
                    "actor": "Attending Doctor",
                    "done": False
                },
                {
                    "step": "Ready to Notify",
                    "timestamp": "Pending",
                    "actor": "Clinical Desk",
                    "done": False
                },
                {
                    "step": "Patient Notification",
                    "timestamp": "Scheduled Phase 4",
                    "actor": "Priya AI Voice",
                    "done": False
                }
            ],
            "created_at": now.isoformat() + "Z"
        }

        created = await self.repo.create_report(report_doc)

        # Audit Log
        await self.clinic_repo.add_audit_log(
            action="REPORT_UPLOADED",
            target=f"Report {report_id} ({req.patient_name})",
            details=f"Uploaded {req.report_type}: {req.file_name} by {req.uploaded_by or 'Admin'}",
            clinic_code="CARE-IND-01",
            user=req.uploaded_by or "Admin"
        )

        return created

    async def update_status(self, report_id: str, req: ReportStatusUpdateRequest) -> dict:
        report = await self.repo.get_report_by_id(report_id)
        if not report:
            raise ValueError(f"Report {report_id} not found")

        updates = {}
        if req.verification_status:
            updates["verification_status"] = req.verification_status
        if req.notification_status:
            updates["notification_status"] = req.notification_status
        if req.notes:
            updates["notes"] = req.notes

        # Update timeline if applicable
        timeline = report.get("timeline", [])
        now_str = datetime.utcnow().strftime("%Y-%m-%d %I:%M %p")
        if req.verification_status == "Verified":
            for step in timeline:
                if step.get("step") == "Physician Verification":
                    step["done"] = True
                    step["timestamp"] = now_str
                    step["actor"] = "Verified by Physician"
        elif req.verification_status == "Ready to Notify":
            for step in timeline:
                if step.get("step") in ["Physician Verification", "Ready to Notify"]:
                    step["done"] = True
                    if not step.get("timestamp") or step.get("timestamp") == "Pending":
                        step["timestamp"] = now_str
        elif req.verification_status == "Rejected":
            timeline.append({
                "step": "Report Rejected",
                "timestamp": now_str,
                "actor": "Physician Review",
                "done": True
            })

        updates["timeline"] = timeline
        updates["updated_at"] = datetime.utcnow().isoformat() + "Z"

        await self.repo.update_report_status(report_id, updates)

        action_name = "REPORT_VERIFIED" if req.verification_status == "Verified" else "REPORT_STATUS_UPDATED"
        await self.clinic_repo.add_audit_log(
            action=action_name,
            target=f"Report {report_id} ({report.get('patient_name')})",
            details=f"Verification: {req.verification_status or report.get('verification_status')}, Notification: {req.notification_status or report.get('notification_status')}",
            clinic_code="CARE-IND-01",
            user="Kavita Nair (Receptionist)"
        )

        report.update(updates)
        return report

    async def list_followups(self) -> List[dict]:
        return await self.repo.get_all_followups()

    async def resolve_followup(self, followup_id: str, notes: Optional[str] = None) -> bool:
        success = await self.repo.resolve_followup(followup_id, notes)
        if success:
            await self.clinic_repo.add_audit_log(
                action="REPORT_FOLLOWUP_RESOLVED",
                target=f"Follow-up Task {followup_id}",
                details=f"Follow-up resolved: {notes or 'Marked resolved by staff'}",
                clinic_code="CARE-IND-01",
                user="Front Desk Executive"
            )
        return success
