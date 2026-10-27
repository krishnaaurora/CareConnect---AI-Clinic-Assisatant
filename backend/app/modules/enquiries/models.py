from pydantic import BaseModel, Field
from typing import Optional

class CallbackRequest(BaseModel):
    name: str = Field(..., min_length=2, example="Anjali Nair")
    phone: str = Field(..., min_length=10, example="+91 91234 56789")
    preferred_time: str = Field(..., example="Morning (10:00 AM - 01:00 PM)")
    preferred_language: str = Field(default="English", example="English | Hindi | Telugu")
    enquiry_topic: Optional[str] = Field("General Inquiry", example="Doctor fees / Report status")

class CallbackRecord(CallbackRequest):
    id: str
    status: str = "PENDING_STAFF_CALL"
    created_at: str
