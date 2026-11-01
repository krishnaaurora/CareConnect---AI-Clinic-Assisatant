from pydantic import BaseModel, Field, root_validator
from typing import Optional
import re

class CallbackRequest(BaseModel):
    name: Optional[str] = Field(None, description="Patient full name in English/Latin characters")
    patient_name: Optional[str] = Field(None, description="Alias for name")
    caller_name: Optional[str] = Field(None, description="Alias for name")
    
    phone: Optional[str] = Field(None, description="Contact phone number")
    phone_number: Optional[str] = Field(None, description="Alias for phone")
    caller_phone: Optional[str] = Field(None, description="Alias for phone")
    
    preferred_time: Optional[str] = Field(default="Earliest Available", description="Preferred callback time window")
    preferred_language: Optional[str] = Field(default="English", description="Preferred language for conversation")
    
    callback_reason: Optional[str] = Field(None, description="Reason for requesting callback")
    reason: Optional[str] = Field(None, description="Alias for callback_reason")
    enquiry_topic: Optional[str] = Field(None, description="Topic of enquiry")
    message: Optional[str] = Field(None, description="Message or details")

    @root_validator(pre=True)
    def normalize_fields(cls, values: dict):
        if not isinstance(values, dict):
            return values

        # 1. Resolve Patient Name
        resolved_name = (
            values.get("patient_name") or 
            values.get("name") or 
            values.get("caller_name") or 
            "Valued Patient"
        )
        # Clean Latin / English name
        resolved_name = str(resolved_name).strip()
        # Remove unwanted control characters but preserve Latin letters, accents, spaces, hyphens, dots, apostrophes
        resolved_name = re.sub(r"[^\w\s\.\'\-]", "", resolved_name)
        if not resolved_name or len(resolved_name) < 2:
            resolved_name = "Valued Patient"
        values["name"] = resolved_name
        values["patient_name"] = resolved_name

        # 2. Resolve Phone Number
        resolved_phone = (
            values.get("phone_number") or 
            values.get("phone") or 
            values.get("caller_phone") or 
            ""
        )
        resolved_phone = str(resolved_phone).strip()
        # Extract digits
        digits = re.sub(r"\D", "", resolved_phone)
        if len(digits) >= 10:
            clean_10 = digits[-10:]
            formatted_phone = f"+91 {clean_10[:5]} {clean_10[5:]}"
        else:
            formatted_phone = resolved_phone if resolved_phone else "+91 98765 43210"
        values["phone"] = formatted_phone
        values["phone_number"] = formatted_phone

        # 3. Resolve Reason / Topic
        resolved_reason = (
            values.get("callback_reason") or 
            values.get("reason") or 
            values.get("enquiry_topic") or 
            values.get("message") or 
            "General Inquiry / Doctor Consultation"
        )
        values["callback_reason"] = str(resolved_reason).strip()
        values["enquiry_topic"] = str(resolved_reason).strip()

        # 4. Resolve Preferred Time
        time_val = values.get("preferred_time")
        if not time_val or not str(time_val).strip() or str(time_val).lower() in ["none", "null", "string", ""]:
            values["preferred_time"] = "Earliest Available"
        else:
            values["preferred_time"] = str(time_val).strip()

        # 5. Resolve Preferred Language
        lang_val = values.get("preferred_language")
        if not lang_val or not str(lang_val).strip() or str(lang_val).lower() in ["none", "null", "string", ""]:
            values["preferred_language"] = "English"
        else:
            values["preferred_language"] = str(lang_val).strip()

        return values

class CallbackRecord(BaseModel):
    id: str
    callback_id: str
    name: str
    patient_name: str
    phone: str
    phone_number: str
    preferred_time: str = "Earliest Available"
    preferred_language: str = "English"
    callback_reason: str
    enquiry_topic: str
    status: str = "QUEUED_FOR_CLINIC_STAFF"
    created_at: str

