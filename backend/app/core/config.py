import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CareConnect AI - Clinic Assistant"
    API_V1_STR: str = "/api/v1"
    MONGODB_URI: str = os.getenv(
        "MONGODB_URI",
        "mongodb+srv://AUeventmanager:Jai2005@cluster0.zngygka.mongodb.net/clinic?retryWrites=true&w=majority"
    )
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "clinic")
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]
    SUPPORTED_LANGUAGES: list[str] = ["English", "Hindi", "Telugu"]

    # Sarvam AI Voice Agent Configuration (Workspace API Key)
    SARVAM_API_KEY: str = os.getenv("SARVAM_API_KEY", "sk_samvaad_33d0gu06_BdpITgDDoxLeLcmjSnCBodi6")
    SARVAM_AGENT_ID: str = os.getenv("SARVAM_AGENT_ID", "Careconnect-ee4e51b7-aa9b")
    SARVAM_AGENT_VERSION: int = int(os.getenv("SARVAM_AGENT_VERSION", "4"))
    SARVAM_CONNECTION_ID: str = os.getenv("SARVAM_CONNECTION_ID", "befb7616-3f-5bcf15a1-5fb4")
    SARVAM_AGENT_PHONE_NUMBER: str = os.getenv("SARVAM_AGENT_PHONE_NUMBER", "+918064269783")
    SARVAM_ORG_ID: str = os.getenv("SARVAM_ORG_ID", "019e90ca-b3c9-79f3-9722-9b051c1e9794")
    SARVAM_WORKSPACE_ID: str = os.getenv("SARVAM_WORKSPACE_ID", "019e90ca-b3fb-7068-87b1-86581ef98843")
    SARVAM_API_BASE_URL: str = os.getenv("SARVAM_API_BASE_URL", "https://apps.sarvam.ai/api")
    SARVAM_WEBHOOK_URL: str = os.getenv("SARVAM_WEBHOOK_URL", "")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "https://careconnect-ai-clinic-assisatant.onrender.com")

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
