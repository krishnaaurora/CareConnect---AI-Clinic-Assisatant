from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class VisitType(str, Enum):
    IN_PERSON = "In-Person Consultation"
    FOLLOW_UP = "Follow-Up Review"
    ROUTINE = "Routine Checkup"
    VIDEO = "Video Consultation"

class AppointmentStatus(str, Enum):
    VERIFIED_CONFIRMED = "VERIFIED_CONFIRMED"
    PENDING_STAFF_FOLLOWUP = "PENDING_STAFF_FOLLOWUP"
    ROUTED_TO_HUMAN_DESK = "ROUTED_TO_HUMAN_DESK"

class AppointmentCreateRequest(BaseModel):
    patient_name: str = Field(..., min_length=2, example="Rahul Verma")
    phone: str = Field(..., min_length=10, example="+91 98765 43210")
    clinic_code: str = Field(..., example="CARE-IND-01")
    doctor_name: str = Field(..., example="Dr. Rajesh Sharma")
    preferred_date: str = Field(..., example="2026-10-28")
    preferred_time: str = Field(..., example="11:00 AM")
    visit_type: VisitType = VisitType.IN_PERSON
    notes: Optional[str] = Field(None, example="Routine blood pressure and general review")
    booking_source: str = Field(default="Web Landing Page", example="Bolna AI Voice / Web")

class SlotVerificationRequest(BaseModel):
    clinic_code: str
    doctor_name: str
    date: str
    time_slot: str

class AppointmentRecord(BaseModel):
    reference_id: str
    patient_name: str
    phone: str
    clinic_code: str
    clinic_name: str
    doctor_name: str
    specialty: str
    preferred_date: str
    preferred_time: str
    visit_type: str
    notes: Optional[str] = None
    status: AppointmentStatus
    verification_message: str
    created_at: str
    staff_followup_required: bool = False
    source: str
