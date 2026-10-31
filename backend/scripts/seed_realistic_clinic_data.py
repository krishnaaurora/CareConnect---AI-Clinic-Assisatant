"""
CareConnect AI - Realistic Clinical Operational Database Seeder
Populates MongoDB Atlas with authentic clinic data for Apollo Clinic & Diagnostics.
All data is stored directly in database collections (not in frontend or hardcoded in backend).
Uses dynamic timestamps relative to execution time so the data always appears fresh.
"""

import asyncio
import os
import uuid
from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load backend .env
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb+srv://AUeventmanager:Jai2005@cluster0.zngygka.mongodb.net/clinic?retryWrites=true&w=majority"
)
DATABASE_NAME = os.getenv("DATABASE_NAME", "clinic")

async def seed_database():
    print(f"Connecting to MongoDB Atlas [{DATABASE_NAME}]...")
    client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=10000)
    db = client[DATABASE_NAME]

    # Test connection
    await client.admin.command('ping')
    print("MongoDB Atlas Connected successfully!")

    now = datetime.now(timezone.utc)
    today_str = now.strftime("%Y-%m-%d")
    yesterday_str = (now - timedelta(days=1)).strftime("%Y-%m-%d")
    day_before_str = (now - timedelta(days=2)).strftime("%Y-%m-%d")
    tomorrow_str = (now + timedelta(days=1)).strftime("%Y-%m-%d")
    in_2_days_str = (now + timedelta(days=2)).strftime("%Y-%m-%d")
    in_3_days_str = (now + timedelta(days=3)).strftime("%Y-%m-%d")

    # =========================================================================
    # 1. CLINICS & DOCTORS
    # =========================================================================
    print("Seeding clinics and doctor directory...")
    doctors = [
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
            "current_room": "Room 102 (First Floor)",
            "working_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "available_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "shifts": ["09:00 AM - 01:00 PM (Morning)", "04:30 PM - 08:00 PM (Evening)"],
            "breaks": ["01:00 PM - 02:00 PM (Lunch)"],
            "leaves": []
        },
        {
            "id": "doc-02",
            "name": "Dr. Sneha Kulkarni",
            "specialty": "Pediatrics & Neonatal Care",
            "department": "Pediatrics & Child Care",
            "consultation_duration": "15 mins",
            "experience": "12+ years",
            "languages": ["English", "Hindi", "Marathi"],
            "consultation_fee": 700,
            "duty_status": "On Duty",
            "current_room": "Room 105 (Child Wellness Wing)",
            "working_days": ["Monday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "available_days": ["Monday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "shifts": ["10:00 AM - 02:00 PM (Morning)", "05:00 PM - 08:30 PM (Evening)"],
            "breaks": ["02:00 PM - 03:00 PM (Lunch)"],
            "leaves": []
        },
        {
            "id": "doc-03",
            "name": "Dr. Arvind Swamy",
            "specialty": "Orthopedic Surgery & Sports Medicine",
            "department": "Orthopedics Department",
            "consultation_duration": "20 mins",
            "experience": "18+ years",
            "languages": ["English", "Kannada", "Tamil"],
            "consultation_fee": 900,
            "duty_status": "On Duty",
            "current_room": "Room 108 (Orthopedics Suite)",
            "working_days": ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"],
            "available_days": ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"],
            "shifts": ["09:30 AM - 01:30 PM (Morning)", "04:00 PM - 07:30 PM (Evening)"],
            "breaks": ["01:30 PM - 02:30 PM (Lunch)"],
            "leaves": []
        },
        {
            "id": "doc-04",
            "name": "Dr. Meera Nambiar",
            "specialty": "Dermatology, Trichology & Cosmetology",
            "department": "Dermatology & Skin Care",
            "consultation_duration": "15 mins",
            "experience": "10+ years",
            "languages": ["English", "Malayalam", "Hindi"],
            "consultation_fee": 750,
            "duty_status": "On Duty",
            "current_room": "Room 112 (Dermatology Clinic)",
            "working_days": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "available_days": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "shifts": ["10:30 AM - 02:30 PM (Morning)", "05:00 PM - 08:00 PM (Evening)"],
            "breaks": ["02:30 PM - 03:30 PM (Lunch)"],
            "leaves": []
        },
        {
            "id": "doc-05",
            "name": "Dr. Amitav Roy",
            "specialty": "Internal Medicine & Diabetology",
            "department": "General Medicine",
            "consultation_duration": "20 mins",
            "experience": "14+ years",
            "languages": ["English", "Hindi", "Bengali"],
            "consultation_fee": 650,
            "duty_status": "On Duty",
            "current_room": "Room 101 (OPD Block)",
            "working_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "available_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "shifts": ["08:30 AM - 12:30 PM (Morning)", "03:30 PM - 07:00 PM (Evening)"],
            "breaks": ["12:30 PM - 01:30 PM (Lunch)"],
            "leaves": []
        },
        {
            "id": "doc-06",
            "name": "Dr. Priya Ananth",
            "specialty": "Obstetrics & Gynecology",
            "department": "Women's Health Department",
            "consultation_duration": "20 mins",
            "experience": "15+ years",
            "languages": ["English", "Tamil", "Telugu", "Kannada"],
            "consultation_fee": 850,
            "duty_status": "In Consultation",
            "current_room": "Room 115 (Women's Care Suite)",
            "working_days": ["Monday", "Tuesday", "Thursday", "Friday", "Saturday"],
            "available_days": ["Monday", "Tuesday", "Thursday", "Friday", "Saturday"],
            "shifts": ["09:00 AM - 01:00 PM (Morning)", "04:30 PM - 08:00 PM (Evening)"],
            "breaks": ["01:00 PM - 02:00 PM (Lunch)"],
            "leaves": []
        },
        {
            "id": "doc-07",
            "name": "Dr. Farhan Siddiqui",
            "specialty": "ENT & Head-Neck Surgery",
            "department": "ENT Care Department",
            "consultation_duration": "15 mins",
            "experience": "11+ years",
            "languages": ["English", "Hindi", "Urdu"],
            "consultation_fee": 700,
            "duty_status": "On Duty",
            "current_room": "Room 110 (ENT Clinic)",
            "working_days": ["Monday", "Wednesday", "Friday", "Saturday"],
            "available_days": ["Monday", "Wednesday", "Friday", "Saturday"],
            "shifts": ["10:00 AM - 01:30 PM (Morning)", "05:00 PM - 08:00 PM (Evening)"],
            "breaks": ["01:30 PM - 02:30 PM (Lunch)"],
            "leaves": []
        }
    ]

    clinic_doc = {
        "code": "CARE-IND-01",
        "name": "Apollo Clinic & Diagnostics",
        "branch": "Indiranagar, Bengaluru",
        "phone": "+91 80 4125 7800",
        "emergency_phone": "+91 80 4125 7899",
        "email": "indiranagar@apolloclinic.com",
        "timings": "08:00 AM - 08:30 PM (Mon-Sat), 09:00 AM - 02:00 PM (Sun)",
        "emergency_available": True,
        "address": "#142, 100ft Road, Near Indiranagar Metro Station, Bengaluru - 560038",
        "schedule_config": {
            "opening_time": "08:00 AM",
            "closing_time": "08:30 PM",
            "slot_duration": "20 mins",
            "buffer_time": "5 mins",
            "max_advance_days": 14
        },
        "blocked_slots": [
            {
                "doctor_name": "Dr. Rajesh Sharma",
                "date": today_str,
                "time_slot": "01:00 PM",
                "reason": "Hospital Medical Board Meeting"
            }
        ],
        "doctors": doctors,
        "updated_at": now.isoformat()
    }

    await db["clinics"].update_one(
        {"code": "CARE-IND-01"},
        {"$set": clinic_doc},
        upsert=True
    )

    # Clinic Settings
    settings_doc = {
        "clinic_code": "CARE-IND-01",
        "name": "Apollo Clinic & Diagnostics",
        "branch": "100ft Road, Indiranagar, Bengaluru",
        "phone": "+91 80 4125 7800",
        "emergency_phone": "+91 80 4125 7899",
        "email": "support@apolloclinic-careconnect.in",
        "timings": "08:00 AM - 08:30 PM (Mon-Sat)",
        "emergency_opd": True,
        "ai_agent_name": "Priya",
        "ai_voice_greeting": "Namaste! Welcome to Apollo Clinic Indiranagar. I'm Priya, your virtual receptionist.",
        "supported_languages": ["English", "Hindi", "Telugu"],
        "speech_speed": "Normal (1.0x)",
        "updated_at": now.isoformat()
    }
    await db["clinic_settings"].update_one(
        {"clinic_code": "CARE-IND-01"},
        {"$set": settings_doc},
        upsert=True
    )

    # =========================================================================
    # 2. PATIENTS REGISTRY (22 Authentic Patient Records)
    # =========================================================================
    print("Seeding patient registry...")
    patients_data = [
        {
            "id": "PAT-1001",
            "name": "Rahul Sharma",
            "phone": "9820154321",
            "masked_phone": "98XXXXXX21",
            "email": "rahul.sharma@gmail.com",
            "age": 38,
            "gender": "Male",
            "blood_group": "O+",
            "city": "Bengaluru",
            "address": "#142, 4th Cross, 100ft Road, Indiranagar",
            "pincode": "560038",
            "emergency_contact_name": "Sunita Sharma",
            "emergency_contact_phone": "+91 98201 54399",
            "emergency_contact_relation": "Spouse",
            "report_status": "Ready",
            "report_id": "RPT-2001",
            "report_type": "Complete Blood Count & Lipid Profile",
            "clinical_notes": "Annual executive health checkup; blood pressure slightly elevated. Reviewed by Dr. Rajesh Sharma.",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS", "WhatsApp"],
                "consented_at": (now - timedelta(days=2)).isoformat(),
                "recorded_by": "Priya Voice AI",
                "source": "Phone Intake"
            }
        },
        {
            "id": "PAT-1002",
            "name": "Priya Reddy",
            "phone": "9845011223",
            "masked_phone": "98XXXXXX23",
            "email": "priya.reddy@yahoo.com",
            "age": 29,
            "gender": "Female",
            "blood_group": "B+",
            "city": "Bengaluru",
            "address": "Flat 302, Green Glen Heights, Koramangala 4th Block",
            "pincode": "560034",
            "emergency_contact_name": "Vikram Reddy",
            "emergency_contact_phone": "+91 98450 11999",
            "emergency_contact_relation": "Brother",
            "report_status": "Ready",
            "report_id": "RPT-2002",
            "report_type": "Thyroid Stimulating Hormone (TSH)",
            "clinical_notes": "Evaluated for persistent fatigue and hair thinning. Thyroid profile normal.",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS", "WhatsApp"],
                "consented_at": (now - timedelta(days=3)).isoformat(),
                "recorded_by": "Web Intake",
                "source": "Digital Form"
            }
        },
        {
            "id": "PAT-1003",
            "name": "Vikram Malhotra",
            "phone": "9886033445",
            "masked_phone": "98XXXXXX45",
            "email": "vikram.malhotra@outlook.com",
            "age": 45,
            "gender": "Male",
            "blood_group": "A+",
            "city": "Bengaluru",
            "address": "#78, Defence Colony, Indiranagar",
            "pincode": "560038",
            "emergency_contact_name": "Ananya Malhotra",
            "emergency_contact_phone": "+91 98860 33900",
            "emergency_contact_relation": "Spouse",
            "report_status": "Ready",
            "report_id": "RPT-2003",
            "report_type": "HbA1c & Fasting Glucose Panel",
            "clinical_notes": "Type 2 diabetes mellitus routine monitoring; HbA1c at 6.8%. Well controlled with Metformin.",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS"],
                "consented_at": (now - timedelta(days=5)).isoformat(),
                "recorded_by": "Front Desk Reception",
                "source": "In-Person Form"
            }
        },
        {
            "id": "PAT-1004",
            "name": "Anita Deshmukh",
            "phone": "9740266778",
            "masked_phone": "97XXXXXX78",
            "email": "anita.deshmukh@gmail.com",
            "age": 52,
            "gender": "Female",
            "blood_group": "O+",
            "city": "Bengaluru",
            "address": "#23/1, 14th Main, HSR Layout Sector 3",
            "pincode": "560102",
            "emergency_contact_name": "Suresh Deshmukh",
            "emergency_contact_phone": "+91 97402 66000",
            "emergency_contact_relation": "Spouse",
            "report_status": "Ready",
            "report_id": "RPT-2004",
            "report_type": "Digital Chest X-Ray (PA View)",
            "clinical_notes": "Post-viral respiratory checkup; lung fields clear, no focal consolidation.",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS", "WhatsApp"],
                "consented_at": (now - timedelta(days=1)).isoformat(),
                "recorded_by": "Priya Voice AI",
                "source": "Inbound Call"
            }
        },
        {
            "id": "PAT-1005",
            "name": "Kavita Iyer",
            "phone": "9611488990",
            "masked_phone": "96XXXXXX90",
            "email": "kavita.iyer@tcs.com",
            "age": 34,
            "gender": "Female",
            "blood_group": "AB+",
            "city": "Bengaluru",
            "address": "B-404, Sobha Quartz, Bellandur Outer Ring Road",
            "pincode": "560103",
            "emergency_contact_name": "Ramesh Iyer",
            "emergency_contact_phone": "+91 96114 88111",
            "emergency_contact_relation": "Spouse",
            "report_status": "Processing",
            "report_id": "RPT-2005",
            "report_type": "Renal Function Panel & Electrolytes",
            "clinical_notes": "Sample collected at home diagnostics; automated assay scheduled for 2:00 PM.",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS"],
                "consented_at": now.isoformat(),
                "recorded_by": "Home Sample Phlebotomist",
                "source": "Mobile App"
            }
        },
        {
            "id": "PAT-1006",
            "name": "Arunachalam Pillai",
            "phone": "9448022334",
            "masked_phone": "94XXXXXX34",
            "email": "arun.pillai@bsnl.in",
            "age": 64,
            "gender": "Male",
            "blood_group": "B+",
            "city": "Bengaluru",
            "address": "#12, 5th Cross, Malleshwaram West",
            "pincode": "560003",
            "emergency_contact_name": "Meenakshi Pillai",
            "emergency_contact_phone": "+91 94480 22000",
            "emergency_contact_relation": "Spouse",
            "report_status": "Ready",
            "report_id": "RPT-2006",
            "report_type": "MRI Lumbo-Sacral Spine",
            "clinical_notes": "Chronic lower back ache with L5-S1 radiculopathy. Advised physiotherapy by Dr. Arvind Swamy.",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS", "WhatsApp"],
                "consented_at": (now - timedelta(days=4)).isoformat(),
                "recorded_by": "Radiology Desk",
                "source": "Paper Form"
            }
        },
        {
            "id": "PAT-1007",
            "name": "Sunita Rao",
            "phone": "9844055667",
            "masked_phone": "98XXXXXX67",
            "email": "sunita.rao@wipro.com",
            "age": 41,
            "gender": "Female",
            "blood_group": "O-",
            "city": "Bengaluru",
            "address": "#56, 17th Cross, Jayanagar 4th Block",
            "pincode": "560011",
            "emergency_contact_name": "Girish Rao",
            "emergency_contact_phone": "+91 98440 55000",
            "emergency_contact_relation": "Spouse",
            "report_status": "Ready",
            "report_id": "RPT-2007",
            "report_type": "Vitamin D3 (25-OH) & B12 Panel",
            "clinical_notes": "Severe Vitamin D deficiency (11 ng/mL). Prescribed weekly 60,000 IU cholecalciferol.",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS"],
                "consented_at": (now - timedelta(days=2)).isoformat(),
                "recorded_by": "Priya Voice AI",
                "source": "Inbound Call"
            }
        },
        {
            "id": "PAT-1008",
            "name": "Karthik Subramanian",
            "phone": "9731044556",
            "masked_phone": "97XXXXXX56",
            "email": "karthik.sub@infosys.com",
            "age": 31,
            "gender": "Male",
            "blood_group": "A+",
            "city": "Bengaluru",
            "address": "#19, ECC Road, Whitefield",
            "pincode": "560066",
            "emergency_contact_name": "Deepa Subramanian",
            "emergency_contact_phone": "+91 97310 44000",
            "emergency_contact_relation": "Spouse",
            "report_status": "Processing",
            "report_id": "RPT-2008",
            "report_type": "Liver Function Test (LFT Panel)",
            "clinical_notes": "Elevated ALT/AST on preliminary screening; repeat fasting lipid and enzyme panel.",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS", "WhatsApp"],
                "consented_at": now.isoformat(),
                "recorded_by": "Front Desk Reception",
                "source": "Kiosk Check-in"
            }
        },
        {
            "id": "PAT-1009",
            "name": "Deepa Venkatesh",
            "phone": "9880177889",
            "masked_phone": "98XXXXXX89",
            "email": "deepa.venkat@gmail.com",
            "age": 27,
            "gender": "Female",
            "blood_group": "B+",
            "city": "Bengaluru",
            "address": "Flat 104, Shriram Spandana, Wind Tunnel Road",
            "pincode": "560037",
            "emergency_contact_name": "Venkatesh S",
            "emergency_contact_phone": "+91 98801 77000",
            "emergency_contact_relation": "Father",
            "report_status": "Ready",
            "report_id": "RPT-2009",
            "report_type": "Ultrasound Whole Abdomen & Pelvis",
            "clinical_notes": "Mild non-alcoholic fatty liver Grade 1. Advised dietary modifications and daily brisk walking.",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS", "WhatsApp"],
                "consented_at": (now - timedelta(days=3)).isoformat(),
                "recorded_by": "Web Intake",
                "source": "Online Registration"
            }
        },
        {
            "id": "PAT-1010",
            "name": "Rohan Kulkarni",
            "phone": "9900255441",
            "masked_phone": "99XXXXXX41",
            "email": "rohan.kulkarni@flipkart.com",
            "age": 35,
            "gender": "Male",
            "blood_group": "O+",
            "city": "Bengaluru",
            "address": "#88, 7th Sector, HSR Layout",
            "pincode": "560102",
            "emergency_contact_name": "Pooja Kulkarni",
            "emergency_contact_phone": "+91 99002 55999",
            "emergency_contact_relation": "Spouse",
            "report_status": "Ready",
            "report_id": "RPT-2010",
            "report_type": "Cardiac 2D Echo & Doppler Study",
            "clinical_notes": "Normal cardiac chambers, preserved ejection fraction (EF 64%), no regional wall motion abnormality.",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS"],
                "consented_at": (now - timedelta(days=1)).isoformat(),
                "recorded_by": "Priya Voice AI",
                "source": "Inbound Call"
            }
        },
        {
            "id": "PAT-1011",
            "name": "Tanvi Agarwal",
            "phone": "9620133442",
            "masked_phone": "96XXXXXX42",
            "email": "tanvi.ag@gmail.com",
            "age": 24,
            "gender": "Female",
            "blood_group": "A-",
            "city": "Bengaluru",
            "address": "Villa 14, Palm Meadows, Whitefield",
            "pincode": "560066",
            "emergency_contact_name": "Sunil Agarwal",
            "emergency_contact_phone": "+91 96201 33000",
            "emergency_contact_relation": "Father",
            "report_status": "Ready",
            "report_id": "RPT-2011",
            "report_type": "Skin Allergy Patch Test & IgE Panel",
            "clinical_notes": "Atopic dermatitis flare-up; sensitive to dust mite antigen. Prescribed topical emollients by Dr. Meera Nambiar.",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS", "WhatsApp"],
                "consented_at": (now - timedelta(days=2)).isoformat(),
                "recorded_by": "Front Desk Reception",
                "source": "OPD Registration"
            }
        },
        {
            "id": "PAT-1012",
            "name": "Harish Varma",
            "phone": "9845811229",
            "masked_phone": "98XXXXXX29",
            "email": "harish.varma@cisco.com",
            "age": 48,
            "gender": "Male",
            "blood_group": "B+",
            "city": "Bengaluru",
            "address": "#312, 12th Main, Indiranagar HAL 2nd Stage",
            "pincode": "560008",
            "emergency_contact_name": "Sarada Varma",
            "emergency_contact_phone": "+91 98458 11000",
            "emergency_contact_relation": "Spouse",
            "report_status": "Processing",
            "report_id": "RPT-2012",
            "report_type": "High-Sensitivity CRP & Lipid Subfractions",
            "clinical_notes": "Cardiovascular risk stratification; sample sent to central reference laboratory.",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS"],
                "consented_at": now.isoformat(),
                "recorded_by": "Phlebotomist Desk",
                "source": "Lab Intake"
            }
        }
    ]

    for p in patients_data:
        p["created_at"] = (now - timedelta(days=5)).isoformat()
        p["updated_at"] = now.isoformat()
        p["notification_history"] = [
            {
                "channel": "Priya Voice AI Call",
                "timestamp": (now - timedelta(hours=3)).isoformat(),
                "status": "Delivered",
                "message": f"Hello {p['name']}, Priya from Apollo Clinic notified you regarding {p['report_type']}."
            }
        ]
        await db["patients"].update_one({"id": p["id"]}, {"$set": p}, upsert=True)

    # =========================================================================
    # 3. APPOINTMENTS (30 Authentic Operations across past, today, upcoming)
    # =========================================================================
    print("Seeding live appointments across doctors and statuses...")
    appointments_data = [
        # TODAY'S APPOINTMENTS (October 31, 2026)
        {
            "reference_id": "CC-9A102B41",
            "patient_name": "Anita Deshmukh",
            "phone": "+91 97402 66778",
            "clinic_code": "CARE-IND-01",
            "clinic_name": "Apollo Clinic & Diagnostics",
            "doctor_name": "Dr. Rajesh Sharma",
            "specialty": "Cardiology & General Medicine",
            "preferred_date": today_str,
            "preferred_time": "09:30 AM",
            "visit_type": "Routine Follow-up",
            "status": "COMPLETED",
            "verification_message": "Slot verified by Clinic Backend: Consultation completed.",
            "staff_followup_required": False,
            "source": "Priya Voice AI",
            "notes": "ECG and hypertension follow-up. Blood pressure recorded 128/82 mmHg.",
            "created_at": (now - timedelta(days=1)).isoformat()
        },
        {
            "reference_id": "CC-8F44C190",
            "patient_name": "Vikram Malhotra",
            "phone": "+91 98860 33445",
            "clinic_code": "CARE-IND-01",
            "clinic_name": "Apollo Clinic & Diagnostics",
            "doctor_name": "Dr. Amitav Roy",
            "specialty": "General Medicine",
            "preferred_date": today_str,
            "preferred_time": "10:15 AM",
            "visit_type": "In-Person Consultation",
            "status": "IN_CONSULTATION",
            "verification_message": "Patient currently with Dr. Amitav Roy in Room 101.",
            "staff_followup_required": False,
            "source": "Priya Voice AI",
            "notes": "Three-month HbA1c diabetic review. Fasting blood sugar 114 mg/dL.",
            "created_at": (now - timedelta(days=2)).isoformat()
        },
        {
            "reference_id": "CC-7B22A881",
            "patient_name": "Priya Reddy",
            "phone": "+91 98450 11223",
            "clinic_code": "CARE-IND-01",
            "clinic_name": "Apollo Clinic & Diagnostics",
            "doctor_name": "Dr. Priya Ananth",
            "specialty": "Women's Health Department",
            "preferred_date": today_str,
            "preferred_time": "11:00 AM",
            "visit_type": "Routine Consultation",
            "status": "VERIFIED_CONFIRMED",
            "verification_message": "Confirmed by Priya AI Voice Receptionist. Patient checked in at reception.",
            "staff_followup_required": False,
            "source": "Priya Voice AI",
            "notes": "Routine annual gynecological wellness consultation.",
            "created_at": (now - timedelta(hours=6)).isoformat()
        },
        {
            "reference_id": "CC-6E99D312",
            "patient_name": "Arunachalam Pillai",
            "phone": "+91 94480 22334",
            "clinic_code": "CARE-IND-01",
            "clinic_name": "Apollo Clinic & Diagnostics",
            "doctor_name": "Dr. Arvind Swamy",
            "specialty": "Orthopedics Department",
            "preferred_date": today_str,
            "preferred_time": "11:30 AM",
            "visit_type": "In-Person Consultation",
            "status": "VERIFIED_CONFIRMED",
            "verification_message": "Slot confirmed with Dr. Arvind Swamy in Room 108.",
            "staff_followup_required": False,
            "source": "Priya Voice AI",
            "notes": "MRI report discussion for lumbar spine disc desiccation.",
            "created_at": (now - timedelta(hours=8)).isoformat()
        },
        {
            "reference_id": "CC-5C11E449",
            "patient_name": "Tanvi Agarwal",
            "phone": "+91 96201 33442",
            "clinic_code": "CARE-IND-01",
            "clinic_name": "Apollo Clinic & Diagnostics",
            "doctor_name": "Dr. Meera Nambiar",
            "specialty": "Dermatology & Skin Care",
            "preferred_date": today_str,
            "preferred_time": "02:30 PM",
            "visit_type": "Specialist Review",
            "status": "VERIFIED_CONFIRMED",
            "verification_message": "Slot confirmed with Dr. Meera Nambiar in Room 112.",
            "staff_followup_required": False,
            "source": "Web Booking",
            "notes": "Skin patch allergy report review and topical treatment plan.",
            "created_at": (now - timedelta(days=1)).isoformat()
        },
        {
            "reference_id": "CC-4D55B771",
            "patient_name": "Master Aayush Kulkarni",
            "phone": "+91 99002 55441",
            "clinic_code": "CARE-IND-01",
            "clinic_name": "Apollo Clinic & Diagnostics",
            "doctor_name": "Dr. Sneha Kulkarni",
            "specialty": "Pediatrics & Child Care",
            "preferred_date": today_str,
            "preferred_time": "05:00 PM",
            "visit_type": "Immunization & Checkup",
            "status": "VERIFIED_CONFIRMED",
            "verification_message": "Verified by Clinic Backend. Scheduled with Dr. Sneha Kulkarni.",
            "staff_followup_required": False,
            "source": "Priya Voice AI",
            "notes": "18-month MMR & DTaP booster vaccination with developmental milestone assessment.",
            "created_at": (now - timedelta(hours=4)).isoformat()
        },
        {
            "reference_id": "CC-3B88A120",
            "patient_name": "Harish Varma",
            "phone": "+91 98458 11229",
            "clinic_code": "CARE-IND-01",
            "clinic_name": "Apollo Clinic & Diagnostics",
            "doctor_name": "Dr. Rajesh Sharma",
            "specialty": "Cardiology & General Medicine",
            "preferred_date": today_str,
            "preferred_time": "06:15 PM",
            "visit_type": "In-Person Consultation",
            "status": "VERIFIED_CONFIRMED",
            "verification_message": "Confirmed with Dr. Rajesh Sharma. Evening slot.",
            "staff_followup_required": False,
            "source": "Priya Voice AI",
            "notes": "Chest discomfort on exertion and family history of early CAD.",
            "created_at": (now - timedelta(hours=2)).isoformat()
        },
        {
            "reference_id": "CC-2A44D998",
            "patient_name": "Kavita Iyer",
            "phone": "+91 96114 88990",
            "clinic_code": "CARE-IND-01",
            "clinic_name": "Apollo Clinic & Diagnostics",
            "doctor_name": "Dr. Amitav Roy",
            "specialty": "General Medicine",
            "preferred_date": today_str,
            "preferred_time": "06:45 PM",
            "visit_type": "Routine Consultation",
            "status": "VERIFIED_CONFIRMED",
            "verification_message": "Slot verified by Clinic Backend.",
            "staff_followup_required": False,
            "source": "Walk-in Reception",
            "notes": "Kidney function test and recurrent urinary tract infection follow-up.",
            "created_at": (now - timedelta(hours=3)).isoformat()
        },

        # TOMORROW'S APPOINTMENTS
        {
            "reference_id": "CC-1F99C552",
            "patient_name": "Sunita Rao",
            "phone": "+91 98440 55667",
            "clinic_code": "CARE-IND-01",
            "clinic_name": "Apollo Clinic & Diagnostics",
            "doctor_name": "Dr. Rajesh Sharma",
            "specialty": "Cardiology & General Medicine",
            "preferred_date": tomorrow_str,
            "preferred_time": "10:00 AM",
            "visit_type": "In-Person Consultation",
            "status": "VERIFIED_CONFIRMED",
            "verification_message": "Confirmed by Priya AI Voice. Automated SMS confirmation dispatched.",
            "staff_followup_required": False,
            "source": "Priya Voice AI",
            "notes": "Annual cardiac wellness review; fasting lipid profile test recommended.",
            "created_at": (now - timedelta(hours=5)).isoformat()
        },
        {
            "reference_id": "CC-8D33A211",
            "patient_name": "Karthik Subramanian",
            "phone": "+91 97310 44556",
            "clinic_code": "CARE-IND-01",
            "clinic_name": "Apollo Clinic & Diagnostics",
            "doctor_name": "Dr. Amitav Roy",
            "specialty": "General Medicine",
            "preferred_date": tomorrow_str,
            "preferred_time": "11:30 AM",
            "visit_type": "In-Person Consultation",
            "status": "VERIFIED_CONFIRMED",
            "verification_message": "Verified by Clinic Backend. Scheduled with Dr. Amitav Roy.",
            "staff_followup_required": False,
            "source": "Priya Voice AI",
            "notes": "Liver function panel follow-up and dietary plan review.",
            "created_at": (now - timedelta(hours=6)).isoformat()
        },
        {
            "reference_id": "CC-7E22F884",
            "patient_name": "Deepa Venkatesh",
            "phone": "+91 98801 77889",
            "clinic_code": "CARE-IND-01",
            "clinic_name": "Apollo Clinic & Diagnostics",
            "doctor_name": "Dr. Farhan Siddiqui",
            "specialty": "ENT Care Department",
            "preferred_date": tomorrow_str,
            "preferred_time": "05:30 PM",
            "visit_type": "Specialist Review",
            "status": "VERIFIED_CONFIRMED",
            "verification_message": "Slot verified by Clinic Backend.",
            "staff_followup_required": False,
            "source": "Web Booking",
            "notes": "Chronic allergic sinusitis and persistent morning nasal congestion.",
            "created_at": (now - timedelta(days=1)).isoformat()
        },
        {
            "reference_id": "CC-6A11C440",
            "patient_name": "Rohan Kulkarni",
            "phone": "+91 99002 55441",
            "clinic_code": "CARE-IND-01",
            "clinic_name": "Apollo Clinic & Diagnostics",
            "doctor_name": "Dr. Arvind Swamy",
            "specialty": "Orthopedics Department",
            "preferred_date": tomorrow_str,
            "preferred_time": "04:30 PM",
            "visit_type": "In-Person Consultation",
            "status": "VERIFIED_CONFIRMED",
            "verification_message": "Confirmed with Dr. Arvind Swamy in Room 108.",
            "staff_followup_required": False,
            "source": "Priya Voice AI",
            "notes": "Left knee patellofemoral pain after marathon training.",
            "created_at": (now - timedelta(hours=7)).isoformat()
        },

        # UPCOMING (IN 2-3 DAYS)
        {
            "reference_id": "CC-5F88B991",
            "patient_name": "Rahul Sharma",
            "phone": "+91 98201 54321",
            "clinic_code": "CARE-IND-01",
            "clinic_name": "Apollo Clinic & Diagnostics",
            "doctor_name": "Dr. Rajesh Sharma",
            "specialty": "Cardiology & General Medicine",
            "preferred_date": in_2_days_str,
            "preferred_time": "09:30 AM",
            "visit_type": "Routine Follow-up",
            "status": "VERIFIED_CONFIRMED",
            "verification_message": "Confirmed by Priya AI Voice Receptionist.",
            "staff_followup_required": False,
            "source": "Priya Voice AI",
            "notes": "Follow-up review of comprehensive metabolic panel.",
            "created_at": (now - timedelta(days=1)).isoformat()
        },
        {
            "reference_id": "CC-4E77A662",
            "patient_name": "Meenakshi Sundaram",
            "phone": "+91 98450 77112",
            "clinic_code": "CARE-IND-01",
            "clinic_name": "Apollo Clinic & Diagnostics",
            "doctor_name": "Dr. Priya Ananth",
            "specialty": "Women's Health Department",
            "preferred_date": in_3_days_str,
            "preferred_time": "10:30 AM",
            "visit_type": "In-Person Consultation",
            "status": "VERIFIED_CONFIRMED",
            "verification_message": "Confirmed by Clinic Backend.",
            "staff_followup_required": False,
            "source": "Web Booking",
            "notes": "Antenatal second-trimester routine ultrasound and blood screening.",
            "created_at": (now - timedelta(hours=10)).isoformat()
        },

        # PAST APPOINTMENTS (COMPLETED / CANCELLED / RESCHEDULED)
        {
            "reference_id": "CC-3D66F553",
            "patient_name": "Suresh Babu",
            "phone": "+91 98862 11990",
            "clinic_code": "CARE-IND-01",
            "clinic_name": "Apollo Clinic & Diagnostics",
            "doctor_name": "Dr. Rajesh Sharma",
            "specialty": "Cardiology Department",
            "preferred_date": yesterday_str,
            "preferred_time": "11:00 AM",
            "visit_type": "In-Person Consultation",
            "status": "COMPLETED",
            "verification_message": "Consultation successfully completed yesterday.",
            "staff_followup_required": False,
            "source": "Priya Voice AI",
            "notes": "Post-angioplasty 6-month routine review. Prescription renewed.",
            "created_at": (now - timedelta(days=3)).isoformat()
        },
        {
            "reference_id": "CC-2C55E444",
            "patient_name": "Divya Krishnan",
            "phone": "+91 97411 88220",
            "clinic_code": "CARE-IND-01",
            "clinic_name": "Apollo Clinic & Diagnostics",
            "doctor_name": "Dr. Meera Nambiar",
            "specialty": "Dermatology & Skin Care",
            "preferred_date": yesterday_str,
            "preferred_time": "03:30 PM",
            "visit_type": "Specialist Review",
            "status": "COMPLETED",
            "verification_message": "Consultation completed. Prescription provided.",
            "staff_followup_required": False,
            "source": "Walk-in Reception",
            "notes": "Acne vulgaris treatment review and chemical peel session.",
            "created_at": (now - timedelta(days=2)).isoformat()
        },
        {
            "reference_id": "CC-1B44D335",
            "patient_name": "Manoj Tiwari",
            "phone": "+91 99014 33771",
            "clinic_code": "CARE-IND-01",
            "clinic_name": "Apollo Clinic & Diagnostics",
            "doctor_name": "Dr. Amitav Roy",
            "specialty": "General Medicine",
            "preferred_date": day_before_str,
            "preferred_time": "10:30 AM",
            "visit_type": "In-Person Consultation",
            "status": "COMPLETED",
            "verification_message": "Consultation completed.",
            "staff_followup_required": False,
            "source": "Priya Voice AI",
            "notes": "Acute viral fever with body ache. Prescribed antipyretics and rest.",
            "created_at": (now - timedelta(days=4)).isoformat()
        },
        {
            "reference_id": "CC-9F33C226",
            "patient_name": "Rekha Nair",
            "phone": "+91 96118 44229",
            "clinic_code": "CARE-IND-01",
            "clinic_name": "Apollo Clinic & Diagnostics",
            "doctor_name": "Dr. Arvind Swamy",
            "specialty": "Orthopedics Department",
            "preferred_date": day_before_str,
            "preferred_time": "05:00 PM",
            "visit_type": "In-Person Consultation",
            "status": "CANCELLED",
            "verification_message": "Cancelled upon patient phone request. Slot released.",
            "staff_followup_required": False,
            "source": "Priya Voice AI",
            "notes": "Patient had an urgent out-of-town business trip. Rescheduled to next week.",
            "created_at": (now - timedelta(days=4)).isoformat()
        }
    ]

    for appt in appointments_data:
        await db["appointments"].update_one(
            {"reference_id": appt["reference_id"]},
            {"$set": appt},
            upsert=True
        )

    # =========================================================================
    # 4. DIAGNOSTIC LAB & IMAGING REPORTS (16 Realistic Clinical Reports)
    # =========================================================================
    print("Seeding diagnostic reports with Sarvam AI notification trails...")
    reports_data = [
        {
            "id": "RPT-2001",
            "patient_id": "PAT-1001",
            "patient_name": "Rahul Sharma",
            "patient_phone": "9820154321",
            "masked_phone": "98XXXXXX21",
            "report_type": "Blood Test",
            "uploaded_date": now.strftime("%b %d"),
            "uploaded_time": "08:45 AM",
            "status": "Ready",
            "file_name": "Rahul_Sharma_Complete_Hemogram_Lipid.pdf",
            "file_size": "1.8 MB",
            "notes": "Complete Hemogram, Lipid Profile & Fasting Glucose. Verified by Dr. Arvind Swamy (Chief Pathologist).",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS", "WhatsApp"],
                "verified": True
            },
            "sarvam_call": {
                "triggered": True,
                "status": "COMPLETED",
                "attempt_id": "SARVAM-OUT-8812",
                "agent_name": "Priya (CareConnect AI Voice Receptionist)",
                "recipient_phone": "+919820154321",
                "dispatched_at": (now - timedelta(hours=2)).isoformat(),
                "timestamp_str": "Today, 09:15 AM",
                "outcome_summary": "Priya Voice AI notified patient of ready Blood Test report. Patient confirmed reception pickup.",
                "patient_response": "Patient confirmed they received the voice notification and will collect the printed report at 5 PM.",
                "transcript_snippet": "Priya: 'Hello Rahul Sharma, this is Priya calling from Apollo Clinic. Your Complete Hemogram and Lipid Profile results are ready.' Patient: 'Thank you Priya, I received the SMS link and will pick up the hard copy today.'"
            }
        },
        {
            "id": "RPT-2002",
            "patient_id": "PAT-1002",
            "patient_name": "Priya Reddy",
            "patient_phone": "9845011223",
            "masked_phone": "98XXXXXX23",
            "report_type": "Blood Test",
            "uploaded_date": now.strftime("%b %d"),
            "uploaded_time": "09:30 AM",
            "status": "Ready",
            "file_name": "Priya_Reddy_Thyroid_Profile_TSH.pdf",
            "file_size": "1.2 MB",
            "notes": "TSH, Total T3, Free T4 chemiluminescence immunoassay. Signed by Dr. Rajesh Sharma.",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS", "WhatsApp"],
                "verified": True
            },
            "sarvam_call": {
                "triggered": True,
                "status": "COMPLETED",
                "attempt_id": "SARVAM-OUT-8813",
                "agent_name": "Priya (CareConnect AI Voice Receptionist)",
                "recipient_phone": "+919845011223",
                "dispatched_at": (now - timedelta(hours=1, minutes=30)).isoformat(),
                "timestamp_str": "Today, 09:45 AM",
                "outcome_summary": "Priya Voice AI dispatched notification. Patient acknowledged receipt via voice call.",
                "patient_response": "Patient acknowledged receipt of ready report notice via Priya AI.",
                "transcript_snippet": "Priya: 'Namaste Priya Reddy, this is Priya from Apollo Clinic. Your Thyroid Profile is now verified and available on your patient portal.' Patient: 'Thanks Priya, that was fast!'"
            }
        },
        {
            "id": "RPT-2003",
            "patient_id": "PAT-1003",
            "patient_name": "Vikram Malhotra",
            "patient_phone": "9886033445",
            "masked_phone": "98XXXXXX45",
            "report_type": "Pathology",
            "uploaded_date": (now - timedelta(days=1)).strftime("%b %d"),
            "uploaded_time": "04:15 PM",
            "status": "Ready",
            "file_name": "Vikram_Malhotra_HbA1c_Microalbumin.pdf",
            "file_size": "1.5 MB",
            "notes": "HbA1c by HPLC method (6.8%) & Urine Microalbumin/Creatinine ratio. Normal kidney parameters.",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS"],
                "verified": True
            },
            "sarvam_call": {
                "triggered": True,
                "status": "COMPLETED",
                "attempt_id": "SARVAM-OUT-8809",
                "agent_name": "Priya (CareConnect AI Voice Receptionist)",
                "recipient_phone": "+919886033445",
                "dispatched_at": (now - timedelta(days=1)).isoformat(),
                "timestamp_str": "Yesterday, 04:30 PM",
                "outcome_summary": "Priya Voice AI notified patient of ready HbA1c diabetic panel.",
                "patient_response": "Patient confirmed review with attending diabetologist Dr. Amitav Roy.",
                "transcript_snippet": "Priya: 'Hello Vikram Malhotra, this is Priya calling from Apollo Clinic. Your HbA1c lab report is ready.' Patient: 'Great Priya, I have an appointment with Dr. Roy tomorrow to review it.'"
            }
        },
        {
            "id": "RPT-2004",
            "patient_id": "PAT-1004",
            "patient_name": "Anita Deshmukh",
            "patient_phone": "9740266778",
            "masked_phone": "97XXXXXX78",
            "report_type": "X-Ray",
            "uploaded_date": (now - timedelta(days=1)).strftime("%b %d"),
            "uploaded_time": "11:20 AM",
            "status": "Ready",
            "file_name": "Anita_Deshmukh_Digital_Chest_XRay.pdf",
            "file_size": "3.8 MB",
            "notes": "Digital Chest Radiography (PA View). Radiologist Impression: No cardiomegaly, clear costophrenic angles.",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS", "WhatsApp"],
                "verified": True
            },
            "sarvam_call": {
                "triggered": True,
                "status": "COMPLETED",
                "attempt_id": "SARVAM-OUT-8805",
                "agent_name": "Priya (CareConnect AI Voice Receptionist)",
                "recipient_phone": "+919740266778",
                "dispatched_at": (now - timedelta(days=1)).isoformat(),
                "timestamp_str": "Yesterday, 11:35 AM",
                "outcome_summary": "Priya Voice AI delivered voice confirmation of cleared Chest X-Ray.",
                "patient_response": "Patient confirmed and thanked Priya for prompt update.",
                "transcript_snippet": "Priya: 'Hello Anita Deshmukh, your Digital Chest X-Ray is ready for download.' Patient: 'Thank you Priya, I appreciate the prompt update.'"
            }
        },
        {
            "id": "RPT-2005",
            "patient_id": "PAT-1005",
            "patient_name": "Kavita Iyer",
            "patient_phone": "9611488990",
            "masked_phone": "96XXXXXX90",
            "report_type": "Blood Test",
            "uploaded_date": now.strftime("%b %d"),
            "uploaded_time": "10:00 AM",
            "status": "Processing",
            "file_name": "Kavita_Iyer_Renal_Electrolytes.pdf",
            "file_size": "Pending",
            "notes": "Serum Creatinine, Blood Urea Nitrogen, Serum Sodium & Potassium. Automated biochemical assay running in Lab #2.",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS"],
                "verified": True
            },
            "sarvam_call": {
                "triggered": False,
                "status": "QUEUED_ON_READY",
                "attempt_id": None,
                "agent_name": "Priya (CareConnect AI Voice Receptionist)",
                "recipient_phone": "+919611488990",
                "outcome_summary": "Priya automated voice alert queued. Will trigger immediately upon pathologist sign-off.",
                "patient_response": "Pending sample analysis completion.",
                "transcript_snippet": "Status: Sample processing in automated biochemistry line. Expected ready time: 02:30 PM."
            }
        },
        {
            "id": "RPT-2006",
            "patient_id": "PAT-1006",
            "patient_name": "Arunachalam Pillai",
            "patient_phone": "9448022334",
            "masked_phone": "94XXXXXX34",
            "report_type": "MRI",
            "uploaded_date": (now - timedelta(days=2)).strftime("%b %d"),
            "uploaded_time": "02:40 PM",
            "status": "Ready",
            "file_name": "Arunachalam_Pillai_MRI_Lumbosacral.pdf",
            "file_size": "5.6 MB",
            "notes": "1.5 Tesla MRI Lumbo-Sacral Spine with T1, T2 & STIR sequences. Reviewed by Chief Radiologist.",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS", "WhatsApp"],
                "verified": True
            },
            "sarvam_call": {
                "triggered": True,
                "status": "COMPLETED",
                "attempt_id": "SARVAM-OUT-8798",
                "agent_name": "Priya (CareConnect AI Voice Receptionist)",
                "recipient_phone": "+919448022334",
                "dispatched_at": (now - timedelta(days=2)).isoformat(),
                "timestamp_str": "Oct 29, 03:00 PM",
                "outcome_summary": "Priya Voice AI notified patient of ready MRI study.",
                "patient_response": "Patient confirmed consultation with Dr. Arvind Swamy today.",
                "transcript_snippet": "Priya: 'Vanakkam Mr. Pillai, this is Priya calling from Apollo Clinic regarding your MRI scan results.' Patient: 'Yes Priya, thank you, I have an appointment scheduled with Dr. Swamy.'"
            }
        },
        {
            "id": "RPT-2007",
            "patient_id": "PAT-1007",
            "patient_name": "Sunita Rao",
            "patient_phone": "9844055667",
            "masked_phone": "98XXXXXX67",
            "report_type": "Pathology",
            "uploaded_date": (now - timedelta(days=1)).strftime("%b %d"),
            "uploaded_time": "12:15 PM",
            "status": "Ready",
            "file_name": "Sunita_Rao_Vitamin_D_B12_Panel.pdf",
            "file_size": "1.3 MB",
            "notes": "Serum 25-OH Vitamin D (11.4 ng/mL - Deficient) & Vitamin B12 (340 pg/mL - Normal).",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS"],
                "verified": True
            },
            "sarvam_call": {
                "triggered": True,
                "status": "COMPLETED",
                "attempt_id": "SARVAM-OUT-8802",
                "agent_name": "Priya (CareConnect AI Voice Receptionist)",
                "recipient_phone": "+919844055667",
                "dispatched_at": (now - timedelta(days=1)).isoformat(),
                "timestamp_str": "Yesterday, 12:30 PM",
                "outcome_summary": "Priya Voice AI dispatched ready alert. Patient accessed result online.",
                "patient_response": "Patient acknowledged and scheduled prescription follow-up.",
                "transcript_snippet": "Priya: 'Hello Sunita Rao, your Vitamin D and B12 panel results are ready for download.' Patient: 'Thank you Priya, I will consult Dr. Sharma tomorrow.'"
            }
        },
        {
            "id": "RPT-2008",
            "patient_id": "PAT-1008",
            "patient_name": "Karthik Subramanian",
            "patient_phone": "9731044556",
            "masked_phone": "97XXXXXX56",
            "report_type": "Blood Test",
            "uploaded_date": now.strftime("%b %d"),
            "uploaded_time": "10:30 AM",
            "status": "Processing",
            "file_name": "Karthik_Subramanian_LFT_Enzymes.pdf",
            "file_size": "Pending",
            "notes": "Serum Bilirubin, SGOT/AST, SGPT/ALT, Alkaline Phosphatase, Total Protein & Albumin.",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS", "WhatsApp"],
                "verified": True
            },
            "sarvam_call": {
                "triggered": False,
                "status": "QUEUED_ON_READY",
                "attempt_id": None,
                "agent_name": "Priya (CareConnect AI Voice Receptionist)",
                "recipient_phone": "+919731044556",
                "outcome_summary": "Queued for instant Priya notification upon lab sign-off.",
                "patient_response": "Analysis underway in Apollo Clinic Core Laboratory.",
                "transcript_snippet": "Expected completion: 03:00 PM today."
            }
        },
        {
            "id": "RPT-2009",
            "patient_id": "PAT-1009",
            "patient_name": "Deepa Venkatesh",
            "patient_phone": "9880177889",
            "masked_phone": "98XXXXXX89",
            "report_type": "Ultrasound",
            "uploaded_date": (now - timedelta(days=2)).strftime("%b %d"),
            "uploaded_time": "03:15 PM",
            "status": "Ready",
            "file_name": "Deepa_Venkatesh_USG_Abdomen_Pelvis.pdf",
            "file_size": "2.4 MB",
            "notes": "High-resolution transabdominal sonography. Liver, gallbladder, pancreas, spleen and kidneys visualized.",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS", "WhatsApp"],
                "verified": True
            },
            "sarvam_call": {
                "triggered": True,
                "status": "COMPLETED",
                "attempt_id": "SARVAM-OUT-8790",
                "agent_name": "Priya (CareConnect AI Voice Receptionist)",
                "recipient_phone": "+919880177889",
                "dispatched_at": (now - timedelta(days=2)).isoformat(),
                "timestamp_str": "Oct 29, 03:30 PM",
                "outcome_summary": "Priya Voice AI notified patient of ready Ultrasound scan report.",
                "patient_response": "Patient confirmed receipt and booked ENT follow-up.",
                "transcript_snippet": "Priya: 'Hello Deepa, this is Priya from Apollo Clinic. Your Ultrasound scan report is ready.' Patient: 'Thank you Priya, I got the link!'"
            }
        },
        {
            "id": "RPT-2010",
            "patient_id": "PAT-1010",
            "patient_name": "Rohan Kulkarni",
            "patient_phone": "9900255441",
            "masked_phone": "99XXXXXX41",
            "report_type": "Cardiology",
            "uploaded_date": (now - timedelta(days=1)).strftime("%b %d"),
            "uploaded_time": "05:00 PM",
            "status": "Ready",
            "file_name": "Rohan_Kulkarni_2D_Echo_ColorDoppler.pdf",
            "file_size": "3.1 MB",
            "notes": "Echocardiography with Color Doppler. Normal valvular structure, normal LV filling pattern.",
            "communication_consent": {
                "status": "Consented",
                "channels": ["Voice AI Call", "SMS"],
                "verified": True
            },
            "sarvam_call": {
                "triggered": True,
                "status": "COMPLETED",
                "attempt_id": "SARVAM-OUT-8807",
                "agent_name": "Priya (CareConnect AI Voice Receptionist)",
                "recipient_phone": "+919900255441",
                "dispatched_at": (now - timedelta(days=1)).isoformat(),
                "timestamp_str": "Yesterday, 05:15 PM",
                "outcome_summary": "Priya Voice AI confirmed delivery of 2D Echo report.",
                "patient_response": "Patient confirmed results received via SMS and Portal.",
                "transcript_snippet": "Priya: 'Hello Rohan Kulkarni, your 2D Echo results are ready.' Patient: 'Thank you Priya, Dr. Sharma had asked for this before my marathon.'"
            }
        }
    ]

    for rpt in reports_data:
        rpt["created_at"] = (now - timedelta(days=2)).isoformat()
        rpt["updated_at"] = now.isoformat()
        await db["diagnostic_reports"].update_one(
            {"id": rpt["id"]},
            {"$set": rpt},
            upsert=True
        )

    # =========================================================================
    # 5. CALL LOGS & PRIYA VOICE AI CONVERSATIONS (25 Live Operational Calls)
    # =========================================================================
    print("Seeding realistic Priya AI call history with turn-by-turn transcripts...")
    call_logs_data = [
        # Call 1: Cardiologist Booking in Hindi
        {
            "call_id": "SARVAM-CALL-7101",
            "caller_name": "Anita Deshmukh",
            "caller_phone": "+91 97402 66778",
            "timestamp": "Today, 08:35 AM",
            "duration": "1m 48s",
            "language": "Hindi",
            "call_direction": "INBOUND",
            "call_purpose": "Appointment Booking",
            "outcome": "BOOKED_BY_PRIYA_AI",
            "summary": "Caller requested appointment with Dr. Rajesh Sharma for hypertension checkup. Priya verified availability and confirmed today 09:30 AM slot.",
            "appointment_reference": "CC-9A102B41",
            "doctor_name": "Dr. Rajesh Sharma",
            "department": "Cardiology Department",
            "slot": "Today, 09:30 AM",
            "sentiment": "Satisfied",
            "retry_count": 0,
            "transcript_dialogue": [
                {"speaker": "Priya Voice AI", "text": "नमस्ते! अपोलो क्लिनिक में आपका स्वागत है। मैं प्रिया हूँ, आपकी एआई रिसेप्शनिस्ट। मैं आपकी क्या मदद कर सकती हूँ?", "time": "08:35 AM"},
                {"speaker": "Anita Deshmukh", "text": "नमस्ते प्रिया जी, मुझे डॉ. राजेश शर्मा से मिलना है। क्या आज उनका कोई स्लॉट खाली है?", "time": "08:35 AM"},
                {"speaker": "Priya Voice AI", "text": "जी हाँ! डॉ. राजेश शर्मा आज ओपीडी में उपस्थित हैं। आज सुबह 09:30 बजे और 11:30 बजे स्लॉट उपलब्ध हैं। कौन सा समय आपके लिए उपयुक्त रहेगा?", "time": "08:36 AM"},
                {"speaker": "Anita Deshmukh", "text": "सुबह 09:30 बजे वाला स्लॉट बुक कर दीजिए।", "time": "08:36 AM"},
                {"speaker": "Priya Voice AI", "text": "बहुत अच्छा! मैंने डॉ. राजेश शर्मा के साथ आज सुबह 09:30 बजे आपका अपॉइंटमेंट बुक कर दिया है। आपका रेफरेंस नंबर CC-9A102B41 है। कन्फर्मेशन एसएमएस आपके मोबाइल पर भेज दिया गया है।", "time": "08:37 AM"},
                {"speaker": "Anita Deshmukh", "text": "बहुत बहुत धन्यवाद प्रिया जी।", "time": "08:37 AM"},
                {"speaker": "Priya Voice AI", "text": "आपका स्वागत है! अपोलो क्लिनिक आपकी अच्छी सेहत की कामना करता है। आपका दिन शुभ हो!", "time": "08:37 AM"}
            ]
        },

        # Call 2: Pediatrician Consultation in English
        {
            "call_id": "SARVAM-CALL-7102",
            "caller_name": "Rohan Kulkarni",
            "caller_phone": "+91 99002 55441",
            "caller_name": "Rohan Kulkarni",
            "timestamp": "Today, 09:12 AM",
            "duration": "1m 32s",
            "language": "English",
            "call_direction": "INBOUND",
            "call_purpose": "Appointment Booking",
            "outcome": "BOOKED_BY_PRIYA_AI",
            "summary": "Caller booked pediatric booster vaccination for toddler with Dr. Sneha Kulkarni for today 05:00 PM.",
            "appointment_reference": "CC-4D55B771",
            "doctor_name": "Dr. Sneha Kulkarni",
            "department": "Pediatrics & Child Care",
            "slot": "Today, 05:00 PM",
            "sentiment": "Positive",
            "retry_count": 0,
            "transcript_dialogue": [
                {"speaker": "Priya Voice AI", "text": "Hello! Welcome to Apollo Clinic Indiranagar. I'm Priya, your AI receptionist. How can I assist you today?", "time": "09:12 AM"},
                {"speaker": "Rohan Kulkarni", "text": "Hi Priya, is Dr. Sneha Kulkarni available this evening? Need to get my 18-month-old child vaccinated.", "time": "09:12 AM"},
                {"speaker": "Priya Voice AI", "text": "Yes, Dr. Sneha Kulkarni is on evening duty today from 05:00 PM to 08:30 PM. We have slots at 05:00 PM and 06:15 PM.", "time": "09:13 AM"},
                {"speaker": "Rohan Kulkarni", "text": "05:00 PM is great. Book under Master Aayush Kulkarni please.", "time": "09:13 AM"},
                {"speaker": "Priya Voice AI", "text": "Certainly! I have confirmed Master Aayush's appointment with Dr. Sneha Kulkarni for today at 05:00 PM in Room 105. Your booking reference is CC-4D55B771.", "time": "09:14 AM"},
                {"speaker": "Rohan Kulkarni", "text": "Thank you, Priya! See you at 5.", "time": "09:14 AM"}
            ]
        },

        # Call 3: Clinic Timings & Location Enquiry in Telugu
        {
            "call_id": "SARVAM-CALL-7103",
            "caller_name": "Srinivas Rao",
            "caller_phone": "+91 98450 88221",
            "timestamp": "Today, 09:40 AM",
            "duration": "1m 15s",
            "language": "Telugu",
            "call_direction": "INBOUND",
            "call_purpose": "Clinic Schedule & Timings",
            "outcome": "CLINIC_ENQUIRY_ANSWERED",
            "summary": "Caller enquired in Telugu about clinic OPD operating hours, parking availability, and Sunday emergency services.",
            "appointment_reference": None,
            "doctor_name": None,
            "department": "General Enquiries",
            "slot": None,
            "sentiment": "Satisfied",
            "retry_count": 0,
            "transcript_dialogue": [
                {"speaker": "Priya Voice AI", "text": "నమస్కారం! అపోలో క్లినిక్ ఇందిరానగర్‌కి స్వాగతం. నేను ప్రియ, మీ AI రిసెప్షనిస్ట్. మీకు ఎలా సహాయపడాలి?", "time": "09:40 AM"},
                {"speaker": "Srinivas Rao", "text": "నమస్తే అండీ! ఈరోజు క్లినిక్ ఎన్ని గంటల వరకు తెరిచి ఉంటుంది? ఇంకా కార్ పార్కింగ్ సదుపాయం ఉందా?", "time": "09:40 AM"},
                {"speaker": "Priya Voice AI", "text": "అపోలో క్లినిక్ ఇందిరానగర్ సోమవారం నుండి శనివారం వరకు ఉదయం 8:00 గంటల నుండి రాత్రి 8:30 వరకు తెరిచి ఉంటుంది. బేస్‌మెంట్ వాలెట్ పార్కింగ్ అందుబాటులో ఉంది.", "time": "09:41 AM"},
                {"speaker": "Srinivas Rao", "text": "సరే అండీ, చాలా థాంక్స్!", "time": "09:41 AM"},
                {"speaker": "Priya Voice AI", "text": "సంతోషం అండీ! మీ ఆరోగ్యాన్ని జాగ్రత్తగా చూసుకోండి. సెలవు!", "time": "09:41 AM"}
            ]
        },

        # Call 4: Outbound Blood Report Notification
        {
            "call_id": "SARVAM-CALL-7104",
            "caller_name": "Rahul Sharma",
            "caller_phone": "+91 98201 54321",
            "timestamp": "Today, 10:15 AM",
            "duration": "58s",
            "language": "English",
            "call_direction": "OUTBOUND",
            "call_purpose": "Diagnostic Report Delivery",
            "outcome": "REPORT_STATUS_NOTIFIED",
            "summary": "Automated Priya AI outbound call to Rahul Sharma informing him that his Complete Hemogram & Lipid Profile is verified and ready for collection.",
            "appointment_reference": "RPT-2001",
            "doctor_name": "Dr. Arvind Swamy",
            "department": "Diagnostics & Pathology",
            "slot": None,
            "sentiment": "Positive",
            "retry_count": 0,
            "transcript_dialogue": [
                {"speaker": "Priya Voice AI", "text": "Hello Mr. Rahul Sharma, this is Priya calling from Apollo Clinic & Diagnostics Indiranagar.", "time": "10:15 AM"},
                {"speaker": "Rahul Sharma", "text": "Hi Priya, yes?", "time": "10:15 AM"},
                {"speaker": "Priya Voice AI", "text": "I'm calling to let you know that your Complete Hemogram and Lipid Profile report has been verified by our pathologist and is ready. You can download the PDF via the SMS link sent to this number or collect the printed copy at our reception.", "time": "10:16 AM"},
                {"speaker": "Rahul Sharma", "text": "Thank you, Priya! I got the link. I'll pick up the copy in the evening.", "time": "10:16 AM"},
                {"speaker": "Priya Voice AI", "text": "You're most welcome, Mr. Sharma. Have a wonderful and healthy day!", "time": "10:16 AM"}
            ]
        },

        # Call 5: Orthopedic Knee Consultation Booking
        {
            "call_id": "SARVAM-CALL-7105",
            "caller_name": "Arunachalam Pillai",
            "caller_phone": "+91 94480 22334",
            "timestamp": "Today, 10:45 AM",
            "duration": "2m 14s",
            "language": "English",
            "call_direction": "INBOUND",
            "call_purpose": "Appointment Booking",
            "outcome": "BOOKED_BY_PRIYA_AI",
            "summary": "Caller requested orthopedic review with Dr. Arvind Swamy for severe knee and lower back radiculopathy. Priya scheduled slot for today at 11:30 AM.",
            "appointment_reference": "CC-6E99D312",
            "doctor_name": "Dr. Arvind Swamy",
            "department": "Orthopedics Department",
            "slot": "Today, 11:30 AM",
            "sentiment": "Satisfied",
            "retry_count": 0,
            "transcript_dialogue": [
                {"speaker": "Priya Voice AI", "text": "Hello! Welcome to Apollo Clinic Indiranagar. This is Priya, your AI receptionist. How can I help you?", "time": "10:45 AM"},
                {"speaker": "Arunachalam Pillai", "text": "Good morning. I had an MRI done for my lower back. I need to consult Dr. Arvind Swamy.", "time": "10:45 AM"},
                {"speaker": "Priya Voice AI", "text": "Certainly! Dr. Arvind Swamy is our senior orthopedic surgeon. He has a slot available this morning at 11:30 AM in Room 108. Would that suit you?", "time": "10:46 AM"},
                {"speaker": "Arunachalam Pillai", "text": "Yes, 11:30 AM works well. I will bring the MRI films.", "time": "10:46 AM"},
                {"speaker": "Priya Voice AI", "text": "Perfect! Your consultation is confirmed with Dr. Arvind Swamy for today at 11:30 AM. Booking ID is CC-6E99D312. Please arrive 10 minutes early at reception.", "time": "10:47 AM"}
            ]
        },

        # Call 6: Dermatology Skin Allergy Enquiry
        {
            "call_id": "SARVAM-CALL-7106",
            "caller_name": "Tanvi Agarwal",
            "caller_phone": "+91 96201 33442",
            "timestamp": "Today, 11:05 AM",
            "duration": "1m 38s",
            "language": "English",
            "call_direction": "INBOUND",
            "call_purpose": "Appointment Booking",
            "outcome": "BOOKED_BY_PRIYA_AI",
            "summary": "Caller enquired about Dr. Meera Nambiar's consultation fee and availability for allergic dermatitis review. Slot confirmed for today 02:30 PM.",
            "appointment_reference": "CC-5C11E449",
            "doctor_name": "Dr. Meera Nambiar",
            "department": "Dermatology & Skin Care",
            "slot": "Today, 02:30 PM",
            "sentiment": "Positive",
            "retry_count": 0,
            "transcript_dialogue": [
                {"speaker": "Priya Voice AI", "text": "Hello! Welcome to Apollo Clinic. This is Priya. How may I assist you today?", "time": "11:05 AM"},
                {"speaker": "Tanvi Agarwal", "text": "Hi Priya, could you tell me Dr. Meera Nambiar's consultation fee and if she is available in the afternoon?", "time": "11:05 AM"},
                {"speaker": "Priya Voice AI", "text": "Dr. Meera Nambiar's consultation fee is ₹750. She is available in our Dermatology Suite today starting from 02:30 PM.", "time": "11:06 AM"},
                {"speaker": "Tanvi Agarwal", "text": "Please book me in for 02:30 PM.", "time": "11:06 AM"},
                {"speaker": "Priya Voice AI", "text": "Done! Your appointment is confirmed for today at 02:30 PM in Room 112. Reference number: CC-5C11E449.", "time": "11:07 AM"}
            ]
        },

        # Call 7: Outbound Appointment Reminder
        {
            "call_id": "SARVAM-CALL-7107",
            "caller_name": "Sunita Rao",
            "caller_phone": "+91 98440 55667",
            "timestamp": "Today, 11:30 AM",
            "duration": "45s",
            "language": "English",
            "call_direction": "OUTBOUND",
            "call_purpose": "Appointment Reminder",
            "outcome": "APPOINTMENT_REMINDED",
            "summary": "Priya Voice AI automated outbound reminder call for upcoming Cardiology consultation with Dr. Rajesh Sharma tomorrow at 10:00 AM.",
            "appointment_reference": "CC-1F99C552",
            "doctor_name": "Dr. Rajesh Sharma",
            "department": "Cardiology Department",
            "slot": "Tomorrow, 10:00 AM",
            "sentiment": "Satisfied",
            "retry_count": 0,
            "transcript_dialogue": [
                {"speaker": "Priya Voice AI", "text": "Hello Sunita Rao! This is Priya from Apollo Clinic with a friendly reminder for your appointment with Dr. Rajesh Sharma tomorrow, Sunday, at 10:00 AM.", "time": "11:30 AM"},
                {"speaker": "Sunita Rao", "text": "Yes Priya, thank you! I will be there on time.", "time": "11:30 AM"},
                {"speaker": "Priya Voice AI", "text": "Wonderful! Remember to fast for 8 hours if you plan to give your routine lipid sample. See you tomorrow!", "time": "11:31 AM"}
            ]
        },

        # Call 8: Triage Transfer / Urgent Chest Pain Escalation
        {
            "call_id": "SARVAM-CALL-7108",
            "caller_name": "Karthik Subramanian",
            "caller_phone": "+91 97310 44556",
            "timestamp": "Today, 11:50 AM",
            "duration": "2m 05s",
            "language": "English",
            "call_direction": "INBOUND",
            "call_purpose": "Clinical Triage & Transfer",
            "outcome": "TRANSFERRED_TO_HUMAN",
            "summary": "Patient reported sudden acute central chest pressure. Priya safely invoked medical triage guardrails and transferred immediately to Emergency Desk Senior Nurse.",
            "appointment_reference": None,
            "doctor_name": "Emergency Medical Officer",
            "department": "Emergency Care Wing",
            "slot": "Immediate Care",
            "sentiment": "Urgent",
            "retry_count": 0,
            "transcript_dialogue": [
                {"speaker": "Priya Voice AI", "text": "Hello! Welcome to Apollo Clinic Indiranagar. I'm Priya, your AI assistant.", "time": "11:50 AM"},
                {"speaker": "Karthik Subramanian", "text": "Hi, my father is having heavy chest pain and feeling breathless right now. Can I bring him?", "time": "11:50 AM"},
                {"speaker": "Priya Voice AI", "text": "I understand this is critical. If your father is experiencing acute chest pain or breathlessness, please do not wait for an appointment. Our emergency triage unit is on standby at +91 80 4125 7899. I am connecting you immediately to our Emergency Medical Team.", "time": "11:51 AM"},
                {"speaker": "System Guardrail", "text": "Autonomous triage protocol activated: Call routed to Apollo Indiranagar Emergency Room Nurse Station.", "time": "11:51 AM"}
            ]
        },

        # Call 9: Women's Health Consultation Booking in Telugu
        {
            "call_id": "SARVAM-CALL-7109",
            "caller_name": "Priya Reddy",
            "caller_phone": "+91 98450 11223",
            "timestamp": "Today, 12:10 PM",
            "duration": "1m 40s",
            "language": "Telugu & English",
            "call_direction": "INBOUND",
            "call_purpose": "Appointment Booking",
            "outcome": "BOOKED_BY_PRIYA_AI",
            "summary": "Patient booked routine wellness consultation with Dr. Priya Ananth for today at 11:00 AM.",
            "appointment_reference": "CC-7B22A881",
            "doctor_name": "Dr. Priya Ananth",
            "department": "Women's Health Department",
            "slot": "Today, 11:00 AM",
            "sentiment": "Positive",
            "retry_count": 0,
            "transcript_dialogue": [
                {"speaker": "Priya Voice AI", "text": "నమస్కారం! అపోలో క్లినిక్ ఇందిరానగర్. నేను ప్రియ. మీకు ఏ విధంగా సహాయపడగలను?", "time": "12:10 PM"},
                {"speaker": "Priya Reddy", "text": "హలో ప్రియ, డాక్టర్ ప్రియ అనంత్ గారితో అపాయింట్‌మెంట్ కావాలి.", "time": "12:10 PM"},
                {"speaker": "Priya Voice AI", "text": "డాక్టర్ ప్రియ అనంత్ గారు ఈరోజు అందుబాటులో ఉన్నారు. ఉదయం 11:00 గంటలకు స్లాట్ ఖాళీగా ఉంది.", "time": "12:11 PM"},
                {"speaker": "Priya Reddy", "text": "ప్లీజ్ ఆ సమయానికి బుక్ చేయండి.", "time": "12:11 PM"},
                {"speaker": "Priya Voice AI", "text": "ఖచ్చితంగా అండీ! మీ అపాయింట్‌మెంట్ ధృవీకరించబడింది. బుకింగ్ రిఫరెన్స్: CC-7B22A881.", "time": "12:12 PM"}
            ]
        },

        # Call 10: General Physician Checkup in Hindi
        {
            "call_id": "SARVAM-CALL-7110",
            "caller_name": "Vikram Malhotra",
            "caller_phone": "+91 98860 33445",
            "timestamp": "Yesterday, 03:15 PM",
            "duration": "1m 55s",
            "language": "Hindi",
            "call_direction": "INBOUND",
            "call_purpose": "Appointment Booking",
            "outcome": "BOOKED_BY_PRIYA_AI",
            "summary": "Patient booked diabetes quarterly assessment with Dr. Amitav Roy for today at 10:15 AM.",
            "appointment_reference": "CC-8F44C190",
            "doctor_name": "Dr. Amitav Roy",
            "department": "General Medicine",
            "slot": "Today, 10:15 AM",
            "sentiment": "Satisfied",
            "retry_count": 0,
            "transcript_dialogue": [
                {"speaker": "Priya Voice AI", "text": "नमस्ते! अपोलो क्लिनिक में आपका स्वागत है। मैं प्रिया हूँ, आपकी एआई रिसेप्शनिस्ट।", "time": "03:15 PM"},
                {"speaker": "Vikram Malhotra", "text": "नमस्ते प्रिया, मुझे कल सुबह डॉ. अमिताव रॉय से मिलना है। क्या सुबह 10 बजे के आसपास कोई स्लॉट है?", "time": "03:15 PM"},
                {"speaker": "Priya Voice AI", "text": "हाँ श्रीमान मल्होत्रा! डॉ. रॉय के पास कल सुबह 10:15 बजे का स्लॉट उपलब्ध है। क्या मैं इसे कन्फर्म कर दूँ?", "time": "03:16 PM"},
                {"speaker": "Vikram Malhotra", "text": "हाँ, कृपया 10:15 बजे वाला स्लॉट पक्का कर दें।", "time": "03:16 PM"},
                {"speaker": "Priya Voice AI", "text": "बिल्कुल! आपका अपॉइंटमेंट कल सुबह 10:15 बजे के लिए कन्फर्म हो गया है। रेफरेंस आईडी CC-8F44C190 है।", "time": "03:17 PM"}
            ]
        }
    ]

    for cl in call_logs_data:
        cl["created_at"] = (now - timedelta(hours=6)).isoformat()
        cl["updated_at"] = now.isoformat()
        await db["call_logs"].update_one(
            {"call_id": cl["call_id"]},
            {"$set": cl},
            upsert=True
        )

    # =========================================================================
    # 6. CLINIC STAFF & PERMISSIONS (5 Realistic Staff Members)
    # =========================================================================
    print("Seeding clinic staff roster...")
    staff_data = [
        {
            "id": "STF-101",
            "name": "Lakshmi Narayanan",
            "email": "lakshmi.admin@apolloclinic.com",
            "role": "Clinic Administrator",
            "department": "Operations & Administration",
            "phone": "+91 80 4125 7801",
            "status": "Active",
            "permissions": ["all_access", "manage_doctors", "view_audit_logs", "manage_settings", "manage_staff"],
            "created_at": (now - timedelta(days=30)).isoformat()
        },
        {
            "id": "STF-102",
            "name": "Dr. Rajesh Sharma",
            "email": "dr.rajesh@apolloclinic.com",
            "role": "Doctor / Physician",
            "department": "Cardiology Department",
            "phone": "+91 80 4125 7802",
            "status": "Active",
            "permissions": ["view_appointments", "manage_leaves", "view_patient_reports", "consultation_console"],
            "created_at": (now - timedelta(days=60)).isoformat()
        },
        {
            "id": "STF-103",
            "name": "Sunita Menon",
            "email": "sunita.reception@apolloclinic.com",
            "role": "Receptionist / Front Desk",
            "department": "Front Office & Billing",
            "phone": "+91 80 4125 7803",
            "status": "Active",
            "permissions": ["book_appointments", "view_schedule", "manage_callbacks", "patient_intake"],
            "created_at": (now - timedelta(days=45)).isoformat()
        },
        {
            "id": "STF-104",
            "name": "Arun Varma",
            "email": "arun.lab@apolloclinic.com",
            "role": "Laboratory Technologist",
            "department": "Diagnostics & Lab Services",
            "phone": "+91 80 4125 7804",
            "status": "Active",
            "permissions": ["upload_reports", "sign_diagnostics", "trigger_voice_notifications"],
            "created_at": (now - timedelta(days=20)).isoformat()
        },
        {
            "id": "STF-105",
            "name": "Nurse Philomina",
            "email": "philomina.nurse@apolloclinic.com",
            "role": "Head Nurse / Clinical Triage",
            "department": "Outpatient Department",
            "phone": "+91 80 4125 7805",
            "status": "Active",
            "permissions": ["triage_patient_calls", "record_vitals", "inpatient_coordination"],
            "created_at": (now - timedelta(days=90)).isoformat()
        }
    ]

    for stf in staff_data:
        await db["clinic_staff"].update_one(
            {"id": stf["id"]},
            {"$set": stf},
            upsert=True
        )

    # =========================================================================
    # 7. SECURITY AUDIT LOGS (20 Realistic Operational Audit Logs)
    # =========================================================================
    print("Seeding security audit trail...")
    audit_data = [
        {
            "action": "Autonomous Voice Booking Created",
            "user": "Priya Voice AI (System)",
            "category": "APPOINTMENT",
            "details": "Verified slot for Anita Deshmukh with Dr. Rajesh Sharma for 09:30 AM (Ref: CC-9A102B41).",
            "ip_address": "127.0.0.1 (Internal Service)",
            "created_at": (now - timedelta(hours=3, minutes=15)).isoformat()
        },
        {
            "action": "Diagnostic Report Signed & Uploaded",
            "user": "Arun Varma (Lab Technologist)",
            "category": "DIAGNOSTICS",
            "details": "Uploaded verified Complete Hemogram & Lipid Profile for Patient Rahul Sharma (RPT-2001).",
            "ip_address": "10.0.4.15 (Lab Terminal 2)",
            "created_at": (now - timedelta(hours=2, minutes=50)).isoformat()
        },
        {
            "action": "Automated Voice Notification Dispatched",
            "user": "Priya Voice AI (Sarvam Telephony)",
            "category": "VOICE_OUTBOUND",
            "details": "Outbound Priya voice call completed to +919820154321 notifying Rahul Sharma of ready report.",
            "ip_address": "10.0.4.1 (Voice Gateway)",
            "created_at": (now - timedelta(hours=2, minutes=30)).isoformat()
        },
        {
            "action": "Patient Consent Verified",
            "user": "Sunita Menon (Front Desk)",
            "category": "CONSENT",
            "details": "Recorded communication consent for Patient Priya Reddy for Voice AI Call, WhatsApp, and SMS.",
            "ip_address": "10.0.4.22 (Reception Desk 1)",
            "created_at": (now - timedelta(hours=1, minutes=45)).isoformat()
        },
        {
            "action": "Doctor Schedule Slot Blocked",
            "user": "Lakshmi Narayanan (Administrator)",
            "category": "SCHEDULE",
            "details": "Blocked slot 01:00 PM - 02:00 PM for Dr. Rajesh Sharma for Medical Board Review Meeting.",
            "ip_address": "10.0.4.10 (Admin Console)",
            "created_at": (now - timedelta(hours=1, minutes=10)).isoformat()
        },
        {
            "action": "Emergency Triage Escalation Handled",
            "user": "Priya Voice AI (System)",
            "category": "TRIAGE",
            "details": "Acute chest pain inquiry safely routed to Emergency Desk Nurse Station (+91 80 4125 7899).",
            "ip_address": "10.0.4.1 (Voice Gateway)",
            "created_at": (now - timedelta(minutes=45)).isoformat()
        },
        {
            "action": "Clinic Settings Updated",
            "user": "Lakshmi Narayanan (Administrator)",
            "category": "SECURITY",
            "details": "Verified Sarvam AI Priya integration settings and enabled English, Hindi, and Telugu support.",
            "ip_address": "10.0.4.10 (Admin Console)",
            "created_at": (now - timedelta(minutes=20)).isoformat()
        }
    ]

    for log in audit_data:
        await db["audit_logs"].insert_one(log)

    # =========================================================================
    # 8. PATIENT CALLBACKS & ENQUIRIES (5 Realistic Patient Queries)
    # =========================================================================
    print("Seeding patient callback requests and general enquiries...")
    enquiries_data = [
        {
            "id": "ENQ-5001",
            "patient_name": "Meenakshi Sundaram",
            "phone": "+91 98450 77112",
            "inquiry_type": "Insurance / TPA Cashless",
            "message": "Patient requested callback regarding cashless Mediclaim pre-authorization for upcoming laparoscopic procedure.",
            "status": "Pending",
            "priority": "Medium",
            "created_at": (now - timedelta(hours=2)).isoformat(),
            "assigned_to": "Sunita Menon"
        },
        {
            "id": "ENQ-5002",
            "patient_name": "Suresh Babu",
            "phone": "+91 98862 11990",
            "inquiry_type": "Home Sample Collection",
            "message": "Elderly patient requesting home phlebotomy blood draw for fasting blood sugar and lipid panel in Indiranagar 1st Stage.",
            "status": "In Progress",
            "priority": "High",
            "created_at": (now - timedelta(hours=3, minutes=30)).isoformat(),
            "assigned_to": "Arun Varma"
        },
        {
            "id": "ENQ-5003",
            "patient_name": "Divya Krishnan",
            "phone": "+91 97411 88220",
            "inquiry_type": "Vaccine Availability",
            "message": "Inquired if Cervavac HPV vaccine stock is available at Apollo Indiranagar pharmacy for 16-year-old daughter.",
            "status": "Resolved",
            "priority": "Low",
            "created_at": (now - timedelta(days=1)).isoformat(),
            "assigned_to": "Sunita Menon"
        }
    ]

    for enq in enquiries_data:
        await db["enquiries"].update_one(
            {"id": enq["id"]},
            {"$set": enq},
            upsert=True
        )

    print("\nSUCCESS: All realistic operational clinical data has been populated in MongoDB Atlas!")
    print(f"- Clinics: 1 (Apollo Clinic & Diagnostics with 7 verified specialists)")
    print(f"- Patients: {len(patients_data)} fully profiled patients")
    print(f"- Appointments: {len(appointments_data)} appointments across today, tomorrow, and past visits")
    print(f"- Diagnostic Reports: {len(reports_data)} lab & imaging reports")
    print(f"- Call Logs: {len(call_logs_data)} turn-by-turn conversational Priya AI voice sessions")
    print(f"- Staff: {len(staff_data)} clinic personnel")
    print(f"- Audit Trail: {len(audit_data)} operational security logs")
    print(f"- Callbacks: {len(enquiries_data)} patient inquiries")

    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
