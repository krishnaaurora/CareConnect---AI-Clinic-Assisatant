import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
from app.core.database import get_database

logger = logging.getLogger("careconnect.sarvam")

class SarvamCallRepository:
    @property
    def calls_col(self):
        return get_database()["voice_calls"]

    @property
    def reports_col(self):
        return get_database()["diagnostic_reports"]

    @property
    def logs_col(self):
        return get_database()["call_logs"]

    async def create_call_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Insert a newly initiated call record."""
        now_iso = datetime.utcnow().isoformat() + "Z"
        record.setdefault("created_at", now_iso)
        record.setdefault("updated_at", now_iso)
        await self.calls_col.insert_one(record)
        clean = dict(record)
        clean.pop("_id", None)
        return clean

    async def get_by_attempt_id(self, attempt_id: str) -> Optional[Dict[str, Any]]:
        return await self.calls_col.find_one({"attempt_id": attempt_id}, {"_id": 0})

    async def get_recent_call_for_report(self, report_id: str) -> Optional[Dict[str, Any]]:
        """Get the most recent call for a given report to prevent duplicate calls."""
        cursor = self.calls_col.find({"report_id": report_id}, {"_id": 0}).sort("created_at", -1).limit(1)
        calls = await cursor.to_list(length=1)
        return calls[0] if calls else None

    async def list_calls(self, limit: int = 50) -> List[Dict[str, Any]]:
        cursor = self.calls_col.find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
        return await cursor.to_list(length=limit)

    async def update_call_from_webhook(self, webhook_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Idempotent update of voice call record from Sarvam webhook payload.
        Also syncs the outcome into the diagnostic_reports collection.
        """
        attempt_id = webhook_data.get("attempt_id") or webhook_data.get("id")
        if not attempt_id:
            logger.warning("Webhook received without attempt_id")
            return None

        status = webhook_data.get("status", "completed").upper()
        duration = webhook_data.get("duration", 0.0)
        failure_reason = webhook_data.get("failure_reason")
        agent_vars = webhook_data.get("final_agent_variables") or {}
        transcript = webhook_data.get("interaction_transcript")
        interaction_id = webhook_data.get("interaction_id")
        metadata = (webhook_data.get("webhook_config") or {}).get("metadata") or {}

        report_id = metadata.get("report_id")
        patient_id = metadata.get("patient_id")

        now_iso = datetime.utcnow().isoformat() + "Z"
        now_str = datetime.utcnow().strftime("%I:%M %p")

        # Extracted variables from Priya call
        patient_confirmed = agent_vars.get("patient_confirmed")
        patient_response = agent_vars.get("patient_response") or "Patient acknowledged report notification."
        preferred_collection_date = agent_vars.get("collection_date")
        callback_requested = agent_vars.get("callback_requested", False)
        call_outcome = agent_vars.get("call_outcome") or f"Call {status.lower()}"
        call_summary = agent_vars.get("call_summary") or f"Priya AI notified patient of ready diagnostic report. Status: {status}."

        update_fields = {
            "status": status,
            "duration": duration,
            "failure_reason": failure_reason,
            "interaction_id": interaction_id,
            "final_agent_variables": agent_vars,
            "patient_confirmed": patient_confirmed,
            "patient_response": patient_response,
            "preferred_collection_date": preferred_collection_date,
            "callback_requested": callback_requested,
            "call_outcome": call_outcome,
            "call_summary": call_summary,
            "interaction_transcript": transcript,
            "updated_at": now_iso
        }

        # Idempotent upsert in voice_calls
        await self.calls_col.update_one(
            {"attempt_id": attempt_id},
            {
                "$set": update_fields,
                "$setOnInsert": {
                    "attempt_id": attempt_id,
                    "report_id": report_id,
                    "patient_id": patient_id,
                    "created_at": now_iso
                }
            },
            upsert=True
        )

        # Update diagnostic_reports if report_id is known
        if report_id:
            sarvam_summary = {
                "triggered": True,
                "attempt_id": attempt_id,
                "status": status,
                "duration": f"{int(duration)}s" if duration else "0s",
                "patient_response": patient_response,
                "preferred_collection_date": preferred_collection_date,
                "callback_requested": callback_requested,
                "call_summary": call_summary,
                "updated_at": now_iso
            }
            await self.reports_col.update_one(
                {"id": report_id},
                {"$set": {"sarvam_call": sarvam_summary, "updated_at": now_iso}}
            )

        # Log into general call_logs for unified dashboard activity feed
        try:
            await self.logs_col.insert_one({
                "call_id": f"SARVAM-{attempt_id[:8].upper() if len(attempt_id) >= 8 else attempt_id}",
                "caller_name": agent_vars.get("patient_name") or "Patient",
                "caller_phone": "Verified Patient",
                "timestamp": f"Today, {now_str}",
                "duration": f"{int(duration)}s" if duration else "0s",
                "language": "English / Hindi / Telugu",
                "outcome": "REPORT_READY_NOTIFIED" if status == "COMPLETED" else f"OUTBOUND_{status}",
                "summary": call_summary,
                "sentiment": "Satisfied" if status == "COMPLETED" else "Neutral",
                "sarvam_attempt_id": attempt_id,
                "created_at": now_iso
            })
        except Exception as log_err:
            logger.warning(f"Failed to append to call_logs: {log_err}")

        return await self.get_by_attempt_id(attempt_id)

