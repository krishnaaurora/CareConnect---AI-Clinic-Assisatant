import logging
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
        
        # Auto seed clinics if empty
        await seed_initial_clinics_if_needed()
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
                    "doctors": [
                        {
                            "id": "doc-01",
                            "name": "Dr. Rajesh Sharma",
                            "specialty": "Cardiology & General Medicine",
                            "experience": "16+ years",
                            "languages": ["English", "Hindi"],
                            "consultation_fee": 800,
                            "available_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                            "available_slots": ["09:30 AM", "11:00 AM", "02:30 PM", "04:30 PM", "06:00 PM"]
                        },
                        {
                            "id": "doc-02",
                            "name": "Dr. Sneha Kulkarni",
                            "specialty": "Pediatrics & Child Care",
                            "experience": "12+ years",
                            "languages": ["English", "Hindi", "Telugu"],
                            "consultation_fee": 700,
                            "available_days": ["Monday", "Wednesday", "Friday", "Saturday"],
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
                    "doctors": [
                        {
                            "id": "doc-03",
                            "name": "Dr. Venkat Rao",
                            "specialty": "Orthopedics & Joint Care",
                            "experience": "18+ years",
                            "languages": ["English", "Telugu", "Hindi"],
                            "consultation_fee": 850,
                            "available_days": ["Tuesday", "Thursday", "Saturday"],
                            "available_slots": ["10:00 AM", "12:00 PM", "04:00 PM", "06:30 PM"]
                        },
                        {
                            "id": "doc-04",
                            "name": "Dr. Ananya Reddy",
                            "specialty": "Dermatology & Cosmetology",
                            "experience": "9+ years",
                            "languages": ["English", "Telugu", "Hindi"],
                            "consultation_fee": 750,
                            "available_days": ["Monday", "Tuesday", "Thursday", "Friday"],
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
                    "doctors": [
                        {
                            "id": "doc-05",
                            "name": "Dr. Arvind Menon",
                            "specialty": "Internal Medicine & Diabetology",
                            "experience": "14+ years",
                            "languages": ["English", "Hindi"],
                            "consultation_fee": 750,
                            "available_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                            "available_slots": ["09:00 AM", "10:30 AM", "02:00 PM", "04:00 PM"]
                        }
                    ]
                }
            ]
            await db_instance.db["clinics"].insert_many(initial_clinics)
            logger.info("Successfully seeded 3 verified clinics and their doctors.")
    except Exception as e:
        logger.warning(f"Could not seed clinics: {e}")
