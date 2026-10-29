import logging
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger(__name__)

class MongoDB:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db_instance = MongoDB()

async def connect_to_mongo():
    logger.info("Connecting to MongoDB Atlas...")
    try:
        db_instance.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000
        )
        db_instance.db = db_instance.client[settings.DATABASE_NAME]
        # Ping database
        await db_instance.client.admin.command('ping')
        logger.info(f"Connected to MongoDB Atlas: {settings.DATABASE_NAME}")
        
        # Ensure indexes
        await db_instance.db["appointments"].create_index("reference_id", unique=True)
        await db_instance.db["appointments"].create_index("phone")
        await db_instance.db["clinics"].create_index("code", unique=True)
        await db_instance.db["call_logs"].create_index("call_id", unique=True)
        await db_instance.db["audit_logs"].create_index("created_at")
        await db_instance.db["clinic_staff"].create_index("id", unique=True)
        await db_instance.db["patient_reports"].create_index("id", unique=True)
        await db_instance.db["report_followups"].create_index("id", unique=True)
        
        # Auto seed/enrich initial clinics, doctors, appointments, calls, settings, staff, audit logs, reports
        await seed_initial_clinics_if_needed()
        await seed_initial_appointments_if_needed()
        await seed_initial_call_logs_if_needed()
        await seed_initial_settings_if_needed()
        await seed_initial_staff_if_needed()
        await seed_initial_audit_logs_if_needed()
        await seed_initial_reports_if_needed()
        await seed_initial_followups_if_needed()
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e

async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    if db_instance.client:
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

def get_database() -> AsyncIOMotorDatabase:
    return db_instance.db

