"""
CZZ CRM — FastAPI Application Factory
Enterprise setup: lifespan, middlewares, rate limiting, error handlers.
"""

import os
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from loguru import logger

from app.core.config import get_settings
from app.core.logging import setup_logging
from app.core.exceptions import CRMException
from app.middlewares.security_headers import SecurityHeadersMiddleware
from app.middlewares.request_id import RequestIDMiddleware
from app.api.v1.router import router as v1_router


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    setup_logging()
    settings = get_settings()
    logger.info("🚀 CZZ CRM iniciando | Env: {env}", env=settings.ENVIRONMENT)
    yield
    logger.info("🛑 CZZ CRM encerrando.")


# ── Rate Limiter ──────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])


# ── App Factory ───────────────────────────────────────────────────────────────
def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="CRM de Vendas de Cursos — Czz Tech",
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        lifespan=lifespan,
    )

    # ── Rate Limiting ─────────────────────────────────────────────────────────
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # ── Middlewares (ordem importa: de fora para dentro) ──────────────────────
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
        expose_headers=["X-Request-ID"],
    )

    # ── Exception Handlers ────────────────────────────────────────────────────
    @app.exception_handler(CRMException)
    async def crm_exception_handler(request: Request, exc: CRMException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": True,
                "message": exc.detail,
                "request_id": getattr(request.state, "request_id", None),
            },
            headers=exc.headers or {},
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        # Nunca expõe detalhes em produção
        logger.exception("Unhandled exception on {path}", path=request.url.path)
        message = str(exc) if not settings.is_production else "Erro interno do servidor."
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": True,
                "message": message,
                "request_id": getattr(request.state, "request_id", None),
            },
        )

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(v1_router, prefix="/api/v1")

    # ── Health Check ──────────────────────────────────────────────────────────
    @app.get("/health", tags=["System"], summary="Health check")
    async def health():
        return {"status": "ok", "version": settings.APP_VERSION, "env": settings.ENVIRONMENT}

    return app


app = create_app()
