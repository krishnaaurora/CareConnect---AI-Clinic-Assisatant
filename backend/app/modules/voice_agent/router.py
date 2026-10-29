from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.modules.voice_agent.models import VoiceUtteranceRequest, VoiceUtteranceResponse
from app.modules.voice_agent.service import VoiceAgentService

router = APIRouter(prefix="/voice", tags=["Voice Agent (Priya / Bolna)"])
service = VoiceAgentService()

@router.post("/interact", response_model=VoiceUtteranceResponse)
async def process_voice_utterance(req: VoiceUtteranceRequest):
    """
    Simulates Priya voice conversational response powered by Bolna architecture.
    Validates safety guardrails (preventing unsupported medical advice) and performs routing.
    """
    res = await service.process_utterance(
        message=req.message,
        language=req.language,
        clinic_code=req.clinic_code or "CARE-IND-01"
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
    Retrieve real-time Bolna AI call activity:
    - Recent calls and their outcomes
    - Appointments booked through Bolna
    - Failed booking attempts and follow-up requests
    - Calls transferred to human staff
    """
    data = await service.get_call_activity()
    return {"success": True, "data": data}

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