async def seed_initial_clinics_if_needed():
    try:
        count = await db_instance.db["clinics"].count_documents({})
        if count == 0:
            logger.info("Seeding initial clinics and verified doctors...")
            initial_clinics = [
                {
                    "code": "CARE-IND-01",
                    "name": "Apollo Clinic & Diagnostics",
                    "branch": "Indiranagar, Bengaluru",
                    "phone": "+91 80 4125 7800",
                    "timings": "08:00 AM - 08:30 PM",
                    "emergency_available": False,
                    "schedule_config": {
                        "opening_time": "08:30 AM",
                        "closing_time": "08:30 PM",
                        "slot_duration": "20 mins",
                        "buffer_time": "5 mins"
                    },
                    "blocked_slots": [
                        {
                            "doctor_name": "Dr. Rajesh Sharma",
                            "date": datetime.utcnow().strftime("%Y-%m-%d"),
                            "time_slot": "01:00 PM",
                            "reason": "Hospital Medical Board Meeting"
                        }
                    ],
                    "doctors": [
                        {
                            "id": "doc-01",
                            "name": "Dr. Rajesh Sharma",
                            "specialty": "Cardiology & General Medicine",
                            "department": "Cardiology Department",
                            "consultation_duration": "20 mins",
                            "experience": "16+ years",
                            "languages": ["English", "Hindi"],
                            "consultation_fee": 800,
                            "duty_status": "In Consultation",
                            "current_room": "Room 102",
                            "working_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                            "available_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                            "shifts": ["09:00 AM - 01:00 PM (Morning)", "04:30 PM - 08:00 PM (Evening)"],
                            "breaks": ["01:00 PM - 02:00 PM (Lunch)"],
                            "leaves": [],
                            "is_on_leave": False,
                            "leave_note": "",
                            "is_active": True,
                            "available_slots": ["09:30 AM", "11:00 AM", "02:30 PM", "04:30 PM", "06:00 PM"]
                        },
                        {
                            "id": "doc-02",
                            "name": "Dr. Sneha Kulkarni",
                            "specialty": "Pediatrics & Child Care",
                            "department": "Pediatrics & Neonatal",
                            "consultation_duration": "15 mins",
                            "experience": "12+ years",
                            "languages": ["English", "Hindi", "Telugu"],
                            "consultation_fee": 700,
                            "duty_status": "Available",
                            "current_room": "Room 105",
                            "working_days": ["Monday", "Wednesday", "Friday", "Saturday"],
                            "available_days": ["Monday", "Wednesday", "Friday", "Saturday"],
                            "shifts": ["10:00 AM - 01:30 PM (Morning)", "03:00 PM - 06:30 PM (Evening)"],
                            "breaks": ["01:30 PM - 02:30 PM (Lunch)", "05:00 PM - 05:15 PM (Tea Break)"],
                            "leaves": [],
                            "is_on_leave": False,
                            "leave_note": "",
                            "is_active": True,
                            "available_slots": ["10:00 AM", "11:30 AM", "03:00 PM", "05:00 PM"]
                        }
                    ]
                },
                {
                    "code": "CARE-JAY-02",
                    "name": "CareFirst Multi-Speciality Clinic",
                    "branch": "Jayanagar 4th Block, Bengaluru",
                    "phone": "+91 80 2663 9922",
                    "timings": "08:30 AM - 09:00 PM",
                    "emergency_available": False,
                    "schedule_config": {
                        "opening_time": "08:30 AM",
                        "closing_time": "09:00 PM",
                        "slot_duration": "20 mins",
                        "buffer_time": "5 mins"
                    },
                    "blocked_slots": [],
                    "doctors": [
                        {
                            "id": "doc-03",
                            "name": "Dr. Venkat Rao",
                            "specialty": "Orthopedics & Joint Care",
                            "department": "Orthopedic Surgery",
                            "consultation_duration": "30 mins",
                            "experience": "18+ years",
                            "languages": ["English", "Telugu", "Hindi"],
                            "consultation_fee": 850,
                            "duty_status": "Available",
                            "current_room": "Room 201",
                            "working_days": ["Tuesday", "Thursday", "Saturday"],
                            "available_days": ["Tuesday", "Thursday", "Saturday"],
                            "shifts": ["10:00 AM - 01:00 PM (Morning)", "04:00 PM - 07:30 PM (Evening)"],
                            "breaks": ["01:00 PM - 02:30 PM (Hospital Rounds)"],
                            "leaves": [],
                            "is_on_leave": False,
                            "leave_note": "",
                            "is_active": True,
                            "available_slots": ["10:00 AM", "12:00 PM", "04:00 PM", "06:30 PM"]
                        },
                        {
                            "id": "doc-04",
                            "name": "Dr. Ananya Reddy",
                            "specialty": "Dermatology & Cosmetology",
                            "department": "Dermatology & Skin Care",
                            "consultation_duration": "20 mins",
                            "experience": "9+ years",
                            "languages": ["English", "Telugu", "Hindi"],
                            "consultation_fee": 750,
                            "duty_status": "Available",
                            "current_room": "Room 204",
                            "working_days": ["Monday", "Tuesday", "Thursday", "Friday"],
                            "available_days": ["Monday", "Tuesday", "Thursday", "Friday"],
                            "shifts": ["11:00 AM - 03:00 PM (Continuous)", "04:30 PM - 07:00 PM (Evening)"],
                            "breaks": ["03:00 PM - 04:00 PM (Sanitization & Break)"],
                            "leaves": [],
                            "is_on_leave": False,
                            "leave_note": "",
                            "is_active": True,
                            "available_slots": ["11:00 AM", "01:30 PM", "03:30 PM", "05:30 PM"]
                        }
                    ]
                },
                {
                    "code": "CARE-KOR-03",
                    "name": "MetroCare Family Health Center",
                    "branch": "Koramangala 5th Block, Bengaluru",
                    "phone": "+91 80 4911 3400",
                    "timings": "09:00 AM - 08:00 PM",
                    "emergency_available": False,
                    "schedule_config": {
                        "opening_time": "09:00 AM",
                        "closing_time": "08:00 PM",
                        "slot_duration": "20 mins",
                        "buffer_time": "5 mins"
                    },
                    "blocked_slots": [],
                    "doctors": [
                        {
                            "id": "doc-05",
                            "name": "Dr. Arvind Menon",
                            "specialty": "Internal Medicine & Diabetology",
                            "department": "General Medicine",
                            "consultation_duration": "20 mins",
                            "experience": "14+ years",
                            "languages": ["English", "Hindi"],
                            "consultation_fee": 750,
                            "duty_status": "Available",
                            "current_room": "Room 101",
                            "working_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                            "available_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                            "shifts": ["09:00 AM - 01:00 PM (Morning)", "02:00 PM - 05:00 PM (Afternoon)"],
                            "breaks": ["01:00 PM - 02:00 PM (Lunch)"],
                            "leaves": [],
                            "is_on_leave": False,
                            "leave_note": "",
                            "is_active": True,
                            "available_slots": ["09:00 AM", "10:30 AM", "02:00 PM", "04:00 PM"]
                        }
                    ]
                }
            ]
            await db_instance.db["clinics"].insert_many(initial_clinics)
            logger.info("Successfully seeded verified clinics and their doctors.")
        else:
            # Ensure doctors have operational fields populated
            clinics = await db_instance.db["clinics"].find({}).to_list(10)
            for c in clinics:
                updated_doctors = []
                changed = False
                for d in c.get("doctors", []):
                    d_copy = dict(d)
                    if "is_active" not in d_copy:
                        d_copy["is_active"] = True
                        changed = True
                    if "department" not in d_copy:
                        d_copy["department"] = d_copy.get("specialty", "General Medicine")
                        changed = True
                    if "consultation_duration" not in d_copy:
                        d_copy["consultation_duration"] = "20 mins"
                        changed = True
                    if "duty_status" not in d_copy:
                        d_copy["duty_status"] = "Available"
                        changed = True
                    if "current_room" not in d_copy:
                        d_copy["current_room"] = "Consultation Room"
                        changed = True
                    if "working_days" not in d_copy:
                        d_copy["working_days"] = d_copy.get("available_days", ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
                        changed = True
                    if "shifts" not in d_copy:
                        d_copy["shifts"] = ["09:30 AM - 01:00 PM (Morning)", "04:00 PM - 07:30 PM (Evening)"]
                        changed = True
                    if "breaks" not in d_copy:
                        d_copy["breaks"] = ["01:00 PM - 02:00 PM (Lunch)"]
                        changed = True
                    if "leaves" not in d_copy:
                        d_copy["leaves"] = []
                        changed = True
                    if "is_on_leave" not in d_copy:
                        d_copy["is_on_leave"] = False
                        changed = True
                    if "leave_note" not in d_copy:
                        d_copy["leave_note"] = ""
                        changed = True
                    updated_doctors.append(d_copy)
                
                update_fields = {}
                if changed:
                    update_fields["doctors"] = updated_doctors
                if "schedule_config" not in c:
                    update_fields["schedule_config"] = {
                        "opening_time": "08:30 AM",
                        "closing_time": "08:30 PM",
                        "slot_duration": "20 mins",
                        "buffer_time": "5 mins"
                    }
                if "blocked_slots" not in c:
                    update_fields["blocked_slots"] = []
                
                if update_fields:
                    await db_instance.db["clinics"].update_one({"_id": c["_id"]}, {"$set": update_fields})
            logger.info("Clinics & verified doctors verified and operationalized in MongoDB.")
    except Exception as e:
        logger.warning(f"Could not seed/enrich clinics: {e}")

async def seed_initial_appointments_if_needed():
    try:
        count = await db_instance.db["appointments"].count_documents({})
        if count == 0:
            logger.info("Seeding initial live appointments into MongoDB...")
            today = datetime.utcnow().strftime("%Y-%m-%d")
            tomorrow = (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d")
            in_2_days = (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%d")
            yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")

            initial_appointments = [
                {
                    "reference_id": "CC-8A91F2C1",
                    "patient_name": "Anita Deshmukh",
                    "phone": "+91 98201 54321",
                    "clinic_code": "CARE-IND-01",
                    "clinic_name": "Apollo Clinic & Diagnostics",
                    "doctor_name": "Dr. Rajesh Sharma",
                    "specialty": "Cardiology & General Medicine",
                    "preferred_date": today,
                    "preferred_time": "10:30 AM",
                    "visit_type": "In-Person Consultation",
                    "status": "VERIFIED_CONFIRMED",
                    "verification_message": "Verified by Clinic Backend: Slot confirmed with Dr. Rajesh Sharma.",
                    "staff_followup_required": False,
                    "source": "Priya Voice AI",
                    "notes": "Routine hypertension review and ECG assessment",
                    "created_at": f"{today}T08:30:00Z"
                },
                {
                    "reference_id": "CC-4B11E992",
                    "patient_name": "Vikram Malhotra",
                    "phone": "+91 98450 11223",
                    "clinic_code": "CARE-IND-01",
                    "clinic_name": "Apollo Clinic & Diagnostics",
                    "doctor_name": "Dr. Sneha Kulkarni",
                    "specialty": "Pediatrics & Child Care",
                    "preferred_date": today,
                    "preferred_time": "11:30 AM",
                    "visit_type": "Routine Checkup",
                    "status": "VERIFIED_CONFIRMED",
                    "verification_message": "Verified by Clinic Backend: Slot confirmed with Dr. Sneha Kulkarni.",
                    "staff_followup_required": False,
                    "source": "Web Booking",
                    "notes": "Child 6-month immunization visit booked at front desk",
                    "created_at": f"{today}T09:00:00Z"
                },
                {
                    "reference_id": "CC-7C33D010",
                    "patient_name": "Sunita Rao",
                    "phone": "+91 97312 99887",
                    "clinic_code": "CARE-JAY-02",
                    "clinic_name": "CareFirst Multi-Speciality Clinic",
                    "doctor_name": "Dr. Venkat Rao",
                    "specialty": "Orthopedics & Joint Care",
                    "preferred_date": today,
                    "preferred_time": "04:00 PM",
                    "visit_type": "Follow-Up Review",
                    "status": "VERIFIED_CONFIRMED",
                    "verification_message": "Verified by Clinic Backend: Slot confirmed with Dr. Venkat Rao.",
                    "staff_followup_required": False,
                    "source": "Priya Voice AI",
                    "notes": "Post-surgery knee rehabilitation review",
                    "created_at": f"{today}T09:15:00Z"
                },
                {
                    "reference_id": "CC-9E55A771",
                    "patient_name": "Karan Johar",
                    "phone": "+91 98860 33445",
                    "clinic_code": "CARE-IND-01",
                    "clinic_name": "Apollo Clinic & Diagnostics",
                    "doctor_name": "Dr. Rajesh Sharma",
                    "specialty": "Cardiology & General Medicine",
                    "preferred_date": tomorrow,
                    "preferred_time": "02:30 PM",
                    "visit_type": "In-Person Consultation",
                    "status": "VERIFIED_CONFIRMED",
                    "verification_message": "Verified by Clinic Backend: Slot confirmed with Dr. Rajesh Sharma.",
                    "staff_followup_required": False,
                    "source": "Priya Voice AI",
                    "notes": "Follow-up consultation after cardiac stress test",
                    "created_at": f"{today}T10:00:00Z"
                },
                {
                    "reference_id": "CC-1A88B321",
                    "patient_name": "Pooja Hegde",
                    "phone": "+91 99001 77889",
                    "clinic_code": "CARE-JAY-02",
                    "clinic_name": "CareFirst Multi-Speciality Clinic",
                    "doctor_name": "Dr. Ananya Reddy",
                    "specialty": "Dermatology & Cosmetology",
                    "preferred_date": in_2_days,
                    "preferred_time": "11:00 AM",
                    "visit_type": "In-Person Consultation",
                    "status": "VERIFIED_CONFIRMED",
                    "verification_message": "Verified by Clinic Backend: Slot confirmed with Dr. Ananya Reddy.",
                    "staff_followup_required": False,
                    "source": "Web Booking",
                    "notes": "Skin allergy follow-up review",
                    "created_at": f"{today}T10:15:00Z"
                },
                {
                    "reference_id": "CC-PND-104",
                    "patient_name": "Meera Krishnan",
                    "phone": "+91 94480 55667",
                    "clinic_code": "CARE-IND-01",
                    "clinic_name": "Apollo Clinic & Diagnostics",
                    "doctor_name": "Dr. Rajesh Sharma",
                    "specialty": "Cardiology & General Medicine",
                    "preferred_date": today,
                    "preferred_time": "06:00 PM",
                    "visit_type": "In-Person Consultation",
                    "status": "PENDING_STAFF_FOLLOWUP",
                    "verification_message": "Slot is near full capacity. Requires desk priority recheck.",
                    "staff_followup_required": True,
                    "source": "Priya Voice AI",
                    "notes": "Voice caller requested immediate priority slot",
                    "created_at": f"{today}T09:40:00Z"
                },
                {
                    "reference_id": "CC-PND-105",
                    "patient_name": "Arjun Nambiar",
                    "phone": "+91 97400 22334",
                    "clinic_code": "CARE-JAY-02",
                    "clinic_name": "CareFirst Multi-Speciality Clinic",
                    "doctor_name": "Dr. Venkat Rao",
                    "specialty": "Orthopedics & Joint Care",
                    "preferred_date": today,
                    "preferred_time": "06:30 PM",
                    "visit_type": "In-Person Consultation",
                    "status": "ROUTED_TO_HUMAN_DESK",
                    "verification_message": "Patient requested urgent knee ache review outside regular morning hours.",
                    "staff_followup_required": True,
                    "source": "Priya Voice AI",
                    "notes": "Acute joint inflammation triage",
                    "created_at": f"{today}T10:15:00Z"
                },
                {
                    "reference_id": "CC-CNL-008",
                    "patient_name": "Deepak Choudhury",
                    "phone": "+91 98451 90876",
                    "clinic_code": "CARE-IND-01",
                    "clinic_name": "Apollo Clinic & Diagnostics",
                    "doctor_name": "Dr. Sneha Kulkarni",
                    "specialty": "Pediatrics & Child Care",
                    "preferred_date": today,
                    "preferred_time": "03:00 PM",
                    "visit_type": "In-Person Consultation",
                    "status": "CANCELLED",
                    "verification_message": "Patient cancelled slot due to out-of-town travel.",
                    "staff_followup_required": False,
                    "source": "Priya Voice AI",
                    "notes": "Patient called Priya Voice AI to cancel due to out-of-town travel",
                    "created_at": f"{yesterday}T15:20:00Z"
                },
                {
                    "reference_id": "CC-CMP-202",
                    "patient_name": "Siddharth Verma",
                    "phone": "+91 98112 33445",
                    "clinic_code": "CARE-IND-01",
                    "clinic_name": "Apollo Clinic & Diagnostics",
                    "doctor_name": "Dr. Rajesh Sharma",
                    "specialty": "Cardiology & General Medicine",
                    "preferred_date": yesterday,
                    "preferred_time": "09:30 AM",
                    "visit_type": "Routine Checkup",
                    "status": "COMPLETED",
                    "verification_message": "Consultation completed successfully.",
                    "staff_followup_required": False,
                    "source": "Priya Voice AI",
                    "notes": "Consultation completed. Prescription generated.",
                    "created_at": f"{yesterday}T09:30:00Z"
                }
            ]
            await db_instance.db["appointments"].insert_many(initial_appointments)
            logger.info("Successfully seeded live initial appointments in MongoDB.")
    except Exception as e:
        logger.warning(f"Could not seed appointments: {e}")

async def seed_initial_call_logs_if_needed():
    try:
        count = await db_instance.db["call_logs"].count_documents({})
        if count == 0:
            logger.info("Seeding initial Bolna AI call activity in MongoDB...")
            initial_calls = [
                {
                    "call_id": "BOLNA-CALL-9821",
                    "caller_name": "Anita Deshmukh",
                    "caller_phone": "+91 98201 54321",
                    "timestamp": "Today, 11:24 AM",
                    "duration": "2m 14s",
                    "language": "Hindi",
                    "outcome": "BOOKED_THROUGH_BOLNA",
                    "summary": "Patient requested Cardiology slot. Priya verified Dr. Sharma's availability and confirmed 10:30 AM booking.",
                    "appointment_reference": "CC-8A91F2C1",
                    "doctor_name": "Dr. Rajesh Sharma",
                    "department": "Cardiology Department",
                    "slot": "Today, 10:30 AM",
                    "sentiment": "Satisfied",
                    "created_at": datetime.utcnow().isoformat() + "Z"
                },
                {
                    "call_id": "BOLNA-CALL-9820",
                    "caller_name": "Karan Johar",
                    "caller_phone": "+91 98860 33445",
                    "timestamp": "Today, 10:52 AM",
                    "duration": "1m 45s",
                    "language": "English",
                    "outcome": "BOOKED_THROUGH_BOLNA",
                    "summary": "Caller booked follow-up checkup with Dr. Rajesh Sharma for tomorrow 02:30 PM.",
                    "appointment_reference": "CC-9E55A771",
                    "doctor_name": "Dr. Rajesh Sharma",
                    "department": "Cardiology Department",
                    "slot": "Tomorrow, 02:30 PM",
                    "sentiment": "Positive",
                    "created_at": datetime.utcnow().isoformat() + "Z"
                },
                {
                    "call_id": "BOLNA-CALL-9819",
                    "caller_name": "Arjun Nambiar",
                    "caller_phone": "+91 97400 22334",
                    "timestamp": "Today, 10:15 AM",
                    "duration": "3m 05s",
                    "language": "English",
                    "outcome": "TRANSFERRED_TO_HUMAN",
                    "summary": "Caller reported intense acute radiating joint inflammation. Priya executed safety triage and transferred call to front desk.",
                    "transfer_reason": "Acute joint pain requiring clinical triage review",
                    "transfer_target": "Triage Nurse (Line 2)",
                    "transfer_status": "Transferred & Connected",
                    "sentiment": "Relieved",
                    "created_at": datetime.utcnow().isoformat() + "Z"
                },
                {
                    "call_id": "BOLNA-CALL-9818",
                    "caller_name": "Meera Krishnan",
                    "caller_phone": "+91 94480 55667",
                    "timestamp": "Today, 09:40 AM",
                    "duration": "1m 58s",
                    "language": "English",
                    "outcome": "FAILED_BOOKING_ATTEMPT",
                    "summary": "Requested 06:00 PM slot which was at full capacity. Priya placed caller on waitlist and logged priority staff follow-up.",
                    "failure_reason": "Requested slot at capacity limit",
                    "followup_status": "Pending Staff Followup",
                    "followup_note": "Caller needs urgent cardiac consultation slot; staff callback required.",
                    "sentiment": "Neutral",
                    "created_at": datetime.utcnow().isoformat() + "Z"
                },
                {
                    "call_id": "BOLNA-CALL-9817",
                    "caller_name": "Vikram Adithya",
                    "caller_phone": "+91 99002 88123",
                    "timestamp": "Today, 09:12 AM",
                    "duration": "1m 10s",
                    "language": "Telugu",
                    "outcome": "INFO_QUERY_RESOLVED",
                    "summary": "Caller asked for clinic Sunday timings and laboratory diagnostic price list in Telugu.",
                    "sentiment": "Satisfied",
                    "created_at": datetime.utcnow().isoformat() + "Z"
                },
                {
                    "call_id": "BOLNA-CALL-9816",
                    "caller_name": "Rohan Deshpande",
                    "caller_phone": "+91 97410 44556",
                    "timestamp": "Yesterday, 06:45 PM",
                    "duration": "2m 30s",
                    "language": "Hindi",
                    "outcome": "TRANSFERRED_TO_HUMAN",
                    "summary": "Caller inquired about post-surgical insurance cashless pre-authorization.",
                    "transfer_reason": "Cashless insurance pre-auth paperwork question",
                    "transfer_target": "Billing & Insurance Desk",
                    "transfer_status": "Transferred",
                    "sentiment": "Neutral",
                    "created_at": datetime.utcnow().isoformat() + "Z"
                },
                {
                    "call_id": "BOLNA-CALL-9815",
                    "caller_name": "Sunita Rao",
                    "caller_phone": "+91 97312 99887",
                    "timestamp": "Yesterday, 04:30 PM",
                    "duration": "2m 02s",
                    "language": "English",
                    "outcome": "BOOKED_THROUGH_BOLNA",
                    "summary": "Booked Orthopedics follow-up appointment with Dr. Venkat Rao for 04:00 PM.",
                    "appointment_reference": "CC-7C33D010",
                    "doctor_name": "Dr. Venkat Rao",
                    "department": "Orthopedic Surgery",
                    "slot": "Tomorrow, 04:00 PM",
                    "sentiment": "Satisfied",
                    "created_at": datetime.utcnow().isoformat() + "Z"
                },
                {
                    "call_id": "BOLNA-CALL-9814",
                    "caller_name": "Suresh Patil",
                    "caller_phone": "+91 98800 12345",
                    "timestamp": "Yesterday, 02:15 PM",
                    "duration": "1m 22s",
                    "language": "English",
                    "outcome": "FAILED_BOOKING_ATTEMPT",
                    "summary": "Requested consultation with Dr. Ananya Reddy on Sunday when Dermatology OPD is closed.",
                    "failure_reason": "Physician OPD closed on requested Sunday",
                    "followup_status": "Resolved (Staff offered Monday 11 AM)",
                    "followup_note": "Patient re-booked for alternate slot",
                    "sentiment": "Neutral",
                    "created_at": datetime.utcnow().isoformat() + "Z"
                }
            ]
            await db_instance.db["call_logs"].insert_many(initial_calls)
            logger.info("Successfully seeded Bolna AI call records in MongoDB.")
    except Exception as e:
        logger.warning(f"Could not seed call logs: {e}")

async def seed_initial_settings_if_needed():
    try:
        count = await db_instance.db["clinic_settings"].count_documents({})
        if count == 0:
            logger.info("Seeding initial clinic settings into MongoDB...")
            initial_settings = [
                {
                    "clinic_code": "CARE-IND-01",
                    "name": "Apollo Clinic & Diagnostics",
                    "branch": "100ft Road, Indiranagar, Bengaluru, Karnataka 560038",
                    "phone": "+91 80 4125 7800",
                    "email": "indiranagar.reception@apolloclinic.com",
                    "emergency_phone": "+91 80 4125 7899",
                    "timings": "08:00 AM - 08:30 PM (Monday - Saturday)",
                    "emergency_opd": True,
                    "ai_agent_name": "Priya",
                    "ai_greeting": "Hello! I am Priya, your CareConnect AI multilingual voice receptionist for Apollo Clinic. How can I assist you with your appointment today?",
                    "supported_languages": ["English", "Hindi", "Telugu", "Kannada"],
                    "speech_speed": "Normal (1.0x)",
                    "safety_guardrails_enabled": True
                },
                {
                    "clinic_code": "CARE-JAY-02",
                    "name": "CareFirst Multi-Speciality Clinic",
                    "branch": "Jayanagar 4th Block, Bengaluru, Karnataka 560011",
                    "phone": "+91 80 2663 9922",
                    "email": "jayanagar.desk@carefirst.com",
                    "emergency_phone": "+91 80 2663 9999",
                    "timings": "08:30 AM - 09:00 PM (Monday - Saturday)",
                    "emergency_opd": False,
                    "ai_agent_name": "Priya",
                    "ai_greeting": "Welcome to CareFirst Multi-Speciality Clinic! I am Priya, your AI receptionist. Would you like to schedule an appointment or check doctor timings?",
                    "supported_languages": ["English", "Telugu", "Hindi"],
                    "speech_speed": "Normal (1.0x)",
                    "safety_guardrails_enabled": True
                }
            ]
            await db_instance.db["clinic_settings"].insert_many(initial_settings)
            logger.info("Successfully seeded clinic settings in MongoDB.")
    except Exception as e:
        logger.warning(f"Could not seed clinic settings: {e}")

async def seed_initial_staff_if_needed():
    try:
        count = await db_instance.db["clinic_staff"].count_documents({})
        if count == 0:
            logger.info("Seeding initial clinic staff into MongoDB...")
            initial_staff = [
                {
                    "id": "stf-01",
                    "clinic_code": "CARE-IND-01",
                    "name": "Dr. Rajesh Sharma",
                    "email": "rajesh.sharma@apolloclinic.com",
                    "role": "Doctor / Physician",
                    "department": "Cardiology",
                    "status": "Active",
                    "last_active": "Today, 11:45 AM"
                },
                {
                    "id": "stf-02",
                    "clinic_code": "CARE-IND-01",
                    "name": "Kavita Nair",
                    "email": "kavita.nair@apolloclinic.com",
                    "role": "Receptionist / Front Desk",
                    "department": "Front Office",
                    "status": "Active",
                    "last_active": "Today, 12:02 PM"
                },
                {
                    "id": "stf-03",
                    "clinic_code": "CARE-IND-01",
                    "name": "Vikram Sethi",
                    "email": "vikram.sethi@apolloclinic.com",
                    "role": "Clinic Administrator",
                    "department": "Operations",
                    "status": "Active",
                    "last_active": "Today, 10:15 AM"
                },
                {
                    "id": "stf-04",
                    "clinic_code": "CARE-IND-01",
                    "name": "Admin IT Operations",
                    "email": "admin@careconnect.ai",
                    "role": "Super Admin",
                    "department": "IT & Security",
                    "status": "Active",
                    "last_active": "Just Now"
                }
            ]
            await db_instance.db["clinic_staff"].insert_many(initial_staff)
            logger.info("Successfully seeded clinic staff in MongoDB.")
    except Exception as e:
        logger.warning(f"Could not seed clinic staff: {e}")

async def seed_initial_audit_logs_if_needed():
    try:
        count = await db_instance.db["audit_logs"].count_documents({})
        if count == 0:
            logger.info("Seeding initial chronological audit logs in MongoDB...")
            initial_logs = [
                {
                    "id": "LOG-1049",
                    "clinic_code": "CARE-IND-01",
                    "timestamp": "Today, 11:32 AM",
                    "user": "Kavita Nair (Receptionist)",
                    "action": "APPOINTMENT_RESCHEDULED",
                    "target": "Ticket CC-8A91F2C1 (Anita Deshmukh)",
                    "details": "Rescheduled slot to today at 10:30 AM with Dr. Rajesh Sharma",
                    "ip_address": "192.168.1.45",
                    "created_at": datetime.utcnow().isoformat() + "Z"
                },
                {
                    "id": "LOG-1048",
                    "clinic_code": "CARE-IND-01",
                    "timestamp": "Today, 10:52 AM",
                    "user": "Priya Voice AI (Bolna Bridge)",
                    "action": "APPOINTMENT_CREATED",
                    "target": "Ticket CC-9E55A771 (Karan Johar)",
                    "details": "Automated voice appointment booked for Cardiology Consultation",
                    "ip_address": "Bolna Telephony Gateway",
                    "created_at": datetime.utcnow().isoformat() + "Z"
                },
                {
                    "id": "LOG-1047",
                    "clinic_code": "CARE-IND-01",
                    "timestamp": "Today, 09:45 AM",
                    "user": "Vikram Sethi (Clinic Admin)",
                    "action": "SLOT_BLOCKED",
                    "target": "Dr. Rajesh Sharma (01:00 PM)",
                    "details": "Blocked slot for Hospital Medical Board Meeting",
                    "ip_address": "192.168.1.12",
                    "created_at": datetime.utcnow().isoformat() + "Z"
                },
                {
                    "id": "LOG-1046",
                    "clinic_code": "CARE-IND-01",
                    "timestamp": "Yesterday, 05:20 PM",
                    "user": "Priya Voice AI (Bolna Bridge)",
                    "action": "APPOINTMENT_CANCELLED",
                    "target": "Ticket CC-CNL-008 (Deepak Choudhury)",
                    "details": "Caller requested cancellation; slot released back to waitlist",
                    "ip_address": "Bolna Telephony Gateway",
                    "created_at": datetime.utcnow().isoformat() + "Z"
                },
                {
                    "id": "LOG-1045",
                    "clinic_code": "CARE-IND-01",
                    "timestamp": "Yesterday, 02:10 PM",
                    "user": "Vikram Sethi (Clinic Admin)",
                    "action": "SETTINGS_UPDATED",
                    "target": "Clinic Operating Timings",
                    "details": "Extended Saturday evening OPD from 07:00 PM to 08:30 PM",
                    "ip_address": "192.168.1.12",
                    "created_at": datetime.utcnow().isoformat() + "Z"
                }
            ]
            await db_instance.db["audit_logs"].insert_many(initial_logs)
            logger.info("Successfully seeded audit logs in MongoDB.")
    except Exception as e:
        logger.warning(f"Could not seed audit logs: {e}")

async def seed_initial_reports_if_needed():
    try:
        count = await db_instance.db["patient_reports"].count_documents({})
        if count == 0:
            logger.info("Seeding initial patient diagnostic reports in MongoDB...")
            today = datetime.utcnow().strftime("%Y-%m-%d")
            yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
            two_days_ago = (datetime.utcnow() - timedelta(days=2)).strftime("%Y-%m-%d")
            three_days_ago = (datetime.utcnow() - timedelta(days=3)).strftime("%Y-%m-%d")

            initial_reports = [
                {
                    "id": "RPT-1001",
                    "patient_id": "PID-1042",
                    "patient_name": "Ananya Reddy",
                    "patient_phone": "+91 99001 77889",
                    "report_type": "Blood Test",
                    "title": "Complete Blood Count (CBC) & Lipid Panel",
                    "file_name": "CBC_Lipid_Panel_Ananya_Reddy.pdf",
                    "file_size": "1.4 MB",
                    "uploaded_date": today,
                    "uploaded_time": "09:15 AM",
                    "uploaded_by": "Kavita Nair (Receptionist)",
                    "verification_status": "Awaiting Verification",
                    "notification_status": "Not Started",
                    "notes": "Routine fasting sample collected at Indiranagar diagnostic wing. Requires physician sign-off.",
                    "timeline": [
                        {"step": "Report Uploaded", "timestamp": f"{today} 09:15 AM", "actor": "Kavita Nair", "done": True},
                        {"step": "Physician Verification", "timestamp": "Pending", "actor": "Dr. Rajesh Sharma", "done": False},
                        {"step": "Ready to Notify", "timestamp": "Pending", "actor": "Clinical Team", "done": False},
                        {"step": "Patient Notification", "timestamp": "Scheduled Phase 4", "actor": "Priya AI Voice", "done": False}
                    ],
                    "created_at": f"{today}T09:15:00Z"
                },
                {
                    "id": "RPT-1002",
                    "patient_id": "PID-1043",
                    "patient_name": "Anita Deshmukh",
                    "patient_phone": "+91 98201 54321",
                    "report_type": "Diagnostic Report",
                    "title": "12-Lead Electrocardiogram (ECG) Report",
                    "file_name": "ECG_Analysis_Anita_Deshmukh.pdf",
                    "file_size": "2.1 MB",
                    "uploaded_date": today,
                    "uploaded_time": "10:05 AM",
                    "uploaded_by": "Admin",
                    "verification_status": "Ready to Notify",
                    "notification_status": "Pending",
                    "notes": "Normal sinus rhythm confirmed by Dr. Sharma. Front office cleared for patient notification.",
                    "timeline": [
                        {"step": "Report Uploaded", "timestamp": f"{today} 10:05 AM", "actor": "Admin", "done": True},
                        {"step": "Physician Verification", "timestamp": f"{today} 10:30 AM", "actor": "Dr. Rajesh Sharma", "done": True},
                        {"step": "Ready to Notify", "timestamp": f"{today} 10:35 AM", "actor": "Kavita Nair", "done": True},
                        {"step": "Patient Notification", "timestamp": "Queued", "actor": "Priya AI Voice", "done": False}
                    ],
                    "created_at": f"{today}T10:05:00Z"
                },
                {
                    "id": "RPT-1003",
                    "patient_id": "PID-1044",
                    "patient_name": "Vikram Malhotra",
                    "patient_phone": "+91 98450 11223",
                    "report_type": "Urine Test",
                    "title": "Urine Routine & Microscopic Examination",
                    "file_name": "Urine_Micro_Vikram_M.pdf",
                    "file_size": "890 KB",
                    "uploaded_date": yesterday,
                    "uploaded_time": "04:20 PM",
                    "uploaded_by": "Sunil Kumar (Front Desk)",
                    "verification_status": "Verified",
                    "notification_status": "Patient Notified",
                    "notes": "No abnormal sediments detected. Notified patient via SMS link and verified receipt.",
                    "timeline": [
                        {"step": "Report Uploaded", "timestamp": f"{yesterday} 04:20 PM", "actor": "Sunil Kumar", "done": True},
                        {"step": "Physician Verification", "timestamp": f"{yesterday} 05:00 PM", "actor": "Dr. Sneha Kulkarni", "done": True},
                        {"step": "Ready to Notify", "timestamp": f"{yesterday} 05:10 PM", "actor": "Desk Staff", "done": True},
                        {"step": "Patient Notified", "timestamp": f"{yesterday} 05:25 PM", "actor": "CareConnect Notification Service", "done": True}
                    ],
                    "created_at": f"{yesterday}T16:20:00Z"
                },
                {
                    "id": "RPT-1004",
                    "patient_id": "PID-1045",
                    "patient_name": "Meera Krishnan",
                    "patient_phone": "+91 94480 55667",
                    "report_type": "Blood Test",
                    "title": "Glycated Hemoglobin (HbA1c) & Fasting Glucose",
                    "file_name": "HbA1c_Meera_Krishnan.pdf",
                    "file_size": "1.2 MB",
                    "uploaded_date": yesterday,
                    "uploaded_time": "02:45 PM",
                    "uploaded_by": "Kavita Nair (Receptionist)",
                    "verification_status": "Ready to Notify",
                    "notification_status": "Call Queued",
                    "notes": "HbA1c value 6.8%. Routine quarterly diabetic monitoring. Auto voice notification queued.",
                    "timeline": [
                        {"step": "Report Uploaded", "timestamp": f"{yesterday} 02:45 PM", "actor": "Kavita Nair", "done": True},
                        {"step": "Physician Verification", "timestamp": f"{yesterday} 03:30 PM", "actor": "Dr. Rajesh Sharma", "done": True},
                        {"step": "Ready to Notify", "timestamp": f"{yesterday} 03:45 PM", "actor": "Admin Desk", "done": True},
                        {"step": "Patient Notification", "timestamp": "In Queue", "actor": "Priya AI Voice", "done": False}
                    ],
                    "created_at": f"{yesterday}T14:45:00Z"
                },
                {
                    "id": "RPT-1005",
                    "patient_id": "PID-1046",
                    "patient_name": "Deepak Choudhury",
                    "patient_phone": "+91 98451 90876",
                    "report_type": "Imaging",
                    "title": "Digital Chest X-Ray (PA View)",
                    "file_name": "Chest_XRay_PA_Deepak_C.pdf",
                    "file_size": "4.8 MB",
                    "uploaded_date": two_days_ago,
                    "uploaded_time": "11:15 AM",
                    "uploaded_by": "Admin",
                    "verification_status": "Ready to Notify",
                    "notification_status": "No Answer",
                    "notes": "Clear lung fields. Tried dialing patient twice at 11:30 AM and 03:15 PM; call went unanswered.",
                    "timeline": [
                        {"step": "Report Uploaded", "timestamp": f"{two_days_ago} 11:15 AM", "actor": "Admin", "done": True},
                        {"step": "Physician Verification", "timestamp": f"{two_days_ago} 11:45 AM", "actor": "Dr. Rajesh Sharma", "done": True},
                        {"step": "Ready to Notify", "timestamp": f"{two_days_ago} 12:00 PM", "actor": "Admin Desk", "done": True},
                        {"step": "Patient Notification", "timestamp": "No Answer (2 attempts)", "actor": "Telephony Bridge", "done": False}
                    ],
                    "created_at": f"{two_days_ago}T11:15:00Z"
                },
                {
                    "id": "RPT-1006",
                    "patient_id": "PID-1047",
                    "patient_name": "Karan Johar",
                    "patient_phone": "+91 98860 33445",
                    "report_type": "Blood Test",
                    "title": "Thyroid Function Test (T3, T4, TSH Ultra)",
                    "file_name": "Thyroid_Profile_Karan_Johar.pdf",
                    "file_size": "1.1 MB",
                    "uploaded_date": two_days_ago,
                    "uploaded_time": "09:30 AM",
                    "uploaded_by": "Sunil Kumar (Front Desk)",
                    "verification_status": "Ready to Notify",
                    "notification_status": "Call Failed",
                    "notes": "Number temporarily unreachable. Marked for front-desk follow-up and alternate WhatsApp notification.",
                    "timeline": [
                        {"step": "Report Uploaded", "timestamp": f"{two_days_ago} 09:30 AM", "actor": "Sunil Kumar", "done": True},
                        {"step": "Physician Verification", "timestamp": f"{two_days_ago} 10:15 AM", "actor": "Dr. Rajesh Sharma", "done": True},
                        {"step": "Ready to Notify", "timestamp": f"{two_days_ago} 10:30 AM", "actor": "Admin Desk", "done": True},
                        {"step": "Patient Notification", "timestamp": "Failed - Unreachable", "actor": "Telephony Bridge", "done": False}
                    ],
                    "created_at": f"{two_days_ago}T09:30:00Z"
                },
                {
                    "id": "RPT-1007",
                    "patient_id": "PID-1048",
                    "patient_name": "Sunita Rao",
                    "patient_phone": "+91 97312 99887",
                    "report_type": "Imaging",
                    "title": "Knee Joint Digital Radiography (AP & Lateral View)",
                    "file_name": "Knee_XRay_Sunita_Rao.pdf",
                    "file_size": "5.2 MB",
                    "uploaded_date": three_days_ago,
                    "uploaded_time": "03:50 PM",
                    "uploaded_by": "Admin",
                    "verification_status": "Verified",
                    "notification_status": "Follow-up Required",
                    "notes": "Post-operative evaluation reviewed by Dr. Venkat Rao. Patient requested in-depth telephonic consultation callback.",
                    "timeline": [
                        {"step": "Report Uploaded", "timestamp": f"{three_days_ago} 03:50 PM", "actor": "Admin", "done": True},
                        {"step": "Physician Verification", "timestamp": f"{three_days_ago} 04:30 PM", "actor": "Dr. Venkat Rao", "done": True},
                        {"step": "Ready to Notify", "timestamp": f"{three_days_ago} 04:45 PM", "actor": "Kavita Nair", "done": True},
                        {"step": "Follow-up Created", "timestamp": f"{three_days_ago} 05:15 PM", "actor": "Front Office Coordinator", "done": True}
                    ],
                    "created_at": f"{three_days_ago}T15:50:00Z"
                },
                {
                    "id": "RPT-1008",
                    "patient_id": "PID-1049",
                    "patient_name": "Rohan Deshpande",
                    "patient_phone": "+91 97410 44556",
                    "report_type": "Blood Test",
                    "title": "Vitamin D3 & Vitamin B12 Immunoassay",
                    "file_name": "Vitamins_D3_B12_Rohan_D.pdf",
                    "file_size": "1.3 MB",
                    "uploaded_date": three_days_ago,
                    "uploaded_time": "01:10 PM",
                    "uploaded_by": "Kavita Nair (Receptionist)",
                    "verification_status": "Rejected",
                    "notification_status": "Not Started",
                    "notes": "Sample hemolyzed during centrifugation. Physician requested repeat venous blood sample collection.",
                    "timeline": [
                        {"step": "Report Uploaded", "timestamp": f"{three_days_ago} 01:10 PM", "actor": "Kavita Nair", "done": True},
                        {"step": "Physician Verification", "timestamp": f"{three_days_ago} 02:00 PM", "actor": "Dr. Rajesh Sharma (Rejected)", "done": True},
                        {"step": "Redraw Requested", "timestamp": f"{three_days_ago} 02:15 PM", "actor": "Laboratory Coordinator", "done": True}
                    ],
                    "created_at": f"{three_days_ago}T13:10:00Z"
                }
            ]
            await db_instance.db["patient_reports"].insert_many(initial_reports)
            logger.info("Successfully seeded patient reports in MongoDB.")
    except Exception as e:
        logger.warning(f"Could not seed patient reports: {e}")

async def seed_initial_followups_if_needed():
    try:
        count = await db_instance.db["report_followups"].count_documents({})
        if count == 0:
            logger.info("Seeding initial report follow-up tasks in MongoDB...")
            today = datetime.utcnow().strftime("%Y-%m-%d")
            tomorrow = (datetime.utcnow() + timedelta(days=1)).strftime("%Y-%m-%d")
            yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")

            initial_followups = [
                {
                    "id": "FLP-201",
                    "patient_reference": "PID-1046",
                    "patient_name": "Deepak Choudhury",
                    "patient_phone": "+91 98451 90876",
                    "report_id": "RPT-1005",
                    "report_title": "Digital Chest X-Ray (PA View)",
                    "reason": "Patient did not answer",
                    "last_attempt": "Yesterday, 03:15 PM",
                    "assigned_staff": "Kavita Nair",
                    "due_date": tomorrow,
                    "status": "Pending",
                    "priority": "Medium",
                    "notes": "Attempted voice call twice without answer. Alternate phone number inquiry required from registration card."
                },
                {
                    "id": "FLP-202",
                    "patient_reference": "PID-1048",
                    "patient_name": "Sunita Rao",
                    "patient_phone": "+91 97312 99887",
                    "report_id": "RPT-1007",
                    "report_title": "Knee Joint Digital Radiography (AP & Lateral View)",
                    "reason": "Patient requested assistance",
                    "last_attempt": "Today, 10:45 AM",
                    "assigned_staff": "Dr. Venkat Rao (Care Coordinator)",
                    "due_date": today,
                    "status": "In Progress",
                    "priority": "High",
                    "notes": "Patient inquired whether post-surgery swelling is normal; scheduled 10-minute follow-up phone call."
                },
                {
                    "id": "FLP-203",
                    "patient_reference": "PID-1047",
                    "patient_name": "Karan Johar",
                    "patient_phone": "+91 98860 33445",
                    "report_id": "RPT-1006",
                    "report_title": "Thyroid Function Test (T3, T4, TSH Ultra)",
                    "reason": "Notification failed",
                    "last_attempt": "27 Oct 2026, 10:30 AM",
                    "assigned_staff": "Sunil Kumar",
                    "due_date": tomorrow,
                    "status": "Pending",
                    "priority": "Medium",
                    "notes": "Carrier returned unreachable status. Send encrypted PDF report link via WhatsApp business API."
                },
                {
                    "id": "FLP-204",
                    "patient_reference": "PID-1049",
                    "patient_name": "Rohan Deshpande",
                    "patient_phone": "+91 97410 44556",
                    "report_id": "RPT-1008",
                    "report_title": "Vitamin D3 & Vitamin B12 Immunoassay",
                    "reason": "Reception callback required",
                    "last_attempt": "26 Oct 2026, 03:00 PM",
                    "assigned_staff": "Vikram Sethi",
                    "due_date": yesterday,
                    "status": "Resolved",
                    "priority": "Low",
                    "notes": "Patient visited clinic for repeat venous blood redraw; specimen re-routed to diagnostics laboratory."
                }
            ]
            await db_instance.db["report_followups"].insert_many(initial_followups)
            logger.info("Successfully seeded report follow-up tasks in MongoDB.")
    except Exception as e:
        logger.warning(f"Could not seed report follow-ups: {e}")

