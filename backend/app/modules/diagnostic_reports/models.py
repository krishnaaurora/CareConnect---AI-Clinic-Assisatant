from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class DiagnosticReportCreateRequest(BaseModel):
    patient_id: str
    report_type: str = "Blood Test"  # Blood Test, X-Ray, MRI, CT Scan, Ultrasound, Other Diagnostic Report
    uploaded_date: Optional[str] = "Oct 30"
    status: str = "Ready"  # Ready, Processing
    file_name: Optional[str] = "Diagnostic_Report.pdf"
    file_size: Optional[str] = "1.8 MB"
    notes: Optional[str] = None

class DiagnosticReportStatusUpdate(BaseModel):
    status: str  # Ready, Processing
    notes: Optional[str] = None
