import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection, get_database

# Import modules (Modular Monolith)
from app.modules.clinics.router import router as clinics_router
from app.modules.appointments.router import router as appointments_router
from app.modules.voice_agent.router import router as voice_router
from app.modules.enquiries.router import router as enquiries_router
from app.modules.reports.router import router as reports_router
from app.modules.patients.router import router as patients_router
from app.modules.diagnostic_reports.router import router as diagnostic_reports_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("careconnect")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting CareConnect AI Modular Monolithic Backend...")
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multilingual Voice Receptionist (Priya / Bolna) for Healthcare Clinics",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register modular routers under /api/v1
app.include_router(clinics_router, prefix=settings.API_V1_STR)
app.include_router(appointments_router, prefix=settings.API_V1_STR)
app.include_router(voice_router, prefix=settings.API_V1_STR)
app.include_router(enquiries_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(patients_router, prefix=settings.API_V1_STR)
app.include_router(diagnostic_reports_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "status": "online",
        "documentation": "/docs",
        "voice_agent": "Priya (CareConnect AI Receptionist)",
        "supported_languages": settings.SUPPORTED_LANGUAGES,
        "architecture": "Modular Monolithic"
    }

@app.get("/api/health")
async def health_check():
    db = get_database()
    mongo_status = "connected" if db is not None else "disconnected"
    return {
        "status": "healthy",
        "database": mongo_status,
        "database_name": settings.DATABASE_NAME,
        "modules": ["clinics", "appointments", "voice_agent", "enquiries", "patients", "diagnostic_reports"]
    }
