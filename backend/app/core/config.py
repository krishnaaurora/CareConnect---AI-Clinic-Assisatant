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
    BOLNA_AGENT_NAME: str = "Priya"
    BOLNA_API_KEY: str = os.getenv("BOLNA_API_KEY", "bn-1c240980fc0a405686963db482b81604")
    BOLNA_AGENT_ID: str = os.getenv("BOLNA_AGENT_ID", "007196d3-1535-41f9-9f84-4eae2664cdff")
    BOLNA_API_BASE_URL: str = "https://api.bolna.ai"
    SUPPORTED_LANGUAGES: list[str] = ["English", "Hindi", "Telugu"]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
