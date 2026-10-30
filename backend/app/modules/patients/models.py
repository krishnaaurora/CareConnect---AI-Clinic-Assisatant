from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class CommunicationConsent(BaseModel):
    status: str = "Consented"  # Consented, Pending, Revoked
    channels: List[str] = Field(default_factory=lambda: ["Voice AI Call", "SMS", "WhatsApp"])
    consented_at: Optional[str] = None
    recorded_by: Optional[str] = "Front Desk Reception"
    consent_notes: Optional[str] = None

class PatientCreateRequest(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = "Unspecified"
    report_status: str = "Processing"  # Ready, Processing
    report_type: Optional[str] = "General Lab Report"
    consent_status: Optional[str] = "Consented"
    consent_channels: Optional[List[str]] = Field(default_factory=lambda: ["Voice AI Call", "SMS", "WhatsApp"])
    consent_notes: Optional[str] = "Explicit communication consent recorded during intake."
    clinical_notes: Optional[str] = None

class PatientUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    report_status: Optional[str] = None
    report_type: Optional[str] = None
    clinical_notes: Optional[str] = None

class ConsentRecordRequest(BaseModel):
    status: str  # Consented, Pending, Revoked
    channels: Optional[List[str]] = Field(default_factory=lambda: ["Voice AI Call", "SMS", "WhatsApp"])
    recorded_by: Optional[str] = "Front Desk Reception"
    source: Optional[str] = "Front Desk Verbal"
    consent_notes: Optional[str] = None

class PatientNotifyRequest(BaseModel):
    channel: Optional[str] = "Voice AI Call & SMS"
    custom_message: Optional[str] = None

