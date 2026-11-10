import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "WiFiSense 3D Platform"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("APP_SECRET_KEY", "wifisense-3d-cryptographically-secure-signing-key-for-research-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    JWT_ISSUER: str = os.getenv("JWT_ISSUER", "wifisense-auth")
    JWT_AUDIENCE: str = os.getenv("JWT_AUDIENCE", "wifisense-frontend")
    MAX_TELEMETRY_AGE_SEC: float = float(os.getenv("MAX_TELEMETRY_AGE_SEC", "5.0"))

    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite+aiosqlite:///./wifisense.db"
    )
    
    # Keycloak / OIDC Identity Provider
    KEYCLOAK_URL: str = os.getenv("KEYCLOAK_URL", "http://localhost:8080")
    KEYCLOAK_REALM: str = os.getenv("KEYCLOAK_REALM", "wifisense-realm")
    KEYCLOAK_CLIENT_ID: str = os.getenv("KEYCLOAK_CLIENT_ID", "wifisense-frontend")
    
    # DPDP Act 2023 Compliance
    DATA_RETENTION_DAYS_PARTICIPANT: int = 30
    ANONYMOUS_OCCUPANCY_RETENTION_DAYS: int = 90
    AUDIT_LOG_RETENTION_DAYS: int = 365
    
    # Hardware Telemetry Modes
    DEFAULT_TELEMETRY_MODE: str = "SIMULATION" # SIMULATION, LIVE_DECO, ESP32_CSI
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://172.16.0.103:5173",
        "*"
    ]

    model_config = {"case_sensitive": True, "extra": "allow"}

settings = Settings()
