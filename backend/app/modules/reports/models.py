from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ReportUploadRequest(BaseModel):
    patient_id: str
    patient_name: str
    patient_phone: Optional[str] = None
    report_type: str = "Blood Test"
    title: Optional[str] = None
    file_name: str
    file_size: Optional[str] = "1.2 MB"
    uploaded_date: Optional[str] = None
    uploaded_by: Optional[str] = "Admin"
    notes: Optional[str] = None

class ReportStatusUpdateRequest(BaseModel):
    verification_status: Optional[str] = None
    notification_status: Optional[str] = None
    notes: Optional[str] = None

class FollowupResolveRequest(BaseModel):
    notes: Optional[str] = "Marked resolved by clinic staff"

