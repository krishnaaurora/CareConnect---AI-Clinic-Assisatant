import uuid
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
from app.modules.diagnostic_reports.repository import DiagnosticReportRepository
from app.modules.diagnostic_reports.models import DiagnosticReportCreateRequest, DiagnosticReportStatusUpdate
from app.modules.patients.repository import PatientRepository

logger = logging.getLogger(__name__)

class DiagnosticReportService:
    def __init__(self):
        self.repo = DiagnosticReportRepository()
        self.patient_repo = PatientRepository()

    async def list_reports(
        self,
        search: Optional[str] = None,
        status: Optional[str] = None,
        report_type: Optional[str] = None,
        limit: int = 100
    ) -> List[dict]:
        reports = await self.repo.get_all(search, status, report_type, limit)
        try:
            patient_ids = list({r.get("patient_id") for r in reports if r.get("patient_id")})
            if patient_ids:
                patients = await self.patient_repo.col.find({"id": {"$in": patient_ids}}, {"_id": 0}).to_list(len(patient_ids))
                patient_map = {p["id"]: p for p in patients}
                for r in reports:
                    pid = r.get("patient_id")
                    if pid in patient_map:
                        p = patient_map[pid]
                        if "communication_consent" in p:
                            r["communication_consent"] = p["communication_consent"]
                        if p.get("phone"):
                            r["patient_phone"] = p["phone"]
                        if p.get("masked_phone"):
                            r["masked_phone"] = p["masked_phone"]
        except Exception as e:
            logger.warning(f"Failed to enrich reports with live patient details: {e}")
        return reports

    async def get_report(self, report_id: str) -> Optional[dict]:
        report = await self.repo.get_by_id(report_id)
        if report and report.get("patient_id"):
            p = await self.patient_repo.get_by_id(report["patient_id"])
            if p and "communication_consent" in p:
                report["communication_consent"] = p["communication_consent"]
        return report

    async def get_metrics(self) -> Dict[str, Any]:
        return await self.repo.get_metrics()

    async def upload_report(self, req: DiagnosticReportCreateRequest) -> dict:
        """
        Saves a diagnostic report to MongoDB.
        """
        now = datetime.utcnow()
        now_iso = now.isoformat() + "Z"
        report_id = f"RPT-{uuid.uuid4().hex[:4].upper()}"
        upload_date = req.uploaded_date or now.strftime("Oct %d")
        upload_time = now.strftime("%I:%M %p")

        # Fetch patient details from existing registry
        patient = await self.patient_repo.get_by_id(req.patient_id)
        if not patient:
            patient = {
                "id": req.patient_id,
                "name": "Patient",
                "phone": "+91 98765 43210",
                "masked_phone": "98XXXXXX10",
                "communication_consent": {
                    "status": "Pending",
                    "channels": []
                }
            }

        patient_name = patient.get("name", "Patient")
        patient_phone = patient.get("phone", "+91 98765 43210")
        masked_phone = patient.get("masked_phone", "98XXXXXX10")
        consent = patient.get("communication_consent", {})
        consent_status = consent.get("status", "Pending")

        is_ready = req.status.strip().title() == "Ready"

        # Build Report Document
        report_doc = {
            "id": report_id,
            "patient_id": req.patient_id,
            "patient_name": patient_name,
            "patient_phone": patient_phone,
            "masked_phone": masked_phone,
            "report_type": req.report_type,
            "uploaded_date": upload_date,
            "uploaded_time": upload_time,
            "status": "Ready" if is_ready else "Processing",
            "file_name": req.file_name or f"{patient_name.replace(' ', '_')}_{req.report_type.replace(' ', '_')}.pdf",
            "file_size": req.file_size or "1.8 MB",
            "notes": req.notes or f"{req.report_type} diagnostic test completed at clinic laboratory.",
            "communication_consent": {
                "status": consent_status,
                "channels": consent.get("channels", ["SMS"]),
                "verified": consent_status.strip().title() == "Consented"
            },
            "created_at": now_iso,
            "updated_at": now_iso
        }

        created = await self.repo.create(report_doc)
        return created

    async def update_status(self, report_id: str, req: DiagnosticReportStatusUpdate) -> Optional[dict]:
        """
        Updates report status (Ready / Processing).
        """
        report = await self.repo.get_by_id(report_id)
        if not report:
            return None

        new_status = "Ready" if req.status.strip().title() == "Ready" else "Processing"
        updates: Dict[str, Any] = {"status": new_status}
        if req.notes:
            updates["notes"] = req.notes

        await self.repo.update(report_id, updates)
        return await self.repo.get_by_id(report_id)
