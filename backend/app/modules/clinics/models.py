from typing import List, Optional
from pydantic import BaseModel, Field

class DoctorModel(BaseModel):
    id: str
    name: str
    specialty: str
    department: str = "Outpatient Department"
    qualification: Optional[str] = "MBBS, MD"
    registration_number: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    profile_photo: Optional[str] = None
    consultation_duration: str = "20 mins"
    experience: str = "5+ years"
    languages: List[str] = ["English", "Hindi"]
    consultation_fee: int = 700
    working_days: List[str] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    available_days: List[str] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    shifts: List[str] = ["09:00 AM - 01:00 PM", "04:30 PM - 08:00 PM"]
    breaks: List[str] = ["01:00 PM - 02:00 PM (Lunch)"]
    leaves: List[str] = []
    leave_records: List[dict] = []
    is_on_leave: bool = False
    leave_note: Optional[str] = None
    is_active: bool = True
    available_slots: List[str] = ["10:00 AM", "11:30 AM", "02:30 PM", "04:30 PM", "06:00 PM"]

class DoctorCreateRequest(BaseModel):
    name: str = Field(..., example="Dr. Priya Menon")
    specialty: str = Field(..., example="General Physician")
    department: str = Field("General Medicine", example="General Medicine")
    qualification: Optional[str] = Field("MBBS, MD", example="MBBS, MD (Medicine)")
    registration_number: Optional[str] = Field(None, example="KMC/2015/04321")
    phone: Optional[str] = Field(None, example="+91 98765 43210")
    email: Optional[str] = Field(None, example="priya.menon@careconnect.ai")
    bio: Optional[str] = Field(None, example="Senior Consultant with expertise in preventive cardiology and lifestyle disorders.")
    profile_photo: Optional[str] = Field(None, example="https://images.unsplash.com/photo-1559839734-2b71ea197ec2")
    consultation_duration: str = Field("20 mins", example="20 mins")
    experience: str = Field("5+ years", example="8+ years")
    languages: List[str] = Field(default=["English", "Hindi"], example=["English", "Hindi", "Kannada"])
    consultation_fee: int = Field(700, example=700)
    working_days: List[str] = Field(
        default=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        example=["Monday", "Wednesday", "Friday"]
    )
    available_days: List[str] = Field(
        default=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        example=["Monday", "Wednesday", "Friday"]
    )
    shifts: List[str] = Field(
        default=["09:00 AM - 01:00 PM", "04:30 PM - 08:00 PM"],
        example=["09:00 AM - 01:00 PM", "04:30 PM - 08:00 PM"]
    )
    breaks: List[str] = Field(
        default=["01:00 PM - 02:00 PM (Lunch)"],
        example=["01:00 PM - 02:00 PM (Lunch)"]
    )
    leaves: List[str] = Field(default=[], example=[])
    leave_records: List[dict] = Field(default=[], example=[])
    is_on_leave: bool = False
    leave_note: Optional[str] = None
    is_active: bool = True
    available_slots: List[str] = Field(
        default=["10:00 AM", "11:30 AM", "02:30 PM", "04:30 PM", "06:00 PM"],
        example=["10:00 AM", "12:00 PM", "03:00 PM"]
    )

class DoctorUpdateRequest(BaseModel):
    name: Optional[str] = None
    specialty: Optional[str] = None
    department: Optional[str] = None
    qualification: Optional[str] = None
    registration_number: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    profile_photo: Optional[str] = None
    consultation_duration: Optional[str] = None
    experience: Optional[str] = None
    languages: Optional[List[str]] = None
    consultation_fee: Optional[int] = None
    working_days: Optional[List[str]] = None
    available_days: Optional[List[str]] = None
    shifts: Optional[List[str]] = None
    breaks: Optional[List[str]] = None
    leaves: Optional[List[str]] = None
    leave_records: Optional[List[dict]] = None
    is_on_leave: Optional[bool] = None
    leave_note: Optional[str] = None
    is_active: Optional[bool] = None
    available_slots: Optional[List[str]] = None

class LeaveRecordRequest(BaseModel):
    start_date: str = Field(..., example="2026-11-05")
    end_date: str = Field(..., example="2026-11-08")
    reason: str = Field("Personal Leave", example="Attending Medical Conference")

class ClinicModel(BaseModel):
    code: str
    name: str
    branch: str
    phone: str
    timings: str
    emergency_available: bool = False
    doctors: List[DoctorModel] = []

class ClinicResponse(BaseModel):
    id: Optional[str] = None
    code: str
    name: str
    branch: str
    phone: str
    timings: str
    emergency_available: bool = False
    doctors: List[DoctorModel] = []

class ScheduleConfigRequest(BaseModel):
    opening_time: str = "08:30 AM"
    closing_time: str = "08:30 PM"
    slot_duration: str = "20 mins"
    buffer_time: str = "5 mins"

class BlockSlotRequest(BaseModel):
    doctor_name: str
    date: str
    time_slot: str
    reason: str = "Staff Blocked / Break"
