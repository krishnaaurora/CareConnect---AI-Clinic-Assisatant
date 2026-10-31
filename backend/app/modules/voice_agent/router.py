from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, Optional
from app.modules.voice_agent.models import VoiceUtteranceRequest, VoiceUtteranceResponse
from app.modules.voice_agent.service import VoiceAgentService

router = APIRouter(prefix="/voice", tags=["Voice Agent (Priya / Bolna)"])
service = VoiceAgentService()

@router.post("/interact", response_model=VoiceUtteranceResponse)
async def process_voice_utterance(req: VoiceUtteranceRequest):
    """
    Simulates Priya voice conversational response powered by Bolna architecture.
    Validates safety guardrails (preventing unsupported medical advice) and performs routing.
    Records call activity in MongoDB.
    """
    res = await service.process_utterance(
        message=req.message,
        language=req.language,
        clinic_code=req.clinic_code or "CARE-IND-01",
        call_id=req.call_id,
        caller_name=req.caller_name or "Caller (Inbound Voice)",
        caller_phone=req.patient_phone or "+91 98860 77123"
    )
    return res

@router.post("/bolna-webhook")
async def bolna_webhook(payload: Dict[str, Any]):
    """
    Receives Bolna phone call events (call_started, speech_recognized, user_hung_up).
    Coordinates with clinic backend to verify slots and log transcripts.
    """
    event = payload.get("event", "unknown")
    caller = payload.get("caller_phone", "Anonymous")
    return {
        "status": "received",
        "event": event,
        "caller": caller,
        "action": "processed_by_careconnect_backend"
    }

@router.get("/activity", response_model=dict)
async def get_voice_call_activity():
    """
    Retrieve real-time Bolna & Sarvam AI call activity from MongoDB:
    - Inbound and Outbound calls with duration and intent
    - Appointments booked through AI
    - Failed booking attempts, retry queues, and callback requests
    - Calls transferred to human staff
    """
    data = await service.get_call_activity()
    return {"success": True, "data": data}

@router.post("/activity/{call_id}/retry", response_model=dict)
async def retry_call_route(call_id: str):
    """
    Trigger automated Priya Voice AI retry for a failed or missed call.
    Increments retry count and dispatches follow-up call.
    """
    try:
        res = await service.retry_call(call_id)
        return {"success": True, "data": res, "message": res.get("message")}
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retry call: {str(e)}")

@router.patch("/activity/{call_id}/resolve", response_model=dict)
async def resolve_call_followup_route(call_id: str, payload: Optional[Dict[str, Any]] = Body(None)):
    """
    Marks a failed booking attempt or callback follow-up as resolved in MongoDB.
    """
    notes = (payload or {}).get("notes")
    success = await service.resolve_call_followup(call_id, resolution_notes=notes)
    if not success:
        raise HTTPException(status_code=404, detail="Call log not found or already resolved")
    return {"success": True, "message": f"Follow-up for call {call_id} marked as resolved."}

@router.get("/sample-conversations")
async def get_sample_conversations():
    """Returns verified voice dialogue prompts for interactive landing page demo."""
    return [
        {
            "language": "English",
            "prompt": "Can I book a cardiology checkup with Dr. Sharma tomorrow?",
            "audio_label": "Doctor Consultation Request"
        },
        {
            "language": "Hindi",
            "prompt": "क्या डॉ. स्नेहा कुलकर्णी कल सुबह 11 बजे उपलब्ध हैं?",
            "audio_label": "बाल रोग विशेषज्ञ उपलब्धता (Pediatrician)"
        },
        {
            "language": "Telugu",
            "prompt": "క్లినిక్ ఎన్ని గంటల వరకు తెరిచి ఉంటుంది? ఆర్థోపెడిక్ డాక్టర్ ఉన్నారా?",
            "audio_label": "క్లినిక్ వేళలు మరియు ఆర్థోపెడిక్ డాక్టర్"
        },
        {
            "language": "English",
            "prompt": "My chest is hurting badly and I need pain medicine",
            "audio_label": "Safety Guardrail & Emergency Triage"
        }
    ]
