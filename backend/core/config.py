"""
ShuleYetu FastAPI Core Configuration
Database, settings, and base utilities
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/shuleyetu"
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "ShuleYetu API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Tanzania Education Data Platform - School Selections, Results, and Analytics"
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "https://shuleyetu.co.tz"]
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
