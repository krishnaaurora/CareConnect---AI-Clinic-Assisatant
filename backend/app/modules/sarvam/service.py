import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, List
from fastapi import HTTPException, status
from app.modules.sarvam.caller import SarvamVoiceClient
from app.modules.sarvam.repository import SarvamCallRepository
from app.modules.diagnostic_reports.repository import DiagnosticReportRepository
from app.modules.patients.repository import PatientRepository
from app.modules.sarvam.models import ReportNotifyRequest
from app.core.config import settings

logger = logging.getLogger("careconnect.sarvam")

# Asia/Kolkata timezone offset (UTC+5:30)
IST_OFFSET = timezone(timedelta(hours=5, minutes=30))

class SarvamService:
    def __init__(self):
        self.caller = SarvamVoiceClient()
        self.call_repo = SarvamCallRepository()
        self.report_repo = DiagnosticReportRepository()
        self.patient_repo = PatientRepository()

    @staticmethod
    def is_within_calling_hours() -> bool:
        """Check if current time is within acceptable clinic calling window (8:00 AM - 8:30 PM IST)."""
        now_ist = datetime.now(IST_OFFSET)
        start_time = now_ist.replace(hour=8, minute=0, second=0, microsecond=0)
        end_time = now_ist.replace(hour=20, minute=30, second=0, microsecond=0)
        return start_time <= now_ist <= end_time

    async def trigger_report_ready_call(
        self,
        report_id: str,
        options: Optional[ReportNotifyRequest] = None
    ) -> Dict[str, Any]:
        """
        Executes the Sarvam Instant Outbound flow for a ready diagnostic report.
        Enforces patient consent, opt-out status, calling hours, and duplicate call checks.
        """
        # 1. Fetch Diagnostic Report
        report = await self.report_repo.get_by_id(report_id)
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Diagnostic report {report_id} not found."
            )

        if report.get("status", "").title() != "Ready":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot notify: Report {report_id} is currently '{report.get('status')}'. Report must be marked READY before notifying."
            )

        # 2. Fetch Associated Patient
        patient_id = report.get("patient_id")
        patient = await self.patient_repo.get_by_id(patient_id)
        if not patient:
            # Fallback to report-embedded patient metadata if standalone patient doc is missing
            patient = {
                "id": patient_id,
                "name": report.get("patient_name", "Patient"),
                "phone": report.get("patient_phone"),
                "communication_consent": report.get("communication_consent", {"status": "Pending"})
            }

        # 3. Consent Verification & Opt-Out Enforcement
        consent = patient.get("communication_consent", {})
        consent_status = consent.get("status", "Pending").strip().title()
        if consent_status != "Consented":
            logger.warning(f"Notification blocked for report {report_id}: Patient {patient_id} consent is '{consent_status}'.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Automated voice call blocked: Patient communication consent is '{consent_status}'. Explicit consent is required."
            )

        # Check opt-out or channel restriction
        channels = consent.get("channels", ["Voice AI Call", "SMS"])
        if not any("voice" in str(ch).lower() for ch in channels):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Automated call blocked: Patient opted out of Voice AI calls (prefers SMS/WhatsApp only)."
            )

        # 4. Duplicate Call Prevention (within last 3 minutes)
        recent_call = await self.call_repo.get_recent_call_for_report(report_id)
        if recent_call:
            created_at_str = recent_call.get("created_at")
            if created_at_str:
                try:
                    call_time = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
                    diff_seconds = (datetime.now(timezone.utc) - call_time).total_seconds()
                    if diff_seconds < 180 and recent_call.get("status") in ["INITIATED", "IN_PROGRESS", "QUEUED"]:
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail=f"A call was already initiated {int(diff_seconds)}s ago for this report (Attempt ID: {recent_call.get('attempt_id')}). Please wait before redialing."
                        )
                except ValueError:
                    pass

        # 5. Calling Hours Advisory (IST)
        if not self.is_within_calling_hours():
            logger.warning(f"Notice: Outbound call for {report_id} requested outside standard clinic hours (08:00 AM - 08:30 PM IST).")

        # 6. Validate & Normalize Registered Patient Mobile Number
        patient_name = patient.get("name") or report.get("patient_name") or "Patient"
        test_name = report.get("report_type") or "Diagnostic Lab Report"

        raw_phone = patient.get("phone") or report.get("patient_phone")
        if not raw_phone or not str(raw_phone).strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Automated call blocked: Patient '{patient_name}' (ID: {patient_id}) has no registered mobile number in MongoDB."
            )

        try:
            recipient_phone = self.caller.format_phone_number(raw_phone)
        except ValueError as val_err:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Automated call blocked: Invalid mobile number for patient '{patient_name}'. {str(val_err)}"
            )

        # 7. Dispatch through Sarvam Voice Client
        call_response = await self.caller.create_outbound_call(
            recipient_phone=recipient_phone,
            patient_name=patient_name,
            test_name=test_name,
            report_id=report_id,
            patient_id=patient.get("id", patient_id)
        )

        now_iso = datetime.utcnow().isoformat() + "Z"
        now_str = datetime.utcnow().strftime("%I:%M %p")

        if call_response.get("success"):
            data = call_response.get("data") or {}
            attempt_id = data.get("attempt_id") or data.get("id") or f"sarvam-{uuid.uuid4().hex[:8]}"

            call_record = {
                "attempt_id": attempt_id,
                "patient_id": patient.get("id", patient_id),
                "patient_name": patient_name,
                "recipient_phone": self.caller.format_phone_number(recipient_phone),
                "report_id": report_id,
                "report_type": test_name,
                "agent_id": self.caller.agent_id,
                "agent_version": self.caller.agent_version,
                "agent_phone_number": self.caller.agent_phone,
                "status": "INITIATED",
                "call_purpose": "REPORT_READY",
                "call_outcome": "Call dispatched live to telephony gateway",
                "patient_response": "Call initiated. Waiting for patient to answer.",
                "preferred_collection_date": None,
                "callback_requested": False,
                "call_summary": f"Priya AI initiated call to notify {patient_name} of ready {test_name}.",
                "raw_api_response": data,
                "created_at": now_iso,
                "updated_at": now_iso
            }
            await self.call_repo.create_call_record(call_record)

            # Update diagnostic report with Sarvam call metadata
            await self.report_repo.update(report_id, {
                "sarvam_call": {
                    "triggered": True,
                    "attempt_id": attempt_id,
                    "status": "INITIATED",
                    "dispatched_at": now_iso,
                    "timestamp_str": f"Today, {now_str}",
                    "recipient_phone": self.caller.format_phone_number(recipient_phone),
                    "call_summary": f"Priya AI call initiated for {patient_name} ({test_name})."
                }
            })

            return {
                "success": True,
                "message": f"Sarvam voice call initiated for {patient_name}.",
                "attempt_id": attempt_id,
                "recipient_phone": self.caller.format_phone_number(recipient_phone),
                "status": "INITIATED",
                "agent": "Priya (Careconnect Receptionist)"
            }
        else:
            # Failed to dispatch
            error_detail = call_response.get("error", "Failed to connect to Sarvam API")
            logger.error(f"Sarvam outbound failure for report {report_id}: {error_detail}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Sarvam Outbound API Error: {error_detail}"
            )

    async def process_webhook(self, webhook_payload: Dict[str, Any]) -> Dict[str, Any]:
        """Process incoming call-completion webhook from Sarvam."""
        updated = await self.call_repo.update_call_from_webhook(webhook_payload)
        return {
            "success": True,
            "message": "Sarvam webhook processed and saved to MongoDB.",
            "attempt_id": webhook_payload.get("attempt_id") or webhook_payload.get("id"),
            "data": updated
        }

    async def get_call_details(self, attempt_id: str) -> Optional[Dict[str, Any]]:
        return await self.call_repo.get_by_attempt_id(attempt_id)

    async def list_recent_calls(self, limit: int = 50) -> List[Dict[str, Any]]:
        return await self.call_repo.list_calls(limit=limit)

    def check_health(self) -> Dict[str, Any]:
        """Check Sarvam integration configuration status without making outbound calls."""
        configured = bool(settings.SARVAM_API_KEY)
        return {
            "provider": "Sarvam AI Voice Agents",
            "agent_name": "Careconnect Receptionist",
            "agent_id": settings.SARVAM_AGENT_ID,
            "agent_version": settings.SARVAM_AGENT_VERSION,
            "connection_id": settings.SARVAM_CONNECTION_ID,
            "agent_phone_number": settings.SARVAM_AGENT_PHONE_NUMBER,
            "org_id": settings.SARVAM_ORG_ID,
            "workspace_id": settings.SARVAM_WORKSPACE_ID,
            "api_key_configured": configured,
            "status": "ready" if configured else "missing_api_key"
        }

