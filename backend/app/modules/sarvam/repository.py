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
        Also syncs the outcome into the diagnostic_reports and call_logs collections.
        """
        attempt_id = (
            webhook_data.get("attempt_id") or 
            webhook_data.get("id") or 
            webhook_data.get("call_id") or 
            webhook_data.get("interaction_id") or 
            f"SARVAM-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        )

        status = webhook_data.get("status", "completed").upper()
        duration = webhook_data.get("duration") or webhook_data.get("duration_in_seconds") or 0.0
        failure_reason = webhook_data.get("failure_reason")
        agent_vars = webhook_data.get("final_agent_variables") or webhook_data.get("agent_variables") or {}
        transcript = webhook_data.get("interaction_transcript") or webhook_data.get("original_transcript") or webhook_data.get("transcript")
        interaction_id = webhook_data.get("interaction_id") or attempt_id
        metadata = (webhook_data.get("webhook_config") or {}).get("metadata") or {}

        report_id = metadata.get("report_id") or webhook_data.get("report_id")
        patient_id = metadata.get("patient_id") or webhook_data.get("patient_id")

        now_iso = datetime.utcnow().isoformat() + "Z"
        now_str = datetime.utcnow().strftime("%I:%M %p")

        # Extracted variables from Priya call
        patient_confirmed = agent_vars.get("patient_confirmed")
        patient_response = agent_vars.get("patient_response") or "Patient acknowledged Priya AI call."
        preferred_collection_date = agent_vars.get("collection_date")
        callback_requested = agent_vars.get("callback_requested", False)
        call_outcome = agent_vars.get("call_outcome") or status
        call_summary = agent_vars.get("call_summary") or f"Priya AI call completed. Status: {status}."
        call_summary = call_summary.replace("Apex Care Clinic", "Apollo Clinic Indiranagar")

        # Parse transcript dialogue
        dialogue = []
        if isinstance(transcript, list):
            for turn in transcript:
                is_agent = turn.get("role") in ["agent", "assistant"]
                spk = "Priya" if is_agent else (agent_vars.get("patient_name") or "Caller")
                txt = turn.get("text") or turn.get("content") or ""
                clean_text = txt.replace("Apex Care Clinic", "Apollo Clinic Indiranagar").replace("एपेक्स केयर क्लिनिक", "अपोलो क्लिनिक इंदिरा नगर")
                dialogue.append({
                    "speaker": spk,
                    "text": clean_text,
                    "time": now_str
                })

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
            "transcript_dialogue": dialogue,
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
            direction = (webhook_data.get("channel_direction") or webhook_data.get("direction") or ("OUTBOUND" if report_id else "INBOUND")).upper()
            caller_phone = webhook_data.get("user_contact") or webhook_data.get("from_number") or webhook_data.get("phone") or "+91 80642 69783"
            
            clean_cid = f"SARVAM-{attempt_id.replace(':', '').replace('-', '')[-10:].upper()}"
            await self.logs_col.update_one(
                {"call_id": clean_cid},
                {"$set": {
                    "call_id": clean_cid,
                    "sarvam_interaction_id": interaction_id,
                    "caller_name": agent_vars.get("patient_name") or ("Patient" if direction == "OUTBOUND" else "Caller (Mobile)"),
                    "caller_phone": caller_phone,
                    "call_direction": direction,
                    "call_purpose": agent_vars.get("call_purpose") or ("Diagnostic Report Delivery" if report_id else "Inbound Mobile Phone Call"),
                    "doctor_name": agent_vars.get("doctor_name") or "Apollo Clinic Indiranagar",
                    "specialty": "OPD Consultation Desk",
                    "timestamp": f"Today, {now_str}",
                    "duration": f"{int(duration)}s" if duration else "0s",
                    "language": webhook_data.get("language_name") or "English / Hindi",
                    "outcome": call_outcome,
                    "summary": call_summary,
                    "sentiment": "Positive" if status == "COMPLETED" else "Neutral",
                    "transcript_dialogue": dialogue,
                    "sarvam_attempt_id": attempt_id,
                    "created_at": now_iso,
                    "updated_at": now_iso
                }},
                upsert=True
            )
        except Exception as log_err:
            logger.warning(f"Failed to append to call_logs: {log_err}")

        return await self.get_by_attempt_id(attempt_id)

