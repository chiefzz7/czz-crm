"""
CZZ CRM — Application Settings
Enterprise-grade configuration with Pydantic Settings v2.
All secrets via environment variables — NEVER hardcoded.
"""

from functools import lru_cache
from pydantic import AnyHttpUrl, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────────────────
    APP_NAME: str = "CZZ CRM — Vendas de Cursos"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"  # development | staging | production
    DEBUG: bool = False

    # ── Supabase ──────────────────────────────────────────────────────────────
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # ── JWT ───────────────────────────────────────────────────────────────────
    # IMPORTANTE: Gere com: openssl rand -hex 64
    JWT_SECRET_KEY: str
    JWT_REFRESH_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15       # 15 minutos (seguro)
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7           # 7 dias

    # ── CORS ─────────────────────────────────────────────────────────────────
    # Ex: "http://localhost:3000,https://crm.czz.tech"
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # ── Rate Limiting ─────────────────────────────────────────────────────────
    RATE_LIMIT_DEFAULT: str = "60/minute"
    RATE_LIMIT_AUTH: str = "10/minute"

    # ── Logging ───────────────────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/crm.log"

    # ── Computed ──────────────────────────────────────────────────────────────
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    @field_validator("ENVIRONMENT")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        allowed = {"development", "staging", "production"}
        if v not in allowed:
            raise ValueError(f"ENVIRONMENT must be one of: {allowed}")
        return v

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        if self.ENVIRONMENT == "production":
            if len(self.JWT_SECRET_KEY) < 64:
                raise ValueError("JWT_SECRET_KEY must be at least 64 chars in production.")
            if len(self.JWT_REFRESH_SECRET_KEY) < 64:
                raise ValueError("JWT_REFRESH_SECRET_KEY must be at least 64 chars in production.")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
