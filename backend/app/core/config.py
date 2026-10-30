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

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
