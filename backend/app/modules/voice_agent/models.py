from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class VoiceUtteranceRequest(BaseModel):
    message: str = Field(..., example="I want to book an appointment with Dr. Sharma tomorrow")
    language: str = Field(default="English", example="English | Hindi | Telugu")
    clinic_code: Optional[str] = "CARE-IND-01"
    patient_phone: Optional[str] = "+91 98765 43210"

class VoiceUtteranceResponse(BaseModel):
    agent_name: str = "Priya"
    language: str
    spoken_text: str
    intent: str
    safety_guardrail_triggered: bool = False
    requires_human_handoff: bool = False
    verified_data: Optional[Dict[str, Any]] = None
    bolna_trace_id: str
