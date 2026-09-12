"""
CZZ CRM — JWT Security (Access + Refresh Token)
Enterprise pattern: access token curto (15min) + refresh token rotacionado.
"""

import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Any
from jose import JWTError, jwt
from fastapi import Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .config import get_settings
from .exceptions import InvalidTokenError

bearer_scheme = HTTPBearer(auto_error=False)


# ── Password ──────────────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# ── Token creation ────────────────────────────────────────────────────────────

def _create_token(data: dict[str, Any], secret: str, expire_minutes: int) -> str:
    settings = get_settings()
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    return jwt.encode(to_encode, secret, algorithm=settings.JWT_ALGORITHM)


def create_access_token(user_id: str, email: str) -> str:
    settings = get_settings()
    return _create_token(
        {"sub": user_id, "email": email, "type": "access"},
        settings.JWT_SECRET_KEY,
        settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES,
    )


def create_refresh_token(user_id: str) -> str:
    settings = get_settings()
    return _create_token(
        {"sub": user_id, "type": "refresh"},
        settings.JWT_REFRESH_SECRET_KEY,
        settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60,
    )


# ── Token verification ────────────────────────────────────────────────────────

def verify_access_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise InvalidTokenError()
        return payload
    except JWTError:
        raise InvalidTokenError()


def verify_refresh_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.JWT_REFRESH_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise InvalidTokenError()
        return payload
    except JWTError:
        raise InvalidTokenError()


# ── FastAPI Dependency ─────────────────────────────────────────────────────────

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, Any]:
    if not credentials:
        raise InvalidTokenError()
    return verify_access_token(credentials.credentials)
