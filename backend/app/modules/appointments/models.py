from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class VisitType(str, Enum):
    IN_PERSON = "In-Person Consultation"
    FOLLOW_UP = "Follow-Up Review"
    ROUTINE = "Routine Checkup"
    DIAGNOSTIC = "Diagnostic Review"
    SECOND_OPINION = "Second Opinion"
    VIDEO = "Video Consultation"

class AppointmentStatus(str, Enum):
    VERIFIED_CONFIRMED = "VERIFIED_CONFIRMED"
    PENDING_STAFF_FOLLOWUP = "PENDING_STAFF_FOLLOWUP"
    ROUTED_TO_HUMAN_DESK = "ROUTED_TO_HUMAN_DESK"
    IN_CONSULTATION = "IN_CONSULTATION"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    NO_SHOW = "NO_SHOW"

class AppointmentStatusUpdateRequest(BaseModel):
    status: str
    notes: Optional[str] = None

class AppointmentCreateRequest(BaseModel):
    patient_name: str = Field(..., min_length=2, example="Rahul Verma")
    phone: str = Field(..., min_length=10, example="+91 98765 43210")
    clinic_code: str = Field(default="CARE-IND-01", example="CARE-IND-01")
    doctor_name: str = Field(..., example="Dr. Rajesh Sharma")
    preferred_date: str = Field(..., example="2026-10-31")
    preferred_time: str = Field(..., example="11:00 AM")
    visit_type: Optional[str] = Field(default="In-Person Consultation", example="In-Person Consultation")
    notes: Optional[str] = Field(None, example="Routine blood pressure and general review")
    booking_source: str = Field(default="Clinic Console / Staff", example="Clinic Console / Staff")
    patient_id: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None

class AppointmentRescheduleRequest(BaseModel):
    preferred_date: str
    preferred_time: str
    doctor_name: Optional[str] = None
    reschedule_reason: Optional[str] = None

class AppointmentReminderRequest(BaseModel):
    channel: Optional[str] = "Priya Voice AI & SMS"
    custom_message: Optional[str] = None

class SlotVerificationRequest(BaseModel):
    clinic_code: str = "CARE-IND-01"
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
    status: str
    verification_message: str
    created_at: str
    staff_followup_required: bool = False
    source: str
    reminder_sent: Optional[bool] = False
    reminder_sent_at: Optional[str] = None
