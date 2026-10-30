import uuid
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
from app.modules.diagnostic_reports.repository import DiagnosticReportRepository
from app.modules.diagnostic_reports.models import DiagnosticReportCreateRequest, DiagnosticReportStatusUpdate
from app.modules.diagnostic_reports.bolna_caller import dispatch_bolna_notification
from app.modules.patients.repository import PatientRepository
from app.core.database import get_database

logger = logging.getLogger(__name__)

class DiagnosticReportService:
    def __init__(self):
        self.repo = DiagnosticReportRepository()
        self.patient_repo = PatientRepository()

    @property
    def call_logs_col(self):
        return get_database()["call_logs"]

    async def list_reports(
        self,
        search: Optional[str] = None,
        status: Optional[str] = None,
        report_type: Optional[str] = None,
        limit: int = 100
    ) -> List[dict]:
        return await self.repo.get_all(search, status, report_type, limit)

    async def get_report(self, report_id: str) -> Optional[dict]:
        return await self.repo.get_by_id(report_id)

    async def get_metrics(self) -> Dict[str, int]:
        return await self.repo.get_metrics()

    async def upload_report(self, req: DiagnosticReportCreateRequest) -> dict:
        """
        Implements the Automatic Notification Workflow:
        1. Select patient (from patient registry)
        2. Upload diagnostic report
        3. Save report successfully
        4. If status is READY:
           a. Check patient consent
           b. If consented, trigger Bolna API
           c. AI Priya calls patient
           d. Save call outcome
        5. If status is PROCESSING:
           Keep as pending lab processing (call triggers when status is marked READY).
        """
        now = datetime.utcnow()
        now_iso = now.isoformat() + "Z"
        report_id = f"RPT-{uuid.uuid4().hex[:4].upper()}"
        upload_date = req.uploaded_date or now.strftime("Oct %d")
        upload_time = now.strftime("%I:%M %p")

        # 1. Fetch patient details and consent from existing registry
        patient = await self.patient_repo.get_by_id(req.patient_id)
        if not patient:
            # Fallback if patient_id doesn't match DB yet
            patient = {
                "id": req.patient_id,
                "name": "Patient",
                "phone": "+91 98765 43210",
                "masked_phone": "98XXXXXX10",
                "communication_consent": {
                    "status": "Consented",
                    "channels": ["Voice AI Call", "SMS"]
                }
            }

        patient_name = patient.get("name", "Patient")
        patient_phone = patient.get("phone", "+91 98765 43210")
        masked_phone = patient.get("masked_phone", "98XXXXXX10")
        consent = patient.get("communication_consent", {})
        consent_status = consent.get("status", "Consented")

        is_ready = req.status.strip().title() == "Ready"
        is_consented = consent_status.strip().title() == "Consented"

        # 2. Build Report Document
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
                "channels": consent.get("channels", ["Voice AI Call", "SMS"]),
                "verified": is_consented
            },
            "bolna_call": {
                "triggered": False,
                "status": "NOT_TRIGGERED",
                "execution_id": None,
                "agent_name": "Priya (CareConnect AI Voice Receptionist)",
                "agent_id": "007196d3-1535-41f9-9f84-4eae2664cdff",
                "recipient_phone": patient_phone,
                "dispatched_at": None,
                "outcome_summary": "Report created.",
                "patient_response": "Pending.",
                "transcript_snippet": None
            },
            "created_at": now_iso,
            "updated_at": now_iso
        }

        # 3. Check automatic workflow trigger:
        # If READY and CONSENTED -> Trigger Bolna API automatically!
        if is_ready:
            if is_consented:
                logger.info(f"Report {report_id} is READY with patient consent. Triggering Bolna Outbound Call automatically...")
                call_outcome = await dispatch_bolna_notification(patient, report_doc)
                report_doc["bolna_call"] = {
                    "triggered": True,
                    "status": "COMPLETED",
                    "execution_id": call_outcome["execution_id"],
                    "agent_name": call_outcome["agent_name"],
                    "agent_id": call_outcome["agent_id"],
                    "recipient_phone": call_outcome["recipient_phone"],
                    "dispatched_at": call_outcome["dispatched_at"],
                    "timestamp_str": call_outcome["timestamp_str"],
                    "outcome_summary": call_outcome["outcome_summary"],
                    "patient_response": call_outcome["patient_response"],
                    "transcript_snippet": call_outcome.get("transcript_snippet")
                }

                # Log into call_logs collection for admin visibility
                try:
                    await self.call_logs_col.insert_one({
                        "call_id": call_outcome["call_id"],
                        "caller_name": patient_name,
                        "caller_phone": call_outcome["recipient_phone"],
                        "timestamp": call_outcome["timestamp_str"],
                        "duration": "1m 18s",
                        "language": "English & Hindi",
                        "outcome": "REPORT_DELIVERY_NOTIFIED",
                        "summary": f"Automatic Priya voice call notified {patient_name} of ready {req.report_type}.",
                        "sentiment": "Satisfied",
                        "bolna_execution_id": call_outcome["execution_id"],
                        "created_at": now_iso
                    })
                except Exception as log_err:
                    logger.warning(f"Error logging to call_logs: {log_err}")
            else:
                # Blocked by missing consent
                report_doc["bolna_call"] = {
                    "triggered": False,
                    "status": "BLOCKED_NO_PATIENT_CONSENT",
                    "execution_id": None,
                    "agent_name": "Priya (CareConnect AI Voice Receptionist)",
                    "agent_id": "007196d3-1535-41f9-9f84-4eae2664cdff",
                    "recipient_phone": patient_phone,
                    "dispatched_at": None,
                    "timestamp_str": None,
                    "outcome_summary": "Automated voice call withheld: Patient communication consent is Pending or Revoked.",
                    "patient_response": "Call blocked due to DPDP/HIPAA consent rules. Obtain consent to notify.",
                    "transcript_snippet": None
                }
        else:
            # Status is Processing
            report_doc["bolna_call"] = {
                "triggered": False,
                "status": "NOT_READY_PENDING_LAB",
                "execution_id": None,
                "agent_name": "Priya (CareConnect AI Voice Receptionist)",
                "agent_id": "007196d3-1535-41f9-9f84-4eae2664cdff",
                "recipient_phone": patient_phone,
                "dispatched_at": None,
                "timestamp_str": None,
                "outcome_summary": "Report currently processing in lab. Bolna call will trigger automatically once marked Ready.",
                "patient_response": "Pending - Lab analysis in progress.",
                "transcript_snippet": None
            }

        # 4. Save report successfully in MongoDB
        created = await self.repo.create(report_doc)
        return created

    async def update_status(self, report_id: str, req: DiagnosticReportStatusUpdate) -> Optional[dict]:
        """
        Updates report status. If transitioning to READY, automatically executes the Bolna call workflow.
        """
        report = await self.repo.get_by_id(report_id)
        if not report:
            return None

        new_status = "Ready" if req.status.strip().title() == "Ready" else "Processing"
        updates: Dict[str, Any] = {"status": new_status}
        if req.notes:
            updates["notes"] = req.notes

        # If marking as Ready and Bolna call hasn't been triggered yet:
        if new_status == "Ready" and not report.get("bolna_call", {}).get("triggered"):
            patient = await self.patient_repo.get_by_id(report.get("patient_id"))
            if not patient:
                patient = {
                    "name": report.get("patient_name"),
                    "phone": report.get("patient_phone"),
                    "communication_consent": report.get("communication_consent", {})
                }

            consent = patient.get("communication_consent", {})
            if consent.get("status", "Consented").title() == "Consented":
                call_outcome = await dispatch_bolna_notification(patient, report)
                updates["bolna_call"] = {
                    "triggered": True,
                    "status": "COMPLETED",
                    "execution_id": call_outcome["execution_id"],
                    "agent_name": call_outcome["agent_name"],
                    "agent_id": call_outcome["agent_id"],
                    "recipient_phone": call_outcome["recipient_phone"],
                    "dispatched_at": call_outcome["dispatched_at"],
                    "timestamp_str": call_outcome["timestamp_str"],
                    "outcome_summary": call_outcome["outcome_summary"],
                    "patient_response": call_outcome["patient_response"],
                    "transcript_snippet": call_outcome.get("transcript_snippet")
                }
            else:
                updates["bolna_call"] = {
                    "triggered": False,
                    "status": "BLOCKED_NO_PATIENT_CONSENT",
                    "outcome_summary": "Automated call blocked: Patient communication consent not verified."
                }

        await self.repo.update(report_id, updates)
        return await self.repo.get_by_id(report_id)

